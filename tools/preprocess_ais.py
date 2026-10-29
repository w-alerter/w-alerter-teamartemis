#!/usr/bin/env python3
"""Native uint32 AIS query tiles and explicitly max-aggregated display; offline only."""
import argparse,gzip,hashlib,json,math,os,shutil,struct,zipfile
from pathlib import Path
import numpy as np
import rasterio
from rasterio.windows import Window
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
R=6378137.0
def digest(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for block in iter(lambda:f.read(8*1024*1024),b''):h.update(block)
 return h.hexdigest()
def merc(lon,lat):return R*math.radians(lon),R*math.log(math.tan(math.pi/4+math.radians(lat)/2))
def geographic(x,y):return math.degrees(x/R),math.degrees(2*math.atan(math.exp(y/R))-math.pi/2)
def write_json(path,value):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,separators=(',',':'),ensure_ascii=False)+'\n')
def write_overview(coarse,output,vmax):
 rgba=np.zeros((*coarse.shape,4),dtype=np.uint8);strength=np.clip(np.log1p(coarse.astype(float))/math.log1p(vmax),0,1);lo=np.array([248,214,156]);hi=np.array([145,68,37]);rgba[:,:,:3]=(lo[None,None,:]*(1-strength[:,:,None])+hi[None,None,:]*strength[:,:,None]).astype(np.uint8);rgba[:,:,3]=np.where(coarse>0,40+210*strength,0).astype(np.uint8);Image.fromarray(rgba).save(output/'overview.png',optimize=True)
def refresh_overview(output,metadata):
 m=json.loads((output/'manifest.json').read_text());g=m['distribution'];coarse=np.zeros((m['overview']['height'],m['overview']['width']),dtype=np.uint32)
 for entry in m['tiles']['entries']:
  packed=(output/entry['file']).read_bytes();assert hashlib.sha256(packed).hexdigest()==entry['sha256'];raw=gzip.decompress(packed);assert hashlib.sha256(raw).hexdigest()==entry['expandedSha256'];width,height=struct.unpack_from('<HH',raw,6);column,row=struct.unpack_from('<II',raw,10);values=np.frombuffer(raw,dtype='<u4',offset=24).reshape(height,width);display=values.reshape(height//16,16,width//16,16).max(axis=(1,3));rr=(row-g['rowStart'])//16;cc=(column-g['columnStart'])//16;coarse[rr:rr+display.shape[0],cc:cc+display.shape[1]]=display
 write_overview(coarse,output,m['overview']['scaleMax']);m['overview']['sha256']=digest(output/'overview.png');m['overview']['alpha']='40+210*log1p(count)/log1p(scaleMax), clipped0..1; NoData transparent';m['revision']=m['source']['sha256'][:16]+'-regional-v1';write_json(output/'manifest.json',m);write_json(metadata/'inventory.json',m)
def run(path,output,metadata,region):
 assert path.is_file(),'Actual AIS archive is required'
 with zipfile.ZipFile(path) as z:
  names=[n for n in z.namelist() if n.lower().endswith('.tif') and not n.startswith('__MACOSX/')];assert len(names)==1
  source_file=path.parent/Path(names[0]).name
  if not source_file.exists():
   temp=source_file.with_suffix('.tif.part')
   with z.open(names[0]) as f,temp.open('wb') as dst:shutil.copyfileobj(f,dst,8*1024*1024)
   assert temp.stat().st_size==z.getinfo(names[0]).file_size
   os.replace(temp,source_file)
 source_hash=digest(source_file);archive_hash=digest(path)
 output.mkdir(parents=True,exist_ok=True);(output/'tiles').mkdir(exist_ok=True)
 for p in (output/'tiles').glob('*.bin'):p.unlink()
 with rasterio.open(source_file) as d:
  assert d.crs.to_epsg()==3857 and d.count==1 and d.dtypes==('uint32',) and d.nodata==0
  assert d.transform.a==100 and d.transform.e==-100 and d.transform.b==0 and d.transform.d==0 and d.scales==(1.0,) and d.offsets==(0.0,)
  left,bottom=merc(region[0],region[1]);right,top=merc(region[2],region[3]);a=d.transform
  c0=max(0,math.floor((left-a.c)/100/512)*512);r0=max(0,math.floor((a.f-top)/100/512)*512)
  c1=min(d.width,math.ceil((right-a.c)/100/512)*512);r1=min(d.height,math.ceil((a.f-bottom)/100/512)*512)
  assert c1>c0 and r1>r0
  coarse=np.zeros((math.ceil((r1-r0)/16),math.ceil((c1-c0)/16)),dtype=np.uint32);tiles=[];valid_cells=0;max_count=0;samples=[]
  for row in range(r0,r1,512):
   for col in range(c0,c1,512):
    width=min(512,c1-col);height=min(512,r1-row);values=d.read(1,window=Window(col,row,width,height));assert values.shape==(height,width)
    if not values.any():continue
    x=col//512;y=row//512;raw=struct.pack('<4sHHHIIH',b'WAT1',1,width,height,col,row,4)+b'\0'*4+values.astype('<u4',copy=False).tobytes();packed=gzip.compress(raw,mtime=0)
    name=f'tiles/{x}-{y}.bin';(output/name).write_bytes(packed);tiles.append({'x':x,'y':y,'file':name,'bytes':len(packed),'expandedBytes':len(raw),'sha256':hashlib.sha256(packed).hexdigest(),'expandedSha256':hashlib.sha256(raw).hexdigest()})
    valid_cells+=int(np.count_nonzero(values));max_count=max(max_count,int(values.max()))
    padded=np.zeros((math.ceil(height/16)*16,math.ceil(width/16)*16),dtype=np.uint32);padded[:height,:width]=values;display=padded.reshape(padded.shape[0]//16,16,padded.shape[1]//16,16).max(axis=(1,3));rr=(row-r0)//16;cc=(col-c0)//16;coarse[rr:rr+display.shape[0],cc:cc+display.shape[1]]=display
    if len(samples)<100 and (len(tiles)%3==0 or len(tiles)<10):
     indices=np.argwhere(values>0);sy,sx=indices[len(indices)//2];cx=col+int(sx);ry=row+int(sy);lon,lat=geographic(a.c+(cx+.5)*100,a.f-(ry+.5)*100);samples.append({'longitude':lon,'latitude':lat,'column':cx,'row':ry,'value':int(values[sy,sx])})
   print('AIS row block',row,'tiles',len(tiles),flush=True)
  for lon,lat in [(-70.2,42.5),(-68.0,42.0),(-72.0,40.0),(-67,44),(-75.5,36.5)]:
   xx,yy=merc(lon,lat);col=int(math.floor((xx-a.c)/100));row=int(math.floor((a.f-yy)/100));v=int(d.read(1,window=Window(col,row,1,1))[0,0]);samples.append({'longitude':lon,'latitude':lat,'column':col,'row':row,'value':None if v==0 else v})
  nz=coarse[coarse>0];vmax=max(10,int(np.percentile(nz,98))) if nz.size else 10
  write_overview(coarse,output,vmax)
  west,north=geographic(a.c+c0*100,a.f-r0*100);east,south=geographic(a.c+c1*100,a.f-r1*100)
  source={'provider':'NOAA Office for Coastal Management / BOEM / U.S. Coast Guard AIS', 'productId':'AIS Vessel Transit Counts 2025','version':'2025 product; published2026-05-18','originalFile':source_file.name,'sha256':source_hash,'archiveFile':path.name,'archiveSha256':archive_hash,'url':'https://www.fisheries.noaa.gov/inport/item/79556','downloadUrl':'https://ocmgeodatastor1.blob.core.windows.net/marinecadastre/ais/aistransit/ais-transit-count-2025.tif','license':'NOAA public data; source reuse terms','useConstraints':'For coastal and ocean planning; no warranty or NOAA endorsement','attribution':'NOAA Office for Coastal Management. AIS Vessel Transit Counts2025. MarineCadastre.gov.','temporalEvidence':'Official product metadata2025-01-01 through2025-12-31; TIFF has no embedded measurement-time axis','catalogCrs':'EPSG:4269','fileCrs':'EPSG:3857','metadataConflicts':['catalog_crs_4269_differs_from_actual_geotiff_3857','catalog_extent_does_not_describe_all_raster_regions']}
  m={'format':'w-alerter-traffic-grid','version':1,'id':'noaa-ais-transits-2025-pilot','revision':source_hash[:16]+'-regional-v1','year':2025,'period':{'start':'2025-01-01','end':'2025-12-31','aggregation':'annual transit counts; not monthly, density, ship positions or speed'},'source':source,'grid':{'crs':'EPSG:3857','width':d.width,'height':d.height,'originX':a.c,'originY':a.f,'pixelSizeMeters':100,'nodata':0,'nodataMeaning':'source NoData; not verified zero traffic','dtype':'uint32','scale':1,'offset':0,'cellConvention':'area; floor index; no interpolation; projected meters not equal ground meters'},'distribution':{'requestedBbox':region,'bbox':[west,south,east,north],'columnStart':c0,'columnEnd':c1,'rowStart':r0,'rowEnd':r1},'tiles':{'size':512,'entries':tiles},'overview':{'file':'overview.png','crs':'EPSG:3857','bbox':[west,south,east,north],'stride':16,'width':coarse.shape[1],'height':coarse.shape[0],'method':'maximum original count in16x16 source cells; display only','scale':'log1p counts; colors saturate at scaleMax','scaleMax':vmax,'sha256':digest(output/'overview.png'),'alpha':'40+210*log1p(count)/log1p(scaleMax), clipped0..1; NoData transparent'},'statistics':{'nonNoDataCells':valid_cells,'maxCount':max_count,'compressedTileBytes':sum(t['bytes'] for t in tiles)},'quality':{'uncertainty':None,'providerAccuracy':'untested; compiled to stated positional specification in provider metadata','noDataIsZeroTraffic':False,'individualTrajectoriesAvailable':False,'vesselSpeedAvailable':False,'geographicCoverage':'published pilot subset only','collisionProbability':None}}
  assert m['statistics']['compressedTileBytes']<24*1024*1024,'Bound the public pilot package; reduce ROI explicitly if necessary'
  write_json(output/'manifest.json',m);write_json(metadata/'inventory.json',m);write_json(metadata/'validation-samples.json',samples)
  print(json.dumps({'source':source_file.name,'sha256':source_hash,'region':m['distribution'],'statistics':m['statistics'],'tiles':len(tiles),'samples':len(samples)}))
  return m
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--overview-only',action='store_true');p.add_argument('--input',type=Path,default=ROOT/'data/raw/ais/2025/ais-transit-count-2025.tif.zip');p.add_argument('--output',type=Path,default=ROOT/'dist/data/traffic/noaa-ais-2025-v1');p.add_argument('--metadata',type=Path,default=ROOT/'data/metadata/ais/2025');p.add_argument('--region',nargs=4,type=float,default=[-74,38.5,-67,44]);a=p.parse_args();refresh_overview(a.output,a.metadata) if a.overview_only else run(a.input,a.output,a.metadata,a.region)
