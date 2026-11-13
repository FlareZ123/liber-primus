'use strict';

/**
 * Single runnable source-to-plaintext test for a keyless GP28 differential
 * binary/compression explanation of LP2's near-absent adjacent doublets.
 *
 * Source: original LP2 physical pp0..55, retained 29-GP index encoding.
 * Operation: turn adjacent non-equal GP29 differences into radix-28 digits,
 * interpreting repeat events as exceptional markers, then invert a whole-file
 * radix conversion and try original-era zlib/gzip/raw DEFLATE.
 *
 * The first-decoded byte tests are fully determined. No key, dictionary, byte
 * offset, padding, inferred plaintext, or learned phase is fitted.
 * Reproducer on Windows 11 with Node.js 22: run this file in the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const flat = pages.flatMap((p) => p.indices);
assert.equal(flat.length, 12956);
assert.equal(pages.length, 55);

/** @param {number[]} vals @returns {number[]} */
function steps(vals) {
  const out = [];
  for (let i = 1; i < vals.length; i++) {
    out.push((vals[i] - vals[i-1] + 29) % 29);
  }
  return out;
}

/** @param {number[]} digits @param {number} radix @returns {Buffer} */
function decodeRadix(digits, radix) {
  let integer = 0n;
  const base = BigInt(radix);
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < radix);
    integer = integer * base + BigInt(digit);
  }
  let hex = integer.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

/** @param {Buffer} bytes @param {number} radix @returns {number[]} */
function encodeRadix(bytes, radix) {
  let integer = BigInt('0x' + bytes.toString('hex'));
  const digits = [];
  const base = BigInt(radix);
  while (integer > 0n) {
    digits.push(Number(integer % base));
    integer /= base;
  }
  return digits.reverse();
}

/** @param {Buffer} binary @returns {object} */
function inspect(binary) {
  const result = {
    byte_count: binary.length,
    head_hex: binary.subarray(0, 12).toString('hex'),
    printable_fraction: Number((Array.from(binary)
      .filter((b) => b >= 32 && b <= 126).length / binary.length).toFixed(5)),
    compression: {}
  };
  for (const [name, method] of Object.entries({
    gzip: zlib.gunzipSync,
    zlib: zlib.inflateSync,
    raw_deflate: zlib.inflateRawSync
  })) {
    try {
      const value = method(binary, { maxOutputLength: 1 << 22 });
      result.compression[name] = {
        decoded_bytes: value.length,
        head_utf8: value.subarray(0, 80).toString('utf8'),
        readable_fraction: Number((Array.from(value)
          .filter((b) => b >= 32 && b <= 126 || b === 10).length /
          Math.max(1, value.length)).toFixed(5))
      };
    } catch (err) {
      result.compression[name] = err.code || err.name;
    }
  }
  return result;
}

/** Exact synthetic positive control, not a claim about original text. */
function plant() {
  const plaintext = Buffer.from(
    'LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED ' +
    'OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE.',
    'ascii');
  const deflated = zlib.deflateRawSync(plaintext);
  const digits = encodeRadix(deflated, 28);
  const ciphertext = [0];
  for (const digit of digits) {
    ciphertext.push((ciphertext[ciphertext.length - 1] + digit + 1) % 29);
  }
  const recovered = decodeRadix(steps(ciphertext).map((d) => d - 1), 28);
  assert.deepEqual(recovered, deflated);
  assert.deepEqual(zlib.inflateRawSync(recovered), plaintext);
  return { plaintext_bytes: plaintext.length, deflated_bytes: deflated.length,
    ciphertext_runes: ciphertext.length };
}

const positive = plant();
const groups = {
  book: steps(flat),
  page: pages.flatMap((p) => steps(p.indices))
};
const cases = [];
for (const [clock, deltas] of Object.entries(groups)) {
  for (const [register, radix] of [['gp28_nonzero', 28], ['gp29_native', 29]]) {
    for (const reverse of [false, true]) {
      const digits = register === 'gp28_nonzero' ?
        deltas.filter((d) => d !== 0).map((d) => d - 1) :
        deltas.slice();
      const chosen = reverse ? digits.slice().reverse() : digits;
      const binary = decodeRadix(chosen, radix);
      cases.push({ clock, register, reverse, raw_steps: deltas.length,
        repeated_steps: deltas.filter((d) => d === 0).length,
        digits: digits.length, ...inspect(binary) });
    }
  }
}
assert.equal(cases.length, 8);
console.log(JSON.stringify({ experiment: 'LP2 full-stream differential radix/DEFLATE',
  positive, cases }, null, 2));
