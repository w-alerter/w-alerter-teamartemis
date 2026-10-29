import {ObstacleGrid,planOceanRoute} from './astar.mjs';
import {sha256} from '../science/pipeline.mjs';
self.onmessage=async e=>{try{
 const url=new URL('../data/topology/natural-earth-10m-0p1-v1/manifest.json',import.meta.url),response=await fetch(url);if(!response.ok)throw Error('topology_unavailable');const manifest=await response.json(),r=await fetch(new URL(manifest.mask.path,url));if(!r.ok)throw Error('topology_unavailable');const packed=new Uint8Array(await r.arrayBuffer());if(await sha256(packed)!==manifest.mask.compressedSha256)throw Error('topology_checksum_failed');
 const bytes=new Uint8Array(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());if(bytes.length!==manifest.mask.expandedBytes||await sha256(bytes)!==manifest.mask.sha256)throw Error('topology_checksum_failed');const grid=new ObstacleGrid(manifest,bytes),result=planOceanRoute(grid,e.data.points);self.postMessage({ok:true,result});
}catch(error){self.postMessage({ok:false,error:error.message});}};
