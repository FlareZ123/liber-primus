#!/usr/bin/env node
'use strict';

// Exact original-input LCM-square and frozen Hill-23 receiver test.
// No inferred text, letter-key fitting, parameter sweeps or mutable data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {any} */
const source = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = source('resources/liber-primus/lp2-corpus.json');
const grid = source('resources/liber-primus/lp2-grid-256.json');
const ink = source('resources/liber-primus/lp2-ink-annotations.json');
const mod = number => ((number % 29) + 29) % 29;
/** @param {number} a @returns {number} */
function invert(a) {
  assert.notEqual(mod(a), 0);
  for (let n = 1; n < 29; n++) if (mod(a * n) === 1) return n;
  throw new Error('non-invertible');
}
/** @param {number[]} A @param {number[]} B */
function multiply(A, B) {
  const result = Array(A.length + B.length - 1).fill(0);
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) {
    result[i + j] = mod(result[i + j] + A[i] * B[j]);
  }
  return result;
}
/** @param {number[]} dividend @param {number[]} divisor */
function divide(dividend, divisor) {
  const remainder = dividend.slice();
  const quotient = [];
  const unit = invert(divisor[0]);
  for (let i = 0; i <= dividend.length - divisor.length; i++) {
    const factor = mod(remainder[i] * unit);
    quotient.push(factor);
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - factor * divisor[j]);
    }
  }
  return {quotient, remainder: remainder.slice(quotient.length)};
}
/** @param {number[][]} matrix */
function inverse(matrix) {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row, ...Array.from({length: n}, (_, j) => Number(i === j))
  ]);
  let rank = 0;
  let determinant = 1;
  for (let col = 0; col < n; col++) {
    let pivot = rank;
    while (pivot < n && augmented[pivot][col] === 0) pivot++;
    if (pivot === n) continue;
    if (pivot !== rank) {
      [augmented[pivot], augmented[rank]] = [augmented[rank], augmented[pivot]];
      determinant = mod(-determinant);
    }
    const element = augmented[rank][col];
    determinant = mod(determinant * element);
    const unit = invert(element);
    for (let j = 0; j < n * 2; j++) {
      augmented[rank][j] = mod(augmented[rank][j] * unit);
    }
    for (let row = 0; row < n; row++) {
      if (row === rank) continue;
      const multiple = augmented[row][col];
      for (let j = 0; j < n * 2; j++) {
        augmented[row][j] = mod(augmented[row][j] - multiple * augmented[rank][j]);
      }
    }
    rank++;
  }
  return {rank, determinant: rank === n ? determinant : 0,
    inverse: augmented.map(row => row.slice(n))};
}
/** @param {number[]} runes */
function coincidence(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}
const text = digits => digits.map(n => corpus.translit[n]).join(' ');
const p29 = corpus.pages.find(page => page.page === 29).indices;
const p39 = corpus.pages.find(page => page.page === 39).indices;
const p39Red = ink.pages.find(page => page.page === 39).red_spans;
assert.equal(p29.length, 277);
assert.equal(p39Red.length, 1);
assert.equal(p39Red[0].start, 119);
assert.equal(p39Red[0].length, 3);
const red = p39.slice(119, 122);
assert.deepEqual(red, [27, 5, 15]);
const G = red.slice().reverse(); // Printed low-degree-first source polynomial.
assert.deepEqual(G, [15, 5, 27]);
assert.deepEqual(G, [15, mod(-30 * 24), mod(15 * 24 * 24)]);
const tokens = grid.pages.flatMap(page => page.tokens);
const sourceBytes = grid.pages.flatMap(page => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(sourceBytes.length, 256);
assert.equal(grid.alphabet.length, 60);
assert.deepEqual(tokens.slice(0, 3), ['3N', '3p', '2l']);
for (let i = 0; i < 256; i++) {
  const token = tokens[i];
  assert.equal(token.length, 2);
  const byte = 60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]);
  assert.equal(byte, sourceBytes[i], 'printed table byte ' + i);
  assert.ok(byte >= 0 && byte < 256);
}
const tableHash = crypto.createHash('sha256').update(Buffer.from(sourceBytes)).digest('hex');
assert.equal(tableHash, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const table = sourceBytes.map(mod);
assert.equal(table[0], 0);
const base59Alphabet = grid.alphabet.replace('f', '');
assert.equal(base59Alphabet.length, 59);
const base59 = tokens.map(token => {
  assert.ok(base59Alphabet.includes(token[0]) && base59Alphabet.includes(token[1]));
  return 59 * base59Alphabet.indexOf(token[0]) + base59Alphabet.indexOf(token[1]);
}).map(mod);
assert.equal(base59[0], 26);
assert.notDeepEqual(divide(base59, G).remainder, [0, 0]);
const quotientP = divide(p29, G);
const quotientT = divide(table, G);
assert.deepEqual(quotientP.remainder, [0, 0]);
assert.deepEqual(quotientT.remainder, [0, 0]);
assert.deepEqual(multiply(quotientP.quotient, G), p29);
assert.deepEqual(multiply(quotientT.quotient, G), table);
assert.equal(quotientP.quotient.length, 275);
assert.equal(quotientT.quotient.length, 254);
assert.equal(quotientT.quotient[0], 0);

// P29*T/G is the source-derived polynomial lcm up to a constant scalar.
// Both operands have exactly the same G and no further common factor.
const paddedLCM = multiply(p29, quotientT.quotient);
assert.equal(paddedLCM.length, 530);
assert.equal(paddedLCM[0], 0);
const lcm = paddedLCM.slice(1);
assert.equal(lcm.length, 529);
assert.equal(529, 23 * 23);
assert.deepEqual(multiply(lcm, G), multiply(p29, table).slice(1));
assert.deepEqual(lcm.slice(0, 5), [25, 24, 9, 19, 18]);
assert.equal(lcm[264], 3);
const matrix = Array.from({length: 23}, (_, row) =>
  lcm.slice(23 * row, 23 * (row + 1)));
const matrixData = inverse(matrix);
assert.equal(matrixData.rank, 23);
assert.equal(matrixData.determinant, 1);
const unit = Array.from({length: 23}, (_, i) =>
  Array.from({length: 23}, (_, j) => Number(i === j)));
const product = (A, B) => Array.from({length: 23}, (_, i) =>
  Array.from({length: 23}, (_, j) =>
    mod(A[i].reduce((sum, value, k) => sum + value * B[k][j], 0))));
assert.deepEqual(product(matrix, matrixData.inverse), unit);
assert.deepEqual(product(matrixData.inverse, matrix), unit);

/**
 * Frozen global 23-rune Hill blocks. Row and column conventions both
 * covered; the 0..6 final incomplete symbols pass through transparently.
 * @param {number[]} input
 * @param {number[][]} M
 * @param {boolean} transpose
 */
function transform(input, M, transpose) {
  const output = input.slice();
  for (let offset = 0; offset + 23 <= input.length; offset += 23) {
    for (let out = 0; out < 23; out++) {
      let total = 0;
      for (let col = 0; col < 23; col++) {
        const coefficient = transpose ? M[col][out] : M[out][col];
        total += coefficient * input[offset + col];
      }
      output[offset + out] = mod(total);
    }
  }
  return output;
}

const unknownPages = corpus.pages.filter(page => page.page >= 0 &&
  page.page <= 55 && page.page !== 50);
assert.equal(unknownPages.length, 55);
const unknown = unknownPages.flatMap(page => page.indices);
assert.equal(unknown.length, 12956);
const offsets = new Map();
let running = 0;
for (const page of unknownPages) {
  offsets.set(page.page, running);
  running += page.indices.length;
}
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
const planted = Array.from({length: 12956}, (_, index) => p57[index % p57.length]);
const originalResults = [];
for (const transpose of [false, true]) {
  const decoded = transform(unknown, matrixData.inverse, transpose);
  assert.deepEqual(transform(decoded, matrix, transpose), unknown);
  const encryptedPlant = transform(planted, matrix, transpose);
  assert.deepEqual(transform(encryptedPlant, matrixData.inverse, transpose), planted);
  // A separate actual solved-page plant, with a three-rune partial final block.
  assert.deepEqual(transform(transform(p57, matrix, transpose),
    matrixData.inverse, transpose), p57);
  const p0 = decoded.slice(offsets.get(0), offsets.get(1));
  const p55 = decoded.slice(offsets.get(55));
  originalResults.push({
    matrixOrientation: transpose ? 'transposed' : 'printed-rows',
    originalRuneIoC: coincidence(decoded),
    sourceLCMIoC: coincidence(lcm),
    p0IoC: coincidence(p0),
    p55IoC: coincidence(p55),
    first69: text(decoded.slice(0, 69)),
    terminal76: text(p55),
    plaintextRecovered: false,
    fullOriginalForwardReplay: '12956/12956',
    plantedExactInversion: '12956/12956',
    solvedP57PlantExactInversion: '95/95'
  });
}
console.log(JSON.stringify({
  test: 'Original p29/table shared-root polynomial LCM gives 23x23 finite-field Hill matrix',
  source: {p29RuneLength: 277, p50ByteLength: 256, p50Base60ByteSha256: tableHash,
    p39RedIndices: red, sharedGHighFirst: G, commonRoot: 24,
    p29GQuotientLength: 275, p50GQuotientLength: 254,
    physicalTableMod29LeadingZero: table[0], base59LeadingResidue: base59[0],
    base59SharesSourceG: false, lcmDegree: 528,
    lcmCoefficientCount: 529, matrixDimensions: '23 x 23',
    matrixRank: matrixData.rank, matrixDeterminantMod29: matrixData.determinant,
    squareCenterGP29: lcm[264]},
  originalRunes: unknown.length, unusedTerminalPartialBlock: unknown.length % 23,
  originalResults,
  conclusion: 'Source-derived algebra yields a reversible GF29 matrix but no readable original LP2 plaintext by either frozen Hill23 orientation. The square/Hill interpretation is not author-authenticated.'
}, null, 2));
