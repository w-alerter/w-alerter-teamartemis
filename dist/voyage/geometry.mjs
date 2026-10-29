/* All new route metrics use the routing engine's pinned spherical radius and lon/lat order. */
import {distanceNM} from '../routing/astar.mjs';
export {distanceNM};
export const GEOMETRY_METHOD=Object.freeze({id:'great-circle-segments',radiusNM:3440.065,coordinateOrder:'longitude,latitude',version:1});
const rad=Math.PI/180;
export const wrapLongitude=x=>((x+180)%360+360)%360-180;
export function validCoordinate(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90;}
export function validateLine(line){if(!Array.isArray(line)||line.length<2||line.length>30000||!line.every(validCoordinate))throw Error('invalid_route_geometry');return line;}
export function bearingDegrees(a,b){const p=a[1]*rad,q=b[1]*rad,dl=(b[0]-a[0])*rad;return (Math.atan2(Math.sin(dl)*Math.cos(q),Math.cos(p)*Math.sin(q)-Math.sin(p)*Math.cos(q)*Math.cos(dl))/rad+360)%360;}
export function interpolate(a,b,f){if(f<=0)return [...a];if(f>=1)return [...b];const angle=distanceNM(a,b)/3440.065;if(angle<1e-12)return [...a];const s=Math.sin(angle);if(Math.abs(s)<1e-12)throw Error('ambiguous_geodesic');const unit=p=>[Math.cos(p[1]*rad)*Math.cos(p[0]*rad),Math.cos(p[1]*rad)*Math.sin(p[0]*rad),Math.sin(p[1]*rad)],u=unit(a),v=unit(b),x=Math.sin((1-f)*angle)/s,y=Math.sin(f*angle)/s,p=u.map((n,i)=>n*x+v[i]*y);return [wrapLongitude(Math.atan2(p[1],p[0])/rad),Math.atan2(p[2],Math.hypot(p[0],p[1]))/rad];}
export function lineDistance(line){validateLine(line);return line.slice(1).reduce((d,p,i)=>d+distanceNM(line[i],p),0);}
export function routePieces(line,{maxNM=10,maxPieces=12000}={}){validateLine(line);if(!Number.isFinite(maxNM)||maxNM<=0)throw Error('invalid_sample_step');const pieces=[];let offset=0;for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],distance=distanceNM(a,b);if(distance<1e-9)continue;const n=Math.ceil(distance/maxNM);if(pieces.length+n>maxPieces)throw Error('route_sampling_limit');for(let j=0;j<n;j++){const from=interpolate(a,b,j/n),to=interpolate(a,b,(j+1)/n),d=distanceNM(from,to);pieces.push({from,to,midpoint:interpolate(from,to,.5),bearingDegrees:bearingDegrees(from,to),distanceNM:d,offsetNM:offset});offset+=d;}}if(!pieces.length)throw Error('invalid_route_geometry');return pieces;}
export function halfDistancePoint(line){const d=lineDistance(line)/2;let passed=0;for(let i=1;i<line.length;i++){const step=distanceNM(line[i-1],line[i]);if(passed+step>=d)return interpolate(line[i-1],line[i],(d-passed)/step);passed+=step;}return [...line.at(-1)];}
