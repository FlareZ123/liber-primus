'use strict';

/**
 * Original LP2 period-eight all-secret plaintext-F GP29 cipher exclusion.
 * Windows Node22: node sims/lp2_allsecret_period8_ftransparent_exact_sft.cjs
 *
 * Search 29^8 keys exactly using source-safe single-digit and two-digit
 * feasibility sieves. Shared key; arbitrary phase and exact F decisions
 * independently on every rune-bearing page. No language model is used
 * to identify the feasible keys.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const pages = data.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const all = pages.flatMap((p) => p.indices);
const N = 8;
const INIT = (1 << N) - 1;
assert.equal(pages.length, 55);
assert.equal(all.length, 12956);
assert.equal(data.pages[57].indices.length, 95);
for (const v of all) assert.ok(Number.isInteger(v) && v >= 0 && v < 29);

/**
 * Exact F-bypass inverse, or a safe partial-key overapproximation.
 * -1 denotes an unknown key digit: at nonzero cipher, it never blocks.
 * Relaxed ciphertext F allows skip OR advance unconditionally.
 * Exact ciphertext F advances only when its active key shift is nonzero.
 * Starts in any of the eight phases.
 *
 * @param {readonly number[]} input
 * @param {readonly number[]} key
 * @param {boolean} relaxed
 * @returns {number} First impossible offset, or -1 when feasible.
 */
function firstImpossible(input, key, relaxed) {
  let states = INIT;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    let next = 0;
    for (let j = 0; j < N; j++) {
      if ((states & (1 << j)) === 0) continue;
      const k = key[j];
      const forward = 1 << ((j + 1) % N);
      if (c === 0) {
        next |= 1 << j;
        if (relaxed || k !== 0) next |= forward;
      } else if (k === -1 || k !== c) {
        next |= forward;
      }
    }
    states = next;
    if (states === 0) return i;
  }
  return -1;
}

/**
 * Any phase is permitted at every physical page start.
 * @param {readonly number[]} key
 * @param {boolean} relaxed
 */
function sourceFeasible(key, relaxed) {
  return pages.every((p) => firstImpossible(p.indices, key, relaxed) < 0);
}

const values = [0];
const excludedValues = [];
for (let v = 1; v <= 28; v++) {
  const partial = Array(N).fill(-1);
  partial[0] = v;
  if (sourceFeasible(partial, true)) values.push(v);
  else excludedValues.push(v);
}
assert.deepEqual(excludedValues, [5, 20]);
assert.equal(values.length, 27);

// Any complete valid key must pass the independently source-measured
// two-key-position necessary conditions. Rotating both positions and the
// free starting phase does not change feasibility. We only test
// separations 1 through 4, then derive 5 through 7 by transposition.
const V = values.length;
const compatible = Array.from({length: N},
  () => Array.from({length: V}, () => Array(V).fill(false)));
const compatiblePairCounts = [];
for (let delta = 1; delta <= 4; delta++) {
  let count = 0;
  for (let i = 0; i < V; i++) {
    for (let j = 0; j < V; j++) {
      const partial = Array(N).fill(-1);
      partial[0] = values[i];
      partial[delta] = values[j];
      const feasible = sourceFeasible(partial, true);
      compatible[delta][i][j] = feasible;
      if (feasible) count++;
    }
  }
  compatiblePairCounts.push(count);
}
for (let delta = 5; delta < N; delta++) {
  for (let i = 0; i < V; i++) {
    for (let j = 0; j < V; j++) {
      compatible[delta][i][j] = compatible[N - delta][j][i];
    }
  }
}
for (let i = 0; i < V; i++) for (let j = 0; j < V; j++) {
  assert.equal(compatible[4][i][j], compatible[4][j][i]);
}
assert.deepEqual(compatiblePairCounts, [322, 347, 336, 307]);

// Pairwise-compatible search includes EVERY complete exact-feasible key,
// even though the relaxed sieve admits hundreds of thousands of false
// positives. Only complete leaves are submitted to the exact F-clock.
const key = Array(N).fill(-1);
const ids = Array(N).fill(-1);
const nodes = Array(N + 1).fill(0);
const survivors = [];
let pairCompatibleLeaves = 0;

/** @param {number} depth */
function search(depth) {
  nodes[depth]++;
  if (depth === N) {
    pairCompatibleLeaves++;
    if (sourceFeasible(key, false)) survivors.push([...key]);
    return;
  }
  for (let i = 0; i < V; i++) {
    let legal = true;
    for (let j = 0; j < depth; j++) {
      if (!compatible[depth - j][ids[j]][i]) {
        legal = false;
        break;
      }
    }
    if (!legal) continue;
    key[depth] = values[i];
    ids[depth] = i;
    search(depth + 1);
  }
  key[depth] = -1;
  ids[depth] = -1;
}
search(0);

assert.deepEqual(nodes, [
  1, 27, 322, 2369, 11996, 44397, 137723, 376731, 908729,
]);
assert.equal(pairCompatibleLeaves, 908729);
assert.equal(survivors.length, 113);

const oneSlotValues = [3, 4, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 27];
let identities = 0;
for (const candidate of survivors) {
  const nz = candidate.filter((value) => value !== 0);
  if (nz.length === 0) {
    identities++;
    continue;
  }
  assert.equal(nz.length, 1);
  assert.ok(oneSlotValues.includes(nz[0]));
}
assert.equal(identities, 1);
for (const value of oneSlotValues) {
  assert.equal(survivors.filter((candidate) =>
    candidate.filter((v) => v !== 0).length === 1 &&
    candidate.includes(value)).length, N);
}

// A continuous book clock rejects every one-slot nonidentity surviving
// page-reset key; all eight rotations of a key have the same feasibility.
assert.equal(firstImpossible(all, Array(N).fill(0), false), -1);
const continuousFailures = [];
for (const value of oneSlotValues) {
  const candidate = [value, 0, 0, 0, 0, 0, 0, 0];
  const fail = firstImpossible(all, candidate, false);
  assert.ok(fail >= 0);
  continuousFailures.push({value, firstImpossibleAt: fail});
}

// Under a single nonzero slot among eight, at most ceil(pageLen/8)
// rune outputs can differ from the original ciphertext. Even an entirely
// unconstrained edit of that many runes cannot produce marginal entropy
// as low as the existing same-register native-English controls.
const maxEdits = pages.reduce(
  (n, p) => n + Math.ceil(p.indices.length / N), 0,
);
assert.equal(maxEdits, 1644);
const counts = Array(29).fill(0);
for (const v of all) counts[v]++;
const lowerCounts = [...counts];
const recipient = counts.indexOf(Math.max(...counts));
const donorOrder = counts.map((count, i) => ({count, i}))
  .filter(({i}) => i !== recipient)
  .sort((a, b) => a.count - b.count || a.i - b.i);
let remaining = maxEdits;
for (const {i} of donorOrder) {
  if (!remaining) break;
  const remove = Math.min(remaining, lowerCounts[i]);
  lowerCounts[i] -= remove;
  lowerCounts[recipient] += remove;
  remaining -= remove;
}
assert.equal(remaining, 0);

/** @param {readonly number[]} histogram */
function entropy(histogram) {
  const total = histogram.reduce((n, v) => n + v, 0);
  return -histogram.reduce((sum, v) => {
    if (!v) return sum;
    const p = v / total;
    return sum + p * Math.log2(p);
  }, 0);
}
assert.ok(Math.abs(entropy(counts) - 4.856503613708271) < 1e-12);
assert.ok(Math.abs(entropy(lowerCounts) - 4.474446375590346) < 1e-12);

// Native p57 GP rune plant checks the nontrivial F-transparent encoder:
// a plaintext F skips the key, exactly as historical solved p56.
const plain = data.pages[57].indices;
const plantKey = [3, 0, 4, 0, 8, 0, 0, 0];
let phase = 3;
let consumed = 0;
const plantedCipher = plain.map((v) => {
  if (v === 0) return 0;
  const result = (v + plantKey[phase]) % 29;
  phase = (phase + 1) % N;
  consumed++;
  return result;
});
assert.equal(plain.filter((v) => v === 0).length, 3);
assert.equal(consumed, 92);
assert.equal(firstImpossible(plantedCipher, plantKey, false), -1);

process.stdout.write(JSON.stringify({
  method: 'exhaustive GP29 period-eight F-clock, common key/page-reset phase',
  originalPages: pages.length,
  originalRunes: all.length,
  excludedSingleDigits: excludedValues,
  pairwiseCounts: compatiblePairCounts,
  nodes,
  exactTestedKeys: pairCompatibleLeaves,
  originalFeasibleKeys: survivors.length,
  originalFeasibleNonzeroValues: oneSlotValues,
  exactContinuousClockNonzeroFailures: continuousFailures,
  maximalRuneEdits: maxEdits,
  originalEntropy: entropy(counts),
  bestPossibleEntropyAfterEdits: entropy(lowerCounts),
  nativePlantFSkips: 3,
}, null, 2) + '\n');
