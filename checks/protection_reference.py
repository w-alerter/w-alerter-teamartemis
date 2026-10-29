"""Independent PyShp + Shapely validation, kept outside deployable assets.
Install test-only dependencies: pip install pyshp shapely
"""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import json,random,hashlib,shapefile,shapely
from shapely.geometry import shape,Point
root=Path(__file__).resolve().parents[1];path=root/'data/raw/protection/WDPA_WDOECM_Oct2026_Public_PO_shp.zip';geometries=[];properties=[];vectors=[];n_vertices=0
with ZipFile(path) as outer:
    for part in range(3):
        with ZipFile(BytesIO(outer.read(f'WDPA_WDOECM_Oct2026_Public_PO_shp_{part}.zip'))) as z:
            for layer in ('polygons','points'):
                base=f'WDPA_WDOECM_Oct2026_Public_PO_shp-{layer}'
                with shapefile.Reader(shp=BytesIO(z.read(base+'.shp')),dbf=BytesIO(z.read(base+'.dbf')),shx=BytesIO(z.read(base+'.shx'))) as reader:
                    for record in reader.iterShapeRecords():
                        geo=shape(record.shape.__geo_interface__);assert geo.is_valid,record.record.SITE_PID
                        geometries.append(geo);properties.append(record.record.as_dict());n_vertices+=len(record.shape.points)
                        for point in [geo.representative_point(),Point(record.shape.points[0]),Point(geo.centroid)]:vectors.append((point.x,point.y))
randomizer=random.Random(20261028)
for i in range(512):vectors.append((randomizer.uniform(-65,82),randomizer.uniform(-63,84)))
results=[]
for x,y in vectors:
    p=Point(x,y);matches=[]
    for geo,props in zip(geometries,properties):
        if geo.covers(p):matches.append({'id':props['SITE_PID'],'relation':'point_record' if geo.geom_type in ('Point','MultiPoint') else 'boundary' if geo.touches(p) else 'inside'})
    results.append({'lon':x,'lat':y,'matches':sorted(matches,key=lambda m:m['id'])})
output=path.parent/'independent-reference.json'
output.write_text(json.dumps({'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'shapely':shapely.__version__,'records':len(properties),'vertices':n_vertices,'samples':results,'properties':properties},ensure_ascii=False))
print(f'PASS: {len(geometries)} valid geometries, {n_vertices} vertices, {len(results)} independent spatial samples; reference in ignored raw directory')
