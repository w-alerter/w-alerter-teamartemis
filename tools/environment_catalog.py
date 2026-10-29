"""Update only named datasets, preserving other sources. Publish the catalog atomically last."""
import json,os,tempfile

def upsert_catalog(path,entries):
    catalog=json.loads(path.read_text()) if path.exists() else {'format':'w-alerter-environmental-catalog','version':1,'datasets':[]}
    if catalog.get('format')!='w-alerter-environmental-catalog' or catalog.get('version')!=1 or not isinstance(catalog.get('datasets'),list):raise ValueError('Unsupported environmental catalog')
    ids=[e['id'] for e in entries]
    if len(ids)!=len(set(ids)):raise ValueError('Duplicate incoming dataset IDs')
    existing={e['id']:e for e in catalog['datasets']}
    if len(existing)!=len(catalog['datasets']):raise ValueError('Duplicate existing dataset IDs')
    for entry in entries:existing[entry['id']]=entry
    catalog['datasets']=list(existing.values());path.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile('w',dir=path.parent,delete=False,encoding='utf8') as f:
        json.dump(catalog,f,ensure_ascii=False,allow_nan=False,separators=(',',':'));f.write('\n');temporary=f.name
    os.replace(temporary,path)
