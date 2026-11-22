'use strict';

/**
 * Original-source SFT for Marsaglia's 2003 four-word xorshift128 PRNG.
 *
 * Model: each printed p49-p51 base60 token is one unsigned output byte from
 * one fixed byte lane (0, 8, 16, or 24) of successive xorshift128 words.
 * Printed row or column order, either direction, are the only layouts.
 *
 * All 128 initial-state bits are unknown. Equations are solved over GF(2)
 * without fitting a particular seed or plaintext.
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const grid = require(path.join(__dirname, '../resources/liber-primus/lp2-grid-256.json'));

const STATE_BITS = 128;
const RHS = 1n << 128n;
const BASIS_LENGTH = 32;
const WORD_BYTES = 4;
const table = grid.bytes;

assert.equal(table.length, 256);
assert.deepEqual(grid.pages.map(p => p.rows), [10, 13, 9]);
assert(table.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

/**
 * @param {number[]} initial Four unsigned 32-bit state words.
 * @param {number} count Number of successive output words.
 * @returns {Uint32Array} Successive updated w-register values.
 */
function xorshift128(initial, count) {
  let [x, y, z, w] = initial.map(v => v >>> 0);
  const result = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const t = (x ^ (x << 11)) >>> 0;
    x = y;
    y = z;
    z = w;
    w = (w ^ (w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
    result[i] = w;
  }
  return result;
}

/** @param {number} bit Basis-state bit from 0 to 127. */
function oneHot(bit) {
  return Array.from({ length: WORD_BYTES }, (_, word) =>
    word === Math.floor(bit / 32) ? ((1 << (bit % 32)) >>> 0) : 0);
}

/**
 * Generate one 128-bit linear equation for each printed output bit.
 * Precompute coefficient rows for each of the four possible byte lanes.
 * @returns {bigint[][]}
 */
function coefficientRows() {
  const basis = Array.from({ length: STATE_BITS }, (_, j) =>
    xorshift128(oneHot(j), BASIS_LENGTH));
  return [0, 8, 16, 24].map(shift => {
    const equations = [];
    for (let i = 0; i < BASIS_LENGTH; i++) {
      for (let b = 0; b < 8; b++) {
        let row = 0n;
        for (let j = 0; j < STATE_BITS; j++) {
          if (((basis[j][i] >>> shift) & (1 << b)) !== 0)
            row |= 1n << BigInt(j);
        }
        equations.push(row);
      }
    }
    return equations;
  });
}

const COEFF = coefficientRows();

/**
 * @param {number[]} bytes Exactly 32 successive alleged output bytes.
 * @param {number} lane Byte lane 0..3.
 * @returns {{compatible:boolean, rank:number, failByte:number, pivot:bigint[]}}
 */
function fit32(bytes, lane) {
  assert.equal(bytes.length, BASIS_LENGTH);
  const pivot = Array(STATE_BITS).fill(0n);
  let rank = 0;
  for (let i = 0; i < BASIS_LENGTH; i++) {
    for (let b = 0; b < 8; b++) {
      let row = COEFF[lane][i * 8 + b] |
        ((bytes[i] & (1 << b)) ? RHS : 0n);
      for (let k = 0; k < STATE_BITS; k++) {
        if ((row & (1n << BigInt(k))) === 0n) continue;
        if (pivot[k] !== 0n) {
          row ^= pivot[k];
        } else {
          pivot[k] = row;
          rank++;
          row = 0n;
          break;
        }
      }
      if (row !== 0n)
        return { compatible: false, rank, failByte: i, pivot };
    }
  }
  return { compatible: true, rank, failByte: -1, pivot };
}

/** @param {bigint[]} pivot Full-rank GF(2) echelon system. */
function recoverSeed(pivot) {
  assert.equal(pivot.filter(Boolean).length, STATE_BITS);
  const bit = Array(STATE_BITS).fill(0);
  for (let p = STATE_BITS - 1; p >= 0; p--) {
    let v = Number((pivot[p] & RHS) !== 0n);
    for (let k = p + 1; k < STATE_BITS; k++) {
      if ((pivot[p] & (1n << BigInt(k))) !== 0n) v ^= bit[k];
    }
    bit[p] = v;
  }
  const seed = [];
  for (let word = 0; word < WORD_BYTES; word++) {
    let value = 0;
    for (let j = 0; j < 32; j++) if (bit[word * 32 + j]) value |= (1 << j);
    seed.push(value >>> 0);
  }
  return seed;
}

/** @param {string} order A physically printed reading order. */
function printedOrder(order) {
  let result;
  if (order.startsWith('column')) {
    result = Array.from({ length: 256 }, (_, i) =>
      table[(i % 32) * 8 + Math.floor(i / 32)]);
  } else {
    result = table.slice();
  }
  if (order.endsWith('Reverse')) result.reverse();
  return result;
}

const plantedSeed = [0x12345678, 0x9abcdef0, 0x0fedcba9, 0x87654321];
const plantedWords = xorshift128(plantedSeed, 256);
for (const shift of [0, 8, 16, 24]) {
  const plantedBytes = Array.from(plantedWords, w => (w >>> shift) & 255);
  for (let block = 0; block < 8; block++) {
    const observed = plantedBytes.slice(block * 32, (block + 1) * 32);
    const positive = fit32(observed, shift / 8);
    assert.equal(positive.compatible, true,
      'independent 32-byte planted positive must fit');
  }
}
const firstPlant = Array.from(plantedWords.slice(0, 32), w => w & 255);
const recovered = fit32(firstPlant, 0);
assert.equal(recovered.rank, STATE_BITS, 'low byte must identify all 128 bits');
assert.deepEqual(recoverSeed(recovered.pivot), plantedSeed,
  'blind planted state recovery');

let modes = 0;
let failures = 0;
for (const order of ['row', 'rowReverse', 'column', 'columnReverse']) {
  const source = printedOrder(order);
  for (const shift of [0, 8, 16, 24]) {
    const firstBad = [];
    for (let block = 0; block < 8; block++) {
      const segment = source.slice(block * 32, (block + 1) * 32);
      const decision = fit32(segment, shift / 8);
      assert.equal(decision.compatible, false,
        'original source has an inconsistent 32-byte block');
      firstBad.push(decision.failByte);
      failures++;
    }
    modes++;
    console.log(order + ' lane=' + shift +
      ' incompatible blocks=8/8; first bad offsets=' + firstBad.join(','));
  }
}
assert.equal(modes, 16);
assert.equal(failures, 128);
console.log('PASS planted xorshift128: all 32 model-block controls; low-byte 128-bit seed exact');
console.log('PASS original table: 16/16 printed-order / byte-lane models incompatible');
console.log('Lower bound: >=8 source byte changes required for any one literal model.');
