'use strict';

/**
 * Original-LP2 cumulative-difference zero-symbol gate.
 *
 * A stationary 29-rune bijection h in C[i] = C[i-1] + h(P[i]) (mod 29)
 * necessarily makes every adjacent ciphertext doublet a position of
 * the SAME source GP29 plaintext rune h^-1(0). The unknown bijection
 * cannot change those positions.
 *
 * Tests first-rune positions after literal '-' word separators and last-rune
 * positions within words against source-native GP29 English controls matched
 * to the original printed rune-word lengths.
 *
 * Run: node sims/lp2_cumulative_difference_zero_symbol_sft.cjs
 * Node.js 20+, CommonJS, offline, read-only, deterministic.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
}

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '');
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const runeRx = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const matches = [...original.matchAll(runeRx)];
const words = matches.map(m => [...m[0]].map(r => runeMap.get(r)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((s, w) => s + w.length, 0), 12956);

const startLengths = [];
const finalLengths = [];
let observedStart = 0, observedFinal = 0, observedInternal = 0;
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  if (i > 0) {
    const previous = matches[i - 1];
    const between = original.slice(previous.index + previous[0].length,
      matches[i].index);
    // Punctuation could carry a different clock, so only keep a literal '-'.
    if (between === '-') {
      startLengths.push(w.length);
      observedStart += Number(words[i - 1].at(-1) === w[0]);
    }
  }
  if (w.length > 1) {
    finalLengths.push(w.length);
    observedFinal += Number(w.at(-1) === w.at(-2));
    for (let j = 1; j < w.length; j++)
      observedInternal += Number(w[j] === w[j - 1]);
  }
}
assert.equal(startLengths.length, 2720);
assert.equal(finalLengths.length, 2813);
assert.equal(observedStart, 22);
assert.equal(observedFinal, 19);
assert.equal(observedInternal, 63);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Orthography calibrated from solved-LP1 rune words, including ING/IO.
 * @param {string} value
 * @returns {number[]}
 */
function encodeSourceNativeGP(value) {
  const s = value.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let k = 0; k < s.length;) {
    if (s.startsWith('ING', k)) {
      out.push(21);
      k += 3;
    } else if (s.startsWith('IO', k)) {
      out.push(27);
      k += 2;
    } else {
      const token = tokens.find(t => s.startsWith(t.s, k));
      assert(token, 'unmapped control spelling: ' + s);
      out.push(token.i);
      k += token.s.length;
    }
  }
  return out;
}

const controlFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
];
const control = controlFiles.flatMap(file =>
  (read(file).match(/[a-zA-Z]+/g) || []).map(encodeSourceNativeGP));
assert.equal(control.length, 149072);

// Each control word is sampled with replacement within its GP-rune length.
// This is a conditional finite-English model, not an LP2 authorship model.
const bins = new Map();
for (const w of control) {
  let bin = bins.get(w.length);
  if (!bin) {
    bin = {n: 0, start: Array(29).fill(0), end: Array(29).fill(0),
      unigram: Array(29).fill(0)};
    bins.set(w.length, bin);
  }
  bin.n++;
  for (const rune of w) bin.unigram[rune]++;
  bin.start[w[0]]++;
  if (w.length > 1) bin.end[w.at(-1)]++;
}

/** @param {number[]} lengths */
function groupLengths(lengths) {
  const counts = new Map();
  for (const length of lengths)
    counts.set(length, (counts.get(length) || 0) + 1);
  return counts;
}
const startGroups = groupLengths(startLengths);
const finalGroups = groupLengths(finalLengths);

/**
 * Conservative one-sided Chernoff bound for a length-stratified independent
 * Poisson-binomial count of one GP symbol at the requested word position.
 *
 * Since the event of observing BOTH counts exactly is a subset of each
 * one-sided marginal tail, min(startBound, finalBound) bounds a candidate.
 * Summing all 29 bounds handles unknown h^-1(0) without fitting a key.
 *
 * @param {number} rune
 * @param {'start'|'end'} position
 * @param {number} observed
 * @param {Map<number,number>} lengths
 * @returns {{expected:number,bound:number}}
 */
function chernoff(rune, position, observed, lengths) {
  const terms = [...lengths].map(([length, n]) => {
    const bin = bins.get(length);
    assert(bin);
    return {n, p: bin[position][rune] / bin.n};
  });
  const expected = terms.reduce((s, x) => s + x.n * x.p, 0);
  if (expected === observed) return {expected, bound: 1};
  const upper = observed > expected;
  if (upper && terms.reduce((n, x) => n + (x.p > 0 ? x.n : 0), 0) < observed)
    return {expected, bound: 0};
  if (!upper && terms.reduce((n, x) => n + (x.p === 1 ? x.n : 0), 0) > observed)
    return {expected, bound: 0};

  let lo = upper ? 0 : -100;
  let hi = upper ? 100 : 0;
  for (let i = 0; i < 100; i++) {
    const t = (lo + hi) / 2;
    const mean = terms.reduce((s, x) => {
      const q = x.p === 0 ? 0 : x.p === 1 ? 1 :
        1 / (1 + (1 - x.p) / x.p * Math.exp(-t));
      return s + x.n * q;
    }, 0);
    if (mean < observed) lo = t;
    else hi = t;
  }
  const t = (lo + hi) / 2;
  const logBound = terms.reduce((s, x) => {
    const logMGF = t > 0 ?
      t + Math.log(x.p + (1 - x.p) * Math.exp(-t)) :
      Math.log(1 - x.p + x.p * Math.exp(t));
    return s + x.n * logMGF;
  }, 0) - observed * t;
  return {expected, bound: Math.min(1, Math.exp(logBound))};
}


/**
 * The nine red-heading visual chapters are independently observable clocks.
 * Permit the zero-rune h_chapter^-1(0) to vary freely across all nine.
 * The start event is charged to its current word/chapter; exclude any
 * predecessor crossing a chapter boundary, as a reset would interrupt it.
 * Word-final event is charged to its actual final-rune chapter.
 */
const visualEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
/** @param {number} offset */
const chapterAt = offset => visualEnds.findIndex(end => offset < end);
const beginnings = [];
const finalOffsets = [];
let runeOffset = 0;
for (const w of words) {
  beginnings.push(runeOffset);
  runeOffset += w.length;
  finalOffsets.push(runeOffset - 1);
}
assert.equal(runeOffset, 12956);
const chapterData = Array.from({length: 9}, () =>
  ({startLengths: [], finalLengths: [], startCount: 0,
    finalCount: 0, wordCount: 0}));
for (let i = 0; i < words.length; i++) {
  const w = words[i], current = chapterAt(beginnings[i]);
  chapterData[current].wordCount++;
  if (i > 0) {
    const previous = matches[i - 1];
    const separator = original.slice(previous.index + previous[0].length,
      matches[i].index);
    if (separator === '-' && chapterAt(finalOffsets[i - 1]) === current) {
      chapterData[current].startLengths.push(w.length);
      chapterData[current].startCount +=
        Number(words[i - 1].at(-1) === w[0]);
    }
  }
  if (w.length > 1) {
    const ending = chapterAt(finalOffsets[i]);
    chapterData[ending].finalLengths.push(w.length);
    chapterData[ending].finalCount += Number(w.at(-1) === w.at(-2));
  }
}
assert.equal(chapterData.reduce((n, ch) => n + ch.wordCount, 0), 2896);
assert.equal(chapterData.reduce((n, ch) => n + ch.startCount, 0), 22);
assert.equal(chapterData.reduce((n, ch) => n + ch.finalCount, 0), 19);
const chapterComparisons = chapterData.map((ch, chapter) => {
  const firstLengths = groupLengths(ch.startLengths);
  const lastLengths = groupLengths(ch.finalLengths);
  const bounds = gp.translit.map((name, rune) => {
    const s = chernoff(rune, 'start', ch.startCount, firstLengths);
    const e = chernoff(rune, 'end', ch.finalCount, lastLengths);
    return {name, upper: Math.min(s.bound, e.bound)};
  }).sort((a, b) => b.upper - a.upper);
  return {chapter, words: ch.wordCount,
    startOpportunities: ch.startLengths.length,
    finalOpportunities: ch.finalLengths.length,
    startDoublets: ch.startCount, finalDoublets: ch.finalCount,
    unionUpper: Math.min(1, bounds.reduce((n, x) => n + x.upper, 0)),
    bestSymbol: bounds[0].name};
});
const chapterResetUpper = chapterComparisons.reduce((p, ch) =>
  p * ch.unionUpper, 1);
assert(Math.abs(chapterResetUpper - 0.000047635848401690264) < 1e-9);


/**
 * Rank-spectrum invariant: for any hidden stationary bijection h, the
 * multiset of adjacent ciphertext differences is the multiset of GP
 * plaintext rune counts, with symbol labels permuted. The best possible
 * 29! relabelling is obtained by sorting both spectra (rearrangement).
 *
 * This is a more direct keyless test than the zero-event location test.
 * The observed original source is compared to the pinned, length-matched
 * GP-native English word unigram spectrum. It remains English-conditional.
 *
 * @param {number[]} nativeCounts
 * @param {number[]} differenceCounts
 * @param {number} nativeTotal
 * @returns {{totalVariation:number,kl:number}}
 */
function bestRelabel(nativeCounts, differenceCounts, nativeTotal) {
  const p = nativeCounts.slice().sort((a, b) => b - a)
    .map(n => n / nativeTotal);
  const nDelta = differenceCounts.reduce((s, x) => s + x, 0);
  const q = differenceCounts.slice().sort((a, b) => b - a)
    .map(n => n / nDelta);
  const totalVariation = q.reduce((s, x, i) => s + Math.abs(x - p[i]), 0) / 2;
  const kl = q.reduce((s, x, i) => s + (x > 0 ? x * Math.log(x / p[i]) : 0), 0);
  return {totalVariation, kl};
}

/** @param {Map<number,number>} lengthCount */
function expectedNative(lengthCount) {
  const counts = Array(29).fill(0);
  for (const [length, n] of lengthCount) {
    const bin = bins.get(length);
    assert(bin);
    for (let i = 0; i < 29; i++)
      counts[i] += n * bin.unigram[i] / bin.n;
  }
  return counts;
}
const fullStream = words.flat();
const allDifference = Array(29).fill(0);
for (let i = 1; i < fullStream.length; i++)
  allDifference[(fullStream[i] - fullStream[i - 1] + 29) % 29]++;
const wholeRank = bestRelabel(expectedNative(groupLengths(words.map(w =>
  w.length))), allDifference, fullStream.length);
assert(Math.abs(wholeRank.totalVariation - 0.32811405321425435) < 1e-10);

const chapterRank = [];
for (let ch = 0; ch < visualEnds.length; ch++) {
  const start = ch ? visualEnds[ch - 1] : 0, end = visualEnds[ch];
  const deltas = Array(29).fill(0);
  for (let i = start + 1; i < end; i++)
    deltas[(fullStream[i] - fullStream[i - 1] + 29) % 29]++;
  const lengthCount = new Map();
  for (let w = 0; w < words.length; w++) {
    if (chapterAt(beginnings[w]) !== ch) continue;
    const length = words[w].length;
    lengthCount.set(length, (lengthCount.get(length) || 0) + 1);
  }
  const native = expectedNative(lengthCount);
  const rank = bestRelabel(native, deltas, end - start);
  chapterRank.push({chapter: ch, runes: end - start,
    totalVariation: rank.totalVariation, kl: rank.kl});
}
assert.equal(chapterRank.length, 9);
assert(Math.abs(chapterRank[8].totalVariation - 0.20376379029707836) < 1e-10);
assert(chapterRank.slice(0, 8).every(x => x.totalVariation > 0.27));

// Source-native positive plant with a secret fixed permutation and no
// dependence on the observed LP2 ciphertext. A seeded deterministic sample
// from each length bin must have the expected native-GP unigram shape.
const controlBins = new Map();
for (const w of control) {
  let row = controlBins.get(w.length);
  if (!row) {row = []; controlBins.set(w.length, row);}
  row.push(w);
}
let rng = 0x90331;
function nextInt() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
const plantCounts = Array(29).fill(0);
for (const originalWord of words) {
  const b = controlBins.get(originalWord.length);
  const modelWord = b[nextInt() % b.length];
  // Cipher integrate using h(p)=(p+7) mod29; sorted differences are the
  // GP-native plaintext frequencies regardless of unknown h.
  for (const p of modelWord) plantCounts[(p + 7) % 29]++;
}
const plantRank = bestRelabel(expectedNative(groupLengths(words.map(w =>
  w.length))), plantCounts, fullStream.length);
assert(plantRank.totalVariation < 0.06);
const comparisons = gp.translit.map((name, rune) => {
  const start = chernoff(rune, 'start', observedStart, startGroups);
  const final = chernoff(rune, 'end', observedFinal, finalGroups);
  return {rune, name, expectedStart: start.expected,
    expectedFinal: final.expected,
    jointUpper: Math.min(start.bound, final.bound)};
});
const unionUpper = comparisons.reduce((s, x) => s + x.jointUpper, 0);
comparisons.sort((a, b) => b.jointUpper - a.jointUpper);
assert.equal(comparisons[0].name, 'U');
assert(Math.abs(unionUpper - 0.0000018276376395094553) < 1e-10);

// A nontrivial native-GP positive plant proves the zero-event invariant:
// choose a bijection h(p) = (p - 21) mod29, with h^-1(0) = NG.
const plant = control.slice(0, 300);
let prevCipher = 13, observedNativeZero = 0, expectedNativeZero = 0;
for (const w of plant) {
  for (const plain of w) {
    const cipher = (prevCipher + (plain - 21 + 29) % 29) % 29;
    observedNativeZero += Number(cipher === prevCipher);
    expectedNativeZero += Number(plain === 21);
    prevCipher = cipher;
  }
}
assert.equal(observedNativeZero, expectedNativeZero);
assert(expectedNativeZero > 0, 'positive control must contain NG/ING');

// A second source-native control: the GP spelling must not split -ING/-IO.
assert.deepEqual(encodeSourceNativeGP('FOLLOWING'), [0, 3, 20, 20, 3, 7, 21]);
assert.deepEqual(encodeSourceNativeGP('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);

console.log(JSON.stringify({
  original: {runes: 12956, words: 2896, withinWordDoublets: 63,
    ordinaryWordStartDoublets: observedStart, endOfWordDoublets: observedFinal,
    ordinaryWordStartOpportunities: startLengths.length,
    lastRuneOpportunities: finalLengths.length},
  controlWords: control.length, candidates: comparisons,
  unionUpper, chapterResetUpper, chapterComparisons,
  rankSpectrum: {whole: wholeRank, chapter: chapterRank,
    positivePlant: plantRank}, nativePlantDoublets: observedNativeZero,
  interpretation: 'Conditional English model; no unknown plaintext or key'
}, null, 2));
