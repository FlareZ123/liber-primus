'use strict';

/**
 * LP2 p15's sixteen printed square values as a 16-tap GF(29) cyclic Hill kernel.
 * Tests direct source-order kernels on the complete 1,744 original runes
 * immediately following the square, pages p16 through p22.
 *
 * Original ciphertext and rune register: resources/liber-primus/lp2-corpus.json
 * Run on Windows: node sims/lp2_p15_circulant16_source_inverse_sft.cjs
 * Read-only deterministic SFT. All candidate kernels are frozen before decryption.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const Q = 29;
const BLOCK = 16;
const printed = [
  3258, 3222, 3152, 3038,
  3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472,
  4516, 1206, 708, 1820
];
const spiralPositions = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const primeTerms = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
const distinctFibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const sequences = {
  printed,
  spiral: spiralPositions.map((position) => printed[position]),
  prime: primeTerms,
  fibonacci: distinctFibonacci
};
const expectedIoC = {
  'printed/forward': 0.03427602941253875,
  'printed/reverse': 0.034529336217741215,
  'spiral/forward': 0.03483527820324549,
  'spiral/reverse': 0.03426879207524725,
  'prime/forward': 0.03432011137604152,
  'prime/reverse': 0.03454841647060062
};

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % Q) + Q) % Q;
}

/** @param {number} n @returns {number} */
function inverseScalar(n) {
  for (let i = 1; i < Q; i++) {
    if (mod(i * n) === 1) return i;
  }
  throw new Error('Attempted to invert zero in GF(29)');
}

/**
 * @param {number[]} kernel
 * @param {boolean} reversed
 * @returns {number[][]}
 */
function circulant(kernel, reversed) {
  assert.equal(kernel.length, BLOCK);
  return Array.from({ length: BLOCK }, (_, i) =>
    Array.from({ length: BLOCK }, (_, j) =>
      mod(kernel[mod(reversed ? i - j : j - i) % BLOCK])
    )
  );
}

/**
 * Complete Gauss-Jordan inversion in GF29, with singular cases reported.
 * @param {number[][]} matrix
 * @returns {{ rank: number, inverse: number[][] | null }}
 */
function invert(matrix) {
  const aug = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: BLOCK }, (_, j) => Number(i === j))
  ]);
  let rank = 0;
  for (let column = 0; column < BLOCK; column++) {
    const pivot = aug.findIndex((row, i) => i >= rank && row[column] !== 0);
    if (pivot === -1) continue;
    [aug[rank], aug[pivot]] = [aug[pivot], aug[rank]];
    const multiplier = inverseScalar(aug[rank][column]);
    aug[rank] = aug[rank].map((value) => mod(value * multiplier));
    for (let row = 0; row < BLOCK; row++) {
      if (row === rank || aug[row][column] === 0) continue;
      const factor = aug[row][column];
      aug[row] = aug[row].map((value, col) =>
        mod(value - factor * aug[rank][col])
      );
    }
    rank++;
  }
  return {
    rank,
    inverse: rank === BLOCK ? aug.map((row) => row.slice(BLOCK)) : null
  };
}

/**
 * Applies one matrix to consecutive complete 16-rune blocks.
 * @param {number[][]} matrix
 * @param {number[]} symbols
 * @returns {number[]}
 */
function apply(matrix, symbols) {
  assert.equal(symbols.length % BLOCK, 0);
  const result = [];
  for (let i = 0; i < symbols.length; i += BLOCK) {
    for (const row of matrix) {
      let dot = 0;
      for (let j = 0; j < BLOCK; j++) dot += row[j] * symbols[i + j];
      result.push(mod(dot));
    }
  }
  return result;
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const frequencies = Array(Q).fill(0);
  for (const symbol of symbols) frequencies[symbol]++;
  return frequencies.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number} page @returns {number[]} */
function pageRunes(page) {
  const record = corpus.pages.find((item) => item.page === page);
  assert.ok(record, 'Original source page must exist');
  return record.indices;
}

assert.equal(corpus.pages.length, 58);
assert.equal(corpus.runes.length, Q);
assert.deepEqual(spiralPositions.map((index) => printed[index]),
  [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
    3152, 3038, 2838, 2472, 1820, 708, 1206, 4516]);
const pageLengths = Array.from({ length: 7 }, (_, i) => pageRunes(i + 16).length);
assert.deepEqual(pageLengths, [267, 273, 260, 271, 269, 273, 131]);
const original = Array.from({ length: 7 }, (_, i) => pageRunes(i + 16)).flat();
assert.equal(original.length, 1744);
assert.equal(original.length / BLOCK, 109);
assert.ok(Math.abs(indexOfCoincidence(original) - 0.034509598025128034) < 1e-12);
const p57 = pageRunes(57);
assert.equal(p57.length, 95);
const sourceNativePlant = [...p57, 0]; // padding used only for this positive control
assert.equal(sourceNativePlant.length, 96);

let invertible = 0;
let singular = 0;
console.log('LP2 p15 GF(29) circulant16 original-input inverse');
console.log('Original pp16-22 lengths:', pageLengths.join(','),
  '| total:', original.length, '| blocks:', original.length / BLOCK);
console.log('Original pooled IoC:', indexOfCoincidence(original).toFixed(12));

for (const [name, kernel] of Object.entries(sequences)) {
  for (const reversed of [false, true]) {
    const convention = reversed ? 'reverse' : 'forward';
    const label = name + '/' + convention;
    const matrix = circulant(kernel, reversed);
    const { rank, inverse } = invert(matrix);
    if (inverse === null) {
      singular++;
      assert.equal(name, 'fibonacci');
      assert.equal(rank, 15);
      console.log(label, '| singular rank:', rank);
      continue;
    }
    invertible++;
    const decoded = apply(inverse, original);
    const replay = apply(matrix, decoded);
    assert.deepEqual(replay, original, 'Exact forward reencryption: ' + label);
    const ioc = indexOfCoincidence(decoded);
    assert.ok(Math.abs(ioc - expectedIoC[label]) < 1e-12,
      'Original frozen output IoC changed: ' + label);
    const encryptedPlant = apply(matrix, sourceNativePlant);
    const recoveredPlant = apply(inverse, encryptedPlant);
    assert.deepEqual(recoveredPlant, sourceNativePlant,
      'Original clear p57 register 96/96 plant: ' + label);
    console.log(label, '| rank:', rank, '| IoC:', ioc.toFixed(12),
      '| full source replay:', replay.length + '/' + original.length,
      '| GP native plant:', recoveredPlant.length + '/' + sourceNativePlant.length,
      '| first32:', decoded.slice(0, 32).map((i) => corpus.translit[i]).join(' '));
  }
}
assert.equal(invertible, 6);
assert.equal(singular, 2);
console.log('PASS: six source-frozen inverses and six positive plants; no language-like original output');
