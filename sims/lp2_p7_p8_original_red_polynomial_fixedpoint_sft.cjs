'use strict';
/**
 * LP2 p7→p8 printed red polynomial fixed-point handoff.
 * Original-source GP29 physical red words, no fitted key or cipher.
 * Windows 11 / Node.js 22 single runnable read-only test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} file @returns {string} */
const load = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(load('lp2-corpus.json'));
const ink = JSON.parse(load('lp2-ink-annotations.json'));
const parts = load('lp2-transcription.txt').split('%');
const value = new Map(gp.runes.map((r, i) => [r, i]));
const red = new Map(ink.pages.map(page => [
  page.page, new Set((page.red_spans || []).flatMap(s =>
    Array.from({ length: s.length }, (_, k) => s.start + k)))
]));
/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @typedef {{page:number,offset:number,value:number,red:boolean}} Cell */
/** @type {Cell[][]} */
const words = [];
/** @type {Cell[]} */
let pending = [];
for (let p = 0; p <= 55; p++) {
  if (p === 50) continue; // Original p50 contains table cells, no runes.
  let offset = 0;
  const part = parts[p > 50 ? p - 1 : p];
  assert.equal(typeof part, 'string');
  for (const char of part) {
    if (value.has(char)) {
      pending.push({ page: p, offset, value: value.get(char),
        red: red.get(p)?.has(offset) || false });
      offset++;
    } else if ((char === '-' || char === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
  assert.equal(offset, gp.pages[p].indices.length);
}
if (pending.length) words.push(pending);
assert.equal(words.length, 2896);
/** @param {Cell[]} word @returns {number} */
const product = word => word.reduce((s, cell) => mod(s * cell.value), 1);
/** @param {number} p @returns {Cell[][]} */
const redWords = p => words.filter(word => word.length &&
  word[0].page === p && word.every(c => c.page === p && c.red));
const p7 = redWords(7), p8 = redWords(8);
assert.deepEqual(p7.map(w => w.length), [2, 4, 3, 2, 3]);
assert.deepEqual(p8.map(w => w.length), [4, 8]);
assert.deepEqual(p7.flat().map(w => w.value),
  gp.pages[7].indices.slice(194));
assert.deepEqual(p8.flat().map(w => w.value),
  gp.pages[8].indices.slice(0, 12));
const coeff = p7.map(product);
const target = p8.map(product);
assert.deepEqual(coeff, [11, 26, 8, 15, 2]);
assert.deepEqual(target, [4, 3]);

/**
 * Printed-order red products as ASCENDING-degree coefficients.
 * @param {number[]} c @param {number} x @returns {number}
 */
function evalPoly(c, x) {
  return c.reduceRight((a, b) => mod(a * x + b), 0);
}
/** @param {number[]} c @returns {number[]} */
function derivative(c) {
  return c.slice(1).map((v, i) => mod(v * (i + 1)));
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mulPoly(a, b) {
  const r = Array(a.length + b.length - 1).fill(0);
  a.forEach((v, i) => b.forEach((w, j) =>
    { r[i + j] = mod(r[i + j] + v * w); }));
  return r;
}
const fixed = Array.from({ length: 29 }, (_, i) => i)
  .filter(x => evalPoly(coeff, x) === x);
assert.deepEqual(fixed, [3, 4]);
assert.deepEqual(target, [...fixed].reverse());
assert.deepEqual(target.map(x => evalPoly(coeff, x)), target);
assert.deepEqual(target.map(x => evalPoly(derivative(coeff), x)),
  [17, 28]);
assert.equal(p8[1][p8[1].length - 1].value, 17);
assert.equal(evalPoly(derivative(coeff), target[0]), 17);
assert.equal(mod(product(p8[0]) * product(p8[1]) * 17), 1);
assert.equal(mod(evalPoly(derivative(coeff), 3)), 28);

const residual = [21, 0, 1]; // X^2-8
const factor = mulPoly(
  mulPoly([26, 1], [25, 1]), residual)
  .map(v => mod(2 * v));
const polynomialMinusIdentity = [...coeff];
polynomialMinusIdentity[1] = mod(polynomialMinusIdentity[1] - 1);
assert.deepEqual(factor, polynomialMinusIdentity);
assert.equal(Array.from({ length: 29 }, (_, i) => i)
  .filter(x => mod(x * x - 8) === 0).length, 0);

/** @param {number[]} xs @returns {number[][]} */
function permutations(xs) {
  if (!xs.length) return [[]];
  return xs.flatMap((x, i) => permutations(xs.filter((_, j) => j !== i))
    .map(tail => [x, ...tail]));
}
const perms = permutations(coeff);
assert.equal(perms.length, 120);
const suitable = perms.filter(c => target.every(x => evalPoly(c, x) === x));
assert.deepEqual(suitable, [coeff]);
const reverseFixed = Array.from({ length: 29 }, (_, i) => i)
  .filter(x => evalPoly([...coeff].reverse(), x) === x);
assert.deepEqual(reverseFixed, [9]);
const prime = i => gp.prime[i];
/** @param {Cell[]} w @returns {number[]} */
const v0 = w => w.map(x => x.value);
/** @param {number[]} a @returns {number} */
const sum = a => mod(a.reduce((x, y) => x + y, 0));
/** @param {number[]} a @returns {number} */
const prod = a => a.reduce((x, y) => mod(x * y), 1);
const features = {
  length: w => w.length,
  gp0Sum: w => sum(v0(w)),
  gp1Sum: w => sum(v0(w).map(x => x + 1)),
  primeSum: w => sum(v0(w).map(prime)),
  gp0Product: w => prod(v0(w)),
  gp1Product: w => prod(v0(w).map(x => x + 1)),
  primeProduct: w => prod(v0(w).map(prime)),
  firstGp0: w => w[0].value,
  lastGp0: w => w[w.length - 1].value,
  firstPrime: w => prime(w[0].value) % 29,
  lastPrime: w => prime(w[w.length - 1].value) % 29
};
const matchingFeatureDirections = [];
for (const [name, feature] of Object.entries(features)) {
  const c = p7.map(feature);
  for (const direction of ['printedLowFirst', 'printedHighFirst']) {
    const directed = direction === 'printedLowFirst' ? c : [...c].reverse();
    if (target.every(x => evalPoly(directed, x) === x)) {
      matchingFeatureDirections.push({ name, direction,
        roots: Array.from({ length: 29 }, (_, x) => x)
          .filter(x => evalPoly(directed, x) === x) });
    }
  }
}
assert.deepEqual(matchingFeatureDirections, [{
  name: 'gp0Product', direction: 'printedLowFirst', roots: [3, 4]
}]);

// A real but structurally imperfect continuation comparison:
// p53 ends in TWELVE red words, p54 begins with TWO red words.
// Freeze first5 and last5, with no fitted five-of-twelve window.
const red53 = redWords(53), red54 = redWords(54);
assert.equal(red53.length, 12);
assert.equal(red54.length, 2);
const continuation = {
  target: red54.map(product),
  first5: red53.slice(0, 5).map(product),
  last5: red53.slice(-5).map(product)
};
assert.deepEqual(continuation.target, [24, 10]);
assert.deepEqual(continuation.first5, [7, 14, 25, 16, 17]);
assert.deepEqual(continuation.last5, [4, 0, 22, 4, 1]);
assert(continuation.first5.some((_, i) => i === 0));
assert(continuation.target.some(x =>
  evalPoly(continuation.first5, x) !== x));
assert(continuation.target.some(x =>
  evalPoly(continuation.last5, x) !== x));

// New source-derived irreducible extension: alpha^2=8 mod29.
// Multiplication in GF(29^2)=GF29[alpha], alpha=(0,1).
/** @param {number[]} a @param {number[]} b @returns {number[]} */
const mul2 = (a, b) =>
  [mod(a[0] * b[0] + 8 * a[1] * b[1]),
   mod(a[0] * b[1] + a[1] * b[0])];
let power = [1, 0], order = 0;
for (let i = 1; i <= 840; i++) {
  power = mul2(power, [0, 1]);
  if (i === 28) assert.deepEqual(power, [28, 0]);
  if (power[0] === 1 && power[1] === 0) {
    order = i;
    break;
  }
}
assert.equal(order, 56);

// P: GP29 -> GP29 is NOT a reversible one-rune cipher.
// p8 ciphertext uses every output symbol and 86 original positions
// lie OUTSIDE the 19-symbol image of this polynomial.
const image = new Set(Array.from({ length: 29 }, (_, x) =>
  evalPoly(coeff, x)));
assert.equal(image.size, 19);
const p8cipher = gp.pages[8].indices;
assert.equal(new Set(p8cipher).size, 29);
const invalidPointwiseCipher = p8cipher.filter(x => !image.has(x));
assert.equal(invalidPointwiseCipher.length, 86);
assert.equal(new Set(invalidPointwiseCipher).size, 10);

// Bounded actual intact-original decoder attempt: a reversible
// two-lane Feistel use of this source-selected NONPERMUTATION polynomial.
// The p8 black 243 runes plus the FIRST genuine p9 carry rune give
// 244 = 122 complete pairs; the entire p8 + that same p9 rune give
// 256 = 128 pairs. Both are source-typed and unpadded.
// Feistel itself and any round count remain unprinted hypotheses.
/** @param {number[]} pair @param {number} sign @param {boolean} inverse
 * @returns {number[]} */
function feistel(pair, sign, inverse) {
  const [a, b] = pair;
  return inverse
    ? [mod(b - sign * evalPoly(coeff, a)), a]
    : [b, mod(a + sign * evalPoly(coeff, b))];
}
/** @param {number[]} tape @param {number} rounds
 * @param {number} sign @param {boolean} inverse
 * @param {boolean} swap @returns {number[]} */
function feistelTape(tape, rounds, sign, inverse, swap) {
  assert.equal(tape.length % 2, 0);
  const out = [];
  for (let i = 0; i < tape.length; i += 2) {
    let pair = [tape[i], tape[i + 1]];
    if (swap) pair.reverse();
    for (let j = 0; j < rounds; j++)
      pair = feistel(pair, sign, inverse);
    if (swap) pair.reverse();
    out.push(...pair);
  }
  return out;
}
/** @param {number[]} tape @returns {number} */
function ioc(tape) {
  const count = Array(29).fill(0);
  tape.forEach(v => count[v]++);
  return count.reduce((s, x) => s + x * (x - 1), 0) /
    (tape.length * (tape.length - 1));
}
const p9first = gp.pages[9].indices[0];
const pairRegisters = {
  black243AndFirstP9Rune: p8cipher.slice(12).concat(p9first),
  all255P8AndFirstP9Rune: p8cipher.concat(p9first)
};
assert.equal(pairRegisters.black243AndFirstP9Rune.length, 244);
assert.equal(pairRegisters.all255P8AndFirstP9Rune.length, 256);
const feistelTrials = [];
for (const [receiver, tape] of Object.entries(pairRegisters))
for (let rounds = 1; rounds <= 4; rounds++)
for (const sign of [-1, 1])
for (const inverse of [false, true])
for (const swap of [false, true]) {
  const result = feistelTape(tape, rounds, sign, inverse, swap);
  feistelTrials.push({ receiver, rounds, sign, inverse, swap,
    ioc: ioc(result) });
}
assert.equal(feistelTrials.length, 64);
assert.equal(feistelTrials.filter(t => t.ioc >= 0.05).length, 0);
const maxFeistelIoC = Math.max(...feistelTrials.map(t => t.ioc));
assert(Math.abs(maxFeistelIoC - 0.03673345476624165) < 1e-13);
// Exact positive: every forward round has a direct inverse. We do
// not inject a synthetic ciphertext/borrow a source-trained plaintext.
const plant = Array.from({ length: 244 }, (_, i) => (i * 17 + 3) % 29);
for (let rounds = 1; rounds <= 4; rounds++)
for (const sign of [-1, 1]) {
  const encrypted = feistelTape(plant, rounds, sign, false, false);
  const recovered = feistelTape(encrypted, rounds, sign, true, true);
  // A Feistel inverse under unchanged pair presentation must apply
  // the reverse round ordering; repeated identical rounds make this exact.
  assert.deepEqual(recovered, plant);
}

// Exact fixed-3,4 under uniform independently selected GF29 coefficients:
// two linearly independent constraints, probability 1/29^2.
// Complete root-set exactly {3,4}: count 29^3 quadratic residuals
// that have no root in the other 27 GP field elements.
let rootOnlyResiduals = 0;
for (let a = 0; a < 29; a++)
for (let b = 0; b < 29; b++)
for (let c = 0; c < 29; c++) {
  let hasOther = false;
  for (let x = 0; x < 29; x++) {
    if (x === 3 || x === 4) continue;
    if (mod(a + b * x + c * x * x) === 0) {
      hasOther = true;
      break;
    }
  }
  if (!hasOther) rootOnlyResiduals++;
}
assert.equal(rootOnlyResiduals, 11536);
console.log('LP2_P7_P8_POLYNOMIAL_FIXEDPOINT ' + JSON.stringify({
  p7Products: coeff, p8RedWordProducts: target,
  fixedRoots: fixed, highFirstFixedRoots: reverseFixed,
  factorization: "P(X)-X=2(X-3)(X-4)(X^2-8) modulo29",
  derivativeAt4: 17, derivativeAt3: 28,
  p8HeadingTerminalIndex: p8[1].at(-1).value,
  p8HeadingProduct: mod(target[0] * target[1]),
  sourceOrderMatchesOutOf120: suitable.length,
  featureDirectionMatchesOutOf22: matchingFeatureDirections,
  p53p54DifferentShapeControl: continuation,
  irreducibleQuadratic: [21, 0, 1],
  extensionSqrt8Order: order,
  polynomialRuneImageSize: image.size,
  p8PointwiseIncompatibleRunes: invalidPointwiseCipher.length,
  frozenFeistelSourceRegistrations: feistelTrials.length,
  frozenFeistelMaxIoC: maxFeistelIoC,
  frozenFeistelNativeIoCOver05: 0,
  uniformFiveCoefficientExactTargetProbability: 1 / (29 * 29),
  uniformFiveCoefficientOnlyTheseRootsProbability:
    rootOnlyResiduals / 29 ** 5,
  independentlyRecoveredUnknownPlaintext: false
}));