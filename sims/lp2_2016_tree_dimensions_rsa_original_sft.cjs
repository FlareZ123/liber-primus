'use strict';

/**
 * One source-constrained, literal textbook-RSA reading of the 2016 tree
 * dimensions as prime factors. No key search and no writes.
 *
 * Run: node sims/lp2_2016_tree_dimensions_rsa_original_sft.cjs
 * Requires Node.js 22 and repository source files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const jpeg = fs.readFileSync(path.join(root, 'resources', 'historical', 'cicada2016-4gq25.jpg'));
assert.equal(jpeg.readUInt16BE(0), 0xffd8);
const sof = jpeg.indexOf(Buffer.from([0xff, 0xc0]));
assert.equal(sof, 158, 'Expected first-party 2016 baseline-JPEG SOF0 location');
const height = jpeg.readUInt16BE(sof + 5);
const width = jpeg.readUInt16BE(sof + 7);
assert.deepEqual([width, height], [563, 569]);

/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus @returns {bigint} */
function modPow(base, exponent, modulus) {
  let result = 1n;
  for (; exponent > 0n; exponent >>= 1n, base = (base * base) % modulus) {
    if ((exponent & 1n) === 1n) result = (result * base) % modulus;
  }
  return result;
}

/** @param {number[]} values @returns {bigint} */
function pack29(values) {
  return values.reduce((value, rune) => value * 29n + BigInt(rune), 0n);
}

/** @param {bigint} value @param {number} length @returns {number[]} */
function unpack29(value, length) {
  const out = Array.from({ length }, () => 0);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n, 'Packed number exceeds the fixed GP29 block capacity');
  return out;
}

const p = BigInt(width);
const q = BigInt(height);
const n = p * q;
const phi = (p - 1n) * (q - 1n);
const e = 65537n;
const d = 160833n;
assert.equal(n, 320347n);
assert.equal(phi, 319216n);
assert.equal((e * d) % phi, 1n);

const expectations = [
  { page: 32, length: 121, three: [[40, 3], [40, 2]], four: [[30, 14], [30, 7]] },
  { page: 55, length: 76, three: [[25, 3], [25, 2]], four: [[19, 8], [18, 8]] }
];

/** @type {Array<{page:number,blockSize:number,start:number,blocks:number,validCipherBlocks:number,decodedGP3:number}>} */
const results = [];

for (const target of expectations) {
  const page = corpus.pages.find((candidate) => candidate.page === target.page);
  assert.ok(page);
  assert.equal(page.indices.length, target.length);
  for (const blockSize of [3, 4]) {
    const expected = blockSize === 3 ? target.three : target.four;
    for (const start of [0, 1]) {
      /** @type {bigint[]} */
      const blocks = [];
      for (let offset = start; offset + blockSize <= page.indices.length; offset += blockSize) {
        blocks.push(pack29(page.indices.slice(offset, offset + blockSize)));
      }
      const valid = blocks.filter((value) => value < n);
      const decodedGP3 = valid.filter((value) => modPow(value, d, n) < 29n ** 3n).length;
      assert.equal(blocks.length, expected[start][0]);
      assert.equal(blockSize === 3 ? decodedGP3 : valid.length, expected[start][1]);
      results.push({
        page: target.page,
        blockSize,
        start,
        blocks: blocks.length,
        validCipherBlocks: valid.length,
        decodedGP3
      });
    }
  }
}

/** Native plaintext recovered exactly by the identical RSA encrypt/decrypt contract. */
const p57 = corpus.pages.find((candidate) => candidate.page === 57);
assert.ok(p57);
assert.equal(p57.indices.length, 95);
const native = p57.indices.slice(0, 90);
const encrypted = [];
const recovered = [];
for (let offset = 0; offset < native.length; offset += 3) {
  const plaintextInteger = pack29(native.slice(offset, offset + 3));
  assert.ok(plaintextInteger < 29n ** 3n);
  const encryptedInteger = modPow(plaintextInteger, e, n);
  assert.ok(encryptedInteger < n);
  encrypted.push(...unpack29(encryptedInteger, 4));
  const decryptedInteger = modPow(pack29(encrypted.slice(-4)), d, n);
  recovered.push(...unpack29(decryptedInteger, 3));
}
assert.deepEqual(recovered, native);
assert.equal(encrypted.length, 120);
assert.equal(recovered.length, 90);

console.log(JSON.stringify({
  source: 'Original 2016 signed-JPEG dimensions, source original LP2 pp32 and 55',
  factorPair: [width, height],
  modulus: String(n),
  publicExponent: String(e),
  privateExponent: String(d),
  results,
  nativePositive: '90/90 solved GP29 p57 plaintext runes recovered from 120 RSA ciphertext runes',
  decision: 'Direct whole-block textbook RSA under dimension-derived factors fails: source GP29 blocks exceed modulus and/or decoded GP29 capacity.',
  status: 'PASS'
}, null, 2));
