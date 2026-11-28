'use strict';
// Bounded public-source test for Director #3254. No ciphertext or image-fit parameters.
const {createHash} = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {mkdtempSync,writeFileSync} = require('node:fs');
const os=require('node:os'),path=require('node:path');
const ORIGIN='https://resources.oreilly.com';
const PROJECT=1779; // Photoshop CS5 The Missing Manual, May 2010 book
const STOCK='6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34';
const hash=b=>createHash('sha256').update(b).digest('hex');
async function get(url){
 const r=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'liber-primus-original-source-gate/1.0','Accept':'application/json, image/jpeg, */*'}});
 const b=Buffer.from(await r.arrayBuffer());
 if(!r.ok)throw new Error('HTTP '+r.status+' '+url+' '+b.toString('utf8',0,Math.min(b.length,100)));
 return b;
}
function jpegSOF(b){
 if(b[0]!==255||b[1]!==216)return null;
 for(let i=2;i+8<b.length;){
  if(b[i]!==255){i++;continue}
  let m=b[++i];i++;while(m===255)m=b[i++];
  if(m===217||m===218)break;
  if(m===1||(m>=208&&m<=215))continue;
  const n=b.readUInt16BE(i);if(n<2)break;
  if([192,193,194,195,198,199,201,202,203,205,206,207].includes(m))
   return {width:b.readUInt16BE(i+5),height:b.readUInt16BE(i+3),marker:m.toString(16)};
  i+=n;
 }
 return null;
}
(async()=>{
 const out={name:'OReilly May 2010 DeadTree.jpg candidate gate',archive:ORIGIN+'/examples/0636920001140',method:'GitLab public API; no rune tuning'};
 try {
  const files=[];
  for(let p=1;p<=10;p++){
   const a=JSON.parse((await get(ORIGIN+'/api/v4/projects/'+PROJECT+'/repository/tree?recursive=true&per_page=100&page='+p)).toString('utf8'));
   if(!Array.isArray(a))throw Error('Unexpected repository tree response');
   files.push(...a);if(a.length<100)break;
  }
  out.repository_tree_entries=files.length;
  out.matches=files.filter(x=>/deadtree|dead.?tree/i.test(x.path||'')).map(x=>({path:x.path,type:x.type,id:x.id}));
  const entry=files.find(x=>x.type==='blob'&&/dead.?tree\.jpe?g$/i.test(x.path));
  if(!entry){out.disposition='NO EXACT FILE: 2010 publication names the image but repository has no matching blob';}
  else{
   const b=await get(ORIGIN+'/api/v4/projects/'+PROJECT+'/repository/files/'+encodeURIComponent(entry.path)+'/raw?ref=master');
   const digest=hash(b);
   out.exact_file={path:entry.path,bytes:b.length,sha256:digest,intrinsic:jpegSOF(b),same_bytes_as_clipartbest:digest===STOCK};
   const tmp=mkdtempSync(path.join(os.tmpdir(),'lp2tree-')), file=path.join(tmp,'candidate.jpg');
   writeFileSync(file,b);
   const proc=spawnSync('python',['-c','from PIL import Image; import sys; x=Image.open(sys.argv[1]); print(x.size,x.mode,x.getpixel((x.width//2,x.height//2)))',file],{encoding:'utf8',timeout:10000});
   out.PIL_optional={status:proc.status,stdout:proc.stdout?.trim(),stderr:proc.stderr?.slice(0,200)};
   
   try {
     const commons=await get('https://upload.wikimedia.org/wikipedia/commons/7/7e/DeadTree.jpg');
     const stock=await get('https://raw.githubusercontent.com/MonokumaBear/cicadaConvolutionKernels/cead7046c37ed19c482302478605f61f55770db5/originalTreeImage.jpg');
     if(hash(stock)!==STOCK)throw Error('Stock source hash mismatch');
     const commonsFile=path.join(tmp,'commons.jpg'),stockFile=path.join(tmp,'stock.jpg');
     writeFileSync(commonsFile,commons);writeFileSync(stockFile,stock);
     out.reference_files={commons:{sha256:hash(commons),bytes:commons.length,SOF:jpegSOF(commons)},stock:{sha256:hash(stock),bytes:stock.length,SOF:jpegSOF(stock)}};
     const pip=spawnSync('python',['-m','pip','install','--quiet','numpy','opencv-python-headless'],{encoding:'utf8',timeout:180000,maxBuffer:500000});
     out.cv2_install={status:pip.status,stderr:pip.stderr?.slice(-450)};
     if(pip.status===0){
       const result=spawnSync('python',['sims/lp2_oreilly_tree_identity_preflight.py',file,commonsFile,stockFile],{encoding:'utf8',timeout:90000,maxBuffer:500000});
       if(result.status===0)out.original_source_identity=JSON.parse(result.stdout);
       else out.image_comparison_error={status:result.status,stderr:result.stderr?.slice(-900)};
     }
   }catch(e){out.image_comparison_error=e.message;}
   out.disposition=digest===STOCK?'EXACT REPEAT of pinned source':'NEW EXACT FILE; use source-identity comparison and held root/twigs to decide';
  }
 }catch(e){out.error=e.message;out.disposition='ACQUISITION BLOCKED: no exact-file claim';}
 console.log(JSON.stringify(out,null,2));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
