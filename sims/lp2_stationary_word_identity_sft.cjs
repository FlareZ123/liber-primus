'use strict';

/**
 * Source-only, read-only word-identity invariant for fixed whole-word ciphers.
 * Run from the repository with Node.js 22:
 *   node sims/lp2_stationary_word_identity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const gp = new Map(corpus.runes.map((glyph, index) => [glyph, index]));

/**
 * Parse original rune words; printed page turns and line wraps are not
 * automatically word breaks, while printed stops and hyphens are.
 * @param {string} source Source-exact rune transcription.
 * @returns {number[][]} Rune-index words.
 */
function parseWords(source) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  for (const glyph of source) {
    const index = gp.get(glyph);
    if (index !== undefined) {
      current.push(index);
    } else if ('-.$§'.includes(glyph) && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/**
 * Exact equality spectrum by word length, invariant under a global injective
 * mapping of complete words of a fixed rune length.
 * @param {number[][]} words Word-index sequences.
 * @returns {Map<number, {n:number, unique:number, pairs:number, maximum:number}>}
 */
function spectrum(words) {
  /** @type {Map<number, Map<string, number>>} */
  const byLength = new Map();
  for (const word of words) {
    let freq = byLength.get(word.length);
    if (!freq) {
      freq = new Map();
      byLength.set(word.length, freq);
    }
    const signature = word.join(',');
    freq.set(signature, 1 + (freq.get(signature) || 0));
  }
  const summary = new Map();
  for (const [length, freq] of byLength) {
    let n = 0;
    let pairs = 0;
    let maximum = 0;
    for (const count of freq.values()) {
      n += count;
      pairs += count * (count - 1) / 2;
      maximum = Math.max(maximum, count);
    }
    summary.set(length, {n, unique:freq.size, pairs, maximum});
  }
  return summary;
}

/**
 * An invertible secret-looking word-local transformation. It is deliberately
 * much more general than a Caesar shift but remains stationary from one
 * occurrence of the same plaintext word to the next.
 * @param {number[]} word GP29 plaintext word.
 * @returns {number[]} Ciphertext word.
 */
function encrypt(word) {
  return word.map((v, position) => (11 * v + 7 + 5 * position) % 29);
}

/** @param {number[]} word Ciphertext word. @returns {number[]} Original word. */
function decrypt(word) {
  return word.map((v, position) =>
    (8 * (((v - 7 - 5 * position) % 29 + 29) % 29)) % 29
  );
}

function longPairs(s) {
  let total = 0;
  for (const [length, data] of s) if (length >= 4) total += data.pairs;
  return total;
}

function main() {
  const lp2 = fs.readFileSync(path.join(
    ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'
  ), 'utf8');
  const lp2Parts = lp2.split('%');
  assert.equal(lp2Parts.length, 57);
  // Runeless original p50 is absent from the transcription. The first 55
  // rune-bearing segments correspond to all physical unknown pages p0–p55.
  const original = parseWords(lp2Parts.slice(0, 55).join(''));
  const flattened = original.flat();
  assert.deepEqual(flattened,
    corpus.pages.slice(0, 56).flatMap(page => page.indices));
  assert.equal(flattened.length, 12956);
  assert.equal(original.length, 2896);

  const observed = spectrum(original);
  const lengths = [83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3];
  const types = [28, 354, 704, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3];
  for (let length = 1; length <= lengths.length; ++length) {
    const s = observed.get(length);
    assert(s);
    assert.equal(s.n, lengths[length - 1]);
    assert.equal(s.unique, types[length - 1]);
    if (length >= 4) assert.equal(s.pairs, 0);
  }
  assert.equal(longPairs(observed), 0);
  assert.equal(original.filter(word => word.length >= 4).length, 1645);

  const lp1 = fs.readFileSync(path.join(
    ROOT, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'
  ), 'utf8').split('%');
  assert.equal(lp1.length, 16);
  // Independently readable first-party clear GP sections, as documented
  // in lp2-first-party-clear-gp-doublet-baseline.md.
  const clearSectionIndices = [3, 8, 9, 10, 11, 14];
  const clearWords = clearSectionIndices.flatMap(i => parseWords(lp1[i]));
  assert.equal(clearWords.length, 231);
  assert.equal(clearWords.flat().length, 1001);
  const clear = spectrum(clearWords);
  assert.equal(longPairs(clear), 50);

  // A fully invertible, unknown position-keyed per-word map preserves *all*
  // the word type classes. The 50 repeated long-word pairs cannot disappear.
  const encryptedPlant = clearWords.map(encrypt);
  const decryptedPlant = encryptedPlant.map(decrypt);
  assert.deepEqual(decryptedPlant, clearWords);
  for (const [length, expected] of clear) {
    assert.deepEqual(spectrum(encryptedPlant).get(length), expected);
  }
  assert.equal(longPairs(spectrum(encryptedPlant)), 50);

  console.log('Original LP2 pp0–55: 12,956 GP runes, 2,896 printed words.');
  console.log('LEN  COUNT  TYPES  EQUAL_PAIRS  IID_GP29_EXPECTED_PAIRS');
  for (const length of [...observed.keys()].sort((a, b) => a - b)) {
    const s = observed.get(length);
    const expected = (s.n * (s.n - 1) / 2) / 29 ** length;
    console.log([length, s.n, s.unique, s.pairs, expected.toFixed(7)]
      .map(String).join('  '));
  }
  console.log('Original LP2 long words (length>=4): 1,645; all unique.');
  console.log('First-party GP clear sections: 231 words, 1,001 runes,'
    + ' 50 identical long-word pairs.');
  console.log('Invertible word-position affine encryption positive:'
    + ' 231/231 round trips, all word-frequency spectra preserved.');
  console.log('Inference: a stationary, word-length-preserving injective'
    + ' whole-word cipher requires the underlying 1,645 plaintext long'
    + ' words to be pairwise distinct. This is a necessary condition,'
    + ' not a recovered plaintext or a blanket impossibility theorem.');
}
main();
