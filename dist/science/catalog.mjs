/* Source declarations are not evidence of integration. Nothing here creates measurements. */
export const DATA_KINDS = Object.freeze([
  {id:'sst',provider:'Copernicus Marine',tr:'Deniz yüzeyi sıcaklığı',en:'Sea surface temperature'},
  {id:'currents',provider:'Copernicus Marine',tr:'Okyanus akıntıları',en:'Ocean currents'},
  {id:'chlorophyll',provider:'NASA MODIS-Aqua',tr:'Ham klorofil-a alanları',en:'Raw chlorophyll-a fields'},
  {id:'pace',provider:'NASA PACE',tr:'Okyanus rengi ve fitoplankton',en:'Ocean colour & phytoplankton'},
  {id:'calanus',provider:null,tr:'Calanus ve besin kaynakları',en:'Calanus & prey resources'},
  {id:'observations',provider:'OBIS-SEAMAP / NOAA',tr:'Canlı gözlemleri',en:'Species observations'},
  {id:'acoustics',provider:null,tr:'Akustik tespitler',en:'Acoustic detections'},
  {id:'tracking',provider:null,tr:'Uydu takip kayıtları',en:'Satellite tracking'},
  {id:'ais',provider:'NOAA Office for Coastal Management ·2025 annual transit counts',tr:'AIS gemi hareketleri',en:'AIS vessel movements'},
  {id:'protected_areas',provider:'UNEP-WCMC / IUCN · Protected Planet',tr:'Korunan alanlar ve OECM',en:'Protected areas & OECMs'},
  {id:'protection',provider:'NOAA / Canada · official sources required',tr:'Koruma ve hız düzenlemeleri',en:'Protection & speed regulations'}
].map(x=>Object.freeze({...x,status:'not_integrated'})));

export const SPECIES = Object.freeze([
  {id:'eubalaena-glacialis',scientificName:'Eubalaena glacialis',tr:'Kuzey Atlantik gerçek balinası',en:'North Atlantic right whale',requiredKinds:['chlorophyll','calanus','sst','observations'],requirementsStatus:'user_planned'},
  {id:'megaptera-novaeangliae',scientificName:'Megaptera novaeangliae',tr:'Kambur balina',en:'Humpback whale',requiredKinds:[],requirementsStatus:'not_defined'},
  {id:'balaenoptera-physalus',scientificName:'Balaenoptera physalus',tr:'Fin balinası',en:'Fin whale',requiredKinds:[],requirementsStatus:'not_defined'},
  {id:'balaenoptera-musculus',scientificName:'Balaenoptera musculus',tr:'Mavi balina',en:'Blue whale',requiredKinds:[],requirementsStatus:'not_defined'},
  {id:'caretta-caretta',scientificName:'Caretta caretta',tr:'Caretta caretta',en:'Loggerhead sea turtle',requiredKinds:[],requirementsStatus:'not_defined'},
  {id:'delphinus-delphis',scientificName:'Delphinus delphis',tr:'Kısa gagalı bayağı yunus',en:'Short-beaked common dolphin',requiredKinds:[],requirementsStatus:'not_defined'}
].map(x=>Object.freeze({...x,requiredKinds:Object.freeze(x.requiredKinds)})));

export const ROUTING_FACTORS = Object.freeze([
  ['collision','Çarpışma riski','Collision risk'],['habitat','Habitat duyarlılığı','Habitat sensitivity'],
  ['speed','Gemi hızı','Vessel speed'],['distance','Rota mesafesi','Route distance'],
  ['duration','Seyahat süresi','Travel time'],['fuel','Yakıt tüketimi','Fuel consumption'],
  ['co2','CO₂ emisyonları','CO₂ emissions'],['regulations','Koruma ve hız sınırları','Protection & speed limits'],
  ['environment','Zamana bağlı çevre','Time-dependent environment']
].map(([id,tr,en])=>Object.freeze({id,tr,en})));

export function legacyDescriptor(references) {
  return {
    id:'legacy-modis-monthly',kind:'legacy_reference',title:'NASA MODIS-Aqua · W-ALERTER',
    source:{provider:'NASA MODIS-Aqua (attribution in supplied source)',productId:null,version:null,url:null,license:null},
    temporal:{start:null,end:null},spatial:{bbox:null,crs:null,context:'Horseshoe Island / Antarctica; exact footprint not supplied'},
    resolution:{spatial:null,temporal:'monthly reference constants; years unspecified'},units:'mg/m³',
    references:{...references},
    provenance:{originalFile:'checks/reference-original.html',sourceSha256:'e7d6e8058ed61ed0dfcd278833a87a3108d9c2ad817db48c378f6a5a108446e0'},
    status:'legacy_reference',scientificReview:'raw_source_not_supplied'
  };
}
