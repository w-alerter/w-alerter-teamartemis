#!/usr/bin/env python3
"""Audit source NetCDFs and create bounded, lossless native-grid query tiles and explicit display samples."""
import argparse
from datetime import datetime, timezone
import gzip
import hashlib
import json
import math
from pathlib import Path
import struct
import sys
import numpy as np
from netCDF4 import Dataset, num2date
from PIL import Image
from environment_catalog import upsert_catalog

VARIABLES = [('sst', 'analysed_sst', '<i2'), ('sst_uncertainty', 'analysis_error_sst', '<i2'),
             ('sea_ice_fraction', 'sea_ice_fraction', 'i1'), ('mask', 'mask', 'i1'),
             ('sea_ice_fraction_flag', 'sea_ice_fraction_flag', 'i1')]
DATASET_ID = 'dmi-c3s-sst-2025'
SOURCE_URL = 'https://cds.climate.copernicus.eu/datasets/satellite-ist-sst-global?tab=overview'
GUIDE_URL = 'https://dast.copernicus-climate.eu/documents/satellite-ist-sst-global/WP2-FDDP-SSTv1.0-PUGS-v1.1_Final-2.pdf'
KELVIN_OFFSET = 273.15


def plain(value):
    if isinstance(value, dict): return {str(k): plain(v) for k, v in value.items()}
    if isinstance(value, (tuple, list)): return [plain(v) for v in value]
    if isinstance(value, np.ndarray): return plain(value.tolist())
    if isinstance(value, np.generic): return plain(value.item())
    if isinstance(value, bytes): return value.decode('utf-8')
    if isinstance(value, float) and not math.isfinite(value): return str(value)
    return value


def attrs(variable): return {key: plain(variable.getncattr(key)) for key in variable.ncattrs()}
def digest(path):
    sha = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''): sha.update(block)
    return sha.hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(plain(value), ensure_ascii=False, allow_nan=False, separators=(',', ':')) + '\n')


def iso(values, units, calendar):
    return [date.strftime('%Y-%m-%dT%H:%M:%SZ') for date in num2date(np.asarray(values).ravel(), units, calendar=calendar)]


def packed_valid(values, attributes):
    valid = np.isfinite(values)
    for key in ('_FillValue', 'missing_value'):
        if key in attributes:
            for missing in np.asarray(attributes[key]).ravel(): valid &= values != missing
    if 'valid_range' in attributes:
        valid &= values >= attributes['valid_range'][0]
        valid &= values <= attributes['valid_range'][1]
    for key, operation in [('valid_min', np.greater_equal), ('valid_max', np.less_equal)]:
        if key in attributes: valid &= operation(values, attributes[key])
    return valid


def decode(values, attributes, *, celsius=False):
    out = values.astype(np.float64) * float(attributes.get('scale_factor', 1)) + float(attributes.get('add_offset', 0))
    out[~packed_valid(values, attributes)] = np.nan
    if celsius:
        if attributes.get('units', '').lower() not in ('kelvin', 'k'): raise ValueError('Kelvin source units required')
        out -= KELVIN_OFFSET
    return out


def temporal_inventory(ds, name):
    tv = ds['time']; raw = np.asarray(tv[:]); a = attrs(tv)
    if raw.size != 1 or not a['units'].startswith('seconds since 1981-01-01'): raise ValueError('Unsupported source time contract')
    bound_name = a.get('bounds')
    if bound_name not in ds.variables: raise ValueError('Source time bounds are required; no interval is invented')
    bounds = np.asarray(ds[bound_name][:]).ravel()
    if bounds.size != 2 or not bounds[0] <= raw[0] <= bounds[1] or bounds[0] >= bounds[1]: raise ValueError('Invalid source time bounds')
    calendar = a.get('calendar', 'standard'); representative = iso(raw, a['units'], calendar)[0]
    start, end = iso(bounds, a['units'], calendar)
    if representative[:7].replace('-', '') != name[:6] or start[:7] != representative[:7] or end[:7] != representative[:7]: raise ValueError('File name and decoded month disagree')
    methods = ds['analysed_sst'].getncattr('cell_methods') if 'cell_methods' in ds['analysed_sst'].ncattrs() else None
    if methods != 'time: mean': raise ValueError('Only explicitly documented time means are supported by this adapter')
    globals_ = attrs(ds)
    conflicts = []
    for key, actual in [('time_coverage_start', start), ('time_coverage_end', end)]:
        supplied = globals_.get(key)
        if supplied:
            try: comparable = datetime.strptime(supplied, '%Y%m%dT%H%M%SZ').strftime('%Y-%m-%dT%H:%M:%SZ')
            except ValueError: comparable = supplied
            if comparable != actual: conflicts.append({'attribute': key, 'supplied': supplied, 'cfBounds': actual})
    if 'daily' in globals_.get('title', '').lower(): conflicts.append({'attribute': 'title', 'supplied': globals_['title'], 'resolutionEvidence': 'time: mean + within-month time_bnds + frequency=mon'})
    return {'id': name[:6], 'time': representative, 'rawTime': int(raw[0]), 'units': a['units'], 'calendar': calendar,
            'rawBounds': bounds.tolist(), 'start': start, 'end': end, 'type': 'bounded_time_mean', 'cellMethods': methods,
            'frequencyAttribute': globals_.get('frequency'), 'metadataConflicts': conflicts,
            'completeCalendarMonthMeanProven': False, 'dailySamplesAvailable': False,
            'timeInterpretation': 'Mean over the encoded source bounds; midpoint is not an instantaneous observation. Daily sample count/weights not supplied.'}


def field_stats(values, attributes):
    valid = packed_valid(values, attributes)
    result = {'valid': int(np.count_nonzero(valid)), 'missingOrInvalid': int(values.size-np.count_nonzero(valid))}
    if result['valid']:
        low, high = int(values[valid].min()), int(values[valid].max())
        result.update(rawMin=low, rawMax=high, decodedMin=low*float(attributes.get('scale_factor', 1))+float(attributes.get('add_offset', 0)), decodedMax=high*float(attributes.get('scale_factor', 1))+float(attributes.get('add_offset', 0)))
    return result


def tile_selection(lat, lon, regions, size):
    pairs = set()
    for region in regions:
        west, south, east, north = region['bbox']
        xs = np.flatnonzero((lon >= west) & (lon <= east)); ys = np.flatnonzero((lat >= south) & (lat <= north))
        if not len(xs) or not len(ys): raise ValueError('Requested region has no source grid cells')
        for y in range(int(ys[0])//size, int(ys[-1])//size+1):
            for x in range(int(xs[0])//size, int(xs[-1])//size+1): pairs.add((x, y))
    return sorted(pairs, key=lambda p:(p[1],p[0]))


def write_tile(path, fields, x, y, size, time_index):
    rows, cols = fields['sst'].shape; x0=x*size; y0=y*size; width=min(size, cols-x0); height=min(size, rows-y0)
    # 24-byte header, then five row-major arrays. All int16 fields are explicitly little-endian.
    header = struct.pack('<4s10H', b'WAE1', 1, width, height, x0, y0, time_index, 5, 0, 0, 0)
    body = b''.join(np.ascontiguousarray(fields[key][y0:y0+height, x0:x0+width], dtype=dtype).tobytes() for key, _, dtype in VARIABLES)
    path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(gzip.compress(header+body, compresslevel=9, mtime=0))


def sample_png(path, values, valid, low, high, *, kind='continuous'):
    palette = np.array([[33,84,133],[43,151,158],[221,230,184],[233,162,90],[174,76,54]], dtype=np.float64)
    if kind == 'ice': palette = np.array([[55,109,150],[194,220,230],[247,250,252]],dtype=float)
    if kind == 'uncertainty': palette = np.array([[241,237,202],[211,153,62],[133,57,53]],dtype=float)
    if kind == 'mask':
        rgba = np.zeros(values.shape+(4,),dtype=np.uint8)
        for value, rgb in [(1,[43,151,158]), (9,[190,223,236])]: rgba[valid&(values==value)] = rgb+[255]
        rgba[valid&~np.isin(values,[1,2,9])] = [197,137,56,255]
    else:
        norm=np.clip((np.nan_to_num(values,nan=low)-low)/(high-low),0,1)*(len(palette)-1); index=np.minimum(norm.astype(int),len(palette)-2); fraction=(norm-index)[...,None]
        rgba=np.zeros(values.shape+(4,),dtype=np.uint8);rgba[...,:3]=np.rint(palette[index]*(1-fraction)+palette[index+1]*fraction).astype(np.uint8);rgba[...,3]=np.where(valid,255,0)
    Image.fromarray(rgba[::-1], 'RGBA').save(path, optimize=True)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--input-directory',type=Path,default=Path('data/raw/sst/2025'));p.add_argument('--config',type=Path,default=Path('tools/sst_regions.json'));p.add_argument('--output-directory',type=Path,default=Path('dist/data/environment'));p.add_argument('--report-directory',type=Path,default=Path('data/metadata/sst/2025'));args=p.parse_args()
    config=json.loads(args.config.read_text());files=sorted(args.input_directory.glob('2025*.nc'))
    if len(files)!=12 or [f.name[:6] for f in files]!=[f'2025{m:02}' for m in range(1,13)]: raise ValueError('Exactly twelve readable 202501–202512 sources required')
    hashes=[digest(f) for f in files];revision=hashlib.sha256(json.dumps({'hashes':hashes,'config':config},sort_keys=True).encode()).hexdigest()[:16]
    out=args.output_directory/(DATASET_ID+'-'+revision);out.mkdir(parents=True,exist_ok=True)
    slices=[];previews=[];reports=[];samples=[];first_lat=None;first_lon=None;selected_tiles=None;minimum=math.inf;maximum=-math.inf;max_error=0;tile_size=config['tileSize'];stride=config['overviewStride']
    for i,path in enumerate(files):
        with Dataset(path) as ds:
            ds.set_auto_maskandscale(False);lat=np.asarray(ds['lat'][:]);lon=np.asarray(ds['lon'][:]);global_attributes=attrs(ds)
            if ds['analysed_sst'].dimensions!=('time','lat','lon') or ds['analysed_sst'].shape!=(1,3600,7200): raise ValueError('Unexpected SST dimensions')
            if not np.all(np.diff(lat)>0) or not np.all(np.diff(lon)>0): raise ValueError('Coordinates must be increasing')
            if np.max(np.abs(lat-(-89.975+np.arange(len(lat))*.05)))>3e-5 or np.max(np.abs(lon-(-179.975+np.arange(len(lon))*.05)))>3e-5: raise ValueError('Grid is not the expected 0.05-degree grid')
            if first_lat is None:
                first_lat=lat.copy();first_lon=lon.copy();selected_tiles=tile_selection(lat,lon,config['regions'],tile_size)
                (out/'coordinates.json.bin').write_bytes(gzip.compress(json.dumps({'lat':lat.tolist(),'lon':lon.tolist()},separators=(',',':')).encode(),mtime=0))
            elif not np.array_equal(lat,first_lat) or not np.array_equal(lon,first_lon): raise ValueError('Grids differ; explicit alignment adapter required')
            temporal=temporal_inventory(ds,path.name);fields={};specs={};statistics={}
            for key,name,dtype in VARIABLES:
                v=ds[name]
                if v.dimensions!=('time','lat','lon') or np.dtype(v.dtype)!=np.dtype(dtype): raise ValueError('Unexpected packed variable layout: '+name)
                fields[key]=np.asarray(v[0]);specs[key]={'sourceVariable':name,'dtype':dtype,'attributes':attrs(v)};statistics[key]=field_stats(fields[key],specs[key]['attributes'])
            if specs['sst']['attributes'].get('units','').lower() not in ('kelvin','k'): raise ValueError('SST is not Kelvin')
            mask_values,mask_counts=np.unique(fields['mask'],return_counts=True)
            statistics['mask']['valueCounts']=dict(zip(mask_values.astype(str).tolist(),mask_counts.tolist()))
            statistics['mask']['intermediateMeanMaskCount']=int(np.count_nonzero(~np.isin(fields['mask'],[1,2,9,-128])))
            # Other temperature variable is explicitly inventoried but never substituted for SST.
            st=ds['analysed_st'];statistics['analysed_st']=field_stats(np.asarray(st[0]),attrs(st))
            minimum=min(minimum,statistics['sst']['decodedMin']-KELVIN_OFFSET);maximum=max(maximum,statistics['sst']['decodedMax']-KELVIN_OFFSET);max_error=max(max_error,statistics['sst_uncertainty']['decodedMax'])
            for x,y in selected_tiles: write_tile(out/'tiles'/temporal['id']/f'{x}-{y}.bin',fields,x,y,tile_size,i)
            offset=stride//2;previews.append({key:np.ascontiguousarray(a[offset::stride,offset::stride]) for key,a in fields.items()})
            source={'originalFile':path.name,'bytes':path.stat().st_size,'sha256':hashes[i],'provider':'Danish Meteorological Institute / Copernicus Climate Change Service (C3S)','productId':global_attributes.get('id'),'version':global_attributes.get('product_version'),'url':SOURCE_URL,'license':global_attributes.get('license'),'attribution':global_attributes.get('acknowledgment')}
            item={**temporal,'source':source,'variables':specs,'statistics':statistics};slices.append(item)
            reports.append({'source':source,'temporal':temporal,'globalAttributes':global_attributes,'dimensions':{k:len(v) for k,v in ds.dimensions.items()},'variables':{k:{'shape':list(v.shape),'dimensions':list(v.dimensions),'dtype':str(v.dtype),'attributes':attrs(v)} for k,v in ds.variables.items()},'statistics':statistics})
            # Real, source-derived validation samples. No fabricated measurements.
            for latitude,longitude in [(42.5,-70.2),(35.0,25.0),(48.85,2.35),(70.0,-20.0)]:
                y=int(np.argmin(np.abs(lat-latitude)));x=int(np.argmin(np.abs(lon-longitude)))
                if (x//tile_size,y//tile_size) not in selected_tiles: continue
                raw={key:int(a[y,x]) for key,a in fields.items()};decoded={key:float(decode(np.array([raw[key]],dtype=np.dtype(specs[key]['dtype'])),specs[key]['attributes'])[0]) if packed_valid(np.array([raw[key]]),specs[key]['attributes'])[0] else None for key in raw}
                samples.append({'timeId':temporal['id'],'time':temporal['time'],'requestedLatitude':latitude,'requestedLongitude':longitude,'row':y,'column':x,'latitude':float(lat[y]),'longitude':float(lon[x]),'raw':raw,'decoded':decoded,'sstCelsius':decoded['sst']-KELVIN_OFFSET if decoded['sst'] is not None else None})
            del fields
        print(f"Audited and packed {temporal['id']}: {temporal['time']}; source bounds {temporal['start']} → {temporal['end']}",flush=True)
    scales={'sst':{'min':math.floor(minimum),'max':math.ceil(maximum),'units':'°C'},'sst_uncertainty':{'min':0,'max':math.ceil(max_error*10)/10,'units':'K'},'sea_ice_fraction':{'min':0,'max':1,'units':'1'},'mask':{'values':[1,2,9],'other':'ambiguous time-averaged categorical value'}}
    for i,(item,fields) in enumerate(zip(slices,previews)):
        directory=out/'overviews'/item['id'];directory.mkdir(parents=True,exist_ok=True)
        water=(fields['mask']==1)&(fields['sea_ice_fraction']==0)&packed_valid(fields['sst'],item['variables']['sst']['attributes'])
        for key,kind in [('sst','continuous'),('sst_uncertainty','uncertainty'),('sea_ice_fraction','ice'),('mask','mask')]:
            a=item['variables'][key]['attributes'];values=decode(fields[key],a,celsius=key=='sst');valid=packed_valid(fields[key],a)
            if key in ('sst','sst_uncertainty'): valid &= water
            if key=='sea_ice_fraction': valid &= (values>=0)&(values<=1)
            spec=scales[key];sample_png(directory/(key+'.png'),values,valid,spec.get('min',0),spec.get('max',1),kind=kind)
    manifest={'format':'w-alerter-environmental-grid','schemaVersion':1,'id':DATASET_ID,'revision':revision,'pipelineVersion':config['pipelineVersion'],'sourceUrl':SOURCE_URL,'productGuideUrl':GUIDE_URL,'grid':{'rows':len(first_lat),'columns':len(first_lon),'crs':'EPSG:4326','coordinateOrder':'longitude,latitude','nominalStepDegrees':.05,'coordinateFile':'coordinates.json.bin','latitudeCenters':[float(first_lat[0]),float(first_lat[-1])],'longitudeCenters':[float(first_lon[0]),float(first_lon[-1])]},'variables':{k:{'sourceVariable':n,'dtype':d,'units':'°C' if k=='sst' else 'K' if k=='sst_uncertainty' else '1','kind':'estimated-error-standard-deviation' if k=='sst_uncertainty' else 'source-field'} for k,n,d in VARIABLES},'timeSlices':slices,'tiles':{'size':tile_size,'pairs':selected_tiles,'headerBytes':24,'channels':len(VARIABLES),'endianness':'little','compression':'gzip','path':'tiles/{timeId}/{x}-{y}.bin','regionsRequested':config['regions'],'coveragePolicy':'native resolution in the complete grid tiles intersecting these named regions; outside these tiles is not distributed'},'overview':{'path':'overviews/{timeId}/{variable}.png','stride':stride,'sourceOffset':stride//2,'stepDegrees':.05*stride,'width':7200//stride,'height':3600//stride,'bbox':[-180,-90,180,90],'method':'one actual source center cell per display block; nearest-neighbour visualization only; native-grid point queries remain separate','sstPolicy':'only mask=1 and sea_ice_fraction=0; no interpolation, no categorical-mask averaging by this pipeline'},'scales':scales,'qualityPolicies':{'mask':'Source mask has time: mean. Values outside 1/2/9 and mask=2 with valid SST are treated as ambiguous, not reinterpreted as valid daily bit flags.','seaIce':'SST under ice is an upstream estimated freezing-point field, not a direct under-ice observation. Default SST queries exclude ice-affected or ambiguous cells.','uncertainty':'Source analysis_error_sst is preserved in K with time: mean. It is not recomputed as the standard error of an interval mean.','temporal':'Use CF time and time_bnds, retain conflicting global daily attributes; no claim of a complete calendar-month observation average.','species':'SST alone does not establish animal presence, density, habitat suitability or collision risk.'},'pointSamplesFile':'validation-samples.json'}
    artifacts=list(out.rglob('*'));artifact_files=[f for f in artifacts if f.is_file() and f.name not in ('manifest.json','validation-samples.json')];budget=config['distributionBudgets'];total=sum(f.stat().st_size for f in artifact_files)
    if total>budget['maxBytes'] or len(artifact_files)>budget['maxFiles'] or any(f.stat().st_size>budget['maxFileBytes'] for f in artifact_files): raise ValueError('Distribution budget exceeded. Do not silently downsample query data.')
    manifest['distribution']={'assetBytesBeforeManifest':total,'assetFilesBeforeManifest':len(artifact_files),'largestAssetBytes':max(f.stat().st_size for f in artifact_files),'rawBytesExcluded':sum(f.stat().st_size for f in files),'budgets':budget}
    write_json(out/'manifest.json',manifest);write_json(args.report_directory/'inventory.json',{'format':'w-alerter-netcdf-audit','sourceCount':12,'files':reports});write_json(args.report_directory/'validation-samples.json',samples)
    write_json(out/'validation-samples.json',samples)
    if [digest(f) for f in files]!=hashes: raise RuntimeError('A source changed during processing')
    upsert_catalog(args.output_directory/'catalog.json',[{'id':DATASET_ID,'kind':'sst','manifest':out.name+'/manifest.json'}])
    print(json.dumps({'status':'ready','manifest':str(out/'manifest.json'),'nativeTiles':len(selected_tiles)*12,'bytes':total,'sourceFiles':12,'rawBytesExcluded':manifest['distribution']['rawBytesExcluded']},ensure_ascii=False),flush=True)


if __name__=='__main__': main()
