"use strict";

/**
 * SFT: consume the already-established p0-p2 cross half-turn as a geometric
 * selector inside the conditional 27x27 opening route.
 *
 * This does not rediscover the image half-turn and does not use it as a direct
 * cipher inverse. It tests the bounded consequence that the source-visible
 * central inversion maps the fixed X-OE-X endpoint center to the previously
 * reconstructed TURNS key center, with phi(OE) fixing the perpendicular radius.
 *
 * Run: node sims/lp2_p0_cross_halfturn_block3_selector_sft.cjs
 */
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");

const T = corpus.translit;
const pages = corpus.pages.filter((page) => page.page <= 2);
assert.deepEqual(pages.map((page) => page.indices.length), [262, 266, 201]);

const side = 27;
const grid = pages.flatMap((page) => page.indices);
assert.equal(grid.length, side * side);

/** @param {number} n @returns {number} */
function phi(n) {
  if (n === 0) return 0;
  let value = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    value -= value / p;
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {number} n @returns {number} */
function mu(n) {
  if (n === 0) return 0;
  let rest = n;
  let sign = 1;
  for (let p = 2; p * p <= rest; p += 1) {
    if (rest % p !== 0) continue;
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {[number, number]} cell @returns {number} */
function at(cell) {
  const [row, column] = cell;
  assert.ok(row >= 1 && row <= side && column >= 1 && column <= side);
  return grid[(row - 1) * side + column - 1];
}

/** @param {number} index @returns {[number, number]} */
function coordinate(index) {
  return [Math.floor(index / side) + 1, index % side + 1];
}

/** @param {[number, number]} cell @returns {[number, number]} */
function rotate180(cell) {
  return [side + 1 - cell[0], side + 1 - cell[1]];
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return (value % 29 + 29) % 29;
}

const matrixCenter = [14, 14];
assert.deepEqual(rotate180(matrixCenter), matrixCenter);

const endpoint = [[14, 4], [14, 5], [14, 6]];
assert.deepEqual(endpoint.map((cell) => T[at(cell)]), ["X", "OE", "X"]);

const endpointCenter = endpoint[1];
assert.deepEqual(endpointCenter, [14, 5]);
assert.equal(at(endpointCenter), 22);
assert.equal(T[at(endpointCenter)], "OE");

const rotatedCenter = rotate180(endpointCenter);
assert.deepEqual(rotatedCenter, [14, 23]);

const radius = phi(at(endpointCenter));
assert.equal(radius, 10);
const block3Node = [
  [rotatedCenter[0] - radius, rotatedCenter[1]],
  rotatedCenter,
  [rotatedCenter[0] + radius, rotatedCenter[1]],
];
assert.deepEqual(block3Node, [[4, 23], [14, 23], [24, 23]]);
const block3Key = block3Node.map(at);
assert.deepEqual(block3Key.map((index) => T[index]), ["H", "NG", "C"]);

const rotation = mod29(block3Key.reduce((sum, index) => sum + mu(phi(index)), 0)) % 3;
assert.equal(rotation, 0);

// The older reconstructed transition reached the same center by
// OE -> phi(OE)=I=10 -> phi(I)=4, then moving four cells right from (14,19).
const derivedBlock2Center = phi(at(endpointCenter));
assert.equal(derivedBlock2Center, 10);
assert.equal(T[derivedBlock2Center], "I");
assert.equal(phi(derivedBlock2Center), 4);
const turnsStart = [14, 19];
const oldReconstructedCenter = [turnsStart[0], turnsStart[1] + phi(derivedBlock2Center)];
assert.deepEqual(oldReconstructedCenter, rotatedCenter);

const p0End = coordinate(pages[0].indices.length - 1);
assert.deepEqual(p0End, [10, 19]);
const turnsCells = [];
for (let row = turnsStart[0]; row >= p0End[0]; row -= 1) {
  turnsCells.push([row, turnsStart[1]]);
}
assert.deepEqual(turnsCells, [[14, 19], [13, 19], [12, 19], [11, 19], [10, 19]]);

const cipher = turnsCells.map(at);
const plain = cipher.map((value, i) => mod29(value - block3Key[i % block3Key.length]));
assert.deepEqual(plain.map((index) => T[index]), ["T", "U", "R", "N", "S"]);
const roundTrip = plain.map((value, i) => mod29(value + block3Key[i % block3Key.length]));
assert.deepEqual(roundTrip, cipher);

console.log(JSON.stringify({
  classification: "source-visible half-turn as conditional 27x27 block-3 geometry selector",
  endpoint: {
    node: endpoint.map((cell) => T[at(cell)]),
    center: endpointCenter,
    centerRune: T[at(endpointCenter)],
    radius
  },
  halfTurn: {
    matrixCenter,
    rotatedCenter
  },
  block3: {
    nodeCells: block3Node,
    key: block3Key.map((index) => T[index]),
    priorReconstructedCenter: oldReconstructedCenter,
    turnsCells,
    plaintext: plain.map((index) => T[index])
  },
  decision: "half-turn independently fixes the TURNS key center/radius; direct cross-based cipher inverses remain rejected and post-TURNS transfer remains unresolved"
}, null, 2));
