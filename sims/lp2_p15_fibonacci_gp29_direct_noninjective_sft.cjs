'use strict';

/**
 * Original p15 Fibonacci-prime spiral: exact GP29 direct-S-box necessary condition.
 * Source: resources/liber-primus/32.jpg and results/lp2-p15-fibonacci-prime-spiral.md
 * Run with Node.js 22. No fitted keys or ciphertext-derived substitutions.
 */

const assert = require('node:assert/strict');

const original = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];

const spiral = [
  [1, 1], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0],
  [0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3],
  [3, 3], [3, 2], [3, 1], [3, 0],
];

const fibonacci = [0, 1, 2];
while (fibonacci.length < 29) {
  const n = fibonacci.length;
  fibonacci.push(fibonacci[n - 1] + fibonacci[n - 2]);
}

/**
 * Return all primes up to at least the required one-based ordinal.
 * @param {number} requiredCount
 * @returns {number[]}
 */
function primesThroughOrdinal(requiredCount) {
  const upperBound = Math.ceil(requiredCount *
    (Math.log(requiredCount) + Math.log(Math.log(requiredCount)) + 1));
  const composite = new Uint8Array(upperBound + 1);
  const primes = [];
  for (let x = 2; x <= upperBound; x++) {
    if (composite[x]) continue;
    primes.push(x);
    if (x * x <= upperBound) {
      for (let y = x * x; y <= upperBound; y += x) composite[y] = 1;
    }
  }
  assert.ok(primes.length >= requiredCount);
  return primes;
}

const primes = primesThroughOrdinal(fibonacci[28] + 1);
const signed = fibonacci.map((n) => 3301 - primes[n]);
const generated = signed.map(Math.abs);
const reconstructed = Array.from({length: 4}, () => Array(4).fill(0));
for (let step = 0; step < 16; step++) {
  const [row, col] = spiral[step];
  reconstructed[row][col] = generated[step];
}
assert.deepEqual(reconstructed, original);

const residues = (values) => values.map((x) => ((x % 29) + 29) % 29);
const distinctCount = (values) => new Set(residues(values)).size;
const printed = original.flat();
assert.equal(distinctCount(printed), 12);
assert.equal(distinctCount(generated), 16);
assert.equal(distinctCount(signed), 18);

for (const x of [3299, 3038, 1820]) assert.equal(x % 29, 22);
const bijectiveControl = Array.from({length: 29}, (_, i) => (7 * i + 3) % 29);
assert.equal(distinctCount(bijectiveControl), 29);

console.log(JSON.stringify({
  original16DistinctGP29Residues: distinctCount(printed),
  extended29DistinctAbsoluteResidues: distinctCount(generated),
  extended29DistinctSignedResidues: distinctCount(signed),
  extendedAbsoluteGP29Residues: residues(generated),
  extendedSignedGP29Residues: residues(signed),
  bijectiveControlDistinctResidues: distinctCount(bijectiveControl),
  conclusion: 'Direct p15-generator residue maps are not GP29 permutations; this does not exclude a reversible nonlinear wrapper.',
}, null, 2));