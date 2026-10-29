import {FUEL_FACTORS} from './fuelFactors.mjs';
export const clone=value=>JSON.parse(JSON.stringify(value));
export const finite=value=>typeof value==='number'&&Number.isFinite(value);
const text=value=>typeof value==='string'?value.trim():'';
const newId=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():'wa-fuel-'+Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
export function validCalendarDate(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split('-').map(Number),date=new Date(0);date.setUTCFullYear(y,m-1,d);return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;}
export function validateProfile(p){
  const errors=[];const need=(ok,field,code='required')=>{if(!ok)errors.push({field,code});};
  need(p&&typeof p==='object','profile');if(!p)return errors;
  need(text(p.name).length>0&&text(p.name).length<=100,'name');need(text(p.vesselType),'vesselType');
  need(text(p.propulsion),'propulsion');need(text(p.engineType),'engineType');
  for(const key of ['nominalPowerKw','referenceSpeedKnots','plannedSpeedKnots','maxSpeedKnots'])need(finite(p[key])&&p[key]>0,key,'positive_required');
  need(finite(p.referenceLoad)&&p.referenceLoad>0&&p.referenceLoad<=1,'referenceLoad','load_range');
  need(Object.hasOwn(FUEL_FACTORS,p.fuelId),'fuelId','unknown_fuel');
  need(['constant','imo-normalized','manufacturer-curve'].includes(p.sfocMode),'sfocMode');
  if(p.sfocMode!=='manufacturer-curve'){
    need(finite(p.sfocGPerKwh)&&p.sfocGPerKwh>0,'sfocGPerKwh','positive_required');
    if(p.sfocMode==='imo-normalized'||p.sfocReferenceLoad!=null)need(finite(p.sfocReferenceLoad)&&p.sfocReferenceLoad>0&&p.sfocReferenceLoad<=1,'sfocReferenceLoad','load_range');
  }else{
    need(text(p.curveSource),'curveSource','curve_source_required');
    need(Array.isArray(p.sfocCurve)&&p.sfocCurve.length>=2,'sfocCurve','curve_required');
    if(Array.isArray(p.sfocCurve))for(let i=0;i<p.sfocCurve.length;i++){
      const point=p.sfocCurve[i];need(point&&finite(point.load)&&point.load>0&&point.load<=1&&finite(point.sfocGPerKwh)&&point.sfocGPerKwh>0&&(!i||point.load>p.sfocCurve[i-1]?.load),'sfocCurve','invalid_curve');
    }
  }
  if(finite(p.plannedSpeedKnots)&&finite(p.maxSpeedKnots))need(p.plannedSpeedKnots<=p.maxSpeedKnots,'plannedSpeedKnots','max_speed');
  if(finite(p.referenceSpeedKnots)&&finite(p.maxSpeedKnots))need(p.referenceSpeedKnots<=p.maxSpeedKnots,'referenceSpeedKnots','max_speed');
  if(p.imoNumber)need(/^\d{7}$/.test(p.imoNumber)&&[...p.imoNumber.slice(0,6)].reduce((s,n,i)=>s+Number(n)*(7-i),0)%10===Number(p.imoNumber[6]),'imoNumber','invalid_imo');
  need(['unknown','defined','none-confirmed'].includes(p.auxiliary?.mode),'auxiliary','auxiliary_mode');
  if(p.auxiliary?.mode==='defined'){
    const a=p.auxiliary;for(const key of ['nominalPowerKw','sfocGPerKwh'])need(finite(a[key])&&a[key]>0,'auxiliary.'+key,'positive_required');
    need(finite(a.load)&&a.load>=0&&a.load<=1,'auxiliary.load','load_range');need(Object.hasOwn(FUEL_FACTORS,a.fuelId),'auxiliary.fuelId','unknown_fuel');
  }
  if(p.draftMetres!=null)need(finite(p.draftMetres)&&p.draftMetres>0,'draftMetres','positive_required');
  for(const key of ['minimumSpeedKnots','lengthMeters'])if(p[key]!=null)need(finite(p[key])&&p[key]>0,key,'positive_required');
  if(p.minimumSpeedKnots!=null)need(p.minimumSpeedKnots<=p.plannedSpeedKnots&&p.minimumSpeedKnots<=p.maxSpeedKnots,'minimumSpeedKnots','max_speed');
  if(p.noise!=null)need(typeof p.noise.vesselClass==='string'&&typeof p.noise.scenarioAcknowledged==='boolean','noise','invalid_quality');
  const priced=new Set();
  need(p.prices==null||Array.isArray(p.prices),'prices','invalid_price');
  for(const price of Array.isArray(p.prices)?p.prices:[]){
    if(!price||typeof price!=='object'){need(false,'prices','invalid_price');continue;}
    need(Object.hasOwn(FUEL_FACTORS,price.fuelId)&&!priced.has(price.fuelId),'prices','invalid_price');priced.add(price.fuelId);
    need(finite(price.perTonne)&&price.perTonne>=0&&/^[A-Z]{3}$/.test(price.currency||'')&&validCalendarDate(price.date),'prices','invalid_price');
  }
  if(p.fieldQuality)for(const q of Object.values(p.fieldQuality)){need(['user-entered','verified-technical','literature-assumption','algorithm-calculated','missing'].includes(q?.kind),'fieldQuality','invalid_quality');if(q?.kind==='verified-technical')need(text(q.source),'fieldQuality','technical_source_required');}
  return errors;
}
export function profileSuitability(p){
  const issues=validateProfile(p);if(issues.length)return issues;
  if(p.propulsion!=='conventional-diesel'||!['slow-speed-diesel','medium-speed-diesel','high-speed-diesel'].includes(p.engineType)||p.displacementModelConfirmed!==true)issues.push({field:'propulsion',code:'unsupported_propulsion'});
  if(!FUEL_FACTORS[p.fuelId].consumptionSupported||(p.auxiliary.mode==='defined'&&!FUEL_FACTORS[p.auxiliary.fuelId].consumptionSupported))issues.push({field:'fuelId',code:'unsupported_fuel_model'});
  return issues;
}
export function profileQualities(p){
  const fields=['name','vesselType','manufacturerModel','imoNumber','propulsion','engineType','nominalPowerKw','referenceSpeedKnots','referenceLoad','sfocGPerKwh','sfocReferenceLoad','fuelId','plannedSpeedKnots','maxSpeedKnots','draftMetres','minimumSpeedKnots','lengthMeters','noise','loadingCondition','auxiliary','prices','sfocCurve','curveSource','consumptionRecords'];
  const qualities=Object.fromEntries(fields.map(key=>[key,p.fieldQuality?.[key]||{kind:p[key]==null||p[key]===''?'missing':'user-entered',source:p.technicalSource||null}]));
  for(const key of ['mode','nominalPowerKw','sfocGPerKwh','load','fuelId'])qualities['auxiliary.'+key]=p.fieldQuality?.['auxiliary.'+key]||(p.auxiliary?.[key]==null?{kind:'missing',source:null}:qualities.auxiliary);
  for(const price of p.prices||[])for(const key of ['perTonne','currency','date'])qualities['prices.'+price.fuelId+'.'+key]=p.fieldQuality?.['prices.'+price.fuelId+'.'+key]||{kind:'user-entered',source:null};
  return qualities;
}
export class VesselProfileRepository{
  constructor(storage,{key='w-alerter.fuel-carbon.v1',clock=()=>new Date().toISOString(),id=newId}={}){this.storage=storage;this.key=key;this.clock=clock;this.id=id;this.listeners=new Set();this.loadError=null;this.data={version:1,profiles:[],selectedId:null,settings:{},calculations:[]};try{const raw=storage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(parsed.version!==1||!Array.isArray(parsed.profiles)||!Array.isArray(parsed.calculations)||!parsed.settings||typeof parsed.settings!=='object'||!parsed.profiles.every(p=>typeof p.id==='string'&&Array.isArray(p.versions)&&p.versions.length&&p.versions.every(v=>!validateProfile(v).length&&v.id===p.id&&Number.isInteger(v.version)&&v.version>0)))throw Error('damaged_fuel_storage');this.data=parsed;}}catch(error){this.loadError=error.message;}}
  snapshot(){return clone(this.data);}
  list(){return this.data.profiles.filter(p=>!p.deleted).map(p=>clone(p.versions.at(-1)));}
  selected(){return this.list().find(p=>p.id===this.data.selectedId)||null;}
  subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  write(next){if(this.loadError)throw Error('damaged_fuel_storage');this.storage.setItem(this.key,JSON.stringify(next));this.data=next;for(const fn of this.listeners)fn();}
  save(input){const errors=validateProfile(input);if(errors.length){const e=Error('invalid_profile');e.issues=errors;throw e;}const data=this.snapshot(),id=input.id||this.id(),record=data.profiles.find(p=>p.id===id),previous=record?.versions.at(-1);if(input.id&&!record)throw Error('profile_missing');const saved={...clone(input),id,version:(previous?.version||0)+1,updatedAt:this.clock(),fieldQuality:profileQualities(input)};if(record){record.versions.push(saved);record.deleted=false;}else data.profiles.push({id,deleted:false,versions:[saved]});data.selectedId=id;this.write(data);return clone(saved);}
  select(id){if(!this.list().some(p=>p.id===id))throw Error('profile_missing');const data=this.snapshot();data.selectedId=id;this.write(data);}
  remove(id){const data=this.snapshot(),record=data.profiles.find(p=>p.id===id);if(!record)throw Error('profile_missing');record.deleted=true;if(data.selectedId===id)data.selectedId=data.profiles.find(p=>!p.deleted)?.id||null;this.write(data);}
  restore(id){const data=this.snapshot(),record=data.profiles.find(p=>p.id===id);if(!record)throw Error('profile_missing');record.deleted=false;this.write(data);}
  settings(patch){const data=this.snapshot();data.settings={...data.settings,...clone(patch)};this.write(data);}
  saveCalculation(result){const data=this.snapshot(),saved={id:this.id(),savedAt:this.clock(),...clone(result)};data.calculations.unshift(saved);this.write(data);return clone(saved);}
}
