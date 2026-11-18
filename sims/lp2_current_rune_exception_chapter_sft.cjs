'use strict';

/**
 * Source-exact gate for a lossless 29-symbol differential transport.
 *
 * C_i = C_(i-1) + f_i(P_i) mod29, where f_i is any permutation of GP29
 * with one chapter-stationary zero preimage r: f_i(r)=0.
 * The other 28 outputs may be permuted independently at EVERY position.
 * Consequently, within a physical page, C_i=C_(i-1) iff P_i=r.
 *
 * Run: node sims/lp2_current_rune_exception_chapter_sft.cjs
 * Node.js 22 CommonJS, read-only, no installed dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const wordsFile = read('resources/control/english_wordfreq_textblob.txt');
const controls = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 62492, 61060, 18],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 217106, 215674, 22],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 321327, 319895, 24]
];
const Q = 29;
const gpTokens = source.translit.map((value, i) => ({value, i}))
  .sort((a, b) => b.value.length - a.value.length);

/** @param {number} x @param {number} base @returns {number} */
function mod(x, base) { return (x % base + base) % base; }

/** @param {string} spelling @returns {number[]} */
function nativeWord(spelling) {
  const word = spelling.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const indices = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) {
      indices.push(21);
      i += 3;
      continue;
    }
    if (word.startsWith('IO', i)) {
      indices.push(27);
      i += 2;
      continue;
    }
    const token = gpTokens.find(t => word.startsWith(t.value, i));
    assert.ok(token, 'GP29 tokenizer rejected native word');
    indices.push(token.i);
    i += token.value.length;
  }
  return indices;
}

/** @param {string} text @returns {number[]} */
function nativeText(text) {
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  const result = [];
  for (const word of words) result.push(...nativeWord(word));
  return result;
}

/**
 * Synthetic implementation positive: one known and changing permutation
 * among the other 28 nonzero successor values. This rotor is NOT an
 * asserted historical key; its only purpose is to verify invertibility.
 * @param {number[]} plain
 * @param {number} zeroRune
 * @returns {number[]}
 */
function encrypt(plain, zeroRune) {
  const out = [mod(plain[0] + 17, Q)];
  for (let i = 1; i < plain.length; i++) {
    const z = mod(plain[i] - zeroRune, Q);
    const delta = z === 0 ? 0 : 1 + mod(z - 1 + 13 * i + 7, 28);
    out.push(mod(out[i - 1] + delta, Q));
  }
  return out;
}

/** @param {number[]} cipher @param {number} zeroRune @returns {number[]} */
function decrypt(cipher, zeroRune) {
  const out = [mod(cipher[0] - 17, Q)];
  for (let i = 1; i < cipher.length; i++) {
    const delta = mod(cipher[i] - cipher[i - 1], Q);
    const z = delta === 0 ? 0 : 1 + mod(delta - 1 - 13 * i - 7, 28);
    out.push(mod(z + zeroRune, Q));
  }
  return out;
}

const p27 = source.pages.find(p => p.page === 27).indices.slice(79, 91);
assert.deepEqual(p27, [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]);
const repeats = p27.flatMap((x, i) =>
  i && x === p27[i - 1] ? [i] : []);
assert.deepEqual(repeats, [5, 11]);

// The original 12-rune printed word is assumed to correspond to a whole
// native GP-English word. At positions 5 and 11, the rare zero symbol must
// be the SAME plaintext rune, with no other occurrences at positions 1..11.
const candidateWords = [];
for (const row of wordsFile.matchAll(/^([a-z]+)\s+\d+$/gm)) {
  const word = nativeWord(row[1]);
  if (word.length !== 12 || word[5] !== word[11]) continue;
  if (word.slice(1).some((x, j) =>
    x === word[5] && j !== 4 && j !== 10)) continue;
  candidateWords.push({word: row[1], zeroRune: word[5]});
}
assert.equal(candidateWords.length, 25);
const candidate = [...new Set(candidateWords.map(w => w.zeroRune))]
  .sort((a, b) => a - b);
assert.deepEqual(candidate, [5, 9, 15, 16, 18, 20, 23, 24]);

// A native 12-rune word can genuinely create two disjoint ciphertext
// doublets. This prevents a bogus "impossible in principle" conclusion.
const nativePlant = nativeWord('communication');
assert.equal(nativePlant.length, 12);
assert.equal(nativePlant[5], 9);
assert.equal(nativePlant[11], 9);
const plantedCipher = encrypt(nativePlant, 9);
assert.deepEqual(plantedCipher.flatMap((x, i) =>
  i && x === plantedCipher[i - 1] ? [i] : []), [5, 11]);
assert.deepEqual(decrypt(plantedCipher, 9), nativePlant);
assert.deepEqual(encrypt(decrypt(p27, 9), 9), p27);
const clearP57 = source.pages.find(p => p.page === 57).indices;
assert.equal(clearP57.length, 95);
assert.deepEqual(decrypt(encrypt(clearP57, 9), 9), clearP57);

// This is one source-visible chapter, physical pp27..32 inclusive.
const pages = source.pages.filter(p =>
  p.page >= 27 && p.page <= 32 && p.indices.length);
assert.deepEqual(pages.map(p => p.page), [27, 28, 29, 30, 31, 32]);
const pageStarts = [];
let chapterLength = 0;
for (const page of pages) {
  pageStarts.push(chapterLength);
  chapterLength += page.indices.length;
}
assert.equal(chapterLength, 1433);
assert.deepEqual(pageStarts, [0, 234, 503, 780, 1043, 1312]);
const actual = pages.reduce((sum, p) => sum + p.indices.reduce((a, x, i) =>
  a + Number(i > 0 && x === p.indices[i - 1]), 0), 0);
assert.equal(actual, 13);

/**
 * Every eligible plaintext position must equal the fixed zero rune
 * iff the ciphertext pair repeats. Grant EACH physical page first rune
 * an unconstrained new IV, excluding all six page starts from matching.
 * Enumerate ALL contiguous 1,433-rune native control windows, and all
 * dictionary-compatible zero runes, without fitting other keys.
 * @param {number[]} text
 * @returns {{windows:number,minimumByRune:Record<string,number>,bestCount:number,exactMatches:number}}
 */
function evaluate(text) {
  const windows = text.length - chapterLength + 1;
  assert.ok(windows > 0);
  const counts = new Int32Array(Q);
  for (let i = 0; i < chapterLength; i++) counts[text[i]]++;
  let bestCount = Infinity;
  let exactMatches = 0;
  const minimumByRune = {};
  for (const zeroRune of candidate) minimumByRune[source.translit[zeroRune]] = Infinity;

  for (let start = 0; start < windows; start++) {
    for (const zeroRune of candidate) {
      let count = counts[zeroRune];
      for (const cut of pageStarts) {
        if (text[start + cut] === zeroRune) count--;
      }
      const token = source.translit[zeroRune];
      if (count < minimumByRune[token]) minimumByRune[token] = count;
      if (count < bestCount) bestCount = count;
      if (count === actual) exactMatches++;
    }
    if (start + chapterLength < text.length) {
      counts[text[start]]--;
      counts[text[start + chapterLength]]++;
    }
  }
  return {windows, minimumByRune, bestCount, exactMatches};
}

const output = [];
for (const [name, filename, expectedLength, expectedWindows, expectedMin] of controls) {
  const text = nativeText(read(filename));
  assert.equal(text.length, expectedLength);
  const result = evaluate(text);
  assert.equal(result.windows, expectedWindows);
  assert.equal(result.bestCount, expectedMin);
  assert.equal(result.exactMatches, 0);
  output.push({name, runes: text.length, ...result});
}
assert.equal(output.reduce((sum, c) => sum + c.windows, 0), 596629);
const report = {
  model: 'chapter-stationary plaintext rune r exclusively causes zero ciphertext successor',
  witness: {physicalPage: 27, printedWordOffset: 79, repeats, candidateWords: 25,
    possibleZeroRunes: candidate.map(k => source.translit[k])},
  chapter: {physicalPages: [27,32], runes: chapterLength,
    physicalPageStarts: pageStarts, ciphertextEqualities: actual},
  controls: output,
  syntheticNativeWordDoubletPositive: true,
  clearSolvedPageRoundtripRunes: clearP57.length,
  originalP27ExactCipherRoundtrip: true,
  conclusion: 'No native-English chapter window passes; no creator key or unknown plaintext found.'
};
if (require.main === module) console.log(JSON.stringify(report, null, 2));
module.exports = {nativeWord, nativeText, encrypt, decrypt, evaluate};
