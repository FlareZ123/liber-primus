"use strict";

/**
 * SFT: authenticated 2014 magic-square centers select authenticated 2016
 * adjacent source pairs under one uniquely determined radix/orientation family.
 *
 * Frozen family:
 * - use the exact three source squares from the stable resource;
 * - recursively shed circumferences to their centers;
 * - charge every integer radix 2..max(center);
 * - require exactly two digits, both valid zero-based indices into the signed
 *   43-word source, and a forward unit-step pair after an optional whole-pair
 *   mirror bit per square;
 * - charge all 2^3 mirror masks.
 *
 * No target words are supplied to the search.
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number[][]} square @returns {number[][]} */
function shed(square) {
  return square.slice(1, -1).map((row) => row.slice(1, -1));
}

/** @param {number[][]} square @returns {number} */
function center(square) {
  let current = square;
  while (current.length > 1) current = shed(current);
  assert.equal(current.length, 1);
  assert.equal(current[0].length, 1);
  return current[0][0];
}

/**
 * Canonical most-significant-first integer digits.
 *
 * @param {number} value
 * @param {number} radix
 * @returns {number[]}
 */
function digits(value, radix) {
  assert.ok(Number.isSafeInteger(value) && value >= 0);
  assert.ok(Number.isSafeInteger(radix) && radix >= 2);
  if (value === 0) return [0];

  const out = [];
  let current = value;
  while (current > 0) {
    out.unshift(current % radix);
    current = Math.floor(current / radix);
  }
  return out;
}

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim()
  .split(/\n\s*\n/u)
  .map((block) => block
    .split("\n")
    .map((line) => line.trim().split(/\s+/u).map(Number)));

assert.deepEqual(squares.map((square) => square.length), [5, 7, 5]);

const centers = squares.map(center);
assert.deepEqual(centers, [809, 331, 91]);

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clearStart = signed.indexOf("Hello.");
const clearEnd = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(clearStart >= 0 && clearEnd > clearStart);

const source = signed
  .slice(clearStart, clearEnd)
  .replace(/\b7A35090F\b/gu, "")
  .match(/[A-Za-z]+/gu)
  .map((word) => word.toUpperCase());

assert.equal(source.length, 43);
assert.deepEqual(source.slice(3, 5), ["LIES", "EMPTY"]);
assert.deepEqual(source.slice(11, 13), ["IS", "THE"]);
assert.deepEqual(source.slice(26, 28), ["NUMBERS", "ARE"]);

/**
 * @typedef {{
 *   radix:number,
 *   mirrorMask:number,
 *   raw:number[][],
 *   oriented:number[][]
 * }} FamilyHit
 */

/** @type {FamilyHit[]} */
const hits = [];

for (let radix = 2; radix <= Math.max(...centers); radix += 1) {
  const raw = centers.map((value) => digits(value, radix));

  for (let mirrorMask = 0; mirrorMask < (1 << centers.length); mirrorMask += 1) {
    const oriented = [];
    let valid = true;

    for (let index = 0; index < raw.length; index += 1) {
      const pair = raw[index];
      if (
        pair.length !== 2
        || pair.some((value) => value < 0 || value >= source.length)
      ) {
        valid = false;
        break;
      }

      const candidate = ((mirrorMask >> index) & 1)
        ? [...pair].reverse()
        : [...pair];

      if (candidate[1] !== candidate[0] + 1) {
        valid = false;
        break;
      }
      oriented.push(candidate);
    }

    if (valid) hits.push({radix, mirrorMask, raw, oriented});
  }
}

assert.deepEqual(hits, [{
  radix: 29,
  mirrorMask: 1,
  raw: [[27, 26], [11, 12], [3, 4]],
  oriented: [[26, 27], [11, 12], [3, 4]],
}]);

const hit = hits[0];
const lexical = hit.oriented.map((pair) => pair.map((index) => source[index]));
assert.deepEqual(lexical, [
  ["NUMBERS", "ARE"],
  ["IS", "THE"],
  ["LIES", "EMPTY"],
]);

// The unique mirror mask reverses only the 809 square. That is exactly the
// square reused in mirrored form on LP2 p22; the two untouched source-square
// controls stay in canonical digit order.
assert.equal(hit.mirrorMask, 0b001);

// Orientation-free version is also unique: all three centers are two-digit
// source-index neighbors only in base29.
const adjacencyRadices = [];
for (let radix = 2; radix <= Math.max(...centers); radix += 1) {
  const raw = centers.map((value) => digits(value, radix));
  if (raw.every((pair) =>
    pair.length === 2
    && pair.every((value) => value >= 0 && value < source.length)
    && Math.abs(pair[1] - pair[0]) === 1
  )) {
    adjacencyRadices.push({radix, raw});
  }
}
assert.deepEqual(adjacencyRadices, [{
  radix: 29,
  raw: [[27, 26], [11, 12], [3, 4]],
}]);

console.log(JSON.stringify({
  status: "PASS",
  centers,
  chargedRadices: [2, Math.max(...centers)],
  chargedMirrorMasks: 1 << centers.length,
  uniqueOrientationFreeAdjacency: adjacencyRadices,
  uniqueForwardPairFamily: hits,
  lexical,
  sourcePositionsInAscendingTextOrder: [
    {center: 91, pair: [3, 4], words: ["LIES", "EMPTY"]},
    {center: 331, pair: [11, 12], words: ["IS", "THE"]},
    {center: 809, pair: [26, 27], words: ["NUMBERS", "ARE"], mirrored: true},
  ],
  decision:
    "Across every radix 2..809 and all eight whole-pair mirror masks, "
    + "base29 with only the p22-reused 809 square mirrored is the sole family "
    + "that turns all three authenticated square centers into forward adjacent "
    + "indices of the authenticated 2016 source register.",
}, null, 2));
