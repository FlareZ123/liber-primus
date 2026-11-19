"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {string} relative @returns {any} */
function runJson(relative) {
  return JSON.parse(execFileSync(process.execPath, [path.join(root, relative)], {
    encoding: "utf8",
    windowsHide: true,
  }));
}

const squareRoute = runJson("sims/lp2_p22_square_shed_divinity_emerge_sft.cjs");
const p49Route = runJson("sims/lp2_p49_direction76_p55_receiver_sft.cjs");
const p55Route = runJson("sims/lp2_p55_circumferences131_p22_receiver_sft.cjs");

assert.equal(squareRoute.status, "PASS");
assert.equal(p49Route.status, "PASS");
assert.equal(p55Route.status, "PASS");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squareSource = read("resources/cicada2014-openpuff-magic-squares.txt");

assert.equal(corpus.pages.length, 58);
assert.deepEqual(corpus.pages.map((page) => page.page), [...Array(58).keys()]);

const squares = squareSource.trim().split(/\n\s*\n/).map((block) =>
  block.split(/\n/).map((line) => line.trim().split(/\s+/).map(Number)));

assert.deepEqual(squares.map((square) => square.length), [5, 7, 5]);

/** @param {number[][]} square @returns {number} */
function center(square) {
  let layer = square.map((row) => row.slice());
  while (layer.length > 1) {
    layer = layer.slice(1, -1).map((row) => row.slice(1, -1));
  }
  return layer[0][0];
}

const centers = squares.map(center);
assert.deepEqual(centers, [809, 331, 91]);

const centerRows = centers.map((value, index) => ({
  sourceOrder: index + 1,
  order: squares[index].length,
  magicSum: squares[index][0].reduce((sum, cell) => sum + cell, 0),
  center: value,
  mod58Page: value % corpus.pages.length,
  targetRunes: corpus.pages[value % corpus.pages.length].indices.length,
}));
assert.deepEqual(centerRows, [
  { sourceOrder: 1, order: 5, magicSum: 3301, center: 809, mod58Page: 55, targetRunes: 76 },
  { sourceOrder: 2, order: 7, magicSum: 1033, center: 331, mod58Page: 41, targetRunes: 273 },
  { sourceOrder: 3, order: 5, magicSum: 1033, center: 91, mod58Page: 33, targetRunes: 214 },
]);

// The square consumer independently types 809 as both p57 EMERGE and signed-2016 NUMBERS.
const square809 = squareRoute.authenticatedSquareCenterHoldout[0];
assert.equal(square809.center, 809);
assert.equal(square809.base59, 83);
assert.deepEqual(square809.p57Words, ["EMERGE"]);
assert.deepEqual(square809.signed2016Words, ["NUMBERS"]);

// The target p55 was fixed independently before this modulus relation.
assert.equal(p49Route.p49.coreGp0, 76);
assert.deepEqual(p49Route.p49.authenticatedLabel, ["DIRECTION"]);
assert.equal(p49Route.p55Receiver.physicalRunes, 76);
assert.equal(p55Route.p55.meaning, "CIRCUMFERENCES");
assert.equal(p55Route.receiver.page, 22);

// Charge natural finite inventory/modulus rivals rather than selecting 58 after the hit.
const inventoryModuli = [
  { name: "GP alphabet", modulus: 29 },
  { name: "rune-bearing p0-p55 pages", modulus: 55 },
  { name: "unknown p0-p55 physical slots", modulus: 56 },
  { name: "all LP2 physical images", modulus: 58 },
  { name: "LP1+LP2 physical images", modulus: 75 },
  { name: "p50 table cells", modulus: 256 },
];
const modulusFamily = inventoryModuli.map((candidate) => ({
  ...candidate,
  remainder: 809 % candidate.modulus,
  hitsPreselectedP55: 809 % candidate.modulus === 55,
}));
assert.deepEqual(modulusFamily.filter((row) => row.hitsPreselectedP55), [{
  name: "all LP2 physical images",
  modulus: 58,
  remainder: 55,
  hitsPreselectedP55: true,
}]);

// Among the three authenticated square centers, only 809 returns to the
// independently selected p55 under the actual 58-image LP2 inventory.
assert.deepEqual(centerRows.filter((row) => row.mod58Page === 55), [centerRows[0]]);

console.log(JSON.stringify({
  status: "PASS",
  instruction: "their numbers are the direction",
  sourceTypedCenter: {
    center: 809,
    tableOutput: 83,
    p57Word: "EMERGE",
    signed2016Word: "NUMBERS",
  },
  physicalInventory: {
    LP2Images: corpus.pages.length,
    reduction: "809 mod 58",
    receiver: 809 % corpus.pages.length,
  },
  independentlyPreselectedReceiver: {
    page: 55,
    physicalRunes: p49Route.p55Receiver.physicalRunes,
    entryLabel: "DIRECTION",
    nextLabel: "CIRCUMFERENCES",
    nextReceiver: 22,
  },
  authenticatedSquareControls: centerRows,
  inventoryModulusFamily: modulusFamily,
  loop: "p55 -> CIRCUMFERENCES131 -> p22 -> shed source square -> 809 -> NUMBERS/EMERGE -> 809 mod58 -> p55",
}, null, 2));
