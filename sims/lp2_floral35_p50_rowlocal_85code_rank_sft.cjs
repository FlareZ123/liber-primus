"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Multiply two octets in GF(2^8) with a monic irreducible degree-eight modulus.
 * @param {number} a Integer byte.
 * @param {number} b Integer byte.
 * @param {number} polynomial Nine-bit modulus including x^8.
 * @returns {number} Field product.
 */
function gf256Multiply(a, b, polynomial) {
  let value = 0;
  for (let bit = 0; bit < 8; bit++) {
    if (b & 1) value ^= a;
    b >>>= 1;
    const carry = a & 128;
    a = (a << 1) & 255;
    if (carry) a ^= polynomial & 255;
  }
  return value;
}

/**
 * @param {number} value Field element.
 * @param {number} exponent Nonnegative integer.
 * @param {number} polynomial Field polynomial.
 * @returns {number} Field power.
 */
function gf256Power(value, exponent, polynomial) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = gf256Multiply(result, value, polynomial);
    value = gf256Multiply(value, value, polynomial);
    exponent >>>= 1;
  }
  return result;
}

/**
 * Reduce binary-polynomial a modulo b, with XOR as coefficient addition.
 * @param {number} a Binary-polynomial bitset.
 * @param {number} b Nonzero binary-polynomial bitset.
 * @returns {number} Remainder.
 */
function binaryRemainder(a, b) {
  const degree = value => 31 - Math.clz32(value);
  while (a !== 0 && degree(a) >= degree(b)) a ^= b << (degree(a) - degree(b));
  return a;
}

/**
 * @param {number} a Polynomial bitset.
 * @param {number} b Polynomial bitset.
 * @returns {number} Monic polynomial GCD over GF(2).
 */
function binaryGcd(a, b) {
  while (b !== 0) [a, b] = [b, binaryRemainder(a, b)];
  return a;
}

/**
 * Degree-eight Rabin irreducibility test over GF(2).
 * @param {number} polynomial Odd 9-bit polynomial.
 * @returns {boolean} True only for irreducible moduli.
 */
function irreducibleEight(polynomial) {
  let value = 2;
  for (let n = 1; n <= 8; n++) {
    value = gf256Multiply(value, value, polynomial);
    if (n <= 4 && binaryGcd(value ^ 2, polynomial) !== 1) return false;
  }
  return value === 2;
}

/**
 * Full-pivot-index Gaussian elimination over GF(256).
 * @param {number[][]} source M-by-eight byte matrix.
 * @param {number} polynomial Degree-eight field modulus.
 * @param {boolean} center Subtract the first source row (same as XOR).
 * @returns {{rank:number,pivots:number[]}} Exact column rank.
 */
function rank256(source, polynomial, center = false) {
  const rows = source.map(row => row.slice());
  if (center) {
    const origin = rows[0].slice();
    for (const row of rows) for (let c = 0; c < 8; c++) row[c] ^= origin[c];
  }
  let rank = 0;
  const pivots = [];
  for (let c = 0; c < 8 && rank < rows.length; c++) {
    let pivot = rank;
    while (pivot < rows.length && rows[pivot][c] === 0) pivot++;
    if (pivot === rows.length) continue;
    [rows[pivot], rows[rank]] = [rows[rank], rows[pivot]];
    const inverse = gf256Power(rows[rank][c], 254, polynomial);
    for (let j = c; j < 8; j++) {
      rows[rank][j] = gf256Multiply(rows[rank][j], inverse, polynomial);
    }
    for (let i = 0; i < rows.length; i++) {
      if (i === rank || rows[i][c] === 0) continue;
      const factor = rows[i][c];
      for (let j = c; j < 8; j++) {
        rows[i][j] ^= gf256Multiply(factor, rows[rank][j], polynomial);
      }
    }
    pivots.push(c);
    rank++;
  }
  return {rank, pivots};
}

/**
 * Exact Gaussian elimination over any prime modulus.
 * @param {number[][]} source M-by-eight integer matrix.
 * @param {number} prime Prime modulus (including original sexagesimal factors 2,3,5).
 * @param {boolean} center Subtract first row modulo prime.
 * @returns {{rank:number,pivots:number[]}} Column rank.
 */
function rankPrime(source, prime, center = false) {
  const rows = source.map(row => row.map(v => v % prime));
  if (center) {
    const origin = rows[0].slice();
    for (const row of rows) for (let c = 0; c < 8; c++) {
      row[c] = (row[c] - origin[c] + prime) % prime;
    }
  }
  let rank = 0;
  const pivots = [];
  for (let c = 0; c < 8 && rank < rows.length; c++) {
    let pivot = rank;
    while (pivot < rows.length && rows[pivot][c] === 0) pivot++;
    if (pivot === rows.length) continue;
    [rows[pivot], rows[rank]] = [rows[rank], rows[pivot]];
    const inverse = Array.from({length: prime - 1}, (_, i) => i + 1)
      .find(value => (rows[rank][c] * value) % prime === 1);
    assert.notEqual(inverse, undefined);
    for (let j = c; j < 8; j++) rows[rank][j] = rows[rank][j] * inverse % prime;
    for (let i = 0; i < rows.length; i++) {
      if (i === rank || rows[i][c] === 0) continue;
      const factor = rows[i][c];
      for (let j = c; j < 8; j++) {
        rows[i][j] = (rows[i][j] - factor * rows[rank][j] % prime + prime) % prime;
      }
    }
    pivots.push(c);
    rank++;
  }
  return {rank, pivots};
}

/**
 * Build a true shared five-data/three-parity linear code from fixed source data.
 * @param {number[][]} rows Original 32x8 source-byte matrix.
 * @param {number} polynomial GF256 polynomial.
 * @returns {number[][]} Source-shaped 32x8 five-dimensional codeword matrix.
 */
function plantGF256(rows, polynomial) {
  return rows.map(source => {
    const [a, b, c, d, e] = source;
    return [a, b, c, d, e,
      gf256Multiply(3, a, polynomial) ^ gf256Multiply(5, c, polynomial),
      gf256Multiply(7, b, polynomial) ^ e,
      gf256Multiply(11, d, polynomial) ^ gf256Multiply(13, e, polynomial)];
  });
}

/**
 * Native GP29 five-data/three-parity positive.
 * @param {number[][]} rows Source table.
 * @returns {number[][]} Exactly rank-five GF29 code matrix.
 */
function plantGF29(rows) {
  return rows.map(source => {
    const [a, b, c, d, e] = source.map(value => value % 29);
    return [a, b, c, d, e, (3 * a + 5 * c) % 29,
      (7 * b + e) % 29, (11 * d + 13 * e) % 29];
  });
}

function main() {
  const original = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
    "resources", "liber-primus", "base60-grid.json"), "utf8"));
  const matrix = original.byte_rows;
  assert.equal(matrix.length, 32);
  assert(matrix.every(row => row.length === 8
    && row.every(byte => Number.isInteger(byte) && byte >= 0 && byte < 256)));
  assert.deepEqual(matrix[13], [122, 63, 31, 218, 14, 184, 32, 115]);
  assert.deepEqual(matrix[31], [113, 158, 172, 230, 180, 36, 189, 80]);
  assert.equal(matrix.flat().reduce((acc, byte) => acc ^ byte, 0), 0x94);

  const moduli = [];
  for (let polynomial = 0x101; polynomial < 0x200; polynomial += 2) {
    if (irreducibleEight(polynomial)) moduli.push(polynomial);
  }
  assert.equal(moduli.length, 30);
  assert(moduli.includes(0x11b) && moduli.includes(0x11d));

  for (const polynomial of moduli) {
    const linear = rank256(matrix, polynomial);
    const affine = rank256(matrix, polynomial, true);
    assert.equal(linear.rank, 8);
    assert.equal(affine.rank, 8);
    assert.deepEqual(linear.pivots, [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(affine.pivots, [0, 1, 2, 3, 4, 5, 6, 7]);

    const planted = plantGF256(matrix, polynomial);
    assert.equal(rank256(planted, polynomial).rank, 5);
    assert.equal(rank256(planted, polynomial, true).rank, 5);
    planted[0][7] ^= 1;
    assert.equal(rank256(planted, polynomial).rank, 6);
  }
  const native = rankPrime(matrix, 29);
  const nativeAffine = rankPrime(matrix, 29, true);
  assert.equal(native.rank, 8);
  assert.equal(nativeAffine.rank, 8);
  assert.deepEqual(native.pivots, [0, 1, 2, 3, 4, 5, 6, 7]);

  const planted29 = plantGF29(matrix);
  assert.equal(rankPrime(planted29, 29).rank, 5);
  assert.equal(rankPrime(planted29, 29, true).rank, 5);
  planted29[0][7] = (planted29[0][7] + 1) % 29;
  assert.equal(rankPrime(planted29, 29).rank, 6);

  for (const prime of [2, 3, 5]) {
    assert.equal(rankPrime(matrix, prime).rank, 8);
    assert.equal(rankPrime(matrix, prime, true).rank, 8);
    const example = matrix.map(row => {
      const [a, b, c, d, e] = row.map(byte => byte % prime);
      return [a, b, c, d, e,
        (a + c) % prime, (b + d) % prime, (c + e) % prime];
    });
    assert.equal(rankPrime(example, prime).rank, 5);
    assert.equal(rankPrime(example, prime, true).rank, 5);
    example[0][7] = (example[0][7] + 1) % prime;
    assert.equal(rankPrime(example, prime).rank, 6);
  }

  console.log("Source: 32 rows x 8 base60 bytes; exact byte XOR = 0x94");
  console.log("Independent visual cue: three filled left dots / five filled right dots");
  console.log("GF256: 30/30 irreducible 8-bit field polynomials give rank 8, centered rank 8");
  console.log("GF256 moduli:", moduli.map(v => v.toString(16)).join(","));
  console.log("Base60 ring factors modulo 2, 3 and 5: rank 8, centered rank 8");
  console.log("GF29 (original byte residues): rank 8, centered rank 8");
  console.log("Positive native (8,5) codes: rank 5; one corrupted parity: rank 6");
  console.log("PASS: original grid excludes every shared row-local affine (8,5) linear code",
    "over 30 GF256 representations, native GP29 and sexagesimal mod 2/3/5.");
  console.log("No original plaintext or hidden source-selected parity grammar recovered.");
}

main();
