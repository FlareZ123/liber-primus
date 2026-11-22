'use strict';
/**
 * Original LP1 p05 word/number geometry as a source-grounded direction-map gate.
 * The p05 printed rune words use the canonical GP29 prime values. No unknown
 * LP2 ciphertext is touched or reverse-fitted in this single-file test.
 * Node.js 22 CommonJS, no external packages, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} relativePath @returns {string} */
const read = relativePath =>
  fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const gpPrime = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
assert.equal(gpPrime.size, 29);
assert.equal(corpus.prime[0], 2);
assert.equal(corpus.prime[28], 109);

const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const anchor = '272-138-';
assert.equal(lp1.indexOf(anchor), lp1.lastIndexOf(anchor),
  'The original LP1 p05 mixed-square first row must be unique');
const lines = lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0, 5);
assert.equal(lines.length, 5);
const printed = lines.map(line => line.replace(/\/$/, '').split('-'));
assert(printed.every(row => row.length === 5));

const historic = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/(?:\r?\n){2,}/);
assert.equal(historic.length, 3);
const expected = historic[2].trim().split(/\r?\n/)
  .map(line => line.trim().split(/\s+/).map(Number));
assert.deepEqual(expected.map(row => row.length), [5, 5, 5, 5, 5]);

/** @param {string} cell @returns {number} */
function literalCellValue(cell) {
  if (/^\d+$/.test(cell)) return Number(cell);
  let sum = 0;
  for (const rune of cell) {
    assert(gpPrime.has(rune), `Non-GP source rune in p05 square: ${rune}`);
    sum += gpPrime.get(rune);
  }
  return sum;
}
const derived = printed.map(row => row.map(literalCellValue));
assert.deepEqual(derived, expected,
  'All original printed word/number values must equal the independent historical square');
const wordMask = printed.map(row =>
  row.map(cell => /^\d+$/.test(cell) ? '0' : '1').join(''));
assert.deepEqual(wordMask, ['00100', '11110', '01101', '01111', '00100']);
assert.equal(wordMask.join('').split('1').length - 1, 13);

for (let i = 0; i < 5; i++) {
  const rowSum = derived[i].reduce((sum, value) => sum + value, 0);
  const columnSum = derived.reduce((sum, row) => sum + row[i], 0);
  assert.equal(rowSum, 1033);
  assert.equal(columnSum, 1033);
}
assert.equal(derived.reduce((sum, row, i) => sum + row[i], 0), 1033);
assert.equal(derived.reduce((sum, row, i) => sum + row[4 - i], 0), 1033);
assert.deepEqual(derived,
  derived.slice().reverse().map(row => row.slice().reverse()),
  'The numerical square has exact 180-degree rotational symmetry');

const selectedWords = printed.flatMap((row, r) => row.flatMap((cell, c) =>
  /^\d+$/.test(cell) ? [] : [{row:r + 1, col:c + 1, word:cell,
    value:derived[r][c]}]));
console.log(JSON.stringify({
  source: 'original LP1 p05 printed GP29 mixed square',
  separateSource: 'historical 2014 third OpenPuff square',
  testedCells: 25,
  verifiedCells: 25,
  runeWordCells: selectedWords.length,
  literalNumeralCells: 25 - selectedWords.length,
  words: selectedWords.map(entry => ({
    row:entry.row, col:entry.col,
    latin: entry.word.split('').map(rune =>
      corpus.translit[corpus.runes.indexOf(rune)]).join(''),
    gpPrimeSum:entry.value,
  })),
  wordCellMask: wordMask,
  numericSquare: derived,
  commonMagicSum: 1033,
  rotationalSymmetry180: true,
  operatorEstablished: 'GP29 word rune-prime addition',
  operatorMissing: [
    'first-party starting cell', 'first-party number-to-direction grammar',
    'word/number handling within any traverse', 'first-party stopping condition',
  ],
  originalCipherPlaintextRecovered: false,
}, null, 2));
