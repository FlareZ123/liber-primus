'use strict';
// 2 May 2014 independent IRC submitter reports same MD5 for CICADA callback.
// Compare the period preserved archived May response and other authentic signed
// counterpart at precise raw-byte level. Do not conflate signature equivalence
// with raw byte equality.
const https=require('node:https'),crypto=require('node:crypto');
const source='https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/010-hidden-service-reply/message.txt.asc';
const source2='https://raw.githubusercontent.com/FlareZ123/liber-primus/main/resources/historical/cicada2014-stage11-message.asc';
const expected='6808ed6409c243aacfe8a0f077dba606';
async function get(url){return new Promise((resolve,reject)=>https.get(url,r=>{if(r.statusCode!==200){r.resume();reject(Error('HTTP '+r.statusCode+' '+url));return;}let bs=[];r.on('data',b=>bs.push(b));r.on('end',()=>resolve(Buffer.concat(bs)));r.on('error',reject);}).on('error',reject));}
(async()=>{for(const [name,url] of [['participant-archive-May2',source],['repo-signed-Apr2',source2]]){
 const b=await get(url),hashes={};
 for(const alg of ['md5','sha256','sha512'])hashes[alg]=crypto.createHash(alg).update(b).digest('hex');
 console.log('EXACT '+JSON.stringify({name,url,bytes:b.length,...hashes,md5Equals2014IRC:hashes.md5===expected,leading:b.toString('utf8',0,100)}));
}
console.log('2014_IRC '+expected+' independent brotherBox/ICU declarations at 2014 May 02 14:39-14:42, original raw log lines 163711-163712');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
