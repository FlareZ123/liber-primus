"use strict";
/**
 * Source-constrained red-ink channel test.
 *
 * Tests whether all 16 red spans on original unsolved LP2 pp0-55
 * could be ordinary GP-English under one shared monoalphabetic substitution.
 * IoC is invariant under any fixed 29-rune permutation. Independent original
 * page-local rotations retain source lengths/pages; native-GP blocks preserve
 * each red-span length. Positive permutation control changes every label
 * without changing IoC. No files are written.
 *
 * Run: node sims/lp2_red_ink_substitution_invariant_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const english = read("resources/control/shakespeare_first300k.txt");
const M = 29;
const N_TRIALS = 20000;
const INITIAL_SEED = 0x33014141;

/** @param {string} text @returns {number[]} */
function toGP(text) {
  const spell = corpus.translit.map((part, i) => ({part, i}))
    .sort((a, b) => b.part.length - a.part.length);
  const result = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replaceAll("QU", "CW").replaceAll("V", "U")
      .replaceAll("K", "C").replaceAll("Z", "S").replaceAll("ING", "NG");
    for (let i = 0; i < word.length;) {
      const entry = spell.find(({part}) => word.startsWith(part, i));
      if (!entry) { i++; continue; }
      result.push(entry.i);
      i += entry.part.length;
    }
  }
  return result;
}

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const counts = Array(M).fill(0);
  for (const x of xs) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < M);
    counts[x]++;
  }
  return counts.reduce((n, c) => n + c * (c - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} values @param {number} observed */
function summarize(values, observed) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    min: sorted[0],
    q01: sorted[Math.floor(values.length * 0.01)],
    median: sorted[Math.floor(values.length * 0.5)],
    q99: sorted[Math.floor(values.length * 0.99)],
    plusOneLower: (1 + values.filter(x => x <= observed).length) /
      (1 + values.length)
  };
}

/** Run fixed-size original-source and independent language controls. */
function main() {
  const spans = ink.pages.filter(p => p.page <= 55)
    .flatMap(p => (p.red_spans || []).map(s => ({
      page: p.page, start: s.start, length: s.length
    })));
  const original = spans.flatMap(({page, start, length}) =>
    corpus.pages[page].indices.slice(start, start + length));
  const native = toGP(english);
  assert.equal(spans.length, 16);
  assert.equal(original.length, 213);
  assert.equal(native.length, 217644);
  const observed = ioc(original);
  assert.ok(Math.abs(observed - 0.03383824962352733) < 1e-14);

  // Fixed bijection over the 29 GP labels preserves all symbol coincidences.
  const hiddenPermutation = original.map(x => (11 * x + 7) % M);
  assert.equal(ioc(hiddenPermutation), observed);
  const random = rng(INITIAL_SEED);
  const nativeIos = [], rotatedIos = [];
  for (let t = 0; t < N_TRIALS; t++) {
    const nativeSample = [], redRotation = [];
    for (const s of spans) {
      const offset = random() % (native.length - s.length);
      for (let j = 0; j < s.length; j++)
        nativeSample.push(native[offset + j]);
      const page = corpus.pages[s.page].indices;
      const shift = random() % page.length;
      for (let j = 0; j < s.length; j++)
        redRotation.push(page[(s.start + j + shift) % page.length]);
    }
    nativeIos.push(ioc(nativeSample));
    rotatedIos.push(ioc(redRotation));
  }
  const language = summarize(nativeIos, observed);
  const pageRotation = summarize(rotatedIos, observed);
  assert.ok(language.min > observed, "red spans unexpectedly match native language");
  assert.ok(pageRotation.plusOneLower > 0.1 && pageRotation.plusOneLower < 0.9);

  console.log(JSON.stringify({
    claim: "Fixed shared monoalphabetic GP-English red-channel is strongly disfavoured",
    scope: "Original unsolved pp0-55 red spans; no solved p56/p57 ink included",
    redSpans: spans.length,
    redRunes: original.length,
    redIoC: observed,
    nativeSourceRunes: native.length,
    nativeEnglishBlocks: language,
    originalPageRotations: pageRotation,
    positive: {monoalphabeticPermutationInvariance: true},
    initialSeed: "0x" + INITIAL_SEED.toString(16),
    trials: N_TRIALS,
    limit: "Does not test separately keyed spans, polyalphabetic ciphers, binary or non-GP text"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {toGP, ioc, rng, summarize, main};
