'use strict';

/**
 * SFT: p0–2 source 27×27 direct radix29 format gate for 128-bit cipher blocks.
 * Whole-array numerical obstruction holds for every cipher key and IV.
 * Positive: AES-256-CTR blocks encode, decode and decrypt from 27 digits.
 * Execute from repository root with Node 22. No file writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const original = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(original.length, 729);
assert.equal(grid.bytes.length, 256);
const LIMIT = 1n << 128n;

/** @param {number[]} digits @returns {bigint} */
function decode(digits) {
  return digits.reduce((n, d) => {
    assert(Number.isInteger(d) && d >= 0 && d < 29);
    return n * 29n + BigInt(d);
  }, 0n);
}

/** @param {bigint} n @returns {number[]} */
function encode(n) {
  assert(n >= 0n && n < LIMIT);
  const digits = new Array(27);
  for (let i = 26; i >= 0; i--) {
    digits[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return digits;
}

/** @param {number[]} digits @returns {number[][]} */
function rows(digits) {
  assert.equal(digits.length, 729);
  return Array.from({length: 27}, (_, i) => digits.slice(27*i, 27*(i+1)));
}

/** @param {number[][]} square @returns {number[][]} */
function transpose(square) {
  return square.map((_, i) => square.map(row => row[i]));
}

/** @param {number[][]} square @returns {number[]} */
function valid(square) {
  return square.map((row, i) => decode(row) < LIMIT ? i : -1).filter(i => i !== -1);
}

const sourceRows = rows(original);
const rowValid = valid(sourceRows);
const colValid = valid(transpose(sourceRows));
const revValid = valid(rows([...original].reverse()));
assert.deepEqual(rowValid, [7,10,13,18,24]);
assert.deepEqual(colValid, [7,13,17,22]);
assert.deepEqual(revValid, [10,18]);

// A planted 432-byte AES-256-CTR ciphertext MUST pass the same 27-digit gate.
const key = Buffer.from(grid.bytes.slice(0,32));
const iv = Buffer.alloc(16);
const clear = Buffer.alloc(432);
const phrase = Buffer.from('SOURCE-SHAPED-27-BLOCK-AES-256-CTR-TEST-');
for (let i = 0; i < clear.length; i++) clear[i] = phrase[i % phrase.length];
const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
const ciphertext = Buffer.concat([cipher.update(clear), cipher.final()]);
assert.equal(ciphertext.length, clear.length);
const packed = [];
for (let i = 0; i < 27; i++) {
  const hex = ciphertext.subarray(i*16, (i+1)*16).toString('hex');
  const n = BigInt('0x'+hex);
  const digits = encode(n);
  assert.equal(decode(digits), n);
  packed.push(...digits);
}
assert.equal(packed.length, 729);
assert.equal(valid(rows(packed)).length, 27);
const restored = Buffer.concat(rows(packed).map(row =>
  Buffer.from(decode(row).toString(16).padStart(32,'0'), 'hex')));
assert.deepEqual(restored, ciphertext);
const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
const decrypted = Buffer.concat([decipher.update(restored), decipher.final()]);
assert.deepEqual(decrypted, clear);
console.log(JSON.stringify({
  source: 'LP2 original physical p0–p2 729 runes',
  row_valid: rowValid,
  column_valid: colValid,
  reverse_valid: revValid,
  all_original_rows_represent_128bit_blocks: rowValid.length === 27,
  full_AES_256_CTR_positive: decrypted.equals(clear),
}, null, 2));
