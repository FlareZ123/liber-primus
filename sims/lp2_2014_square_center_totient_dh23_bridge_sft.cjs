#!/usr/bin/env node
"use strict";

// Reproduce the retrospective 2014-square-centre / p28-DH23 / p0-marker
// arithmetic bridge. This tests exact arithmetic, not authorial intent.

const assert = require("node:assert/strict");

const MOD = 29;
const mod = (n) => ((n % MOD) + MOD) % MOD;
const H = (x, y) => [mod(x - y), mod(x + y)];

function phi(n) {
  let remaining = n;
  let result = n;
  for (let p = 2; p * p <= remaining; p += 1) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result -= result / p;
    }
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}
function permutations(values) {
  if (values.length <= 1) return [values.slice()];
  const out = [];
  values.forEach((v, i) => {
    const rest = values.slice(0, i).concat(values.slice(i + 1));
    for (const tail of permutations(rest)) out.push([v, ...tail]);
  });
  return out;
}

// Historical Stage 10 form order: 5x5/3301, 7x7/1033, 5x5/1033.
// The p55 source-object route independently encounters these centres in
// this same order: 809 -> 331 -> 91.
const squares = [
  { label: "5x5/3301", center: 809 },
  { label: "7x7/1033", center: 331 },
  { label: "5x5/1033", center: 91 },
];
const centers = squares.map((s) => s.center);
const phiValues = centers.map(phi);
const residues = phiValues.map(mod);

// Source-derived p28 DH23 state and q. The p28 NPA fragment's fixed outer-H
// output is [14,4], so q=4 is not fitted from the 2014 centres.
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const qFromNPA = H(9, 24)[1];
assert.equal(qFromNPA, 4);
const q = qFromNPA;

// The existing p0 marker key is independently recorded as [A-B,K-b,q].
const markerKey = [
  mod(state.A - state.B),
  mod(state.K - state.b),
  q,
];
assert.deepEqual(markerKey, [18, 16, 4]);

// Test the exact source-order prediction: phi(centres) mod 29 = [-q,B-A,-b].
const expectedResidues = [
  mod(-q),
  mod(state.B - state.A),
  mod(-state.b),
];
assert.deepEqual(phiValues, [808, 330, 72]);
assert.deepEqual(residues, [25, 11, 14]);
assert.deepEqual(residues, expectedResidues);

// Reconstruct the p0 marker key from the three residues and DH shared K:
// [r1,r2,r3]=[-q,B-A,-b] -> [-r2,K+r3,-r1]=[A-B,K-b,q].
const derivedMarkerKey = [
  mod(-residues[1]),
  mod(state.K + residues[2]),
  mod(-residues[0]),
];
assert.deepEqual(derivedMarkerKey, markerKey);

// The form/p55 order is the unique permutation matching the typed DH triple.
const permutationMatches = permutations(centers)
  .filter((order) => {
    const candidate = order.map((n) => mod(phi(n)));
    return candidate.every((v, i) => v === expectedResidues[i]);
  });
assert.equal(permutationMatches.length, 1);
assert.deepEqual(permutationMatches[0], centers);

console.log(JSON.stringify({
  source_order: squares,
  centers,
  phi_values: phiValues,
  phi_mod29: residues,
  p28_state: { ...state, q },
  expected_typed_residues: expectedResidues,
  marker_key_from_p0: markerKey,
  marker_key_reconstructed: derivedMarkerKey,
  unique_matching_center_order: permutationMatches,
}, null, 2));
