"use strict";
/**
 * Original-p55-derived 80-bit Tor v2 address: one bounded historical capture
 * search with independently derived p35 competing locator.
 * Tests source-named 2014–16 gateway root prefixes on Arquivo.pt CDX.
 * This is a candidate search, NOT evidence that either site is Cicada's.
 * Reproduce: node sims/lp2_p55_d17_torv2_archive_2014_cdx_sft.cjs
 */
const assert=require("node:assert/strict");
const assertHex=(value)=>assert.match(value,/^[0-9a-f]{20}$/u);
const base32="abcdefghijklmnopqrstuvwxyz234567";
function onion80(hex){
 assertHex(hex);
 let n=BigInt("0x"+hex),out="";
 for(let i=0;i<16;i++){out=base32[Number(n&31n)]+out;n>>=5n;}
 return out;
}
const originalCandidates=[
 ["physical-p55-D17","9cdecb1721e406f03b0d","ttpmwfzb4qdpaoyn"],
 ["physical-p35-D17-competing","fc3571881b46757f423c","7q2xdca3iz2x6qr4"]
];
for(const [source,hex,host] of originalCandidates)
 assert.equal(onion80(hex),host,source+" original 80-bit v2 base32");
const target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.equal(target.length,128);
async function query(url,from="2014",to="2016",mode="prefix"){
 const endpoint=new URL("https://arquivo.pt/wayback/cdx");
 for(const [name,value] of Object.entries({url,from,to,output:"json",limit:"50",matchType:mode}))
  endpoint.searchParams.set(name,value);
 try{
  const response=await fetch(endpoint,{signal:AbortSignal.timeout(22000)});
  const raw=await response.text();
  const captures=raw.split(/\r?\n/u).filter(Boolean).flatMap(line=>{
   try{const x=JSON.parse(line);return x.url?[{
    url:x.url,timestamp:x.timestamp,status:x.status,
    mime:x.mime,digest:x.digest,collection:x.collection
   }]:[];}catch{return [];}
  });
  return {url,httpStatus:response.status,captureCount:captures.length,
   captures:captures.slice(0,10),
   error:response.status!==200?raw.slice(0,100):undefined};
 }catch(error){return {url,error:String(error)};}
}
async function main(){
 const control=await query("http://www.publico.pt/","2014","2014","prefix");
 assert.equal(control.httpStatus,200);
 assert.ok(control.captureCount>=1,"Independent working 2014 Arquivo index control");
 const results=[];
 for(const [source,_,host] of [
  ...originalCandidates,
  ["historically-authenticated-2014-distributor","", "ky2khlqdf7qdznac"]
 ]){
  for(const suffix of [".onion.to/",".onion.city/"]){
   for(const protocol of ["http://","https://"]){
    const entry=await query(protocol+host+suffix);
    results.push({source,host,...entry});
    console.log(JSON.stringify(results[results.length-1]));
   }
  }
 }
 console.log("SUMMARY "+JSON.stringify({
  control:{url:control.url,count:control.captureCount,httpStatus:control.httpStatus},
  targets:originalCandidates.map(([source,hex,onion])=>({source,onion,original80:hex})),
  total:results.length,successful:results.filter(x=>x.httpStatus===200).length,
  indexedCaptures:results.reduce((sum,x)=>sum+(x.captureCount||0),0),
  target:target.slice(0,16)+"…",sourceProof:"D17 original p55 and competing p35 are hypotheses, NOT authenticated Cicada destinations",
  failures:results.filter(x=>x.httpStatus!==200)
 },null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
