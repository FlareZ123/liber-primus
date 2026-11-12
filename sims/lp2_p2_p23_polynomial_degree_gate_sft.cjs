/**
 * Polynomial p2 vs p23-26 all-secret GF29 cross-stream feasibility boundary.
 *
 * Run: node sims/lp2_p2_p23_polynomial_degree_gate_sft.cjs
 * Requires only Node.js builtins and canonical repository LP2 corpus.
 *
 * Original source: p2 201 runes, p23 red16 excluded plus p24-26 1005 runes.
 * Either 201 quintets or five 201-rune blocks, each optionally reversed.
 * Candidate: Y_i = arbitrary_output_permutation(F(X_i)), where F is any
 * total-degree-d polynomial in the five original input GP29 symbol labels.
 * Every equality of Y imposes a linear constraint on polynomial coefficients
 * independent of the secret output permutation.
 *
 * Copyright: this file and the accompanying research are original.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const raw = fs.readFileSync(sourcePath);
const gitBlob = crypto.createHash('sha1')
  .update(Buffer.from('blob ' + raw.length + '\0'))
  .update(raw).digest('hex');
assert.equal(gitBlob, '054f2a0f780b7d46901acbe3d9bf4f0ac1801165');
const corpus = JSON.parse(raw.toString('utf8'));
const pages = new Map(corpus.pages.map(page => [page.page, page.indices]));
const target = pages.get(2);
const source = [
  ...pages.get(23).slice(16), ...pages.get(24),
  ...pages.get(25), ...pages.get(26)
];
assert.deepEqual(
  [target.length, pages.get(23).length, pages.get(24).length,
    pages.get(25).length, pages.get(26).length],
  [201, 213, 270, 273, 265]
);
assert.equal(source.length, 1005);
assert.equal(new Set(target).size, 29);

const inv = new Uint8Array(29);
for (let a = 1; a < 29; a++) {
  for (let b = 1; b < 29; b++) {
    if ((a * b) % 29 === 1) inv[a] = b;
  }
}

/**
 * Enumerate all five-variable monomials of total degree at most d.
 *
 * @param {number} degree
 * @returns {number[][]}
 */
function monomials(degree) {
  const out = [];
  /** @param {number} axis @param {number} remaining @param {number[]} es */
  function enumerate(axis, remaining, es) {
    if (axis === 5) {
      out.push(es);
      return;
    }
    for (let e = 0; e <= remaining; e++) {
      enumerate(axis + 1, remaining - e, [...es, e]);
    }
  }
  enumerate(0, degree, []);
  return out;
}

/**
 * @param {number[]} values Five GP29 original source rune indices
 * @param {number[][]} terms
 * @returns {Uint8Array}
 */
function evaluate(values, terms) {
  const powers = values.map(value => {
    const row = new Uint8Array(6);
    row[0] = 1;
    for (let e = 1; e < 6; e++) row[e] = (row[e - 1] * value) % 29;
    return row;
  });
  return Uint8Array.from(terms.map(exponents =>
    exponents.reduce((product, exponent, k) =>
      product * powers[k][exponent] % 29, 1)));
}

/**
 * @param {number[]} orderedSource
 * @param {'quintet'|'strand'} layout
 * @returns {number[][]}
 */
function sourceRows(orderedSource, layout) {
  return Array.from({length: 201}, (_, j) =>
    Array.from({length: 5}, (_, k) =>
      orderedSource[layout === 'quintet' ? 5 * j + k : 201 * k + j]));
}

/**
 * @param {Uint8Array[]} evaluated
 * @param {number[]} outputs
 * @returns {Uint8Array[]}
 */
function equalityConstraints(evaluated, outputs) {
  const first = new Map();
  const rows = [];
  for (let j = 0; j < outputs.length; j++) {
    const y = outputs[j];
    if (!first.has(y)) {
      first.set(y, j);
      continue;
    }
    const i = first.get(y);
    rows.push(Uint8Array.from(evaluated[j].map((v, col) =>
      (v - evaluated[i][col] + 29) % 29)));
  }
  return rows;
}

/**
 * Exact finite-field rank, independent of unknown key values.
 *
 * @param {Uint8Array[]} inputRows
 * @returns {number}
 */
function rank29(inputRows) {
  const rows = inputRows.map(row => Uint8Array.from(row));
  const width = rows[0].length;
  let rank = 0;
  for (let col = 0; col < width && rank < rows.length; col++) {
    let pivot = rank;
    while (pivot < rows.length && rows[pivot][col] === 0) pivot++;
    if (pivot === rows.length) continue;
    [rows[pivot], rows[rank]] = [rows[rank], rows[pivot]];
    const factor = inv[rows[rank][col]];
    for (let j = col; j < width; j++) {
      rows[rank][j] = rows[rank][j] * factor % 29;
    }
    for (let i = rank + 1; i < rows.length; i++) {
      const f = rows[i][col];
      if (f === 0) continue;
      for (let j = col; j < width; j++) {
        rows[i][j] = (rows[i][j] - f * rows[rank][j] + 29 * 29) % 29;
      }
    }
    rank++;
  }
  return rank;
}

/**
 * Produce one actual degree<=5 interpolation certificate through arbitrary
 * original ciphertext output labels. Free coefficients are fixed to zero.
 * This is a counterexample to treating a flexible fit as an authentic key.
 *
 * @param {Uint8Array[]} values 201 by 252 Vandermonde matrix
 * @param {number[]} y 201 original p2 GP29 labels
 * @returns {number[]} 252 coefficients
 */
function interpolate(values, y) {
  const n = values[0].length;
  const a = values.map((r, i) => Uint8Array.from([...r, y[i]]));
  const pivotColumns = [];
  let row = 0;
  for (let col = 0; col < n && row < a.length; col++) {
    let candidate = row;
    while (candidate < a.length && a[candidate][col] === 0) candidate++;
    if (candidate === a.length) continue;
    [a[candidate], a[row]] = [a[row], a[candidate]];
    const factor = inv[a[row][col]];
    for (let j = col; j <= n; j++) {
      a[row][j] = a[row][j] * factor % 29;
    }
    for (let k = row + 1; k < a.length; k++) {
      const f = a[k][col];
      if (f === 0) continue;
      for (let j = col; j <= n; j++) {
        a[k][j] = (a[k][j] - f * a[row][j] + 29 * 29) % 29;
      }
    }
    pivotColumns.push(col);
    row++;
  }
  assert.equal(row, y.length, 'All 201 independent input rows must be interpolable');
  const coeff = Array(n).fill(0);
  for (let i = row - 1; i >= 0; i--) {
    const col = pivotColumns[i];
    let rhs = a[i][n];
    for (let j = col + 1; j < n; j++) rhs = (rhs - a[i][j] * coeff[j] + 29 * 29) % 29;
    coeff[col] = rhs;
  }
  for (let i = 0; i < values.length; i++) {
    const reconstructed = values[i].reduce(
      (sum, v, j) => (sum + v * coeff[j]) % 29, 0);
    assert.equal(reconstructed, y[i], 'Degree-five polynomial fits original exactly');
  }
  return coeff;
}

/**
 * Degree-4 legitimate original-input plant with an arbitrary secret
 * output-alphabet permutation, using every one of the actual 201 source rows.
 *
 * @param {number[][]} x
 * @returns {number[]}
 */
function degreeFourPositivePlant(x) {
  const output = x.map(v =>
    (7 * ((v[0] * v[1] * v[2] * v[3] +
      2 * v[4] * v[4] + 7 * v[2] + 3) % 29) + 11) % 29);
  assert.equal(new Set(output).size, 29);
  const decode = output.map(z => (z - 11 + 29) * inv[7] % 29);
  const native = x.map(v =>
    (v[0] * v[1] * v[2] * v[3] + 2 * v[4] * v[4] + 7 * v[2] + 3) % 29);
  assert.deepEqual(decode, native);
  return output;
}

console.log('[input]', JSON.stringify({
  pinnedGitBlob: gitBlob, p2Runes: target.length,
  sourcePostRed16: source.length, p2Distinct: new Set(target).size
}));
let combos = 0;
const termsByDegree = new Map([1,2,3,4,5].map(d => [d, monomials(d)]));
assert.deepEqual([1,2,3,4,5].map(d => termsByDegree.get(d).length),
  [6,21,56,126,252]);

for (const layout of ['quintet', 'strand']) {
  for (const reverseSource of [false, true]) {
    const inputs = sourceRows(reverseSource ? source.slice().reverse() : source, layout);
    const evaluations = new Map([...termsByDegree.entries()].map(([degree, terms]) =>
      [degree, inputs.map(input => evaluate(input, terms))]));
    assert.equal(rank29(evaluations.get(4)), 126);
    assert.equal(rank29(evaluations.get(5)), 201);

    // Native positive plant works on *these same original input runes*.
    const plant = degreeFourPositivePlant(inputs);
    const plantRank = rank29(equalityConstraints(evaluations.get(4), plant));
    assert.equal(plantRank, 124);

    for (const reverseTarget of [false, true]) {
      const originalY = reverseTarget ? target.slice().reverse() : target;
      const result = {layout, reverseSource, reverseTarget, constraints: 172,
        degreeToRank: {}};
      for (let degree = 1; degree <= 5; degree++) {
        const equations = equalityConstraints(evaluations.get(degree), originalY);
        assert.equal(equations.length, 172);
        const r = rank29(equations);
        assert.equal(r, degree < 5 ?
          termsByDegree.get(degree).length - 1 : 172);
        result.degreeToRank[degree] = r;
      }
      console.log('[original]', JSON.stringify(result));
      combos++;
    }

    if (!reverseSource) {
      const fit = interpolate(evaluations.get(5), target);
      console.log('[degree-five-exact-overfit]', JSON.stringify({
        layout, coefficients: fit.length,
        nonzero: fit.filter(x => x !== 0).length, recovered: target.length
      }));
    }
    console.log('[degree-four-positive-control]', layout,
      'reverseSource', reverseSource, 'rank', plantRank,
      'secretOutputPermutationRecovered', plant.length);
  }
}
assert.equal(combos, 8);
console.log('[PASS] Every total-degree<=4 GF29 polynomial is constant on the original p2 output classes under both source layouts and all eight directions.');
console.log('[PASS] Degree-five can interpolate ALL original p2 labels exactly, so a degree-five fit by itself is non-evidence of historical decipherment.');
console.log('[SCOPE] Original GP input labels, stationary polynomial, and arbitrary bijective output alphabet; secret pre-input permutations, evolving state, other framing remain open.');
