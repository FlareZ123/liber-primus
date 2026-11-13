"use strict";

/**
 * Source-visible Fibonacci page-index versus GP29 ciphertext-step spectrum.
 * The LP2 p15 scan contains a Fibonacci spiral; the original 2014 distribution
 * numbers its pages. Test the UNMODIFIED GP29 first differences on Fibonacci-
 * indexed physical pages before attempting one fixed table-column consumer.
 *
 * SFT: node sims/lp2_fibonacci_page_delta_spectrum_sft.cjs
 * Node.js >=20, CommonJS, built-ins only. No network or arbitrary key search.
 * This is a provisional, post-discovery association, not LP2 plaintext.
 */
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const gp = require("../resources/liber-primus/lp2-corpus.json");
const grid = require("../resources/liber-primus/base60-grid.json");

const MOD = 29;
const PAGE_SET = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];
const FIB_COLUMNS = [2, 3, 5, 8, 13, 21, 34, 55];
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length > 0);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.deepEqual(PAGE_SET.filter(p => !pages.some(q => q.page === p)), []);
assert.equal(grid.byte_rows.length, 32);
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert.equal(createHash("sha256").update(Buffer.from(table)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} v @param {number} n */
const mod = (v, n = MOD) => ((v % n) + n) % n;

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const h = new Uint32Array(MOD);
  for (const x of xs) h[x]++;
  return h.reduce((sum, value) => sum + value * (value - 1), 0) /
    (xs.length * (xs.length - 1));
}

/** @param {number[]} original */
function deltas(original) {
  return original.slice(1).map((x, i) => mod(x - original[i]));
}

/** @param {number[]} xs @param {number} alphabet */
function histogram(xs, alphabet) {
  const h = Array(alphabet).fill(0);
  for (const x of xs) h[x]++;
  return h;
}

/** @param {number[]} h */
function chiUniform(h) {
  const e = h.reduce((s, v) => s + v, 0) / h.length;
  return h.reduce((s, v) => s + (v - e) ** 2 / e, 0);
}

/** @param {number[]} a @param {number[]} b */
function pearson(a, b) {
  const am = a.reduce((s, x) => s + x, 0) / a.length;
  const bm = b.reduce((s, x) => s + x, 0) / b.length;
  const numerator = a.reduce((s, x, i) => s + (x - am) * (b[i] - bm), 0);
  const normA = a.reduce((s, x) => s + (x - am) ** 2, 0);
  const normB = b.reduce((s, x) => s + (x - bm) ** 2, 0);
  return numerator / Math.sqrt(normA * normB);
}

const F = new Set(PAGE_SET);
const records = pages.map(p => {
  const d = deltas(p.indices);
  const halfway = Math.floor(d.length / 2);
  const hist = xs => histogram(xs.filter(v => v !== 0).map(v => v - 1), 28);
  return {
    page: p.page, runes: p.indices.length, doubles: d.filter(x => x === 0).length,
    fibonacci: F.has(p.page),
    chi28: chiUniform(hist(d)),
    chiRaw29: chiUniform(histogram(p.indices, MOD)),
    halfCorrelation: pearson(hist(d.slice(0, halfway)),
      hist(d.slice(halfway))),
    stepBins: hist(d),
  };
});
assert.equal(records.reduce((s, r) => s + r.doubles, 0), 86);
assert.deepEqual(records.slice().sort((a, b) => b.chi28 - a.chi28)
  .slice(0, 3).map(r => r.page), [8, 13, 21]);

/** @param {number[]} indices @param {number[]} values */
function selectedContrast(indices, values) {
  const included = new Set(indices);
  let selected = 0, others = 0;
  for (let i = 0; i < values.length; i++) {
    if (included.has(i)) selected += values[i];
    else others += values[i];
  }
  return selected / included.size - others / (values.length - included.size);
}
const fibIndices = records.flatMap((r, i) => r.fibonacci ? [i] : []);
assert.equal(fibIndices.length, 10);
const values = records.map(r => r.chi28);
const observed = fibIndices.reduce((s, i) => s + values[i], 0);
const Fmean = observed / 10;
const otherMean = (values.reduce((a, b) => a + b, 0) - observed) / 45;
const rawContrast = selectedContrast(fibIndices, records.map(r => r.chiRaw29));
const halfContrast = selectedContrast(fibIndices,
  records.map(r => r.halfCorrelation));

/** @param {number[]} choices @param {number} k */
function combinations(choices, k) {
  const result = [];
  function rec(offset, chosen) {
    if (chosen.length === k) {
      result.push(chosen.slice());
      return;
    }
    for (let i = offset; i <= choices.length - (k - chosen.length); i++) {
      chosen.push(choices[i]);
      rec(i + 1, chosen);
      chosen.pop();
    }
  }
  rec(0, []);
  return result;
}
const originalChapterGroups = [
  {pages: [3, 4, 5, 6, 7], choose: 2},
  {pages: [8, 9, 10, 11, 12, 13, 14], choose: 2},
  {pages: [15, 16, 17, 18, 19, 20, 21, 22], choose: 1},
  {pages: [33, 34, 35, 36, 37, 38, 39], choose: 1},
  {pages: [54, 55], choose: 1}
];
const byPage = new Map(records.map(r => [r.page, r.chi28]));
const chapterChoices = originalChapterGroups.map(g =>
  combinations(g.pages, g.choose).map(xs => xs.reduce((s, p) =>
    s + byPage.get(p), 0)));
let exactCount = 0, upperCount = 0, exactScoreSum = 0;
function recurseChapter(g, score) {
  if (g === chapterChoices.length) {
    exactCount++;
    exactScoreSum += score;
    if (score >= observed - 1e-10) upperCount++;
    return;
  }
  for (const x of chapterChoices[g]) recurseChapter(g + 1, score + x);
}
recurseChapter(0, byPage.get(0) + byPage.get(1) + byPage.get(2));
assert.equal(exactCount, 23520);
assert.equal(upperCount, 21);
assert(Math.abs(Fmean - 35.32901932040701) < 1e-10);
assert(Math.abs(otherMean - 26.32724953549360) < 1e-10);
assert(Math.abs(rawContrast - 2.810928079058087) < 1e-10);
assert(Math.abs(halfContrast - 0.15856936258634058) < 1e-10);

/** @param {number} seed */
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const random = xorshift(0x008812d2);
const trials = 250000;
const counts = {chi28: 0, rawChi29: 0, halfCorrelation: 0};
const sourceLists = [
  values, records.map(x => x.chiRaw29),
  records.map(x => x.halfCorrelation)
];
const observedEffects = [Fmean - otherMean, rawContrast, halfContrast];
for (let trial = 0; trial < trials; trial++) {
  const permutation = Array.from({length: 55}, (_, i) => i);
  for (let i = 0; i < 10; i++) {
    const j = i + random() % (55 - i);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const indices = permutation.slice(0, 10);
  for (let j = 0; j < 3; j++) {
    if (selectedContrast(indices, sourceLists[j]) >=
        observedEffects[j] - 1e-12) {
      counts[["chi28", "rawChi29", "halfCorrelation"][j]]++;
    }
  }
}
assert.equal(counts.chi28, 94);
assert.equal(counts.rawChi29, 28804);
assert.equal(counts.halfCorrelation, 1551);

const rotatingMask = [];
for (let shift = 0; shift < 55; shift++) {
  const rotated = fibIndices.map(i => (i + shift) % 55);
  rotatingMask.push({shift, contrast: selectedContrast(rotated, values)});
}
assert.equal(rotatingMask.slice().sort((a, b) => b.contrast - a.contrast)[0]
  .shift, 0);

// One frozen prospective cipher consumer: the 8 Fibonacci-indexed pages >=2
// pair in increasing order with the eight printed 32-entry grid columns.
// Historical prime-root 15 supplies a reversible step-domain logarithm.
// For a nonzero source delta, P=log15(delta)-gridByte%28 (mod28).
// For delta zero, the proposed P is EA (GP index28). This marker model has
// independent, previously documented source-language objections.
// No fitted column order, key phase, seed or output substitutions.
const rootPowers = [];
const logs = new Int8Array(MOD).fill(-1);
for (let i = 0, x = 1; i < 28; i++, x = x * 15 % MOD) {
  rootPowers.push(x);
  logs[x] = i;
}
assert.equal(new Set(rootPowers).size, 28);
assert.equal(logs[0], -1);
/** @param {number[]} d @param {number[]} column */
function decryptSteps(d, column) {
  return d.map((x, i) => x === 0 ? 28 :
    mod(logs[x] - column[i % 32] % 28, 28));
}
/** @param {number[]} plain @param {number[]} column */
function encryptSteps(plain, column) {
  return plain.map((x, i) => x === 28 ? 0 :
    rootPowers[mod(x + column[i % 32] % 28, 28)]);
}
const columnResults = [];
for (let columnIndex = 0; columnIndex < 8; columnIndex++) {
  const page = FIB_COLUMNS[columnIndex];
  const input = pages.find(x => x.page === page).indices;
  const d = deltas(input);
  const key = grid.byte_rows.map(row => row[columnIndex]);
  const decoded = decryptSteps(d, key);
  assert.deepEqual(encryptSteps(decoded, key), d);
  columnResults.push({
    page, gridColumn: columnIndex, cipherRunes: input.length,
    originalDeltaIoc: ioc(d), decodedGp29Ioc: ioc(decoded),
    decodedPrefix: decoded.slice(0, 50).map(x => gp.translit[x]).join("")
  });
}
// Native positive proves that source-language symbols are decoded exactly,
// without making the original candidate into an authenticated cipher.
const sourcePlain = gp.pages[57].indices;
const sourceKey = grid.byte_rows.map(row => row[0]);
assert.equal(sourcePlain.length, 95);
const cipherPlant = encryptSteps(sourcePlain, sourceKey);
assert.deepEqual(decryptSteps(cipherPlant, sourceKey), sourcePlain);

const report = {
  classification: "original-ciphertext Fibonacci-indexed step-spectrum association; exploratory",
  source: "2014 0.jpg..57.jpg page order, original GP29 runes, p15 Fibonacci spiral",
  original: {runes: 12956, runeBearingPages: 55, doublets: 86,
    fibonacciPages: PAGE_SET, excludedRunelessPage: 50},
  fibonacciVsOther: {
    chi28MeanFibonacci: Fmean, chi28MeanOthers: otherMean,
    chi28Difference: Fmean - otherMean,
    rawRuneChi29Difference: rawContrast,
    halfStepHistogramCorrelationDifference: halfContrast
  },
  exactWithinOriginalChapters: {
    fixedPages: [0, 1, 2],
    groups: originalChapterGroups,
    choices: exactCount, upperOrEqual: upperCount,
    exactUpperFraction: upperCount / exactCount,
    nullMeanFibonacciSum: exactScoreSum / exactCount
  },
  randomTenOfFiftyFive: {seed: "0x008812d2", trials, counts,
    plusOneUpperFractions: Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, (v + 1) / (trials + 1)]))
  },
  cyclicPageMask: {originalIsBestOf55Shifts: true},
  pageRankings: records.slice().sort((a, b) => b.chi28 - a.chi28)
    .map(r => ({page: r.page, chi28: r.chi28, fibonacci: r.fibonacci})),
  directSourceMotivatedInverse: {
    operation: "log_15(nonzero GP29 page delta) minus own 32-byte base60 table column modulo28; zero to EA",
    decoded: columnResults,
    nativeSolvedGp29PlantRecovered: sourcePlain.length,
    exactOriginalDeltaReencryption: true,
    interpretation: "No recovered unknown-page plaintext or key under this direct inverse."
  },
  caveat: "Page-number/metric pairing investigated after spectrum exploration; exact tails condition on this hypothesis, not global project look-elsewhere. No Cicada-authenticated source selects this operation."
};
console.log(JSON.stringify(report, null, 2));
