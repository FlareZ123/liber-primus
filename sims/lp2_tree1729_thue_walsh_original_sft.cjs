"use strict";

/**
 * Source-defined p8–p14 tree chapter has 1729 runes = GP29 THUE.
 * Test simple Thue–Morse original-cipher receivers, not author intention.
 * Windows 11 / Node 22 / CommonJS / read-only single runnable test.
 *
 * Run: node sims/lp2_tree1729_thue_walsh_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const solved = read("resources/external/relikd-solved-gp29-native-v1.json");
const gp = corpus.runes;
const trans = corpus.translit;
const mod29 = n => (n % 29 + 29) % 29;

/** @param {number} n @returns {number} */
function thue(n) {
  let bit = 0;
  while (n > 0) {
    bit ^= n & 1;
    n = Math.floor(n / 2);
  }
  return bit;
}

/** @param {number} n @returns {number[]} */
function digits29(n) {
  const digits = [];
  do {
    digits.unshift(n % 29);
    n = Math.floor(n / 29);
  } while (n > 0);
  return digits;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    hist[value]++;
  }
  return hist.reduce((sum, v) => sum + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {number[]} */
function splitIoc(values) {
  const groups = [[], []];
  for (let i = 0; i < values.length; i++) groups[thue(i)].push(values[i]);
  return groups.map(ioc);
}

/** @param {number[]} values @returns {number[]} */
function fwht(values) {
  const result = values.slice();
  assert.equal(result.length, 256);
  for (let length = 1; length < 256; length *= 2) {
    for (let start = 0; start < 256; start += length * 2) {
      for (let j = 0; j < length; j++) {
        const a = result[start + j];
        const b = result[start + j + length];
        result[start + j] = a + b;
        result[start + j + length] = a - b;
      }
    }
  }
  return result;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let ans = 1;
  for (let j = 1; j <= k; j++) ans = ans * (n - j + 1) / j;
  return ans;
}

/**
 * One-sided hypergeometric tail, useful only as an unadjusted diagnostic.
 * @param {number} total @param {number} sameSlots
 * @param {number} repeats @param {number} observedSame
 * @returns {number}
 */
function enrichmentP(total, sameSlots, repeats, observedSame) {
  let p = 0;
  for (let k = observedSame; k <= repeats; k++) {
    p += choose(sameSlots, k) * choose(total - sameSlots, repeats - k) /
      choose(total, repeats);
  }
  return p;
}

const treePages = corpus.pages.filter(p => p.page >= 8 && p.page <= 14);
const pageLengths = treePages.map(p => p.indices.length);
const cipher = treePages.flatMap(p => p.indices);
const digits = digits29(cipher.length);
const name = digits.map(i => trans[i]).join("");
assert.deepEqual(pageLengths, [255, 268, 263, 273, 261, 272, 137]);
assert.equal(cipher.length, 1729);
assert.deepEqual(digits, [2, 1, 18]);
assert.equal(name, "THUE");
console.log("SOURCE p8..p14 lengths:", pageLengths.join(","));
console.log("SOURCE rune total:", cipher.length, "GP29:", digits.join(","), name);

const native = solved.sections.flatMap(s => Array.from(s.source_text)
  .filter(g => gp.includes(g)).map(g => gp.indexOf(g)));
assert.equal(native.length, 2979);
const sourceSplit = splitIoc(cipher);
const minima = [Infinity, Infinity];
const maxima = [0, 0];
let controls = 0;
for (let first = 0; first + cipher.length <= native.length; first++) {
  const got = splitIoc(native.slice(first, first + cipher.length));
  for (let b = 0; b < 2; b++) {
    minima[b] = Math.min(minima[b], got[b]);
    maxima[b] = Math.max(maxima[b], got[b]);
  }
  controls++;
}
assert.equal(controls, 1251);
assert(sourceSplit[0] < minima[0] && sourceSplit[1] < minima[1]);
console.log("THUE parity class IoCs:", sourceSplit);
console.log("All solved-native 1729-window parity IoC minima:", minima);
console.log("All solved-native 1729-window parity IoC maxima:", maxima);
console.log("Solved-native windows:", controls);
console.log("DECISION: fixed secret GP29 permutation per Thue bit cannot restore native IoC.");

let best = {a:0, b:0, ioc:-1};
let aboveNative = 0;
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const decrypted = cipher.map((v, i) =>
      mod29(v - a * i - b * thue(i)));
    const score = ioc(decrypted);
    if (score > best.ioc) best = {a, b, ioc:score};
    if (score >= Math.min(...minima)) aboveNative++;
  }
}
assert.equal(aboveNative, 0);
console.log("ALL 841 affine index + Thue-bit additive masks: best", best,
  "at or above native floor:", aboveNative);

const repeat = {same:[0, 0], different:[0, 0]};
for (let i = 1; i < cipher.length; i++) {
  const slot = thue(i) === thue(i-1) ? repeat.same : repeat.different;
  slot[cipher[i] === cipher[i-1] ? 1 : 0]++;
}
assert.deepEqual(repeat, {same:[570, 6], different:[1149, 3]});
const diagnosticP = enrichmentP(1728, 576, 9, 6);
console.log("Adjacent-equal contingency [different,equal]:", repeat);
console.log("Unadjusted Thue same-bit enrichment hypergeometric p:", diagnosticP);
console.log("NOTE: 9 repeats and post-discovery tests cannot validate a historical Thue clock.");

assert.equal(grid.shape[0] * grid.shape[1], 256);
for (const radix of [59, 60]) {
  const original = grid.bytes.map(v =>
    radix === 60 ? v : v - Math.floor(v / 60));
  const transformed = fwht(original);
  const replay = fwht(transformed);
  assert.deepEqual(replay, original.map(v => v * 256));
  const residues = transformed.map(mod29);
  const spectrumIoc = ioc(residues);
  const upperNative = Math.min(...minima);
  assert(spectrumIoc < upperNative);
  console.log("p50 row-major 32x8 radix", radix,
    "FWHT->GP29 IoC", spectrumIoc, "Thue endpoint", transformed[255],
    "native floor", upperNative, "full 256-point replay PASS");
}
console.log("PASS: original-input THUE clue and bounded inverse gates; no LP2 plaintext recovered.");
