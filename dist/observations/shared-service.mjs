/* Historical observation events are kept separate from habitat/density estimates. */
function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T00:00:00Z');return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s;}
export class ObservationDataService{
  constructor(repository,{environmentalDataService=null}={}){this.repository=repository;this.environmentalDataService=environmentalDataService;}
  async query({speciesId,year='all',month='all',date=null,source='all',recordType='all',presence='all',certainty='all',bounds=null}={}){
    const m=await this.repository.open();
    if(!m.species.some(s=>s.id===speciesId))return {status:'invalid_species',records:[],matchedCount:0};
    if(!['all','unknown'].includes(String(year))&&!/^\d{4}$/.test(String(year))||month!=='all'&&(!Number.isInteger(Number(month))||Number(month)<1||Number(month)>12)||date!==null&&!validDate(date)||!['all','obis','noaa'].includes(source)||!['all','reported','absence'].includes(presence)||!['all','ptobs','ptphoto','pttag','ptacs_pa','ptacs_calls'].includes(recordType)||!['all','Definite','Probable','not_provided'].includes(certainty))return {status:'invalid_query',records:[],matchedCount:0};
    if(bounds&&(!Array.isArray(bounds)||bounds.length!==4||!bounds.every(Number.isFinite)||bounds[0]<-180||bounds[2]>180||bounds[0]>bounds[2]||bounds[1]<-90||bounds[3]>90||bounds[1]>bounds[3]))return {status:'invalid_query',records:[],matchedCount:0};
    const selected=m.chunks.filter(c=>c.speciesId===speciesId&&(year==='all'||c.year===String(year))&&(!date||c.year===date.slice(0,4))&&(!bounds||!(c.bbox[2]<bounds[0]||c.bbox[0]>bounds[2]||c.bbox[3]<bounds[1]||c.bbox[1]>bounds[3])));
    const rows=[];const seen=new Set();
    // Keep fetch/decode concurrency bounded even for an all-years request.
    for(let start=0;start<selected.length;start+=4){for(const chunk of await Promise.all(selected.slice(start,start+4).map(c=>this.repository.chunk(c))))for(const r of chunk){
      if(seen.has(r.id))throw Error('duplicate_observation_source_key');seen.add(r.id);
      if(source!=='all'&&m.sources[r.sourceId].family!==source||recordType!=='all'&&r.recordType!==recordType||presence!=='all'&&r.presence!==presence||certainty!=='all'&&(r.certainty||'not_provided')!==certainty||month!=='all'&&r.time.month!==Number(month)||date&&r.time.date!==date||bounds&&(r.lon<bounds[0]||r.lon>bounds[2]||r.lat<bounds[1]||r.lat>bounds[3]))continue;
      rows.push(r);
    }}
    rows.sort((a,b)=>(b.time.display||'').localeCompare(a.time.display||'')||a.id.localeCompare(b.id));
    return {status:rows.length?'available':'no_observations_for_query',records:rows,matchedCount:rows.length,sources:Object.fromEntries([...new Set(rows.map(r=>r.sourceId))].map(id=>[id,m.sources[id]])),query:{speciesId,year,month,date,source,recordType,presence,certainty,bounds},sourceRevision:m.revision,interpretation:'recorded_events_not_unique_animals_or_density',coverage:'historical_source_records_only',uncertaintyPolicy:'not_provided_is_unknown_not_zero'};
  }
  source(record){return this.repository.current?.sources[record?.sourceId]||null;}
  async environmentalContext(record){
    if(!record?.time?.date)return {status:'exact_observation_date_not_available',sst:null,current:null};
    if(!this.environmentalDataService)return {status:'environmental_service_unavailable',sst:null,current:null};
    const date=record.time.date,[sst,current]=await Promise.all([
      this.environmentalDataService.getEnvironmentalValue('sst',record.lat,record.lon,date,{temporalMode:'interval-mean'}),
      this.environmentalDataService.getEnvironmentalValue('current_vector',record.lat,record.lon,date,{temporalMode:'calendar-month'})
    ]);
    return {status:'queried',queryDate:date,observationTimezoneVerified:false,interpretation:'monthly_environmental_context_not_an_instantaneous_measurement',sst,current};
  }
}
