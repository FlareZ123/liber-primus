/**
 * Original LP2 numbered p36–p38: historical 2014 7x7 / 1033 magic-square matrix.
 * SFT: node sims/lp2_numbered553_magic7_matrix_original_sft.cjs
 * Read-only; exact source, synthetic positive, and original forward replay.
 * @typedef {number[]} RuneTape
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
const units = [
  page(36).slice(99),
  page(37).slice(0, 91),
  page(37).slice(91, 189),
  [...page(37).slice(189), ...page(38).slice(0, 57)],
  page(38).slice(57, 186),
];
const lengths = units.map((u) => u.length);
assert.deepEqual(lengths, [139, 91, 98, 96, 129]);
const source = units.flat();
assert.equal(source.length, 553);
assert.equal(553, 7 * 79);
const raw = [
  [7, 375, 236, 190, 27, 17, 181],
  [351, 223, 14, 47, 293, 98, 7],
  [456, 232, 121, 114, 72, 23, 15],
  [16, 65, 270, 331, 270, 65, 16],
  [15, 23, 72, 114, 121, 232, 456],
  [7, 98, 293, 47, 14, 223, 351],
  [181, 17, 27, 190, 236, 375, 7],
];
for (let i = 0; i < 7; i++) {
  assert.equal(raw[i].reduce((a, b) => a + b, 0), 1033);
  assert.equal(raw.reduce((a, row) => a + row[i], 0), 1033);
}
const mod = (x) => ((x % 29) + 29) % 29;
const fieldInverse = (x) => {
  for (let k = 1; k < 29; k++) if (mod(x * k) === 1) return k;
  throw new Error('Singular pivot');
};
const matrix = raw.map((r) => r.map(mod));
const identity = Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (_, j) => +(i === j)));
const augmented = matrix.map((r, i) => [...r, ...identity[i]]);
for (let j = 0; j < 7; j++) {
  let pivot = j;
  while (pivot < 7 && augmented[pivot][j] === 0) pivot++;
  assert.ok(pivot < 7, 'historical square invertible mod29');
  [augmented[pivot], augmented[j]] = [augmented[j], augmented[pivot]];
  const factor = fieldInverse(augmented[j][j]);
  augmented[j] = augmented[j].map((x) => mod(x * factor));
  for (let k = 0; k < 7; k++) {
    if (k === j) continue;
    const scale = augmented[k][j];
    augmented[k] = augmented[k].map((x, t) => mod(x - scale * augmented[j][t]));
  }
}
const inverse = augmented.map((r) => r.slice(7));
const transform = (input, m, rowMajor) => {
  assert.equal(input.length, 553);
  const output = Array(553).fill(0);
  for (let i = 0; i < 79; i++) {
    const v = Array.from({ length: 7 }, (_, j) => input[rowMajor ? j * 79 + i : i * 7 + j]);
    for (let k = 0; k < 7; k++) {
      output[rowMajor ? k * 79 + i : i * 7 + k] = mod(m[k].reduce((s, value, j) => s + value * v[j], 0));
    }
  }
  return output;
};
const ioc = (array) => {
  const frequencies = Array(29).fill(0);
  for (const value of array) frequencies[value]++;
  return frequencies.reduce((s, v) => s + v * (v - 1), 0) / (array.length * (array.length - 1));
};
const native = Array.from({ length: 553 }, (_, i) => page(57)[i % page(57).length]);
const expected = {
  'seven-wide/inverse': 0.03439080640511571,
  'seven-wide/direct': 0.0344956364494064,
  'seven-rows/inverse': 0.03425976884975234,
  'seven-rows/direct': 0.03514427234845507,
};
assert.ok(Math.abs(ioc(source) - 0.03423356133867966) < 1e-12);
for (const [layout, rowMajor] of [['seven-wide', false], ['seven-rows', true]]) {
  for (const [direction, decoder, encoder] of [['inverse', inverse, matrix], ['direct', matrix, inverse]]) {
    const output = transform(source, decoder, rowMajor);
    assert.deepEqual(transform(output, encoder, rowMajor), source);
    const nativeCipher = transform(native, encoder, rowMajor);
    assert.deepEqual(transform(nativeCipher, decoder, rowMajor), native);
    const key = layout + '/' + direction;
    assert.ok(Math.abs(ioc(output) - expected[key]) < 1e-12);
    const prefix = output.slice(0, 35).map((j) => corpus.translit[j]).join(' ');
    console.log(JSON.stringify({ layout, direction, runes: output.length, originalIoc: ioc(output), roundTrip: true, nativePositive: true, prefix }));
  }
}
console.log('PASS: four source-motivated invertible matrix consumers; no native plaintext was recovered.');
