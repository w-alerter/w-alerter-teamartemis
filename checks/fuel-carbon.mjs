/* Artificial numerical fixtures are restricted to this test file. None ship as application data. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
import {FUEL_FACTORS,kgToTonnes} from '../dist/fuel/fuelFactors.mjs';
import {validateProfile,VesselProfileRepository,clone} from '../dist/fuel/vesselProfile.mjs';
import {mainEnginePerformance,loadCorrection} from '../dist/fuel/enginePerformance.mjs';
import {fuelMassKg,evaluateVoyage} from '../dist/fuel/fuelConsumption.mjs';
import {carbonEmissions} from '../dist/fuel/carbonEmissions.mjs';
import {change,compareVoyages} from '../dist/fuel/economicComparison.mjs';
import {distanceNm,draftToVoyage,normalizeSegments,parseVoyagePackage} from '../dist/fuel/voyageSegments.mjs';
import {FuelAnalysisController} from '../dist/fuel/coordinator.mjs';
import {MESSAGES} from '../dist/fuel/messages.mjs';
import {RoutingEngines} from '../dist/science/models.mjs';
import {ROUTING_FACTORS} from '../dist/science/catalog.mjs';
const departureIso='2026-10-25T00:00:00.000Z';
const profile=()=>({name:'TEST ONLY',vesselType:'cargo',manufacturerModel:'TEST ONLY',propulsion:'conventional-diesel',engineType:'medium-speed-diesel',displacementModelConfirmed:true,nominalPowerKw:1000,referenceSpeedKnots:10,referenceLoad:.8,sfocGPerKwh:200,sfocReferenceLoad:.8,sfocMode:'constant',fuelId:'diesel',plannedSpeedKnots:10,maxSpeedKnots:14,auxiliary:{mode:'unknown'},prices:[]});
const route=(role='reference',speedKnots=10)=>({id:'test-'+role,name:'TEST ONLY',role,departureIso,source:{kind:role==='reference'?'user-verified-reference':'hydra-import',verification:'user-attested',citation:'TEST ONLY',engineVersion:'TEST ONLY'},segments:[{id:'test-leg',coordinates:[[0,0],[1,0]],speedKnots}]});
const input=(p=profile(),r=route())=>({profile:p,route:r,departureIso,preferredSpeedKnots:10});
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
test('units, knot-time identity, independent fuel/CO2 dimensional calculation',async()=>{
  assert.equal(kgToTonnes(2500),2.5);assert.equal(fuelMassKg(800,200,2),320);
  const [s]=normalizeSegments(route(),{departureIso,preferredSpeedKnots:10});near(s.durationHours,s.distanceNm/10);
  const result=await evaluateVoyage(input());assert.equal(result.status,'computed',JSON.stringify(result.issues));near(result.totals.fuelKg,s.distanceNm/10*160);near(result.totals.co2Kg,result.totals.fuelKg*3.206);assert.equal(result.totals.wholeVesselFuelKg,null);assert.equal(result.scope,'main-engine-only');assert.equal(result.segments[0].auxiliaryFuelKg,null);assert.equal(result.cost.amount,null);assert(result.warnings.includes('auxiliary_missing'));assert.equal(result.totals.etaIso,s.endIso);
});
test('all five pinned IMO factors; conversion does not imply engine support',()=>{
  assert.deepEqual(Object.values(FUEL_FACTORS).map(f=>f.kgCO2PerKg),[3.206,3.151,3.114,2.75,1.375]);
  near(carbonEmissions({diesel:100,hfo:100,lng:100,methanol:100}).diesel,320.6);assert.equal(FUEL_FACTORS.lng.consumptionSupported,false);assert.throws(()=>carbonEmissions({diesel:-1}));
});
test('nominal versus reference power and normalized empirical SFOC',()=>{
  const p=profile();p.sfocMode='imo-normalized';p.sfocReferenceLoad=.5;
  const at=mainEnginePerformance(p,10*Math.cbrt(.5/.8));near(at.load,.5);near(at.sfocGPerKwh,200);near(at.powerKw,500);
  const different=mainEnginePerformance(p,10);near(different.sfocGPerKwh,200*loadCorrection(.8)/loadCorrection(.5));near(different.referencePowerKw,800);
});
test('manufacturer curve interpolation and no extrapolation',()=>{
  const p=profile();p.sfocMode='manufacturer-curve';p.curveSource='TEST ONLY';p.sfocCurve=[{load:.4,sfocGPerKwh:220},{load:.8,sfocGPerKwh:200}];
  near(mainEnginePerformance(p,10*Math.cbrt(.6/.8)).sfocGPerKwh,210);assert.throws(()=>mainEnginePerformance(p,10*Math.cbrt(.2/.8)),/outside_sfoc_curve/);
});
test('auxiliary consumption is separate; mixed fuel factors and per-fuel prices',async()=>{
  const p=profile();p.fuelId='hfo';p.auxiliary={mode:'defined',nominalPowerKw:100,load:.5,sfocGPerKwh:220,fuelId:'diesel'};p.prices=[{fuelId:'hfo',perTonne:500,currency:'USD',date:'2026-10-25'},{fuelId:'diesel',perTonne:1000,currency:'USD',date:'2026-10-25'}];
  const r=await evaluateVoyage(input(p)),hours=r.totals.durationHours;near(r.fuelById.hfo,hours*160);near(r.fuelById.diesel,hours*11);near(r.totals.co2Kg,hours*(160*3.114+11*3.206));near(r.cost.amount,hours*(160*.5+11));assert.equal(r.scope,'main-and-declared-auxiliary');
  p.prices.pop();assert.equal((await evaluateVoyage(input(p))).cost.amount,null);p.prices.push({fuelId:'diesel',perTonne:1000,currency:'EUR',date:'2026-10-25'});assert.equal((await evaluateVoyage(input(p))).cost.reason,'mixed_currencies');
});
test('stationary waiting never divides by zero and requires explicit auxiliary load',async()=>{
  const p=profile();p.auxiliary={mode:'defined',nominalPowerKw:100,load:.5,sfocGPerKwh:200,fuelId:'diesel'};const r=route();r.segments.push({type:'wait',coordinate:[1,0],durationHours:2,mainEngineOff:true,auxiliaryLoad:.3});
  const result=await evaluateVoyage(input(p,r));assert.equal(result.status,'computed');assert.equal(result.segments[1].mainFuelKg,0);near(result.segments[1].auxiliaryFuelKg,12);assert.equal(result.segments[1].speedKnots,0);
  delete r.segments[1].auxiliaryLoad;assert.equal((await evaluateVoyage(input(p,r))).issues[0].code,'waiting_auxiliary_load_required');
});
test('legal caps and segment speed affect actual duration/power; no speed source invented',async()=>{
  const r=route();r.segments[0].speedLimitKnots=8;r.segments[0].speedLimitSource='TEST ONLY';const result=await evaluateVoyage(input(profile(),r));near(result.segments[0].powerKw,800*(.8**3));near(result.totals.durationHours,result.totals.distanceNm/8);
  delete r.segments[0].speedLimitSource;assert.equal((await evaluateVoyage(input(profile(),r))).issues[0].code,'speed_limit_source_required');
});
test('reference/HYDRA signs, negative savings, zero baseline, zero fuel price',async()=>{
  const p=profile();p.prices=[{fuelId:'diesel',perTonne:0,currency:'USD',date:'2026-10-25'}];
  const a=await evaluateVoyage(input(p,route('reference',8))),b=await evaluateVoyage(input(p,route('hydra',10))),c=compareVoyages(a,b);assert.equal(c.status,'computed');assert(c.fuel.percent>0);assert(c.fuel.saving<0);assert(c.co2.saving<0);assert.equal(c.cost.percent,null);assert.equal(c.cost.saving,0);assert.equal(change(0,1).percent,null);assert.equal(change(10,8).percent,-20);
  const reduced=compareVoyages(await evaluateVoyage(input(p,route('reference',10))),await evaluateVoyage(input(p,route('hydra',8))));assert(reduced.co2.percent<0);assert(reduced.time.percent>0);
});
test('comparison blocks unverified geometry, endpoint mismatches and differing profile versions',async()=>{
  const a=await evaluateVoyage(input()),r=route('hydra');r.segments[0].coordinates[1]=[2,0];const b=await evaluateVoyage(input(profile(),r));assert.equal(compareVoyages(a,b).reason,'route_endpoints_differ');
  const draft=draftToVoyage({points:[{lat:0,lon:0},{lat:0,lon:1}]});assert.equal(compareVoyages(await evaluateVoyage(input(profile(),draft)),await evaluateVoyage(input(profile(),route('hydra')))).reason,'reference_unverified');
  const p=profile();p.version=2;assert.equal(compareVoyages(a,await evaluateVoyage(input(p,route('hydra')))).reason,'comparison_inputs_differ');
});
test('invalid/absent parameters and unsupported ships produce no numeric result',async()=>{
  for(const patch of [{nominalPowerKw:0},{nominalPowerKw:null},{referenceSpeedKnots:NaN},{referenceLoad:1.1},{plannedSpeedKnots:-2},{propulsion:'hybrid'},{fuelId:'lng'},{displacementModelConfirmed:false}]){const result=await evaluateVoyage(input({...profile(),...patch}));assert.equal(result.status,'blocked');assert.equal(result.totals,undefined);}
  for(const [speed,code] of [[0,'invalid_speed'],[-1,'invalid_speed'],[14,'engine_capacity'],[30,'max_speed'],[1,'low_load_model_missing']]){const result=await evaluateVoyage({...input(),preferredSpeedKnots:speed,route:route('reference',speed)});assert.equal(result.issues[0].code,code);}
  assert.equal((await evaluateVoyage({...input(),departureIso:null})).issues[0].code,'departure_required');
});
test('imports require explicit provenance, dates and connected geometry',()=>{
  assert.throws(()=>parseVoyagePackage('{}','hydra'));const r=route('hydra');assert.deepEqual(parseVoyagePackage(JSON.stringify({format:'w-alerter-voyage',version:1,route:r}),'hydra'),r);r.segments.push({coordinates:[[2,0],[3,0]]});assert.throws(()=>parseVoyagePackage(JSON.stringify({format:'w-alerter-voyage',version:1,route:r}),'hydra'),/discontinuous_route/);
});
test('versioned persistence survives reload, deletion and edit; quotas roll back',async()=>{
  const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};let counter=0;const repo=new VesselProfileRepository(storage,{id:()=>`test-${++counter}`}),first=repo.save(profile());assert.equal(first.version,1);assert.equal(new VesselProfileRepository(storage).selected().name,'TEST ONLY');
  const result=await evaluateVoyage(input(first));repo.saveCalculation({reference:result});const second=repo.save({...first,nominalPowerKw:2000});assert.equal(second.version,2);assert.equal(repo.snapshot().calculations[0].reference.provenance.inputs.profile.nominalPowerKw,1000);assert.equal(repo.snapshot().profiles[0].versions.length,2);repo.remove(second.id);assert.equal(repo.list().length,0);assert.equal(repo.snapshot().calculations.length,1);repo.restore(second.id);assert.equal(repo.list().length,1);
  const before=repo.snapshot();storage.setItem=()=>{throw Error('quota');};assert.throws(()=>repo.save({...second,name:'UNSAVED'}),/quota/);assert.deepEqual(repo.snapshot(),before);
  assert(validateProfile({...profile(),referenceLoad:null}).length);
});
test('hash, provenance snapshot and scope do not mutate with later input edits',async()=>{
  const p=profile(),r=route(),result=await evaluateVoyage(input(p,r));p.nominalPowerKw=9000;r.segments[0].speedKnots=2;assert.equal(result.provenance.inputs.profile.nominalPowerKw,1000);assert.equal(result.route.segments[0].speedKnots,10);assert.match(result.provenance.inputSha256,/^[0-9a-f]{64}$/);assert.equal(result.provenance.fieldQuality.nominalPowerKw.kind,'user-entered');
});
test('controller clears stale output synchronously and ignores racing completions',async()=>{
  const pending=[];const c=new FuelAnalysisController({evaluate:inputs=>new Promise(resolve=>pending.push({inputs,resolve}))});const first=c.update({profile:profile(),reference:route(),departureIso,preferredSpeedKnots:10});assert.equal(c.state.reference,null);
  const second=c.update({profile:{...profile(),name:'LATEST'},reference:route(),departureIso,preferredSpeedKnots:8});pending[1].resolve({status:'computed',test:'latest'});await second;assert.equal(c.state.reference.test,'latest');pending[0].resolve({status:'computed',test:'old'});assert.equal((await first).discarded,true);assert.equal(c.state.reference.test,'latest');c.invalidate('unsaved_profile');assert.equal(c.state.reference,null);
});
test('invalid calendar dates, technical-source claims and damaged storage never become results',async()=>{
  const p=profile();p.prices=[{fuelId:'diesel',perTonne:1,currency:'USD',date:'2026-02-31'}];assert(validateProfile(p).some(i=>i.code==='invalid_price'));
  assert.equal((await evaluateVoyage({...input(),departureIso:'2026-02-31T00:00:00Z'})).issues[0].code,'departure_required');
  const r=route();r.departureIso='2026-10-26T00:00:00Z';assert.equal((await evaluateVoyage(input(profile(),r))).issues[0].code,'route_departure_mismatch');
  const q=profile();q.fieldQuality={nominalPowerKw:{kind:'verified-technical',source:''}};assert(validateProfile(q).some(i=>i.code==='technical_source_required'));
  let writes=0;const broken=new VesselProfileRepository({getItem:()=>JSON.stringify({version:1,profiles:[{id:'bad'}],calculations:[],settings:{}}),setItem(){writes++;}});assert.equal(broken.loadError,'damaged_fuel_storage');assert.throws(()=>broken.save(profile()),/damaged_fuel_storage/);assert.equal(writes,0);
});
test('routing integration observes real registry plans without bypassing science gates',async()=>{
  const engine=new RoutingEngines(),events=[];engine.subscribe(e=>events.push(e));engine.register({id:'hydra',version:'TEST ONLY',provenance:'TEST ONLY',plan:()=>Promise.resolve(route('hydra'))});
  assert.equal(engine.plan('hydra',{}).status,'blocked');assert.equal(events.length,0);
  for(const f of ROUTING_FACTORS)engine.registerCostTerm({id:f.id,version:'TEST ONLY',citation:'TEST ONLY',validationReference:'TEST ONLY',units:'TEST ONLY',evaluate:()=>1});
  assert.equal(engine.plan('hydra',{scientificReviewApproved:false}).status,'blocked');assert.equal(events.length,0);
  const output=await engine.plan('hydra',{scientificReviewApproved:true,departureIso});assert.equal(output.status,'computed');assert.equal(events.length,1);assert.equal(events[0].id,'hydra');assert.deepEqual(output.result,route('hydra'));
});
test('all module messages explicitly cover all five languages',()=>{for(const [key,values]of Object.entries(MESSAGES)){assert.equal(values.length,5,key);assert(values.every(v=>typeof v==='string'&&v.trim()),key);}});
