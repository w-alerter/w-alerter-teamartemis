import {profileSuitability,finite,clone} from './vesselProfile.mjs';
import {mainEnginePerformance} from './enginePerformance.mjs';
import {normalizeSegments,routeEndpoints,validIso} from './voyageSegments.mjs';
import {carbonEmissions} from './carbonEmissions.mjs';
import {fuelCost} from './economicComparison.mjs';
import {calculationProvenance} from './calculationProvenance.mjs';
import {kgToTonnes} from './fuelFactors.mjs';
export function fuelMassKg(powerKw,sfocGPerKwh,hours){if(![powerKw,sfocGPerKwh,hours].every(finite)||powerKw<0||sfocGPerKwh<=0||hours<0)throw Error('invalid_consumption_inputs');const value=powerKw*sfocGPerKwh*hours/1000;if(!finite(value))throw Error('calculation_overflow');return value;}
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
export async function evaluateVoyage({profile,route,departureIso,preferredSpeedKnots,arrivalTargetIso=null},options={}){
  const issues=profileSuitability(profile);if(issues.length)return {status:'blocked',issues};
  const warnings=new Set(['calm_water_estimate','regulations_not_independently_verified']);
  if(profile.auxiliary.mode==='unknown')warnings.add('auxiliary_missing');
  if(profile.sfocMode==='constant')warnings.add('constant_sfoc');
  if(profile.sfocMode==='constant'&&profile.sfocReferenceLoad==null)warnings.add('sfoc_reference_load_missing');
  if(profile.draftMetres!=null||profile.loadingCondition)warnings.add('loading_not_modelled');
  if(profile.consumptionRecords)warnings.add('records_not_calibrated');
  try{
    if(arrivalTargetIso!=null&&(!validIso(arrivalTargetIso)||Date.parse(arrivalTargetIso)<=Date.parse(departureIso)))throw Error('invalid_arrival_target');
    const settings={departureIso,preferredSpeedKnots,arrivalTargetIso},segments=normalizeSegments(route,settings),fuelById={},rows=[];
    for(const segment of segments){
      const performance=segment.type==='wait'?{powerKw:0,load:0,sfocGPerKwh:null}:mainEnginePerformance(profile,segment.speedKnots),mainFuelKg=segment.type==='wait'?0:fuelMassKg(performance.powerKw,performance.sfocGPerKwh,segment.durationHours);
      let auxiliaryFuelKg=null,auxiliaryPowerKw=null;
      if(profile.auxiliary.mode==='defined'){
        if(segment.type==='wait'&&segment.auxiliaryLoad==null)throw Error('waiting_auxiliary_load_required');
        auxiliaryPowerKw=profile.auxiliary.nominalPowerKw*(segment.auxiliaryLoad??profile.auxiliary.load);auxiliaryFuelKg=fuelMassKg(auxiliaryPowerKw,profile.auxiliary.sfocGPerKwh,segment.durationHours);
      }else if(profile.auxiliary.mode==='none-confirmed'){auxiliaryFuelKg=0;auxiliaryPowerKw=0;}
      fuelById[profile.fuelId]=(fuelById[profile.fuelId]??0)+mainFuelKg;
      if(auxiliaryFuelKg!=null&&profile.auxiliary.mode==='defined')fuelById[profile.auxiliary.fuelId]=(fuelById[profile.auxiliary.fuelId]??0)+auxiliaryFuelKg;
      const segmentFuel={[profile.fuelId]:mainFuelKg};if(profile.auxiliary.mode==='defined')segmentFuel[profile.auxiliary.fuelId]=(segmentFuel[profile.auxiliary.fuelId]??0)+auxiliaryFuelKg;
      if(segment.type==='sailing'&&segment.speedLimitKnots==null)warnings.add('speed_limits_unknown');
      rows.push({...segment,...performance,mainFuelKg,auxiliaryFuelKg,auxiliaryPowerKw,fuelKg:mainFuelKg+(auxiliaryFuelKg??0),co2Kg:sum(carbonEmissions(segmentFuel))});
    }
    const fuelKg=sum(fuelById),co2ByFuel=carbonEmissions(fuelById),co2Kg=sum(co2ByFuel),durationHours=rows.reduce((s,r)=>s+r.durationHours,0),distance=rows.reduce((s,r)=>s+r.distanceNm,0),sailingHours=rows.filter(s=>s.type==='sailing').reduce((s,r)=>s+r.durationHours,0),etaIso=rows.at(-1).endIso;
    const cost=fuelCost(fuelById,profile.prices);if(cost.reason)warnings.add(cost.reason);if(cost.priceDates?.some(d=>d!==departureIso.slice(0,10)))warnings.add('fuel_price_date_differs');
    const provenance=await calculationProvenance(profile,route,settings,options),scope=profile.auxiliary.mode==='unknown'?'main-engine-only':'main-and-declared-auxiliary';
    const totals={fuelKg,fuelTonnes:kgToTonnes(fuelKg),wholeVesselFuelKg:null,co2Kg,co2Tonnes:kgToTonnes(co2Kg),durationHours,distanceNm:distance,sailingHours,meanSpeedKnots:distance/durationHours,meanSailingSpeedKnots:sailingHours?distance/sailingHours:null,fuelKgPerHour:fuelKg/durationHours,co2KgPerHour:co2Kg/durationHours,fuelKgPerNm:distance>0?fuelKg/distance:null,co2KgPerNm:distance>0?co2Kg/distance:null,etaIso,arrivalTargetMet:arrivalTargetIso?Date.parse(etaIso)<=Date.parse(arrivalTargetIso):null};
    if(Object.values(totals).some(v=>typeof v==='number'&&!finite(v)))throw Error('calculation_overflow');
    return {status:'computed',scope,route:clone(route),endpoints:routeEndpoints(route),profileId:profile.id||null,profileVersion:profile.version||null,totals,fuelById,co2ByFuel,cost,segments:rows,warnings:[...warnings],provenance,comparisonKey:provenance.comparisonKey};
  }catch(error){return {status:'blocked',issues:[{field:'voyage',code:error.message}]};}
}
