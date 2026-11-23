"use strict";
/**
 * Independent, source-exact capacity gate for two combined LP2 physical channels.
 *
 * Hypothesis: all 16 source-observed red run starts are anchored to their
 * existing physical page/rune offsets; each run's end may move anywhere up
 * to its own page's last rune (or disappear), while all 175 punctuation
 * positions are fixed and their eight visual types may be permuted.
 * The page's original length stays fixed. This grants more color freedom
 * than actual drawings and permits all impossible run overlaps.
 *
 * Run: node sims/lp2_anchored_red_punct_combined_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const punct = read("resources/liber-primus/lp2-punctuation-identity.json");
const pages = corpus.pages.filter(p => p.page <= 55);
const nRunes = pages.reduce((sum, p) => sum + p.indices.length, 0);
const nTransitions = nRunes - pages.filter(p => p.indices.length > 0).length;
let repeats = 0;
for (const p of pages)
  for (let i = 1; i < p.indices.length; i++)
    if (p.indices[i] === p.indices[i - 1]) repeats++;
assert.equal(nRunes, 12956);
assert.equal(nTransitions, 12901);
assert.equal(repeats, 86);

const spans = ink.pages.filter(p => p.page <= 55)
  .flatMap(p => (p.red_spans || []).map(s => ({
    page: p.page, start: s.start, observedLength: s.length,
    pageLength: pages[p.page].indices.length
  })));
assert.equal(spans.length, 16);
assert.equal(spans.reduce((sum, s) => sum + s.observedLength, 0), 213);
let redCapacity = 0;
for (const s of spans) {
  assert.ok(s.start >= 0 && s.start + s.observedLength <= s.pageLength);
  // Inclusion of zero-length runs and overlaps deliberately overcounts.
  redCapacity += Math.log2(s.pageLength - s.start + 1);
}

const m = punct.source_audit.morphology;
assert.deepEqual(punct.image_audit.editorial_event_indices, [57,58,59,60]);
assert.equal(m.stop_absent, 1);
const categoryCounts = [
  m.stop_four_dot_diamonds.black,
  m.stop_four_dot_diamonds.red,
  m.stop_three_dot_comma_form,
  m.stop_single_dot_ambiguous,
  m.comma_three_dot_zigzags,
  27, 1, 3
];
const markCount = categoryCounts.reduce((a, b) => a + b, 0);
assert.equal(markCount, 175);
assert.equal(ink.pages.filter(p => p.page <= 55)
  .flatMap(p => p.large_punctuation || []).length, 31);

/** @param {number} n */
function logFactorial(n) {
  let v = 0;
  for (let i = 2; i <= n; i++) v += Math.log(i);
  return v;
}
/** @param {number} n @param {number} k */
function log2Choose(n, k) {
  assert.ok(k >= 0 && k <= n);
  return (logFactorial(n) - logFactorial(k) -
    logFactorial(n - k)) / Math.LN2;
}
const typedCapacity = (logFactorial(markCount) -
  categoryCounts.reduce((a, c) => a + logFactorial(c), 0)) / Math.LN2;

/** @param {number} n @param {number} k */
function logBinomialCdf(n, k) {
  const p = 1 / 29;
  const logs = [];
  let term = n * Math.log1p(-p);
  for (let i = 0; i <= k; i++) {
    logs.push(term);
    term += Math.log(n - i) - Math.log(i + 1) +
      Math.log(p / (1 - p));
  }
  const max = Math.max(...logs);
  return max + Math.log(logs.reduce((sum, t) => sum + Math.exp(t - max), 0));
}

const deficit = -logBinomialCdf(nTransitions, repeats) / Math.LN2;
const freeRedAndFixedMark = redCapacity + typedCapacity;
const restrictedRedCount = log2Choose(212, 15) + typedCapacity;
assert.deepEqual(punct.comma_events.map(e => e.page), [5, 11, 20, 46]);
const mobileCommaCapacity = punct.comma_events.reduce((sum, e) =>
  sum + Math.log2(pages[e.page].indices.length + 1), 0);
const fourMobileCommaTotal = freeRedAndFixedMark + mobileCommaCapacity;

assert.ok(Math.abs(deficit - 325.450254) < 0.00001);
assert.ok(Math.abs(redCapacity - 114.55468057589805) < 0.000001);
assert.ok(Math.abs(typedCapacity - 176.57877078182) < 0.000001);
assert.equal(Math.ceil(deficit - freeRedAndFixedMark), 35);
assert.equal(Math.ceil(deficit - restrictedRedCount), 74);
assert.ok(Math.abs(mobileCommaCapacity - 32.301390840723684) < 0.000001);
assert.equal(Math.ceil(deficit - fourMobileCommaTotal), 3);
assert.equal(Math.ceil(deficit - restrictedRedCount - mobileCommaCapacity), 42);

console.log(JSON.stringify({
  originalRunes: nRunes,
  withinPageTransitions: nTransitions,
  equalAdjacent: repeats,
  anchoredRedStarts: spans.map(s => [s.page, s.start, s.observedLength]),
  anchoredRedFreeLengthCapacityBitsUpperBound: redCapacity,
  fixedSitePunctuationTypesCapacityBitsUpperBound: typedCapacity,
  combinedCapacityBitsUpperBound: freeRedAndFixedMark,
  universalAtMost86RepeatDeficitBits: deficit,
  minimumExternalBitsRequired: Math.ceil(deficit - freeRedAndFixedMark),
  allFourCommaMarksMobileWithinOriginalPagesCapacityBitsUpperBound:
    mobileCommaCapacity,
  combinedWithFourMobileCommaMarksCapacityBitsUpperBound: fourMobileCommaTotal,
  minimumOtherBitsEvenWithFourMobileCommaMarks:
    Math.ceil(deficit - fourMobileCommaTotal),
  preserving213RedGlyphsCombinedBitsUpperBound: restrictedRedCount,
  preserving213RedGlyphsMinimumExternalBitsRequired:
    Math.ceil(deficit - restrictedRedCount),
  preservingRedCountAndMobileFourCommasAdditionalBitsRequired:
    Math.ceil(deficit - restrictedRedCount - mobileCommaCapacity),
  decision: "Anchored red lengths + fixed-site punctuation identities are insufficient as a universal same-length GP29 anti-repeat sidecar"
}, null, 2));