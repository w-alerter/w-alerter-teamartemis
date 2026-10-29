"""Independent Shapely clipping against original WDPA vectors, using explicit sampled geodesics."""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import json,unittest,shapefile,shapely
from shapely.geometry import shape,LineString
ROOT=Path(__file__).resolve().parents[1]
class ProtectedRoutes(unittest.TestCase):
 def test_original_vectors_match_all_route_intersections_and_union(self):
  raw=ROOT/'data/raw/protection';cases=json.loads((raw/'route-independent-cases.json').read_text())['cases'];geometries={}
  with ZipFile(raw/'WDPA_WDOECM_Oct2026_Public_PO_shp.zip') as outer:
   for part in range(3):
    with ZipFile(BytesIO(outer.read(f'WDPA_WDOECM_Oct2026_Public_PO_shp_{part}.zip'))) as z:
     base='WDPA_WDOECM_Oct2026_Public_PO_shp-polygons'
     with shapefile.Reader(shp=BytesIO(z.read(base+'.shp')),dbf=BytesIO(z.read(base+'.dbf')),shx=BytesIO(z.read(base+'.shx'))) as reader:
      for rec in reader.iterShapeRecords():geometries[rec.record.SITE_PID]=shape(rec.shape.__geo_interface__)
  union=shapely.union_all(list(geometries.values()))
  for c in cases:
   distances={key:0 for key in geometries};total=0
   for p in c['pieces']:
    line=LineString([p['from'],p['to']]);total+=line.intersection(union).length/line.length*p['distanceNM']
    for key,geo in geometries.items():distances[key]+=line.intersection(geo).length/line.length*p['distanceNM']
   self.assertAlmostEqual(total,c['actual']['uniqueDistanceNM'],places=5)
   rows={a['id']:a['distanceNM'] for a in c['actual']['areas']}
   for key,d in distances.items():self.assertAlmostEqual(d,rows.get(key,0),places=5)
if __name__=='__main__':unittest.main()
