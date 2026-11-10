"use strict";

/**
 * Source-selected 13/31 affine grid-event correspondence gate.
 * Node 22; run from repository root: node sims/dot13_31_grid_event_alignment.cjs
 * The visible five-dot masks suggest 13 and 31; using those as a
 * modular-256 affine rule is a hypothesis, not an authenticated instruction.
 *
 * A maximum weight bipartite assignment grants the cipher an unrestricted
 * 29-symbol relabeling. The 400 paired byte-order nulls preserve both source
 * byte inventories and refit every declared variant.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const canonical = read("resources/liber-primus/base60-grid.json").byte_rows.flat();
assert.equal(canonical.length, 256);

const events = [];
for (const row of ink.pages) {
  const page = corpus.pages[row.page];
  assert.equal(page.indices.length, row.rune_count);
  for (const span of row.red_spans || []) {
    for (let k = 0; k < span.length; k++) {
      assert.equal(corpus.runes[page.indices[span.start + k]],
        [...span.runes][k]);
      events.push({ page: row.page, offset: span.start + k,
        kind: 1, value: page.indices[span.start + k] });
    }
  }
  for (const mark of row.large_punctuation || []) {
    if (mark[1] === 13) events.push({ page: row.page, offset: mark[0],
      kind: 0, value: 29 });
  }
}
events.sort((a, b) => a.page - b.page || a.offset - b.offset ||
  a.kind - b.kind);
assert.equal(events.length, 256);
assert.equal(events.filter(e => e.kind).length, 225);
assert.equal(events.filter(e => !e.kind).length, 31);

const corrected = canonical.slice();
for (const [i, byte] of [
  [45, 81], [50, 21], [165, 47], [172, 174], [246, 224]
]) corrected[i] = byte;

const lcg = [];
let cursor = 0;
for (let i = 0; i < 256; i++) {
  lcg.push(cursor);
  cursor = (13 * cursor + 31) & 255;
}
assert.equal(new Set(lcg).size, 256);
assert.equal(cursor, 0);
const maps = {
  natural: Array.from({ length: 256 }, (_, i) => i),
  affine: Array.from({ length: 256 }, (_, i) => (13 * i + 31) & 255),
  transpose: Array.from({ length: 256 }, (_, i) =>
    (i % 32) * 8 + (i >> 5)),
  LCG: lcg
};
for (const order of Object.values(maps)) {
  assert.equal(new Set(order).size, 256);
}

/**
 * Exact maximum matching between two 29-category inventories.
 * Standard O(n^3) rectangular Hungarian algorithm, with n=29.
 * @param {Int16Array[]} count
 * @returns {number}
 */
function bestAlphabet(count) {
  const n = 29, u = Array(n + 1).fill(0), v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const min = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, next = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = -count[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < min[j]) { min[j] = cur; way[j] = j0; }
        if (min[j] < delta) { delta = min[j]; next = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else min[j] -= delta;
      }
      j0 = next;
    } while (p[j0]);
    do {
      const next = way[j0];
      p[j0] = p[next];
      j0 = next;
    } while (j0);
  }
  let total = 0;
  for (let j = 1; j <= n; j++) total += count[p[j] - 1][j - 1];
  return total;
}

/**
 * @param {number[]} bytes
 * @param {number[]} order
 * @param {"mod29"|"scale29"} reducer
 * @returns {number}
 */
function alignment(bytes, order, reducer) {
  const count = Array.from({ length: 29 }, () => new Int16Array(29));
  for (let i = 0; i < 256; i++) {
    if (!events[i].kind) continue;
    const b = bytes[order[i]];
    const symbol = reducer === "mod29" ? b % 29 :
      Math.floor(29 * b / 256);
    count[events[i].value][symbol]++;
  }
  return bestAlphabet(count);
}

// True planted global secret alphabet must score all 225 red runes.
for (const reducer of ["mod29", "scale29"]) {
  const planted = new Array(256).fill(0);
  for (let i = 0; i < 256; i++) {
    if (!events[i].kind) continue;
    const secret = (13 * events[i].value + 5) % 29;
    planted[lcg[i]] = reducer === "mod29" ? secret :
      Math.floor((secret + 0.5) * 256 / 29);
  }
  assert.equal(alignment(planted, lcg, reducer), 225);
}

const variants = [];
for (const [source, bytes] of Object.entries({ canonical, corrected })) {
  for (const [map, order] of Object.entries(maps)) {
    for (const reducer of ["mod29", "scale29"]) {
      variants.push({ source, map, reducer, order, bytes,
        actual: alignment(bytes, order, reducer), nullAtLeast: 0 });
    }
  }
}
let seed = 0x33011331;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const nullFamilyMax = [];
for (let trial = 0; trial < 400; trial++) {
  const shuffled = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = random() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const sources = {
    canonical: shuffled.map(i => canonical[i]),
    corrected: shuffled.map(i => corrected[i])
  };
  let maximum = 0;
  for (const v of variants) {
    const value = alignment(sources[v.source], v.order, v.reducer);
    if (value >= v.actual) v.nullAtLeast++;
    maximum = Math.max(maximum, value);
  }
  nullFamilyMax.push(maximum);
}
const maxReal = Math.max(...variants.map(v => v.actual));
const familyGe = nullFamilyMax.filter(n => n >= maxReal).length;
assert.equal(maxReal, 50);
assert.equal(familyGe, 84);
assert.equal(variants.find(v => v.source === "corrected" &&
  v.map === "LCG" && v.reducer === "scale29").nullAtLeast, 13);
console.log(JSON.stringify({
  hypothesis: "13/31 source-dot-mask traversal with arbitrary global GP29 output relabeling",
  events: events.length,
  redRuneEvents: 225,
  punctuations: 31,
  tableCells: 256,
  sourceVersions: 2,
  candidateMaps: Object.keys(maps),
  sourcePrior: "13 from 01101 and 31 from 11111 five-dot ornaments",
  affineAndLCGFullCycle: true,
  nullTrials: 400,
  bestActual: maxReal,
  matchedFamilyNulls: familyGe,
  familyPlusOneTail: (familyGe + 1) / 401,
  variants: variants.map(v => ({
    source: v.source, map: v.map, reducer: v.reducer,
    matches: v.actual, nullAtLeast: v.nullAtLeast,
    plusOneTail: (v.nullAtLeast + 1) / 401
  })),
  control: "two different planted hidden alphabets each recovered 225/225",
  conclusion: "No source-locked direct red-event-to-grid mapping or LP2 plaintext/key recovered."
}, null, 2));
