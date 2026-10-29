import {metricChange,annualizedBenefit,financialSensitivity} from './economics.mjs';
const MODES={fastest:['durationHours'],emissions:['co2Kg'],cost:['cost'],wildlife:['habitat'],balance:null};
export const OPTIMIZATION_MODES=Object.freeze(Object.keys(MODES));
const value=(r,key)=>key==='cost'?r.economics?.amount:key==='habitat'?r.habitat?.status==='computed'?r.habitat.value:null:key==='noise'?r.noise?.status==='scenario'?r.noise.bands[0].sourceExposureLevelDb:null:r.totals?.[key];
export function rankCandidates(results,{mode='fastest',weights=null,deadlineIso=null}={}){
  if(!Object.hasOwn(MODES,mode))return {status:'blocked',reason:'unknown_objective'};
  let selected=MODES[mode]?Object.fromEntries(MODES[mode].map(k=>[k,1])):weights;
  if(!selected||!Object.values(selected).some(w=>Number.isFinite(w)&&w>0)||Object.entries(selected).some(([k,w])=>!['durationHours','fuelKg','co2Kg','cost','habitat','noise'].includes(k)||!Number.isFinite(w)||w<0))return {status:'blocked',reason:'objective_weights_required'};
  if(selected.fuelKg>0&&selected.co2Kg>0)return {status:'blocked',reason:'correlated_fuel_co2_objectives'};
  // Acoustic source proxies do not have the propagation/animal validation needed for an ecological routing objective.
  if(selected.noise>0)return {status:'blocked',reason:'reviewed_received_noise_objective_required'};
  const active=Object.entries(selected).filter(([,w])=>w>0),eligible=results.filter(r=>r.status==='computed'&&(!deadlineIso||Date.parse(r.totals.etaIso)<=Date.parse(deadlineIso))),missing=eligible.filter(r=>active.some(([key])=>!Number.isFinite(value(r,key))));
  if(!eligible.length)return {status:'blocked',reason:'no_complete_eligible_candidates'};
  if(missing.length)return {status:'blocked',reason:active.some(([k])=>k==='habitat')?'reviewed_species_habitat_model_missing':'objective_metric_unavailable',missingCandidateIds:missing.map(r=>r.id)};
  const weightSum=active.reduce((n,[,w])=>n+w,0),ranges=Object.fromEntries(active.map(([key])=>[key,{min:Math.min(...eligible.map(r=>value(r,key))),max:Math.max(...eligible.map(r=>value(r,key)))}])),ranking=eligible.map(r=>({id:r.id,score:active.reduce((sum,[key,weight])=>{const b=ranges[key];return sum+weight/weightSum*(b.max===b.min?0:(value(r,key)-b.min)/(b.max-b.min));},0),metrics:Object.fromEntries(active.map(([key])=>[key,value(r,key)]))})).sort((a,b)=>a.score-b.score||results.findIndex(r=>r.id===a.id)-results.findIndex(r=>r.id===b.id));
  return {status:'ranked',mode,recommendedId:ranking[0].id,ranking,weights:selected,normalization:'min-max across complete tested candidates; equal values normalize to0',ranges,scope:'best among generated checked corridors/speed scenarios; not a global maritime optimum',researchScenario:true,navigationCleared:false};
}
export function compareResearchScenarios(baseline,candidate,{annual=null}={}){
  if(baseline?.status!=='computed'||candidate?.status!=='computed')return {status:'blocked',reason:'two_complete_scenarios_required'};
  if(baseline.provenance.comparisonKey!==candidate.provenance.comparisonKey||baseline.profileId!==candidate.profileId||baseline.scope!==candidate.scope)return {status:'blocked',reason:'scenario_conditions_differ'};
  if(JSON.stringify([baseline.route.coordinates[0],baseline.route.coordinates.at(-1)])!==JSON.stringify([candidate.route.coordinates[0],candidate.route.coordinates.at(-1)]))return {status:'blocked',reason:'route_endpoints_differ'};
  if(baseline.route.topologySha256!==candidate.route.topologySha256)return {status:'blocked',reason:'route_constraints_differ'};
  const costs=baseline.economics.currency===candidate.economics.currency?metricChange(baseline.economics.amount,candidate.economics.amount):metricChange(null,null),fuelPrice=baseline.fuelCost.currency===candidate.fuelCost.currency?metricChange(baseline.fuelCost.amount,candidate.fuelCost.amount):metricChange(null,null);
  return {status:'compared',scope:'research_scenarios; cartographic-mask-only; not verified voyage claims',fuel:metricChange(baseline.totals.fuelKg,candidate.totals.fuelKg),co2:metricChange(baseline.totals.co2Kg,candidate.totals.co2Kg),time:metricChange(baseline.totals.durationHours,candidate.totals.durationHours),distance:metricChange(baseline.totals.distanceNM,candidate.totals.distanceNM),fuelCost:fuelPrice,netVoyageBenefit:costs,currency:baseline.economics.currency||null,annual:annual?annualizedBenefit(costs.benefit,annual):{status:'unavailable',value:null},sensitivity:financialSensitivity({baseline:{fuelCost:baseline.fuelCost,...baseline.totals,scope:baseline.scope},candidate:{fuelCost:candidate.fuelCost,...candidate.totals,scope:candidate.scope},settings:baseline.provenance.inputs.economics}),navigationCleared:false};
}
