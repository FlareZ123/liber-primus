#!/usr/bin/env node
'use strict';

// Source-native, self-contained (23,12,7) binary Golay codeword gate.
// Node.js 22, no external packages. Run from the repository root.

const assert = require('node:assert/strict');
const path = require('node:path');
const grid = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'));

/** @param {number} value @param {number} generator @returns {number} */
function remainder(value, generator) {
  let v = value;
  while (v >= 2048) {
    const degree = 31 - Math.clz32(v);
    v ^= generator << (degree - 11);
  }
  return v;
}

/** @param {number} a @param {number} b @returns {number} */
function multiplyGF2(a, b) {
  let output = 0;
  for (let i = 0; i < 12; i++) if ((a >>> i) & 1) output ^= b << i;
  return output;
}

/** @param {number[]} values @param {boolean} msb @returns {number[]} */
function toBits(values, msb) {
  return values.flatMap(value =>
    Array.from({length: 8}, (_, j) => (value >>> (msb ? 7 - j : j)) & 1));
}

/** @param {number[]} bits @returns {number[]} */
function toBlocks(bits) {
  assert.equal(bits.length, 2047);
  return Array.from({length: 89}, (_, i) => {
    let v = 0;
    for (const bit of bits.slice(23 * i, 23 * (i + 1))) v = v * 2 + bit;
    return v;
  });
}

/** @param {number[]} values @returns {{zeros:number, maximum:number, pairs:number, distinct:number}} */
function summary(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  const frequencies = [...counts.values()];
  return {
    zeros: counts.get(0) || 0,
    maximum: Math.max(...frequencies),
    pairs: frequencies.reduce((n, frequency) => n + frequency * (frequency - 1) / 2, 0),
    distinct: counts.size
  };
}

/** @param {number[][]} rows @returns {object[]} */
function originalScan(rows) {
  const output = [];
  for (const axis of ['row', 'column']) {
    const values = axis === 'row'
      ? rows.flat()
      : Array.from({length: 8}, (_, col) => rows.map(row => row[col])).flat();
    for (const reverse of [false, true]) {
      for (const msb of [false, true]) {
        for (const omit of ['first', 'last']) {
          const full = toBits(reverse ? [...values].reverse() : values, msb);
          const bits = omit === 'first' ? full.slice(1) : full.slice(0, -1);
          const blocks = toBlocks(bits);
          for (const generator of [0xAE3, 0xC75]) {
            output.push({
              axis, reverse, msb, omit, generator: generator.toString(16),
              ...summary(blocks.map(value => remainder(value, generator)))
            });
          }
        }
      }
    }
  }
  return output;
}

function plantedControls() {
  for (const generator of [0xAE3, 0xC75]) {
    assert.equal(remainder((1 << 23) | 1, generator), 0);
    const blocks = Array.from({length: 89}, (_, i) =>
      multiplyGF2((73 * i + 11) & 0xFFF, generator));
    assert(blocks.some(value => value !== 0));
    assert(blocks.every(value => remainder(value, generator) === 0));
    const codeBits = blocks.flatMap(value =>
      Array.from({length: 23}, (_, j) => (value >>> (22 - j)) & 1));
    for (const omit of ['first', 'last']) {
      const framed = omit === 'first' ? [1, ...codeBits] : [...codeBits, 1];
      const recovered = toBlocks(omit === 'first' ? framed.slice(1) : framed.slice(0, -1));
      assert.equal(summary(recovered.map(value => remainder(value, generator))).zeros, 89);
    }
    // A fixed (unknown) 23-bit XOR mask would leave the same Golay syndrome
    // at all 89 positions, because the code is linear.
    const masked = blocks.map(value => value ^ 1);
    const maskedResult = summary(masked.map(value => remainder(value, generator)));
    assert.equal(maskedResult.maximum, 89);
    assert.equal(maskedResult.zeros, 0);
  }
}

function main() {
  assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
  assert.equal(grid.byte_rows.length, 32);
  for (const row of grid.byte_rows) {
    assert.equal(row.length, 8);
    for (const b of row) assert(Number.isInteger(b) && b >= 0 && b <= 255);
  }
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  assert.deepEqual(bytes.slice(0, 8), [203,231,167,186,97,237,126,183]);
  assert.deepEqual(bytes.slice(-8), [113,158,172,230,180,36,189,80]);
  plantedControls();
  const scans = originalScan(grid.byte_rows);
  assert.equal(scans.length, 32);
  const zeroDistribution = Object.create(null);
  for (const s of scans) zeroDistribution[s.zeros] = (zeroDistribution[s.zeros] || 0) + 1;
  const observed = {
    configurations: scans.length,
    zeroDistribution,
    maximumZeroCodewords: Math.max(...scans.map(s => s.zeros)),
    maximumSharedSyndrome: Math.max(...scans.map(s => s.maximum)),
    maximumSyndromePairs: Math.max(...scans.map(s => s.pairs)),
    positiveControls: '89/89 original-code and shared-mask plants recovered'
  };
  assert.deepEqual({...zeroDistribution}, {'0':30, '1':2});
  assert.equal(observed.maximumSharedSyndrome, 2);
  assert.equal(observed.maximumSyndromePairs, 4);
  process.stdout.write(JSON.stringify({observed, scans}, null, 2) + '\n');
}

main();
