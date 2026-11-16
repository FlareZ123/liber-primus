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
console.log(JSON.stringify({
  source: 'p15 32.jpg, p49-51 66.jpg-68.jpg',
  printedGeometry: '32x8, page splits 80/184',
  uniqueOriginalTokens: new Set(tokens).size,
  maxOutputsOf16StateCayleyTable: 16,
  originalDistinctPerFolded16ColumnRow: rowDistinct,
  symmetricOffDiagonalPairsOf120: symmetric,
  sourceP15TensorMatchesOf256: matches,
  sourceNativePlantAndWrongSourceControls: 'PASS',
  recoveredUnknownPlaintextRunes: 0
}, null, 2));
