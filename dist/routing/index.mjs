import {ENGINE_VERSION} from './astar.mjs';
let worker=null,rejectPending=null;
function cancel(){worker?.terminate();worker=null;if(rejectPending){rejectPending(Error('route_cancelled'));rejectPending=null;}}
export function plan(points){cancel();return new Promise((resolve,reject)=>{worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});rejectPending=reject;worker.onmessage=e=>{const result=e.data;worker?.terminate();worker=null;rejectPending=null;result.ok?resolve(result.result):reject(Error(result.error));};worker.onerror=()=>{worker?.terminate();worker=null;rejectPending=null;reject(Error('routing_worker_failed'));};worker.postMessage({points:points.map(p=>({lat:p.lat,lon:p.lon}))});});}
window.WARouting=Object.freeze({plan,cancel,version:ENGINE_VERSION,objective:'distance_only'});

const updateLabels=()=>document.querySelectorAll('[data-route-label]').forEach(e=>e.textContent=window.WARouteText(e.dataset.routeLabel));updateLabels();window.addEventListener('languagechange',updateLabels);
