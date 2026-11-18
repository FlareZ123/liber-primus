'use strict';

const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/lp2-grid-256.json');

const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const BASE59 = BASE60.replace('f', '');
const tokens = grid.pages.flatMap((page) => page.tokens);
const low = tokens.filter((token) => token[0] === '0');

assert.equal(tokens.length, 256);
assert.equal(low.length, 60);

/** @param {string} alphabet */
function analyze(alphabet) {
  const values = low.map((token) => alphabet.indexOf(token[1]));
  assert.ok(values.every((value) => value >= 0));
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const domainMax = alphabet.length - 1;
  const missing = Array.from(
    { length: alphabet.length },
    (_, value) => value
  ).filter((value) => !counts.has(value));
  const duplicates = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => a[0] - b[0]);
  return {
    radix: alphabet.length,
    values,
    sortedValues: values.slice().sort((a, b) => a - b),
    distinct: counts.size,
    domainMax,
    missing,
    duplicates
  };
}

const base60 = analyze(BASE60);
const base59 = analyze(BASE59);

assert.equal(base60.distinct, 36);
assert.deepEqual(base60.missing, [
  1, 2, 3, 7, 8, 9, 11, 12, 17, 23, 24, 26,
  27, 29, 30, 37, 41, 43, 44, 45, 48, 50, 53, 55
]);
assert.deepEqual(base60.duplicates, [
  [0, 2], [13, 2], [14, 2], [18, 2], [25, 2], [28, 2],
  [32, 3], [33, 3], [35, 2], [42, 2], [46, 2], [47, 2],
  [51, 2], [52, 3], [54, 4], [56, 2], [58, 2], [59, 3]
]);

assert.equal(base59.distinct, 36);
assert.deepEqual(base59.missing, [
  1, 2, 3, 7, 8, 9, 11, 12, 17, 23, 24, 26,
  27, 29, 30, 37, 42, 43, 44, 47, 49, 52, 54
]);
assert.deepEqual(base59.duplicates, [
  [0, 2], [13, 2], [14, 2], [18, 2], [25, 2], [28, 2],
  [32, 3], [33, 3], [35, 2], [41, 2], [45, 2], [46, 2],
  [50, 2], [51, 3], [53, 4], [55, 2], [57, 2], [58, 3]
]);

console.log(JSON.stringify({
  classification: 'exact source multiset test; no cipher inference',
  lowCellCount: low.length,
  base60,
  base59,
  completeZeroTo59Permutation: false
}, null, 2));
