'use strict';

/**
 * Fixed 29-page two-cycle test on the original 58-image LP2 release.
 *
 * Inputs: exact source-ordered GP29 corpus, rune transcription and ink marks.
 * Only fixed pairing p<->p+29 is tested. A reproducible 10,000-shuffle
 * right-half permutation supplies descriptive matched-pair controls.
 *
 * No fitted cipher, invented original-page numbers, or file writes.
 * CommonJS / Node.js >= 18.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const parts = read('resources/lp2-transcription.txt').split(/^%\s*$/gm);
const alphabet = new Set(corpus.runes);
assert.equal(corpus.pages.length, 58);
assert.equal(parts.length, 57, 'Numeric p50 has no rune transcription');

/** The canonical text omits runeless p50, restoring its physical index. */
const texts = Array.from({length: 58},
  (_, p) => p === 50 ? '' : parts[p < 50 ? p : p - 1]);

// Source-native word delimiter set. Line/page breaks preserve whole words.
const starts = Array(58).fill(0);
let open = false;
let wordStartPage = -1;
let cipherRunes = 0;
for (let p = 0; p < 58; p++) {
  for (const glyph of texts[p]) {
    if (alphabet.has(glyph)) {
      if (!open) {
        open = true;
        wordStartPage = p;
      }
      if (p < 56) cipherRunes++;
    } else if ('-.$&§'.includes(glyph) && open) {
      starts[wordStartPage]++;
      open = false;
      wordStartPage = -1;
    }
  }
}
if (open) starts[wordStartPage]++;
/** @param {number[]} numbers @returns {number} */
const sum = numbers => numbers.reduce((a, b) => a + b, 0);
/** @param {number[]} numbers @returns {number} */
const avg = numbers => sum(numbers) / numbers.length;
assert.equal(cipherRunes, 12956);
assert.equal(sum(starts.slice(0, 56)), 2896);
assert.equal(sum(starts), 2941);
assert.equal(corpus.pages[50].indices.length, 0);
assert.deepEqual(corpus.pages.slice(56).map(p => p.indices.length), [85, 95]);

const annotations = new Map(ink.pages.map(x => [x.page, x]));
const pages = corpus.pages.map((page, p) => {
  const attrs = annotations.get(p);
  const chars = [...texts[p]];
  const last = chars.findLastIndex(c => alphabet.has(c));
  const suffix = last === -1 ? '' : chars.slice(last + 1).join('');
  const carry = last >= 0 && !/[-.$&§]/u.test(suffix);
  return {
    page: p,
    runeCount: page.indices.length,
    wordsStarting: starts[p],
    redRunes: (attrs?.red_spans || []).reduce((s, a) => s + a.length, 0),
    largePunctuation: (attrs?.large_punctuation || []).length,
    carry,
    first12: page.indices.slice(0, 12),
    last12: page.indices.slice(-12)
  };
});
const left = pages.slice(0, 29), right = pages.slice(29);
const indices = Array.from({length: 29}, (_, i) => i);

/** @param {number[]} a @param {number[]} b */
function correlation(a, b) {
  const meanA = avg(a), meanB = avg(b);
  const top = sum(a.map((v, i) => (v - meanA) * (b[i] - meanB)));
  const sqA = sum(a.map(v => (v - meanA) ** 2));
  const sqB = sum(b.map(v => (v - meanB) ** 2));
  return top / Math.sqrt(sqA * sqB);
}
/** @param {number[]} a @param {number[]} b */
function equalPositions(a, b) {
  return sum(a.map((v, i) => Number(v === b[i])));
}
/** @param {number[]} order @returns {Record<string,number>} */
function statistics(order) {
  const R = order.map(i => right[i]);
  return {
    runeCountCorrelation: correlation(left.map(x => x.runeCount), R.map(x => x.runeCount)),
    runeCountMeanAbsoluteDifference: avg(R.map((x, i) => Math.abs(left[i].runeCount - x.runeCount))),
    exactRuneCountPairs: sum(R.map((x, i) => Number(left[i].runeCount === x.runeCount))),
    wordCountCorrelation: correlation(left.map(x => x.wordsStarting), R.map(x => x.wordsStarting)),
    wordCountMeanAbsoluteDifference: avg(R.map((x, i) => Math.abs(left[i].wordsStarting - x.wordsStarting))),
    first12RuneMatches: sum(R.map((x, i) => equalPositions(left[i].first12, x.first12))),
    last12RuneMatches: sum(R.map((x, i) => equalPositions(left[i].last12, x.last12))),
    redPagesPaired: sum(R.map((x, i) => Number(left[i].redRunes > 0 && x.redRunes > 0))),
    largePunctuationPagesPaired: sum(R.map((x, i) => Number(left[i].largePunctuation > 0 && x.largePunctuation > 0))),
    pageCarryPaired: sum(R.map((x, i) => Number(left[i].carry && x.carry)))
  };
}

let seed = 0x6d2b79f5;
/** Deterministic xorshift32 pseudo-random generator for the null. */
function next32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const observed = statistics(indices);
const nullSamples = Object.fromEntries(Object.keys(observed).map(k => [k, []]));
for (let trial = 0; trial < 10000; trial++) {
  const order = indices.slice();
  for (let i = 28; i > 0; i--) {
    const j = Math.floor(next32() / 4294967296 * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const metrics = statistics(order);
  for (const key of Object.keys(observed)) nullSamples[key].push(metrics[key]);
}
const summary = Object.fromEntries(Object.entries(observed).map(([key, value]) => {
  const samples = nullSamples[key], mean = avg(samples);
  return [key, {
    observed: value,
    shuffledMean: mean,
    shuffledSD: Math.sqrt(avg(samples.map(x => (x - mean) ** 2))),
    shuffledAtLeast: sum(samples.map(x => Number(x >= value))),
    shuffledAtMost: sum(samples.map(x => Number(x <= value))),
    shuffledTotal: samples.length
  }];
}));
assert.equal(observed.exactRuneCountPairs, 2);
assert.equal(observed.first12RuneMatches, 19);
assert.equal(observed.last12RuneMatches, 11);

const equalCountPairs = indices.filter(i => left[i].runeCount === right[i].runeCount)
  .map(i => ({
    physicalPages: [i, i + 29],
    runes: left[i].runeCount,
    wordStarts: [left[i].wordsStarting, right[i].wordsStarting]
  }));
assert.deepEqual(equalCountPairs.map(x => x.physicalPages), [[13, 42], [19, 48]]);

// Original-source folding anchor: signed 2016 THE=72 selects physical
// p14 word1 FOLD under the published conditional 58-page address model.
// This was identified after the ten fixed pair statistics, and is NOT a
// source-selected cipher, key, or newly registered significance test.
/** @param {number} p @returns {string[]} */
function wordTokens(p) {
  const words = [];
  let token = '';
  for (const ch of texts[p]) {
    if (alphabet.has(ch)) token += ch;
    else if ('-.console.log(JSON.stringify({
  scope:§'.includes(ch) && token.length) {
      words.push(token);
      token = '';
    }
  }
  if (token.length) words.push(token);
  return words;
}
const firstWords = Array.from({length: 58}, (_, p) => wordTokens(p)[0] || '');
const lastWords = Array.from({length: 58}, (_, p) => wordTokens(p).at(-1) || '');
/** @param {string} token @returns {string} */
const roman = token => [...token].map(r => corpus.translit[corpus.runes.indexOf(r)]).join('');
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return sum(counts.map(x => x * (x - 1))) / (seq.length * (seq.length - 1));
}
assert.equal(roman(firstWords[14]), 'TJ');
assert.equal(roman(wordTokens(14)[1]), 'FOLD');
assert.equal(roman(firstWords[43]), 'HJ');
assert.equal(roman(lastWords[43]), 'JT');
assert.equal(corpus.pages[14].indices.length, 137);
assert.equal(corpus.pages[43].indices.length, 274);
const crossHalfReversedWordMatches = [];
const crossHalfExactDoubleLengths = [];
for (let p = 0; p < 29; p++) {
  for (let q = 29; q < 58; q++) {
    if (firstWords[p] && firstWords[p] === [...lastWords[q]].reverse().join(''))
      crossHalfReversedWordMatches.push([p, q, roman(firstWords[p])]);
    if (2 * corpus.pages[p].indices.length === corpus.pages[q].indices.length)
      crossHalfExactDoubleLengths.push([p, q]);
  }
}
assert.deepEqual(crossHalfReversedWordMatches, [[14, 43, 'TJ']]);
assert.deepEqual(crossHalfExactDoubleLengths, [[14, 43], [14, 47]]);
const p14 = corpus.pages[14].indices;
const p43 = corpus.pages[43].indices;
const n = p14.length;
const p43first = p43.slice(0, n);
const p43folded = p43.slice(n).reverse();
// The source-selected three-lane alignment is hypothetical. The original
// solved-stage 2013 Shamir precedent motivates exactly one direct GF29
// interpolation test, with A=p14, B=first half, C=folded second half.
// These x=1,2,3 coordinates and extraction are NOT original instructions.
const recovered = p14.map((x, i) => (3 * x - 3 * p43first[i] + p43folded[i] + 29 * 3) % 29);
const known = corpus.pages[57].indices;
const planted = known.map((p, i) => {
  const u = (7 * i + 3) % 29, v = (5 * i + 1) % 29;
  return [1, 2, 3].map(x => (p + u * x + v * x * x) % 29);
});
const control = planted.map(([a, b, c]) => (3 * a - 3 * b + c + 29 * 3) % 29);
assert.deepEqual(control, known);
assert(Math.abs(ioc(recovered) - 0.03424216401889223) < 1e-12);
assert.equal(corpus.prime[corpus.runes.indexOf(firstWords[43][0])]
  + corpus.prime[corpus.runes.indexOf(firstWords[43][1])], 60);
const p43FirstOrdinal29 = corpus.runes.indexOf(firstWords[43][0]) * 29
  + corpus.runes.indexOf(firstWords[43][1]);
assert.equal(p43FirstOrdinal29, 243);
const foldAnchor = {
  sourceAddress: {signedWord: 'THE', gematriaPrimeSum: 72,
    page: 14, wordIndexZeroBased: 1, readout: 'FOLD'},
  midpointPair: [14, 43], runeCounts: [137, 274],
  openingAndMirroredEnding: {p14FirstWord: 'TJ', p43LastWord: 'JT'},
  all841CrossHalfReversedFirstLastWordMatches: crossHalfReversedWordMatches,
  all841CrossHalfDoubleLengthPairs: crossHalfExactDoubleLengths,
  p43FirstWord: {translit: 'HJ', ordinalBase29: p43FirstOrdinal29,
    primeSum: 60, interpretation: 'conditional, no author-specified transport'},
  singleFrozenGF29ThreeShare: {sourceShamirCoefficientOrder: [3, -3, 1],
    realOutputIoC: ioc(recovered), knownEnglishP57IoC: ioc(known),
    positiveRecoveredRunes: control.length, first40: roman(
      recovered.slice(0, 40).map(i => corpus.runes[i]).join(''))}
};

console.log(JSON.stringify({
  scope: 'original p0..p57, fixed p↔p+29 only',
  originalData: {runesUnsolved: cipherRunes, wordsUnsolved: 2896, knownSolved: [85, 95]},
  shuffle: {count: 10000, generator: 'xorshift32', initialSeed: '0x6d2b79f5'},
  equalCountPairs,
  solvedControls: [
    {pages: [27, 56], runeCounts: [left[27].runeCount, right[27].runeCount],
      first12: equalPositions(left[27].first12, right[27].first12),
      last12: equalPositions(left[27].last12, right[27].last12)},
    {pages: [28, 57], runeCounts: [left[28].runeCount, right[28].runeCount],
      first12: equalPositions(left[28].first12, right[28].first12),
      last12: equalPositions(left[28].last12, right[28].last12)}
  ],
  statistics: summary,
  foldAnchor
}, null, 2));
