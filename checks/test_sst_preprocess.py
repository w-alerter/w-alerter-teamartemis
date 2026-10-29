"""Source-file integration tests. Only the small explicit rejection fixture is artificial."""
import gzip
import importlib.util
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import struct
import unittest
import sys
import numpy as np
from netCDF4 import Dataset
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
spec=importlib.util.spec_from_file_location('preprocess_sst',ROOT/'tools/preprocess_sst.py');pipeline=importlib.util.module_from_spec(spec);spec.loader.exec_module(pipeline)
CATALOG=json.loads((ROOT/'dist/data/environment/catalog.json').read_text())
MANIFEST_PATH=ROOT/'dist/data/environment'/next(e['manifest'] for e in CATALOG['datasets'] if e['id']=='dmi-c3s-sst-2025')
M=json.loads(MANIFEST_PATH.read_text());AUDIT=json.loads((ROOT/'data/metadata/sst/2025/inventory.json').read_text());SAMPLES=json.loads((ROOT/'data/metadata/sst/2025/validation-samples.json').read_text())

class SourceIntegration(unittest.TestCase):
    def test_twelve_real_sources_and_manual_epoch_decode(self):
        self.assertEqual(len(AUDIT['files']),12)
        for item in AUDIT['files']:
            path=ROOT/'data/raw/sst/2025'/item['source']['originalFile'];self.assertTrue(path.is_file());self.assertEqual(pipeline.digest(path),item['source']['sha256'])
            with Dataset(path) as ds:
                ds.set_auto_maskandscale(False);seconds=int(ds['time'][0]);manual=(datetime(1981,1,1,tzinfo=timezone.utc)+timedelta(seconds=seconds)).strftime('%Y-%m-%dT%H:%M:%SZ')
                self.assertEqual(manual,item['temporal']['time']);self.assertEqual(item['temporal']['cellMethods'],'time: mean');self.assertTrue(item['temporal']['metadataConflicts']);self.assertFalse(item['temporal']['completeCalendarMonthMeanProven']);self.assertEqual(ds['analysed_sst'].shape,(1,3600,7200))
    def test_source_cells_survive_binary_packing_without_requantization(self):
        for sample in SAMPLES:
            item=next(s for s in M['timeSlices'] if s['id']==sample['timeId']);source=ROOT/'data/raw/sst/2025'/item['source']['originalFile'];x=sample['column']//M['tiles']['size'];y=sample['row']//M['tiles']['size'];blob=gzip.decompress((MANIFEST_PATH.parent/'tiles'/sample['timeId']/f'{x}-{y}.bin').read_bytes());magic,version,width,height,x0,y0,index,channels,*_=struct.unpack('<4s10H',blob[:24]);self.assertEqual(magic,b'WAE1');self.assertEqual(channels,5);position=(sample['row']-y0)*width+sample['column']-x0;offset=24
            with Dataset(source) as ds:
                ds.set_auto_maskandscale(False)
                for key,name,dtype in pipeline.VARIABLES:
                    size=np.dtype(dtype).itemsize;raw=struct.unpack_from('<h' if size==2 else '<b',blob,offset+position*size)[0];offset+=width*height*size
                    self.assertEqual(raw,int(ds[name][0,sample['row'],sample['column']]));self.assertEqual(raw,sample['raw'][key])
                    if sample['decoded'][key] is not None:
                        attributes=item['variables'][key]['attributes'];manual=raw*attributes.get('scale_factor',1)+attributes.get('add_offset',0);self.assertAlmostEqual(manual,sample['decoded'][key],places=10)
    def test_mask_before_scale_and_temperature_difference_not_absolute(self):
        # Explicit unit fixture, confined to tests: packed zero is valid, fill is missing.
        a={'_FillValue':-32768,'missing_value':-32768,'scale_factor':.01,'add_offset':273.15,'units':'kelvin'}
        values=pipeline.decode(np.array([0,-32768],dtype=np.int16),a,celsius=True);self.assertEqual(values[0],0);self.assertTrue(np.isnan(values[1]))
        self.assertAlmostEqual(pipeline.decode(np.array([24],dtype=np.int16),{'scale_factor':.01,'add_offset':0})[0],.24)
    def test_independent_netcdf_auto_decode_agrees_with_manual_source_metadata(self):
        for item in AUDIT['files']:
            sample=next(s for s in SAMPLES if s['timeId']==item['temporal']['id']);path=ROOT/'data/raw/sst/2025'/item['source']['originalFile']
            with Dataset(path) as ds:
                value=float(ds['analysed_sst'][0,sample['row'],sample['column']]);self.assertAlmostEqual(value,sample['decoded']['sst'],delta=5e-5)
    def test_full_grid_and_ambiguous_averaged_mask_are_recorded(self):
        total=7200*3600
        for item in AUDIT['files']:
            stats=item['statistics'];self.assertEqual(stats['sst']['valid']+stats['sst']['missingOrInvalid'],total);self.assertGreater(stats['mask']['intermediateMeanMaskCount'],0);self.assertEqual(sum(stats['mask']['valueCounts'].values()),total)
    def test_overview_is_source_center_sampling_and_not_query_grid(self):
        self.assertEqual(M['overview']['stride'],5);self.assertEqual(M['grid']['nominalStepDegrees'],.05);self.assertEqual(M['overview']['stepDegrees'],.25)
        for item in M['timeSlices']:
            for variable in ['sst','sst_uncertainty','sea_ice_fraction','mask']:
                image=Image.open(MANIFEST_PATH.parent/'overviews'/item['id']/(variable+'.png'));self.assertEqual(image.size,(1440,720));self.assertEqual(image.mode,'RGBA');image.close()
            source=ROOT/'data/raw/sst/2025'/item['source']['originalFile']
            with Dataset(source) as ds:
                ds.set_auto_maskandscale(False);sample=next(s for s in SAMPLES if s['timeId']==item['id']);px=sample['column']//5;py=sample['row']//5;x=px*5+2;y=py*5+2;valid=int(ds['mask'][0,y,x])==1 and int(ds['sea_ice_fraction'][0,y,x])==0 and int(ds['analysed_sst'][0,y,x])!=-32768
                image=Image.open(MANIFEST_PATH.parent/'overviews'/item['id']/'sst.png');self.assertEqual(image.getpixel((px,719-py))[3],255 if valid else 0);image.close()
    def test_distribution_is_bounded_and_excludes_original_netcdf(self):
        files=[p for p in (ROOT/'dist').rglob('*') if p.is_file()];self.assertFalse(any(p.suffix=='.nc' for p in files));self.assertLess(sum(p.stat().st_size for p in files),100*1024*1024);self.assertLess(len(files),10000);self.assertLess(max(p.stat().st_size for p in files),25*1024*1024)
        self.assertLess(M['distribution']['assetBytesBeforeManifest'],M['distribution']['rawBytesExcluded']);self.assertEqual(len(M['tiles']['pairs'])*12,744)

if __name__=='__main__':unittest.main(verbosity=2)
