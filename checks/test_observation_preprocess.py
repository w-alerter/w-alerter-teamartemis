"""Independent reconciliation of every redistributed point against the actual CSV rows."""
import csv,gzip,hashlib,io,json,sys,unittest,zipfile
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from preprocess_observations import source_time,rwsas_date,public_policy

class ObservationSourceTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.folder=ROOT/'dist/data/observations/obis-noaa-2026-10-v1';cls.raw=ROOT/'data/raw/observations/2026-10';cls.meta=json.loads((cls.folder/'manifest.json').read_text());cls.records={}
  for c in cls.meta['chunks']:
   packed=(cls.folder/c['file']).read_bytes();data=gzip.decompress(packed)
   assert hashlib.sha256(packed).hexdigest()==c['sha256'] and hashlib.sha256(data).hexdigest()==c['decodedSha256']
   for r in json.loads(data)['records']:
    assert r['id'] not in cls.records;cls.records[r['id']]=r
 def test_every_obis_public_coordinate_time_and_group_match_actual_source(self):
  count=0
  for audit in self.meta['audits']:
   if not audit['file'].endswith('.zip'):continue
   p=self.raw/audit['file'];self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),audit['sha256'])
   with zipfile.ZipFile(p) as z:
    with io.TextIOWrapper(z.open(next(n for n in z.namelist() if n.endswith('_datasets_and_citations.csv'))),encoding='utf-8-sig',newline='') as f:sources={r['Dataset ID']:r for r in csv.DictReader(f)}
    with io.TextIOWrapper(z.open(next(n for n in z.namelist() if n.endswith('_points.csv'))),encoding='utf-8-sig',newline='') as f:
     total=0
     for row in csv.DictReader(f):
      total+=1;key=f"obis:{row['dataset_id']}:{row['row_id']}:{row['itis_tsn']}";published=self.records.get(key)
      eligible=sources[row['dataset_id']]['Included']=='YES' and sources[row['dataset_id']]['Published']=='Yes' and sources[row['dataset_id']]['Share Policy']=='CC0'
      self.assertEqual(published is not None,eligible)
      if published:
       count+=1;self.assertEqual((published['lat'],published['lon']),(float(row['latitude']),float(row['longitude'])));self.assertEqual(published['time']['raw'],row['date_time']);self.assertEqual(published['time']['bits'],row['tprecision']);self.assertEqual(published['recordType'],row['ds_type']);self.assertIsNone(published['uncertaintyMeters'])
       if row['group_size'] and float(row['group_size'])>=0:self.assertEqual(published['groupSize'],float(row['group_size']))
     self.assertEqual(total,audit['rowsRead'])
  self.assertEqual(count,38943)
 def test_every_rwsas_public_point_and_calendar_date_is_unchanged(self):
  count=0
  with (self.raw/'23305_RWSAS.csv').open(encoding='utf-8-sig',newline='') as f:
   for row in csv.DictReader(f):
    r=self.records.get('noaa:rwsas:'+row['Id'])
    if not r:continue
    count+=1;self.assertEqual((r['lat'],r['lon']),(float(row['LAT']),float(row['LON'])));self.assertEqual(r['time']['raw'],row['SIGHTINGDATE']);self.assertEqual(r['certainty'],row['CERTAINTY']);self.assertFalse(row['DUPLICATE']);self.assertIsNone(r['time']['utc'])
  self.assertEqual(count,12651)
 def test_precision_bits_and_explicit_century_never_turn_placeholders_into_dates(self):
  self.assertEqual(source_time('2000-01-01 00:00:00','110000')['display'],'2000-01');self.assertIsNone(source_time('2000-01-01 00:00:00','110000')['date']);self.assertIsNone(source_time('1839-08-01 00:00:00','010000')['year']);self.assertIsNone(source_time('2000-02-30 00:00:00','111000'));self.assertEqual(rwsas_date('27-Jan-18')['display'],'2018-01-27');self.assertIsNone(rwsas_date('27-Jan-99'));self.assertIsNone(rwsas_date('01-Jan-02'))
  self.assertTrue(public_policy({'Included':'YES','Published':'Yes','Share Policy':'CC0'}));self.assertFalse(public_policy({'Included':'YES','Published':'Yes','Share Policy':'CC-BY'}))
 def test_accounting_and_original_preservation(self):
  self.assertEqual(len(self.records),51594)
  self.assertEqual(self.meta['rawRecordsRead'],741264)
  for audit in self.meta['audits']:
   self.assertEqual(audit['rowsRead'],audit['publishedRows']+sum(audit['counts']['excluded'].values()))
   p=self.raw/audit['file'];self.assertTrue(p.is_file());self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),audit['sha256'])
  self.assertLess(sum(c['bytes'] for c in self.meta['chunks']),1500000)
if __name__=='__main__':unittest.main()
