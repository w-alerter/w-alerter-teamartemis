# W-ALERTER 2.0

Existing static Site extended with scientific-data intake contracts, provenance, separate species model registrations and a HYDRA engine extension point. Turkish, English, German, French and Spanish; one navy, glacier-white and sea-green visual language.

`dist/marine.css` provides the shared typography and visual layer. DM Sans weights 500–800 and a 600 italic face are bundled for Latin and Latin Extended characters, with their SIL Open Font License in `dist/assets/fonts/DM-Sans-OFL.txt`. Interface fonts load locally; headings, controls and data values have distinct sizes and weights.

## Preserved behavior

`dist/model.js` and `dist/workspace.js` are byte-identical to the previous working version. Four monthly chlorophyll references, thresholds, Haversine routes, browser records and exports are preserved. Legacy indicators are labelled with their limits.

The original HTML used ordered-waypoint routing. The current site now includes a separately versioned, tested16-direction geometric A* engine with conservative land/static-ice masking. It is not the missing historical ecological engine and does not certify navigational safety. Source-aware corridor/speed comparisons are implemented in `dist/voyage/`.

## Data status

Only four constants attributed to NASA MODIS-Aqua are present. Raw satellite files, exact years, footprint, product/version and license have not been supplied. The twelve supplied 2025 C3S/DMI SST files are now integrated as explicitly bounded time means, with source-metadata conflict warnings. Four 2025 CMEMS current files now provide native queries and map vectors for the western North Atlantic and Antarctic regions. Happywhale DwC-A is supported through a browser-local research reader; NC coordinates are not redistributed in the commercial package. The actual NOAA2025 AIS GeoTIFF is integrated as native annual counts for an explicitly bounded western North Atlantic pilot; other regions remain unavailable to the public subset. PACE, Calanus, raw chlorophyll-a, bathymetry and verified regulations remain pending. No new habitat or ecological-risk results are produced. Vessel-based fuel and direct CO₂ estimates now require explicit technical inputs in the independent Fuel & Carbon module; they do not infer new biological observations.

`dist/science/` provides catalog/metadata contracts, strict normalized-package validation, SHA-256, separate browser-local IndexedDB storage, source-feature rendering and documented species/routing/cost registration interfaces. Technical acceptance is separate from scientific model review. Raw NetCDF/HDF/CSV/plain GeoJSON need file-specific adapters. No missing-to-zero conversion or undocumented interpolation is performed. Explicitly labeled map aggregation and route midpoint sampling are separate from native point queries.

This is a buildless static Site. Python is optional for offline source inventory. No scientific backend or shared user database is deployed. The common static environmental repository serves optimized SST and current assets; processing remains offline.

Language choice is saved locally and can be shared with a URL such as `?lang=fr` (supported values: `tr`, `en`, `de`, `fr`, `es`). The compact native selector is keyboard accessible. Canonical month keys, scientific values and user content are preserved; dates follow the chosen locale.

## Checks

```sh
node checks/compare-source.cjs
node checks/workspace.cjs
node checks/exporters.cjs
node checks/i18n.cjs
node checks/science.mjs
python -m py_compile tools/inspect_sst.py
python tools/inspect_sst.py --help
```

Existing numerical tests compare the original source. New checks use source files and rejection cases, without generating scientific measurements. Actual-file tests cover the supplied SST/current sources and the original Happywhale archive; browser tests cover source queries, projections, local research intake and responsive controls.

## Documentation

- [Architecture, audit and limitations](docs/WALERTER_2_ARCHITECTURE.md)
- [First SST integration workflow](docs/FIRST_SST_INTEGRATION.md)
- [Normalized package contract](dist/science/dataset.schema.json)

New packages are stored locally in IndexedDB; voyage records retain the original localStorage key. Back up imported package files and route JSON. Validated biology, the actual HYDRA engine and large-data services remain future integrations.

## Workspace navigation

The public page opens a chart-centred workspace. Four primary destinations stay in one persistent menu: Map, Route, Records and Data. Location analysis is a Route mode. Sources, species, HYDRA and methodology form the Data section. Desktop uses a side rail; mobile uses the same four destinations in a bottom bar. Existing hash links remain valid. Data intake is a focused dialog; pending scientific modules keep their honest status. The whale hero image and its layout are preserved.

## Fuel & Carbon Intelligence

Open Route → Fuel & carbon (`#fuel`). Create a vessel profile, then supply a UTC departure and a route in the existing waypoint planner. The new independent model calculates geometry/speed-based segment durations, reference-load-adjusted engine power, selected SFOC, modeled fuel mass, direct combustion CO₂ and fuel-only cost when prices are supplied. Unknown auxiliary consumption remains null; no whole-vessel total or invented accuracy is claimed.

Profiles, revisions, inputs and saved calculation snapshots use the separate localStorage key `w-alerter.fuel-carbon.v1`. They can be backed up as JSON; deletion is reversible and does not remove old calculation snapshots. The five interface languages, brand lockup, NASA references and legacy calculations remain.

Verified-reference/HYDRA comparison requires real, documented source routes. The HYDRA A* source is still absent; no replacement algorithm or ecological result is invented. The existing registry now provides a successful-plan observer, connected to the fuel engine without bypassing its scientific-review gates. A strict actual-output import contract supports source outputs until the real implementation is supplied. Fuel/CO₂ are not yet optimizer cost terms.

- [Fuel/carbon methodology and real-route contract](docs/fuel-carbon-methodology.md)
- Independent numerical/integration checks: `node --test checks/fuel-carbon.mjs`
- Isolated UI test source: `checks/fuel-browser.html` (serve a temporary copy from the static root for internal browser QA; never deploy it). Artificial fixtures are confined to check files and isolated browser storage.

## Shared 2025 environmental SST

The map now exposes the 12 audited C3S/DMI source periods, SST, source error, sea-ice fraction and averaged source masks. The shared `EnvironmentalDataRepository` and `EnvironmentalDataService` are exported from `dist/environment/index.mjs` and available through `WAScience`. Species registries use this single service; no habitat method is enabled.

- [Full source audit, temporal conflicts, distribution scope and query contract](docs/SST_2025_INTEGRATION.md)
- Offline generation: `python tools/preprocess_sst.py`
- Actual-source checks: `python checks/test_sst_preprocess.py` and `node --test checks/environment.mjs`
- Originals are preserved under the ignored `data/raw/sst/2025/` path. Only processed assets under `dist/data/environment/` are published. Point coverage is regional at 0.05°; the explicitly sampled global display is 0.25°.

Dates are never silently replaced. Representative-time matching is strict by default; interval-mean lookup requires the explicit `temporalMode: 'interval-mean'` option. Source time bounds and stale daily global attributes are retained together. See the report before interpreting these as complete calendar-month averages or direct observations.

## Currents and local observations

The map uses a compact rail, three explicit tools and a closable detail drawer. Current magnitude, u/v components and optional direction arrows share the environmental repository. Month navigation, native point queries and source metadata are retained; no new biological or fuel-saving forecast is inferred. The original whale landing remains.

Open Observations to read the supplied Happywhale ZIP locally. Its picture licence field does not override the dataset CC BY-NC policy. The original archive/coordinates are not published. The reader keeps uncertainty, source dates and species separate, and can explicitly match a selected record to the shared SST/current service.

- [Currents, licensing, privacy, architecture and verification](docs/CURRENTS_OBSERVATIONS_INTEGRATION.md)
- Generation: `python tools/preprocess_currents.py`
- Tests: `python checks/test_currents_preprocess.py`; `node --test checks/currents.mjs checks/observations.mjs`
- Browser QA sources: `checks/workbench-browser.html` and `checks/environment-browser.html`; temporary copies are excluded from publishing.

## Korunan alanlar ve A* rota düzeltmesi

Kara üzerinden geçen düz çizgi, kaynaklı engel ağı üzerinde 16 komşulu A* mesafe moduyla değiştirildi. GPX/JSON/rapor ve yakıt girdileri aynı hesaplanan geometriyi kullanır. Bu mod güncel seyir/buz/derinlik veya ekolojik optimizasyon onayı değildir. Protected Planet ZIP arşivi, lisans koşulları nedeniyle yalnızca yerel ticari olmayan araştırma katmanında açılır; 37 kayıt/35 alan doğrulandı, sınırlar dağıtılmaz. NASA klorofil-a ham dosyası hâlâ mevcut değil; dört sabit referans korunuyor.

Ayrıntı, kaynak özetleri ve testler: [PROTECTION_ASTAR_INTEGRATION.md](docs/PROTECTION_ASTAR_INTEGRATION.md).

### Shared species observations · 2026-10 intake

- Real-source inspection: 741,264 rows from four unique OBIS species exports and NOAA RWSAS. Identical humpback and WDPA archives are counted once.
- Public map: 38,943 explicitly CC0 OBIS records plus 12,651 checked historical NOAA records. Non-CC0 rows stay outside public assets under OBIS redistribution terms; missing/sign-conflicting coordinates and flagged NOAA duplicates are quarantined offline.
- Shared access: `WAScience.observationDataService.query({speciesId,year,month,source,recordType,presence,certainty,bounds,date})`; results carry records, source metadata, date precision and unknown uncertainty. Models use `SpeciesModels.observationInputs()`. No abundance or habitat probabilities are inferred.
- Offline ingestion: `python tools/preprocess_observations.py --input /absolute/path/to/uploads`. Originals remain in ignored `data/raw/observations/2026-10/`; only checksummed, lazy species/year chunks are served.
- Validation: `python checks/test_observation_preprocess.py`; `node --test checks/shared-observations.mjs`; browser QA in `checks/shared-observations-browser.html`.
- Full findings, source conditions, NASA chlorophyll-a status and Gemini/A* comparison: [SHARED_OBSERVATIONS_INTEGRATION.md](docs/SHARED_OBSERVATIONS_INTEGRATION.md).


## Source-aware voyage comparison and AIS (28 October2026)

- `dist/voyage/`: current triangle, STW power/SOG time integration, declared economics/annual scaling, published JOMOPANS-ECHO source scenarios, checked corridor candidates, explicit-weight ranking and a five-language dashboard at `#voyage`.
- `dist/traffic/`: shared annual AIS provider, native uint32 queries, checksums/LRU, logarithmic display and clear NoData/date/subset behavior. `getEnvironmentalValue("ais_transits",lat,lon,date,{temporalMode:"annual-background"})` uses the same service as SST/currents. No instantaneous vessels or speeds are inferred from annual counts.
- `dist/protection/route-intersections.mjs`: local original polygon/holes, per-area and union overlap distances; no invented point buffers or legal clearance.
- Methods and user workflow: [voyage methodology](dist/voyage/methodology.md). Full63-section implemented/partial/data-blocked status: [master implementation report](docs/MASTER_IMPLEMENTATION.md).
- New checks: `node --test checks/voyage.mjs checks/traffic.mjs checks/protection-route.mjs`; offline `python checks/test_ais_preprocess.py` and `python checks/test_protection_routes.py` (run Node protected-route tests first to prepare independent raw cases). Actual raw sources are required; they are never fetched implicitly by tests.
- Offline AIS: `python tools/preprocess_ais.py`; use `--region west south east north` for another explicitly declared subset. `--overview-only` rebuilds display from verified existing native tiles without altering source values. Conservative total public-data budget90MiB; per asset25MiB; files10000. Raw560MB TIFF/400MB ZIP remain ignored.
- Browser QA source `checks/voyage-browser.html` uses isolated disposable storage, real ocean cells and clearly marked synthetic vessel fixtures. It is never shipped in `dist/`.

No fitted independent species model, received-sound/behavior model or nautical depth/regulatory source has been fabricated. Their extension contracts are present; corresponding ecological or navigation claims stay gated.
