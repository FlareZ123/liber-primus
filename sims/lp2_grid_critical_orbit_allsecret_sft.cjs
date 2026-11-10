'use strict';
/**
 * Exact original-input discriminator for the source-marked 13/24
 * polynomial-evaluation state and EVERY stationary per-state GP29 bijection.
 *
 * State: s_(i+1) = P(s_i) over GF29, with P the unchanged 256-byte grid
 * polynomial. Initial s=13 (13 dots) or s=24 (oversized Ac).
 * Clock: book-continuous or physical-page reset.
 * Emission: arbitrary secret permutation of the 29 original GP symbols
 * at each current state. Within each state, the pairwise coincidence
 * statistic is invariant to the secret permutation.
 *
 * A separate native-GP Shakespeare text supplies 12 nonoverlapping,
 * 12,956-rune source-length controls, and an exact secret-permutation
 * positive plant proves the invariant is observable under encryption.
 *
 * Run: node sims/lp2_grid_critical_orbit_allsecret_sft.cjs
 * Exclusion is conditional on this autonomous state/direct GP architecture.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const pageArrays = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
const original = pageArrays.flat();
assert.equal(original.length, 12956);
const N = original.length;
assert.equal(grid.bytes.length, 256);
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} x */
function polynomial(x) {
  let value = 0;
  for (const byte of grid.bytes) value = mod(value * x + byte);
  return value;
}
const transition = Array.from({ length: 29 }, (_, x) => polynomial(x));
assert.deepEqual(transition.slice(0, 5), [22, 4, 12, 3, 23]);
function orbit(seed, n) {
  let state = seed;
  return Array.from({ length: n }, () => {
    const old = state;
    state = transition[state];
    return old;
  });
}
assert.deepEqual(orbit(13, 8), [13, 8, 27, 17, 15, 27, 17, 15]);
assert.deepEqual(orbit(24, 9), [24, 0, 22, 9, 17, 15, 27, 17, 15]);

/** @param {number} seed @param {boolean} reset */
function stateSchedule(seed, reset) {
  const out = [];
  let state = seed;
  for (const page of pageArrays) {
    if (reset) state = seed;
    for (let i = 0; i < page.length; i++) {
      out.push(state);
      state = transition[state];
    }
  }
  assert.equal(out.length, N);
  return out;
}
/** @param {ArrayLike<number>} data @param {number[]} states */
function coincidence(data, states) {
  const hist = Array.from({ length: 29 }, () => new Uint32Array(29));
  const size = new Uint32Array(29);
  assert.equal(data.length, states.length);
  for (let i = 0; i < data.length; i++) {
    const state = states[i];
    const symbol = data[i];
    hist[state][symbol]++;
    size[state]++;
  }
  // Only >=100 observations are compared, to exclude singleton
  // transient states in the continuous-clock models.
  let coincident = 0, allPairs = 0;
  const groups = [];
  for (let state = 0; state < 29; state++) {
    const n = size[state];
    if (n < 100) continue;
    const equalPairs = hist[state].reduce((sum, v) => sum + v * (v - 1), 0);
    coincident += equalPairs;
    allPairs += n * (n - 1);
    groups.push({ state, count: n, ioc: equalPairs / (n * (n - 1)) });
  }
  return { value: coincident / allPairs, groups };
}

/** Existing repository-native GP normalization for Shakespeare controls.
 * @param {string} text
 * @returns {number[]}
 */
function gpEncode(text) {
  const map = new Map(corpus.translit.map((s, i) => [s, i]));
  const output = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (map.has(pair)) {
        output.push(map.get(pair));
        i += 2;
      } else {
        if (map.has(word[i])) output.push(map.get(word[i]));
        i++;
      }
    }
  }
  return output;
}
const gp = gpEncode(fs.readFileSync(
  path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8'));
assert(gp.length >= 12 * N);
const windows = Array.from({ length: 12 }, (_, i) =>
  gp.slice(i * N, (i + 1) * N));

/** Arbitrary but deterministic per-state secret permutations.
 * @param {number} state
 * @returns {number[]}
 */
function secretPermutation(state) {
  const alphabet = Array.from({ length: 29 }, (_, i) => i);
  let x = (Math.imul(state + 1, 0x9e3779b9) +
    grid.bytes[(state * 7) % 256]) >>> 0;
  for (let i = 28; i > 0; i--) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    const j = (x >>> 0) % (i + 1);
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  assert.equal(new Set(alphabet).size, 29);
  return alphabet;
}
const secret = Array.from({ length: 29 }, (_, state) => secretPermutation(state));
const rows = [];
for (const seed of [13, 24]) {
  for (const reset of [false, true]) {
    const schedule = stateSchedule(seed, reset);
    const originalResult = coincidence(original, schedule);
    const controls = windows.map(data => coincidence(data, schedule).value);
    const nativeMinimum = Math.min(...controls);
    const nativeMaximum = Math.max(...controls);
    assert(originalResult.value < nativeMinimum);
    const native = windows[0];
    const plant = native.map((symbol, i) => secret[schedule[i]][symbol]);
    const recovered = plant.map((cipher, i) =>
      secret[schedule[i]].indexOf(cipher));
    assert.deepEqual(recovered, native);
    const plantedStat = coincidence(plant, schedule).value;
    const nativeStat = coincidence(native, schedule).value;
    assert(Math.abs(plantedStat - nativeStat) < 1e-14);
    rows.push({
      seed, clock: reset ? 'physical-page-reset' : 'book-continuous',
      originalIoc: originalResult.value,
      originalGroups: originalResult.groups,
      nativeControlMin: nativeMinimum,
      nativeControlMax: nativeMaximum,
      plantIoc: plantedStat,
      exactPlantRecovery: true
    });
  }
}
console.log(JSON.stringify({
  sourceTransition: transition,
  seed13Orbit: orbit(13, 8),
  seed24Orbit: orbit(24, 9),
  originalRunes: N, nativeWindows: windows.length,
  rows, recoveredOriginalPlaintext: false,
  scope: 'all stationary GP29 per-state bijections under autonomous P iteration'
}, null, 2));
