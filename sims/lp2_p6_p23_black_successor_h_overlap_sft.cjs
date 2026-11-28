#!/usr/bin/env node
"use strict";

/**
 * Director #3403: test whether the unique p6->p23 red adjacent-H morphism
 * continues into the immediately following complete black words.
 *
 * Fixed operator: canonical outside-in H on the complete successor word.
 * Compare exact H-coordinate values and ordered adjacent H-coordinate pairs
 * only inside the source-selected family of red-span successors.
 *
 * Run from repo root:
 *   node sims/lp2_p6_p23_black_successor_h_overlap_sft.cjs
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
const page = (p) => {
  const row = corpus.pages.find((x) => x.page === p);
  assert.ok(row, `missing p${p}`);
  return row;
};
const segment = (p) => (p === 50 ? "" : parts[p >= 51 ? p - 1 : p]);

function words(p) {
  if (p === 50) return [];
  const pg = page(p);
  const out = [];
  let values = [];
  let start = 0;
  let offset = 0;

  const emit = () => {
    if (!values.length) return;
    out.push({ start, values });
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
  assert.equal(offset, pg.indices.length, `p${p} rune-count mismatch`);
  return out;
}

// Canonical outside-in Hsplit: differences outside->inside, odd center,
// then sums inside->outside. This is the same H(x,y)=(x-y,x+y) algebra
// already frozen upstream; no target-dependent sign or phase is added.
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

const gp0 = (values) => mod29(values.reduce((a, b) => a + b, 0));
const product = (values) => values.reduce((a, b) => mod29(a * b), 1);
const descriptor = (values) => [values.length, gp0(values), product(values)];
const adjacentPairs = (values) =>
  values.slice(0, -1).map((v, i) => `${v},${values[i + 1]}`);
const unique = (values) => [...new Set(values)];

const redSuccessors = [];
for (const ann of ink.pages) {
  const ws = words(ann.page);
  for (const span of ann.red_spans || []) {
    const next = ws.find((w) => w.start === span.start + span.length);
    if (!next) continue;
    const h = outerH(next.values);
    redSuccessors.push({
      page: ann.page,
      redStart: span.start,
      nextStart: next.start,
      values: next.values,
      descriptor: descriptor(next.values),
      h,
      hSet: new Set(h),
      pairs: adjacentPairs(h),
    });
  }
}
assert.equal(redSuccessors.length, 16);

const p6 = redSuccessors.find((r) => r.page === 6 && r.redStart === 71);
const p23 = redSuccessors.find((r) => r.page === 23 && r.redStart === 0);
assert.ok(p6 && p23);

assert.deepEqual(p6.values, [6, 9, 28, 25, 6, 21, 23]);
assert.deepEqual(p6.descriptor, [7, 2, 3]);
assert.deepEqual(p6.h, [12, 17, 22, 25, 5, 1, 0]);

assert.deepEqual(p23.values, [28, 6, 15, 25, 13, 7, 19, 28]);
assert.deepEqual(p23.descriptor, [8, 25, 16]);
assert.deepEqual(p23.h, [0, 16, 8, 12, 9, 22, 25, 27]);

// The black successor objects themselves are manuscript-unique by their
// complete (length, GP0 sum, GP0 product) descriptors.
const descriptorCounts = new Map();
let completeWordCount = 0;
for (const pg of corpus.pages.filter((x) => x.page >= 0 && x.page <= 55 && x.page !== 50)) {
  for (const w of words(pg.page)) {
    completeWordCount += 1;
    const key = descriptor(w.values).join(",");
    descriptorCounts.set(key, (descriptorCounts.get(key) || 0) + 1);
  }
}
assert.equal(descriptorCounts.get(p6.descriptor.join(",")), 1);
assert.equal(descriptorCounts.get(p23.descriptor.join(",")), 1);

const intersection = (a, b) =>
  unique([...a].filter((value) => b.has(value)));

function rankAgainst(base) {
  return redSuccessors
    .filter((row) => row !== base)
    .map((row) => ({
      page: row.page,
      redStart: row.redStart,
      intersection: intersection(base.hSet, row.hSet),
    }))
    .sort(
      (a, b) =>
        b.intersection.length - a.intersection.length ||
        a.page - b.page ||
        a.redStart - b.redStart
    );
}

// Bidirectional finite control: each member of the red-morphism pair is the
// other's unique nearest neighbor by exact H-coordinate set intersection.
const p6Rank = rankAgainst(p6);
const p23Rank = rankAgainst(p23);
assert.deepEqual(
  { page: p6Rank[0].page, redStart: p6Rank[0].redStart, intersection: p6Rank[0].intersection },
  { page: 23, redStart: 0, intersection: [12, 22, 25, 0] }
);
assert.equal(p6Rank[0].intersection.length, 4);
assert.equal(p6Rank[1].intersection.length, 2);

assert.deepEqual(
  { page: p23Rank[0].page, redStart: p23Rank[0].redStart, intersection: p23Rank[0].intersection },
  { page: 6, redStart: 71, intersection: [0, 12, 22, 25] }
);
assert.equal(p23Rank[0].intersection.length, 4);
assert.equal(p23Rank[1].intersection.length, 3);

// Stronger order-sensitive control from p6: among all 15 other red-span
// successors, p23 alone repeats any ordered adjacent pair from p6's H stream.
const p6PairSet = new Set(p6.pairs);
const pairOverlaps = redSuccessors
  .filter((row) => row !== p6)
  .map((row) => ({
    page: row.page,
    redStart: row.redStart,
    shared: unique(row.pairs.filter((pair) => p6PairSet.has(pair))),
  }))
  .filter((row) => row.shared.length > 0);
assert.deepEqual(pairOverlaps, [
  { page: 23, redStart: 0, shared: ["22,25"] },
]);

// The same H application also places F=0 at opposite outer boundaries.
// This is supporting structure, not a unique selector by itself.
assert.equal(p6.h.at(-1), 0);
assert.equal(p23.h[0], 0);
const boundaryZero = redSuccessors.filter(
  (row) => row.h[0] === 0 || row.h.at(-1) === 0
);
assert.deepEqual(
  boundaryZero.map((row) => [row.page, row.redStart, row.h[0] === 0 ? "L" : "R"]),
  [
    [3, 119, "L"],
    [6, 71, "R"],
    [15, 0, "R"],
    [23, 0, "L"],
  ]
);

// Discovery-aware broader calibration: the ordered pair 22,25 is not rare
// book-wide, so the evidence is its occurrence on the independently fixed
// p6/p23 red-successor pair, not the pair value alone.
let pair2225Words = 0;
let wordsSharingAnyP6Pair = 0;
for (const pg of corpus.pages.filter((x) => x.page >= 0 && x.page <= 55 && x.page !== 50)) {
  for (const w of words(pg.page)) {
    const pairs = adjacentPairs(outerH(w.values));
    if (pairs.includes("22,25")) pair2225Words += 1;
    if (pairs.some((pair) => p6PairSet.has(pair))) wordsSharingAnyP6Pair += 1;
  }
}
assert.equal(completeWordCount, 2928);
assert.equal(pair2225Words, 18);
assert.equal(wordsSharingAnyP6Pair, 63);

console.log(JSON.stringify({
  classification:
    "positive structural continuation of independently selected p6<->p23 red morphism; no plaintext/key claim",
  redSuccessorCount: redSuccessors.length,
  completeWordCount,
  p6: {
    descriptor: p6.descriptor,
    h: p6.h,
    orderedPairs: p6.pairs,
  },
  p23: {
    descriptor: p23.descriptor,
    h: p23.h,
    orderedPairs: p23.pairs,
  },
  bidirectionalNearestNeighbor: {
    p6ToP23Intersection: p6Rank[0].intersection,
    p6NextBestSize: p6Rank[1].intersection.length,
    p23ToP6Intersection: p23Rank[0].intersection,
    p23NextBestSize: p23Rank[1].intersection.length,
  },
  orderedPairContinuation: pairOverlaps,
  oppositeBoundaryF: {
    p6: "right",
    p23: "left",
    allBoundaryZeroSuccessors: boundaryZero.map((row) => [row.page, row.redStart]),
  },
  broadCalibration: {
    wordsWithOrdered2225: pair2225Words,
    wordsSharingAnyP6OrderedPair: wordsSharingAnyP6Pair,
  },
  chronology:
    "the canonical H family and p6/p23 receivers were fixed upstream; exact overlap statistics were inspected retrospectively and are conditional specificity, not a blind authorship probability",
}, null, 2));
