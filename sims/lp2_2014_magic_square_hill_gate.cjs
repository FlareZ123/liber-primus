#!/usr/bin/env node
'use strict';

// Source-constrained test: use the three 2014 Stage10 magic-square matrices
// as direct GP29 Hill matrices on the complete original p33-p39 chapter.
// No fitted phase, padding, page reset, offset, or key search is used.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MODULUS = 29;
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const squareText = fs.readFileSync(path.join(ROOT, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');

const chapterPages = corpus.pages.filter((page) => page.page >= 33 && page.page <= 39);
const expectedPageLengths = [214, 261, 271, 238, 228, 228, 240];
assert.deepEqual(chapterPages.map((page) => page.indices.length), expectedPageLengths);
const ciphertext = chapterPages.flatMap((page) => page.indices);
assert.equal(ciphertext.length, 1680);
assert.equal(ciphertext.length % 5, 0);
assert.equal(ciphertext.length % 7, 0);
assert.equal(corpus.runes.length, MODULUS);

const matrices = squareText.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number))
);
const matrixNames = ['5x5 magic sum 3301', '7x7 magic sum 1033', '5x5 magic sum 1033'];
const expectedOrders = [5, 7, 5];
assert.equal(matrices.length, 3);
matrices.forEach((matrix, index) => {
  assert.equal(matrix.length, expectedOrders[index]);
  matrix.forEach((row) => assert.equal(row.length, expectedOrders[index]));
});

function mod(value) {
  return ((value % MODULUS) + MODULUS) % MODULUS;
}

function modInverse(value) {
  for (let candidate = 1; candidate < MODULUS; candidate += 1) {
    if (mod(value * candidate) === 1) return candidate;
  }
  throw new Error('No inverse modulo 29 for ' + value);
}

function determinantMod(matrix) {
  const work = matrix.map((row) => row.map(mod));
  const n = work.length;
  let determinant = 1;
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    while (pivot < n && work[pivot][column] === 0) pivot += 1;
    if (pivot === n) return 0;
    if (pivot !== column) {
      [work[pivot], work[column]] = [work[column], work[pivot]];
      determinant = mod(-determinant);
    }
    const pivotValue = work[column][column];
    determinant = mod(determinant * pivotValue);
    const pivotInverse = modInverse(pivotValue);
    for (let row = column + 1; row < n; row += 1) {
      const factor = mod(work[row][column] * pivotInverse);
      for (let j = column; j < n; j += 1) {
        work[row][j] = mod(work[row][j] - factor * work[column][j]);
      }
    }
  }
  return determinant;
}

function matrixInverse(matrix) {
  const n = matrix.length;
  const work = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  );
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    while (pivot < n && work[pivot][column] === 0) pivot += 1;
    if (pivot === n) throw new Error('Singular matrix modulo 29');
    [work[pivot], work[column]] = [work[column], work[pivot]];
    const scale = modInverse(work[column][column]);
    work[column] = work[column].map((value) => mod(value * scale));
    for (let row = 0; row < n; row += 1) {
      if (row === column) continue;
      const factor = work[row][column];
      work[row] = work[row].map((value, j) => mod(value - factor * work[column][j]));
    }
  }
  return work.map((row) => row.slice(n));
}

function applyMatrix(stream, matrix, orientation) {
  const n = matrix.length;
  assert.equal(stream.length % n, 0, 'A continuous chapter stream must have no padded tail');
  const output = [];
  for (let start = 0; start < stream.length; start += n) {
    const block = stream.slice(start, start + n);
    for (let i = 0; i < n; i += 1) {
      let sum = 0;
      for (let j = 0; j < n; j += 1) {
        sum += orientation === 'column'
          ? matrix[i][j] * block[j]
          : block[j] * matrix[j][i];
      }
      output.push(mod(sum));
    }
  }
  return output;
}

function stats(stream) {
  const frequencies = Array(MODULUS).fill(0);
  stream.forEach((value) => { frequencies[value] += 1; });
  return {
    ioc: frequencies.reduce((sum, count) => sum + count * (count - 1), 0) /
      (stream.length * (stream.length - 1)),
    maxSymbolCount: Math.max(...frequencies)
  };
}

const rawStats = stats(ciphertext);
const clearP57 = corpus.pages.find((page) => page.page === 57).indices;
const p57Stats = stats(clearP57);
const results = [];

matrices.forEach((rawMatrix, index) => {
  const matrix = rawMatrix.map((row) => row.map(mod));
  const determinant = determinantMod(matrix);
  assert.notEqual(determinant, 0, 'The source matrix must be invertible modulo 29');
  const inverse = matrixInverse(matrix);

  // Exact positive controls: the same matrix/inverse pair must round-trip
  // a complete chapter-sized GP29 plant in both conventional vector layouts.
  const plant = Array.from({ length: ciphertext.length }, (_, i) => mod(7 * i + 11));
  for (const orientation of ['column', 'row']) {
    const encrypted = applyMatrix(plant, matrix, orientation);
    const recovered = applyMatrix(encrypted, inverse, orientation);
    assert.deepEqual(recovered, plant);
  }

  const variants = [
    { operation: 'K^-1 * C (column vectors)', matrix: inverse, orientation: 'column' },
    { operation: 'C * K^-1 (row vectors)', matrix: inverse, orientation: 'row' },
    { operation: 'K * C (square used as decoder; column vectors)', matrix, orientation: 'column' },
    { operation: 'C * K (square used as decoder; row vectors)', matrix, orientation: 'row' }
  ];
  const outputs = variants.map((variant) => ({
    operation: variant.operation,
    ...stats(applyMatrix(ciphertext, variant.matrix, variant.orientation))
  }));
  results.push({
    matrix: matrixNames[index],
    order: matrix.length,
    determinantMod29: determinant,
    positiveRoundTrips: 2,
    outputs
  });
});

console.log(JSON.stringify({
  sourceFiles: [
    'resources/cicada2014-openpuff-magic-squares.txt',
    'resources/liber-primus/lp2-corpus.json'
  ],
  chapterPages: chapterPages.map((page) => page.page),
  pageRuneCounts: chapterPages.map((page) => page.indices.length),
  chapterRuneCount: ciphertext.length,
  divisibleBy: [5, 7],
  rawCiphertext: rawStats,
  clearP57Reference: { runeCount: clearP57.length, ...p57Stats },
  results
}, null, 2));
