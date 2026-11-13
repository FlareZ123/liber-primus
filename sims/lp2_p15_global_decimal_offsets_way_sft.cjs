"use strict";

/**
 * Original p15 4x4 printed-decimal offsets into the 2014 LP2 release's
 * page0–55 GP29 rune stream. This is a CONDITIONAL indexing hypothesis,
 * not a decipherment or proof the creator intended this address rule.
 *
 * Run: node sims/lp2_p15_global_decimal_offsets_way_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

/**
 * Source-original p15 4×4 printed numerical square, row-major from scan32.
 * The red central number 3299 is at [1,1].
 * @type {number[][]}
 */
const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];

/** @type {[number,number][]} */
const clockwiseFromRed = [
  [1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],
  [0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]
];
const inputs = clockwiseFromRed.map(([row, col]) => grid[row][col]);
assert.deepEqual(inputs, [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
]);

const unknown = corpus.pages.filter(p => p.page >= 0 && p.page <= 55)
  .flatMap(p => p.indices);
const completeLp2 = corpus.pages.filter(p => p.page >= 0 && p.page <= 57)
  .flatMap(p => p.indices);
assert.equal(unknown.length, 12956);
assert.equal(completeLp2.length, 13136);
assert.ok(inputs.every(index => index >= 0 && index < unknown.length));
assert.ok(inputs.every(index => unknown[index] === completeLp2[index]));

/**
 * @param {number[]} addresses
 * @returns {string[]}
 */
function read(addresses) {
  return addresses.map(index => corpus.translit[unknown[index]]);
}

const clockwiseZeroBased = read(inputs);
const clockwiseOneBased = read(inputs.map(index => index - 1));
const rowMajorZeroBased = read(grid.flat());
assert.deepEqual(clockwiseZeroBased, [
  "OE","W","A","Y","L","U","M","U",
  "L","H","T","G","AE","B","U","M"
]);
assert.deepEqual(clockwiseOneBased, [
  "W","G","IA","X","F","O","EO","NG",
  "H","A","EA","I","W","L","L","F"
]);
assert.deepEqual(rowMajorZeroBased, [
  "M","U","L","H","U","OE","W","T",
  "L","Y","A","G","M","U","B","AE"
]);

// All other stride-2 WAY triples in the complete original LP2 source are controls.
const way = ["W", "A", "Y"].map(letter => corpus.translit.indexOf(letter));
const wayRoots = [];
for (let i = 0; i < completeLp2.length; i++) {
  if (completeLp2[i] === way[0] &&
      completeLp2[(i - 2 + completeLp2.length) % completeLp2.length] === way[1] &&
      completeLp2[(i - 4 + completeLp2.length) % completeLp2.length] === way[2]) {
    wayRoots.push(i);
  }
}
assert.deepEqual(wayRoots, [2959, 3298, 4126]);
// The three original-rune addresses IMMEDIATELY AFTER the central red cell.
assert.equal(clockwiseZeroBased.slice(1, 4).join(""), "WAY");
// This is a coincidence candidate until a source-prescribed full readout exists.
assert.notEqual(clockwiseOneBased.slice(1, 4).join(""), "WAY");

let absolute = 0;
const locator = new Map();
for (const page of corpus.pages.filter(p => p.page <= 55)) {
  for (let i = 0; i < page.indices.length; i++) locator.set(absolute++, [page.page, i]);
}
const firstThree = inputs.slice(1,4).map(offset =>
  ({offset, original: corpus.translit[unknown[offset]], location: locator.get(offset)}));

console.log(JSON.stringify({
  originalUnknownRunes: unknown.length,
  originalCompleteLp2Runes: completeLp2.length,
  completeLp2Stride2WAYRoots: wayRoots,
  startRed: inputs[0],
  postRed: firstThree,
  clockwiseZeroBased,
  clockwiseOneBased,
  rowMajorZeroBased,
  warning: "Three-rune exploratory apparent word; remaining 13 cells do not spell prose. No cipher/key/plaintext independently recovered."
}, null, 2));
console.log("PASS: original-source decimal-address readout and wrong-index control");
