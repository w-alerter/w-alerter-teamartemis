import {LIMITS} from './validation.mjs';
export class ScienceMap {
  constructor(L,element){
    this.L=L;this.map=L.map(element,{scrollWheelZoom:false}).setView([42,-40],3);this.layer=null;
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',{maxZoom:13,attribution:'Tiles © Esri, GEBCO, NOAA'}).addTo(this.map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}',{maxZoom:13,attribution:'Esri Ocean Reference'}).addTo(this.map);
  }
  clear(){if(this.layer)this.map.removeLayer(this.layer);this.layer=null;}
  show(dataset,variable,time){
    this.clear();const spec=dataset?.metadata.variables.find(v=>v.key===variable);if(!spec)return {status:'no_dataset'};
    const source=dataset.representation==='points'?dataset.records.map(r=>({type:'Feature',geometry:{type:'Point',coordinates:[r.lon,r.lat]},properties:{time:r.time,values:r.values}})):dataset.data.features;
    const selected=source.filter(f=>f.properties.time===time),valid=selected.filter(f=>typeof f.properties.values[variable]==='number'&&Number.isFinite(f.properties.values[variable]));
    if(valid.length>LIMITS.displayFeatures)return {status:'too_large',count:valid.length};
    if(!valid.length)return {status:'no_valid_values',missing:selected.length};
    const L=this.L;
    this.layer=L.geoJSON({type:'FeatureCollection',features:valid},{style:{color:'#3c7165',weight:2,fillOpacity:.12},pointToLayer:(_f,ll)=>L.circleMarker(ll,{radius:4,color:'#183d36',weight:1,fillColor:'#cee2ae',fillOpacity:.85}),onEachFeature:(f,l)=>{
      const content=document.createElement('div');content.textContent=[dataset.metadata.title,variable+': '+f.properties.values[variable]+' '+spec.units,f.properties.time,dataset.metadata.source.provider].join(' · ');l.bindPopup(content);
    }}).addTo(this.map);
    const bounds=this.layer.getBounds();if(bounds.isValid())this.map.fitBounds(bounds,{maxZoom:8,padding:[30,30]});
    return {status:'displayed',count:valid.length,missing:selected.length-valid.length};
  }
}
