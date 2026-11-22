"use strict";

/**
 * Source-selected local 4x4 whole-word spiral gate for the unknown LP2 book.
 * The 2,896 printed words form exactly 181 intact 16-word blocks.
 * Run: node sims/lp2_p15_local16_wordspiral_sft.cjs
 *
 * Neither direction changes any rune or word boundary. No secret key is fitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const N = 2896;
const GRID = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const SPIRAL = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const EXPECTED_SPIRAL = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];

/** @param {number[]} permutation @returns {number[]} */
function inverse(permutation) {
  const out = Array(permutation.length);
  permutation.forEach((position, index) => { out[position] = index; });
  return out;
}

/**
 * Intact printed words, 16 at a time, in the frozen p15 4x4 route.
 * @template T
 * @param {T[]} source @param {number[]} permutation @returns {T[]}
 */
function permute(source, permutation) {
  assert.equal(source.length % 16, 0);
  const out = [];
  for (let offset = 0; offset < source.length; offset += 16) {
    for (const index of permutation) out.push(source[offset + index]);
  }
  return out;
}

/** @param {number[]} values @returns {{chi:number,mi:number}} */
function grammar(values) {
  const n = values.length;
  const observed = Array.from({length: 10}, () => Array(10).fill(0));
  const rows = Array(10).fill(0);
  const columns = Array(10).fill(0);
  for (let i = 1; i < n; i++) {
    const x = Math.min(values[i - 1], 9);
    const y = Math.min(values[i], 9);
    observed[x][y]++;
    rows[x]++;
    columns[y]++;
  }
  let chi = 0;
  let mi = 0;
  for (let x = 1; x <= 9; x++) {
    for (let y = 1; y <= 9; y++) {
      const expected = rows[x] * columns[y] / (n - 1);
      const count = observed[x][y];
      if (!expected) continue;
      chi += (count - expected) ** 2 / expected;
      if (count) mi += count / (n - 1) * Math.log(count / expected);
    }
  }
  return {chi, mi};
}

/**
 * Source-calibrated GP29 spelling: single-rune ING, IO and other historical
 * digraphs, plus the K/C, V/U, Z/S, QU/CW conventional normalization.
 * @param {string} text @returns {number[]}
 */
function nativeWordLengths(text) {
  const words = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/[VKZQ]/g, character =>
      ({V: "U", K: "C", Z: "S", Q: "C"})[character])
    .match(/[A-Z]+/g) || [];
  return words.map(word => (word.match(
    /ING|TH|EO|NG|OE|AE|IA|EA|IO|./g) || []).length);
}

/** @param {number} value @returns {number} */
function mixHash(value) {
  let v = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  v = Math.imul(v ^ (v >>> 15), 0x846ca68b);
  return (v ^ (v >>> 16)) >>> 0;
}

/**
 * Match the exact original word-length inventory, without using order.
 * @param {number[]} source @param {number[]} targetSorted
 * @returns {number[]}
 */
function rankMatch(source, targetSorted) {
  const positions = Array.from({length: source.length}, (_, i) => i);
  positions.sort((i, j) => source[i] - source[j] ||
    mixHash(i + 0x3301) - mixHash(j + 0x3301));
  const out = Array(source.length);
  for (let rank = 0; rank < positions.length; rank++) {
    out[positions[rank]] = targetSorted[rank];
  }
  return out;
}

/** @returns {()=>number} */
function seededRandom() {
  let state = 0x20143301;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} values @param {()=>number} next */
function shuffle(values, next) {
  for (let i = values.length - 1; i > 0; i--) {
    const k = next() % (i + 1);
    [values[i], values[k]] = [values[k], values[i]];
  }
}

function main() {
  assert.deepEqual(SPIRAL.map(i => GRID[i]), EXPECTED_SPIRAL);
  const backwards = inverse(SPIRAL);
  assert.deepEqual(inverse(backwards), SPIRAL);
  const original = parseSharedCorpus();
  assert.equal(original.words.length, N);
  assert.equal(original.runeCount, 12956);
  assert.equal(original.crossPageWords, 32);
  const lengths = original.words.map(word => word.length);
  assert.deepEqual(permute(permute(lengths, SPIRAL), backwards), lengths);
  assert.deepEqual(permute(permute(lengths, backwards), SPIRAL), lengths);

  const raw = grammar(lengths);
  const readSpiral = grammar(permute(lengths, SPIRAL));
  const readRowMajor = grammar(permute(lengths, backwards));
  assert.ok(Math.abs(raw.chi - 68.27318638192133) < 1e-9);
  assert.ok(Math.abs(readSpiral.chi - 53.73070203773381) < 1e-9);
  assert.ok(Math.abs(readRowMajor.chi - 70.21300542149235) < 1e-9);
  const best = Math.max(raw.chi, readSpiral.chi, readRowMajor.chi);

  const sorted = lengths.slice().sort((a, b) => a - b);
  const controls = [];
  for (const [name, file] of [
    ["Shakespeare", "shakespeare_first300k.txt"],
    ["Gibran", "gibran_prophet_58585.txt"],
    ["Emerson", "emerson_essays_2944.txt"]
  ]) {
    const native = nativeWordLengths(fs.readFileSync(path.join(
      ROOT, "resources/control", file), "utf8"));
    let count = 0;
    let minimum = Infinity;
    for (let start = 0; start + N <= native.length; start += N) {
      const candidate = rankMatch(native.slice(start, start + N), sorted);
      const planted = permute(candidate, SPIRAL);
      assert.deepEqual(permute(planted, backwards), candidate);
      const chi = grammar(candidate).chi;
      minimum = Math.min(minimum, chi);
      assert.ok(chi > best);
      count++;
    }
    controls.push({name, windows: count, minimumNativeChi: minimum});
  }
  assert.deepEqual(controls.map(item => item.windows), [19, 5, 26]);

  const draws = 5000;
  const next = seededRandom();
  const permuted = lengths.slice();
  let atLeastAsHigh = 0;
  const totals = [0, 0, 0];
  for (let sample = 0; sample < draws; sample++) {
    shuffle(permuted, next);
    const scores = [
      grammar(permuted).chi,
      grammar(permute(permuted, SPIRAL)).chi,
      grammar(permute(permuted, backwards)).chi
    ];
    if (Math.max(...scores) >= best) atLeastAsHigh++;
    scores.forEach((score, i) => { totals[i] += score; });
  }
  assert.equal(atLeastAsHigh, 2904);
  const result = {
    method: "p15 source-ordered local 4x4 whole-word spiral / inverse",
    original: {runes: original.runeCount, printedWords: N, blockCount: N / 16,
      crossPageWords: original.crossPageWords, raw, readSpiral, readRowMajor},
    controls,
    exactInventoryNull: {draws, seed: "0x20143301",
      statistic: "maximum chi across untreated, spiral and inverse",
      exceedances: atLeastAsHigh,
      addOneProbability: (atLeastAsHigh + 1) / (draws + 1),
      meanChi: totals.map(total => total / draws)},
    conclusion: "Neither direct orientation recovers ordinary source-native English word adjacency; no cipher or plaintext."
  };
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) main();
module.exports = {permute, inverse, grammar};
