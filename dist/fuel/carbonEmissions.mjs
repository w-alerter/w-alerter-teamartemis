import {fuelFactor} from './fuelFactors.mjs';
export function carbonEmissions(fuelById){return Object.fromEntries(Object.entries(fuelById).map(([id,kg])=>{if(typeof kg!=='number'||!Number.isFinite(kg)||kg<0)throw Error('invalid_fuel_mass');return [id,kg*fuelFactor(id).kgCO2PerKg];}));}
