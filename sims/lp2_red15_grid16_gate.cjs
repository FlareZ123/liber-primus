"use strict";

/**
 * Source-restricted 15x15 red-rune / 16x16 byte-table spatial alignment gate.
 * Node.js 22 CommonJS; no dependencies. This tests a hypothesis, not a cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const byteRows = read("resources/liber-primus/base60-grid.json").byte_rows;
assert.equal(byteRows.length, 32);
assert(byteRows.every((row) => row.length === 8));
const bytes = byteRows.flat();
assert.equal(bytes.length, 256);

const red = [];
let marks = 0;
for (const pageInfo of ink.pages) {
  const page = corpus.pages.find((p) => p.page === pageInfo.page);
  assert.equal(page.indices.length, pageInfo.rune_count);
  for (const span of pageInfo.red_spans || []) {
    const glyphs = [...span.runes];
    assert.equal(glyphs.length, span.length);
    for (let i = 0; i < span.length; i++) {
      const rune = page.indices[span.start + i];
      assert.equal(corpus.runes[rune], glyphs[i]);
      red.push(rune);
    }
  }
  marks += (pageInfo.large_punctuation || []).filter((m) => m[1] === 13).length;
}
assert.equal(red.length, 225);
assert.equal(marks, 31);

/** @param {"paired"|"halves"} layout */
function indicesForLayout(layout) {
  return Array.from({ length: 16 }, (_, r) => layout === "paired"
    ? [...Array.from({ length: 16 }, (_, c) => 16 * r + c)]
    : [...Array.from({ length: 8 }, (_, c) => 8 * r + c),
       ...Array.from({ length: 8 }, (_, c) => 8 * (r + 16) + c)]);
}
/** @param {number[][]} rows */
function turn(rows) {
  return Array.from({ length: 16 }, (_, r) =>
    Array.from({ length: 16 }, (_, c) => rows[15 - c][r]));
}
/** @param {number[]} original @param {number[]} encoded */
function bestAlphabet(original, encoded) {
  const n = 29;
  const counts = Array.from({ length: n }, () => new Int16Array(n));
  for (let i = 0; i < 225; i++) counts[original[i]][encoded[i]]++;
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0);
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
        const cur = -counts[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < min[j]) {
          min[j] = cur;
          way[j] = j0;
        }
        if (min[j] < delta) {
          delta = min[j];
          next = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          min[j] -= delta;
        }
      }
      j0 = next;
    } while (p[j0]);
    do {
      const next = way[j0];
      p[j0] = p[next];
      j0 = next;
    } while (j0);
  }
  let matched = 0;
  for (let j = 1; j <= n; j++) matched += counts[p[j] - 1][j - 1];
  return matched;
}

const variants = [];
for (const layout of ["paired", "halves"]) {
  for (const mirror of [false, true]) {
    let grid = indicesForLayout(layout);
    if (mirror) grid = grid.map((row) => row.slice().reverse());
    for (let rotation = 0; rotation < 4; rotation++) {
      if (rotation) grid = turn(grid);
      for (const rowStart of [0, 1]) {
        for (const colStart of [0, 1]) {
          const indices = [];
          for (let r = rowStart; r < rowStart + 15; r++) {
            for (let c = colStart; c < colStart + 15; c++) {
              indices.push(grid[r][c]);
            }
          }
          assert.equal(indices.length, 225);
          assert.equal(new Set(indices).size, 225);
          for (const projection of ["mod29", "scale29"]) {
            const projected = indices.map((index) => projection === "mod29"
              ? bytes[index] % 29 : Math.floor(bytes[index] * 29 / 256));
            variants.push({ layout, mirror, rotation, rowStart, colStart,
              projection, indices, projected });
          }
        }
      }
    }
  }
}
assert.equal(variants.length, 128);
const measured = variants.map((v) => ({
  layout: v.layout, mirror: v.mirror, rotation: v.rotation,
  rowStart: v.rowStart, colStart: v.colStart, projection: v.projection,
  matches: bestAlphabet(red, v.projected)
}));
const bestOriginal = Math.max(...measured.map((v) => v.matches));
assert.equal(bestOriginal, 51);
for (const projection of ["mod29", "scale29"]) {
  const variant = variants.find((v) => v.projection === projection);
  const plant = bytes.slice();
  for (let i = 0; i < 225; i++) {
    const secret = (13 * red[i] + 5) % 29;
    plant[variant.indices[i]] = projection === "mod29"
      ? secret : Math.floor((secret + 0.5) * 256 / 29);
  }
  const projected = variant.indices.map((index) => projection === "mod29"
    ? plant[index] % 29 : Math.floor(plant[index] * 29 / 256));
  assert.equal(bestAlphabet(red, projected), 225);
}
let seed = 0x33113513;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
let atLeast = 0, minNull = 225, maxNull = 0;
const trials = 500;
for (let trial = 0; trial < trials; trial++) {
  const shuffled = red.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let best = 0;
  for (const v of variants) best = Math.max(best, bestAlphabet(shuffled, v.projected));
  if (best >= bestOriginal) atLeast++;
  minNull = Math.min(minNull, best);
  maxNull = Math.max(maxNull, best);
}
assert.equal(atLeast, 376);
console.log(JSON.stringify({
  source: {redRunes: red.length, thirteenDotMarks: marks, tableBytes: bytes.length},
  hypothesis: "225 red GP glyphs as 15x15 interior of 16x16 original 256-byte table",
  models: variants.length, directMatchMaximum: bestOriginal,
  bestOriginalModels: measured.filter((v) => v.matches === bestOriginal),
  pairedInventoryShuffles: trials, shuffledMaxRange: [minNull, maxNull],
  atLeast, plusOneTail: (atLeast + 1) / (trials + 1),
  plantedControls: "225/225 both mappings",
  conclusion: "No evidence for a direct secret 29-symbol byte-to-red-rune spatial correspondence"
}, null, 2));
