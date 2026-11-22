"use strict";
/**
 * Source-locked LP2 256-cell table pad, all phases and singleton-word gate.
 *
 * Hypothesis: a repeated original 256-byte stream is reduced mod29 and
 * added to native GP29 plaintext, using one byte for each printed rune.
 * Include printed/reversed order, source base60/base59 interpretations,
 * global/per-physical-page clocks and both signs. One phase is common.
 * English standalone words must encode A or I (also allow O as a
 * deliberately generous independent control).
 *
 * Run from the repository root on Windows 11 with Node.js 22:
 * node sims/lp2_p50_allphase_singleton_native_sft.cjs
 *
 * This bounds only an unskipped fixed-rate additive model: it does not
 * exclude arbitrary keys, per-word/word-dependent clocks, or transparent
 * plaintext-F bypasses.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} rel */
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const alphabet = new Map(source.runes.map((rune, index) => [rune, index]));
const pages = source.pages.filter(p => p.page <= 55);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const local = [];
for (const page of pages) {
  for (let i = 0; i < page.indices.length; i++) local.push(i);
}
assert.equal(local.length, original.length);
const singles = [], checked = [];
let word = [], words = 0;
function flush() {
  if (word.length) {
    words++;
    if (word.length === 1) singles.push(word[0]);
    word = [];
  }
}
for (const char of read("resources/lp2-transcription.txt")) {
  const value = alphabet.get(char);
  if (value !== undefined) {
    if (checked.length < original.length) {
      const pos = checked.length;
      checked.push(value);
      word.push({pos, local: local[pos], c: value});
    }
  } else if ("-.&$§".includes(char)) flush();
}
flush();
assert.deepEqual(checked, original, "runic order / word parser mismatch");
assert.equal(words, 2896);
assert.equal(singles.length, 83);
const tokens = table.pages.flatMap(page => page.tokens);
const bytes60 = table.pages.flatMap(page => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(bytes60.length, 256);
const alpha59 = [...table.alphabet].filter(x => x !== "f");
assert.equal(alpha59.length, 59);
const digit59 = new Map(alpha59.map((char, i) => [char, i]));
const bytes59 = tokens.map(pair => {
  assert.equal(pair.length, 2);
  const tens = digit59.get(pair[0]), units = digit59.get(pair[1]);
  assert.notEqual(tens, undefined);
  assert.notEqual(units, undefined);
  return 59 * tens + units;
});
/** @param {number} x */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {{pos:number,local:number,c:number}[]} points
 * @param {number[]} key
 * @param {"global"|"page"} clock
 * @param {-1|1} sign
 * @param {number} phase */
function hits(points, key, clock, sign, phase) {
  let english = 0, generous = 0;
  for (const point of points) {
    const t = clock === "global" ? point.pos : point.local;
    const output = mod29(point.c - sign * key[(t + phase) % 256]);
    const accepted = output === 24 || output === 10;
    english += Number(accepted);
    generous += Number(accepted || output === 3);
  }
  return {english, generous};
}
const results = [];
for (const [radix, raw] of [[60, bytes60], [59, bytes59]]) {
  for (const [order, key] of [
    ["printed", raw], ["reversed", [...raw].reverse()]
  ]) {
    for (const clock of ["global", "page"]) {
      for (const sign of [-1, 1]) {
        let best = 0, bestPhase = -1, bestWithO = 0;
        for (let phase = 0; phase < 256; phase++) {
          const score = hits(singles, key, clock, sign, phase);
          if (score.english > best) {
            best = score.english;
            bestPhase = phase;
          }
          bestWithO = Math.max(bestWithO, score.generous);
        }
        results.push({radix, order, clock, sign,
          bestEnglishSingletons: best, bestPhase,
          bestAllowO: bestWithO});
      }
    }
  }
}
assert.equal(results.length, 16);
assert.equal(Math.max(...results.map(r => r.bestEnglishSingletons)), 15);
assert.equal(Math.max(...results.map(r => r.bestAllowO)), 20);
const plantedKey = bytes59;
const plantedPhase = 175;
const planted = singles.map((record, i) => ({
  ...record,
  c: mod29((i % 2 ? 24 : 10) +
    plantedKey[(record.pos + plantedPhase) % 256]),
}));
const positive = hits(planted, plantedKey, "global", 1, plantedPhase);
assert.deepEqual(positive, {english: 83, generous: 83});
assert(hits(planted, plantedKey, "global", 1, 0).english < 83);
console.log(JSON.stringify({
  source: "original LP2 GP29 corpus / transcription / 256-table",
  sourceRunes: original.length, sourceWords: words, singletons: singles.length,
  enumeratedPadModels: results.length * 256,
  bestEnglishSingletons: 15, bestGenerouslyAllowO: 20,
  exactPlantedControl: positive.english,
  results,
  interpretation: "No repeated source-table GP29 additive pad with a common phase and fixed rune clock meets the required source-native singleton-word plaintext test. No unknown plaintext or key is recovered."
}, null, 2));
