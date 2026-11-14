#!/usr/bin/env node
'use strict';

// Frozen direct interpretation of the literal MOBIUS cell in the original
// 2014 LP1 p05 Wisdom table: K[i] = mu(square[i]) mod 29, row-major,
// period 25, zero phase. This tests only a direct additive GP29 consumer.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(
  fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8')
);
const page = corpus.pages.find((p) => p.page === 55);
assert(page, 'canonical physical p55 must exist');

const ciphertext = page.indices;
assert.equal(ciphertext.length, 76, 'p55 has 76 printed runes');
assert.equal(corpus.translit[ciphertext[0]], 'NG', 'first rune is inherited NG');
const fPositions = ciphertext
  .map((rune, i) => rune === 0 ? i : -1)
  .filter((i) => i >= 0);
assert.deepEqual(fPositions, [15, 25, 41]);

// Exact 2014 Stage04 5x5 square, flattened in printed row-major order.
const square = [
  272, 138, 341, 131, 151,
  366, 199, 130, 320, 18,
  226, 245, 91, 245, 226,
  18, 320, 130, 199, 366,
  151, 131, 341, 138, 272,
];

function mod29(x) {
  return ((x % 29) + 29) % 29;
}

function mobius(n) {
  let sign = 1;
  for (let p = 2; p * p <= n; p += 1) {
    if (n % p !== 0) continue;
    n /= p;
    sign = -sign;
    if (n % p === 0) return 0;
    while (n % p === 0) n /= p;
  }
  if (n > 1) sign = -sign;
  return sign;
}

function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const value of values) frequencies[value] += 1;
  const numerator = frequencies.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

const muValues = square.map(mobius);
const key = muValues.map(mod29);
assert.deepEqual(muValues, [
  0, -1, 1, -1, -1, -1, -1, -1, 0, 0,
  1, 0, 1, 0, 1, 0, 0, -1, -1, -1,
  -1, -1, 1, -1, 0,
]);
assert.deepEqual(key, [
  0, 28, 1, 28, 28, 28, 28, 28, 0, 0,
  1, 0, 1, 0, 1, 0, 0, 28, 28, 28,
  28, 28, 1, 28, 0,
]);

const framings = [
  { name: 'full76', input: ciphertext },
  { name: 'body75', input: ciphertext.slice(1) },
];
const signs = [
  { name: 'subtract', sign: -1 },
  { name: 'add', sign: 1 },
];

const results = [];
for (const framing of framings) {
  for (const direction of signs) {
    const plaintext = framing.input.map((c, i) =>
      mod29(c + direction.sign * key[i % key.length])
    );
    const reencryption = plaintext.map((p, i) =>
      mod29(p - direction.sign * key[i % key.length])
    );
    assert.deepEqual(reencryption, framing.input);
    results.push({
      framing: framing.name,
      inverse: direction.name,
      length: plaintext.length,
      ioc: ioc(plaintext),
      transliteration: plaintext.map((rune) => corpus.translit[rune]).join(''),
      exactReencryption: true,
    });
  }
}

const output = {
  source: 'resources/liber-primus/lp2-corpus.json physical page 55',
  square,
  muValues,
  keyModulo29: key,
  keyCounts: {
    zero: muValues.filter((x) => x === 0).length,
    plusOne: muValues.filter((x) => x === 1).length,
    minusOne: muValues.filter((x) => x === -1).length,
  },
  originalIoC: {
    full76: ioc(ciphertext),
    body75: ioc(ciphertext.slice(1)),
  },
  results,
  note: 'Exact re-encryption is an implementation check, not evidence of key identification.',
};
console.log(JSON.stringify(output, null, 2));
