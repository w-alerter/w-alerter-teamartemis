# W-ALERTER — source-aware voyage scenarios

Version1.0.0 · 28 October2026. Software checks are distinct from scientific field validation. These are research comparisons, not navigation clearance, statutory emissions reports or achieved commercial savings.

## Workflow

1. In Route, add your mandatory waypoints and calculate the16-direction A* route.
2. In Fuel & Carbon, create your own versioned vessel profile. Enter technical power, load, speed, SFOC, fuel and optional prices. No vessel or achieved result is preloaded.
3. Open Voyage comparison from the route results or Fuel & Carbon. Enter departure in UTC and speed **through water**. Select historical monthly currents or explicitly choose a still-water scenario.
4. Optionally test a second user-declared speed and two additional checked corridors. Choose time, TTW CO2, declared cost or explicit normalized weights. Wildlife ranking stays unavailable without a reviewed fitted species model.
5. Inspect candidate maps, source coverage, segment calculations and provenance; download the complete JSON calculation. Changing inputs clears stale results immediately.

## Geometry and bounded candidate search

HYDRA geometric A* remains `hydra-geometric-astar-1.0.0`:16neighbours, admissible Haversine heuristic, conservative0.1° Natural Earth land/static ice-shelf mask, corner/long-edge supercover and post-simplification checks. Shared radius3440.065NM. All mandatory waypoints remain. The additional family inserts one via±0.6°latitude around the half-distance point of the longest leg; each candidate is independently planned against the same mask. Invalid/duplicate/search-limited candidates are disclosed.

This is a comparison of a finite family, not a globally optimal multiobjective maritime route. The historical strict reviewed-reference/HYDRA comparator remains unchanged in Fuel & Carbon. New comparisons are separately labeled mask-only research scenarios; they require identical profile/version, departure, current mode, economic assumptions, model/source revisions, endpoints and topology hash. There is no direct-line fallback across land.

Bathymetry, vessel draught clearance, tides, current sea ice, traffic separation, legal speed limits and weather are not verified by a cartographic land mask. These checks remain mandatory dependencies for an operational routing claim.

## Current triangle, time and fuel

Coordinates are GeoJSON longitude,latitude. Great-circle edges are sampled in pieces≤10NM (existing0.05°densified route edges are usually shorter). For desired ground-track bearing theta, east/north current u/v are converted from m/s with3600/1852:

```
c_parallel = u*sin(theta) + v*cos(theta)
c_cross    = u*cos(theta) - v*sin(theta)
SOG = sqrt(STW^2 - c_cross^2) + c_parallel
heading = theta - asin(c_cross / STW)
hours = distance_NM / SOG_knots
```

Reject cross-current magnitude greater than STW or nonpositive forward progress. Power uses **STW**, not SOG. Duration uses current-compensated SOG. The current vector is piecewise constant at the sampled midpoint, not a high-frequency hydrodynamic integration. Integration splits exactly when the reached UTC calendar month changes and queries that month's field. Missing date/region/mask means no complete operational total; no2025 substitution for2026 or implicit zero current occurs.

CMEMS monthly vectors are historical near-surface values at0.494m depth, not a forecast, instantaneous measurement or whole-hull current profile. Explicit still water is an assumption, not an observation. Wind, waves, hull fouling, load-dependent resistance, machinery aging and shallow-water effects are not modeled.

The existing documented diesel model computes reference power=nominal power×reference load; P=P_ref×(STW/V_ref)^3. Fuel kg=P_kW×SFOC_g/kWh×hours/1000. It supports constant, reference-normalized literature and sourced manufacturer SFOC curves within their bounds. Auxiliary engines use separately declared power/load/SFOC/fuel. Unknown auxiliary use remains null and results explicitly say main-engine-only. Optional minimum operating speed is user-declared, not an inferred regulatory limit. Additional vessel categories do not enable unsupported propulsion/fuel models.

TTW CO2 sums fuel mass×the explicitly pinned MEPC.308(73)2018 factors: diesel3.206, LFO3.151, HFO3.114kgCO2/kgfuel. Having an LNG/methanol factor does not make their consumption model available. This is direct combustion, not lifecycle CO2e or IMO approval. See the existing Fuel & Carbon methodology for sources and SFOC details.

## Environmental and ecological results

SST uses the common service with explicitly selected source-interval means, preserving CF time/bounds conflicts and source uncertainty. It is not relabeled a daily reading or a proven complete-calendar-month mean. Currents use explicit calendar-month matching. Additional variables, including `ais_transits`, register documented providers in the same Environmental Data Service.

AIS is NOAA's actual2025 annual transit-count GeoTIFF. The source has no embedded time axis; year evidence is the identified official product metadata. Actual file EPSG3857 differs from the catalog EPSG4269 entry; this conflict is retained. Native pixels are100 **projected** metres, uint32, scale1, offset0, NoData0. Projected100m is not constant ground distance. A zero-valued source pixel means missing, not verified zero vessels. Exact point queries retain original counts with no interpolation. Year2025 and `annual-background` must be explicitly selected.

Only the documented western North Atlantic pilot extent is distributed: requested[-74,38.5,-67,44], expanded to source tile boundaries[-74.1942824,38.4857732,-66.8352836,44.0131564]. Source coverage outside this published subset is unavailable to this static deployment. The overview displays the maximum within16×16source cells, logarithmic colors and explicit saturation≥215. It is a display product; queries use the original pixels. Compressed and expanded SHA256 are checked and an8tile LRU avoids whole-raster downloads.

Route environmental summaries are distance-weighted **midpoint sample summaries**. A full-route mean is withheld for incomplete sampled coverage; covered distance and reasons remain available. In particular, AIS sampling at pieces≤10NM is not a line integral through every100m AIS cell and can miss narrow traffic traces. Annual source-cell counts are not animal/vessel density, unique ships, vessel speeds, real-time traffic or collision probabilities.

Four permitted whale observation sources are already shared by species adapters,51594 records in total. Record counts do not equal individuals, absences or abundance. Happywhale NC data and restricted protected-area boundaries remain browser-local research inputs; no raw NC coordinates or WDPA geometries enter the public bundle.

Route protected-area intersections use original local polygon rings/holes, geodesic densification≤3NM and segment clipping. Per-area distances and unique union distance are separate, preventing overlapping designations from being counted twice. Tangency may have zero overlap distance. Point records acquire no invented radius. Only the supplied subset and October2026 snapshot are assessed; intersection does not establish a legal prohibition or historical validity.

No fitted independently validated habitat model is bundled. The new route-provider registry uses the same environmental/observation services and requires species-specific predictors, training-data SHA256, spatial and temporal holdout review and calibration for occurrence probabilities. Future route exposure may distance-weight reviewed suitability; incomplete coverage remains null. Collision exposure additionally requires a reviewed traffic-exposure method and documented speed-risk provider; raw annual AIS counts do not fill these dependencies. No biological coefficients, AUC, accuracy or confidence intervals are invented.

## Acoustic scenario

The actual EMSA NAVISON June2025-v2 report was examined. Its PIANO machinery/cavitation calculations and ARTEMIA/CRAM propagation require calibrated vessel/database and propagation inputs absent here. NAVISON concerns historical2016–2023European and future scenarios, not observed global2025 noise. No imitation is presented as PIANO.

The executable, attributed alternative is MacGillivray & de Jong2021 **JOMOPANS-ECHO**, equations9–11 and authors' FileS1. Its36cached reference spectra match this implementation exactly. This validates arithmetic against the authors' calculator, not acoustic performance on the user's ship.

For frequency f, class reference speed Vc, actual SOG V, length l and lref=300/3.28084m:

```
PSD = K - 10*(B+2)*log10(f1) + 5*B*log10(f)
      - 10*log10((1-(f/f1)^(0.5*(B+2)))^2 + D^2)
      + 60*log10(V/Vc) + 20*log10(l/lref)
third-octave source level = PSD + 10*log10(0.231*f)
```

Use the authors' class table and cargo f<100Hz branch (K208,B2,f1=600/Vc,D0.8or1); otherwise K191,B0,f1=480/Vc,D3orCruise4. Nominal63/125Hz bands use exact centers10^1.8and10^2.1Hz. The model uses **SOG** by its published AIS-conditioned definition; unlike propulsion calculations, it must not silently use STW. Statistical SOG changes from currents do not establish actual quieting of the same vessel. No unsupported universal speed/length applicability limits are invented.

Profile length/class and explicit applicability acknowledgement are needed. Results are equivalent monopole source-band levels in dB re1µPa²m² at the literature6m source depth. Time means and compatible-source sums use linear energy:

```
L_sum = 10*log10(sum(10^(Li/10)))
L_mean = 10*log10(sum(ti*10^(Li/10))/sum(ti))
```

Source/received quantities, frequency and averaging period must match before summation. Integrated source emission is not received SEL. The literature's roughly6dB residual is not W-ALERTER field validation. No bathymetry/sound-speed/seabed/propagation model is supplied, so received sound, animal exposure, behavioral response, injury percentages and acoustic routing objectives remain unavailable. NOAA2024v3 addresses hearing injury/TTS; it is not a universal behavioral threshold and does not supply a Caretta caretta model.

## Economics and ranking

Fuel cost sums tonnes×user-entered per-tonne prices and their dates. One currency is required; no live quotes or currency conversion. Declared cost=fuel+durationHours/24×explicit non-fuel daily rate+documented fixed fees+optional TTW CO2-tonnes×user-entered carbon scenario price. The daily-rate acknowledgement prevents fuel/fees/carbon double counting. The UI's fixed fee applies equally to candidates with the same mandatory itinerary; route-specific fees/constraints require a documented provider. Omitted components are listed, not described as real-world zero costs. Scope follows known fuel consumers. Carbon scenario price is not a legal carbon liability.

Delta=candidate−baseline. Net declared cost benefit=baseline−candidate; negative means extra cost. Percent reduction has a null zero-baseline denominator. Annual benefit=per-voyage benefit×voyages per vessel×fleet; capacity utilization is used only for a theoretical-capacity count, never applied twice to an already planned/completed count. These are repeated-voyage assumptions, not realized profits. The price-sensitivity table tests×0.8/1/1.2with all other inputs fixed, not a confidence interval.

Time, CO2 and cost objectives use actual computed scenario totals. Balance needs explicit nonnegative weights with at least one positive value and normalizes min–max across complete eligible candidates. Equal metrics normalize to0. Fuel and CO2 cannot both be weighted as independent objectives; unavailable selected metrics block ranking instead of being dropped. A deadline filters eligible arrivals. The best tested scenario is not called a certified safe or ecologically optimal route.

## Primary references

- NGA, American Practical Navigator, VolumeI, current sailing: https://msi.nga.mil/Publications/APN
- IMO Fourth GHG Study2020 and pinned2018 MEPC.308(73), links in Fuel & Carbon methodology.
- NOAA AIS product2025: https://www.fisheries.noaa.gov/inport/item/79556
- EMSA NAVISON: https://emsa.europa.eu/navison.html (June2025-v2 PDF SHA256ae3df87d2c79783c2edf9b710729a17ac516dfb7bca1d209a88a63fcd130ae2d)
- MacGillivray & de Jong2021: https://doi.org/10.3390/jmse9040369 ; FileS1 https://www.mdpi.com/article/10.3390/jmse9040369/s1 ; CC BY4.0. Reference XLSX SHA256554f5e7b867c78510f4f372a44800266ae38ca39f33ce12676dd91e45be0829c.
- NOAA2024v3: https://repository.library.noaa.gov/view/noaa/66184
- Southall et al.2019: https://doi.org/10.1578/AM.45.2.2019.125

Raw NetCDF/GeoTIFF/archives, private profiles and restricted observations are not transmitted in routine public data queries. Profiles and local research archives stay in the browser. Basemap tile requests go to their disclosed providers. This static deployment runs no Python or fitted model on GitHub Pages; scientific preprocessing is offline.
