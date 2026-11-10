"use strict";
/**
 * Original-input, author-native flank gate for the existing lossless GP29
 * echo-tableau hypothesis. No new cryptographic mapping is fitted here.
 *
 * The previous 6336-setting grid search chose reverse-column/page/mod/201
 * from sections 0..3 using ordinary Shakespeare GP unigrams. Freeze it.
 * Independently score the nonreserved GP symbols immediately beside each
 * hypothetical EA->ciphertext-repeat on the unseen sections 4..7. The
 * conditionals come exclusively from previously solved Cicada plaintext.
 *
 * A native solved-Cicada plaintext plant, encrypted with an independent
 * fixed source-grid key, must decode and re-encrypt exactly. All 256 phases
 * of the frozen grid-key family supply a finite wrong-key comparison.
 *
 * Run: node sims/native_ea_flank_original_gate.cjs
 * Node.js >=22; no third-party dependencies and no files written.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encrypt,descriptors,decryptPrepared,gridKey} =
  require("./lossless_echo_table_inverse.cjs");
const {samplePlain} = require("./ea_zero_step_reversible.cjs");

const root = path.resolve(__dirname,"..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const dictionary = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const originalWords = transcript.split("%").slice(0,55).join("%")
  .split(/[-.&$§]/u)
  .map(s => [...s].filter(c => runeIndex.has(c)).map(c => runeIndex.get(c)))
  .filter(w => w.length);
assert.equal(originalWords.length,2896);
assert.equal(originalWords.flat().length,12956);
const sourceText = dictionary.split(/\r?\n/u).filter(line => {
  const s = line.trim();
  return s && !s.startsWith("#") && !s.startsWith("[") &&
    !/^[0-9a-f]{25,}$/iu.test(s);
}).join(" ");
const token = new Map(corpus.translit.map((s,i)=>[s,i]));
/** @param {string} word @returns {number[]} */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/gu,"CW")
    .replace(/V/gu,"U").replace(/K/gu,"C").replace(/Z/gu,"S");
  const values = [];
  for (let i=0;i<s.length;) {
    const pair = token.get(s.slice(i,i+2));
    if (pair !== undefined) {values.push(pair);i+=2;}
    else {
      const unit = token.get(s[i]);
      assert.notEqual(unit,undefined,"unknown GP source symbol");
      values.push(unit);
      i++;
    }
  }
  return values;
}
const nativeWords = (sourceText.match(/[A-Za-z]+/gu)||[]).map(encode);
assert.equal(nativeWords.length,796);
const freq = new Float64Array(29).fill(0.5);
const left = new Float64Array(29).fill(0.5);
const right = new Float64Array(29).fill(0.5);
let sourceEA=0;
for (const w of nativeWords) for (let j=0;j<w.length;j++) {
  freq[w[j]]++;
  if (w[j] === 28) {
    sourceEA++;
    if (j>0) left[w[j-1]]++;
    if (j+1<w.length) right[w[j+1]]++;
  }
}
assert.equal(sourceEA,21);
/** @param {Float64Array} array */
function logRelative(array) {
  const whole=array.reduce((a,b)=>a+b,0);
  const total=freq.reduce((a,b)=>a+b,0);
  return Array.from(array,(v,i)=>Math.log(v/whole)-Math.log(freq[i]/total));
}
const priorLeft=logRelative(left),priorRight=logRelative(right);

// Section IDs and physical-page IDs on each actual rune, ignoring all
// separator characters, including the intentionally empty numeric page.
const meta=[];
let section=0,page=0;
for (const ch of transcript.split("%").slice(0,55).join("%")) {
  if (runeIndex.has(ch)) meta.push({section,page});
  else if (ch==="$") section++;
  else if (ch==="%") page++;
}
assert.equal(section,8);
assert.equal(meta.length,12956);
const prepared=descriptors(originalWords);
assert.equal(prepared.filter(d=>d.fixed===28).length,86);
/** @typedef {{markers:number,eligible:number,free:number,score:number,mean:number}} Outcome */
/**
 * @param {ReturnType<typeof descriptors>} desc
 * @param {number[]} decoded
 * @returns {Outcome}
 */
function heldoutFlanks(desc,decoded) {
  let markers=0,eligible=0,free=0,score=0;
  for (let i=1;i<desc.length-1;i++) {
    if (desc[i].fixed!==28)continue;
    markers++;
    if (meta[i].section<4 || meta[i-1].page!==meta[i].page ||
      meta[i+1].page!==meta[i].page)continue;
    eligible++;
    if (desc[i-1].fixed>=0 || desc[i+1].fixed>=0)continue;
    free++;
    score+=priorLeft[decoded[i-1]]+priorRight[decoded[i+1]];
  }
  assert.ok(free>0);
  return {markers,eligible,free,score,mean:score/free};
}
/** @param {number} seed */
function rng(seed) {
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}
const actualMode = {kind:"reverse-column",scope:"page",mapping:"mod",phase:201};
const actualPlain=decryptPrepared(prepared,gridKey(actualMode));
assert.deepEqual(encrypt(actualPlain,gridKey(actualMode)),originalWords);
const original=heldoutFlanks(prepared,actualPlain);
const phases=[];
for(let phase=0;phase<256;phase++) {
  const mode={...actualMode,phase};
  const decoded=decryptPrepared(prepared,gridKey(mode));
  phases.push({phase,mean:heldoutFlanks(prepared,decoded).mean});
}
const frozen=phases[actualMode.phase];
assert.ok(Math.abs(frozen.mean-original.mean)<1e-12);
const rank=1+phases.filter(x=>x.mean>frozen.mean).length;

const nativeSample=samplePlain(rng(0x18ea3301)).flat();
const plantMode={kind:"section-column",scope:"section",mapping:"mod",phase:7};
const plantCipher=encrypt(nativeSample,gridKey(plantMode));
const plantPrepared=descriptors(plantCipher);
const plantPlain=decryptPrepared(plantPrepared,gridKey(plantMode));
assert.deepEqual(plantPlain,nativeSample);
assert.deepEqual(encrypt(plantPlain,gridKey(plantMode)),plantCipher);
const plant=heldoutFlanks(plantPrepared,plantPlain);
const negativeSamePlant=heldoutFlanks(
  plantPrepared,
  decryptPrepared(plantPrepared,gridKey({...plantMode,phase:8}))
);
const sorted=phases.map(x=>x.mean).sort((a,b)=>a-b);
const report={
  classification:"Pre-existing, source-selected GP29 tableau; original heldout EA-flank gate, no recovered unknown LP2 plaintext",
  source:{runes:12956,cipherWords:2896,nativeWords:796,nativeEA:21},
  sourcePrior:"0.5 smoothed 29-bin solved-Cicada left/right GP letters around native EA, divided by native marginal GP unigram probability",
  split:"section index 0..3 frozen key selection; 4..7 author-native flank scoring",
  scope:"Within the same original physical page, conditional cipher EA-site only, with both flank symbols unreserved in candidate GP29 tableau",
  model:"sims/lossless_echo_table_inverse.cjs; source key params frozen before this independent flank scorer",
  key:actualMode,original,
  wrongGridPhase:{
    tested:256,
    frozenPhaseRankByHeldoutFlank:rank,
    fractionPhasesAtLeastFrozen:phases.filter(x=>x.mean>=frozen.mean).length/256,
    min:sorted[0],median:sorted[128],max:sorted[255],
    otherPhasesAtLeastFrozen:phases.filter(x=>x.phase!==201&&x.mean>=frozen.mean).length
  },
  planted:{
    source:"samplePlain from solved Cicada GP vocabulary; source is also used to estimate the flank distribution; generator/implementation positive, not an independent literary provenance test",
    seed:"0x18ea3301",key:plantMode,
    runesExactRoundtrip:nativeSample.length,flanks:plant,
    adjacentWrongPhase:negativeSamePlant
  },
  inference:"The previously selected original 256-byte-grid key has no privileged author-native GP EA-flank score relative to the other grid phases. Both EA assignment and tableau grammar remain speculative."
};
process.stdout.write(JSON.stringify(report,null,2)+"\n");
module.exports={encode,heldoutFlanks,rng,report};
