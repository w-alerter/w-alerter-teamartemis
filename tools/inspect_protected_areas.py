#!/usr/bin/env python3
"""Independent, stdlib-only audit. Never writes source attributes or boundaries to dist."""
import argparse,csv,hashlib,io,json,struct,zipfile
from pathlib import Path
from collections import Counter

def audit(path):
    original=path.read_bytes(); before=hashlib.sha256(original).hexdigest(); records=[]; layer_audits=[]; extents=[]; vertices=0
    with zipfile.ZipFile(io.BytesIO(original)) as outer:
        assert outer.testzip() is None, 'Outer ZIP CRC failure'
        sources=list(csv.DictReader(io.StringIO(outer.read('WDPA_sources_Oct2026.csv').decode('utf-8-sig'))))
        source_ids={int(s['METADATAID']) for s in sources}
        for part in range(3):
            name=f'WDPA_WDOECM_Oct2026_Public_PO_shp_{part}.zip'
            with zipfile.ZipFile(io.BytesIO(outer.read(name))) as archive:
                assert archive.testzip() is None, 'Nested ZIP CRC failure'
                for layer in ('polygons','points'):
                    stem=f'WDPA_WDOECM_Oct2026_Public_PO_shp-{layer}'
                    assert archive.read(stem+'.cpg').decode().strip()=='UTF-8'
                    assert 'GCS_WGS_1984' in archive.read(stem+'.prj').decode()
                    dbf=archive.read(stem+'.dbf'); count,header,row_size=struct.unpack_from('<IHH',dbf,4);fields=[];offset=32
                    while dbf[offset]!=13:
                        desc=dbf[offset:offset+32];fields.append((desc[:11].split(b'\0')[0].decode(),chr(desc[11]),desc[16]));offset+=32
                    assert header==offset+1 and sum(f[2] for f in fields)+1==row_size
                    layer_records=[]
                    for i in range(count):
                        row=dbf[header+i*row_size:header+(i+1)*row_size];assert row[:1]==b' ';offset=1;props={}
                        for key,typ,size in fields:
                            raw=row[offset:offset+size].decode('utf8').strip();offset+=size
                            props[key]=(float(raw) if '.' in raw else int(raw)) if typ=='N' and raw else raw
                        assert props['METADATAID'] in source_ids
                        layer_records.append(props);records.append(props)
                    shp=archive.read(stem+'.shp');shx=archive.read(stem+'.shx')
                    assert struct.unpack_from('>i',shp,0)[0]==9994 and struct.unpack_from('>i',shp,24)[0]*2==len(shp)
                    assert (len(shx)-100)//8==count
                    offset=100;types=Counter();n_vertices=0;rings=0
                    for i in range(count):
                        rec,length=struct.unpack_from('>ii',shp,offset);assert rec==i+1
                        ix,ix_len=struct.unpack_from('>ii',shx,100+i*8);assert ix*2==offset and ix_len==length
                        body=shp[offset+8:offset+8+length*2];shape_type=struct.unpack_from('<i',body,0)[0];types[shape_type]+=1
                        if shape_type==5:
                            n_parts,n_points=struct.unpack_from('<ii',body,36);coords=list(struct.iter_unpack('<dd',body[44+4*n_parts:]));assert len(coords)==n_points
                            parts=struct.unpack_from('<'+'i'*n_parts,body,44);assert parts[0]==0
                            for j,start in enumerate(parts):
                                ring=coords[start:parts[j+1] if j+1<n_parts else n_points];assert ring[0]==ring[-1] and len(ring)>=4
                                assert all(abs(a[0]-b[0])<=180 for a,b in zip(ring,ring[1:]))
                            rings+=n_parts
                        elif shape_type==8:
                            n_points=struct.unpack_from('<i',body,36)[0];coords=list(struct.iter_unpack('<dd',body[40:]));assert len(coords)==n_points
                        elif shape_type==1:
                            coords=[struct.unpack_from('<dd',body,4)];n_points=1
                        else:raise AssertionError(f'Unsupported shape {shape_type}')
                        assert all(-180<=x<=180 and -90<=y<=90 for x,y in coords)
                        bbox=[min(x for x,y in coords),min(y for x,y in coords),max(x for x,y in coords),max(y for x,y in coords)];extents.append(bbox)
                        n_vertices+=n_points;offset+=8+length*2
                    assert offset==len(shp)
                    vertices+=n_vertices;layer_audits.append({'part':part,'layer':layer,'records':count,'shapeTypes':dict(types),'vertices':n_vertices,'rings':rings,'fields':[k for k,t,s in fields]})
    assert len({r['SITE_PID'] for r in records})==len(records)
    assert hashlib.sha256(path.read_bytes()).hexdigest()==before,'Raw archive changed'
    return {'fileName':path.name,'sha256':before,'bytes':len(original),'release':'2026-10','releaseEvidence':'archive and layer names, not a measurement or validity period','crs':'EPSG:4326','encoding':'UTF-8','recordCount':len(records),'uniqueSiteCount':len({r['SITE_ID'] for r in records}),'vertexCount':vertices,'polygonCount':sum(a['records'] for a in layer_audits if a['layer']=='polygons'),'pointRecordCount':sum(a['records'] for a in layer_audits if a['layer']=='points'),'bbox':[min(b[0] for b in extents),min(b[1] for b in extents),max(b[2] for b in extents),max(b[3] for b in extents)],'counts':{key:dict(Counter(r[key] for r in records)) for key in ('SITE_TYPE','REALM','ISO3','STATUS','NO_TAKE')},'statusYearRange':[min(r['STATUS_YR'] for r in records),max(r['STATUS_YR'] for r in records)],'sourceTableRows':len(sources),'usedMetadataIds':sorted({r['METADATAID'] for r in records}),'zeroReportedMarineAreaWithPositiveGisMarineArea':sum(r['REP_M_AREA']==0 and r.get('GIS_M_AREA',0)>0 for r in records),'layers':layer_audits,'commercialDistributionCleared':False,'distribution':'raw archive and derived boundaries excluded from published assets'}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('--output',type=Path,required=True);args=p.parse_args();result=audit(args.archive);args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n');print(json.dumps({k:result[k] for k in ('recordCount','uniqueSiteCount','vertexCount','polygonCount','pointRecordCount','sha256')}))
