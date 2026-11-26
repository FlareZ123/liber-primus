'use strict';
const crypto=require('node:crypto');
const TARGET='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const ALGS=['sha512','sha3-512','blake2b512'].filter(x=>crypto.getHashes().includes(x));
async function getText(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},signal:AbortSignal.timeout(45000)});return {status:r.status,text:await r.text()};}
async function getBytes(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},redirect:'follow',signal:AbortSignal.timeout(30000)});return {status:r.status,bytes:Buffer.from(await r.arrayBuffer())};}
function parse(text){const a=JSON.parse(text),h=a[0];return a.slice(1).map(row=>Object.fromEntries(h.map((k,i)=>[k,row[i]])));}
function strip(buf){return Buffer.from(buf.toString('utf8').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim(),'utf8');}
function matches(buf){const out=[];for(const [rep,b] of [['raw',buf],['normalized-text',strip(buf)]])for(const a of ALGS)if(crypto.createHash(a).update(b).digest('hex')===TARGET)out.push({algorithm:a,representation:rep});return out;}
async function mapLimit(items,limit,fn){const out=new Array(items.length);let next=0;await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(true){const i=next++;if(i>=items.length)return;try{out[i]=await fn(items[i])}catch(e){out[i]={error:String(e),url:items[i].original,timestamp:items[i].timestamp}}}}));return out;}
(async()=>{
 const p=new URLSearchParams({url:'onion.to',matchType:'domain',output:'json',fl:'original,timestamp,statuscode,mimetype,digest,length',from:'2014',to:'2014',filter:'statuscode:200',limit:'2000'});
 p.append('filter','mimetype:(text/html|text/plain|application/xhtml+xml)');
 const r=await getText('https://web.archive.org/cdx/search/cdx?'+p.toString());
 if(r.status!==200)throw new Error('CDX HTTP '+r.status+' '+r.text.slice(0,500));
 const records=parse(r.text);
 const unique=[...new Map(records.map(x=>[x.original+'|'+x.timestamp,x])).values()];
 const remaining=unique.slice(1000);
 const matchesFound=[];
 const fetches=await mapLimit(remaining,8,async x=>{
  const page=await getBytes('https://web.archive.org/web/'+x.timestamp+'id_/'+x.original);
  if(page.status!==200)return {status:page.status,url:x.original,timestamp:x.timestamp};
  const found=matches(page.bytes);
  if(found.length)matchesFound.push({url:x.original,timestamp:x.timestamp,mimetype:x.mimetype,matches:found});
  return {status:page.status,url:x.original,timestamp:x.timestamp,bytes:page.bytes.length,matches:found.length};
 });
 console.log(JSON.stringify({
  target:TARGET,algorithm:ALGS.join(', '),domain:'onion.to',period:'2014',
  cdxRecords:records.length,uniqueRecords:unique.length,alreadyCovered:Math.min(1000,unique.length),
  remainingRecords:remaining.length,fetched:fetches.length,
  exactMatches:matchesFound,fetchErrors:fetches.filter(x=>x.error||x.status>=400),
  conclusion:matchesFound.length?'EXACT MATCH FOUND':'NO EXACT MATCH IN THE REMAINING 2014 onion.to CAPTURES'
 },null,2));
})().catch(e=>{console.error(e&&e.stack||String(e));process.exitCode=1});
