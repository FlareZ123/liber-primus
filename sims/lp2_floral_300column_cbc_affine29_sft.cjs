'use strict';

/**
 * All-secret, original-cipher 11-block 300-phase predecessor feedback:
 * C[b,i] = slope*C[b-1,i] + K[i] + perm[i](P[b,i]) (mod29).
 * Exhaust all 29 globally shared feedback slopes. K[i] can be any GP29
 * digit and perm[i] any independent GP29 bijection. All 29! keys cancel
 * from the equality signature in the interblock residual registers.
 *
 * The headings p40 and p54 share a red-polynomial root at 24, furnishing
 * one source-motivated feedback slope, but do not prescribe this operator.
 * No secret key or unknown LP2 plaintext is recovered.
 *
 * Usage (Windows 11 / Node.js22):
 * node sims/lp2_floral_300column_cbc_affine29_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const base = path.join(__dirname, '..');
/** @param {string} rel Repo-relative file path. */
const read = (rel) => fs.readFileSync(path.join(base, rel), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p40 = gp.pages.filter((p) => p.page >= 40 && p.page <= 53)
  .flatMap((p) => p.indices);
const p54 = gp.pages.filter((p) => p.page >= 54 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(p40.length, 3008);
assert.equal(p54.length, 308);
const original = p40.slice(8).concat(p54.slice(9));
assert.equal(original.length, 3299);
const mod = (n) => ((n % 29) + 29) % 29;

/** @param {number[]} src Source 3299-rune sequence.
 * @returns {number[][]} Eleven aligned 300-column blocks. */
function blocks(src) {
  assert.equal(src.length, 3299);
  return Array.from({ length: 11 }, (_, b) =>
    src.slice(b * 300, b * 300 + (b === 10 ? 299 : 300)));
}

/** @param {number[][]} grid Eleven blocks.
 * @param {number} slope GP29 feedback slope.
 * @returns {number[][]} Ten residual blocks.
 */
function residues(grid, slope) {
  return Array.from({ length: 10 }, (_, b) =>
    grid[b + 1].map((x, i) => mod(x - slope * grid[b][i])));
}

/** @param {number[][]} dr Ten residual blocks.
 * @returns {number} Number of equal residuals in aligned columns.
 */
function pairEquals(dr) {
  let n = 0;
  for (let a = 0; a < dr.length; a += 1)
    for (let b = a + 1; b < dr.length; b += 1)
      for (let i = 0; i < Math.min(dr[a].length, dr[b].length); i += 1)
        n += Number(dr[a][i] === dr[b][i]);
  return n;
}
const source = blocks(original);
const bySlope = Array.from({ length: 29 }, (_, a) =>
  pairEquals(residues(source, a)));
assert.deepEqual(bySlope, [
  439,446,435,479,418,492,446,464,470,490,475,463,484,
  421,467,453,469,429,481,440,477,461,419,453,431,
  429,464,471,444
]);
assert.equal(Math.max(...bySlope), 492);
assert.equal(bySlope[24], 431);

const refs = {};
let gibran;
for (const [name, file, minExpected] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 720],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 747]
]) {
  const seq = encodeSourceNativeGP(read(file));
  if (name === 'Gibran') gibran = seq;
  const totals = [];
  for (let j = 0; j < 300; j += 1) {
    const at = (137 + 7919 * j) % (seq.length - 3299);
    // The plaintext of the first block does not enter the feedback output.
    totals.push(pairEquals(blocks(seq.slice(at, at + 3299)).slice(1)));
  }
  const min = Math.min(...totals);
  assert.equal(min, minExpected);
  assert.ok(min > Math.max(...bySlope));
  refs[name] = {n: totals.length, minimum: min};
}

// Source-native positive plants for every slope under fixed 300 arbitrary
// secret phase permutations and independent 300 unknown phase keys.
let rng = 0x24f13301;
/** @returns {number} Seeded unsigned 32-bit draw for positive test. */
function next32() {
  rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5;
  return rng >>> 0;
}
const key = Array.from({length: 300}, () => next32() % 29);
const perm = Array.from({length: 300}, () => {
  const x = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i -= 1) {
    const j = next32() % (i + 1);
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
});
const inv = perm.map((a) => {
  const x = new Array(29);
  a.forEach((p, i) => { x[p] = i; });
  return x;
});
const native = blocks(gibran.slice(113, 3412));
assert.equal(native.length, 11);
const truePlainEquals = pairEquals(native.slice(1));
for (let slope = 0; slope < 29; slope += 1) {
  const cipher = [Array.from({length: 300}, () => next32() % 29)];
  for (let b = 1; b < 11; b += 1)
    cipher.push(native[b].map((p, i) =>
      mod(slope * cipher[b - 1][i] + key[i] + perm[i][p])));
  const readout = residues(cipher, slope);
  const recovered = readout.map((dr) =>
    dr.map((v, i) => inv[i][mod(v - key[i])]));
  assert.deepEqual(recovered, native.slice(1));
  assert.equal(pairEquals(readout), truePlainEquals);
}
console.log(JSON.stringify({
  original: {chapterLengths: [3000,299], markedBodyRunes: 3299,
    interblockResidualRunes: 2999, pairwiseAlignedComparisons: 13491,
    fixedSourceSlope24Matches: bySlope[24], all29SlopeMatches: bySlope,
    maxAnySharedSlope: Math.max(...bySlope)},
  sourceNativeControls: refs,
  positiveControls: {slopeValues: 29, recoveredR=2999,
    arbitrarySecretBijections: 300, arbitrarySecretPhaseKeys: 300,
    nativeEqualities: truePlainEquals},
  decision: 'No shared constant slope supports native GP29 register with one 300-phase reusable secret key and per-column bijections; changing slopes per column are not excluded.'
}, null, 2));
