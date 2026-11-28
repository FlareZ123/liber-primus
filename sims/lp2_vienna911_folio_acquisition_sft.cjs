'use strict';
const fs=require('node:fs'), path=require('node:path'), os=require('node:os'), crypto=require('node:crypto');
const pid='6352522';
/** @param {string} url */
async function get(url){
  try{
    const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{accept:'application/ld+json, application/json, text/html, image/jpeg, */*'}});
    const b=Buffer.from(await r.arrayBuffer());
    return {url,final:r.url,status:r.status,type:r.headers.get('content-type'),bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),b};
  }catch(e){return {url,error:String(e),cause:String(e.cause||'')};}
}
function label(x){return typeof x==='string'?x:Object.values(x||{}).flat().join(' ');}
(async()=>{
 const records=[], canvases=[], folios=[];
 for(const url of [
   'https://api.onb.ac.at/iiif/presentation/v3/manifest/10048056'
 ]){
   const {b,...meta}=await get(url);let body=b?.toString('utf8')||'';
   let m;try{m=JSON.parse(body);}catch{}
   records.push({...meta,body:body.slice(0,500000),truncated:body.length>500000});
   if(!m)continue;
   const cc=m.items||m.sequences?.[0]?.canvases||[];
   if(!cc.length)continue;
   for(const [i,c] of cc.entries()){
      const image=c.items?.[0]?.items?.[0]?.body||c.images?.[0]?.resource||{};
      const service=Array.isArray(image.service)?image.service[0]:image.service;
      const id=service?.id||service?.['@id'];
      canvases.push({manifest:url,index:i,label:label(c.label),id:c.id||c['@id'],image:image.id||image['@id'],service:id,width:image.width,height:image.height});
   }
   // Acquire only the two relevant leaves, never whole manuscript.
   const targets=canvases.filter(c=>c.manifest===url&&/(^|\D)(20\s*v|21\s*r)(\D|$)/i.test(c.label));
   if(targets.length===2){
     for(const c of targets){
       const imageUrl=c.service?c.service+'/full/1800,/0/default.jpg':c.image;
       if(!imageUrl)continue;
       const {b,...meta}=await get(imageUrl);
       folios.push({...c,...meta,base64:b&&meta.type?.startsWith('image/')?b.toString('base64'):undefined});
     }
     break;
   }
 }
 const out=path.join(process.env.RUNNER_TEMP||os.tmpdir(),'source-test-output.json');
 fs.writeFileSync(out,JSON.stringify({pid,records,canvases,folios},null,2));
 console.log(JSON.stringify({records:records.map(({body,...r})=>r),canvases:canvases.length,folios:folios.map(({base64,...r})=>r)}));
})().catch(e=>{console.error(e);process.exitCode=1});
