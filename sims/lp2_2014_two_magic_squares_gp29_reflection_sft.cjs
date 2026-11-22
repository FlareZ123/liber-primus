/**
 * Source-original 2014 Cicada three OpenPuff magic squares:
 * an exact mod29 reflection identity for the first and last 5x5 sources.
 *
 * Source: resources/cicada2014-openpuff-magic-squares.txt
 * Full original integer powers, exact gcd certificates, actual LP2 GP29
 * receiver and source-native plaintext plant. No fitted cipher keys.
 *
 * Windows Node22 SFT:
 * node sims/lp2_2014_two_magic_squares_gp29_reflection_sft.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');

/**
 * @param {number[][]} source
 * @returns {bigint[][]}
 */
function bigMatrix(source) { return source.map(row => row.map(BigInt)); }
/** @param {number} n @returns {bigint[][]} */
function identity(n) { return Array.from({ length: n }, (_, r) =>
  Array.from({ length: n }, (_, c) => r === c ? 1n : 0n)); }
/** @param {number} n @returns {bigint[][]} */
function reversal(n) { return Array.from({ length: n }, (_, r) =>
  Array.from({ length: n }, (_, c) => r + c === n - 1 ? 1n : 0n)); }
/** @param {bigint[][]} a @param {bigint[][]} b @returns {bigint[][]} */
function multiply(a, b) {
  const n = a.length;
  assert.equal(b.length, n);
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) =>
      a[r].reduce((sum, v, k) => sum + v * b[k][c], 0n)));
}
/** @param {bigint[][]} a @param {number} exponent @returns {bigint[][]} */
function power(a, exponent) {
  assert(exponent >= 0 && Number.isInteger(exponent));
  let x = a;
  let n = exponent;
  let out = identity(a.length);
  while (n > 0) {
    if (n % 2) out = multiply(out, x);
    x = multiply(x, x);
    n = Math.floor(n / 2);
  }
  return out;
}
/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x, y) {
  x = x < 0n ? -x : x;
  y = y < 0n ? -y : y;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}
/** @param {bigint[][]} a @param {bigint[][]} b @returns {bigint} */
function gcdResidual(a, b) {
  return a.flatMap((r, i) => r.map((x, j) => x - b[i][j]))
    .reduce((acc, value) => gcd(acc, value), 0n);
}
/** @param {bigint} value @returns {bigint} */
function mod29(value) { return ((value % 29n) + 29n) % 29n; }
/** @param {bigint[][]} value @returns {bigint[][]} */
function reduce29(value) { return value.map(row => row.map(mod29)); }
/** @param {bigint[][]} value @returns {number[][]} */
function number29(value) { return reduce29(value).map(row => row.map(Number)); }
/**
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @returns {number[]}
 */
function vector29(matrix, vector) {
  assert.equal(matrix.length, vector.length);
  return matrix.map(row => row.reduce((sum, value, i) =>
    (sum + value * vector[i]) % 29, 0));
}
/** @param {number[]} seq @returns {{ioc:number,top12:number}} */
function score(seq) {
  const hist = Array(29).fill(0);
  for (const x of seq) hist[x]++;
  const n = seq.length;
  return {
    ioc: hist.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1)),
    top12: [...hist].sort((a, b) => b - a).slice(0, 12).reduce((s, v) => s + v, 0)
  };
}

function main() {
  const sourcePath = path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt');
  const sections = fs.readFileSync(sourcePath, 'utf8').trim().split(/\r?\n\s*\r?\n/);
  const squares = sections.map(section => section.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(squares.map(s => [s.length, ...new Set(s.map(r => r.length))]),
    [[5, 5], [7, 7], [5, 5]]);
  const [first3301, middle7, last1033] = squares;
  assert.equal(first3301[0].reduce((s, v) => s + v, 0), 3301);
  assert.equal(last1033[0].reduce((s, v) => s + v, 0), 1033);
  assert.deepEqual(first3301[0], [434, 1311, 312, 278, 966]);
  assert.deepEqual(last1033[0], [272, 138, 341, 131, 151]);
  assert.equal(middle7[3][3], 331);
  const first = bigMatrix(first3301), last = bigMatrix(last1033);
  const J = reversal(5), U = Array.from({ length: 5 }, () => Array(5).fill(1n));
  const negJ = J.map(row => row.map(x => -x));
  const meanReverse = U.map((row, r) => row.map((x, c) => 12n * x - J[r][c]));
  // These are integer equalities ONLY after reduction mod29.
  // The gcd is evaluated on enormous ORIGINAL-ENTRY powers, not on a
  // GF29 matrix chosen after seeing any unencrypted LP2 output.
  const first28 = power(first, 28);
  const last14 = power(last, 14);
  const firstGcd = gcdResidual(first28, meanReverse);
  const lastGcd = gcdResidual(last14, negJ);
  assert.equal(firstGcd, 29n);
  assert.equal(lastGcd, 29n);
  assert.deepEqual(reduce29(first28), reduce29(meanReverse));
  assert.deepEqual(reduce29(last14), reduce29(negJ));
  assert.deepEqual(reduce29(power(first, 56)), identity(5));
  assert.deepEqual(reduce29(power(last, 28)), identity(5));
  // Native modular orders are sharp: 3301 square 56; 1033 square 28.
  for (let k = 1; k < 56; k++) {
    assert.notDeepEqual(reduce29(power(first, k)), identity(5));
  }
  for (let k = 1; k < 28; k++) {
    assert.notDeepEqual(reduce29(power(last, k)), identity(5));
  }
  // Their conjugation-free half-period state laws are involutions.
  assert.deepEqual(reduce29(multiply(first28, first28)), identity(5));
  assert.deepEqual(reduce29(multiply(last14, last14)), identity(5));
  // The two 5x5 original matrices themselves are invertible mod29.
  const firstInverse = reduce29(power(first, 55));
  const lastInverse = reduce29(power(last, 27));
  assert.deepEqual(reduce29(multiply(first, firstInverse)), identity(5));
  assert.deepEqual(reduce29(multiply(last, lastInverse)), identity(5));

  const original = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const tape = original.pages.filter(p => p.page <= 55).flatMap(p => p.indices || []);
  assert.equal(tape.length, 12956);
  const bookend = tape.slice(6561);
  assert.equal(bookend.length, 5 * 1279);
  const invertLast = number29(lastInverse), forwardLast = number29(last);
  const invertFirst = number29(firstInverse);
  const native = encodeSourceNativeGP(fs.readFileSync(
    path.join(root, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8'));
  assert(native.length >= bookend.length);
  const direct = [], alternate = [], back = [], planted = [];
  for (let i = 0; i < bookend.length; i += 5) {
    const originalFive = bookend.slice(i, i + 5);
    const actualOne = vector29(invertLast, originalFive);
    direct.push(...actualOne);
    alternate.push(...vector29(invertFirst, originalFive));
    assert.deepEqual(vector29(forwardLast, actualOne), originalFive);
    const plainFive = native.slice(i, i + 5);
    const cipherFive = vector29(forwardLast, plainFive);
    planted.push(...vector29(invertLast, cipherFive));
    back.push(...cipherFive);
  }
  assert.deepEqual(planted, native.slice(0, bookend.length));
  assert.equal(back.length, bookend.length);
  // Both source-defined standalone Hill inverses still have original
  // nearly uniform GP29 first-order statistics.
  assert(score(direct).ioc < 0.04);
  assert(score(alternate).ioc < 0.04);
  assert(score(planted).ioc > 0.045);

  console.log(JSON.stringify({
    source: 'resources/cicada2014-openpuff-magic-squares.txt',
    historical_dimensions: squares.map(s => s.length),
    first_five_magic_sum: 3301,
    final_five_magic_sum: 1033,
    original_integer_modulus_uniqueness: {
      gcd_first_power28_minus_twice_mean_plus_reversal: String(firstGcd),
      gcd_last_power14_plus_reversal: String(lastGcd)
    },
    exact_gp29_operations: {
      first3301_order: 56,
      first3301_power28: '12*ALL_ONES minus REVERSE',
      third1033_order: 28,
      third1033_power14: 'negative REVERSE',
      inverse_first3301: number29(firstInverse),
      inverse_third1033: number29(lastInverse)
    },
    original_B_6395_1279_vector_inverses: {
      first3301_one_round: score(alternate),
      last1033_one_round: score(direct),
      actual_native_english_6395_plant: score(planted)
    },
    source_ciphertext_exact_forward_replay: true,
    known_GP29_prose_plant_exact_roundtrip: true,
    unknown_plaintext_recovered: false
  }, null, 2));
}
main();
