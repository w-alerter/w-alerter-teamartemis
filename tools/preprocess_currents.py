#!/usr/bin/env python3
"""Lossless offline CMEMS regional current tiles. Never infer exact bounds absent in source."""
import argparse, gzip, hashlib, json, math, struct
from pathlib import Path
import numpy as np
from netCDF4 import Dataset, num2date
from PIL import Image
from preprocess_sst import attrs, digest, write_json
from environment_catalog import upsert_catalog

VERSION='cmems-currents-2025-v1'
PRODUCT='GLOBAL_ANALYSISFORECAST_PHY_001_024'
SOURCE='https://data.marine.copernicus.eu/product/'+PRODUCT+'/description'
SIZE=128

def pack(path, magic, u, v, x0=0, y0=0, time_index=0):
    h,w=u.shape
    header=struct.pack('<4s10H',magic,1,w,h,x0,y0,time_index,2,0,0,0)
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(gzip.compress(header+np.asarray(u,dtype='<f4').tobytes()+np.asarray(v,dtype='<f4').tobytes(),compresslevel=9,mtime=0))

def png(path,a,valid,low,high,divergent=False):
    palette=np.array([[27,74,111],[63,145,165],[158,211,207],[242,218,146],[212,137,78]],dtype=float)
    if divergent:palette=np.array([[39,106,151],[140,190,207],[246,248,246],[214,169,130],[175,88,68]],dtype=float)
    norm=np.clip((np.nan_to_num(a,nan=low)-low)/(high-low),0,1)*(len(palette)-1)
    i=np.minimum(norm.astype(int),len(palette)-2);f=(norm-i)[...,None]
    rgba=np.zeros(a.shape+(4,),dtype=np.uint8);rgba[...,:3]=np.rint(palette[i]*(1-f)+palette[i+1]*f).astype(np.uint8);rgba[...,3]=np.where(valid,255,0)
    path.parent.mkdir(parents=True,exist_ok=True);Image.fromarray(rgba[::-1]).save(path,optimize=True)

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--input-directory',type=Path,default=Path('data/raw/currents/2025'));p.add_argument('--output-directory',type=Path,default=Path('dist/data/environment'));args=p.parse_args()
    files=sorted(args.input_directory.glob('cmems*.nc'))
    if len(files)!=4:raise ValueError('Four accessible original sources are required')
    initial={str(f):digest(f) for f in files};groups={};audit=[];samples=[];published=[]
    for f in files:
        with Dataset(f) as d:
            d.set_auto_maskandscale(False);lat=np.asarray(d['latitude'][:]);lon=np.asarray(d['longitude'][:]);depth=np.asarray(d['depth'][:]);rawtimes=np.asarray(d['time'][:]);ta=attrs(d['time']);dates=[x.strftime('%Y-%m-%dT%H:%M:%SZ') for x in num2date(rawtimes,ta['units'],calendar=ta.get('calendar','standard'))]
            region='north-atlantic' if lat[0]>0 else 'antarctic';expected=(241,480) if region=='north-atlantic' else (121,1200)
            assert (len(lat),len(lon))==expected and len(dates)==6 and len(depth)==1
            assert np.all(np.diff(lat)>0) and np.all(np.diff(lon)>0)
            assert np.allclose(np.diff(lat),1/12,atol=2e-5) and np.allclose(np.diff(lon),1/12,atol=2e-5)
            assert d.getncattr('subset:productId')==PRODUCT and 'Monthly mean' in d.title
            assert ta['units']=='seconds since 1970-01-01 00:00:00'
            assert 'bounds' not in ta, 'New time bounds require an explicit adapter update'
            entry=groups.setdefault(region,{'lat':lat,'lon':lon,'depth':float(depth[0]),'slices':[]})
            assert np.array_equal(entry['lat'],lat) and np.array_equal(entry['lon'],lon) and entry['depth']==float(depth[0])
            ga=attrs(d);specs={};fields={}
            for key,name in [('current_u','uo'),('current_v','vo')]:
                var=d[name];assert var.dimensions==('time','depth','latitude','longitude') and var.dtype==np.dtype('float32') and var.units=='m s-1'
                assert not any(k in var.ncattrs() for k in ['scale_factor','add_offset'])
                specs[key]={'sourceVariable':name,'dtype':'<f4','attributes':attrs(var)};fields[key]=np.asarray(var[:,0])
                valid=np.isfinite(fields[key]);assert np.all((fields[key][valid]>=var.valid_min)&(fields[key][valid]<=var.valid_max))
            assert np.array_equal(np.isfinite(fields['current_u']),np.isfinite(fields['current_v']))
            source={'originalFile':f.name,'sha256':initial[str(f)],'bytes':f.stat().st_size,'provider':'Mercator Ocean International / Copernicus Marine','productId':PRODUCT,'datasetId':ga['subset:datasetId'],'version':ga['subset:datasetId'].rsplit('_',1)[-1],'url':SOURCE,'doi':'10.48670/moi-00016','attribution':'Generated using E.U. Copernicus Marine Service Information; https://doi.org/10.48670/moi-00016','license':'Copernicus Marine Service Licence Agreement','licenseUrl':'https://marine.copernicus.eu/user-corner/service-commitments-and-licence','subsetDate':ga['subset:date']}
            for i,date in enumerate(dates):
                assert date.startswith('2025-') and date.endswith('-01T00:00:00Z')
                entry['slices'].append({'id':date[:7].replace('-',''),'time':date,'rawTime':float(rawtimes[i]),'units':ta['units'],'calendar':ta.get('calendar','standard'),'start':None,'end':None,'rawBounds':None,'period':date[:7],'type':'provider_monthly_model_mean','boundsEncoded':False,'cellMethods':{'uo':specs['current_u']['attributes']['cell_methods'],'vo':specs['current_v']['attributes']['cell_methods']},'source':source,'variables':specs,'u':fields['current_u'][i],'v':fields['current_v'][i]})
            audit.append({'source':source,'region':region,'dimensions':{k:len(v) for k,v in d.dimensions.items()},'globalAttributes':ga,'variables':{k:{'attributes':attrs(v),'dimensions':list(v.dimensions),'shape':list(v.shape),'dtype':str(v.dtype)} for k,v in d.variables.items()},'times':dates,'rawTimes':rawtimes.tolist(),'boundsEncoded':False})
    for region,e in groups.items():
        slices=sorted(e['slices'],key=lambda s:s['time']);assert [s['period'] for s in slices]==[f'2025-{m:02}' for m in range(1,13)]
        dsid='cmems-currents-2025-'+region;revision=hashlib.sha256(json.dumps({'hashes':sorted({s['source']['sha256'] for s in slices}),'version':VERSION,'tileSize':SIZE},sort_keys=True).encode()).hexdigest()[:16];out=args.output_directory/(dsid+'-'+revision);out.mkdir(parents=True,exist_ok=True)
        lat=e['lat'];lon=e['lon'];rows=len(lat);cols=len(lon);bbox=[float(lon[0]-1/24),float(lat[0]-1/24),float(lon[-1]+1/24),float(lat[-1]+1/24)];pairs=[(x,y) for y in range(math.ceil(rows/SIZE)) for x in range(math.ceil(cols/SIZE))]
        (out/'coordinates.json.bin').write_bytes(gzip.compress(json.dumps({'lat':lat.tolist(),'lon':lon.tolist()},separators=(',',':')).encode(),mtime=0))
        maxspeed=max(float(np.nanmax(np.hypot(s['u'],s['v']))) for s in slices);maxcomponent=max(float(np.nanmax(np.abs(s[k]))) for s in slices for k in ['u','v']);scales={'current_speed':{'min':0,'max':math.ceil(maxspeed*10)/10,'units':'m/s'},'current_u':{'min':-math.ceil(maxcomponent*10)/10,'max':math.ceil(maxcomponent*10)/10,'units':'m/s'},'current_v':{'min':-math.ceil(maxcomponent*10)/10,'max':math.ceil(maxcomponent*10)/10,'units':'m/s'}}
        for ti,s in enumerate(slices):
            u=s.pop('u');v=s.pop('v');valid=np.isfinite(u)&np.isfinite(v)
            for x,y in pairs:pack(out/'tiles'/s['id']/f'{x}-{y}.bin',b'WAC1',u[y*SIZE:(y+1)*SIZE,x*SIZE:(x+1)*SIZE],v[y*SIZE:(y+1)*SIZE,x*SIZE:(x+1)*SIZE],x*SIZE,y*SIZE,ti)
            stride=6;offset=3;pack(out/'vectors'/(s['id']+'.bin'),b'WAV1',u[offset::stride,offset::stride],v[offset::stride,offset::stride],offset,offset,ti)
            for key,a in [('current_speed',np.hypot(u,v)),('current_u',u),('current_v',v)]:png(out/'overviews'/s['id']/(key+'.png'),a,valid,scales[key]['min'],scales[key]['max'],key!='current_speed')
            s['statistics']={'validCells':int(valid.sum()),'missingCells':int(valid.size-valid.sum()),'maxMeanVectorMagnitudeMs':float(np.nanmax(np.hypot(u,v)))}
            for la,lo in ([(42.5,-70.2),(40,-60),(45,-50),(50,-75)] if region=='north-atlantic' else [(-64.77,-64.05),(-65,-30),(-60.5,10),(-69,-70)]):
                row=int(np.argmin(abs(lat-la)));col=int(np.argmin(abs(lon-lo)));a=float(u[row,col]);b=float(v[row,col]);samples.append({'datasetId':dsid,'timeId':s['id'],'time':s['time'],'requestedLatitude':la,'requestedLongitude':lo,'row':row,'column':col,'latitude':float(lat[row]),'longitude':float(lon[col]),'u':a if np.isfinite(a) else None,'v':b if np.isfinite(b) else None,'speed':math.hypot(a,b) if np.isfinite(a+b) else None,'sourceSha256':s['source']['sha256']})
        variables={k:{'sourceVariable':n,'dtype':'<f4','units':'m/s'} for k,n in [('current_u','uo'),('current_v','vo')]};variables={'current_speed':{'derivedFrom':['current_u','current_v'],'definition':'Magnitude of the monthly mean vector, not mean instantaneous speed','units':'m/s'},**variables}
        manifest={'format':'w-alerter-environmental-grid','schemaVersion':1,'id':dsid,'kind':'currents','title':'Copernicus Marine · '+region+' · 2025','region':region,'revision':revision,'pipelineVersion':VERSION,'sourceUrl':SOURCE,'displayAttribution':'E.U. Copernicus Marine Service · 2025 monthly model mean','grid':{'rows':rows,'columns':cols,'crs':'EPSG:4326','coordinateOrder':'longitude,latitude','coordinateFile':'coordinates.json.bin','nominalStepDegrees':1/12,'bounds':bbox,'depthMeters':e['depth'],'depthPositive':'down'},'variables':variables,'timeSlices':slices,'tiles':{'format':'currents-float32-v1','size':SIZE,'pairs':pairs,'path':'tiles/{timeId}/{x}-{y}.bin','regionsRequested':[{'id':region,'bbox':bbox}],'compression':'gzip','headerBytes':24,'endianness':'little','channels':['current_u','current_v']},'overview':{'path':'overviews/{timeId}/{variable}.png','width':cols,'height':rows,'bbox':bbox,'stepDegrees':1/12,'method':'all original cells; no interpolation or temporal resampling'},'vectors':{'path':'vectors/{timeId}.bin','stride':6,'offset':3,'width':len(lon[3::6]),'height':len(lat[3::6]),'method':'every sixth original cell for arrow display only'},'scales':scales,'qualityPolicies':{'temporal':'Monthly mean documented by provider product/title/cadence. Exact time bounds are absent. First-of-month source time is a label, not a daily observation.','uncertainty':'No per-cell uncertainty, quality flag, sea-ice concentration or definitive land-mask variable is supplied. Preserve missing values; never replace them by zero.','navigation':'Historical monthly surface model field; not live navigation, full-draft currents or a validated fuel-saving forecast.'}}
        write_json(out/'manifest.json',manifest);published.append({'id':dsid,'kind':'currents','manifest':out.name+'/manifest.json'})
        print(f'Packed {region}: 12 source months, {len(pairs)*12} native tiles')
    write_json(Path('data/metadata/currents/2025/inventory.json'),{'pipelineVersion':VERSION,'files':audit});write_json(Path('data/metadata/currents/2025/validation-samples.json'),samples)
    for entry in published:write_json(args.output_directory/Path(entry['manifest']).parent/'validation-samples.json',[s for s in samples if s['datasetId']==entry['id']])
    assert all(digest(Path(p))==h for p,h in initial.items()),'A raw source changed'
    size=sum(f.stat().st_size for f in args.output_directory.rglob('*') if f.is_file());assert size<90*1024*1024, 'Environmental distribution exceeds the budget'
    upsert_catalog(args.output_directory/'catalog.json',published)
    print(json.dumps({'sources':len(files),'samples':len(samples),'totalEnvironmentalBytes':size}))

if __name__=='__main__':main()
