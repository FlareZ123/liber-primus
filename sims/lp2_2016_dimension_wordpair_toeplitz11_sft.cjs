'use strict';

/**
 * Source-selected 21-coefficient Toeplitz inverse on the 121-rune LP2 tree page.
 * Standalone SFT, Node.js 22, no dependencies and no writes.
 *
 * Reproduce from repository root:
 *   node sims/lp2_2016_dimension_wordpair_toeplitz11_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
  53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109];
const transcription = fs.readFileSync(path.join(__dirname,
  '../resources/liber-primus/lp2-transcription.txt'), 'utf8');
const transcriptionPages = transcription.split('%');

/** @param {number} x */
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} a */
function scalarInverse(a) {
  for (let i = 1; i < 29; i++) if (mod(i * a) === 1) return i;
  throw new Error('Zero has no multiplicative inverse over GF(29)');
}

/** @param {string} text */
function indices(text) {
  return Array.from(text, (rune) => {
    const i = corpus.runes.indexOf(rune);
    assert(i >= 0, 'Unknown original rune');
    return i;
  });
}

/** @param {number} page */
function pageWords(page) {
  return transcriptionPages[page].replace(/[\/\s]/gu, '')
    .split(/[-.&$0-9]+/u).filter(Boolean);
}
const word0 = pageWords(0)[5];
const word1 = pageWords(1)[32];
assert.equal(word0, 'ᚾᛖᚹᛒᚪᛋᛟᛇᛁᛝᚢ');
assert.equal(word1, 'ᛄᚠᛁᚾᛡᚳᚣᛠᛁᛡ');
const first = indices(word0);
const second = indices(word1);
assert.equal(first.length, 11);
assert.equal(second.length, 10);
assert.equal(first.reduce((s, x) => s + primes[x], 0), 563);
assert.equal(second.reduce((s, x) => s + primes[x], 0), 569);
assert.equal(corpus.pages[32].indices.length, 121);
assert.equal(corpus.pages[57].indices.length, 95);

/**
 * A Toeplitz n×n matrix has 2n−1 free entries. The width-selected
 * 11-rune word provides the complete first row. The height-selected
 * 10-rune word supplies the other ten entries of the first column.
 *
 * @param {'ordinal'|'prime'} valueSystem
 */
function toeplitz(valueSystem) {
  const value = (i) => valueSystem === 'ordinal' ? i : primes[i] % 29;
  const row = first.map(value);
  const column = [row[0], ...second.map(value)];
  return Array.from({ length: 11 }, (_, i) =>
    Array.from({ length: 11 }, (_, j) =>
      i <= j ? row[j - i] : column[i - j]));
}

/** @param {number[][]} matrix */
function inverse(matrix) {
  const n = matrix.length;
  const a = matrix.map((line, i) => [
    ...line, ...Array.from({ length: n }, (_, j) => Number(i === j)),
  ]);
  let determinant = 1;
  for (let j = 0; j < n; j++) {
    let pivot = j;
    while (pivot < n && a[pivot][j] === 0) pivot++;
    assert(pivot < n, 'Source matrix is singular');
    if (pivot !== j) {
      [a[j], a[pivot]] = [a[pivot], a[j]];
      determinant = mod(-determinant);
    }
    const factor = a[j][j];
    determinant = mod(determinant * factor);
    const reciprocal = scalarInverse(factor);
    a[j] = a[j].map((x) => mod(x * reciprocal));
    for (let row = 0; row < n; row++) {
      if (row === j) continue;
      const k = a[row][j];
      a[row] = a[row].map((x, i) => mod(x - k * a[j][i]));
    }
  }
  return { determinant, matrix: a.map((line) => line.slice(n)) };
}

/** @param {number[][]} matrix */
const transpose = (matrix) => matrix[0].map((_, i) => matrix.map((r) => r[i]));

/** @param {number[][]} left @param {number[][]} right */
function multiply(left, right) {
  const columns = transpose(right);
  return left.map((row) => columns.map((column) =>
    mod(row.reduce((s, x, j) => s + x * column[j], 0))));
}

/** @param {number[]} flat */
function square(flat) {
  assert.equal(flat.length, 121);
  return Array.from({ length: 11 }, (_, i) => flat.slice(11 * i, 11 * i + 11));
}

/**
 * @param {'left'|'right'|'both'} operation
 * @param {number[][]} key
 * @param {number[][]} input
 */
function apply(operation, key, input) {
  if (operation === 'left') return multiply(key, input);
  if (operation === 'right') return multiply(input, transpose(key));
  return multiply(multiply(key, input), transpose(key));
}

/** @param {number[]} symbols */
function ioc(symbols) {
  const counts = Array.from({ length: 29 }, (_, i) =>
    symbols.filter((symbol) => symbol === i).length);
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

const original = square(corpus.pages[32].indices);
const knownText = square([...corpus.pages[57].indices,
  ...corpus.pages[57].indices.slice(0, 26)]);
const all = [];
for (const valueSystem of ['ordinal', 'prime']) {
  const key = toeplitz(valueSystem);
  const inverted = inverse(key);
  assert.equal(inverted.determinant,
    valueSystem === 'ordinal' ? 21 : 14);
  assert.deepEqual(multiply(key, inverted.matrix),
    Array.from({ length: 11 }, (_, i) =>
      Array.from({ length: 11 }, (_, j) => Number(i === j))));
  for (const operation of ['left', 'right', 'both']) {
    for (const sense of ['inverse', 'forward']) {
      const decodingKey = sense === 'inverse' ? inverted.matrix : key;
      const encodingKey = sense === 'inverse' ? key : inverted.matrix;
      const plaintext = apply(operation, decodingKey, original);
      const recoveredCipher = apply(operation, encodingKey, plaintext);
      assert.deepEqual(recoveredCipher, original,
        'Original p32 failed exact source-cipher round trip');
      const plantedCipher = apply(operation, encodingKey, knownText);
      assert.deepEqual(apply(operation, decodingKey, plantedCipher),
        knownText, 'Original solved-p57 plant failed exact inverse');
      const runes = plaintext.flat();
      all.push({
        valueSystem, operation, sense,
        determinant: inverted.determinant,
        ioc: ioc(runes),
        prefix: runes.slice(0, 30).map((n) => corpus.runes[n]).join(''),
      });
    }
  }
}
assert.equal(all.length, 12);
assert.equal(ioc(corpus.pages[32].indices), 0.03415977961432507);
assert(all.every((entry) => entry.ioc < 0.04));
assert.equal(Math.max(...all.map((entry) => entry.ioc)),
  0.03732782369146005);

/**
 * Full-book extension of the same SOURCE-FIXED vector Hill operation.
 * The two natural boundaries are book-global 11-rune blocks, or complete
 * 11-rune blocks restarted at every physical manuscript page.
 * Incomplete terminal blocks remain unmodified original ciphertext and
 * are excluded from language scores, never padded by a fitted value.
 *
 * @param {number[][]} key
 * @param {number[]} symbols
 */
function blockProduct(key, symbols) {
  assert.equal(symbols.length, 11);
  return key.map((row) => mod(row.reduce(
    (s, value, i) => s + value * symbols[i], 0)));
}

const originalPages = corpus.pages.slice(0, 56)
  .filter((page) => page.indices.length > 0)
  .map((page) => page.indices);
assert.equal(originalPages.length, 55);
assert.equal(originalPages.flat().length, 12956);
const fullBook = [];
for (const valueSystem of ['ordinal', 'prime']) {
  const key = toeplitz(valueSystem);
  const keyInverse = inverse(key).matrix;
  for (const sense of ['inverse', 'forward']) {
    const decoder = sense === 'inverse' ? keyInverse : key;
    const encoder = sense === 'inverse' ? key : keyInverse;
    for (const alignment of ['global', 'page']) {
      const inputSections = alignment === 'global'
        ? [originalPages.flat()] : originalPages;
      const output = [];
      for (const section of inputSections) {
        for (let i = 0; i + 11 <= section.length; i += 11) {
          const originalBlock = section.slice(i, i + 11);
          const plaintextBlock = blockProduct(decoder, originalBlock);
          assert.deepEqual(blockProduct(encoder, plaintextBlock),
            originalBlock, 'Whole-book source block failed re-encryption');
          output.push(...plaintextBlock);
        }
      }
      assert.equal(output.length,
        alignment === 'global' ? 12947 : 12606);
      fullBook.push({
        valueSystem, sense, alignment, runes: output.length,
        skippedSourceTerminalRunes: 12956 - output.length,
        ioc: ioc(output),
        prefix: output.slice(0, 30)
          .map((n) => corpus.runes[n]).join(''),
      });
    }
  }
}
assert.equal(fullBook.length, 8);
assert(fullBook.every((x) => x.ioc > 0.034 && x.ioc < 0.035));

console.log(JSON.stringify({
  source: 'p0 word6 (563) + p1 word33 (569) -> Toeplitz11 -> p32',
  originalCipherIoC: ioc(corpus.pages[32].indices),
  p57NativeControlIoC: ioc(knownText.flat()),
  allSourceOriginalInverseAndNativePlantChecksPassed: true,
  readings: all,
  fullBook11BlockReadings: fullBook,
}, null, 2));
