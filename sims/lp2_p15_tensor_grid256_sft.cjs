'use strict';

/** Source-native p15 Kronecker and 16-state table obstruction, Node 22 CommonJS. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const p15 = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const grid = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const bytes = grid.bytes;
const tokens = grid.pages.flatMap(page => page.tokens);
assert.deepEqual(grid.pages.map(page => page.tokens.length), [80, 104, 72]);
assert.deepEqual(bytes, grid.pages.flatMap(page => page.bytes));
assert.equal(bytes.length, 256);
assert.equal(new Set(bytes).size, 161);
assert.equal(new Set(tokens).size, 161);
assert.ok(new Set(tokens).size > 16);

/**
 * Byte-residue Kronecker self-product of the printed p15 matrix.
 * @param {readonly number[]} matrix
 * @returns {number[]}
 */
function tensorByteTable(matrix) {
  const predicted = [];
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 16; col++) {
      const a = matrix[4 * Math.floor(row / 4) + Math.floor(col / 4)];
      const b = matrix[4 * (row % 4) + (col % 4)];
      predicted.push((a * b) % 256);
    }
  }
  return predicted;
}
const predicted = tensorByteTable(p15);
assert.deepEqual(predicted.slice(0, 16),
  [36, 252, 32, 76, 252, 228, 224, 20, 32, 224, 0, 96, 76, 20, 96, 132]);
assert.deepEqual(bytes.slice(0, 16),
  [203, 231, 167, 186, 97, 237, 126, 183, 92, 249, 156, 222, 247, 4, 183, 212]);
const matches = predicted.filter((v, i) => v === bytes[i]).length;
assert.equal(matches, 2);
const wrong = p15.slice();
wrong[5] += 1;
assert.notDeepEqual(tensorByteTable(wrong), predicted);
assert.deepEqual(tensorByteTable(p15), predicted);

const rowDistinct = Array.from({ length: 16 }, (_, r) =>
  new Set(bytes.slice(16 * r, 16 * r + 16)).size);
assert.deepEqual(rowDistinct,
  [15, 16, 15, 16, 16, 16, 15, 15, 16, 16, 15, 15, 16, 16, 16, 16]);
let symmetric = 0;
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    symmetric += Number(bytes[i * 16 + j] === bytes[j * 16 + i]);
  }
}
assert.equal(symmetric, 0);
/**
 * Sixteen 4x4 matrix powers supply another source-fixed 256-value tape.
 * The displayed infinity symbol motivates considering iteration, although
 * no first-party annotation fixes this application to the later byte table.
 * @param {readonly number[]} matrix
 * @param {number} mod
 * @param {boolean} startWithIdentity
 * @returns {number[]}
 */
function matrixPowerTape(matrix, mod, startWithIdentity) {
  const mat = matrix.map(value => ((value % mod) + mod) % mod);
  const identity = Array.from({ length: 16 }, (_, i) => i % 5 === 0 ? 1 : 0);
  let power = startWithIdentity ? identity : mat;
  const tape = [];
  for (let n = 0; n < 16; n++) {
    tape.push(...power);
    const next = Array(16).fill(0);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        for (let k = 0; k < 4; k++) {
          next[row * 4 + col] =
            (next[row * 4 + col] + power[row * 4 + k] * mat[k * 4 + col]) % mod;
        }
      }
    }
    power = next;
  }
  return tape;
}

const signedP15 = p15.slice();
signedP15[12] *= -1;
signedP15[13] *= -1; // exact independent Fibonacci-prime subtraction signs
const powerChecks = [];
for (const [name, matrix] of [['printed', p15], ['signed', signedP15]]) {
  for (const modulus of [29, 256]) {
    for (const first of ['identity', 'M']) {
      const tape = matrixPowerTape(matrix, modulus, first === 'identity');
      const target = bytes.map(value => modulus === 29 ? value % 29 : value);
      const matches = tape.filter((value, i) => value === target[i]).length;
      powerChecks.push({ name, modulus, first, matches });
      assert.deepEqual(matrixPowerTape(matrix, modulus, first === 'identity'), tape);
    }
  }
}
assert.deepEqual(powerChecks.map(({ matches }) => matches),
  [11, 7, 1, 0, 2, 8, 2, 1]);
assert.ok(powerChecks.every(({ matches }) => matches < 12));

console.log(JSON.stringify({
  source: 'p15 32.jpg, p49-51 66.jpg-68.jpg',
  printedGeometry: '32x8, page splits 80/184',
  uniqueOriginalTokens: new Set(tokens).size,
  maxOutputsOf16StateCayleyTable: 16,
  originalDistinctPerFolded16ColumnRow: rowDistinct,
  symmetricOffDiagonalPairsOf120: symmetric,
  sourceP15TensorMatchesOf256: matches,
  matrixPowerPredictions: powerChecks,
  sourceNativePlantAndWrongSourceControls: 'PASS',
  recoveredUnknownPlaintextRunes: 0
}, null, 2));
