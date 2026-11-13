'use strict';

/**
 * Source-bounded GP-prime word-sum / 32x8 printed-grid cipher gate.
 * Frozen nonsecret mechanism; explicit 2014 base60 assumption, modulo GP29.
 * No original unknown LP2 plaintext or key is recovered.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const source = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8')).byte_rows;
const sections = source.split(/%\s*\r?\n/);
assert.equal(sections.length, 57); // The physical p50 grid has no rune text.
assert.equal(grid.length, 32);
for (const row of grid) assert.equal(row.length, 8);
assert.deepEqual(grid[13], [122, 63, 31, 218, 14, 184, 32, 115]);
assert.deepEqual(grid[31], [113, 158, 172, 230, 180, 36, 189, 80]);

const runeMap = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const mod29 = n => ((n % 29) + 29) % 29;

/**
 * Parse 2014-printed words; spaces, slashes, % are physical page/line
 * separators and do not end the current word. Punctuation ends a word.
 * @param {string} transcription - One or more print pages.
 * @returns {number[][]} Rune-token words.
 */
function sourceWords(transcription) {
  const words = [];
  let active = [];
  for (const char of Array.from(transcription.replace(/\s/g, '').replaceAll('/', '').replaceAll('%', ''))) {
    const value = runeMap.get(char);
    if (value !== undefined) active.push(value);
    else if (active.length) { words.push(active); active = []; }
  }
  if (active.length) words.push(active);
  return words;
}

/** @param {number[]} word - Native GP indices. @returns {number} */
const sumPrimes = word => word.reduce((sum, rune) => sum + corpus.prime[rune], 0);
/** @param {number[]} symbols - GP indices. @returns {number} */
function ioc(symbols) {
  const freqs = Array(29).fill(0);
  for (const v of symbols) freqs[v] += 1;
  return freqs.reduce((sum, f) => sum + f * (f - 1), 0) / (symbols.length * (symbols.length - 1));
}

/**
 * Invert one possible chosen row for a signed mod29 grid-stream cipher.
 * cipherSign = +1 for C=P+K, -1 for C=P-K.
 * @param {number[]} cipher
 * @param {number} row
 * @param {number} cipherSign
 * @returns {number[]}
 */
function invert(cipher, row, cipherSign) {
  return cipher.map((c, j) => mod29(c - cipherSign * grid[row][j % 8]));
}

/**
 * Every possible row consistent with the decoded word's own GP prime sum.
 * @param {number[]} cipher
 * @param {number} cipherSign
 * @returns {number[]}
 */
function selfIndexedRows(cipher, cipherSign) {
  const rows = [];
  for (let row = 0; row < 32; row += 1) {
    if (sumPrimes(invert(cipher, row, cipherSign)) % 32 === row) rows.push(row);
  }
  return rows;
}

const unknownText = sections.slice(0, 55).join('');
const words = sourceWords(unknownText);
const original = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(words.flat(), original);

const direct = [];
const selfIndexed = [];
for (const sign of [1, -1]) {
  const decoded = words.flatMap(word => invert(word, sumPrimes(word) % 32, sign));
  const rowCounts = Array(8).fill(0);
  const zeros = [];
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const n = selfIndexedRows(words[wordIndex], sign).length;
    assert(n < 8);
    rowCounts[n] += 1;
    if (n === 0) zeros.push(wordIndex);
  }
  direct.push({ cipherSign: sign, originalIoC: ioc(original), decodedIoC: ioc(decoded) });
  selfIndexed.push({ cipherSign: sign, noConsistentRows: zeros.length,
    oneConsistentRow: rowCounts[1], multipleConsistentRows: rowCounts.slice(2).reduce((a, b) => a + b, 0),
    firstImpossibleWordIndices: zeros.slice(0, 6), histogram: rowCounts });
}
assert(Math.abs(direct[0].decodedIoC - 0.034502193631290014) < 1e-12);
assert(Math.abs(direct[1].decodedIoC - 0.03449727242363757) < 1e-12);
assert.equal(selfIndexed[0].noConsistentRows, 1066);
assert.equal(selfIndexed[1].noConsistentRows, 1020);

const solvedWords = sourceWords(sections[56]); // Original physical p57 PARABLE, GP plaintext.
assert.deepEqual(solvedWords.flat(), corpus.pages[57].indices);
assert.equal(solvedWords.flat().length, 95);

const plants = [];
for (const sign of [1, -1]) {
  let exactWords = 0;
  let exactRunes = 0;
  for (const p of solvedWords) {
    const trueRow = sumPrimes(p) % 32;
    const ciphertext = p.map((r, i) => mod29(r + sign * grid[trueRow][i % 8]));
    const rows = selfIndexedRows(ciphertext, sign);
    assert(rows.includes(trueRow));
    assert.deepEqual(invert(ciphertext, trueRow, sign), p);
    exactWords += 1;
    exactRunes += p.length;
  }
  plants.push({ cipherSign: sign, recoveredTruePlaintextWords: exactWords,
    recoveredTruePlaintextRunes: exactRunes });
  assert.equal(exactRunes, 95);
}

console.log(JSON.stringify({
  classification: 'NEGATIVE SOURCE-CONDITIONAL GRID-CIPHER GATE; NO LP2 DECRYPTION',
  testedUnknownRunes: original.length,
  testedOriginalWords: words.length,
  directCiphertextRowConsumers: direct,
  selfIndexedPlaintextRowConsumers: selfIndexed,
  nativeSolvedPagePlants: plants,
}, null, 2));
