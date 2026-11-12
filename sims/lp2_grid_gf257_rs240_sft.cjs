/**
 * Single-file test: original 256-cell LP2 grid versus two explicit
 * [256,240] GF(257) Reed–Solomon interpretations.
 *
 * Source: resources/liber-primus/base60-grid.json (32 x 8, page-major).
 * Node.js 18+; no dependencies. This SFT does not write files.
 */
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @type {number} */
const PRIME = 257;
/** @type {number} */
const N = 256;
/** @type {number} */
const GENERATOR = 3;
/** @param {number} x @returns {number} */
const mod = (x) => ((x % PRIME) + PRIME) % PRIME;

/**
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 */
function modPow(base, exponent) {
  let result = 1;
  let value = base;
  for (let e = exponent; e > 0; e = Math.floor(e / 2)) {
    if (e % 2 === 1) result = (result * value) % PRIME;
    value = (value * value) % PRIME;
  }
  return result;
}

/**
 * Evaluate descending polynomial coefficients at x.
 * @param {number[]} coefficients
 * @param {number} x
 * @returns {number}
 */
function evaluateDescending(coefficients, x) {
  return coefficients.reduce((acc, value) => (acc * x + value) % PRIME, 0);
}

/**
 * @param {number[]} left Descending polynomial coefficients
 * @param {number[]} right Descending polynomial coefficients
 * @returns {number[]}
 */
function multiplyDescending(left, right) {
  const out = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      out[i + j] = mod(out[i + j] + left[i] * right[j]);
    }
  }
  return out;
}

const powers = Array.from({ length: N }, (_, exponent) =>
  modPow(GENERATOR, exponent)
);
assert.equal(new Set(powers).size, N, '3 is a primitive element of GF(257)');

/** @param {number[]} coefficients @returns {number[]} */
function rootIndices(coefficients) {
  return powers.flatMap((x, i) =>
    evaluateDescending(coefficients, x) === 0 ? [i] : []
  );
}

/**
 * Values indexed by consecutive powers of 3 to ascending polynomial coefficients.
 * 256^-1 = 256 in GF(257).
 * @param {number[]} samples
 * @returns {number[]}
 */
function inverseEvaluation(samples) {
  const inverseGenerator = modPow(GENERATOR, N - 1);
  const coefficients = [];
  for (let k = 0; k < N; k++) {
    const ratio = modPow(inverseGenerator, k);
    let phase = 1;
    let total = 0;
    for (let i = 0; i < N; i++) {
      total = mod(total + samples[i] * phase);
      phase = mod(phase * ratio);
    }
    coefficients.push(mod(total * N));
  }
  return coefficients;
}

/**
 * @param {number[]} ascendingCoefficients
 * @returns {number[]}
 */
function encodeEvaluation(ascendingCoefficients) {
  return powers.map((x) =>
    ascendingCoefficients.reduceRight(
      (acc, coefficient) => mod(acc * x + coefficient),
      0
    )
  );
}

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
assert.equal(source.byte_rows.length, 32);
assert.ok(source.byte_rows.every((row) => row.length === 8));
const bytes = source.byte_rows.flat();
assert.equal(bytes.length, N);
assert.ok(bytes.every((x) => Number.isInteger(x) && x >= 0 && x <= 255));
const digest = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(digest, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

console.log('LP2 source: 32 x 8, 256 bytes; SHA256 ' + digest);
for (const [name, ordered] of [
  ['printed', bytes],
  ['reverse', [...bytes].reverse()]
]) {
  const roots = rootIndices(ordered);
  const interpolation = inverseEvaluation(ordered);
  assert.deepEqual(encodeEvaluation(interpolation), ordered);
  assert.equal(roots.length, 1);
  assert.equal(interpolation.filter((v) => v === 0).length, 1);
  assert.ok(interpolation.slice(240).every((x) => x !== 0));
  console.log(name + ': polynomial-zero exponents = ' + JSON.stringify(roots)
    + '; interpolation-zero indices = '
    + JSON.stringify(interpolation.flatMap((value, i) => value === 0 ? [i] : []))
    + '; degree-240..255 coefficients = '
    + JSON.stringify(interpolation.slice(240)));
}
assert.deepEqual(rootIndices(bytes), [164]);
assert.deepEqual(rootIndices([...bytes].reverse()), [92]);

let generatorPolynomial = [1];
for (let i = 0; i < 16; i++) {
  generatorPolynomial = multiplyDescending(generatorPolynomial, [1, mod(-powers[i])]);
}
const cyclicPlant = multiplyDescending(bytes.slice(0, 240), generatorPolynomial);
assert.equal(cyclicPlant.length, N);
const cyclicRoots = new Set(rootIndices(cyclicPlant));
assert.ok(powers.slice(0, 16).every((_, i) => cyclicRoots.has(i)));
console.log('Cyclic RS plant: all 16 designed roots recovered');

const plantedCoefficients = [...bytes.slice(0, 240), ...Array(16).fill(0)];
const evaluationPlant = encodeEvaluation(plantedCoefficients);
const recoveredCoefficients = inverseEvaluation(evaluationPlant);
assert.deepEqual(recoveredCoefficients, plantedCoefficients);
console.log('Evaluation RS plant: all 240 source-data coefficients restored, 16 trailing zeros');
console.log('CONCLUSION: source array is not an unaltered RS[256,240] cyclic coefficient codeword or evaluation codeword over GF(257) in tested printed/reverse orders.');
