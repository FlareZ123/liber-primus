'use strict';
const crypto=require('node:crypto');
const TARGET='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const ALGS=['sha512','sha3-512','blake2b512'].filter(x=>crypto.getHashes().includes(x));
async function getText(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},signal:AbortSignal.timeout(45000)});return {status:r.status,text:await r.text()};}
async function getBytes(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},redirect:'follow',signal:AbortSignal.timeout(30000)});return {status:r.status,bytes:Buffer.from(await r.arrayBuffer())};}
function parse(text){const a=JSON.parse(text),h=a[0];return a.slice(1).map(row=>Object.fromEntries(h.map((k,i)=>[k,row[i]])));}
function strip(buf){return Buffer.from(buf.toString('utf8').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim(),'utf8');}
function matches(buf){const out=[];for(const [rep,b] of [['raw',buf],['normalized-text',strip(buf)]])for(const a of ALGS)if(crypto.createHash(a).update(b).digest('hex')===TARGET)out.push({algorithm:a,representation:rep});return out;}
(async()=>{
 const patterns=[
  {name:'domain-match',url:'onion.to',matchType:'domain'},
  {name:'wildcard-host',url:'*.onion.to/*',matchType:'prefix'}
 ];
 const queries=[];
 for(const q of patterns){
  const p=new URLSearchParams({url:q.url,matchType:q.matchType,output:'json',fl:'original,timestamp,statuscode,mimetype,digest,length',from:'2014',to:'2014',filter:'statuscode:200',limit:'2000'});
  p.append('filter','mimetype:(text/html|text/plain|application/xhtml+xml)');
  try{const r=await getText('https://web.archive.org/cdx/search/cdx?'+p.toString());if(r.status!==200)queries.push({name:q.name,status:r.status,error:r.text.slice(0,500)});else{const records=parse(r.text);queries.push({name:q.name,status:200,count:records.length,records});}}catch(e){queries.push({name:q.name,error:String(e)});}
 }
 const all=queries.flatMap(q=>(q.records||[]));
 const unique=[...new Map(all.map(r=>[r.original+'|'+r.timestamp,r])).values()];
 const selected=unique.slice(0,1000);
 const matchesFound=[];
 const fetches=[];
 for(let i=0;i<selected.length;i++){
  const r=selected[i];
  try{
   const page=await getBytes('https://web.archive.org/web/'+r.timestamp+'id_/'+r.original);
   if(page.status!==200){fetches.push({status:page.status,url:r.original,timestamp:r.timestamp});continue;}
   const found=matches(page.bytes);
   if(found.length)matchesFound.push({url:r.original,timestamp:r.timestamp,mimetype:r.mimetype,matches:found});
   fetches.push({status:page.status,url:r.original,timestamp:r.timestamp,bytes:page.bytes.length,matches:found.length});
  }catch(e){fetches.push({error:String(e),url:r.original,timestamp:r.timestamp});}
 }
 console.log(JSON.stringify({
  target:TARGET,algorithms:ALGS,scope:'onion.to proxy host/domain captures, 2014 only, text/html or text/plain, status 200',
  querySummary:queries.map(q=>({name:q.name,status:q.status,count:q.count,error:q.error||null})),
  uniqueRecords:unique.length,fetched:selected.length,truncated:unique.length>selected.length,
  exactMatches:matchesFound,fetchErrors:fetches.filter(x=>x.error||x.status>=400).slice(0,100),
  conclusion:matchesFound.length?'EXACT MATCH FOUND':'NO EXACT MATCH IN THE FETCHED 2014 onion.to proxy pages; other captures/years/serializations remain open'
 },null,2));
})().catch(e=>{console.error(e&&e.stack||String(e));process.exitCode=1});
