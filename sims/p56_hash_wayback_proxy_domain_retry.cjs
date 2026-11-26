'use strict';
const crypto=require('node:crypto');
const TARGET='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const DOMAINS=['onion.to','onion.link','onion.city','onion.nu','onion.so'];
const ALGS=['sha512','sha3-512','blake2b512'].filter(x=>crypto.getHashes().includes(x));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchText(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},signal:AbortSignal.timeout(30000)});return {status:r.status,text:await r.text()};}
async function fetchBytes(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},redirect:'follow',signal:AbortSignal.timeout(30000)});return {status:r.status,bytes:Buffer.from(await r.arrayBuffer()),url:r.url};}
function parse(text){const rows=JSON.parse(text);const h=rows[0];return rows.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));}
function hashes(buf){const out=[];for(const a of ALGS)if(crypto.createHash(a).update(buf).digest('hex')===TARGET)out.push(a);return out;}
function norm(buf){return Buffer.from(buf.toString('utf8').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim(),'utf8');}
function urlHashes(s){const vals=new Set([s]);try{const u=new URL(s);vals.add(u.hostname);vals.add(u.host);vals.add(u.pathname);vals.add(u.origin+u.pathname);const h=u.hostname.replace(/\.onion\.to$/i,'.onion');vals.add(h);vals.add('http://'+h+u.pathname);vals.add('https://'+h+u.pathname);}catch{}const out=[];for(const v of vals)for(const a of ALGS)if(crypto.createHash(a).update(v).digest('hex')===TARGET)out.push({algorithm:a,representation:'url',value:v});return out;}
async function mapLimit(xs,n,fn){const out=new Array(xs.length);let k=0;await Promise.all(Array.from({length:Math.min(n,xs.length)},async()=>{while(true){const i=k++;if(i>=xs.length)return;try{out[i]=await fn(xs[i])}catch(e){out[i]={error:String(e)}}}}));return out;}
(async()=>{
 const queried=await mapLimit(DOMAINS,2,async domain=>{
  const params=new URLSearchParams({url:domain,matchType:'domain',output:'json',fl:'original,timestamp,statuscode,mimetype,digest,length',from:'2014',to:'2017',filter:'statuscode:200',limit:'5000'});
  const r=await fetchText('https://web.archive.org/cdx/search/cdx?'+params.toString());
  if(r.status!==200)return {domain,status:r.status,error:r.text.slice(0,500)};
  const records=parse(r.text);
  return {domain,status:200,count:records.length,records};
 });
 const all=queried.flatMap(q=>(q.records||[]).map(r=>({domain:q.domain,...r})));
 const unique=[...new Map(all.map(r=>[r.original+'|'+r.timestamp,r])).values()];
 const plausible=unique.filter(r=>!r.mimetype||/^(text\/|application\/(xhtml\+xml|xml|json|pdf))/i.test(r.mimetype));
 const selected=plausible.slice(0,1200);
 const matches=[];
 const bodies=await mapLimit(selected,5,async r=>{
  const page=await fetchBytes('https://web.archive.org/web/'+r.timestamp+'id_/'+r.original);
  if(page.status!==200)return {status:page.status,url:r.original,timestamp:r.timestamp};
  const found=[];
  for(const [rep,b] of [['raw-body',page.bytes],['normalized-text',norm(page.bytes)]])for(const a of hashes(b))found.push({algorithm:a,representation:rep});
  found.push(...urlHashes(r.original));
  if(found.length)matches.push({url:r.original,timestamp:r.timestamp,mimetype:r.mimetype,matches:found});
  return {status:page.status,url:r.original,timestamp:r.timestamp,bytes:page.bytes.length,matches:found.length};
 });
 console.log(JSON.stringify({
  target:TARGET,algorithms:ALGS,queryMode:'Wayback CDX matchType=domain, 2014-2017, all captures, HTTP 200',
  queried:queried.map(q=>({domain:q.domain,status:q.status,count:q.count,error:q.error||null})),
  rawCount:all.length,uniqueCount:unique.length,plausibleCount:plausible.length,
  fetchedCount:selected.length,truncated:plausible.length>selected.length,
  exactMatches:matches,fetchErrors:bodies.filter(x=>x.error||x.status>=400).slice(0,100),
  conclusion:matches.length?'EXACT MATCH FOUND':'NO EXACT MATCH IN THE SUCCESSFULLY FETCHED 2014-2017 WAYBACK PROXY CAPTURES; failed queries, other proxies, or different serialization remain open'
 },null,2));
})().catch(e=>{console.error(e&&e.stack||String(e));process.exitCode=1});
