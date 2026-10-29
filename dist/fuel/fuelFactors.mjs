/* Published conversion factors, not a claim of IMO approval of this application. */
export const SOURCES = Object.freeze({
  ghg2020: Object.freeze({title:'Fourth IMO GHG Study 2020',version:'2020',url:'https://greenvoyage2050.imo.org/wp-content/uploads/2021/07/Fourth-IMO-GHG-Study-2020-Full-report-and-annexes_compressed.pdf',sections:'Chapter 2, printed pp. 64, 70–72; equations 8–13; Appendix B'}),
  mepc308: Object.freeze({title:'IMO MEPC.308(73)',version:'2018-10-26',url:'https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MEPCDocuments/MEPC.308(73).pdf',sections:'Section 2.2.1, Annex printed pp. 5–6 (PDF pp. 6–7)'})
});
export const FACTOR_VERSION='mepc308-73-2018-pinned-v1';
export const FUEL_FACTORS=Object.freeze(Object.fromEntries([
  ['diesel','Marine Diesel / Gas Oil',3.206,true],['lfo','Light Fuel Oil',3.151,true],
  ['hfo','Heavy Fuel Oil',3.114,true],['lng','LNG',2.750,false],['methanol','Methanol',1.375,false]
].map(([id,name,kgCO2PerKg,consumptionSupported])=>[id,Object.freeze({id,name,kgCO2PerKg,units:'kg CO2 / kg fuel',consumptionSupported,source:'IMO MEPC.308(73) §2.2.1',sourceVersion:'2018-10-26',factorVersion:FACTOR_VERSION})])));
export const ENGINE_MODEL=Object.freeze({id:'wa-calm-water-diesel',version:'1.0.0',powerExponent:3,sfocQuadratic:0.455,sfocLinear:-0.710,sfocConstant:1.280,minimumGenericLoad:0.07,maximumLoad:1,source:SOURCES.ghg2020});
export function fuelFactor(id){const factor=FUEL_FACTORS[id];if(!factor)throw new Error('unknown_fuel');return factor;}
export const kgToTonnes=kg=>kg/1000;
