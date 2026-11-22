"use strict";
/**
 * Source-constrained 76-rune GP28 inverse: source p05's 13 verbal cells,
 * original p54 carry-IV, all 76 original p55 runes. Every original
 * repeat is losslessly mapped to a reserved 29th symbol. This candidate
 * mechanism is not established as Cicada's cipher.
 * Run: node sims/lp1_p05_wordcells76_p55_gp28_source_inverse_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const anchor="272-138-";
assert.equal(lp1.indexOf(anchor),lp1.lastIndexOf(anchor));
const rows=lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0,5)
  .map(line=>line.replace(/\/$/,"").split("-"));
assert.deepEqual(rows.map(r=>r.length),[5,5,5,5,5]);
const sourceWords=rows.flatMap(row=>row.filter(s=>!/^\d+$/.test(s)));
assert.equal(sourceWords.length,13);
assert.deepEqual(sourceWords.map(s=>[...s].length),
  [7,6,7,4,6,7,4,6,6,4,8,6,5]);
const key=[...sourceWords.join("")].map(r=>corpus.runes.indexOf(r));
assert.equal(key.length,76);
assert.ok(key.every(i=>i>=0&&i<29));
const previousPage=corpus.pages.find(p=>p.page===54).indices;
const cipher=corpus.pages.find(p=>p.page===55).indices;
const native=corpus.pages.find(p=>p.page===57).indices;
const iv=previousPage.at(-1);
assert.equal(iv,26);
assert.equal(cipher[0],21);
assert.equal(cipher.length,76);
assert.equal(native.length,95);
const mod=(v,m)=>(v%m+m)%m;
/**
 * @param {number} symbol GP29 ciphertext index
 * @param {number} prev Previous GP29 index
 * @param {"cyclic"|"sorted"} kind Rank representation
 * @returns {number} Reversible rank 0..28
 */
function toRank(symbol,prev,kind) {
  if(symbol===prev)return 28;
  return kind==="cyclic"?mod(symbol-prev-1,29):
    symbol-(symbol>prev?1:0);
}
/**
 * @param {number} rank Rank 0..28
 * @param {number} prev Previous GP29 index
 * @param {"cyclic"|"sorted"} kind Rank representation
 * @returns {number} Original GP29 index
 */
function fromRank(rank,prev,kind) {
  if(rank===28)return prev;
  return kind==="cyclic"?mod(prev+rank+1,29):
    rank+(rank>=prev?1:0);
}
/**
 * @param {number[]} ct Original GP29 ciphertext
 * @param {number[]} k GP28 reduced source key
 * @param {number} prior Initial previous ciphertext rune
 * @param {"cyclic"|"sorted"} kind
 * @param {number} sign
 * @returns {number[]} Decoded GP29 stream
 */
function decode(ct,k,prior,kind,sign) {
  let prev=prior;
  return ct.map((symbol,i)=>{
    const rank=toRank(symbol,prev,kind);
    prev=symbol;
    return rank===28?28:mod(rank+sign*k[i],28);
  });
}
/** @param {number[]} pt @param {number[]} k @param {number} prior @param {"cyclic"|"sorted"} kind @param {number} sign @returns {number[]} */
function encode(pt,k,prior,kind,sign) {
  let prev=prior;
  return pt.map((p,i)=>{
    const rank=p===28?28:mod(p-sign*k[i],28);
    const symbol=fromRank(rank,prev,kind);
    prev=symbol;
    return symbol;
  });
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f=Array(29).fill(0);
  for(const x of a)f[x]++;
  return f.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
const repeatIndices=cipher.flatMap((x,i)=>x===(i?cipher[i-1]:iv)?[i]:[]);
assert.deepEqual(repeatIndices,[59]);
const keys=[
  ["ordinal",key],
  ["prime",key.map(x=>corpus.prime[x])],
  ["totient",key.map(x=>corpus.prime[x]-1)]
];
const results=[];
for(const kind of ["cyclic","sorted"])
for(const order of ["printed","reversed"])
for(const [keyType,raw] of keys)
for(const sign of [-1,1]){
  const k=(order==="printed"?raw:raw.slice().reverse()).map(x=>mod(x,28));
  const pt=decode(cipher,k,iv,kind,sign);
  assert.deepEqual(encode(pt,k,iv,kind,sign),cipher);
  assert.deepEqual(pt.flatMap((x,i)=>x===28?[i]:[]),repeatIndices);
  const clear=native.slice(0,76);
  const plant=encode(clear,k,iv,kind,sign);
  assert.deepEqual(decode(plant,k,iv,kind,sign),clear);
  results.push({kind,order,keyType,sign,ioc:ioc(pt),
    first24:pt.slice(0,24).map(x=>corpus.translit[x]).join("")});
}
results.sort((a,b)=>b.ioc-a.ioc);
assert.equal(results.length,24);
assert.ok(Math.abs(results[0].ioc-0.03754385964912281)<1e-12);
assert.ok(Math.abs(results.at(-1).ioc-0.028421052631578948)<1e-12);
/**
 * Complete 29-way ciphertext-feedback key consumer. For every key symbol K_i,
 * a repeated ciphertext output encodes plaintext K_i (under the +K rule),
 * so the exception symbol evolves rather than being a fixed reserved rune.
 * This avoids the prior all-fixed-sentinel invariant, though it is still a
 * speculative source-tape consumer and must reveal native text to qualify.
 * @param {number[]} ct
 * @param {number[]} k
 * @param {number} signDifference
 * @param {number} signKey
 * @returns {number[]}
 */
function movingDecode(ct,k,signDifference,signKey) {
  let previous=iv;
  return ct.map((c,i)=>{
    const step=mod(c-previous,29);
    previous=c;
    return mod(signDifference*step+signKey*k[i],29);
  });
}
/**
 * @param {number[]} pt
 * @param {number[]} k
 * @param {number} signDifference
 * @param {number} signKey
 * @returns {number[]}
 */
function movingEncode(pt,k,signDifference,signKey) {
  let previous=iv;
  return pt.map((p,i)=>{
    const c=mod(previous+signDifference*(p-signKey*k[i]),29);
    previous=c;
    return c;
  });
}
const moving=[];
for(const order of ["printed","reversed"])
for(const [keyType,raw] of keys)
for(const signDifference of [-1,1])
for(const signKey of [-1,1]){
  const k=(order==="printed"?raw:raw.slice().reverse()).map(x=>mod(x,29));
  const pt=movingDecode(cipher,k,signDifference,signKey);
  assert.deepEqual(movingEncode(pt,k,signDifference,signKey),cipher);
  const planted=native.slice(0,76);
  assert.deepEqual(movingDecode(
    movingEncode(planted,k,signDifference,signKey),k,
    signDifference,signKey),planted);
  assert.deepEqual(repeatIndices,[59]);
  assert.equal(pt[59],mod(signKey*k[59],29));
  moving.push({order,keyType,signDifference,signKey,ioc:ioc(pt),
    first24:pt.slice(0,24).map(x=>corpus.translit[x]).join("")});
}
moving.sort((a,b)=>b.ioc-a.ioc);
assert.equal(moving.length,24);
assert.ok(Math.abs(moving[0].ioc-0.03824561403508772)<1e-12);
assert.ok(Math.abs(moving.at(-1).ioc-0.031578947368421054)<1e-12);
/** Third independently printed 76-unit operand: 32x8 numeric-table perimeter. */
const sourceTable=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const bytes=sourceTable.bytes;
assert.equal(bytes.length,256);
const ring=[];
for(let col=0;col<8;col++)ring.push(bytes[col]);
for(let row=1;row<32;row++)ring.push(bytes[row*8+7]);
for(let col=6;col>=0;col--)ring.push(bytes[31*8+col]);
for(let row=30;row>=1;row--)ring.push(bytes[row*8]);
assert.equal(ring.length,76);
const dual=[];
for(const orientation of ["printed","reversed"])
for(const signWord of [-1,1])
for(const signTable of [-1,1]){
  const word=(orientation==="printed"?key:key.slice().reverse());
  const pt=cipher.map((c,i)=>mod(c+signWord*word[i]+signTable*ring[i],29));
  const encrypt=plain=>plain.map((p,i)=>mod(p-signWord*word[i]-signTable*ring[i],29));
  assert.deepEqual(encrypt(pt),cipher);
  const clear=native.slice(0,76);
  assert.deepEqual(encrypt(clear).map((c,i)=>mod(c+signWord*word[i]+signTable*ring[i],29)),clear);
  dual.push({orientation,signWord,signTable,ioc:ioc(pt),
    first24:pt.slice(0,24).map(x=>corpus.translit[x]).join("")});
}
dual.sort((a,b)=>b.ioc-a.ioc);
assert.equal(dual.length,8);
assert.ok(Math.abs(dual[0].ioc-0.037894736842105266)<1e-12);
assert.ok(Math.abs(dual.at(-1).ioc-0.02982456140350877)<1e-12);
const control=Array.from({length:20},(_,i)=>ioc(native.slice(i,i+76)));
assert.ok(Math.min(...control)>0.059);
console.log(JSON.stringify({
  status:"No p55 plaintext or historical cipher key recovered",
  sourceKey:"13 original printed p05 word cells; 76 GP29 runes",
  originalP55Runes:76,p54CarryIV:iv,
  sourceP55RepeatedPredecessorPositions:repeatIndices,
  originalP55IoC:ioc(cipher),modelCount:results.length,
  candidateIoC:[results.at(-1).ioc,results[0].ioc],
  nativeP57Clear76WindowIoC:[Math.min(...control),Math.max(...control)],
  exactOriginalReencryptions:24,nativeP57ExactPlants:24,
  bestFour:results.slice(0,4),
  moving29VariantCount:moving.length,
  moving29FullOriginalReencryptions:moving.length,
  moving29NativeFullPlants:moving.length,
  moving29IoCRange:[moving.at(-1).ioc,moving[0].ioc],
  bestFourMoving29:moving.slice(0,4),
  gridPerimeterRunes:ring.length,
  triple76CombinedVariants:dual.length,
  triple76CombinedIocRange:[dual.at(-1).ioc,dual[0].ioc],
  triple76CombinedNativePlants:dual.length,
  triple76CombinedBest:dual.slice(0,2),
  moving29Interpretation:"Repetition now decodes to position-specific GP symbol from the complete source key, so prior fixed-repeat marker exclusion does not subsume this moving-sentinel family; no original plaintext.",
  limitation:"This is a bounded source-key GP28 feedback/register hypothesis, not an exclusion of every source-key cipher or every possible plaintext register."
},null,2));
