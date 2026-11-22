'use strict';

/**
 * One source-frozen, key-independent p49-table "32 inserted runes" gate.
 * If the intact 138-rune pre-table sentence were also encoded inside the
 * 170-rune post-table sentence with 32 inserted control runes (one per printed
 * table row), then any fixed bijective GP29 substitution must satisfy every
 * two-rune-pattern subsequence test. An unsupported pair is a proof of failure
 * for ALL 29! bijections without guessing a key or language.
 *
 * Run: node sims/lp2_p49_p51_32row_insertion_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages;
assert.equal(corpus.runes.length, 29);
const before = [...pages[48].indices.slice(-72), ...pages[49].indices.slice(0, 66)];
const after = [...pages[51].indices.slice(0, 92), ...pages[52].indices.slice(0, 78)];
assert.equal(before.length, 138);
assert.equal(after.length, 170);
assert.equal(after.length - before.length, 32);

/**
 * Exact subsequence check; stops upon the final required symbol.
 * @param {number[]} required
 * @param {number[]} container
 * @returns {boolean}
 */
function isSubsequence(required, container) {
  let j = 0;
  for (const value of container) {
    if (value === required[j]) j += 1;
    if (j === required.length) return true;
  }
  return required.length === 0;
}

/**
 * For a pair of plaintext symbols x,y, enumerate every injective source-
 * independent candidate target mapping x->u,y->v. A real global GP29
 * permutation has to induce one of these 29*28 pairwise mappings.
 * @param {number[]} source
 * @param {number[]} target
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
function pairSupports(source, target, x, y) {
  const restricted = source.filter(v => v === x || v === y);
  let supports = 0;
  for (let u = 0; u < 29; u++) {
    for (let v = 0; v < 29; v++) {
      if (u === v) continue;
      const mapped = restricted.map(z => z === x ? u : v);
      const available = target.filter(z => z === u || z === v);
      if (isSubsequence(mapped, available)) supports += 1;
    }
  }
  return supports;
}

/** @param {number[]} source @param {number[]} target */
function unsupportedPairs(source, target) {
  const absent = [];
  for (let x=0; x<29; x++) for (let y=x+1; y<29; y++) {
    const support = pairSupports(source,target,x,y);
    if (support === 0) absent.push([x,y]);
  }
  return absent;
}

const original = unsupportedPairs(before, after);
assert.deepEqual(original, [
  [0,1],[0,9],[0,10],[0,19],[0,24],[1,19],[9,19],
  [10,19],[11,19],[19,22],[19,24],[19,27],[22,24]
]);

// Construct a genuine 32-insertion, unknown-bijection plant using unchanged
// 138-rune source and a secret valid affine permutation (mod 29).
const planted = [];
for (let i=0; i<before.length; i++) {
  if (i < 128 && i % 4 === 0) planted.push((i * 11 + 5) % 29);
  planted.push((before[i] * 7 + 3) % 29);
}
assert.equal(planted.length, 170);
assert(isSubsequence(before.map(x => (x*7+3)%29), planted));
assert.deepEqual(unsupportedPairs(before, planted), []);

// Also forbid all 29 fixed Caesar shifts under the stronger exact original
// subsequence requirement, but the pairwise proof already covers all 29!.
const directOffsets = [];
for(let k=0;k<29;k++){
  if(isSubsequence(before.map(x => (x+k)%29), after)) directOffsets.push(k);
}
assert.deepEqual(directOffsets, []);
console.log(JSON.stringify({
  originalSource: 'LP2 physical p48 last72 + p49 first66, after p51 first92 + p52 first78',
  sourceRunes: before.length, destinationRunes: after.length,
  tableRows: 32, unexplainedInsertedRunes: after.length-before.length,
  allInjectiveTwoSymbolCandidatesPerPair: 29*28,
  totalDistinctSourcePairs: 29*28/2,
  unsupportedOriginalPairCount: original.length,
  unsupportedOriginalPairs: original,
  actualAnyGlobalBijectionPossible: false,
  actualAnyShiftPossible: false,
  planted32InsertionsAndHiddenGlobalBijection: true,
  plantedAllPairTestsPass: true,
  status: 'bounded exclusion; no original unknown plaintext or author-selected mapping'
}, null, 2));
