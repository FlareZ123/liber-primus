/**
 * Minimum linear feedback complexity of original 256-byte LP2 numerical table.
 * Standalone CommonJS test for Windows Node.js 22; no external dependencies.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const file = path.resolve(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const rows = JSON.parse(fs.readFileSync(file, 'utf8')).byte_rows;
assert.equal(rows.length, 32);
assert.ok(rows.every(row => row.length === 8 && row.every(x => Number.isInteger(x) && x >= 0 && x <= 255)));
const flat = rows.flat();
const sha = crypto.createHash('sha256').update(Buffer.from(flat)).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** GF(256) product under AES polynomial 0x11b. @param {number} a @param {number} b @returns {number} */
function multiply(a, b) {
  let result = 0;
  for (let j = 0; j < 8; j++) {
    if (b & 1) result ^= a;
    a = (a << 1) ^ ((a & 128) ? 0x11b : 0);
    b >>>= 1;
  }
  return result;
}
/** @param {number} base @param {number} exponent @returns {number} */
function power(base, exponent) {
  let out = 1;
  while (exponent > 0) {
    if (exponent & 1) out = multiply(out, base);
    base = multiply(base, base);
    exponent >>>= 1;
  }
  return out;
}
/**
 * Minimum-order linear recurrence by finite-field Berlekamp-Massey.
 * @param {number[]} sequence
 * @param {'gf2'|'gf256'} field
 * @returns {{order:number, feedback:number[], nonzero:number}}
 */
function berlekampMassey(sequence, field) {
  const mul = field === 'gf2' ? (a, b) => a & b : multiply;
  const inverse = field === 'gf2' ? a => a : a => power(a, 254);
  let feedback = [1];
  let previous = [1];
  let length = 0;
  let last = 1;
  let shift = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= length; i++) discrepancy ^= mul(feedback[i] || 0, sequence[n - i]);
    if (discrepancy === 0) { shift++; continue; }
    const old = feedback.slice();
    const scale = mul(discrepancy, inverse(last));
    for (let i = 0; i < previous.length; i++) feedback[i + shift] = (feedback[i + shift] || 0) ^ mul(scale, previous[i]);
    if (2 * length <= n) {
      length = n + 1 - length;
      previous = old;
      last = discrepancy;
      shift = 1;
    } else {
      shift++;
    }
  }
  for (let n = length; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= length; i++) discrepancy ^= mul(feedback[i] || 0, sequence[n - i]);
    assert.equal(discrepancy, 0, 'recurrence at index ' + n);
  }
  return {order: length, feedback, nonzero: feedback.filter(Boolean).length};
}

const orientations = {
  row_major: flat,
  column_major: Array.from({length: 8}, (_, c) => rows.map(row => row[c])).flat(),
  serpentine_rows: rows.flatMap((row, r) => r % 2 ? row.slice().reverse() : row)
};
assert.equal(multiply(0x57, 0x83), 0xc1);
assert.equal(power(0x53, 254), 0xca);
const seed = Array.from({length: 9}, (_, i) => 3 + 17 * i);
const planted = seed.slice();
for (let n = 9; n < 256; n++) planted.push(planted[n - 9] ^ multiply(5, planted[n - 5]) ^ multiply(37, planted[n - 1]));
const positive = berlekampMassey(planted, 'gf256');
assert.equal(positive.order, 9);
console.log('GF256 order-9 positive: recovered ' + positive.order + ' with ' + positive.nonzero + ' nonzero coefficients');
for (const [name, values] of Object.entries(orientations)) {
  assert.equal(values.length, 256);
  const bytes = berlekampMassey(values, 'gf256');
  const bitBig = values.flatMap(byte => Array.from({length: 8}, (_, i) => (byte >>> (7 - i)) & 1));
  const bitLittle = values.flatMap(byte => Array.from({length: 8}, (_, i) => (byte >>> i) & 1));
  const msb = berlekampMassey(bitBig, 'gf2');
  const lsb = berlekampMassey(bitLittle, 'gf2');
  const bitplanes = Array.from({length: 8}, (_, b) => berlekampMassey(values.map(x => (x >>> b) & 1), 'gf2').order);
  console.log(name + ' GF256 order=' + bytes.order + ' (nonzero=' + bytes.nonzero + '); bit-MSB=' + msb.order + '; bit-LSB=' + lsb.order + '; bitplanes=' + bitplanes.join(','));
  assert.ok(bytes.order >= 128 && msb.order >= 1022 && lsb.order >= 1022);
}
console.log('PASS original SHA256=' + sha + '; base60 row/column/serpentine in fixed GF256/GF2');
