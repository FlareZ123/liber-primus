#!/usr/bin/env node
"use strict";

/**
 * Original p50 numerical border versus original p55 rune stream.
 *
 * SFT: for every cyclic starting cell and both perimeter directions, exhaust
 * every stationary, unknown input-symbol -> GP29 output-symbol lookup by
 * calculating the exact maximum number of positions a table could match.
 *
 * A majority assignment per input class is an upper bound even for arbitrary
 * secret maps; it proves impossibility if the maximum is below 76. No
 * cryptographic key, language model or candidate plaintext is presumed.
 *
 * Run from the repository root: node sims/lp2_p50_ring76_stationary_map_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

/**
 * @param {number} nrows
 * @param {number} ncols
 * @returns {Array<[number, number]>}
 */
function clockwisePerimeter(nrows, ncols) {
  /** @type {Array<[number, number]>} */
  const out = [];
  for (let j = 0; j < ncols; j++) out.push([0, j]);
  for (let i = 1; i < nrows; i++) out.push([i, ncols - 1]);
  for (let j = ncols - 2; j >= 0; j--) out.push([nrows - 1, j]);
  for (let i = nrows - 2; i >= 1; i--) out.push([i, 0]);
  return out;
}

/**
 * Optimal stationary arbitrary lookup fit, separately for each input class.
 * @param {Array<string | number>} symbols
 * @param {number[]} target
 * @returns {number}
 */
function upperBoundFit(symbols, target) {
  assert.equal(symbols.length, target.length);
  /** @type {Map<string | number, Map<number, number>>} */
  const frequency = new Map();
  for (let i = 0; i < symbols.length; i++) {
    const key = symbols[i];
    if (!frequency.has(key)) frequency.set(key, new Map());
    const group = frequency.get(key);
    assert.ok(group);
    group.set(target[i], (group.get(target[i]) || 0) + 1);
  }
  let matched = 0;
  for (const freq of frequency.values()) {
    matched += Math.max(...freq.values());
  }
  return matched;
}

/**
 * @param {Array<string | number>} symbols
 * @param {number[]} target
 * @returns {{unique: number, exact: number, topLeft: number, bestMatches: number, bestPhase: number, reverse: boolean}}
 */
function scanDihedralStarts(symbols, target) {
  assert.equal(symbols.length, 76);
  assert.equal(target.length, 76);
  let exact = 0;
  let bestMatches = -1;
  let bestPhase = -1;
  let reverse = false;
  const topLeft = upperBoundFit(symbols, target);
  for (const reversed of [false, true]) {
    const orientation = reversed ? [...symbols].reverse() : symbols;
    for (let phase = 0; phase < 76; phase++) {
      const aligned = Array.from({length: 76}, (_, i) => orientation[(phase + i) % 76]);
      const matched = upperBoundFit(aligned, target);
      if (matched === 76) exact++;
      if (matched > bestMatches) {
        bestMatches = matched;
        bestPhase = phase;
        reverse = reversed;
      }
    }
  }
  return {unique: new Set(symbols).size, exact, topLeft, bestMatches, bestPhase, reverse};
}

assert.equal(grid.rows.length, 32);
assert.equal(grid.byte_rows.length, 32);
for (const row of grid.rows) assert.equal(row.length, 8);
for (const row of grid.byte_rows) assert.equal(row.length, 8);
const coords = clockwisePerimeter(32, 8);
assert.equal(coords.length, 76);
assert.equal(new Set(coords.map(([i, j]) => `${i},${j}`)).size, 76);

const target = corpus.pages[55].indices;
assert.equal(corpus.pages[55].page, 55);
assert.equal(corpus.pages[55].status, "unsolved");
assert.equal(target.length, 76);

/** @type {number[]} */
const bytes = coords.map(([i, j]) => grid.byte_rows[i][j]);
/** @type {string[]} */
const tokens = coords.map(([i, j]) => grid.rows[i][j]);
const cases = {
  "full-byte": bytes,
  "printed-base60-token": tokens,
  "byte-mod29": bytes.map(n => n % 29),
  "byte-low5": bytes.map(n => n & 31),
  "base60-first-digit": bytes.map(n => Math.floor(n / 60)),
  "base60-second-digit": bytes.map(n => n % 60),
};

const expected = {
  "full-byte": [68, 69, 71],
  "printed-base60-token": [68, 69, 71],
  "byte-mod29": [24, 26, 34],
  "byte-low5": [27, 28, 35],
  "base60-first-digit": [5, 15, 15],
  "base60-second-digit": [41, 43, 48],
};

for (const [name, source] of Object.entries(cases)) {
  const result = scanDihedralStarts(source, target);
  assert.deepEqual([result.unique, result.topLeft, result.bestMatches], expected[name]);
  assert.equal(result.exact, 0, `Unexpected exact stationary fit: ${name}`);
  // A planted mapping must pass the same geometry and scoring code.
  const lookup = new Map();
  for (const symbol of source) {
    if (!lookup.has(symbol)) lookup.set(symbol, (lookup.size * 7 + 3) % 29);
  }
  const planted = source.map(symbol => lookup.get(symbol));
  assert.equal(upperBoundFit(source, planted), 76);
  assert.equal(scanDihedralStarts(source, planted).topLeft, 76);
  console.log(JSON.stringify({kind: name, ...result, plantMatched: 76}));
}
console.log("PASS: no exact stationary source-ring -> original-p55 rune lookup in 152 rotations/reflections for any tested source register.");
