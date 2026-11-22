#!/usr/bin/env node
'use strict';

/**
 * All-secret GF(2) state feasibility of small linear binary generators
 * against the original LP2 p49-51 32x8 numerical table.
 * Run: node sims/lp2_p50_gf2_linear_prng_state_gate_sft.cjs
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const data = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'));
const original = Uint8Array.from(data.bytes);
const sourceHash = crypto.createHash('sha256').update(original).digest('hex');

assert.equal(original.length, 256);
assert.equal(sourceHash, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

function berlekampMassey(bits) {
  let C = 1n;
  let B = 1n;
  let L = 0;
  let m = -1;
  for (let n = 0; n < bits.length; n++) {
    let discrepancy = bits[n];
    for (let i = 1; i <= L; i++) {
      if ((C >> BigInt(i)) & 1n) discrepancy ^= bits[n - i];
    }
    if (discrepancy) {
      const prior = C;
      C ^= B << BigInt(n - m);
      if (2 * L <= n) {
        L = n + 1 - L;
        B = prior;
        m = n;
      }
    }
  }
  return L;
}

function reordered(input, order) {
  if (order === 'row-major') return Uint8Array.from(input);
  if (order === 'reverse') return Uint8Array.from(input).reverse();
  if (order === 'column-major') {
    return Uint8Array.from({ length: 256 }, (_, i) => input[(i % 32) * 8 + Math.floor(i / 32)]);
  }
  if (order === 'row-snake') {
    return Uint8Array.from({ length: 256 }, (_, i) => {
      const row = Math.floor(i / 8);
      const col = i % 8;
      return input[8 * row + (row % 2 ? 7 - col : col)];
    });
  }
  throw new Error('Unknown order: ' + order);
}

function serialBits(bytes, bitOrder) {
  const bits = [];
  for (const value of bytes) {
    for (let b = 0; b < 8; b++) bits.push((value >> (bitOrder === 'lsb' ? b : 7 - b)) & 1);
  }
  return bits;
}

/** Generate bytes of the standard Marsaglia xorshift32 recurrence. */
function xorshift32(initial, count, format) {
  let state = initial[0] >>> 0;
  const output = [];
  while (output.length < count) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    appendWord(output, state, format);
  }
  return Uint8Array.from(output.slice(0, count));
}

/** Generate bytes of Marsaglia's (11,8,19) four-word xorshift128. */
function xorshift128(initial, count, format) {
  let [x, y, z, w] = initial.map(v => v >>> 0);
  const output = [];
  while (output.length < count) {
    const t = (x ^ (x << 11)) >>> 0;
    [x, y, z, w] = [y, z, w, (w ^ (w >>> 19) ^ t ^ (t >>> 8)) >>> 0];
    appendWord(output, w, format);
  }
  return Uint8Array.from(output.slice(0, count));
}

function appendWord(output, word, format) {
  if (format.startsWith('lane')) {
    output.push((word >>> Number(format.slice(4))) & 255);
  } else if (format === 'packed-little') {
    for (let i = 0; i < 4; i++) output.push((word >>> (8 * i)) & 255);
  } else if (format === 'packed-big') {
    for (let i = 3; i >= 0; i--) output.push((word >>> (8 * i)) & 255);
  } else {
    throw new Error('Unknown word projection: ' + format);
  }
}

/**
 * All-secret GF(2) feasibility. Each column is the generator output under a
 * one-hot state vector. Gaussian elimination tests whether any initial state
 * yields the exact observed bytes, without searching 2^32/2^128 seeds.
 */
function initialStateFeasibility(generator, stateBits, format, observed) {
  const equations = new Array(observed.length * 8).fill(0n);
  for (let stateBit = 0; stateBit < stateBits; stateBit++) {
    const initial = new Array(stateBits / 32).fill(0);
    initial[Math.floor(stateBit / 32)] = (1 << (stateBit % 32)) >>> 0;
    const sequence = generator(initial, observed.length, format);
    const coefficient = 1n << BigInt(stateBit);
    for (let i = 0; i < observed.length; i++) {
      for (let bit = 0; bit < 8; bit++) {
        if ((sequence[i] >>> bit) & 1) equations[i * 8 + bit] |= coefficient;
      }
    }
  }

  const pivotRows = new Array(stateBits).fill(0n);
  const pivotValues = new Uint8Array(stateBits);
  let rank = 0;
  for (let i = 0; i < equations.length; i++) {
    let row = equations[i];
    let value = (observed[i >>> 3] >>> (i & 7)) & 1;
    while (row !== 0n) {
      const pivot = row.toString(2).length - 1;
      if (pivotRows[pivot] !== 0n) {
        row ^= pivotRows[pivot];
        value ^= pivotValues[pivot];
      } else {
        pivotRows[pivot] = row;
        pivotValues[pivot] = value;
        rank++;
        break;
      }
    }
    if (row === 0n && value) {
      return { possible: false, rank, contradictoryByte: i >>> 3, contradictoryBit: i & 7 };
    }
  }
  return { possible: true, rank };
}

const sequenceOrders = ['row-major', 'reverse', 'column-major', 'row-snake'];
const complexity = {};
for (const order of sequenceOrders) {
  const bytes = reordered(original, order);
  const lsb = berlekampMassey(serialBits(bytes, 'lsb'));
  const msb = berlekampMassey(serialBits(bytes, 'msb'));
  const planes = Array.from({ length: 8 }, (_, b) =>
    berlekampMassey(Array.from(bytes, value => (value >>> b) & 1))
  );
  complexity[order] = { lsb, msb, planes };
}
assert.deepEqual(complexity, {
  'row-major': { lsb: 1024, msb: 1024, planes: [128, 130, 129, 128, 128, 128, 128, 128] },
  reverse: { lsb: 1024, msb: 1024, planes: [129, 127, 128, 128, 129, 129, 128, 128] },
  'column-major': { lsb: 1025, msb: 1022, planes: [128, 131, 128, 130, 128, 129, 128, 129] },
  'row-snake': { lsb: 1024, msb: 1024, planes: [128, 128, 128, 129, 128, 128, 128, 129] }
});

const formats = ['lane0', 'lane8', 'lane16', 'lane24', 'packed-little', 'packed-big'];
const models = [
  { name: 'xorshift32', width: 32, generator: xorshift32, seed: [0x9e3779b9] },
  { name: 'xorshift128', width: 128, generator: xorshift128, seed: [0x9e3779b9, 0x243f6a88, 0xb7e15162, 0xa54ff53a] }
];
const allModels = {};
for (const model of models) {
  const results = {};
  for (const format of formats) {
    const nativePlant = model.generator(model.seed, original.length, format);
    const plantCheck = initialStateFeasibility(model.generator, model.width, format, nativePlant);
    assert.equal(plantCheck.possible, true, model.name + ' ' + format + ' native plant must be feasible');
    const result = initialStateFeasibility(model.generator, model.width, format, original);
    assert.equal(result.possible, false, model.name + ' ' + format + ' original must be impossible');
    results[format] = result;
  }
  allModels[model.name] = results;
}
console.log('Source SHA256:', sourceHash);
console.log('Linear complexity (2,048 contiguous source bits; 256-bit planes):');
console.log(JSON.stringify(complexity, null, 2));
console.log('Exact all-secret initial-state exclusions (12 models; all positive plants pass):');
console.log(JSON.stringify(allModels, null, 2));
console.log('PASS: no unknown plaintext or historical key is implied by these finite exclusions.');
