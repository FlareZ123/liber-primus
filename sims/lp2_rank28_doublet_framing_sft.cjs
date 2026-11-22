'use strict';

/**
 * Original-input single-file test of a specific, source-motivated binary
 * interpretation: every adjacent-equal GP29 pair terminates one base28 run.
 * An unequal follower is ranked among the 28 GP symbols excluding its
 * predecessor; each run becomes its minimal-length big-endian base256 integer.
 *
 * This checks one fully defined transport inverse, not all possible
 * anti-doublet codes, padding schemes, compression or file formats.
 *
 * Run: node sims/lp2_rank28_doublet_framing_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const input = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const cipher = input.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
assert.equal(new Set(cipher).size, 29);

function toBytes(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert(digit >= 0 && digit < 28);
    value = value * 28n + BigInt(digit);
  }
  const result = [];
  while (value > 0n) {
    result.push(Number(value & 255n));
    value >>= 8n;
  }
  result.reverse();
  return result;
}

function encodeRun(plainDigits, firstRune) {
  // Inverse positive control: any synthetic base28 run exactly round-trips.
  assert(firstRune >= 0 && firstRune < 29);
  const run = [firstRune];
  for (const digit of plainDigits) {
    const previous = run[run.length - 1];
    const next = digit >= previous ? digit + 1 : digit;
    assert(next !== previous && next >= 0 && next < 29);
    run.push(next);
  }
  return run;
}

function decodeRun(run) {
  const digits = [];
  for (let i = 1; i < run.length; i++) {
    assert(run[i] !== run[i - 1]);
    digits.push(run[i] > run[i - 1] ? run[i] - 1 : run[i]);
  }
  return digits;
}

for (const seed of [0, 13, 28]) {
  const plant = [0, 1, 27, 8, 0, 19, 13, 21, 27, 0];
  assert.deepEqual(decodeRun(encodeRun(plant, seed)), plant);
}

const runs = [];
let start = 0;
for (let i = 1; i <= cipher.length; i++) {
  if (i === cipher.length || cipher[i] === cipher[i - 1]) {
    runs.push({ start, digits: decodeRun(cipher.slice(start, i)) });
    start = i;
  }
}
assert.equal(runs.length, 87);
const bytes = runs.flatMap(r => toBytes(r.digits));
assert.equal(bytes.length, 7759);

const magic = [
  ['bzip2', [0x42, 0x5a, 0x68]],
  ['gzip', [0x1f, 0x8b]],
  ['zlib-9c', [0x78, 0x9c]],
  ['zlib-da', [0x78, 0xda]],
  ['zip-local', [0x50, 0x4b, 0x03, 0x04]],
  ['ascii-armored-pgp', [45, 45, 45, 45, 45]],
  ['xz', [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00]]
];
const hits = [];
for (const [name, signature] of magic) {
  for (let i = 0; i <= bytes.length - signature.length; i++) {
    if (signature.every((byte, j) => bytes[i + j] === byte))
      hits.push({ name, offset: i });
  }
}
const frequency = Array(256).fill(0);
for (const byte of bytes) frequency[byte]++;
const entropy = -frequency.reduce(
  (total, count) => count > 0
    ? total + (count / bytes.length) * Math.log2(count / bytes.length)
    : total,
  0
);
assert.equal(hits.length, 0);
assert(Math.abs(entropy - 7.975765583653332) < 1e-10);

console.log(JSON.stringify({
  originalRunes: cipher.length,
  doubletRunSplits: runs.length - 1,
  runs: runs.length,
  bytes: bytes.length,
  entropyBitsPerByte: entropy,
  signatureHits: hits,
  first20Bytes: bytes.slice(0, 20),
  first10RunLengths: runs.slice(0, 10).map(r => r.digits.length)
}, null, 2));
console.log('PASS: original-input fixed rank28 frame, inverse plants, and signature screen');
