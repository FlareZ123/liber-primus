"use strict";
/**
 * SFT: two original illustration links intersect at LP1 p16, then test the
 * key-independent equality requirement for a common position-wise GP29
 * substitution/additive pad across their original source-visible LP2 chapters.
 *
 * The image-source sets are established separately by the original-pixel SFT
 * lp1_lp2_illustration_raster_reuse_sft.py and do not assert cipher intent.
 * This test freezes p0–2 and p15–22 before comparing their rune streams.
 *
 * Run from repository root using the installed Node.js runtime.
 * No network, randomness beyond a deterministic seeded PRNG, or file writes.
 *
 * @typedef {{same:number, max:number, mode:number, bins:number[]}} Histogram
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const R = 29;
const fromPages = (first, last) =>
  corpus.pages.filter((p) => p.page >= first && p.page <= last)
    .flatMap((p) => p.indices);
const a = fromPages(0, 2);
const b = fromPages(15, 22);
assert.equal(a.length, 729);
assert.equal(b.length, 1903);

const artA = [9, 13, 16];
const artB = [14, 15, 16];
const intersection = artA.filter((page) => artB.includes(page));
assert.deepEqual(intersection, [16]);
const length = a.length;

/**
 * If both pages reuse the same arbitrary bijection f_i, then equal-output
 * positions are unchanged. If they add per-chapter Caesar constants too,
 * the maximum among all 29 GP29 difference bins is likewise unchanged.
 * @param {number[]} x
 * @param {number[]} y
 * @param {number} startX
 * @param {number} startY
 * @returns {Histogram}
 */
function difference(x, y, startX = 0, startY = 0) {
  const bins = Array.from({ length: R }, () => 0);
  for (let i = 0; i < length; i++) {
    bins[(x[i + startX] - y[i + startY] + R) % R]++;
  }
  const best = Math.max(...bins);
  return { same: bins[0], max: best, mode: bins.indexOf(best), bins };
}
const actual = difference(a, b);
assert.equal(actual.same, 20);
assert.equal(actual.max, 34);

// The pinned GP29 transliteration is applied by greedy longest-rune matching
// under the same public historic consonant folds used in other source tests.
const alphabet = corpus.translit.map((s, i) => ({ s, i }))
  .sort((x, y) => y.s.length - x.s.length);
const english = read("resources/control/shakespeare_first300k.txt")
  .toUpperCase().replace(/QU/g, "CW")
  .replace(/[KVZ]/g, (c) => ({ K: "C", V: "U", Z: "S" })[c]);
const native = [];
for (let i = 0; i < english.length;) {
  const match = alphabet.find(({ s }) => english.startsWith(s, i));
  if (match) {
    native.push(match.i);
    i += match.s.length;
  } else i++;
}
assert.equal(native.length, 218800);

/** Deterministic xorshift32, seed 3301. @returns {()=>number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const rand = rng(3301);
const REPLICATES = 5000;
const equals = [], allOffsets = [], otherOriginalOffsets = [];
for (let i = 0; i < REPLICATES; i++) {
  const sa = rand() % (native.length - length);
  const sb = rand() % (native.length - length);
  const h = difference(native, native, sa, sb);
  equals.push(h.same);
  allOffsets.push(h.max);
}
for (let i = 0; i < REPLICATES; i++) {
  const shift = rand() % (b.length - length + 1);
  otherOriginalOffsets.push(difference(a, b, 0, shift).same);
}
/** @param {number[]} values */
const describe = (values, target) => {
  const sorted = values.slice().sort((x, y) => x - y);
  const countAtOrBelow = values.filter((v) => v <= target).length;
  return {
    mean: values.reduce((sum, v) => sum + v, 0) / values.length,
    minimum: sorted[0], p05: sorted[Math.floor(values.length * 0.05)],
    observedAtOrBelow: countAtOrBelow,
    oneSidedPlusOneP: (countAtOrBelow + 1) / (values.length + 1)
  };
};
const direct = describe(equals, actual.same);
const secretCaesar = describe(allOffsets, actual.max);
const rotation = describe(otherOriginalOffsets, actual.same);
assert.equal(direct.observedAtOrBelow, 0);
assert.equal(secretCaesar.observedAtOrBelow, 23);
assert.equal(rotation.observedAtOrBelow, 862);

// Synthetic proof of the exact cancellation invariant with a genuinely
// hidden shared 729-symbol key plus both secret chapter Caesar shifts.
const check = rng(9133);
const keys = Array.from({ length }, () => check() % R);
const plant1 = native.slice(23000, 23000 + length);
const plant2 = native.slice(42000, 42000 + length);
const ca = plant1.map((v, i) => (v + keys[i] + 8) % R);
const cb = plant2.map((v, i) => (v + keys[i] + 17) % R);
const plainDiff = difference(plant1, plant2);
const cipherDiff = difference(ca, cb);
assert.equal(cipherDiff.max, plainDiff.max);
assert.equal(cipherDiff.same, plainDiff.bins[(17 - 8) % R]);
assert.deepEqual(plainDiff.bins.map((v, i) => v),
  Array.from({ length: R }, (_, i) =>
    cipherDiff.bins[(i + 8 - 17 + R) % R]));
const noShiftCa = plant1.map((v, i) => (v + keys[i]) % R);
const noShiftCb = plant2.map((v, i) => (v + keys[i]) % R);
assert.equal(difference(noShiftCa, noShiftCb).same, plainDiff.same);

console.log(JSON.stringify({
  source: {
    lp2Chapters: ["p0–2 (729 GP29 runes)", "p15–22 (1903 GP29 runes)"],
    visualReferencesLP1: [artA, artB],
    uniqueCommonLP1Page: intersection[0],
    p16Object: "5x5 / 3301 magic square",
    testedMechanism: "common position-wise bijection for no-offset, or common additive pad with independent unknown chapter Caesar offsets"
  },
  original: { comparedRunes: length, ...actual },
  nativeGPControl: {
    source: "pinned Shakespeare first300k GP transliteration",
    totalRunes: native.length, experiments: REPLICATES,
    directCommonBijection: direct, allHiddenCaesarOffsets: secretCaesar
  },
  sourceMatchedDifferentOriginalOffsets: rotation,
  plantedSamePadPositiveControl: {
    originalEqual: plainDiff.same, encryptedAllOffsetMax: cipherDiff.max,
    exactDifferenceHistogramShifted: true
  },
  conclusion: "Source-selected shared 729-step GP29 page/chapter key is inconsistent with native GP-English controls; the square remains a candidate reference, no plaintext/key inferred."
}, null, 2));
