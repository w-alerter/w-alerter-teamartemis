import {inspectFile} from './pipeline.mjs';
/* Kept separate from w-alerter.workspace.v2. The UI never overwrites a dataset. */
export class DatasetRepository {
  constructor(indexedDB=globalThis.indexedDB){this.indexedDB=indexedDB;this.pending=null;}
  open(){
    if(!this.indexedDB)return Promise.reject(new Error('Browser dataset storage is unavailable'));
    if(!this.pending)this.pending=new Promise((resolve,reject)=>{
      const request=this.indexedDB.open('w-alerter-science',1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        db.createObjectStore('datasetIndex',{keyPath:'id'}).createIndex('packageHash','packageHash',{unique:true});
        db.createObjectStore('datasets',{keyPath:'id'});db.createObjectStore('originals',{keyPath:'id'});
      };
      request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();this.pending=null;};resolve(request.result);};
      request.onerror=()=>{this.pending=null;reject(request.error);};
      request.onblocked=()=>{this.pending=null;reject(new Error('Close other W-ALERTER tabs to open dataset storage'));};
    });return this.pending;
  }
  async read(store,key){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=key===undefined?tx.objectStore(store).getAll():tx.objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  list(){return this.read('datasetIndex');}
  async get(id){return (await this.read('datasets',id))?.dataset||null;}
  async backup(id){return (await this.read('originals',id))||null;}
  async save(prepared){
    if(prepared?.status!=='review_required'||!prepared.file)throw new Error('A reviewed original package is required');
    const fresh=await inspectFile(prepared.file);
    if(fresh.status!=='review_required'||fresh.packageHash!==prepared.packageHash||JSON.stringify(fresh.dataset)!==JSON.stringify(prepared.dataset))throw new Error('The package changed. Inspect it again before saving.');
    const db=await this.open(),{metadata}=fresh.dataset,id=metadata.id;
    const entry={id,metadata,representation:fresh.dataset.representation,recordCount:fresh.report.recordCount,missingCount:fresh.report.missingCount,validValueCount:fresh.report.validValueCount,packageHash:fresh.packageHash,importedAt:new Date().toISOString(),reviewStatus:'technical_only'};
    await new Promise((resolve,reject)=>{const tx=db.transaction(['datasetIndex','datasets','originals'],'readwrite');
      tx.objectStore('datasetIndex').add(entry);tx.objectStore('datasets').add({id,dataset:fresh.dataset});
      tx.objectStore('originals').add({id,name:prepared.file.name,blob:prepared.file,packageHash:fresh.packageHash});
      tx.oncomplete=resolve;tx.onerror=()=>reject(new Error(tx.error?.name==='ConstraintError'?'This identifier or exact file is already saved. Use a new identifier for a new version.':'The dataset could not be saved. Browser storage may be full.'));
      tx.onabort=()=>reject(new Error('Dataset save was rolled back; no existing data was replaced.'));
    });return entry;
  }
}
