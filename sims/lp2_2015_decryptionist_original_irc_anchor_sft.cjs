'use strict';

/**
 * Search the exact source-dated 2014-16 original Cicada IRC logs for the
 * 2015 wiki's privately circulated DECRYPTIONIST C-language program.
 * The only search keys are the program name and the participant's published
 * address/handle. Source blobs are verified before any inference.
 * Node 22 CJS, independent 2014/15 source check, Windows compatible.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const https=require('node:https');

const records=[
  {path:'#cicadasolvers.freenode.log',bytes:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {path:'#cicadasolvers.freenode.2.log',bytes:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
  {path:'#33012014.freenode.log',bytes:8629610,sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];

/** @param {string} url @returns {Promise<Buffer>} */
function get(url){
 return new Promise((resolve,reject)=>{
   const req=https.get(url,{headers:{'User-Agent':'LP2-historical-source-2026'}},
   response=>{
     assert.equal(response.statusCode,200,'original log cannot be fetched: '+url);
     const parts=[];let n=0;
     response.on('data',part=>{
       n+=part.length;
       if(n>29000000)req.destroy(new Error('bounded archive length exceeded'));
       else parts.push(part);
     });
     response.on('end',()=>resolve(Buffer.concat(parts)));
   });
   req.setTimeout(15000,()=>req.destroy(new Error('read timeout')));
   req.on('error',reject);
 });
}
/** @param {Buffer} buf @returns {string} */
function gitBlob(buf){
 return crypto.createHash('sha1').update('blob '+buf.length+'\0','binary')
  .update(buf).digest('hex');
}
async function main(){
 let total=0;
 for(const r of records){
   const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(r.path);
   const data=await get(url);
   assert.equal(data.length,r.bytes);
   assert.equal(gitBlob(data),r.sha);
   const lines=data.toString('latin1').split(/\r?\n/);
   const exact=/\bdecryptionist\b|elbarto(?:@reborn\.com)?|@reborn\.com/ig;
   const hits=[];
   for(let i=0;i<lines.length;i++){
      if(!exact.test(lines[i])){exact.lastIndex=0;continue;}
      exact.lastIndex=0;
      hits.push({line:i+1,window:lines.slice(Math.max(0,i-3),Math.min(lines.length,i+4))});
   }
   console.log(JSON.stringify({source:r.path,sourceBlob:r.sha,sourceBytes:r.bytes,
     totalLines:lines.length,exactNamedReferenceCount:hits.length,hits:hits.slice(0,30)}));
   total+=hits.length;
 }
 console.log(JSON.stringify({claim:'finite 2014-2016 archived original IRC exact-name screen',
   exactReferences:total,scope:'named program and exact publicly quoted address/handle only'}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
