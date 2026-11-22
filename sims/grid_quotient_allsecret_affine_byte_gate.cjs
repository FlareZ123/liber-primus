'use strict';

/**
 * Source-locked 51 x 127 GF(29^2) block-byte capacity gate.
 *
 * Run: node sims/grid_quotient_allsecret_affine_byte_gate.cjs
 *
 * The two marked original red triads define u^2 = 8 + 3u and the factor
 * 15(X - 24)^2. Dividing the printed 256-byte polynomial (high degree first)
 * yields 254 field coefficients, paired into 127 nonzero field elements Q[j].
 * The unknown corpus has 2 + 51 * 127 * 2 runes; the first two are retained
 * as a header. The candidate encoder emits each byte as a field pair:
 *
 *   C[r,j] = Q[j]^(+1 or -1) * (L_r * B(byte) + beta_r)
 *
 * where B(byte) = (floor(byte / 29), byte % 29), and L_r is ANY invertible
 * F29-linear transformation (not merely multiplication by a field scalar).
 * beta_r is ANY row-local offset. Every row can have independent secrets.
 *
 * The necessary condition for a canonical byte is that one field coordinate
 * lies in 0..8; we deliberately allow all 9*29 = 261 pairs, rather than only
 * 256 real bytes. The first coordinate of every invertible F29-linear map is
 * a nonzero F29-linear functional. Multiplication by all 840 nonzero field
 * scalars enumerates all these functionals. An arbitrary offset can shift
 * their image, so search all 29 cyclic windows of nine residues. Any row
 * whose best possible count < 127 decisively rules out the complete model.
 *
 * This is a bounded original-cipher exclusion, not a plaintext recovery.
 */

const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');

const P = 29;
const ROWS = 51;
const COLS = 127;
const F = [15, 5, 27]; // high-degree-first 15X^2 + 5X + 27

/** @typedef {[number, number]} FPair */

/** @param {FPair} x @param {FPair} y @returns {FPair} */
function add(x, y) {
  return [(x[0] + y[0]) % P, (x[1] + y[1]) % P];
}

/** @param {FPair} x @param {FPair} y @returns {FPair} */
function subtract(x, y) {
  return [(x[0] - y[0] + P) % P, (x[1] - y[1] + P) % P];
}

/** @param {FPair} x @param {FPair} y @returns {FPair} */
function multiply(x, y) {
  return [(x[0] * y[0] + 8 * x[1] * y[1]) % P,
    (x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1]) % P];
}

/** @param {FPair} x @param {number} n @returns {FPair} */
function power(x, n) {
  /** @type {FPair} */
  let result = [1, 0];
  let factor = x;
  for (let exponent = n; exponent > 0; exponent = Math.floor(exponent / 2)) {
    if (exponent % 2) result = multiply(result, factor);
    factor = multiply(factor, factor);
  }
  return result;
}

/** @param {FPair} x @returns {FPair} */
function inverse(x) {
  assert(x[0] !== 0 || x[1] !== 0);
  return power(x, 839);
}

/** @returns {FPair[]} */
function quotientPairs() {
  assert.equal(grid.bytes.length, 256);
  const rest = grid.bytes.map(v => v % P);
  const quotient = [];
  for (let i = 0; i < 254; i++) {
    const value = (rest[i] * 2) % P; // 15^-1 in F29 is 2
    quotient.push(value);
    for (let j = 0; j < 3; j++) {
      rest[i + j] = (rest[i + j] - value * F[j] + P * 30) % P;
    }
  }
  assert.deepEqual(rest.slice(254), [0, 0]);
  assert.equal(quotient[0], 0);
  const pairs = [];
  for (let i = 0; i < 254; i += 2) pairs.push([quotient[i], quotient[i + 1]]);
  assert.equal(pairs.length, COLS);
  assert(pairs.every(v => v[0] !== 0 || v[1] !== 0));
  return pairs;
}

/** @returns {FPair[][]} */
function ciphertextRows() {
  const original = corpus.pages
    .filter(page => page.page <= 55)
    .flatMap(page => page.indices);
  assert.equal(original.length, 12956);
  assert.deepEqual(original.slice(0, 2), [15, 8]);
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let j = 0; j < COLS; j++) {
      const start = 2 + 2 * (COLS * r + j);
      row.push([original[start], original[start + 1]]);
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Maximal number of candidate bytes in every row, allowing all secret
 * affine GL2(F29) transforms and row offsets. Every field key is nonzero.
 *
 * @param {FPair[][]} rows
 * @param {FPair[]} key
 * @returns {number[]}
 */
function allSecretCapacities(rows, key) {
  const inverses = [];
  for (let a = 0; a < P; a++) {
    for (let b = 0; b < P; b++) {
      if (a !== 0 || b !== 0) inverses.push(inverse([a, b]));
    }
  }
  assert.equal(inverses.length, 840);

  const maxima = [];
  for (const row of rows) {
    let maximum = 0;
    const unkeyed = row.map((pair, j) => multiply(pair, key[j]));
    for (const multiplier of inverses) {
      const histogram = Array(P).fill(0);
      for (const pair of unkeyed) {
        const projected = multiply(pair, multiplier)[0];
        histogram[projected]++;
      }

      // beta is unrestricted: allow every cyclic interval of 9 labels.
      let hits = histogram.slice(0, 9).reduce((a, b) => a + b, 0);
      for (let shift = 0; shift < P; shift++) {
        if (hits > maximum) maximum = hits;
        hits += histogram[(shift + 9) % P] - histogram[shift];
      }
    }
    maxima.push(maximum);
  }
  return maxima;
}

/** @param {FPair[]} q @param {boolean} useInverse @returns {FPair[][]} */
function plant(q, useInverse) {
  const red = ink.pages.find(page => page.page === 53)
    .red_spans.find(span => span.length === 51).runes;
  const rowKeys = Array.from(red, rune => corpus.runes.indexOf(rune));
  assert.equal(rowKeys.length, ROWS);
  assert(rowKeys.every(v => v >= 0 && v < P));

  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const alpha = power([0, 1], rowKeys[r] + 1);
    const alphaInverse = inverse(alpha);
    const beta = [rowKeys[r], 24];
    const row = [];
    for (let j = 0; j < COLS; j++) {
      const byte = (73 * (r * COLS + j) + 41) % 256;
      /** @type {FPair} */
      const plaintext = [Math.floor(byte / P), byte % P];
      const encoded = add(multiply(alpha, plaintext), beta);
      const cipher = multiply(useInverse ? inverse(q[j]) : q[j], encoded);
      const decoded = multiply(cipher, useInverse ? q[j] : inverse(q[j]));
      assert.deepEqual(multiply(alphaInverse, subtract(decoded, beta)), plaintext);
      row.push(cipher);
    }
    rows.push(row);
  }
  return rows;
}

/** @param {string} label @param {number[]} rowMaxima */
function report(label, rowMaxima) {
  const minimum = Math.min(...rowMaxima);
  const maximum = Math.max(...rowMaxima);
  const average = rowMaxima.reduce((a, b) => a + b, 0) / ROWS;
  const complete = rowMaxima.filter(v => v === COLS).length;
  console.log(label + ': row maxima min=' + minimum
    + ', max=' + maximum + ', mean=' + average.toFixed(8)
    + ', 127/127 rows=' + complete + '/51');
  return { minimum, maximum, average, complete };
}

function main() {
  const q = quotientPairs();
  const qInverse = q.map(inverse);
  const original = ciphertextRows();

  const c1 = report('Original C=Q*(L*byte+beta)',
    allSecretCapacities(original, qInverse));
  const c2 = report('Original C=Q^-1*(L*byte+beta)',
    allSecretCapacities(original, q));
  assert.deepEqual([c1.maximum, c2.maximum], [66, 64]);
  assert.equal(c1.complete + c2.complete, 0);

  const p1 = report('Source-native byte plant, Q encoder',
    allSecretCapacities(plant(q, false), qInverse));
  const p2 = report('Source-native byte plant, Q^-1 encoder',
    allSecretCapacities(plant(q, true), q));
  assert.equal(p1.complete, ROWS);
  assert.equal(p2.complete, ROWS);

  console.log('PASS: both original-source all-secret byte models excluded; '
    + 'both 6477-byte field plants recover and re-encode exactly.');
}

main();
