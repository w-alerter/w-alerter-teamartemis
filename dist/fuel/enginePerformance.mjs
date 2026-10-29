import {ENGINE_MODEL} from './fuelFactors.mjs';
import {finite} from './vesselProfile.mjs';
export function loadCorrection(load){if(!finite(load)||load<0||load>1)throw Error('load_range');return ENGINE_MODEL.sfocQuadratic*load**2+ENGINE_MODEL.sfocLinear*load+ENGINE_MODEL.sfocConstant;}
export function mainEnginePerformance(profile,speedKnots){
  if(!finite(speedKnots)||speedKnots<=0)throw Error('invalid_speed');
  if(speedKnots>profile.maxSpeedKnots)throw Error('max_speed');
  const referencePowerKw=profile.nominalPowerKw*profile.referenceLoad,powerKw=referencePowerKw*(speedKnots/profile.referenceSpeedKnots)**ENGINE_MODEL.powerExponent,load=powerKw/profile.nominalPowerKw;
  if(!finite(powerKw)||load>ENGINE_MODEL.maximumLoad+1e-12)throw Error('engine_capacity');
  if(load<ENGINE_MODEL.minimumGenericLoad&&profile.sfocMode!=='manufacturer-curve')throw Error('low_load_model_missing');
  if(profile.sfocMode==='imo-normalized'&&profile.sfocReferenceLoad<ENGINE_MODEL.minimumGenericLoad)throw Error('low_load_model_missing');
  let sfocGPerKwh;
  if(profile.sfocMode==='manufacturer-curve'){
    const curve=profile.sfocCurve;if(load<curve[0].load-1e-12||load>curve.at(-1).load+1e-12)throw Error('outside_sfoc_curve');
    const point=curve.find(p=>Math.abs(p.load-load)<1e-12);
    if(point)sfocGPerKwh=point.sfocGPerKwh;else{const i=curve.findIndex(p=>p.load>load),a=curve[i-1],b=curve[i];sfocGPerKwh=a.sfocGPerKwh+(b.sfocGPerKwh-a.sfocGPerKwh)*(load-a.load)/(b.load-a.load);}
  }else if(profile.sfocMode==='imo-normalized')sfocGPerKwh=profile.sfocGPerKwh*loadCorrection(load)/loadCorrection(profile.sfocReferenceLoad);
  else sfocGPerKwh=profile.sfocGPerKwh;
  if(!finite(sfocGPerKwh)||sfocGPerKwh<=0)throw Error('invalid_sfoc');
  return {referencePowerKw,powerKw,load,sfocGPerKwh};
}
