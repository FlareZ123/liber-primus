'use strict';
const crypto=require('node:crypto');
const HOSTS=['http://infotomb.com/tmp/208771','https://infotomb.com/tmp/208771','http://infotomb.com/tmp/208771.thumb.jpg','https://infotomb.com/tmp/208771.thumb.jpg','http://infotomb.com/tmp/208771_text','https://infotomb.com/tmp/208771_text'];
async function getText(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},signal:AbortSignal.timeout(30000)});return {status:r.status,text:await r.text()};}
async function getBytes(url){const r=await fetch(url,{headers:{'user-agent':'Liber-Primus-research/1.0'},redirect:'follow',signal:AbortSignal.timeout(30000)});return {status:r.status,bytes:Buffer.from(await r.arrayBuffer()),url:r.url,headers:Object.fromEntries(r.headers.entries())};}
function parse(text){const rows=JSON.parse(text),h=rows[0];return rows.slice(1).map(x=>Object.fromEntries(h.map((k,i)=>[k,x[i]])));}
async function mapLimit(xs,n,fn){const out=new Array(xs.length);let k=0;await Promise.all(Array.from({length:Math.min(n,xs.length)},async()=>{while(true){const i=k++;if(i>=xs.length)return;try{out[i]=await fn(xs[i])}catch(e){out[i]={url:xs[i],error:String(e)}}}}));return out;}
(async()=>{
 const queries=await mapLimit(HOSTS,3,async url=>{
  const p=new URLSearchParams({url,output:'json',fl:'original,timestamp,statuscode,mimetype,digest,length',from:'2016',to:'2017',filter:'statuscode:200',limit:'100'});
  const r=await getText('https://web.archive.org/cdx/search/cdx?'+p.toString());
  if(r.status!==200)return {url,status:r.status,error:r.text.slice(0,300)};
  return {url,status:200,records:parse(r.text)};
 });
 const records=queries.flatMap(q=>(q.records||[]).map(r=>({query:q.url,...r})));
 const unique=[...new Map(records.map(r=>[r.original+'|'+r.timestamp,r])).values()];
 const fetched=await mapLimit(unique,6,async r=>{
  const page=await getBytes('https://web.archive.org/web/'+r.timestamp+'id_/'+r.original);
  if(page.status!==200)return {url:r.original,timestamp:r.timestamp,status:page.status};
  return {url:r.original,timestamp:r.timestamp,status:page.status,finalUrl:page.url,bytes:page.bytes.length,sha256:crypto.createHash('sha256').update(page.bytes).digest('hex'),sha512:crypto.createHash('sha512').update(page.bytes).digest('hex'),mimetype:r.mimetype,bodyBase64:page.bytes.toString('base64')};
 });
 console.log(JSON.stringify({queries:queries.map(q=>({url:q.url,status:q.status,count:(q.records||[]).length,error:q.error||null})),recordCount:records.length,uniqueCount:unique.length,fetched},null,2));
})().catch(e=>{console.error(e&&e.stack||String(e));process.exitCode=1});
