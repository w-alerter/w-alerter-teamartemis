# W-ALERTER Fuel & Carbon Intelligence

Implementation and method version: `wa-calm-water-diesel / 1.0.0`.

## Repository audit and implementation plan

The audited repository contains ordered user-entered waypoints and the original Haversine distance function, not the requested 16-direction HYDRA A* engine. Its legacy indicator is `at-risk distance × 2.5 L/NM`, with historical constants 10 knots and 28.5%. That indicator has no vessel power, SFOC, actual fuel mass, carbon factor or feasible comparison route. It is not an input to the new calculation.

The original `dist/model.js` and `dist/workspace.js`, four monthly chlorophyll references and storage key remain unchanged. Existing numerical, storage, science and export checks are retained.

The implementation sequence was: (1) audit and source review, (2) versioned vessel/route contracts, (3) independent calculation modules, (4) profile editor, (5) routing observer and import adapters, (6) comparison and provenance UI, (7) automated tests and visual checks. No scientific field data or example vessel is seeded into the application.

## Primary sources and pinned versions

1. [Fourth IMO Greenhouse Gas Study 2020, full report and annexes](https://greenvoyage2050.imo.org/wp-content/uploads/2021/07/Fourth-IMO-GHG-Study-2020-Full-report-and-annexes_compressed.pdf). Chapter 2: printed p. 64, equation (8), speed-power and draught relationships; pp. 70–71, equations (9)–(11), fuel and SFOC; p. 72, equation (13), fuel-based emissions and low-load treatment. Appendix B contains worked inventory calculations. PDF page numbers are 28 greater than the main report's printed numbers; the SFOC equation is on PDF p. 99. The full primary PDF and rendered equation were inspected. Population-average engine power/SFOC tables are **not** used as default vessel inputs.
2. [IMO Resolution MEPC.308(73), adopted 26 October 2018](https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MEPCDocuments/MEPC.308(73).pdf), section 2.2.1, Annex printed pp. 5–6, PDF pp. 6–7. These are the explicitly requested **pinned 2018 factors**, not a claim to implement the latest EEDI regulation. This is an EEDI guideline. Reusing its combustion factors does not make this voyage estimator an IMO-approved method, an EEDI calculation, an EEXI/CII result or a statutory emissions report.

The code stores references, section identifiers, factor units and source versions in `dist/fuel/fuelFactors.mjs`. No upstream PDF is redistributed as a project asset.

## Supported systems and necessary inputs

The first model is an uncalibrated, calm-water estimate for a conventional single-main-engine diesel installation and displacement hull within an appropriate speed range. The user must explicitly confirm this applicability. Diesel-electric, hybrid, battery, multiple-propulsion, turbine, planing and advanced dual-fuel systems are not supported by this power model. A manufacturer/model name is descriptive only; it never supplies technical values.

Required inputs are name, ship type, propulsion/engine type, nominal power in kW, reference speed in knots, reference load fraction, selected SFOC method and its inputs, fuel, planned and maximum operational speed. The editor accepts load as percent and explicitly divides by 100. A constant SFOC can be saved with unknown measurement load, with a warning. Normalized IMO SFOC requires a known reference measurement load. Optional IMO numbers are checked for their seven-digit format and checksum.

Optional draught, loading condition, technical document reference and actual-consumption notes are preserved. This version does not use them to infer resistance corrections or automatically calibrate consumption. A document check is a **user attestation**, not independent technical validation. Input quality distinguishes user-entered, user-checked technical, literature assumptions, algorithm calculations and missing data. Auxiliary and price fields also retain their individual quality status.

## Equations and units

For a sailing segment:

```
duration_h = distance_NM / effective_speed_knots
reference_power_kW = nominal_power_kW × reference_load_fraction
power_kW = reference_power_kW × (effective_speed / reference_speed)^3
load_fraction = power_kW / nominal_power_kW
main_fuel_kg = power_kW × SFOC_g_per_kWh × duration_h / 1000
```

Nominal power is never silently substituted for reference power. A load above 1, a speed above the declared operational maximum, invalid or zero sailing speed, invalid power, disconnected route or missing required input blocks that route's results. A documented speed restriction caps effective speed; its source is required. A preference caps the route's speed proposal. The engine's operational maximum is validated rather than silently clipping excess power or speed.

Distance sums the complete ordered coordinate polyline within each segment using the preserved planner's spherical Haversine radius, 3440 NM. Coordinates are explicitly `[longitude, latitude]`, EPSG:4326. Supplied `distanceNm` or `durationHours` on a sailing segment do not override this geometry/speed calculation; the source input remains in provenance. This spherical approximation is not a hydrographic navigation solution. Imported routes must include every bend; the app does not convert a two-point straight line into an independently verified sea route. Numerical join tolerance is `1e-6 NM`, solely to handle coordinate roundoff, not route uncertainty.

## Speed-power assumptions

The power model uses the cubic speed term of the report's Admiralty relationship at the declared reference state. It does **not** reproduce all of equation (8). No default weather, fouling, draught or ship-class correction factors are inferred. Current, wind, wave, changing load, trim, shallow-water and hull-condition effects are absent. Under calm water only, ground and through-water speeds are treated as equal. Actual voyage performance may differ materially; there is no invented accuracy percentage.

## SFOC alternatives

The empirical curve from equation (10) is:

```
C(L) = 0.455 × L² − 0.710 × L + 1.280
```

For a supplied SFOC measured at known load `L_ref`, this implementation uses:

```
SFOC(L) = supplied_SFOC × C(L) / C(L_ref)
```

Thus the supplied SFOC is reproduced exactly at its stated measurement load. It is not blindly treated as the report's minimum `SFC_base`. The report describes an optimum around 80% MCR, with limitations for engines tuned for lower-load operation. This polynomial is a literature assumption, not a measured vessel curve.

The report's inventory sets main-engine activity below 7% load to zero in a berth/anchorage classification context. This application **does not turn sailing fuel consumption into zero**. As a conservative product boundary, generic constant/polynomial calculations below 7% load are blocked, including a polynomial measurement reference below that boundary. A genuine manufacturer curve can cover lower loads. This boundary is not a claim that the polynomial is vessel-validated throughout 7–100%.

`constant` uses the supplied SFOC without a load correction, explicitly warned. `manufacturer-curve` requires at least two strictly increasing load points, positive SFOCs and a source document. It linearly interpolates within those points and refuses to extrapolate. Such interpolation is an explicit implementation choice, not an IMO-prescribed interpolation rule. Curve JSON is an array of objects with `load` (fraction) and `sfocGPerKwh` (g/kWh); the app contains no example engine curve.

## Auxiliary and waiting consumption

For a declared auxiliary installation:

```
auxiliary_power_kW = auxiliary_nominal_kW × auxiliary_load_fraction
auxiliary_fuel_kg = auxiliary_power_kW × auxiliary_SFOC × duration_h / 1000
```

SFOC is held constant for the auxiliary engine, consistent with the report's initial treatment. Its fuel can differ from the main fuel. A segment can explicitly override auxiliary load. Unknown auxiliary consumption is retained as `null` and the scope is **main engine only**, never a whole-vessel total. Explicitly confirming no auxiliary consumption is a separate user input. Even when auxiliary consumption is known, boilers and other unmodelled consumers are excluded; `wholeVesselFuelKg` remains `null` to prevent claiming completeness.

A wait segment has explicit positive `durationHours`, `coordinate`, `mainEngineOff: true`, and zero distance. There is no division by zero. When an auxiliary installation is defined, a waiting-specific `auxiliaryLoad` is required: sailing hotel load is not silently reused for berth/anchorage. Main-engine-on idling, starting, manoeuvring, boilers and port operations need separate models and are not invented.

## Direct CO₂ factors

Factor set: `mepc308-73-2018-pinned-v1`. Units are kg CO₂ per kg fuel, numerically identical to t CO₂/t fuel.

| Fuel ID | Fuel | Factor | Consumption model in this release |
|---|---|---:|---|
| diesel | Marine Diesel / Gas Oil | 3.206 | Conventional diesel only |
| lfo | Light Fuel Oil | 3.151 | Conventional diesel only |
| hfo | Heavy Fuel Oil | 3.114 | Conventional diesel only |
| lng | LNG | 2.750 | Not supported |
| methanol | Methanol | 1.375 | Not supported |

```
CO2_kg = sum over fuel types (fuel_mass_kg × fuel_CF)
tonnes = kg / 1000
```

CO₂ includes direct combustion only. Methane slip, upstream production/transport, life-cycle GHGs, N₂O, black carbon and CO₂-equivalent emissions are absent. A lower factor per kg fuel alone does not establish lower overall climate impact. Merely storing an LNG or methanol factor does not enable those propulsion models.

## Route comparison and economic calculation

Each route is independently calculated with the same profile snapshot/revision, departure, preference, target, price inputs and model/factor versions. These common inputs are hashed into a comparison key. Start and end coordinates must also match. Current unverified waypoint geometry may receive a vessel-based consumption estimate but cannot be used for savings percentages. A reference route must be explicitly provided as a user-checked route with a citation; imported HYDRA output must name its real engine version and source and carry a matching departure.

```
change_percent = (HYDRA_value − reference_value) / reference_value × 100
fuel_saving_kg = reference_fuel − HYDRA_fuel
avoided_CO2_kg = reference_CO2 − HYDRA_CO2
fuel_cost = sum over fuels (fuel_kg / 1000 × price_per_tonne)
cost_saving = reference_cost − HYDRA_cost
```

Positive change means an increase; negative savings are presented as additional consumption/cost. A zero or unavailable reference denominator yields `null`, displayed as unavailable. Longer or slower ecological alternatives can consume more auxiliary fuel or total time; these effects are not hidden. An ecological-risk benefit is not inferred from a fuel difference.

Each consumed fuel needs its own user-supplied price, currency and valid date. Prices for the same fuel are shared across its engines. Different currencies or a missing price prevent a combined cost; no exchange rate is assumed. A price date differing from departure is flagged. Costs cover fuel only, excluding crew, port, freight, delay, carbon pricing and other operating costs. Route-average speed includes explicit waiting time; sailing-only average is separately retained in the JSON result.

## Software and persistence

Independent ES modules in `dist/fuel/` are `vesselProfile`, `fuelFactors`, `enginePerformance`, `voyageSegments`, `fuelConsumption`, `carbonEmissions`, `economicComparison`, `calculationProvenance` and `coordinator`. UI code consumes these modules; formulas are not embedded in components.

The new localStorage key is `w-alerter.fuel-carbon.v1`. Profiles keep immutable previous revisions. Deletion hides profiles and can be undone; it does not erase historical input snapshots. Settings, imported routes, segment speed overrides and explicitly saved calculations survive reloads. Quota errors do not commit new in-memory records; malformed stored data is not overwritten. JSON backups include profiles, historical revisions, settings and calculations. No cloud account, synchronization, exchange-rate service or new backend is introduced.

Each calculation contains the profile and route snapshots, supplied prices, input qualities, source links, model/factor versions, UTC calculation time, assumptions and SHA-256 input fingerprint. Changing a profile or route clears the visible result immediately; an asynchronous generation token prevents an older calculation overwriting a newer one. Unsaved profile edits block the current result until saved/cancelled. Historical snapshots are labelled with their original date and cannot masquerade as current calculations.

## HYDRA connection and current limit

The existing scientific `RoutingEngines` registry now supports `subscribe(listener)`. Successful synchronous or asynchronous `plan` results are sent to listeners only after the existing engine/cost/scientific-review gates pass. An observer does not alter the planned path, biological model, navigation safety or legal constraints; observer failure does not change routing behavior. `Fuel & Carbon Intelligence` listens for actual `hydra` results, consumes the route's coordinate segments and speed proposals, validates source/departure, and recalculates fuel, CO₂ and comparison results.

`window.WAFuel` exposes the versioned repository, current calculation state, controller, evaluator and engine metadata. `walerter:routechange` is emitted by the preserved draft's persistence path, including waypoint edits, drag changes, ordering, month/name changes and route loads. `walerter:fuel-inputs-changed` carries the current selected vessel and voyage inputs for a future real routing integration. A changed live-route draft clears an older live HYDRA result. Imported routes remain fixed source documents and are re-evaluated; they are not silently re-optimized.

**The 16-direction HYDRA A* implementation and real ecological/legally constrained route output have not been supplied. Automatic HYDRA route production and a real-data end-to-end optimization run cannot be claimed.** Genuine source outputs can be imported through the strict contract below. No fake HYDRA engine, synthetic route, fabricated saving or unreviewed fuel/CO₂ optimizer term is registered. Adding fuel/CO₂ terms to the multi-objective optimizer is intentionally deferred until the real engine and biological, safety and legal constraints can be exercised with appropriate data.

## Real voyage import contract

The file is a JSON object with `format: "w-alerter-voyage"`, `version: 1`, and `route`. No demonstration data is bundled.

| Field | Required content |
|---|---|
| `route.id`, `route.name` | Source identifier and descriptive route name |
| `route.role` | `reference` or `hydra`, matching the selected import destination |
| `route.departureIso` | Explicit UTC/offset ISO timestamp; required for HYDRA, must match the selected departure |
| `route.source.kind` | `user-verified-reference` for reference; `hydra-import` for a real imported HYDRA output |
| `route.source.citation` | Actual source/document identifier; never created by the app |
| `route.source.verification` | `user-attested`, plus the editor's explicit source/navigation-check checkbox |
| `route.source.engineVersion` | Actual HYDRA version for a HYDRA output |
| `route.segments` | Non-empty ordered array, at most 10,000 segments |
| `segment.coordinates` | At least two `[longitude, latitude]` pairs containing the entire segment polyline |
| `segment.speedKnots` | Positive actual planned speed, or absent to use the explicit user preference |
| `segment.speedLimitKnots` | Positive limit or absent/`null` when unknown |
| `segment.speedLimitSource` | Actual regulation source when a limit is supplied |
| `segment.auxiliaryLoad` | Optional declared auxiliary load fraction; required for a wait with a defined auxiliary engine |
| `wait.type` | `wait` |
| `wait.coordinate` | Waiting location as `[longitude, latitude]`, continuous with adjacent legs |
| `wait.durationHours` | Positive explicit wait duration |
| `wait.mainEngineOff` | `true`; other idling conditions need another model |

The app checks geometry, numerical fields, provenance presence, date compatibility and the user's explicit attestation. It does not independently certify the source, the route's safety or regulatory correctness. Even a file claiming a live engine origin is marked as imported on manual intake.

## Validation and remaining scientific work

`node --test checks/fuel-carbon.mjs` covers independent hand-checkable dimensional results, all pinned factors, load/SFOC normalization, manufacturer interpolation and bounds, separate fuels, auxiliary/waiting, legal caps, cost availability, signs/zero denominators, unsupported/invalid inputs, provenance, versioned storage, quota rollback and stale asynchronous results. Artificial values exist only in test files.

`checks/fuel-browser.html` is an isolated manual browser test harness for the actual UI. It exercises profile save/reload/edit, real form events, imports, calculation updates, deletion/undo, historical revision preservation and languages with a test-only storage prefix. It is not a deployed demo or a source of production vessel data.

Future scientific validation requires manufacturer speed-power/fuel curves and matched consumption logs at known draught/trim, calibrated auxiliary loads, actual legal speed plans and real HYDRA output. Compare independent measured route totals across vessels and operating regimes; report errors and applicability by regime rather than inventing an accuracy score. Large environmental grids, operational weather/current effects, port operations, multi-engine allocation, dual-fuel methane and life-cycle emissions require separate data and models.
