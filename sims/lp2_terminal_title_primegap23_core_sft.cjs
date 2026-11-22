"use strict";
/**
 * Source-selected prime-ordinal gap between solved terminal LP2 titles.
 * Test direct p64..p87 prime-totient bridge to source-determined p55 core.
 * Reproduce: node sims/lp2_terminal_title_primegap23_core_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const originalLP1=fs.readFileSync(
  path.join(__dirname,"..","resources/liber-primus/05.jpg"));
const square=require("./jpeg05_palindromic_magic.cjs").decode(originalLP1).square;
assert.equal(square.flat().filter(n=>n===138).length,2);
const mod=n=>(n%29+29)%29;
const p56=corpus.pages.find(p=>p.page===56).indices;
assert.deepEqual(p56.slice(0,5),[25,11,22,15,4]);
const title56=p56.slice(0,5).map((n,i)=>mod(n-([2,3,5,7,11][i]-1)));
assert.deepEqual(title56,[24,9,18,9,23]);
const p57=corpus.pages.find(p=>p.page===57).indices;
const title57=p57.slice(0,7);
assert.deepEqual(title57.map(i=>corpus.translit[i]).join(""),"PARABLE");
const sum=a=>a.reduce((s,i)=>s+corpus.prime[i],0);
assert.equal(sum(title56),311);
assert.equal(sum(title57),449);
assert.equal(sum(title57)-sum(title56),138);
const titleIndices=[311,449];
const primes=[];
for(let n=2;primes.length<90;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}
  if(prime)primes.push(n);
}
assert.equal(primes[63],311);
assert.equal(primes[86],449);
assert.equal(87-64,23);
const dots=ink.pages.find(p=>p.page===57).large_punctuation;
assert(dots.some(entry=>entry[0]===95&&entry[1]===23&&entry[2]==="red"));
const p55=corpus.pages.find(p=>p.page===55).indices;
assert.equal(p55.length,76);
const body=p55.slice(1);
const lengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const words=[];let start=0;
for(const length of lengths){
  words.push(body.slice(start,start+length));
  start+=length;
}
assert.equal(start,75);
const twicePeeled=words.flatMap(w=>w.length>4?w.slice(2,-2):[]);
assert.equal(twicePeeled.length,23);
assert.deepEqual(twicePeeled.map(i=>corpus.translit[i]),
  "G D A B F X I M U C P H NG D IA I G X EO TH TH I M".split(" "));
assert.equal(sum(twicePeeled),1020);
const native=corpus.pages.find(p=>p.page===57).indices.slice(0,23);
const ioc=a=>{
  const counts=Array(29).fill(0);
  for(const v of a)counts[v]++;
  return counts.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
};
const results=[];
for(const startingOrdinal of [64,65]){
  const interval=primes.slice(startingOrdinal-1,startingOrdinal+22);
  assert.equal(interval.length,23);
  assert.equal(interval[0],primes[startingOrdinal-1]);
  const key=interval.map(n=>mod(n-1));
  for(const sign of [-1,1]){
    const decrypt=(arr)=>arr.map((n,i)=>mod(n+sign*key[i%23]));
    const encrypt=(arr)=>arr.map((n,i)=>mod(n-sign*key[i%23]));
    assert.deepEqual(decrypt(encrypt(native)),native);
    const observed=decrypt(twicePeeled);
    assert.deepEqual(encrypt(observed),twicePeeled);
    results.push({startingOrdinal,sign,
      decoded:observed.map(i=>corpus.translit[i]).join(" "),
      ioc:ioc(observed),nativeRecovered:native.length});
  }
}
assert.deepEqual(results.map(r=>r.decoded),[
  "S U IA G EO T I S L T E W T EO H T R TH IA W C W EO",
  "Y T NG EA B EO I D J D H N Y C B R H Y Y Y EA P Y",
  "P Y P F TH X G N EO I EO O I R R H D F B C EA O G",
  "EA L G C IA X X F M F X P O P NG EO E EA W EA C B O"
]);
console.log(JSON.stringify({
  status:"PASS",source:"unaltered p55/p56/p57 + original 2014 LP1 p5 raw JPEG",
  solvedTitlePrimeSums:[311,449],solvedTitlePrimeOrdinals:[64,87],
  originalGap:138,originalDotCount:23,original23RuneCoreSum:1020,
  originalCiphers:results,
  recoveredUnknownPlaintext:0
},null,2));
