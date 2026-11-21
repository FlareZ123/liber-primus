"use strict";
/**
 * Original LP2 p8 taxicab cube hypothesis and a finite p0 9-cube donor inverse.
 * Run from repository root: node sims/lp2_p8_taxicab_cube_donor_sft.cjs
 * Read-only. No invented plaintext or key: all 288 inverses use source p0 bytes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const gibran = fs.readFileSync(path.join(root, "resources/control/gibran_prophet_58585.txt"), "utf8");

/** @param {number} first @param {number} last @returns {number[]} */
function pages(first, last) {
  return corpus.pages.filter((p) => p.page >= first && p.page <= last).flatMap((p) => p.indices);
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((acc, count) => acc + count * (count - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number} n @param {number} exponent @returns {number} */
function pow29(n, exponent) {
  let result = 1;
  for (let j = 0; j < exponent; j++) result = result * n % 29;
  return result;
}
const cube = Array.from({length: 29}, (_, n) => pow29(n, 3));
const root19 = Array.from({length: 29}, (_, n) => pow29(n, 19));
for (let n = 0; n < 29; n++) assert.equal(root19[cube[n]], n);

/** @param {number[]} positionPermutation @param {number[]} donor @returns {number[]} */
function donorRead(positionPermutation, donor) {
  return positionPermutation.map((i) => donor[i]);
}
/** @param {number[]} ciphertext @param {number[]} key @param {number} sign @param {string} method @returns {number[]} */
function decrypt(ciphertext, key, sign, method) {
  return ciphertext.map((v, i) => {
    const shifted = (v + sign * key[i] + 29) % 29;
    if (method === "direct") return shifted;
    if (method === "cube-before") return (root19[v] + sign * key[i] + 29) % 29;
    return root19[shifted];
  });
}
/** @param {number[]} positionPermutation @returns {number[]} */
function makePermutation(axes, mask) {
  return Array.from({length: 729}, (_, i) => {
    const coords = [Math.floor(i / 81), Math.floor(i / 9) % 9, i % 9];
    let address = 0;
    for (let d = 0; d < 3; d++) {
      const coord = coords[axes[d]];
      address = address * 9 + ((mask >> d) & 1 ? 8 - coord : coord);
    }
    return address;
  });
}
const axes = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const index = new Map(corpus.translit.map((s, i) => [s, i]));
  const tokens = [...corpus.translit].sort((a, b) => b.length - a.length);
  const normalized = text.toUpperCase().replace(/QU/g, "CW").replace(/K/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const runes = [];
  for (let i = 0; i < normalized.length;) {
    if (!/[A-Z]/.test(normalized[i])) { i++; continue; }
    if (normalized.startsWith("ING", i)) { runes.push(21); i += 3; continue; }
    const token = tokens.find((part) => normalized.startsWith(part, i));
    if (token) { runes.push(index.get(token)); i += token.length; }
    else i++;
  }
  return runes;
}
const p0 = pages(0, 2);
const section = pages(8, 14);
const p8 = section.slice(0, 729);
assert.equal(p0.length, 729);
assert.equal(section.length, 1729);
assert.equal(9**3 + 10**3, 1729);
assert.equal(section.slice(0, 4).map((v) => corpus.translit[v]).join(""), "XIXM");

/* Keep page wraps open and treat original dot/hyphen/section punctuation as word cuts. */
let offset = 0;
let printedWordStart = 0;
const wordCuts = new Set([0]);
const runeSet = new Set(corpus.runes);
for (const char of source) {
  if (runeSet.has(char)) offset++;
  else if ("-.$&%§".includes(char)) {
    if (offset !== printedWordStart) { wordCuts.add(offset); printedWordStart = offset; }
  }
}
wordCuts.add(offset);
const globalStart = pages(0, 7).length;
assert.equal(globalStart, 1874);
assert.equal(offset, 13136);
assert(wordCuts.has(globalStart + 729), "9-cube partition must align to an original printed-word edge");
assert(!wordCuts.has(globalStart + 1000), "alternative block order cuts a printed word");

const native = encodeGP(gibran);
assert(native.length > 62000);
const nativeScores = [];
for (let start = 0; start + 729 <= native.length; start += 57) {
  nativeScores.push(ioc(native.slice(start, start + 729)));
}
nativeScores.sort((a, b) => a - b);
const positivePlaintext = native.slice(100, 829);
const results = [];

for (let a = 0; a < axes.length; a++) {
  for (let mask = 0; mask < 8; mask++) {
    const permutation = makePermutation(axes[a], mask);
    assert.equal(new Set(permutation).size, 729);
    const key = donorRead(permutation, p0);
    for (const sign of [-1, +1]) {
      for (const method of ["direct", "cube-before", "cube-after"]) {
        const plaintext = decrypt(p8, key, sign, method);
        results.push({a, mask, sign, method, score: ioc(plaintext)});
        if (a === 4 && mask === 5 && sign === -1) {
          const synthetic = positivePlaintext.map((v, i) =>
            method === "direct" ? (v + key[i]) % 29 :
            method === "cube-before" ? cube[(v + key[i]) % 29] :
            (cube[v] + key[i]) % 29);
          assert.deepEqual(decrypt(synthetic, key, sign, method), positivePlaintext,
            "exact original-source-key positive inversion: " + method);
        }
      }
    }
  }
}
assert.equal(results.length, 288);
const group = (name) => results.filter((result) => result.method === name)
  .sort((a,b) => b.score - a.score);
const direct = group("direct");
const cubeBefore = group("cube-before");
const cubeAfter = group("cube-after");
assert(Math.abs(direct[0].score - cubeAfter[0].score) < 1e-14,
  "cube root is a single-alphabet permutation and conserves the IoC");
assert(results.every((result) => result.score < nativeScores[0]));

console.log(JSON.stringify({
  source: "LP2 pp0-2 and pp8-14 original canon; p8 literal prefix XIXM",
  sourceCounts: {p0: p0.length, section: section.length, cubeA: 729, cubeB: 1000},
  partition729AtOriginalPrintedWordEdge: true,
  partition1000AtOriginalPrintedWordEdge: false,
  nativeCalibration: {runes: native.length, windows: nativeScores.length,
    minIoC: nativeScores[0], medianIoC: nativeScores[Math.floor(nativeScores.length / 2)]},
  originalCubePrefixIoC: ioc(p8),
  tested: results.length,
  directBest: direct[0],
  cubeBeforeBest: cubeBefore[0],
  cubeAfterBest: cubeAfter[0],
  allSourceCandidatesBelowNativeMinimum: true,
  plantedGPInverseExact: true,
  interpretation: "finite one-layer original-source p0 donor receivers rejected; structural cube hint unverified"
}, null, 2));
