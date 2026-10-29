/* User-declared scenario economics; no live prices, exchange rates or company profit. */
const finite=n=>typeof n==='number'&&Number.isFinite(n);
export function metricChange(baseline,candidate){if(!finite(baseline)||!finite(candidate))return {baseline:baseline??null,candidate:candidate??null,difference:null,benefit:null,reductionPercent:null};return {baseline,candidate,difference:candidate-baseline,benefit:baseline-candidate,reductionPercent:baseline===0?null:100*(baseline-candidate)/baseline};}
export function voyageEconomics({fuelCost,durationHours,co2Kg,scope},{currency=null,dailyNonFuelRate=null,rateExcludesFuelAndFees=false,fees=[],carbonScenarioPerTonne=null,annual=null}={}){
  if(!finite(durationHours)||durationHours<=0||!finite(co2Kg)||co2Kg<0)return {status:'unavailable',reason:'operational_result_missing',amount:null};
  if(!Array.isArray(fees)||fees.some(f=>!finite(f.amount)||f.amount<0||!f.category||!f.source||!/^[A-Z]{3}$/.test(f.currency||'')))return {status:'unavailable',reason:'invalid_declared_cost',amount:null};
  if(dailyNonFuelRate!==null&&(!finite(dailyNonFuelRate)||dailyNonFuelRate<0||!rateExcludesFuelAndFees))return {status:'unavailable',reason:'nonfuel_rate_scope_required',amount:null};
  if(carbonScenarioPerTonne!==null&&(!finite(carbonScenarioPerTonne)||carbonScenarioPerTonne<0))return {status:'unavailable',reason:'invalid_declared_cost',amount:null};
  const selectedCurrency=currency||fuelCost?.currency;if(!/^[A-Z]{3}$/.test(selectedCurrency||''))return {status:'unavailable',reason:'currency_required',amount:null};
  if(fuelCost?.currency&&fuelCost.currency!==selectedCurrency||fees.some(f=>f.currency!==selectedCurrency))return {status:'unavailable',reason:'mixed_currencies',amount:null};
  if(fuelCost?.amount==null)return {status:'unavailable',reason:fuelCost?.reason||'fuel_price_missing',amount:null,currency:selectedCurrency};
  const timeCost=dailyNonFuelRate===null?null:durationHours/24*dailyNonFuelRate,feeCost=fees.reduce((n,f)=>n+f.amount,0),carbonCost=carbonScenarioPerTonne===null?null:co2Kg/1000*carbonScenarioPerTonne,amount=fuelCost.amount+(timeCost??0)+feeCost+(carbonCost??0);
  if(!finite(amount))return {status:'unavailable',reason:'calculation_overflow',amount:null};
  return {status:'computed',amount,currency:selectedCurrency,fuelCost:fuelCost.amount,timeCost,feeCost,fees:structuredClone(fees),carbonScenarioCost:carbonCost,omittedComponents:[...(timeCost===null?['nonfuel_time_cost']:[]),...(!fees.length?['port_canal_other_fees']:[]),...(carbonCost===null?['carbon_scenario']:[])],scope:scope==='main-engine-only'?'declared_costs_main_engine_fuel_only':'declared_costs_only',annual,interpretation:'estimated_declared_voyage_cost_not_profit_or_revenue'};
}
export function annualizedBenefit(benefit,{voyagesPerVessel,fleetSize,utilization=null,countBasis='completed-or-planned'}={}){
  if(!finite(benefit)||!finite(voyagesPerVessel)||voyagesPerVessel<0||!Number.isInteger(fleetSize)||fleetSize<1)return {status:'unavailable',value:null,reason:'annual_inputs_required'};
  if(!['completed-or-planned','theoretical-capacity'].includes(countBasis))return {status:'unavailable',value:null,reason:'annual_count_basis_required'};
  if(countBasis==='completed-or-planned'&&utilization!==null)return {status:'unavailable',value:null,reason:'utilization_already_in_voyage_count'};
  if(countBasis==='theoretical-capacity'&&(!finite(utilization)||utilization<0||utilization>1))return {status:'unavailable',value:null,reason:'utilization_required'};
  const voyageEquivalent=voyagesPerVessel*fleetSize*(countBasis==='theoretical-capacity'?utilization:1),value=benefit*voyageEquivalent;if(!finite(value))return {status:'unavailable',value:null,reason:'calculation_overflow'};
  return {status:'projected',value,voyageEquivalent,inputs:{voyagesPerVessel,fleetSize,utilization,countBasis},assumption:'identical comparable voyages and unchanged prices/conditions; not realized earnings'};
}
export function financialSensitivity({baseline,candidate,settings},multipliers=[.8,1,1.2]){
  if(!Array.isArray(multipliers)||multipliers.some(v=>!finite(v)||v<0||v>10))throw Error('invalid_sensitivity_scenarios');
  return multipliers.map(multiplier=>{const cost=r=>voyageEconomics({...r,fuelCost:{...r.fuelCost,amount:r.fuelCost?.amount==null?null:r.fuelCost.amount*multiplier}},settings),a=cost(baseline),b=cost(candidate);return {fuelPriceMultiplier:multiplier,status:a.status==='computed'&&b.status==='computed'?'scenario':'unavailable',benefit:a.amount==null||b.amount==null?null:a.amount-b.amount,currency:a.currency||b.currency||null,scope:'fuel-price-only sensitivity; all other declared inputs held fixed'};});
}
