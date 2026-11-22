"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const grid = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")
);
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"),
  "utf8"
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/**
 * @param {string} word
 * @returns {number}
 */
function gpSum(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let total = 0;
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, i)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    total += token.value;
    i += token.symbol.length;
  }
  return total;
}

/**
 * @param {string} text
 * @returns {number[]}
 */
function runes(text) {
  return [...text]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

const table = grid.pages.flatMap((page) => page.bytes);
assert.equal(gpSum("READ"), 55);
assert.equal(gpSum("OUT"), 20);
assert.equal(table[55], 80);
assert.equal(table[20], 102);

const p0 = runes(transcription.split(/^\s*%\s*$/m)[0]);
assert.equal(p0.length, 262);
const start = table[55];
const end = table[20];
assert.equal(end - start + 1, 23);
const center = start + 11;
assert.equal(center, 91);
assert.equal(p0[center], 0);

const radii = [1, 3, 5, 7];
const differences = radii.map(
  (radius) => (p0[center - radius] - p0[center + radius] + 29) % 29
);
assert.deepEqual(differences, [5, 2, 19, 15]);

// Independently fixed p28 DH23 state.
const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
assert.deepEqual(differences, [dh.g, dh.K, dh.B, dh.b]);

const reverse = differences.map((value) => (29 - value) % 29);
const hits = [];
const reverseHits = [];
let totalCenters = 0;
let fCenters = 0;

for (const page of corpus.pages.filter(
  (candidate) => candidate.page <= 55 && candidate.indices.length
)) {
  const values = page.indices;
  for (let i = 11; i + 11 < values.length; i += 1) {
    totalCenters += 1;
    if (values[i] === 0) fCenters += 1;
    const observed = radii.map(
      (radius) => (values[i - radius] - values[i + radius] + 29) % 29
    );
    if (observed.every((value, j) => value === differences[j])) {
      hits.push({ page: page.page, center: i, centerRune: values[i] });
    }
    if (observed.every((value, j) => value === reverse[j])) {
      reverseHits.push({ page: page.page, center: i, centerRune: values[i] });
    }
  }
}

assert.equal(totalCenters, 11746);
assert.equal(fCenters, 418);
assert.deepEqual(hits, [{ page: 0, center: 91, centerRune: 0 }]);
assert.deepEqual(reverseHits, []);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    p0Start: start,
    p0End: end,
    center,
    centerRune: corpus.translit[p0[center]],
  },
  shellRule: {
    H: "(left-right,left+right) mod29",
    component: "left-right",
    radii,
    values: differences,
    labels: ["g", "K", "B", "b"],
  },
  corpusCensus: {
    totalCenters,
    fCenters,
    exactOrderedHits: hits,
    reversedOrientationHits: reverseHits,
  },
  classification:
    "strong post-discovery structural signature on the independently selected READ OUT receiver; odd-radius selection was observed after receiver selection",
}, null, 2));
