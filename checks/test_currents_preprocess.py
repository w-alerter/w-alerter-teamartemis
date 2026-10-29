"""Independent raw NetCDF-to-tile verification. Does not run the implementation decoder."""
from pathlib import Path
from datetime import datetime,timedelta,timezone
import unittest,json,gzip,hashlib,struct
import sys,tempfile
import numpy as np
from netCDF4 import Dataset
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from environment_catalog import upsert_catalog
CATALOG=json.loads((ROOT/'dist/data/environment/catalog.json').read_text())
DATASETS=[(ROOT/'dist/data/environment'/e['manifest']) for e in CATALOG['datasets'] if e['kind']=='currents']

class Currents(unittest.TestCase):
    def test_reprocessing_one_source_preserves_other_and_future_catalog_entries(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'catalog.json';upsert_catalog(path,[{'id':'TEST-ONLY-SST','manifest':'sst-v1.json'},{'id':'TEST-ONLY-FUTURE','manifest':'future.json'}]);upsert_catalog(path,[{'id':'TEST-ONLY-CURRENTS','manifest':'currents-v1.json'}]);upsert_catalog(path,[{'id':'TEST-ONLY-SST','manifest':'sst-v2.json'}]);d=json.loads(path.read_text());self.assertEqual(len(d['datasets']),3);self.assertEqual({e['id']:e['manifest'] for e in d['datasets']},{'TEST-ONLY-SST':'sst-v2.json','TEST-ONLY-FUTURE':'future.json','TEST-ONLY-CURRENTS':'currents-v1.json'})
    def test_all_four_originals_accessible_and_unchanged(self):
        inventory=json.loads((ROOT/'data/metadata/currents/2025/inventory.json').read_text())
        self.assertEqual(len(inventory['files']),4)
        for f in inventory['files']:
            p=ROOT/'data/raw/currents/2025'/f['source']['originalFile'];self.assertTrue(p.is_file());self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),f['source']['sha256'])
            with Dataset(p) as d:
                self.assertEqual(len(d['depth']),1);self.assertAlmostEqual(float(d['depth'][0]),.49402499198913574)
                for raw,iso in zip(d['time'][:],f['times']):self.assertEqual((datetime(1970,1,1,tzinfo=timezone.utc)+timedelta(seconds=float(raw))).strftime('%Y-%m-%dT%H:%M:%SZ'),iso)

    def test_every_native_tile_matches_all_raw_float32_cells(self):
        for path in DATASETS:
            m=json.loads(path.read_text());opened={}
            try:
                for ti,s in enumerate(m['timeSlices']):
                    filename=s['source']['originalFile']
                    if filename not in opened:
                        d=Dataset(ROOT/'data/raw/currents/2025'/filename);d.set_auto_maskandscale(False);opened[filename]=d
                    d=opened[filename];source_index=ti%6
                    for x,y in m['tiles']['pairs']:
                        b=gzip.decompress((path.parent/'tiles'/s['id']/f'{x}-{y}.bin').read_bytes());magic,version,w,h,x0,y0,index,channels,*_=struct.unpack('<4s10H',b[:24]);self.assertEqual((magic,version,index,channels),(b'WAC1',1,ti,2));self.assertEqual(len(b),24+w*h*8)
                        for c,name in enumerate(['uo','vo']):
                            actual=np.frombuffer(b,dtype='<f4',count=w*h,offset=24+c*w*h*4).reshape(h,w);expected=np.asarray(d[name][source_index,0,y0:y0+h,x0:x0+w]);self.assertTrue(np.array_equal(actual.view('u4'),expected.view('u4')))
            finally:
                for d in opened.values():d.close()

    def test_vector_display_samples_match_original_cells(self):
        for path in DATASETS:
            m=json.loads(path.read_text())
            for ti,s in enumerate(m['timeSlices']):
                with Dataset(ROOT/'data/raw/currents/2025'/s['source']['originalFile']) as d:
                    d.set_auto_maskandscale(False);b=gzip.decompress((path.parent/'vectors'/(s['id']+'.bin')).read_bytes());header=struct.unpack('<4s10H',b[:24]);self.assertEqual(header[0],b'WAV1');w,h=header[2:4];offset=m['vectors']['offset'];stride=m['vectors']['stride']
                    for c,name in enumerate(['uo','vo']):
                        a=np.frombuffer(b,dtype='<f4',count=w*h,offset=24+c*w*h*4).reshape(h,w);e=np.asarray(d[name][ti%6,0,offset::stride,offset::stride]);self.assertTrue(np.array_equal(a.view('u4'),e.view('u4')))

    def test_monthly_metadata_never_invents_bounds_or_uncertainty(self):
        for path in DATASETS:
            m=json.loads(path.read_text());self.assertEqual([s['period'] for s in m['timeSlices']],[f'2025-{n:02}' for n in range(1,13)])
            for s in m['timeSlices']:self.assertIsNone(s['start']);self.assertIsNone(s['end']);self.assertIsNone(s['rawBounds']);self.assertFalse(s['boundsEncoded']);self.assertEqual(s['variables']['current_u']['attributes']['cell_methods'],'area: mean')

    def test_overviews_have_original_grid_shape_and_source_missing_alpha(self):
        for path in DATASETS:
            m=json.loads(path.read_text());s=m['timeSlices'][0]
            with Dataset(ROOT/'data/raw/currents/2025'/s['source']['originalFile']) as d:
                d.set_auto_maskandscale(False);valid=np.isfinite(d['uo'][0,0])&np.isfinite(d['vo'][0,0])
            for variable in ['current_speed','current_u','current_v']:
                with Image.open(path.parent/'overviews'/s['id']/(variable+'.png')) as image:
                    self.assertEqual(image.size,(m['grid']['columns'],m['grid']['rows']));self.assertTrue(np.array_equal(np.asarray(image)[...,3][::-1]>0,valid))

    def test_distribution_has_no_originals_or_whale_coordinate_archive(self):
        files=[p for p in (ROOT/'dist').rglob('*') if p.is_file()];self.assertFalse(any(p.suffix in ['.nc','.zip'] or 'occurrence.txt'==p.name for p in files));self.assertLess(sum(p.stat().st_size for p in files),90*1024*1024);self.assertLess(max(p.stat().st_size for p in files),25*1024*1024)

if __name__=='__main__':unittest.main(verbosity=2)
