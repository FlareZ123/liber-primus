#!/usr/bin/env node
'use strict';

// Test p32 M7 powers as a source-selected p50 5x2 direction state
// on the original A81/B80 bookend pair. No free phase or coefficients.

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const full = corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices || []);
const A = full.slice(0, 6561);
const C = full.slice(6561);
const holes = new Set([2244, 2384, 2476, 2575, 2672]);
const positions = Array.from({ length: 6400 }, (_, index) => index).filter(index => !holes.has(index));

if (full.length !== 12956 || A.length !== 6561 || C.length !== 6395 ||
    positions.length !== C.length || grid.bytes.length !== 256) {
  throw new Error('Unexpected source dimensions');
}

function mul4(x) {
  const d = [0, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const t = x % 3;
    x = Math.floor(x / 3);
    d[i] += t;
    d[i + 1] += t;
  }
  const hi = d[4] % 3;
  for (let i = 0; i < 3; i++) d[i] -= hi;
  return d.slice(0, 4).reduce(
    (sum, value, index) => sum + (((value % 3) + 3) % 3) * (3 ** index), 0
  );
}

const g = [1];
while (g.length < 80) g.push(mul4(g[g.length - 1]));
if (new Set(g).size !== 80) throw new Error('GF81 generator is not order 80');

const keys = {
  field: positions.map(index => A[g[Math.floor(index / 80)] * 81 + g[index % 80]]),
  crop: positions.map(index => A[(Math.floor(index / 80) + 1) * 81 + (index % 80) + 1])
};

// Original physical global predecessor-rune clock; no phase fitting.
const phase = C.map((_, index) => grid.bytes[(6561 + index - 1) % 256]);

const mod = value => ((value % 29) + 29) % 29;
function multiplyMatrices(left, right) {
  return [
    [
      mod(left[0][0] * right[0][0] + left[0][1] * right[1][0]),
      mod(left[0][0] * right[0][1] + left[0][1] * right[1][1])
    ],
    [
      mod(left[1][0] * right[0][0] + left[1][1] * right[1][0]),
      mod(left[1][0] * right[0][1] + left[1][1] * right[1][1])
    ]
  ];
}
function matrixPower(matrix, exponent) {
  let result = [[1, 0], [0, 1]];
  let base = matrix;
  let n = exponent;
  while (n > 0) {
    if (n % 2) result = multiplyMatrices(result, base);
    base = multiplyMatrices(base, base);
    n = Math.floor(n / 2);
  }
  return result;
}

const M7 = [[14, 25], [25, 28]];
const determinant = mod(M7[0][0] * M7[1][1] - M7[0][1] * M7[1][0]);
if (determinant !== 28) throw new Error('Unexpected M7 determinant');
const inverse = [[1, 25], [25, 15]];
const forwardPowers = Array.from({ length: 5 }, (_, exponent) => matrixPower(M7, exponent));
const inversePowers = Array.from({ length: 5 }, (_, exponent) => matrixPower(inverse, exponent));

function entropy(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return -counts.reduce((sum, count) => {
    if (!count) return sum;
    const p = count / values.length;
    return sum + p * Math.log2(p);
  }, 0);
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

const results = [];
for (const [mapping, K] of Object.entries(keys)) {
  // Exact ten-state class used by the p50 pair-majorization gate:
  // z = 2*first_base60_digit + second_digit_parity selects M7^z.
  const tenStateP = [];
  const tenStateQ = [];
  for (let index = 0; index < C.length; index++) {
    const byte = phase[index];
    const state = 2 * Math.floor(byte / 60) + ((byte % 60) % 2);
    const matrix = matrixPower(M7, state);
    tenStateP.push(mod(matrix[0][0] * K[index] + matrix[0][1] * C[index]));
    tenStateQ.push(mod(matrix[1][0] * K[index] + matrix[1][1] * C[index]));
  }
  for (const [lane, values] of [['P', tenStateP], ['Q', tenStateQ]]) {
    const value = ioc(values);
    results.push({
      key_mapping: mapping,
      p50_state_mapping: 'z=2*first_digit+second_digit_parity; M7^z',
      plaintext_lane: lane,
      entropy_bits: entropy(values),
      ioc: value,
      normalized_ioc_29x: value * 29
    });
  }

  // Alternative literal reading: first digit is exponent, parity chooses
  // forward or inverse direction.
  for (const evenMeansForward of [true, false]) {
    const P = [];
    const Q = [];
    for (let index = 0; index < C.length; index++) {
      const byte = phase[index];
      const exponent = Math.floor(byte / 60);
      const parity = (byte % 60) % 2;
      const forward = (parity === 0) === evenMeansForward;
      const matrix = forward ? forwardPowers[exponent] : inversePowers[exponent];
      P.push(mod(matrix[0][0] * K[index] + matrix[0][1] * C[index]));
      Q.push(mod(matrix[1][0] * K[index] + matrix[1][1] * C[index]));
    }
    for (const [lane, values] of [['P', P], ['Q', Q]]) {
      const value = ioc(values);
      results.push({
        key_mapping: mapping,
        p50_state_mapping: 'first_digit exponent; second_digit parity selects direction',
        even_digit_parity_means_forward: evenMeansForward,
        plaintext_lane: lane,
        entropy_bits: entropy(values),
        ioc: value,
        normalized_ioc_29x: value * 29
      });
    }
  }
}

console.log(JSON.stringify({
  source: 'Original A81x81/B80x80 bookend, p50 predecessor-byte clock, p32 M7 pair matrix',
  source_dimensions: { full_runes: full.length, A_runes: A.length, B_runes: C.length, paired_positions: positions.length },
  p50_state: 'both z=2*d+parity and d-exponent/parity-direction mappings tested',
  matrix: M7,
  determinant_mod29: determinant,
  inverse: inverse,
  powers_M0_to_M4: forwardPowers,
  results
}, null, 2));
