import {clone,finite,validCalendarDate} from './vesselProfile.mjs';
/* Same spherical radius as the preserved waypoint planner; no silent geometry replacement. */
export const DISTANCE_METHOD=Object.freeze({id:'haversine',radiusNm:3440,version:'legacy-radius-v1'});
export function distanceNm(a,b){const r=Math.PI/180,dl=(b[1]-a[1])*r,dn=(b[0]-a[0])*r,q=Math.sin(dl/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dn/2)**2;return DISTANCE_METHOD.radiusNm*2*Math.atan2(Math.sqrt(Math.min(1,q)),Math.sqrt(Math.max(0,1-q)));}
export const validCoordinate=c=>Array.isArray(c)&&c.length===2&&finite(c[0])&&finite(c[1])&&Math.abs(c[0])<=180&&Math.abs(c[1])<=90;
export const validIso=s=>typeof s==='string'&&validCalendarDate(s.slice(0,10))&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)&&Number.isFinite(Date.parse(s));
export function draftToVoyage(draft,{speedOverrides={}}={}){
  const points=draft.points||[],planned=draft.computedRoute;
  if(planned?.status==='found'&&planned.engineVersion==='hydra-geometric-astar-1.0.0'&&planned.objective==='distance_only'&&planned.navigationallyValidated===false&&/^[a-f0-9]{64}$/.test(planned.topologySha256||'')&&JSON.stringify(planned.inputWaypoints)===JSON.stringify(points.map(p=>[p.lon,p.lat]))&&Array.isArray(planned.legs)&&planned.legs.length===points.length-1&&planned.legs.every((leg,i)=>Array.isArray(leg.coordinates)&&leg.coordinates.length>=2&&leg.coordinates.every(validCoordinate)&&JSON.stringify(leg.coordinates[0])===JSON.stringify([points[i].lon,points[i].lat])&&JSON.stringify(leg.coordinates.at(-1))===JSON.stringify([points[i+1].lon,points[i+1].lat])))return {id:draft.routeId||'current-draft',name:draft.name,role:'reference',source:{kind:'geometric-astar-reference',citation:'HYDRA geometric A* 1.0.0 · Natural Earth conservative land/ice grid; distance only; not navigationally validated',engineVersion:planned.engineVersion,topologySha256:planned.topologySha256,verification:'geometry-only'},segments:planned.legs.map((leg,i)=>({id:String(i+1),coordinates:leg.coordinates.map(p=>[...p]),speedKnots:speedOverrides[JSON.stringify(leg.coordinates)]??null,speedLimitKnots:null,speedLimitSource:null,quality:'algorithm-calculated'}))};
  return {id:draft.routeId||'current-draft',name:draft.name,role:'reference',source:{kind:'legacy-waypoints',citation:'W-ALERTER user-entered waypoint draft',verification:'unverified'},segments:points.slice(1).map((p,i)=>{const coordinates=[[points[i].lon,points[i].lat],[p.lon,p.lat]],key=JSON.stringify(coordinates);return {id:String(i+1),coordinates,speedKnots:speedOverrides[key]??null,speedLimitKnots:null,speedLimitSource:null,quality:'user-entered'};})};
}
export function validateVoyage(route){
  if(!route||!['reference','hydra'].includes(route.role)||!route.source?.kind||typeof route.source.citation!=='string'||!route.source.citation.trim())throw Error('route_source_required');
  if(!Array.isArray(route.segments)||!route.segments.length||route.segments.length>10000)throw Error('route_segments_required');
  let last=null;
  for(const s of route.segments){
    if(!s||typeof s!=='object')throw Error('route_segments_required');
    if(s.type==='wait'){
      if(!finite(s.durationHours)||s.durationHours<=0||s.mainEngineOff!==true||!validCoordinate(s.coordinate))throw Error('invalid_wait');
      if(last&&distanceNm(last,s.coordinate)>1e-6)throw Error('discontinuous_route');last=s.coordinate;
      if(s.auxiliaryLoad!=null&&(!finite(s.auxiliaryLoad)||s.auxiliaryLoad<0||s.auxiliaryLoad>1))throw Error('load_range');continue;
    }
    if(!Array.isArray(s.coordinates)||s.coordinates.length<2||s.coordinates.length>10000||!s.coordinates.every(validCoordinate))throw Error('invalid_coordinates');
    if(last&&distanceNm(last,s.coordinates[0])>1e-6)throw Error('discontinuous_route');last=s.coordinates.at(-1);
    const d=s.coordinates.slice(1).reduce((v,p,i)=>v+distanceNm(s.coordinates[i],p),0);if(!finite(d)||d<=0)throw Error('invalid_distance');
    for(const key of ['speedKnots','speedLimitKnots'])if(s[key]!=null&&(!finite(s[key])||s[key]<=0))throw Error('invalid_speed');
    if(s.speedLimitKnots!=null&&(typeof s.speedLimitSource!=='string'||!s.speedLimitSource.trim()))throw Error('speed_limit_source_required');
    if(s.auxiliaryLoad!=null&&(!finite(s.auxiliaryLoad)||s.auxiliaryLoad<0||s.auxiliaryLoad>1))throw Error('load_range');
  }
  if(route.departureIso!=null&&!validIso(route.departureIso))throw Error('departure_required');
  return route;
}
export function normalizeSegments(route,{preferredSpeedKnots,departureIso}){
  validateVoyage(route);if(!validIso(departureIso))throw Error('departure_required');if(route.departureIso&&Date.parse(route.departureIso)!==Date.parse(departureIso))throw Error('route_departure_mismatch');
  if(!finite(preferredSpeedKnots)||preferredSpeedKnots<=0)throw Error('invalid_speed');
  let elapsedHours=0;
  return route.segments.map((s,i)=>{
    let d=0,speed=0,hours=s.durationHours;
    if(s.type!=='wait'){d=s.coordinates.slice(1).reduce((sum,p,j)=>sum+distanceNm(s.coordinates[j],p),0);speed=Math.min(s.speedKnots??preferredSpeedKnots,preferredSpeedKnots,s.speedLimitKnots??Infinity);hours=d/speed;}
    if(!finite(hours)||hours<=0)throw Error('invalid_duration');
    const startIso=new Date(Date.parse(departureIso)+elapsedHours*3600000).toISOString();elapsedHours+=hours;const end=new Date(Date.parse(departureIso)+elapsedHours*3600000);if(!Number.isFinite(end.getTime()))throw Error('invalid_duration');
    return {...clone(s),id:s.id||String(i+1),type:s.type==='wait'?'wait':'sailing',distanceNm:d,speedKnots:speed,durationHours:hours,startIso,endIso:end.toISOString()};
  });
}
export function routeEndpoints(route){const first=route.segments[0],last=route.segments.at(-1);return [first.type==='wait'?first.coordinate:first.coordinates[0],last.type==='wait'?last.coordinate:last.coordinates.at(-1)];}
export function parseVoyagePackage(text,role){let p;try{p=JSON.parse(text);}catch{throw Error('invalid_route_json');}if(p.format!=='w-alerter-voyage'||p.version!==1||p.route?.role!==role)throw Error('invalid_route_package');validateVoyage(p.route);if(p.route.source.verification!=='user-attested'||!p.route.source.citation?.trim())throw Error('route_verification_required');if(role==='reference'&&p.route.source.kind!=='user-verified-reference')throw Error('reference_unverified');if(role==='hydra'&&(!['hydra-import','hydra-engine'].includes(p.route.source.kind)||!p.route.source.engineVersion||!validIso(p.route.departureIso)))throw Error('hydra_provenance_required');return clone(p.route);}
