"use strict";
/**
 * Source-constrained, read-only LP2 inverse:
 * p49-p51 32x8 numerical table -> eight candidate raw 256-bit column keys.
 * Rare adjacent repeats -> one reserved plaintext GP rune, while each of
 * the other 28 plaintext runes selects a non-previous output rune.
 *
 * Test AES-256-CTR / ChaCha20 with one fixed zero IV, both signs, and the
 * two canonical orderings of 28 non-previous output symbols. No private
 * key tuning, crib fitting, dynamic IV, or encrypted-word editing.
 *
 * Windows Node.js 22, CommonJS, no external dependencies.
 * Hypothesized cipher: this is NOT an authenticated Cicada instruction.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const master = read("resources/lp2-transcription.txt");
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const bytes = table.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
const keys = Array.from({length:8}, (_,col) =>
  Buffer.from(Array.from({length:32},(_,row)=>bytes[row*8+col])));
const source = master.split("%").filter(p => p.trim()).slice(0,-2).join("%");
const sections = source.split("$")
  .filter(s => /[\u16A0-\u16FF]/u.test(s))
  .map(s => {
    const words = [...s.replace(/[\r\n%\/]/g,"")
      .matchAll(/[\u16A0-\u16FF]+/gu)].map(m =>
        Array.from(m[0],r=>alphabet.get(r)));
    assert(words.every(w => w.every(x => Number.isInteger(x))));
    return { words, runes: words.flat() };
  });
assert.equal(sections.length, 8);
assert.deepEqual(sections.map(s=>s.runes.length),
  [729,1145,1738,1894,1021,1433,1680,3316]);
assert.equal(sections.flatMap(s=>s.words).length, 2896);
const original = corpus.pages.filter(p=>p.page<=55)
  .flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.deepEqual(sections.flatMap(s=>s.runes),original);
const originalEqual = original.slice(1).reduce(
  (total,v,i)=>total+Number(v===original[i]),0);
assert.equal(originalEqual,86);
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const dictionary = new Set((read("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g)||[]).map(w=>encodeSourceNativeGP(w).join(",")));
assert.equal(dictionary.size,2482);
for(const algorithm of ["aes-256-ctr","chacha20"])
  assert(crypto.getCiphers().includes(algorithm));

/**
 * @param {"aes-256-ctr"|"chacha20"} algorithm
 * @param {Buffer} key
 * @param {number} length
 * @param {"mod28"|"reject224"} reduction
 * @returns {number[]}
 */
function keyDigits(algorithm,key,length,reduction){
  const iv=Buffer.alloc(16);
  const cipher=crypto.createCipheriv(algorithm,key,iv);
  const data=Buffer.concat([cipher.update(
    Buffer.alloc(reduction==="reject224"?length*2:length)),cipher.final()]);
  const digits=[];
  for(const byte of data){
    if(reduction==="mod28" || byte<224)
      digits.push(byte%28);
    if(digits.length===length)break;
  }
  assert.equal(digits.length,length);
  return digits;
}
const m29=x=>(x%29+29)%29;
const m28=x=>(x%28+28)%28;
/**
 * @param {number[]} C Original ciphertext or independent ciphertext fixture
 * @param {number[]} K 28-valued stream
 * @param {"cyclic"|"sorted"} rankChoice
 * @param {-1|1} sign
 * @returns {number[]} GP29 plaintext. First symbol remains an IV, unclaimed.
 */
function decrypt(C,K,rankChoice,sign){
  assert.equal(C.length,K.length);
  const P=[C[0]];
  for(let i=1;i<C.length;i++){
    const prev=C[i-1],curr=C[i];
    if(prev===curr){P.push(28);continue;}
    const rank=rankChoice==="cyclic"?
      m29(curr-prev-1) : curr-Number(curr>prev);
    assert(rank>=0&&rank<28);
    P.push(m28(rank+sign*K[i]));
  }
  return P;
}
/**
 * @param {number[]} P Plaintext; first rune initializes the ciphertext IV
 * @param {number[]} K 28-valued stream
 * @param {"cyclic"|"sorted"} rankChoice
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encrypt(P,K,rankChoice,sign){
  assert.equal(P.length,K.length);
  const C=[P[0]];
  for(let i=1;i<P.length;i++){
    const prev=C[i-1];
    if(P[i]===28){C.push(prev);continue;}
    const rank=m28(P[i]-sign*K[i]);
    const next=rankChoice==="cyclic"?
      (prev+rank+1)%29 : rank+Number(rank>=prev);
    assert(next!==prev);
    C.push(next);
  }
  return C;
}
/** @param {number[]} values */
function ioc(values){
  const freq=Array(29).fill(0);
  for(const x of values)freq[x]++;
  return freq.reduce((v,n)=>v+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {{words:number[][],runes:number[]}} section @param {number[]} P */
function score(section,P){
  let offset=0,wordHits=0,longHits=0,matchedRunes=0,singleAI=0,the=0,and=0;
  for(let wi=0;wi<section.words.length;wi++){
    const size=section.words[wi].length,part=P.slice(offset,offset+size);
    // The source's first rune is an IV, not an independently recovered rune.
    if(offset>0 && dictionary.has(part.join(","))){
      wordHits++;matchedRunes+=size;longHits+=Number(size>=4);
    }
    if(offset>0&&size===1)singleAI+=Number(part[0]===24||part[0]===10);
    if(offset>0&&size===2)the+=Number(part[0]===2&&part[1]===18);
    if(offset>0&&size===3)and+=Number(part[0]===24&&part[1]===9&&part[2]===23);
    offset+=size;
  }
  assert.equal(offset,P.length);
  return {ioc:ioc(P.slice(1)),matchedRunes,wordHits,longHits,singleAI,the,and,
    coverage:matchedRunes/(P.length-1)};
}
// Known-authentic p57 clear GP runes, including a planted escape rune.
const clear=corpus.pages[57].indices.slice();
assert.equal(clear.length,95);
for(const pos of [7,11,23])clear[pos]=28;
let controls=0;
for(const algorithm of ["aes-256-ctr","chacha20"])
for(const key of keys)
for(const reduction of ["mod28","reject224"])
for(const rankChoice of ["cyclic","sorted"])
for(const sign of [-1,1]){
  const K=keyDigits(algorithm,key,clear.length,reduction);
  const fixture=encrypt(clear,K,rankChoice,sign);
  const recovered=decrypt(fixture,K,rankChoice,sign);
  assert.deepEqual(recovered,clear);
  assert.deepEqual(encrypt(recovered,K,rankChoice,sign),fixture);
  for(const pos of [7,11,23])assert.equal(fixture[pos],fixture[pos-1]);
  controls++;
}
assert.equal(controls,128);
const trials=[];
for(let section=0;section<sections.length;section++)
for(let column=0;column<keys.length;column++)
for(const algorithm of ["aes-256-ctr","chacha20"])
for(const reduction of ["mod28","reject224"]){
  const K=keyDigits(algorithm,keys[column],sections[section].runes.length,
    reduction);
  for(const rankChoice of ["cyclic","sorted"])
  for(const sign of [-1,1]){
    const P=decrypt(sections[section].runes,K,rankChoice,sign);
    assert.deepEqual(encrypt(P,K,rankChoice,sign),sections[section].runes);
    trials.push({section,column,algorithm,reduction,rankChoice,sign,
      ...score(sections[section],P),
      first60:P.slice(1,61).map(v=>corpus.translit[v]).join(" ")});
  }
}
assert.equal(trials.length,1024);
const bestBySection=sections.map((s,i)=>trials.filter(t=>t.section===i)
  .sort((a,b)=>b.coverage-a.coverage||b.ioc-a.ioc)[0]);
const maxIoc=trials.slice().sort((a,b)=>b.ioc-a.ioc).slice(0,7);
const maxLexical=trials.slice().sort((a,b)=>
  b.coverage-a.coverage||b.longHits-a.longHits).slice(0,7);
console.log(JSON.stringify({
  scope:"Source-shaped p50 32x8 -> raw AES256/ChaCha256 and 28-nonrepeat GP29 decoder",
  caveat:"No source-authenticated primitive, IV, rank order, or sentinel identification",
  originalRunes:original.length,originalSections:sections.map(s=>s.runes.length),
  originalRepeatedPairs:originalEqual,plantedControls:controls,originalTrials:trials.length,
  bestBySection,maxIoc,maxLexical,
  nativeP57Ioc:ioc(corpus.pages[57].indices),
  nativeP57ModifiedPlantIoc:ioc(clear),
  detectionCondition:"A credible recovered source-native English region must have long full-word runs and a substantially elevated GP IoC, not a few chance dictionary hits"
},null,2));
