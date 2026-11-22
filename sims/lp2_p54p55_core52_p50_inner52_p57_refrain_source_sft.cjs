'use strict';

/**
 * Original triple-52 literal source inverse:
 *   p57 SHED -> whole-word core52 of p54/p55
 *   p57 SHED -> peel 3 geometric rings from p49–p51 32x8 table,
 *                retaining its original inner 26x2 = 52 values
 *   p56 known GP29 additive direction: P = C - K mod29
 * Windows 11 / Node.js22: node sims/lp2_p54p55_core52_p50_inner52_p57_refrain_source_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const panel = require('../resources/liber-primus/lp2-grid-256.json');
const p54 = corpus.pages.find((p) => p.page === 54).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const source = [...p54.slice(-10), ...p55];
const wordLengths = [11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(wordLengths.reduce((a,b) => a+b,0),86);
assert.equal(source.length,86);
const interior = [];
const exterior = [];
let at = 0;
for (const length of wordLengths) {
  const word = source.slice(at, at + length);
  exterior.push(word[0],word[word.length-1]);
  interior.push(...word.slice(1,-1));
  at += length;
}
assert.equal(interior.length,52);
assert.equal(exterior.length,34);

// In the source's 32-row 8-column orientation, exactly three outer cells
// are peeled from each side. The remaining rectangle is 26 rows x 2 cols.
const ring = [];
ring.push(3*8+3,3*8+4);
for (let r=4;r<=28;r++) ring.push(r*8+4);
ring.push(28*8+3);
for (let r=27;r>=4;r--) ring.push(r*8+3);
assert.equal(ring.length,52);
assert.equal(new Set(ring).size,52);
const key = ring.map((i) => panel.bytes[i] % 29);
/** @param {number[]} values @returns {number[]} */
function subtract(values) { return values.map((v,i) => (v-key[i]+29)%29); }
/** @param {number[]} values @returns {number[]} */
function add(values) { return values.map((v,i) => (v+key[i])%29); }
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  values.forEach(v => { counts[v]++; });
  return counts.reduce((acc,n)=>acc+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {number[]} values @returns {string} */
function printGP(values) { return values.map(i=>corpus.translit[i]).join(''); }
const inverse = subtract(interior);
const sourceRefrain = p57.slice(-52);
assert.ok(printGP(sourceRefrain).startsWith('SHED'));
assert.equal(printGP(sourceRefrain).length>=52,true);
const originalMatches = inverse.filter((x,i)=>x===sourceRefrain[i]).length;
assert.equal(originalMatches,3);
assert.deepEqual(add(inverse),interior);
assert.deepEqual(subtract(add(sourceRefrain)),sourceRefrain);
console.log(JSON.stringify({
  source: 'LP2 physical p54 final10 + p55 all76; 17 original complete words',
  preserved86:source.length,wordShell:exterior.length,wordCore:interior.length,
  gridOriginalIndices:ring,
  gridKeyModulo29:key,
  originalCore:printGP(interior),
  decodedCore:printGP(inverse),decodedCoreIoC:ioc(inverse),
  independentSolvedP57Last52:printGP(sourceRefrain),knownNativeIoC:ioc(sourceRefrain),
  originalP57ExactMatches:originalMatches,
  originalCoreReencryption:'52/52',
  solvedP57SourceNativePlant:'52/52',
  status:'No original prose, no shell inversion, no independently authored all86-rune cipher.'
},null,2));
