'use strict';

/**
 * Source-shaped, unfitted SHA-2 message-expansion gate on the original LP2
 * printed 32 x 8 base60 table (physical pp49-51).
 * SHA-512: 32 consecutive 64-bit words, 16 independently checkable recurrences.
 * SHA-256: 64 consecutive 32-bit words, 48 checkable recurrences.
 * Each convention is a literal traversal, not an adjustable key or IV.
 * Run with Node.js 22: node sims/lp2_p50_sha2_message_schedule_sft.cjs
 * @module lp2_p50_sha2_message_schedule_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
assert.deepEqual(data.original_scans, ['66.jpg', '67.jpg', '68.jpg']);
assert.deepEqual(data.page_row_counts, [10, 13, 9]);
assert.equal(data.rows.length, 32);
assert.ok(data.rows.every((r) => r.length === 8));
const bytes = data.rows.flatMap((row) => row.map((token) => {
  assert.equal(token.length, 2);
  const value = data.alphabet.indexOf(token[0]) * 60 + data.alphabet.indexOf(token[1]);
  assert.ok(value >= 0 && value <= 255);
  return value;
}));
assert.deepEqual(bytes, data.byte_rows.flat());
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const mask64 = (1n << 64n) - 1n;
/** @param {bigint} v @param {number} k @returns {bigint} */
const rotr64 = (v, k) =>
  ((v >> BigInt(k)) | (v << BigInt(64 - k))) & mask64;
/** @param {number} v @param {number} k @returns {number} */
const rotr32 = (v, k) => (v >>> k) | (v << (32 - k));
/** @param {bigint} v @returns {bigint} */
const s0_64 = (v) => rotr64(v, 1) ^ rotr64(v, 8) ^ (v >> 7n);
/** @param {bigint} v @returns {bigint} */
const s1_64 = (v) => rotr64(v, 19) ^ rotr64(v, 61) ^ (v >> 6n);
/** @param {number} v @returns {number} */
const s0_32 = (v) => (rotr32(v, 7) ^ rotr32(v, 18) ^ (v >>> 3)) >>> 0;
/** @param {number} v @returns {number} */
const s1_32 = (v) => (rotr32(v, 17) ^ rotr32(v, 19) ^ (v >>> 10)) >>> 0;

/**
 * @param {Array<number|bigint>} source
 * @param {32|64} bits
 * @returns {{checked:number,exact:number,bitMismatches:number,firstIndex:number,firstExpected:string,firstObserved:string}}
 */
function check(source, bits) {
  let exact = 0, bitMismatches = 0, first = null;
  for (let i = 16; i < source.length; i++) {
    const prediction = bits === 64 ?
      (s1_64(source[i - 2]) + source[i - 7] +
        s0_64(source[i - 15]) + source[i - 16]) & mask64 :
      (s1_32(source[i - 2]) + source[i - 7] +
        s0_32(source[i - 15]) + source[i - 16]) >>> 0;
    const equal = prediction === source[i];
    if (equal) exact++;
    let difference = bits === 64 ?
      prediction ^ source[i] : BigInt((prediction ^ source[i]) >>> 0);
    while (difference) {
      difference &= difference - 1n;
      bitMismatches++;
    }
    if (first === null) first = {
      firstIndex: i,
      firstExpected: prediction.toString(16).padStart(bits / 4, '0'),
      firstObserved: source[i].toString(16).padStart(bits / 4, '0'),
    };
  }
  return {checked: source.length - 16, exact, bitMismatches, ...first};
}

/**
 * @param {number[]} source
 * @param {32|64} bits
 * @returns {Array<number|bigint>}
 */
function decodeWords(source, bits) {
  const width = bits / 8;
  assert.equal(source.length % width, 0);
  const out = [];
  for (let i = 0; i < source.length; i += width) {
    let value = bits === 64 ? 0n : 0;
    for (let j = i; j < i + width; j++)
      value = bits === 64 ? value * 256n + BigInt(source[j]) :
        (value * 256 + source[j]) >>> 0;
    out.push(value);
  }
  return out;
}

/** @param {number[]} bytes @returns {number[]} */
function columnOrder(bytes) {
  const out = [];
  for (let col = 0; col < 8; col++)
    for (let row = 0; row < 32; row++) out.push(bytes[row * 8 + col]);
  return out;
}

const results = [];
for (const bits of [64, 32]) {
  for (const traversal of ['row', 'column']) {
    const sequence = traversal === 'row' ? bytes : columnOrder(bytes);
    for (const reverseBytes of [false, true]) {
      const width = bits / 8;
      const dataBytes = reverseBytes ?
        sequence.flatMap((_, i) => i % width === 0 ?
          sequence.slice(i, i + width).reverse() : []) : sequence;
      for (const reverseWords of [false, true]) {
        const words = decodeWords(dataBytes, bits);
        if (reverseWords) words.reverse();
        const observed = check(words, bits);
        assert.equal(observed.checked, bits === 64 ? 16 : 48);
        assert.equal(observed.exact, 0);
        results.push({bits, traversal, reverseBytes, reverseWords, ...observed});
      }
    }
  }
}

// Exact independent positive controls: construct genuine SHA-2 expansions
// using the published recurrence, then check every non-seed word.
for (const bits of [64, 32]) {
  const n = bits === 64 ? 32 : 64;
  const control = Array.from({length: 16}, (_, i) =>
    bits === 64 ? BigInt(1234 + i * 65537) : (1234 + i * 65537) >>> 0);
  while (control.length < n) {
    const i = control.length;
    control.push(bits === 64 ?
      (s1_64(control[i - 2]) + control[i - 7] +
        s0_64(control[i - 15]) + control[i - 16]) & mask64 :
      (s1_32(control[i - 2]) + control[i - 7] +
        s0_32(control[i - 15]) + control[i - 16]) >>> 0);
  }
  assert.equal(check(control, bits).exact, n - 16);
}
assert.equal(results.length, 16);
console.log(JSON.stringify({
  source: 'original LP2 32x8 base60 table; conventional byte values',
  primary: results.filter((r) =>
    r.traversal === 'row' && !r.reverseBytes && !r.reverseWords),
  allConventions: results,
  positiveControl: {sha512: '16/16', sha256: '48/48'},
  conclusion: 'No direct SHA-512 or SHA-256 message-schedule continuation',
}, null, 2));
