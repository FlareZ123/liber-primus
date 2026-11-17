// Exact original 256-cell LP2 numeral-table low-order GF(2) generator gate.
// Run: node sims/lp2_p50_linear_generator_original_sft.cjs
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const table = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const tokens = table.rows.flat();
assert.equal(tokens.length, 256);
assert.equal(table.rows.length, 32);
assert.ok(table.rows.every((row) => row.length === 8));

/**
 * Berlekamp-Massey over GF(2), returning the exact minimum linear
 * recurrence order compatible with all observed bits.
 * @param {number[]} bits
 * @returns {number}
 */
function linearComplexity(bits) {
  const n = bits.length;
  const c = new Uint8Array(n + 1);
  const b = new Uint8Array(n + 1);
  c[0] = 1;
  b[0] = 1;
  let complexity = 0;
  let lastUpdate = -1;

  for (let position = 0; position < n; position++) {
    let discrepancy = bits[position];
    for (let j = 1; j <= complexity; j++) {
      discrepancy ^= c[j] & bits[position - j];
    }
    if (discrepancy === 0) continue;
    const prior = c.slice();
    const shift = position - lastUpdate;
    for (let j = 0; j + shift <= n; j++) {
      if (b[j]) c[j + shift] ^= 1;
    }
    if (2 * complexity <= position) {
      complexity = position + 1 - complexity;
      b.set(prior);
      lastUpdate = position;
    }
  }
  return complexity;
}

/**
 * @param {number[]} bytes
 * @returns {number[]}
 */
function bytePlaneComplexities(bytes) {
  return Array.from({ length: 8 }, (_, bit) =>
    linearComplexity(bytes.map((value) => (value >>> bit) & 1)));
}

/**
 * @param {number[]} bytes
 * @returns {number[]}
 */
function columnMajor(bytes) {
  return Array.from({ length: 256 }, (_, i) => bytes[(i % 8) * 32 + Math.floor(i / 8)]);
}

/**
 * @param {string} alphabet
 * @param {number} radix
 * @returns {number[]}
 */
function decode(alphabet, radix) {
  return tokens.map((token) => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, 'source token outside selected alphabet');
    return radix * hi + lo;
  });
}

/**
 * @param {number[]} bytes
 * @returns {{rowMajor: number[], columnMajor: number[], serial: number, min: number, max: number, distinct: number}}
 */
function profile(bytes) {
  const serialBits = bytes.flatMap((value) =>
    Array.from({ length: 8 }, (_, bit) => (value >>> bit) & 1));
  return {
    rowMajor: bytePlaneComplexities(bytes),
    columnMajor: bytePlaneComplexities(columnMajor(bytes)),
    serial: linearComplexity(serialBits),
    min: Math.min(...bytes),
    max: Math.max(...bytes),
    distinct: new Set(bytes).size
  };
}

const base60 = decode(table.alphabet, 60);
assert.deepEqual(base60, table.byte_rows.flat(), 'source-derived byte rows disagree');
assert.ok(tokens.every((token) => !token.includes('f')));

const base59 = decode(table.alphabet.replace('f', ''), 59);
const actual60 = profile(base60);
const actual59 = profile(base59);

assert.deepEqual(actual60.rowMajor, [128, 130, 129, 128, 128, 128, 128, 128]);
assert.deepEqual(actual60.columnMajor, [126, 128, 128, 128, 128, 129, 130, 128]);
assert.deepEqual(actual59.rowMajor, [128, 128, 128, 128, 130, 129, 128, 129]);
assert.deepEqual(actual59.columnMajor, [128, 130, 129, 127, 128, 128, 128, 128]);
assert.equal(actual60.serial, 1024);
assert.equal(actual59.serial, 1024);

// Positive controls: unkeyed output byte for every clock step of a 32- or
// 64-bit GF(2)-linear xorshift state. The output is the low eight bits.
let x32 = 0x9e3779b9;
const positive32 = [];
for (let i = 0; i < 256; i++) {
  x32 ^= x32 << 13;
  x32 ^= x32 >>> 17;
  x32 ^= x32 << 5;
  positive32.push(x32 & 255);
}
let x64 = 0x9e3779b97f4a7c15n;
const mask64 = (1n << 64n) - 1n;
const positive64 = [];
for (let i = 0; i < 256; i++) {
  x64 ^= (x64 << 13n) & mask64;
  x64 ^= x64 >> 7n;
  x64 ^= (x64 << 17n) & mask64;
  positive64.push(Number(x64 & 255n));
}
assert.deepEqual(bytePlaneComplexities(positive32), Array(8).fill(32));
assert.deepEqual(bytePlaneComplexities(positive64), Array(8).fill(64));

const missingFUnderUniformBytes = Math.pow(252 / 256, 256);
const expectedMissingBase60LowDigits =
  16 * Math.pow(251 / 256, 256) + 44 * Math.pow(252 / 256, 256);

console.log(JSON.stringify({
  source: 'resources/liber-primus/base60-grid.json',
  base60: actual60,
  base59: actual59,
  plantedXorshift32Planes: bytePlaneComplexities(positive32),
  plantedXorshift64Planes: bytePlaneComplexities(positive64),
  uniformByteNull: { missingF: missingFUnderUniformBytes,
    expectedMissingLowDigits: expectedMissingBase60LowDigits }
}, null, 2));
console.log('PASS: original-table finite linear-generator gate and planted controls');
