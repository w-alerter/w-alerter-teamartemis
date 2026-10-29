/* Shared spatial snapshot service. It makes no historical, navigational or biological inference. */
const inBox=(b,x,y)=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3];
import {classifyPolygon} from './geometry.mjs';
import {routeProtectionInteractions} from './route-intersections.mjs';
export {classifyPolygon};
export class ProtectionDataService{
  constructor(repository){this.repository=repository;}
  getRouteInteractions(coordinates,options={}){return routeProtectionInteractions(this.repository.current,coordinates,options);}
  getProtectionAt(latitude,longitude,{date=null}={}){
    const data=this.repository.current,base={requested:{latitude,longitude,date},units:null,legalNavigationDecision:false,habitatResult:false,uncertainty:null};
    if(typeof latitude!=='number'||typeof longitude!=='number'||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return {...base,status:'invalid_coordinates',matches:[]};
    if(date!==null&&(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)))return {...base,status:'invalid_date',matches:[]};
    if(!data)return {...base,status:'not_loaded',matches:[]};const m=data.metadata,source={provider:m.provider,release:m.release,sha256:m.archiveSha256,originalFile:m.fileName,url:m.sourceUrl,license:m.license,commercialDistributionCleared:false},quality={coordinateUncertainty:null,geometry:'original_float64_lon_lat',historicalValidity:'not_encoded',surveyCoverage:'supplied_subset_only',pointRecordsHaveBoundaries:false};
    if(!inBox(m.bbox,longitude,latitude))return {...base,status:'outside_supplied_extent',matches:[],source,quality};
    const matches=[];for(const f of data.features){if(f.shape.type==='Polygon'&&!inBox(f.shape.bbox,longitude,latitude))continue;const relation=f.shape.type==='Polygon'?classifyPolygon(f.shape.coordinates,longitude,latitude):f.shape.coordinates.some(([x,y])=>Math.abs(x-longitude)<=1e-10&&Math.abs(y-latitude)<=1e-10)?'point_record':'outside';if(relation==='outside')continue;const p=f.properties;matches.push({id:f.id,siteId:f.siteId,name:p.NAME_ENG||p.NAME,relation,siteType:p.SITE_TYPE,realm:p.REALM,status:p.STATUS,statusYear:p.STATUS_YR,noTake:p.NO_TAKE,noTakeAreaKm2:p.NO_TK_AREA,verification:p.VERIF,metadataId:p.METADATAID,sourcePart:f.sourcePart,sourceRow:f.sourceRow});}
    return {...base,status:date?'snapshot_only':matches.length?'matched':'not_matched',matches,source,quality};
  }
}
