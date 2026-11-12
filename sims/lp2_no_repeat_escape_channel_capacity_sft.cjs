"use strict";
/**
 * Quantify source-visible word-boundary and red/special side-channel capacity
 * against the exact LP2 29-to-28 no-repeat injectivity deficits.
 *
 * Run: node sims/lp2_no_repeat_escape_channel_capacity_sft.cjs
 *
 * This is a capacity upper bound, not a proposed encoder. It does not assume
 * that all syntactically possible boundary placements are linguistically
 * available or that the author used them as a carrier.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const RUNIC = /[\u16A0-\u16FF]/u;

function log2Choose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  const m = Math.min(k, n - k);
  let result = 0;
  for (let i = 1; i <= m; i++) {
    result += Math.log2(n - m + i) - Math.log2(i);
  }
  return result;
}
function log2Multinomial(counts) {
  let remaining = counts.reduce((sum, value) => sum + value, 0);
  let result = 0;
  for (const count of counts) {
    result += log2Choose(remaining, count);
    remaining -= count;
  }
  return result;
}
function log2Pmf(n, k, p = 1 / 29) {
  return log2Choose(n, k) + k * Math.log2(p) + (n - k) * Math.log2(1 - p);
}
function log2Sum(values) {
  const maximum = Math.max(...values);
  return maximum + Math.log2(values.reduce((sum, value) =>
    sum + 2 ** (value - maximum), 0));
}
function log2Cdf(n, k) {
  return log2Sum(Array.from({length: k + 1}, (_, j) => log2Pmf(n, j)));
}

const transcript = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const segments = transcript.split("%").slice(0, 55);
assert.equal(segments.length, 55);

const pages = segments.map((segment, index) => {
  // The transcription omits the runeless physical grid page 50.
  const physicalPage = index < 50 ? index : index + 1;
  const chars = [...segment];
  const runePositions = [];
  for (let i = 0; i < chars.length; i++) {
    if (RUNIC.test(chars[i])) runePositions.push(i);
  }
  const indices = corpus.pages.find(page => page.page === physicalPage).indices;
  const runes = runePositions.length;
  assert.equal(runes, indices.length, "transcription/corpus rune count mismatch");

  // Count explicit typographic word-boundary punctuation between runes:
  // hyphen, period, ampersand, dollar, or section sign. Slash/whitespace
  // and numeric labels are not treated as word-boundary events.
  const boundaryTypes = {};
  for (let i = 1; i < runePositions.length; i++) {
    const between = chars.slice(runePositions[i - 1] + 1, runePositions[i]);
    const delimiter = between.filter(ch => ".-&$§".includes(ch)).join("");
    if (delimiter) boundaryTypes[delimiter] = (boundaryTypes[delimiter] || 0) + 1;
  }
  const wordBoundaries = Object.values(boundaryTypes)
    .reduce((sum, value) => sum + value, 0);
  const steps = runes - 1;
  const repeats = indices.slice(1).filter((value, i) => value === indices[i]).length;
  const boundaryPositionBits = log2Choose(steps, wordBoundaries);
  const boundaryTypeBits = log2Multinomial(Object.values(boundaryTypes));
  const atMostRepeatDeficit = -log2Cdf(steps, repeats);
  const exactRepeatDeficit = -log2Pmf(steps, repeats);
  const fixedMaskDeficit =
    (steps - repeats) * Math.log2(29 / 28) + repeats * Math.log2(29);

  return {
    page: physicalPage,
    runes,
    steps,
    repeats,
    wordBoundaries,
    boundaryPositionBits,
    boundaryTypeBits,
    atMostRepeatDeficit,
    exactRepeatDeficit,
    fixedMaskDeficit,
    boundaryTypes
  };
});

const total = field => pages.reduce((sum, page) => sum + page[field], 0);
const runes = total("runes");
const steps = total("steps");
const repeats = total("repeats");
const wordBoundaries = total("wordBoundaries");
assert.deepEqual([runes, steps, repeats, wordBoundaries],
  [12956, 12901, 86, 2873]);

const globalAtMostDeficit = -log2Cdf(steps, repeats);
const globalExactDeficit = -log2Pmf(steps, repeats);
const perPageAtMostDeficit = total("atMostRepeatDeficit");
const perPageExactDeficit = total("exactRepeatDeficit");
const fixedMaskDeficit = total("fixedMaskDeficit");
const wordBoundaryPositionBits = total("boundaryPositionBits");
const wordBoundaryTypeBits = total("boundaryTypeBits");

const unknownInkPages = ink.pages.filter(page => page.page <= 55);
const redSpans = unknownInkPages.flatMap(page => page.red_spans || []);
const largeMarks = unknownInkPages.flatMap(page => page.large_punctuation || []);
const redRuneCount = redSpans.reduce((sum, span) => sum + span.length, 0);
const redSpanCount = redSpans.length;
const largeMarkCount = largeMarks.length;
const markStates = {};
for (const mark of largeMarks) {
  const key = mark[1] + "-" + mark[2];
  markStates[key] = (markStates[key] || 0) + 1;
}
// Deliberately overgenerous: every red rune independently chooses red/black,
// and every large mark independently chooses one of 2 dot sizes x 2 colors.
const redSpecialBitsCeiling = redRuneCount + 2 * largeMarkCount;
const blockLevelRedSpecialBitsCeiling = redSpanCount + 2 * largeMarkCount;

assert.equal(redRuneCount, 213);
assert.equal(redSpanCount, 16);
assert.equal(largeMarkCount, 31);
assert.equal(redSpecialBitsCeiling, 275);
assert(wordBoundaryPositionBits > fixedMaskDeficit);
assert(wordBoundaryPositionBits > perPageExactDeficit);
assert(pages.every(page =>
  page.boundaryPositionBits > page.fixedMaskDeficit &&
  page.boundaryPositionBits > page.atMostRepeatDeficit));

const delimiterTotals = {};
for (const page of pages) {
  for (const [type, count] of Object.entries(page.boundaryTypes)) {
    delimiterTotals[type] = (delimiterTotals[type] || 0) + count;
  }
}
assert.deepEqual(delimiterTotals, {"-": 2708, ".": 153, ".&": 6, "--": 1, ".&$": 1, ".-": 4});

console.log(JSON.stringify({
  scope: "55 unsolved rune-bearing physical pages p0-p49 and p51-p55; p50 is the runeless grid",
  sourceChecks: {
    transcriptionRuneCount: runes,
    corpusRuneCount: 12956,
    withinPageTransitions: steps,
    adjacentRepeats: repeats,
    wordBoundaryGaps: wordBoundaries,
    delimiters: delimiterTotals
  },
  exactNoRepeatDeficitsBits: {
    globalAtMost86: globalAtMostDeficit,
    globalExactly86: globalExactDeficit,
    perPageAtMostObservedCounts: perPageAtMostDeficit,
    perPageExactlyObservedCounts: perPageExactDeficit,
    fixedObservedRepeatMask: fixedMaskDeficit
  },
  sourceVisibleChannelUpperBoundsBits: {
    wordBoundaryPositionsPerPageFixedCounts: wordBoundaryPositionBits,
    wordBoundarySeparatorTypePermutationsPerPage: wordBoundaryTypeBits,
    redRuneColorsPlusLargeMarkStatesOvergenerous: redSpecialBitsCeiling,
    redSpanBlocksPlusLargeMarkStates: blockLevelRedSpecialBitsCeiling
  },
  redSpecialInventory: {
    redRunes: redRuneCount,
    distinctRedSpans: redSpanCount,
    largePunctuationMarks: largeMarkCount,
    markStates,
    copiedFloralArtCounted: false
  },
  decision: {
    redSpecialAloneCanCoverGlobalAtMost86: redSpecialBitsCeiling >= globalAtMostDeficit,
    wordBoundaryPositionCapacityCoversFixedMask: wordBoundaryPositionBits >= fixedMaskDeficit,
    everyPageWordBoundaryCapacityCoversItsFixedMaskDeficit: pages.every(page =>
      page.boundaryPositionBits >= page.fixedMaskDeficit),
    conclusion: "No capacity contradiction: red/special color/mark choices alone fall short even under an overgenerous ceiling, while word-boundary position capacity is ample. This establishes only a combinatorial upper bound; no source-selected reversible mapping from plaintext to boundary placement has been identified."
  },
  perPage: pages.map(page => ({
    page: page.page,
    runes: page.runes,
    repeats: page.repeats,
    wordBoundaries: page.wordBoundaries,
    boundaryPositionBits: Number(page.boundaryPositionBits.toFixed(3)),
    atMostRepeatDeficitBits: Number(page.atMostRepeatDeficit.toFixed(3)),
    exactRepeatDeficitBits: Number(page.exactRepeatDeficit.toFixed(3)),
    fixedMaskDeficitBits: Number(page.fixedMaskDeficit.toFixed(3)),
    boundaryTypes: page.boundaryTypes
  }))
}, null, 2));
