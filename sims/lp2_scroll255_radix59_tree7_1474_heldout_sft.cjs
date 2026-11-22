"use strict";
/**
 * Predeclared original tree-illustration heldout test of the frozen p7 GF4
 * + p50 radix59 key correction on physical LP2 pp8..14, total 1729 runes.
 * p8, one full 255-period key, was used previously to fit 4 word collisions;
 * subsequent p9..14's 1474 runes are untouched source-level holdout.
 * The repeated tree illustration plausibly selects either reset or
 * continuous running key over those pages. Original red p8 12-rune opening
 * and known solved literal-F GP28 rule select the two other clocks.
 *
 * No reference English text, page key, or runic content changes from original.
 * Windows Node20+: node sims/lp2_scroll255_radix59_tree7_1474_heldout_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
/** @param {number} v @param {number} m @returns {number} */
const mod = (v, m) => (v % m + m) % m;
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const p7 = book.pages[7].indices;
const p8 = book.pages[8].indices;
const pages = book.pages.slice(8, 15).map(p => p.indices);
assert.deepEqual(pages.map(p => p.length), [255, 268, 263, 273, 261, 272, 137]);
assert.equal(pages.flat().length, 1729);
assert.equal(pages.slice(1).flat().length, 1474);
const redFive = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
const products = redFive.map(w =>
  w.reduce((s, r) => mod(s * r, 29), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
assert.deepEqual(p7.slice(194), redFive.flat());
/** @param {number} a @param {number} b @returns {number} */
function gf4mul(a, b) {
  let out = 0;
  for (let j = 0; j < 2; j++) {
    if ((b >>> j) & 1) out ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return out;
}
const taps = products.slice(0, 4).map(x => x % 4);
let state = [products[4] % 4, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((s, x) => 4 * s + x, 0));
  let next = 0;
  for (let j = 0; j < 4; j++) next ^= gf4mul(state[j], taps[j]);
  state = [state[1], state[2], state[3], next];
}
assert.deepEqual(state, [2, 0, 0, 0]);
assert.equal(new Set(addresses).size, 255);
assert(!addresses.includes(0));
const alpha = grid.alphabet.replace("f", "");
assert.equal(alpha.length, 59);
const cells = grid.pages.flatMap(p => p.tokens);
const table = cells.map(token =>
  59 * alpha.indexOf(token[0]) + alpha.indexOf(token[1]));
assert.equal(table.length, 256);
const key = addresses.map(i => table[i]);
assert(key.every(x => x >= 0 && x <= 251));
assert.equal(p8.length, 255);
const correctedP8 = p8.map((x, i) => mod(x + key[i], 29));
assert.deepEqual([[47, 240], [48, 231], [235, 236],
  [88, 179]].map(([i, j]) => [correctedP8[i], correctedP8[j]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, x) => s + x * (x - 1), 0) /
    (a.length * (a.length - 1));
}
const native = solved.sections.flatMap(s => [...s.source_text].map(r =>
  book.runes.indexOf(r)).filter(x => x >= 0));
assert.equal(native.length, 2979);
assert(ioc(native) > 0.06);
/**
 * @param {number[][]} inputs
 * @param {"red-start"|"black-start"} start
 * @param {"page-reset"|"continuous"} clock
 * @param {"gp29"|"gp28f"} model
 * @param {1|-1} sign
 * @returns {number[][]}
 */
function shift(inputs, start, clock, model, sign) {
  let position = 0;
  const result = [];
  for (let page = 0; page < inputs.length; page++) {
    if (clock === "page-reset") position = 0;
    const row = [];
    for (let i = 0; i < inputs[page].length; i++) {
      const x = inputs[page][i];
      if (start === "black-start" && page === 0 && i < 12) {
        row.push(x); continue;
      }
      if (model === "gp28f" && x === 0) {
        row.push(x); continue;
      }
      const k = key[position++ % 255];
      if (model === "gp29") row.push(mod(x + sign * k, 29));
      else row.push(mod(x - 1 + sign * k, 28) + 1);
    }
    result.push(row);
  }
  return result;
}
const cases = [];
const sourceControl = native.slice(0, 1729);
for (const start of ["red-start", "black-start"])
  for (const clock of ["page-reset", "continuous"])
    for (const model of ["gp29", "gp28f"])
      for (const sign of [-1, 1]) {
        const out = shift(pages, start, clock, model, sign);
        const held = out.slice(1).flat();
        assert.equal(held.length, 1474);
        assert(held.every(x => x >= 0 && x < 29));
        const val = ioc(held);
        assert(val < 0.04, "one untouched heldout tree text needs investigation");
        // A real native GP cleartext plant must recover exactly. For GP28
        // with literal-F transport, F is reserved as an explicit unchanged
        // source symbol in both the plant and its own inverse.
        const sourcePlant = pages.map((p, pi) => native.slice(
          pages.slice(0, pi).reduce((s, x) => s + x.length, 0),
          pages.slice(0, pi + 1).reduce((s, x) => s + x.length, 0)));
        const encrypted = shift(sourcePlant, start, clock, model, -sign);
        assert.deepEqual(shift(encrypted, start, clock, model, sign),
          sourcePlant, "full source-shaped native positive 1729-rune replay");
        cases.push({start, clock, model, sign,
          heldoutIoc: val, p8Ioc: ioc(out[0])});
      }
assert.equal(cases.length, 16);
cases.sort((a, b) => b.heldoutIoc - a.heldoutIoc);
assert(Math.abs(cases[0].heldoutIoc - 0.03457255474156711) < 1e-10);
assert(Math.abs(cases[15].heldoutIoc - 0.034237256597958184) < 1e-10);
console.log(JSON.stringify({
  status: "candidate frozen GF4/radix59 stream not plaintext-producing on 1474 heldout tree runes",
  sourceP7ProductKey: products,
  originalTreeChapterRunes: 1729,
  fittedOriginalP8Runes: 255,
  untouchedOriginalTreeP9toP14Runes: 1474,
  untouchedOriginalRawIoc: ioc(pages.slice(1).flat()),
  nativeSolvedReferenceRuneCount: native.length,
  nativeSolvedReferenceIoc: ioc(native),
  sourceVisibleClockAndAlphabetVariants: cases.length,
  heldoutMaximumIoc: cases[0].heldoutIoc,
  heldoutMinimumIoc: cases[15].heldoutIoc,
  bestCase: cases[0],
  allPositiveNativeGPPlants: "16/16 complete 1729 rune reversible",
  recoveredUnknownPlaintext: false
}, null, 2));
