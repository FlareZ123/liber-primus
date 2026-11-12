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

function gfMul(a, b) {
  let result = 0;
  while (b) {
    if (b & 1) result ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 0x100) a ^= 0x11d; // GF(256), primitive polynomial x^8+x^4+x^3+x^2+1
  }
  return result & 0xff;
}
function gfPow(a, n) {
  let result = 1;
  while (n) {
    if (n & 1) result = gfMul(result, a);
    a = gfMul(a, a);
    n >>>= 1;
  }
  return result;
}
function gfDiv(a, b) {
  assert.notEqual(b, 0);
  return gfMul(a, gfPow(b, 254));
}
function bmGF256(sequence) {
  let C = [1], B = [1], L = 0, m = 1, previousDiscrepancy = 1;
  for (let n = 0; n < sequence.length; n++) {
    let discrepancy = sequence[n];
    for (let i = 1; i <= L; i++) {
      discrepancy ^= gfMul(C[i] || 0, sequence[n - i]);
    }
    if (discrepancy === 0) { m++; continue; }
    const previousC = C.slice();
    const coefficient = gfDiv(discrepancy, previousDiscrepancy);
    for (let j = 0; j < B.length; j++) {
      if (B[j]) C[j + m] = (C[j + m] || 0) ^ gfMul(coefficient, B[j]);
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
  gfPlant.push(gfMul(2, gfPlant[i - 1]) ^ gfMul(3, gfPlant[i - 2]));
}
assert.equal(bmGF2(binaryPlant), 3);
assert.equal(bmGF256(gfPlant), 2);

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
    gf256Polynomial: '0x11d',
    gf256RowMajor: bmGF256(rowMajor),
    gf256ColumnMajor: bmGF256(columnMajor),
    binary2048BitRowMajorMSB: bmGF2(binaryMSB),
    binary2048BitRowMajorLSB: bmGF2(binaryLSB),
    bitPlanes
  },
  positiveControls: {
    binaryKnownDegree3: bmGF2(binaryPlant),
    gf256KnownDegree2: bmGF256(gfPlant)
  }
};
console.log(JSON.stringify(result, null, 2));
