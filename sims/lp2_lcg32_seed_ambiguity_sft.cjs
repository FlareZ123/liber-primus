'use strict';

const assert = require('node:assert/strict');

function orderForSeed(seed) {
  const order = [];
  let state = seed;
  for (let i = 0; i < 32; i += 1) {
    order.push(state);
    state = (13 * state + 31) % 32;
  }
  assert.equal(state, seed);
  assert.equal(new Set(order).size, 32);
  return order;
}

function inversePermutation(order) {
  return Array.from({ length: 32 }, (_, id) => order.indexOf(id));
}

function tail(sequence) {
  return sequence.filter((value) => value >= 28);
}

const forwardCounts = new Map();
const rows = [];

for (let seed = 0; seed < 32; seed += 1) {
  const forward = orderForSeed(seed);
  const inverse = inversePermutation(forward);
  const forwardTail = tail(forward);
  const inverseTail = tail(inverse);
  const key = forwardTail.join(',');
  forwardCounts.set(key, (forwardCounts.get(key) ?? 0) + 1);

  rows.push({
    seed,
    forwardTail,
    inverseTail,
    emptyFragmentPositions: [forward.indexOf(8), forward.indexOf(11)]
  });
}

assert.deepEqual(
  Object.fromEntries(forwardCounts),
  {
    '31,28,29,30': 3,
    '30,31,28,29': 7,
    '29,30,31,28': 11,
    '28,29,30,31': 11
  }
);

const seed0 = rows.find((row) => row.seed === 0);
assert.deepEqual(seed0.forwardTail, [31, 28, 29, 30]);
assert.deepEqual(seed0.inverseTail, [31, 28, 29, 30]);

const exactDual = rows.filter(
  (row) =>
    row.forwardTail.join(',') === '31,28,29,30' &&
    row.inverseTail.join(',') === '31,28,29,30'
);
assert.deepEqual(exactDual.map((row) => row.seed), [0]);

// Independent source-derived alternative from the literal p55 FOLD mismatch.
const seed18 = rows.find((row) => row.seed === 18);
assert.deepEqual(seed18.forwardTail, [28, 29, 30, 31]);
assert.deepEqual(seed18.inverseTail, [30, 29, 28, 31]);

console.log('13/31 LCG all-seed audit');
console.log('forward tail-order counts:', Object.fromEntries(forwardCounts));
console.log('seed 0:', seed0);
console.log('seed 18 (FOLD mismatch):', seed18);
console.log('PASS: the exact dual solved-tail order is conditional on unsourced seed 0.');
