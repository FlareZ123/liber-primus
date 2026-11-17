'use strict';

/**
 * Exact GP29 phase-300 key-invariant bound, even with ten independently
 * secret per-block Caesar rekeys over arbitrary 300 phase-wise permutations.
 *
 * Original source: LP2 p40..53 eight red heading runes + 3000 black
 * = 10 × 300. Independent source-native GP control: 300 Gibran and
 * 300 Emerson original-length 3000-rune windows.
 *
 * Windows 11, Node.js 22:
 *   node sims/lp2_floral_300phase_blockshift_allsecret_sft.cjs
 * This is a finite exclusion for this decoder architecture, not a source
 * instruction or a solved LP2 passage.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.join(__dirname, '..');

/** @param {string} name Repository-relative file name. @returns {string} File content. */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const full = gp.pages.filter((p) => p.page >= 40 && p.page <= 53)
  .flatMap((p) => p.indices);
const terminal = gp.pages.filter((p) => p.page >= 54 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(full.length, 3008);
assert.equal(terminal.length, 308);
const body = full.slice(8);
assert.equal(body.length, 3000);
assert.equal(terminal.slice(9).length, 299);
const B = 10;
const W = 300;
/** @param {number} x Any integer. @returns {number} Canonical GP29 index. */
const mod = (x) => ((x % 29) + 29) % 29;

/**
 * Pairwise GP29 difference histograms on corresponding source phases.
 * H[a][b][d] counts phases where block b minus block a equals d.
 * @param {number[]} text 3000 GP29 indices.
 * @returns {number[][][]} Ten by ten by29 histograms.
 */
function histograms(text) {
  assert.equal(text.length, 3000);
  const out = Array.from({ length: B }, () =>
    Array.from({ length: B }, () => Array(29).fill(0)));
  for (let a = 0; a < B; a += 1) {
    for (let b = a + 1; b < B; b += 1) {
      for (let i = 0; i < W; i += 1) {
        const d = mod(text[b * W + i] - text[a * W + i]);
        out[a][b][d] += 1;
      }
    }
  }
  return out;
}

/** @param {number[][][]} H Histograms.
 * @param {number[]} shift Ten per-block additive shifts.
 * @returns {number} Corrected block equality count, 45*300 pairs.
 */
function shiftedEquality(H, shift) {
  let total = 0;
  for (let a = 0; a < B; a += 1)
    for (let b = a + 1; b < B; b += 1)
      total += H[a][b][mod(shift[b] - shift[a])];
  return total;
}

/**
 * The edge-disjoint triangles below were frozen by source-only pack search.
 * Every edge (a,b) occurs in at most one triangle. For each triangle,
 * exact max over 29^2 relative shifts is <= the sum of its three separate
 * edge maxima. Subtracting the excess tightens the all-secret upper bound
 * without fitting unknown plaintext or assuming a per-phase permutation.
 */
const PACKING = [
  [0, 7, 8], [0, 1, 2], [0, 5, 9], [0, 3, 6],
  [1, 5, 6], [1, 7, 9], [1, 3, 8], [2, 8, 9],
  [2, 3, 5], [2, 6, 7], [3, 4, 7], [4, 6, 9],
  [4, 5, 8]
];

/** @param {number[][][]} H Original pairwise difference histograms.
 * @returns {{pairUpper:number,packingPenalty:number,rigorousUpper:number,penalties:number[]}}
 * Exact, certificate-verifiable upper bound for all 29^9 Caesar schedules.
 */
function certifiedUpper(H) {
  let pairUpper = 0;
  for (let a = 0; a < B; a += 1)
    for (let b = a + 1; b < B; b += 1)
      pairUpper += Math.max(...H[a][b]);
  const edges = new Set();
  const penalties = [];
  for (const [a, b, c] of PACKING) {
    assert.ok(a < b && b < c);
    for (const e of [`${a},${b}`, `${a},${c}`, `${b},${c}`]) {
      assert.ok(!edges.has(e), 'Triangle certificate reused an edge');
      edges.add(e);
    }
    const independent = Math.max(...H[a][b]) +
      Math.max(...H[a][c]) + Math.max(...H[b][c]);
    let maximum = 0;
    for (let x = 0; x < 29; x += 1) {
      for (let y = 0; y < 29; y += 1) {
        maximum = Math.max(maximum, H[a][b][x] + H[a][c][y] +
          H[b][c][mod(y - x)]);
      }
    }
    penalties.push(independent - maximum);
  }
  const packingPenalty = penalties.reduce((sum, n) => sum + n, 0);
  return { pairUpper, packingPenalty,
    rigorousUpper: pairUpper - packingPenalty, penalties };
}

/** @param {number[]} seq Source-native 3000 rune text. @returns {number} True aligned equality. */
function sameCount(seq) {
  return shiftedEquality(histograms(seq), Array(B).fill(0));
}
const observedH = histograms(body);
const original = certifiedUpper(observedH);
assert.deepEqual(original, {
  pairUpper: 784, packingPenalty: 65, rigorousUpper: 719,
  penalties: [5, 5, 6, 5, 6, 8, 4, 7, 9, 0, 5, 3, 2]
});
assert.equal(sameCount(body), 455);
const constructed = [0, 12, 19, 25, 28, 18, 22, 23, 25, 8];
assert.equal(shiftedEquality(observedH, constructed), 632);
assert.ok(original.rigorousUpper >= 632);

const sources = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 721],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 742]
];
const controls = {};
let gibran;
for (const [name, file, expectedMin] of sources) {
  const corpus = encodeSourceNativeGP(read(file));
  if (name === 'Gibran') gibran = corpus;
  const scored = [];
  for (let i = 0; i < 300; i += 1) {
    const start = (137 + 7919 * i) % (corpus.length - 3000);
    scored.push(sameCount(corpus.slice(start, start + 3000)));
  }
  const minimum = Math.min(...scored);
  assert.equal(minimum, expectedMin);
  assert.ok(minimum > original.rigorousUpper);
  controls[name] = {
    windows: scored.length, nativeEqualityMinimum: minimum,
    sourceWindowsExceedingEveryPossibleOriginalShift: 300
  };
}

// A genuinely reversible 300-phase, independently secret permutation cipher
// with *nonstationary* ten-block Caesar shifts. Positive plant is 3000 true
// source-native runes; no fitted key is used on the original LP2.
let seed = 0x3301a24c;
/** @returns {number} Seeded unsigned 32bit pseudorandom draw. */
function next32() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
}
const perm = Array.from({ length: W }, () => {
  const arr = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i -= 1) {
    const k = next32() % (i + 1);
    [arr[i], arr[k]] = [arr[k], arr[i]];
  }
  return arr;
});
const inv = perm.map((p) => {
  const result = Array(29);
  for (let i = 0; i < 29; i += 1) result[p[i]] = i;
  return result;
});
const native = gibran.slice(113, 3113);
assert.equal(native.length, 3000);
const encrypted = native.map((r, i) =>
  mod(perm[i % W][r] + constructed[Math.floor(i / W)]));
const recovered = encrypted.map((r, i) =>
  inv[i % W][mod(r - constructed[Math.floor(i / W)])]);
assert.deepEqual(recovered, native);
const nativeEquality = sameCount(native);
assert.equal(shiftedEquality(histograms(encrypted), constructed), nativeEquality);
assert.ok(certifiedUpper(histograms(encrypted)).rigorousUpper >= nativeEquality);
console.log(JSON.stringify({
  original: {
    physicalPages: '40..53', headingRunes: 8,
    blackRunes: 3000, blocks: 10, width: 300,
    baselineMatchedPairs: 455,
    exhibitedNineShiftScheduleMatchedPairs: 632,
    ...original
  },
  controls,
  positivePlant: {
    model: '300 arbitrary secret GP29 alphabets and ten independent Caesar offsets',
    sourceNativeRunesRecovered: 3000,
    nativeAlignedEquality: nativeEquality
  },
  decision: 'Exact upper 719 < all 600 native controls; no plaintext or key.'
}, null, 2));
