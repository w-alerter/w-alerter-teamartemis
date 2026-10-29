import {evaluateVoyage} from './fuelConsumption.mjs';
import {compareVoyages} from './economicComparison.mjs';
import {clone} from './vesselProfile.mjs';
export class FuelAnalysisController{
  constructor({evaluate=evaluateVoyage,onChange=()=>{}}={}){this.evaluate=evaluate;this.onChange=onChange;this.generation=0;this.state={status:'empty',reference:null,hydra:null,comparison:{status:'blocked',reason:'two_routes_required'}};}
  invalidate(reason='inputs_changed'){++this.generation;this.state={status:'blocked',reason,reference:null,hydra:null,comparison:{status:'blocked',reason}};this.onChange(this.state);}
  async update(inputs){const generation=++this.generation;this.state={status:'calculating',reference:null,hydra:null,comparison:{status:'blocked',reason:'calculating'}};this.onChange(this.state);const snapshot=clone(inputs);try{const common={profile:snapshot.profile,departureIso:snapshot.departureIso,preferredSpeedKnots:snapshot.preferredSpeedKnots,arrivalTargetIso:snapshot.arrivalTargetIso||null};const [reference,hydra]=await Promise.all([snapshot.reference?this.evaluate({...common,route:snapshot.reference}):null,snapshot.hydra?this.evaluate({...common,route:snapshot.hydra}):null]);if(generation!==this.generation)return {discarded:true};this.state={status:'settled',reference,hydra,comparison:compareVoyages(reference,hydra)};}catch(error){if(generation!==this.generation)return {discarded:true};this.state={status:'blocked',reason:error.message,reference:null,hydra:null,comparison:{status:'blocked',reason:error.message}};}this.onChange(this.state);return this.state;}
}
