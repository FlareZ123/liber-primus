#!/usr/bin/env node
"use strict";

/**
 * Original LP2: every static predecessor-indexed collision-repair target,
 * under a uniform independently masked 29-symbol precursor.
 * No source repair law or true LP2 plaintext is claimed.
 * Run: node sims/lp2_single_target_doublet_repair_allsecret_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const source = corpus.pages.filter(page => page.page <= 55);
const anchor = corpus.pages[57].indices;
assert.equal(source.length, 56);
assert.equal(anchor.length, 95);
assert.equal(source.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(source.filter(page => page.indices.length > 0).length, 55);

/** @param {number} x @returns {number} */
const mod29 = x => (x % 29 + 29) % 29;

/**
 * @param {{page:number,indices:number[]}[]} pages
 * @returns {{N:number,repeat:number,top:number,maxAnyTarget:number,plusOne:number,rows:number[][]}}
 */
function transitionEvidence(pages) {
  const rows = Array.from({length: 29}, () => Array(29).fill(0));
  let N = 0;
  for (const page of pages) {
    for (let i = 1; i < page.indices.length; i++) {
      const previous = page.indices[i - 1];
      const current = page.indices[i];
      assert.ok(Number.isInteger(previous) && previous >= 0 && previous < 29);
      assert.ok(Number.isInteger(current) && current >= 0 && current < 29);
      rows[previous][current]++;
      N++;
    }
  }
  let repeat = 0, top = 0, plusOne = 0;
  for (let q = 0; q < 29; q++) {
    repeat += rows[q][q];
    plusOne += rows[q][q] + rows[q][(q + 1) % 29];
    top += Math.max(...rows[q].filter((_, j) => j !== q));
  }
  return {N, repeat, top, maxAnyTarget: repeat + top, plusOne, rows};
}
/**
 * Probability Pr[Binomial(n,p) <= k], using exact log factorial binomial
 * coefficient and stable downward recurrence; no external statistics package.
 * @param {number} n @param {number} k @param {number} p @returns {number}
 */
function binomialCdf(n, k, p) {
  assert.ok(Number.isInteger(n) && Number.isInteger(k) && k >= 0 && k < n);
  assert.ok(p > 0 && p < 1);
  const logFact = new Float64Array(n + 1);
  for (let i = 2; i <= n; i++) logFact[i] = logFact[i - 1] + Math.log(i);
  const logPmf = logFact[n] - logFact[k] - logFact[n - k] +
    k * Math.log(p) + (n - k) * Math.log1p(-p);
  let pmf = Math.exp(logPmf), cdf = pmf;
  for (let i = k; i >= 1; i--) {
    pmf *= i / (n - i + 1) * ((1 - p) / p);
    cdf += pmf;
  }
  return cdf;
}
const original = transitionEvidence(source);
assert.equal(original.N, 12901);
assert.equal(original.repeat, 86);
assert.equal(original.top, 714);
assert.equal(original.maxAnyTarget, 800);
assert.equal(original.plusOne, 543);
const originalTail = binomialCdf(original.N, original.maxAnyTarget, 2 / 29);
assert.ok(Math.abs(originalTail - 0.0008300828629389194) < 1e-10);

/**
 * Deterministic reproducible RNG, not a claimed Cicada generator.
 * @param {number} seed
 * @returns {() => number} Random value in [0,1)
 */
function randomFactory(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
/**
 * Source-length-matched positive plant with actual LP2 clear p57 rune symbols
 * hidden by a fresh uniform GP29 pad. Repair decisions are saved as explicit
 * synthetic side-channel bits, since a replacement alone is not invertible.
 *
 * @param {number} seed
 * @param {"one-fixed-target"|"diffuse-28-targets"} mode
 * @returns {{mode:string,seed:number,repaired:number,evidence:ReturnType<typeof transitionEvidence>}}
 */
function plant(seed, mode) {
  const next = randomFactory(seed);
  const randint = n => Math.floor(next() * n);
  const encoded = [];
  let planted = 0, repaired = 0;
  for (const originalPage of source) {
    const ciphertext = [], pads = [], flags = [], truths = [];
    for (let i = 0; i < originalPage.indices.length; i++) {
      const plain = anchor[planted % anchor.length];
      const pad = randint(29);
      const precursor = mod29(plain + pad);
      const prev = ciphertext[i - 1];
      const doRepair = i > 0 && precursor === prev && next() < 0.8;
      const output = doRepair ?
        (mode === "one-fixed-target" ? (prev + 1) % 29 : (prev + 1 + randint(28)) % 29) :
        precursor;
      truths.push(plain);
      pads.push(pad);
      flags.push(doRepair);
      ciphertext.push(output);
      repaired += Number(doRepair);
      planted++;
    }
    for (let i = 0; i < ciphertext.length; i++) {
      const precursor = flags[i] ? ciphertext[i - 1] : ciphertext[i];
      const recovered = mod29(precursor - pads[i]);
      assert.equal(recovered, truths[i], "plant is exactly recoverable with side data");
      assert.equal(mod29(precursor - pads[i]), anchor[(planted - truths.length + i) % 95]);
    }
    encoded.push({page: originalPage.page, indices: ciphertext});
  }
  assert.equal(planted, 12956);
  assert.ok(repaired > 250 && repaired < 500);
  const evidence = transitionEvidence(encoded);
  assert.equal(evidence.N, original.N);
  assert.ok(evidence.repeat > 40 && evidence.repeat < 140);
  if (mode === "one-fixed-target") {
    assert.ok(evidence.plusOne > 800, "true fixed-target plant exposes selected edge");
    assert.ok(evidence.maxAnyTarget >= evidence.plusOne);
  } else {
    assert.ok(evidence.maxAnyTarget < 790, "diffuse collision repair resembles original");
  }
  return {mode, seed, repaired, evidence: {
    N: evidence.N, repeat: evidence.repeat, top: evidence.top,
    maxAnyTarget: evidence.maxAnyTarget, plusOne: evidence.plusOne,
    tail: binomialCdf(evidence.N, evidence.maxAnyTarget, 2 / 29)
  }};
}
const controls = [];
for (const seed of [0x20143301, 0x33012014, 0x14e3301]) {
  controls.push(plant(seed, "one-fixed-target"));
  controls.push(plant(seed, "diffuse-28-targets"));
}
console.log(JSON.stringify({
  conclusion: "The original excludes every one-static-target predecessor-only collision repair on a uniformly randomized precursor at the stated all-key one-sided binomial tail.",
  original: {
    N: original.N,
    repeat: original.repeat,
    top: original.top,
    maxAnyTarget: original.maxAnyTarget,
    plusOne: original.plusOne,
    null_p: 2 / 29,
    null_expected: 2 * original.N / 29,
    all_secret_lower_tail: originalTail
  },
  source_native_synthetic_controls: controls
}, null, 2));
console.log("PASS: exact original all-secret max, parameter-free binomial tail, 6 independent native-rune reversible sidecar plants.");
