'use strict';

/**
 * Source-native GF(2) linear-complexity gate for the printed 32x8 LP2 grid.
 * Read-only, Node.js 22/CommonJS. Positive-control binary linear generator.
 * 
 * The hypothesis under test is that table bytes expose consecutive, unmasked
 * output bits from a short binary LFSR. A linear recurrence shorter than the
 * Berlekamp-Massey complexity cannot reproduce an observed sequence.
 * Neither a large LFSR nor a nonlinear/cryptographic generator is excluded.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const grid = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-grid-256.json'),
  'utf8'
));
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.ok(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
assert.deepEqual(bytes.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);

/**
 * Binary Berlekamp-Massey: shortest GF(2) linear recurrence for a bit sequence.
 * The evolving C polynomial is public, and no secret key is searched.
 * @param {number[]} bits
 * @returns {number}
 */
function linearComplexity(bits) {
  const n = bits.length;
  const C = new Uint8Array(n + 1);
  const B = new Uint8Array(n + 1);
  C[0] = B[0] = 1;
  let L = 0;
  let m = -1;
  for (let t = 0; t < n; t++) {
    let discrepancy = bits[t];
    for (let i = 1; i <= L; i++) {
      discrepancy ^= C[i] & bits[t - i];
    }
    if (discrepancy !== 0) {
      const before = C.slice();
      const shift = t - m;
      for (let j = 0; j + shift <= n; j++) C[j + shift] ^= B[j];
      if (2 * L <= t) {
        L = t + 1 - L;
        B.set(before);
        m = t;
      }
    }
  }
  return L;
}

/**
 * @param {number[]} source
 * @param {'msb'|'lsb'} bitOrder
 * @returns {number[]}
 */
function serialBits(source, bitOrder) {
  const out = [];
  for (const value of source) {
    for (let bit = 0; bit < 8; bit++) {
      const shift = bitOrder === 'msb' ? 7 - bit : bit;
      out.push((value >> shift) & 1);
    }
  }
  return out;
}
const columnMajor = [];
for (let col = 0; col < 8; col++) {
  for (let row = 0; row < 32; row++) {
    columnMajor.push(bytes[row * 8 + col]);
  }
}
const complexities = {
  row_msb: linearComplexity(serialBits(bytes, 'msb')),
  row_lsb: linearComplexity(serialBits(bytes, 'lsb')),
  column_msb: linearComplexity(serialBits(columnMajor, 'msb')),
  column_lsb: linearComplexity(serialBits(columnMajor, 'lsb')),
  bit_planes_lsb_to_msb: Array.from({length: 8}, (_, bit) =>
    linearComplexity(bytes.map(v => (v >> bit) & 1)))
};
assert.deepEqual(complexities, {
  row_msb: 1024,
  row_lsb: 1024,
  column_msb: 1022,
  column_lsb: 1025,
  bit_planes_lsb_to_msb: [128, 130, 129, 128, 128, 128, 128, 128]
});

/** A source-size-matched synthetic 32-bit GF(2) recurrence positive control. */
const plant = Array.from({length: 32}, (_, i) => (0x3301 >> i) & 1);
for (let i = 32; i < 2048; i++) {
  plant.push(plant[i - 7] ^ plant[i - 32]);
}
assert.equal(linearComplexity(plant), 30);
const plantedBytes = Array.from({length: 256}, (_, i) => {
  let value = 0;
  for (let b = 0; b < 8; b++) value |= plant[i * 8 + b] << b;
  return value;
});
assert.equal(linearComplexity(serialBits(plantedBytes, 'lsb')), 30);
assert.ok(Array.from({length: 8}, (_, bit) =>
  linearComplexity(plantedBytes.map(v => (v >> bit) & 1)))
  .every(L => L <= 32));

console.log(JSON.stringify({
  source: 'resources/liber-primus/lp2-grid-256.json',
  length_bytes: bytes.length,
  complexities,
  planted_gf2_32_state_complexity: linearComplexity(plant),
  verdict: 'No direct short linear binary generator under these source readouts'
}, null, 2));
