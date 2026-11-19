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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p54History = read("im-results/lp2-2014-original-irc-unknown-page-crib-holdout.md");

const p49Route = runJson("sims/lp2_p49_direction76_p55_receiver_sft.cjs");
const p55Route = runJson("sims/lp2_p55_circumferences131_p22_receiver_sft.cjs");
const squareRoute = runJson("sims/lp2_p22_square_shed_divinity_emerge_sft.cjs");
const p15Spiral = runJson("sims/lp2_p15_fibonacci_prime_spiral_sft.cjs");
const p25Route = runJson("sims/lp2_2013_goodluck_p25_cube_route_sft.cjs");

assert.equal(corpus.pages.length, 58);
assert.deepEqual(corpus.pages.map((page) => page.page), [...Array(58).keys()]);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gpIndices(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP token in ${word} at ${offset}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gpIndices(word).reduce((sum, value) => sum + value, 0);
}

assert.equal(gp0("DIRECTION"), 112);
assert.equal(gp0("CIRCUMFERENCES"), 131);
assert.equal(gp0("EMERGE"), 83);
assert.equal(gp0("NUMBERS"), 83);

assert.equal(p49Route.p49.postShedBase59, 112);
assert.equal(p55Route.p55.base59Output, 131);
assert.equal(squareRoute.authenticatedSquareCenterHoldout[0].base59, 83);
assert.deepEqual(squareRoute.authenticatedSquareCenterHoldout[0].p57Words, ["EMERGE"]);
assert.deepEqual(squareRoute.authenticatedSquareCenterHoldout[0].signed2016Words, ["NUMBERS"]);

const wordDirections = [
  { word: "DIRECTION", number: 112, page: 112 % 58 },
  { word: "CIRCUMFERENCES", number: 131, page: 131 % 58 },
  { word: "EMERGE", number: 83, page: 83 % 58 },
];
assert.deepEqual(wordDirections, [
  { word: "DIRECTION", number: 112, page: 54 },
  { word: "CIRCUMFERENCES", number: 131, page: 15 },
  { word: "EMERGE", number: 83, page: 25 },
]);

// DIRECTION -> p54: source-exact eight-rune red-title slot and a 2 July 2014
// participant crib that predates all current navigation work. It remains a crib.
const p54 = corpus.pages.find((page) => page.page === 54);
assert.ok(p54);
assert.deepEqual(
  p54.indices.slice(0, 9).map((value) => corpus.translit[value]),
  ["A", "M", "NG", "D", "IA", "TH", "X", "I", "M"],
);
assert.equal(gpIndices("DIRECTION").length, 8);
assert.match(p54History, /2 July 2014 p54 red-title crib/i);
assert.match(p54History, /DIRECTION/);

// CIRCUMFERENCES -> p15: exact pre-existing numeric spiral. Shedding the
// printed 4x4 circumference leaves the first four prime offsets in spiral order.
assert.equal(p15Spiral.physicalPage, 15);
assert.equal(p15Spiral.all16CellsMatch, true);
const innerCoordinates = new Set(["2,2", "2,3", "3,2", "3,3"]);
const innerSpiral = p15Spiral.spiral
  .filter((row) => innerCoordinates.has(`${row.coordinate.row},${row.coordinate.column}`));
assert.deepEqual(innerSpiral.map((row) => row.step), [0, 1, 2, 3]);
assert.deepEqual(innerSpiral.map((row) => row.prime), [2, 3, 5, 7]);
assert.deepEqual(innerSpiral.map((row) => row.number), [3299, 3298, 3296, 3294]);
assert.match(lp1, /THE PRIMES ARE SACRED/);

// EMERGE/NUMBERS -> p25: p25 had already been independently selected by the
// authenticated GOOD LUCK route and contains the unique [K,g] side object.
assert.equal(p25Route.status, "PASS");
assert.equal(p25Route.heldOutSourcePointer.selectedPhysicalPage, 25);
assert.equal(p25Route.freshHoldout.familySize, 627);
assert.equal(p25Route.freshHoldout.exactKgHits, 1);
assert.deepEqual(p25Route.freshHoldout.outerState, [2, 5]);
assert.equal(p25Route.sourceSelectedCubeRoute.destination, "p28 READ OUT");

// Charge nearby source-visible page-inventory rivals for each word number.
const pageInventoryModuli = [
  { name: "rune-bearing p0-p55", modulus: 55 },
  { name: "physical p0-p55 slots", modulus: 56 },
  { name: "complete LP2 physical images", modulus: 58 },
  { name: "combined LP1+LP2 physical images", modulus: 75 },
];
const rivalDirections = wordDirections.map((row) => ({
  word: row.word,
  number: row.number,
  destinations: pageInventoryModuli.map((candidate) => ({
    ...candidate,
    page: row.number % candidate.modulus,
  })),
}));

assert.deepEqual(
  rivalDirections.map((row) => row.destinations.find((candidate) =>
    candidate.modulus === 58).page),
  [54, 15, 25],
);

console.log(JSON.stringify({
  status: "PASS",
  sourceInstruction: "their numbers are the direction",
  physicalInventory: 58,
  wordDirections,
  receiverEvidence: {
    p54: {
      role: "DIRECTION112 mod58",
      firstLine: p54.indices.slice(0, 9).map((value) => corpus.translit[value]),
      directionRuneLength: gpIndices("DIRECTION").length,
      historicalCrib: "2 July 2014 DIRECTION proposal; still unverified plaintext",
    },
    p15: {
      role: "CIRCUMFERENCES131 mod58",
      exactSpiral: true,
      shedInnerPrimeSeed: innerSpiral.map((row) => ({
        step: row.step,
        prime: row.prime,
        number: row.number,
      })),
      sourceText: "THE PRIMES ARE SACRED",
    },
    p25: {
      role: "EMERGE/NUMBERS83 mod58",
      independentSelector: "authenticated 2013 GOOD LUCK",
      uniqueKgSideObject: p25Route.freshHoldout.exactKgHits,
      onward: p25Route.sourceSelectedCubeRoute.destination,
    },
  },
  rivalPageInventories: rivalDirections,
  boundary: "This tests a literal signed-word GP0 mod58 direction grammar. P15 and p25 are independently established receivers; p54 provides a historical length-compatible DIRECTION crib, not recovered plaintext.",
}, null, 2));
