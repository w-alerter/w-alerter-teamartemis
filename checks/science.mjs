import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {DATA_KINDS,SPECIES,legacyDescriptor} from '../dist/science/catalog.mjs';
import {validateDataset,utcMillis,compatibility} from '../dist/science/validation.mjs';
import {inspectFile,sha256,sha256Fallback} from '../dist/science/pipeline.mjs';
import {SpeciesModels,RoutingEngines} from '../dist/science/models.mjs';
import {DatasetRepository} from '../dist/science/repository.mjs';

// No synthetic scientific measurements. Use the supplied source and rejection cases only.
const model=await readFile('dist/model.js'),workspace=await readFile('dist/workspace.js'),html=await readFile('checks/reference-original.html');
const hash=value=>createHash('sha256').update(value).digest('hex');
assert.equal(hash(model),'631436312232a6c98413bd0d3d477ca7738ba144cb0811ce266ffd5f6d0c1e6b');
assert.equal(hash(workspace),'537120a60aa080044dfbc875721cf93668516b050991ebfd1c45fd77f07b528e');
const ctx=vm.createContext({});vm.runInContext(model.toString(),ctx);const refs=JSON.parse(vm.runInContext('JSON.stringify(ARSIV)',ctx));
const legacy=legacyDescriptor(refs);assert.deepEqual(legacy.references,refs);assert.equal(legacy.provenance.sourceSha256,hash(html));
assert.equal(compatibility(legacy,legacy).status,'unknown');assert.equal(legacy.spatial.bbox,null);assert.equal(legacy.temporal.start,null);
for(const bytes of [html,new Uint8Array()]){assert.equal(await sha256(bytes),hash(bytes));assert.equal(sha256Fallback(bytes),hash(bytes));}
for(const input of [null,[],{}, {format:'w-alerter-dataset',schemaVersion:1}, {metadata:{variables:null}}, {metadata:{variables:[]}}])assert.equal(validateDataset(input).ok,false);
for(const time of ['2026-02-30T00:00:00Z','2026-01-01','2026-01-01T24:00:00Z','2026-01-01T00:00:00.0001Z',null])assert.equal(utcMillis(time),null);
assert.equal(utcMillis('2026-01-01T00:00:00Z'),Date.parse('2026-01-01T00:00:00Z'));
assert.equal((await inspectFile(new File([html],'reference-original.html'))).status,'needs_adapter');
assert.equal((await inspectFile(new File([],'empty.json'))).status,'rejected');
assert.equal((await inspectFile(new File(['{}'],'incomplete.json'))).status,'rejected');
const species=new SpeciesModels();assert.equal(SPECIES.length,6);assert.equal(new Set(SPECIES.map(s=>s.scientificName)).size,6);
assert.deepEqual(SPECIES[0].requiredKinds,['chlorophyll','calanus','sst','observations']);assert(SPECIES.slice(1).every(s=>s.requirementsStatus==='not_defined'&&s.requiredKinds.length===0));
for(const s of SPECIES){const result=species.evaluate(s.id,{});assert.equal(result.status,'blocked');assert.equal(result.result,null);}
assert.throws(()=>species.register({speciesId:SPECIES[0].id}));
const routing=new RoutingEngines();assert.equal(routing.hydraReadiness().engineAvailable,false);assert.equal(routing.hydraReadiness().missingFactors.length,9);assert.equal(routing.plan('hydra',{}).result,null);assert.throws(()=>routing.registerCostTerm({id:'fuel',units:'L'}));
assert(DATA_KINDS.every(k=>k.status==='not_integrated'));
const repo=new DatasetRepository(null);await assert.rejects(repo.list(),/unavailable/);await assert.rejects(repo.save({}),/original/);
console.log('PASS: exact legacy file hashes, source provenance, SHA-256/fallback, malformed intake rejection, UTC validation, unknown alignment, separate species requirements, blocked unvalidated models/HYDRA and unavailable-storage handling.');
