'use strict';

/**
 * LP2 p49-51: a source-constrained four-syndrome, single-residue corrector.
 *
 * The original 256 printed base60 tokens are interpreted as 256 bytes, reduced
 * modulo 29. Descending polynomial coefficients are fixed by printed order.
 * The signed-2013 BASE29 quadratic and the red p39 repeated-root quadratic
 * are exact factors of that polynomial.
 *
 * This script identifies the precise error-correction capability of those
 * already-observed factors. It does not assume that Cicada intended an ECC.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MOD = 29;
const SOURCE_HASH = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
const HISTORICAL_BASE29 = [1, 18, 11];
const P39_REPEATED_ROOT = [1, 10, 25];
const SINGLE_VARIANTS = [
  { index: 45, alternativeByte: 81 },
  { index: 50, alternativeByte: 21 },
  { index: 165, alternativeByte: 47 },
  { index: 172, alternativeByte: 174 },
  { index: 246, alternativeByte: 224 }
];

/** @param {number} n @returns {number} */
function mod(n) {
  return (n % MOD + MOD) % MOD;
}

/**
 * @param {number[]} left Descending polynomial coefficients.
 * @param {number[]} right Descending polynomial coefficients.
 * @returns {number[]}
 */
function polynomialProduct(left, right) {
  const output = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      output[i + j] = mod(output[i + j] + left[i] * right[j]);
    }
  }
  return output;
}

/**
 * Represent a polynomial of degree below four by four descending
 * coefficients. Return X times the polynomial, reduced by monic degree-four
 * generator.
 * @param {number[]} remainder
 * @param {number[]} generator
 * @returns {number[]}
 */
function timesX(remainder, generator) {
  const next = remainder.slice(1).concat(0);
  for (let j = 0; j < 4; j++) {
    next[j] = mod(next[j] - remainder[0] * generator[j + 1]);
  }
  return next;
}

/**
 * Column i is X^(255-i) modulo the generator.
 * @param {number[]} generator
 * @returns {number[][]}
 */
function syndromeColumns(generator) {
  const powers = [[0, 0, 0, 1]];
  for (let exponent = 1; exponent < 256; exponent++) {
    powers.push(timesX(powers[powers.length - 1], generator));
  }
  return powers.reverse();
}

/**
 * @param {number[]} residues
 * @param {number[][]} columns
 * @returns {number[]}
 */
function syndrome(residues, columns) {
  const sum = [0, 0, 0, 0];
  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 4; j++) {
      sum[j] = mod(sum[j] + residues[i] * columns[i][j]);
    }
  }
  return sum;
}

/** @param {number[]} vector @returns {string} */
function vectorKey(vector) {
  return vector.join(',');
}

const fixture = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../resources/liber-primus/base60-grid.json'),
  'utf8'
));
const bytes = fixture.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'), SOURCE_HASH);
assert.ok(bytes.every((value) => Number.isInteger(value) && value >= 0 && value <= 255));

const generator = polynomialProduct(HISTORICAL_BASE29, P39_REPEATED_ROOT);
assert.deepEqual(generator, [1, 28, 13, 9, 14]);
const columns = syndromeColumns(generator);
const residues = bytes.map(mod);
assert.deepEqual(syndrome(residues, columns), [0, 0, 0, 0]);

// Every possible single-residue corruption has a unique four-coordinate
// syndrome, even though the generator was not chosen to be an ECC code.
const uniqueSyndromes = new Map();
for (let index = 0; index < 256; index++) {
  for (let delta = 1; delta < MOD; delta++) {
    const errorSyndrome = columns[index].map((value) => mod(delta * value));
    const key = vectorKey(errorSyndrome);
    assert.ok(!uniqueSyndromes.has(key), 'Two distinct single errors share a syndrome');
    uniqueSyndromes.set(key, { index, delta });
  }
}
assert.equal(uniqueSyndromes.size, 256 * 28);

// Exhaustively plant every one-symbol modulo-29 error and actually reverse it.
let corrected = 0;
for (let index = 0; index < 256; index++) {
  for (let delta = 1; delta < MOD; delta++) {
    const corrupted = residues.slice();
    corrupted[index] = mod(corrupted[index] + delta);
    const observed = syndrome(corrupted, columns);
    const recovered = uniqueSyndromes.get(vectorKey(observed));
    assert.deepEqual(recovered, { index, delta });
    corrupted[recovered.index] = mod(corrupted[recovered.index] - recovered.delta);
    assert.deepEqual(corrupted, residues);
    corrected++;
  }
}
assert.equal(corrected, 7168);

// Independent community variants of five original cells. These are test
// corruptions; the original byte table is never modified.
const variantResults = [];
for (const { index, alternativeByte } of SINGLE_VARIANTS) {
  const changed = residues.slice();
  changed[index] = mod(alternativeByte);
  const observed = syndrome(changed, columns);
  const detected = uniqueSyndromes.get(vectorKey(observed)) ?? null;
  const delta = mod(alternativeByte - bytes[index]);
  if (delta === 0) {
    assert.deepEqual(observed, [0, 0, 0, 0]);
    assert.equal(detected, null);
  } else {
    assert.deepEqual(detected, { index, delta });
    changed[index] = mod(changed[index] - delta);
    assert.deepEqual(changed, residues);
  }
  variantResults.push({
    index,
    originalByte: bytes[index],
    alternativeByte,
    originalResidue: residues[index],
    alternativeResidue: mod(alternativeByte),
    detected: detected !== null
  });
}

// The code has minimum Hamming distance exactly THREE. Nonzero single-column
// syndromes are unique up to scale; the next triple is an explicit weight-three
// zero-syndrome witness. Thus two errors need not be uniquely correctable.
const tripleLeft = columns[0].map((v, j) => mod(v + 10 * columns[3][j]));
const tripleRight = columns[233].map((v) => mod(23 * v));
assert.deepEqual(tripleLeft, tripleRight);
const fourChanged = residues.slice();
for (const { index, alternativeByte } of SINGLE_VARIANTS) {
  fourChanged[index] = mod(alternativeByte);
}
assert.deepEqual(syndrome(fourChanged, columns), [27, 23, 8, 19]);
assert.equal(uniqueSyndromes.has(vectorKey(syndrome(fourChanged, columns))), false);

console.log(JSON.stringify({
  sourceSha256: SOURCE_HASH,
  generator,
  originalSyndrome: [0, 0, 0, 0],
  uniqueSingleErrorSyndromes: uniqueSyndromes.size,
  exhaustiveCorrectedSingleResidueErrors: corrected,
  minimumDistance: 3,
  weightThreeRelation: 'H[0] + 10 H[3] - 23 H[233] = 0 (mod 29)',
  variantResults,
  simultaneousFourResidueErrors: 'detected, not uniquely decoded'
}, null, 2));
