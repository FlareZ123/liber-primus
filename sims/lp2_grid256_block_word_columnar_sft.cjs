"use strict";
/**
 * LP2 original 32x8 table geometry as a repeated 256-word interleaver.
 * Exact whole-word and word-boundary-preserving inverse test; no cipher key is fitted.
 * SFT: node sims/lp2_grid256_block_word_columnar_sft.cjs
 * @module lp2_grid256_block_word_columnar_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const original = parseSharedCorpus();
const lengths = original.words.map((word) => word.length);
assert.equal(lengths.length, 2896);
assert.equal(original.runeCount, 12956);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);

/**
 * Read every 8-column row-major block down columns. The last 80 words form
 * 10 complete 8-word rows. Never drop, insert, or repartition any original word.
 * @param {number[]} input Word-length sequence.
 * @returns {number[]}
 */
function rowToColumn(input) {
  assert.equal(input.length % 8, 0);
  const out = new Array(input.length);
  for (let base = 0; base < input.length; base += 256) {
    const n = Math.min(256, input.length - base);
    const rows = n / 8;
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < rows; row++) {
        out[base + col * rows + row] = input[base + row * 8 + col];
      }
    }
  }
  return out;
}

/**
 * Read every 8-column column-major block across rows.
 * @param {number[]} input Word-length sequence.
 * @returns {number[]}
 */
function columnToRow(input) {
  assert.equal(input.length % 8, 0);
  const out = new Array(input.length);
  for (let base = 0; base < input.length; base += 256) {
    const n = Math.min(256, input.length - base);
    const rows = n / 8;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < 8; col++) {
        out[base + row * 8 + col] = input[base + col * rows + row];
      }
    }
  }
  return out;
}

/**
 * Nine-class adjacent word-length independence Pearson chi-square.
 * Bins are lengths 1..8 and 9+; source-native controls use the same statistic.
 * @param {number[]} input Word lengths.
 * @returns {number}
 */
function chiSquared(input) {
  const n = input.length - 1;
  const row = new Float64Array(9);
  const col = new Float64Array(9);
  const counts = Array.from({ length: 9 }, () => new Float64Array(9));
  for (let i = 1; i < input.length; i++) {
    const x = Math.min(9, input[i - 1]) - 1;
    const y = Math.min(9, input[i]) - 1;
    counts[x][y]++;
    row[x]++;
    col[y]++;
  }
  let total = 0;
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      const expected = row[x] * col[y] / n;
      if (expected > 0) total += (counts[x][y] - expected) ** 2 / expected;
    }
  }
  return total;
}

/** @param {number[]} input */
function threeScores(input) {
  return [chiSquared(input),
    chiSquared(rowToColumn(input)),
    chiSquared(columnToRow(input))];
}

const originalScores = threeScores(lengths);
const expected = [68.27318638192133, 73.84873568172254, 59.98058963055569];
for (let i = 0; i < 3; i++) {
  assert.ok(Math.abs(originalScores[i] - expected[i]) < 1e-8);
}
assert.deepEqual(columnToRow(rowToColumn(lengths)), lengths);
assert.deepEqual(rowToColumn(columnToRow(lengths)), lengths);

/**
 * Seeded xorshift32. Each null retains the entire exact manuscript word-length
 * multiset, is shuffled independently, and is optimized over three readings.
 * @returns {number}
 */
let seed = 0x3301c0da;
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

const shuffled = lengths.slice();
const N = 5000;
const originalMax = Math.max(...originalScores);
let exceed = 0;
let total = 0;
for (let trial = 0; trial < N; trial++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const score = Math.max(...threeScores(shuffled));
  total += score;
  if (score >= originalMax) exceed++;
}
assert.equal(exceed, 2348);
const nullMean = total / N;
assert.ok(Math.abs(nullMean - 73.86152494097206) < 1e-8);

/** @param {string} raw */
function gpLength(raw) {
  const normalized = raw.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S")
    .replace(/Q/g, "C");
  const doubles = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
  let n = 0;
  for (let i = 0; i < normalized.length; n++) {
    i += doubles.has(normalized.slice(i, i + 2)) ? 2 : 1;
  }
  return n;
}

const text = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
const nativeLengths = (text.match(/[a-z]+/gi) || []).map(gpLength);
assert.equal(nativeLengths.length, 55407);
const controls = [];
for (const start of [1000, 12000, 24000]) {
  const plain = nativeLengths.slice(start, start + lengths.length);
  const plantedRow = rowToColumn(plain);
  const plantedColumn = columnToRow(plain);
  assert.deepEqual(columnToRow(plantedRow), plain);
  assert.deepEqual(rowToColumn(plantedColumn), plain);
  const scores = threeScores(plain);
  assert.ok(scores[0] > 140);
  assert.ok(scores[1] < 90 && scores[2] < 90);
  controls.push({ start, native: scores[0], shuffledRow: scores[1],
    shuffledColumn: scores[2] });
}

console.log(JSON.stringify({
  source: "original LP2 12956 runes, 2896 complete printed words",
  geometry: "eleven 32x8 word blocks plus one 10x8 word block",
  originalScores: { untransposed: originalScores[0],
    rowToColumn: originalScores[1], columnToRow: originalScores[2] },
  seededNull: { samples: N, atLeastAsHigh: exceed,
    maximumScoreMean: nullMean, adjustedTail: (exceed + 1) / (N + 1) },
  nativePositiveControls: controls,
  conclusion: "neither exact block interleaver restores ordinary native-English word ordering"
}, null, 2));
