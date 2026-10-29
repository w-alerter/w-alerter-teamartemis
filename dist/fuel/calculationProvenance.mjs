import {ENGINE_MODEL,FACTOR_VERSION,SOURCES,FUEL_FACTORS} from './fuelFactors.mjs';
import {profileQualities,clone} from './vesselProfile.mjs';
import {sha256 as hashBytes} from '../science/pipeline.mjs';
export function canonical(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';}
export async function sha256(value){return hashBytes(new TextEncoder().encode(canonical(value)));}
export async function calculationProvenance(profile,route,settings,{clock=()=>new Date().toISOString()}={}){
  const inputs={profile:clone(profile),route:clone(route),settings:clone(settings)},comparisonInputs={profile:clone(profile),settings:clone(settings),modelVersion:ENGINE_MODEL.version,factorVersion:FACTOR_VERSION};
  return {calculatedAt:clock(),model:{id:ENGINE_MODEL.id,version:ENGINE_MODEL.version},factorVersion:FACTOR_VERSION,sources:clone(SOURCES),factors:clone(FUEL_FACTORS),inputs,profileVersion:profile.version||null,fieldQuality:profileQualities(profile),routeQuality:['hydra-engine','geometric-astar-reference'].includes(route.source.kind)?'algorithm-calculated':'user-entered',outputQuality:'algorithm-calculated',estimateLevel:'uncalibrated-calm-water-estimate',inputSha256:await sha256(inputs),comparisonKey:await sha256(comparisonInputs),assumptions:['calm-water','no-currents-wind-waves','reference-hull-and-loading','no-boilers-or-other-hotel-loads','direct-combustion-co2-only','no-lifecycle-or-methane-slip','fuel-cost-only','no-independent-route-feasibility-validation']};
}
