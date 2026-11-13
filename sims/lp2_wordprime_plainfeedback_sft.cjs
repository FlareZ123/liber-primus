'use strict';

/**
 * GP29 previous-PLAINTEXT-word prime-sum feedback test on every original
 * unknown rune. Word segmentation is continuous across physical page
 * boundaries (2,896 printed words), with 2016 "numbers ... direction" as
 * a speculative motivation, not an authenticated formula.
 *
 * Run: node sims/lp2_wordprime_plainfeedback_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const pageSegments = transcription.split(/\s*%\s*/);

assert.equal(pageSegments.length, 57, 'p50 has no runic text');

/**
 * @param {string} text Original physical-page strings concatenated in order.
 * @returns {number[][]}
 */
function printedWords(text) {
  const normalized = text.replace(/[\s/]/g, '');
  const matches = normalized.match(/\p{Script=Runic}+/gu) || [];
  return matches.map(word => [...word].map(rune => {
    const idx = runeIndex.get(rune);
    assert.notEqual(idx, undefined, 'unknown original rune');
    return idx;
  }));
}

/** @param {number[]} word @returns {number} */
function primeSum(word) {
  return word.reduce((sum, rune) => sum + corpus.prime[rune], 0) % 29;
}

/**
 * Reversible arithmetic given an initial 29-state key. The state for the
 * next word is a function of the decoded plaintext word, never the cipher.
 *
 * @param {number[][]} words
 * @param {number} initialState
 * @returns {number[][]}
 */
function decipher(words, initialState) {
  let state = initialState;
  return words.map(word => {
    const plain = word.map(x => (x - state + 29) % 29);
    state = primeSum(plain);
    return plain;
  });
}

/**
 * @param {number[][]} words
 * @param {number} initialState
 * @returns {number[][]}
 */
function encipher(words, initialState) {
  let state = initialState;
  return words.map(word => {
    const cipher = word.map(x => (x + state) % 29);
    state = primeSum(word);
    return cipher;
  });
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const bins = Array(29).fill(0);
  for (const rune of runes) bins[rune]++;
  return bins.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

const original = printedWords(pageSegments.slice(0, 55).join(''));
assert.equal(original.length, 2896, 'keep cross-page printed words intact');
assert.equal(original.flat().length, 12956);
assert.deepEqual(original.flat(), corpus.pages.filter(page =>
  page.page <= 55).flatMap(page => page.indices));

const solvedP57 = printedWords(pageSegments[56]);
assert.equal(solvedP57.flat().length, 95);
assert.deepEqual(solvedP57.flat(),
  corpus.pages.find(page => page.page === 57).indices);

const plant = encipher(solvedP57, 17);
assert.deepEqual(decipher(plant, 17), solvedP57, 'authentic-text plant');
assert.notDeepEqual(decipher(plant, 18), solvedP57, 'wrong initial seed');
for (const seed of [0, 7, 17, 28]) {
  const decoded = decipher(original, seed);
  assert.deepEqual(encipher(decoded, seed), original,
    'exact whole-original forward replay');
}

let reachable = Array.from({ length: 29 }, (_, i) => i);
let synchronization = -1;
for (let i = 0; i < original.length; i++) {
  const word = original[i];
  reachable = reachable.map(state =>
    primeSum(word.map(x => (x - state + 29) % 29)));
  if (new Set(reachable).size === 1) {
    synchronization = i + 1;
    break;
  }
}
assert.equal(synchronization, 73,
  'all 29 source keys must converge after 73 complete words');
assert.equal(original.slice(0, synchronization).flat().length, 331);

const all = Array.from({ length: 29 }, (_, seed) => {
  const plain = decipher(original, seed).flat();
  return { seed, ioc: ioc(plain), suffix: plain.slice(331) };
});
for (const candidate of all) {
  assert.deepEqual(candidate.suffix, all[0].suffix,
    'every unknown initial key yields the identical entire tail');
  assert.ok(candidate.ioc > 0.0344 && candidate.ioc < 0.0346);
}
assert.ok(ioc(solvedP57.flat()) > 0.06);
const result = {
  original_runes: 12956,
  original_printed_words: 2896,
  initial_seed_count: 29,
  synchronization_after_words: synchronization,
  forced_suffix_rune_offset: 331,
  forced_suffix_length: all[0].suffix.length,
  forced_suffix_ioc: ioc(all[0].suffix),
  original_ioc_min: Math.min(...all.map(x => x.ioc)),
  original_ioc_max: Math.max(...all.map(x => x.ioc)),
  solved_p57_ioc: ioc(solvedP57.flat()),
  plant_exact: true,
  all_original_forward_replays_exact: true,
  recovered_plaintext: false
};
console.log(JSON.stringify(result, null, 2));