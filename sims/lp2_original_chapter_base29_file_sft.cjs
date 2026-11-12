'use strict';

/**
 * Source-selected literal BASE29 -> compressed-file gate, original LP2.
 *
 * Uses original physical pages and their visible red-heading chapter cuts.
 * This is a direct format test, not a guess of passwords, clocks or offsets.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];

/**
 * Interpret GP29 digits as the historical source's conventional positional
 * integer and render the complete integer at the fixed mathematical width.
 *
 * @param {number[]} digits GP indices in [0,28].
 * @returns {Buffer}
 */
function sourceBase29Bytes(digits) {
  let integer = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    integer = integer * 29n + BigInt(digit);
  }
  const width = Math.ceil(digits.length * Math.log2(29) / 8);
  const hex = integer.toString(16).padStart(width * 2, '0');
  assert(hex.length === width * 2);
  return Buffer.from(hex, 'hex');
}

/**
 * Encode a byte string into exactly runeCount GP29 digits or fail if the
 * integer exceeds the length-constrained radix-29 capacity.
 * @param {Buffer} bytes
 * @param {number} runeCount
 * @returns {number[]}
 */
function bytesToSourceBase29(bytes, runeCount) {
  let integer = BigInt('0x' + bytes.toString('hex'));
  const digits = Array(runeCount).fill(0);
  for (let index = runeCount - 1; index >= 0; index--) {
    digits[index] = Number(integer % 29n);
    integer /= 29n;
  }
  assert.equal(integer, 0n, 'Plant exceeds exactly length-limited GP29 transport');
  return digits;
}

/** @param {Buffer} bytes */
function recognizedStream(bytes) {
  const hex = bytes.subarray(0, 8).toString('hex');
  if (/^425a683[1-9]/.test(hex)) return 'bzip2';
  if (hex.startsWith('1f8b08')) return 'gzip';
  if (hex.startsWith('fd377a585a00')) return 'xz';
  if (hex.startsWith('89504e470d0a1a0a')) return 'png';
  if (hex.startsWith('504b0304')) return 'zip';
  if (hex.startsWith('25504446')) return 'pdf';
  return null;
}

const unsolved = corpus.pages.filter(p => p.page <= 55 && p.indices.length !== 0);
assert.equal(unsolved.length, 55);
assert.equal(unsolved.reduce((sum, p) => sum + p.indices.length, 0), 12956);

const sample = Buffer.from('THIS IS A KNOWN ENGLISH TEXT FOR THE GZIP-POSITIVE SOURCE RADIX TWENTYNINE TEST.');
const zipped = zlib.gzipSync(sample);
const width = Math.ceil(chapterLengths[0] * Math.log2(29) / 8);
const plantedBytes = Buffer.alloc(width);
zipped.copy(plantedBytes);
const plantedDigits = bytesToSourceBase29(plantedBytes, chapterLengths[0]);
assert.equal(plantedDigits.length, chapterLengths[0]);
assert.deepEqual(sourceBase29Bytes(plantedDigits), plantedBytes);
assert.equal(recognizedStream(sourceBase29Bytes(plantedDigits)), 'gzip');
assert.deepEqual(zlib.gunzipSync(sourceBase29Bytes(plantedDigits)), sample);
console.log('POSITIVE CONTROL: exact 729-rune original-chapter-width BASE29 transport reproduces authentic complete gzip payload');

const hits = [];
for (let i = 0; i < chapters.length; i++) {
  const [start, end] = chapters[i];
  const digits = corpus.pages.slice(start, end + 1).flatMap(p => p.indices);
  assert.equal(digits.length, chapterLengths[i]);
  const bytes = sourceBase29Bytes(digits);
  const type = recognizedStream(bytes);
  if (type !== null) hits.push({ span: [start, end], type });
  console.log('CHAPTER', start + '-' + end, 'runes', digits.length,
    'bytes', bytes.length, 'prefix', bytes.subarray(0, 8).toString('hex'),
    'format', type || 'none');
}

for (const page of unsolved) {
  const type = recognizedStream(sourceBase29Bytes(page.indices));
  if (type !== null) hits.push({ page: page.page, type });
}
assert.deepEqual(hits, []);
console.log('PASS: 9 intact source-visible chapters and all 55 rune-bearing original unsolved pages: 0 direct compressed/file signatures');
console.log('SCOPE: conventional most-significant-first complete radix-29 byte serialization only; no transformed or encrypted intermediates');
