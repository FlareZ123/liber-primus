"use strict";

/**
 * SFT: source-numbered LP2 p36-p38 five-passage Shamir/Lagrange inverse.
 * Run on Windows 11 with Node.js 22 or newer; standard library only.
 *
 * Original inputs: resources/liber-primus/lp2-corpus.json, unchanged.
 * This tests a finite 2013-Cicada-secret-sharing-inspired operation. It does
 * not assume that ciphertext is a share system or authenticate an LP2 key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));

/** @param {number} n @returns {number[]} */
function page(n) {
  const entry = corpus.pages.find(p => p.page === n);
  assert.ok(entry);
  return entry.indices;
}

const p36 = page(36);
const p37 = page(37);
const p38 = page(38);
const passages = [
  p36.slice(99, 238),
  p37.slice(0, 91),
  p37.slice(91, 189),
  p37.slice(189, 228).concat(p38.slice(0, 57)),
  p38.slice(57, 186)
];
assert.deepEqual(passages.map(a => a.length), [139, 91, 98, 96, 129]);
assert.equal(passages.flat().length, 553);
const N = 91;
const X = [1, 2, 3, 4, 5];

/** @param {number} v @returns {number} */
function mod(v) { return ((v % 29) + 29) % 29; }

/** @param {number} a @returns {number} */
function inverse(a) {
  const n = mod(a);
  assert.notEqual(n, 0);
  for (let b = 1; b < 29; b++) if (mod(n * b) === 1) return b;
  throw new Error("No inverse in GF(29)");
}

/**
 * Recover f(0) from evaluations at distinct nonzero GF(29) abscissas.
 * @param {number[]} xs
 * @param {number[]} ys
 * @returns {number}
 */
function constantTerm(xs, ys) {
  assert.equal(xs.length, ys.length);
  let result = 0;
  for (let i = 0; i < xs.length; i++) {
    let numerator = 1, denominator = 1;
    for (let j = 0; j < xs.length; j++) {
      if (i === j) continue;
      numerator = mod(numerator * -xs[j]);
      denominator = mod(denominator * (xs[i] - xs[j]));
    }
    result = mod(result + ys[i] * numerator * inverse(denominator));
  }
  return result;
}

/**
 * Enumerate size-k subsets preserving printed source order.
 * @param {number[]} input
 * @param {number} k
 * @returns {number[][]}
 */
function choose(input, k) {
  if (k === 0) return [[]];
  if (input.length < k) return [];
  const [head, ...tail] = input;
  return choose(tail, k - 1).map(a => [head, ...a])
    .concat(choose(tail, k));
}

/** @param {number[]} values @returns {number} */
function coincidenceNumerator(values) {
  const hist = Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0);
}

/** @param {number[][]} columns @param {number[]} subset @returns {number[]} */
function recover(columns, subset) {
  const xs = subset.map(i => X[i]);
  return Array.from({length: N}, (_, j) =>
    constantTerm(xs, subset.map(i => columns[i][j]))
  );
}

assert.equal(constantTerm(X, [1, 0, 0, 0, 0]), 5);
assert.equal(constantTerm(X, [0, 1, 0, 0, 0]), 19);
assert.equal(constantTerm(X, [0, 0, 1, 0, 0]), 10);
assert.equal(constantTerm(X, [0, 0, 0, 1, 0]), 24);
assert.equal(constantTerm(X, [0, 0, 0, 0, 1]), 1);

const triples = choose([0, 1, 2, 3, 4], 3);
const quadruples = choose([0, 1, 2, 3, 4], 4);
assert.equal(triples.length, 10);
assert.equal(quadruples.length, 5);
const originalTriple = recover(passages, [0, 1, 2]);
const originalQuad = recover(passages, [0, 1, 2, 3]);
const originalFive = recover(passages, [0, 1, 2, 3, 4]);
assert.deepEqual(
  [originalTriple, originalQuad, originalFive].map(coincidenceNumerator),
  [302, 254, 320]
);

let degree2Consistent = 0, degree3Consistent = 0;
for (let j = 0; j < N; j++) {
  const three = triples.map(sub =>
    constantTerm(sub.map(i => X[i]), sub.map(i => passages[i][j])));
  const four = quadruples.map(sub =>
    constantTerm(sub.map(i => X[i]), sub.map(i => passages[i][j])));
  if (three.every(a => a === three[0])) degree2Consistent++;
  if (four.every(a => a === four[0])) degree3Consistent++;
}
assert.equal(degree2Consistent, 0);
assert.equal(degree3Consistent, 4);

/** @param {number[]} coefficients @param {number} x @returns {number} */
function evaluate(coefficients, x) {
  let y = 0, power = 1;
  for (const a of coefficients) {
    y = mod(y + a * power);
    power = mod(power * x);
  }
  return y;
}

// Original solved p57, not invented English, is the 91-rune native control.
const known = page(57).slice(0, N);
assert.equal(known.length, N);
assert.equal(coincidenceNumerator(known), 494);
const planted = [2, 3, 4].map(degree =>
  X.map(x => known.map((plaintext, j) => {
    const coefficients = [
      plaintext, mod((j + 1) * 7 + 1), mod((j + 1) * 11 + 3),
      mod((j + 1) * 13 + 5), mod((j + 1) * 17 + 7)
    ].slice(0, degree + 1);
    return evaluate(coefficients, x);
  }))
);
for (let k = 0; k < planted.length; k++) {
  const subsetSize = k + 3;
  for (const subset of choose([0, 1, 2, 3, 4], subsetSize)) {
    assert.deepEqual(recover(planted[k], subset), known);
  }
}

const render = values => values.slice(0, 35)
  .map(n => corpus.translit[n]).join(" ");
const report = {
  originalPassageRuneLengths: passages.map(a => a.length),
  alignedRunes: N,
  historicalThreeOfFive: {
    allTenTriplesAgreePositions: degree2Consistent,
    firstThreePlainCandidateIoC:
      coincidenceNumerator(originalTriple) / (N * (N - 1)),
    firstThirtyFive: render(originalTriple)
  },
  fourOfFive: {
    allFiveQuadruplesAgreePositions: degree3Consistent,
    firstFourPlainCandidateIoC:
      coincidenceNumerator(originalQuad) / (N * (N - 1)),
    firstThirtyFive: render(originalQuad)
  },
  fiveOfFive: {
    fixedCoefficientsAtZero: [5, 19, 10, 24, 1],
    plainCandidateIoC:
      coincidenceNumerator(originalFive) / (N * (N - 1)),
    firstThirtyFive: render(originalFive)
  },
  solvedP57NativeIoC: coincidenceNumerator(known) / (N * (N - 1)),
  positiveControls: "Every 3-of-5, 4-of-5, 5-of-5 native plant returns 91/91"
};
console.log(JSON.stringify(report, null, 2));
