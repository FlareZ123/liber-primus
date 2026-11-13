"use strict";

/**
 * Source-original word-length side-channel gate.
 *
 * Compare the original 2,896 printed word lengths with (1) uniformly selected
 * word separators conditioned on 12,956 runes and 2,896 words, and (2) a
 * physically stricter null retaining each source-page's rune count, number of
 * internal separators, and exact inter-page break/carry status.
 *
 * An exact combinatorial left tail is available for the number of singleton
 * words in the unrestricted composition null. The page-aware null uses a
 * seeded, unbiased Fisher-Yates without-replacement draw.
 *
 * Run: node sims/lp2_wordlength_sidecar_uniform_breaks_sft.cjs
 * No external dependencies, network, or invented plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const RUNIC = /[\u16A0-\u16FF]/u;
const corpus = parseSharedCorpus();
const lengths = corpus.words.map(word => word.length);
const M = lengths.length;
const N = lengths.reduce((sum, n) => sum + n, 0);
const singletonObserved = lengths.filter(n => n === 1).length;

assert.deepEqual([M, N, corpus.crossPageWords, singletonObserved],
  [2896, 12956, 32, 83]);

const transcription = fs.readFileSync(
  path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8");
const pageStrings = transcription.split("%").slice(0, 55);
const pageLengths = pageStrings.map(page => [...page].filter(ch => RUNIC.test(ch)).length);
assert.equal(pageLengths.length, 55);
assert.equal(pageLengths.reduce((a, b) => a + b, 0), N);

const boundaries = new Set();
let offset = 0;
for (let i = 0; i < lengths.length - 1; i++) {
  offset += lengths[i];
  boundaries.add(offset);
}
assert.equal(boundaries.size, M - 1);

// A page boundary is a fixed separator or a genuine carried word. The only
// randomized positions are gaps *inside* each physical rune-bearing page.
const fixedInterpageBreaks = [];
const pageSpecs = [];
let cursor = 0;
for (let page = 0; page < pageLengths.length; page++) {
  const L = pageLengths[page];
  let k = 0;
  for (let j = 1; j < L; j++) if (boundaries.has(cursor + j)) k++;
  const leftBreak = page === 0 || boundaries.has(cursor);
  const rightBreak = page === pageLengths.length - 1 ||
    boundaries.has(cursor + L);
  pageSpecs.push({page, start: cursor, L, k, leftBreak, rightBreak});
  cursor += L;
  if (page < pageLengths.length - 1 && boundaries.has(cursor))
    fixedInterpageBreaks.push(cursor);
}
const withinPageBreaks = pageSpecs.reduce((s, p) => s + p.k, 0);
assert.equal(withinPageBreaks, 2873);
assert.equal(fixedInterpageBreaks.length, 22);
assert.equal(withinPageBreaks + fixedInterpageBreaks.length, M - 1);

/**
 * Under the page-fixed null, sample k breaks uniformly among L-1 gaps.
 * A singleton rune must have breaks on both sides (book edges count as
 * breaks). For two distinct gaps inside a page, the joint break probability
 * is k(k-1)/[(L-1)(L-2)].
 */
function pageExpectedSingletons({L, k, leftBreak, rightBreak}) {
  if (L === 1) return Number(leftBreak && rightBreak);
  const q = k / (L - 1);
  let expected = Number(leftBreak) * q + q * Number(rightBreak);
  if (L >= 3) expected += (L - 2) * k * (k - 1) / ((L - 1) * (L - 2));
  return expected;
}
const pageFixedExpectation = pageSpecs.reduce(
  (sum, spec) => sum + pageExpectedSingletons(spec), 0);
assert(Math.abs(pageFixedExpectation - 641.0043540746635) < 1e-8);

/** @param {number} seed */
function makeXorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const trialCount = 10000;
const seed = 0x3301723;
const random = makeXorshift32(seed);
const sites = new Uint8Array(N + 1);
let total = 0;
let totalSquares = 0;
let minimum = Infinity;
let maximum = -Infinity;
let atMostOriginal = 0;

for (let trial = 0; trial < trialCount; trial++) {
  sites.fill(0);
  for (const position of fixedInterpageBreaks) sites[position] = 1;
  for (const {start, L, k} of pageSpecs) {
    const options = Array.from({length: L - 1}, (_, i) => i + 1);
    for (let i = 0; i < k; i++) {
      const j = i + Math.floor(random() * (options.length - i));
      const chosen = options[j];
      options[j] = options[i];
      options[i] = chosen;
      sites[start + chosen] = 1;
    }
  }
  let singletonCount = 0;
  for (let position = 1; position <= N; position++) {
    if ((position === 1 || sites[position - 1]) &&
        (position === N || sites[position])) singletonCount++;
  }
  total += singletonCount;
  totalSquares += singletonCount * singletonCount;
  minimum = Math.min(minimum, singletonCount);
  maximum = Math.max(maximum, singletonCount);
  if (singletonCount <= singletonObserved) atMostOriginal++;
}

const mean = total / trialCount;
const sd = Math.sqrt(totalSquares / trialCount - mean * mean);
assert.equal(atMostOriginal, 0);
assert.equal(minimum, 562);
assert.equal(maximum, 723);
assert(Math.abs(mean - 641.149) < 1e-9);
assert(Math.abs(sd - 19.801474667307218) < 1e-7);

// There are C(N-1,M-1) ways to distribute M-1 separators among N-1
// rune gaps. Exactly s singleton words occur in
//   C(M,s) C(N-M-1,M-s-1)
// equally probable compositions. Their precise left tail needs no
// approximate chi-square or independent-geometric assumption.
const logFactorial = new Float64Array(N + 1);
for (let i = 1; i <= N; i++)
  logFactorial[i] = logFactorial[i - 1] + Math.log(i);
/** @param {number} n @param {number} k */
function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return logFactorial[n] - logFactorial[k] - logFactorial[n - k];
}
const logDenominator = logChoose(N - 1, M - 1);
const logTerms = Array.from({length: singletonObserved + 1}, (_, s) =>
  logChoose(M, s) + logChoose(N - M - 1, M - s - 1) -
  logDenominator);
const maxLogTerm = Math.max(...logTerms);
const logLeftTail = maxLogTerm + Math.log(logTerms.reduce(
  (sum, logTerm) => sum + Math.exp(logTerm - maxLogTerm), 0));
const expectedSingletonsUnrestricted = M * (M - 1) / (N - 1);
assert(Math.abs(expectedSingletonsUnrestricted - 647.1570822076418) < 1e-9);
assert(Math.abs(logLeftTail / Math.LN10 - (-238.24281297539395)) < 1e-6);

const histogram = {};
for (const len of lengths) histogram[len] = (histogram[len] || 0) + 1;
let logMultisetPermutations = logFactorial[M];
for (const count of Object.values(histogram))
  logMultisetPermutations -= logFactorial[count];
const multisetOrderBits = logMultisetPermutations / Math.LN2;
assert(Math.abs(multisetOrderBits - 8791.875904529452) < 1e-7);

console.log(JSON.stringify({
  source: "original rune-level LP2 physical pages 0..55; runeless p50 omitted",
  wordCount: M,
  runeCount: N,
  crossPageWords: corpus.crossPageWords,
  observedSingletons: singletonObserved,
  observedLengthHistogram: histogram,
  separatorCompositionNull: {
    expectedSingletons: expectedSingletonsUnrestricted,
    exactLog10ProbabilitySingletonsAtMost83: logLeftTail / Math.LN10,
    exactOneSidedTail: Math.exp(logLeftTail)
  },
  fixedPageCountAndCarryNull: {
    fixedInterpageBreaks: fixedInterpageBreaks.length,
    shuffledWithinPageBreaks: withinPageBreaks,
    exactExpectedSingletons: pageFixedExpectation,
    seed, trialCount, mean, sd, minimum, maximum,
    replicatesAtMostObserved: atMostOriginal,
    addOneUpperTail: (atMostOriginal + 1) / (trialCount + 1)
  },
  maximumBitsFromUnconstrainedPermutingThisLengthMultiset: multisetOrderBits,
  conclusion: "Uniformly random original word breaks are incompatible; a constrained " +
    "length-preserving permutation or encoded delimiter channel remains possible " +
    "without a source-fixed inverse/key."
}, null, 2));
