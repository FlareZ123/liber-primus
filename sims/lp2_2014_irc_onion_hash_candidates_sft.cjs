'use strict';

/**
 * Source-pinned scan of all original 2014 Cicada IRC logs for onion/URL
 * candidates that could be the missing p56 deep-web hash preimage.
 * Tests only literal, historically observed candidate strings and minimal
 * URL/host representations; it does not invent URL permutations.
 * Node.js 22 CommonJS, standard library only.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const manifest=require('../resources/cicada2014-archive-hash-manifest.json');

const sources=[
 {name:'#cicadasolvers.freenode.log',bytes:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
 {name:'#cicadasolvers.freenode.2.log',bytes:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
 {name:'#33012014.freenode.log',bytes:8629610,sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
const algorithms=['sha512','sha3-512','blake2b512'];
const target=manifest.targetHex.toLowerCase();
const knownHosts=new Set((manifest.onionHosts||[]).map(x=>String(x).toLowerCase().replace(/\.onion$/,'')));
const urlRe=/https?:\/\/[^\s<>"'\x00-\x20]+/ig;
const onionRe=/\b(?:[a-z2-7]{16}|[a-z2-7]{56})\.onion(?:\.(?:to|city|link|ws|cab|rip|nu|sh|so|pet|lu|gq|top|website))?\b/ig;
const relevantRe=/\b(?:onion|tor|hidden service|deep.?web|page\s*56|p56|hash(?:es)?|cicada|liber.?primus|lp2|target|sha.?512)\b/i;

function gitBlobHash(b){
 return crypto.createHash('sha1').update('blob '+b.length+'\0','ascii').update(b).digest('hex');
}
function b32decode(s){
 const alphabet='abcdefghijklmnopqrstuvwxyz234567';
 let acc=0,bits=0,out=[];
 for(const ch of s.toLowerCase()){
  const v=alphabet.indexOf(ch);
  if(v<0)throw Error('Invalid base32 character '+ch);
  acc=(acc<<5)|v;bits+=5;
  if(bits>=8){bits-=8;out.push((acc>>bits)&255);}
 }
 return Buffer.from(out);
}
function selftest(){
 assert.equal(crypto.createHash('sha512').update('abc').digest('hex'),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
 assert.equal(b32decode('my').toString('hex'),'66');
 assert.equal(gitBlobHash(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
 assert(/^[0-9a-f]{128}$/.test(target));
 console.log('PASS SHA-512, base32, Git blob and p56 target controls');
}
const candidates=new Map(),candidateBytes=new Map();
const onionRefs=new Map(),urlRefs=new Map(),targetMentions=[],relevantLines=[];
let hashEvaluations=0;

function addCandidate(bytes,record){
 const b=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes,'utf8');
 const id=crypto.createHash('sha256').update(b).digest('hex');
 let c=candidates.get(id);
 if(!c){c={id,bytes:b.length,variants:[],refs:[]};candidates.set(id,c);candidateBytes.set(id,b);}
 if(!c.variants.includes(record.variant))c.variants.push(record.variant);
 if(c.refs.length<8&&!c.refs.some(x=>x.source===record.source&&x.line===record.line&&x.value===record.value))
  c.refs.push({source:record.source,line:record.line,date:record.date,nick:record.nick,value:record.value});
}
function addText(value,record){
 if(!value||value.length>4096)return;
 addCandidate(Buffer.from(value,'utf8'),record);
}
function lineMeta(line,source,lineNo){
 const m=line.match(/^2014 ([A-Z][a-z]{2} \d\d \d\d:\d\d) <([^>]+)> (.*)$/);
 return {source,line:lineNo,date:m?m[1]:'',nick:m?m[2]:'',body:m?m[3]:line};
}
function addOnion(host,meta){
 host=host.toLowerCase();
 const noGateway=host.replace(/\.(?:to|city|link|ws|cab|rip|nu|sh|so|pet|lu|gq|top|website)$/,'');
 const label=noGateway.replace(/\.onion$/,'');
 const variants=[
  ['host',host],['no-gateway',noGateway],['label',label],
  ['http-root','http://'+host],['http-slash','http://'+host+'/'],
  ['https-root','https://'+host],['https-slash','https://'+host+'/']
 ];
 for(const [variant,value] of variants)addText(value,{...meta,variant,value:host});
 if(/^[a-z2-7]{16}$/.test(label))
  addCandidate(b32decode(label),{...meta,variant:'v2-onion-base32-decoded-10-bytes',value:host});
 const old=onionRefs.get(host)||{host,known:knownHosts.has(label),refs:[]};
 if(old.refs.length<8)old.refs.push({source:meta.source,line:meta.line,date:meta.date,nick:meta.nick});
 onionRefs.set(host,old);
}
function addUrl(url,meta){
 url=url.replace(/[.,;:!?)\]}]+$/g,'');
 if(!url)return;
 const values=new Map();
 const put=(variant,value)=>{if(value)values.set(variant,value);};
 put('exact-url',url);put('lowercase-url',url.toLowerCase());
 try{
  const u=new URL(url);
  put('hostname',u.hostname.toLowerCase());
  put('host',u.host.toLowerCase());
  put('host-path-query',u.host.toLowerCase()+u.pathname+u.search+u.hash);
  put('path-query',u.pathname+u.search+u.hash);
  put('hostname-root-slash',u.hostname.toLowerCase()+'/');
  put('http-root','http://'+u.host.toLowerCase()+'/');
  put('https-root','https://'+u.host.toLowerCase()+'/');
 }catch{}
 for(const [variant,value] of values)addText(value,{...meta,variant,value:url});
 const old=urlRefs.get(url.toLowerCase())||{url,refs:[]};
 if(old.refs.length<5)old.refs.push({source:meta.source,line:meta.line,date:meta.date,nick:meta.nick});
 urlRefs.set(url.toLowerCase(),old);
}
function readSource(file,origin){
 const b=fs.readFileSync(file);
 assert.equal(b.length,origin.bytes,'Original byte count '+origin.name);
 assert.equal(gitBlobHash(b),origin.sha,'Original Git blob '+origin.name);
 const lines=b.toString('latin1').split(/\r?\n/);
 let onionMatches=0,urlMatches=0,hashMatches=0,relevant=0;
 for(let i=0;i<lines.length;i++){
  const line=lines[i],meta=lineMeta(line,origin.name,i+1);
  for(const m of line.matchAll(new RegExp(onionRe.source,'ig'))){onionMatches++;addOnion(m[0],meta);}
  for(const m of line.matchAll(new RegExp(urlRe.source,'ig'))){urlMatches++;addUrl(m[0],meta);}
  for(const h of line.matchAll(/\b[0-9a-f]{128}\b/ig)){
   hashMatches++;targetMentions.push({source:origin.name,line:i+1,value:h[0],isTarget:h[0].toLowerCase()===target});
  }
  if(relevantRe.test(line)){
   relevant++;
   if(relevantLines.length<1000)relevantLines.push({source:origin.name,line:i+1,date:meta.date,nick:meta.nick,text:meta.body.slice(0,420)});
  }
 }
 console.log('VERIFIED '+origin.name+' bytes='+b.length+' lines='+lines.length+
  ' onionMentions='+onionMatches+' urlMentions='+urlMatches+' hashMentions='+hashMatches+' relevantLines='+relevant);
 return {name:origin.name,bytes:b.length,gitBlobSha1:origin.sha,lines:lines.length,
  onionMentions,urlMentions,hashMentions,relevantLines:relevant};
}
function main(){
 selftest();
 if(process.argv.includes('--selftest'))return;
 const args=process.argv.slice(2);
 let out='irc-onion-hash-candidates.json';
 const oi=args.indexOf('--out');
 if(oi>=0){out=args[oi+1];args.splice(oi,2);}
 assert.equal(args.length,3,'Pass the three original IRC log paths');
 const sourceStats=args.map((p,i)=>readSource(p,sources.find(s=>p.endsWith(s.name))||sources[i]));
 const hits=[];
 for(const c of candidates.values()){
  const b=candidateBytes.get(c.id);
  for(const algorithm of algorithms){
   hashEvaluations++;
   if(crypto.createHash(algorithm).update(b).digest('hex')===target)hits.push({algorithm,candidate:c});
  }
 }
 const onionList=[...onionRefs.values()].sort((a,b)=>a.host.localeCompare(b.host));
 const urlList=[...urlRefs.values()].sort((a,b)=>a.url.localeCompare(b.url));
 const report={
  targetHex:target,algorithms,sourceStats,uniqueOnionHosts:onionList.length,
  knownOnionHosts:knownHosts.size,novelOnionHosts:onionList.filter(x=>!x.known).length,
  uniqueUrls:urlList.length,uniqueCandidateByteStrings:candidates.size,
  hashEvaluations,hits,targetMentions,onionHosts:onionList,urls:urlList,relevantLines
 };
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 console.log('SUMMARY '+JSON.stringify({out,uniqueOnionHosts:onionList.length,
  novelOnionHosts:report.novelOnionHosts,uniqueUrls:urlList.length,
  uniqueCandidateByteStrings:candidates.size,hashEvaluations,hits:hits.length,
  targetMentions:targetMentions.length}));
}
main();
