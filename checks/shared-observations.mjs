import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SharedObservationRepository,validObservation} from '../dist/observations/shared-repository.mjs';
import {ObservationDataService} from '../dist/observations/shared-service.mjs';
import {EnvironmentalDataRepository} from '../dist/environment/repository.mjs';
import {EnvironmentalDataService} from '../dist/environment/service.mjs';
import {SpeciesModels} from '../dist/science/models.mjs';
import {observationMessage} from '../dist/observations/shared-messages.mjs';

const dir=new URL('../dist/data/observations/obis-noaa-2026-10-v1/',import.meta.url);
const calls=[];
const fetcher=async url=>{const value=new URL(url);calls.push(value.href);return new Response(await readFile(value),{status:200});};
const repository=new SharedObservationRepository({manifestUrl:new URL('manifest.json',dir),fetcher}),service=new ObservationDataService(repository),m=await repository.open();
const all=(await Promise.all(m.species.map(async species=>service.query({speciesId:species.id})))).flatMap(r=>r.records);

test('all 51,594 actual published records decode, verify and retain explicit source keys',()=>{
  assert.equal(m.rawRecordsRead,741264);assert.equal(m.recordCount,51594);assert.equal(all.length,51594);assert.equal(new Set(all.map(r=>r.id)).size,51594);
  assert.deepEqual(m.species.map(s=>[s.id,s.recordCount]),[['balaenoptera-physalus',8193],['balaenoptera-musculus',807],['megaptera-novaeangliae',12381],['eubalaena-glacialis',30213]]);
  assert(all.every(r=>validObservation(r,m.sources)));assert(all.every(r=>r.recordType!=='model'));assert.equal(all.filter(r=>r.recordType==='ptacs_calls').length,2519);
  assert.equal(m.chunks.reduce((n,c)=>n+c.bytes,0),1340571);assert(m.chunks.every(c=>c.rows<=2000&&c.decodedBytes<=3000000));
});
test('only explicit CC0 OBIS points are distributed; identical archives never duplicate records',()=>{
  assert.equal(all.filter(r=>m.sources[r.sourceId].family==='obis').length,38943);assert(Object.values(m.sources).filter(s=>s.family==='obis').every(s=>s.license==='CC0'&&s.redistributionCleared&&s.metadataSha256));
  assert.equal(m.inputs.find(i=>i.file.includes('101849')).duplicateOf,'obis_seamap_species_180530_csv_101848.zip');
  const areas=m.inputs.filter(i=>i.file.startsWith('WDPA'));assert.equal(areas.length,4);assert(areas.every(i=>i.sameAsPreviouslyIntegrated&&i.integration==='local_protection_adapter'));
  assert.equal(m.audits.filter(a=>!a.file.endsWith('.csv')).reduce((n,a)=>n+a.counts.excluded.redistribution_not_cleared,0),689121);
});
test('RWSAS missing/sign-conflicting/out-of-region/duplicate rows remain excluded without coordinate repair',()=>{
  const a=m.audits.find(a=>a.file==='23305_RWSAS.csv');assert.equal(a.rowsRead,13200);assert.equal(a.publishedRows,12651);assert.deepEqual(a.counts.excluded,{outside_declared_source_region:3,longitude_sign_conflicts_with_source_region:21,source_flagged_duplicate:322,invalid_or_missing_coordinates:203});
  const rows=all.filter(r=>r.sourceId==='noaa:rwsas');assert(rows.every(r=>r.lon<0&&r.lon>=-81.5&&r.lat>=25.7&&r.lat<=51.7&&r.duplicateRaw===''));assert(rows.every(r=>r.time.year>=2002&&r.time.year<=2018&&r.time.precision==='day'&&r.time.display.length===10));
  assert.equal(rows.at(0).time.utc,null);assert(!all.some(r=>r.id==='noaa:rwsas:29703'));assert(rows.some(r=>r.certainty==='Probable'));
});
test('2025 filters return real year counts; missing dates, unknown species and invalid calendar dates do not fall back',async()=>{
  const expected=[545,6,408,168];for(let i=0;i<m.species.length;i++){const r=await service.query({speciesId:m.species[i].id,year:'2025'});assert.equal(r.matchedCount,expected[i]);assert(r.records.every(r=>r.time.year===2025));}
  const missing=await service.query({speciesId:'megaptera-novaeangliae',year:'2030'});assert.equal(missing.status,'no_observations_for_query');assert.equal(missing.matchedCount,0);
  assert.equal((await service.query({speciesId:'eubalaena-glacialis',year:'2025',source:'noaa'})).matchedCount,0);
  assert.equal((await service.query({speciesId:'caretta-caretta'})).status,'invalid_species');assert.equal((await service.query({speciesId:'balaenoptera-musculus',date:'2025-02-30'})).status,'invalid_query');
  assert.equal((await service.query({speciesId:'balaenoptera-musculus',bounds:[-70,50,-80,30]})).status,'invalid_query');
});
test('day-only records do not acquire a UTC midnight or positional uncertainty; acoustic and absence rows are explicit',async()=>{
  assert(all.every(r=>r.time.utc===null&&r.time.timezoneVerified===false&&r.uncertaintyMeters===null));assert.equal(all.filter(r=>r.presence==='absence').length,1726);
  const day=all.find(r=>r.sourceId!=='noaa:rwsas'&&r.time.bits==='111000');assert.equal(day.time.display.length,10);assert.equal(day.time.display.includes('00:00'),false);
  const r=await service.query({speciesId:'eubalaena-glacialis',recordType:'ptacs_calls'});assert.equal(r.matchedCount,2519);assert(r.records.every(r=>r.recordType==='ptacs_calls'));
  const b=[-75,35,-65,45],within=await service.query({speciesId:'megaptera-novaeangliae',year:'2025',bounds:b});assert(within.matchedCount>0);assert(within.records.every(r=>r.lon>=b[0]&&r.lon<=b[2]&&r.lat>=b[1]&&r.lat<=b[3]));
});
test('one shared source serves all six species adapters while biological outputs remain blocked',async()=>{
  const models=new SpeciesModels({observationDataService:service});assert.equal((await models.observationInputs('balaenoptera-physalus',{year:'2025'})).matchedCount,545);assert.equal((await models.observationInputs('eubalaena-glacialis',{year:'2025'})).matchedCount,168);
  assert.equal(models.evaluate('balaenoptera-physalus',{}).result,null);assert.equal((await models.observationInputs('caretta-caretta')).status,'invalid_species');
  const environmental=new EnvironmentalDataService(new EnvironmentalDataRepository({fetcher})),connected=new ObservationDataService(repository,{environmentalDataService:environmental});
  const historic=all.find(r=>r.sourceId==='noaa:rwsas');const context=await connected.environmentalContext(historic);assert.equal(context.status,'queried');assert.equal(context.queryDate,historic.time.date);assert.notEqual(context.sst.status,'available');assert.notEqual(context.current.status,'available');
  assert.equal((await connected.environmentalContext({...historic,time:{...historic.time,date:null}})).status,'exact_observation_date_not_available');
});
test('lazy chunks are cached, concurrent requests deduplicate, and corrupt or swapped data never become records',async()=>{
  const repo=new SharedObservationRepository({manifestUrl:new URL('manifest.json',dir),fetcher}),meta=(await repo.open()).chunks.find(c=>c.speciesId==='balaenoptera-musculus'&&c.year==='2025');
  const [a,b]=await Promise.all([repo.chunk(meta),repo.chunk(meta)]);assert.strictEqual(a,b);assert.equal(repo.stats.chunkFetches,1);assert.strictEqual(await repo.chunk(meta),a);assert.equal(repo.stats.cacheHits,1);
  const corrupt=new SharedObservationRepository({manifestUrl:new URL('manifest.json',dir),fetcher:async url=>{if(String(url).includes('.json.gz')){const bytes=new Uint8Array(await readFile(new URL(url)));bytes[bytes.length-10]^=1;return new Response(bytes);}return fetcher(url);}});
  const cm=(await corrupt.open()).chunks[0];await assert.rejects(corrupt.chunk(cm),/checksum/);assert.equal(corrupt.cache.size,0);
  assert(!calls.some(url=>/\.(zip|nc|csv)(\?|$)/.test(url)));
});
test('new observation controls have complete translations in all five languages',async()=>{
  const source=await readFile(new URL('../dist/observations/shared-messages.mjs',import.meta.url),'utf8');const keys=[...source.matchAll(/(?:^|[},\n])\s*([A-Za-z]+):\[/g)].map(m=>m[1]);assert(keys.length>55);for(const key of keys)for(const lang of ['tr','en','de','fr','es'])assert.notEqual(observationMessage(key,lang),key,lang+':'+key);
});
