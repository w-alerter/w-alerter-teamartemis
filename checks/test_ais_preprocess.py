"""All distributed AIS cells are checked against the original supplied GeoTIFF, offline only."""
from pathlib import Path
import gzip,hashlib,json,struct,unittest
import numpy as np
import rasterio
from rasterio.windows import Window
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'dist/data/traffic/noaa-ais-2025-v1';M=json.loads((BASE/'manifest.json').read_text())
class AisSources(unittest.TestCase):
 def test_original_geotiff_and_temporal_evidence(self):
  source=ROOT/'data/raw/ais/2025'/M['source']['originalFile'];self.assertTrue(source.is_file())
  with source.open('rb') as f:self.assertEqual(hashlib.file_digest(f,'sha256').hexdigest(),M['source']['sha256'])
  with rasterio.open(source) as r:
   self.assertEqual(r.crs.to_epsg(),3857);self.assertEqual(r.nodata,0);self.assertEqual(r.dtypes,('uint32',));self.assertEqual(r.res,(100,100));self.assertEqual(r.scales,(1.0,));self.assertEqual(r.offsets,(0.0,));self.assertEqual(r.width,M['grid']['width']);self.assertEqual(r.height,M['grid']['height']);self.assertFalse('time' in r.tags())
  self.assertIn('no embedded measurement-time axis',M['source']['temporalEvidence']);self.assertTrue(M['source']['metadataConflicts']);self.assertEqual(M['period']['start'],'2025-01-01')
 def test_every_distributed_native_value_and_checksum(self):
  count=0
  with rasterio.open(ROOT/'data/raw/ais/2025'/M['source']['originalFile']) as r:
   for entry in M['tiles']['entries']:
    packed=(BASE/entry['file']).read_bytes();self.assertEqual(hashlib.sha256(packed).hexdigest(),entry['sha256']);raw=gzip.decompress(packed);self.assertEqual(hashlib.sha256(raw).hexdigest(),entry['expandedSha256']);self.assertEqual(raw[:4],b'WAT1')
    version,width,height=struct.unpack_from('<HHH',raw,4);column,row=struct.unpack_from('<II',raw,10);self.assertEqual(version,1);self.assertEqual((column,row),(entry['x']*512,entry['y']*512));cells=np.frombuffer(raw,dtype='<u4',offset=24).reshape(height,width);native=r.read(1,window=Window(column,row,width,height));np.testing.assert_array_equal(cells,native);count+=int(np.count_nonzero(cells))
  self.assertEqual(count,M['statistics']['nonNoDataCells'])
 def test_static_budget_and_no_raw_distribution(self):
  paths=list((ROOT/'dist').rglob('*'));files=[p for p in paths if p.is_file()];self.assertLess(sum(p.stat().st_size for p in (ROOT/'dist/data').rglob('*') if p.is_file()),90*1024**2);self.assertLess(len(files),10000);self.assertLess(max(p.stat().st_size for p in files),25*1024**2);self.assertFalse(any(p.suffix.lower() in ('.nc','.tif','.zip','.shp','.csv') for p in files))
if __name__=='__main__':unittest.main()
