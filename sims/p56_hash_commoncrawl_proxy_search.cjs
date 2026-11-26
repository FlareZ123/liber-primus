'use strict';
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const PROXIES = ['onion.to','tor2web.org','onion.link','onion.cab','onion.ws','onion.city','onion.sh','onion.nu','onion.so'];
const HASHES = ['sha512','sha3-512','blake2b512'].filter(x => crypto.getHashes().includes(x));
const check = (x,m) => { if(!x) throw new Error(m); };
check(TARGET.length===128,'target digest transcription');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function textFetch(url,timeout=20000){
 const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},signal:AbortSignal.timeout(timeout)});
 return {status:r.status,body:await r.text()};
}
async function mapLimit(items,limit,fn){
 const out=new Array(items.length);let next=0;
 await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
  while(true){const i=next++;if(i>=items.length)return;try{out[i]=await fn(items[i],i)}catch(e){out[i]={error:String(e)}}}
 }));
 return out;
}
function parseWarc(buf){
 const raw=zlib.gunzipSync(buf);
 const sep=Buffer.from('\r\n\r\n');
 const a=raw.indexOf(sep);if(a<0)return raw;
 const httpStart=a+4;
 const b=raw.indexOf(sep,httpStart);if(b<0)return raw.subarray(httpStart);
 const headers=raw.subarray(httpStart,b).toString('latin1');
 const bodyStart=b+4;
 const len=headers.match(/content-length:\s*(\d+)/i);
 if(len)return raw.subarray(bodyStart,bodyStart+Number(len[1]));
 const end=raw.lastIndexOf(Buffer.from('\r\n\r\nWARC/'));
 return raw.subarray(bodyStart,end>bodyStart?end:raw.length);
}
function stripHtml(buf){
 return Buffer.from(buf.toString('utf8').replace(/<script[\s\S]*?<\/script>/gi,' ')
 .replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')
 .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim(),'utf8');
}
function urlCandidates(s){
 const out=new Set([s]);
 try{
  const u=new URL(s);out.add(u.hostname);out.add(u.host);out.add(u.pathname);out.add(u.origin+u.pathname);
  const h=u.hostname.replace(/\.(onion\.)?(to|tor2web\.org|link|cab|ws|city|sh|nu|so)$/i,'.onion');
  out.add(h);out.add('http://'+h+u.pathname);out.add('https://'+h+u.pathname);
 }catch{}
 const found=[];
 for(const x of out)for(const alg of HASHES)if(crypto.createHash(alg).update(Buffer.from(x,'utf8')).digest('hex')===TARGET)found.push({algorithm:alg,representation:'url-string',value:x});
 return found;
}
function bodyMatches(buf){
 const found=[];
 for(const [name,b] of [['raw-body',buf],['normalized-html-text',stripHtml(buf)]])
  for(const alg of HASHES)if(crypto.createHash(alg).update(b).digest('hex')===TARGET)found.push({algorithm:alg,representation:name});
 return found;
}
(async()=>{
 const info=await textFetch('https://index.commoncrawl.org/collinfo.json',30000);
 check(info.status===200,'collinfo HTTP '+info.status);
 const indexes=JSON.parse(info.body).filter(x=>/^CC-MAIN-2014-/.test(x.id)).sort((a,b)=>a.id.localeCompare(b.id));
 const jobs=[];for(const index of indexes)for(const domain of PROXIES)jobs.push({index,domain});
 const queries=await mapLimit(jobs,8,async job=>{
  const api=job.index['cdx-api'];
  if(!api)return {index:job.index.id,domain:job.domain,error:'missing cdx-api field'};
  const p=new URLSearchParams({url:job.domain,matchType:'domain',output:'json',filter:'status:200'});
  const r=await textFetch(api+'?'+p.toString(),20000);
  if(r.status!==200)return {index:job.index.id,domain:job.domain,status:r.status,error:r.body.slice(0,250)};
  const records=r.body.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
  return {index:job.index.id,domain:job.domain,status:200,count:records.length,records};
 });
 const all=queries.flatMap(q=>(q.records||[]).map(r=>({index:q.index,domain:q.domain,...r})));
 const unique=[...new Map(all.map(r=>[r.filename+':'+r.offset,r])).values()];
 const plausible=unique.filter(r=>!r.mime||/^(text\/|application\/(xhtml\+xml|xml|json|pdf))/i.test(r.mime));
 const selected=plausible.slice(0,1200);
 const matches=[];
 const fetches=await mapLimit(selected,8,async r=>{
  const start=Number(r.offset),end=start+Number(r.length)-1;
  const res=await fetch('https://data.commoncrawl.org/'+r.filename,{headers:{range:'bytes='+start+'-'+end,'user-agent':'Liber-Primus-research/1.0'},signal:AbortSignal.timeout(30000)});
  const bytes=Buffer.from(await res.arrayBuffer());
  if(res.status!==206&&res.status!==200)return {status:res.status,url:r.url,index:r.index};
  let body;try{body=parseWarc(bytes)}catch(e){return {status:res.status,url:r.url,index:r.index,error:String(e)}}
  const found=bodyMatches(body).concat(urlCandidates(r.url));
  if(found.length)matches.push({url:r.url,timestamp:r.timestamp,index:r.index,mime:r.mime,found});
  return {status:res.status,url:r.url,timestamp:r.timestamp,index:r.index,mime:r.mime,bytes:body.length,matches:found.length};
 });
 const output={
  target:TARGET,algorithms:HASHES,
  indexes:indexes.map(x=>x.id),
  querySummary:queries.map(q=>({index:q.index,domain:q.domain,status:q.status,count:q.count,error:q.error})),
  rawRecordCount:all.length,uniqueRecordCount:unique.length,plausibleTextRecords:plausible.length,
  fetchedCount:selected.length,truncated:plausible.length>selected.length,
  exactMatchCount:matches.length,matches,
  fetchErrors:fetches.filter(x=>x.error||x.status>=400).slice(0,100),
  conclusion:matches.length?'EXACT MATCH FOUND':'NO EXACT MATCH IN THE QUERIED 2014 COMMON CRAWL PROXY CAPTURES; other years, unindexed services, other proxies, or hash serializations remain open'
 };
 console.log(JSON.stringify(output,null,2));
})().catch(e=>{console.error(e&&e.stack||String(e));process.exitCode=1});
