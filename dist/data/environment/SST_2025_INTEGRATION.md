# 2025 SST integration — W-ALERTER

## Delivered state and source access

All 12 attached NetCDF-4 sources were opened and inspected, not assumed to exist. In this checkout the provided files were found in the upload directory rather than the stated project directory. Readable links now exist under `data/raw/sst/2025/`; original source bytes and filenames are unchanged. That entire raw directory is ignored by Git. The originals also remain in the supplied uploads; the site never links browsers to them.

A reusable offline processor, shared Environmental Data Repository, Environmental Data Service, source-date selection, four map layers and native-grid point queries are implemented. Species registrations consume the same environmental service. No habitat model, species density, animal probability or collision score has been created from SST.

## What the files actually contain

The provider is **Danish Meteorological Institute / Copernicus Climate Change Service (C3S)**, distributed through the Climate Data Store. This is not relabelled as a newly downloaded Copernicus Marine dataset. Global source product ID is `DMI-L4UHskin-GLOB-DMI_OI`, product version `Version 1.0`. Dimensions are `time=1`, `lat=3600`, `lon=7200`, and `bnds=2` in every file.

The input grid is global, latitude/longitude, nominally 0.05° × 0.05°. Actual float32 cell centres are preserved separately, including their small floating-point deviations from nominal decimal coordinates. Latitude and longitude increase from south to north and west to east; longitudes use the −180° to +180° convention. Longitude spacing in kilometres is latitude-dependent.

The source is an **L4 analysed field**. The provider uses optimal interpolation to fill source gaps; it is not a table of direct observations at every grid cell. This application adds no new spatial interpolation, nearest-valid-ocean search, missing-to-zero substitution or habitat inference.

### Time evidence and metadata conflict

Raw `time` and `time_bnds` are decoded using the file's own `seconds since 1981-01-01` units and `gregorian` calendar. The representative time is near the middle of each month; it is not the instantaneous measurement time of the whole field. All SST variables explicitly carry `cell_methods = "time: mean"`, and `frequency = "mon"` is present.

However, the inherited global title still says **daily** and global `time_coverage_start/end` describe only the first day. Those attributes conflict with the CF bounds. The implementation retains both sets of metadata, prioritizes `time`/`time_bnds` for explicit source-interval means, and flags the conflict. It does **not** assert a complete calendar-month observation average: the encoded bounds start and end at noon on the first and last day, and original daily sample counts, weights and daily files are absent.

| File month | Raw seconds since epoch | Decoded representative time (UTC) | Encoded source bounds (UTC) |
|---|---:|---|---|
| 202501 | 1389873600 | 2025-01-16T12:00:00Z | 2025-01-01T12:00:00Z → 2025-01-31T12:00:00Z |
| 202502 | 1392422400 | 2025-02-15T00:00:00Z | 2025-02-01T12:00:00Z → 2025-02-28T12:00:00Z |
| 202503 | 1394971200 | 2025-03-16T12:00:00Z | 2025-03-01T12:00:00Z → 2025-03-31T12:00:00Z |
| 202504 | 1397606400 | 2025-04-16T00:00:00Z | 2025-04-01T12:00:00Z → 2025-04-30T12:00:00Z |
| 202505 | 1400241600 | 2025-05-16T12:00:00Z | 2025-05-01T12:00:00Z → 2025-05-31T12:00:00Z |
| 202506 | 1402876800 | 2025-06-16T00:00:00Z | 2025-06-01T12:00:00Z → 2025-06-30T12:00:00Z |
| 202507 | 1405512000 | 2025-07-16T12:00:00Z | 2025-07-01T12:00:00Z → 2025-07-31T12:00:00Z |
| 202508 | 1408190400 | 2025-08-16T12:00:00Z | 2025-08-01T12:00:00Z → 2025-08-31T12:00:00Z |
| 202509 | 1410825600 | 2025-09-16T00:00:00Z | 2025-09-01T12:00:00Z → 2025-09-30T12:00:00Z |
| 202510 | 1413460800 | 2025-10-16T12:00:00Z | 2025-10-01T12:00:00Z → 2025-10-31T12:00:00Z |
| 202511 | 1416096000 | 2025-11-16T00:00:00Z | 2025-11-01T12:00:00Z → 2025-11-30T12:00:00Z |
| 202512 | 1418731200 | 2025-12-16T12:00:00Z | 2025-12-01T12:00:00Z → 2025-12-31T12:00:00Z |

For example, the March input is a mean with the source bounds shown above and representative time `2025-03-16T12:00:00Z`; it is not a daily observation made on March 1. No daily time series is reconstructed.

### Temperature and packing

`analysed_sst` is selected explicitly. `analysed_st` is also inventoried, but not substituted: it combines sea and **ice-surface** temperature, whereas `analysed_sst` includes water SST and provider-estimated water temperatures under sea ice. The product guide describes open-water SST adjusted to 20 cm depth; under-ice SST is not a direct under-ice observation.

For each source variable, the actual stored `_FillValue`, `missing_value`, scale, offset, dtype and units are retained in the manifest. The temperature scale is the stored float32 value `0.009999999776482582`; the stored offset is `273.1499938964844`. The code does not replace these by rounded display values.

```
valid_packed_value = source raw value, excluding source fill/missing/range flags
kelvin = raw × source_scale_factor + source_add_offset
celsius = kelvin − 273.15
```

Masking occurs before scaling. Raw SST zero is a valid packed value, not missing. The original int16 temperature and error, signed int8 ice/mask fields are stored losslessly in native tiles, compressed with gzip. No second quantization, SST averaging or decimation is applied to the point-query values. Float64 decoding differs from netCDF's float32 automatic arithmetic only within original float32 numerical precision; both are checked against the source.

`analysis_error_sst` is decoded as a **temperature difference** in K, without subtracting 273.15. It also has `time: mean`; the source error field is retained as supplied, not recomputed as a standard error/confidence interval for an interval mean.

### Surface masks and sea ice

All five query channels are preserved: `analysed_sst`, `analysis_error_sst`, `sea_ice_fraction`, `mask` and `sea_ice_fraction_flag`. The other temperature field/error and all coordinate metadata remain in the source inventory.

The source mask declares water/land/lake/ice/river bit masks, but this supplied mask also has `time: mean`. Actual intermediate values 3–8 occur extensively. These are not blindly decoded as reliable daily categorical flags. The adapter distinguishes unambiguous water, source ice, land/missing SST and ambiguous averaged-mask cases. Mask 2 with a valid SST is treated as ambiguous, not automatically as definite land. Original mask numbers and flag definitions remain available.

Default SST/error queries require unambiguous water and zero valid source sea-ice fraction. Ice-affected cells are withheld unless `includeSeaIce: true` is explicitly requested. Even then, intermediate ambiguous masks stay withheld unless the caller explicitly requests `includeAmbiguousMask: true`; quality warnings are never removed. A missing uncertainty stays `null` while a valid SST can remain available.

`sea_ice_fraction` uses the file's fraction unit (`1`), not an assumed percent unit. Source −128 is missing and is not converted to zero concentration. The ice-concentration extrapolation flag is preserved; its own `time: mean` limits interpretation as a daily flag.

## Distribution and performance

The original global files total **538405469 bytes**. They are excluded from Git and the deployment archive.

Only optimized public assets are distributed:

- **Global map display:** 1440 × 720 RGBA images, explicitly selecting one real source centre cell per 5 × 5 source block (0.25°). This is disclosed display sampling, not a new analysis grid or habitat model. SST/error previews show only the default unambiguous ice-free cells. Missing cells remain transparent.
- **Native point queries:** 0.05° source cells for tiles intersecting the North Atlantic requested box `[−85, 20, −5, 75]` and Mediterranean requested box `[−6, 30, 37, 46]` (west, south, east, north). Whole 200 × 200 source-cell tiles are retained; actual coverage extends to their boundaries. A global overview does not imply global native point-query distribution. Outside distributed tiles, the service returns `outside_distributed_region`, not zero or a fabricated estimate.
- **744 losslessly compressed native tiles** across 12 source periods, four preview images per period, shared axes, a source manifest and actual-source verification samples. Asset payload before manifest/sample metadata is **39714567 bytes**. Largest generated asset is **529047 bytes**.
- **Correct map projection:** the latitude-linear source image is sampled row by row onto Leaflet's Web Mercator grid. It is not incorrectly stretched as a rectangular image overlay. Browser canvas smoothing is disabled.
- **Bounded caching:** source metadata/axes are shared; simultaneous tile requests are deduplicated, and a 12-entry LRU holds decompressed point tiles. Browser HTTP caching is keyed by a source/config revision directory. No Python runs in the browser or on GitHub Pages.

`tools/sst_regions.json` defines reproducible regions and budgets. Regions can be extended using the same raw sources and processor without copying SST into species modules. Future variables register their own documented providers in the common service. A failed additional dataset manifest is isolated from working SST entries.

Conservative project guards are 90 MiB processed environmental payload, 10,000 assets and 25 MiB per asset. Current assets are well within them. Official generic hosting references checked at implementation time: Cloudflare Workers lists 20,000 free-plan assets / 100,000 paid-plan assets and 25 MiB per asset; GitHub Pages lists a 1 GB published-site limit. The Sites connector's returned deployment is authoritative for this project. No assumption is made that this account uses a specific Cloudflare plan.

## Query contract

Shared objects are exported by `dist/environment/index.mjs` and exposed under `window.WAScience`:

```js
getEnvironmentalValue(variable, latitude, longitude, date, options)
```

Supported current variables/aliases: `sst` / `analysed_sst`, `sst_uncertainty` / `analysis_error_sst`, `sea_ice_fraction`, `mask`, `sea_ice_fraction_flag`. The fifth argument is optional. Future variables use `environmentalDataService.registerVariable(...)` with a documented source, version, unit and query provider; no placeholder measurements are registered.

The default `temporalMode: "exact"` matches a representative source timestamp, or its UTC calendar day for a date-only query. A query for `2025-03-01` does **not** silently use the March 16 representative record. It returns `date_unavailable` and available source times/intervals. To explicitly use an interval mean for that day, the caller must select:

```js
getEnvironmentalValue("sst", 42.5, -70.2, "2025-03-01", {
  temporalMode: "interval-mean"
})
```

That is a user-specified point/date from the task, not an animal observation. The result clearly reports `explicit-source-interval-mean`, its real representative time and actual bounds; `dailyObservation` is false. This mode selects only a matching encoded period, never the nearest period. Dates outside source coverage, invalid calendar dates, unsupported variables and missing assets have explicit statuses and `value: null`.

A successful result includes requested coordinates/date/mode, selected original cell coordinates/index and resolution, value/unit/Kelvin where applicable, packed raw fields, source error information, source file and SHA-256, product/source/license, mask/ice flags, source interval/raw epoch/bounds, metadata conflicts and quality warnings. No numerical confidence percentage is invented.

Nearest-neighbour point lookup means nearest **original grid centre**, with ties resolved to the lower coordinate. It never searches across land for a nicer-looking valid value. Spatial interpolation is not performed.

## Multi-species integration

`SpeciesModels.environmentalInputs(speciesId, query, variables, options)` delegates to the same service for *Eubalaena glacialis*, *Caretta caretta* and the other registered species. Validated future methods can access `context.environmentalDataService` without copying files or using another species' biological parameters. Existing missing-method/review/data gates remain. SST alone still cannot enable an ecological suitability/presence result.

Existing NASA chlorophyll constants have no exact year/coverage/raw source files in the repository. Their temporal/spatial alignment with this C3S source is therefore **unknown**, not presumed compatible. No NASA values, HYDRA costs, fuel model formulas, saved routes or vessel profiles were changed by SST integration. HYDRA A* source remains absent; no engine or animal tracks were fabricated.

## Reproduction and verification

Install the optional offline dependencies from `tools/requirements-science.txt` in a suitable Python environment. Keep the 12 original inputs at the ignored raw path, then run:

```sh
python tools/preprocess_sst.py
python checks/test_sst_preprocess.py
node --test checks/environment.mjs
```

`tools/inspect_sst.py` remains a read-only single-file inventory tool. Detailed inventories are in `data/metadata/sst/2025/inventory.json`; actual source verification cells are in `data/metadata/sst/2025/validation-samples.json`. The browser requires only `dist/`; it does not require netCDF4, Python or raw files. A checked-in static distribution continues to work on GitHub Pages without server computation.

Tests cover all 12 raw files and hashes, manual epoch decoding, CF bounds and conflicts, original coordinates, Kelvin/Celsius and packing, missing values, signed masks, source error, exact binary/source cell equality, explicit date modes, shared species access, caching and absence of raw NetCDFs in the deployment. Browser QA checks rendering, query interactions, layer/time changes, language and responsive layout. Legacy numerical/storage/export/fuel tests are retained.

Verified on 26 October 2026: all **7 Python source/conversion tests**, **10 environmental JavaScript tests**, **17 fuel/carbon tests**, and **32 browser UI checks** passed. The unchanged legacy model passed **64 numerical comparisons**; storage, import/export, scientific gates and five-language regression checks also passed. Browser checks include all 12 real source periods, immediate removal of stale source values/markers after date edits, and 320/390/768 px layouts, using only actual source-cell verification records. Both original legacy calculation files retain their reference hashes.

## Source and license

The exact source license statement is retained rather than replaced by an inferred license name:

> These data are available free of charge under the Copernicus Climate Change Service (C3S) data policy

Required source acknowledgement retained from each file:

> These data were provided by DMI and the Copernicus Climate Change Service (C3S) project

The file does not identify a precise policy revision/license URL; the original statement, provider and product page are preserved. Source creation dates, UUIDs, instrument/platform names and history are in the per-file audit.

Primary product reference: https://cds.climate.copernicus.eu/datasets/satellite-ist-sst-global?tab=overview

Primary product guide (v1.1, 19 October 2024; relevant field/flag/analysis definitions, not independent validation of the supplied aggregation): https://dast.copernicus-climate.eu/documents/satellite-ist-sst-global/WP2-FDDP-SSTv1.0-PUGS-v1.1_Final-2.pdf

Hosting references: https://developers.cloudflare.com/workers/platform/limits/ and https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
