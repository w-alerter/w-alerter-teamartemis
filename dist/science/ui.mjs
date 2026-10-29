import {plan as planGeometricRoute} from '../routing/index.mjs';
import {TrafficRepository} from '../traffic/repository.mjs';
import {TrafficDataService} from '../traffic/service.mjs';
import {TrafficController} from '../traffic/ui.mjs';
import {trafficMessage} from '../traffic/messages.mjs';
import {voyageMessage} from '../voyage/messages.mjs';
import {EcologicalModelRegistry} from '../voyage/ecology.mjs';
import {ENGINE_VERSION} from '../routing/astar.mjs';
import {environmentalRepository,environmentalDataService,getEnvironmentalValue} from '../environment/index.mjs';
import {EnvironmentalMapLayer} from '../environment/leafletLayer.mjs';
import {EnvironmentalInspector} from '../environment/inspector.mjs';
import {environmentMessage} from '../environment/messages.mjs';
import {workbenchMessage} from '../environment/workbench-messages.mjs';
import {ObservationRepository} from '../observations/repository.mjs';
import {SharedObservationRepository} from '../observations/shared-repository.mjs';
import {ObservationDataService} from '../observations/shared-service.mjs';
import {SharedObservationController} from '../observations/shared-ui.mjs';
import {observationMessage} from '../observations/shared-messages.mjs';
import {ObservationController} from '../observations/ui.mjs';
import {ProtectionRepository} from '../protection/repository.mjs';
import {ProtectionDataService} from '../protection/service.mjs';
import {ProtectionController} from '../protection/ui.mjs';
import {protectionMessage} from '../protection/messages.mjs';
import {DATA_KINDS,SPECIES,ROUTING_FACTORS,legacyDescriptor} from './catalog.mjs';
import {compatibility} from './validation.mjs';
import {inspectFile} from './pipeline.mjs';
import {DatasetRepository} from './repository.mjs';
import {SpeciesModels,RoutingEngines} from './models.mjs';
import {ScienceMap} from './layers.mjs';

const $=id=>document.getElementById(id),t=(tr,en)=>I18n.message(tr,en);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const repository=new DatasetRepository(),routingEngines=new RoutingEngines();
const sharedObservationRepository=new SharedObservationRepository(),observationDataService=new ObservationDataService(sharedObservationRepository,{environmentalDataService}),speciesModels=new SpeciesModels({environmentalDataService,observationDataService});
const legacy=legacyDescriptor(window.WALegacy.references);
routingEngines.register({id:'legacy-sequential',version:'source-v4.4',provenance:'Unchanged dist/model.js; ordered waypoints, not HYDRA A*',plan:({points,month})=>window.WALegacy.routeModel(points,month)});
routingEngines.register({id:'hydra-geometric-astar',version:ENGINE_VERSION,provenance:'New distance-only 16-neighbour A*; conservative Natural Earth 10m land/ice-shelf grid; not the missing original ecological HYDRA engine',plan:({points})=>planGeometricRoute(points)});
const observationRepository=new ObservationRepository(),protectionRepository=new ProtectionRepository(),protectionDataService=new ProtectionDataService(protectionRepository);
const trafficRepository=new TrafficRepository(),trafficDataService=new TrafficDataService(trafficRepository),ecologicalModels=new EcologicalModelRegistry({environmentalDataService,observationDataService});
environmentalDataService.registerVariable('ais_transits',{query:({latitude,longitude,date,options})=>trafficDataService.getTransitValue(latitude,longitude,date,options),source:'NOAA AIS annual transit counts2025',units:'annual source-cell transits',version:'noaa-ais-2025-v1'});
window.WAScience=Object.freeze({trafficRepository,trafficDataService,ecologicalModels,environmentalRepository,environmentalDataService,getEnvironmentalValue,sharedObservationRepository,observationDataService,observationRepository,protectionRepository,protectionDataService,repository,speciesModels,routingEngines,inspectFile,compatibility,legacy});
const tt=key=>trafficMessage(key,I18n.language);
const pt=key=>protectionMessage(key,I18n.language);
const ot=key=>observationMessage(key,I18n.language);
const et=key=>environmentMessage(key,I18n.language);
const wt=key=>workbenchMessage(key,I18n.language),variableLabel=key=>key.startsWith('current_')?wt(key):et(key);
const datasetLabel=e=>e.manifest?.kind==='currents'?wt('currents')+' · '+wt(e.manifest.region.replace('-','_'))+' · 2025':e.metadata.title;
let searchMarker=null,environmentalLayer=null,environmentalInspector=null,layerGeneration=0,autoSelectedEnvironment=false;
let entries=[],prepared=null,scienceMap=null,activeDataset=null,selectionGeneration=0,intakeGeneration=0;
const sharedObservations=new SharedObservationController($('sharedObservationPanel'),sharedObservationRepository,observationDataService,{openPanel:openMapPanel,onChange:()=>{renderCatalog();renderSaved();}});
const observations=new ObservationController($('observationPanel'),observationRepository,environmentalDataService,{openPanel:openMapPanel,onChange:()=>{renderCatalog();renderSaved();}});
const protectedAreas=new ProtectionController($('protectionPanel'),protectionRepository,protectionDataService,{openPanel:openMapPanel,isOpen:()=>!$('oceanPanel').hidden&&$('oceanPanel').dataset.view==='protection',onChange:()=>{renderCatalog();renderSaved();}});
const traffic=new TrafficController($('trafficPanel'),trafficRepository,trafficDataService,{isOpen:()=>!$('oceanPanel').hidden&&$('oceanPanel').dataset.view==='traffic',onChange:()=>renderCatalog()});
traffic.restore();
let intakeFeedback={tr:'Henüz bir dosya seçilmedi.',en:'No file selected yet.'};
function intakeMessage(tr,en){intakeFeedback={tr,en};$('intakeStatus').textContent=t(tr,en);}
const kindName=id=>{const k=DATA_KINDS.find(k=>k.id===id);return k?t(k.tr,k.en):id;};
const unknown=()=>t('Belirtilmedi','Not supplied');
function table(rows){return '<dl class="metadata-list">'+rows.map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value??unknown())}</dd></div>`).join('')+'</dl>';}
function renderCatalog(){
  $('scienceReferences').innerHTML=Object.entries(legacy.references).map(([month,value])=>`<div><span>${esc(I18n.translate(month))}</span><strong>${value.toFixed(4)}</strong></div>`).join('');
  $('sourceCatalog').innerHTML=DATA_KINDS.map((kind,i)=>{
    const saved=entries.filter(d=>d.metadata.kind===kind.id);
    return `<article class="source-row"><span class="source-index">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(kind.id==='ais'?tt('title'):kind.id==='protected_areas'?pt('title'):t(kind.tr,kind.en))}</h3><p>${esc(kind.id==='protection'?t('NOAA / Kanada · Resmî kaynak gerekli','NOAA / Canada · Official source required'):(saved.find(e=>e.bundled)?.metadata.source.provider||kind.provider||t('Veri kaynağı dosyayla belirlenecek','Source to be determined from the file')))}</p></div><span class="source-state ${saved.length?'local':''}">${kind.id==='ais'?esc(trafficRepository.current?et('integrated'):et('loading')):kind.id==='protected_areas'?esc(protectionRepository.current?pt('localStatus'):pt('research')):kind.id==='observations'?esc(sharedObservationRepository.current?ot('ready'):observationRepository.current?wt('obsLocalStatus'):wt('research')):saved.some(e=>e.bundled)?esc(et('integrated')):saved.length?esc(t('Yerel dosya · Teknik kontrol','Local file · Technical checks')):esc(t('Veri bekleniyor','Awaiting data'))}</span></article>`;
  }).join('');
}
function renderModels(){const hydra=document.getElementById('page-hydra');hydra.querySelector('.module-status').textContent=window.WARouteText('geometricReady');const engine=hydra.querySelector('.engine-card');engine.querySelector('h2').textContent=window.WARouteText('engine');engine.querySelector('p').textContent=window.WARouteText('limit');engine.querySelector('.engine-note p').textContent=window.WARouteText('method');
  $('speciesCards').innerHTML=SPECIES.map(s=>`<article class="species-row"><div class="species-name"><h2>${esc(s.scientificName)}</h2><p>${esc(t(s.tr,s.en))}</p><a class="environment-shared-link" href="#ocean">${esc(et('shared'))} ↗</a></div><details><summary>${esc(t('Veri gereksinimleri','Data requirements'))}</summary>${s.requiredKinds.length?`<div class="requirement-chips">${s.requiredKinds.map(id=>`<span>${esc(kindName(id))}</span>`).join('')}</div><p>${esc(t('Birlikte kullanım planı; doğrulanmış bir habitat modeli değildir.','Planned combined inputs; a validated habitat model is not yet available.'))}</p>`:`<p>${esc(t('Türe özgü gereksinimler bilimsel yöntemle tanımlanacak. Diğer türlerin modeli otomatik uygulanmaz.','Species-specific requirements await a documented method. Models are not reused across species automatically.'))}</p>`}</details><span class="species-state">${esc(t('Model bağlanmadı','Model not connected'))}</span></article>`).join('');
  $('routingFactors').innerHTML=ROUTING_FACTORS.map(f=>`<div class="factor-row"><strong>${esc(t(f.tr,f.en))}</strong><small>${esc(t('Veri + yöntem bekleniyor','Awaiting data + method'))}</small></div>`).join('');
}
function showMetadata(metadata=legacy){
  const isLegacy=metadata===legacy;
  $('metadataContent').innerHTML=`<span class="eyebrow">${esc(t('KAYNAK KÜNYESİ','SOURCE METADATA'))}</span><h2>${esc(metadata.title)}</h2>${table([
    [t('Kaynak','Provider'),metadata.source.provider],[t('Ürün / sürüm','Product / version'),[metadata.source.productId,metadata.source.version].filter(Boolean).join(' / ')||null],
    [t('Kaynak bağlantısı','Source URL'),metadata.source.url],[t('Tarih aralığı','Time coverage'),metadata.temporal?.start?metadata.temporal.start+' — '+metadata.temporal.end:null],
    [t('Coğrafi kapsam','Spatial coverage'),metadata.spatial?.bbox?.join(', ')||null],[t('Koordinat sistemi','Coordinate system'),metadata.spatial?.crs],
    [t('Birim','Units'),metadata.units||metadata.variables?.map(v=>v.key+': '+v.units).join(' · ')],
    [t('Çözünürlük','Resolution'),[metadata.resolution?.spatial,metadata.resolution?.temporal].filter(Boolean).join(' / ')||null],
    [t('Lisans','License'),metadata.source.license],[t('Asıl dosya','Original file'),metadata.provenance.originalFile],
    [isLegacy?t('Kaynak HTML SHA-256','Source HTML SHA-256'):t('Kaynak dosya SHA-256','Source file SHA-256'),metadata.provenance.sourceSha256]
  ])}<p class="subtle-note">${esc(isLegacy?t('Antarktika / Horseshoe Adası bağlamı kaynak kodda belirtilmiştir. Kesin alan ve yıllar bilinmediğinden Kuzey Atlantik verileriyle uyumluluk doğrulanamaz. Bu özet, ham NASA veri setinin künyesi değildir.','The supplied source describes Antarctica / Horseshoe Island. Exact coverage and years are unknown, so alignment with North Atlantic datasets cannot be established. This is not the metadata of a raw NASA product.'):t('Teknik kayıt, bilimsel uygunluk onayı değildir. Asıl kaynak dosyası ve dönüşümler ayrıca incelenmelidir.','Technical acceptance does not establish scientific suitability. The original source file and transformations require separate review.'))}</p>`;
  $('metadataDialog').showModal();
}
async function refreshEntries(){
  const [bundled,local]=await Promise.allSettled([environmentalRepository.list(),repository.list()]);
  entries=[...(bundled.status==='fulfilled'?bundled.value:[]),...(local.status==='fulfilled'?local.value:[])];
  renderSaved();renderCatalog();populateDatasetSelect();
  if(bundled.status==='rejected')$('layerStatus').textContent=et('error');
}
function renderSaved(){
  const bundled=entries.filter(e=>e.bundled),local=entries.filter(e=>!e.bundled);
  const integrated=bundled.map(entry=>`<article class="environment-integrated-source"><strong>${esc(datasetLabel(entry))}</strong><p>${esc(et('integrated'))} · ${new Set(entry.manifest.timeSlices.map(s=>s.source.originalFile)).size} NetCDF · ${entry.manifest.grid.nominalStepDegrees.toFixed(entry.manifest.kind==='currents'?5:2)}°</p><p>${esc(entry.manifest.kind==='currents'?wt('currentTemporal'):et('timeWarning'))}</p><button class="text-link" data-metadata="${esc(entry.id)}">${esc(et('metadata'))} ↗</button> · <a href="#ocean">${esc(wt('allSpecies'))} ↗</a></article>`).join('')+`<article class="environment-integrated-source"><strong>OBIS-SEAMAP / NOAA · ${esc(ot('title'))}</strong><p>${esc(ot('rights'))}</p><p>${esc(ot('snapshot'))}</p><button class="text-link" data-map-panel="observations">${esc(ot('title'))} ↗</button></article><article class="environment-integrated-source"><strong>Happywhale · ${esc(wt('archiveTitle'))}</strong><p>${esc(wt('archiveLicense'))}</p><p>${esc(wt('localNote'))}</p><button class="text-link" data-map-panel="observations">${esc(wt('importArchive'))} ↗</button></article><article class="environment-integrated-source"><strong>Protected Planet · ${esc(pt('protection'))}</strong><p>${esc(pt('license'))}</p><p>${esc(pt('local'))}</p><button class="text-link" data-map-panel="protection">${esc(pt('import'))} ↗</button></article>`;
  $('savedDatasets').innerHTML=integrated+(local.length?local.map(entry=>`<article class="stored-row"><strong>${esc(entry.metadata.title)}</strong><small>${esc(t('Yalnızca teknik kontrol · Bilimsel onay yok','Technical checks only · Not scientifically approved'))}</small><div><button class="text-link" data-metadata="${esc(entry.id)}">${esc(t('Künye','Metadata'))} ↗</button><button class="text-link" data-backup="${esc(entry.id)}">${esc(t('Dosyayı yedekle','Back up file'))} ↓</button></div></article>`).join(''):bundled.length?'':`<div class="small-empty"><span>—</span><p>${esc(t('Veri henüz entegre edilmedi','Data not yet integrated'))}</p></div>`);
}
function renderIntake(){
  if(!prepared){$('intakeStatus').textContent=t(intakeFeedback.tr,intakeFeedback.en);return;}
  const target=$('intakeStatus');target.replaceChildren();
  const heading=document.createElement('strong');heading.textContent=prepared.status==='review_required'?t('Teknik kontrol tamamlandı. İnceleme gerekli.','Technical checks complete. Review required.'):prepared.status==='needs_adapter'?t('Dosyaya özel bağdaştırıcı gerekli.','A file-specific adapter is required.'):t('Dosya kabul edilmedi.','File not accepted.');target.append(heading);
  if(prepared.dataset){const p=document.createElement('p');p.textContent=prepared.dataset.metadata.title;target.append(p);const stats=document.createElement('p');stats.textContent=t('Kayıt / eksik değer: ','Records / missing values: ')+prepared.report.recordCount+' / '+prepared.report.missingCount;target.append(stats);const p2=document.createElement('p');p2.textContent=t('Eski NASA referansıyla zaman ve alan uyumluluğu: bilinmiyor.','Temporal and spatial compatibility with the legacy NASA references: unknown.');target.append(p2);}
  if(prepared.message){const p=document.createElement('p');p.textContent=I18n.english(prepared.message);target.append(p);}
  const details=[...(prepared.report?.errors||[]).map(e=>e.path+': '+e.message),...(prepared.report?.warnings||[])];
  if(details.length){const disclosure=document.createElement('details'),summary=document.createElement('summary');summary.textContent=t('Teknik ayrıntılar','Technical details');disclosure.append(summary);const ul=document.createElement('ul');details.forEach(s=>{const li=document.createElement('li');li.textContent=I18n.english(s);ul.append(li);});disclosure.append(ul);target.append(disclosure);}
  $('commitDataset').hidden=prepared.status!=='review_required';
}
async function inspectSelection(file){
  if(!file)return;const generation=++intakeGeneration;prepared=null;$('commitDataset').hidden=true;intakeMessage('Dosya inceleniyor…','Inspecting file…');
  try{const result=await inspectFile(file);if(generation!==intakeGeneration)return;prepared=result;renderIntake();}catch(error){intakeMessage('Dosya okunamadı: '+error.message,'Could not read the file: '+error.message);}
}
async function savePrepared(){
  if(!prepared)return;$('commitDataset').disabled=true;
  try{await repository.save(prepared);prepared=null;$('commitDataset').hidden=true;$('scienceFile').value='';intakeMessage('Dosya bu tarayıcıya kaydedildi. Bilimsel model kullanımı onaylanmadı.','File saved in this browser. Scientific model use has not been approved.');await refreshEntries();}
  catch(error){$('intakeStatus').textContent=t('Kayıt yapılamadı: ','Could not save: ')+I18n.english(error.message);}
  finally{$('commitDataset').disabled=false;}
}
function populateDatasetSelect(){
  const selected=$('datasetSelect').value;
  $('datasetSelect').innerHTML=`<option value="">${esc(t('Veri seti seçin','Select a dataset'))}</option>`+entries.map(e=>`<option value="${esc(e.id)}">${esc(datasetLabel(e))}</option>`).join('');
  $('datasetSelect').disabled=!entries.length;
  if(entries.some(e=>e.id===selected))$('datasetSelect').value=selected;
  if(!activeDataset){emptyLayer();if(!autoSelectedEnvironment){const bundled=entries.find(e=>e.bundled);if(bundled){autoSelectedEnvironment=true;$('datasetSelect').value=bundled.id;selectDataset();}}}
}
function emptyLayer(){
  ++layerGeneration;document.querySelector('#page-ocean .basemap-notice').hidden=false;document.querySelector('#page-ocean .chart-caption').textContent='WGS 84 · '+t('Altlık harita','Basemap');environmentalLayer?.clear();environmentalInspector?.clear();
  for(const id of ['variableSelect','timeSelect']){$(id).innerHTML=`<option value="">${esc(t('Veri bekleniyor','Awaiting data'))}</option>`;$(id).disabled=true;}
  $('layerStatus').textContent=t('Veri henüz entegre edilmedi. Haritada yalnızca altlık gösteriliyor.','Data not yet integrated. Only the basemap is displayed.');$('layerMetadata').textContent='';scienceMap?.clear();
}
async function selectDataset(){
  const generation=++selectionGeneration,id=$('datasetSelect').value;activeDataset=null;emptyLayer();if(!id)return;
  try{
    const bundled=entries.find(e=>e.id===id&&e.bundled),dataset=bundled||await repository.get(id);if(generation!==selectionGeneration)return;if(!dataset)throw new Error('Dataset is unavailable');activeDataset=dataset;
    if(bundled){$('variableSelect').innerHTML=dataset.metadata.variables.map(v=>`<option value="${esc(v.key)}">${esc(variableLabel(v.key)+' · '+v.units)}</option>`).join('');$('variableSelect').disabled=false;$('timeSelect').innerHTML=dataset.manifest.timeSlices.map(s=>`<option value="${esc(s.time)}">${esc(s.id.slice(0,4)+'-'+s.id.slice(4)+' · '+(dataset.manifest.kind==='currents'?wt('monthly'):et('period')))}</option>`).join('');$('timeSelect').disabled=false;renderLayer();fitSource();return;}
    $('variableSelect').innerHTML=dataset.metadata.variables.map(v=>`<option value="${esc(v.key)}">${esc(v.key+' · '+v.units)}</option>`).join('');$('variableSelect').disabled=false;
    const rows=dataset.representation==='points'?dataset.records:dataset.data.features.map(f=>f.properties),times=[...new Set(rows.map(r=>r.time))].sort();
    $('timeSelect').innerHTML=times.map(time=>`<option value="${esc(time)}">${esc(time)}</option>`).join('');$('timeSelect').disabled=false;renderLayer();
  }catch(error){$('layerStatus').textContent=t('Veri okunamadı: ','Could not read the dataset: ')+I18n.english(error.message);}
}
function initOcean(){
  if(!scienceMap){if(!window.L){$('layerStatus').textContent=t('Harita kitaplığı yüklenemedi.','Map library could not be loaded.');return;}scienceMap=new ScienceMap(window.L,'scienceMap');environmentalLayer=new EnvironmentalMapLayer(window.L,scienceMap.map,environmentalRepository);const target=document.createElement('div');target.className='environment-inspector';$('layerMetadata').after(target);environmentalInspector=new EnvironmentalInspector(target,environmentalDataService,{onPoint:()=>openMapPanel('query'),shouldHandleMapClick:()=>$('oceanPanel').hidden||!['protection','traffic'].includes($('oceanPanel').dataset.view)});observations.attachMap(scienceMap.map);sharedObservations.attachMap(scienceMap.map);protectedAreas.attachMap(scienceMap.map);traffic.attachMap(scienceMap.map);}
  requestAnimationFrame(()=>scienceMap.map.invalidateSize());
}
async function renderLayer(){
  if(!activeDataset||document.body.dataset.page!=='ocean')return;initOcean();if(!scienceMap)return;
  const generation=++layerGeneration;
  if(activeDataset.bundled){
    const dataset=activeDataset,variable=$('variableSelect').value,timeSlice=dataset.manifest.timeSlices.find(s=>s.time===$('timeSelect').value);if(!timeSlice)return;
    const currents=dataset.manifest.kind==='currents',period=currents?wt('monthly'):et('period');scienceMap.clear();document.querySelector('#page-ocean .basemap-notice').hidden=true;document.querySelector('#page-ocean .chart-caption').textContent='WGS 84 · '+(currents?'Copernicus Marine':'DMI / C3S')+' · 2025';$('oceanHeading').textContent=wt(currents?dataset.manifest.region.replace('-','_'):'north_atlantic');environmentalInspector.update({dataset,variable,timeSlice,map:scienceMap.map});$('layerMetadata').textContent='';$('layerStatus').textContent=period+' · '+et('integrated');observations.syncPeriod(timeSlice.id.slice(0,4)+'-'+timeSlice.id.slice(4));updateMapChrome();
    try{await environmentalLayer.show(dataset.id,variable,timeSlice.id,{showVectors:$('showCurrentVectors').checked});environmentalLayer.setOpacity(Number($('environmentOpacity').value));if(generation!==layerGeneration)return;$('layerStatus').textContent=period+' · '+timeSlice.id.slice(0,4)+'-'+timeSlice.id.slice(4);}
    catch{if(generation===layerGeneration)$('layerStatus').textContent=et('error');}
    return;
  }
  document.querySelector('#page-ocean .basemap-notice').hidden=false;document.querySelector('#page-ocean .chart-caption').textContent='WGS 84 · '+t('Altlık harita','Basemap');environmentalLayer?.clear();environmentalInspector?.clear();
  const result=scienceMap.show(activeDataset,$('variableSelect').value,$('timeSelect').value);
  $('layerStatus').textContent=result.status==='displayed'?t('Çizilen kaynak öğesi / eksik değer: ','Displayed source features / missing values: ')+result.count+' / '+result.missing:result.status==='too_large'?t('Bu seçim görüntüleme sınırını aşıyor. Sessizce veri azaltılmadı; bölgesel bir paket veya karo bağdaştırıcısı gerekli.','This selection exceeds the display limit. No records were silently dropped; a regional package or tile adapter is required.'):t('Bu zaman ve değişken için geçerli ölçüm yok.','No valid measurements for this time and variable.');
  $('layerMetadata').innerHTML=table([[t('Kaynak','Source'),activeDataset.metadata.source.provider],[t('Değişken','Variable'),$('variableSelect').selectedOptions[0]?.textContent],[t('Zaman','Time'),$('timeSelect').value],[t('İnceleme','Review'),t('Teknik kontrol · Bilimsel onay yok','Technical checks · Not scientifically approved')]]);
}
function measureHeading(){requestAnimationFrame(()=>{if(document.body.dataset.page==='ocean')scienceMap?.map.invalidateSize();});}
function openMapPanel(view){if(!['layers','query','observations','protection','traffic'].includes(view))return;if(document.body.dataset.page!=='ocean')location.hash='ocean';$('oceanPanel').hidden=false;$('oceanPanel').dataset.view=view;if(view==='observations')sharedObservations.activate();$('mapPanelTitle').textContent=view==='traffic'?tt('title'):view==='protection'?pt('protection'):wt(view==='query'?'point':view);document.querySelectorAll('[data-map-panel]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.mapPanel===view)));}
function closeMapPanel(){const view=$('oceanPanel').dataset.view;$('oceanPanel').hidden=true;document.querySelectorAll('[data-map-panel]').forEach(b=>b.setAttribute('aria-expanded','false'));document.querySelector('.map-command-bar [data-map-panel="'+view+'"]')?.focus();}
function fitSource(){if(!scienceMap||!activeDataset?.bundled)return;const b=activeDataset.manifest.grid.bounds;if(b)scienceMap.map.fitBounds([[b[1],b[0]],[b[3],b[2]]],{padding:[45,45],maxZoom:6});else scienceMap.map.setView([42,-40],3);}
function updateMapChrome(){document.querySelectorAll('[data-traffic-label]').forEach(e=>e.textContent=tt(e.dataset.trafficLabel));document.querySelectorAll('[data-protection-label]').forEach(e=>e.textContent=pt(e.dataset.protectionLabel));document.querySelectorAll('[data-workbench-label]').forEach(e=>e.textContent=wt(e.dataset.workbenchLabel));$('fitScienceMap').setAttribute('aria-label',wt('fit'));$('closeOceanPanel').setAttribute('aria-label',wt('close'));$('mapPanelTitle').textContent=$('oceanPanel').dataset.view==='traffic'?tt('title'):$('oceanPanel').dataset.view==='protection'?pt('protection'):wt($('oceanPanel').dataset.view==='query'?'point':$('oceanPanel').dataset.view);document.querySelector('.map-point-hint').textContent=wt('pointHint');const d=activeDataset;if(!d?.bundled)return;$('currentVectorControl').hidden=d.manifest.kind!=='currents';const variable=$('variableSelect').value,s=d.manifest.timeSlices.find(s=>s.time===$('timeSelect').value),scale=d.manifest.scales[variable];if(!s||!scale)return;$('mapLayerSummary').textContent=variableLabel(variable)+' · '+(scale.units||'');$('previousSourceMonth').setAttribute('aria-label',wt('previousMonth'));$('nextSourceMonth').setAttribute('aria-label',wt('nextMonth'));$('previousSourceMonth').disabled=$('timeSelect').selectedIndex<=0;$('nextSourceMonth').disabled=$('timeSelect').selectedIndex>=$('timeSelect').options.length-1;$('mapPeriodSummary').textContent=s.id.slice(0,4)+'-'+s.id.slice(4)+' · '+(d.manifest.kind==='currents'?wt('monthly'):'DMI / C3S');document.querySelector('.map-mini-legend').innerHTML=`<strong>${esc(variableLabel(variable))}</strong><div class="environment-colorbar ${d.manifest.kind==='currents'?(variable==='current_speed'?'current':'divergent'):variable==='sea_ice_fraction'?'ice':variable==='sst_uncertainty'?'uncertainty':''}"></div><div class="environment-scale"><span>${esc(scale.min??'1')}</span><span>${esc(scale.max??'9')} ${esc(scale.units||'')}</span></div>`;}
function pageChange(page=document.body.dataset.page||location.hash.slice(1)||'home'){
  const section=['data','archive','species','hydra'].includes(page)?'data':['analysis','route','fuel','voyage'].includes(page)?'route':page;
  document.querySelectorAll('[data-section]').forEach(a=>{const active=a.dataset.section===section;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.querySelectorAll('[data-data-page]').forEach(a=>{const active=a.dataset.dataPage===page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const titles={ocean:'Harita',route:'Rota',analysis:'Konum analizi',library:'Kayıtlar',data:'Veriler',species:'Tür modelleri',hydra:'HYDRA 2.0',fuel:'Yakıt & karbon',voyage:'Sefer karşılaştırması',archive:'Veri ve yöntem'};
  $('workspaceBreadcrumb').innerHTML=`<span>${esc(I18n.translate('Çalışma alanı'))}</span><i>/</i><strong>${esc(page==='voyage'?voyageMessage('title',I18n.language):I18n.translate(titles[page]||'Çalışma alanı'))}</strong>`;
  measureHeading();if(page==='ocean'){initOcean();if(activeDataset)renderLayer();}
}
function render(){renderCatalog();renderModels();renderSaved();renderIntake();populateDatasetSelect();pageChange();}
$('openIntake').addEventListener('click',()=>$('intakeDialog').showModal());
$('closeIntake').addEventListener('click',()=>$('intakeDialog').close());
$('legacyMetadata').addEventListener('click',()=>showMetadata());$('closeMetadata').addEventListener('click',()=>$('metadataDialog').close());
$('chooseScienceFile').addEventListener('click',()=>$('scienceFile').click());
$('scienceFile').addEventListener('change',e=>inspectSelection(e.target.files[0]));$('commitDataset').addEventListener('click',savePrepared);
$('datasetSelect').dataset.userContent='';$('variableSelect').dataset.userContent='';$('timeSelect').dataset.userContent='';
$('datasetSelect').addEventListener('change',selectDataset);$('variableSelect').addEventListener('change',renderLayer);$('showCurrentVectors').addEventListener('change',renderLayer);$('timeSelect').addEventListener('change',renderLayer);
$('savedDatasets').addEventListener('click',async e=>{
  const metadata=e.target.closest('[data-metadata]');if(metadata){const entry=entries.find(x=>x.id===metadata.dataset.metadata);if(entry)showMetadata(entry.metadata);}
  const backup=e.target.closest('[data-backup]');if(backup)try{const saved=await repository.backup(backup.dataset.backup);if(!saved)throw new Error('Original package is unavailable');const url=URL.createObjectURL(saved.blob),a=document.createElement('a');a.href=url;a.download=saved.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}catch(error){$('intakeStatus').textContent=I18n.english(error.message);}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-map-panel]');if(b)openMapPanel(b.dataset.mapPanel);});$('geographicSearchForm').addEventListener('submit',e=>{e.preventDefault();const form=e.target,lat=Number(form.elements.latitude.value),lon=Number(form.elements.longitude.value);if(![lat,lon].every(Number.isFinite)||Math.abs(lat)>85.05||Math.abs(lon)>180){$('geographicSearchStatus').textContent=tt('invalidSearch');return;}initOcean();if(!scienceMap)return;searchMarker?.remove();searchMarker=L.circleMarker([lat,lon],{radius:6,color:'#fff',weight:2,fillColor:'#16877e',fillOpacity:1}).addTo(scienceMap.map);scienceMap.map.setView([lat,lon],7);$('geographicSearchStatus').textContent=lat.toFixed(5)+' / '+lon.toFixed(5);});$('environmentOpacity').addEventListener('input',e=>environmentalLayer?.setOpacity(Number(e.target.value)));$('closeOceanPanel').addEventListener('click',closeMapPanel);$('fitScienceMap').addEventListener('click',fitSource);for(const [id,step]of [['previousSourceMonth',-1],['nextSourceMonth',1]])$(id).addEventListener('click',()=>{const select=$('timeSelect'),index=select.selectedIndex+step;if(index>=0&&index<select.options.length){select.selectedIndex=index;renderLayer();}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.dataset.page==='ocean'&&!$('oceanPanel').hidden)closeMapPanel();});
window.addEventListener('walerter:pagechange',e=>pageChange(e.detail.page));window.addEventListener('languagechange',()=>{render();if(activeDataset?.bundled){for(const option of $('variableSelect').options)option.textContent=variableLabel(option.value)+' · '+activeDataset.metadata.variables.find(v=>v.key===option.value).units;for(const option of $('timeSelect').options){const s=activeDataset.manifest.timeSlices.find(s=>s.time===option.value);option.textContent=s.id.slice(0,4)+'-'+s.id.slice(4)+' · '+(activeDataset.manifest.kind==='currents'?wt('monthly'):et('period'));}if(environmentalInspector?.context)environmentalInspector.render();}updateMapChrome();observations.render();sharedObservations.render();protectedAreas.render();traffic.render();if($('metadataDialog').open)$('metadataDialog').close();});window.addEventListener('resize',measureHeading);
const observer=new ResizeObserver(measureHeading);document.querySelectorAll('.science-heading,.content-heading,.workspace-heading').forEach(el=>observer.observe(el));
document.fonts?.ready.then(measureHeading);render();updateMapChrome();refreshEntries();observations.restore();sharedObservations.restore();protectedAreas.restore();
