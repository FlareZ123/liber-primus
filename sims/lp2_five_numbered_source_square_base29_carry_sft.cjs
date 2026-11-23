'use strict';

/**
 * Exact carried BASE29 five-stream matrices on the original LP2 p36–38.
 * Tests both original 2014 five-by-five squares, raw/phi, both orientations,
 * and both BASE29 digit directions. Node.js 22, dependency-free/read-only.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const lp1 = fs.readFileSync(path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'), 'utf8');
const page = (number) => corpus.pages.find((record) => record.page === number).indices;
const original = [
  page(36).slice(99, 190),
  page(37).slice(0, 91),
  page(37).slice(91, 182),
  [...page(37).slice(189, 228), ...page(38).slice(0, 52)],
  page(38).slice(57, 148),
];
const length = 91;
assert.deepEqual(original.map((lane) => lane.length), [91, 91, 91, 91, 91]);

const radix = 29n;
const modulus = radix ** BigInt(length);
const mod = (value) => (value % modulus + modulus) % modulus;

/** @param {bigint[]} digits @param {boolean} reverse */
function pack(digits, reverse) {
  const ordered = reverse ? [...digits].reverse() : digits;
  return ordered.reduce((a, digit) => a * radix + BigInt(digit), 0n);
}

/** @param {bigint} integer @param {boolean} reverse */
function unpack(integer, reverse) {
  const out = Array.from({ length }, () => 0);
  let value = integer;
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(value % radix);
    value /= radix;
  }
  if (reverse) out.reverse();
  assert.equal(value, 0n);
  return out;
}

/** @param {number} number */
function phi(number) {
  let result = number;
  let remainder = number;
  for (let factor = 2; factor * factor <= remainder; factor++) {
    if (remainder % factor === 0) {
      while (remainder % factor === 0) remainder /= factor;
      result = result / factor * (factor - 1);
    }
  }
  if (remainder > 1) result = result / remainder * (remainder - 1);
  return result;
}

/** @param {bigint} value */
function unitInverse(value) {
  let a = mod(value);
  let b = modulus;
  let s0 = 1n;
  let s1 = 0n;
  while (b) {
    const q = a / b;
    [a, b] = [b, a - q * b];
    [s0, s1] = [s1, s0 - q * s1];
  }
  assert.equal(a, 1n, 'Pivot is not a unit modulo 29**91');
  return mod(s0);
}

/** @param {number[][]} matrix */
function inverse(matrix) {
  const w = matrix.map((row, i) => [
    ...row.map((v) => mod(BigInt(v))),
    ...Array.from({ length: 5 }, (_, j) => BigInt(i === j)),
  ]);
  for (let col = 0; col < 5; col++) {
    const pivot = w.findIndex((row, i) => i >= col && row[col] % radix !== 0n);
    assert(pivot >= 0, 'Original square is singular modulo 29');
    [w[col], w[pivot]] = [w[pivot], w[col]];
    const reciprocal = unitInverse(w[col][col]);
    for (let j = 0; j < 10; j++) w[col][j] = mod(w[col][j] * reciprocal);
    for (let row = 0; row < 5; row++) {
      if (row === col) continue;
      const ratio = w[row][col];
      for (let j = 0; j < 10; j++) {
        w[row][j] = mod(w[row][j] - ratio * w[col][j]);
      }
    }
  }
  return w.map((row) => row.slice(5));
}

/**
 * @param {(bigint[]|number[])[]} matrix
 * @param {bigint[]} input
 * @returns {bigint[]}
 */
function apply(matrix, input) {
  return matrix.map((row) => mod(row.reduce(
    (sum, factor, col) => sum + BigInt(factor) * input[col], 0n
  )));
}

/** @param {number[][]} matrix */
const transpose = (matrix) => matrix[0].map((_, col) => matrix.map((row) => row[col]));

/** @param {number[]} data */
function profile(data) {
  const counts = Array.from({ length: 29 }, () => 0);
  for (const symbol of data) counts[symbol]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (data.length * (data.length - 1));
}

const squares = [
  { name: '1033 Wisdom square', values: [
    [272, 138, 341, 131, 151], [366, 199, 130, 320, 18],
    [226, 245, 91, 245, 226], [18, 320, 130, 199, 366],
    [151, 131, 341, 138, 272],
  ] },
  { name: '3301 2014 square', values: [
    [434, 1311, 312, 278, 966], [204, 812, 934, 280, 1071],
    [626, 620, 809, 620, 626], [1071, 280, 934, 812, 204],
    [966, 278, 312, 1311, 434],
  ] },
];
const runeIds = new Map(corpus.runes.map((rune, idx) => [rune, idx]));
const solved = lp1.split('%').slice(8, 12).flatMap((part) => Array.from(part)
  .filter((rune) => runeIds.has(rune)).map((rune) => runeIds.get(rune)));
assert.equal(solved.length, 755);
const native = Array.from({ length: 5 }, (_, row) =>
  solved.slice(row * length, (row + 1) * length));
const output = [];
for (const square of squares) {
  for (const numeric of ['raw', 'totient']) {
    const rows = numeric === 'raw'
      ? square.values
      : square.values.map((row) => row.map(phi));
    for (const orientation of ['printed', 'transposed']) {
      const matrix = orientation === 'printed' ? rows : transpose(rows);
      const decoder = inverse(matrix);
      for (const reverse of [false, true]) {
        const c = original.map((lane) => pack(lane, reverse));
        const p = apply(decoder, c);
        const recovered = p.map((num) => unpack(num, reverse));
        assert.deepEqual(apply(matrix, p), c);
        const nativeInts = native.map((lane) => pack(lane, reverse));
        const plantedInts = apply(matrix, nativeInts);
        assert.deepEqual(apply(decoder, plantedInts), nativeInts);
        assert.deepEqual(plantedInts.map((v) => unpack(v, reverse))
          .map((lane) => pack(lane, reverse)), plantedInts);
        output.push({
          square: square.name, cells: numeric, orientation,
          reversedDigits: reverse,
          originalIoC: profile(recovered.flat()),
          originalLaneIoCs: recovered.map(profile),
          sourceNativePlant: '455/455',
        });
      }
    }
  }
}

// Five integer shares at printed red abscissas 1..5 encode polynomial f(x).
// The exact degree-four interpolation at x=0 has fixed weights 5,-10,10,-5,1.
// This carried-register operation is distinct from rune-by-rune GF29 Shamir.
const shareWeights = [5n, -10n, 10n, -5n, 1n];
const integerShareTests = [];
for (const reverse of [false, true]) {
  const encoded = original.map((lane) => pack(lane, reverse));
  const secret = mod(encoded.reduce((sum, value, k) => sum + shareWeights[k] * value, 0n));
  const decoded = unpack(secret, reverse);
  const nativeCoefficients = native.map((lane) => pack(lane, reverse));
  const shares = Array.from({ length: 5 }, (_, i) => {
    const x = BigInt(i + 1);
    let value = 0n;
    let xPower = 1n;
    for (const coefficient of nativeCoefficients) {
      value += coefficient * xPower;
      xPower *= x;
    }
    return mod(value);
  });
  const trueSecret = mod(shares.reduce((sum, value, k) => sum + shareWeights[k] * value, 0n));
  assert.equal(trueSecret, nativeCoefficients[0]);
  const ioc = profile(decoded);
  assert(ioc < 0.041);
  integerShareTests.push({
    reversedDigits: reverse,
    originalIoC: ioc,
    positive: '91/91',
    first24: decoded.slice(0, 24).map((value) => corpus.translit[value]).join(''),
  });
}
assert.deepEqual(integerShareTests.map((row) => row.originalIoC),
  [0.036874236874236875, 0.028327228327228327]);

// Alternate literal coordinates: the cuneiform 1033/3301 are target x
// values for the five numbered shares at x=1..5. Lagrange weights are
// integer-valued at these integer targets, even modulo 29**91.
/** @param {bigint} target */
function lagrangeWeights(target) {
  return Array.from({ length: 5 }, (_, row) => {
    let numerator = 1n;
    let denominator = 1n;
    for (let col = 0; col < 5; col++) {
      if (row === col) continue;
      numerator *= target - BigInt(col + 1);
      denominator *= BigInt(row - col);
    }
    assert.equal(numerator % denominator, 0n);
    return numerator / denominator;
  });
}
const targetTests = [];
for (const target of [1033n, 3301n]) {
  const weights = lagrangeWeights(target);
  for (const reverse of [false, true]) {
    const originalIntegers = original.map((lane) => pack(lane, reverse));
    const decodedInteger = mod(originalIntegers.reduce(
      (sum, value, k) => sum + value * weights[k], 0n
    ));
    const decoded = unpack(decodedInteger, reverse);
    const targetPlain = pack(native[0], reverse);
    const higher = native.slice(1).map((lane) => pack(lane, reverse));
    let contribution = 0n;
    let power = 1n;
    for (const coefficient of higher) {
      power *= target;
      contribution += coefficient * power;
    }
    const coefficients = [mod(targetPlain - contribution), ...higher];
    const shares = Array.from({ length: 5 }, (_, i) => {
      const x = BigInt(i + 1);
      let value = 0n;
      let power = 1n;
      for (const coefficient of coefficients) {
        value += coefficient * power;
        power *= x;
      }
      return mod(value);
    });
    const reconstructed = mod(shares.reduce(
      (sum, value, k) => sum + value * weights[k], 0n
    ));
    assert.equal(reconstructed, targetPlain);
    const ioc = profile(decoded);
    assert(ioc < 0.041);
    targetTests.push({
      target: String(target), wholeRegister: true,
      reversedDigits: reverse, originalIoC: ioc,
      positive: '91/91',
      first24: decoded.slice(0, 24).map((value) => corpus.translit[value]).join(''),
    });
  }
  const perRune = Array.from({ length }, (_, at) => Number(
    (original.reduce((sum, lane, k) =>
      sum + weights[k] * BigInt(lane[at]), 0n) % radix + radix) % radix
  ));
  const ioc = profile(perRune);
  assert(ioc < 0.041);
  targetTests.push({
    target: String(target), wholeRegister: false,
    originalIoC: ioc, positive: 'exact GF29 Lagrange polynomial identity',
    first24: perRune.slice(0, 24).map((value) => corpus.translit[value]).join(''),
  });
}
assert.deepEqual(targetTests.map((row) => row.originalIoC), [
  0.03076923076923077, 0.03638583638583639, 0.03785103785103785,
  0.03638583638583639, 0.03247863247863248, 0.03199023199023199,
]);
assert.equal(output.length, 16);
const maximum = Math.max(...output.map((row) => row.originalIoC));
assert(maximum < 0.037, 'A whole-register carried matrix produced atypically high original IoC');
assert(output.every((row) => row.originalLaneIoCs.every((value) => value < 0.041)));
process.stdout.write(JSON.stringify({
  original: [139, 91, 98, 96, 129],
  commonPrefix: 91,
  sourceDefinedModels: output.length,
  rangeAggregatedOriginalIoC: [
    Math.min(...output.map((row) => row.originalIoC)), maximum,
  ],
  fullModels: output,
  integerShareTests,
  targetTests,
}, null, 2) + '\n');
process.stdout.write('PASS original 16 BASE29 carried matrices, 16 source-native plants, exact replay\n');
