"use strict";
/**
 * All-secret fixed-public-phase GP29 bijection obstruction for the 13/31
 * fragment-index hypothesis. Exact source transcript, authentic native
 * language controls, and synthetic arbitrary-secret permutations.
 * Run from repository root: node sims/lp2_lcg32_allsecret_phase_invariant_sft.cjs
 * Node.js 22; no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {originalFragments} = require("./lp2_f31_fragment_key_inverse.cjs");
const {encode} = require("./grid_keyskip_viterbi.cjs");
const ROOT = path.resolve(__dirname,"..");
const read = name => fs.readFileSync(path.join(ROOT,name),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const C = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const {bounds} = originalFragments();
assert.equal(C.length,12956);
assert.equal(bounds.length,32);
assert.equal(bounds[28],C.length);
const cycle = size => {
  const a=[];let x=0;
  for(let i=0;i<size;i++){a.push(x);x=(13*x+31)%size;}
  assert.equal(x,0);
  assert.equal(new Set(a).size,size);
  return a;
};
const permuteInverse = xs => Array.from({length:xs.length},(_,i)=>xs.indexOf(i));
const rows=cycle(32),cols=cycle(8);
const rowMaps=[rows,permuteInverse(rows)],colMaps=[cols,permuteInverse(cols)];

/**
 * @param {number[]} rowOrder Full 32-state row permutation.
 * @param {number[]} columnOrder Full eight-column permutation.
 * @param {"reset"|"global"} clock Source original fragment or global column phase.
 * @returns {Uint16Array} State labels for all original unsolved runes.
 */
function labels(rowOrder,columnOrder,clock) {
  const out=new Uint16Array(C.length);
  for(let f=0;f<28;f++)for(let i=bounds[f];i<bounds[f+1];i++) {
    const col=clock==="reset"?(i-bounds[f])%8:i%8;
    out[i]=8*rowOrder[f]+columnOrder[col];
  }
  return out;
}

/**
 * @param {ArrayLike<number>} symbols Original cipher or GP-native plaintext.
 * @param {Uint16Array} phase Original-coordinate phase labels.
 * @returns {{equal:number,pairs:number,rate:number}}
 */
function measure(symbols,phase) {
  const counts=Array.from({length:256},()=>new Uint16Array(29));
  const ns=new Uint16Array(256);
  for(let i=0;i<C.length;i++){
    const x=symbols[i],s=phase[i];
    assert(Number.isInteger(x)&&x>=0&&x<29);
    counts[s][x]++;ns[s]++;
  }
  let equal=0,pairs=0;
  for(let s=0;s<256;s++){
    pairs+=ns[s]*(ns[s]-1);
    for(const n of counts[s])equal+=n*(n-1);
  }
  return {equal,pairs,rate:equal/pairs};
}
const phase=labels(rows,cols,"reset");
const original=measure(C,phase);
assert.equal(original.equal,94652);
assert.equal(original.pairs,2728348);
for(const ro of rowMaps)for(const co of colMaps)
  for(const clock of ["reset","global"]) {
    const actual=measure(C,labels(ro,co,clock));
    assert.equal(actual.equal,original.equal);
    assert.equal(actual.pairs,original.pairs);
  }

/** @returns {number} deterministic xorshift32; not a key search. */
let seed=0x13311f31;
function random32(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const boxes=Array.from({length:256},()=>{
  const a=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){
    const j=random32()%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  assert.equal(new Set(a).size,29);
  return a;
});
const inverseBoxes=boxes.map(box=>{
  const back=new Int16Array(29);
  for(let i=0;i<29;i++)back[box[i]]=i;
  return back;
});
const controls=[];
/** @param {string} label @param {number[]} native Source GP rune indices. */
function checkNative(label,native) {
  assert(native.length>=C.length);
  let lowest=Infinity,highest=-Infinity,count=0,atOrBelow=0;
  for(let start=0;start+C.length<=native.length;start+=323) {
    const result=measure(native.slice(start,start+C.length),phase);
    lowest=Math.min(lowest,result.rate);
    highest=Math.max(highest,result.rate);
    if(result.rate<=original.rate)atOrBelow++;
    count++;
  }
  assert(count>0);
  assert.equal(atOrBelow,0,"Original GP29 phase collision below every native control");
  // A secret, independently randomized 29-permutation for every public phase.
  const planted=native.slice(0,C.length);
  const encrypted=planted.map((x,i)=>boxes[phase[i]][x]);
  const decoded=encrypted.map((x,i)=>inverseBoxes[phase[i]][x]);
  assert.deepEqual(decoded,planted);
  assert.deepEqual(measure(encrypted,phase),measure(planted,phase));
  controls.push({label,encodedNativeRunes:native.length,overlappingWindows:count,
    minimum:lowest,maximum:highest,atOrBelowOriginal:atOrBelow,
    plantedExactRecovery:C.length});
}
for(const [label,file] of [
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
]) checkNative(label,encode(read(file)));
// Latin source is a pre-encoded, word-preserving GP29 transcript.
// The first three non-data comment lines document its historical source.
const latinAlphabet="0123456789ABCDEFGHIJKLMNOPQRS";
const latinSource=read("resources/control/latin-vulgate-gp-wholewords.txt");
const latinRunes=Array.from(latinSource.split(/\r?\n/u)
  .filter(line=>line&&!line.trimStart().startsWith("#")).join(""),
  c=>latinAlphabet.indexOf(c));
assert(latinRunes.every(x=>x>=0&&x<29));
assert.equal(latinRunes.length,204802);
checkNative("Latin Vulgate",latinRunes);
// Beowulf fixture is a source-preserved 12,956-rune GP29 window.
const beowulf=JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const oldEnglish=Array.from(beowulf.positiveControlGpBase29,
  c=>beowulf.positiveControlAlphabet.indexOf(c));
assert(oldEnglish.every(x=>x>=0&&x<29));
assert.equal(oldEnglish.length,C.length);
checkNative("Old English Beowulf",oldEnglish);
assert.equal(controls.reduce((total,item)=>total+item.overlappingWindows,0),2335);
console.log(JSON.stringify({
  hypothesis:"Any arbitrary fixed secret GP29 bijection per original 32-fragment x 8-column state",
  original,publicStateCount:256,unsolvedRunes:C.length,sourceMapVariants:8,
  controls,
  interpretation:"Key-independent exclusion for native-like direct GP29 at source public phases; state-feedback, hidden and non-GP registers untested",
  caveat:"Overlapping native windows and retrospective source selection: not an unconditional statistical p-value"
},null,2));
