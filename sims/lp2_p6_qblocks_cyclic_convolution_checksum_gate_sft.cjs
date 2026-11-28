'use strict';

/**
 * Agent 5, 28 November 2026.
 *
 * Target-rune-blind necessary checksum gate for cyclic-convolution q-block
 * serializers. The two p6 q-words are treated as literal four-coefficient
 * kernels (or their already-canonical H4 / adjacent-H2 representations).
 * Kernel order is deliberately left free: every coefficient permutation has
 * the same DC eigenvalue, so the page-sum obstruction below covers all 24
 * permutations, including rotations, reversals, convolution/correlation
 * orientations. No authenticated target rune is read.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8')
);

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} x @returns {number} */
function inv29(x) {
  return Number(BigInt(x) ** 27n % 29n);
}

/** @param {number[]} v @returns {number[]} */
function h4(v) {
  assert.equal(v.length, 4);
  return [
    mod29(v[0] - v[3]),
    mod29(v[1] - v[2]),
    mod29(v[1] + v[2]),
    mod29(v[0] + v[3]),
  ];
}

/** @param {number[]} v @returns {number[]} */
function h2Adjacent(v) {
  assert.equal(v.length, 4);
  return [
    mod29(v[0] - v[1]),
    mod29(v[0] + v[1]),
    mod29(v[2] - v[3]),
    mod29(v[2] + v[3]),
  ];
}

/** @param {number[]} v @returns {number[]} */
function h4Inverse(v) {
  assert.equal(v.length, 4);
  const half = 15;
  return [
    mod29((v[0] + v[3]) * half),
    mod29((v[1] + v[2]) * half),
    mod29((v[2] - v[1]) * half),
    mod29((v[3] - v[0]) * half),
  ];
}

/** @param {number} pageNumber @returns {number[]} */
function pageIndices(pageNumber) {
  const row = corpus.pages.find((page) => page.page === pageNumber);
  if (row) return row.indices;
  assert.ok(corpus.pages[pageNumber]);
  return corpus.pages[pageNumber].indices;
}

/** @param {{page:number,start:number,length:number}} spec @returns {number} */
function receiverSum(spec) {
  const page = pageIndices(spec.page);
  assert.ok(spec.start >= 0 && spec.start + spec.length <= page.length);
  return page
    .slice(spec.start, spec.start + spec.length)
    .reduce((sum, value) => mod29(sum + value), 0);
}

const W1 = [24, 16, 14, 17];
const W2 = [19];
const W3 = [6, 27, 15, 17];
const F = 0;

const q1ReceiverSpecs = [
  { page: 32, start: 30, length: 3 },
  { page: 33, start: 132, length: 4 },
  { page: 34, start: 4, length: 2 },
  { page: 35, start: 25, length: 5 },
];
const q3ReceiverSpecs = [
  { page: 37, start: 146, length: 4 },
  { page: 38, start: 57, length: 6 },
  { page: 39, start: 132, length: 5 },
  { page: 40, start: 71, length: 4 },
];
const q1ReceiverSums = q1ReceiverSpecs.map(receiverSum);
const q3ReceiverSums = q3ReceiverSpecs.map(receiverSum);
assert.deepEqual(q1ReceiverSums, [5, 28, 6, 3]);
assert.deepEqual(q3ReceiverSums, [9, 1, 18, 25]);

const q1KeySums = h4Inverse([W1.length + W3.length, F, F, F]);
const edgeDifference = mod29(W1[0] - W1[W1.length - 1]);
const q3KeySums = h4Inverse([
  edgeDifference,
  W2.length,
  -W2.length,
  edgeDifference,
]);
assert.deepEqual(q1KeySums, [4, 0, 0, 25]);
assert.deepEqual(q3KeySums, [7, 0, 28, 0]);

const representations = {
  direct: [W1, W3],
  H4: [h4(W1), h4(W3)],
  H2adjacent: [h2Adjacent(W1), h2Adjacent(W3)],
};
assert.deepEqual(representations.H4, [
  [7, 2, 1, 12],
  [18, 12, 13, 23],
]);
assert.deepEqual(representations.H2adjacent, [
  [8, 11, 26, 2],
  [8, 4, 27, 3],
]);

/** @param {number[]} v @returns {number} */
function sum29(v) {
  return v.reduce((sum, value) => mod29(sum + value), 0);
}

/**
 * Circular convolution is multiplication in GF(29)[x]/(x^n-1). Evaluating
 * at x=1 gives sum(kernel * word) = sum(kernel) * sum(word). For an
 * invertible circulant the inverse multiplier is sum(kernel)^-1. This DC
 * identity is invariant under every coefficient permutation.
 *
 * @param {number} receiverSumValue
 * @param {number} factor
 * @param {'plaintext'|'key'} action
 * @param {1|-1} sign
 * @returns {number}
 */
function impliedKeySum(receiverSumValue, factor, action, sign) {
  if (action === 'plaintext') {
    return mod29((1 - sign * factor) * receiverSumValue);
  }
  return mod29(sign * factor * receiverSumValue);
}

const rows = [];
for (const [q1Representation, q1Pair] of Object.entries(representations)) {
  for (const [q3Representation, q3Pair] of Object.entries(representations)) {
    const q1KernelSum = sum29(q1Pair[0]);
    const q3KernelSum = sum29(q3Pair[1]);
    assert.notEqual(q1KernelSum, 0);
    assert.notEqual(q3KernelSum, 0);

    for (const inverse of [false, true]) {
      const q1Factor = inverse ? inv29(q1KernelSum) : q1KernelSum;
      const q3Factor = inverse ? inv29(q3KernelSum) : q3KernelSum;
      for (const action of ['plaintext', 'key']) {
        for (const sign of [1, -1]) {
          const predicted = [
            ...q1ReceiverSums.map((value) =>
              impliedKeySum(value, q1Factor, action, sign)
            ),
            ...q3ReceiverSums.map((value) =>
              impliedKeySum(value, q3Factor, action, sign)
            ),
          ];
          const required = [...q1KeySums, ...q3KeySums];
          const matchedPages = predicted
            .map((value, index) => (value === required[index] ? index : -1))
            .filter((index) => index >= 0)
            .map((index) => [32, 33, 34, 35, 37, 38, 39, 40][index]);
          rows.push({
            q1Representation,
            q3Representation,
            inverse,
            action,
            sign,
            q1KernelSum,
            q3KernelSum,
            predicted,
            matchedPages,
            matches: matchedPages.length,
          });
        }
      }
    }
  }
}

assert.equal(rows.length, 72);
const sharedRepresentationRows = rows.filter(
  (row) => row.q1Representation === row.q3Representation
);
assert.equal(sharedRepresentationRows.length, 24);
const sharedBest = Math.max(...sharedRepresentationRows.map((row) => row.matches));
const generousBest = Math.max(...rows.map((row) => row.matches));
assert.equal(sharedBest, 1);
assert.equal(generousBest, 2);
assert.equal(rows.filter((row) => row.matches === 8).length, 0);

const bestRows = rows.filter((row) => row.matches === generousBest);
assert.deepEqual(bestRows.map((row) => ({
  q1Representation: row.q1Representation,
  q3Representation: row.q3Representation,
  inverse: row.inverse,
  action: row.action,
  sign: row.sign,
  predicted: row.predicted,
  matchedPages: row.matchedPages,
})), [
  {
    q1Representation: 'H2adjacent',
    q3Representation: 'H4',
    inverse: false,
    action: 'key',
    sign: 1,
    predicted: [3, 11, 21, 25, 14, 8, 28, 26],
    matchedPages: [35, 39],
  },
]);

const output = {
  status: 'PASS',
  classification:
    'target-rune-blind necessary checksum rejection of p6 q-word cyclic-convolution serializers',
  receivers: { q1: q1ReceiverSums, q3: q3ReceiverSums },
  requiredKeySums: { q1: q1KeySums, q3: q3KeySums },
  kernelSums: Object.fromEntries(
    Object.entries(representations).map(([name, pair]) => [
      name,
      [sum29(pair[0]), sum29(pair[1])],
    ])
  ),
  sharedRepresentationSignatures: sharedRepresentationRows.length,
  sharedRepresentationBestMatches: sharedBest,
  independentRepresentationSignatures: rows.length,
  independentRepresentationBestMatches: generousBest,
  exactEightPageMatches: 0,
  permutationClosure:
    'All 24 coefficient permutations per q-word have the same DC multiplier; the checksum rejection therefore covers rotations, reversals, convolution/correlation orientations, and arbitrary coefficient orderings. Singular inverse-convolution permutations are invalid already; every invertible one has the same rejected DC multiplier.',
  labeledPermutationSlots: 3 * 3 * 24 * 24 * 2 * 2 * 2,
  bestRows,
  consequence:
    'No direct/H4/H2-adjacent p6 q-word circular-convolution or inverse-convolution law can satisfy the eight independently frozen q-page key sums, even allowing the two q blocks to choose different representations and arbitrary kernel coefficient orders. The missing ordered serializer must use a different vector operation or additional authored state.',
};

console.log(JSON.stringify(output, null, 2));
