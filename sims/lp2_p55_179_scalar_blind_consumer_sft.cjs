#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page = corpus.pages.find((entry) => entry.page === 55);
assert.ok(page, 'canonical p55 page exists');
const ciphertext = page.indices;
assert.equal(ciphertext.length, 76);
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
assert.equal(mod(12 * 17, 29), 1, 'scalar inverse control');

function render(indices) {
  return indices.map((index) => corpus.translit[index]).join(' ');
}

const outputs = {};
for (const scalar of [12, 17]) {
  const plaintext = ciphertext.map((value) => mod(scalar * value, 29));
  outputs[String(scalar)] = {
    scalar,
    runeCount: plaintext.length,
    indices: plaintext,
    transliteration: render(plaintext)
  };
}

// Independent algebraic round-trip control on all 29 symbols.
const synthetic = Array.from({ length: 29 }, (_, i) => i);
assert.deepEqual(synthetic.map((x) => mod(17 * mod(12 * x, 29), 29)), synthetic);

console.log(JSON.stringify({
  page: 55,
  inputRuneCount: ciphertext.length,
  forwardScalar: 12,
  inverseScalar: 17,
  inverseVerified: true,
  outputs
}, null, 2));
