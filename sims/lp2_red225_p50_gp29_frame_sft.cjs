"use strict";

// Source-bounded 256-event framing test. Run: node sims/lp2_red225_p50_gp29_frame_sft.cjs
// No output files; original corpus, annotation and table remain unchanged.
const assert = require("node:assert/strict");
const fs = require("node:fs");

/** @param {string} path */
const load = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const pages = new Map(corpus.pages.map((p) => [p.page, p]));

assert.equal(corpus.pages.filter((p) => p.page <= 55).reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(corpus.runes.length, 29);
assert.equal(ink.counts.red, 225);
assert.equal(grid.byte_count, 256);
assert.equal(grid.bytes.length, 256);

/** @type {Array<{page:number,offset:number,order:number,dot:boolean,index:number}>} */
const events = [];
for (const page of [...ink.pages].sort((a, b) => a.page - b.page)) {
  const source = pages.get(page.page);
  assert(source);
  const local = [];
  for (const [offset, size] of page.large_punctuation || []) {
    if (size === 13) local.push({page: page.page, offset, order: 0, dot: true, index: 13});
  }
  for (const span of page.red_spans || []) {
    assert.equal([...span.runes].length, span.length);
    for (let k = 0; k < span.length; k++) {
      const offset = span.start + k;
      const index = source.indices[offset];
      assert.equal(corpus.runes[index], [...span.runes][k]);
      local.push({page: page.page, offset, order: 1, dot: false, index});
    }
  }
  local.sort((a, b) => a.offset - b.offset || a.order - b.order);
  events.push(...local);
}
assert.equal(events.length, 256);
assert.equal(events.filter((e) => e.dot).length, 31);
assert.equal(events.filter((e) => !e.dot).length, 225);

/** @param {number[]} indices */
function ioc(indices) {
  const frequencies = Array(29).fill(0);
  for (const n of indices) frequencies[n]++;
  return frequencies.reduce((sum, f) => sum + f * (f - 1), 0) /
    (indices.length * (indices.length - 1));
}

const source = [];
const decoded = [];
const key = [];
const lengths = [0];
for (let i = 0; i < events.length; i++) {
  const e = events[i];
  if (e.dot) {
    lengths.push(0);
  } else {
    const k = grid.bytes[i] % 29;
    source.push(e.index);
    decoded.push((e.index - k + 29) % 29);
    key.push(k);
    lengths[lengths.length - 1]++;
  }
}
assert.equal(lengths.length, 32);
assert.equal(lengths.reduce((sum, v) => sum + v, 0), 225);
assert.equal(lengths.filter((v) => v === 0).length, 15);
assert.equal(Math.max(...lengths), 59);

// A reversible GF(29) additive receiver from the 256 printed cells, retaining
// all 31 dot events as unaltered separators. Re-encoding is an implementation
// check, not independent key evidence.
const reencoded = decoded.map((p, i) => (p + key[i]) % 29);
assert.deepEqual(reencoded, source);

// Known source-native 95-rune PARABLE control, extended to 225 characters.
// The same 225 selected table positions must invert this planted plaintext.
const solved = pages.get(57).indices;
assert.equal(solved.length, 95);
const plant = Array.from({length: 225}, (_, i) => solved[i % solved.length]);
const plantCipher = plant.map((p, i) => (p + key[i]) % 29);
assert.deepEqual(plantCipher.map((c, i) => (c - key[i] + 29) % 29), plant);
const wrongKey = [...key].reverse();
assert.notDeepEqual(plantCipher.map((c, i) => (c - wrongKey[i] + 29) % 29), plant);

const sourceIoC = ioc(source);
const plainIoC = ioc(decoded);
assert(Math.abs(sourceIoC - 0.03321428571428572) < 1e-12);
assert(Math.abs(plainIoC - 0.03785714285714286) < 1e-12);

/** @param {number[]} values */
const latin = (values) => values.map((v) => corpus.translit[v]).join("");
console.log(JSON.stringify({
  input: "Original LP2 225 red GP runes + 31 physical 13-dot marks; p50 256-byte table",
  test: "Marker-delimited 32-word tape; rune P=(C-(table_slot mod29)) mod29",
  marks: 31,
  redRunes: source.length,
  emptyWords: lengths.filter((v) => v === 0).length,
  longestWord: Math.max(...lengths),
  wordLengths: lengths,
  sourceIoC,
  decodedIoC: plainIoC,
  decodedFirst60: latin(decoded.slice(0, 60)),
  nativeControl: "225/225 GP runes with 95-rune solved p57 repeated",
  interpretation: "Bounded negative: 15 empty words and non-prose GP29 output; no authentic key or unknown-page plaintext"
}, null, 2));
