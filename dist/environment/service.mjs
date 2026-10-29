/* One environmental query contract for every species; no biology is inferred here. */
const VARIABLES={sst:'sst',analysed_sst:'sst',sst_uncertainty:'sst_uncertainty',analysis_error_sst:'sst_uncertainty',sea_ice_fraction:'sea_ice_fraction',mask:'mask',sea_ice_fraction_flag:'sea_ice_fraction_flag'};
const CURRENTS={uo:'current_u',vo:'current_v',current_u:'current_u',current_v:'current_v',current_speed:'current_speed',current_direction:'current_direction',current_vector:'current_vector',current_along_track:'current_along_track'};
export function currentVector(u,v,bearing=null){const speed=Math.hypot(u,v),direction=speed>0?(Math.atan2(u,v)*180/Math.PI+360)%360:null,rad=bearing==null?null:bearing*Math.PI/180;return {u,v,speed,direction,knots:speed*3600/1852,alongTrack:rad==null?null:u*Math.sin(rad)+v*Math.cos(rad),crossTrack:rad==null?null:u*Math.cos(rad)-v*Math.sin(rad)};}
export function decodePacked(raw,attributes){if(!Number.isFinite(raw))return null;for(const key of ['_FillValue','missing_value'])if([].concat(attributes[key]??[]).includes(raw))return null;if(attributes.valid_range&&(raw<attributes.valid_range[0]||raw>attributes.valid_range[1]))return null;if(attributes.valid_min!=null&&raw<attributes.valid_min||attributes.valid_max!=null&&raw>attributes.valid_max)return null;const v=raw*(attributes.scale_factor??1)+(attributes.add_offset??0);return Number.isFinite(v)?v:null;}
export function parseDate(value){if(typeof value!=='string')return null;const dateOnly=/^\d{4}-\d{2}-\d{2}$/.test(value);if(!dateOnly&&!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value))return null;const [year,month,day]=value.slice(0,10).split('-').map(Number),d=new Date(0);d.setUTCFullYear(year,month-1,day);if(d.getUTCFullYear()!==year||d.getUTCMonth()!==month-1||d.getUTCDate()!==day)return null;const stamp=Date.parse(dateOnly?value+'T00:00:00Z':value);return Number.isFinite(stamp)?{stamp,dateOnly,value}:null;}
export function matchEnvironmentalTime(slices,date,mode='exact'){
  const parsed=parseDate(date);if(!parsed)return {status:'invalid_date'};
  if(!['exact','interval-mean'].includes(mode))return {status:'invalid_temporal_mode'};
  const matches=slices.filter(s=>mode==='exact'?(parsed.dateOnly?s.time.slice(0,10)===date:Date.parse(s.time)===parsed.stamp):(parsed.dateOnly?parsed.stamp+86400000>Date.parse(s.start)&&parsed.stamp<=Date.parse(s.end):parsed.stamp>=Date.parse(s.start)&&parsed.stamp<=Date.parse(s.end)));
  if(matches.length!==1)return {status:'date_unavailable',requestedDate:date,availableTimes:slices.map(s=>s.time),availableIntervals:slices.map(s=>({start:s.start,end:s.end,time:s.time}))};
  return {status:'available',slice:matches[0],temporalMatch:mode==='exact'?(parsed.dateOnly?'representative-date-of-source-mean':'exact-representative-timestamp-of-source-mean'):'explicit-source-interval-mean',dailyObservation:false};
}
export class EnvironmentalDataService{
  constructor(repository){this.repository=repository;this.additionalVariables=new Map();}
  registerVariable(name,provider){if(VARIABLES[name]||CURRENTS[name]||this.additionalVariables.has(name)||typeof provider?.query!=='function'||!provider.source||!provider.units||!provider.version)throw Error('documented_environmental_provider_required');this.additionalVariables.set(name,provider);}
  async getCurrent(variable,latitude,longitude,date,options={}){
    try{const parsed=parseDate(date);if(!parsed)return {status:'invalid_date',value:null};await this.repository.open();const candidates=[...this.repository.datasets.values()].map(e=>e.manifest).filter(m=>m.kind==='currents'),m=options.datasetId?candidates.find(m=>m.id===options.datasetId):candidates.find(m=>{const b=m.grid.bounds;return longitude>=b[0]&&longitude<=b[2]&&latitude>=b[1]&&latitude<=b[3];});
      if(!m)return {status:options.datasetId?'data_unavailable':'outside_source_region',value:null,variable,availableRegions:candidates.map(m=>({id:m.id,bbox:m.grid.bounds}))};
      if(options.depthMeters!=null&&options.depthMeters!==m.grid.depthMeters)return {status:'depth_unavailable',value:null,availableDepthMeters:m.grid.depthMeters};
      const mode=options.temporalMode||'exact';if(!['exact','calendar-month'].includes(mode))return {status:'invalid_temporal_mode',value:null};const month=new Date(parsed.stamp).toISOString().slice(0,7),s=m.timeSlices.find(s=>mode==='calendar-month'?s.period===month:parsed.dateOnly?s.time.slice(0,10)===date:Date.parse(s.time)===parsed.stamp);
      if(!s)return {status:'date_unavailable',value:null,variable,datasetId:m.id,availableTimes:m.timeSlices.map(s=>s.time),availablePeriods:m.timeSlices.map(s=>s.period)};
      const bearing=options.bearingDegrees;if(variable==='current_along_track'&&(!Number.isFinite(bearing)||bearing<0||bearing>=360))return {status:'invalid_bearing',value:null};
      const cell=await this.repository.getCell(m.id,s,latitude,longitude),common={variable,datasetId:m.id,datasetRevision:m.revision,requested:{latitude,longitude,date,temporalMode:mode},time:s.time,calendarPeriod:s.period,sourceInterval:{start:null,end:null,rawTime:s.rawTime,rawBounds:null,units:s.units,calendar:s.calendar,boundsEncoded:false},temporalMatch:mode==='calendar-month'?'explicit-provider-calendar-month-mean':'exact-source-month-label',dailyObservation:false,depthMeters:m.grid.depthMeters,gridCell:cell.gridCell,source:s.source,units:variable==='current_direction'?'degrees true, towards':'m/s',uncertainty:{value:null,units:'m/s',status:'not_provided'},quality:{flags:['monthly_model_mean','time_bounds_not_encoded','per_cell_uncertainty_not_provided','surface_layer_only','not_live_navigation'],spatialInterpolationPerformed:false,habitatModelEvaluated:false},assessment:'historical monthly model field; no species probability or fuel-saving forecast'};
      if(cell.status!=='available')return {...common,...cell,value:null};const u=decodePacked(cell.raw.current_u,s.variables.current_u.attributes),v=decodePacked(cell.raw.current_v,s.variables.current_v.attributes);if(u==null||v==null)return {...common,status:'masked',reason:'source_value_missing',value:null,raw:cell.raw};
      const vector=currentVector(u,v,bearing),value={current_u:u,current_v:v,current_speed:vector.speed,current_direction:vector.direction,current_vector:vector,current_along_track:vector.alongTrack}[variable];return {...common,status:'available',value,vector,raw:cell.raw,definition:variable==='current_speed'?'Magnitude of monthly mean u/v, not mean instantaneous speed':variable==='current_direction'?'Towards, clockwise from true north; null for a zero vector':'Original monthly source vector or documented projection'};
    }catch(error){return {status:'data_unavailable',value:null,variable,reason:error.message};}
  }
  async getEnvironmentalValue(variable,latitude,longitude,date,options={}){
    if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return {status:'invalid_coordinate',value:null};
    if(CURRENTS[variable])return this.getCurrent(CURRENTS[variable],latitude,longitude,date,options);
    if(this.additionalVariables.has(variable))return this.additionalVariables.get(variable).query({latitude,longitude,date,options});
    const key=VARIABLES[variable];if(!key)return {status:'unsupported_variable',value:null,variable};
    try{
      const datasetId=options.datasetId||'dmi-c3s-sst-2025',m=await this.repository.manifest(datasetId),matched=matchEnvironmentalTime(m.timeSlices,date,options.temporalMode||'exact');
      if(matched.status!=='available')return {...matched,value:null,variable:key,datasetId};
      const s=matched.slice,cell=await this.repository.getCell(datasetId,s,latitude,longitude),common={variable:key,datasetId,datasetRevision:m.revision,requested:{latitude,longitude,date,temporalMode:options.temporalMode||'exact'},time:s.time,sourceInterval:{start:s.start,end:s.end,cellMethods:s.cellMethods,rawTime:s.rawTime,rawBounds:s.rawBounds,units:s.units,calendar:s.calendar},temporalMatch:matched.temporalMatch,dailyObservation:false,gridCell:cell.gridCell,units:m.variables[key].units,source:s.source};
      if(cell.status!=='available')return {...common,...cell,value:null};
      const decoded=Object.fromEntries(Object.entries(cell.raw).map(([k,v])=>[k,decodePacked(v,s.variables[k].attributes)])),mask=decoded.mask,ice=decoded.sea_ice_fraction,rawSst=decoded.sst;
      const flags=['upstream_l4_analysis','source_interval_mean','global_time_metadata_conflict','time_averaged_categorical_mask','uncertainty_time_mean_not_recomputed'];
      let surfaceType='unknown';if(mask===1&&ice===0)surfaceType='open_water';else if(mask===9)surfaceType='sea_ice';else if(mask===2&&rawSst===null)surfaceType='land';else if(mask!=null)surfaceType='ambiguous_mean_mask';
      if(ice!=null&&ice>0)flags.push('sea_ice_present');if(mask!==1&&mask!==9&&rawSst!==null)flags.push('ambiguous_mean_mask');if(decoded.sst_uncertainty===null)flags.push('uncertainty_missing');if(decoded.sea_ice_fraction_flag===1)flags.push('source_ice_fraction_extrapolated');
      const quality={surfaceType,sourceMask:mask,maskFlagMeanings:s.variables.mask.attributes.flag_meanings,maskFlagMasks:s.variables.mask.attributes.flag_masks,seaIceFraction:ice,seaIceFractionFlag:decoded.sea_ice_fraction_flag,upstreamIceEstimate:ice>0||mask===9,spatialInterpolationPerformed:false,habitatModelEvaluated:false,flags,metadataConflicts:s.metadataConflicts};
      const uncertainty={value:decoded.sst_uncertainty,units:'K',sourceVariable:s.variables.sst_uncertainty.sourceVariable,definition:s.variables.sst_uncertainty.attributes.long_name,cellMethods:s.variables.sst_uncertainty.attributes.cell_methods,interpretation:'Source error standard deviation field with time: mean; not a recalculated standard error of the interval mean.'};
      let rejection=null;
      if(key==='sst'||key==='sst_uncertainty'){
        if(rawSst===null)rejection=surfaceType==='land'?'land_masked':'source_value_missing';
        else if(mask==null)rejection='source_mask_missing';
        else if(mask!==1&&mask!==9&&options.includeAmbiguousMask!==true)rejection='ambiguous_mean_mask';
        else if(ice==null)rejection='sea_ice_information_missing';
        else if((ice>0||mask===9)&&options.includeSeaIce!==true)rejection='sea_ice_excluded';
      }
      if(key==='sea_ice_fraction'&&decoded[key]!=null&&(decoded[key]<0||decoded[key]>1))rejection='invalid_source_fraction';
      const value=key==='sst'&&decoded.sst!=null?decoded.sst-273.15:decoded[key];
      if(value==null&&!rejection)rejection='source_value_missing';
      return {...common,status:rejection?'masked':'available',reason:rejection,value:rejection?null:value,kelvin:key==='sst'&&!rejection?decoded.sst:null,uncertainty,quality,raw:cell.raw,packing:s.variables[key].attributes,assessment:'environmental_source_field_only; no species presence/risk inference'};
    }catch(error){return {status:'data_unavailable',value:null,variable:key,reason:error.message};}
  }
}
