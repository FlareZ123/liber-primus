'use strict';

/**
 * Source-selected 2013 PARABLE Blum-Blum-Shub prime triple -> original LP2 p50
 * 32x8 base60-byte grid, four bit-extraction conventions. No fitted keys/clocks.
 * This SFT is separate from the full-corpus GP29 decoder and tests a native
 * *byte* transport: direct BBS parity-byte XOR against the original grid order.
 * Windows 11 / Node22 CommonJS; no external dependencies.
 */
const assert = require('node:assert/strict');
const {Buffer} = require('node:buffer');
const {createHash} = require('node:crypto');
const grid = require('../resources/liber-primus/base60-grid.json');

const P = 1259;
const Q = 1031;
const SEED = 1229;
const N = P * Q;
const X0 = (SEED * SEED) % N;
assert.equal(P * Q * SEED, 1595277641);
assert.equal(X0, 212412);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
const original = Buffer.from(grid.byte_rows.flat());
assert.equal(original.length, 256);

/**
 * @param {number} size
 * @param {'x0'|'x1'} timing
 * @param {'msb'|'lsb'} order
 * @returns {Buffer}
 */
function bbsParityKey(size, timing, order) {
  let x = X0;
  let first = true;
  const bytes = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    let v = 0;
    for (let j = 0; j < 8; j++) {
      if (!first || timing === 'x1') x = (x * x) % N;
      first = false;
      const bit = x & 1;
      if (order === 'msb') v = 2 * v + bit;
      else v |= bit << j;
    }
    bytes[i] = v;
  }
  return bytes;
}

/** @param {Buffer} data @param {Buffer} key */
function xor(data, key) {
  assert.equal(data.length, key.length);
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key[i];
  return out;
}

const native = Buffer.from(
  'THE PRIMES ARE SACRED. THE TOTIENT FUNCTION IS SACRED. ALL THINGS '
  + 'SHOULD BE ENCRYPTED. THE KEY IS ALL AROUND YOU. '
  + 'LIKE THE INSTAR TUNNELING TO THE SURFACE. '
  + 'FIND THE DIVINITY WITHIN AND EMERGE. '.repeat(3).slice(0, 256)
);
const plant = Buffer.alloc(256);
for (let i = 0; i < 256; i++) plant[i] = native[i % native.length];

/** @param {Buffer} bytes */
function stats(bytes) {
  let printable = 0;
  let whitespace = 0;
  for (const v of bytes) {
    if (v >= 32 && v <= 126) printable++;
    if ([9, 10, 13].includes(v)) whitespace++;
  }
  return {printable, printableOrWhitespace: printable + whitespace};
}
const signatures = [
  [Buffer.from('255044462d', 'hex'), '%PDF'],
  [Buffer.from('504b0304', 'hex'), 'ZIP'],
  [Buffer.from('1f8b08', 'hex'), 'gzip'],
  [Buffer.from('89504e470d0a1a0a', 'hex'), 'PNG'],
  [Buffer.from('ffd8ff', 'hex'), 'JPEG'],
  [Buffer.from('425a68', 'hex'), 'bzip2'],
  [Buffer.from('494433', 'hex'), 'ID3'],
  [Buffer.from('4f676753', 'hex'), 'OggS'],
  [Buffer.from('377abcaf271c', 'hex'), '7z'],
  [Buffer.from('526172211a0700', 'hex'), 'RAR'],
  [Buffer.from('504b0506', 'hex'), 'ZIP-empty'],
];

/** @param {Buffer} bytes */
function recognizedHeaders(bytes) {
  return signatures.filter(([magic]) => bytes.subarray(0, magic.length).equals(magic))
    .map(([, name]) => name);
}

const cases = [];
for (const timing of ['x0', 'x1']) for (const order of ['msb', 'lsb']) {
  const key = bbsParityKey(256, timing, order);
  const cipherPlant = xor(plant, key);
  assert.deepEqual(xor(cipherPlant, bbsParityKey(256, timing, order)), plant);
  const candidate = xor(original, key);
  const s = stats(candidate);
  cases.push({
    timing, order, ...s,
    first32Hex: candidate.subarray(0, 32).toString('hex'),
    recognizedHeaders: recognizedHeaders(candidate)
  });
}
assert.equal(cases.length, 4);
assert.deepEqual(cases.map((c) => c.printable), [96, 97, 92, 101]);
assert.ok(cases.every((c) => c.recognizedHeaders.length === 0));
assert.ok(cases.every((c) => c.printableOrWhitespace <= 105));

const summary = {
  original: 'resources/liber-primus/base60-grid.json printed 32x8 bytes',
  primeFactors: [P, Q, SEED],
  modulus: N, firstState: X0,
  alphabet: 'original base60 two-character numbers parsed as bytes 0..255',
  bytes: original.length, distinctRawBytes: new Set(original).size,
  firstOriginal32Hex: original.subarray(0, 32).toString('hex'),
  originalSha256: createHash('sha256').update(original).digest('hex'),
  firstOutput: 'parity bit of x0 or x1; eight bits per byte, MSB/LSB regrouping',
  cases, plantRecovered: true, recoveredPlaintext: false
};
console.log(JSON.stringify(summary, null, 2));
