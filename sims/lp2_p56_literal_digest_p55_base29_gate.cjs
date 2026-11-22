'use strict';
/**
 * Speculative p56 printed-digest -> historical BASE29 -> p55 direct-key test.
 * Run from repository root with Node.js 22. Every original rune is preserved.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const witness = JSON.parse(fs.readFileSync('resources/cicada2014-anend-binary-witness.json', 'utf8'));
const ciphertext = corpus.pages.find((p) => p.page === 55).indices;
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const bytes = Buffer.from(witness.target_hex, 'hex');
assert.equal(ciphertext.length, 76);
assert.equal(lengths.reduce((sum, length) => sum + length, 1), 76);
assert.equal(bytes.length, 64);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), witness.source_sha256);

let integer = BigInt('0x' + witness.target_hex);
const key = [];
while (integer > 0n) {
  key.push(Number(integer % 29n));
  integer /= 29n;
}
key.reverse();
assert.equal(key.length, 105);

const interior = [];
let offset = 1; // first rune is a p54->p55 page-carry continuation
for (const length of lengths) {
  for (let i = offset + 1; i < offset + length - 1; i++) interior.push(i);
  offset += length;
}
assert.equal(interior.length, 43);
const ioc = (indices) => {
  const bins = Array(29).fill(0);
  for (const index of indices) bins[index] += 1;
  return bins.reduce((s, n) => s + n * (n - 1), 0) / (indices.length * (indices.length - 1));
};
const results = { input: 'p55 original 76 GP29 symbols', originalIoc: ioc(ciphertext),
  base29KeyLength: key.length, interiorCount: interior.length, readings: [] };
for (const signed of [-1, 1]) {
  for (const mode of ['full', 'strict-word-interior']) {
    const positions = mode === 'full' ? ciphertext.map((_, i) => i) : interior;
    const plain = ciphertext.slice();
    positions.forEach((position, i) => {
      plain[position] = (plain[position] + signed * key[i] + 290) % 29;
    });
    const recipher = plain.slice();
    positions.forEach((position, i) => {
      recipher[position] = (recipher[position] - signed * key[i] + 290) % 29;
    });
    assert.deepEqual(recipher, ciphertext);
    const decoded = positions.map((position) => plain[position]);
    results.readings.push({
      mode, sign: signed, decodedIoc: ioc(decoded),
      decodedIndices: decoded.join(','), recipheredExactly: true,
    });
  }
}
console.log(JSON.stringify(results, null, 2));
