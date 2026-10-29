const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync('dist/workspace.js','utf8'),memory=new Map();let rejectWrites=false;
const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>{if(rejectWrites)throw Error('quota');memory.set(key,value);}};
function open(fallback=false){const c=vm.createContext({localStorage:storage,crypto:fallback?{getRandomValues:a=>crypto.webcrypto.getRandomValues(a)}:crypto.webcrypto,Uint8Array});vm.runInContext(source,c);return vm.runInContext('Workspace',c);}
const json=value=>JSON.parse(JSON.stringify(value));let w=open();const points=[{lat:-64.77,lon:-64.05,klor:0},{lat:-65.1,lon:-64.4,klor:.8}],draft={name:'Antarktika <sefer>',month:'Ekim',points,routeId:null};
assert.equal(w.setDraft(draft),true);assert.deepEqual(json(open().snapshot().draft),draft);
const saved=w.saveRoute(draft,'Güney Okyanusu');assert.equal(open().snapshot().routes.length,1);assert.equal(saved.points[0].klor,0);
const updated=w.saveRoute({...draft,routeId:saved.id},'Güncellenen sefer');assert.equal(updated.id,saved.id);assert.equal(open().snapshot().routes.length,1);assert.equal(open().snapshot().routes[0].name,'Güncellenen sefer');
const exported=w.exportRoute(draft),imported=w.parseImport(exported);assert.deepEqual(json(imported),{name:draft.name,month:draft.month,points});assert(!exported.includes('ARSIV'));
assert.throws(()=>w.parseImport('{'));assert.throws(()=>w.parseImport(JSON.stringify({format:'other',version:1,...draft})));assert.throws(()=>w.parseImport(JSON.stringify({format:'w-alerter-route',version:1,...draft,month:'Mart'})));assert.throws(()=>w.parseImport(JSON.stringify({format:'w-alerter-route',version:1,...draft,points:[{lat:91,lon:1,klor:1}]})));assert.throws(()=>w.parseImport(JSON.stringify({format:'w-alerter-route',version:1,...draft,points:[{lat:1,lon:1,klor:-1}]})));
assert.equal(w.addObservation({month:'Ekim',...points[1]}),true);assert.equal(open().snapshot().observations.length,1);
w=open(true);assert.equal(w.addObservation({month:'Ocak',...points[0]}),true);assert.match(w.snapshot().observations[0].id,/^wa-[0-9a-f]{32}$/);
const before=json(w.snapshot());rejectWrites=true;assert.throws(()=>w.saveRoute({...draft,routeId:null},'Kaydedilmemeli'));assert.deepEqual(json(w.snapshot()),before);assert.equal(w.removeRoute(saved.id),false);assert.equal(w.snapshot().routes.length,1);rejectWrites=false;assert.equal(w.removeRoute(saved.id),true);assert.equal(open().snapshot().routes.length,0);
memory.set('w-alerter.workspace.v2','invalid');assert.equal(open().snapshot().routes.length,0);
console.log('PASS: persistence/reload, route updates, JSON round-trip, malformed imports, invalid coordinates/measurements, observation history, UUID fallback, quota rollback and damaged storage recovery.');
