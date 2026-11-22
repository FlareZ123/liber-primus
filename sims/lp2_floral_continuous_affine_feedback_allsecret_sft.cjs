"use strict";

/**
 * Source-original, key-exhaustive test of one continuous ciphertext-feedback
 * affine GP29 state across LP2 physical pp40-53, including the p50 runeless table.
 * Read-only Windows 11/Node 22 SFT; inputs are existing repository resources.
 *
 * Candidate C[i]=(P[i]+S[i]) mod29;
 * S[i+1]=(a*S[i]+b*C[i]+d) mod29, a,b,d,S0 all secret GF29 scalars.
 * Arbitrary stationary secret GP29 relabeling of P is also permitted for
 * the frequency invariant, but is not guessed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const db = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = db.pages.filter(p => p.page >= 40 && p.page <= 53);
const C = physical.flatMap(p => p.indices);
assert.deepEqual(physical.map(p => p.indices.length),
  [231,273,272,274,273,270,270,274,271,66,0,92,263,179]);
assert.equal(C.length, 3008);
const chapterOffset = db.pages.filter(p => p.page < 40)
  .reduce((n, p) => n + p.indices.length, 0);
assert.equal(chapterOffset, 9640);
const layout = parseSharedCorpus();
assert.equal(layout.words.length, 2896);
assert.equal(layout.runeCount, 12956);
assert.equal(layout.crossPageWords, 32);
const byGlyph = new Map(db.runes.map((glyph, i) => [glyph, i]));
const wholeOriginal = layout.words.flatMap(w =>
  Array.from(w.runes, glyph => {
    assert(byGlyph.has(glyph));
    return byGlyph.get(glyph);
  }));
assert.deepEqual(wholeOriginal,
  db.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
assert.deepEqual(C, wholeOriginal.slice(chapterOffset,chapterOffset+C.length));

const mod = n => (n % 29 + 29) % 29;
const sums = [
  ["opening",1,231],
  ["middleCrossPage",1323,1863],
  ["lateCrossPage",2566,3008],
  ["whole",1,3008]
];
assert.equal(physical.slice(0,5).reduce((n,p)=>n+p.indices.length,0),1323);
assert.equal(physical.slice(0,7).reduce((n,p)=>n+p.indices.length,0),1863);
assert.equal(physical.slice(0,12).reduce((n,p)=>n+p.indices.length,0),2566);
const close = (actual, expected) =>
  assert(Math.abs(actual-expected)<1e-12, String(actual)+" != "+String(expected));

/**
 * At i>=1, put U[0]=0, U[i]=a*U[i-1]+C[i-1].
 * For a!=1, the unknown drift d is absorbed by x=S0+d/(a-1), and
 * another uniform plaintext rotation; for a=1, x=d and the unknown S0
 * is a uniform rotation. Thus all 29^4 nominal secret state keys reduce
 * for GP29 IoC to the following 29^3 complete output profiles.
 * @param {number} a
 * @param {number} b
 * @param {number} x
 * @returns {number[]}
 */
function representative(a,b,x) {
  const decoded = new Array(C.length);
  let u=0, power=1;
  for (let i=0;i<C.length;i++) {
    if (i) {
      u=(a*u+C[i-1])%29;
      power=a*power%29;
    }
    decoded[i]=mod(C[i]-b*u-(a===1?x*i:x*power));
  }
  return decoded;
}

/** @param {number[]} nums @param {number} lo @param {number} hi */
function ioc(nums,lo,hi) {
  assert(hi>lo+1);
  const counts=new Uint32Array(29);
  for (let i=lo;i<hi;i++) counts[nums[i]]++;
  let pairs=0;
  for(const n of counts) pairs+=n*(n-1);
  return pairs/((hi-lo)*(hi-lo-1));
}

/** @param {number[]} nums */
function scores(nums) {
  return Object.fromEntries(sums.map(([name,lo,hi]) =>
    [name,ioc(nums,lo,hi)]));
}

/** @param {{a:number,b:number,x:number}} candidate */
function decoded(candidate) {
  return representative(candidate.a,candidate.b,candidate.x);
}

// Select on the 230 opening noninitial glyphs ONLY.
let best={a:-1,b:-1,x:-1,opening:-1},tested=0;
for (let a=0;a<29;a++) for(let b=0;b<29;b++) for(let x=0;x<29;x++) {
  const p=representative(a,b,x);
  const opening=ioc(p,1,231);
  if(opening>best.opening+1e-14) best={a,b,x,opening};
  tested++;
}
assert.equal(tested,24389);
assert.deepEqual([best.a,best.b,best.x],[6,19,7]);
close(best.opening,0.04119992405543953);
const openingSelected=scores(decoded(best));
close(openingSelected.middleCrossPage,0.034171648457362744);
close(openingSelected.lateCrossPage,0.03404438698556345);
close(openingSelected.whole,0.034373775450982524);

// Adversarial POST-DECISION ceiling: grant each held-out paragraph an
// independent, oracle-selected secret key, even though the model forbids
// resetting or changing keys. This can only make the candidate stronger.
const maxima=Object.fromEntries(sums.map(([name])=>[name,{ioc:-1}]));
for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let x=0;x<29;x++){
  const p=representative(a,b,x);
  const s=scores(p);
  for(const [name,value] of Object.entries(s))
    if(value>maxima[name].ioc+1e-14)
      maxima[name]={ioc:value,a,b,x};
}
close(maxima.opening.ioc,0.04119992405543953);
close(maxima.middleCrossPage.ioc,0.03698206555349413);
close(maxima.lateCrossPage.ioc,0.03840510563199639);
close(maxima.whole.ioc,0.035454420944166426);

// Independently visible floral five-dot numbers read left=13/right=31.
// Treat 31 mod29=2 as a source-motivated, more restrictive update law.
// Enumerate ALL 29 drifts and ALL 29 initial states with no fitted phase.
let fixedBest={opening:-1},fixedMaxima={};
for(const [name] of sums) fixedMaxima[name]=-1;
for(let d=0;d<29;d++)for(let iv=0;iv<29;iv++){
  let s=iv;
  const p=C.map(c=>{
    const out=mod(c-s);
    s=mod(13*s+2*c+d);
    return out;
  });
  const score=scores(p);
  if(score.opening>fixedBest.opening+1e-14)
    fixedBest={d,iv,...score};
  for(const [name,value] of Object.entries(score))
    fixedMaxima[name]=Math.max(fixedMaxima[name],value);
}
assert.deepEqual([fixedBest.d,fixedBest.iv],[0,9]);
close(fixedBest.opening,0.03755458515283843);
close(fixedMaxima.middleCrossPage,0.03582766439909297);
close(fixedMaxima.lateCrossPage,0.03526538820656468);
assert(fixedMaxima.whole>0.033 && fixedMaxima.whole<0.037);

// Independently calibrated native-GP source words with EXACT original word
// lengths and all 32 original page-spanning word boundaries, sampled by
// reusing the global 2,896-word layout instead of inventing fresh cuts.
/** @param {string} source */
function poolsFrom(source) {
  const pools=new Map();
  for(const token of source.match(/[A-Za-z]+/g)||[]){
    const encoded=encodeSourceNativeGP(token);
    const choices=pools.get(encoded.length)||[];
    choices.push(encoded);
    pools.set(encoded.length,choices);
  }
  for(const word of layout.words)
    assert(pools.has(word.length),"missing native word length "+word.length);
  return pools;
}
/** @param {number} value */
function rng(value) {
  let state=value>>>0;
  return () => {
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return state>>>0;
  };
}
/** @param {Map<number,number[][]>} pools @param {()=>number} random */
function sampleBook(pools,random) {
  return layout.words.flatMap(word=>{
    const variants=pools.get(word.length);
    return variants[random()%variants.length];
  });
}
const referenceFiles=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const nativeMin=Object.fromEntries(sums.map(([name])=>[name,1]));
const nativeByAuthor=[];
let plantedPlain=null;
for(let index=0;index<referenceFiles.length;index++){
  const [name,file]=referenceFiles[index];
  const pools=poolsFrom(read(file));
  const random=rng((0x33012026+index*0x9e3779b9)>>>0);
  const perAuthor=Object.fromEntries(sums.map(([name])=>[name,1]));
  for(let trial=0;trial<20;trial++){
    const whole=sampleBook(pools,random);
    assert.equal(whole.length,12956);
    const plain=whole.slice(chapterOffset,chapterOffset+C.length);
    assert.equal(plain.length,3008);
    if(!plantedPlain)plantedPlain=plain;
    const score=scores(plain);
    for(const [segment,value] of Object.entries(score)){
      perAuthor[segment]=Math.min(perAuthor[segment],value);
      nativeMin[segment]=Math.min(nativeMin[segment],value);
    }
  }
  nativeByAuthor.push({name,twentySamplesMinimum:perAuthor});
}
for(const [name] of sums)
  assert(nativeMin[name]>maxima[name].ioc+0.005,
    "all-secret original maximum meets native-English original-word layout at "+name);

/**
 * Exact, reversible original chapter transport, with continuous state across
 * physical pp40-53 including the two held-out cross-page seams.
 * @param {number[]} input
 * @param {{a:number,b:number,d:number,iv:number}} key
 * @param {boolean} encryption
 * @returns {number[]}
 */
function transform(input,key,encryption) {
  let state=key.iv;
  return input.map(value=>{
    const cipher=encryption?mod(value+state):value;
    const plain=encryption?value:mod(value-state);
    state=mod(key.a*state+key.b*cipher+key.d);
    return encryption?cipher:plain;
  });
}
assert(plantedPlain);
const plants=[];
for(const key of [
  {a:13,b:2,d:7,iv:5},
  {a:6,b:19,d:0,iv:7}
]){
  const syntheticCipher=transform(plantedPlain,key,true);
  const recovery=transform(syntheticCipher,key,false);
  assert.deepEqual(recovery,plantedPlain);
  assert.deepEqual(transform(recovery,key,true),syntheticCipher);
  const originalCandidate=transform(C,key,false);
  assert.deepEqual(transform(originalCandidate,key,true),C);
  plants.push({key,recovered:recovery.length,
    encryptedAndReencrypted:syntheticCipher.length,
    sourceOriginalRoundtrip:originalCandidate.length});
}
const sourceWinner=transform(C,{a:6,b:19,d:0,iv:7},false);
const first100=sourceWinner.slice(0,100).map(i=>db.translit[i]).join("");
const result={
  model:"C=P+S, S_next=a*S+b*C+d mod29, continuous across pp40-53; no reset at p50; stationary GP29 secret relabeling allowed for IoC",
  source:{runes:C.length,chapterStartGlobalRune:chapterOffset,
    physicalPageSizes:physical.map(p=>[p.page,p.indices.length]),
    wholeBookWords:layout.words.length,crossPageWords:layout.crossPageWords,
    intervals:Object.fromEntries(sums.map(([name,lo,hi])=>[name,{lo,hi,length:hi-lo}]))},
  exhaustive:{nominalParameterKeys:29**4,
    distinctFrequencyProfilesTested:tested,
    keySelectedFromOpeningOnly:best,selectedKeyHoldout:openingSelected,
    independentOracleKeyUpperBound:maxima},
  ornaments:{sourceFixedMultipliers:{a:13,b:31%29},allInitialStatesAndDrifts:29**2,
    bestOpening:fixedBest,adversarialMaxima:fixedMaxima},
  nativeGP:{matchedWordLengths:true,calibratedOrthography:true,
    twentySamplesPerAuthor:true,minimum:nativeMin,byAuthor:nativeByAuthor},
  plants,
  representativeFirst100Transliterated:first100,
  conclusion:"This particular complete four-scalar continuous affine ciphertext-feedback family fails the two untouched original cross-page language gates, even after granting independent secret key selection to each holdout. No unknown-page plaintext, author-selected key or continuation recovered."
};
console.log(JSON.stringify(result,null,2));