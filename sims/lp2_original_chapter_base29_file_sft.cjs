'use strict';

/**
 * Direct GP29 -> byte-container gate on the complete unknown book,
 * original image-selected visual chapters, and rune-bearing pages.
 *
 * Tests only the canonical positional GP29 integer in most-significant-first
 * order. Both the fixed mathematical width and minimal big-endian bytes are
 * checked. No offsets, alternate alphabets, reversals, keys or transforms.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const chapters = [
  { pages: [0, 2], runes: 729, fixedBytes: 443, minimalBytes: 443,
    fixedPrefix: '1759b774a590ef75', minimalPrefix: '1759b774a590ef75' },
  { pages: [3, 7], runes: 1145, fixedBytes: 696, minimalBytes: 696,
    fixedPrefix: '03ae7c53329e6a19', minimalPrefix: '03ae7c53329e6a19' },
  { pages: [8, 14], runes: 1729, fixedBytes: 1050, minimalBytes: 1050,
    fixedPrefix: '568b6382e9e32b9c', minimalPrefix: '568b6382e9e32b9c' },
  { pages: [15, 22], runes: 1903, fixedBytes: 1156, minimalBytes: 1155,
    fixedPrefix: '000dea61948244b3', minimalPrefix: '0dea61948244b36b' },
  { pages: [23, 26], runes: 1021, fixedBytes: 620, minimalBytes: 620,
    fixedPrefix: '1032d4e90101414a', minimalPrefix: '1032d4e90101414a' },
  { pages: [27, 32], runes: 1433, fixedBytes: 871, minimalBytes: 871,
    fixedPrefix: '01e1f098bfb6f84a', minimalPrefix: '01e1f098bfb6f84a' },
  { pages: [33, 39], runes: 1680, fixedBytes: 1021, minimalBytes: 1021,
    fixedPrefix: '0224e7f776075c83', minimalPrefix: '0224e7f776075c83' },
  { pages: [40, 53], runes: 3008, fixedBytes: 1827, minimalBytes: 1826,
    fixedPrefix: '0052876495b72a94', minimalPrefix: '52876495b72a948c' },
  { pages: [54, 55], runes: 308, fixedBytes: 188, minimalBytes: 188,
    fixedPrefix: '010490bde021d22c', minimalPrefix: '010490bde021d22c' }
];

function integerFromDigits(digits) {
  let integer = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    integer = integer * 29n + BigInt(digit);
  }
  return integer;
}

/** Fixed mathematical width: ceil(n*log2(29)/8), including leading zero bytes. */
function sourceBase29Bytes(digits) {
  const integer = integerFromDigits(digits);
  const width = Math.ceil(digits.length * Math.log2(29) / 8);
  const hex = integer.toString(16).padStart(width * 2, '0');
  assert.equal(hex.length, width * 2);
  return Buffer.from(hex, 'hex');
}

/** Canonical minimal big-endian byte representation of the same integer. */
function minimalBase29Bytes(digits) {
  let hex = integerFromDigits(digits).toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

function bytesToMinimalBase29(bytes) {
  let integer = BigInt('0x' + bytes.toString('hex'));
  if (integer === 0n) return [0];
  const digits = [];
  while (integer > 0n) {
    digits.push(Number(integer % 29n));
    integer /= 29n;
  }
  return digits.reverse();
}

function bytesToSourceBase29(bytes, runeCount) {
  let integer = BigInt('0x' + bytes.toString('hex'));
  const digits = Array(runeCount).fill(0);
  for (let index = runeCount - 1; index >= 0; index--) {
    digits[index] = Number(integer % 29n);
    integer /= 29n;
  }
  assert.equal(integer, 0n, 'Plant exceeds exact length-limited GP29 transport');
  return digits;
}

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
const wholeDigits = unsolved.flatMap(p => p.indices);
assert.equal(wholeDigits.length, 12956);

// Confirm that the rune-index corpus and the canonical text transcription
// carry the same 12,956-symbol source sequence.
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const transcriptDigits = [...transcription.split('%').slice(0, 55).join('%')]
  .filter(rune => runeToIndex.has(rune))
  .map(rune => runeToIndex.get(rune));
assert.deepEqual(transcriptDigits, wholeDigits);

// Positive control for fixed-width and minimal GP29 byte transports.
const sample = Buffer.from('THIS IS A KNOWN ENGLISH TEXT FOR THE GZIP-POSITIVE SOURCE RADIX TWENTYNINE TEST.');
const zipped = zlib.gzipSync(sample);
const chapterWidth = Math.ceil(729 * Math.log2(29) / 8);
const plantedBlock = Buffer.alloc(chapterWidth);
zipped.copy(plantedBlock);
const plantedFixedDigits = bytesToSourceBase29(plantedBlock, 729);
assert.deepEqual(sourceBase29Bytes(plantedFixedDigits), plantedBlock);
assert.equal(recognizedStream(sourceBase29Bytes(plantedFixedDigits)), 'gzip');
assert.deepEqual(zlib.gunzipSync(sourceBase29Bytes(plantedFixedDigits)), sample);

const plantedMinimalDigits = bytesToMinimalBase29(zipped);
assert.deepEqual(minimalBase29Bytes(plantedMinimalDigits), zipped);
assert.equal(recognizedStream(minimalBase29Bytes(plantedMinimalDigits)), 'gzip');
assert.deepEqual(zlib.gunzipSync(minimalBase29Bytes(plantedMinimalDigits)), sample);
console.log('POSITIVE CONTROLS: fixed-width and minimal GP29 transports both recover and decompress an authentic gzip member');

// Whole book as one positional GP29 integer.
const wholeFixed = sourceBase29Bytes(wholeDigits);
const wholeMinimal = minimalBase29Bytes(wholeDigits);
assert.deepEqual(wholeFixed, wholeMinimal);
assert.equal(wholeFixed.length, 7868);
assert.equal(wholeMinimal.subarray(0, 8).toString('hex'), '08734843a55193dc');
const hits = [];
for (const [width, bytes] of [['fixed', wholeFixed], ['minimal', wholeMinimal]]) {
  const type = recognizedStream(bytes);
  if (type !== null) hits.push({ object: 'whole-book', width, type });
}
console.log('WHOLE BOOK: runes', wholeDigits.length, 'bytes', wholeMinimal.length,
  'prefix', wholeMinimal.subarray(0, 8).toString('hex'), 'format',
  recognizedStream(wholeMinimal) || 'none');

// Nine original image-selected visual chapters, in both byte-width conventions.
for (const chapter of chapters) {
  const digits = corpus.pages
    .filter(p => p.page >= chapter.pages[0] && p.page <= chapter.pages[1] && p.indices.length !== 0)
    .flatMap(p => p.indices);
  assert.equal(digits.length, chapter.runes);
  const fixed = sourceBase29Bytes(digits);
  const minimal = minimalBase29Bytes(digits);
  let leadingZeroBytes = 0;
  while (leadingZeroBytes < fixed.length && fixed[leadingZeroBytes] === 0) leadingZeroBytes++;
  assert.deepEqual(fixed.subarray(leadingZeroBytes), minimal);
  assert.equal(fixed.length, chapter.fixedBytes);
  assert.equal(minimal.length, chapter.minimalBytes);
  assert.equal(fixed.subarray(0, 8).toString('hex'), chapter.fixedPrefix);
  assert.equal(minimal.subarray(0, 8).toString('hex'), chapter.minimalPrefix);
  for (const [width, bytes] of [['fixed', fixed], ['minimal', minimal]]) {
    const type = recognizedStream(bytes);
    if (type !== null) hits.push({ pages: chapter.pages, width, type });
  }
  console.log('CHAPTER', chapter.pages[0] + '-' + chapter.pages[1],
    'runes', digits.length, 'fixed', fixed.length, fixed.subarray(0, 8).toString('hex'),
    'minimal', minimal.length, minimal.subarray(0, 8).toString('hex'),
    'formats', recognizedStream(fixed) || 'none', '/', recognizedStream(minimal) || 'none');
}

// Preserve the prior independent page-boundary gate.
for (const page of unsolved) {
  const type = recognizedStream(sourceBase29Bytes(page.indices));
  if (type !== null) hits.push({ page: page.page, type });
}
assert.deepEqual(hits, []);
console.log('PASS: whole book, 9 visual chapters in fixed/minimal forms, and all 55 rune-bearing pages: 0 direct file/container signatures');
console.log('SCOPE: direct canonical GP29 positional integer transport only; no encrypted, transformed, reversed or offset-start payloads');
