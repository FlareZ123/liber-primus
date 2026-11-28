"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tokens = grid.pages.flatMap((page) => page.tokens);
const base60Alphabet = grid.alphabet;
const base59Alphabet = base60Alphabet.replace("f", "");

assert.equal(tokens.length, 256);
assert.equal(base60Alphabet.length, 60);
assert.equal(base59Alphabet.length, 59);

/**
 * @param {string} token
 * @param {string} alphabet
 * @returns {number}
 */
function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.notEqual(hi, -1);
  assert.notEqual(lo, -1);
  return hi * alphabet.length + lo;
}

/**
 * @param {number} value
 * @returns {boolean}
 */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

const primes = [];
for (let value = 2; primes.length < 128; value += 1) {
  if (isPrime(value)) primes.push(value);
}
const primeRank = new Map(primes.map((prime, index) => [prime, index + 1]));

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(17, 19), ["THE", "MAP"]);
assert.deepEqual(sourceWords.slice(38, 41), ["BEWARE", "FALSE", "PATHS"]);
assert.deepEqual(sourceWords.slice(41, 43), ["VERIFY", "OPENPGP"]);

/**
 * Return every forward +1 prime-rank edge along each printed table row/column.
 * Composite-valued cells are transparent: the family is the prime-valued
 * subsequence of each physical line, scanned in both physical directions.
 *
 * @param {string} alphabet
 * @returns {Array<object>}
 */
function consecutiveRankEdges(alphabet) {
  const values = tokens.map((token) => decodeToken(token, alphabet));
  const lines = [];

  for (let column = 0; column < 8; column += 1) {
    const down = Array.from({ length: 32 }, (_, row) => row * 8 + column);
    lines.push({ axis: "col", index: column, direction: "down", cells: down });
    lines.push({ axis: "col", index: column, direction: "up", cells: down.slice().reverse() });
  }
  for (let row = 0; row < 32; row += 1) {
    const right = Array.from({ length: 8 }, (_, column) => row * 8 + column);
    lines.push({ axis: "row", index: row, direction: "right", cells: right });
    lines.push({ axis: "row", index: row, direction: "left", cells: right.slice().reverse() });
  }

  const edges = [];
  for (const line of lines) {
    const ranked = line.cells
      .map((cell) => ({
        cell,
        value: values[cell],
        rank: primeRank.get(values[cell]) || null,
      }))
      .filter((entry) => entry.rank !== null && entry.rank <= 42);

    for (let i = 0; i + 1 < ranked.length; i += 1) {
      if (ranked[i + 1].rank !== ranked[i].rank + 1) continue;
      edges.push({
        axis: line.axis,
        index: line.index,
        direction: line.direction,
        from: ranked[i],
        to: ranked[i + 1],
      });
    }
  }
  return edges;
}

const base60Edges = consecutiveRankEdges(base60Alphabet);
assert.deepEqual(
  base60Edges.map((edge) => ({
    axis: edge.axis,
    index: edge.index,
    direction: edge.direction,
    ranks: [edge.from.rank, edge.to.rank],
    cells: [edge.from.cell, edge.to.cell],
    values: [edge.from.value, edge.to.value],
  })),
  [
    { axis: "col", index: 2, direction: "down", ranks: [39, 40], cells: [2, 26], values: [167, 173] },
    { axis: "col", index: 3, direction: "up", ranks: [17, 18], cells: [219, 211], values: [59, 61] },
    { axis: "col", index: 6, direction: "down", ranks: [38, 39], cells: [126, 182], values: [163, 167] },
  ]
);

const base60RankEdges = new Set(
  base60Edges.map((edge) => `${edge.from.rank}->${edge.to.rank}`)
);
assert.ok(base60RankEdges.has("38->39"));
assert.ok(base60RankEdges.has("39->40"));

const warningRanks = [38, 39, 40];
assert.deepEqual(
  warningRanks.map((rank) => sourceWords[rank]),
  ["BEWARE", "FALSE", "PATHS"]
);
assert.equal(tokens[126], "2h");
assert.equal(decodeToken(tokens[126], base60Alphabet), 163);
assert.equal(primeRank.get(163), 38);
assert.equal(tokens[182], "2l");
assert.equal(tokens[2], "2l");
assert.equal(decodeToken(tokens[182], base60Alphabet), 167);
assert.equal(decodeToken(tokens[2], base60Alphabet), 167);
assert.equal(primeRank.get(167), 39);
assert.equal(tokens[26], "2r");
assert.equal(decodeToken(tokens[26], base60Alphabet), 173);
assert.equal(primeRank.get(173), 40);

const mapEdge = base60Edges.find(
  (edge) => edge.from.rank === 17 && edge.to.rank === 18
);
assert.ok(mapEdge);
assert.deepEqual([sourceWords[17], sourceWords[18]], ["THE", "MAP"]);
assert.deepEqual([mapEdge.from.cell, mapEdge.to.cell], [219, 211]);

// Existing PATH route ends at cell74=(9,2). The selected p57 sentence says
// TUNNELING TO THE SURFACE, so the simplest frozen surface projection is
// straight up column2 from cell74 to row0/cell2.
const tunnelSurfaceToDepth = [2, 10, 18, 26, 34, 42, 50, 58, 66, 74];
const tunnelPrimeCells = tunnelSurfaceToDepth
  .map((cell) => {
    const value = decodeToken(tokens[cell], base60Alphabet);
    return { cell, value, rank: primeRank.get(value) || null };
  })
  .filter((entry) => entry.rank !== null);

assert.deepEqual(
  tunnelPrimeCells.slice(0, 2),
  [
    { cell: 2, value: 167, rank: 39 },
    { cell: 26, value: 173, rank: 40 },
  ]
);
assert.deepEqual(
  tunnelPrimeCells.slice(0, 2).map((entry) => sourceWords[entry.rank]),
  ["FALSE", "PATHS"]
);

// The neighboring signed warning does not continue automatically.
assert.equal(primes[40], 179); // p_41
assert.equal(primes[41], 181); // p_42
assert.deepEqual(
  tokens.flatMap((token, cell) =>
    decodeToken(token, base60Alphabet) === 179 ? [cell] : []),
  [129]
);
assert.deepEqual(
  tokens.flatMap((token, cell) =>
    decodeToken(token, base60Alphabet) === 181 ? [cell] : []),
  []
);

// Rival radix59: same physical row/column family has only repeated 22->23
// edges and no two-edge consecutive chain a->a+1->a+2.
const base59Edges = consecutiveRankEdges(base59Alphabet);
assert.deepEqual(
  base59Edges.map((edge) => ({
    axis: edge.axis,
    index: edge.index,
    direction: edge.direction,
    ranks: [edge.from.rank, edge.to.rank],
    cells: [edge.from.cell, edge.to.cell],
  })),
  [
    { axis: "col", index: 5, direction: "down", ranks: [22, 23], cells: [37, 93] },
    { axis: "row", index: 5, direction: "right", ranks: [22, 23], cells: [40, 41] },
  ]
);
const base59RankEdges = new Set(
  base59Edges.map((edge) => `${edge.from.rank}->${edge.to.rank}`)
);
for (let rank = 1; rank <= 40; rank += 1) {
  assert.ok(
    !(
      base59RankEdges.has(`${rank}->${rank + 1}`) &&
      base59RankEdges.has(`${rank + 1}->${rank + 2}`)
    )
  );
}

console.log("PASS p50 prime-rank signed-warning geometry");
console.log(JSON.stringify({
  base60Edges: base60Edges.map((edge) => ({
    axis: edge.axis,
    index: edge.index,
    direction: edge.direction,
    cells: [edge.from.cell, edge.to.cell],
    values: [edge.from.value, edge.to.value],
    ranks: [edge.from.rank, edge.to.rank],
    sourceWords: [sourceWords[edge.from.rank], sourceWords[edge.to.rank]],
  })),
  warning: {
    ranks: warningRanks,
    sourceWords: warningRanks.map((rank) => sourceWords[rank]),
    joinValue: 167,
    joinToken: "2l",
    firstEdgeCells: [126, 182],
    secondEdgeCells: [2, 26],
  },
  tunnelPrimeCells,
  base59Edges: base59Edges.map((edge) => ({
    axis: edge.axis,
    index: edge.index,
    direction: edge.direction,
    cells: [edge.from.cell, edge.to.cell],
    ranks: [edge.from.rank, edge.to.rank],
  })),
  continuation: {
    verifyRank: 41,
    verifyPrime: primes[40],
    verifyCells: [129],
    openpgpRank: 42,
    openpgpPrime: primes[41],
    openpgpCells: [],
  },
}, null, 2));
