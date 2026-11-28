'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mod29 = (value) => ((value % 29) + 29) % 29;

const pages = [
  { page: 32, start: 30, arity: 3, column: 'L', row: 2, sigma: 4 },
  { page: 33, start: 132, arity: 4, column: 'L', row: 3, sigma: 0 },
  { page: 34, start: 4, arity: 2, column: 'C', row: 0, sigma: 0 },
  { page: 35, start: 25, arity: 5, column: 'C', row: 1, sigma: 25 },
  { page: 37, start: 146, arity: 4, column: 'C', row: 3, sigma: 7 },
  { page: 38, start: 57, arity: 6, column: 'C', row: 4, sigma: 0 },
  { page: 39, start: 132, arity: 5, column: 'R', row: 0, sigma: 28 },
  { page: 40, start: 71, arity: 4, column: 'R', row: 1, sigma: 0 },
];

for (const item of pages) {
  assert.ok(item.row >= 0 && item.row < item.arity, `invalid top-down row on p${item.page}`);
}

const columnHeights = { L: 4, C: 5, R: 4 };
const oneBasedTopInvalid = pages.filter((item) => item.row + 1 >= item.arity).map((item) => item.page);
const bottomUpInvalid = pages.filter((item) => {
  const row = columnHeights[item.column] - 1 - item.row;
  return row >= item.arity;
}).map((item) => item.page);

assert.deepEqual(oneBasedTopInvalid, [32, 33, 37]);
assert.deepEqual(bottomUpInvalid, [34]);

const output = pages.map((item) => {
  const key = Array(item.arity).fill(0);
  key[item.row] = item.sigma;
  assert.equal(key.reduce((sum, value) => mod29(sum + value), 0), item.sigma);

  const ciphertext = corpus.pages[item.page].indices.slice(item.start, item.start + item.arity);
  assert.equal(ciphertext.length, item.arity);
  const raw = ciphertext.map((value, index) => mod29(value - key[index]));

  return { ...item, key, ciphertext, raw };
});

assert.deepEqual(output.map((x) => x.raw), [
  [0, 3, 27],
  [3, 15, 17, 22],
  [12, 23],
  [19, 21, 19, 24, 11],
  [3, 2, 6, 20],
  [8, 25, 14, 2, 17, 22],
  [20, 7, 10, 17, 23],
  [4, 15, 14, 21],
]);

console.log(JSON.stringify({
  rule: 'top-down zero-based stencil row selects one-sparse checksum coordinate',
  orientationGate: {
    topDownZeroBasedValid: true,
    oneBasedTopInvalid,
    bottomUpInvalid,
  },
  output,
}, null, 2));
