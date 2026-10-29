/* Source-independent, lazy, checksummed observation storage. No raw archive fetches. */
import {sha256} from '../science/pipeline.mjs';

const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}return value;};
const hashPattern=/^[a-f0-9]{64}$/;
export function validObservation(record,sources){
  const t=record?.time,source=sources?.[record?.sourceId];
  return !!(record&&typeof record.id==='string'&&record.id.length&&typeof record.rowId==='string'&&record.rowId.length&&source?.redistributionCleared===true&&
    (source.family==='obis'&&source.license==='CC0'||source.family==='noaa'&&record.sourceId==='noaa:rwsas')&&
    Number.isFinite(record.lat)&&Math.abs(record.lat)<=90&&Number.isFinite(record.lon)&&Math.abs(record.lon)<=180&&
    typeof record.speciesId==='string'&&['ptobs','ptphoto','pttag','ptacs_pa','ptacs_calls'].includes(record.recordType)&&
    ['reported','absence'].includes(record.presence)&&(record.groupSize===null||Number.isFinite(record.groupSize)&&record.groupSize>=0)&&
    (record.uncertaintyMeters===null||Number.isFinite(record.uncertaintyMeters)&&record.uncertaintyMeters>=0)&&
    t&&/^[01]{6}$/.test(t.bits)&&t.utc===null&&t.timezoneVerified===false&&
    (t.year===null||Number.isInteger(t.year)&&t.year>0&&t.year<10000)&&
    (t.month===null||Number.isInteger(t.month)&&t.month>=1&&t.month<=12)&&
    (t.date===null||/^\d{4}-\d{2}-\d{2}$/.test(t.date)&&t.bits.startsWith('111'))&&Array.isArray(record.qualityFlags));
}
function validManifest(m){
  if(m?.format!=='w-alerter-species-observations'||m.version!==1||!/^[a-f0-9]{16}$/.test(m.revision)||!Array.isArray(m.species)||!m.species.length||!Array.isArray(m.chunks)||m.chunks.length>1000||!m.sources)throw Error('invalid_observation_manifest');
  const ids=new Set(),chunkIds=new Set();let count=0;
  for(const s of m.species){if(!s.id||ids.has(s.id)||!Array.isArray(s.years))throw Error('invalid_observation_species');ids.add(s.id);}
  for(const c of m.chunks){if(chunkIds.has(c.id)||!ids.has(c.speciesId)||!/^chunks\/[a-z0-9-]+\.json\.gz$/.test(c.file)||!hashPattern.test(c.sha256)||!hashPattern.test(c.decodedSha256)||!Number.isInteger(c.rows)||c.rows<1||c.rows>2000||!Number.isInteger(c.bytes)||c.bytes>500000||!Number.isInteger(c.decodedBytes)||c.decodedBytes>3000000)throw Error('invalid_observation_chunk_metadata');chunkIds.add(c.id);count+=c.rows;}
  if(count!==m.recordCount||m.recordCount>100000)throw Error('observation_count_mismatch');
  return freeze(m);
}
export class SharedObservationRepository{
  constructor({manifestUrl=new URL('../data/observations/obis-noaa-2026-10-v1/manifest.json',import.meta.url),fetcher=(...args)=>fetch(...args),cacheEntries=8}={}){
    this.url=new URL(manifestUrl,import.meta.url);this.fetcher=fetcher;this.cacheEntries=cacheEntries;this.current=null;this.pending=null;this.cache=new Map();this.inflight=new Map();this.stats={chunkFetches:0,cacheHits:0};
  }
  open(){if(!this.pending)this.pending=(async()=>{const response=await this.fetcher(this.url,{cache:'no-cache'});if(!response.ok)throw Error('observation_catalog_unavailable');const text=await response.text();if(text.length>3000000)throw Error('observation_catalog_limit');this.current=validManifest(JSON.parse(text));return this.current;})().catch(e=>{this.pending=null;throw e;});return this.pending;}
  async list(){return (await this.open()).species;}
  async chunk(meta){
    const m=await this.open();if(!m.chunks.includes(meta))throw Error('unknown_observation_chunk');
    const key=m.revision+':'+meta.id;
    if(this.cache.has(key)){const result=this.cache.get(key);this.cache.delete(key);this.cache.set(key,result);this.stats.cacheHits++;return result;}
    if(!this.inflight.has(key)){
      const promise=(async()=>{
        const url=new URL(meta.file,this.url);url.searchParams.set('revision',m.revision);const response=await this.fetcher(url,{cache:'force-cache'});if(!response.ok)throw Error('observation_asset_unavailable');
        this.stats.chunkFetches++;let bytes=new Uint8Array(await response.arrayBuffer());
        if(bytes.length>3000000)throw Error('observation_asset_limit');
        if(bytes[0]===31&&bytes[1]===139){if(bytes.length!==meta.bytes||await sha256(bytes)!==meta.sha256)throw Error('observation_checksum_failed');if(typeof DecompressionStream!=='function')throw Error('gzip_decoder_unavailable');bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());}
        if(bytes.length!==meta.decodedBytes||await sha256(bytes)!==meta.decodedSha256)throw Error('observation_checksum_failed');
        const parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
        if(parsed.format!=='w-alerter-observation-chunk'||parsed.version!==1||parsed.revision!==m.revision||parsed.id!==meta.id||!Array.isArray(parsed.records)||parsed.records.length!==meta.rows)throw Error('invalid_observation_chunk');
        const ids=new Set();for(const r of parsed.records){if(!validObservation(r,m.sources)||r.speciesId!==meta.speciesId||String(r.time.year??'unknown')!==meta.year||ids.has(r.id))throw Error('invalid_observation_record');ids.add(r.id);}
        const records=freeze(parsed.records);this.cache.set(key,records);while(this.cache.size>this.cacheEntries)this.cache.delete(this.cache.keys().next().value);return records;
      })().finally(()=>this.inflight.delete(key));this.inflight.set(key,promise);
    }
    return this.inflight.get(key);
  }
  clearCache(){this.cache.clear();}
}
