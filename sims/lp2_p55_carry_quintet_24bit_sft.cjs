'use strict';

/**
 * LP2 p55 natural carry-skipped five-GP-digit → three-byte capacity gate.
 * Read-only, dependency-free Node.js 22 SFT against the canonical repository corpus.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const p55 = data.pages.find(page => page.page === 55);
assert.equal(p55.runic_count, 76);
assert.equal(p55.indices.length, 76);
assert.equal(p55.indices[0], 21); // Printed NG continues a word from p54.

const payload = p55.indices.slice(1);
assert.equal(payload.length, 75);

/**
 * The signed 2013 BASE29 example uses ordinary most-significant-digit-first
 * positional arithmetic; GP rune indices 0..28 are the candidate digits.
 *
 * @param {number[]} digits Exactly five candidate GP29 digits.
 * @returns {number} The unsigned positional integer, potentially exceeding 24 bits.
 */
function decodeFive(digits) {
  assert.equal(digits.length, 5);
  return digits.reduce((value, digit) => value * 29 + digit, 0);
}

/**
 * @param {number} value A three-byte unsigned value.
 * @returns {number[]} Five radix-29 digits.
 */
function encodeThree(value) {
  assert(Number.isInteger(value) && value >= 0 && value <= 0xffffff);
  const digits = Array(5).fill(0);
  for (let k = 4; k >= 0; k--) {
    digits[k] = value % 29;
    value = Math.floor(value / 29);
  }
  assert.equal(value, 0);
  return digits;
}

// Independent 45-byte synthetic positive: every legitimate three-byte word
// has a unique five-GP-digit representation, and that round trip is exact.
const synthetic = Buffer.from(Array.from({ length: 45 }, (_, i) => (19 + 73 * i) & 255));
const recovered = Buffer.alloc(45);
for (let block = 0; block < 15; block++) {
  const offset = 3 * block;
  const value = synthetic.readUIntBE(offset, 3);
  const digits = encodeThree(value);
  assert.equal(decodeFive(digits), value);
  recovered.writeUIntBE(decodeFive(digits), offset, 3);
}
assert.deepEqual(recovered, synthetic);

// Exact original 15 five-digit blocks, natural MSB-first order after the carry.
const blocks = Array.from({ length: 15 }, (_, i) =>
  decodeFive(payload.slice(i * 5, i * 5 + 5))
);
const impossible = blocks.flatMap((value, i) =>
  value > 0xffffff ? [{ block: i + 1, p55Glyphs: [5 * i + 2, 5 * i + 6], value }] : []
);
assert.deepEqual(impossible, [
  { block: 1, p55Glyphs: [2, 6], value: 18154044 },
  { block: 4, p55Glyphs: [17, 21], value: 19696366 }
]);
assert.equal(blocks.length, 15);

console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-corpus.json',
  p55Runes: p55.indices.length,
  postCarryDigits: payload.length,
  radix29FiveRange: 29 ** 5,
  threeByteRange: 2 ** 24,
  validBlocks: 15 - impossible.length,
  impossible,
  syntheticByteRoundtrip: synthetic.length
}, null, 2));
console.log('PASS: original p55 cannot be 15 literal fixed 24-bit blocks in canonical GP29 order.');
