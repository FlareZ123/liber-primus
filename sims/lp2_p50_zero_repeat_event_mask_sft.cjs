/**
 * Read the p50 printed-leading-zero mask at the 86 original equal-rune events.
 * Independent one-rune-word control. Read-only original-input SFT, Node.js 22.
 * No free orientation, shift, key, page reset, or post-hoc ASCII alignment.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(root, filename), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pagesText = read('resources/liber-primus/lp2-transcription.txt').split(/\n%\s*\n/);
const tokens = grid.pages.flatMap((p) => p.tokens);
const leadingZero = tokens.map((token) => Number(token.startsWith('0')));
assert.equal(tokens.length, 256);
assert.equal(leadingZero.reduce((a, b) => a + b, 0), 60);
assert.equal(pagesText.length, 57);

/** @typedef {{page:number, offset:number, global:number, rune:number}} RuneSite */
/** @type {RuneSite[]} */
const repeated = [];
/** @type {RuneSite[][]} */
const words = [];
/** @type {RuneSite[]} */
let pending = [];
let absolute = 0;
for (const page of corpus.pages.filter((p) => p.page <= 55 && p.indices.length)) {
  const pIndex = page.page < 50 ? page.page : page.page - 1;
  const chars = Array.from(pagesText[pIndex]);
  const decoded = [];
  for (const char of chars) {
    const value = corpus.runes.indexOf(char);
    if (value >= 0) {
      decoded.push(value);
      pending.push({ page: page.page, offset: decoded.length - 1,
        global: absolute + decoded.length - 1, rune: value });
    } else if ((char === '-' || char === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
  assert.deepEqual(decoded, page.indices, 'transcription mismatch p' + page.page);
  for (let i = 1; i < decoded.length; i++) {
    if (decoded[i] === decoded[i - 1]) {
      repeated.push({ page: page.page, offset: i,
        global: absolute + i, rune: decoded[i] });
    }
  }
  absolute += decoded.length;
}
if (pending.length) words.push(pending);
assert.equal(absolute, 12956);
assert.equal(words.length, 2896);
assert.equal(repeated.length, 86);

const single = words.filter((word) => word.length === 1).map((word) => word[0]);
assert.equal(single.length, 83);
// A transition is assigned to the first of its two original rune positions.
const marks = repeated.map((e) => leadingZero[(e.global - 1) & 255]);
const ones = marks.reduce((a, b) => a + b, 0);
assert.equal(ones, 33);
const bits = marks.join('');
assert.equal(bits.length, 86);
const fullBytes = Array.from({ length: 10 }, (_, i) =>
  parseInt(bits.slice(i * 8, (i + 1) * 8), 2));
const hex = fullBytes.map((b) => b.toString(16).padStart(2, '0')).join('');
const leftover = bits.slice(80);
assert.equal(hex, '29a28968a9c894c1d112');
assert.equal(leftover, '001100');

const singletonGlyphHits = single.reduce((n, e) => n + leadingZero[e.global & 255], 0);
const singletonIncomingHits = single.reduce((n, e) =>
  n + leadingZero[(e.global - 1) & 255], 0);
assert.equal(singletonGlyphHits, 23);
assert.equal(singletonIncomingHits, 25);


// A second, historically recognizable typed transport gate: two GP29 rune
// values per one source-fixed bit yield 58 distinct digits (Bitcoin Base58).
// No secret permuted alphabet is fitted. Preserve exact event order and the
// original zero=1 polarity. Only the two natural product embeddings are read.
/** @param {number[]} digits @returns {Buffer} */
function decodeBase58(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(digit >= 0 && digit < 58);
    value = value * 58n + BigInt(digit);
  }
  let hexText = value.toString(16);
  if (hexText.length & 1) hexText = '0' + hexText;
  return Buffer.from(hexText, 'hex');
}
/** @param {Buffer} bytes @returns {Buffer} */
function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest();
}
/** @param {Buffer} bytes @returns {boolean} */
function hasBase58Check(bytes) {
  const body = bytes.subarray(0, -4);
  const checksum = sha256(sha256(body)).subarray(0, 4);
  return checksum.equals(bytes.subarray(-4));
}
const base58Readings = [
  ['rune+29*zero', repeated.map((r, i) => r.rune + 29 * marks[i]),
    '0898975ee19bdea2ff3c88751c735d1607f5271387af780064807c17daed59eeebd4cdb813b32b18185fa46c2f1f9fe4f7894335609f25ba0a058c67e4548e'],
  ['2*rune+zero', repeated.map((r, i) => 2 * r.rune + marks[i]),
    '1120aacb7458f586fd3ae1a0f9a9e68f807510443d87737ea167301e1c07d61881de9e0157a1b0812683f9fc287adf722ac164785a36a5b04199767b924eb0']
];
for (const [label, digits, expectedHex] of base58Readings) {
  const bytes = decodeBase58(digits);
  assert.equal(bytes.length, 63);
  assert.equal(bytes.toString('hex'), expectedHex);
  assert.equal(hasBase58Check(bytes), false);
  console.log('Natural Base58 product', label, '| decoded bytes:', bytes.length,
    '| double-SHA256/Base58Check:', false,
    '| hex prefix:', expectedHex.slice(0, 24));
}


// Exact all-secret capacity obstruction: the authentic 64-byte p56 printed
// target must be representable as a single 86-digit Base58 integer, even if
// an unknown full 58-way substitution chooses every event's digit freely.
const originalTarget = JSON.parse(read('resources/cicada2014-anend-binary-witness.json')).target_hex;
assert.equal(originalTarget.length, 128);
const digestInteger = BigInt('0x' + originalTarget);
const capacity = 58n ** BigInt(repeated.length);
assert.ok(digestInteger >= capacity, 'target unexpectedly fits 86 Base58 digits');
let minimumDigits = 0;
for (let x = digestInteger; x > 0n; x /= 58n) minimumDigits++;
assert.equal(minimumDigits, 88);
console.log('All-secret full-digest capacity theorem:',
  'target needs', minimumDigits, 'Base58 digits; event channel has',
  repeated.length, '| target/capacity (floor)=', String(digestInteger / capacity));

console.log('Source: 55 original rune pages, 12,956 runes, 2,896 complete printed words');
console.log('p50 original high-digit-zero cells:', 60, '/256');
console.log('Within-page equal-rune events:', repeated.length,
  '| phase-zero mask hits:', ones);
console.log('Direct source-order 86-bit event read:', bits);
console.log('Fixed MSB-first full bytes:', hex,
  '| remaining 6 bits:', leftover);
console.log('Fixed-byte ASCII presentation:',
  fullBytes.map((n) => n >= 32 && n <= 126 ? String.fromCharCode(n) : '.').join(''));
console.log('Independent original one-rune words:', single.length,
  '| zero-mask at glyph index:', singletonGlyphHits,
  '| zero-mask at incoming transition:', singletonIncomingHits);
console.log('Original token-mask exposure:', 60 / 256,
  '| one-rune-word expected mask hits:', single.length * 60 / 256);
console.log('PASS: original input round-trip transcription, event positions, and bytes');
