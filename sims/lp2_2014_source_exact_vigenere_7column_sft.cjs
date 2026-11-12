#!/usr/bin/env node
"use strict";
/**
 * Source-exact Stage04 reversed-rune lookup and historical Stage05 period-seven
 * columnar inverse, screened on two original LP2 seven-divisible regions.
 *
 * The two historical operations occurred at distinct stages; their
 * combination on LP2 is an exploratory source-motivated hypothesis.
 * Node.js 22, CommonJS; deterministic, standalone, no packages or network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const lp1 = fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp1-plaintext-reference.txt"), "utf8");

// Historical Stage04 RUNE_LOOKUP insertion order (value alternatives shown).
const lookup = [
  ["ᛠ",["F"]],["ᛡ",["U"]],["ᚣ",["TH"]],["ᚫ",["O"]],
  ["ᚪ",["R"]],["ᛞ",["C","K"]],["ᛟ",["G"]],["ᛝ",["W"]],
  ["ᛚ",["H"]],["ᛗ",["N"]],["ᛖ",["I"]],["ᛒ",["J"]],
  ["ᛏ",["EO"]],["ᛋ",["P"]],["ᛉ",["X"]],["ᛈ",["S","Z"]],
  ["ᛇ",["T"]],["ᛄ",["B"]],["ᛁ",["E"]],["ᚾ",["M"]],
  ["ᚻ",["L"]],["ᚹ",["NG","ING"]],["ᚷ",["OE"]],["ᚳ",["D"]],
  ["ᚱ",["A"]],["ᚩ",["AE"]],["ᚦ",["Y"]],
  ["ᚢ",["IO","IA"]],["ᚠ",["EA"]]
];
const runeKeys = lookup.map(x => x[0]).reverse();
assert.deepEqual(runeKeys, corpus.runes);
const valuesReversed = lookup.map(x => x[1]).reverse();
const valuesForward = lookup.map(x => x[1]);
const phrase = "WELCOMEPILGRIMTOTHE";
/** Historical 2014 source bug: peek TH as one token but consume only T.
 * @param {string} key @returns {number[]}
 */
function sourceBugKey(key) {
  const out = [];
  for (let i = 0; i < key.length; i++) {
    const token = valuesReversed.findIndex(words =>
      words.some(w => (i + 1 < key.length && key.slice(i, i + 2) === w) ||
        key[i] === w));
    assert.ok(token >= 0);
    out.push(token + 1);
  }
  return out;
}
/** Correct GP tokenization, consuming each recognized two-letter token.
 * @param {string} key @returns {number[]}
 */
function gpTokenKey(key) {
  const out = [];
  for (let i = 0; i < key.length;) {
    const d = valuesReversed.findIndex(tokens => tokens.includes(key.slice(i, i + 2)));
    const j = d >= 0 ? d : valuesReversed.findIndex(tokens => tokens.includes(key[i]));
    assert.ok(j >= 0);
    out.push(j + 1);
    i += d >= 0 ? 2 : 1;
  }
  return out;
}
const buggyKey = sourceBugKey(phrase), fixedKey = gpTokenKey(phrase);
assert.equal(buggyKey.length, 19);
assert.equal(fixedKey.length, 18);
assert.deepEqual(fixedKey,
  [22,11,9,24,26,10,11,16,19,9,23,25,19,10,13,26,27,11]);

/** Exact archive's reversed-rune-lookup emission into GP29 values.
 * GP rune index C gives output index (28-C-keyShift) mod29.
 * @param {number[]} src @param {number[]} shifts @returns {number[]}
 */
function historicalInverse(src, shifts) {
  return src.map((v, i) => (28 - v - shifts[i % shifts.length] + 58) % 29);
}
/** Inverse of that historical transformation, for reencryption.
 * @param {number[]} src @param {number[]} shifts @returns {number[]}
 */
function historicalForward(src, shifts) {
  return historicalInverse(src, shifts);
}

/** Reproduce the 18-rune Stage04 onion-address positive.
 * @param {number[]} shifts @returns {string}
 */
function originalOnion(shifts) {
  let clock = 0;
  return [..."ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ"].map(symbol => {
    const i = corpus.runes.indexOf(symbol);
    if (i < 0) return symbol;
    const output = (28 - i - shifts[clock++ % shifts.length] + 58) % 29;
    return valuesForward[28-output][0];
  }).join("");
}
assert.equal(originalOnion(buggyKey), "AUOWYFGL5LCSFJ3 NONPM");
assert.equal(originalOnion(fixedKey), "AUOWYFGL5LCSFJ3 NONION");
// The original source permits C/K, S/Z and the Onion-service V spelling;
// the corrected fixed-key readout yields AVOWYFGL5LKZFJ3N.ONION.

const permuteSource = [0, 6, 2, 5, 1, 4, 3];
const permuteInverse = [0, 4, 2, 6, 5, 3, 1];
/** @template T @param {T[]} src @param {number[]} order @returns {T[]} */
function permuteSeven(src, order) {
  assert.equal(src.length % 7, 0);
  const out = [];
  for (let i = 0; i < src.length; i += 7)
    for (const k of order) out.push(src[i + k]);
  return out;
}
const stage05Input = ("TL BE IE OV UT HT RE ID TS EO ST PO SO YR " +
  "SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M").replace(/\s+/gu, "");
const stage05Expected = "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133";
assert.equal(permuteSeven([...stage05Input],permuteSource).join(""),
  stage05Expected);
assert.equal(permuteSeven([...stage05Expected],permuteInverse).join(""),
  stage05Input);

/** Canonical GP29 control text.
 * @param {string} text @returns {number[]}
 */
function normalize(text) {
  const tokens = corpus.translit.map((t, i) => ({ t, i }))
    .sort((a, b) => b.t.length - a.t.length);
  const out = [];
  for (const word of text.toUpperCase().replace(/V/g, "U").replace(/K/g, "C")
    .replace(/[^A-Z ]/g, " ").split(/\s+/u)) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(x => word.startsWith(x.t, i));
      if (token) { out.push(token.i); i += token.t.length; }
      else i++;
    }
  }
  return out;
}
const training = normalize(lp1.replace(/^#.*$/gm, ""));
const two = new Map(), three = new Map();
for (let i = 2; i < training.length; i++) {
  const b = 29*training[i-2] + training[i-1];
  two.set(b, (two.get(b) || 0) + 1);
  const t = 29*b + training[i];
  three.set(t, (three.get(t) || 0) + 1);
}
/** @param {number[]} text @returns {number} */
function score(text) {
  let total = 0;
  for (let i = 2; i < text.length; i++) {
    const b = 29*text[i-2] + text[i-1];
    total += Math.log(((three.get(29*b+text[i])||0)+1) /
      ((two.get(b)||0)+29));
  }
  return total/(text.length-2);
}
assert.ok(score(training) > -2.4);

const spans = [
  { label:"p8-14", text:corpus.pages.filter(p => p.page>=8&&p.page<=14)
    .flatMap(p => p.indices), expectedLength:1729 },
  { label:"p33-red8-to-p39", text:corpus.pages.find(p => p.page===33)
    .indices.slice(91).concat(corpus.pages.filter(p => p.page>=34&&p.page<=39)
    .flatMap(p => p.indices)), expectedLength:1589 }
];
const output = [];
for (const span of spans) {
  assert.equal(span.text.length, span.expectedLength);
  for (const [variant,key] of [["historical-bug19",buggyKey],
    ["corrected-GP18",fixedKey]]) {
    // Both orders are reversible, with the original Stage05 inverse.
    const transposeThenKey = historicalInverse(
      permuteSeven(span.text,permuteSource), key);
    const keyThenTranspose = permuteSeven(
      historicalInverse(span.text,key),permuteSource);
    assert.deepEqual(permuteSeven(
      historicalForward(transposeThenKey,key),permuteInverse),span.text);
    assert.deepEqual(historicalForward(
      permuteSeven(keyThenTranspose,permuteInverse),key),span.text);

    // Native-language plants must survive both composite forward inverses.
    const plant = training.slice(0,span.text.length);
    const c1 = permuteSeven(historicalForward(plant,key),permuteInverse);
    const c2 = historicalForward(permuteSeven(plant,permuteInverse),key);
    assert.deepEqual(historicalInverse(
      permuteSeven(c1,permuteSource),key),plant);
    assert.deepEqual(permuteSeven(
      historicalInverse(c2,key),permuteSource),plant);
    output.push({
      originalSpan:span.label, historicalKey:variant,
      cipherScore:score(span.text), nativePlantScore:score(plant),
      transposeThenKeyScore:score(transposeThenKey),
      keyThenTransposeScore:score(keyThenTranspose),
      preview:transposeThenKey.slice(0,48).map(x => corpus.translit[x]).join("")
    });
  }
}
assert.equal(output.length, 4);
assert.ok(output.every(row => row.transposeThenKeyScore < -3.35
  && row.keyThenTransposeScore < -3.35));
console.log(JSON.stringify({
  status:"PASS",originalRunglyphControl:originalOnion(fixedKey),
  stage05PermutationControl:stage05Expected,
  historicalSourceBug:buggyKey.length,
  correctedGpKeySymbols:fixedKey.length,
  testedOriginalSpanDecryptions:8,
  recoveredUnknownPlaintext:false, output
},null,2));
