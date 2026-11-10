'use strict';
/** Frozen, finite 2014 archive hash-preimage screen. Node.js 20+. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const m=require('../resources/cicada2014-archive-hash-manifest.json');
const algorithms=['sha512','sha3-512','blake2b512'];
for(const a of algorithms)if(!crypto.getHashes().includes(a))throw Error('Unsupported digest '+a);
if(!/^[0-9a-f]{128}$/.test(m.targetHex))throw Error('Bad 512-bit hash');
if(crypto.createHash('sha512').update('abc').digest('hex')!=='ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f')throw Error('SHA-512 positive control failed');
const report={targetHex:m.targetHex,sourceRepo:m.sourceRepo,sourceCommit:m.sourceCommit,digests:algorithms,sources:[],urlStrings:[],blobVariants:0,urlVariants:0,hashEvaluations:0,hits:[],coverage:'Original archived bytes, single trailing newline deletion and CRLF-to-LF for textual files; six literal forms per historical onion hostname.'};
function check(source,variant,bytes,kind){
  const b=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes,'utf8');
  if(kind==='url')report.urlVariants++;else report.blobVariants++;
  for(const algorithm of algorithms){
    report.hashEvaluations++;
    if(crypto.createHash(algorithm).update(b).digest('hex')===m.targetHex){
      const hit={source,variant,algorithm,inputHex:b.toString('hex')};
      report.hits.push(hit);console.log('MATCH',JSON.stringify(hit));
    }
  }
}
async function getFile(filename){
  const u='https://raw.githubusercontent.com/'+m.sourceRepo+'/'+m.sourceCommit+'/'+filename.split('/').map(encodeURIComponent).join('/');
  for(let k=0;k<4;k++){
    try{
      const r=await fetch(u,{signal:AbortSignal.timeout(90000)});
      if(!r.ok)throw Error('HTTP '+r.status+' '+u);
      return Buffer.from(await r.arrayBuffer());
    }catch(e){if(k===3)throw e;await new Promise(resolve=>setTimeout(resolve,1500*(k+1)));}
  }
}
function inspect(item,b){
  if(b.length!==item.size)throw Error('Archive size drift '+item.path+' expected '+item.size+' got '+b.length);
  const s={path:item.path,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),variants:['raw']};
  check(item.path,'raw',b,'blob');
  if(/\.(?:html(?:\.[0-9]+)?|asc|decoded)$/.test(item.path)){
    if(b.length&&b.at(-1)===10){check(item.path,'drop-final-LF',b.subarray(0,-1),'blob');s.variants.push('drop-final-LF');}
    const t=b.toString('utf8');
    if(t.includes('\r\n')){check(item.path,'CRLF-to-LF',t.replace(/\r\n/g,'\n'),'blob');s.variants.push('CRLF-to-LF');}
  }
  report.sources.push(s);console.log('SOURCE',JSON.stringify(s));
}
function saveAtomicLocked(dest,data){
  const lock=dest+'.lock',temp=dest+'.tmp-'+process.pid,fd=fs.openSync(lock,'wx');
  try{fs.writeFileSync(temp,data);fs.renameSync(temp,dest);}
  finally{if(fs.existsSync(temp))fs.unlinkSync(temp);fs.closeSync(fd);fs.unlinkSync(lock);}
}
async function main(){
  for(const item of m.files)inspect(item,await getFile(item.path));
  const forms=[
    h=>h,h=>'http://'+h,h=>'http://'+h+'/',h=>'http://'+h+'/index.html',
    h=>'https://'+h+'/',h=>'https://'+h+'/index.html'
  ];
  for(const host of m.onionHosts){
    for(const fn of forms){const u=fn(host);check(host,u,u,'url');report.urlStrings.push(u);}
  }
  console.log('SUMMARY',JSON.stringify({sources:report.sources.length,blobVariants:report.blobVariants,urlVariants:report.urlVariants,hashEvaluations:report.hashEvaluations,hits:report.hits.length}));
  saveAtomicLocked(path.resolve(process.argv[2]||'archive-hash-scan-output.json'),JSON.stringify(report,null,2)+'\n');
}
main().catch(e=>{console.error('FATAL',e.stack||e);process.exitCode=1;});
