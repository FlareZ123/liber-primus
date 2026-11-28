#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');

const CICADA = 3301;
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

/** @param {number} index */
function nthPrime(index) {
  let count = 0;
  for (let n = 2;; n += 1) if (isPrime(n) && ++count === index) return n;
}

/** @param {number} count */
function distinctFibonacci(count) {
  const out = [];
  let a = 0;
  let b = 1;
  while (out.length < count) {
    if (!out.length || out.at(-1) !== a) out.push(a);
    [a, b] = [b, a + b];
  }
  return out;
}

/** @param {number[]} xs */
function orientations(xs) {
  const out = [];
  for (const reversed of [false, true]) {
    const base = reversed ? xs.slice().reverse() : xs.slice();
    for (let start = 0; start < xs.length; start += 1) {
      out.push({
        reversed,
        start,
        values: base.slice(start).concat(base.slice(0, start)),
      });
    }
  }
  return out;
}

const fib = distinctFibonacci(16);
const primes = fib.map((value) => nthPrime(value + 1));
const printed = primes.map((prime) => Math.abs(CICADA - prime));

assert.deepEqual(fib, [
  0, 1, 2, 3, 5, 8, 13, 21,
  34, 55, 89, 144, 233, 377, 610, 987,
]);
assert.deepEqual(primes, [
  2, 3, 5, 7, 13, 23, 43, 79,
  149, 263, 463, 829, 1481, 2593, 4507, 7817,
]);
assert.deepEqual(printed.slice(0, 7), [
  3299, 3298, 3296, 3294, 3288, 3278, 3258,
]);

// Authenticated 2013 worked-example roles and transcript order.
const publicDh = [
  ['p', 23],
  ['g', 5],
  ['A', 8],
  ['B', 19],
  ['K', 2],
];
const roleByValue = new Map(publicDh.map(([role, value]) => [value, role]));

/** @param {number[]} values */
function projectedRoles(values) {
  return values
    .filter((value) => roleByValue.has(value))
    .map((value) => roleByValue.get(value));
}

/** @param {number[]} lane */
function expectedProjection(lane) {
  return publicDh
    .filter(([, value]) => lane.includes(value))
    .map(([role]) => role);
}

const fibExpected = expectedProjection(fib);
const primeExpected = expectedProjection(primes);
assert.deepEqual(fibExpected, ['g', 'A', 'K']);
assert.deepEqual(primeExpected, ['p', 'g', 'K']);

const fibHits = orientations(fib).filter((item) =>
  JSON.stringify(projectedRoles(item.values)) === JSON.stringify(fibExpected)
);
const primeHits = orientations(primes).filter((item) =>
  JSON.stringify(projectedRoles(item.values)) === JSON.stringify(primeExpected)
);

// Crucial direction charge: Fibonacci lane needs forward, prime lane reverse.
assert.ok(fibHits.length > 0);
assert.ok(primeHits.length > 0);
assert.ok(fibHits.every((item) => item.reversed === false));
assert.ok(primeHits.every((item) => item.reversed === true));

const joint = orientations(fib).filter((fibItem) => {
  const primeItem = orientations(primes).find((candidate) =>
    candidate.reversed === fibItem.reversed &&
    candidate.start === fibItem.start
  );
  return (
    JSON.stringify(projectedRoles(fibItem.values)) === JSON.stringify(fibExpected) &&
    JSON.stringify(projectedRoles(primeItem.values)) === JSON.stringify(primeExpected)
  );
});
assert.deepEqual(joint, []);

// Exact direct public-value anchors in the first six selected primes.
const directPrefix = primes.slice(0, 6)
  .map((value, index) => ({
    index,
    value,
    role: roleByValue.get(value) || null,
  }))
  .filter((item) => item.role !== null);
assert.deepEqual(directPrefix, [
  { index: 0, value: 2, role: 'K' },
  { index: 2, value: 5, role: 'g' },
  { index: 5, value: 23, role: 'p' },
]);

// Unique DH secrets from the same public worked example.
function discreteLog(base, target, p) {
  let value = 1;
  for (let exponent = 0; exponent < p - 1; exponent += 1) {
    if (value === target) return exponent;
    value = (value * base) % p;
  }
  throw new Error('no dlog');
}
const a = discreteLog(5, 8, 23);
const b = discreteLog(5, 19, 23);
assert.equal(a, 6);
assert.equal(b, 15);

const atoms = {
  F: 0,
  one: 1,
  K: 2,
  g: 5,
  a,
  A: 8,
  b,
  B: 19,
  p: 23,
};

/** @param {number} target */
function minimumExpressions(target) {
  const hits = [];
  for (const [name, value] of Object.entries(atoms)) {
    if (mod(value) === target) hits.push({ cost: 0, expr: name });
  }
  for (const [left, x] of Object.entries(atoms)) {
    for (const [right, y] of Object.entries(atoms)) {
      if (mod(x + y) === target) hits.push({ cost: 1, expr: left + '+' + right });
      if (mod(x - y) === target) hits.push({ cost: 1, expr: left + '-' + right });
    }
  }
  const minCost = Math.min(...hits.map((item) => item.cost));
  return {
    minCost,
    expressions: [...new Set(
      hits.filter((item) => item.cost === minCost).map((item) => item.expr)
    )],
  };
}

const prefixRoleCharge = Object.fromEntries(
  primes.slice(0, 6).map((value) => [value, minimumExpressions(mod(value))])
);

assert.deepEqual(prefixRoleCharge[2], { minCost: 0, expressions: ['K'] });
assert.deepEqual(prefixRoleCharge[5], { minCost: 0, expressions: ['g'] });
assert.deepEqual(prefixRoleCharge[23], { minCost: 0, expressions: ['p'] });
assert.ok(prefixRoleCharge[3].expressions.length > 1);
assert.ok(prefixRoleCharge[7].expressions.length > 1);
assert.ok(prefixRoleCharge[13].expressions.length > 1);

// Held-out role interpretation: keep the grammar fixed, then inspect the next
// established selected prime. GP29 reduction does not select one state role.
const heldRaw = primes[6];
assert.equal(heldRaw, 43);
const heldResidue = mod(heldRaw);
assert.equal(heldResidue, 14);
const heldRoleCharge = minimumExpressions(heldResidue);
assert.equal(heldRoleCharge.minCost, 1);
assert.deepEqual(heldRoleCharge.expressions, [
  'F-b',
  'a+A',
  'A+a',
  'A-p',
  'b-one',
  'B-g',
]);

console.log(JSON.stringify({
  status: 'PASS',
  directorIssue: 3469,
  generator: {
    fibonacci: fib,
    selectedPrimes: primes,
    printed,
  },
  authenticatedDhOrder: publicDh,
  exactPublicValueAnchors: directPrefix,
  transcriptOrderCharge: {
    fibonacciExpected: fibExpected,
    primeExpected,
    fibonacciHits: fibHits.map((item) => ({
      reversed: item.reversed,
      start: item.start,
    })),
    primeHits: primeHits.map((item) => ({
      reversed: item.reversed,
      start: item.start,
    })),
    jointSamePresentationHits: joint.length,
  },
  expressionFamily: {
    atoms,
    operations: ['direct', 'x+y mod29', 'x-y mod29'],
    prefixRoleCharge,
  },
  laterRoleHoldout: {
    rawSelectedPrime: heldRaw,
    residue: heldResidue,
    minimumExpressions: heldRoleCharge,
    result: 'NON_UNIQUE',
  },
  decision:
    'The generator has three direct authenticated DH-value anchors K=2,g=5,p=23, but it does not source-select a coherent DH-role traversal: the Fibonacci lane needs forward transcript order while the selected-prime lane needs reverse, yielding 0/32 joint presentations. Derived labels 3/7/13 and held-out 43 mod29=14 are non-unique in the fixed one-operation state language.',
}, null, 2));
