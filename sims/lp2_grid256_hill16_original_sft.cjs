'use strict';

/**
 * Test the direct 16 x 16 Hill matrix suggested by 256 original p50 cells.
 * Standalone, read-only, Windows Node.js 22-compatible SFT.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} relative */
function load(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const width = 16;
const field = 29;

/** @param {number} v */
function mod(v) {
  return ((v % field) + field) % field;
}

/** @param {number} a */
function reciprocal(a) {
  for (let n = 1; n < field; n++) if (mod(a * n) === 1) return n;
  throw Error('GF29 element has no inverse: ' + a);
}

/** @param {number[][]} M */
function transpose(M) {
  return Array.from({ length: width }, (_, i) => Array.from({ length: width }, (_, j) => M[j][i]));
}

/** @param {number[][]} matrix */
function inverse(matrix) {
  const x = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: width }, (_, j) => Number(i === j)),
  ]);
  for (let col = 0; col < width; col++) {
    const pivot = x.findIndex((row, index) => index >= col && row[col] !== 0);
    if (pivot < 0) return null;
    [x[col], x[pivot]] = [x[pivot], x[col]];
    const r = reciprocal(x[col][col]);
    x[col] = x[col].map((value) => mod(value * r));
    for (let i = 0; i < width; i++) {
      if (i === col) continue;
      const k = x[i][col];
      x[i] = x[i].map((value, j) => mod(value - k * x[col][j]));
    }
  }
  return x.map((row) => row.slice(width));
}

/** @param {number[][]} A @param {number[]} block */
function multiply(A, block) {
  assert.equal(block.length, width);
  return A.map((row) => mod(row.reduce((sum, coefficient, j) => sum + coefficient * block[j], 0)));
}

/** @param {number[]} vector */
function coincidence(vector) {
  const f = Array(field).fill(0);
  for (const r of vector) f[r]++;
  return f.reduce((sum, x) => sum + x * (x - 1), 0) / (vector.length * (vector.length - 1));
}

const bytes = grid.byte_rows.flat();
assert.equal(grid.rows.length, 32);
assert.equal(grid.rows.every((row) => row.length === 8), true);
assert.equal(bytes.length, 256);
const source = corpus.pages.slice(0, 56).flatMap((p) => p.indices);
const solved = corpus.pages.slice(56, 58).flatMap((p) => p.indices);
assert.equal(source.length, 12956);
assert.equal(solved.length, 180);
assert.equal((source.length + solved.length) % width, 0);
assert.equal(source.length % width, 12);
const M = Array.from({ length: width }, (_, i) => bytes.slice(width * i, width * (i + 1)).map(mod));
const I = inverse(M);
assert.ok(I);
const J = transpose(M);
const It = transpose(I);
const transforms = [
  ['inverse-M', I, M, 0.03445675137168418],
  ['direct-M', M, I, 0.03450783348153791],
  ['inverse-M-transposed', It, J, 0.03448024508334394],
  ['direct-M-transposed', J, It, 0.03449609856356964],
];

// Check every field basis vector and every matrix inverse relation.
for (let k = 0; k < width; k++) {
  const basis = Array.from({ length: width }, (_, j) => Number(j === k));
  assert.deepEqual(multiply(I, multiply(M, basis)), basis);
  assert.deepEqual(multiply(M, multiply(I, basis)), basis);
}

const usableLength = source.length - (source.length % width);
const solvedNative = corpus.pages[57].indices;
assert.equal(solvedNative.length, 95);
const plants = Array.from({ length: width * 6 }, (_, i) => solvedNative[i % solvedNative.length]);

const outcomes = [];
for (const [name, decoder, encoder, expected] of transforms) {
  const decoded = [];
  for (let start = 0; start < usableLength; start += width) {
    decoded.push(...multiply(decoder, source.slice(start, start + width)));
  }
  assert.equal(decoded.length, 12944);
  const ioc = coincidence(decoded);
  assert.ok(Math.abs(ioc - expected) < 1e-12);

  // An independently known 96-rune p57-derived native GP plant must survive
  // the exact proposed forward and inverse matrix, for each orientation.
  let recovered = [];
  for (let i = 0; i < plants.length; i += width) {
    recovered.push(...multiply(decoder, multiply(encoder, plants.slice(i, i + width))));
  }
  assert.deepEqual(recovered, plants);

  // Every 16-rune original ciphertext block must be reproduced exactly.
  for (let start = 0; start < usableLength; start += width) {
    const cipher = source.slice(start, start + width);
    assert.deepEqual(multiply(encoder, multiply(decoder, cipher)), cipher);
  }
  outcomes.push({ transform: name, originalIoC: ioc, prefixGP29: decoded.slice(0, 32).map((r) => corpus.translit[r]).join(' ') });
}
console.log(JSON.stringify({
  input: { gridCells: bytes.length, gridReshape: '16x16', unsolvedRunes: source.length, allLP2Runes: source.length + solved.length, fullUnknownBlocks: usableLength / width, incompleteUnknownTail: source.length % width },
  nativeReferenceIoC: coincidence(solvedNative),
  originalCiphertextIoC: coincidence(source),
  outcomes,
}, null, 2));
