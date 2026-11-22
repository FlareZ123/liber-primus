'use strict';

/**
 * Original-source SFT for the literal rectangular-area key on LP2 physical p32.
 * Run from the repository root: node sims/lp2_p32_tree_rectangle_area_original_sft.cjs
 * Read only; no external packages or mutable output files.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const p32 = corpus.pages.find((page) => page.page === 32);
const p57 = corpus.pages.find((page) => page.page === 57);
const primes = corpus.prime;
const translit = corpus.translit;
assert.equal(p32.runic_count, 121);
assert.equal(p32.indices.length, 121);
assert.equal(primes.length, 29);
assert.ok(p57.indices.length >= 95);

const size = 11;
const row = p32.indices.slice(0, size).map((symbol) => primes[symbol]);
const column = Array.from({ length: size }, (_, r) => primes[p32.indices[r * size]]);
const sum = (values) => values.reduce((acc, value) => acc + value, 0);
assert.equal(sum(row), 563, 'original signed-JPEG width checksum');
assert.equal(sum(column), 569, 'original signed-JPEG height checksum');

const indices = [];
const key = [];
for (let r = 1; r < size; r += 1) {
  for (let c = 1; c < size; c += 1) {
    indices.push(r * size + c);
    key.push((column[r] * row[c]) % 29);
  }
}
assert.equal(indices.length, 100);
assert.equal(new Set(indices).size, 100);
const sourceInterior = indices.map((i) => p32.indices[i]);
const decodedSubtract = sourceInterior.map((value, i) => (value - key[i] + 29) % 29);
const decodedAdd = sourceInterior.map((value, i) => (value + key[i]) % 29);

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value] += 1;
  }
  return counts.reduce((acc, v) => acc + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values @returns {string} */
function display(values) {
  return values.map((index) => translit[index]).join('');
}
/** @param {number[]} plain @returns {number[]} */
function encryptArea(plain) {
  assert.equal(plain.length, 100);
  return plain.map((value, i) => (value + key[i]) % 29);
}
/** @param {number[]} cipher @returns {number[]} */
function decryptArea(cipher) {
  assert.equal(cipher.length, 100);
  return cipher.map((value, i) => (value - key[i] + 29) % 29);
}

assert.deepEqual(encryptArea(decodedSubtract), sourceInterior, 'original exact 100/100 re-encryption');
const nativePlant = Array.from({ length: 100 }, (_, i) => p57.indices[i % p57.indices.length]);
assert.deepEqual(decryptArea(encryptArea(nativePlant)), nativePlant, 'actual p57 GP positive 100/100');
const expected = {
  raw: 0.03434343434343434,
  subtract: 0.03333333333333333,
  add: 0.03373737373737374
};
for (const [name, values] of Object.entries({
  raw: sourceInterior, subtract: decodedSubtract, add: decodedAdd
})) {
  assert.ok(Math.abs(ioc(values) - expected[name]) < 1e-14, name);
}
console.log(JSON.stringify({
  source: 'original LP2 p32, row-major 11x11, first row and first column as prime-pixel strip widths',
  signedDimensions: { width: sum(row), height: sum(column) },
  axisX: row, axisY: column,
  recipientPositionsZeroBased: indices,
  keyAreaModulo29: key,
  originalInterior: display(sourceInterior),
  subtract: { ioc: ioc(decodedSubtract), transliteration: display(decodedSubtract) },
  add: { ioc: ioc(decodedAdd), transliteration: display(decodedAdd) },
  sourceFullReencryption: true,
  nativeP57PlantRecovery: '100/100',
  scope: 'One hypothesized unsigned numeric area pad; no creator instruction selects area as cipher key.'
}, null, 2));
