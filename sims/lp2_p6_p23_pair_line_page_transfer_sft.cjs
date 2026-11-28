#!/usr/bin/env node
"use strict";

/**
 * Director #3420: charge the semantic reading of shared red-successor H pairs
 * as [first-rune-line length, physical page] across the complete already-fixed
 * successor family.
 *
 * No new H stream or transform is introduced. The decisive independent control
 * is [22,20] from p33/p54, tested structurally before any target rune values.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const parts = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeId = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const mod29 = (x) => ((x % 29) + 29) % 29;
const segment = (p) => (p === 50 ? "" : parts[p >= 51 ? p - 1 : p]);

function words(p) {
  if (p === 50) return [];
  const out = [];
  let values = [];
  let start = 0;
  let offset = 0;
  const emit = () => {
    if (!values.length) return;
    out.push({ start, length: values.length, values: values.slice() });
    values = [];
  };
  for (const ch of segment(p)) {
    if (runeId.has(ch)) {
      if (!values.length) start = offset;
      values.push(runeId.get(ch));
      offset += 1;
    } else if ("-.&$§".includes(ch)) {
      emit();
    }
  }
  emit();
  const page = corpus.pages.find((row) => row.page === p);
  assert.equal(offset, page.indices.length, `p${p} rune-count mismatch`);
  return out;
}

function lineLengths(p) {
  if (p === 50) return [];
  const out = [];
  for (const line of segment(p).split("\n")) {
    let count = 0;
    for (const ch of line) if (runeId.has(ch)) count += 1;
    if (count) out.push(count);
  }
  return out;
}

function outerH(values) {
  const n = values.length;
  const half = Math.floor(n / 2);
  const out = [];
  for (let i = 0; i < half; i += 1) {
    out.push(mod29(values[i] - values[n - 1 - i]));
  }
  if (n % 2) out.push(values[half]);
  for (let i = half - 1; i >= 0; i -= 1) {
    out.push(mod29(values[i] + values[n - 1 - i]));
  }
  return out;
}

const successors = [];
for (const ann of ink.pages) {
  const ws = words(ann.page);
  for (const span of ann.red_spans || []) {
    const next = ws.find((w) => w.start === span.start + span.length);
    if (!next) continue;
    successors.push({
      page: ann.page,
      redStart: span.start,
      h: outerH(next.values),
    });
  }
}
assert.equal(successors.length, 16);

const pairMap = new Map();
for (const row of successors) {
  for (let i = 0; i < row.h.length - 1; i += 1) {
    const pair = [row.h[i], row.h[i + 1]];
    const key = pair.join(",");
    if (!pairMap.has(key)) pairMap.set(key, { pair, occurrences: [] });
    pairMap.get(key).occurrences.push({
      page: row.page,
      redStart: row.redStart,
      index: i,
    });
  }
}

const rows = [...pairMap.values()];
assert.equal(rows.length, 58);
assert.equal(rows.reduce((n, row) => n + row.occurrences.length, 0), 62);

const repeated = rows
  .filter((row) => new Set(row.occurrences.map((o) => `${o.page}:${o.redStart}`)).size >= 2)
  .sort((a, b) => a.pair[0] - b.pair[0] || a.pair[1] - b.pair[1]);

assert.deepEqual(
  repeated.map((row) => ({
    pair: row.pair,
    pages: row.occurrences.map((o) => o.page),
  })),
  [
    { pair: [9, 22], pages: [15, 23] },
    { pair: [11, 9], pages: [8, 15] },
    { pair: [22, 20], pages: [33, 54] },
    { pair: [22, 25], pages: [6, 23] },
  ]
);

function boundaryShape(page, offset) {
  const ws = words(page);
  const at = ws.find((w) => w.start === offset);
  const containing = ws.find((w) => w.start < offset && w.start + w.length > offset);
  const next = ws.find((w) => w.start > offset);
  return {
    wordAtStart: at ? { start: at.start, length: at.length } : null,
    containsBoundary: containing ? { start: containing.start, length: containing.length } : null,
    nextWord: next ? { start: next.start, length: next.length } : null,
  };
}

function grammarMatch(row) {
  const [count, page] = row.pair;
  if (page < 0 || page > 55 || page === 50) return null;
  const lines = lineLengths(page);
  if (!lines.length || lines[0] !== count) return null;
  return {
    pair: row.pair,
    occurrences: row.occurrences,
    targetPage: page,
    firstLineLength: lines[0],
    boundary: boundaryShape(page, count),
  };
}

const sharedGrammar = repeated.map(grammarMatch).filter(Boolean);
assert.equal(sharedGrammar.length, 2);

const p20 = sharedGrammar.find((row) => row.targetPage === 20);
const p25 = sharedGrammar.find((row) => row.targetPage === 25);
assert.ok(p20 && p25);

assert.deepEqual(p20.pair, [22, 20]);
assert.deepEqual(p20.occurrences.map((o) => o.page), [33, 54]);
assert.deepEqual(p20.boundary, {
  wordAtStart: null,
  containsBoundary: { start: 18, length: 8 },
  nextWord: { start: 26, length: 2 },
});

assert.deepEqual(p25.pair, [22, 25]);
assert.deepEqual(p25.occurrences.map((o) => o.page), [6, 23]);
assert.deepEqual(p25.boundary, {
  wordAtStart: { start: 22, length: 2 },
  containsBoundary: null,
  nextWord: { start: 24, length: 2 },
});

const allGrammar = rows.map(grammarMatch).filter(Boolean);
assert.equal(allGrammar.length, 3);
assert.deepEqual(
  allGrammar.map((row) => row.pair).sort((a, b) => a[1] - b[1]),
  [[20, 0], [22, 20], [22, 25]]
);

console.log(JSON.stringify({
  classification:
    "bounded negative: [line-count,page] matches an independent shared pair at p20 but fails the same typed next-line complete-word receiver",
  redSuccessorCount: successors.length,
  distinctOrderedPairCount: rows.length,
  orderedPairOccurrenceCount: rows.reduce((n, row) => n + row.occurrences.length, 0),
  repeatedSharedPairs: repeated.map((row) => ({
    pair: row.pair,
    occurrences: row.occurrences,
  })),
  sharedLinePageMatches: sharedGrammar,
  fullLinePageMatchCount: allGrammar.length,
  fullLinePagePairs: allGrammar.map((row) => row.pair),
  decision:
    "retain the exact p25 local convergence; do not generalize [a,b] as [first-line length,page] without a new source instruction",
}, null, 2));
