'use strict';
/**
 * LP2 p32 (121 rune) inset square versus p55 (76 rune) shared-text gate.
 * Node.js 22 / CommonJS, single runnable file, original GP29 corpus only.
 *
 * A fixed but arbitrary per-page alphabet permutation and arbitrary cell order
 * preserve count multiplicities. Removing source cells cannot increase any
 * source symbol count. Test every possible way to remove 5 or 6 cells at once
 * using exact histogram-dominance bounds, without enumerating combinations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const p32 = corpus.pages[32].indices;
const p55 = corpus.pages[55].indices;
const p57 = corpus.pages[57].indices;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
const inset = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) inset.push(p32[11 * row + col]);
}
assert.equal(inset.length, 81);
/** @param {number[]} sequence @returns {number[]} */
function counts(sequence) {
  const histogram = Array(29).fill(0);
  for (const symbol of sequence) {
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    histogram[symbol]++;
  }
  return histogram;
}
/** @param {number[]} sequence @returns {number} */
function equalPairs(sequence) {
  return counts(sequence).reduce((sum, n) => sum + n * (n - 1) / 2, 0);
}
/** @param {number[]} sequence @param {number} floor @returns {number} */
function abundantSymbols(sequence, floor) {
  return counts(sequence).filter(c => c >= floor).length;
}
/**
 * Exact alphabet-independent frequency feasibility of a sub-multiset:
 * under any fixed source/target alphabet permutations and arbitrary
 * reordering, a target is feasible only if each ranked target count can
 * be matched to a distinct source count at least as large.
 * @param {number[]} source
 * @param {number[]} target
 * @returns {boolean}
 */
function multisetPossible(source, target) {
  if (target.length > source.length) return false;
  const a = counts(source).sort((x, y) => y - x);
  const b = counts(target).sort((x, y) => y - x);
  return b.every((n, i) => n <= a[i]);
}
const p55Whole = p55;
const p55WithoutCarriedRune = p55.slice(1);
assert.equal(p55[0], 21);
assert.equal(p55WithoutCarriedRune.length, 75);
assert.equal(equalPairs(inset), 107);
assert.equal(equalPairs(p55Whole), 108);
assert.equal(equalPairs(p55WithoutCarriedRune), 107);
assert.equal(abundantSymbols(inset, 5), 3);
assert.equal(abundantSymbols(p55Whole, 5), 7);
assert.equal(abundantSymbols(p55WithoutCarriedRune, 5), 7);
assert(!multisetPossible(inset, p55Whole));
assert(!multisetPossible(inset, p55WithoutCarriedRune));
// Source-native positive controls: plant the first 76 or 75 genuinely clear
// p57 runes into an 81-symbol synthetic square, with five/six arbitrary fillers.
// Use a nontrivial bijective alphabet relabeling to check all-secret invariance.
for (const n of [76, 75]) {
  const knownClear = p57.slice(0, n);
  const affineCipher = knownClear.map(v => (7 * v + 13) % 29);
  const source = [...affineCipher, ...Array.from(
    { length: 81 - n }, (_, i) => (i * 11 + 3) % 29)];
  assert.equal(source.length, 81);
  assert(multisetPossible(source, knownClear));
  assert(source.length - knownClear.length === 81 - n);
}
console.log(JSON.stringify({
  research: 'Original p32 inset versus p55 source-linked same-message model',
  source: 'resources/liber-primus/lp2-corpus.json',
  p32Runes: p32.length, p32InteriorRunes: inset.length,
  removedOuterRing: p32.length - inset.length,
  p55Runes: p55.length, p55CarriedRune: p55[0],
  insetEqualPairs: equalPairs(inset),
  fullP55EqualPairs: equalPairs(p55Whole),
  tailP55EqualPairs: equalPairs(p55WithoutCarriedRune),
  insetSymbolsOccurringAtLeastFiveTimes: abundantSymbols(inset, 5),
  fullP55SymbolsOccurringAtLeastFiveTimes: abundantSymbols(p55Whole, 5),
  tailP55SymbolsOccurringAtLeastFiveTimes:
    abundantSymbols(p55WithoutCarriedRune, 5),
  matchingUnderAnyDeletionsPermutationAndRelabeling: false,
  historicalCipherOrPlaintextRecovered: false,
  positives: '2/2 authentic p57-derived GP29 planted cases admitted'
}, null, 2));
