#!/usr/bin/env node
'use strict';

// Source-motivated direct three-symbol GP29 key from p57's three clause
// remainders [361,133,331] (mod 449), reduced modulo 29. No phase,
// permutation, alternate alphabet or fitted key is searched.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page55 = corpus.pages.find(p => p.page === 55);
assert.equal(page55.indices.length, 76);
const mod = (x, m) => ((x % m) + m) % m;
const clausePrimeSums = [1259, 1031, 1229];
const headingPrimeSum = 449;
const clauseRemainders = clausePrimeSums.map(x => mod(x, headingPrimeSum));
assert.deepEqual(clauseRemainders, [361, 133, 331]);
const key = clauseRemainders.map(x => mod(x, 29));
assert.deepEqual(key, [13, 17, 12]);
function ioc(seq) {
  const f = Array(29).fill(0);
  for (const x of seq) f[x]++;
  return f.reduce((sum, n) => sum + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
function decrypt(cipher, sign) {
  return cipher.map((c, i) => mod(c + sign * key[i % key.length], 29));
}
function encrypt(plain, sign) {
  return plain.map((p, i) => mod(p - sign * key[i % key.length], 29));
}
const rawIoC = ioc(page55.indices);
const results = [];
for (const sign of [-1, 1]) {
  const plain = decrypt(page55.indices, sign);
  assert.deepEqual(encrypt(plain, sign), page55.indices);
  const plant = Array.from({length: 76}, (_, i) => i % 29);
  assert.deepEqual(decrypt(encrypt(plant, sign), sign), plant);
  results.push({
    operation: sign === -1 ? 'P=C-K' : 'P=C+K',
    sign,
    ioc: ioc(plain),
    transliteration: plain.map(i => corpus.translit[i]).join(' ')
  });
}
assert.equal(results.length, 2);
assert(results.every(r => r.ioc < rawIoC));
console.log(JSON.stringify({
  sourceClausePrimeSums: clausePrimeSums,
  headingPrimeSum,
  clauseRemainders,
  gp29Key: key,
  p55RuneCount: page55.indices.length,
  rawIoC,
  results,
  conclusion: 'Both fixed phase-zero additive readings are nonlinguistic and reduce IoC; no p55 plaintext recovered.'
}, null, 2));
