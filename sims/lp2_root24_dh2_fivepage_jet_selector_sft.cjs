'use strict';

/**
 * Original LP2 root-24 / DH-secret-2 page-jet selector and first complete
 * five-share receiver. Windows Node.js 22, CommonJS, read-only SFT.
 *
 * The selected polynomial operation is exploratory. Neither original LP2
 * plaintext nor a Cicada-authenticated cipher operation is asserted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {any} */
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const table = read('resources/liber-primus/lp2-grid-256.json');
const M = 29;
/** @param {number} x @returns {number} */
const mod = x => ((x % M) + M) % M;
/** @param {number} x @returns {number} */
function inverse(x) {
  for (let i = 1; i < M; i++) if (mod(x * i) === 1) return i;
  throw new Error('No inverse for field zero');
}
/** @param {number} x @param {number} y @returns {number} */
function power(x, y) {
  let z = 1;
  for (let i = 0; i < y; i++) z = z * x % M;
  return z;
}
/**
 * Printed/high-first GP29 polynomial and its first two formal derivatives.
 * @param {number[]} coefficients
 * @param {number} x
 * @returns {[number,number,number]}
 */
function jet(coefficients, x) {
  let value = 0;
  let first = 0;
  let second = 0;
  for (const c of coefficients) {
    second = mod(x * second + 2 * first);
    first = mod(x * first + value);
    value = mod(x * value + c);
  }
  return [value, first, second];
}
/** @param {number[]} xs @param {number} x @returns {number[]} */
function weights(xs, x) {
  return xs.map((value, i) => xs.reduce((product, other, j) =>
    i === j ? product : mod(product * mod(x - other) *
      inverse(mod(value - other))), 1));
}
/** @param {number[][]} sequences @param {number[]} ws @returns {number[]} */
function combine(sequences, ws) {
  const n = Math.min(...sequences.map(seq => seq.length));
  return Array.from({length: n}, (_, i) =>
    mod(sequences.reduce((sum, seq, j) => sum + ws[j] * seq[i], 0)));
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(M).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  let result = 1;
  for (let i = 1; i <= k; i++) result *= (n + 1 - i) / i;
  return result;
}

const unknown = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
assert.equal(unknown.length, 55);
assert.equal(unknown.reduce((n, page) => n + page.indices.length, 0), 12956);
assert.deepEqual(corpus.pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.equal(table.bytes.length, 256);
assert.deepEqual(jet(corpus.pages[29].indices, 24).slice(0, 2), [0, 0]);
assert.deepEqual(jet(table.bytes.map(mod), 24).slice(0, 2), [0, 0]);
assert.equal(power(5, 6) % 23, 8);
assert.equal(power(5, 15) % 23, 19);
assert.equal((8 ** 15) % 23, 2); // valid small integer? see next line
assert.equal((19 ** 6) % 23, 2);
const DH_K = 2;
const ROOT = 24;

const selected = unknown.filter(page => jet(page.indices, ROOT)[1] === DH_K)
  .map(page => ({page: page.page, value: jet(page.indices, ROOT)[0],
    derivative: DH_K}));
assert.deepEqual(selected, [
  {page:16, value:24, derivative:2},
  {page:28, value:12, derivative:2},
  {page:33, value:12, derivative:2},
  {page:34, value:24, derivative:2},
  {page:38, value:24, derivative:2}
]);

// Charge the entire field-root x field-derivative family, WITHOUT
// selecting an alternate candidate from its plaintext appearance.
const family = [];
for (let x = 0; x < M; x++) {
  const byDerivative = new Map();
  for (const page of unknown) {
    const [value, derivative] = jet(page.indices, x);
    if (!byDerivative.has(derivative)) byDerivative.set(derivative, []);
    byDerivative.get(derivative).push({page: page.page, value});
  }
  for (const [derivative, records] of byDerivative) {
    if (records.length < 5) continue;
    const distinct = new Set(records.map(record => record.value));
    if (distinct.size <= 2) family.push({x, derivative,
      pages: records.map(record => record.page)});
  }
}
assert.deepEqual(family, [{x:24, derivative:2,
  pages:[16,28,33,34,38]}]);

// Five fully determined Shamir interpolation weights; no decoder key fitted.
// Actual printed physical page numbers are x-coordinates reduced modulo 29.
const ids = selected.map(record => record.page);
const xs = ids.map(id => id % M);
const source = ids.map(id => corpus.pages[id].indices);
const n = Math.min(...source.map(seq => seq.length));
assert.equal(n, 214);
const w0 = weights(xs, 0);
const w50 = weights(xs, 50 % M);
assert.deepEqual(w0, [18, 5, 14, 11, 11]);
assert.deepEqual(w50, [17, 9, 5, 27, 1]);
assert.equal(mod(w0.reduce((sum, x) => sum + x, 0)), 1);
const secret = combine(source, w0);
const predictedTable = combine(source, w50);
const page29 = corpus.pages[29].indices;
const check29 = secret.reduce((sum, a, i) => sum + Number(a === page29[i]), 0);
const check50 = predictedTable.reduce((sum, a, i) =>
  sum + Number(a === mod(table.bytes[i])), 0);
assert.equal(check29, 9);
assert.equal(check50, 8);
const p55 = corpus.pages[55].indices;
assert.equal(p55.length, 76);
const minus = p55.map((c, i) => mod(c - secret[i]));
const plus = p55.map((c, i) => mod(c + secret[i]));
assert(Math.abs(ioc(secret) - 0.03352200429994296) < 1e-12);
assert(Math.abs(ioc(minus) - 0.03824561403508772) < 1e-12);
assert(Math.abs(ioc(plus) - 0.037894736842105266) < 1e-12);

// A completely independent, genuine solved-page GP29 plaintext plant:
// interpolate five polynomial shares back to the intended secret 0.
const native = corpus.pages[57].indices.slice(0, p55.length);
assert.equal(native.length, 76);
const plantShares = xs.map(x => native.map((target, i) =>
  mod(target + (3 + 7 * i) * x + (2 + 11 * i) * power(x, 2) +
    (1 + 13 * i) * power(x, 3) + (4 + 17 * i) * power(x, 4))));
const recovery = combine(plantShares, w0);
assert.deepEqual(recovery, native);
const plantedCipher = native.map((a, i) => mod(a + secret[i]));
assert.deepEqual(plantedCipher.map((a, i) => mod(a - secret[i])), native);

// Uniform iid GF29 pair null: a fixed derivative value occurs Binomial(55,1/29).
// Conditional on exactly five occurrences, 3+2 value-pattern assignments
// are C(29,2)*2*C(5,2)/29^5. This is a descriptive reference, not
// a discovery-corrected author-intent probability.
const p = 1 / M;
const exactFive = choose(55, 5) * p ** 5 * (1 - p) ** 50;
const pattern32 = choose(M, 2) * 2 * choose(5, 2) / M ** 5;
const fixedPairPattern32 = exactFive * pattern32;
let atLeastFiveAtMostTwo = 0;
for (let k = 5; k <= 55; k++) {
  const occurred = choose(55, k) * p ** k * (1 - p) ** (55 - k);
  const supportOneOrTwo = (M + choose(M, 2) * (2 ** k - 2)) / M ** k;
  atLeastFiveAtMostTwo += occurred * supportOneOrTwo;
}
assert(Math.abs(fixedPairPattern32 - 0.000011614548049884942) < 1e-15);
assert(Math.abs(atLeastFiveAtMostTwo - 0.000017839813775305507) < 1e-15);

console.log(JSON.stringify({
  source: 'Original LP2 printed GF29 whole-page coefficients; r24 from p39 red G and K2 from p28 DH state',
  selected,
  fullFieldFamily: {trials: M * M, qualifying: family},
  uniformIidNull: {
    fixedRootAndDerivativeExactlyFiveSplit3plus2: fixedPairPattern32,
    fixedRootAndDerivativeFiveOrMoreAtMostTwoValues: atLeastFiveAtMostTwo,
    unadjusted841CaseUnionUpperBound: M * M * atLeastFiveAtMostTwo,
    caveat: 'Retrospective mechanism selection and correlated original samples prevent interpreting this as a Cicada-authorship probability'
  },
  directFiveShareReceiver: {
    sourcePages: ids, sourceLength: n, xCoordinatesMod29: xs,
    interpolationAtZeroWeights: w0, atTablePage50Weights: w50,
    sourceSecretIoc: ioc(secret), p29MatchedSymbols: check29,
    p50MatchedSymbols: check50, matchedReferenceExpected: n / M,
    p55PlusIoc: ioc(plus), p55MinusIoc: ioc(minus),
    p55MinusTransliteration: minus.map(i => corpus.translit[i]).join(''),
    genuineSolvedP57PlantRecovered: recovery.length
  },
  conclusion: 'Unusually compact 5-page original jet signature; direct zero-coordinate Shamir sharing and p55 additive consumer do not recover coherent GP29 plaintext'
}, null, 2));
