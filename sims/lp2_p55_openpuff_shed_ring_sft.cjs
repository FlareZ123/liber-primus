/**
 * A source-locked LP2 p55 test using the 2014 OpenPuff magic squares.
 * Run: node sims/lp2_p55_openpuff_shed_ring_sft.cjs
 * CommonJS; no dependencies or files written.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }

/** @param {number} n @returns {number} */
function totient(n) {
  let rest = n, value = n;
  for (let divisor = 2; divisor * divisor <= rest; divisor++) {
    if (rest % divisor === 0) {
      while (rest % divisor === 0) rest /= divisor;
      value -= value / divisor;
    }
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  data.forEach((v) => counts[v]++);
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (data.length * (data.length - 1));
}

assert.equal(Buffer.byteLength(raw, 'utf8'), 745);
const matrices = raw.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map((m) => m.map((r) => r.length)), [
  [5, 5, 5, 5, 5], [7, 7, 7, 7, 7, 7, 7], [5, 5, 5, 5, 5],
]);
assert.deepEqual(matrices.map((m) => m[0].reduce((a, b) => a + b, 0)), [3301, 1033, 1033]);

// Shed the 7x7's outer ring; concatenate the resulting three 5x5
// matrices in printed document order, each in printed row-major order.
const selected = [
  ...matrices[0].flat(),
  ...matrices[1].slice(1, -1).flatMap((row) => row.slice(1, -1)),
  ...matrices[2].flat(),
];
assert.equal(selected.length, 75);
const full55 = corpus.pages[55].indices;
assert.equal(full55.length, 76);
assert.equal(full55[0], 21);
assert.deepEqual(full55.slice(-6), [23, 11, 1, 17, 18, 10]);
const cipher = full55.slice(1);
assert.equal(cipher.length, 75);
const parable = corpus.pages[57].indices;
assert.equal(parable.length, 95);

for (const [label, key] of [
  ['numeric-residue', selected.map(mod29)],
  ['LP1-Wisdom-totient', selected.map((n) => mod29(totient(n)))],
]) {
  // Native-GP positive plant using 75 original clear p57 symbols.
  const expected = parable.slice(0, 75);
  const plantCipher = expected.map((v, i) => mod29(v + key[i]));
  assert.deepEqual(plantCipher.map((v, i) => mod29(v - key[i])), expected);

  // Original, unmodified p55 rune input. No phase, order or skip fitting.
  const decoded = cipher.map((v, i) => mod29(v - key[i]));
  assert.deepEqual(decoded.map((v, i) => mod29(v + key[i])), cipher);
  console.log('\nModel: ' + label);
  console.log('Key (75 modulo-29 values): ' + key.join(','));
  console.log('Native p57 plant and inverse: 75/75');
  console.log('Original p55 re-encryption: 75/75');
  console.log('Original p55 IoC: ' + ioc(cipher).toFixed(8));
  console.log('Decoded p55 IoC: ' + ioc(decoded).toFixed(8));
  console.log('Decoded p55 indices: ' + decoded.join(','));
  console.log('Decoded p55: ' + decoded.map((v) => corpus.translit[v]).join(''));
}

// Exact known p56 prime-totient control before the first literal F.
const p56Start = corpus.pages[56].indices.slice(0, 10).map(
  (v, i) => mod29(v - (corpus.prime[i] - 1)));
assert.equal(p56Start.map((v) => corpus.translit[v]).join(''), 'ANENDWITHIN');
console.log('\nOriginal p56 solved control: ANENDWITHIN (10/10)');
console.log('No unknown-LP2 plaintext is claimed by this test.');
