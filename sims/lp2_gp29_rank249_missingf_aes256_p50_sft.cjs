'use strict';

/**
 * Research-only SFT: one bounded speculative AES-256 receiver from two
 * independent source-native artifacts.
 *
 * - The fixed original 249-bit mixed-radix rank is reproduced by
 *   sims/lp2_gp29_digraph_overlap_hiddenbit_original_sft.cjs
 * - The only missing GP-compatible digit in the 60-symbol p50 printed alphabet
 *   is lowercase 'f' (7-bit ASCII code 102).
 * - Try the two explicit rank/7-bit-f concat directions as 32-byte AES-256 keys.
 * - AES-256-ECB has no guessed IV. Entire unmodified source table is the
 *   256-byte ciphertext candidate. No search or alteration of input data.
 *
 * This DOES NOT assert that AES or the missing-character interpretation was
 * selected by Cicada; a genuine hit requires known text or file structure.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createDecipheriv, createCipheriv, createHash } = require('node:crypto');

const grid = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'
), 'utf8'));
const ciphertext = Buffer.from(grid.bytes);
const originalTokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(ciphertext.length, 256);
const missingGlyphs = [...grid.alphabet].filter((ch) =>
  !originalTokens.some((token) => token.includes(ch)));
assert.deepEqual(missingGlyphs, ['f']);

const originalRank = BigInt(
  '0x18d11b78ee49747821c208d169910de9e849127bc0c8e87c9ad5e93dc257da1'
);
assert.equal(originalRank.toString(2).length, 249);
assert.equal('f'.charCodeAt(0), 102);
assert.equal((102).toString(2).length, 7);

/** @param {bigint} number @returns {Buffer} */
const keyBuffer = (number) => Buffer.from(number.toString(16).padStart(64, '0'), 'hex');

/** @param {Buffer} value @returns {Buffer} */
function aesDecrypt(value, key) {
  const decipher = createDecipheriv('aes-256-ecb', key, null);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(value), decipher.final()]);
}

/** @param {Buffer} value @returns {Buffer} */
function aesEncrypt(value, key) {
  const cipher = createCipheriv('aes-256-ecb', key, null);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(value), cipher.final()]);
}

/** @param {Buffer} buf @returns {number} */
const printable = (buf) => [...buf].filter((n) => n >= 32 && n <= 126).length;

const candidates = [
  ['rank-then-ASCII7-f', (originalRank << 7n) | 102n],
  ['ASCII7-f-then-rank', (102n << 249n) | originalRank]
];
for (const [label, value] of candidates) {
  const key = keyBuffer(value);
  assert.equal(key.length, 32);
  const plaintext = aesDecrypt(ciphertext, key);
  assert.deepEqual(aesEncrypt(plaintext, key), ciphertext);
  console.log(label);
  console.log('  key:', key.toString('hex'));
  console.log('  plaintext first 32 bytes:', plaintext.subarray(0, 32).toString('hex'));
  console.log('  printable ASCII bytes out of 256:', printable(plaintext));
  console.log('  SHA256 of decrypted bytes:', createHash('sha256').update(plaintext).digest('hex'));
}
console.log('PASS: two exact original fixed AES256-ECB binary receiver trials, both roundtrip');
