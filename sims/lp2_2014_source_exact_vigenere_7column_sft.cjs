#!/usr/bin/env node
"use strict";
/**
 * Source-exact Stage04 reversed-rune lookup and historical Stage05 period-seven
 * columnar inverse, screened on two original LP2 seven-divisible regions,
 * plus a Stage05-only transfer to the final p54-p55 308-rune visual chapter.
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
 * The original rune-key order is reversed, but the output VALUE lookup is forward.
 * Thus canonical GP plaintext index is (C + keyShift) mod29.
 * @param {number[]} src @param {number[]} shifts @returns {number[]}
 */
function historicalInverse(src, shifts) {
  return src.map((v, i) => (v + shifts[i % shifts.length]) % 29);
}
/** Inverse of that historical transformation, for reencryption.
 * @param {number[]} src @param {number[]} shifts @returns {number[]}
 */
function historicalForward(src, shifts) {
  return src.map((v, i) => (v - shifts[i % shifts.length] + 29) % 29);
}

/** Reproduce the 18-rune Stage04 onion-address positive.
 * @param {number[]} shifts @returns {string}
 */
function originalOnion(shifts) {
  let clock = 0;
  return [..."ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ"].map(symbol => {
    const i = corpus.runes.indexOf(symbol);
    if (i < 0) return symbol;
    const output = (i + shifts[clock++ % shifts.length]) % 29;
    return valuesForward[output][0];
  }).join("");
}
assert.equal(originalOnion(buggyKey), "AUOWYFGL5LCSFJ3NONPM");
assert.equal(originalOnion(fixedKey), "AUOWYFGL5LCSFJ3NONION");
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

// Separate Stage05-only transfer to the final original-image visual chapter.
// p54=232 and p55=76; together 308=44*7. The Stage11 HTML's 133/331
// values read as octal give 91=13*7 and 217=31*7, but no source-visible
// boundary exists there and the split is transform-equivalent to whole.
const p54 = corpus.pages.find(p => p.page === 54).indices;
const p55 = corpus.pages.find(p => p.page === 55).indices;
const finalChapter = p54.concat(p55);
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(finalChapter.length, 308);
assert.equal(finalChapter.length % 7, 0);
const octal133 = parseInt("133", 8), octal331 = parseInt("331", 8);
assert.deepEqual([octal133, octal331], [91, 217]);
assert.equal(octal133 + octal331, finalChapter.length);
assert.equal(octal133 % 7, 0);
assert.equal(octal331 % 7, 0);
const splitStage05 = permuteSeven(finalChapter.slice(0, octal133), permuteSource)
  .concat(permuteSeven(finalChapter.slice(octal133), permuteSource));
const finalSourceInverse = permuteSeven(finalChapter, permuteSource);
const finalOpposite = permuteSeven(finalChapter, permuteInverse);
assert.deepEqual(splitStage05, finalSourceInverse);
assert.deepEqual(permuteSeven(finalSourceInverse, permuteInverse), finalChapter);
assert.deepEqual(permuteSeven(finalOpposite, permuteSource), finalChapter);

// Exact 7! null distribution: compare the externally fixed 2014 orders to
// every possible single seven-position permutation, without selecting one.
const permutationScores = [];
function enumerateSeven(prefix, remaining) {
  if (remaining.length === 0) {
    permutationScores.push({ order: prefix.slice(), score: score(permuteSeven(finalChapter, prefix)) });
    return;
  }
  for (let i = 0; i < remaining.length; i++) {
    const next = remaining[i];
    enumerateSeven(prefix.concat(next), remaining.slice(0, i).concat(remaining.slice(i + 1)));
  }
}
enumerateSeven([], [0, 1, 2, 3, 4, 5, 6]);
assert.equal(permutationScores.length, 5040);
permutationScores.sort((a, b) => b.score - a.score);
const permutationRank = order =>
  permutationScores.findIndex(row => row.order.join(",") === order.join(",")) + 1;
const sourceRank = permutationRank(permuteSource);
const oppositeRank = permutationRank(permuteInverse);
const identityRank = permutationRank([0, 1, 2, 3, 4, 5, 6]);
assert.equal(sourceRank, 961);
assert.equal(oppositeRank, 1175);
assert.equal(identityRank, 2763);
const finalChapterGate = {
  pageLengths: [p54.length, p55.length],
  totalRunes: finalChapter.length,
  blocksOfSeven: finalChapter.length / 7,
  base8Candidate: {
    title133: octal133,
    id331: octal331,
    blockRows: [octal133 / 7, octal331 / 7],
    splitIsTransformEquivalent: true
  },
  rawScore: score(finalChapter),
  sourceInverseScore: score(finalSourceInverse),
  oppositePermutationScore: score(finalOpposite),
  sourceInversePreview: finalSourceInverse.slice(0, 120).map(i => corpus.translit[i]).join(""),
  oppositePreview: finalOpposite.slice(0, 120).map(i => corpus.translit[i]).join(""),
  permutationNull: {
    total: permutationScores.length,
    sourceRank,
    sourcePercentile: (1 - sourceRank / permutationScores.length) * 100,
    oppositeRank,
    oppositePercentile: (1 - oppositeRank / permutationScores.length) * 100,
    identityRank,
    identityPercentile: (1 - identityRank / permutationScores.length) * 100,
    bestScore: permutationScores[0].score,
    topOnePercentCutoff: permutationScores[Math.floor(permutationScores.length * 0.01)].score
  }
};
assert(Math.abs(finalChapterGate.rawScore - (-3.413674261058247)) < 1e-10);
assert(Math.abs(finalChapterGate.sourceInverseScore - (-3.3995136385008187)) < 1e-10);
assert(Math.abs(finalChapterGate.oppositePermutationScore - (-3.401735169183637)) < 1e-10);
console.log(JSON.stringify({
  status:"PASS",originalRunglyphControl:originalOnion(fixedKey),
  stage05PermutationControl:stage05Expected,
  historicalSourceBug:buggyKey.length,
  correctedGpKeySymbols:fixedKey.length,
  testedOriginalSpanDecryptions:8,
  recoveredUnknownPlaintext:false, output, finalChapterGate
},null,2));
