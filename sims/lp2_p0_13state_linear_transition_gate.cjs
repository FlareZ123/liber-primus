#!/usr/bin/env node
"use strict";

// Source-locked test of a 13-dimensional linear state transition on the
// p0 red-title + (p0-p2 black stream minus first black TH) 55x13 opening.
const fs = require("fs");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const P = 29;
const mod = (x) => ((x % P) + P) % P;

function powMod(a, n) {
  let out = 1;
  a = mod(a);
  while (n > 0) {
    if (n & 1) out = mod(out * a);
    a = mod(a * a);
    n >>= 1;
  }
  return out;
}

function invertMatrixMod29(input) {
  const n = input.length;
  if (!n || input.some((r) => r.length !== n)) throw new Error("expected square matrix");
  const m = input.map((r, i) => [
    ...r.map(mod),
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  let determinant = 1;

  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && m[pivot][col] === 0) pivot++;
    if (pivot === n) return { rank: col, inverse: null, determinant: 0 };

    if (pivot !== col) {
      [m[pivot], m[col]] = [m[col], m[pivot]];
      determinant = mod(-determinant);
    }

    const pivotValue = m[col][col];
    determinant = mod(determinant * pivotValue);
    const inversePivot = powMod(pivotValue, P - 2);
    for (let j = 0; j < 2 * n; j++) m[col][j] = mod(m[col][j] * inversePivot);

    for (let i = 0; i < n; i++) {
      if (i === col) continue;
      const factor = m[i][col];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * n; j++) {
        m[i][j] = mod(m[i][j] - factor * m[col][j]);
      }
    }
  }

  return { rank: n, inverse: m.map((r) => r.slice(n)), determinant };
}

function multiplyRowByMatrix(row, matrix) {
  return matrix[0].map((_, j) =>
    mod(row.reduce((sum, value, k) => sum + value * matrix[k][j], 0))
  );
}

const pages = corpus.pages.map((p) => p.indices);
const title = pages[0].slice(0, 13);
const opening = pages.slice(0, 3).flat();
const black = opening.slice(13);
const firstBlack = black[0];
const payload = black.slice(1);

if (title.length !== 13 || black.length !== 716 || payload.length !== 715 || firstBlack !== 2) {
  throw new Error("original p0-p2 source geometry changed; inspect source before interpreting this test");
}

const rows = Array.from({ length: 55 }, (_, i) => payload.slice(i * 13, (i + 1) * 13));
if (rows.some((r) => r.length !== 13)) throw new Error("expected 55 complete 13-symbol rows");
const states = [title, ...rows];
if (states.length !== 56) throw new Error("expected title seed plus 55 states");

// Fit row-vector state[t+1] = state[t] * A from the first 13 transitions.
const X = states.slice(0, 13);
const Y = states.slice(1, 14);
const xInverse = invertMatrixMod29(X);
if (!xInverse.inverse) throw new Error("training state matrix is singular");

const A = xInverse.inverse.map((row) =>
  Array.from({ length: 13 }, (_, j) =>
    mod(row.reduce((sum, value, k) => sum + value * Y[k][j], 0))
  )
);

let trainingMismatches = 0;
for (let t = 0; t < 13; t++) {
  const predicted = multiplyRowByMatrix(states[t], A);
  trainingMismatches += predicted.reduce((n, v, j) => n + (v === states[t + 1][j] ? 0 : 1), 0);
}

const aInverse = invertMatrixMod29(A);
let holdoutMismatches = 0;
let holdoutExactTransitions = 0;
let firstFailure = null;
for (let t = 13; t < 55; t++) {
  const predicted = multiplyRowByMatrix(states[t], A);
  const expected = states[t + 1];
  const mismatches = predicted.reduce((n, v, j) => n + (v === expected[j] ? 0 : 1), 0);
  holdoutMismatches += mismatches;
  if (mismatches === 0) holdoutExactTransitions++;
  if (!firstFailure && mismatches) {
    firstFailure = { transition: t, mismatches, expected, predicted };
  }
}

const result = {
  hypothesis: "one fixed reversible GF(29) linear map advances the 13-symbol red title through 55 successive 13-symbol states",
  source_geometry: {
    red_title_length: title.length,
    first_black_rune_index: firstBlack,
    black_opening_length: black.length,
    excluded_first_black_sentinel: true,
    payload_length: payload.length,
    rows: rows.length,
    columns: 13,
    states_including_title_seed: states.length,
  },
  fit: {
    training_transitions: 13,
    training_state_rank: xInverse.rank,
    training_state_determinant: xInverse.determinant,
    training_mismatches: trainingMismatches,
    transition_matrix_determinant: aInverse.determinant,
    transition_matrix_invertible: !!aInverse.inverse,
  },
  holdout: {
    transitions: 42,
    symbols: 546,
    exact_transitions: holdoutExactTransitions,
    matching_symbols: 546 - holdoutMismatches,
    mismatching_symbols: holdoutMismatches,
    random_match_expectation: 546 / 29,
    first_failure: firstFailure,
  },
  transition_matrix: A,
};

console.log(JSON.stringify(result, null, 2));
