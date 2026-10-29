import {parseProtectionArchive} from './archive.mjs';
self.onmessage=async e=>{try{const data=await parseProtectionArchive(new Uint8Array(e.data.bytes),{fileName:e.data.fileName});self.postMessage({ok:true,data});}catch(error){self.postMessage({ok:false,error:error.message});}};
