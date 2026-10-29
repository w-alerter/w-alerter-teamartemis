const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function translator(search='',saved='en'){
  const ctx=vm.createContext({document:{readyState:'loading',addEventListener(){}},location:{search},localStorage:{getItem(){return saved;}},URLSearchParams});
  vm.runInContext(fs.readFileSync('dist/locales.js','utf8'),ctx);
  vm.runInContext(fs.readFileSync('dist/i18n.js','utf8'),ctx);
  return vm.runInContext('I18n',ctx);
}
const en=translator(),tr=translator('?lang=tr'),shared=translator('?lang=en','tr');
assert.equal(en.locale,'en-GB');assert.equal(tr.locale,'tr-TR');assert.equal(shared.language,'en');
for(const [source,expected] of [
  ['Kasım','November'],['KASIM','NOVEMBER'],['  Orta risk  ','  Moderate risk  '],
  ['2. noktayı yukarı taşı','Move waypoint 2 up'],['Nokta 12','Waypoint 12'],
  ['Kasım · 0.55 mg/m³','November · 0.55 mg/m³'],['64.8000° G / 63.9000° B','64.8000° S / 63.9000° W'],
  ['Kasım ayını analiz et','Analyze November'],['0.3253 mg/m³','0.3253 mg/m³']
]){assert.equal(en.translate(source),expected);assert.equal(tr.translate(source),source);}
const html=fs.readFileSync('dist/index.html','utf8').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
const candidates=[...html.matchAll(/>([^<>]+)</g)].map(m=>m[1]).concat([...html.matchAll(/(?:aria-label|placeholder|title|alt)="([^"]+)"/g)].map(m=>m[1]));
const leftovers=candidates.map(s=>s.trim()).filter(Boolean).filter(s=>!['Türkçe','English','Deutsch','Français','Español'].includes(s)).map(s=>en.translate(s)).filter(s=>/[çğıöşüÇĞİÖŞÜ]/u.test(s));
assert.deepEqual(leftovers,[],`Untranslated interface text: ${leftovers.join(' | ')}`);
console.log('PASS: language preference/query precedence, numeric and month fidelity, dynamic labels, coordinates, and static interface translation coverage.');

// Every new language has an explicit translation for each existing interface phrase.
const resourceContext=vm.createContext({});vm.runInContext(fs.readFileSync('dist/locales.js','utf8'),resourceContext);
const resources=vm.runInContext('WA_TRANSLATIONS',resourceContext);
const expected={de:{locale:'de-DE',hero:'Ihr Ozean.',month:'November',move:'Wegpunkt 2 nach oben'},fr:{locale:'fr-FR',hero:'Leur océan.',month:'Novembre',move:'Monter le point 2'},es:{locale:'es-ES',hero:'Su océano.',month:'Noviembre',move:'Subir el punto 2'}};
for(const [lang,e] of Object.entries(expected)){
 const active=translator('?lang='+lang,'tr');assert.equal(active.language,lang);assert.equal(active.locale,e.locale);
 assert.equal(active.translate('Onların okyanusu.'),e.hero);
 assert.equal(active.translate('Kasım · 0.55 mg/m³'),e.month+' · 0.55 mg/m³');
 assert.equal(active.translate('2. noktayı yukarı taşı'),e.move);
 assert.equal(active.translate('0.3253 mg/m³'),'0.3253 mg/m³');
 assert.equal(active.translate('64.8000° G / 63.9000° B'),'64.8000° S / 63.9000° W');
 assert.equal(translator('',lang).language,lang,'Saved preference is supported');
 for(const phrase of Object.values(en.dictionary).filter(Boolean))assert(Object.hasOwn(resources[lang],phrase.trim()),lang+' missing '+phrase);
 assert.notEqual(active.message('Veri henüz entegre edilmedi','Data not yet integrated'),'Data not yet integrated');
 assert(active.message('Kayıt / eksik değer: ','Records / missing values: ').endsWith(' '),'Prefix spacing is preserved');
 const exported=active.translate('Antarktika · Kasım dönemi · 2 geçiş noktası');assert(exported.includes(e.month));assert(!/[ıİğĞşŞ]/u.test(exported));
}
assert.equal(Object.keys(en.languages).length,5);
assert.deepEqual([...html.matchAll(/<option value="(tr|en|de|fr|es)"/g)].map(m=>m[1]),['tr','en','de','fr','es']);
assert.equal(translator('?lang=unknown','fr').language,'fr');
console.log('PASS: all 5 locales, DE/FR/ES dictionary coverage, saved/query preferences, dynamic waypoint labels, export text and exact scientific values/units.');
