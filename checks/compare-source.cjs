const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const html=fs.readFileSync('checks/reference-original.html','utf8');
const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const els={};const el=id=>els[id]??(els[id]={value:'',innerText:'',innerHTML:'',className:'',classList:{add(){},remove(){},toggle(){}}});
const original=vm.createContext({window:{},document:{getElementById:el},lucide:{createIcons(){}},L:{polyline(){return{addTo(){return this;},getBounds(){return[];}}}}});
vm.runInContext(source,original);vm.runInContext('updateMarker=()=>{}; maps.analysis={flyTo(){}}; maps.route={removeLayer(){},fitBounds(){}};',original);
const current=vm.createContext({});vm.runInContext(fs.readFileSync('dist/model.js','utf8'),current);
assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(ARSIV)',current)),JSON.parse(vm.runInContext('JSON.stringify(ARSIV)',original)));
let count=0;
for(const month of ['Ekim','Kasım','Aralık','Ocak']){
 const reference=vm.runInContext(`ARSIV[${JSON.stringify(month)}]`,original);
 for(const ratio of [0,.1,.499999,.5,1,1.249999,1.25,1.799999,1.8,2,10]){
  const chlo=reference*ratio;el('analysisMonth').value=month;el('analysisLat').value='-64.77';el('analysisLon').value='-64.05';el('analysisChlo').value=String(chlo);
  vm.runInContext('runPointAnalysis()',original);current.input={month,chlo};
  const result=vm.runInContext('pointModel(input.month,input.chlo)',current);
  assert.equal(result.rate+'%',el('whalePassRate').innerText);
  assert.equal({normal:'NORMAL SEYİR',moderate:'ORTA RİSK',critical:'KRİTİK RİSK'}[result.level],el('pointResultTitle').innerText);count++;
 }
 for(const points of [[],[{lat:-64.77,lon:-64.05,klor:.55}],[{lat:-64.77,lon:-64.05,klor:.55},{lat:-65.1,lon:-64.4,klor:.8}],[{lat:-64.77,lon:-64.05,klor:.1},{lat:-65.1,lon:-64.4,klor:.8},{lat:-65.3,lon:-64.7,klor:.2}]]){
  const prior=points.map(p=>({...p,durum:p.klor/reference>=1.25?'RISKLI':'GUVENLI'}));original.input=prior;vm.runInContext('routeData=input; calculateFullRoute()',original);
  current.input={points,month};const result=vm.runInContext('routeModel(input.points,input.month)',current);
  if(points.length>=2){assert.equal(result.totalDist.toFixed(2)+' NM',el('totalNM').innerText);assert.equal(result.riskDist.toFixed(2)+' NM',el('riskNM').innerText);assert.equal(result.fuelSaving.toFixed(1)+' L',el('fuelSaving').innerText);}else{assert.equal(result.totalDist,0);assert.equal(result.riskDist,0);}count++;
 }
}
for(const pair of [[-64.77,-64.05,-65.1,-64.4],[0,0,0,0],[-90,0,90,0],[45,-180,-45,180]]){original.pair=pair;current.pair=pair;assert.equal(vm.runInContext('calculateDistance(...pair)',original),vm.runInContext('calculateDistance(...pair)',current));count++;}
console.log(`PASS: unchanged 4 monthly references; ${count} source comparisons passed (44 point analyses, 16 routes, 4 distance cases).`);
