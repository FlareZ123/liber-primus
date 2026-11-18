"use strict";

/**
 * SFT: blind p0->p1 transfer gate for the frozen 27x27 opening grammar.
 *
 * This reproduces the exact p0 terminal state from original corpus geometry,
 * then asks whether the published post-TURNS rule is a function. It does not
 * inspect or score any candidate p1 plaintext.
 *
 * Run:
 *   node sims/lp2_p0_p1_blind_transfer_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"),
  "utf8"
));
const translit = corpus.translit;
const pages = corpus.pages.filter(page => page.page <= 2);
assert.deepEqual(pages.map(page => page.indices.length), [262, 266, 201]);

const grid = pages.flatMap(page => page.indices);
assert.equal(grid.length, 729);
const side = 27;

/** @param {number} index */
function coordinate(index) {
  return [Math.floor(index / side) + 1, index % side + 1];
}

/** @param {[number, number]} point */
function position([row, column]) {
  return (row - 1) * side + column - 1;
}

/** @param {[number, number]} point */
function at(point) {
  return grid[position(point)];
}

/** @param {number} value */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

/** @param {number} n */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let value = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    value -= value / p;
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {[number, number]} point */
function inBounds([row, column]) {
  return row >= 1 && row <= side && column >= 1 && column <= side;
}

const p0EndIndex = pages[0].indices.length - 1;
const p1StartIndex = pages[0].indices.length;
const p0End = coordinate(p0EndIndex);
const p1Start = coordinate(p1StartIndex);
assert.deepEqual(p0End, [10, 19]);
assert.deepEqual(p1Start, [10, 20]);

// Reproduce the frozen terminal TURNS state from original cells.
const anchor = [14, 19];
const turnsKeyCells = [[4, 23], [14, 23], [24, 23]];
const turnsKey = turnsKeyCells.map(at);
assert.deepEqual(turnsKey.map(value => translit[value]), ["H", "NG", "C"]);

const turnsCells = [[14, 19], [13, 19], [12, 19], [11, 19], [10, 19]];
const turnsPlain = turnsCells.map((cell, i) =>
  mod29(at(cell) - turnsKey[i % turnsKey.length])
);
assert.deepEqual(turnsPlain.map(value => translit[value]), ["T", "U", "R", "N", "S"]);
assert.deepEqual(turnsCells.at(-1), p0End);

const ng = translit.indexOf("NG");
assert.equal(ng, 21);
const distance = phi(ng);
assert.equal(distance, 12);

const directions = [
  ["up", -1, 0],
  ["down", 1, 0],
  ["left", 0, -1],
  ["right", 0, 1],
];

const displacementChoices = directions
  .map(([name, dr, dc]) => ({
    name,
    coordinate: [anchor[0] + distance * dr, anchor[1] + distance * dc],
  }))
  .filter(row => inBounds(row.coordinate));

assert.deepEqual(displacementChoices, [
  {name: "up", coordinate: [2, 19]},
  {name: "down", coordinate: [26, 19]},
  {name: "left", coordinate: [14, 7]},
]);

// The published post-TURNS family independently chooses one center displacement,
// one ciphertext-start displacement, and one of four cardinal read directions.
const successorAssignments =
  displacementChoices.length * displacementChoices.length * directions.length;
assert.equal(successorAssignments, 36);

assert.ok(!displacementChoices.some(row =>
  row.coordinate[0] === p1Start[0] && row.coordinate[1] === p1Start[1]
));
assert.deepEqual(
  [p1Start[0] - anchor[0], p1Start[1] - anchor[1]],
  [-4, 1]
);

console.log(JSON.stringify({
  status: "PASS: frozen post-TURNS grammar has no deterministic p0->p1 transfer",
  physicalBoundary: {
    p0EndIndex,
    p0End,
    p1StartIndex,
    p1Start,
  },
  terminalState: {
    anchor,
    key: turnsKey.map(value => translit[value]),
    cells: turnsCells,
    conditionalOutput: turnsPlain.map(value => translit[value]),
    displacementSource: "phi(NG=21)",
    displacement: distance,
  },
  successorFamily: {
    inBoundsCenterChoices: displacementChoices,
    inBoundsStartChoices: displacementChoices,
    readDirectionChoices: directions.map(row => row[0]),
    assignments: successorAssignments,
    p1StartIsEligibleDistance12Choice: false,
  },
  missingSourceInstruction: [
    "unique next key-center displacement",
    "unique next ciphertext-start displacement",
    "unique read direction",
    "p1 stop condition",
  ],
}, null, 2));
