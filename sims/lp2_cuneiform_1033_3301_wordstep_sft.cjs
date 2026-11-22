"use strict";

/**
 * Original-input SFT: literal cuneiform 1033/3301 word-step inverse.
 *
 * Native plaintext target: 2,896 consecutive GP-transliterated Gibran words.
 * Uses only checked-in files, no network, packages or writes.
 * Run: node sims/lp2_cuneiform_1033_3301_wordstep_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const input = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"),
  "utf8"
);
const parts = input.split("%");
assert.equal(parts.length, 57, "55 unsolved rune-bearing pages + 2 solved");
const sourceRunes = parts.slice(0, 55).join("").replace(/[/\s]/g, "");
const words = sourceRunes.match(/[\u16a0-\u16ff]+/gu);
assert.equal(words.length, 2896, "intact source words across lines and pages");
const original = words.map((word) => word.length);
const n = original.length;
assert.equal(original.reduce((a, b) => a + b, 0), 12956);
assert.equal((parts[54].match(/[\u16a0-\u16ff]/gu) || []).length, 76);
assert.equal((parts[55].match(/[\u16a0-\u16ff]/gu) || []).length, 85);
assert.equal((parts[56].match(/[\u16a0-\u16ff]/gu) || []).length, 95);

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a;
}

/**
 * Empirical cyclic mutual information of word lengths at a fixed source lag,
 * clipping to ten bins {0,1,...,8,9+}. All printed words have positive length.
 * A full-cycle modular traversal and its reversal have identical MI, since
 * their pair-count matrices are transposes; its starting offset is immaterial.
 *
 * @param {number[]} lengths
 * @param {number} step
 * @returns {number}
 */
function cyclicMI(lengths, step) {
  const pair = new Int32Array(100);
  const left = new Int32Array(10);
  const right = new Int32Array(10);
  for (let i = 0; i < n; i++) {
    const x = Math.min(9, lengths[i]);
    const y = Math.min(9, lengths[(i + step) % n]);
    pair[10 * x + y]++;
    left[x]++;
    right[y]++;
  }
  let information = 0;
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      const count = pair[10 * x + y];
      if (count) {
        information += (count / n) * Math.log(
          (count * n) / (left[x] * right[y])
        );
      }
    }
  }
  return information;
}

// The only two printed sexagesimal/2014-square values considered are
// 1033 and 3301; each is read as a full-book modular word-index step.
// Testing their inverses also covers scatter-versus-gather serialization.
const steps = [
  { name: "1033", step: 1033, inverse: 1769 },
  { name: "inverse(1033)", step: 1769, inverse: 1033 },
  { name: "3301", step: 3301 % n, inverse: 1709 },
  { name: "inverse(3301)", step: 1709, inverse: 3301 % n }
];
for (const entry of steps) {
  assert.equal(gcd(entry.step, n), 1, "modular step must traverse every word");
  assert.equal((entry.step * entry.inverse) % n, 1);
}
const observed = steps.map((entry) => cyclicMI(original, entry.step));

// Preserve the original nine chapter word inventories in the conditional null.
const chapterCounts = [158, 255, 385, 435, 224, 326, 23, 355, 735];
const ends = [0];
for (const count of chapterCounts) {
  ends.push(ends[ends.length - 1] + count);
}
assert.equal(ends[ends.length - 1], n);

// Fixed xorshift32 seed; the same permuted book serves all four candidates.
let state = 0x33011033;
/** @returns {number} */
function randomUint32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 2000;
const upperTailHits = new Array(steps.length).fill(0);
const nullSum = new Array(steps.length).fill(0);
const nullSquares = new Array(steps.length).fill(0);
for (let trial = 0; trial < trials; trial++) {
  const shuffled = original.slice();
  for (let chapter = 0; chapter < chapterCounts.length; chapter++) {
    const start = ends[chapter];
    const end = ends[chapter + 1];
    for (let i = end - 1; i > start; i--) {
      const j = start + randomUint32() % (i - start + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  for (let k = 0; k < steps.length; k++) {
    const value = cyclicMI(shuffled, steps[k].step);
    nullSum[k] += value;
    nullSquares[k] += value * value;
    if (value >= observed[k]) upperTailHits[k]++;
  }
}

// Positive test: actual source prose can be dispersed by a complete modular
// permutation and exactly restored under the paired inverse.
const gibran = fs.readFileSync(
  path.join(root, "resources", "control", "gibran_prophet_58585.txt"),
  "utf8"
).toUpperCase();
const naturalWords = gibran.match(/[A-Z]+/g);
assert.ok(naturalWords.length >= n);

/** @param {string} word @returns {number} */
function nativeRuneLength(word) {
  return word
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/ING|TH|NG|EO|OE|AE|IA|EA|IO/g, "_").length;
}
const natural = naturalWords.slice(0, n).map(nativeRuneLength);
const naturalMI = cyclicMI(natural, 1);
assert.ok(naturalMI > 0.04, "original source prose must have length grammar");
for (const entry of steps) {
  const permuted = Array.from(
    { length: n },
    (_, i) => natural[(i * entry.step) % n]
  );
  const recovered = Array.from(
    { length: n },
    (_, i) => permuted[(i * entry.inverse) % n]
  );
  assert.deepEqual(recovered, natural, "complete native-prose inverse");
  assert.ok(
    Math.abs(cyclicMI(permuted, entry.inverse) - naturalMI) < 1e-12,
    "source prose grammar must return under its inverse"
  );
}

const output = steps.map((entry, i) => {
  const mean = nullSum[i] / trials;
  const sd = Math.sqrt(Math.max(0, nullSquares[i] / trials - mean * mean));
  return {
    sourceStep: entry.name,
    modularStep: entry.step,
    sourceMI: observed[i],
    conditionedNullMean: mean,
    conditionedNullSD: sd,
    z: (observed[i] - mean) / sd,
    upperTailP: (upperTailHits[i] + 1) / (trials + 1)
  };
});
assert.ok(output.every((row) => row.upperTailP > 0.05));
console.log(JSON.stringify({
  source: "LP2 original p0-p55, runeless p50 omitted",
  runes: 12956,
  words: n,
  chapterWordCounts: chapterCounts,
  nullTrials: trials,
  seed: "0x33011033",
  positiveNativeGibranAdjacentMI: naturalMI,
  measurements: output,
  result: "No language-like word-length restoration under these modular traversals"
}, null, 2));
