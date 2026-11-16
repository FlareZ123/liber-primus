"use strict";
/**
 * Original-LP2 word-length morphology: all 128 globally fixed choices of
 * GP29 multigraph contractions, and optional one-rune insertion mixture.
 * Node.js 22: node sims/lp2_wordlength_128_orthography_sft.cjs
 * Reads only existing, unmodified original and external-reference fixtures.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(gp.runes);
const ciphertext = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const originalHistogram = Array(12).fill(0);
let runeCount = 0;
let current = 0;
function finish() {
  if (current) originalHistogram[Math.min(current, 12) - 1]++;
  current = 0;
}
for (const symbol of ciphertext) {
  if (runeSet.has(symbol)) {
    current++;
    runeCount++;
  } else if ("-.$&§0123456789".includes(symbol)) {
    finish();
  }
}
finish();
assert.equal(runeCount, 12956);
assert.equal(originalHistogram.reduce((s, v) => s + v, 0), 2896);
assert.deepEqual(originalHistogram,
  [83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 25]);
const reference = read("resources/control/emerson_essays_2944.txt");
const emerson = reference.slice(reference.indexOf("SELF-RELIANCE"))
  .split("*** END OF")[0];
const words = Array.from(emerson.matchAll(/[A-Za-z]+/g), (m) =>
  m[0].toUpperCase().replace(/IO/g, "IA"));
assert.equal(words.length, 66519);
const multigraphs = ["TH", "EO", "OE", "EA", "AE", "IA", "ING"];
const canonical = gp.translit.map((s) => s === "NG" ? "ING" : s);
/** @param {number[]} hist @returns {number} */
function gTest(hist) {
  const n = originalHistogram.reduce((s, v) => s + v, 0);
  const m = hist.reduce((s, v) => s + v, 0);
  return 2 * originalHistogram.reduce((s, obs, i) =>
    s + (obs ? obs * Math.log(obs * m / (n * hist[i])) : 0), 0);
}
/** @param {number[]} base @param {number} rate @returns {number[]} */
function withInsertion(base, rate) {
  const n = base.reduce((s, v) => s + v, 0);
  const p = base.map((x) => x / n);
  const eligible = p.slice();
  eligible[0] = 0; // only words of length >= 2 are eligible
  return p.map((x, i) => x - rate * eligible[i] +
    (i ? rate * eligible[i - 1] : 0) +
    (i === 11 ? rate * eligible[11] : 0));
}
const all = [];
for (let mask = 0; mask < 128; mask++) {
  const split = multigraphs.filter((_, i) => mask & (1 << i));
  const alphabet = canonical.filter((s) => !split.includes(s))
    .sort((a, b) => b.length - a.length);
  const histogram = Array(12).fill(0);
  for (const word of words) {
    let length = 0;
    for (let i = 0; i < word.length;) {
      // Canonical GP29 tokenizer falls back to a single rune for
      // English letters not directly written in the 29-symbol alphabet.
      const label = alphabet.find((x) => word.startsWith(x, i));
      i += label ? label.length : 1;
      length++;
    }
    histogram[Math.min(length, 12) - 1]++;
  }
  let best = {r: 0, g: Infinity};
  for (let q = 0; q <= 160; q++) {
    const r = q / 200;
    const candidate = gTest(withInsertion(histogram, r));
    if (candidate < best.g) best = {r, g: candidate};
  }
  all.push({
    mask, split, noInsertionG: gTest(histogram),
    fittedG: best.g, fittedRate: best.r
  });
}
const byNoInsertion = all.slice().sort((a, b) =>
  a.noInsertionG - b.noInsertionG);
const byFitted = all.slice().sort((a, b) => a.fittedG - b.fittedG);
const canonicalMode = all[0];
const latinMode = all[127];
const nearZero = (a, b) => assert.ok(Math.abs(a - b) < 0.00001,
  "Expected " + a + " to equal " + b);
nearZero(canonicalMode.noInsertionG, 236.1385345);
nearZero(canonicalMode.fittedG, 16.47685186);
assert.equal(canonicalMode.fittedRate, 0.42);
nearZero(latinMode.noInsertionG, 61.13785439);
assert.equal(byNoInsertion[0].mask, 95);
nearZero(byNoInsertion[0].noInsertionG, 56.61522094);
assert.equal(byFitted[0].mask, 18);
nearZero(byFitted[0].fittedG, 16.23790366);
assert.equal(byFitted[0].fittedRate, 0.42);
const lowerRate = all.find((x) => x.mask === 83);
assert.equal(lowerRate.fittedRate, 0.21);
nearZero(lowerRate.fittedG, 16.35775598);
console.log(JSON.stringify({
  originalRunes: runeCount, originalWords: 2896,
  controlWords: words.length,
  canonicalMode,
  latinMode,
  bestNoInsertion: byNoInsertion.slice(0, 4),
  bestWithInsertion: byFitted.slice(0, 8),
  halvedInsertionRate: lowerRate
}, null, 2));
console.log("SFT PASS: no globally fixed GP multigraph split recovers the marginal LP2 shape; the fitted null rate is not unique.");
