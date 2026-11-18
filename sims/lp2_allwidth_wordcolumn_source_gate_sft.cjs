"use strict";

/**
 * Source-native whole-word ragged-column inverse, all unkeyed widths 2..256.
 * Tests whether a single rectangular word transposition can restore a GP29
 * English adjacent-word-length signature on the unchanged 2,896-word LP2 book.
 * Single-file Windows Node 22 CommonJS SFT, read-only, with planted positives
 * and chapter-conditioned 510-model max-statistic calibration.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parsed = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"), 55);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);
const source = parsed.words.map(w => w.length);
const N = source.length;
const CHAPTER_WORDS = [158, 255, 383, 437, 224, 326, 378, 669, 66];
assert.equal(CHAPTER_WORDS.reduce((a, b) => a + b, 0), N);
const tokens = gp.translit.slice().sort((a, b) => b.length - a.length);
/** @param {string} word @returns {number} */
function gpEnglishLength(word) {
  const w = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let n = 0;
  for (let i = 0; i < w.length; n++) {
    const len = w.startsWith("ING", i) ? 3 : w.startsWith("IO", i) ? 2
      : (tokens.find(token => w.startsWith(token, i)) || "").length;
    assert.ok(len > 0, "GP-unrepresentable word " + word);
    i += len;
  }
  return n;
}
/** @param {string} text @returns {number[]} */
function gpLengths(text) {
  return (text.match(/[A-Za-z]+/g) || []).map(gpEnglishLength);
}
const sh = gpLengths(read("resources/control/shakespeare_first300k.txt"));
const gi = gpLengths(read("resources/control/gibran_prophet_58585.txt"));
assert.deepEqual([sh.length, gi.length], [55407, 15733]);
const training = sh.slice(0, 40000).concat(gi.slice(0, 11000));
const K = 12;
/** @param {number} x @returns {number} */
const cls = x => Math.min(K - 1, x - 1);
const joint = Array(K * K).fill(1);
const left = Array(K).fill(K);
const right = Array(K).fill(K);
let total = K * K;
for (let i = 1; i < training.length; i++) {
  const a = cls(training[i - 1]);
  const b = cls(training[i]);
  joint[a * K + b]++;
  left[a]++;
  right[b]++;
  total++;
}
const pairLogLR = joint.map((n, xy) => {
  const a = Math.floor(xy / K);
  const b = xy % K;
  return Math.log((n / left[a]) / (right[b] / total));
});
/**
 * Index maps for inverse ragged columnar reorders. Both are exact
 * permutations, including when the original word count is nondivisible.
 * @param {number} width
 * @returns {{width:number,direction:string,indices:number[]}[]}
 */
function mapsFor(width) {
  const h = Math.floor(N / width);
  const extra = N % width;
  const columnStarts = Array.from({length: width},
    (_, c) => c * h + Math.min(c, extra));
  const columnToRow = [];
  for (let row = 0; row <= h; row++) {
    for (let col = 0; col < width; col++) {
      if (row < h + Number(col < extra)) {
        columnToRow.push(columnStarts[col] + row);
      }
    }
  }
  const rowToColumn = [];
  for (let col = 0; col < width; col++) {
    for (let row = 0; row < h + Number(col < extra); row++) {
      rowToColumn.push(row * width + col);
    }
  }
  assert.equal(columnToRow.length, N);
  assert.equal(rowToColumn.length, N);
  return [
    {width, direction: "col-to-row", indices: columnToRow},
    {width, direction: "row-to-col", indices: rowToColumn}
  ];
}
const models = Array.from({length: 255},
  (_, offset) => mapsFor(offset + 2)).flat();
assert.equal(models.length, 510);
/**
 * Adjacent GP-English word-length log likelihood ratio per transition.
 * @param {number[]} lengths
 * @param {number[]} indices
 * @returns {number}
 */
function score(lengths, indices) {
  let sum = 0;
  let previous = cls(lengths[indices[0]]);
  for (let i = 1; i < N; i++) {
    const current = cls(lengths[indices[i]]);
    sum += pairLogLR[previous * K + current];
    previous = current;
  }
  return sum / (N - 1);
}
/** @param {number[]} seq @param {number[]} map @returns {number[]} */
const apply = (seq, map) => map.map(i => seq[i]);
/** @param {number[]} map @returns {number[]} */
function inverse(map) {
  const inv = Array(map.length);
  for (let j = 0; j < map.length; j++) inv[map[j]] = j;
  assert.ok(inv.every(Number.isInteger));
  return inv;
}
for (const model of models) {
  const inv = inverse(model.indices);
  assert.deepEqual(apply(apply(source, inv), model.indices), source);
}
// These heldout controls are untouched by the adjacent-length model training.
for (const [name, positive] of [
  ["Shakespeare", sh.slice(51000, 53896)],
  ["Gibran", gi.slice(12500, 15396)]
]) {
  assert.equal(positive.length, N);
  for (const width of [8, 16, 29, 164]) {
    for (const model of mapsFor(width)) {
      const encoded = apply(positive, inverse(model.indices));
      const decoded = apply(encoded, model.indices);
      assert.deepEqual(decoded, positive);
    }
  }
  const identity = Array.from({length: N}, (_, i) => i);
  const natural = score(positive, identity);
  console.log("positive", name, "native length-pair LLR", natural.toFixed(8),
    "and 8/16/29/164-column original-length plants roundtrip");
}
const original = models.map(m => ({
  width: m.width, direction: m.direction, score: score(source, m.indices)
})).sort((a, b) => b.score - a.score);
const observedBest = original[0];
console.log("original identity LLR", score(source,
  Array.from({length: N}, (_, i) => i)).toFixed(8));
console.log("original best five", JSON.stringify(original.slice(0, 5)));

let seed = 0x3301a8;
/** @returns {number} */
function randomUint() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @returns {number[]} */
function permuteChapters() {
  const values = source.slice();
  let begin = 0;
  for (const size of CHAPTER_WORDS) {
    for (let i = size - 1; i > 0; i--) {
      const j = randomUint() % (i + 1);
      const x = begin + i;
      const y = begin + j;
      [values[x], values[y]] = [values[y], values[x]];
    }
    begin += size;
  }
  return values;
}
const nullBest = [];
for (let trial = 0; trial < 200; trial++) {
  const sampled = permuteChapters();
  let best = -Infinity;
  for (const model of models) {
    const value = score(sampled, model.indices);
    if (value > best) best = value;
  }
  nullBest.push(best);
}
const sorted = nullBest.slice().sort((a, b) => a - b);
const exceeding = nullBest.filter(x => x >= observedBest.score).length;
const p = (exceeding + 1) / (nullBest.length + 1);
console.log("chapter-matched max-null", JSON.stringify({
  n: nullBest.length, min: sorted[0],
  median: sorted[100], p95: sorted[190],
  max: sorted[199], exceeding, familywiseP: p
}));
assert.ok(observedBest.score < 0, "unspecified original syntax recovery");
assert.ok(p > 0.5, "unanticipated familywise original signal");
console.log("PASS: no unkeyed 2..256-column word-order inverse restores",
  "a calibrated GP-English length-grammar excess in this test.");
