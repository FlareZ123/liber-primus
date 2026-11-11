'use strict';

/**
 * Single-file test (SFT): 2014 Onion2 bytes as per-fragment GP29 additive keys.
 * Exact original-image-derived 31 markers are handled in physical order.
 * Method is exploratory: signed 2013 BASE29 does not authenticate this transfer.
 * Run: node sims/onion2_rows_32fragment_base29_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file @returns {any} */
function resource(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'));
}
const source = resource('resources/cicada2014-onion2-timing.json');
const ink = resource('resources/liber-primus/lp2-ink-annotations.json');
const corpus = resource('resources/liber-primus/lp2-corpus.json');
const sourceBytes = source.final_hex.match(/../g).map(x => parseInt(x, 16));
assert.equal(sourceBytes.length, 256);

const offsetByPage = new Map();
let total = 0;
for (const page of corpus.pages) {
  offsetByPage.set(page.page, total);
  total += page.indices.length;
}
assert.equal(total, 13136);
const full = corpus.pages.flatMap(p => p.indices);
const marks = ink.pages.flatMap(p =>
  (p.large_punctuation || []).filter(item => item[1] === 13)
    .map(item => offsetByPage.get(p.page) + item[0])).sort((a, b) => a - b);
assert.equal(marks.length, 31);
const boundaries = [0, ...marks, full.length];
const fragments = boundaries.slice(1).map((end, i) =>
  full.slice(boundaries[i], end));
assert.equal(fragments.length, 32);
assert.deepEqual(fragments.map((a, i) => a.length === 0 ? i : -1)
  .filter(i => i >= 0), [8, 11]);

/** @type {number[][]} */
const keyRows = Array.from({length:32}, (_, i) =>
  sourceBytes.slice(8 * i, 8 * i + 8)
    .flatMap(byte => [Math.floor(byte / 29), byte % 29]));
assert.ok(keyRows.every(row => row.length === 16 &&
  row.every(digit => Number.isInteger(digit) && digit >= 0 && digit < 29)));
/** @param {number[]} runes @param {number[]} key @returns {number[]} */
function decode(runes, key) {
  return runes.map((c, i) => (c - key[i % key.length] + 29) % 29);
}
/** @param {number[]} runes @param {number[]} key @returns {number[]} */
function encode(runes, key) {
  return runes.map((p, i) => (p + key[i % key.length]) % 29);
}
const decoded = fragments.map((fragment, i) => decode(fragment, keyRows[i]));
const wrong = fragments.map((fragment, i) => decode(fragment, keyRows[(i + 1) % 32]));
for (let i = 0; i < fragments.length; i++) {
  assert.deepEqual(encode(decoded[i], keyRows[i]), fragments[i],
    'original source reencryption must be exact');
}
const unknownCount = corpus.pages.filter(p => p.status === 'unsolved')
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(unknownCount, 12956);
const origUnsolved = full.slice(0, unknownCount);
const plainUnsolved = decoded.flat().slice(0, unknownCount);
const wrongUnsolved = wrong.flat().slice(0, unknownCount);
assert.equal(plainUnsolved.length, 12956);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = Array(29).fill(0);
  for (const rune of a) count[rune]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @returns {number} */
function repeats(a) {
  let count = 0;
  for (let i = 1; i < a.length; i++) count += Number(a[i] === a[i-1]);
  return count / (a.length - 1);
}
const gpControl = corpus.pages.find(p => p.page === 57).indices;
const planted = encode(gpControl, keyRows[31]);
assert.deepEqual(decode(planted, keyRows[31]), gpControl,
  'independent solved-page control must recover exact native rune text');
assert.notDeepEqual(decode(planted, keyRows[30]), gpControl,
  'wrong-row control should not recover planted text');

console.log('Onion2 source bytes', sourceBytes.length);
console.log('Original 13-dot marks', marks.length);
console.log('Fragments', fragments.length, 'lengths', fragments.map(a => a.length).join(','));
console.log('Original unsolved rune count', unknownCount);
for (const [name, a] of [['original ciphertext', origUnsolved],
  ['fixed BASE29 inverse', plainUnsolved], ['wrong next-row inverse', wrongUnsolved],
  ['native solved p57', gpControl]]) {
  console.log(name, 'IoC', ioc(a).toFixed(9),
    'adjacent repeats', repeats(a).toFixed(9));
}
assert.ok(Math.abs(ioc(plainUnsolved) - 1 / 29) < 0.00025,
  'original inverse lacks measurable English-GP uniformity departure');
assert.ok(ioc(gpControl) > 0.055,
  'solved native reference must be recognizably nonuniform');
console.log('PASS planted positive and exact original reencryption; original decode is nonlinguistic');
