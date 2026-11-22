"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p33 = corpus.pages.find((page) => page.page === 33);
const p33Ink = ink.pages.find((page) => page.page === 33);
assert.ok(p33);
assert.ok(p33Ink);
assert.equal(p33.indices.length, 214);
assert.deepEqual(p33Ink.red_spans.map((span) => [span.start, span.length]), [[0, 10], [91, 8]]);

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const exponents = [state.e, 29 - state.K];
assert.deepEqual(exponents, [3, 27]);

const upper = p33.indices.slice(10, 91);
const lower = p33.indices.slice(99, 214);
assert.equal(upper.length, 81);
assert.equal(lower.length, 115);

const upperOut = upper.map((value) => powMod(value, exponents[0], 29));
const lowerOut = lower.map((value) => powMod(value, exponents[1], 29));
// Both source-selected power maps are bijections on GF(29).
// The inverse exponent of 3 modulo 28 is 19; 27=-1 is self-inverse.
assert.deepEqual(
  upperOut.map((value) => powMod(value, 19, 29)),
  upper
);
assert.deepEqual(
  lowerOut.map((value) => powMod(value, 27, 29)),
  lower
);

const model = buildSourceNativeTrigramModel({ corpus, referenceText: lp1Reference });
const rawScore = model.scoreChapters([upper, lower]).mean;
const decodedScore = model.scoreChapters([upperOut, lowerOut]).mean;
const solved57 = corpus.pages.find((page) => page.page === 57);
assert.ok(solved57);
const solved57Score = model.scoreChapters([solved57.indices]).mean;

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

console.log(JSON.stringify({
  status: "PASS",
  sourceSelection: {
    page: 33,
    pageAddressPair: exponents,
    upperBody: [10, 91, upper.length],
    lowerBody: [99, 214, lower.length],
    rule: "upper x^e mod29; lower x^(-K) mod29"
  },
  scores: {
    raw: rawScore,
    exactTransfer: decodedScore,
    solvedP57: solved57Score
  },
  outputs: {
    upper: spell(upperOut),
    lower: spell(lowerOut)
  },
  decision:
    "Negative exact transfer. The independently selected [e,-K]=[3,27] page-address key does not turn the two p33 black bodies into source-native prose under the direct per-rune power operation. Do not expand phases, alternate exponents, signs, or body partitions from this result."
}, null, 2));
