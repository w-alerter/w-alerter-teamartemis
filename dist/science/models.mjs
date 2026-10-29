import {SPECIES,ROUTING_FACTORS} from './catalog.mjs';
import {compatibility} from './validation.mjs';
const cited=m=>m&&typeof m.version==='string'&&m.version.trim()&&typeof m.citation==='string'&&m.citation.trim()&&typeof m.validationReference==='string'&&m.validationReference.trim();

export class SpeciesModels {
  constructor({environmentalDataService=null,observationDataService=null}={}){this.methods=new Map();this.environmentalDataService=environmentalDataService;this.observationDataService=observationDataService;}
  async observationInputs(speciesId,filters={}){
    if(!SPECIES.some(s=>s.id===speciesId))throw new Error('unknown_species');
    if(!this.observationDataService)throw new Error('observation_service_unavailable');
    return this.observationDataService.query({...filters,speciesId});
  }
  async environmentalInputs(speciesId,{latitude,longitude,date},variables=['sst'],options={}){
    if(!SPECIES.some(s=>s.id===speciesId))throw new Error('unknown_species');
    if(!this.environmentalDataService)throw new Error('environmental_service_unavailable');
    return Object.fromEntries(await Promise.all(variables.map(async variable=>[variable,await this.environmentalDataService.getEnvironmentalValue(variable,latitude,longitude,date,{...options,...options.byVariable?.[variable]})])));
  }
  register(spec){
    if(!SPECIES.some(s=>s.id===spec?.speciesId)||!cited(spec)||!Array.isArray(spec.requiredKinds)||!spec.requiredKinds.length||typeof spec.evaluate!=='function')throw new Error('An exact species, documented requirements and validated method are required');
    if(this.methods.has(spec.speciesId))throw new Error('A method already exists for this species; version it explicitly');
    this.methods.set(spec.speciesId,Object.freeze({...spec,requiredKinds:[...spec.requiredKinds]}));
  }
  readiness(speciesId,{datasets=[],query=null,reviewedDatasetIds=[]}={}){
    const species=SPECIES.find(s=>s.id===speciesId),method=this.methods.get(speciesId),reasons=[];
    if(!species)return {status:'blocked',reasons:['unknown_species']};
    if(!method)reasons.push('validated_species_method_missing');
    if(!query)reasons.push('explicit_spatial_and_temporal_query_required');
    for(const kind of method?.requiredKinds||species.requiredKinds){
      const matches=datasets.filter(d=>d.metadata?.kind===kind);
      if(!matches.length){reasons.push('missing_'+kind);continue;}
      const eligible=matches.filter(d=>reviewedDatasetIds.includes(d.metadata.id)&&compatibility(d,query).status==='overlap'&&(kind!=='observations'||d.metadata.taxa.includes(species.scientificName))&&hasMeasuredValues(d));
      if(!eligible.length)reasons.push('reviewed_compatible_'+kind+'_required');
    }
    return {status:reasons.length?'blocked':'ready',reasons};
  }
  evaluate(speciesId,context){const ready=this.readiness(speciesId,context);if(ready.status!=='ready')return {...ready,result:null};return {status:'computed',methodVersion:this.methods.get(speciesId).version,result:this.methods.get(speciesId).evaluate(this.environmentalDataService?{...context,environmentalDataService:this.environmentalDataService}:context)};}
}
function hasMeasuredValues(d){const rows=d.representation==='points'?d.records:d.data?.features?.map(f=>f.properties);return Array.isArray(rows)&&rows.some(r=>Object.values(r.values||{}).some(v=>typeof v==='number'&&Number.isFinite(v)));}

export class RoutingEngines {
  constructor(){this.engines=new Map();this.costTerms=new Map();this.planListeners=new Set();}
  subscribe(fn){this.planListeners.add(fn);return()=>this.planListeners.delete(fn);}
  register(spec){if(!spec?.id||!spec.version||!spec.provenance||typeof spec.plan!=='function')throw new Error('Routing engine provenance and implementation are required');if(this.engines.has(spec.id))throw new Error('Engine already registered');this.engines.set(spec.id,Object.freeze({...spec}));}
  registerCostTerm(spec){if(!ROUTING_FACTORS.some(f=>f.id===spec?.id)||!cited(spec)||!spec.units||typeof spec.evaluate!=='function')throw new Error('A validated method, units and implementation are required for each cost term');if(this.costTerms.has(spec.id))throw new Error('Cost term already registered');this.costTerms.set(spec.id,Object.freeze({...spec}));}
  hydraReadiness(){return {status:this.engines.has('hydra')&&ROUTING_FACTORS.every(f=>this.costTerms.has(f.id))?'ready':'blocked',engineAvailable:this.engines.has('hydra'),missingFactors:ROUTING_FACTORS.filter(f=>!this.costTerms.has(f.id)).map(f=>f.id)};}
  plan(id,context){
    const engine=this.engines.get(id);if(!engine)return {status:'blocked',result:null,reasons:['routing_engine_missing']};
    if(id==='hydra'&&(this.hydraReadiness().status!=='ready'||context?.scientificReviewApproved!==true))return {status:'blocked',result:null,reasons:['validated_costs_and_review_required']};
    const publish=result=>{const output={status:'computed',engineVersion:engine.version,result};for(const fn of this.planListeners){try{fn({id,engineVersion:engine.version,provenance:engine.provenance,context,output});}catch{ /* Observers must not change routing behavior. */ }}return output;};
    const result=engine.plan(context);return result&&typeof result.then==='function'?result.then(publish):publish(result);
  }
}
