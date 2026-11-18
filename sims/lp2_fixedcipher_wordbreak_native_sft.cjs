'use strict';

/**
 * Independent English-register control for an original-cipher word-break test.
 *
 * Node 22 CommonJS:
 *   node sims/lp2_fixedcipher_wordbreak_native_sft.cjs
 *
 * Sample three independently sourced GP29-English word pools exactly matched
 * to all 2,896 original LP2 printed word lengths. Keep whole-book length slots
 * and physical page/carry geometry fixed. For each genuine-language plant,
 * compare within-word fifth-back returns with 80 page-local permutations
 * of the very same whole-book's printed lengths, never changing its rune tape.
 *
 * This is an exploratory language/format control for the observed original
 * fixed-cipher surplus 104 - 80.3507 = 23.6493, not a claimed decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const RUNIC = /[\u16A0-\u16FF]/u;
const source = read('resources/lp2-transcription.txt').split('%')
  .slice(0, 55).join('%');
/** @type {Array<{start:number,length:number,startPage:number,endPage:number}>} */
const words = [];
let page = 0;
let n = 0;
let start = -1;
let startPage = 0;
let endPage = 0;
function finish() {
  if (start < 0) return;
  words.push({start, length: n - start, startPage, endPage});
  start = -1;
}
for (const c of source) {
  if (RUNIC.test(c)) {
    if (start < 0) {
      start = n;
      startPage = page;
    }
    n++;
    endPage = page;
  } else if (c === '%') {
    page++;
  } else if (c === '/' || /\s/u.test(c)) {
    // Printed line wrap does not delimit a word.
  } else {
    finish();
  }
}
finish();
assert.equal(n, 12956);
assert.equal(words.length, 2896);
const groups = Array.from({length: 55}, (_, p) =>
  words.filter(w => w.startPage === p && w.endPage === p));
const carried = words.filter(w => w.startPage !== w.endPage);
assert.equal(carried.length, 32);

const corpora = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const pools = corpora.map(([name, f]) => {
  const byLength = Array.from({length: 15}, () => []);
  for (const token of read(f).match(/[A-Za-z]+/g) || []) {
    const symbols = encodeSourceNativeGP(token);
    if (symbols.length <= 14) byLength[symbols.length].push(symbols);
  }
  for (const length of new Set(words.map(w => w.length))) {
    assert(byLength[length].length, name + ' missing GP length ' + length);
  }
  return byLength;
});

const SEED = 0x13303301;
const BOOKS = 200;
const NULL_PER_BOOK = 80;
const ORIGINAL_SURPLUS = 104 - 80.3507;
let state = SEED;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {number[][]} pool @returns {number[]} */
function book(pool) {
  const runes = new Array(n);
  for (const w of words) {
    const samples = pool[w.length];
    const selected = samples[random() % samples.length];
    for (let j = 0; j < w.length; j++) runes[w.start + j] = selected[j];
  }
  assert(runes.every(x => Number.isInteger(x) && x >= 0 && x < 29));
  return runes;
}
/** @param {number[]} runes @returns {number[]} */
function prefixEqualFive(runes) {
  const sum = new Array(runes.length + 1).fill(0);
  for (let i = 0; i < runes.length; i++) {
    sum[i + 1] = sum[i] + (i >= 5 && runes[i] === runes[i - 5] ? 1 : 0);
  }
  return sum;
}
/** @param {number[]} pref @param {number} start @param {number} length */
function score(pref, start, length) {
  return length > 5 ? pref[start + length] - pref[start + 5] : 0;
}
/** @param {number[][]} pool */
function test(pool) {
  let originalSum = 0;
  let shuffledSum = 0;
  let deltaSum = 0;
  let deltaSquaredSum = 0;
  let minDelta = Infinity;
  let maxDelta = -Infinity;
  let atLeastOriginal = 0;
  for (let b = 0; b < BOOKS; b++) {
    const pref = prefixEqualFive(book(pool));
    const observed = words.reduce((v, w) =>
      v + score(pref, w.start, w.length), 0);
    const heldCarried = carried.reduce((v, w) =>
      v + score(pref, w.start, w.length), 0);
    let shuffledTotal = 0;
    for (let t = 0; t < NULL_PER_BOOK; t++) {
      let trial = heldCarried;
      for (const pageWords of groups) {
        if (!pageWords.length) continue;
        const lengths = pageWords.map(w => w.length);
        for (let i = lengths.length - 1; i > 0; i--) {
          const j = random() % (i + 1);
          [lengths[i], lengths[j]] = [lengths[j], lengths[i]];
        }
        let offset = pageWords[0].start;
        for (const length of lengths) {
          trial += score(pref, offset, length);
          offset += length;
        }
      }
      shuffledTotal += trial;
    }
    const expected = shuffledTotal / NULL_PER_BOOK;
    const delta = observed - expected;
    originalSum += observed;
    shuffledSum += expected;
    deltaSum += delta;
    deltaSquaredSum += delta * delta;
    minDelta = Math.min(minDelta, delta);
    maxDelta = Math.max(maxDelta, delta);
    if (delta >= ORIGINAL_SURPLUS) atLeastOriginal++;
  }
  const mean = deltaSum / BOOKS;
  return {
    books: BOOKS, nullPerBook: NULL_PER_BOOK,
    originalMean: originalSum / BOOKS,
    shuffledMean: shuffledSum / BOOKS,
    excessMean: mean,
    excessSd: Math.sqrt(deltaSquaredSum / BOOKS - mean * mean),
    minimumExcess: minDelta, maximumExcess: maxDelta,
    booksAtLeastLP2Observed: atLeastOriginal,
    addOneTail: (atLeastOriginal + 1) / (BOOKS + 1)
  };
}
const results = corpora.map(([name], i) => ({name, ...test(pools[i])}));
assert.deepEqual(results.map(x => x.booksAtLeastLP2Observed), [1, 1, 2]);
console.log(JSON.stringify({
  originalLP2WordbreakSurplus: ORIGINAL_SURPLUS, seed: SEED,
  sourceRunes: n, sourceWords: words.length, crossPageWords: carried.length,
  results,
  interpretation: 'Native GP English control, no unknown LP2 decryption'
}, null, 2));
