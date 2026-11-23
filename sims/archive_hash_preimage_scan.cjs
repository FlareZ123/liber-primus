'use strict';
/** Frozen, finite 2014 archive hash-preimage screen. Node.js 20+. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const m=require('../resources/cicada2014-archive-hash-manifest.json');
const algorithms=['sha512','sha3-512','blake2b512'];
for(const a of algorithms)if(!crypto.getHashes().includes(a))throw Error('Unsupported digest '+a);
if(!/^[0-9a-f]{128}$/.test(m.targetHex))throw Error('Bad 512-bit hash');
if(crypto.createHash('sha512').update('abc').digest('hex')!=='ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f')throw Error('SHA-512 positive control failed');
const report={targetHex:m.targetHex,sourceRepo:m.sourceRepo,sourceCommit:m.sourceCommit,digests:algorithms,sources:[],candidates:[],urlStrings:[],blobVariants:0,urlVariants:0,hashEvaluations:0,hits:[],coverage:'Original archived bytes and newline variants for textual files; six literal forms for seven pinned Cicada onion hosts, plus eight literal forms for every distinct valid v2 host in the preserved 2014-09 stage11 period corpus.'};
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
function decodeV2OnionId(host){
  const label=host.toLowerCase().replace(/\.onion$/,'');
  if(!/^[a-z2-7]{16}$/.test(label))throw Error('Not a v2 onion host: '+host);
  const alphabet='abcdefghijklmnopqrstuvwxyz234567';
  let acc=0,bits=0;
  const out=[];
  for(const ch of label){
    acc=(acc<<5)|alphabet.indexOf(ch);
    bits+=5;
    while(bits>=8){
      bits-=8;
      out.push((acc>>bits)&255);
      acc&=(1<<bits)-1;
    }
  }
  if(out.length!==10||bits!==0)throw Error('Bad decoded v2 onion identifier: '+host);
  return Buffer.from(out);
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
  if(/\.(?:html(?:\.[0-9]+)?|asc|decoded|txt)$/.test(item.path)){
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
  const manifestBinaryStart=report.hashEvaluations;
  const manifestBinaryHitsStart=report.hits.length;
  for(const host of m.onionHosts){
    for(const fn of forms){const u=fn(host);check(host,u,u,'url');report.urlStrings.push(u);}
    check(host,'base32-decoded-10-byte-onion-id',decodeV2OnionId(host),'blob');
  }
  report.manifestOnionBinary={
    hosts:m.onionHosts.length,
    representation:'base32-decoded-10-byte-onion-id',
    digestAlgorithms:algorithms,
    hashEvaluations:report.hashEvaluations-manifestBinaryStart,
    hits:report.hits.length-manifestBinaryHitsStart
  };

  // A bounded, contemporaneous candidate set not included in the original seven-host
  // manifest: the preserved 2014-09 stage11 period onion-host corpus.  It is an
  // external historical candidate list, not an authenticated Cicada key.
  const periodPath='resources/external/2014-09-stage11-period-onion-hosts.txt';
  const periodText=fs.readFileSync(periodPath,'utf8');
  const periodBytes=Buffer.from(periodText,'utf8');
  const periodLines=periodText.split(/\r?\n/).map(x=>x.trim().toLowerCase()).filter(Boolean);
  const validPeriodLines=periodLines.filter(x=>/^[a-z2-7]{16}\.onion$/.test(x));
  const periodHosts=[...new Set(validPeriodLines)];
  if(periodHosts.length!==3173)throw Error('Period host-list drift: expected 3173 unique v2 hosts, got '+periodHosts.length);
  inspect({path:periodPath,size:periodBytes.length},periodBytes);
  const periodForms=[
    ['bare-label',h=>h.slice(0,-6)],
    ['host-onion',h=>h],
    ['http',h=>'http://'+h],
    ['http-root',h=>'http://'+h+'/'],
    ['http-index',h=>'http://'+h+'/index.html'],
    ['https',h=>'https://'+h],
    ['https-root',h=>'https://'+h+'/'],
    ['https-index',h=>'https://'+h+'/index.html']
  ];
  const periodStart=report.hashEvaluations, periodHitsStart=report.hits.length;
  const manifestOverlap=periodHosts.filter(h=>m.onionHosts.includes(h));
  for(const host of periodHosts){
    for(const [label,fn] of periodForms){
      const u=fn(host);
      check(periodPath+':'+host,'period-hostlist:'+label,u,'url');
      report.urlStrings.push(u);
    }
  }
  const periodBinaryStart=report.hashEvaluations, periodBinaryHitsStart=report.hits.length;
  for(const host of periodHosts){
    check(periodPath+':'+host,'period-hostlist:base32-decoded-10-byte-onion-id',decodeV2OnionId(host),'blob');
  }
  const periodBinaryEvaluations=report.hashEvaluations-periodBinaryStart;
  const periodBinaryHits=report.hits.length-periodBinaryHitsStart;
  const periodSummary={
    path:periodPath,
    bytes:periodBytes.length,
    sha256:crypto.createHash('sha256').update(periodBytes).digest('hex'),
    nonemptyLines:periodLines.length,
    validV2Lines:validPeriodLines.length,
    uniqueV2Hosts:periodHosts.length,
    duplicateValidLines:validPeriodLines.length-periodHosts.length,
    invalidNonemptyLines:periodLines.length-validPeriodLines.length,
    manifestOverlap,
    forms:periodForms.map(x=>x[0]),
    binaryRepresentations:['base32-decoded-10-byte-onion-id'],
    binaryHashEvaluations:periodBinaryEvaluations,
    binaryHits:periodBinaryHits,
    digestAlgorithms:algorithms,
    hashEvaluations:report.hashEvaluations-periodStart,
    hits:report.hits.length-periodHitsStart
  };
  report.periodHostList=periodSummary;
  report.candidates.push({source:periodPath,uniqueV2Hosts:periodHosts.length,representations:[...periodForms.map(x=>x[0]),'base32-decoded-10-byte-onion-id'],algorithms,matchCount:periodSummary.hits+periodSummary.binaryHits});
  console.log('PERIOD-HOSTLIST',JSON.stringify(periodSummary));

  // A source-native p56 preimage candidate: the complete January 2014 onion-2 stream.
  // Test only its exact raw bytes, lowercase hex text, and preserved resource-file bytes.
  const onionText=fs.readFileSync('resources/2014-onion2-final-256byte-hex.txt','utf8');
  const onionHex=onionText.trim();
  if(!/^[0-9a-f]{512}$/.test(onionHex))throw Error('Bad preserved onion-2 256-byte hex source');
  const onionBytes=Buffer.from(onionHex,'hex');
  if(onionBytes.length!==256)throw Error('Onion-2 candidate is not 256 bytes');
  const hitsBefore=report.hits.length;
  check('resources/2014-onion2-final-256byte-hex.txt','raw-256-byte-value',onionBytes,'blob');
  check('resources/2014-onion2-final-256byte-hex.txt','lowercase-hex-ASCII',Buffer.from(onionHex,'utf8'),'blob');
  check('resources/2014-onion2-final-256byte-hex.txt','exact-resource-file-bytes',Buffer.from(onionText,'utf8'),'blob');
  report.candidates.push({source:'resources/2014-onion2-final-256byte-hex.txt',byteLength:256,representations:['raw-256-byte-value','lowercase-hex-ASCII','exact-resource-file-bytes'],algorithms,matchCount:report.hits.length-hitsBefore});
  console.log('ONION2-P56-CANDIDATE',JSON.stringify(report.candidates[0]));
  console.log('SUMMARY',JSON.stringify({sources:report.sources.length,blobVariants:report.blobVariants,urlVariants:report.urlVariants,hashEvaluations:report.hashEvaluations,hits:report.hits.length}));
  saveAtomicLocked(path.resolve(process.argv[2]||'archive-hash-scan-output.json'),JSON.stringify(report,null,2)+'\n');
}
main().catch(e=>{console.error('FATAL',e.stack||e);process.exitCode=1;});
