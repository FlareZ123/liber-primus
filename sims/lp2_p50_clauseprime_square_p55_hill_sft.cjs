#!/usr/bin/env node
'use strict';

/**
 * Fixed 5x5 p50-square -> 3x25-rune original p55 Hill inverse.
 * One original GP29 source and one data-derived key; no key fitting.
 * Windows Node22 SFT: node sims/lp2_p50_clauseprime_square_p55_hill_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} file @returns {any} */
const read = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const tokens = grid.rows.flat();
const alphabet = grid.alphabet.replace('f', '');
const page55 = corpus.pages.find((page) => page.page === 55).indices;
const page57 = corpus.pages.find((page) => page.page === 57).indices;
const mod = (n) => ((n % 29) + 29) % 29;
assert.equal(page55.length, 76);
assert.equal(page57.length, 95);
assert.equal(tokens.length, 256);
assert.equal(alphabet.length, 59);

/** @param {string} token */
function cellValue(token) {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  return hi * 59 + lo;
}

/** @type {number[][]} */
const sourceSquare = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) =>
    cellValue(tokens[(21 + row) * 8 + (1 + col)])));
assert.deepEqual([sourceSquare[0][0], sourceSquare[0][4],
  sourceSquare[4][0], sourceSquare[4][4]], [224, 115, 73, 75]);
const key = sourceSquare.map((row) => row.map(mod));

/** @param {number[][]} matrix */
function invert(matrix) {
  const size = matrix.length;
  const augmented = matrix.map((row, index) =>
    row.concat(Array.from({ length: size }, (_, col) => index === col ? 1 : 0)));
  let determinant = 1;
  let sign = 1;
  for (let col = 0; col < size; col++) {
    let pivotRow = col;
    while (pivotRow < size && augmented[pivotRow][col] === 0) pivotRow++;
    assert(pivotRow < size, 'Source square is singular over GF29');
    if (pivotRow !== col) {
      [augmented[col], augmented[pivotRow]] =
        [augmented[pivotRow], augmented[col]];
      sign = -sign;
    }
    const pivot = augmented[col][col];
    determinant = mod(determinant * pivot);
    const reciprocal = Array.from({ length: 29 }, (_, i) => i)
      .find((candidate) => mod(candidate * pivot) === 1);
    assert.notEqual(reciprocal, undefined);
    augmented[col] = augmented[col].map((x) => mod(x * reciprocal));
    for (let row = 0; row < size; row++) {
      if (row === col) continue;
      const multiple = augmented[row][col];
      augmented[row] = augmented[row].map(
        (value, i) => mod(value - multiple * augmented[col][i])
      );
    }
  }
  return {
    determinant: mod(determinant * sign),
    inverse: augmented.map((row) => row.slice(size))
  };
}

/** @param {number[][]} a @param {number[][]} b */
function multiply(a, b) {
  return a.map((row) => b[0].map((_, col) =>
    mod(row.reduce((acc, x, index) => acc + x * b[index][col], 0))
  ));
}
/** @param {number[]} values */
const ioc = (values) => {
  const frequency = Array(29).fill(0);
  for (const value of values) frequency[value]++;
  return frequency.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};
/** @param {number[]} runes */
function blocks(runes) {
  assert.equal(runes.length, 75);
  return Array.from({ length: 3 }, (_, block) =>
    Array.from({ length: 5 }, (_, row) =>
      runes.slice(block * 25 + row * 5, block * 25 + row * 5 + 5)));
}
const { determinant, inverse } = invert(key);
assert.equal(determinant, 17);
const identity = multiply(key, inverse);
assert.deepEqual(identity, Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) => Number(row === col))));

/**
 * @param {number[][]} bs
 * @param {number[][]} matrix
 * @param {'left'|'right'} side
 */
const apply = (bs, matrix, side) => bs
  .map((block) => side === 'left' ? multiply(matrix, block) :
    multiply(block, matrix))
  .flat(2);

const ciphertext = page55.slice(1); // 75 source runes after page-carry first rune
const synthetic = page57.slice(0, 75);
const outcomes = [];
for (const mode of ['inverse', 'forward']) {
  const decryptMatrix = mode === 'inverse' ? inverse : key;
  const encryptMatrix = mode === 'inverse' ? key : inverse;
  for (const side of ['left', 'right']) {
    const plaintext = apply(blocks(ciphertext), decryptMatrix, side);
    const originalRoundtrip = apply(blocks(plaintext), encryptMatrix, side);
    assert.deepEqual(originalRoundtrip, ciphertext);
    const plantedCipher = apply(blocks(synthetic), encryptMatrix, side);
    assert.deepEqual(apply(blocks(plantedCipher), decryptMatrix, side), synthetic);
    outcomes.push({
      mode, side,
      originalIoC: ioc(plaintext),
      text: plaintext.map((rune) => corpus.translit[rune]).join(''),
      sourceOriginalRoundtrip: '75/75',
      plantedP57Positive: '75/75'
    });
  }
}
assert(outcomes.every((r) => r.originalIoC < 0.04));
console.log(JSON.stringify({
  source: {
    frame: 'source prime-ordinal [205,173,201] => rows21..25, columns1..5',
    tableSquare: sourceSquare, gp29KeyMatrix: key, determinantGF29: determinant,
    knownP54ToP55PageCarryRune: corpus.translit[page55[0]],
    bodyLengthAfterCarry: 75
  },
  originalP55BodyIoC: ioc(ciphertext),
  sourceClearP57IoC: ioc(page57),
  outcomes,
  conclusion: 'Four exact original inverses and solved-native plants, zero authenticated original plaintext.'
}, null, 2));
