'use strict';
/**
 * Original LP2 p3..p7 5×229-rune byte-domain 5-of-5 Shamir screen.
 * This is an exploratory GF(256) analogue, not the authentic 2013 GF(2^176) implementation.
 * No CLI flags and no file writes; Windows 11, Node.js 22, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const scroll = corpus.pages.filter((p) => p.page >= 3 && p.page <= 7).flatMap((p) => p.indices);
assert.deepEqual(corpus.pages.filter((p) => p.page >= 3 && p.page <= 7).map((p) => p.indices.length), [217, 261, 263, 196, 208]);
assert.equal(scroll.length, 1145);
const n = 229;
const xs = [1, 2, 3, 4, 5];
/** @param {number} a @param {number} b @returns {number} */
function gfMul(a, b) {
  let out = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) out ^= a;
    const carry = a & 128;
    a = (a << 1) & 255;
    if (carry) a ^= 0x1b;
    b >>>= 1;
  }
  return out;
}
/** @param {number} a @param {number} e @returns {number} */
function gfPow(a, e) {
  let out = 1;
  while (e > 0) {
    if (e & 1) out = gfMul(out, a);
    a = gfMul(a, a);
    e >>>= 1;
  }
  return out;
}
const weights = xs.map((x, i) => xs.reduce((out, y, j) => j === i ? out : gfMul(out, gfMul(y, gfPow(x ^ y, 254))), 1));
assert.deepEqual(weights, [1, 208, 208, 209, 209]);
/** @param {number[][]} shares @returns {number[]} */
function reconstruct(shares) {
  assert.equal(shares.length, 5);
  const len = shares[0].length;
  assert(shares.every((a) => a.length === len));
  return Array.from({ length: len }, (_, j) => shares.reduce((out, a, i) => out ^ gfMul(a[j], weights[i]), 0));
}
/** @param {number[]} digits @returns {number[]} */
function packBase29(digits) {
  assert.equal(digits.length, n);
  let value = 0n;
  for (const digit of digits) {
    assert(digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  const out = Array(140).fill(0);
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return out;
}
/** @param {number[]} bytes @returns {number[]} */
function unpackBase29(bytes) {
  let value = 0n;
  for (const b of bytes) value = (value << 8n) + BigInt(b);
  const out = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return out;
}
/** @param {number[]} b @returns {string} */
const hex = (b) => b.map((x) => x.toString(16).padStart(2, '0')).join('');
const layouts = {
  contiguous: xs.map((_, i) => scroll.slice(i * n, (i + 1) * n)),
  interleaved: xs.map((_, i) => scroll.filter((_, j) => j % 5 === i)),
};
// Historical Cicada SSSS used a 176-bit field. Six natural 37-GP-digit
// source packets per lane would have to be strictly smaller than 2^176,
// without reducing them modulo the field (which loses source information).
const historicalRecordFit = (digits) => {
  let count = 0;
  for (let block = 0; block < 6; block++) {
    let number = 0n;
    for (const gpIndex of digits.slice(block * 37, (block + 1) * 37)) {
      number = 29n * number + BigInt(gpIndex);
    }
    if (number < (1n << 176n)) count++;
  }
  return count;
};
assert.deepEqual(layouts.contiguous.map(historicalRecordFit), [1, 2, 0, 1, 0]);
assert.deepEqual(layouts.interleaved.map(historicalRecordFit), [1, 1, 0, 0, 0]);
console.log('Historical 176-bit exact 37-digit packets: 4/30 contiguous, 2/30 interleaved fit field');
const expected = {
  'contiguous:BASE29': ['00cb6d73b3b06c12076fc06dc2a1e4edf1531ecb498b769107d27b8cdc310693', 44],
  'interleaved:BASE29': ['d1f98998e058188bafecf6d545524cb5d33a6d8befc6cfc5d0ed5a65c1fa0e8e', 39],
  'contiguous:raw': ['c1d97ede0904ce67c568a4721ecd7011c4aa670666beaf63c71b7572dca10dd6', 75],
  'interleaved:raw': ['c717a8140ecd01b679c463186804dd687b1f14d8a60466d31ed8c30e1d747b76', 50],
};
for (const [layout, digits] of Object.entries(layouts)) {
  for (const share of digits) assert.deepEqual(unpackBase29(packBase29(share)), share);
  for (const mode of ['BASE29', 'raw']) {
    const shares = mode === 'BASE29' ? digits.map(packBase29) : digits;
    const out = reconstruct(shares);
    const printable = out.filter((b) => b >= 32 && b <= 126).length;
    const prefix = hex(out.slice(0, 32));
    assert.deepEqual([prefix, printable], expected[layout + ':' + mode]);
    assert.equal(out.length, mode === 'BASE29' ? 140 : n);
    // Given the reconstructed secret and any other four shares, recover the fifth.
    const lastWeightInv = gfPow(weights[4], 254);
    for (let j = 0; j < out.length; j++) {
      let known = out[j];
      for (let k = 0; k < 4; k++) known ^= gfMul(weights[k], shares[k][j]);
      assert.equal(gfMul(known, lastWeightInv), shares[4][j]);
    }
    console.log(`${layout} ${mode}: ${out.length} bytes, ${printable} ASCII printable, prefix ${prefix}`);
  }
}
const knownGP = corpus.pages.find((p) => p.page === 57).indices;
const message = Array.from({ length: 140 }, (_, i) => knownGP[i % knownGP.length]);
/** @param {number[]} a @param {number} x @returns {number} */
function evalPolynomial(a, x) {
  let result = 0;
  for (let i = a.length - 1; i >= 0; i--) result = gfMul(result, x) ^ a[i];
  return result;
}
const synthetic = xs.map((x) => message.map((value, i) => evalPolynomial([value, (i * 3 + 7) & 255, (i * 5 + 11) & 255, (i * 7 + 13) & 255, (i * 11 + 17) & 255], x)));
assert.deepEqual(reconstruct(synthetic), message);
console.log('PASS: full original bytes, 5-of-5 source layout inverses, and 140/140 GP-native planted reconstruction');
