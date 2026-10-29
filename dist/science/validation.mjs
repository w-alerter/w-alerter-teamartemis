import {DATA_KINDS} from './catalog.mjs';
export const LIMITS=Object.freeze({fileBytes:25*1024*1024,records:100000,variables:64,displayFeatures:5000});
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function utcMillis(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value))return null;
  const n=Date.parse(value);if(!Number.isFinite(n))return null;
  const canonical=value.replace(/(?:\.(\d{1,3}))?Z$/,(_,ms)=>'.'+(ms||'').padEnd(3,'0')+'Z');
  return new Date(n).toISOString()===canonical?n:null;
}
export function validBbox(b){return Array.isArray(b)&&b.length===4&&b.every(finite)&&b[0]>=-180&&b[2]<=180&&b[1]>=-90&&b[3]<=90&&b[0]<=b[2]&&b[1]<=b[3];}
const inside=(lon,lat,b)=>lon>=b[0]&&lon<=b[2]&&lat>=b[1]&&lat<=b[3];

export function validateDataset(pkg){
  const errors=[],warnings=[];let missing=0,validValues=0;const fail=(path,message)=>errors.push({path,message});
  if(!object(pkg)){fail('$','Expected a dataset object');return {ok:false,errors,warnings};}
  if(pkg.format!=='w-alerter-dataset'||pkg.schemaVersion!==1)fail('$','Unsupported package format or schema version');
  const m=pkg.metadata;
  if(!object(m)){fail('metadata','Dataset metadata is required');return {ok:false,errors,warnings};}
  if(!nonempty(m.id)||!/^[a-z0-9][a-z0-9._-]{2,100}$/.test(m.id))fail('metadata.id','Use a stable 3–101 character identifier');
  if(!nonempty(m.title))fail('metadata.title','A title is required');
  if(!DATA_KINDS.some(k=>k.id===m.kind))fail('metadata.kind','Unknown data kind');
  if(!object(m.source)||!nonempty(m.source.provider))fail('metadata.source','A named source provider is required');
  else {
    for(const field of ['productId','version','url','citation','license'])if(m.source[field]!==null&&!nonempty(m.source[field]))fail('metadata.source.'+field,'Supply a string or explicit null');
    if(m.source.url!==null&&typeof m.source.url==='string'&&!/^https:\/\//.test(m.source.url))fail('metadata.source.url','An HTTPS source URL is required');
    for(const field of ['productId','license'])if(m.source[field]===null)warnings.push('Source '+field+' is not supplied');
  }
  const b=m.spatial?.bbox;
  if(m.spatial?.crs!=='EPSG:4326'||!validBbox(b))fail('metadata.spatial','A valid EPSG:4326 bbox is required; split antimeridian extents upstream');
  const start=utcMillis(m.temporal?.start),end=utcMillis(m.temporal?.end);
  if(start===null||end===null||start>end)fail('metadata.temporal','Valid ordered UTC timestamps are required');
  if(!['standard','gregorian','proleptic_gregorian'].includes(m.temporal?.calendar))fail('metadata.temporal.calendar','Unsupported calendar; an explicit adapter is required');
  if(!object(m.resolution)||!['spatial','temporal'].every(k=>m.resolution[k]===null||nonempty(m.resolution[k])))fail('metadata.resolution','Describe spatial and temporal resolution, or use explicit null');
  else if(Object.values(m.resolution).includes(null))warnings.push('Some resolution metadata is not supplied');
  if(m.missingPolicy!=='preserve-null')fail('metadata.missingPolicy','Missing values must remain explicit null');
  if(!Array.isArray(m.taxa)||!m.taxa.every(nonempty))fail('metadata.taxa','List exact scientific names, or an empty array');
  if(!object(m.provenance)||!nonempty(m.provenance.originalFile)||!/^[a-f0-9]{64}$/i.test(m.provenance.sourceSha256||'')||!Array.isArray(m.provenance.transformations)||!m.provenance.transformations.every(nonempty))fail('metadata.provenance','Original filename, SHA-256 and transformation history are required');
  const vars=m.variables;
  if(!Array.isArray(vars)||vars.length===0||vars.length>LIMITS.variables||!vars.every(object)){fail('metadata.variables','Provide 1–64 variable definitions');return {ok:false,errors,warnings};}
  const keys=new Set();
  vars.forEach((v,i)=>{
    if(!nonempty(v.key)||!nonempty(v.units)||!(v.standardName===null||nonempty(v.standardName)))fail('metadata.variables.'+i,'Variable key, units and standardName (or null) are required');
    if(keys.has(v.key))fail('metadata.variables.'+i,'Duplicate variable key');keys.add(v.key);
    if(v.validRange!==undefined&&(!Array.isArray(v.validRange)||v.validRange.length!==2||!v.validRange.every(finite)||v.validRange[0]>v.validRange[1]))fail('metadata.variables.'+i+'.validRange','A source-documented numeric range is required');
  });
  if(errors.length)return {ok:false,errors,warnings};
  const temporal=(time,path)=>{const t=utcMillis(time);if(t===null||t<start||t>end)fail(path,'Timestamp is invalid or outside the declared interval');};
  const values=(v,path)=>{
    if(!object(v)){fail(path,'Values object is required; missing measurements must be null');return;}
    if(Object.keys(v).some(k=>!keys.has(k)))fail(path,'Undeclared variable');
    for(const spec of vars){const x=v[spec.key];if(x===null){missing++;continue;}if(!finite(x)){fail(path+'.'+spec.key,'A finite number or explicit null is required');continue;}
      if(spec.validRange&&(x<spec.validRange[0]||x>spec.validRange[1]))fail(path+'.'+spec.key,'Outside the declared source range');else validValues++;
    }
  };
  const coordinate=(p,path)=>{if(!Array.isArray(p)||p.length!==2||!p.every(finite)||!inside(p[0],p[1],b)){fail(path,'Expected [longitude, latitude] within the declared bbox');return false;}return true;};
  const line=(cs,path,min=2)=>{if(!Array.isArray(cs)||cs.length<min){fail(path,'Geometry has too few coordinates');return;}cs.forEach((p,i)=>coordinate(p,path+'.'+i));};
  const ring=(cs,path)=>{line(cs,path,4);if(Array.isArray(cs)&&cs.length&&JSON.stringify(cs[0])!==JSON.stringify(cs.at(-1)))fail(path,'Polygon ring must be closed');};
  const polygon=(cs,path)=>{if(!Array.isArray(cs)||!cs.length)fail(path,'Polygon rings are required');else cs.forEach((r,i)=>ring(r,path+'.'+i));};
  const geometry=(g,path)=>{
    if(!object(g)){fail(path,'Geometry is required');return;}const c=g.coordinates;
    if(g.type==='Point')coordinate(c,path);
    else if(g.type==='MultiPoint')line(c,path,1);
    else if(g.type==='LineString')line(c,path);
    else if(g.type==='Polygon')polygon(c,path);
    else if(['MultiLineString','MultiPolygon'].includes(g.type)&&Array.isArray(c)&&c.length)c.forEach((part,i)=>g.type==='MultiPolygon'?polygon(part,path+'.'+i):line(part,path+'.'+i));
    else fail(path,'Unsupported or empty geometry');
  };
  let count=0;
  if(pkg.representation==='points'){
    if(!Array.isArray(pkg.records)||!pkg.records.length||pkg.records.length>LIMITS.records)fail('records','Provide 1–100000 source records');
    else {count=pkg.records.length;const seen=new Set();pkg.records.forEach((r,i)=>{const p='records.'+i;if(!object(r)){fail(p,'Expected a source record');return;}coordinate([r.lon,r.lat],p);temporal(r.time,p+'.time');values(r.values,p+'.values');const k=[r.lat,r.lon,r.time].join('|');if(seen.has(k)&&!warnings.includes('Coincident records require review; none have been merged'))warnings.push('Coincident records require review; none have been merged');seen.add(k);});}
  }else if(pkg.representation==='geojson'){
    const f=pkg.data?.features;if(pkg.data?.type!=='FeatureCollection'||!Array.isArray(f)||!f.length||f.length>LIMITS.records)fail('data','A nonempty FeatureCollection of at most 100000 features is required');
    else {count=f.length;f.forEach((feature,i)=>{const p='data.features.'+i;if(feature?.type!=='Feature'){fail(p,'Expected a GeoJSON Feature');return;}geometry(feature.geometry,p+'.geometry');temporal(feature.properties?.time,p+'.properties.time');values(feature.properties?.values,p+'.properties.values');});}
  }else fail('representation','Only points and geojson packages are supported by this adapter');
  warnings.push('Technical validation does not establish scientific validity or model suitability');
  if(validValues===0)warnings.push('No valid measured values; no analysis or measured layer can be produced');
  return {ok:errors.length===0,errors,warnings,recordCount:count,missingCount:missing,validValueCount:validValues};
}

export function compatibility(a,b){
  const x=a?.metadata||a,y=b?.metadata||b;
  const bounds=[x?.spatial?.bbox,y?.spatial?.bbox],times=[utcMillis(x?.temporal?.start),utcMillis(x?.temporal?.end),utcMillis(y?.temporal?.start),utcMillis(y?.temporal?.end)];
  if(!bounds.every(validBbox)||times.some(t=>t===null))return {status:'unknown',reason:'Coverage or dates are missing; do not infer compatibility'};
  const [u,v]=bounds,spatial=Math.max(u[0],v[0])<=Math.min(u[2],v[2])&&Math.max(u[1],v[1])<=Math.min(u[3],v[3]),temporal=Math.max(times[0],times[2])<=Math.min(times[1],times[3]);
  return {status:spatial&&temporal?'overlap':'no_overlap',spatial,temporal,requiresAlignmentReview:true};
}
