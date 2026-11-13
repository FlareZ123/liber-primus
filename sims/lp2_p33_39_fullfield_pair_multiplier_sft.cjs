'use strict';
/**
 * Original pp33–39: exact GF(29²) pair-multiplier decryptor.
 * Reproduction: node sims/lp2_p33_39_fullfield_pair_multiplier_sft.cjs
 * Source keys: original p3 red quadratic and p50/p39 quotient remainder.
 * No guessed language key, phase-fitting for the source model, or dropped runes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const chapterPages = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
assert.deepEqual(chapterPages.map(p => p.indices.length),
  [214, 261, 271, 238, 228, 228, 240]);
const source = chapterPages.flatMap(p => p.indices);
assert.equal(source.length, 1680);
const mod = x => ((x % 29) + 29) % 29;
/** @typedef {[number,number]} Field */
/** GF29² = GF29[u]/(u²-3u-8), source p3 red triad. 
 * @param {Field} x @param {Field} y @returns {Field} */
const mul = ([a,b],[c,d]) => [mod(a*c+8*b*d), mod(a*d+b*c+3*b*d)];
const generator = /** @type {Field} */ ([19, 13]);
/** @type {Field[]} */
const powers = [[1,0]];
for (let i = 1; i <= 840; i++) {
  powers.push(mul(powers[i-1], generator));
}
assert.deepEqual(powers[840], [1,0]);
assert.deepEqual(powers[30], [11,0]);
assert.equal(new Set(powers.slice(0,840).map(p => p.join(','))).size, 840);
/** @param {number[]} symbols @returns {number} */
function ioc29(symbols) {
  const counts = new Array(29).fill(0);
  for (const x of symbols) counts[x]++;
  return 29*counts.reduce((sum,count) => sum+count*(count-1),0) /
    (symbols.length*(symbols.length-1));
}
/**
 * Decoder for one consecutive pair (a,b) per GF841 key state:
 * P_i = g^(-i-phase)*C_i.
 * @param {number[]} sourcePairs @param {number} phase @returns {number[]}
 */
function decode(sourcePairs, phase) {
  assert.equal(sourcePairs.length, 1680);
  /** @type {number[]} */
  const output = [];
  for (let i = 0; i < 840; i++) {
    const exponent = (840-((phase+i)%840))%840;
    output.push(...mul(
      /** @type {Field} */ ([sourcePairs[2*i],sourcePairs[2*i+1]]),
      powers[exponent]));
  }
  return output;
}
/** @param {number[]} plaintext @param {number} phase @returns {number[]} */
function encrypt(plaintext, phase) {
  assert.equal(plaintext.length, 1680);
  /** @type {number[]} */
  const output = [];
  for (let i = 0; i < 840; i++) {
    output.push(...mul(
      /** @type {Field} */ ([plaintext[2*i],plaintext[2*i+1]]),
      powers[(phase+i)%840]));
  }
  return output;
}
const direct = decode(source,0);
assert.deepEqual(encrypt(direct,0),source);
const scores = Array.from({length:840},(_,phase) =>
  ioc29(decode(source,phase)));
const highest = Math.max(...scores),lowest = Math.min(...scores);
const approximate = (a,b) => assert(Math.abs(a-b)<1e-12, 
  'Numerical mismatch '+a+' vs '+b);
approximate(ioc29(source),0.9964406250886297);
approximate(scores[0],1.0070918063473158);
approximate(highest,1.0113687285515756);
approximate(lowest,0.9909710995774128);
// g^30 = 11 is a nonzero base-field scalar: all GP-symbol frequency
// statistics invariant under any phase shift by 30 (a symbol relabeling).
for (let k = 0; k < 810; k++) approximate(scores[k],scores[k+30]);
assert.equal(scores.filter(s=>s>=1.15).length,0);
// A source-native, independently solved LP2 p57 GP plaintext plant.
// Its repetition supplies 1680 known GP runes; it does not fit a key.
const known = corpus.pages.find(p=>p.page===57).indices;
assert.equal(known.length,95);
const plant = Array.from({length:1680},(_,i)=>known[i%known.length]);
const plantCipher=encrypt(plant,137);
assert.deepEqual(decode(plantCipher,137),plant);
assert(ioc29(plant)>1.8);
assert.deepEqual(encrypt(decode(plantCipher,137),137),plantCipher);
console.log(JSON.stringify({
  status:'PASS',
  source:'original LP2 physical pp33–39, 1680 runes, 840 field pairs',
  sourceKey:'p3 u²=3u+8 and p50/p39 quotient remainder g=19+13u',
  gOrder:840,g30:powers[30],
  directIoC29:scores[0],
  allPhaseRangeIoC29:[lowest,highest],
  allPhaseNativeLikeAbove115:scores.filter(s=>s>=1.15).length,
  distinctPhaseScores:30,
  cipherIoC29:ioc29(source),
  solvedP57RepetitionPlantIoC29:ioc29(plant),
  plantedExactRunes:plant.length,
  recoveredUnknownPlaintext:0
},null,2));
