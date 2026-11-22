"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"
));
const annotations = new Map(ink.pages.map(p => [p.page, p]));
const M = 29;
const mod = x => ((x % M) + M) % M;

function metrics(units) {
  let n = 0, numerator = 0, denominator = 0;
  let adjacentEqual = 0, transitions = 0;
  for (const unit of units) {
    const a = unit.values;
    n += a.length;
    denominator += a.length * (a.length - 1);
    const freq = Array(M).fill(0);
    for (const x of a) freq[x]++;
    numerator += freq.reduce((s, x) => s + x * (x - 1), 0);
    for (let i = 1; i < a.length; i++) {
      transitions++;
      if (a[i] === a[i - 1]) adjacentEqual++;
    }
  }
  return {
    runes: n,
    withinUnitIoC: denominator ? numerator / denominator : 0,
    adjacentEqual,
    transitions,
    adjacentEqualRate: transitions ? adjacentEqual / transitions : 0
  };
}

function prepare() {
  const redPages = [];
  let redRuneCount = 0, redSpanCount = 0;
  for (const page of corpus.pages.filter(p => p.page < 56 && p.indices.length > 0)) {
    const spans = (annotations.get(page.page)?.red_spans || [])
      .slice().sort((a, b) => a.start - b.start);
    if (!spans.length) continue;
    redSpanCount += spans.length;
    redRuneCount += spans.reduce((s, x) => s + x.length, 0);
    redPages.push({page, spans});
  }
  assert.equal(redPages.length, 13);
  assert.equal(redSpanCount, 16);
  assert.equal(redRuneCount, 213);
  return {redPages, redSpanCount, redRuneCount};
}

function run(mode, reverseEachSpan, sign, redPages) {
  const units = [];
  const baseline = [];
  for (const {page, spans} of redPages) {
    const redPositions = new Set();
    const keys = spans.map(span => {
      const symbols = page.indices.slice(span.start, span.start + span.length);
      assert.equal(symbols.length, span.length);
      assert.equal(symbols.map(i => corpus.runes[i]).join(""), span.runes);
      for (let i = span.start; i < span.start + span.length; i++) redPositions.add(i);
      return reverseEachSpan ? symbols.slice().reverse() : symbols;
    });

    if (mode === "page-key") {
      const key = keys.flat();
      const black = page.indices.filter((_, i) => !redPositions.has(i));
      baseline.push({page: page.page, values: black});
      units.push({
        page: page.page,
        values: black.map((x, i) => mod(x + sign * key[i % key.length]))
      });
      continue;
    }

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      const end = spans[i + 1]?.start ?? page.indices.length;
      const segment = [];
      for (let j = span.start + span.length; j < end; j++) {
        if (!redPositions.has(j)) segment.push(page.indices[j]);
      }
      if (!segment.length) continue;
      baseline.push({page: page.page, span: i, values: segment});
      const key = keys[i];
      units.push({
        page: page.page,
        span: i,
        values: segment.map((x, j) => mod(x + sign * key[j % key.length]))
      });
    }
  }
  return {units, baseline};
}

const {redPages, redSpanCount, redRuneCount} = prepare();
const pageBaseline = run("page-key", false, 1, redPages).baseline;
const spanBaseline = run("span-to-following", false, 1, redPages).baseline;
const candidates = [];

for (const mode of ["page-key", "span-to-following"]) {
  for (const reverseEachSpan of [false, true]) {
    for (const sign of [1, -1]) {
      const result = run(mode, reverseEachSpan, sign, redPages);
      candidates.push({
        mode,
        redSpanOrientation: reverseEachSpan ? "each-span-reversed" : "each-span-forward",
        operation: sign === 1 ? "black + red-key mod29" : "black - red-key mod29",
        metrics: metrics(result.units)
      });
    }
  }
}

const p57 = corpus.pages.find(p => p.page === 57);
assert(p57);
const baseline = {
  pageKeyBlack: metrics(pageBaseline.map(x => ({values:x.values}))),
  spanFollowingBlack: metrics(spanBaseline.map(x => ({values:x.values}))),
  solvedP57Plaintext: metrics([{values:p57.indices}])
};
assert.equal(baseline.pageKeyBlack.runes, 2627);
assert.equal(baseline.spanFollowingBlack.runes, 2115);

console.log(JSON.stringify({
  hypothesis: "Red runes are a phase-zero page-local GP29 Vigenere key for same-page black text, or a span-local key for the immediately following black segment.",
  source: "Original LP2 rune positions and red-span annotations; no fitted phase, offset, or key transform.",
  redBearingUnknownPages: redPages.map(x => x.page),
  redSpanCount,
  redRuneCount,
  baseline,
  candidates,
  decision: "All eight direct configurations remain uniform-like; none produces coherent plaintext. This rejects only these fixed page/span-local additive readings."
}, null, 2));
