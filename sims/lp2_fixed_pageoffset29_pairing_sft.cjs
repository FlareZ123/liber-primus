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

// Source-boundary-aware correction to the provisional midpoint fold:
// A page edge is NOT necessarily a printed word boundary; 32 unknown
// GP29 words continue over physical pages. The first/last page fragments
// below are only physical-edge fragments, never claimed whole words.
/** @param {number} p @returns {string[]} */
function pageFragments(p) {
  const parts = [];
  let token = '';
  for (const ch of texts[p]) {
    if (alphabet.has(ch)) token += ch;
    else if ('-.$&§'.includes(ch) && token.length) {
      parts.push(token);
      token = '';
    }
  }
  if (token.length) parts.push(token);
  return parts;
}
const firstFrag = Array.from({length: 58}, (_, p) => pageFragments(p)[0] || '');
const lastFrag = Array.from({length: 58}, (_, p) => pageFragments(p).at(-1) || '');
/** @param {string} token @returns {string} */
const roman = token => [...token].map(r => corpus.translit[corpus.runes.indexOf(r)]).join('');
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return sum(counts.map(x => x * (x - 1))) / (seq.length * (seq.length - 1));
}
assert.equal(roman(firstFrag[14]), 'TJ');
assert.equal(roman(pageFragments(14)[1]), 'FOLD');
assert.equal(roman(firstFrag[43]), 'HJ');
assert.equal(roman(lastFrag[43]), 'JT');
assert.equal(corpus.pages[14].indices.length, 137);
assert.equal(corpus.pages[43].indices.length, 274);
/** @param {number} p @returns {boolean} */
function pendingAtEnd(p) {
  let open = false;
  for (const ch of texts[p]) {
    if (alphabet.has(ch)) open = true;
    else if ('-.$&§'.includes(ch)) open = false;
  }
  return open;
}
/** @param {number} p @returns {boolean} */
function beginsWithRune(p) {
  return [...texts[p]].some(ch => alphabet.has(ch) || '-.$&§'.includes(ch))
    && alphabet.has([...texts[p]].find(ch => alphabet.has(ch) || '-.$&§'.includes(ch)));
}
const carriesInto43 = pendingAtEnd(42) && beginsWithRune(43);
const carriesOutOf43 = pendingAtEnd(43) && beginsWithRune(44);
assert.equal(carriesInto43, true);
assert.equal(carriesOutOf43, true);
const fullIncomingWord = lastFrag[42] + firstFrag[43];
const fullOutgoingWord = lastFrag[43] + firstFrag[44];
const crossHalfReversedEdgeMatches = [];
const crossHalfDoubleLengths = [];
for (let p = 0; p < 29; p++) {
  for (let q = 29; q < 58; q++) {
    if (firstFrag[p] && firstFrag[p] === [...lastFrag[q]].reverse().join(''))
      crossHalfReversedEdgeMatches.push([p, q, roman(firstFrag[p])]);
    if (2 * corpus.pages[p].indices.length === corpus.pages[q].indices.length)
      crossHalfDoubleLengths.push([p, q]);
  }
}
assert.deepEqual(crossHalfReversedEdgeMatches, [[14, 43, 'TJ']]);
assert.deepEqual(crossHalfDoubleLengths, [[14, 43], [14, 47]]);
const p14 = corpus.pages[14].indices;
const p43 = corpus.pages[43].indices;
const n = p14.length;
const p43first = p43.slice(0, n);
const p43folded = p43.slice(n).reverse();
// One exploratory, not author-selected three-lane Shamir interpolation.
// The original failed decoder is retained only as a finite exclusion.
const recovered = p14.map((x, i) => (3 * x - 3 * p43first[i] + p43folded[i] + 29 * 3) % 29);
/**
 * Count source/target equality-pattern disagreements. A fixed secret
 * 29-symbol alphabet bijection MUST preserve every equal/unequal pair.
 * @param {number[]} src @param {number[]} dst
 * @returns {number}
 */
function equalityPatternConflicts(src, dst) {
  let conflicts = 0;
  for (let i = 0; i < src.length; i++)
    for (let k = i + 1; k < src.length; k++)
      conflicts += Number((src[i] === src[k]) !== (dst[i] === dst[k]));
  return conflicts;
}
const allSecretNoFit = {
  p14ToP43FirstHalf: equalityPatternConflicts(p14, p43first),
  p14ToP43FoldedSecondHalf: equalityPatternConflicts(p14, p43folded),
  p43FirstToFoldedSecond: equalityPatternConflicts(p43first, p43folded)
};
assert.deepEqual(Object.values(allSecretNoFit), [604, 622, 634]);
const secretAffinePositive = p14.map(x => (7 * x + 3) % 29);
assert.equal(equalityPatternConflicts(p14, secretAffinePositive), 0);
const known = corpus.pages[57].indices;
const planted = known.map((p, i) => {
  const u = (7 * i + 3) % 29, v = (5 * i + 1) % 29;
  return [1, 2, 3].map(x => (p + u * x + v * x * x) % 29);
});
const control = planted.map(([a, b, c]) => (3 * a - 3 * b + c + 29 * 3) % 29);
assert.deepEqual(control, known);
assert(Math.abs(ioc(recovered) - 0.03424216401889223) < 1e-12);
const p43FirstOrdinal29 = corpus.runes.indexOf(firstFrag[43][0]) * 29
  + corpus.runes.indexOf(firstFrag[43][1]);
assert.equal(p43FirstOrdinal29, 243);
const foldAnchor = {
  sourceAddress: {signedWord: 'THE', gematriaPrimeSum: 72,
    page: 14, wordIndexZeroBased: 1, readout: 'FOLD'},
  midpointPair: [14, 43], runeCounts: [137, 274],
  physicalEdgeFragments: {
    p14FirstFullWord: roman(firstFrag[14]), p43FirstCarryFragment: roman(firstFrag[43]),
    p43LastCarryFragment: roman(lastFrag[43]),
    incomingCarryFromP42: carriesInto43, outgoingCarryToP44: carriesOutOf43,
    actualIncomingFullWord: roman(fullIncomingWord),
    actualOutgoingFullWord: roman(fullOutgoingWord)
  },
  all841CrossHalfReversedPhysicalEdgeMatches: crossHalfReversedEdgeMatches,
  all841CrossHalfDoubleLengthPairs: crossHalfDoubleLengths,
  p43OpeningFragmentNumericCoincidence: {translit: 'HJ',
    ordinalBase29: p43FirstOrdinal29, interpretation: 'part of a carried word, no original transport'},
  allSecretFixedRuneAlphabetGate: allSecretNoFit,
  singleFrozenGF29ThreeShare: {sourceShamirCoefficientOrder: [3, -3, 1],
    realOutputIoC: ioc(recovered), knownEnglishP57IoC: ioc(known),
    positiveRecoveredRunes: control.length}
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
