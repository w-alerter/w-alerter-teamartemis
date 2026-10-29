# W-ALERTER 2.0 — master specification implementation

Working audit, 28 October 2026. Baseline: published Site version15, source552a132. Existing modules are retained. This record distinguishes software verification from empirical scientific validation.

## Initial audit and execution checklist

| Area / specification sections | Initial state | Action |
| --- | --- | --- |
| Brand, professional responsive UI, five languages (1–3,47–50) | Functional; buildless HTML/CSS/ES modules, local Leaflet1.9.4 | Preserve; add focused voyage comparison view and map controls |
| Repository / data audit (4–5) |98 code/config files; no Chart.js or GitHub Actions workflow; native static hosting | Reconcile current source, original-file access, licensing and package limits |
| Common environmental engine / SST (6–8) | Functional;12 real source periods, native queries, packing/time/mask checks | Reuse service; preserve source-mean caveats and exact missing-date behavior |
| Chlorophyll-a (9) | Four legacy constants; raw gridded source not found in checkout | Search prior uploads; no new measurements from constants |
| Currents (10) | Native monthly u/v + projection; disconnected from duration/fuel | Implement current-triangle sailing, month-boundary sampling and provenance |
| Bathymetry / official navigation constraints (11,26) | No verified depth/UKC/regulation provider | Add strict provider gates; never call mask-only routes navigation-cleared |
| Protected areas (12) | Local licensed polygon/point reader and point queries | Add route intersections, per-area distances and unique union distance |
| Species / observations (13–14) | Four supplied whale taxa;51,594 permitted public records; two additional model placeholders | Reuse; preserve date precision, absence/acoustic record type and unknown uncertainty |
| Habitat / validation / exposure (15–17,51) | No fitted and independently reviewed species model | Add strict fitted-model and route-exposure interfaces; do not invent coefficients or metrics |
| AIS / collision (18–19) | No raster in checkout | Search prior uploads; inspect actual raster before adding annual pressure; collision depends on reviewed habitat/speed model |
| NAVISON / acoustics (20–25,54) | No executable acoustic module | Read official June2025 revision; implement published JOMOPANS-ECHO source scenarios with author-reference checks; keep received/behavior effects gated |
| HYDRA (26–29,52) | Functional16-neighbour geometric A* and conservative supercover; no validated ecological costs | Preserve; compare checked candidate corridors; gate unsupported objectives and document bounded candidate scope |
| Vessel / fuel / CO2 (30–33,53) | Functional versioned diesel profiles, cubic model/SFOC/auxiliary/TTW CO2; simplified fuel duration | Extend categories and optional acoustic parameters; use STW for power and current-adjusted SOG for time |
| Economics (34–40,55) | Fuel-only cost and strict reviewed-route comparator | Add declared non-fuel costs, net benefit, annual scenarios and sensitivity without changing old comparator gates |
| Post-route dashboard (41–46) | Fragmented route/fuel screens | Aggregate supported results, source details, alternatives, explanations and explicit unavailable metrics |
| Engineering / reproducibility (56–59) | Independent modules and extensive source tests; raw files ignored | Retain static deployment; test units, source samples, race cancellation, exports and five-language UI |
| Business/KPI/scientific rules (60–63) | No fabricated achieved KPI claim permitted | Report actual scenario deltas, validation status and data-blocked requirements |

## Implementation sequence

1. Finish source inventory and retrieve previously supplied files when available.
2. Implement independently testable voyage physics, economics, acoustic source calculations, route/data sampling and strict ecological interfaces.
3. Connect checked A* alternatives to a shared result aggregator and comparison dashboard.
4. Verify with published reference calculations, actual source cells, geometry checks and browser tests; update status and publish.

No implementation stage may turn absent data into zero, an observation count into density, a source noise level into received exposure, or a cartographic land mask into certified navigational feasibility.

## Final delivery status

Implemented here means executable software with the stated tests, not empirical validation or permission to navigate. The final source extends version15 and preserves its raw-data/license gates and original calculation hashes.

| Specification sections | Result | Implemented behavior / remaining dependency |
| --- | --- | --- |
|1–3,60 Identity, users and positioning | Implemented | W-ALERTER remains visible beside the logo. Professional five-language scientific workbench; research scenario wording, no achieved KPI marketing claim. |
|4 Initial inspection | Implemented | Latest published source recovered and audited; actual uploaded sources opened, hashes checked. Existing functions, storage, exports and source restrictions retained. |
|5 Data inventory | Implemented | Original12SST+4current NetCDF sources verified; supplied AIS ZIP/TIFF, four whale source datasets, local Happywhale and WDPA inventoried. Metadata/provenance remain source-specific. |
|6 Common spatial architecture | Implemented | Shared environmental/observation repositories and services. `ais_transits` registers in the same environmental query interface. New route providers receive the same common services. |
|7 Temporal consistency | Implemented | Explicit source-interval SST, monthly current and annual AIS modes. No wrong-year/nearest-date substitution. Route integration splits at reached UTC month boundaries. |
|8 SST | Implemented | Actual12source files, epoch1981, packing/masks/ice/error/CF interval conflicts preserved; exact native queries and map layer retained. No invented complete-calendar-month label. |
|9 Chlorophyll-a | Data blocked | Four historical reference constants preserved. Raw gridded NASA product, years, coverage and processing/quality evidence absent; reference constants are not a raw environmental field. |
|10 Currents | Implemented | Actual four NetCDFs/two regions, native monthly vectors and map arrows; current triangle now changes travel time/fuel through SOG while STW drives power. Historical0.494m fields are not forecasts. |
|11 Bathymetry | Data blocked / contract | No nautical depth/datum/tidal/clearance input. Basemap shading is not a bathymetry provider. Navigation clearance stays false. |
|12 Protected areas | Implemented for supplied local subset | Per-polygon and union route overlap, holes/boundaries/date limitations; no invented radius for points. Source boundaries stay local because commercial distribution is not cleared. |
|13–14 Species and observations | Implemented for available records | Six target species remain distinct; four supplied whale taxa use51594permitted shared records. Record/date/absence/acoustic/uncertainty semantics retained. No invented Caretta/Delphinus observations. |
|15–17,51 Habitat modeling, validation and exposure | Interface implemented; fitted models blocked | Reviewed fitted-provider registration, training SHA, spatial/temporal holdouts and probability-calibration requirements; distance-weighted exposure and partial-coverage gates. No fitted model, AUC, density or occurrence percentage fabricated. |
|18 AIS | Implemented for explicit pilot | Actual560417801byte TIFF, EPSG3857 vs catalog4269 conflict,100projected-m uint32 native values, NoData0.219lossless query tiles and16×16max display; outside pilot/year unavailable. Annual counts are not live traffic or vessel speed. |
|19 Collision | Interface implemented; scientific result blocked | Reviewed habitat+traffic-exposure+speed-risk providers required. Relative exposure remains distinct from collision probability. Annual raster alone cannot supply the missing model. |
|20 Acoustic foundation | Implemented review | Actual NAVISON June2025-v2 read, source SHA recorded. PIANO database/calibration and propagation requirements identified. Literature references include JOMOPANS-ECHO and NOAA2024v3. |
|21 Vessel source noise | Implemented source scenario | Public JOMOPANS-ECHO class/length/SOG equations match36author calculator outputs. User applicability acknowledgement, explicit units and source-only interpretation. Not a PIANO replica or own-ship field calibration. |
|22 Sound propagation | Data/model blocked | Bathymetry, vertical sound-speed, seabed and validated propagation missing. No received SPL/SEL fabricated. |
|23 Acoustic sums | Implemented | Energy-domain compatible sums and time means; mixed source/received/frequency/period definitions rejected. |
|24 Species acoustic sensitivity | Reference mapping only | Documented hearing-group scope, Caretta outside marine-mammal guidance. No universal behavioral or injury threshold applied to source bands. |
|25 Acoustic route results | Partial, explicit | Nominal63/125Hz time-weighted source-band scenarios; received/behavior/injury effects unavailable. Acoustic risk is not an optimization objective. |
|26,52 Routing architecture and validation | Implemented existing geometric engine |16neighbours, admissible Haversine, conservative mask/supercover/corner/long-edge/post-shortening checks, no unsafe direct-line fallback. Original Antarctic screenshot regression independently clears source polygons. |
|27–29 Multiobjective modes/baselines | Partial, bounded candidate search | Same mandatory waypoints, two separately checked via corridors, optional user speed, objective/deadline/explicit-weight ranking and strict scenario comparability. No global ecological optimum claim. Old reviewed-route comparator gates preserved. |
|30 Vessel selection | Implemented extension | Existing versioned profiles plus detailed categories, optional minimum operating speed, length and acoustic class. No seeded vessel or unsupported fuel/propulsion enablement. |
|31–33,53 Fuel/integration/CO2 | Implemented scenario calculation | Existing dimensional SFOC/power/auxiliary/TTW factors preserved. STW/SOG split, month integration and provenance now connected. Empirical own-vessel calibration, weather/sea-state/load/aging remain unavailable. |
|34–38,55 Economics | Implemented declared-cost scope | Dated manual fuel prices, one currency, nonfuel day rate scope acknowledgement, documented fixed fee, optional carbon scenario and correct net-benefit signs. Not profit, statutory tax or an undisclosed full cost model. Fixed fee is common across the same-itinerary candidates. |
|39 Annual scenario | Implemented | Voyages×fleet, utilization only for theoretical capacity, no double scaling of planned/completed counts. Hypothetical projection clearly labeled. |
|40 Sensitivity | Implemented price scenarios | Fuel price×0.8/1/1.2with all else fixed; not statistical uncertainty. Optional second STW provides an explicit speed scenario. |
|41–46 Results/explanations/transparency | Implemented for supported metrics | Source-aware dashboard, candidate table/map, totals/deltas, financial/annual scenarios, environmental sample coverage, local MPA, acoustic source cards, unavailable ecology, segment timeline and JSON provenance. |
|47–50 Design/map/responsive/language | Implemented, final browser limit noted below | Quiet professional layout, progressive details, existing species/month filters, route comparison/vessel selection, independent layer opacity, coordinate search (not a place-name gazetteer), localized data/detail views; five languages. |
|54 Acoustic validation | Numerical implementation checked; field validation blocked |36author reference vectors exact; compatible-energy tests. No hydrophone, propagation or animal validation metric claimed. |
|56 Engineering | Implemented | Separate data/physics/economics/acoustics/ecology/ranking/controller/UI modules, generation cancellation, immutable snapshots and source hashes. |
|57 Performance | Implemented bounds | Native gzip tiles, SHA validation,8tile AIS LRU, lazy source loading and worker A*. No global TIFF/NetCDF browser download. Public data remains below90MiB/25MiB-per-asset/10000files guards. |
|58 Deployment | Static publication | Retains native Sites project and existing public audience. No Python server requirement. Same static assets are compatible with GitHub Pages; no new GitHub workflow is invented for an unconnected repository. |
|59 Documentation | Implemented | This complete status report; user workflow/equations/sources/limits in `dist/voyage/methodology.md`; README corrected to current A*/AIS state. |
|61 KPIs | Computed scenarios only | Actual candidate deltas displayed only after user inputs. No invented achieved savings, biological improvement or validation accuracy. |
|62 Sequence | Completed for supported inputs | Audit→source recovery/processing→independent calculations→UI→tests→documentation/publication. Data-blocked providers stay gated under the specification's final missing-dependency rule. |
|63 Deliverables | Implemented with explicit partials | Working updated static site, modular source, preprocessing, tests and methods/status report. Full ecological navigation is not claimed while the dependencies above are missing. |

## Source findings and packaging

- AIS raw TIFF SHA256 `a8d723d101cfac5f93953a373c222adc3dbfd0518b8526ecdfa611a1f359c323`; original ZIP retained, no mutation of raw files. Source raster360676×56286,512pixel blocks, uint32, scale1/offset0, EPSG3857, NoData0. Official product period2025-01-01..12-31is external temporal evidence, not an embedded raster time coordinate.
- Pilot requested bbox[-74,38.5,-67,44], explicitly expanded to tile boundaries.219tiles,20062640compressed bytes,29216574non-NoData cells, max81319. All distributed integer cells independently match Rasterio reading of the original TIFF. Outside this pilot is a distinct missing-coverage status; it is not silently downsampled.
- Map overview max-aggregates16×16source cells. Log color/alpha, saturation≥215, native point data remain unchanged. It is neither annual ship density nor a time-varying AIS stream.
- All16NetCDF raw SHA256 values match previous source inventories. Twelve SST source-period means retain their actual1981epoch, representative timestamps, CF bounds and contradictory provider labels. The4current files retain monthly vectors, original precision and unknown source uncertainty.
- Existing51594public observation records and their permitted source terms remain unchanged. The23975Happywhale records and WDPA source geometries remain local research inputs, never bundled as public commercial assets.
- NAVISON PDF SHA256 `ae3df87d2c79783c2edf9b710729a17ac516dfb7bca1d209a88a63fcd130ae2d`; authors' JOMOPANS-ECHO reference XLSX SHA256 `554f5e7b867c78510f4f372a44800266ae38ca39f33ce12676dd91e45be0829c`. Public code attributes the CC BY4.0paper/calculator. No report PDFs or calibration databases are redistributed.

## Validation results and practical limits

- Existing67Node tests passed after recovering the required actual raw sources. New25Node tests passed:15voyage/physics/economics/acoustics/ecology/controller tests,6AIS/native/shared-provider tests and4protected-route tests. Total92 tests; the all-module91-test run preceded the additional shared-provider/species-parameter test, which also passed afterward.
-25Python source tests passed independently:7SST,7currents,4observations,3topology,3AIS and1protected-route Shapely comparison. All original raw sources were actually accessible for these checks; absence was never assumed away.
-623existing independent WDPA point checks passed;8real protected-area route cases independently matched Shapely clipping/union to5decimal NM. All219native AIS tile arrays match the original TIFF. The topology test includes1000independent source-polygon/cell comparisons and the user's Antarctic land-crossing regression.
-36JOMOPANS-ECHO author spectra match exactly. Bowditch current-triangle example, dimensional fuel/CO2, current month boundaries, no wrong-year fallback, cost/benefit/annual/currency handling, stale cancellation and unavailable ecological objectives passed. These are code/reference checks, not field validation of biological or acoustic predictions.
- Original64numeric comparisons, workspace/storage, imports, GPX/JSON/report exports, original model/workspace hashes, scientific gates and five-language regression checks passed.
- Browser:27new integration/responsive checks passed, including6checked route/speed scenarios with actual2025currents, missing2026rejection, source-only acoustics, no fake ecology, exports, five languages, stale clearing, native AIS30956Boston source cell and shared service. Existing23fuel/profile lifecycle checks passed.
- **Final browser limit:** the browser-control service subsequently timed out, including its reset endpoint. Further existing map tests and the last small coordinate-search/wording changes could not receive a final browser pass. Their JavaScript syntax/static checks passed; previously verified working results are not reported as a complete final visual certification. No replacement browser automation or invented screenshot was used.

## Required next scientific inputs

1. Original gridded chlorophyll-a product(s), processing/quality information, exact dates/region and reuse terms; historical four-number references cannot fill this role.
2. Nautical bathymetry, vertical datum/tides and draft/under-keel requirements; dated legal restrictions, operational ice/weather and traffic-separation sources.
3. Species-specific fitted methods and training/effort/bias data with independent spatial/temporal validation; Caretta/Delphinus observations where applicable. No count-to-density shortcut.
4. A reviewed relative traffic/speed-risk method for collision exposure; annual AIS counts alone supply neither velocity nor event probability.
5. Vessel/hydrophone/calibration and propagation inputs before received noise, animal effects or acoustic optimization; machinery/cavitation attribution cannot be inferred from the published source proxy alone.

These dependencies are visible in the interface and contracts. Supplying them later extends the same shared repositories; it does not require copying or reintegrating SST for each species.
