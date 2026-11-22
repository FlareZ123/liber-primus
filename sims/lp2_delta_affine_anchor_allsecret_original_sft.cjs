"use strict";
/**
 * All-secret GP29 differential-affine anchor obstruction on original LP2.
 *
 * Full keyspace:
 * C_i = C_(i-1) + b + A_i*(P_i-r) mod29
 * with unknown CONSTANT b,r in GF29 and arbitrary secret nonzero A_i
 * (can vary with every rune and depend on any prior cipher/plain state).
 *
 * Necessary condition: D_i = b iff P_i = r, independent of all A_i.
 * Tests all 29*29 choices using physical-page-start-excluded original
 * ciphertext, original complete word coordinates, source-native donors,
 * and a familywise positive GP29 planted-cipher benchmark.
 *
 * Reproduce on Windows 11 Node.js 22:
 * node sims/lp2_delta_affine_anchor_allsecret_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const native = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const runeIndex = new Map(corpus.runes.map((v,i)=>[v,i]));
/** @param {string} r @returns {number} */
function idx(r) {
  const v=runeIndex.get(r);
  assert.notEqual(v,undefined);
  return v;
}
/** @param {string} text @returns {number[][]} */
const runeWords = text => (text.match(/[\u16A0-\u16FF]+/gu)||[])
  .map(word=>[...word].map(idx));
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\r\n%&$\s]/g,"").split(/[-.]/)
  .filter(w=>/[\u16A0-\u16FF]/u.test(w)).slice(0,2896)
  .map(w=>[...w].map(idx));
const solved = native.sections.flatMap(s=>runeWords(s.source_text));
const physicalPages = corpus.pages.filter(p=>p.page<=55);
const original = physicalPages.flatMap(p=>p.indices);
assert.equal(words.length,2896);
assert.equal(solved.length,740);
assert.equal(solved.flat().length,2979);
assert.equal(original.length,12956);
assert.deepEqual(words.flat(),original);
const pageStarts = new Set(); let offset=0;
for (const page of physicalPages) {
  if(page.indices.length)pageStarts.add(offset);
  offset+=page.indices.length;
}
assert.equal(pageStarts.size,55);
const positionBins=7;
const observed=Array.from({length:29},()=>Array(positionBins).fill(0));
const maskTypes=new Map();
let global=0, prev=0;
for(const word of words) {
  let skip=-1;
  for(let j=0;j<word.length;j++,global++){
    const c=word[j];
    if(pageStarts.has(global)) {
      assert.equal(skip,-1);
      skip=j;
    } else {
      const d=((c-prev)%29+29)%29;
      observed[d][Math.min(j,positionBins-1)]++;
    }
    prev=c;
  }
  const key=word.length+"|"+skip;
  maskTypes.set(key,(maskTypes.get(key)||0)+1);
}
assert.equal(global,12956);
assert.equal(observed.flat().reduce((s,v)=>s+v,0),12901);
assert.deepEqual(observed[0],[23,12,21,7,8,6,9]);
assert.equal(maskTypes.size,41);
/** Authentic same-length pool map. @param {number[][]} donor */
function poolsFor(donor) {
  const p=new Map();
  for(const w of donor){
    if(!p.has(w.length))p.set(w.length,[]);
    p.get(w.length).push(w);
  }
  for(const w of words)assert.ok(p.get(w.length)?.length);
  return p;
}
/**
 * Exact donor per-position expected counts and variances after holding all
 * original page-start omissions and all 2896 word lengths fixed.
 * @param {number[][]} donor
 */
function expectations(donor) {
  const pools=poolsFor(donor);
  const mean=Array.from({length:29},()=>Array(positionBins).fill(0));
  const variance=Array.from({length:29},()=>Array(positionBins).fill(0));
  for(const [key,n] of maskTypes) {
    const [len,skip]=key.split("|").map(Number),pool=pools.get(len);
    for(let r=0;r<29;r++) {
      const sums=Array(positionBins).fill(0),squares=Array(positionBins).fill(0);
      for(const word of pool) {
        const counts=Array(positionBins).fill(0);
        for(let j=0;j<word.length;j++)
          if(j!==skip && word[j]===r)counts[Math.min(j,positionBins-1)]++;
        for(let k=0;k<positionBins;k++){
          sums[k]+=counts[k];
          squares[k]+=counts[k]*counts[k];
        }
      }
      for(let k=0;k<positionBins;k++){
        const p=sums[k]/pool.length;
        mean[r][k]+=n*p;
        variance[r][k]+=n*(squares[k]/pool.length-p*p);
      }
    }
  }
  return {mean,variance,pools};
}
/** @param {number[]} counts @param {number[]} mean @param {number[]} variance */
function score(counts,mean,variance) {
  let s=0;
  for(let k=0;k<positionBins;k++)
    s+=(counts[k]-mean[k])**2/Math.max(1,variance[k]);
  return s;
}
const reference=expectations(solved);
const all=[];
for(let b=0;b<29;b++)for(let r=0;r<29;r++){
  all.push({difference:b,plaintextRune:r,
    mismatch:score(observed[b],reference.mean[r],reference.variance[r])});
}
all.sort((a,b)=>a.mismatch-b.mismatch);
assert.equal(all.length,841);
assert.deepEqual([all[0].difference,all[0].plaintextRune],[0,6]);
assert.ok(Math.abs(all[0].mismatch-82.68045685467047)<1e-9);

/** CSPRNG-style deterministic xorshift32 for reproducible controls. */
let state=0x3301e45f;
/** @returns {number} */
function rng(){
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return state>>>0;
}
const sourceSlots = words.map(w=>w.length);
/** @param {Map<number,number[][]>} pools @returns {number[][]} */
function drawNativeBook(pools) {
  return sourceSlots.map(n=>{
    const pool=pools.get(n);
    return pool[rng()%pool.length];
  });
}
/**
 * Every native word in the synthetic original-shaped book is a genuine
 * solved Cicada word, chosen independently with matching original length.
 * Every candidate plaintext rune r must have a native-position histogram
 * consistent with its original GP29 register; benchmark maximum over all29
 * r, a conservative adversarial key-selection calibration.
 */
function nativeControls() {
  const reps=1500;
  const maxTrue=[];
  let above=0;
  for(let k=0;k<reps;k++) {
    const copy=drawNativeBook(reference.pools);
    const actual=Array.from({length:29},()=>Array(positionBins).fill(0));
    let i=0;
    for(const word of copy){
      for(let j=0;j<word.length;j++,i++)
        if(!pageStarts.has(i))actual[word[j]][Math.min(j,positionBins-1)]++;
    }
    assert.equal(i,12956);
    let worst=0;
    for(let r=0;r<29;r++)
      worst=Math.max(worst,score(actual[r],reference.mean[r],reference.variance[r]));
    maxTrue.push(worst);
    if(worst>=all[0].mismatch)above++;
  }
  maxTrue.sort((a,b)=>a-b);
  assert.equal(above,0);
  return {repetitions:reps,worstTrueKeyP95:maxTrue[1424],
    worstTrueKeyP99:maxTrue[1484],worstTrueKeyMax:maxTrue.at(-1),
    simulationsAtLeastOriginalBest:above};
}
const calibration=nativeControls();

/** Source-relative GP29 transliteration, with the NG/ING shared rune. */
function latinSource(text) {
  const pairs=["ING","TH","NG","EO","OE","AE","IA","EA"];
  const lookup=new Map(corpus.translit.map((x,i)=>[x,i]));
  return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
    const out=[];
    for(let j=0;j<w.length;){
      const multi=pairs.find(v=>w.startsWith(v,j));
      let c=multi||w[j];
      j+=multi?multi.length:1;
      if(c==="ING")c="NG";
      if(c==="K"||c==="Q")c="C";
      if(c==="V")c="U";
      if(c==="Z")c="S";
      assert.ok(lookup.has(c));
      out.push(lookup.get(c));
    }
    return out;
  });
}
const independent=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"]
].map(([label,file])=>{
  const donor=expectations(latinSource(read(file)));
  let best=null;
  for(let b=0;b<29;b++)for(let r=0;r<29;r++){
    const s=score(observed[b],donor.mean[r],donor.variance[r]);
    if(!best||s<best.mismatch)best={difference:b,plaintextRune:r,mismatch:s};
  }
  return {label,...best};
});
const mod=x=>((x%29)+29)%29;
const pow=[1];
for(let i=1;i<28;i++)pow.push(pow.at(-1)*8%29);
assert.equal(new Set(pow).size,28);
const inv=pow.map(x=>{for(let i=1;i<29;i++)if(x*i%29===1)return i;
  throw Error("nonunit");});
/** @param {number[]} p @param {number} b @param {number} r @returns {number[]} */
function encode(p,b,r){
  let cPrev=0;
  return p.map(v=>{
    cPrev=mod(cPrev+b+pow[cPrev%28]*(v-r));
    return cPrev;
  });
}
/** @param {number[]} c @param {number} b @param {number} r @returns {number[]} */
function decode(c,b,r){
  let cPrev=0;
  return c.map(v=>{
    const p=mod(r+inv[cPrev%28]*mod(v-cPrev-b));
    cPrev=v;
    return p;
  });
}
const p57=corpus.pages.find(p=>p.page===57).indices;
const positiveNativeBook=drawNativeBook(reference.pools).flat();
const positive=[];
for(const [b,r] of [[0,6],[0,28],[4,3],[17,17],[19,20]]) {
  for(const p of [positiveNativeBook,p57]){
    const cipher=encode(p,b,r);
    assert.deepEqual(decode(cipher,b,r),p);
    for(let i=1;i<cipher.length;i++)
      assert.equal(mod(cipher[i]-cipher[i-1])===b,p[i]===r);
  }
  positive.push({difference:b,plainAnchor:r,
    originalShapeRecovered:positiveNativeBook.length,solvedP57Recovered:95});
}
console.log(JSON.stringify({
  original:{runes:12956,words:2896,physicalPages:56,
    excludedRuneFreePages:1,excludedRunicPageStarts:55,originalCompared:12901,
    sourceSpecialDifferenceZero:observed[0]},
  family:"D_i=b + A_i*(P_i-r) mod29, A_i any nonzero, b/r any constant",
  allSecretInvariant:"D_i=b iff P_i=r",
  nativeCicada:{words:740,runes:2979,all841Minimum:all[0],
    originalAtMinimum:observed[all[0].difference],
    nativeAtMinimum:reference.mean[all[0].plaintextRune],
    calibratedControl:calibration},
  independent,positive,
  conclusion:"Full native-GP word-preserving original source incompatible with all841 constant anchors under calibrated native sources; no recovered plaintext."
},null,2));
console.log("PASS: original full-GP29 all-secret 841-anchor inequality, all controls and native plants");
