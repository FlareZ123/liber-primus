"use strict";

/**
 * SFT: signed-2013 DH exponentiation as a 51 x 127 field-pair consumer.
 * Node.js 22: run this script in sims/ through manual-readonly-commonjs-sft.
 *
 * This is a bounded hypothesis. The 2013 signed protocol demonstrates DH
 * exponentiation, but does not direct its use on LP2's later matrices.
 * Every source alphabet, original rune and printed order remains unchanged.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  quotientPairs,
  nativeGP,
  ioc,
  score
} = require("./gf841_51x127_outer_product_mask.cjs");

const base = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const M = 29;
/** @param {number} v */
const mod = v => ((v % M) + M) % M;

/** @typedef {[number, number]} Pair */
/** @param {Pair} x @param {Pair} y @returns {Pair} */
function multiply(x, y) {
  return [mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])];
}
/** @param {Pair} x @param {Pair} y @returns {Pair} */
function add(x, y) { return [mod(x[0] + y[0]), mod(x[1] + y[1])]; }
/** @param {Pair} x @param {Pair} y @returns {Pair} */
function subtract(x, y) { return [mod(x[0] - y[0]), mod(x[1] - y[1])]; }
/** @param {Pair} x @param {number} n @returns {Pair} */
function power(x, n) {
  assert(Number.isInteger(n) && n >= 0 && n < 840);
  /** @type {Pair} */
  let result = [1, 0];
  let factor = x;
  for (let exponent = n; exponent > 0; exponent = Math.floor(exponent / 2)) {
    if (exponent % 2) result = multiply(result, factor);
    factor = multiply(factor, factor);
  }
  return result;
}

/**
 * Original first-order mask from historical DH pow(base, exponent).
 * In the underlying GF(29^2) representation, u^2=8+3u.
 *
 * @param {number[]} input 12954 original rune indices or synthetic analog
 * @param {number[]} red 51 original red rune GP ordinal indices
 * @param {Pair[]} q 127 source-derived nonzero quotient field elements
 * @param {"ordinal"|"gpprime"} exponentMode
 * @param {"add"|"field"} cipherMode
 * @param {-1|1} direction
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transform(input, red, q, exponentMode, cipherMode, direction, encrypt) {
  assert.equal(input.length, 51 * 127 * 2);
  const output = new Array(input.length);
  for (let r = 0; r < 51; r++) {
    const e = exponentMode === "ordinal" ? red[r] : corpus.prime[red[r]];
    for (let j = 0; j < 127; j++) {
      const key = power(q[j], e);
      const kInv = power(key, 839);
      const i = 254 * r + 2 * j;
      /** @type {Pair} */
      const word = [input[i], input[i + 1]];
      let result;
      if (cipherMode === "add") {
        result = (encrypt ? -direction : direction) === 1
          ? add(word, key) : subtract(word, key);
      } else {
        result = multiply(word, (encrypt ? -direction : direction) === 1
          ? key : kInv);
      }
      output[i] = result[0];
      output[i + 1] = result[1];
    }
  }
  return output;
}

/** @param {number[]} values */
function train(values) {
  const freq = new Map();
  for (let i = 0; i + 2 < values.length; i++) {
    const triplet = values[i] * 841 + values[i + 1] * 29 + values[i + 2];
    freq.set(triplet, (freq.get(triplet) || 0) + 1);
  }
  return {h: freq, n: values.length - 2};
}

const all = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
const p53 = corpus.pages.find(p => p.page === 53);
const mark = ink.pages.find(p => p.page === 53)
  .red_spans.find(s => s.start === 128 && s.length === 51);
assert(mark && p53.indices.length === 179);
const red = p53.indices.slice(128);
assert.equal(red.length, 51);
assert.equal(all.length, 12956);
assert.deepEqual(all.slice(0, 2), [15, 8]);
const cipher = all.slice(2);
const q = quotientPairs(grid.bytes);
assert.equal(q.length, 127);
assert(q.every(pair => pair[0] !== 0 || pair[1] !== 0));

const sh = nativeGP(fs.readFileSync(path.join(base,
  "resources/control/shakespeare_first300k.txt"), "utf8"), corpus.translit);
const gi = nativeGP(fs.readFileSync(path.join(base,
  "resources/control/gibran_prophet_58585.txt"), "utf8"), corpus.translit);
const em = nativeGP(fs.readFileSync(path.join(base,
  "resources/control/emerson_essays_2944.txt"), "utf8"), corpus.translit);
const trigram = train(sh);
const sourceNativeControls = [sh, gi, em].map(x => ({
  ioc: ioc(x.slice(0, cipher.length)),
  trigram: score(x.slice(0, cipher.length), trigram)
}));
assert(sourceNativeControls.every(c => c.ioc > 0.05));
const plantedPlain = gi.slice(0, cipher.length);
assert.equal(plantedPlain.length, cipher.length);

const variants = [];
for (const exponentMode of ["ordinal", "gpprime"]) {
  for (const cipherMode of ["add", "field"]) {
    for (const direction of [-1, 1]) {
      const decoded = transform(cipher, red, q, exponentMode,
        cipherMode, direction, false);
      const restored = transform(decoded, red, q, exponentMode,
        cipherMode, direction, true);
      assert.deepEqual(restored, cipher);

      const plantC = transform(plantedPlain, red, q, exponentMode,
        cipherMode, direction, true);
      const plantD = transform(plantC, red, q, exponentMode,
        cipherMode, direction, false);
      assert.deepEqual(plantD, plantedPlain);

      const changedRed = red.slice();
      changedRed[0] = (changedRed[0] + 1) % 29;
      const wrong = transform(plantC, changedRed, q, exponentMode,
        cipherMode, direction, false);
      assert.notDeepEqual(wrong, plantedPlain);
      variants.push({
        exponentMode,
        cipherMode,
        inverse: cipherMode === "add"
          ? (direction === -1 ? "C-Q^e" : "C+Q^e")
          : (direction === -1 ? "C/Q^e" : "C*Q^e"),
        ioc: ioc(decoded),
        trigram: score(decoded, trigram),
        first24: decoded.slice(0, 24).map(v => corpus.translit[v]).join(" "),
        reencrypted: restored.length,
        plantRecovered: plantD.length
      });
    }
  }
}
assert.equal(variants.length, 8);
const bestOriginal = Math.max(...variants.map(v => v.trigram));
const worstNative = Math.min(...sourceNativeControls.map(v => v.trigram));
console.log(JSON.stringify({
  classification: bestOriginal < worstNative
    ? "Original-input negative for eight direct signed-DH exponentiation masks"
    : "Investigate unexpected score overlap before claiming a negative",
  source: {
    originalRunes: all.length,
    header: all.slice(0, 2),
    redRaggedSpan: red.length,
    qFieldElements: q.length,
    rows: 51,
    columns: 127,
    fieldRelation: "u^2=8+3u",
    historicalOperation: "2013 signed DH exponentiation, later LP2 role assignment unproved"
  },
  originalBaseline: {ioc: ioc(cipher), trigram: score(cipher, trigram)},
  sourceNativeControls,
  variants,
  bestOriginal,
  worstNative,
  verifiedSourceRoundTripAndPlant: true,
  recoveredUnknownPlaintext: false
}, null, 2));
