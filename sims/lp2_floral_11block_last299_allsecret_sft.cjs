'use strict';

/**
 * An original-source two-floral-chapter 11-block theorem: allow 300
 * independent secret GP29 phase permutations and 11 arbitrary block Caesar
 * offsets, including a final short 299-rune block. No plaintext or key recovered.
 *
 * Windows 11 Node.js 22: node sims/lp2_floral_11block_last299_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} name Repository-relative filename. */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const first = gp.pages.filter((p) => p.page >= 40 && p.page <= 53)
  .flatMap((p) => p.indices);
const last = gp.pages.filter((p) => p.page >= 54 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(first.length, 3008);
assert.equal(last.length, 308);
const body = first.slice(8).concat(last.slice(9));
assert.equal(body.length, 3299);
const B = 11;
const W = 300;
const mod = (x) => ((x % 29) + 29) % 29;
const LEN = (i) => i === 10 ? 299 : 300;

/** @param {number[]} seq A complete 3299-GP29-symbol document.
 * @returns {number[][][]} Pairwise histogram H[a][b][delta].
 */
function pairHist(seq) {
  assert.equal(seq.length, 3299);
  const rows = Array.from({ length: B }, (_, b) =>
    seq.slice(b * W, b * W + LEN(b)));
  const H = Array.from({ length: B }, () =>
    Array.from({ length: B }, () => Array(29).fill(0)));
  for (let a = 0; a < B; a += 1)
    for (let b = a + 1; b < B; b += 1)
      for (let i = 0; i < Math.min(LEN(a), LEN(b)); i += 1)
        H[a][b][mod(rows[b][i] - rows[a][i])] += 1;
  return H;
}

/** @param {number[][][]} H Pair histograms.
 * @param {number[]} shift Eleven arbitrary block offsets.
 */
function equality(H, shift) {
  let count = 0;
  for (let a = 0; a < B; a += 1)
    for (let b = a + 1; b < B; b += 1)
      count += H[a][b][mod(shift[b] - shift[a])];
  return count;
}

/**
 * Edge-disjoint clique certificate: a 29x29 exact maximum over the two
 * independent relative shifts of each 3-block triangle replaces the sum
 * of three separately free maxima, and all unused edges keep their maxima.
 * This provides a rigorous upper bound over EVERY 29^10 schedule.
 */
const triangles = [
  [0, 1, 2], [0, 5, 8], [0, 3, 7], [0, 4, 10], [0, 6, 9],
  [1, 5, 10], [1, 7, 9], [1, 3, 6], [1, 4, 8],
  [2, 8, 9], [2, 3, 5], [2, 6, 10], [2, 4, 7],
  [3, 4, 9], [3, 8, 10], [4, 5, 6], [6, 7, 8]
];
const expectedLosses = [5,6,4,3,3,8,8,3,3,7,9,5,3,4,6,2,2];

/** @param {number[][][]} H Pairwise GP29 difference histograms. */
function bound(H) {
  let pairUpper = 0;
  for (let a = 0; a < B; a += 1)
    for (let b = a + 1; b < B; b += 1)
      pairUpper += Math.max(...H[a][b]);
  const seen = new Set();
  const losses = [];
  for (const [a, b, c] of triangles) {
    assert.ok(a < b && b < c);
    for (const id of [`${a}:${b}`, `${a}:${c}`, `${b}:${c}`]) {
      assert.ok(!seen.has(id), 'Double-used edge in upper-bound certificate');
      seen.add(id);
    }
    const independent = Math.max(...H[a][b]) +
      Math.max(...H[a][c]) + Math.max(...H[b][c]);
    let actual = 0;
    for (let x = 0; x < 29; x += 1)
      for (let y = 0; y < 29; y += 1)
        actual = Math.max(actual, H[a][b][x] +
          H[a][c][y] + H[b][c][mod(y - x)]);
    losses.push(independent - actual);
  }
  return { pairUpper, losses,
    certifiedUpper: pairUpper - losses.reduce((s, x) => s + x, 0),
    triangles: triangles.length, coveredEdges: seen.size };
}
const H = pairHist(body);
const result = bound(H);
assert.equal(equality(H, Array(B).fill(0)), 555);
assert.equal(result.pairUpper, 953);
assert.deepEqual(result.losses, expectedLosses);
assert.equal(result.certifiedUpper, 872);
assert.equal(result.coveredEdges, 51);

const controls = {};
let reference;
for (const [name, file] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
]) {
  const seq = encodeSourceNativeGP(read(file));
  if (name === 'Gibran') reference = seq;
  const totals = [];
  for (let j = 0; j < 300; j += 1) {
    const at = (137 + 7919 * j) % (seq.length - 3299);
    totals.push(equality(pairHist(seq.slice(at, at + 3299)),
      Array(B).fill(0)));
  }
  const min = Math.min(...totals), max = Math.max(...totals);
  assert.ok(min > result.certifiedUpper,
    `Original must remain below the ${name} native control set`);
  controls[name] = { fullLengthWindows: totals.length,
    minimum: min, maximum: max, allAboveOriginalAllSecretUpper: true };
}

// Source-native 11-block positive under the SAME all-secret architecture:
let rng = 0x3301f404;
/** @returns {number} Deterministic unsigned draw for test-only secret maps. */
function next() {
  rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5;
  return rng >>> 0;
}
const perms = Array.from({ length: W }, () => {
  const q = Array.from({ length: 29 }, (_, i) => i);
  for (let i = 28; i > 0; i -= 1) {
    const j = next() % (i + 1);
    [q[i], q[j]] = [q[j], q[i]];
  }
  return q;
});
const inverse = perms.map((p) => {
  const inv = new Array(29);
  p.forEach((v, i) => { inv[v] = i; });
  return inv;
});
const offsets = Array.from({ length: B }, (_, i) =>
  i === 0 ? 0 : next() % 29);
const native = reference.slice(113, 3412);
assert.equal(native.length, 3299);
const encrypted = native.map((p, i) =>
  mod(perms[i % W][p] + offsets[Math.floor(i / W)]));
assert.deepEqual(encrypted.map((c, i) =>
  inverse[i % W][mod(c - offsets[Math.floor(i / W)])]), native);
const nativeEquality = equality(pairHist(native), Array(B).fill(0));
assert.equal(equality(pairHist(encrypted), offsets), nativeEquality);
assert.ok(bound(pairHist(encrypted)).certifiedUpper >= nativeEquality);

console.log(JSON.stringify({
  source: {chapters: 'p40..53 + p54..55', bodyCounts: [3000, 299],
    phases: 300, blocks: 11, fullySecretPhaseAlphabets: 300,
    independentlyAdjustableCaesarOffsets: 11},
  original: { rawMatchedPairs: 555, ...result },
  nativeControls: controls,
  positiveOriginalShapedPlant: { sourceNativeRunesRecovered: 3299,
    alignedEquality: nativeEquality },
  decision: 'No original plaintext/key; 11-block shifting phase-300 model is inconsistent with native GP English controls.'
}, null, 2));
