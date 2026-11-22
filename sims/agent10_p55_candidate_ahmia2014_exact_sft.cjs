"use strict";
/** Exact historical test of the frozen Agent10 p55 16-word Tor-v2 candidate. */
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const candidate = "6sws36unkmvdy4b7.onion";
const positiveControl = "3g2upl4pq6kufc4m.onion";
const sources = [
  {name:"Ahmia 10 June 2014 initial_data.json",url:"https://raw.githubusercontent.com/juhanurmi/ahmia/7db4e805c072ff3e133aaab174815aaa1abb86d6/ahmia/fixtures/initial_data.json",gitBlob:"08102c19f74df5d47771dfae8f85ddd8b8b7173d",expectedBytes:2759554},
  {name:"Ahmia 25 July 2014 example_addresses.html",url:"https://raw.githubusercontent.com/juhanurmi/ahmia/c2e2aa4beef0f9fbad542eb2c15d4f0fc2760bc0/ahmia/tests/example_addresses.html",gitBlob:"548f8970a89ae780eb504852993261c655a9cb31",expectedBytes:1142829}
];
function gitBlobSha(bytes){return createHash("sha1").update(Buffer.from(`blob ${bytes.length}\\0`,"utf8")).update(bytes).digest("hex");}
function countExact(h,n){let c=0,p=0;while((p=h.indexOf(n,p))!==-1){c++;p+=n.length;}return c;}
function matchingRecords(v,n,path="$",out=[]){if(typeof v==="string"){if(v.toLowerCase().includes(n))out.push({path,value:v});}else if(Array.isArray(v)){v.forEach((x,i)=>matchingRecords(x,n,`${path}[${i}]`,out));}else if(v&&typeof v==="object"){for(const [k,x] of Object.entries(v))matchingRecords(x,n,`${path}.${k}`,out);}return out;}
async function main(){
 const results=[];
 for(const s of sources){
  const r=await fetch(s.url,{signal:AbortSignal.timeout(30000)});
  assert.equal(r.status,200,`${s.name} HTTP`);
  const bytes=Buffer.from(await r.arrayBuffer());
  assert.equal(bytes.length,s.expectedBytes,`${s.name} byte length`);
  const blob=gitBlobSha(bytes);assert.equal(blob,s.gitBlob,`${s.name} Git blob SHA`);
  const text=bytes.toString("utf8").toLowerCase();
  const hits=countExact(text,candidate),positiveHits=countExact(text,positiveControl);
  const contexts=[];if(hits){let p=0;while((p=text.indexOf(candidate,p))!==-1){contexts.push(text.slice(Math.max(0,p-240),Math.min(text.length,p+candidate.length+240)));p+=candidate.length;}}
  const records=hits&&s.name.includes("initial_data")?matchingRecords(JSON.parse(bytes.toString("utf8")),candidate):[];
  results.push({name:s.name,bytes:bytes.length,gitBlob:blob,candidate,exactCandidateHits:hits,positiveControlHits:positiveHits,candidateContexts:contexts,matchingJsonRecords:records});
 }
 assert.ok(results[0].positiveControlHits>0,"June 2014 fixture must contain the known DuckDuckGo v2 positive control");
 const found=results.some(x=>x.exactCandidateHits>0);
 process.stdout.write(JSON.stringify({candidate,frozenQuestion:"Was this exact p55-derived host present in either pinned 2014 Ahmia source object?",results,verdict:found?"HISTORICAL HOST STRING MATCH: inspect matching source record and dates/metadata":"NO EXACT MATCH in these two pinned 2014 Ahmia source objects",scope:"A miss is bounded to these two source objects; it does not exclude an unindexed or unknown 2014 host."},null,2)+"\n");
}
main().catch(e=>{console.error(e);process.exitCode=1;});
