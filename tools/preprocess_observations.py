#!/usr/bin/env python3
"""Offline, streaming source audit and bounded public observation packages (stdlib only).

Original ZIP/CSV files are never edited or placed in dist. OBIS redistribution is
allowed automatically only for explicitly CC0, included, published datasets.
"""
import argparse
import csv
import datetime as dt
import gzip
import hashlib
import io
import json
import math
import re
import shutil
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TAXA = {
    '180527': ('balaenoptera-physalus', 'Balaenoptera physalus'),
    '180528': ('balaenoptera-musculus', 'Balaenoptera musculus'),
    '180530': ('megaptera-novaeangliae', 'Megaptera novaeangliae'),
    '180537': ('eubalaena-glacialis', 'Eubalaena glacialis'),
}
TERMS = 'https://seamap.env.duke.edu/content/content/termsofuse'
NOAA = 'https://www.fisheries.noaa.gov/inport/item/23305'
NOAA_FIELDS = 'https://www.fisheries.noaa.gov/inport/item/51474'
NOAA_REUSE = 'https://www.noaa.gov/office-education/outreach-communication/faq'
COLLECTION_CITATION = 'Halpin et al. 2009. OBIS-SEAMAP: The world data center for marine mammal, sea bird, and sea turtle distributions. Oceanography 22(2):104–115.'
RWSAS_BBOX = [-81.5, 25.7, -39.7, 51.7]
MAX_CHUNK_ROWS = 2000


def sha(data):
    return hashlib.sha256(data).hexdigest()


def json_bytes(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()


def finite(value):
    try:
        n = float(value)
        return n if math.isfinite(n) else None
    except (TypeError, ValueError):
        return None


def bbox(records):
    return [min(r['lon'] for r in records), min(r['lat'] for r in records),
            max(r['lon'] for r in records), max(r['lat'] for r in records)] if records else None


def source_time(raw, bits):
    """Only expose components actually provided; no placeholder dates or UTC guesses."""
    if not re.fullmatch('[01]{6}', bits or ''):
        return None
    match = re.fullmatch(r'(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})', raw or '')
    if not match:
        return None
    values = list(map(int, match.groups()))
    try:
        # Validate provided components, without rejecting irrelevant placeholders.
        year, month, day = values[0] if bits[0] == '1' else 2000, values[1] if bits[1] == '1' else 1, values[2] if bits[2] == '1' else 1
        dt.datetime(year, month, day, *[values[i] if bits[i] == '1' else 0 for i in range(3, 6)])
    except ValueError:
        return None
    precision = next((name for mask, name in [('111111', 'second'), ('111110', 'minute'), ('111100', 'hour'), ('111000', 'day'), ('110000', 'month'), ('100000', 'year')] if bits == mask), 'partial')
    lengths = {'second': 19, 'minute': 16, 'hour': 13, 'day': 10, 'month': 7, 'year': 4}
    return {'raw': raw, 'bits': bits, 'precision': precision,
            'display': raw[:lengths[precision]] if precision in lengths else None,
            'year': values[0] if bits[0] == '1' else None,
            'month': values[1] if bits[1] == '1' else None,
            'date': raw[:10] if bits[:3] == '111' else None,
            'utc': None, 'timezoneVerified': False}


def public_policy(row):
    return row.get('Included') == 'YES' and row.get('Published') == 'Yes' and row.get('Share Policy') == 'CC0'


def read_sources(z, citation_name):
    with io.TextIOWrapper(z.open(citation_name), encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    result = {}
    for row in rows:
        sid = row['Dataset ID']
        if sid in result:
            raise ValueError('Duplicate citation dataset ID: ' + sid)
        metadata = row['FGDC Metadata offline']
        eligible = public_policy(row)
        metadata_sha = None
        reasons = []
        if eligible:
            if metadata not in z.namelist():
                reasons.append('metadata_missing')
            else:
                xml = z.read(metadata)
                metadata_sha = sha(xml)
                root = ET.fromstring(xml)
                constraints = ' '.join(' '.join(''.join(e.itertext()).split()) for e in root.iter() if e.tag in ('useconst', 'accconst'))
                if re.search(r'non.?commercial|CC.?BY.?NC|permission is required', constraints, re.I):
                    reasons.append('conflicting_source_terms')
        result[sid] = (row, eligible and not reasons, reasons, metadata_sha)
    return result


def obis_archive(path, public_sources, seen, quarantine_rows):
    records = []
    counts = {k: Counter() for k in ('policy', 'recordType', 'timePrecision', 'excluded', 'years')}
    n = 0
    tsn = re.search(r'species_(\d+)_', path.name).group(1)
    species_id, scientific = TAXA[tsn]
    with zipfile.ZipFile(path) as z:
        if len(z.infolist()) > 1000 or sum(i.file_size for i in z.infolist()) > 900_000_000:
            raise ValueError('Source archive exceeds offline audit bounds')
        core = next(name for name in z.namelist() if name.endswith('_points.csv'))
        citations = next(name for name in z.namelist() if name.endswith('_datasets_and_citations.csv'))
        sources = read_sources(z, citations)
        # Streaming ZipExtFile verifies the entire core CRC as it is exhausted.
        with io.TextIOWrapper(z.open(core), encoding='utf-8-sig', newline='') as f:
            for row in csv.DictReader(f):
                n += 1
                sid, rid = row['dataset_id'], row['row_id']
                if row['itis_tsn'] != tsn or row['scientific_name'] != scientific:
                    raise ValueError('Archive taxon conflicts with actual row')
                entry = sources.get(sid)
                policy = entry[0]['Share Policy'] if entry else 'UNKNOWN'
                counts['policy'][policy] += 1
                counts['recordType'][row['ds_type']] += 1
                counts['timePrecision'][row['tprecision']] += 1
                if not entry or not entry[1]:
                    counts['excluded']['redistribution_not_cleared' if not entry or not public_policy(entry[0]) else entry[2][0]] += 1
                    continue
                reason = None
                key = f'obis:{sid}:{rid}:{tsn}'
                lat, lon = finite(row['latitude']), finite(row['longitude'])
                time = source_time(row['date_time'], row['tprecision'])
                location_digits = finite(row['lprecision'])
                if key in seen:
                    reason = 'duplicate_source_key'
                elif lat is None or lon is None or abs(lat) > 90 or abs(lon) > 180 or location_digits is not None and location_digits < 0:
                    reason = 'invalid_or_missing_coordinates'
                elif not time:
                    reason = 'invalid_time_metadata'
                elif row['ds_type'] not in ('ptobs', 'ptphoto', 'pttag', 'ptacs_pa', 'ptacs_calls'):
                    reason = 'not_observation_record'
                if reason:
                    counts['excluded'][reason] += 1
                    quarantine_rows.append({'file': path.name, 'sourceId': sid, 'rowId': rid, 'reason': reason})
                    continue
                seen.add(key)
                count = finite(row['group_size'])
                flags = []
                if count is not None and count < 0:
                    flags.append('invalid_group_size'); count = None
                if time['year'] is None:
                    flags.append('year_not_provided')
                if not time['date']:
                    flags.append('exact_day_not_provided')
                if not row['timezone']:
                    flags.append('timezone_not_provided')
                if location_digits is None:
                    flags.append('coordinate_precision_not_provided')
                source_key = 'obis:' + sid
                provider = entry[0]
                public_sources.setdefault(source_key, {
                    'id': source_key, 'family': 'obis', 'datasetId': sid,
                    'title': provider['Dataset name'], 'provider': provider['Primary contributors'],
                    'citation': provider['Citation'], 'url': 'https://seamap.env.duke.edu/dataset/' + sid,
                    'license': 'CC0', 'redistributionCleared': True,
                    'licenseEvidence': 'Included=YES; Published=Yes; Share Policy=CC0; no conflicting use constraints in attached FGDC',
                    'termsUrl': TERMS, 'metadataSha256': entry[3], 'updated': provider['Updated'],
                })
                counts['years'][str(time['year']) if time['year'] is not None else 'unknown'] += 1
                records.append({'id': key, 'rowId': rid, 'sourceId': source_key, 'speciesId': species_id,
                                'lat': lat, 'lon': lon, 'time': time, 'timezoneOffsetHoursRaw': row['timezone'] or None,
                                'coordinateDecimalDigits': location_digits, 'uncertaintyMeters': None,
                                'recordType': row['ds_type'], 'groupSize': count,
                                'presence': 'absence' if count == 0 else 'reported',
                                'platform': row['platform'] or None, 'qualityFlags': flags})
        audit = {'file': path.name, 'sha256': sha(path.read_bytes()), 'rowsRead': n,
                 'expandedBytes': sum(i.file_size for i in z.infolist()), 'speciesId': species_id,
                 'citationDatasets': len(sources), 'publishedRows': len(records),
                 'counts': {k: dict(v) for k, v in counts.items()}}
    assert n == len(records) + sum(counts['excluded'].values())
    return records, audit


def rwsas_date(raw):
    # This source explicitly spans 2002–2018, not Python/JS's implicit year pivot.
    m = re.fullmatch(r'(\d{1,2})-([A-Za-z]{3})-(\d{2})', raw or '')
    if not m or not 2 <= int(m[3]) <= 18:
        return None
    months = {s: i + 1 for i, s in enumerate(('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'))}
    try:
        date = dt.date(2000 + int(m[3]), months[m[2]], int(m[1])).isoformat()
    except (KeyError, ValueError):
        return None
    if not '2002-02-06' <= date <= '2018-01-31':
        return None
    return {'raw': raw, 'bits': '111000', 'precision': 'day', 'display': date,
            'year': int(date[:4]), 'month': int(date[5:7]), 'date': date,
            'utc': None, 'timezoneVerified': False}


def rwsas(path, public_sources, seen, quarantine_rows):
    records, excluded, certainty = [], Counter(), Counter()
    with path.open(encoding='utf-8-sig', newline='') as f:
        rows = csv.DictReader(f)
        n = 0
        for row in rows:
            n += 1
            rid = row['Id']; key = 'noaa:rwsas:' + rid
            lat, lon, time = finite(row['LAT']), finite(row['LON']), rwsas_date(row['SIGHTINGDATE'])
            certainty[row['CERTAINTY']] += 1
            reason = None
            if key in seen:
                reason = 'duplicate_source_key'
            elif lat is None or lon is None or abs(lat) > 90 or abs(lon) > 180:
                reason = 'invalid_or_missing_coordinates'
            elif lon > 0:
                reason = 'longitude_sign_conflicts_with_source_region'
            elif not RWSAS_BBOX[0] <= lon <= RWSAS_BBOX[2] or not RWSAS_BBOX[1] <= lat <= RWSAS_BBOX[3]:
                reason = 'outside_declared_source_region'
            elif not time:
                reason = 'invalid_or_ambiguous_date'
            elif row['DUPLICATE'].strip():
                reason = 'source_flagged_duplicate'
            if reason:
                excluded[reason] += 1
                quarantine_rows.append({'file': path.name, 'rowId': rid, 'reason': reason})
                continue
            seen.add(key)
            count = finite(row['GROUPSIZE'])
            flags = ['coordinate_accuracy_not_provided', 'timezone_not_provided', 'historical_snapshot']
            if count is not None and count < 0:
                flags.append('invalid_group_size'); count = None
            records.append({'id': key, 'rowId': rid, 'sourceId': 'noaa:rwsas', 'speciesId': 'eubalaena-glacialis',
                            'lat': lat, 'lon': lon, 'time': time, 'timezoneOffsetHoursRaw': None,
                            'coordinateDecimalDigits': None, 'uncertaintyMeters': None, 'recordType': 'ptobs',
                            'groupSize': count, 'presence': 'absence' if count == 0 else 'reported',
                            'certainty': row['CERTAINTY'], 'platform': row['CATEGORY'],
                            'motherCalfRaw': row['MOM_CALF'], 'duplicateRaw': row['DUPLICATE'], 'qualityFlags': flags})
    public_sources['noaa:rwsas'] = {
        'id': 'noaa:rwsas', 'family': 'noaa', 'datasetId': '23305', 'title': 'Right Whale Sightings Advisory System · historical export',
        'provider': 'NOAA Fisheries · Northeast Fisheries Science Center', 'url': NOAA,
        'citation': 'Northeast Fisheries Science Center. Right Whale Sightings Advisory System (RWSAS), 2002–2018. Accessed 2026-10-28. https://www.fisheries.noaa.gov/inport/item/23305',
        'license': 'NOAA public data · source reuse terms', 'termsUrl': NOAA_REUSE,
        'redistributionCleared': True, 'licenseEvidence': 'Official NOAA public export; unclassified; no access waiver; NOAA reuse guidance; no separate restriction identified in source metadata. No NOAA endorsement.',
        'fieldDictionary': NOAA_FIELDS, 'snapshotThrough': '2018-01-31', 'declaredBbox': RWSAS_BBOX,
        'dateRule': 'Two-digit years mapped to 2002–2018 using source coverage; local calendar date only; UTC not inferred.',
    }
    assert n == len(records) + sum(excluded.values())
    return records, {'file': path.name, 'sha256': sha(path.read_bytes()), 'rowsRead': n, 'publishedRows': len(records), 'speciesId': 'eubalaena-glacialis',
                     'counts': {'excluded': dict(excluded), 'certainty': dict(certainty)}}


def run(input_dir, output, raw_dir):
    inputs = sorted(input_dir.glob('obis_seamap_species*.zip')) + [input_dir / '23305_RWSAS.csv']
    if len(inputs) != 6 or any(not p.is_file() for p in inputs):
        raise ValueError('Expected five actual OBIS ZIPs (including the duplicate) and one actual RWSAS CSV')
    raw_dir.mkdir(parents=True, exist_ok=True)
    inventory, by_hash, seen, sources, audits, records, quarantine_rows = [], {}, set(), {}, [], [], []
    for path in inputs:
        digest = sha(path.read_bytes())
        item = {'file': path.name, 'bytes': path.stat().st_size, 'sha256': digest}
        if digest in by_hash:
            item['duplicateOf'] = by_hash[digest]
        else:
            by_hash[digest] = path.name
            target = raw_dir / path.name
            if not target.exists():
                shutil.copyfile(path, target)
            if sha(target.read_bytes()) != digest:
                raise ValueError('Preserved raw source checksum mismatch')
            rows, audit = rwsas(path, sources, seen, quarantine_rows) if path.suffix == '.csv' else obis_archive(path, sources, seen, quarantine_rows)
            records.extend(rows); audits.append(audit)
        inventory.append(item)
    protection = sorted(input_dir.glob('WDPA_WDOECM_Oct2026_Public_PO_shp*.zip'))
    for path in protection:
        digest = sha(path.read_bytes())
        inventory.append({'file': path.name, 'bytes': path.stat().st_size, 'sha256': digest,
                          'duplicateOf': 'previously_integrated_protected_planet_archive', 'integration': 'local_protection_adapter',
                          'sameAsPreviouslyIntegrated': digest == '6dab7615002e95031ba3dd313a7beb04c27c3ab213e52cc9ad6af827588e5cd2'})
        if digest != '6dab7615002e95031ba3dd313a7beb04c27c3ab213e52cc9ad6af827588e5cd2':
            raise ValueError('New protection archive requires separate audit')
    revision = sha(json_bytes([a['sha256'] for a in audits]))[:16]
    output.mkdir(parents=True, exist_ok=True)
    chunks_dir = output / 'chunks'; chunks_dir.mkdir(exist_ok=True)
    for old in chunks_dir.glob('*.json.gz'):
        old.unlink()
    groups = defaultdict(list)
    for record in records:
        groups[(record['speciesId'], str(record['time']['year']) if record['time']['year'] is not None else 'unknown')].append(record)
    chunks = []
    for (species, year), rows in sorted(groups.items()):
        rows.sort(key=lambda r: (r['time']['display'] or '', r['id']))
        for start in range(0, len(rows), MAX_CHUNK_ROWS):
            part = rows[start:start + MAX_CHUNK_ROWS]
            cid = f'{species}-{year}-{start // MAX_CHUNK_ROWS}'
            raw = json_bytes({'format': 'w-alerter-observation-chunk', 'version': 1, 'revision': revision, 'id': cid, 'records': part})
            compressed = gzip.compress(raw, mtime=0)
            name = 'chunks/' + cid + '.json.gz'
            (output / name).write_bytes(compressed)
            chunks.append({'id': cid, 'speciesId': species, 'year': year, 'rows': len(part), 'file': name,
                           'sha256': sha(compressed), 'decodedSha256': sha(raw), 'bytes': len(compressed), 'decodedBytes': len(raw), 'bbox': bbox(part)})
    manifest = {
        'format': 'w-alerter-species-observations', 'version': 1, 'id': 'obis-noaa-observations-2026-10', 'revision': revision,
        'crs': 'EPSG:4326', 'sourceInspectionDate': '2026-10-28', 'recordCount': len(records),
        'rawRecordsRead': sum(a['rowsRead'] for a in audits), 'inputs': inventory, 'audits': audits,
        'species': [{'id': sid, 'scientificName': scientific, 'itisTsn': tsn,
                     'recordCount': sum(r['speciesId'] == sid for r in records),
                     'years': sorted({str(r['time']['year']) if r['time']['year'] is not None else 'unknown' for r in records if r['speciesId'] == sid}),
                     'bbox': bbox([r for r in records if r['speciesId'] == sid])} for tsn, (sid, scientific) in TAXA.items()],
        'sources': sources, 'chunks': chunks,
        'collectionCitation': COLLECTION_CITATION,
        'limitations': ['Recorded events, not unique animals, abundance, density, habitat suitability or live collision risk.',
                        'Coordinate decimal digits do not establish positional accuracy. No uncertainty radius is invented.',
                        'Source dates retain tprecision. Month/year placeholders are not exact dates. Timezone offsets may omit daylight saving; no UTC timestamp inferred.',
                        'OBIS non-CC0 rows are not redistributed. Original source data and quarantine audit stay offline.',
                        'RWSAS is a historical snapshot through 2018-01-31. Source-flagged duplicates, missing coordinates and conflicting coordinates are quarantined; longitude signs are never repaired automatically.',
                        'Sources may describe overlapping survey events without a shared identifier. Cross-source unique-animal/event totals are not asserted.',
                        'OBIS oceano fields are per-record covariates and do not constitute a raw NASA Earthdata chlorophyll-a grid.'],
    }
    (output / 'manifest.json').write_bytes(json_bytes(manifest))
    (raw_dir / 'quarantine-audit.json').write_text(json.dumps(quarantine_rows, indent=2) + '\n')
    print(json.dumps({'rawRecordsRead': manifest['rawRecordsRead'], 'publishedRecords': len(records), 'chunks': len(chunks),
                      'compressedChunkBytes': sum(c['bytes'] for c in chunks), 'sources': len(sources),
                      'species': [{k: s[k] for k in ('id', 'recordCount')} for s in manifest['species']],
                      'audits': [{k: a[k] for k in ('file', 'rowsRead', 'publishedRows', 'counts')} for a in audits]}, ensure_ascii=False))
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist/data/observations/obis-noaa-2026-10-v1')
    parser.add_argument('--raw-dir', type=Path, default=ROOT / 'data/raw/observations/2026-10')
    args = parser.parse_args()
    run(args.input, args.output, args.raw_dir)
