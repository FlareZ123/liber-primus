'use strict';

/**
 * Original LP2 p6/p7: 11-rune red seed as a right-circulant GF(29) Hill matrix.
 * Read-only, Node.js 22, CommonJS. No fitted key, phase, text or output files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));

const MODULUS = 29;
const WIDTH = 11;
const seed = source.pages[6].indices.slice(71, 82);
const cipher = source.pages[6].indices.slice(82).concat(
  source.pages[7].indices.slice(0, 194)
);
const known = source.pages[57].indices;

assert.deepStrictEqual(seed, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
assert.equal(source.pages[6].indices.length, 196);
assert.equal(source.pages[7].indices.length, 208);
assert.equal(cipher.length, 308);
assert.equal(cipher.length / WIDTH, 28);
assert.equal(known.length, 95);

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MODULUS) + MODULUS) % MODULUS;
}

/** @param {number} value @returns {number} */
function reciprocal(value) {
  for (let candidate = 1; candidate < MODULUS; candidate++) {
    if (mod(candidate * value) === 1) return candidate;
  }
  throw new Error('Noninvertible element of GF(29): ' + value);
}

/**
 * Gauss-Jordan inverse over GF(29), including the unfitted determinant.
 * @param {number[][]} input
 * @returns {{ inverse: number[][], determinant: number }}
 */
function inverseMatrix(input) {
  const n = input.length;
  const augmented = input.map((row, index) =>
    row.concat(Array.from({ length: n }, (_, col) => Number(col === index)))
  );
  let determinant = 1;
  for (let column = 0; column < n; column++) {
    const pivot = augmented.findIndex((row, rowIndex) =>
      rowIndex >= column && row[column] !== 0
    );
    assert.ok(pivot >= column, 'The original red matrix must be nonsingular');
    if (pivot !== column) {
      [augmented[pivot], augmented[column]] = [augmented[column], augmented[pivot]];
      determinant = mod(-determinant);
    }
    const pivotValue = augmented[column][column];
    determinant = mod(determinant * pivotValue);
    const invPivot = reciprocal(pivotValue);
    augmented[column] = augmented[column].map(value => mod(value * invPivot));
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const coefficient = augmented[row][column];
      if (coefficient === 0) continue;
      for (let col = 0; col < n * 2; col++) {
        augmented[row][col] = mod(
          augmented[row][col] - coefficient * augmented[column][col]
        );
      }
    }
  }
  return {
    inverse: augmented.map(row => row.slice(n)),
    determinant
  };
}

/** @param {number[][]} matrix @param {number[]} vector @returns {number[]} */
function multiply(matrix, vector) {
  return matrix.map(row => mod(
    row.reduce((total, coefficient, index) => total + coefficient * vector[index], 0)
  ));
}

/**
 * Apply a selected full-block linear inverse, optionally reversing each input row.
 * @param {number[]} symbols
 * @param {number[][]} matrix
 * @param {boolean} reversed
 * @returns {number[]}
 */
function transform(symbols, matrix, reversed) {
  assert.equal(symbols.length % WIDTH, 0);
  const result = [];
  for (let start = 0; start < symbols.length; start += WIDTH) {
    const input = symbols.slice(start, start + WIDTH);
    if (reversed) input.reverse();
    result.push(...multiply(matrix, input));
  }
  return result;
}

/** @param {number[]} symbols @param {number[][]} inverse @param {boolean} reversed @returns {number[]} */
function undo(symbols, inverse, reversed) {
  assert.equal(symbols.length % WIDTH, 0);
  const result = [];
  for (let start = 0; start < symbols.length; start += WIDTH) {
    const row = multiply(inverse, symbols.slice(start, start + WIDTH));
    if (reversed) row.reverse();
    result.push(...row);
  }
  return result;
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (symbols.length * (symbols.length - 1));
}

const matrix = Array.from({ length: WIDTH }, (_, row) =>
  Array.from({ length: WIDTH }, (_, col) =>
    seed[(col - row + WIDTH) % WIDTH])
);
const transposed = Array.from({ length: WIDTH }, (_, row) =>
  Array.from({ length: WIDTH }, (_, col) => matrix[col][row])
);
const inverted = inverseMatrix(matrix);
const transposeInverted = inverseMatrix(transposed);
assert.equal(inverted.determinant, 8);
assert.equal(transposeInverted.determinant, 8);

const operators = [
  ['inverse', inverted.inverse],
  ['transpose-inverse', transposeInverted.inverse],
  ['direct', matrix],
  ['transpose', transposed]
];
const plantedClear = Array.from({ length: cipher.length }, (_, index) =>
  known[index % known.length]
);

const results = [];
for (const [name, operator] of operators) {
  const inverse = inverseMatrix(operator).inverse;
  for (const reversed of [false, true]) {
    const originalOutput = transform(cipher, operator, reversed);
    assert.deepStrictEqual(undo(originalOutput, inverse, reversed), cipher);
    const plantedCipher = undo(plantedClear, inverse, reversed);
    assert.deepStrictEqual(transform(plantedCipher, operator, reversed), plantedClear);
    results.push({
      operator: name,
      reverseInputWithinRows: reversed,
      coincidence: Number(coincidence(originalOutput).toFixed(9)),
      first44Transliterated: originalOutput.slice(0, 44)
        .map(index => source.translit[index]).join('')
    });
  }
}
assert.ok(results.every(result =>
  result.coincidence > 0.032 && result.coincidence < 0.038
));
console.log(JSON.stringify({
  original: 'LP2 23.jpg after red11 + LP2 24.jpg before red14',
  sourceRuneCounts: [114, 194],
  seed,
  sourceDeterminant: 8,
  originalCipherCoincidence: coincidence(cipher),
  solvedP57Coincidence: coincidence(known),
  originalCandidateResults: results,
  cipherRoundTrips: 8,
  plantedKnownSourceRoundTrips: 8,
  conclusion: 'All eight fixed circulant Hill-11 outputs remain nonlinguistic; no plaintext or key recovered'
}, null, 2));
