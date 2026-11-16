"use strict";
/**
 * Source-exact cross-route necessary-condition test.
 * Compares the dated 2015 p0-p2 fake-F / prime / difference doublet readout
 * against the first eight blocks of the published 27x27 WEATHER candidate.
 * Neither candidate is assumed to be historical plaintext.
 * Node.js 22, Windows 11: run this file from the repository root with Node.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
    "utf8"
  )
);
const chapter = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map((page) => page.indices.length), [262, 266, 201]);
assert.equal(chapter.length, 729);
assert.deepEqual(chapter.slice(0, 13), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}
/** @param {number} count @returns {number[]} */
function primes(count) {
  const found = [];
  for (let n = 2; found.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) found.push(n);
  }
  return found;
}
const prime = primes(731);
const derived = [];
let shiftedPrevious = mod29(-prime[0]);
for (let i = 0; i < chapter.length; i++) {
  const shifted = mod29(chapter[i] - prime[i + 1]);
  derived.push(mod29(shifted - shiftedPrevious));
  shiftedPrevious = shifted;
}
const doubletEvents = [];
const maximalRunEvents = [];
for (let i = 1; i < derived.length; i++) {
  if (derived[i] === derived[i - 1]) {
    doubletEvents.push(i);
    if (i === 1 || derived[i - 1] !== derived[i - 2]) maximalRunEvents.push(i);
  }
}
assert.equal(doubletEvents.length, 40);
assert.equal(maximalRunEvents.length, 36);

/** @param {number} row One-based row @param {number} col One-based column @returns {number} */
function cell(row, col) {
  assert.ok(row >= 1 && row <= 27 && col >= 1 && col <= 27);
  return (row - 1) * 27 + col - 1;
}
const routeBlocks = [
  [cell(13, 25), cell(13, 26), cell(13, 27), cell(14, 1), cell(14, 2), cell(14, 3), cell(14, 4)],
  Array.from({ length: 5 }, (_, i) => cell(14, 14 + i)),
  Array.from({ length: 5 }, (_, i) => cell(14 - i, 19)),
  Array.from({ length: 4 }, (_, i) => cell(14 - i, 7)),
  Array.from({ length: 4 }, (_, i) => cell(26, 19 - i)),
  Array.from({ length: 3 }, (_, i) => cell(19 - i, 16)),
  Array.from({ length: 5 }, (_, i) => cell(11 + i, 16 + i)),
  [cell(15, 20), cell(16, 19), cell(17, 18)]
];
const expectedCipherBlocks = [
  "L-AE-N-TH-P-U-X", "NG-P-EO-O-E", "A-OE-N-B-W", "G-J-EA-A",
  "TH-G-T-E", "J-OE-S", "TH-AE-B-A-J", "J-E-D"
];
for (let i = 0; i < routeBlocks.length; i++) {
  assert.equal(routeBlocks[i].map((index) => corpus.translit[chapter[index]]).join("-"), expectedCipherBlocks[i]);
}
const routeIndices = routeBlocks.flat();
assert.equal(routeIndices.length, 36);
const distinctCells = [...new Set(routeIndices)];
assert.equal(distinctCells.length, 34);

// This is the published candidate text, with GP digraphs represented as
// single rune symbols. The values are held fixed, not fitted to the 2015 readout.
const proposedGPWords = [
  ["A", "S", "I", "G", "O", "TH", "E"],
  ["W", "EA", "TH", "E", "R"],
  ["T", "U", "R", "N", "S"],
  ["C", "O", "L", "D"],
  ["I", "M", "A", "Y"],
  ["C", "R", "Y"],
  ["N", "O", "W", "TH", "E"],
  ["I", "D", "EA"]
];
const proposed = proposedGPWords.flat().map((label) => {
  const index = corpus.translit.indexOf(label);
  assert.ok(index >= 0);
  return index;
});
assert.equal(proposed.length, 36);
const from2015 = maximalRunEvents.map((index) => derived[index]);
const fromGridCipher = routeIndices.map((index) => chapter[index]);

/** @param {number[]} values @returns {number[]} */
function multiplicities(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.filter((count) => count > 0).sort((a, b) => b - a);
}
const hist2015 = multiplicities(from2015);
const histPlain = multiplicities(proposed);
const histCipher = multiplicities(fromGridCipher);
assert.deepEqual(hist2015, [5,4,3,3,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1]);
assert.deepEqual(histPlain, [3,3,3,3,3,2,2,2,2,2,2,2,2,1,1,1,1,1]);
assert.deepEqual(histCipher, [4,3,3,3,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1]);
assert.notDeepEqual(hist2015, histPlain);
assert.notDeepEqual(hist2015, histCipher);

// Any single fixed alphabet bijection preserves all symbol multiplicities,
// while any positional transposition merely reorders them. Therefore neither
// static bijection plus transposition can equate the historic event tape to
// the proposed route's plaintext or original ciphertext.
const originalEvents = new Set(doubletEvents);
const overlap = distinctCells.filter((index) => originalEvents.has(index)).length;
assert.equal(overlap, 1);
assert.deepEqual(distinctCells.filter((index) => originalEvents.has(index)).map((index) => [Math.floor(index / 27) + 1, index % 27 + 1]), [[14, 17]]);
const shiftCounts = Array.from({ length: 729 }, (_, offset) => distinctCells.reduce(
  (count, index) => count + Number(originalEvents.has((index - offset + 729) % 729)), 0
));
const histogram = Array(7).fill(0);
for (const count of shiftCounts) histogram[count]++;
assert.deepEqual(histogram, [98, 218, 210, 121, 58, 17, 7]);
assert.equal(shiftCounts.filter((value) => value >= overlap).length, 631);

console.log("PASS first-chapter originals: 729 runes; historical D doublets=40, maximal runs=36");
console.log("PASS candidate geometric eight-block route: 36 occurrences, 34 distinct source cells");
console.log("Historic 2015 event-symbol multiplicities:", hist2015.join(","));
console.log("Geometric candidate plaintext multiplicities:", histPlain.join(","));
console.log("Geometric candidate ciphertext multiplicities:", histCipher.join(","));
console.log("DECISION: no fixed GP29 bijection and arbitrary permutation equates either 36-symbol tape");
console.log("Original positional intersection:", overlap, "of 34 cells");
console.log("Exact 729 circular-offset comparison: overlaps 0..6 =", histogram.join(","));
console.log("Offsets with intersection at least observed:", 631, "of 729");
console.log("No authenticated original-LP2 plaintext, source key or cipher recovered.");
