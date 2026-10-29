/* Algebraic solution of the NGA Bowditch current triangle, fixed ground track. */
export const KNOTS_PER_MS=3600/1852;
export const MOTION_METHOD=Object.freeze({id:'fixed-track-current-triangle',version:'1.0.0',source:'NGA American Practical Navigator, Volume I, current sailing',url:'https://msi.nga.mil/Publications/APN',assumption:'constant current vector in each sampled segment; heading compensates cross current'});
export function currentTriangle(stwKnots,bearingDegrees,uMS,vMS){
  if(![stwKnots,bearingDegrees,uMS,vMS].every(Number.isFinite)||stwKnots<=0||bearingDegrees<0||bearingDegrees>=360)throw Error('invalid_motion_inputs');
  const theta=bearingDegrees*Math.PI/180,alongKnots=(uMS*Math.sin(theta)+vMS*Math.cos(theta))*KNOTS_PER_MS,crossKnots=(uMS*Math.cos(theta)-vMS*Math.sin(theta))*KNOTS_PER_MS;
  if(Math.abs(crossKnots)>stwKnots)return {status:'cross_current_exceeds_stw',sogKnots:null,headingDegrees:null,alongKnots,crossKnots};
  const forwardWaterKnots=Math.sqrt(Math.max(0,stwKnots**2-crossKnots**2)),sogKnots=forwardWaterKnots+alongKnots;
  if(sogKnots<=1e-10)return {status:'no_forward_progress',sogKnots:null,headingDegrees:null,alongKnots,crossKnots};
  const headingDegrees=(bearingDegrees-Math.asin(Math.max(-1,Math.min(1,crossKnots/stwKnots)))*180/Math.PI+360)%360;
  return {status:'computed',stwKnots,sogKnots,headingDegrees,trackDegrees:bearingDegrees,alongKnots,crossKnots,forwardWaterKnots,method:MOTION_METHOD.id};
}
export function nextUtcMonth(stamp){const d=new Date(stamp);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1);}
