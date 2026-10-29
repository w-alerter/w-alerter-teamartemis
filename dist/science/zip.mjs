/* Bounded ZIP reader shared by local scientific archive adapters. No extraction or upload. */
const MAX_UNCOMPRESSED=80*1024*1024,MAX_ZIP=25*1024*1024;
const text=new TextDecoder('utf-8',{fatal:true});
export function crc32(bytes){let crc=-1;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^-1)>>>0;}
export async function readZip(bytes){
  if(!(bytes instanceof Uint8Array)||bytes.length<22||bytes.length>MAX_ZIP)throw Error('zip_size_invalid');const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(v.getUint32(i,true)===0x06054b50&&i+22+v.getUint16(i+20,true)===bytes.length){end=i;break;}
  if(end<0||v.getUint16(end+4,true)!==0||v.getUint16(end+6,true)!==0||v.getUint16(end+8,true)!==v.getUint16(end+10,true))throw Error('unsupported_zip');
  const count=v.getUint16(end+10,true),centralSize=v.getUint32(end+12,true),central=v.getUint32(end+16,true);if(count>32||central+centralSize!==end)throw Error('invalid_zip_directory');let offset=central,total=0;const entries=new Map();
  for(let i=0;i<count;i++){if(offset+46>end||v.getUint32(offset,true)!==0x02014b50)throw Error('invalid_zip_entry');const flags=v.getUint16(offset+8,true),method=v.getUint16(offset+10,true),crc=v.getUint32(offset+16,true),compressed=v.getUint32(offset+20,true),size=v.getUint32(offset+24,true),nl=v.getUint16(offset+28,true),el=v.getUint16(offset+30,true),cl=v.getUint16(offset+32,true),local=v.getUint32(offset+42,true),next=offset+46+nl+el+cl;
    if(next>end||flags&1||![0,8].includes(method)||size===0xffffffff||local+30>central)throw Error('unsupported_zip_entry');const name=text.decode(bytes.slice(offset+46,offset+46+nl));if(name.includes('..')||name.includes('\\')||name.startsWith('/')||entries.has(name))throw Error('unsafe_zip_path');total+=size;if(total>MAX_UNCOMPRESSED)throw Error('zip_uncompressed_limit');
    if(v.getUint32(local,true)!==0x04034b50||v.getUint16(local+8,true)!==method)throw Error('zip_local_header_mismatch');const lnl=v.getUint16(local+26,true),lel=v.getUint16(local+28,true),start=local+30+lnl+lel;if(start+compressed>central||text.decode(bytes.slice(local+30,local+30+lnl))!==name)throw Error('zip_offset_mismatch');entries.set(name,{start,compressed,size,crc,method});offset=next;
  }
  if(offset!==end)throw Error('zip_directory_length_mismatch');
  const readBytes=async name=>{const e=entries.get(name);if(!e)throw Error('required_dwca_entry_missing');let data=bytes.slice(e.start,e.start+e.compressed);if(e.method===8){if(typeof DecompressionStream!=='function')throw Error('local_zip_decoder_unavailable');const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(),chunks=[];let length=0;while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>e.size||length>MAX_UNCOMPRESSED){await reader.cancel();throw Error('zip_expansion_mismatch');}chunks.push(value);}data=new Uint8Array(length);let i=0;for(const c of chunks){data.set(c,i);i+=c.length;}}
    if(data.length!==e.size||crc32(data)!==e.crc)throw Error('zip_checksum_mismatch');return data;};
  return {names:[...entries.keys()],readBytes,async read(name){return text.decode(await readBytes(name));}};
}
