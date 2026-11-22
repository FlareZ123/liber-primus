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
const crypto = require('node:crypto');
const target = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'cicada2014-archive-hash-manifest.json'), 'utf8')).targetHex;
assert.match(target, /^[0-9a-f]{128}$/i);
assert.ok(crypto.createHash('sha512').update('abc').digest('hex')
  .startsWith('ddaf35a193617aba'));

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
    p56_printed_sha512_match: crypto.createHash('sha512').update(binary)
      .digest('hex').toLowerCase() === target.toLowerCase(),
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

// Independently source-visible complete decoding units: physical page and the
// nine red-heading visual chapters. A whole-file encoding may reset at either
// boundary; concatenating radix digits across resets would not detect that.
/** @type {Array<[number,number]>} */
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const segments = {
  physical_page: pages.map((p) => [p.page, p.indices]),
  original_red_chapter: chapters.map(([first,last]) =>
    [first, pages.filter((p) => p.page >= first && p.page <= last)
      .flatMap((p) => p.indices)])
};
const independent = {};
for (const [clock, chunks] of Object.entries(segments)) {
  const byPage = [];
  for (const [firstPage, indices] of chunks) {
    const ds = steps(indices);
    for (const reverse of [false, true]) {
      const digits = ds.filter((d) => d > 0).map((d) => d - 1);
      const binary = decodeRadix(reverse ? digits.reverse() : digits, 28);
      const evidence = inspect(binary);
      const hits = Object.entries(evidence.compression)
        .filter(([,status]) => typeof status === 'object')
        .map(([format,value]) => ({ format, ...value }));
      byPage.push({
        first_page: firstPage, reverse, digits: digits.length,
        byte_count: binary.length, first_hex: evidence.head_hex,
        p56_printed_sha512_match: evidence.p56_printed_sha512_match,
        decompress_hits: hits
      });
    }
  }
  independent[clock] = {
    candidate_units: chunks.length,
    variants: byPage.length,
    p56_printed_sha512_hits: byPage.filter((item) =>
      item.p56_printed_sha512_match).map((item) => item.first_page),
    valid_decompressions: byPage.flatMap((item) =>
      item.decompress_hits.map((hit) => ({...item,...hit}))),
    first_unit: byPage.slice(0, 2),
    last_unit: byPage.slice(-2)
  };
}

// Historical 2013 BASE29 is an independently authenticated codec. The source-
// direct case reads literal GP29 digits without the extra unsourced
// ciphertext-differencing operation, over the same natural visible packet cuts.
const direct = {};
for (const [name, chunks] of Object.entries({
  book: [[0, flat]],
  ...segments
})) {
  let success = [];
  let count = 0;
  let hashMatches = [];
  let first = [];
  for (const [firstPage, indices] of chunks) {
    for (const reverse of [false, true]) {
      count++;
      const binary = decodeRadix(reverse ? indices.slice().reverse() : indices, 29);
      const tested = inspect(binary);
      if (first.length < 2) first.push({
        page: firstPage, reverse, bytes: binary.length, prefix: tested.head_hex
      });
      if (tested.p56_printed_sha512_match) hashMatches.push({firstPage, reverse});
      for (const [format, value] of Object.entries(tested.compression)) {
        if (typeof value === 'object' && value.decoded_bytes > 0) {
          success.push({firstPage, reverse, format, ...value});
        }
      }
    }
  }
  direct[name] = { count, valid_nonempty_decompressions: success,
    exact_printed_sha512_preimages: hashMatches, first };
}

console.log(JSON.stringify({ experiment: 'LP2 original literal GP29 and differential binary/DEFLATE',
  positive, cases, independent, direct }, null, 2));
