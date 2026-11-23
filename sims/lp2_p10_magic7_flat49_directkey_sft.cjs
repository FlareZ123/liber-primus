/**
 * Full original LP2 p8–p14 inverse with source-ordered 2014 7×7 magic-square
 * entries as one 49-symbol repeating additive GP29 key.
 *
 * No file writes, guessed phase, adjusted page breaks, IV or language fitting.
 * Run: node sims/lp2_p10_magic7_flat49_directkey_sft.cjs
 *
 * @typedef {{page:number,indices:number[]}} Page
 * @typedef {{pages:Page[],translit:string[]}} Corpus
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(
  path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');
const rows = source.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/)
  .map(Number)).filter(row => row.length === 7);
assert.equal(rows.length, 7, 'one original 7x7 square');
assert.deepEqual(rows.map(row => row.reduce((a, b) => a + b, 0)),
  Array(7).fill(1033));
for (let col = 0; col < 7; col++) {
  assert.equal(rows.reduce((v, row) => v + row[col], 0), 1033);
}
const key = rows.flat().map(x => x % 29);
assert.equal(key.length, 49);
assert.equal(rows[0][0], 7);
assert.equal(rows[6][6], 7);
const pages = corpus.pages.filter(page => page.page >= 8 && page.page <= 14);
assert.deepEqual(pages.map(page => page.indices.length),
  [255, 268, 263, 273, 261, 272, 137]);
const cipher = pages.flatMap(page => page.indices);
assert.equal(cipher.length, 1729);
const norm = x => (x % 29 + 29) % 29;

/**
 * @param {number[]} values
 * @param {number} sign
 * @returns {number[]}
 */
function transform(values, sign) {
  return values.map((n, i) => norm(n + sign * key[i % key.length]));
}

/** @param {number[]} values */
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
for (const sign of [-1, 1]) {
  const plain = transform(cipher, sign);
  assert.deepEqual(transform(plain, -sign), cipher);
  const actual = [
    ioc(plain), ioc(plain.slice(0, 250)),
    ioc(plain.slice(500, 750)), ioc(plain.slice(-250)),
  ];
  const expected = sign === -1 ?
    [0.034565580618212195, 0.0331566265060241,
      0.03450602409638554, 0.03312449799196787] :
    [0.03472423044791466, 0.03415261044176707,
      0.035341365461847386, 0.034473895582329314];
  for (let k = 0; k < expected.length; k++) {
    assert.ok(Math.abs(actual[k] - expected[k]) < 1e-12);
  }
  console.log(`sign=${sign} IoC=[${actual.map(x => x.toFixed(9)).join(',')}]`);
  console.log('first 70 native GP runes:', plain.slice(0, 70)
    .map(n => corpus.translit[n]).join('-'));
}

const known = corpus.pages.find(page => page.page === 57);
assert.ok(known && known.indices.length === 95);
const plant = transform(known.indices, 1);
assert.deepEqual(transform(plant, -1), known.indices);
console.log('PASS: 1,729/1,729 original inverse-forward replay on both signs');
console.log('PASS: 95/95 independent authentic p57 clear-rune plant');
console.log('Result: flat, nonlinguistic original output for this exact 49-key interpretation');
