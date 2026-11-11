"use strict";
/**
 * LP2 p53 red source-prime sum versus the independently sourced signed 2016
 * tree-image dimensions and the original p32 11x11 prime axis.
 *
 * This is a finite cross-artifact arithmetic test, NOT a decryption.
 * Runs with Node.js 22 against repository originals; no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const decodeJpeg = require("./vendor/jpeg-js-decoder.cjs");

const root = path.resolve(__dirname, "..");
const readJSON = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const redSource = readJSON("resources/liber-primus/lp2-page53-red-span.json");
const ink = readJSON("resources/liber-primus/lp2-ink-annotations.json");
const signedJpeg = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25.jpg"));
const image = decodeJpeg(signedJpeg, {
  useTArray: true, formatAsRGBA: false, maxResolutionInMP: 2
});
const {width, height} = image;
assert.deepEqual([width, height], [563, 569]);
assert.equal(signedJpeg.length, 26342);

const page32 = corpus.pages.find(p => p.page === 32).indices;
const page53 = corpus.pages.find(p => p.page === 53).indices;
assert.equal(page32.length, 121);
assert.equal(page53.length, 179);
const prime = i => corpus.prime[i];
const sum = values => values.reduce((a, b) => a + b, 0);
const rowPrimeSum = sum(page32.slice(0, 11).map(prime));
const columnPrimeSum = sum(Array.from({length: 11}, (_, r) => prime(page32[11 * r])));
assert.deepEqual([rowPrimeSum, columnPrimeSum], [width, height]);

const red = redSource.red_text;
assert.deepEqual([red.start_rune_inclusive, red.end_rune_exclusive, red.rune_count],
  [128, 179, 51]);
const page53Ink = ink.pages.find(p => p.page === 53);
assert.deepEqual(page53Ink.red_spans.map(s => [s.start, s.length]), [[128, 51]]);
const indices = page53.slice(128);
assert.equal(indices.map(i => corpus.runes[i]).join(""), red.runes);
const weights = indices.map(prime);
const actual = sum(weights);
const lRouteLength = width + height - 1;
const twoRoutes = 2 * lRouteLength;
assert.equal(actual, 2262);
assert.equal(lRouteLength, 1131);
assert.equal(actual, twoRoutes);
assert.equal(actual % 29, 0);

let partial = 0;
const prefixes = weights.map((value, index) =>
  ({runeCount: index + 1, primeSum: partial += value}));
const prefixSplit = prefixes.filter(x => x.primeSum === lRouteLength);
assert.equal(prefixSplit.length, 0);
const wordCuts = [];
let wordEnd = 0;
for (const n of red.word_lengths) {
  wordEnd += n;
  wordCuts.push(prefixes[wordEnd - 1]);
}
assert.equal(wordEnd, 51);
const lineCuts = [];
let lineEnd = 0;
for (const n of red.line_rune_counts) {
  lineEnd += n;
  lineCuts.push(prefixes[lineEnd - 1]);
}
assert.equal(lineEnd, 51);
const paritySums = [
  sum(weights.filter((_, i) => i % 2 === 0)),
  sum(weights.filter((_, i) => i % 2 !== 0))
];
assert.deepEqual(paritySums, [1095, 1167]);
const nearestHalf = [...prefixes].sort((a, b) =>
  Math.abs(a.primeSum - lRouteLength) - Math.abs(b.primeSum - lRouteLength))[0];

/** Repeatable, bounded source-inventory conditional shuffle diagnostic. */
let seed = 0x33012016;
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const randomized = page53.map(prime);
const trials = 200000;
let exactCount = 0;
for (let trial = 0; trial < trials; trial++) {
  for (let j = 0; j < 51; j++) {
    const k = j + random32() % (179 - j);
    [randomized[j], randomized[k]] = [randomized[k], randomized[j]];
  }
  if (sum(randomized.slice(0, 51)) === twoRoutes) exactCount++;
}
const sameLengthWindowHits = [];
const primePage53 = page53.map(prime);
for (let start = 0; start + 51 <= primePage53.length; start++) {
  if (sum(primePage53.slice(start, start + 51)) === twoRoutes)
    sameLengthWindowHits.push(start);
}
assert.deepEqual(sameLengthWindowHits, [128]);

const report = {
  classification: "exact cross-artifact arithmetic / no established cipher",
  signed2016ImageDimensions: [width, height],
  page32PrimeAxes: [rowPrimeSum, columnPrimeSum],
  naturalCornerToCornerPixelVisits: lRouteLength,
  twiceCornerToCornerVisits: twoRoutes,
  conventionalImagePixelPerimeter: 2 * (width + height) - 4,
  sourceP53RedSpan: {page: 53, start: 128, runes: 51, primeSum: actual},
  exactArithmetic: "2262 = 2*(563+569-1) = 2*29*39 = 29*78",
  sourceWindowHits: sameLengthWindowHits,
  naturalAtomicSplitAtHalf: prefixSplit,
  closestPrefixToHalf: nearestHalf,
  naturalWordCutSums: wordCuts.map(x => x.primeSum),
  naturalPrintedLineCutSums: lineCuts.map(x => x.primeSum),
  alternatingLaneSums: paritySums,
  null: {
    model: "random 51-of-179 page53 prime labels without replacement",
    seed: "0x33012016",
    trials,
    exactCount,
    plusOneExactProbability: (exactCount + 1) / (trials + 1),
    caveat: "conditional inventory diagnostic, not a discovery-wide p-value"
  },
  conclusion: "The numeric overlap supplies no source-selected walk, route split, ciphertext inverse or plaintext."
};
console.log(JSON.stringify(report, null, 2));
