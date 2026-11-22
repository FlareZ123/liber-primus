"use strict";

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
  return current[0][0];
}

/** @param {number} value @param {number} radix @returns {number[]} */
function digits(value, radix) {
  if (value === 0) return [0];
  const out = [];
  let current = value;
  while (current > 0) {
    out.unshift(current % radix);
    current = Math.floor(current / radix);
  }
  return out;
}

/** @param {[number, number]} pair @returns {[number, number]} */
function h(pair) {
  const [x, y] = pair;
  return [((x - y) % 29 + 29) % 29, (x + y) % 29];
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (values.length <= 1) return [values];
  const out = [];
  for (let i = 0; i < values.length; i += 1) {
    const rest = values.slice(0, i).concat(values.slice(i + 1));
    for (const tail of permutations(rest)) out.push([values[i], ...tail]);
  }
  return out;
}

/** @param {string[]} haystack @param {string[]} needle @returns {number[]} */
function contiguousStarts(haystack, needle) {
  const starts = [];
  for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    if (needle.every((word, j) => haystack[i + j] === word)) starts.push(i);
  }
  return starts;
}

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim()
  .split(/\n\s*\n/u)
  .map((block) => block
    .split("\n")
    .map((line) => line.trim().split(/\s+/u).map(Number)));
const centers = squares.map(center);
assert.deepEqual(centers, [809, 331, 91]);

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clearStart = signed.indexOf("Hello.");
const clearEnd = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
const source = signed
  .slice(clearStart, clearEnd)
  .replace(/\b7A35090F\b/gu, "")
  .match(/[A-Za-z]+/gu)
  .map((word) => word.toUpperCase());
assert.equal(source.length, 43);

const upstreamHits = [];
for (let radix = 2; radix <= Math.max(...centers); radix += 1) {
  const raw = centers.map((value) => digits(value, radix));
  for (let mirrorMask = 0; mirrorMask < 8; mirrorMask += 1) {
    const oriented = [];
    let valid = true;
    for (let i = 0; i < centers.length; i += 1) {
      const pair = raw[i];
      if (pair.length !== 2 || pair.some((value) => value >= source.length)) {
        valid = false;
        break;
      }
      const candidate = ((mirrorMask >> i) & 1)
        ? [...pair].reverse()
        : [...pair];
      if (candidate[1] !== candidate[0] + 1) {
        valid = false;
        break;
      }
      oriented.push(candidate);
    }
    if (valid) upstreamHits.push({radix, mirrorMask, oriented});
  }
}
assert.deepEqual(upstreamHits, [{
  radix: 29,
  mirrorMask: 1,
  oriented: [[26, 27], [11, 12], [3, 4]],
}]);

const pairByCenter = new Map(
  centers.map((value, index) => [value, upstreamHits[0].oriented[index]])
);
const risingCenters = [...centers].sort((a, b) => a - b);
assert.deepEqual(risingCenters, [91, 331, 809]);
assert.deepEqual([...centers].reverse(), risingCenters);

const risingH = risingCenters.map((value) => h(pairByCenter.get(value)));
assert.deepEqual(risingH, [[28, 7], [28, 23], [28, 24]]);

const downstream = [];
for (const order of permutations(centers)) {
  const packets = order.map((value) => h(pairByCenter.get(value)));
  for (let channel = 0; channel < 2; channel += 1) {
    const values = packets.map((packet) => packet[channel]);
    const words = values.map((value) => source[value]);
    downstream.push({
      order,
      channel: channel === 0 ? "difference" : "sum",
      values,
      words,
      starts: contiguousStarts(source, words),
    });
  }
}
assert.equal(downstream.length, 12);

const lexicalHits = downstream.filter((row) => row.starts.length > 0);
assert.deepEqual(lexicalHits, [{
  order: [91, 331, 809],
  channel: "sum",
  values: [7, 23, 24],
  words: ["THE", "ROAD", "AND"],
  starts: [22],
}]);

const risingDifference = risingH.map((packet) => packet[0]);
const risingSum = risingH.map((packet) => packet[1]);
assert.deepEqual(risingDifference, [28, 28, 28]);
assert.deepEqual(risingDifference.map((value) => source[value]), [
  "THE", "THE", "THE",
]);
assert.deepEqual(risingSum, [7, 23, 24]);
assert.deepEqual(risingSum.map((value) => source[value]), [
  "THE", "ROAD", "AND",
]);
assert.deepEqual(source.slice(22, 30), [
  "THE", "ROAD", "AND", "THEIR",
  "NUMBERS", "ARE", "THE", "DIRECTION",
]);

console.log(JSON.stringify({
  status: "PASS",
  centersInSourceOrder: centers,
  risingCenters,
  fixedPairsByRisingCenter: risingCenters.map((value) => ({
    center: value,
    pair: pairByCenter.get(value),
    words: pairByCenter.get(value).map((index) => source[index]),
  })),
  risingH,
  forcedDifferenceWords: risingDifference.map((value) => source[value]),
  sumReadout: risingSum.map((value) => source[value]),
  chargedDownstreamConfigurations: downstream.length,
  contiguousSourceTrigramHits: lexicalHits,
  recoveredSourceSpan: source.slice(22, 30),
}, null, 2));
