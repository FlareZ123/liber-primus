"use strict";
/**
 * Full all-secret GP29 alphabet gate: could the source H/G polynomial quotient
 * supply three 84-rune encodings of the authentic p56 prime-totient key?
 * node sims/lp2_q252_p56_84key_allsecret_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const mod=x=>(x%29+29)%29;
const F=[23,21,11,17,12], inverse12=17;
assert.equal(mod(F[4]*inverse12),1);
let a=grid.slice().reverse().map(mod),q=[];
for(let i=255;i>=4;i--){
 const scalar=mod(a[i]*inverse12);
 q[i-4]=scalar;
 for(let j=0;j<5;j++)a[i-4+j]=mod(a[i-4+j]-scalar*F[j]);
}
assert.deepStrictEqual(a.slice(0,4),[0,0,0,0]);
const Q=q.reverse();
assert.equal(Q.length,252);
assert.deepStrictEqual(Q.slice(0,10),[0,12,9,28,2,25,23,21,18,28]);
const primes=[];
for(let n=2;primes.length<90;n++){
 let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0)prime=false;
 if(prime)primes.push(n);
}
const key=primes.slice(0,84).map(n=>mod(n-1));
let keyClock=0;
const solved=gp.pages[56].indices.map((v,i)=>i===56?v:mod(v-key[keyClock++]));
assert.equal(keyClock,84);
assert.equal(gp.pages[56].indices.length,85);
assert.equal(solved.slice(0,5).map(i=>gp.translit[i]).join(""),"ANEND");
function compare(a,b){
 const from=new Map(),to=new Map();
 let prefix=0,contradictions=0;
 for(let i=0;i<a.length;i++){
  const k=a[i],v=b[i],u=from.get(k),t=to.get(v);
  if((u!==undefined&&u!==v)||(t!==undefined&&t!==k))contradictions++;
  else if(!contradictions)prefix++;
  if(u===undefined)from.set(k,v);
  if(t===undefined)to.set(v,k);
 }
 let pairMismatch=0;
 for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)
  if((a[i]===a[j])!==(b[i]===b[j]))pairMismatch++;
 return {longestBijectionPrefix:prefix,conflictingPositions:contradictions,pairMismatch};
}
const models=[];
for(const mode of ["contiguous","interleaved"]){
 for(let third=0;third<3;third++){
  const segment=mode==="contiguous"?Q.slice(84*third,84*(third+1)):
   Array.from({length:84},(_,i)=>Q[3*i+third]);
  for(const reverse of [false,true]){
   const seq=reverse?segment.slice().reverse():segment;
   const measure=compare(seq,key);
   assert.ok(measure.pairMismatch>0);
   models.push({mode,third,reverse,...measure});
  }
 }
}
const plantPermutation=Array.from({length:29},(_,i)=>mod(7*i+3));
const nativePlant=key.map(v=>plantPermutation[v]);
assert.deepStrictEqual(compare(nativePlant,key),{
 longestBijectionPrefix:84,conflictingPositions:0,pairMismatch:0});
console.log(JSON.stringify({
 originalSource:"original 256-cell pp49-51 base60 table, p39/2013 HxG, exact known p56 key",
 quotientLength:252,authenticP56ConsumedKeySymbols:84,
 candidates:models,largestPrefix:Math.max(...models.map(x=>x.longestBijectionPrefix)),
 fewestPairMismatches:Math.min(...models.map(x=>x.pairMismatch)),
 decision:"All 12 three-way layouts fail under every secret fixed GP29 alphabet permutation; no p55 plaintext",
},null,2));
