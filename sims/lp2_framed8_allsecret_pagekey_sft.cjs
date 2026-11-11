"use strict";

/**
 * Original-source all-secret page-position permutation gate for LP2 pp41-48.
 * Run: node sims/lp2_framed8_allsecret_pagekey_sft.cjs
 * Reads repository corpus and three independently retained English controls.
 * No external dependencies, no file writes, no fitted key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originals = Array.from(
  { length: 8 },
  (_, j) => corpus.pages.find((entry) => entry.page === 41 + j).indices
);
const lengths = originals.map((page) => page.length);
assert.deepEqual(lengths, [273, 272, 274, 273, 270, 270, 274, 271]);
const wholeLength = lengths.reduce((a, b) => a + b, 0);

/**
 * An arbitrary independently secret substitution at each rune position i
 * preserves equality between any two pages at that SAME index i.
 * @param {number[][]} pages
 * @returns {{matched:number,compared:number,rate:number}}
 */
function sameOffsetPairs(pages) {
  let matched = 0;
  let compared = 0;
  for (let a = 0; a < pages.length; a++) {
    for (let b = a + 1; b < pages.length; b++) {
      const size = Math.min(pages[a].length, pages[b].length);
      for (let i = 0; i < size; i++) {
        compared++;
        matched += Number(pages[a][i] === pages[b][i]);
      }
    }
  }
  return { matched, compared, rate: matched / compared };
}
const observed = sameOffsetPairs(originals);
assert.equal(observed.matched, 305);
assert.equal(observed.compared, 7592);
console.log("Original pp41-48: " + JSON.stringify(observed));

const translit = new Map(corpus.translit.map((rune, i) => [rune, i]));
const doublets = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
/** @param {string} text @returns {number[]} */
function toGp29(text) {
  const letters = text.toUpperCase().replaceAll("K", "C")
    .replaceAll("V", "U").replaceAll("Q", "C")
    .replaceAll("Z", "S").replace(/[^A-Z]/g, "");
  /** @type {number[]} */
  const indices = [];
  for (let i = 0; i < letters.length;) {
    const pair = doublets.find((candidate) => letters.startsWith(candidate, i));
    if (pair !== undefined) {
      indices.push(translit.get(pair));
      i += 2;
    } else {
      const single = translit.get(letters[i]);
      if (single !== undefined) indices.push(single);
      i++;
    }
  }
  return indices;
}

/** @param {number[]} stream @param {number} start @returns {number[][]} */
function slicePages(stream, start) {
  /** @type {number[][]} */
  const result = [];
  let offset = start;
  for (const length of lengths) {
    result.push(stream.slice(offset, offset + length));
    offset += length;
  }
  return result;
}

/** @type {number} */
let rngState = 123456789;
/** @returns {number} */
function nextRandom() {
  rngState = (Math.imul(rngState, 1664525) + 1013904223) >>> 0;
  return rngState;
}
/** @param {number[]} values @returns {{min:number,median:number,max:number,mean:number}} */
function summarize(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1],
    mean: values.reduce((a, b) => a + b, 0) / values.length,
  };
}
const controls = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/shakespeare_first300k.txt",
];
for (const file of controls) {
  const stream = toGp29(read(file));
  assert.ok(stream.length >= wholeLength);
  /** @type {number[]} */
  const comparisonCounts = [];
  for (let trial = 0; trial < 1000; trial++) {
    const start = nextRandom() % (stream.length - wholeLength + 1);
    comparisonCounts.push(sameOffsetPairs(slicePages(stream, start)).matched);
  }
  const lowTailCount = comparisonCounts.filter((x) => x <= observed.matched).length;
  const summary = summarize(comparisonCounts);
  assert.equal(lowTailCount, 0);
  console.log(JSON.stringify({
    control: file,
    gpLength: stream.length,
    trials: comparisonCounts.length,
    comparedPerTrial: observed.compared,
    ...summary,
    lowTailCount,
    addOneLowTailBound: (lowTailCount + 1) / (comparisonCounts.length + 1),
  }));
}
// Native-source positive control: unknown per-offset reversible key, shared by all pages.
const native = toGp29(read(controls[0]));
const plaintext = slicePages(native, 0);
const hidden = plaintext.map((page) => page.map((rune, i) =>
  (rune + (Math.imul(i + 1, 7) + 3) % 29) % 29
));
const inverse = hidden.map((page) => page.map((rune, i) =>
  (rune - (Math.imul(i + 1, 7) + 3) % 29 + 29) % 29
));
assert.deepEqual(inverse, plaintext);
assert.deepEqual(sameOffsetPairs(hidden), sameOffsetPairs(plaintext));
console.log(JSON.stringify({
  positiveControl: "native GP29 + unknown position-dependent reversible shift",
  fullyRecoveredRunes: inverse.reduce((total, page) => total + page.length, 0),
  exactEqualityPreservation: true,
}));
console.log("Decision: shared page-offset-clock bijection across pp41-48 is incompatible with tested native-GP prose windows.");
