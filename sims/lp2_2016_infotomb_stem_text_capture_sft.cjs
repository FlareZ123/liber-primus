'use strict';
/**
 * Inspect exactly two independently indexed host response captures for the
 * authored 4gq25 image stem. Inspect content and origin headers; do not infer
 * a genuine source text from Wayback's CDX 200 status alone.
 */
const crypto=require('node:crypto');
const captures=[
 {label:'2016-04-12 text companion',wayback:'20160412061859',path:'4gq25.txt'},
 {label:'2016-03-14 image path text response',wayback:'20160314054005',path:'4gq25.jpg'}
];
(async()=>{
for(const x of captures){
 const q='https://web.archive.org/web/'+x.wayback+'id_/https://infotomb.com/'+x.path;
 try{
  const r=await fetch(q,{signal:AbortSignal.timeout(45000)});
  const b=Buffer.from(await r.arrayBuffer());
  const sha=crypto.createHash('sha256').update(b).digest('hex');
  const headers=Object.fromEntries([...r.headers].filter(([k])=>
   /^(content-type|content-length|memento-datetime|x-archive|x-amz|server|location|link)/i.test(k)
  ));
  console.log(JSON.stringify({label:x.label,url:q,final:r.url,status:r.status,
   bytes:b.length,sha256:sha,headers,bodyUtf8:b.toString('utf8').slice(0,2500)},null,2));
 }catch(e){console.log(JSON.stringify({label:x.label,error:String(e)}));}
}
})().catch(e=>{console.error(e);process.exitCode=1;});
