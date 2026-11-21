'use strict';

/**
 * SFT: original p50 dual-radix gap, fixed 75-byte p55 recipient.
 * Run from repository root with Node.js 22 on Windows.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const full = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const dropF = full.replace('f', '');
const tokens = grid.rows.flat();
assert.equal(grid.alphabet, full);
assert.equal(tokens.length, 256);
assert.equal(corpus.pages[55].runic_count, 76);
assert.equal(corpus.pages[57].runic_count, 95);

/** @param {string} token @param {string} alphabet */
function value(token, alphabet) {
  return alphabet.length * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
}

/** @param {number} x */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number[]} digits */
function base5Bytes(digits) {
  let number = 0n;
  for (const d of digits) {
    assert.ok(d >= 0 && d < 5);
    number = 5n * number + BigInt(d);
  }
  const result = [];
  while (number > 0n) {
    result.push(Number(number & 255n));
    number >>= 8n;
  }
  return Buffer.from(result.reverse());
}

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const n of values) counts[n]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/**
 * @param {number[]} ciphertext 76 runes, first rune used as predecessor
 * @param {number[]} key 75 GP residues
 * @param {boolean} chained
 * @param {number} sign +1 or -1
 */
function decrypt(ciphertext, key, chained, sign) {
  return key.map((k, i) => {
    const value = chained ? mod29(ciphertext[i + 1] - ciphertext[i]) : ciphertext[i + 1];
    return mod29(value + sign * k);
  });
}

/**
 * @param {number[]} plain 75 GP runes
 * @param {number[]} key 75 GP residues
 * @param {boolean} chained
 * @param {number} sign +1 or -1
 * @param {number} initial original first p55 rune
 */
function encrypt(plain, key, chained, sign, initial) {
  const output = [initial];
  for (let i = 0; i < plain.length; i++) {
    const delta = mod29(plain[i] - sign * key[i]);
    output.push(chained ? mod29(output[i] + delta) : delta);
  }
  return output;
}

const gap = tokens.map(t => value(t, full) - value(t, dropF));
assert.deepEqual(
  Array.from({ length: 5 }, (_, i) => gap.filter(x => x === i).length),
  [36, 62, 62, 63, 33]
);
assert.equal(Math.max(...gap), 4);
const c55 = corpus.pages[55].indices;
const clearPlant = corpus.pages[57].indices.slice(0, 75);
assert.equal(c55.length, 76);
assert.equal(clearPlant.length, 75);
const bytereads = [
  ['printed', base5Bytes(gap)],
  ['reverse-digits', base5Bytes([...gap].reverse())],
];

console.log('Original p50 source 256 cells; gap histogram [36,62,62,63,33]');
console.log('Base5 256-digit numeric length', 256 * Math.log2(5), 'bits (upper bound 75 bytes)');
console.log('Original p55 red-initial plus 75 other ciphertext runes');
console.log('C55 first rune', c55[0], 'source p57 plant size', clearPlant.length);

for (const [orientation, raw] of bytereads) {
  assert.equal(raw.length, 75);
  const key = [...raw].map(v => v % 29);
  console.log(orientation, 'bytes75 SHA256=', crypto.createHash('sha256').update(raw).digest('hex'));
  console.log(orientation, 'first16=', raw.subarray(0, 16).toString('hex'));
  for (const chained of [false, true]) {
    for (const sign of [-1, 1]) {
      // Independent, unmodified 75-GP29 solved-source plant verifies inverse.
      const plantedCipher = encrypt(clearPlant, key, chained, sign, c55[0]);
      assert.deepEqual(decrypt(plantedCipher, key, chained, sign), clearPlant);
      // Original-cipher forward replay is exact, without any alteration.
      const plaintext = decrypt(c55, key, chained, sign);
      assert.deepEqual(encrypt(plaintext, key, chained, sign, c55[0]), c55);
      const glyphs = plaintext.map(v => corpus.translit[v]).join('');
      console.log(
        orientation, chained ? 'chain' : 'direct', sign === -1 ? 'subtract' : 'add',
        'IoC=' + ioc(plaintext).toFixed(9), 'GP=', glyphs
      );
    }
  }
}
console.log('PASS: eight source-derived exact 75-rune inverses and 8 solved-source roundtrips.');
