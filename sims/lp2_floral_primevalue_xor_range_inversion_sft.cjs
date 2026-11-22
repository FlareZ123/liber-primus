"use strict";

/**
 * All-source GP prime-label XOR common-pad obstruction.
 *
 * Alternative typed register to GP ordinal XOR: interpret each genuine
 * Gematria Primus rune by its one of 29 displayed prime labels 2..109.
 * Under any identical page-start 7-bit XOR key (0..127), ciphertext and
 * plaintext MUST both belong to this fixed 29-prime set. Intersect possible
 * literal XOR key bytes at every aligned original physical black-body
 * source rune. No English text model, hidden key search or fitted offsets.
 *
 * Windows11 Node22 SFT:
 * node sims/lp2_floral_primevalue_xor_range_inversion_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const primes=[];
for(let n=2;primes.length<29;n++){
 let isPrime=true;
 for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
 if(isPrime)primes.push(n);
}
assert.equal(primes.length,29);
assert.equal(primes[28],109);
const primeSet=new Set(primes);
const firstBlack=p=>ink.pages.find(x=>x.page===p)?.red_spans
 ?.find(x=>x.start===0)?.length||0;
const unknown=book.pages.filter(p=>p.page<=55&&p.indices.length>0)
 .map(p=>({page:p.page,primeBytes:p.indices.slice(firstBlack(p.page))
 .map(i=>primes[i])}));
const flower=unknown.filter(p=>p.page>=40&&p.page<=55);
assert.equal(unknown.length,55);
assert.equal(flower.length,15);

/** Every allowable unknown 7-bit mask for literal prime-label XOR
 *  at each original ordinal page-offset. @param {number[][]} pages */
function allowable(pages){
 const max=Math.max(...pages.map(x=>x.length));
 return Array.from({length:max},(_,i)=>{
  const column=pages.filter(s=>i<s.length).map(s=>s[i]);
  return Array.from({length:128},(_,key)=>key)
   .filter(key=>column.every(value=>primeSet.has(value^key)));
 });
}
/** @param {{page:number,primeBytes:number[]}[]} pages */
function report(pages){
 const all=allowable(pages.map(x=>x.primeBytes));
 const zeros=new Set(all.map((keys,i)=>keys.length===1&&keys[0]===0?i:-1)
  .filter(i=>i>=0));
 let forcedRunes=0,totalRunes=0;
 for(const page of pages)for(const [i,value]of page.primeBytes.entries()){
  assert(primeSet.has(value));
  totalRunes++;
  if(zeros.has(i)){forcedRunes++;assert.deepEqual(all[i],[0]);}
 }
 return {pages:pages.length,largestPageRunes:all.length,forcedKeyZeroOffsets:zeros.size,
  forcedOriginalGlyphs:forcedRunes,totalBodyGlyphs:totalRunes,
  forcedFraction:forcedRunes/totalRunes,first66Forced:
   Array.from(zeros).filter(i=>i<66).length,
  remainingNonzeroKeySites:all.map((keys,i)=>keys.length>1?{
   i,n:pages.filter(p=>i<p.primeBytes.length).length,keys
  }:null).filter(Boolean)};
}
const global=report(unknown),floral=report(flower);
assert.equal(global.largestPageRunes,277);
assert.equal(global.forcedKeyZeroOffsets,273);
assert.equal(global.forcedOriginalGlyphs,12838);
assert.equal(global.totalBodyGlyphs,12844);
assert.equal(floral.largestPageRunes,274);
assert.equal(floral.forcedKeyZeroOffsets,265);
assert.equal(floral.forcedOriginalGlyphs,3231);
assert.equal(floral.totalBodyGlyphs,3299);
assert.equal(floral.first66Forced,66);
assert.deepEqual(floral.remainingNonzeroKeySites.map(x=>x.i),
 [189,221,227,243,259,266,271,272,273]);

// Positive genuinely nonzero-key five-bit/7-bit reversible mask planting,
// on ORIGINAL rune-shaped prime values. The site189 key78 is valid for
// all ELEVEN pages with original site189. Every planted "ciphertext" value
// must remain a valid source chart prime. Exact inverse at every rune.
const allowed=allowable(flower.map(p=>p.primeBytes));
const key=allowed.map((choices,i)=>{
 if(i===189)return 78;
 if(i===221)return 14;
 return 0;
});
assert(allowed.every((choices,i)=>choices.includes(key[i])));
assert.equal(key.filter(k=>k!==0).length,2);
let positiveRunes=0,changed=0;
for(const p of flower){
 const encoded=p.primeBytes.map((prime,i)=>prime^key[i]);
 assert(encoded.every(x=>primeSet.has(x)));
 for(const [i,v]of encoded.entries()){
  assert.equal(v^key[i],p.primeBytes[i]);
  if(key[i]!==0)changed++;
  positiveRunes++;
 }
}
assert.equal(positiveRunes,3299);
assert.equal(changed,22);
console.log(JSON.stringify({
 claim:"Original source prime-label alphabet forces key0 in 265 of 274 floral body positions, revealing 3231 of 3299 source runes unchanged under EVERY common 7-bit XOR pad. Across the full 55-page book, only six rune positions could change. This is source-alphabet algebra, not plaintext decoding.",
 originalFlower:floral,
 originalAllUnknown:global,
 authenticPrimeRegister:{
  numberOfPrimes:primes.length,lastPrime:primes[28],
  strongestOriginalPlantKeyOffsets:[189,221],
  plantedNonzeroChanges:changed,
  exactPositiveRoundtrip:positiveRunes
 },
 limit:"This only excludes one common key restarted at each page on GP PRIME VALUES using literal XOR. GP ordinal XOR, additive arithmetic, independent page keys, 2014 binary XOR on a different encoding and unprovided source dependencies remain outside the theorem."
},null,2));
