"use strict";

/**
 * Original LP2 source-table rowwise rank-order as a nonstationary whole-word
 * permutation, plus its inverse and printed-order opposite. A true positive
 * uses independent Gibran text under the complete source-derived key tape.
 * 
 * Run from repository root: node sims/lp2_grid32_rowrank_8word_original_sft.cjs
 * All tests are read-only, seed-fixed and require no packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const root = path.join(__dirname, "..");
const corpus = parseSharedCorpus();
const lengths = corpus.words.map((w) => w.length);
assert.equal(corpus.runeCount, 12956);
assert.equal(lengths.length, 2896);
assert.equal(corpus.crossPageWords, 32);
assert.equal(lengths.length, 11 * 256 + 80);

/**
 * Historically calibrated GP-native digraph contraction.
 * @param {string} word
 * @returns {number}
 */
function gpLength(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const digraphs = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
  let n = 0;
  for (let i = 0; i < s.length; n++) {
    i += digraphs.has(s.slice(i, i + 2)) ? 2 : 1;
  }
  return n;
}

/** @param {string} filename @returns {number[]} */
function getNative(filename) {
  const text = fs.readFileSync(path.join(root, "resources", "control", filename), "utf8");
  return (text.match(/[A-Z]+/gi) || []).map(gpLength);
}
const train = getNative("shakespeare_first300k.txt");
const gibran = getNative("gibran_prophet_58585.txt");
assert.equal(train.length, 55407);
assert.equal(gibran.length, 15733);
const cls = (x) => Math.min(7, x) - 1;
const n = new Float64Array(49), row = new Float64Array(7), col = new Float64Array(7);
for (let i = 1; i < train.length; i++) {
  const a = cls(train[i - 1]), b = cls(train[i]);
  n[a * 7 + b]++;
  row[a]++;
  col[b]++;
}
const llr = new Float64Array(49);
for (let a = 0; a < 7; a++) for (let b = 0; b < 7; b++) {
  llr[a * 7 + b] =
    Math.log((n[a * 7 + b] + 0.5) / (row[a] + 3.5)) -
    Math.log((col[b] + 0.5) / (train.length - 1 + 3.5));
}

/** @param {number[]} x @returns {number} */
function score(x) {
  let v = 0;
  for (let i = 1; i < x.length; i++) {
    v += llr[cls(x[i - 1]) * 7 + cls(x[i])];
  }
  return v;
}

const cells = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8")).bytes;
assert.equal(cells.length, 256);
assert.deepEqual(cells.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);
assert.equal(require("node:crypto").createHash("sha256")
  .update(Buffer.from(cells)).digest("hex"),
"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const asc = [];
for (let r = 0; r < 32; r++) {
  const rank = Array.from({ length: 8 }, (_, i) => i);
  rank.sort((a, b) => cells[8 * r + a] - cells[8 * r + b] || a - b);
  asc.push(rank);
}
assert.equal(new Set(asc.map((a) => a.join(","))).size, 32);
/** @param {number[]} permutation @returns {number[]} */
function inverse(permutation) {
  return permutation.map((_, i) => permutation.indexOf(i));
}
const desc = asc.map((a) => a.slice().reverse());
const orders = [
  { name: "ascending rank read", keys: asc },
  { name: "ascending inverse", keys: asc.map(inverse) },
  { name: "descending rank read", keys: desc },
  { name: "descending inverse", keys: desc.map(inverse) }
];

/**
 * Reversible repeated 32-row source-driven word-order tape.
 * @param {number[]} src
 * @param {number[][]} keys
 * @returns {number[]}
 */
function readRows(src, keys) {
  assert.equal(src.length % 8, 0);
  const result = src.slice();
  for (let rowIdx = 0; rowIdx < src.length / 8; rowIdx++) {
    const k = keys[rowIdx % 32];
    for (let j = 0; j < 8; j++) {
      result[8 * rowIdx + j] = src[8 * rowIdx + k[j]];
    }
  }
  return result;
}
for (const { keys } of orders) {
  assert.deepEqual(readRows(readRows(lengths, keys), keys.map(inverse)), lengths);
}
const baseline = score(lengths);
const candidates = orders.map(({ name, keys }) => ({
  name, score: score(readRows(lengths, keys)), firstRowKey: keys[0]
}));
const originalMax = Math.max(baseline, ...candidates.map((a) => a.score));
assert.ok(Math.abs(baseline - (-51.21753469797347)) < 1e-9);
assert.ok(Math.abs(originalMax - (-33.86446520028516)) < 1e-9);

/** @param {number} seed @returns {() => number} */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const rng = random(0x33012632);
const shuffled = lengths.slice();
let exceed = 0, sum = 0;
let minimum = Infinity, maximum = -Infinity;
for (let t = 0; t < 1500; t++) {
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let best = score(shuffled);
  for (const { keys } of orders) {
    best = Math.max(best, score(readRows(shuffled, keys)));
  }
  if (best >= originalMax) exceed++;
  sum += best;
  minimum = Math.min(minimum, best);
  maximum = Math.max(maximum, best);
}
assert.equal(exceed, 521);
const native = gibran.slice(1000, 1000 + 2896);
const planted = readRows(native, asc);
const recovered = readRows(planted, asc.map(inverse));
assert.deepEqual(recovered, native);
const plantedScores = orders.map(({ name, keys }) => ({
  name, score: score(readRows(planted, keys))
}));
const plainScore = score(native), cipherScore = score(planted);
assert.ok(Math.abs(plainScore - 50.0613519765612) < 1e-9);
assert.ok(Math.abs(cipherScore - (-19.719872926785378)) < 1e-9);
assert.ok(Math.abs(plantedScores[1].score - plainScore) < 1e-9);

console.log(JSON.stringify({
  input: { runes: corpus.runeCount, wholeWords: lengths.length,
    originalTable: "32 rows x 8 cells", sourceCycles: 11, tailWords: 80 },
  rowKeys: { distinct: 32, first: asc[0], second: asc[1] },
  originalBaseline: baseline, originalSourceRankDecoders: candidates,
  familywiseBestOriginal: originalMax,
  exactInventoryNull: { seed: "0x33012632", trials: 1500, exceed,
    plusOneP: (exceed + 1) / 1501, mean: sum / 1500, minimum, maximum },
  independentPositive: { source: "Gibran", words: native.length,
    exactRestored: recovered.length, plainScore, cipherScore, decoderScores: plantedScores },
  decision: "No source-recovered word-order signal under the four finite row-rank 32-key cyclic mappings; changing word boundaries or rune-level transformations were not tested."
}, null, 2));
