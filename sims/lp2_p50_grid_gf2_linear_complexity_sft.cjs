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


/**
 * NIST FIPS 197 (2023) key-expansion necessary condition:
 * at ordinary 32-bit word indices, w[i] == w[i-Nk] XOR w[i-1].
 * S-box positions are left unconstrained, making this an all-secret test.
 * @param {number[]} data
 * @param {number} Nk
 * @param {number} Nw
 * @returns {{tested:number,best:number}}
 */
function scheduleEquality(data, Nk, Nw) {
  let tested = 0, best = 0;
  for (let offset = 0; offset <= data.length - 4 * Nw; offset++) {
    const words = [];
    for (let i = 0; i < Nw; i++) {
      const at = offset + 4 * i;
      words.push(
        (data[at] * 0x1000000 + (data[at + 1] << 16)
        + (data[at + 2] << 8) + data[at + 3]) >>> 0
      );
    }
    let equal = 0;
    for (let i = Nk; i < Nw; i++) {
      if (i % Nk === 0 || (Nk === 8 && i % 8 === 4)) continue;
      if (words[i] === (words[i - Nk] ^ words[i - 1]) >>> 0) equal++;
    }
    best = Math.max(best, equal);
    tested++;
  }
  return { tested, best };
}

/** @param {number} a @param {number} b @returns {number} */
function gf8Multiply(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const high = a & 128;
    a = (a << 1) & 255;
    if (high) a ^= 27;
    b >>>= 1;
  }
  return p;
}

/** @param {number} x @param {number} n @returns {number} */
function gf8Power(x, n) {
  let product = 1;
  while (n > 0) {
    if (n & 1) product = gf8Multiply(product, x);
    x = gf8Multiply(x, x);
    n >>>= 1;
  }
  return product;
}

/** NIST AES S-box from GF(2^8) inverse and the affine map. @param {number} x */
function aesSubByte(x) {
  const v = x === 0 ? 0 : gf8Power(x, 254);
  const rol = n => ((v << n) | (v >>> (8 - n))) & 255;
  return v ^ rol(1) ^ rol(2) ^ rol(3) ^ rol(4) ^ 99;
}

/**
 * Complete AES-256 expanded round-key schedule, including nonlinear rounds.
 * @param {number[]} key32
 * @returns {number[]}
 */
function aes256Expand(key32) {
  assert.equal(key32.length, 32);
  const words = Array.from({length:8}, (_,i) => key32.slice(i*4,i*4+4));
  let rc = 1;
  for (let i = 8; i < 60; i++) {
    let temp = words[i-1].slice();
    if (i % 8 === 0) {
      temp.push(temp.shift());
      temp = temp.map(aesSubByte);
      temp[0] ^= rc;
      rc = gf8Multiply(rc, 2);
    } else if (i % 8 === 4) {
      temp = temp.map(aesSubByte);
    }
    words.push(words[i-8].map((v,j) => v ^ temp[j]));
  }
  return words.flat();
}
const key32 = Array.from(Buffer.from(
  '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4', 'hex'));
const expanded = aes256Expand(key32);
assert.equal(Buffer.from(expanded.slice(32, 48)).toString('hex'),
  '9ba354118e6925afa51a8b5f2067fcde', 'NIST AES-256 A.3 expansion');
assert.deepEqual(scheduleEquality(expanded, 8, 60), {tested:1,best:39});
const scheduleOrders = {
  row: bytes,
  row_reverse: bytes.slice().reverse(),
  column: columnMajor,
  column_reverse: columnMajor.slice().reverse()
};
const expandedKeyGate = {};
for (const [name, data] of Object.entries(scheduleOrders)) {
  const cases = [
    {name:'AES128',Nk:4,Nw:44,eq:30,windows:81},
    {name:'AES192',Nk:6,Nw:52,eq:38,windows:49},
    {name:'AES256',Nk:8,Nw:60,eq:39,windows:17}
  ];
  expandedKeyGate[name] = {};
  for (const c of cases) {
    const result = scheduleEquality(data,c.Nk,c.Nw);
    assert.deepEqual(result,{tested:c.windows,best:0});
    expandedKeyGate[name][c.name] = {
      tested_windows:result.tested,
      exact_linear_word_equalities:result.best,
      required_equalities:c.eq
    };
  }
}
console.log(JSON.stringify({
  source:'resources/liber-primus/lp2-grid-256.json',
  interpretation:'NIST FIPS 197 exact byte-contiguous round-key schedules',
  expandedKeyGate,
  NIST_AES256_A3_plant:'PASS: 39/39 word recurrences'
},null,2));
