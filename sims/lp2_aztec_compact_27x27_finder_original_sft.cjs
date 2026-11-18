"use strict";

// Source-native, read-only original GP29 -> 2008 compact Aztec 9x9 finder gate.
// Run node sims/lp2_aztec_compact_27x27_finder_original_sft.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @typedef {number[]} Tape */

/**
 * Count the minimum finder disagreements over every possible secret fixed
 * mapping of the 29 input rune classes to one binary module color.
 * @param {Tape} input
 * @param {number} size
 * @returns {{errors:number,conflicts:number,digitScores:number[],fixedCells:number}}
 */
function finderGate(input, size) {
  assert.equal(input.length, size * size);
  const counts = Array.from({ length: Math.max(...input) + 1 }, () => [0, 0]);
  const c = (size - 1) / 2;
  const groups = [];
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const radius = Math.max(Math.abs(dx), Math.abs(dy));
      const dark = radius % 2 === 0 ? 1 : 0;
      const source = input[(c + dy) * size + c + dx];
      assert.ok(Number.isInteger(source) && source >= 0 && source < counts.length);
      counts[source][dark]++;
      groups.push([source, dark]);
    }
  }
  const errors = counts.reduce((s, x) => s + Math.min(x[0], x[1]), 0);
  const conflicts = counts.filter((x) => x[0] && x[1]).length;
  const digitScores = [];
  for (let digit = 0; digit < 5; digit++) {
    const matches = groups.filter(([source, dark]) => ((source >> digit) & 1) === dark).length;
    digitScores.push(Math.max(matches, groups.length - matches));
  }
  return { errors, conflicts, digitScores, fixedCells: groups.length };
}

/**
 * First-difference representation, one of the literal GP29 source registers.
 * @param {Tape} tape
 * @returns {Tape}
 */
function difference(tape) {
  return tape.map((value, i) => (value + 29 - (i ? tape[i - 1] : 0)) % 29);
}

/** @param {number} size @returns {Tape} */
function plantedFinder(size) {
  const tape = Array(size * size).fill(0);
  const c = (size - 1) / 2;
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      tape[(c + dy) * size + c + dx] =
        Math.max(Math.abs(dx), Math.abs(dy)) % 2 === 0 ? 1 : 0;
    }
  }
  return tape;
}

const src = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
const book = JSON.parse(fs.readFileSync(src, "utf8"));
const get = (page) => book.pages.find((record) => record.page === page).indices;
const opening = [0, 1, 2].flatMap(get);
const tree = get(32);
const end = get(55);
const table = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-grid-256.json"), "utf8"
));
assert.deepEqual([get(0).length, get(1).length, get(2).length], [262, 266, 201]);
assert.deepEqual([opening.length, tree.length, end.length, table.byte_count], [729, 121, 76, 256]);
assert.deepEqual([27 * 27 - 11 * 11, 76 * 8], [608, 608]);

for (const size of [27, 11]) {
  assert.equal(finderGate(plantedFinder(size), size).errors, 0);
}

const cases = [
  { label: "p0-p2 contiguous original 27x27", tape: opening, size: 27,
    errors: [24, 21], conflicts: [20, 14], planeMax: [48, 48] },
  { label: "p32 11x11", tape: tree, size: 11,
    errors: [19, 23], conflicts: [16, 18], planeMax: [47, 48] },
];
for (const item of cases) {
  for (let k = 0; k < 2; k++) {
    const register = k === 0 ? item.tape : difference(item.tape);
    const result = finderGate(register, item.size);
    assert.equal(result.fixedCells, 81);
    assert.equal(result.errors, item.errors[k]);
    assert.equal(result.conflicts, item.conflicts[k]);
    assert.equal(Math.max(...result.digitScores), item.planeMax[k]);
    console.log(item.label, k === 0 ? "raw" : "GP29 delta", JSON.stringify(result));
  }
}

/** @param {Tape} source @returns {Tape} */
function center11x11(source) {
  assert.equal(source.length, 729);
  const core = [];
  for (let y = 8; y <= 18; y++) {
    for (let x = 8; x <= 18; x++) core.push(source[y * 27 + x]);
  }
  assert.equal(core.length, 121);
  return core;
}

const embeddedCore = center11x11(opening);
// Cicada actually used bitwise XOR of byte shares in 2014. This tests only the
// explicit five-bit GP-ordinal transfer, with no fitted operation or key.
const joined = embeddedCore.map((v, i) => v ^ tree[i]);
const joinedGate = finderGate(joined, 11);
assert.equal(joinedGate.errors, 14);
assert.equal(joinedGate.conflicts, 11);
assert.equal(Math.max(...joinedGate.digitScores), 49);
console.log("p0-p2 core XOR p32 in native 5-bit GP index:", JSON.stringify(joinedGate));

console.log("The native 9x9 finder plant has zero mismatches in both source sizes.");
console.log("Even a native five-bit XOR of the 121-sample source tree with the source center fails all stationary binary maps.");
console.log("Every fixed 29->binary color mapping fails on the untouched original 9x9 cores.");
console.log("No new LP2 plaintext, missing binary-layer opcode, or actual Aztec symbol is asserted. PASS");
