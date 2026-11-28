'use strict';
// Director #3340: archival acquisition from the period participant's 2014
// Onion3 directories. Hash only *exact preserved raw response objects* or
// source-documented immediate hex-to-binary derivations; no new transforms.
// Connected read-only manual CI; intentionally does not write local files.
const https=require('node:https'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const target='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
assert.equal(target.length,128);
const sources=[
 {id:'n-onion3-raw',file:'onion3.raw',size:4302741},
 {id:'n-onion3-bin',file:'onion3.bin',size:2116096},
 {id:'n-onion3-reversed',file:'onion3-reversed.bin',size:2116096},
 {id:'n-status-raw',file:'server-status.raw',size:1368580},
 {id:'n-status-decoded',file:'server-status.bin',size:673066},
 {id:'n-status-new-html',file:'li676-224_server-status_new.html',size:1370851},
 {id:'n-infotomb-status-raw',file:'infotomb-server-status.hex',size:4373266},
 {id:'n-infotomb-status-decoded',file:'infotomb-server-status.bin',size:2116096},
 {id:'n-onion3-initial',file:'512.raw',size:524},
 {id:'n-onion3-initial-hex',file:'512.hex',size:520},
];
const base='https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/005-third-onion/';
function get(url,remaining=3){
 return new Promise((resolve,reject)=>{https.get(url,{headers:{'User-Agent':'liber-primus-source-object-gate/1.0'}},res=>{
  if([301,302,307,308].includes(res.statusCode)&&remaining>0){const next=new URL(res.headers.location,url);res.resume();get(next,remaining-1).then(resolve,reject);return;}
  if(res.statusCode!==200){res.resume();reject(Error('HTTP '+res.statusCode+' '+url));return;}
  let n=0,b=[];res.on('data',x=>{n+=x.length;if(n>7*1024*1024){res.destroy(Error('over cap'));return;}b.push(x);});
  res.on('end',()=>resolve(Buffer.concat(b)));res.on('error',reject);
 }).on('error',reject);});
}
const h=(buf,alg)=>crypto.createHash(alg).update(buf).digest('hex');
function whirlpool(buf){
 const script="const crypto=require('node:crypto'),fs=require('node:fs');process.stdout.write(crypto.createHash('whirlpool').update(fs.readFileSync(0)).digest('hex'))";
 const r=cp.spawnSync(process.execPath,['--openssl-legacy-provider','-e',script],{input:buf,encoding:'utf8',maxBuffer:1024*1024,timeout:30000,windowsHide:true});
 if(r.error||r.status!==0)throw Error('Whirlpool child error '+(r.error||r.stderr));
 return r.stdout.trim();
}
assert.equal(whirlpool(Buffer.alloc(0)),'19fa61d75522a4669b44e39c1d2e1726c530232130d407f89afee0964997f7a73e83be698b288febcf88e3e03c4f0757ea8964e59b63d93708b138cc42a66eb3');
async function main(){
 const seen=new Map(),rows=[];
 for(const s of sources){
  const b=await get(base+s.file);assert.equal(b.length,s.size,s.id+' unexpected bytes');
  const sha256=h(b,'sha256'),sha512=h(b,'sha512'),w=whirlpool(b);
  const duplicate=seen.get(sha256)||null;if(!duplicate)seen.set(sha256,s.id);
  rows.push({id:s.id,file:s.file,bytes:b.length,sha256,sha512,whirlpool:w,dedupOf:duplicate,matchSha512:sha512===target,matchWhirlpool:w===target});
  console.log(JSON.stringify(rows.at(-1)));
 }
 console.log('SUMMARY '+JSON.stringify({target,nSources:rows.length,nUnique:seen.size,matches:rows.filter(r=>r.matchSha512||r.matchWhirlpool),totalBytes:rows.reduce((s,r)=>s+r.bytes,0),sourceRepoCommit:'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3'}));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
