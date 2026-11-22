"use strict";

/**
 * SFT: test a direct, reversible local GF(29) stencil from the original
 * 32x8 byte table into the 180-rune interior suggested by peeling one ring.
 *
 * The 76-cell exterior matches unknown p55 length; the 30x6 interior
 * matches solved p56 (85 runes) plus p57 (95 runes).  This is a candidate
 * consumer, not a claim that the counts authenticate a cryptosystem.
 *
 * Exactly three familiar interior reading orders, each in both directions,
 * are frozen. Fit a 3x3 toroidal linear stencil plus intercept on the first
 * 90 solved characters; score all 180 and the untouched last 90. Failure
 * rejects this direct local linear decoder under these source-visible layouts.
 *
 * Run on Windows 11: node sims/lp2_terminal180_local_stencil_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const source = read("resources/liber-primus/lp1-plaintext-reference.txt");
const mod = x => (x % 29 + 29) % 29;
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.deepEqual(corpus.pages.slice(55, 58).map(p => p.indices.length), [76, 85, 95]);

/** Calibrated GP29 text mapping (ING and IO use single runes in solved texts). */
function native(s) {
  const tokens = corpus.translit.map((t, i) => ({ t, i }))
    .sort((a, b) => b.t.length - a.t.length);
  const words = s.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { out.push(21); i += 3; continue; }
      if (word.startsWith("IO", i)) { out.push(27); i += 2; continue; }
      const entry = tokens.find(e => word.startsWith(e.t, i));
      assert(entry, "unmapped GP rune");
      out.push(entry.i);
      i += entry.t.length;
    }
  }
  return out;
}
const p56 = source.split("### 56\n")[1].split("### 57\n")[0]
  .replace(/^[0-9a-f]{20,}\s*$/gmi, "");
const p57 = source.split("### 57\n")[1];
const known = [...native(p56), ...native(p57)];
assert.equal(native(p56).length, 85);
assert.deepEqual(native(p57), corpus.pages[57].indices);
assert.equal(known.length, 180);

/** Convert row/column to a row-major byte address. */
const at = (r, c) => r * 8 + c;
function rows() {
  return Array.from({length: 180},
    (_, i) => at(1 + Math.floor(i / 6), 1 + i % 6));
}
function columns() {
  return Array.from({length: 180},
    (_, i) => at(1 + i % 30, 1 + Math.floor(i / 30)));
}
function spiral() {
  const out = [];
  let top = 1, bottom = 30, left = 1, right = 6;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(at(top, c));
    top++;
    for (let r = top; r <= bottom; r++) out.push(at(r, right));
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(at(bottom, c));
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(at(r, left));
      left++;
    }
  }
  return out;
}
const full = bytes.map(n => n % 29);
function features(cell) {
  const r = Math.floor(cell / 8), c = cell % 8, x = [1];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      x.push(full[at((r + dr + 32) % 32, (c + dc + 8) % 8)]);
    }
  }
  return x;
}
function inverse(x) {
  for (let k = 1; k < 29; k++) if (x * k % 29 === 1) return k;
  throw new Error("zero pivot");
}

/**
 * Fit a deterministic ten-parameter local rule on the first 90 positions
 * without looking at later known plaintext.
 * @param {number[]} addresses
 * @param {number[]} expected
 */
function fit(addresses, expected) {
  const pivot = Array(10).fill(null);
  let rank = 0;
  for (let i = 0; i < 90; i++) {
    const v = [...features(addresses[i]), expected[i]].map(mod);
    for (let k = 0; k < 10; k++) {
      if (v[k] === 0) continue;
      if (pivot[k]) {
        const factor = v[k];
        for (let j = k; j <= 10; j++) v[j] = mod(v[j] - factor * pivot[k][j]);
        continue;
      }
      const inv = inverse(v[k]);
      for (let j = k; j <= 10; j++) v[j] = mod(v[j] * inv);
      pivot[k] = v;
      rank++;
      break;
    }
  }
  const weights = Array(10).fill(0);
  for (let k = 9; k >= 0; k--) {
    if (!pivot[k]) continue;
    let value = pivot[k][10];
    for (let j = k + 1; j < 10; j++) {
      value = mod(value - pivot[k][j] * weights[j]);
    }
    weights[k] = value;
  }
  let train = 0, hold = 0;
  for (let i = 0; i < addresses.length; i++) {
    const predicted = mod(features(addresses[i])
      .reduce((sum, value, j) => sum + value * weights[j], 0));
    if (predicted === expected[i]) {
      if (i < 90) train++; else hold++;
    }
  }
  return {rank, train, hold, total: train + hold, weights};
}
const orders = [["row", rows()], ["column", columns()], ["spiral", spiral()]];
for (const [name, coords] of orders) {
  assert.equal(coords.length, 180, name);
  assert.equal(new Set(coords).size, 180, name);
  assert(coords.every(p => Math.floor(p / 8) >= 1 &&
    Math.floor(p / 8) <= 30 && p % 8 >= 1 && p % 8 <= 6), name);
}

/** A genuine 3x3+intercept plant must transfer perfectly. */
const plantWeights = [1, 3, 5, 7, 11, 13, 17, 19, 23, 27];
const plant = rows().map(cell => mod(features(cell)
  .reduce((sum, val, j) => sum + val * plantWeights[j], 0)));
const planted = fit(rows(), plant);
assert.equal(planted.rank, 10);
assert.equal(planted.total, 180);
assert.deepEqual(planted.weights, plantWeights);

const observed = [];
for (const [order, coords] of orders) {
  for (const reversed of [false, true]) {
    const v = reversed ? [...coords].reverse() : coords;
    const result = fit(v, known);
    observed.push({order, reversed, rank: result.rank,
      train: result.train, holdout: result.hold, total: result.total});
  }
}
assert.deepEqual(observed.map(x => [x.total, x.holdout]),
  [[21, 5], [15, 2], [14, 1], [16, 5], [18, 3], [15, 2]]);
assert(observed.every(x => x.rank === 10 && x.holdout < 10));
console.log(JSON.stringify({
  status: "negative direct local-linear consumer; no recovered plaintext",
  originalTableShape: [32, 8],
  perimeterRunes: 76,
  interiorRunes: 180,
  solvedSourceLengths: [85, 95],
  field: 29,
  stencil: "toroidal 3x3 plus intercept",
  fitLength: 90, holdoutLength: 90,
  plantedReconstructionExact: true,
  observed
}, null, 2));
