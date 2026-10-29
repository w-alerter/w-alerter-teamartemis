"""Independent topology checks. Requires test-only Shapely + NumPy."""
import gzip,hashlib,json,random,unittest
from pathlib import Path
import numpy as np
import shapely
from shapely.geometry import LineString,box
ROOT=Path(__file__).resolve().parents[1]
class TopologyTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.raw=ROOT/'data/raw/topology';cls.out=ROOT/'dist/data/topology/natural-earth-10m-0p1-v1';cls.meta=json.loads((cls.out/'manifest.json').read_text());cls.bytes=gzip.decompress((cls.out/'mask.bin').read_bytes());cls.bits=np.unpackbits(np.frombuffer(cls.bytes,dtype='uint8'),bitorder='little').reshape((1700,3600));cls.obstacles=shapely.from_wkb((cls.raw/'obstacles.wkb').read_bytes());shapely.prepare(cls.obstacles)
 def test_mask_source_hashes_and_budget(self):
  self.assertEqual(hashlib.sha256(self.bytes).hexdigest(),self.meta['mask']['sha256']);self.assertLess((self.out/'mask.bin').stat().st_size,50000)
  for s in self.meta['sources']:self.assertEqual(hashlib.sha256((self.raw/s['file']).read_bytes()).hexdigest(),s['sha256'])
 def test_original_vectors_are_valid_and_all_touched_cells_match(self):
  self.assertTrue(self.obstacles.is_valid);rng=random.Random(20261028)
  for i in range(1000):
   x=rng.randrange(3600);y=rng.randrange(1700);a=-180+x*.1;b=-85+y*.1
   self.assertEqual(bool(self.bits[y,x]),bool(self.obstacles.intersects(box(a,b,a+.1,b+.1))))
 def test_screenshot_old_route_hits_land_and_new_route_avoids_source_polygons(self):
  r=json.loads((self.raw/'regression-route.json').read_text());self.assertTrue(self.obstacles.intersects(LineString(r['inputWaypoints'])));self.assertFalse(self.obstacles.intersects(LineString(r['coordinates'])))
if __name__=='__main__':unittest.main()
