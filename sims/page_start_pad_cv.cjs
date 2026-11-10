"use strict";
/**
 * LP2 page-reset common-pad test with explicit out-of-page prediction.
 *
 * Hypothesis: Each page starts with the same mod-29 additive key stream,
 * with optional independent key skips when a candidate repeats the
 * preceding ciphertext rune. Decode C(page,t) = P(page,t) + K(j) mod 29.
 *
 * Train K(t) independently from one group of pages by maximizing a
 * smoothed reference-language rune likelihood. Evaluate the *held-out*
 * pages. Calibrate by independent rotations of pages and by independent
 * additive relabellings of each page. A planted shared-key/skip example
 * is a positive control; independent planted keys are a negative control.
 *
 * This test does not assume page boundary equals a word boundary.
 * Page 50 contains no runes; it is excluded by status/length, not
 * collapsed into the next manuscript page.
 *
 * Usage: node sims/page_start_pad_cv.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const MOD = 29;
const WINDOWS = [16, 32, 64];
const MAX = WINDOWS[WINDOWS.length - 1];
const SPLITS = 7;
const NULL_REPS = 350;
const PLANT_REPS = 60;
const SKIP_PROB = 0.83;
const SEED = 0x13011995;
const unsolved = corpus.pages.filter(
  (p) => p.status === "unsolved" && p.indices.length >= MAX
);
const arrays = unsolved.map((p) => p.indices);
const knownPlain = corpus.pages.filter(
  (p) => p.status === "solved"
).flatMap((p) => p.indices);
const hist = Array(MOD).fill(1);
for (const symbol of knownPlain) hist[symbol]++;
const q = hist.map((n) => n / (knownPlain.length + MOD));
const logOdds = q.map((p) => Math.log(MOD * p));

/**
 * @param {number} seed
 * @returns {() => number} Stable uniform [0,1) generator.
 */
function xorshift32(seed) {
  let state = seed | 0;
  return function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** @param {() => number} draw */
function makeSplits(draw) {
  const out = [];
  for (let rep = 0; rep < SPLITS; rep++) {
    const perm = Array.from({ length: arrays.length }, (_, i) => i);
    for (let i = perm.length - 1; i > 0; i--) {
      const j = Math.floor(draw() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    const m = Math.floor(perm.length / 2);
    out.push({ train: perm.slice(0, m), test: perm.slice(m) });
  }
  return out;
}

/**
 * @param {number[][]} data
 * @param {number[]} offsets
 * @param {number[]} pageShifts
 * @param {{train:number[],test:number[]}[]} splits
 * @returns {number[]} Mean held-out log-likelihood ratios at each window.
 */
function heldout(data, offsets, pageShifts, splits) {
  const totals = Array(WINDOWS.length).fill(0);
  for (const { train, test } of splits) {
    let acc = 0, at = 0;
    for (let t = 0; t < MAX; t++) {
      let best = -Infinity, key = 0;
      for (let k = 0; k < MOD; k++) {
        let ll = 0;
        for (const i of train) {
          const x = (data[i][(offsets[i] + t) % data[i].length]
            + pageShifts[i]) % MOD;
          ll += logOdds[(x - k + MOD) % MOD];
        }
        if (ll > best) { best = ll; key = k; }
      }
      for (const i of test) {
        const x = (data[i][(offsets[i] + t) % data[i].length]
          + pageShifts[i]) % MOD;
        acc += logOdds[(x - key + MOD) % MOD];
      }
      if (t + 1 === WINDOWS[at]) totals[at++] += acc;
    }
  }
  return totals.map((value) => value / splits.length);
}

/**
 * @param {number[][]} samples
 * @param {number[]} actual
 */
function summarize(samples, actual) {
  const byWindow = WINDOWS.map((window, j) => {
    const d = samples.map((row) => row[j]);
    const mean = d.reduce((s, x) => s + x, 0) / d.length;
    const sd = Math.sqrt(
      d.reduce((s, x) => s + (x - mean) ** 2, 0) / (d.length - 1)
    );
    const z = (actual[j] - mean) / sd;
    return {
      window, actual: actual[j], nullMean: mean, nullSd: sd, z,
      upperTailP: (1 + d.filter((x) => x >= actual[j]).length) / (d.length + 1),
      null95: d.sort((a, b) => a - b)[Math.floor(0.95 * d.length)]
    };
  });
  const maxZ = Math.max(...byWindow.map((x) => x.z));
  const exceed = samples.filter((row) =>
    Math.max(...row.map((x, j) => (x - byWindow[j].nullMean)
      / byWindow[j].nullSd)) >= maxZ).length;
  return {
    byWindow,
    maxZ,
    familywiseUpperTailP: (exceed + 1) / (samples.length + 1)
  };
}

/** @param {() => number} draw */
function samplePlain(draw) {
  let r = draw();
  for (let x = 0; x < MOD; x++) {
    r -= q[x];
    if (r <= 0) return x;
  }
  return MOD - 1;
}

/**
 * @param {() => number} draw
 * @param {boolean} reuseKey
 * @returns {number[][]}
 */
function simulate(draw, reuseKey) {
  const shared = reuseKey
    ? Array.from({ length: 500 }, () => Math.floor(draw() * MOD))
    : null;
  return arrays.map((old) => {
    const key = shared || Array.from(
      { length: 500 }, () => Math.floor(draw() * MOD)
    );
    const out = [];
    let cursor = 0;
    for (let i = 0; i < old.length; i++) {
      const plain = samplePlain(draw);
      let cipher;
      do {
        cipher = (plain + key[cursor++]) % MOD;
      } while (
        i > 0 && cipher === out[i - 1] && draw() < SKIP_PROB
      );
      out.push(cipher);
    }
    return out;
  });
}

const draw = xorshift32(SEED);
const split = makeSplits(draw);
const zeros = Array(arrays.length).fill(0);
const actual = heldout(arrays, zeros, zeros, split);
const rotation = [], labelShift = [];
for (let n = 0; n < NULL_REPS; n++) {
  rotation.push(heldout(
    arrays,
    arrays.map((a) => Math.floor(draw() * a.length)),
    zeros,
    split
  ));
  labelShift.push(heldout(
    arrays,
    zeros,
    arrays.map(() => Math.floor(draw() * MOD)),
    split
  ));
}
const rotationResult = summarize(rotation, actual);
const shiftResult = summarize(labelShift, actual);
const plantedCommon = [], plantedIndependent = [];
for (let i = 0; i < PLANT_REPS; i++) {
  plantedCommon.push(heldout(simulate(draw, true), zeros, zeros, split));
  plantedIndependent.push(heldout(simulate(draw, false), zeros, zeros, split));
}
const controls = WINDOWS.map((window, i) => ({
  window,
  sharedPadMean: plantedCommon.reduce((s, x) => s + x[i], 0) / PLANT_REPS,
  independentPadMean:
    plantedIndependent.reduce((s, x) => s + x[i], 0) / PLANT_REPS,
  sharedPadPowerAgainstRotation95:
    plantedCommon.filter((x) => x[i] > rotationResult.byWindow[i].null95)
      .length / PLANT_REPS,
  independentPadFalsePositiveAgainstRotation95:
    plantedIndependent.filter((x) => x[i] > rotationResult.byWindow[i].null95)
      .length / PLANT_REPS
}));
console.log(JSON.stringify({
  hypothesis: "common page-reset additive pad; independent 83% anti-repeat key skips permitted",
  corpus: "resources/liber-primus/lp2-corpus.json",
  unsolvedPages: unsolved.map((p) => p.page),
  referenceRunes: knownPlain.length,
  smoothing: "one pseudocount per rune",
  randomSeed: "0x13011995",
  splits: SPLITS,
  nullReplicates: NULL_REPS,
  plantReplicates: PLANT_REPS,
  rotationResult, shiftResult, controls
}, null, 2));
