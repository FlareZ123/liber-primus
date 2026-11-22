"use strict";

/**
 * Source-constrained all-secret gate for the historical 2013 BASE29/DH
 * quadratic factors and nine physical LP2 sections.
 *
 * The factor quotient has 252 slots = 9 sections x 28 GP ranks.
 * Grant a completely arbitrary secret 29-symbol permutation independently
 * at EACH of those 252 public states. Invert the predecessor-excluding
 * 28-rank ciphertext channel, assigning every repeated rune the 29th
 * symbol. Within-state equal pairs survive ANY such secret permutation.
 * Compare the original equality invariant with independent native-language
 * GP windows and an exactly re-encrypted positive control.
 *
 * Run: node sims/base29_2013_252phase_allsecret_register_sft.cjs
 * Node 22 / CommonJS; no third-party packages, network, or writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encode} = require("./grid_keyskip_viterbi.cjs");

const ROOT = path.resolve(__dirname,"..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT,file),"utf8");
/** @param {string} file @returns {any} */
const json = file => JSON.parse(read(file));
const grid = json("resources/liber-primus/lp2-grid-256.json").bytes;
const pages = json("resources/liber-primus/lp2-corpus.json").pages;
const original = pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(grid.length,256);
assert.equal(original.length,12956);

/** @param {number} n @returns {number} */
const mod29 = n => (n%29+29)%29;
/**
 * Fixed-width GF29 long division, descending source coefficients.
 * @param {number[]} input
 * @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(input,divisor) {
  const residue = input.map(mod29);
  const quotient = [];
  const inverse = Array.from({length:28},(_,i)=>i+1)
    .find(x=>mod29(x*divisor[0])===1);
  assert.notEqual(inverse,undefined);
  for(let i=0;i<=input.length-divisor.length;i++) {
    const coefficient=mod29(residue[i]*inverse);
    quotient.push(coefficient);
    for(let j=0;j<divisor.length;j++)
      residue[i+j]=mod29(residue[i+j]-coefficient*divisor[j]);
  }
  return {quotient,remainder:residue.slice(quotient.length)};
}

// 2013 BASE29 3301 -> 3QO gives ascending [3,26,24].
// 2013 DH 23 example and p39 red triad give ascending [27,5,15].
const first=divide(grid,[24,26,3]);
assert.deepEqual(first.remainder,[0,0]);
const second=divide(first.quotient,[15,5,27]);
assert.deepEqual(second.remainder,[0,0]);
assert.equal(second.quotient.length,252);
const factorRows=Array.from({length:9},(_,s)=>
  second.quotient.slice(s*28,(s+1)*28));
assert.deepEqual(factorRows.map(a=>new Set(a).size),
  [16,19,21,16,19,16,18,17,22]);

const lengths={
  nine:[729,1145,1738,1894,1021,1433,91,1589,3316],
  eightP32:[729,1145,1738,1894,1021,1433,1680,3316],
  eightP33:[729,1145,1738,1894,1021,1524,1589,3316]
};
/**
 * @param {number[]} sizes
 * @returns {Uint16Array}
 */
function phases(sizes) {
  const out = new Uint16Array(original.length);
  let at=0;
  sizes.forEach((n,s)=>{
    for(let j=0;j<n;j++)out[at++]=s*28+j%28;
  });
  assert.equal(at,original.length);
  return out;
}
/**
 * Rank among the 28 successor runes excluding the previous ciphertext.
 * Repetition becomes explicit 29th code 28, losslessly.
 * Reset predecessor to GP index28 at every physical section start.
 * @param {number[]} c
 * @param {number[]} sizes
 * @returns {number[]}
 */
function toRank(c,sizes) {
  assert.equal(c.length,original.length);
  const out=[];
  let at=0;
  for(const n of sizes) {
    let prev=28;
    for(let j=0;j<n;j++) {
      const x=c[at++];
      out.push(x===prev?28:x>prev?x-1:x);
      prev=x;
    }
  }
  assert.equal(at,c.length);
  return out;
}
/**
 * Re-encrypt a full 29-symbol rank stream, including every repeat marker.
 * @param {number[]} ranks
 * @param {number[]} sizes
 * @returns {number[]}
 */
function fromRank(ranks,sizes) {
  const out=[];
  let at=0;
  for(const n of sizes) {
    let prev=28;
    for(let j=0;j<n;j++) {
      const r=ranks[at++];
      assert(Number.isInteger(r)&&r>=0&&r<29);
      const c=r===28?prev:r<prev?r:r+1;
      out.push(c);
      prev=c;
    }
  }
  assert.equal(at,ranks.length);
  return out;
}
/**
 * Source-phase equality is invariant under any independent secret
 * bijection from the 29 ranks to the 29 GP plaintext symbols per phase.
 * @param {number[]} symbols
 * @param {Uint16Array} phase
 * @param {number} states
 * @returns {{equal:number,pairs:number,rate:number}}
 */
function measure(symbols,phase,states) {
  assert.equal(symbols.length,phase.length);
  const frequency=Array.from({length:states},()=>new Uint16Array(29));
  const counts=new Uint16Array(states);
  for(let i=0;i<symbols.length;i++) {
    const x=symbols[i],s=phase[i];
    assert(Number.isInteger(x)&&x>=0&&x<29);
    frequency[s][x]++;
    counts[s]++;
  }
  let equal=0,pairs=0;
  for(let s=0;s<states;s++) {
    pairs+=counts[s]*(counts[s]-1);
    for(const n of frequency[s])equal+=n*(n-1);
  }
  return {equal,pairs,rate:equal/pairs};
}

const controls=[
  ["Gibran",encode(read("resources/control/gibran_prophet_58585.txt"))],
  ["Shakespeare",encode(read("resources/control/shakespeare_first300k.txt"))],
  ["Emerson",encode(read("resources/control/emerson_essays_2944.txt"))],
  ["Latin",Array.from(
    read("resources/control/latin-vulgate-gp-wholewords.txt")
      .split(/\r?\n/u).filter(line=>line&&
        !line.trimStart().startsWith("#")).join(""),
    c=>"0123456789ABCDEFGHIJKLMNOPQRS".indexOf(c))],
  ["Beowulf",(()=>{const source=
    json("resources/control/beowulf_oe_gp_profile.json");
    return Array.from(source.positiveControlGpBase29,
      c=>source.positiveControlAlphabet.indexOf(c));})()]
];
const summary={};
let totalControlWindows=0;
for(const [name,sizes] of Object.entries(lengths)) {
  const phase=phases(sizes),states=sizes.length*28;
  const rank=toRank(original,sizes);
  assert.deepEqual(fromRank(rank,sizes),original);
  const observed=measure(rank,phase,states);
  const native=[];
  for(const [label,data] of controls) {
    assert(data.length>=original.length);
    let minimum=Infinity,maximum=0,windows=0,atOrBelow=0;
    for(let start=0;start+original.length<=data.length;start+=323) {
      const result=measure(
        data.slice(start,start+original.length),phase,states);
      minimum=Math.min(minimum,result.rate);
      maximum=Math.max(maximum,result.rate);
      atOrBelow+=(result.rate<=observed.rate);
      windows++;
    }
    assert(windows>0);
    assert.equal(atOrBelow,0,"Original not sufficiently below all native controls");
    native.push({label,windows,minimum,maximum,atOrBelow});
    if(name==="nine")totalControlWindows+=windows;
  }
  summary[name]={sections:sizes.length,states,
    repeatSymbols:rank.filter(x=>x===28).length,observed,native};
}

assert.equal(summary.nine.repeatSymbols,86);
assert.deepEqual(summary.nine.observed,
  {equal:31384,pairs:882632,rate:31384/882632});
assert.equal(summary.nine.native.find(x=>x.label==="Shakespeare").windows,632);
assert.equal(totalControlWindows,2335);

// Independent secret maps, one for every (section,clock) phase.
// The synthetic plant demonstrates that inverse, encryption, and equality
// measurement recover genuine native GP text under an arbitrary secret key.
let seed=0x33013a29;
/** @returns {number} */
function random32() {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const phase=phases(lengths.nine);
const boxes=Array.from({length:252},()=>{
  const permutation=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--) {
    const j=random32()%(i+1);
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  assert.equal(new Set(permutation).size,29);
  return permutation;
});
const inverse=boxes.map(p=>{
  const back=new Uint8Array(29);
  for(let i=0;i<29;i++)back[p[i]]=i;
  return back;
});
const plaintext=controls.find(x=>x[0]==="Shakespeare")[1]
  .slice(-original.length);
const syntheticRank=plaintext.map((x,i)=>inverse[phase[i]][x]);
const encrypted=fromRank(syntheticRank,lengths.nine);
const actualRank=toRank(encrypted,lengths.nine);
assert.deepEqual(actualRank,syntheticRank);
const recovered=actualRank.map((r,i)=>boxes[phase[i]][r]);
assert.deepEqual(recovered,plaintext);
assert.deepEqual(fromRank(
  recovered.map((p,i)=>inverse[phase[i]][p]),lengths.nine),encrypted);
assert.deepEqual(measure(actualRank,phase,252),
  measure(plaintext,phase,252));

console.log(JSON.stringify({
  finding:"All-secret phase-local 29-way output maps on repeat-transparent 28-rank original ciphertext cannot yield native-like GP plaintext",
  factorSource:"2013 BASE29 3301 -> 3QO + 2013 DH 23 example + p39",
  quotientSlots:second.quotient.length,rows:factorRows.length,
  distinctPerRow:factorRows.map(a=>new Set(a).size),
  fullOriginalRunes:original.length,
  originalPhysicalSectionAlternatives:summary,
  controlWindowCount:totalControlWindows,
  syntheticNativeExactRecovery:recovered.length,
  syntheticCiphertextDoublets:actualRank.filter(x=>x===28).length,
  caveat:"Only fixed source-public (section,phase) output bijections after predecessor exclusion; feedback, hidden evolving state and non-GP plaintext are not excluded",
  sourceEvidence:"resources/liber-primus/lp2-corpus.json and lp2-grid-256.json"
},null,2));
