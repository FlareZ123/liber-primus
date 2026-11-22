"use strict";
/**
 * Original-input, source-order 86-doublet/86-quote-word book-code test and
 * continuous-word-boundary repeat gate.
 * Run as a single test file with Node 22 from any working directory.
 * The event/word match is exploratory, not an authenticated key instruction.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceText = read("resources/liber-primus/lp2-transcription.txt");
const quoteData = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const runeNumber = new Map(corpus.runes.map((v, i) => [v, i]));
const original = corpus.pages.filter((p) => p.page <= 55);
const allValues = corpus.pages.flatMap((p) => p.indices);
const fromText = [];
const charPositions = [];
const words = [];
let current = [];
let currentStart = 0;
for (let ch = 0; ch < sourceText.length; ch += 1) {
  const symbol = sourceText[ch];
  if (runeNumber.has(symbol)) {
    if (current.length === 0) currentStart = fromText.length;
    current.push(runeNumber.get(symbol));
    fromText.push(runeNumber.get(symbol));
    charPositions.push(ch);
  } else if ("-.$&§".includes(symbol) && current.length) {
    words.push({start: currentStart, end: fromText.length, values: current});
    current = [];
  }
}
if (current.length) {
  words.push({start: currentStart, end: fromText.length, values: current});
}
assert.deepEqual(fromText, allValues);
assert.equal(original.reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(words.filter((w) => w.end <= 12956).length, 2896);
const quoteWordsBySpan = quoteData.quotes.map((span) =>
  words.filter((w) => w.start >= span.start && w.end <= span.end));
const quoteWordCounts = quoteWordsBySpan.map((a) => a.length);
assert.deepEqual(quoteWordCounts, [4, 5, 2, 14, 13, 34, 14]);
const quoteWords = quoteWordsBySpan.flat();
assert.equal(quoteWords.length, 86);
assert.equal(quoteWords.reduce((s, w) => s + w.values.length, 0), 405);
const sixth = quoteWordsBySpan[5].map((w) => w.values.length);
assert.deepEqual(sixth, [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5]);
const punctuationSplit = quoteWordsBySpan[5].filter((w) => w.end === 10320);
assert.equal(punctuationSplit.length, 1);
assert.equal(punctuationSplit[0].values.length, 3);
assert.ok(sourceText.slice(charPositions[10319] + 1, charPositions[10320]).includes("."));
let pageStart = 0;
const boundaryPairsByPage = [];
const events = [];
let boundaryEqual = 0;
let boundaryTotal = 0;
let interiorEqual = 0;
let interiorTotal = 0;
for (const page of original) {
  const preceding = [];
  const succeeding = [];
  for (let local = 1; local < page.indices.length; local += 1) {
    const absolute = pageStart + local;
    const prev = page.indices[local - 1];
    const next = page.indices[local];
    const separator = sourceText.slice(charPositions[absolute - 1] + 1,
      charPositions[absolute]);
    const boundary = separator.includes("-") || separator.includes(".");
    if (boundary) {
      preceding.push(prev);
      succeeding.push(next);
      boundaryTotal += 1;
      if (prev === next) boundaryEqual += 1;
    } else {
      interiorTotal += 1;
      if (prev === next) interiorEqual += 1;
    }
    if (prev === next) {
      events.push({page: page.page, offset: local, global: absolute, value: next});
    }
  }
  boundaryPairsByPage.push({preceding, succeeding});
  pageStart += page.indices.length;
}
assert.deepEqual([interiorEqual, interiorTotal, boundaryEqual, boundaryTotal],
  [63, 10028, 23, 2873]);
assert.equal(events.length, 86);
assert.equal(boundaryTotal + interiorTotal, 12901);
/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const bins = Array(29).fill(0);
  for (const v of values) bins[v] += 1;
  return bins.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
const rawControls = corpus.pages[57].indices.slice(0, 86);
assert.ok(indexOfCoincidence(rawControls) > 0.055);
const candidateKeys = [
  ["GP-rune-index", (e, len) => e.value % len],
  ["GP-prime-index-0based", (e, len) => corpus.prime[e.value] % len],
  ["GP-prime-index-1based", (e, len) => (corpus.prime[e.value] - 1) % len]
];
const decoded = [];
for (const [label, select] of candidateKeys) {
  const answer = quoteWords.map((w, i) =>
    w.values[select(events[i], w.values.length)]);
  const ioc = indexOfCoincidence(answer);
  assert.ok(ioc < 0.040, label + " did not meet negative gate");
  const planted = quoteWords.map((w) => w.values.slice());
  for (let i = 0; i < 86; i += 1) {
    planted[i][select(events[i], planted[i].length)] = rawControls[i];
  }
  const recovered = planted.map((w, i) =>
    w[select(events[i], w.length)]);
  assert.deepEqual(recovered, rawControls);
  decoded.push({selector: label, ioc, transliteration:
    answer.map((n) => corpus.translit[n]).join(""),
    plantedRecovered: recovered.length});
}
let rng = 0x43c1d27f >>> 0;
/** @returns {number} */
function random() {
  rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5;
  return (rng >>> 0) / 4294967296;
}
let lower = 0;
let min = Infinity;
let max = -Infinity;
let sum = 0;
const samples = 10000;
for (let sample = 0; sample < samples; sample += 1) {
  let matches = 0;
  for (const pair of boundaryPairsByPage) {
    const moved = pair.succeeding.slice();
    for (let i = moved.length - 1; i > 0; i -= 1) {
      const k = Math.floor(random() * (i + 1));
      [moved[i], moved[k]] = [moved[k], moved[i]];
    }
    for (let i = 0; i < moved.length; i += 1) {
      if (pair.preceding[i] === moved[i]) matches += 1;
    }
  }
  sum += matches;
  min = Math.min(min, matches);
  max = Math.max(max, matches);
  if (matches <= boundaryEqual) lower += 1;
}
assert.equal(lower, 0);
const result = {
  originalRunes: pageStart, originalWordCount: 2896,
  quoteSpans: quoteData.quotes.length, quoteWordCounts, quotedRunes: 405,
  distinctDoubletEvents: events.length,
  wordBoundaryPairs: {equal: boundaryEqual, total: boundaryTotal},
  withinWordPairs: {equal: interiorEqual, total: interiorTotal},
  wordBoundaryPermutation: {samples, seed: "0x43c1d27f",
    mean: sum / samples, minimum: min, maximum: max,
    atOrBelowOriginal: lower, addOneP: (lower + 1) / (samples + 1)},
  solvedP57First86Ioc: indexOfCoincidence(rawControls),
  directSourceOrderQuoteReadouts: decoded,
  conclusion: "Fixed source-order 86-word book-code readings are nonlinguistic. Word-breaks do not restore independent random symbol starts under the within-page matched shuffle. Neither result identifies a key or decrypts an unknown page."
};
console.log(JSON.stringify(result, null, 2));
