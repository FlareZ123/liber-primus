'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * GF(256) multiplication by binary polynomial reduction.
 * @param {number} a
 * @param {number} b
 * @param {number} irreducible
 * @returns {number}
 */
function bitMultiply(a, b, irreducible) {
  let value = 0;
  for (let n = 0; n < 8; n++) {
    if (b & 1) value ^= a;
    b >>>= 1;
    a <<= 1;
    if (a & 256) a ^= irreducible;
  }
  return value;
}

/**
 * @param {number} irreducible
 * @param {number} generator
 * @returns {{ multiply: (a: number, b: number) => number, divide: (a: number, b: number) => number }}
 */
function makeField(irreducible, generator) {
  const powers = new Uint8Array(512);
  const logarithms = new Uint16Array(256);
  let value = 1;
  const seen = new Set();
  for (let n = 0; n < 255; n++) {
    assert.equal(seen.has(value), false, 'Generator must be primitive');
    seen.add(value);
    powers[n] = value;
    logarithms[value] = n;
    value = bitMultiply(value, generator, irreducible);
  }
  assert.equal(value, 1);
  assert.equal(seen.size, 255);
  for (let n = 255; n < 512; n++) powers[n] = powers[n - 255];
  return {
    multiply(a, b) {
      return a === 0 || b === 0 ? 0 : powers[logarithms[a] + logarithms[b]];
    },
    divide(a, b) {
      assert.notEqual(b, 0);
      return a === 0 ? 0 : powers[(logarithms[a] - logarithms[b] + 255) % 255];
    },
  };
}

/**
 * Newton interpolation at the fixed distinct field points x = 0,...,255.
 * Degree <=179 exactly when every coefficient at index 180,...,255 is zero.
 * @param {number[]} values
 * @param {{ divide: (a: number, b: number) => number }} field
 * @returns {number[]}
 */
function newtonCoefficients(values, field) {
  const coefficients = values.slice();
  for (let step = 1; step < values.length; step++) {
    for (let i = values.length - 1; i >= step; i--) {
      coefficients[i] = field.divide(
        coefficients[i] ^ coefficients[i - 1],
        i ^ (i - step),
      );
    }
  }
  return coefficients;
}

/**
 * @param {number[]} coefficients
 * @param {number} x
 * @param {{ multiply: (a: number, b: number) => number }} field
 * @returns {number}
 */
function polynomialAt(coefficients, x, field) {
  let value = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    value = field.multiply(value, x) ^ coefficients[i];
  }
  return value;
}

function main() {
  const filename = path.join(__dirname, '../resources/liber-primus/base60-grid.json');
  const table = JSON.parse(fs.readFileSync(filename, 'utf8'));
  assert.equal(table.byte_rows.length, 32);
  assert.equal(table.rows.length, 32);
  assert.equal(table.alphabet.length, 60);
  const bytes = [];
  for (let row = 0; row < 32; row++) {
    assert.equal(table.byte_rows[row].length, 8);
    assert.equal(table.rows[row].length, 8);
    for (let col = 0; col < 8; col++) {
      const token = table.rows[row][col];
      const decoded = 60 * table.alphabet.indexOf(token[0]) + table.alphabet.indexOf(token[1]);
      assert.equal(decoded, table.byte_rows[row][col], 'Original base60 conversion changed');
      assert.ok(Number.isInteger(decoded) && decoded >= 0 && decoded < 256);
      bytes.push(decoded);
    }
  }
  assert.equal(bytes.length, 256);

  for (const [polynomial, generator] of [[0x11d, 2], [0x11b, 3]]) {
    const field = makeField(polynomial, generator);
    const positiveCoefficients = Array.from({ length: 180 }, (_, i) => (i * 113 + 41) & 255);
    const planted = Array.from({ length: 256 }, (_, x) =>
      polynomialAt(positiveCoefficients, x, field));
    const plantNewton = newtonCoefficients(planted, field);
    assert.ok(plantNewton.slice(180).every(value => value === 0),
      'Degree-179 positive-control codeword rejected');
    assert.notEqual(plantNewton[179], 0);

    const originalNewton = newtonCoefficients(bytes, field);
    const high = originalNewton.slice(180);
    const nonzero = high.filter(value => value !== 0).length;
    assert.equal(nonzero, 76, 'Original source or frozen test outcome changed');
    assert.equal(originalNewton[255] !== 0, true);
    console.log(JSON.stringify({
      fieldPolynomial: '0x' + polynomial.toString(16),
      primitiveGenerator: generator,
      originalHighDegreeNonzero: nonzero,
      testedHighDegreeCoefficients: high.length,
      originalCoefficients180to187: high.slice(0, 8),
      originalInterpolatingDegree: 255,
      plantedDegree179Passes: true,
      result: 'Fails systematic extended RS(256,180) in this fixed original byte order',
    }));
  }
}

if (require.main === module) main();
module.exports = { bitMultiply, makeField, newtonCoefficients, polynomialAt };
