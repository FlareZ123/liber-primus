"use strict";
/**
 * The two source-authentic red triple spans have GP-prime sums 137 and 173.
 * Their one-based prime ranks 33 and 40 point at two 121-rune source spans
 * when applied as one-based LP2 physical-page addresses.
 * Also report the competing zero-based page-index interpretation.
 *
 * This reproduces exact source facts and one candidate address grammar;
 * it does not establish an author's choice of indexing or a decoder.
 *
 * Run: node sims/lp2_red3_prime_rank_121_selector_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {number} prime @returns {number} */
function primeRank(prime) {
  assert.ok(isPrime(prime));
  let result = 0;
  for (let value = 2; value <= prime; value++) if (isPrime(value)) result++;
  return result;
}

/** @param {number} page @returns {{page:number,indices:number[]}} */
function sourcePage(page) {
  const record = corpus.pages.find((p) => p.page === page);
  assert.ok(record, `missing p${page}`);
  assert.equal(record.indices.length, record.runic_count);
  return record;
}

const spans = ink.pages.flatMap((p) =>
  (p.red_spans || []).filter((span) => span.length === 3)
    .map((span) => ({ page: p.page, offset: span.start, sourceRunes: span.runes }))
);
assert.equal(spans.length, 2, "The source red3 marker must be unique to this pair");
assert.deepEqual(spans.map((s) => [s.page, s.offset]), [[3, 119], [39, 119]]);

const signals = spans.map((s) => {
  const c = sourcePage(s.page).indices.slice(s.offset, s.offset + 3);
  assert.equal(c.length, 3);
  const sum = c.reduce((total, glyph) => total + corpus.prime[glyph], 0);
  assert.ok(isPrime(sum), `triple at p${s.page}:119 does not sum to prime`);
  const rank = primeRank(sum);
  const oneBasedTarget = sourcePage(rank - 1); // human page 1 is physical p0
  return {
    sourcePhysicalPage: s.page,
    sourceLocalRune: s.offset,
    glyphIndices: c,
    gpPrimeWeights: c.map((n) => corpus.prime[n]),
    primeWeightSum: sum,
    oneBasedPrimeRank: rank,
    oneBasedTargetPhysical: oneBasedTarget.page,
    oneBasedTargetPageRunes: oneBasedTarget.runic_count,
    zeroBasedTargetPhysical: rank
  };
});
assert.deepEqual(signals.map((s) => [
  s.sourcePhysicalPage, s.glyphIndices.join(","), s.primeWeightSum,
  s.oneBasedPrimeRank, s.oneBasedTargetPhysical, s.zeroBasedTargetPhysical
]), [
  [3, "13,23,2", 137, 33, 32, 33],
  [39, "27,5,15", 173, 40, 39, 40]
]);
assert.equal(signals[0].oneBasedTargetPageRunes, 121);
const secondTarget = sourcePage(signals[1].oneBasedTargetPhysical);
assert.equal(secondTarget.runic_count, 240);
assert.equal(ink.pages.find((p) => p.page === 39)
  .red_spans.some((s) => s.start === 119 && s.length === 3), true);
assert.equal(secondTarget.runic_count - spans[1].offset, 121);
assert.equal(signals[1].zeroBasedTargetPhysical - signals[0].zeroBasedTargetPhysical, 7);

// The printed second p39 unit has a visible paragraph break at 119.
// Test the rune count as a source fact, *not* an inferred 11x11 grid.
const raw = fs.readFileSync(path.join(__dirname, "..",
  "resources", "lp2-transcription.txt"), "utf8");
const page39Printed = raw.split("%")[39];
const printedFragments = page39Printed.split("&");
const countRunes = (text) => [...text].filter((c) =>
  /[\u16A0-\u16FF]/u.test(c)).length;
assert.ok(printedFragments.length >= 2);
assert.equal(countRunes(printedFragments[0]), 119);
assert.equal(countRunes(printedFragments[1]), 121);
const words = printedFragments[1].replace(/\/\s*/g, "")
  .split(/[\s.%$&§-]+/)
  .filter((word) => /^[\u16A0-\u16FF]+$/u.test(word));
assert.equal(words.length, 29);
console.log(JSON.stringify({
  source: "original red spans + canonical GP prime weights + original page coordinates",
  signals,
  one_based_candidate: "selects entire 121-rune p32 and 121-rune marked second p39 unit",
  zero_based_competitor: "selects p33 and p40, bracketing the seven p33-p39 cuneiform pages",
  second_p39_unit_words: words.length,
  status: "Exact source correspondence; page address grammar and decoding operator not authenticated"
}, null, 2));
