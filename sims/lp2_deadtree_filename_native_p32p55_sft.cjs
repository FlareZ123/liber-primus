"use strict";
/**
 * Commons original DeadTree.jpg filename as a literal candidate key on p32/p55.
 * Authentic GP29 additive and plaintext-F transparent cipher only.
 * No inferred LP2 plaintext or author-supplied key is claimed.
 * Run: node sims/lp2_deadtree_filename_native_p32p55_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(
 path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"));
const alpha=corpus.translit;
const lookup=new Map(alpha.map((s,i)=>[s,i]));
const key=[..."DEADTREE"].map(x=>lookup.get(x));
assert.deepEqual(key,[23,18,24,23,16,4,18,18]);
const mod=x=>((x%29)+29)%29;
/** Exact historical forward cipher: plaintext F is literal, clock skips F. */
function enc(plain,sign) {
 let clock=0;
 return plain.map(x=>x===0?0:mod(x-sign*key[clock++%key.length]));
}
/** Enumerate all legal ciphertext-F decisions; reject invented plaintext F. */
function dec(cipher,sign) {
 const f=cipher.flatMap((v,i)=>v===0?[i]:[]);
 const results=[];
 for(let mask=0;mask<2**f.length;mask++) {
  const literal=new Set(f.filter((_,i)=>(mask&(1<<i))!==0));
  const plain=[];
  let clock=0,ok=true;
  for(let i=0;i<cipher.length;i++) {
   if(literal.has(i)) {plain.push(0);continue;}
   const x=mod(cipher[i]+sign*key[clock++%key.length]);
   if(x===0) {ok=false;break;}
   plain.push(x);
  }
  if(ok) {
   assert.deepEqual(enc(plain,sign),cipher);
   results.push({sign,mask,plain});
  }
 }
 return results;
}
const known=corpus.pages[57].indices;
assert.equal(known.length,95);
assert.ok(known.includes(0));
const result={key:"DEADTREE",keyIndices:key,source:"Commons DeadTree.jpg, matching p32/p55 photo",pages:{}};
for(const page of [32,55]) {
 const original=corpus.pages[page].indices;
 assert.equal(original.length,page===32?121:76);
 const f=original.flatMap((v,i)=>v===0?[i]:[]);
 assert.deepEqual(f,page===32?[29,30,42,114]:[15,25,41]);
 let legal=0;
 for(const sign of [-1,1]) {
  const candidates=dec(original,sign);
  assert.equal(candidates.length,0);
  legal+=candidates.length;
  const planted=Array.from({length:original.length},(_,i)=>known[i%known.length]);
  const encrypted=enc(planted,sign);
  assert.ok(dec(encrypted,sign).some(x=>x.plain.every((v,i)=>v===planted[i])));
 }
 result.pages[page]={originalRunes:original.length,ciphertextFSites:f,
  testedSigns:[-1,1],totalMaskedBranchesPerSign:2**f.length,
  legalOriginalPlaintexts:legal,sourceNativePlantedInverse:"exact"};
}
console.log(JSON.stringify({...result,decision:
 "Literal asset filename under authentic GP29 F-transparent Vigenere fails both original tree pages; no key or plaintext."},null,2));
