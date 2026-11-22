"use strict";
/**
 * Exact 32x8 word-position key gate on original Liber Primus LP2.
 * Both axis orders, natural byte projections and additive signs are tested.
 * No original rune, word delimiter, key phase, or table cell is fitted.
 * Run: node sims/lp2_grid32x8_word_position_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, parseLP2Words} = require("./lp2_word_pages.cjs");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const {byte_rows} = require("../resources/liber-primus/base60-grid.json");
const table = byte_rows.flat();
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
const index = (runes) => [...runes].map((r) => {
  assert(lookup.has(r));
  return lookup.get(r);
});
const source = parseSharedCorpus();
assert.equal(source.runeCount, 12956);
assert.equal(source.words.length, 2896);
assert.equal(source.crossPageWords, 32);
const original = source.words.map((w) => index(w.runes));
assert.deepEqual(original.flat(), corpus.pages
  .filter((p) => p.page <= 55).flatMap((p) => p.indices));
const raw = fs.readFileSync(path.join(__dirname, "../resources/lp2-transcription.txt"), "utf8");
const p57 = parseLP2Words(raw.split("%").at(-1)).words.map((w) => index(w.runes));
assert.equal(p57.flat().length, 95);
assert.equal(p57.flat().map((i) => corpus.translit[i]).join("").startsWith("PARABLE"), true);
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const h = new Array(29).fill(0);
  for (const i of data) h[i]++;
  return h.reduce((total, n) => total + n * (n - 1), 0)
    / (data.length * (data.length - 1));
}
/**
 * @param {number[][]} words
 * @param {"word-row"|"letter-row"} axis
 * @param {-1|1} sign
 * @param {"mod29"|"scaled"} projection
 * @returns {number[][]}
 */
function transform(words, axis, sign, projection) {
  return words.map((word, wi) => word.map((c, li) => {
    const cell = axis === "word-row" ? (wi % 32) * 8 + li % 8
      : (li % 32) * 8 + wi % 8;
    const byte = table[cell];
    const shift = projection === "mod29" ? byte % 29 : Math.floor(29 * byte / 256);
    return (c + sign * shift + 29) % 29;
  }));
}
assert.equal(table.length, 256);
assert.equal(table[0], 203);
const baseIoC = ioc(original.flat());
assert(Math.abs(baseIoC - 0.03447839786450569) < 1e-13);
const cases = [];
for (const axis of ["word-row", "letter-row"]) {
  for (const projection of ["mod29", "scaled"]) {
    for (const sign of /** @type {const} */ ([-1, 1])) {
      const decoded = transform(original, axis, sign, projection);
      const score = ioc(decoded.flat());
      assert(score > 0.0344 && score < 0.0346);
      assert.deepEqual(transform(decoded, axis, -sign, projection), original);
      const plant = transform(p57, axis, -sign, projection);
      assert.deepEqual(transform(plant, axis, sign, projection), p57);
      cases.push({axis, projection, sign, ioc: score,
        prefix: decoded.flat().slice(0, 32).map((i) => corpus.translit[i]).join("")});
    }
  }
}
assert.equal(cases.length, 8);
assert(ioc(p57.flat()) > 0.062 && ioc(p57.flat()) < 0.063);
console.log(JSON.stringify({source: {
  originalRunes: 12956, originalWords: 2896, spanningPageWords: 32,
  tableCells: 256, rawIoC: baseIoC, solvedP57IoC: ioc(p57.flat())},
  models: cases, positive: "eight 95/95 solved-native GP plants"},
  null, 2));
console.log("PASS: no direct 32x8 word-position additive model yields native-GP plaintext.");
