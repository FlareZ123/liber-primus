'use strict';
/**
 * Literal original LP1 p05 reverse-trailer byte-key candidates on all unknown LP2.
 * Source-frozen mappings and book-global clock, Node.js builtins only.
 * Usage: node sims/lp1_p05_jpeg_trailer_original_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'resources', 'liber-primus', '05.jpg'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const eoi = raw.lastIndexOf(Buffer.from([0xff, 0xd9]));
const key = raw.subarray(eoi + 2);
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7');
assert.equal(eoi, 600364);
assert.equal(key.length, 72700);
for (let i = 0; i < key.length; i++) assert.equal(key[i], raw[key.length - 1 - i]);

const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);

/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (n * (n - 1));
}

/** @param {number[]} values @returns {string} */
function prefix(values) {
  return values.slice(0, 40).map(i => corpus.translit[i]).join(' ');
}

const minus = ciphertext.map((c, i) => (c - key[i] % 29 + 29) % 29);
const plus = ciphertext.map((c, i) => (c + key[i] % 29) % 29);
const prevExcluded = [];
let repeats = 0;
for (let i = 0; i < ciphertext.length; i++) {
  const c = ciphertext[i];
  if (i && c === ciphertext[i - 1]) { repeats++; continue; }
  const rank = i ? c - Number(c > ciphertext[i - 1]) : c;
  prevExcluded.push((rank - key[i] % 28 + 28) % 28);
}
assert.equal(repeats, 86);
console.log('Original IoC:', indexOfCoincidence(ciphertext));
for (const [name, values] of [
  ['literal tail bytes mod29, subtract', minus],
  ['literal tail bytes mod29, add', plus],
  ['literal tail bytes mod28, predecessor-exclusion eligible positions', prevExcluded],
]) {
  console.log(name + ': N=' + values.length + '; IoC=' +
      indexOfCoincidence(values) + '; prefix=' + prefix(values));
}
