"use strict";

/**
 * P27/P55 5x43 comparator-to-Bacon diagnostic.
 * Human-source premise: the existing p27 title fold uses comparisons,
 * p27 black body has 215 = 5x43 runes, p55 has 43 word-interior runes.
 * A 5-bit letter uses only codes 0..25; no fitted bit mapping is allowed.
 * Run: node sims/p27_p55_fivebit_comparator_gate_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const body = corpus.pages[27].indices.slice(19);
assert.equal(body.length, 215);
const rowMajor = Array.from({length: 43}, (_, c) =>
  Array.from({length: 5}, (_, r) => body[r * 43 + c]));
const fiveTuples = Array.from({length: 43}, (_, c) =>
  body.slice(5 * c, 5 * c + 5));
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
const page = transcript.split("%")[54].replace(/[\/\r\n]/gu, "");
const inside = page.split(/[-.&$§,:!?]/u)
  .map(w => (w.match(/[ᚠ-᛿]+/gu) ?? []).join(""))
  .filter(Boolean)
  .flatMap(w => [...w].slice(1, -1).map(r => lookup.get(r)));
assert.equal(inside.length, 43);

/** @param {number[][]} grid @param {"lt"|"gt"} op
 * @param {boolean} lowBitFirst @returns {number[]} */
function encode(grid, op, lowBitFirst) {
  return grid.map((column, i) =>
    column.reduce((value, symbol, j) =>
      value + (Number(op === "lt" ? symbol < inside[i] :
        symbol > inside[i]) << (lowBitFirst ? j : 4 - j)), 0));
}
const models = [];
for (const [layout, grid] of [["row-major", rowMajor],
  ["consecutive-five", fiveTuples]]) {
  for (const op of ["lt", "gt"]) {
    for (const lowBitFirst of [false, true]) {
      const codes = encode(grid, op, lowBitFirst);
      const invalid = codes.filter(code => code > 25).length;
      models.push({
        layout, predicate: op, bitOrder: lowBitFirst ? "LSB-first" : "MSB-first",
        invalid, preview: codes.map(x => x > 25 ? "*" :
          String.fromCharCode(65 + x)).join("")
      });
    }
  }
}
assert.equal(models.length, 8);
assert.equal(models.find(m => m.layout === "row-major" &&
  m.predicate === "lt" && m.bitOrder === "MSB-first").invalid, 10);
assert.equal(Math.min(...models.map(m => m.invalid)), 9);
assert.ok(models.every(m => m.invalid > 0));
console.log(JSON.stringify({
  status: "No direct 5-bit A-Z Bacon text; eight fixed models all contain forbidden codes",
  source: {p27BlackRunes: body.length, p55InteriorRunes: inside.length},
  models,
  decision: "Reject literal comparison-derived 5bit-to-letter extraction; " +
    "do not rescue it with fitted codes or arbitrary bit permutations."
}, null, 2));
