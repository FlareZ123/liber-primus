"use strict";

/**
 * SFT: the strict p50 MAP/ROAD prime-rank supports reconstruct the formerly
 * omitted MEANING as a physical edge-count, with no turn, wrap or third radix.
 *
 * Inputs are only the pinned 256-token table and authenticated signed-2016
 * cleartext. This proves a source-register structural reconstruction, not
 * unknown LP2 plaintext or a ciphertext receiver.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tokens = grid.pages.flatMap(page => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");

assert.equal(tokens.length, 256);
assert.equal(alpha60.length, 60);
assert.equal(alpha59.length, 59);
assert.deepEqual([...alpha60].filter(symbol => !tokens.join("").includes(symbol)), ["f"]);

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n");
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter(token => /^[A-Za-z]+$/u.test(token))
  .map(word => word.toUpperCase());

assert.equal(words.length, 43);
assert.deepEqual(words.slice(17, 24),
  ["THE", "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD"]);

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

const rankOf = new Map();
for (let n = 2, rank = 0; rank < 80; n += 1) {
  if (isPrime(n)) rankOf.set(n, ++rank);
}

function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

function rank(cell, alphabet) {
  return rankOf.get(decode(tokens[cell], alphabet)) || null;
}

const at = (row, column) => row * 8 + column;
const mapColumn = 3;
const roadRow = 5;

const anchors = {
  theMap: at(27, mapColumn),
  map: at(26, mapColumn),
  their: at(25, mapColumn),
  intersection: at(roadRow, mapColumn),
  theRoad: at(roadRow, 0),
  road: at(roadRow, 1),
};

assert.deepEqual(anchors, {
  theMap: 219, map: 211, their: 203, intersection: 43, theRoad: 40, road: 41,
});
assert.deepEqual(
  [tokens[anchors.theMap], tokens[anchors.map], tokens[anchors.their],
   tokens[anchors.intersection], tokens[anchors.theRoad], tokens[anchors.road]],
  ["0x", "11", "18", "1D", "1K", "1O"],
);
assert.deepEqual(
  [rank(anchors.theMap, alpha60), rank(anchors.map, alpha60),
   rank(anchors.their, alpha59), rank(anchors.intersection, alpha60),
   rank(anchors.theRoad, alpha59), rank(anchors.road, alpha59)],
  [17, 18, 19, 21, 22, 23],
);

// MAP's strict pair fixes north as decreasing row number. THEIR is the next
// cell north. Continue on that exact column until the ROAD support row.
assert.equal(Math.floor(anchors.theMap / 8) - Math.floor(anchors.map / 8), 1);
assert.equal(Math.floor(anchors.map / 8) - Math.floor(anchors.their / 8), 1);
const theirRow = Math.floor(anchors.their / 8);
const distance = theirRow - roadRow;
assert.equal(distance, 20);
assert.equal(words[distance], "MEANING");

// MEANING is not being selected by silently switching to another cell hit.
const segment = [];
for (let row = theirRow; row >= roadRow; row -= 1) {
  const cell = at(row, mapColumn);
  segment.push({
    row,
    cell,
    r60: rank(cell, alpha60),
    r59: rank(cell, alpha59),
  });
}
assert.equal(segment.some(entry => entry.r60 === 20 || entry.r59 === 20), false);
assert.equal(tokens.filter(token => decode(token, alpha60) === 71).length, 0);
assert.deepEqual(
  tokens.flatMap((token, cell) =>
    decode(token, alpha59) === 71 ? [cell] : []),
  [98, 134],
);

// The same fixed vertical geometry maps each consecutive source anchor to a
// reverse-consecutive source index by its distance to the ROAD line.
const vertical = [
  {source: 17, row: 27},
  {source: 18, row: 26},
  {source: 19, row: 25},
].map(entry => ({
  ...entry,
  distance: entry.row - roadRow,
  target: words[entry.row - roadRow],
}));
assert.deepEqual(vertical, [
  {source: 17, row: 27, distance: 22, target: "THE"},
  {source: 18, row: 26, distance: 21, target: "IS"},
  {source: 19, row: 25, distance: 20, target: "MEANING"},
]);

const reconstructed = [
  words[17], words[18], words[19], words[distance],
  words[21], words[22], words[23],
];
assert.deepEqual(reconstructed,
  ["THE", "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD"]);

// Extend the Director's exact row/column-preserving null. Given the ordered
// three-row block THEIR/MAP/THE, there are 30 possible block placements.
// Exactly 10 let a ROAD row sit 20 rows north. It then has one specified slot
// among the remaining 29 rows: conditional factor 10/(30*29) = 1/87.
// The prior exact event with THEIR has probability 1/3968.
const R = 32;
const C = 8;
const rank17Candidates = 2;
const withTheirDenominator = (R * (R - 1) * C) / rank17Candidates;
assert.equal(withTheirDenominator, 3968);
const triplePlacements = R - 3 + 1;
const validDistancePlacements = triplePlacements - distance;
assert.deepEqual([triplePlacements, validDistancePlacements], [30, 10]);
const distanceConditionalDenominator =
  (triplePlacements * (R - 3)) / validDistancePlacements;
assert.equal(distanceConditionalDenominator, 87);
const fullDenominator = withTheirDenominator * distanceConditionalDenominator;
assert.equal(fullDenominator, 345216);

console.log(JSON.stringify({
  status: "PASS: MAP/ROAD geometry reconstructs THE MAP THEIR MEANING IS THE ROAD",
  anchors,
  reconstructed: reconstructed.join(" "),
  meaning: {
    sourceIndex: distance,
    word: words[distance],
    traversal: "north on MAP column from THEIR to ROAD support row",
    edges: distance,
    directPrimeRank20HitsOnSegment: 0,
  },
  verticalDistanceRegister: vertical,
  exactStructuralNull: {
    priorWithTheir: "1/3968",
    distanceConditional: "1/87",
    full: "1/345216",
    caveat:
      "post-discovery constrained structural reference rate; not a look-elsewhere-corrected p-value",
  },
  inferenceLimit:
    "source-register/table reconstruction only; no unknown LP2 plaintext, key, cipher inverse or typed receiver",
}, null, 2));
