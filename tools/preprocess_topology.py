#!/usr/bin/env python3
"""Conservative 0.1-degree planning mask. Any land/ice polygon contact blocks the cell.
Offline only. pip install shapely pyshp numpy. Raw sources are preserved.
"""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import hashlib,json,gzip,time
import numpy as np
import shapefile,shapely
from shapely.geometry import shape
ROOT=Path(__file__).resolve().parents[1];RAW=ROOT/'data/raw/topology';OUT=ROOT/'dist/data/topology/natural-earth-10m-0p1-v1'
STEP=.1;WEST=-180;SOUTH=-85;COLS=3600;ROWS=1700
sources=[];polygons=[]
for name,version in [('ne_10m_land','5.1.1'),('ne_10m_antarctic_ice_shelves_polys','4.1.0')]:
    path=RAW/(name+'.zip');data=path.read_bytes()
    with ZipFile(BytesIO(data)) as z:
        assert z.testzip() is None
        with shapefile.Reader(shp=BytesIO(z.read(name+'.shp')),shx=BytesIO(z.read(name+'.shx')),dbf=BytesIO(z.read(name+'.dbf'))) as reader:
            geoms=[shape(s.__geo_interface__) for s in reader.iterShapes()]
        for geom in geoms:
            if not geom.is_valid:geom=shapely.make_valid(geom)
            polygons.append(geom)
        embedded=[n for n in z.namelist() if 'VERSION' in n.upper()]
        if embedded:assert z.read(embedded[0]).decode().strip()==version
    sources.append({'file':path.name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'version':version,'url':'https://naturalearth.s3.amazonaws.com/10m_physical/'+path.name,'license':'public domain'})
print('Preparing source geometry',flush=True);obstacles=shapely.union_all(polygons);assert obstacles.is_valid;shapely.prepare(obstacles)
mask=np.empty((ROWS,COLS),dtype=np.uint8);xs=WEST+np.arange(COLS)*STEP
for row in range(ROWS):
    y=SOUTH+row*STEP
    cells=shapely.box(xs,y,xs+STEP,y+STEP)
    mask[row]=shapely.intersects(obstacles,cells)
    if row%250==0:print('Rows',row,'/',ROWS,flush=True)
# A cell touching an unknown polar region is blocked by the engine extent guard.
packed=np.packbits(mask.reshape(-1),bitorder='little').tobytes();compressed=gzip.compress(packed,mtime=0);OUT.mkdir(parents=True,exist_ok=True);(OUT/'mask.bin').write_bytes(compressed)
metadata={'format':'w-alerter-obstacle-grid','version':1,'id':'natural-earth-10m-0p1-v1','engineVersion':'hydra-geometric-astar-1.0.0','grid':{'west':WEST,'south':SOUTH,'stepDegrees':STEP,'columns':COLS,'rows':ROWS,'crs':'EPSG:4326','node':'cell centre','cellPolicy':'blocked if any source land or static Antarctic ice-shelf polygon touches the cell','bitOrder':'little','rowOrder':'south-to-north','longitudeWrap':True},'mask':{'path':'mask.bin','compression':'gzip','bytes':len(compressed),'expandedBytes':len(packed),'sha256':hashlib.sha256(packed).hexdigest(),'compressedSha256':hashlib.sha256(compressed).hexdigest(),'blockedCells':int(mask.sum())},'sources':sources,'attribution':'Made with Natural Earth','termsUrl':'https://www.naturalearthdata.com/about/terms-of-use/','precision':'Cartographic 1:10m source; 0.1-degree conservative cells, not a nautical chart','temporal':'Static coastline. Ice shelves derived from 2003-2004 MOA; not current sea-ice conditions.','unsupported':['bathymetry and vessel draft','current seasonal sea ice','current navigational hazards','traffic separation and local regulations','habitat and collision-risk costs','fuel or CO2 optimization'],'createdBy':'tools/preprocess_topology.py'}
(OUT/'manifest.json').write_text(json.dumps(metadata,indent=2)+'\n');(RAW/'obstacles.wkb').write_bytes(shapely.to_wkb(obstacles));print(json.dumps(metadata['mask']))
