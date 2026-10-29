#!/usr/bin/env python3
"""Read-only NetCDF inventory. Does not integrate, infer or generate measurements."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys


def digest(path):
    value = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(block)
    return value.hexdigest()


def json_safe(value):
    if isinstance(value, dict):
        return {str(k): json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe(v) for v in value]
    if hasattr(value, 'tolist'):
        return json_safe(value.tolist())
    if isinstance(value, float) and not math.isfinite(value):
        return str(value)  # Metadata only: preserves that an attribute was nonfinite.
    if isinstance(value, bytes):
        return value.decode('utf-8', errors='backslashreplace')
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('file', type=Path)
    parser.add_argument('--output', type=Path, help='Inventory JSON; the source file is never overwritten')
    args = parser.parse_args()
    source = args.file.resolve()
    if not source.is_file():
        parser.error('Source file does not exist')
    if args.output and args.output.resolve() == source:
        parser.error('Output must differ from the original source file')
    try:
        import xarray as xr
    except ImportError:
        print('NetCDF inspection requires tools/requirements-science.txt. No data was imported.', file=sys.stderr)
        return 2
    original_hash = digest(source)
    # CF decoding, packed values, missing flags and unit conversions require file-specific review.
    with xr.open_dataset(source, decode_cf=False, mask_and_scale=False, cache=False) as ds:
        variables = {
            name: {'dimensions': list(v.dims), 'shape': list(v.shape), 'dtype': str(v.dtype),
                   'attributes': json_safe(dict(v.attrs))}
            for name, v in ds.variables.items()
        }
        candidates = [name for name, v in ds.data_vars.items()
                      if v.attrs.get('standard_name') in ('sea_surface_temperature', 'sea_water_temperature')]
        report = {
            'status': 'inventory_only', 'dataIntegrated': False,
            'originalFile': source.name, 'sourceSha256': original_hash,
            'dimensions': dict(ds.sizes), 'globalAttributes': json_safe(dict(ds.attrs)),
            'variables': variables, 'possibleTemperatureVariables': candidates,
            'automaticVariableSelection': False,
            'reviewRequired': [
                'Verify product, version, license and the actual SST definition (skin/foundation/depth).',
                'Inspect coordinate variables, CRS, longitude convention, time units and CF calendar.',
                'Review scale_factor, add_offset, _FillValue, missing_value, valid_range and quality flags.',
                'Audit missing and invalid measurements before creating a file-specific adapter.',
                'Retain original units or document any exact conversion; never fill missing cells with zero.',
                'Compare observed time and geographic coverage with documented NASA source coverage.',
                'Display source measurements only; scientific model use needs separate validation.'
            ]
        }
    if digest(source) != original_hash:
        raise RuntimeError('The source changed during inspection; discard this inventory and inspect again')
    payload = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    if args.output:
        args.output.write_text(payload, encoding='utf-8')
    else:
        print(payload, end='')
    return 0


if __name__ == '__main__':
    sys.exit(main())
