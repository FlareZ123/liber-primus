'use strict';
/**
 * All-secret, source-native necessary-condition test for a stationary,
 * invertible first-order GP29 ciphertext-state decoder:
 *
 *    P[i] = perm[previousCipherState][C[i]].
 *
 * Each unknown row is an arbitrary 29-symbol permutation. Thus the total
 * number of E glyphs is at most the sum of the largest observed column
 * count in each predecessor-state row. This eliminates all secret keys
 * without looking at plaintext or optimizing a language score.
 *
 * Three fixed state clocks: book-continuous, page-reset, word-reset.
 * A word/page reset shares one fixed special state; it is not allowed to
 * have an independent unknown alphabet on every word/page.
 *
 * Source: original LP2 pp0-55 GP indices and all 2,896 printed words.
 * Node.js 22; deterministic and read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const { encodeWords, minimumWindow } =
  require('./lp2_difference_allletter_capacity_sft.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const byRune = new Map(corpus.runes.map((r, i) => [r, i]));
const e = corpus.translit.indexOf('E');
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const parsed = parseSharedCorpus();
assert.equal(e, 18);
assert.equal(pages.length, 55);
assert.equal(parsed.words.length, 2896);

const all = pages.flatMap(p => p.indices);
const words = parsed.words.map(word => [...word.runes].map(rune => {
  const value = byRune.get(rune);
  assert(Number.isInteger(value));
  return value;
}));
assert.deepEqual([all.length, words.reduce((s, w) => s + w.length, 0)],
  [12956, 12956]);
assert.deepEqual(all, words.flat());

/**
 * @param {number[][]} pieces
 * @param {boolean} sharedReset
 * @returns {{count:number, bound:number, rows:number[], maxima:number[], table:number[][]}}
 */
function bound(pieces, sharedReset) {
  const table = Array.from({ length: 30 }, () => Array(29).fill(0));
  let count = 0;
  for (const sequence of pieces) {
    for (let j = 0; j < sequence.length; j++) {
      if (j === 0 && !sharedReset) continue;
      const state = j === 0 ? 29 : sequence[j - 1];
      table[state][sequence[j]]++;
      count++;
    }
  }
  const maxima = table.map(row => Math.max(...row));
  const rows = table.map(row => row.reduce((s, v) => s + v, 0));
  assert.equal(rows.reduce((s, v) => s + v, 0), count);
  return { count, bound: maxima.reduce((s, v) => s + v, 0),
    rows, maxima, table };
}

const observed = {
  book: bound([all], false),
  page: bound(pages.map(p => p.indices), true),
  word: bound(words, true)
};
const bookWithInitial = observed.book.bound + 1;
const controls = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt']
].map(([name, file]) => {
  const ref = encodeWords(read(file)).flat();
  const min = minimumWindow(ref, all.length, e);
  assert(min && min.count > 0);
  return { name, nativeRunes: ref.length, minE: min.count,
    minimumWindowOffset: min.offset };
});
const minE = Math.min(...controls.map(x => x.minE));
assert(bookWithInitial < minE);
assert(observed.page.bound < minE);
assert(observed.word.bound < minE);

// Positive control: fixed secret row permutations can genuinely encrypt
// native solved-English GP words and reproduce each rune exactly. A planted
// English stream necessarily has a correspondingly higher E-capacity bound.
/** @returns {number} */
let seed = 0x33012014;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @returns {number[]} */
function permutation() {
  const a = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const secret = Array.from({ length: 30 }, permutation);
const nativeWords = encodeWords(read('resources/control/gibran_prophet_58585.txt'));
/** @type {number[][]} */
const encrypted = [];
/** @type {number[][]} */
const recovered = [];
let size = 0;
for (const word of nativeWords) {
  if (size >= all.length) break;
  let state = 29;
  const c = [], p = [];
  for (const letter of word) {
    const next = secret[state].indexOf(letter);
    assert(next >= 0);
    c.push(next);
    p.push(secret[state][next]);
    state = next;
  }
  encrypted.push(c);
  recovered.push(p);
  size += word.length;
}
assert.deepEqual(recovered, nativeWords.slice(0, encrypted.length));
const plantedOriginalE = recovered.flat().filter(v => v === e).length;
const plantedUpperE = bound(encrypted, true).bound;
assert(plantedUpperE >= plantedOriginalE);

const output = {
  originalRunes: all.length,
  originalWords: words.length,
  originalPages: pages.length,
  reversibleArchitecture: 'P=secretPermutation[previousCipher][currentCipher]',
  allSecretUpperBoundE: {
    bookContinuous: bookWithInitial,
    pageResetSharedIV: observed.page.bound,
    wordResetSharedIV: observed.word.bound
  },
  boundFractions: {
    bookContinuous: bookWithInitial / all.length,
    pageResetSharedIV: observed.page.bound / all.length,
    wordResetSharedIV: observed.word.bound / all.length
  },
  conditionalMaxima: {
    book: observed.book.maxima,
    page: observed.page.maxima,
    word: observed.word.maxima
  },
  minNativeEAcrossMatchedWindows: controls,
  nativeEnglishPlant: {
    runes: recovered.flat().length,
    exactRoundTrip: true,
    plaintextE: plantedOriginalE,
    sourceCipherAllSecretCapacityE: plantedUpperE
  },
  decision: 'Any time-invariant predecessor-cipher-keyed 29x29 row permutations with common book/page/word initialization are incapable of reproducing native GP-English E prevalence. This does not reject word-specific keys, internal plaintext-state or positional/clocked row permutations.'
};
console.log(JSON.stringify(output, null, 2));
