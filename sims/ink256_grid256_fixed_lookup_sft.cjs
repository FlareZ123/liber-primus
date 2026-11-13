"use strict";

/**
 * Exact source-order 256 printed bytes -> 256 original ink events lookup gate.
 * Every fixed (even non-injective) byte-to-rune substitution must give the
 * same GP29 event symbol for every occurrence of an identical byte.
 *
 * Run: node sims/ink256_grid256_fixed_lookup_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

/** @returns {number[]} Chronological original 225 red runes and 31 marks. */
function inkEvents() {
  /** @type {{page:number,off:number,kind:number,symbol:number}[]} */
  const ev = [];
  for (const p of ink.pages) {
    const original = corpus.pages[p.page];
    assert.equal(original.indices.length, p.rune_count);
    for (const span of p.red_spans || []) {
      assert.equal(span.runes, original.indices.slice(span.start, span.start + span.length)
        .map(i => corpus.runes[i]).join(""));
      for (let off = span.start; off < span.start + span.length; off++)
        ev.push({page:p.page, off, kind:1, symbol:original.indices[off]});
    }
    for (const mark of p.large_punctuation || [])
      if (mark[1] === 13)
        ev.push({page:p.page, off:mark[0], kind:0, symbol:0});
  }
  ev.sort((a,b) => a.page-b.page || a.off-b.off || a.kind-b.kind);
  assert.equal(ev.length, 256);
  assert.equal(ev.filter(x => x.kind).length, 225);
  assert.equal(ev.filter(x => !x.kind).length, 31);
  return ev.map(x => x.symbol);
}

/**
 * Compute the fewest symbols which ANY deterministic stationary lookup
 * f(source_byte) -> symbol would have to change to fit all 256 event symbols.
 * @param {number[]} bytes
 * @param {number[]} symbols
 */
function exactMapErrors(bytes, symbols) {
  assert.equal(bytes.length, symbols.length);
  const histograms = new Map();
  for (let i = 0; i < bytes.length; i++) {
    const h = histograms.get(bytes[i]) || new Map();
    h.set(symbols[i], (h.get(symbols[i]) || 0) + 1);
    histograms.set(bytes[i], h);
  }
  let errors = 0, conflictingByteValues = 0;
  let sameBytePairs = 0, agreeingBytePairs = 0;
  for (const h of histograms.values()) {
    const counts = [...h.values()];
    const total = counts.reduce((a,b) => a + b, 0);
    errors += total - Math.max(...counts);
    if (h.size > 1) conflictingByteValues++;
    sameBytePairs += total * (total - 1) / 2;
    agreeingBytePairs += counts.reduce((s,n) => s + n * (n - 1) / 2, 0);
  }
  return {distinctBytes:histograms.size, conflictingByteValues,
    minimumErrors:errors, sameBytePairs, agreeingBytePairs};
}

const byteValues = grid.bytes;

// A stronger cardinality obstruction independent of event/byte alignment:
// interpret one source-ink symbol as a stationary five-bit field and the
// eight printed columns as a three-bit field of each original table byte.
// There are 31 indistinguishable 13-dot events, so their common five-bit
// symbol requires a table bitfield value present at least 31 times.
// This necessary condition survives arbitrary event shuffles, unknown
// rune-alphabet relabeling and any permutation of table positions.
/** @param {number[]} bytes @param {number} shift @returns {number} */
function maximumFiveBitMultiplicity(bytes, shift) {
  const counts = new Array(32).fill(0);
  for (const b of bytes) counts[(b >> shift) & 31]++;
  return Math.max(...counts);
}
const markerCount = ink.pages.reduce((total,p) => total +
  (p.large_punctuation || []).filter(m => m[1] === 13).length, 0);
assert.equal(markerCount, 31);
const symbols59 = grid.byte_count;
assert.equal(symbols59, 256);
const radix59Alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx".replace("f", "");
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const radix59Bytes = table.rows.flat().map(token =>
  radix59Alphabet.indexOf(token[0]) * 59 + radix59Alphabet.indexOf(token[1]));
assert.equal(radix59Bytes.length, 256);
assert.deepEqual(table.byte_rows.flat(), byteValues);
const directBitfieldMaxima = {
  base60High5: maximumFiveBitMultiplicity(byteValues, 3),
  base60Low5: maximumFiveBitMultiplicity(byteValues, 0),
  base59High5: maximumFiveBitMultiplicity(radix59Bytes, 3),
  base59Low5: maximumFiveBitMultiplicity(radix59Bytes, 0)
};
assert.deepEqual(directBitfieldMaxima, {
  base60High5: 16, base60Low5: 14,
  base59High5: 14, base59Low5: 14
});
assert(Object.values(directBitfieldMaxima).every(v => markerCount > v));
// Positive control: when 31 identical marker symbols are represented by
// the same five-bit digit, both five-bit orientations retain multiplicity>=31.
const planted = Array.from({length:256}, (_,i) =>
  i < markerCount ? (31 << 3) | (i % 8) : ((i % 29) << 3) | (i % 8));
assert(maximumFiveBitMultiplicity(planted, 3) >= markerCount);

const sourceEvents = inkEvents();
assert.equal(byteValues.length, 256);
assert.equal(grid.byte_count, 256);
const original = exactMapErrors(byteValues, sourceEvents);
assert.deepEqual(original, {
  distinctBytes:161, conflictingByteValues:64,
  minimumErrors:87, sameBytePairs:127, agreeingBytePairs:8
});

// A source-order circular-rotation calibration tests whether the zero-phase
// equality is exceptional; the rotations are NULL controls, not key searches.
const ranks = sourceEvents.map((_, shift) =>
  exactMapErrors(byteValues,
    sourceEvents.slice(shift).concat(sourceEvents.slice(0, shift))).minimumErrors);
assert.equal(ranks.length, 256);
const min = Math.min(...ranks), max = Math.max(...ranks);
const mean = ranks.reduce((a,b) => a+b,0) / ranks.length;
assert.equal(min, 84);
assert.equal(max, 94);
assert.equal(mean, 89.30078125);
const atMostOriginal = ranks.filter(n => n <= original.minimumErrors).length;
assert.equal(atMostOriginal, 58);

// A planted, independently determined arbitrary LUT must be recognized
// even though the printed 256 byte stream contains duplicates.
const plantedLookup = Array.from({length:256}, (_,v) => (v * 7 + 11) % 29);
const positive = byteValues.map(b => plantedLookup[b]);
const positiveResult = exactMapErrors(byteValues, positive);
assert.equal(positiveResult.minimumErrors, 0);
assert.equal(positiveResult.sameBytePairs, 127);
assert.equal(positiveResult.agreeingBytePairs, 127);

console.log(JSON.stringify({
  sources:["resources/liber-primus/lp2-ink-annotations.json",
    "resources/liber-primus/lp2-grid-256.json",
    "resources/liber-primus/lp2-corpus.json"],
  hypothesis:"source-order stationary function original grid byte to ink-event GP29 symbol",
  original,
  sourceEventFixedMapRotationNull:{
    candidates:256,min,max,mean,
    rotationsAtMostOriginal:atMostOriginal,
    exactLowerTailRank:atMostOriginal/256
  },
  plantedStationaryMap:positiveResult,
  impossibleDirectFivePlusThreePacking:{markerCount,directBitfieldMaxima},
  conclusion:"No stationary byte-to-ink lookup or direct 5+3-bit ink-to-grid packing; no original cipher plaintext or key."
},null,2));
