"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const gpMap = new Map([...corpus.runes].map((r, i) => [r, i]));
const {words, runeCount, crossPageWords} = parseSharedCorpus();
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);
assert.deepEqual(corpus.pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.deepEqual(corpus.pages[3].indices.slice(119, 122), [13, 23, 2]);

/** @param {number} x */
function mod(x) { return ((x % 29) + 29) % 29; }

/** @param {ArrayLike<number>} xs */
function ioc(xs) {
  const freq = new Int32Array(29);
  for (const x of xs) freq[x]++;
  let equal = 0;
  for (const n of freq) equal += n * (n - 1);
  return equal / (xs.length * (xs.length - 1));
}

/** @param {string} text */
function toGP(text) {
  const source = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/[VKQZ]/g, c => ({V: "U", K: "C", Q: "C", Z: "S"})[c])
    .replace(/[^A-Z]/g, "");
  const digraph = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
  const tokens = [];
  const letters = new Map(corpus.translit.map((name, index) => [name, index]));
  for (let i = 0; i < source.length; i++) {
    const pair = source.slice(i, i + 2);
    if (digraph.has(pair)) { tokens.push(letters.get(pair)); i++; }
    else tokens.push(letters.get(source[i]));
  }
  assert(tokens.every(Number.isInteger));
  return tokens;
}

/**
 * Evaluate a word's GF(29) polynomial and its formal derivative at X=24.
 * Ciphertext runes are high-degree-first coefficients.
 * @param {number[]} symbols
 * @returns {[number, number]}
 */
function state(symbols) {
  let value = 0;
  let derivative = 0;
  for (const rune of symbols) {
    derivative = mod(24 * derivative + value);
    value = mod(24 * value + rune);
  }
  return [value, derivative];
}

const originals = words.map(w => [...w.runes].map(r => gpMap.get(r)));
assert(originals.flat().every(Number.isInteger));
const orientations = [
  originals.map(state),
  originals.map(w => state([...w].reverse()))
];

/** @param {number[]} symbols @param {number} target */
function encodePlantedWord(symbols, target) {
  // For output P=E+2D, fixing every prefix rune makes the last rune unique.
  let e = 0, d = 0;
  for (const rune of symbols.slice(0, -1)) {
    d = mod(24 * d + e);
    e = mod(24 * e + rune);
  }
  const last = mod(target - 24 * e - 2 * (24 * d + e));
  return symbols.slice(0, -1).concat(last);
}

/**
 * Exact search over the 840 nonzero affine trace/projection directions.
 * A secret additive output offset cannot change coincidence frequency.
 * @param {Array<[number, number]>} pairs
 */
function scanLinear(pairs) {
  let best = {ioc: -1};
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    if (!a && !b) continue;
    const histogram = new Int32Array(29);
    for (const [x, y] of pairs) histogram[(a * x + b * y) % 29]++;
    let equal = 0;
    for (const count of histogram) equal += count * (count - 1);
    const score = equal / (pairs.length * (pairs.length - 1));
    if (score > best.ioc) best = {a, b, ioc: score};
  }
  return best;
}

/**
 * Exhaustively scan all 29^2 possible secret field translations.
 * Norm_H(a+bz)=a^2-18ab+11b^2; Norm_p3(a+bu)=a^2+3ab-8b^2.
 * @param {Array<[number, number]>} pairs
 * @param {number} cross
 * @param {number} square
 */
function scanNorm(pairs, cross, square) {
  let best = {ioc: -1};
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    const histogram = new Int32Array(29);
    for (const [x, y] of pairs) {
      const e = mod(x - a), d = mod(y - b);
      histogram[mod(e * e + cross * e * d + square * d * d)]++;
    }
    let equal = 0;
    for (const count of histogram) equal += count * (count - 1);
    const score = equal / (pairs.length * (pairs.length - 1));
    if (score > best.ioc) best = {a, b, ioc: score};
  }
  return best;
}

/** Return log_u for all 840 nonzero field elements in GF29[u]/(u^2-3u-8). */
function primitiveLog() {
  const lookup = new Int16Array(841).fill(-1);
  let a = 1, b = 0;
  for (let exponent = 0; exponent < 840; exponent++) {
    const index = 29 * a + b;
    assert.equal(lookup[index], -1);
    lookup[index] = exponent;
    [a, b] = [mod(8 * b), mod(a + 3 * b)];
  }
  assert.deepEqual([a, b], [1, 0]);
  return lookup;
}

/**
 * Enumerate all initial discrete-log phases, both exponent directions and
 * both ordinary base-29 digits. The zero field element uses a fixed marker 28.
 * @param {Array<[number, number]>} pairs
 * @param {Int16Array} log
 */
function scanLog(pairs, log) {
  const exponents = pairs.map(([x, y]) => log[29 * x + y]);
  const zeros = exponents.filter(n => n < 0).length;
  let best = {ioc: -1};
  for (const sign of [1, -1]) for (const digit of ["low", "high"]) {
    for (let phase = 0; phase < 840; phase++) {
      const histogram = new Int32Array(29);
      for (const n of exponents) {
        const rank = n < 0 ? 28 : ((sign * n - phase + 1680) % 840);
        const value = digit === "low" ? rank % 29 : Math.floor(rank / 29);
        histogram[value]++;
      }
      let equal = 0;
      for (const count of histogram) equal += count * (count - 1);
      const score = equal / (pairs.length * (pairs.length - 1));
      if (score > best.ioc) best = {sign, digit, phase, ioc: score, zeros};
    }
  }
  return best;
}

const control = toGP(fs.readFileSync(
  path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8"));
assert(control.length >= 2896);
const native = control.slice(0, words.length);
const plant = originals.map((w, i) => encodePlantedWord(w, native[i]));
const recovered = plant.map(w => {
  const [e, d] = state(w);
  return mod(e + 2 * d);
});
assert.deepEqual(recovered, native);
assert(plant.every((w, i) => w.length === originals[i].length));
assert(plant.every((w, i) =>
  w.slice(0, -1).every((v, j) => v === originals[i][j])));
assert.equal(plant.flat().length, 12956);
assert(Math.abs(ioc(recovered) - 0.06171098960867947) < 1e-12);

let nativeMin = Infinity, nativeWindows = 0;
for (let start = 0; start + 2896 <= control.length; start += 101) {
  nativeMin = Math.min(nativeMin, ioc(control.slice(start, start + 2896)));
  nativeWindows++;
}
assert.equal(nativeWindows, 2119);
assert(Math.abs(nativeMin - 0.0547588717449594) < 1e-12);

const log = primitiveLog();
const measures = orientations.map((pairs, direction) => ({
  direction: direction ? "reverse" : "printed",
  linear: scanLinear(pairs),
  normH: scanNorm(pairs, -18, 11),
  normP3: scanNorm(pairs, 3, -8),
  log: scanLog(pairs, log)
}));
assert(Math.abs(measures[0].linear.ioc - 0.035389412112711) < 1e-12);
assert(Math.abs(measures[1].linear.ioc - 0.035709548755236215) < 1e-12);
assert(Math.abs(measures[0].normH.ioc - 0.03603016250155059) < 1e-12);
assert(Math.abs(measures[1].normH.ioc - 0.03618212005839751) < 1e-12);
assert(Math.abs(measures[0].normP3.ioc - 0.03603207091670722) < 1e-12);
assert(Math.abs(measures[1].normP3.ioc - 0.036162081699252856) < 1e-12);
assert(Math.abs(measures[0].log.ioc - 0.03460767755417513) < 1e-12);
assert(Math.abs(measures[1].log.ioc - 0.03476965429059438) < 1e-12);

const highest = Math.max(...measures.flatMap(r =>
  [r.linear.ioc, r.normH.ioc, r.normP3.ioc, r.log.ioc]));
assert(highest < nativeMin);
console.log(JSON.stringify({
  source: {words: words.length, runes: runeCount, crossPageWords},
  modeled: {
    linearCases: 2 * (29 * 29 - 1),
    normCases: 2 * 2 * 29 * 29,
    logCases: 2 * 2 * 2 * 840
  },
  nativeReference: {
    tokens: control.length,
    windows: nativeWindows,
    stride: 101,
    minimumIoC: nativeMin,
    plantedIoC: ioc(native),
    plantedSymbols: recovered.length
  },
  maximumOriginalIoC: highest,
  original: measures,
  conclusion: "No source-field word-to-one-rune readout recovers native GP prose"
}, null, 2));
