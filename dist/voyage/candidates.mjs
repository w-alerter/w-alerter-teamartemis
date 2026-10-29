import {halfDistancePoint,wrapLongitude} from './geometry.mjs';
export class CandidateRoutePlanner{
  constructor({workerFactory=()=>new Worker(new URL('../routing/worker.mjs',import.meta.url),{type:'module'})}={}){this.workerFactory=workerFactory;this.active=new Set();}
  cancel(){for(const task of this.active){task.worker.terminate();task.reject(Error('analysis_cancelled'));}this.active.clear();}
  plan(points,signal){return new Promise((resolve,reject)=>{if(signal?.aborted)return reject(Error('analysis_cancelled'));const worker=this.workerFactory(),task={worker,reject},clean=()=>{worker.terminate();this.active.delete(task);signal?.removeEventListener('abort',abort);},abort=()=>{clean();reject(Error('analysis_cancelled'));};this.active.add(task);signal?.addEventListener('abort',abort,{once:true});worker.onmessage=e=>{clean();e.data.ok?resolve(e.data.result):reject(Error(e.data.error));};worker.onerror=()=>{clean();reject(Error('routing_worker_failed'));};worker.postMessage({points});});}
  async alternatives(baseline,{includeAlternatives=true,signal=null,onProgress=()=>{}}={}){
    const output=[{...structuredClone(baseline),id:'baseline',name:'baseline'}],skipped=[];if(!includeAlternatives)return {routes:output,skipped};
    if(baseline.inputWaypoints.length>=50)return {routes:output,skipped:[{id:'corridors',reason:'maximum_mandatory_waypoints'}]};
    const leg=baseline.legs.reduce((a,b)=>a.distanceNM>=b.distanceNM?a:b),midpoint=halfDistancePoint(leg.coordinates),points=baseline.inputWaypoints.map(([lon,lat])=>({lat,lon}));
    for(const [id,offset]of [['north-corridor',.6],['south-corridor',-.6]]){
      if(signal?.aborted)throw Error('analysis_cancelled');onProgress({stage:id});const via={lon:wrapLongitude(midpoint[0]),lat:midpoint[1]+offset};if(Math.abs(via.lat)>=85){skipped.push({id,reason:'outside_topology'});continue;}
      const input=[...points.slice(0,leg.toIndex),via,...points.slice(leg.toIndex)],r=await this.plan(input,signal);if(r.status==='found'){const same=output.some(v=>JSON.stringify(v.coordinates)===JSON.stringify(r.coordinates));if(!same)output.push({...r,id,name:id});else skipped.push({id,reason:'duplicate_checked_geometry'});}else skipped.push({id,reason:r.status});
    }
    return {routes:output,skipped,method:'same mandatory waypoints; one via ±0.6° latitude around the midpoint of the longest baseline leg; each candidate independently checked with the same mask; finite candidate search, not global multiobjective A*'};
  }
}
