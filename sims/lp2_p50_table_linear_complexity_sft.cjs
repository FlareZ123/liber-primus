#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const rows = grid.byte_rows;
const rowMajor = rows.flat();
const columnMajor = Array.from({length: 8}, (_, c) =>
  rows.map(row => row[c])).flat();
assert.equal(rowMajor.length, 256);
assert.equal(columnMajor.length, 256);

function bmGF2(sequence) {
  let C = [1], B = [1], L = 0, m = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= L; i++) discrepancy ^= (C[i] || 0) * sequence[n - i];
    if (discrepancy === 0) { m++; continue; }
    const previousC = C.slice();
    for (let j = 0; j < B.length; j++) {
      if (B[j]) C[j + m] = (C[j + m] || 0) ^ B[j];
    }
    if (2 * L <= n) { L = n + 1 - L; B = previousC; m = 1; }
    else m++;
  }
  return L;
}

function gfMul(a, b, polynomial = 0x11d) {
  let result = 0;
  while (b) {
    if (b & 1) result ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 0x100) a ^= polynomial; // GF(256), primitive polynomial x^8+x^4+x^3+x^2+1
  }
  return result & 0xff;
}
function gfPow(a, n, polynomial = 0x11d) {
  let result = 1;
  while (n) {
    if (n & 1) result = gfMul(result, a, polynomial);
    a = gfMul(a, a, polynomial);
    n >>>= 1;
  }
  return result;
}
function gfDiv(a, b, polynomial = 0x11d) {
  assert.notEqual(b, 0);
  return gfMul(a, gfPow(b, 254, polynomial), polynomial);
}
function bmGF256(sequence, polynomial = 0x11d) {
  let C = [1], B = [1], L = 0, m = 1, previousDiscrepancy = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= L; i++) {
      discrepancy ^= gfMul(C[i] || 0, sequence[n - i], polynomial);
    }
    if (discrepancy === 0) { m++; continue; }
    const previousC = C.slice();
    const coefficient = gfDiv(discrepancy, previousDiscrepancy, polynomial);
    for (let j = 0; j < B.length; j++) {
      if (B[j]) C[j + m] = (C[j + m] || 0) ^ gfMul(coefficient, B[j], polynomial);
    }
    if (2 * L <= n) {
      L = n + 1 - L;
      B = previousC;
      previousDiscrepancy = discrepancy;
      m = 1;
    } else m++;
  }
  return L;
}

const bitPlanes = [];
for (let bit = 0; bit < 8; bit++) {
  const msb = rowMajor.map(v => (v >>> (7 - bit)) & 1);
  const lsb = rowMajor.map(v => (v >>> bit) & 1);
  bitPlanes.push({bit, msbComplexity: bmGF2(msb), lsbComplexity: bmGF2(lsb)});
}
const binaryMSB = rowMajor.flatMap(v =>
  Array.from({length: 8}, (_, i) => (v >>> (7 - i)) & 1));
const binaryLSB = rowMajor.flatMap(v =>
  Array.from({length: 8}, (_, i) => (v >>> i) & 1));

// Positive controls validate both implementations on known low-degree recurrences.
const binaryPlant = [1, 0, 1];
for (let i = 3; i < 256; i++) binaryPlant.push(binaryPlant[i - 1] ^ binaryPlant[i - 3]);
const gfPlant = [1, 7];
for (let i = 2; i < 256; i++) {
  gfPlant.push(gfMul(2, gfPlant[i - 1], 0x11d) ^ gfMul(3, gfPlant[i - 2], 0x11d));
}
const gfPlantAes = [1, 7];
for (let i = 2; i < 256; i++) {
  gfPlantAes.push(gfMul(2, gfPlantAes[i - 1], 0x11b) ^ gfMul(3, gfPlantAes[i - 2], 0x11b));
}
assert.equal(bmGF2(binaryPlant), 3);
assert.equal(bmGF256(gfPlant, 0x11d), 2);
assert.equal(bmGF256(gfPlantAes, 0x11b), 2);

const result = {
  source: {
    dimensions: '32x8',
    byteCount: rowMajor.length,
    uniqueByteValues: new Set(rowMajor).size,
    min: Math.min(...rowMajor),
    max: Math.max(...rowMajor),
    mean: rowMajor.reduce((a, b) => a + b, 0) / rowMajor.length
  },
  linearComplexity: {
    gf256Polynomials: {
      '0x11d': {rowMajor: bmGF256(rowMajor, 0x11d), columnMajor: bmGF256(columnMajor, 0x11d)},
      '0x11b': {rowMajor: bmGF256(rowMajor, 0x11b), columnMajor: bmGF256(columnMajor, 0x11b)}
    },
    binary2048BitRowMajorMSB: bmGF2(binaryMSB),
    binary2048BitRowMajorLSB: bmGF2(binaryLSB),
    bitPlanes
  },
  positiveControls: {
    binaryKnownDegree3: bmGF2(binaryPlant),
    gf256KnownDegree2_0x11d: bmGF256(gfPlant, 0x11d),
    gf256KnownDegree2_0x11b: bmGF256(gfPlantAes, 0x11b)
  }
};
console.log(JSON.stringify(result, null, 2));
