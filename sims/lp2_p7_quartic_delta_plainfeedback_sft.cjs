"use strict";
/**
 * Source-frozen LP2 p7 quartic / p8 ciphertext-difference plaintext-feedback
 * test. One runnable Node.js 22 file; no CLI arguments or network access.
 * From the repository root: node sims/lp2_p7_quartic_delta_plainfeedback_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} rel @returns {string} */
function load(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % 29) + 29) % 29;
}
/** @param {number} x @returns {number} */
function quartic(x) {
  return mod(11 + 26 * x + 8 * x * x + 15 * x * x * x + 2 * x * x * x * x);
}
/**
 * Exact inverse: P_i = C_i - C_(i-1) + sign * quartic(P_(i-1)).
 * @param {number[]} ciphertext
 * @param {number} priorCipher
 * @param {number} priorPlain
 * @param {number} sign
 * @returns {number[]}
 */
function decode(ciphertext, priorCipher, priorPlain, sign) {
  const output = [];
  let c = priorCipher;
  let p = priorPlain;
  for (const nextCipher of ciphertext) {
    const nextPlain = mod(nextCipher - c + sign * quartic(p));
    output.push(nextPlain);
    c = nextCipher;
    p = nextPlain;
  }
  return output;
}
/** @param {number[]} plaintext @param {number} priorCipher @param {number} priorPlain @param {number} sign @returns {number[]} */
function encode(plaintext, priorCipher, priorPlain, sign) {
  const output = [];
  let c = priorCipher;
  let p = priorPlain;
  for (const nextPlain of plaintext) {
    c = mod(c + nextPlain - sign * quartic(p));
    output.push(c);
    p = nextPlain;
  }
  return output;
}
/** @param {number[]} nums @returns {number} */
function ioc(nums) {
  const counts = new Array(29).fill(0);
  for (const x of nums) counts[x] += 1;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) /
    (nums.length * (nums.length - 1));
}
/** @param {number[]} nums @param {number[]} pageLengths @param {number} sign @returns {number} */
function countPredictedRepeats(nums, pageLengths, sign) {
  let offset = 0;
  let count = 0;
  for (const len of pageLengths) {
    for (let i = offset + 1; i < offset + len; i += 1) {
      if (nums[i] === mod(sign * quartic(nums[i - 1]))) count += 1;
    }
    offset += len;
  }
  assert.equal(offset, nums.length);
  return count;
}

/** @typedef {{page: number, indices: number[], runic_count: number, status: string}} Page */
/** @typedef {{translit: string[], pages: Page[]}} Corpus */
const corpus = /** @type {Corpus} */ (JSON.parse(
  load("resources/liber-primus/lp2-corpus.json")
));
const encrypted = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const pageLengths = encrypted.map((p) => p.indices.length);
const N = pageLengths.reduce((total, n) => total + n, 0);
assert.equal(encrypted.length, 55);
assert.equal(N, 12956);
assert.equal(corpus.pages.find((p) => p.page === 50).indices.length, 0);
assert.equal(pageLengths.reduce((sum, len) => sum + len - 1, 0), 12901);
assert.equal(quartic(3), 3);
assert.equal(quartic(4), 4);
const initial = corpus.pages.find((p) => p.page === 8);
assert.equal(initial.indices.length, 255);
assert.deepEqual(initial.indices.slice(0, 12), [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
const chapter = corpus.pages.filter((p) => p.page >= 8 && p.page <= 14)
  .flatMap((p) => p.indices);
assert.equal(chapter.length, 1729);
const black = chapter.slice(12);
assert.equal(black.length, 1717);
const p57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(p57.length, 95);

console.log("Source p7 polynomial:", Array.from({ length: 29 }, (_, x) => quartic(x)).join(","));
console.log("Original LP2 page-internal ciphertext repeats:",
  encrypted.reduce((count, pg) => count + pg.indices.reduce(
    (n, x, i) => n + Number(i > 0 && x === pg.indices[i - 1]), 0), 0),
  "/12901");
console.log("Source p8 black body:", black.length, "GP29 runes. Last red rune = 17.");
for (const sign of [-1, 1]) {
  for (const seed of [3, 4, 17]) {
    const out = decode(black, 17, seed, sign);
    assert.deepEqual(encode(out, 17, seed, sign), black);
    const initialReading = out.slice(0, 24).map((x) => corpus.translit[x]).join(" ");
    console.log("Authentic p8-14 sign", sign, "seed", seed,
      "IoC", ioc(out).toFixed(9), "first 24:", initialReading);
    const planted = encode(p57, 17, seed, sign);
    assert.deepEqual(decode(planted, 17, seed, sign), p57);
    assert.deepEqual(encode(decode(planted, 17, seed, sign), 17, seed, sign), planted);
  }
}

/**
 * The reference encoder is used only to count the model's unavoidable
 * equal-ciphertext predictions on native GP English. The exact original
 * LP2 numeric decoder and solved p57 positive above do not depend on it.
 * @param {string} input @returns {number[]}
 */
function encodeEnglish(input) {
  const index = new Map(corpus.translit.map((label, idx) => [label, idx]));
  const labels = Array.from(index.keys()).sort((a, b) => b.length - a.length);
  const s = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/[QK]/g, "C").replace(/V/g, "U")
    .replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    const label = labels.find((x) => s.startsWith(x, i));
    assert.ok(label, "Every normalized English letter needs a GP rune");
    out.push(index.get(label));
    i += label.length;
  }
  return out;
}
for (const rel of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
]) {
  const gp = encodeEnglish(load(rel));
  assert.ok(gp.length > N);
  for (const start of [0, Math.floor((gp.length - N) / 2), gp.length - N]) {
    const sample = gp.slice(start, start + N);
    const plus = countPredictedRepeats(sample, pageLengths, 1);
    const minus = countPredictedRepeats(sample, pageLengths, -1);
    console.log("Native GP control:", path.basename(rel), "start", start,
      "predicted repeats (+F,-F)", plus, minus, "vs observed 86");
    assert.ok(plus > 86 && minus > 86);
  }
}
console.log("PASS: original p8-14 six complete inverses nonprose, six full native p57 plants exact, all nine independent source-native doublet checks incompatible with 86.");
