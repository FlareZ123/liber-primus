/**
 * P33 source-ordered 49 black word sums as a 7x7 Hill message.
 * The 2014 Stage10 7x7 square sums to 1033 in each row and column.
 * The first p33 red body has 21 black words; the second has 28,
 * yielding exactly seven consecutive seven-word source rows.
 *
 * Source-selected operands: each printed word's GP prime-value sum or
 * GP word length, with the historical square over GF(29).
 * No free seed, phase, fitted alphabet, word-list choice, or hidden text.
 *
 * Windows 11, Node.js 22, CommonJS. Read-only single runnable test file.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const squareText = read('resources/cicada2014-openpuff-magic-squares.txt');

const mod = value => ((value % 29) + 29) % 29;
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @param {string} token @returns {number[]} */
function wordIndices(token) {
  return [...token].map(rune => {
    assert.ok(runeIndex.has(rune), 'native GP symbol');
    return runeIndex.get(rune);
  });
}

/** @param {string} passage @returns {string[]} */
function wordsFromPrintedPassage(passage) {
  return passage.replace(/\/\s*\r?\n/g, '').replace(/[\s/]/g, '').split(/[-.]/g).filter(Boolean);
}

const pages = transcription.split(/\r?\n%\r?\n/);
assert.equal(pages.length, 57, 'LP2 canonical page split');
const sections = pages[33].split('&');
assert.equal(sections.length, 2, 'p33 original black-word sections');
const allWords = sections.map(wordsFromPrintedPassage);
assert.deepEqual(allWords.map(group => group.length), [23, 30]);
const words = allWords.flatMap(group => group.slice(2));
assert.deepEqual(allWords.map(group => group.slice(2).length), [21, 28]);
assert.equal(words.length, 49, 'source-native seven word rows');
const rawWords = words.map(wordIndices);
const rawRunes = rawWords.flat();
const original = corpus.pages.find(page => page.page === 33).indices;
assert.equal(original.length, 214);
assert.deepEqual(rawRunes, original.slice(10, 91).concat(original.slice(99)), 'unaltered p33 black runes');

const historicalSquares = squareText.trim().split(/\r?\n\s*\r?\n/);
assert.equal(historicalSquares.length, 3);
const square = historicalSquares[1].trim().split(/\r?\n/).map(row =>
  row.trim().split(/\s+/).map(cell => Number(cell)));
assert.equal(square.length, 7);
for (const row of square) {
  assert.equal(row.length, 7);
  assert.equal(row.reduce((sum, value) => sum + value, 0), 1033);
}
for (let column = 0; column < 7; column++) {
  assert.equal(square.reduce((sum, row) => sum + row[column], 0), 1033);
}
const matrix = square.map(row => row.map(mod));

/** @param {number[][]} input @returns {number[][]} */
function inverse7(input) {
  const rows = input.map((row, i) => row.concat(Array.from({ length: 7 }, (_, j) => Number(i === j))));
  for (let i = 0; i < 7; i++) {
    const pivot = rows.findIndex((row, index) => index >= i && row[i] !== 0);
    assert.ok(pivot >= 0, 'historical square is invertible over GF29');
    [rows[i], rows[pivot]] = [rows[pivot], rows[i]];
    const inversePivot = Array.from({ length: 28 }, (_, j) => j + 1)
      .find(value => mod(value * rows[i][i]) === 1);
    assert.notEqual(inversePivot, undefined);
    for (let j = 0; j < 14; j++) rows[i][j] = mod(rows[i][j] * inversePivot);
    for (let k = 0; k < 7; k++) {
      if (k === i) continue;
      const scale = rows[k][i];
      for (let j = 0; j < 14; j++) rows[k][j] = mod(rows[k][j] - scale * rows[i][j]);
    }
  }
  return rows.map(row => row.slice(7));
}
const inverse = inverse7(matrix);

/** @param {number[]} data @param {number[][]} key @param {boolean} rowVectors @returns {number[]} */
function transform(data, key, rowVectors) {
  assert.equal(data.length, 49);
  const out = [];
  for (let offset = 0; offset < 49; offset += 7) {
    for (let i = 0; i < 7; i++) {
      out.push(mod(data.slice(offset, offset + 7).reduce((sum, value, j) =>
        sum + value * (rowVectors ? key[j][i] : key[i][j]), 0)));
    }
  }
  return out;
}

/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const hist = Array(29).fill(0);
  for (const symbol of sequence) hist[symbol]++;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0) / (sequence.length * (sequence.length - 1));
}

const indexSums = rawWords.map(word => mod(word.reduce((sum, symbol) => sum + symbol, 0)));
const primeSums = rawWords.map(word => mod(word.reduce((sum, symbol) => sum + corpus.prime[symbol], 0)));
const lengths = rawWords.map(word => word.length);
assert.equal(primeSums.length, 49);
assert.equal(indexSums.length, 49);
assert.equal(lengths.reduce((sum, n) => sum + n, 0), 196);

// Exact 49-rune solved-original GP native-language plant.
// A known message under the actual square must be fully recovered.
const planted = corpus.pages.find(page => page.page === 57).indices.slice(0, 49);
assert.equal(planted.length, 49);
for (const rowVectors of [false, true]) {
  const concealed = transform(planted, matrix, rowVectors);
  const clear = transform(concealed, inverse, rowVectors);
  assert.deepEqual(clear, planted, 'known native GP positive 49/49');
  const roundTrip = transform(primeSums, matrix, rowVectors);
  assert.deepEqual(transform(roundTrip, inverse, rowVectors), primeSums);
}
const inputs = [
  ['prime-sums', primeSums],
  ['gp-index-sums', indexSums],
  ['word-lengths', lengths],
];
const results = inputs.flatMap(([source, symbols]) =>
  [false, true].flatMap(rowVectors =>
    [['inverse', inverse], ['forward', matrix]].map(([operation, key]) => {
      const output = transform(symbols, key, rowVectors);
      const originalRecovers = operation === 'inverse'
        ? transform(output, matrix, rowVectors)
        : transform(output, inverse, rowVectors);
      assert.deepEqual(originalRecovers, symbols);
      return {
        source,
        operation,
        orientation: rowVectors ? 'seven-word-row-vectors' : 'seven-word-column-vectors',
        ioc: ioc(output),
        gp: output.map(symbol => corpus.translit[symbol]).join(' '),
        gpIndices: output,
      };
    })));

/**
 * Four complete original 7x7 GP-rune arrays, giving the historical 7x7
 * matrix access to *all* 196 black runes rather than scalar word values.
 * Every grid is a contiguous 49-rune block in the actual source order.
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]}
 */
function multiply7(a, b) {
  return a.map(row => row.map((_, j) =>
    mod(row.reduce((sum, value, k) => sum + value * b[k][j], 0))));
}

/** @param {number[][]} a @returns {number[][]} */
function transpose7(a) {
  return a[0].map((_, j) => a.map(row => row[j]));
}

/**
 * @param {number[]} originalFlat
 * @param {number[][]} key
 * @param {'left'|'right'} side
 * @returns {number[]}
 */
function fourSquareTransform(originalFlat, key, side) {
  assert.equal(originalFlat.length, 196);
  return Array.from({ length: 4 }, (_, squareNumber) => {
    const block = originalFlat.slice(49 * squareNumber, 49 * (squareNumber + 1));
    const grid = Array.from({ length: 7 }, (_, j) => block.slice(j * 7, j * 7 + 7));
    const decoded = side === 'left' ? multiply7(key, grid) : multiply7(grid, key);
    return decoded.flat();
  }).flat();
}
const squareOperators = [
  ['K', matrix],
  ['K-inverse', inverse],
  ['K-transposed', transpose7(matrix)],
  ['K-inverse-transposed', transpose7(inverse)],
];
const solved196 = Array.from({ length: 196 }, (_, i) => planted[i % planted.length]);
for (const [name, key] of squareOperators) {
  for (const side of ['left', 'right']) {
    const concealed = fourSquareTransform(solved196, key, side);
    const undo = name.startsWith('K-inverse')
      ? name.includes('transposed') ? transpose7(matrix) : matrix
      : name.includes('transposed') ? transpose7(inverse) : inverse;
    assert.deepEqual(fourSquareTransform(concealed, undo, side), solved196,
      '196/196 native source 7x7 four-grid recovery with inverse');
  }
}
const runeGridCandidates = squareOperators.flatMap(([name, key]) =>
  ['left', 'right'].map(side => {
    const output = fourSquareTransform(rawRunes, key, side);
    return {
      operator: name, side, runes: output.length,
      ioc: ioc(output),
      first80GP: output.slice(0, 80).map(i => corpus.translit[i]).join(' '),
    };
  }));
for (const [name, left, right] of [
  ['K-both', matrix, matrix],
  ['K-inverse-both', inverse, inverse],
  ['K-both-transpose', matrix, transpose7(matrix)],
  ['K-inverse-both-transpose', inverse, transpose7(inverse)],
]) {
  const output = Array.from({ length: 4 }, (_, squareNumber) => {
    const block = rawRunes.slice(squareNumber * 49, (squareNumber + 1) * 49);
    const grid = Array.from({ length: 7 }, (_, j) => block.slice(j * 7, j * 7 + 7));
    return multiply7(multiply7(left, grid), right).flat();
  }).flat();
  runeGridCandidates.push({
    operator: name, side: 'left+right', runes: output.length, ioc: ioc(output),
    first80GP: output.slice(0, 80).map(i => corpus.translit[i]).join(' '),
  });
}
assert.equal(runeGridCandidates.length, 12);

console.log('P33_WORD49_STAGE10_HILL7', JSON.stringify({
  status: 'candidate original-cipher inverse, no authenticated plaintext',
  sourceP33OriginalRunes: original.length,
  sourceBlackWords: 49,
  sourceBlackRunes: 196,
  originalBodyWordSplit: [21, 28],
  magicSquareRowColumnSum: 1033,
  originalWordPrimeSumsMod29: primeSums,
  solvedNativePlantRecovered: planted.length,
  candidates: results,
  fourSquareRungroup196: runeGridCandidates,
  fourSquareNativePositiveRecovered: solved196.length,
}, null, 2));
