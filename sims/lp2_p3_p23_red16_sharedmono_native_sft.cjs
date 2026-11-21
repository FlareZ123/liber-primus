'use strict';

/**
 * LP2 original red16 title pair: all-secret shared monoalphabetic codebook.
 *
 * Original marked titles p3 = 2|11|3, p23 = 2|6|3|5. If both use the same
 * arbitrary 29-rune bijection, equality patterns within and across the
 * printed words survive every possible unknown substitution.
 *
 * Test the most constraining source words (p3 middle11, p23 second6) with
 * the complete pinned native project control lexicon, without choosing a key.
 * A planted pair with the SAME secret bijection must pass.
 *
 * Run from any working directory:
 *   node sims/lp2_p3_p23_red16_sharedmono_native_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} pathPart */
const read = pathPart => fs.readFileSync(path.join(ROOT, pathPart), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const text = read('resources/liber-primus/lp2-transcription.txt');
const Q = 29;
const validRunes = new Set(c.runes);
const physical = text.split(/\r?\n%\r?\n/);
const titleLengths = p => physical[p].split('.')[0]
  .split('-').map(word => [...word].filter(ch => validRunes.has(ch)).length)
  .filter(Boolean);
assert.deepEqual(titleLengths(3), [2, 11, 3]);
assert.deepEqual(titleLengths(23), [2, 6, 3, 5]);
const title3 = c.pages[3].indices.slice(0, 16);
const title23 = c.pages[23].indices.slice(0, 16);
assert.equal(c.pages[3].indices.length, 217);
assert.equal(c.pages[23].indices.length, 213);
assert.deepEqual(title3, [20,11,12,8,21,5,2,16,25,11,16,14,8,16,1,22]);
assert.deepEqual(title23, [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
const middle11 = title3.slice(2, 13);
const second6 = title23.slice(2, 8);
const alphabet = c.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} input @returns {number[] | null} */
function gp(input) {
  const norm = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < norm.length;) {
    const token = alphabet.find(x => norm.startsWith(x.s, i));
    if (!token) return null;
    result.push(token.i);
    i += token.s.length;
  }
  return result;
}
const wordCounts = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/)) {
  const parsed = /^([a-z]+) (\d+)$/.exec(line);
  if (parsed) wordCounts.set(parsed[1], Number(parsed[2]));
}
for (const name of [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
]) {
  for (const word of read(name).toLowerCase().match(/[a-z]{2,}/g) || []) {
    if (!wordCounts.has(word)) wordCounts.set(word, 1);
  }
}
/** @typedef {{word:string,count:number,indices:number[]}} Word */
/** @type {Word[]} */
const words = [];
for (const [word, count] of wordCounts) {
  const indices = gp(word);
  if (indices) words.push({word, count, indices});
}
assert.equal(words.length, 32190);
/** @param {number[]} xs */
function pattern(xs) {
  const order = new Map();
  return xs.map(i => {
    if (!order.has(i)) order.set(i, order.size);
    return order.get(i);
  }).join(',');
}
/** @param {number[]} a @param {number[]} b */
function samePattern(a, b) {
  return a.length === b.length && pattern(a) === pattern(b);
}
/**
 * Returns true only if both cipher words can be enciphered with the SAME
 * arbitrary one-to-one substitution map from one set of plaintext words.
 *
 * @param {number[]} cipherA @param {number[]} plainA
 * @param {number[]} cipherB @param {number[]} plainB
 * @returns {boolean}
 */
function codebookCompatible(cipherA, plainA, cipherB, plainB) {
  if (cipherA.length !== plainA.length || cipherB.length !== plainB.length) {
    return false;
  }
  const forward = new Map();
  const reverse = new Map();
  const cs = cipherA.concat(cipherB), ps = plainA.concat(plainB);
  for (let i = 0; i < cs.length; i++) {
    const ci = cs[i], pi = ps[i];
    if (forward.has(ci) && forward.get(ci) !== pi) return false;
    if (reverse.has(pi) && reverse.get(pi) !== ci) return false;
    forward.set(ci, pi);
    reverse.set(pi, ci);
  }
  return true;
}
const candidates11 = words.filter(w => w.indices.length === middle11.length &&
  samePattern(middle11, w.indices));
const candidates6 = words.filter(w => w.indices.length === second6.length &&
  samePattern(second6, w.indices));
assert.equal(candidates11.length, 1);
assert.equal(candidates11[0].word, 'descriptive');
assert.equal(candidates6.length, 143);
const pairs = candidates11.flatMap(a =>
  candidates6.filter(b => codebookCompatible(
    middle11, a.indices, second6, b.indices))
    .map(b => [a.word, b.word]));
assert.deepEqual(pairs, []);

// A different copy of the exact secret monoalphabetic permutation is used for
// both planted words. This checks key identity and the key-independent join.
const key = Array.from({length:Q}, (_, p) => (7 * p + 3) % Q);
assert.equal(new Set(key).size, Q);
const plantedPlain11 = gp('descriptive'), plantedPlain6 = gp('former');
assert.equal(plantedPlain11.length, 11);
assert.equal(plantedPlain6.length, 6);
const syntheticA = plantedPlain11.map(p => key[p]);
const syntheticB = plantedPlain6.map(p => key[p]);
assert(samePattern(syntheticA, plantedPlain11));
assert(samePattern(syntheticB, plantedPlain6));
assert(codebookCompatible(syntheticA, plantedPlain11,
  syntheticB, plantedPlain6));
// An independently chosen key on word B should contradict the shared map.
const wrongB = plantedPlain6.map(p => (key[p] + 1) % Q);
assert(!codebookCompatible(syntheticA, plantedPlain11,
  wrongB, plantedPlain6));

console.log(JSON.stringify({
  source: 'untouched original LP2 red headings p3/p23',
  physicalWordLayouts: [[2,11,3], [2,6,3,5]],
  testedVocabularyWords: words.length,
  p3Middle11Pattern: pattern(middle11),
  p3Middle11NativeCandidates: candidates11.map(w => w.word),
  p23Second6NativeCandidates: candidates6.length,
  compatibleSharedAlphabetWordPairs: pairs.length,
  full29RuneSecretCodebookPositive: true,
  wrongCodebookNegative: true,
  decision: 'An unchanged all-secret monoalphabetic 29-rune codebook cannot map both marked headings to lexicon-native middle words.'
}, null, 2));
