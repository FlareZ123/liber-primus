"use strict";

/**
 * Two independently historical 2014 Cicada operations, applied without
 * fitted keys or phases to two original seven-page LP2 candidate sections.
 * Node 18+, CommonJS. The original-source operations have independent
 * positive controls before the original-cipher inversions are scored.
 *
 * Historical source A: 2014 OutGuess period-7 key 1736254.
 * Historical source B: "Let the text guide you", solved LP1 plaintext
 * "WELCOME PILGRIM TO THE GREAT" as GP29 Vigenere key.
 *
 * This is a conditional mechanism-transfer gate, not a claim that LP2
 * supplied the missing instruction to combine either historical operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp1-plaintext-reference.txt"), "utf8");
const gp = corpus.translit;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = gp.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** Greedy GP29 spelling used in the independently solved original 2014 stage.
 * @param {string} text
 * @returns {number[]}
 */
function encodeGP(text) {
  const result = [];
  const words = text.toUpperCase().replace(/V/g, "U").replace(/K/g, "C")
    .replace(/[^A-Z ]/g, " ").split(/\s+/u);
  for (const word of words) {
    for (let k = 0; k < word.length;) {
      const match = translit.find(item => word.startsWith(item.s, k));
      if (match) { result.push(match.i); k += match.s.length; }
      else k++;
    }
  }
  return result;
}

const key = encodeGP("WELCOME PILGRIM TO THE GREAT");
assert.deepEqual(key, [7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18,6,4,28,16]);

/** Cyclic source-native GP Vigenere inverse; no unmotivated F special cases.
 * @param {number[]} source
 * @param {1|-1} direction -1 decrypt, +1 encrypt.
 * @returns {number[]}
 */
function shift(source, direction) {
  return source.map((value, i) =>
    (value + direction * key[i % key.length] + 29) % 29);
}

/** Historical seven-position column inverse.
 * @template T
 * @param {T[]} source
 * @param {number[]} order
 * @returns {T[]}
 */
function permuteSeven(source, order) {
  assert.equal(source.length % 7, 0);
  const result = [];
  for (let i = 0; i < source.length; i += 7)
    for (const j of order) result.push(source[i + j]);
  return result;
}
const inv = [0,6,2,5,1,4,3], fwd = [0,4,2,6,5,3,1];

const historicalInput =
  "TL BE IE OV UT HT RE ID TS EO ST PO SO YR " +
  "SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M";
const historicalOutput =
  "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133";
assert.equal(permuteSeven([...historicalInput.replace(/\s+/gu, "")], inv).join(""),
  historicalOutput);
assert.equal(permuteSeven([...historicalOutput], fwd).join(""),
  historicalInput.replace(/\s+/gu, ""));

const onion = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
let step = 0;
const historicalOnionPlain = [...onion].map(character => {
  const idx = runeIndex.get(character);
  if (idx === undefined) return character;
  return gp[(idx - key[step++ % key.length] + 29) % 29];
}).join("");
assert.equal(historicalOnionPlain, "AUOWYFGL5LCSFJ3 NONIAN");

/** Fixed Laplace-smoothed native solved LP1 trigram reference.
 * @param {number[]} source
 * @returns {(text:number[]) => number}
 */
function trigramScorer(source) {
  const bi = new Map(), tri = new Map();
  for (let i = 2; i < source.length; i++) {
    const b = source[i - 2] * 29 + source[i - 1];
    const t = b * 29 + source[i];
    bi.set(b, (bi.get(b) || 0) + 1);
    tri.set(t, (tri.get(t) || 0) + 1);
  }
  return text => {
    let log = 0;
    for (let i = 2; i < text.length; i++) {
      const b = text[i - 2] * 29 + text[i - 1];
      log += Math.log((1 + (tri.get(b * 29 + text[i]) || 0)) /
        (29 + (bi.get(b) || 0)));
    }
    return log / (text.length - 2);
  };
}

const score = trigramScorer(encodeGP(reference.replace(/^#.*$/gm, "")));
const p8to14 = corpus.pages.filter(p => p.page >= 8 && p.page <= 14)
  .flatMap(p => p.indices);
const p33 = corpus.pages.find(p => p.page === 33);
const p33to39 = p33.indices.slice(91).concat(
  corpus.pages.filter(p => p.page >= 34 && p.page <= 39)
    .flatMap(p => p.indices));
assert.equal(p8to14.length, 1729);
assert.equal(p33to39.length, 1589);

/** @param {number[]} source */
function compare(source) {
  const transposeThenVigenere = shift(permuteSeven(source, inv), -1);
  const vigenereThenTranspose = permuteSeven(shift(source, -1), inv);
  assert.deepEqual(permuteSeven(shift(transposeThenVigenere, 1), fwd), source);
  assert.deepEqual(shift(permuteSeven(vigenereThenTranspose, fwd), 1), source);
  const outputs = {
    original: source,
    historicalTransposeThenKey: transposeThenVigenere,
    historicalKeyThenTranspose: vigenereThenTranspose,
  };
  return Object.fromEntries(Object.entries(outputs).map(([name, text]) => [
    name, {trigram: score(text), preview: text.slice(0, 80).map(i => gp[i]).join("")}
  ]));
}

const results = {p8to14: compare(p8to14), p33local91to39: compare(p33to39)};
const expected = {
  p8to14: [-3.423115827859994, -3.419912706629668, -3.40991646055166],
  p33local91to39: [-3.4238848193756737, -3.412795808127559, -3.417678191103644],
};
for (const [section, values] of Object.entries(expected)) {
  const measured = Object.values(results[section]).map(x => x.trigram);
  for (let i = 0; i < measured.length; i++)
    assert(Math.abs(measured[i] - values[i]) < 1e-9);
}
assert(score(encodeGP(reference.replace(/^#.*$/gm, ""))) > -2.3);

console.log(JSON.stringify({
  historicalPositiveControls: {
    transposition: historicalOutput,
    gpVigenere: historicalOnionPlain,
  },
  key: "WELCOME PILGRIM TO THE GREAT",
  sections: results,
  conclusion: "Both frozen historical two-layer orders remain nonlinguistic on original LP2; no recovered plaintext or authentic LP2 key selection.",
}, null, 2));
