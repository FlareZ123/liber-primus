"use strict";
/**
 * LP2 original-cipher all-secret predecessor-conditioned substitution bound.
 *
 * Model: C[i] = permutation[visibleContext(i), C[i-1]](P[i]),
 * with one completely arbitrary independently secret GP29 permutation
 * for every context × previous-cipher-rune row. No linearity or known key.
 *
 * For any k plaintext symbols, ciphertext-state row occupancy majorizes
 * their total: plaintext Top-k count <= sum(row Top-k ciphertext counts).
 * This is exact for any (29!)^numberOfRows possible secret alphabets.
 *
 * Tested source contexts: stationary, global 5-clock, 9 visually grouped
 * illustration sections, per-physical-page positive counterexample.
 * Exclude the 55 physical-page first runes because their predecessor
 * state may be reset/unknown. Source-native GP English is evaluated by
 * the exact 2896 source whole-word lengths and exact page-first omissions.
 *
 * Windows 11 / Node 22:
 * node sims/lp2_cprev_secret_table_majorization_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solvedSource=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} r @returns {number} */
function idx(r){const x=runeIndex.get(r);assert.notEqual(x,undefined);return x;}
/** @param {string} s @returns {number[][]} */
function runeWords(s){return (s.match(/[\u16A0-\u16FF]+/gu)||[])
  .map(w=>[...w].map(idx));}
const sourceWords=read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\r\n%&$\s]/g,"").split(/[-.]/)
  .filter(w=>/[\u16A0-\u16FF]/u.test(w)).slice(0,2896)
  .map(w=>[...w].map(idx));
const nativeWords=solvedSource.sections.flatMap(s=>runeWords(s.source_text));
const pages=corpus.pages.filter(p=>p.page<=55);
const original=pages.flatMap(p=>p.indices);
const originalPageOf=[],pageStarts=new Set();
for(const p of pages){
  if(p.indices.length)pageStarts.add(originalPageOf.length);
  for(const rune of p.indices)originalPageOf.push(p.page);
}
assert.equal(sourceWords.length,2896);
assert.equal(nativeWords.length,740);
assert.equal(nativeWords.flat().length,2979);
assert.equal(original.length,12956);
assert.equal(pageStarts.size,55);
assert.deepEqual(sourceWords.flat(),original);
/** @type {{len:number,skip:number}[]} */
const slots=[];
let global=0;
for(const w of sourceWords){
  let skip=-1;
  for(let j=0;j<w.length;j++,global++){
    if(pageStarts.has(global)){
      assert.equal(skip,-1);
      skip=j;
    }
  }
  slots.push({len:w.length,skip});
}
assert.equal(global,12956);
const sectionBounds=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
/** @param {number} p @returns {number} */
function visualSection(p){
  const z=sectionBounds.findIndex(([a,b])=>p>=a&&p<=b);
  return z<0?0:z;
}
const schedules=[
  {name:"fixed one-table predecessor substitution",key:(p,i)=>0,expectedCapacity:714},
  {name:"source fivefold global-rune clock",key:(p,i)=>i%5,expectedCapacity:1028},
  {name:"nine visible art sections",key:(p,i)=>visualSection(p),expectedCapacity:1255},
  {name:"individual physical pages",key:(p,i)=>p,expectedCapacity:2735}
];
/** @param {number[]} cipher @param {number[]} pageOf
 * @param {(page:number,i:number)=>number} key */
function capacities(cipher,pageOf,key){
  const rows=new Map();
  for(let i=1;i<cipher.length;i++){
    if(pageStarts.has(i))continue;
    const id=key(pageOf[i],i)+"|"+cipher[i-1];
    let row=rows.get(id);
    if(!row){row=Array(29).fill(0);rows.set(id,row);}
    row[cipher[i]]++;
  }
  const bound=Array(29).fill(0);
  for(const row of rows.values()){
    const sorted=[...row].sort((a,b)=>b-a);
    let running=0;
    for(let k=0;k<29;k++){running+=sorted[k];bound[k]+=running;}
  }
  assert.equal(bound[28],12901);
  return {bound,rowCount:rows.size};
}
const sourceCapacity=schedules.map(schedule=>{
  const res=capacities(original,originalPageOf,schedule.key);
  assert.equal(res.bound[0],schedule.expectedCapacity);
  return {name:schedule.name,keys:res.rowCount,
    top1:res.bound[0],top3:res.bound[2],top8:res.bound[7],
    top9:res.bound[8],maxBound:res.bound};
});
/** @param {number[][]} words */
function donorPools(words){
  const pools=new Map();
  for(const w of words){
    if(!pools.has(w.length))pools.set(w.length,[]);
    pools.get(w.length).push(w);
  }
  for(const slot of slots)assert.ok(pools.get(slot.len)?.length);
  return pools;
}
const pools=donorPools(nativeWords);
const nativeExpected=Array(29).fill(0);
let nativeEVariance=0;
for(const slot of slots){
  const pool=pools.get(slot.len);
  const sums=Array(29).fill(0);
  let sE=0,sqE=0;
  for(const word of pool){
    const counts=Array(29).fill(0);
    for(let j=0;j<word.length;j++)if(j!==slot.skip)counts[word[j]]++;
    for(let r=0;r<29;r++)sums[r]+=counts[r];
    sE+=counts[18];sqE+=counts[18]*counts[18];
  }
  for(let r=0;r<29;r++)nativeExpected[r]+=sums[r]/pool.length;
  const p=sE/pool.length;
  nativeEVariance+=sqE/pool.length-p*p;
}
const sortedNative=[...nativeExpected].sort((a,b)=>b-a);
const nativeTopK=sortedNative.map((_,k)=>
  sortedNative.slice(0,k+1).reduce((a,b)=>a+b,0));
assert.equal(sortedNative.length,29);
assert.equal(corpus.translit[18],"E");
assert.ok(Math.abs(nativeExpected[18]-1591.0566962773498)<1e-8);
assert.ok(Math.abs(Math.sqrt(nativeEVariance)-33.468287485010606)<1e-8);
assert.ok(Math.abs(nativeTopK[7]-7769.911)<0.02);
/** Compare unknown-runic source-capacity and real matched-native expectation.
 * This is a conditional English-register comparison, not a universal
 * assertion about what historical authors wrote.
 */
const nativeCapacity=schedules.map((schedule,i)=>{
  const sc=sourceCapacity[i];
  const breaches=nativeTopK.map((val,k)=>({k:k+1,margin:val-sc.maxBound[k]}))
    .filter(q=>q.margin>1e-7);
  const strongest=breaches.reduce((a,b)=>!a||b.margin>a.margin?b:a,null);
  return {name:schedule.name,top1Cap:sc.top1,
    nativeExpectedE:nativeExpected[18],
    expectedEGap:nativeExpected[18]-sc.top1,
    EStandardDeviations:(nativeExpected[18]-sc.top1)/Math.sqrt(nativeEVariance),
    top9Cap:sc.top9,nativeExpectedTop9:nativeTopK[8],
    breachedK:breaches.map(q=>q.k),largestBreach:strongest};
});
assert.ok(nativeCapacity[0].EStandardDeviations>26);
assert.ok(nativeCapacity[2].EStandardDeviations>10);
assert.ok(nativeCapacity[0].breachedK.length>20);
assert.ok(nativeCapacity[2].breachedK.length>20);
assert.deepEqual(nativeCapacity[3].breachedK,[]);
/** Deterministic seeded PRNG for native test plants. */
let seed=0x128ad9f0;
/** @returns {number} */
function rng(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
/** @returns {number[]} */
function drawBook(){
  return slots.flatMap(s=>{
    const pool=pools.get(s.len);
    return pool[rng()%pool.length];
  });
}
/** Exact source-mask-aware native E count. @param {number[]} p */
function countE(p){
  let n=0;
  for(let i=0;i<p.length;i++)
    if(!pageStarts.has(i) && p[i]===18)n++;
  return n;
}
const sample=[];const N=5000;
for(let k=0;k<N;k++)sample.push(countE(drawBook()));
sample.sort((a,b)=>a-b);
assert.equal(sample.length,5000);
assert.ok(sample[0]>1255);
const controls={replicates:N,min:sample[0],p01:sample[49],
  median:sample[2499],p99:sample[4949],max:sample.at(-1),
  numAtMost714:sample.filter(x=>x<=714).length,
  numAtMost1255:sample.filter(x=>x<=1255).length};

/** Assign an independently secret permutation to each context×prevC state.
 * Source states are opaque output slots, no known encryption key used on
 * original cipher. These are positive controls verifying the exact
 * majorization law on a fully reversible native-LP2-shaped encryption.
 * @param {number} seedValue
 */
function secretTable(seedValue){
  let x=seedValue>>>0;
  /** @returns {number} */
  const next=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
  const forward=new Map(),backward=new Map();
  const table=id=>{
    if(!forward.has(id)){
      const p=Array.from({length:29},(_,i)=>i);
      for(let j=28;j>0;j--){
        const k=next()%(j+1);
        [p[j],p[k]]=[p[k],p[j]];
      }
      const inv=Array(29).fill(0);
      for(let j=0;j<29;j++)inv[p[j]]=j;
      forward.set(id,p);
      backward.set(id,inv);
    }
    return forward.get(id);
  };
  /** @param {number[]} plain @param {number[]} pageOf
   * @param {(page:number,i:number)=>number} state */
  function encode(plain,pageOf,state){
    let prev=0;
    return plain.map((r,i)=>{
      const id=state(pageOf[i],i)+"|"+prev;
      const c=table(id)[r];prev=c;return c;
    });
  }
  /** @param {number[]} cipher @param {number[]} pageOf
   * @param {(page:number,i:number)=>number} state */
  function decode(cipher,pageOf,state){
    let prev=0;
    return cipher.map((c,i)=>{
      const id=state(pageOf[i],i)+"|"+prev;
      const p=backward.get(id)?.[c];
      assert.notEqual(p,undefined);
      prev=c;return p;
    });
  }
  return {encode,decode};
}
const plant=drawBook(),p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(plant.length,12956);assert.equal(p57.length,95);
const positive=[];
for(let k=0;k<schedules.length;k++){
  const s=schedules[k],cipherTable=secretTable(0x8193301+k*21457);
  const encrypted=cipherTable.encode(plant,originalPageOf,s.key);
  assert.deepEqual(cipherTable.decode(encrypted,originalPageOf,s.key),plant);
  const caps=capacities(encrypted,originalPageOf,s.key);
  const frequency=Array(29).fill(0);
  for(let i=0;i<plant.length;i++)if(!pageStarts.has(i))frequency[plant[i]]++;
  const descending=frequency.sort((a,b)=>b-a);
  for(let top=1;top<=29;top++)
    assert.ok(descending.slice(0,top).reduce((a,b)=>a+b,0)<=caps.bound[top-1]);
  const p57Pages=Array(p57.length).fill(57);
  const p57Cipher=cipherTable.encode(p57,p57Pages,s.key);
  assert.deepEqual(cipherTable.decode(p57Cipher,p57Pages,s.key),p57);
  positive.push({schedule:s.name,exactRecovery:plant.length,
    recoveredSolvedP57:p57.length,E:countE(plant),encryptedCap1:caps.bound[0]});
}
console.log(JSON.stringify({
  original:{runes:12956,runeBearingPages:55,printedWords:2896,
    samePageTransitions:12901,sourceCapacity:sourceCapacity.map(({maxBound,...other})=>other)},
  universalProof:"For any GP29 plaintext set of k runes, each secret bijective row maps it to k distinct ciphertext outputs; sum of k largest ciphertext row occupancies is an absolute upper bound independent of all secret tables.",
  exactNativeLengthMatched:{nativeSolvedWords:740,nativeSolvedRunes:2979,
    solvedE:380,expectedE:nativeExpected[18],sdE:Math.sqrt(nativeEVariance),
    top1:nativeTopK[0],top3:nativeTopK[2],
    top8:nativeTopK[7],capacityComparisons:nativeCapacity},
  sourceNativeControls:controls,
  secretRowsSyntheticPositive:positive,
  decision:"All-source 29-state and source-fivefold/nine-art-section 29-state arbitrary secret substitution tableaux lack capacity for native-GP English. Per-physical-page context remains feasible. No authentic LP2 plaintext/key is recovered."
},null,2));
console.log("PASS: source-original all-secret context substitution majorization and solved-GP positives");
