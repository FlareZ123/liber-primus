"use strict";

/**
 * Frozen terminal-echo p56-prime cipher restart at p27 rune-local offset34.
 * Run: node sims/lp2_p27_bookend7_totient_restart_sft.cjs
 * Node 20+ CommonJS, original corpus only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"),"utf8"));
const original=gp.pages;
const p27=original[27].indices,p55=original[55].indices,
  p56=original[56].indices;
assert.equal(p27.length,234);
assert.equal(p55.length,76);
assert.equal(p56.length,85);
assert.deepEqual(p27.slice(28,35),[...p55.slice(70),p56[0]]);
assert.equal(p27[34],25);
assert.equal(p56[0],25);
/** @param {number} k */
function primes(k){
  const result=[];
  for(let n=2;result.length<k;n++)
    if(result.every(p=>p*p>n||n%p!==0)) result.push(n);
  return result;
}
const K=primes(200).map(p=>(p-1)%29);
/** @param {number[]} arr */
const countIoC=arr=>{
  const counts=new Array(29).fill(0);
  arr.forEach(v=>counts[v]++);
  return counts.reduce((s,c)=>s+c*(c-1),0)/
    (arr.length*(arr.length-1));
};
/** @param {number[]} a */
const toText=a=>a.map(i=>gp.translit[i]).join(" ");
const cipher=p27.slice(34);
const plain=cipher.map((c,i)=>(c-K[i]+29)%29);
assert.equal(plain.length,200);
assert.equal(plain[0],24); // GP A: exact p56 first-rune control
assert.deepEqual(plain.map((p,i)=>(p+K[i])%29),cipher);
assert.ok(Math.abs(countIoC(plain)-0.03221105527638191)<1e-14);
assert.ok(Math.abs(countIoC(cipher)-0.03472361809045226)<1e-14);
// Reproduce all authentic p56 GP ciphertext via prime-totient,
// with one literal non-consuming F at local offset56.
let tick=0;
const known=p56.map((c,i)=>i===56?0:(c-K[tick++]+29)%29);
assert.equal(tick,84);
assert.deepEqual(known.slice(0,5),[24,9,18,9,23]); // ANEND
assert.equal(p56[56],0);
console.log(JSON.stringify({
  originalSource:"LP2 physical p27 local34 vs p56 local0, repeated 7-run cipher",
  echo:p27.slice(28,35).map(i=>gp.translit[i]).join(""),
  fixedRestart:34, runes:200, firstPlain:gp.translit[plain[0]],
  originalIoC:countIoC(cipher),decryptedIoC:countIoC(plain),
  first100:toText(plain.slice(0,100)),forwardMatches:200,
  establishedP56LiteralFControl:"84 prime steps and ANEND confirmed",
  recoveredLP2UnknownPlaintext:false
},null,2));
