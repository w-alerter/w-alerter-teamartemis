import {parseWhaleArchive} from './archive.mjs';
self.onmessage=async e=>{try{const data=await parseWhaleArchive(new Uint8Array(e.data.bytes),{fileName:e.data.fileName});self.postMessage({ok:true,data});}catch(error){self.postMessage({ok:false,error:error.message});}};
