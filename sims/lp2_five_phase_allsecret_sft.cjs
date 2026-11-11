"use strict";

/**
 * Source-motivated five-state GP29 substitution obstruction.
 *
 * The five red ordinal clauses and five-dot ornament make a five-state
 * schedule a plausible human hypothesis for the approximately one-fifth
 * survival of adjacent ciphertext repeats. This SFT tests the exact
 * key-independent collision invariant for:
 *   - book-global position mod 5;
 *   - physical-page-reset position mod 5;
 *   - original 13-dot-fragment-reset position mod 5;
 *   - five independent stationary GP29 permutations, one per red clause.
 *
 * Every fixed per-state GP29 bijection preserves within-state equal-symbol
 * pairs. Native GP-English controls and independent random-permutation
 * plants verify the invariant and inverse. This does not test a stochastic
 * filter, evolving state, nonlinear mixing, or non-GP intermediate.
 *
 * Run: node sims/lp2_five_phase_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {originalFragments} = require("./lp2_f31_fragment_key_inverse.cjs");
const {encode} = require("./grid_keyskip_viterbi.cjs");

const ROOT = path.resolve(__dirname,"..");
const read = name => fs.readFileSync(path.join(ROOT,name),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const C = corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const {bounds} = originalFragments();
assert.equal(C.length,12956);
assert.equal(bounds.length,32);
assert.equal(bounds[28],C.length);

const pageStarts = new Map();
let pageOffset = 0;
for (const page of corpus.pages.filter(p=>p.page<56)) {
  pageStarts.set(page.page,pageOffset);
  pageOffset += page.indices.length;
}
assert.equal(pageOffset,C.length);

function makePhase(clock) {
  const phase = new Uint8Array(C.length);
  if (clock==="book-global") {
    for(let i=0;i<C.length;i++)phase[i]=i%5;
  } else if (clock==="page-reset") {
    for(const page of corpus.pages.filter(p=>p.page<56)) {
      const start=pageStarts.get(page.page);
      for(let j=0;j<page.indices.length;j++)phase[start+j]=j%5;
    }
  } else if (clock==="fragment-reset") {
    for(let f=0;f<28;f++)
      for(let i=bounds[f];i<bounds[f+1];i++)phase[i]=(i-bounds[f])%5;
  } else {
    throw new Error("unknown clock: "+clock);
  }
  return phase;
}

/** Exact within-phase ordered equal-pair invariant for any secret bijection. */
function measure(symbols,phase) {
  const counts=Array.from({length:5},()=>new Uint32Array(29));
  const ns=new Uint32Array(5);
  for(let i=0;i<symbols.length;i++) {
    const x=symbols[i],s=phase[i];
    assert(Number.isInteger(x)&&x>=0&&x<29);
    counts[s][x]++;
    ns[s]++;
  }
  let equal=0,pairs=0;
  for(let s=0;s<5;s++) {
    pairs+=ns[s]*(ns[s]-1);
    for(const n of counts[s])equal+=n*(n-1);
  }
  return {equal,pairs,rate:equal/pairs,phaseCounts:Array.from(ns)};
}

function permutation(box) {
  const inverse=new Int16Array(29);
  for(let i=0;i<29;i++)inverse[box[i]]=i;
  return inverse;
}
function plantedControl(phase,native,seedStart) {
  const seedState={value:seedStart>>>0};
  function random32() {
    let x=seedState.value;
    x^=x<<13;x^=x>>>17;x^=x<<5;
    seedState.value=x>>>0;
    return seedState.value;
  }
  const boxes=Array.from({length:5},()=>{
    const box=Array.from({length:29},(_,i)=>i);
    for(let i=28;i>0;i--) {
      const j=random32()%(i+1);
      [box[i],box[j]]=[box[j],box[i]];
    }
    assert.equal(new Set(box).size,29);
    return box;
  });
  const inverse=boxes.map(permutation);
  const encrypted=native.map((x,i)=>boxes[phase[i]][x]);
  const recovered=encrypted.map((x,i)=>inverse[phase[i]][x]);
  assert.deepEqual(recovered,native);
  assert.deepEqual(measure(encrypted,phase),measure(native,phase));
  return {encryptedRunes:encrypted.length,recoveredRunes:recovered.length,
    fiveIndependentSecretBoxes:true,exactRecovery:true,invariantPreserved:true};
}

const controls = [
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([label,file])=>({label,runes:encode(read(file))}));
const latinAlphabet="0123456789ABCDEFGHIJKLMNOPQRS";
const latinSource=read("resources/control/latin-vulgate-gp-wholewords.txt");
const latin=Array.from(latinSource.split(/\r?\n/u)
  .filter(line=>line&&!line.trimStart().startsWith("#")).join(""),
  c=>latinAlphabet.indexOf(c));
assert(latin.every(x=>x>=0&&x<29));
assert.equal(latin.length,204802);
controls.push({label:"Latin Vulgate",runes:latin});
const beowulfData=JSON.parse(read("resources/control/beowulf_oe_gp_profile.json"));
const beowulf=Array.from(beowulfData.positiveControlGpBase29,
  c=>beowulfData.positiveControlAlphabet.indexOf(c));
assert(beowulf.every(x=>x>=0&&x<29));
assert.equal(beowulf.length,C.length);
controls.push({label:"Old English Beowulf",runes:beowulf});

function controlWindows(native,phase,originalRate) {
  let windows=0,min=Infinity,max=-Infinity,atOrBelow=0;
  for(let start=0;start+C.length<=native.length;start+=323) {
    const result=measure(native.slice(start,start+C.length),phase);
    windows++;
    min=Math.min(min,result.rate);
    max=Math.max(max,result.rate);
    if(result.rate<=originalRate)atOrBelow++;
  }
  assert(windows>0);
  assert.equal(atOrBelow,0);
  return {windows,min,max,atOrBelowOriginal:atOrBelow};
}

function fiveClauseMeasure(symbols,lengths) {
  let equal=0,pairs=0,offset=0;
  for(const length of lengths) {
    const counts=new Uint32Array(29);
    for(let i=offset;i<offset+length;i++)counts[symbols[i]]++;
    offset+=length;
    pairs+=length*(length-1);
    for(const n of counts)equal+=n*(n-1);
  }
  assert.equal(offset,symbols.length);
  return {equal,pairs,rate:equal/pairs};
}
function fiveClauseWindows(native,lengths,originalRate) {
  const total=lengths.reduce((a,b)=>a+b,0);
  let windows=0,min=Infinity,max=-Infinity,atOrBelow=0;
  for(let start=0;start+total<=native.length;start+=323) {
    const result=fiveClauseMeasure(native.slice(start,start+total),lengths);
    windows++;
    min=Math.min(min,result.rate);
    max=Math.max(max,result.rate);
    if(result.rate<=originalRate)atOrBelow++;
  }
  assert(windows>0);
  assert.equal(atOrBelow,0);
  return {windows,min,max,atOrBelowOriginal:atOrBelow};
}

function main() {
  const result={hypothesis:"A source-motivated five-state schedule implemented as one fixed secret GP29 permutation per phase",
    sourceMotivation:"five red ordinal clauses, five-dot ornament, and the approximate q=1/5 repeat-survival diagnostic",
    clocks:{},nativeWindowTotal:0};
  const clockNames=["book-global","page-reset","fragment-reset"];
  for(let i=0;i<clockNames.length;i++) {
    const name=clockNames[i],phase=makePhase(name),original=measure(C,phase);
    const nativeControls={};
    for(const control of controls) {
      nativeControls[control.label]=controlWindows(control.runes,phase,original.rate);
      result.nativeWindowTotal+=nativeControls[control.label].windows;
    }
    const plant=plantedControl(phase,controls[1].runes.slice(0,C.length),0x5a1700+i);
    result.clocks[name]={original,nativeControls,positiveControl:plant};
  }
  assert.equal(result.nativeWindowTotal,2335);

  // The five exact source-numbered clauses on p36–38: 553 = 7×79 runes.
  const clauseLengths=[139,91,98,96,129];
  const clauseStart=8805;
  const clauseText=C.slice(clauseStart,clauseStart+553);
  assert.equal(clauseText.length,553);
  assert.equal(clauseLengths.reduce((a,b)=>a+b,0),553);
  const clauseOriginal=fiveClauseMeasure(clauseText,clauseLengths);
  const clauseControls={};
  let clauseWindowTotal=0;
  for(const control of controls) {
    clauseControls[control.label]=fiveClauseWindows(control.runes,clauseLengths,clauseOriginal.rate);
    clauseWindowTotal+=clauseControls[control.label].windows;
  }
  assert.equal(clauseWindowTotal,2526);

  // Five independently secret, clause-specific permutations are reversible.
  const clausePlant=controls[1].runes.slice(0,553);
  const clauseBoxes=Array.from({length:5},(_,i)=>{
    const box=Array.from({length:29},(_,j)=>j);
    let seed=(0x79a553+i)>>>0;
    const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
    for(let j=28;j>0;j--){const k=random()%(j+1);[box[j],box[k]]=[box[k],box[j]];}
    return box;
  });
  const clauseInverse=clauseBoxes.map(permutation);
  let offset=0;
  const clauseCipher=clauseLengths.flatMap((length,clause)=>{
    const out=clausePlant.slice(offset,offset+length).map(x=>clauseBoxes[clause][x]);
    offset+=length;return out;
  });
  offset=0;
  const clauseRecovered=clauseLengths.flatMap((length,clause)=>{
    const out=clauseCipher.slice(offset,offset+length).map(x=>clauseInverse[clause][x]);
    offset+=length;return out;
  });
  assert.deepEqual(clauseRecovered,clausePlant);
  assert.deepEqual(fiveClauseMeasure(clauseCipher,clauseLengths),fiveClauseMeasure(clausePlant,clauseLengths));

  result.fiveClauseSpecific={
    sourceInterval:"unknown-stream global offsets [8805,9358)",
    clauseLengths,original:clauseOriginal,nativeControls:clauseControls,
    positiveControl:{encryptedRunes:clauseCipher.length,recoveredRunes:clauseRecovered.length,
      fiveIndependentSecretBoxes:true,exactRecovery:true,invariantPreserved:true}
  };
  result.interpretation="The original's within-phase collision rate is below every native-GP control for all three natural five-phase clocks and the five source-clause groups. This excludes fixed secret GP29 bijections per state/clause for native-like plaintext. It does not exclude a stochastic no-repeat filter, evolving state, nonlinear mixing, variable-rate coding, or a non-GP intermediate.";
  console.log(JSON.stringify(result,null,2));
}
if(require.main===module)main();
module.exports={makePhase,measure,fiveClauseMeasure,main};
