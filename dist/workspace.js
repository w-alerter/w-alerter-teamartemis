'use strict';
/* Browser-owned work only. Reference data is never part of an import or save. */
const Workspace = (() => {
  const KEY = 'w-alerter.workspace.v2';
  const fresh = () => ({version:2,routes:[],observations:[],draft:{name:'İsimsiz sefer',month:'Ekim',points:[],routeId:null}});
  const months = ['Ekim','Kasım','Aralık','Ocak'];
  const newId = () => typeof crypto.randomUUID==='function' ? crypto.randomUUID() : 'wa-'+Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
  function validPoint(p) {
    return !!p && Number.isFinite(p.lat) && Math.abs(p.lat)<=90 && Number.isFinite(p.lon) && Math.abs(p.lon)<=180 && Number.isFinite(p.klor) && p.klor>=0;
  }
  function cleanPoints(points) {
    if(!Array.isArray(points)||points.length>1000||!points.every(validPoint))throw new Error('Geçiş noktalarını kontrol edin. Enlem, boylam ve klorofil-a sayısal olmalıdır.');
    return points.map(p=>({lat:p.lat,lon:p.lon,klor:p.klor}));
  }
  function validateRoute(data) {
    if(!data||!months.includes(data.month))throw new Error('Dosyada geçerli bir sefer ayı bulunamadı.');
    const points=cleanPoints(data.points);
    return {name:typeof data.name==='string'?data.name.trim().slice(0,90)||'İçe aktarılan sefer':'İçe aktarılan sefer',month:data.month,points};
  }
  function load() {
    try {
      const raw=localStorage.getItem(KEY);if(!raw)return fresh();const data=JSON.parse(raw);
      if(data.version!==2)return fresh();
      const result=fresh();
      if(Array.isArray(data.routes))result.routes=data.routes.filter(r=>typeof r.id==='string'&&typeof r.savedAt==='string').flatMap(r=>{try{return [{...validateRoute(r),id:r.id,savedAt:r.savedAt}];}catch{return [];}}).slice(0,100);
      if(Array.isArray(data.observations))result.observations=data.observations.filter(o=>validPoint(o)&&months.includes(o.month)&&typeof o.id==='string'&&typeof o.createdAt==='string').slice(0,100).map(o=>({id:o.id,createdAt:o.createdAt,month:o.month,lat:o.lat,lon:o.lon,klor:o.klor}));
      try{result.draft={...validateRoute(data.draft),routeId:typeof data.draft.routeId==='string'?data.draft.routeId:null};}catch{}
      return result;
    }catch{return fresh();}
  }
  let data=load();
  function write() {try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
  function snapshot(){return JSON.parse(JSON.stringify(data));}
  function setDraft(draft){data.draft={...validateRoute(draft),routeId:draft.routeId||null};return write();}
  function saveRoute(draft,name){
    const route={...validateRoute({...draft,name}),id:draft.routeId||newId(),savedAt:new Date().toISOString()};
    const previous=data.routes.slice();data.routes=[route,...data.routes.filter(r=>r.id!==route.id)].slice(0,100);
    const oldDraft=data.draft;data.draft={name:route.name,month:route.month,points:route.points,routeId:route.id};
    if(!write()){data.routes=previous;data.draft=oldDraft;throw new Error('Bu tarayıcı kayıt yapamıyor. Rotayı JSON olarak indirebilirsiniz.');}
    return route;
  }
  function removeRoute(id){const old=data.routes;data.routes=data.routes.filter(r=>r.id!==id);if(!write()){data.routes=old;return false;}return true;}
  function addObservation(observation){const item={...observation,id:newId(),createdAt:new Date().toISOString()};data.observations=[item,...data.observations].slice(0,100);return write();}
  function parseImport(text){let parsed;try{parsed=JSON.parse(text);}catch{throw new Error('Dosya okunamadı. W-ALERTER JSON dosyası seçin.');}if(parsed.format!=='w-alerter-route'||parsed.version!==1)throw new Error('Bu dosya W-ALERTER rota biçiminde değil.');return validateRoute(parsed);}
  function exportRoute(draft){return JSON.stringify({format:'w-alerter-route',version:1,...validateRoute(draft)},null,2);}
  return {snapshot,setDraft,saveRoute,removeRoute,addObservation,parseImport,exportRoute,validPoint,validateRoute};
})();
