'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const urls=[
 'https://www.cicadamania.com/downloads/cicadaletters.pdf',
 ...[2,3,4].map(n=>'https://www.cicadamania.com/cicadas/wp-content/uploads/2024/06/cicadaletters2-'+n+'.webp')
];
(async()=>{
 const records=[];
 for(const url of urls){
   try{
     const r=await fetch(url,{signal:AbortSignal.timeout(30000)});
     const b=Buffer.from(await r.arrayBuffer());
     records.push({url,final:r.url,status:r.status,type:r.headers.get('content-type'),bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),base64:r.ok?b.toString('base64'):undefined});
   }catch(e){records.push({url,error:String(e),cause:String(e.cause||'')});}
 }
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),'source-test-output.json'),JSON.stringify({records},null,2));
 console.log(JSON.stringify(records.map(({base64,...r})=>r)));
})().catch(e=>{console.error(e);process.exitCode=1});
