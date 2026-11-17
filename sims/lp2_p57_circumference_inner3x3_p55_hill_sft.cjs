#!/usr/bin/env node
'use strict';

// Test the literal "shed the circumference" reading of the candidate p50
// 5x5 frame: retain its central 3x3 as a Hill-3 key for p55's 75-rune
// complete-word suffix. This is a bounded hypothesis test, not a solution.
// Run from repository root: node sims/lp2_p57_circumference_inner3x3_p55_hill_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (file) => JSON.parse(fs.readFileSync(path.join(process.cwd(), file), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const tokens = grid.rows.flat();
const alphabet = grid.alphabet.replace('f', '');
const mod = (n) => ((n % 29) + 29) % 29;

function cellValue(token) {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  return a * 59 + b;
}

const five = Array.from({ length: 5 }, (_, r) =>
  Array.from({ length: 5 }, (_, c) => cellValue(tokens[(21 + r) * 8 + 1 + c])));
assert.deepEqual([five[0][0], five[0][4], five[4][0], five[4][4]], [224, 115, 73, 75]);
const key = five.slice(1, 4).map(row => row.slice(1, 4).map(mod));
assert.deepEqual(key, [[18, 27, 26], [19, 22, 9], [12, 1, 28]]);

function determinant3(a) {
  return mod(
    a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
    a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
    a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0])
  );
}

function inverse3(matrix) {
  const a = matrix.map((row, i) => row.concat([0, 0, 0].map((_, j) => Number(i === j))));
  for (let col = 0; col < 3; col++) {
    let pivot = col;
    while (pivot < 3 && a[pivot][col] === 0) pivot++;
    assert(pivot < 3, 'Central 3x3 key is singular over GP29');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const p = a[col][col];
    let reciprocal = 0;
    while (mod(reciprocal * p) !== 1) reciprocal++;
    a[col] = a[col].map(x => mod(x * reciprocal));
    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const multiple = a[row][col];
      a[row] = a[row].map((x, j) => mod(x - multiple * a[col][j]));
    }
  }
  return a.map(row => row.slice(3));
}

function multiply3(a, b) {
  return a.map(row => b[0].map((_, col) =>
    mod(row.reduce((sum, x, k) => sum + x * b[k][col], 0))
  ));
}

function transform(values, matrix, side) {
  assert.equal(values.length % 3, 0);
  const out = [];
  for (let i = 0; i < values.length; i += 3) {
    const v = values.slice(i, i + 3);
    if (side === 'left') {
      for (let r = 0; r < 3; r++) out.push(mod(matrix[r].reduce((s, x, j) => s + x * v[j], 0)));
    } else {
      for (let c = 0; c < 3; c++) out.push(mod(v.reduce((s, x, r) => s + x * matrix[r][c], 0)));
    }
  }
  return out;
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const inverse = inverse3(key);
assert.equal(determinant3(key), 10);
assert.deepEqual(multiply3(key, inverse), [[1,0,0],[0,1,0],[0,0,1]]);

const p55 = corpus.pages.find(p => p.page === 55).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(corpus.translit[p55[0]], 'NG'); // carry from p54
const original = p55.slice(1);
const clearControl = p57.slice(0, 75);
assert.equal(original.length, 75);
assert.equal(clearControl.length, 75);

const outcomes = [];
for (const [decodeName, decodeMatrix, encodeMatrix] of [
  ['K^-1', inverse, key],
  ['K', key, inverse]
]) {
  for (const side of ['left', 'right']) {
    const decoded = transform(original, decodeMatrix, side);
    const reconstructed = transform(decoded, encodeMatrix, side);
    assert.deepEqual(reconstructed, original);

    const plantedCipher = transform(clearControl, encodeMatrix, side);
    const recoveredPlant = transform(plantedCipher, decodeMatrix, side);
    assert.deepEqual(recoveredPlant, clearControl);

    outcomes.push({
      decodeMatrix: decodeName,
      multiplication: side,
      originalIoC: ioc(decoded),
      output: decoded.map(x => corpus.translit[x]).join(''),
      exactOriginalRoundTrip: true,
      clearP57PlantRecovered: true
    });
  }
}

assert(outcomes.every(x => x.originalIoC < 0.038));
console.log(JSON.stringify({
  sourceSquareBase59: five,
  central3x3GP29Key: key,
  determinantModulo29: determinant3(key),
  inverseModulo29: inverse,
  originalP55SuffixLength: original.length,
  originalP55SuffixIoC: ioc(original),
  clearP57IoC: ioc(p57),
  outcomes,
  conclusion: 'All four standard page-local Hill-3 variants fail to produce coherent original plaintext.'
}, null, 2));
