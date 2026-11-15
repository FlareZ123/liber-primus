"use strict";
/**
 * Original LP2 four-dot sentence clock, using a solved-page control.
 * Director #994. Exact physical four-dot starts 138, not the derivative
 * 175 punctuation marks. A stop-reset totient stream is a frozen,
 * source-motivated *hypothesis* whose prerequisite demonstrably fails on
 * authentic solved p56; it is not an authenticated unknown LP2 key.
 *
 * SFT: node sims/lp2_138_fourdot_phi_reset_original_sft.cjs
 * Node.js 22 CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const load = f => fs.readFileSync(path.join(root, f), "utf8");
const gp = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const punc = JSON.parse(load("resources/liber-primus/lp2-punctuation-identity.json"));
const physical = gp.pages.filter(p => p.page < 56);
const cipher = physical.flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
const omittedIndices = new Set([57,58,59,60,91,125,127]);
const stops = punc.events.filter(e =>
  e.symbol === "⁘" && e.page < 56 && !omittedIndices.has(e.index))
  .map(e => e.rune_offset).sort((a,b) => a-b);
assert.equal(stops.length, 138);
assert.equal(new Set(stops).size, 138);
assert.equal(stops[0],154);
assert.equal(stops.at(-1),12597);
assert.deepEqual(punc.source_audit.morphology.stop_four_dot_diamonds,
  {...punc.source_audit.morphology.stop_four_dot_diamonds,count:138});
const fieldStarts=[0,...stops],fieldEnds=[...stops,cipher.length];
assert.equal(fieldStarts.length,139);

/** @param {number} max @returns {number[]} */
function firstPrimes(max) {
  const out=[];
  for(let n=2;out.length<max;n++){
    if(out.every(p=>p*p>n||n%p!==0))out.push(n);
  }
  return out;
}
const maxField=Math.max(...fieldStarts.map((s,i)=>fieldEnds[i]-s));
const primes=firstPrimes(Math.max(maxField,85));
/** @param {number[]} original @returns {number[]} */
function decrypt(original) {
  const plaintext=[];
  for(let k=0;k<139;k++){
    const start=fieldStarts[k],end=fieldEnds[k];
    for(let j=0;j<end-start;j++)
      plaintext.push((original[start+j]-(primes[j]-1)%29+29)%29);
  }
  return plaintext;
}
/** @param {number[]} original @returns {number[]} */
function encrypt(original) {
  const crypt=[];
  for(let k=0;k<139;k++){
    const start=fieldStarts[k],end=fieldEnds[k];
    for(let j=0;j<end-start;j++)
      crypt.push((original[start+j]+(primes[j]-1)%29)%29);
  }
  return crypt;
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const hist=new Uint32Array(29);
  for(const a of arr)hist[a]++;
  const n=arr.length;
  return hist.reduce((total,v)=>total+v*(v-1),0)/(n*(n-1));
}
// Solved-p56 *real* ciphertext/plaintext control at its first printed stop.
// The first five printed cipher runes are AN END under the six known
// consecutive prime-totient shifts; its source four-dot stop is at offset5.
const clearP56=encodeSourceNativeGP("AN END WITHIN");
const p56=gp.pages[56].indices;
const firstKnown=clearP56.slice(0,6);
const firstSource=p56.slice(0,6);
assert.deepEqual(firstKnown,[24,9,18,9,23,7]);
assert.deepEqual(firstSource,[25,11,22,15,4,19]);
const continuous=firstSource.map((c,i)=>(c-(primes[i]-1)%29+29)%29);
assert.deepEqual(continuous,firstKnown);
const stopResetSixth=(p56[5]-(primes[0]-1)%29+29)%29;
assert.equal(stopResetSixth,18); // E, not W index7.
assert.notEqual(stopResetSixth,firstKnown[5]);
const decoded=decrypt(cipher);
assert.deepEqual(encrypt(decoded),cipher);
const pageStart=new Map();let cumulative=0;
for(const p of physical){pageStart.set(p.page,cumulative);cumulative+=p.indices.length;}
const firstChapter=decoded.slice(pageStart.get(0),pageStart.get(3));
const lastChapter=decoded.slice(pageStart.get(54));
assert.equal(firstChapter.length,729);
assert.equal(lastChapter.length,308);
// Full original word dictionary: source-native English GP words by exact
// published word lengths, retaining all cross-line/page word carries.
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const regex=new RegExp("["+gp.runes.join("")+"]+","gu");
const published=load("resources/lp2-transcription.txt").split("%").slice(0,55).join("%")
  .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"");
const wordLengths=(published.match(regex)||[]).map(x=>Array.from(x).length);
assert.equal(wordLengths.length,2896);
assert.equal(wordLengths.reduce((x,y)=>x+y,0),12956);
const controls=[
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const vocab=Array.from({length:15},()=>new Set());
const pools=Array.from({length:15},()=>[]);
for(const f of controls){
  const latin=load(f).split(/\r?\n/).filter(x=>!x.startsWith("#")).join(" ");
  for(const word of latin.match(/[A-Za-z]+/g)||[]){
    const norm=encodeSourceNativeGP(word);
    if(norm.length>0&&norm.length<=14){
      pools[norm.length].push(norm);
      vocab[norm.length].add(norm.join(","));
    }
  }
}
/** @param {number[]} arr @returns {number} */
function countWordHits(arr){
  let k=0,hits=0;
  for(const size of wordLengths){
    const w=arr.slice(k,k+size);
    hits+=Number(vocab[size].has(w.join(",")));
    k+=size;
  }
  assert.equal(k,arr.length);
  return hits;
}
let rng=0x3301994;
function next(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng;}
const nativePlant=wordLengths.flatMap(n=>{
  const pool=pools[n]; return pool[next()%pool.length];
});
assert.equal(nativePlant.length,cipher.length);
const plantedCipher=encrypt(nativePlant);
assert.deepEqual(decrypt(plantedCipher),nativePlant);
const result={
  sourceCounts:{fullStops:stops.length,fields:fieldStarts.length,
    firstFullStop:stops[0],lastFullStop:stops.at(-1),lastTail:12956-stops.at(-1),
    originalGP:12956},
  authorialSolvedP56Control:{sourceStopAfterGP:5,
    sixthGPknown:"W",sixthActualCipherIndex:p56[5],
    sixthCipherPrime13TotientShift:12,
    trueContinuousGPIndex:continuous[5],
    falseStopResetGPIndex:stopResetSixth},
  frozenOriginalHypothesis:{model:"Restart φ(successive primes) modulo29 at each of the 138 confirmed four-dot stops, no F exceptions",
    originalDecodedIOC:ioc(decoded),
    p0to2IOC:ioc(firstChapter),
    p54to55IOC:ioc(lastChapter),
    dictionaryWordsMatched:countWordHits(decoded),
    originalReencryptedExactly:true},
  syntheticPositive:{originalWordSizesRetained:wordLengths.length,
    GPnativeRecovered:decrypt(plantedCipher).length,
    nativeGPIOC:ioc(nativePlant),
    dictionaryWordsMatched:countWordHits(nativePlant)},
  decision:"The four-dot mark does not restart the independently solved p56 prime-totient clock even across its authentic first heading, so punctuation alone cannot select an LP2-wide totient reset. The 138-stop frozen unknown-original inverse is a bounded exploratory negative unless it yields readable text; no authentic unknown plaintext or new key."
};
console.log(JSON.stringify(result,null,2));
