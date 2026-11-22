'use strict';

/**
 * Source-exact test of the p50-byte / p53-p54-p55 moth-frame ASCII XOR bridge.
 * The 256 canonical base-60 table entries are bytes. All literal GP rune
 * ordinals, associated GP primes, and GP-prime totients fit below 128.
 * Consequently, XOR with any such operand preserves the table's top bit,
 * regardless of a secret table/rune permutation, phase, or row orientation.
 *
 * Run from the repository root: node sims/lp2_moth256_ascii_xor_bound_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const page = (index) => corpus.pages.find((record) => record.page === index).indices;

assert.equal(grid.byte_count, 256);
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(page(53).length, 179);
assert.equal(page(54).length, 232);
assert.equal(page(54)[0], 24); // Unique enlarged red A at original 71.jpg offset zero.
assert.equal(page(55).length, 76);

const carrier = [...page(53), page(54)[0], ...page(55)];
assert.equal(carrier.length, 256);
const highBits = grid.bytes.filter((byte) => byte >= 128).length;
assert.equal(highBits, 129);

const serialize = {
  ordinal: carrier,
  prime: carrier.map((index) => corpus.prime[index]),
  totient: carrier.map((index) => corpus.prime[index] - 1),
};

for (const [name, lowBytes] of Object.entries(serialize)) {
  assert.equal(lowBytes.length, 256);
  assert(lowBytes.every((byte) => Number.isInteger(byte) && byte >= 0 && byte < 128));
  const output = grid.bytes.map((byte, index) => byte ^ lowBytes[index]);
  const high = output.filter((byte) => byte >= 128).length;
  const printable = output.filter((byte) => byte >= 32 && byte <= 126).length;
  const visuallyPrintable = output.map((byte) =>
    byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join('');
  const runs = visuallyPrintable.match(/[ A-Za-z]+/g) || [];
  const longestAlphabeticRun = Math.max(0, ...runs.map((run) => run.length));

  assert.equal(high, 129, 'XOR by sub-128 GP numbers must preserve bit seven');
  assert.deepEqual(output.map((byte, index) => byte ^ lowBytes[index]), grid.bytes);
  assert.deepEqual([printable, longestAlphabeticRun],
    { ordinal: [103, 3], prime: [95, 3], totient: [94, 3] }[name]);

  // A genuine ASCII plaintext encrypted in this candidate format would
  // necessarily give a 256-byte table with its high bit clear everywhere.
  const text = 'LIBER PRIMUS: SEEK AND YOU WILL BE FOUND. ';
  const planted = Array.from({ length: 256 }, (_, i) => text.charCodeAt(i % text.length));
  const encrypted = planted.map((byte, index) => byte ^ lowBytes[index]);
  assert(encrypted.every((byte) => byte < 128));
  assert.deepEqual(encrypted.map((byte, index) => byte ^ lowBytes[index]), planted);
  console.log(name, { originalTableHighBitBytes: high, printable, longestAlphabeticRun,
    asciiPlantRecovered: 256 });
}

console.log('PASS: every direct GP-ordinal/prime/totient ASCII-XOR form is impossible ' +
  'for any index pairing or order (129 original high-bit table bytes).');
