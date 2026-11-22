"use strict";

/**
 * SFT for the p0 [3,4] ROAD/NUMBERS receiver word-sum -> DH bridge.
 * Run: node sims/lp2_p0_andtheir_wordsum_dh_bridge_sft.cjs
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod29 = (x) => ((x % 29) + 29) % 29;
const H = (x, y) => [mod29(x - y), mod29(x + y)];
const INV2 = 15;
const Hinv = (u, v) => [mod29((u + v) * INV2), mod29((v - u) * INV2)];

function parsePage(text) {
  const words = [];
  let current = [];
  let start = 0;
  let runePos = 0;

  function flush() {
    if (current.length === 0) return;
    const sum = current.reduce((a, b) => a + b, 0);
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      length: current.length,
      values: current.slice(),
      sum,
      sumMod29: mod29(sum),
    });
    current = [];
  }

  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (current.length === 0) start = runePos;
      current.push(value);
      runePos += 1;
    } else if ((ch === "-" || ch === ".") && current.length > 0) {
      flush();
    }
  }
  flush();
  return words;
}

const pageTexts = transcription.split(/^\s*%\s*$/m).slice(0, 56);
const pages = pageTexts.map(parsePage);

assert.strictEqual(pages.length, 56);

const p0a = pages[0][42];
const p0b = pages[0][43];
assert.deepStrictEqual(
  [p0a.start, p0a.end, p0a.length, p0a.sum, p0a.sumMod29],
  [189, 191, 3, 15, 15]
);
assert.deepStrictEqual(
  [p0b.start, p0b.end, p0b.length, p0b.sum, p0b.sumMod29],
  [192, 195, 4, 60, 2]
);

const p28Lines = pageTexts[28].trim().split(/\r?\n/);
const dhLine = p28Lines[5].replace(/\/$/, "");
const dhFragments = dhLine
  .split("-")
  .filter(Boolean)
  .map((fragment) => [...fragment].map((ch) => runeIndex.get(ch)).filter((v) => v !== undefined));

assert.strictEqual(dhFragments.length, 5);
assert.deepStrictEqual(dhFragments[0], [23, 8]);

const dhOuterPairs = dhFragments.map((values) => H(values[0], values[values.length - 1]));
assert.deepStrictEqual(dhOuterPairs, [
  [15, 2],
  [14, 4],
  [12, 12],
  [23, 12],
  [8, 19],
]);

const selectedState = [p0a.sumMod29, p0b.sumMod29];
assert.deepStrictEqual(selectedState, dhOuterPairs[0]);
assert.deepStrictEqual(Hinv(...selectedState), [23, 8]);
assert.strictEqual([23, 8].map((v) => corpus.translit[v]).join(""), "DH");

let shaped34 = 0;
let exactFirst = 0;
let anyDhPair = 0;
const anyDhLocations = [];
let rawFirstAllLengths = 0;

let shaped73 = 0;
let nextPairHits = 0;

for (let page = 0; page < pages.length; page += 1) {
  const words = pages[page];
  for (let i = 0; i + 1 < words.length; i += 1) {
    const a = words[i];
    const b = words[i + 1];
    const pair = [a.sumMod29, b.sumMod29];

    if (pair[0] === 15 && pair[1] === 2) rawFirstAllLengths += 1;

    if (a.length === 3 && b.length === 4) {
      shaped34 += 1;
      if (pair[0] === 15 && pair[1] === 2) exactFirst += 1;
      const pairIndex = dhOuterPairs.findIndex(([x, y]) => pair[0] === x && pair[1] === y);
      if (pairIndex !== -1) {
        anyDhPair += 1;
        anyDhLocations.push({
          page,
          word: i,
          starts: [a.start, b.start],
          pairIndex,
          pair,
        });
      }
    }

    if (a.length === 7 && b.length === 3) {
      shaped73 += 1;
      if (pair[0] === 14 && pair[1] === 4) nextPairHits += 1;
    }
  }
}

assert.strictEqual(shaped34, 126);
assert.strictEqual(exactFirst, 1);
assert.strictEqual(rawFirstAllLengths, 4);
assert.strictEqual(anyDhPair, 2);
assert.deepStrictEqual(anyDhLocations, [
  { page: 0, word: 42, starts: [189, 192], pairIndex: 0, pair: [15, 2] },
  { page: 51, word: 8, starts: [31, 34], pairIndex: 1, pair: [14, 4] },
]);
assert.strictEqual(shaped73, 61);
assert.strictEqual(nextPairHits, 0);

console.log("p0 selected pair:", {
  word42: p0a,
  word43: p0b,
  sumState: selectedState,
  Hinv: Hinv(...selectedState),
  text: "DH",
});
console.log("p28 line6 outer-H pairs:", dhOuterPairs);
console.log("[3,4] census:", {
  total: shaped34,
  exactFirstDhPair: exactFirst,
  anyDhLinePair: anyDhPair,
  matches: anyDhLocations,
});
console.log("all-length [15,2] adjacent pairs:", rawFirstAllLengths);
console.log("prospective NUMBERS ARE [7,3] -> next DH pair [14,4]:", {
  total: shaped73,
  hits: nextPairHits,
});
console.log("PASS");
