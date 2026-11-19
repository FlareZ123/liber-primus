"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const allSquareSource = read("resources/cicada2014-openpuff-magic-squares.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha59 = grid.alphabet.replace("f", "");
const alpha60 = grid.alphabet;
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} n @returns {number} */
function primeOrdinal1(n) {
  assert.ok(isPrime(n));
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      sum += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      sum += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP token in ${word} at ${offset}`);
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

/** @param {number} address @param {string} alphabet @returns {number} */
function tableValue(address, alphabet) {
  const token = tape[address];
  return alphabet.length * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
}

/** @param {number} value @param {"zero"|"one"} origin @returns {number} */
function tableAddress(value, origin) {
  return origin === "zero"
    ? ((value % 256) + 256) % 256
    : (((value - 1) % 256) + 256) % 256;
}

/** @param {number[][]} square @returns {number[]} */
function outerRing(square) {
  const n = square.length;
  const out = [];
  for (let col = 0; col < n; col += 1) out.push(square[0][col]);
  for (let row = 1; row < n; row += 1) out.push(square[row][n - 1]);
  for (let col = n - 2; col >= 0; col -= 1) out.push(square[n - 1][col]);
  for (let row = n - 2; row > 0; row -= 1) out.push(square[row][0]);
  return out;
}

/** @param {number[][]} square @returns {number[][]} */
function shedCircumference(square) {
  return square.slice(1, -1).map((row) => row.slice(1, -1));
}

const parsedSquareBlocks = allSquareSource.trim().split(/\n\s*\n/).map((block) =>
  block.split(/\n/).map((line) => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(parsedSquareBlocks.map((squareBlock) => squareBlock.length), [5, 7, 5]);

const signedStart = signed2016.indexOf("Hello.");
const signedEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const signedWords = signed2016
  .slice(signedStart, signedEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

const source16 = reference.split("### 16\n")[1].split("\n### ")[0];
const square = source16
  .split(/\n/)
  .map((line) => line.trim())
  .filter((line) => /^\d+\s+\d+/.test(line))
  .map((line) => line.split(/\s+/).map(Number));

assert.deepEqual(square, [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434],
]);
assert.ok(reference.includes("VOICE OF THE CIRCUMFERENCE"));
assert.ok(reference.includes("DISCOVER TRUTH INSIDE YOURSELF"));
assert.ok(source16.includes("KNOW THIS"));

for (const row of square) {
  assert.equal(row.reduce((sum, value) => sum + value, 0), 3301);
}
for (let col = 0; col < 5; col += 1) {
  assert.equal(square.reduce((sum, row) => sum + row[col], 0), 3301);
}
assert.equal(square[0][0] + square[1][1] + square[2][2] + square[3][3] + square[4][4], 3301);
assert.equal(square[0][4] + square[1][3] + square[2][2] + square[3][1] + square[4][0], 3301);

let layer = square;
const rings = [];
while (layer.length > 1) {
  rings.push(outerRing(layer));
  layer = shedCircumference(layer);
}
assert.deepEqual(layer, [[809]]);
const center = layer[0][0];

const flat = square.flat();
assert.deepEqual(flat.filter(isPrime), [809]);
assert.equal(primeOrdinal1(809), 140);
assert.equal(primeOrdinal1(761), 135);

const primeSuccessors = [];
for (let value = 762; value <= 809; value += 1) {
  if (isPrime(value)) primeSuccessors.push(value);
}
assert.deepEqual(primeSuccessors, [769, 773, 787, 797, 809]);

const p57Words = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
  .split(/\s+/);
const p57ByGp0 = new Map();
for (const word of p57Words) {
  const value = gp0(word);
  if (!p57ByGp0.has(value)) p57ByGp0.set(value, []);
  p57ByGp0.get(value).push(word);
}
assert.equal(gp0("CIRCUMFERENCES"), 131);
assert.equal(gp0("DIVINITY"), 105);
assert.equal(gp0("EMERGE"), 83);

const cellHits59 = [];
const cellHits60 = [];
for (let index = 0; index < flat.length; index += 1) {
  const value = flat[index];
  const address = tableAddress(value, "zero");
  const out59 = tableValue(address, alpha59);
  const out60 = tableValue(address, alpha60);
  if (p57ByGp0.has(out59)) {
    cellHits59.push({
      index: index + 1,
      row: Math.floor(index / 5) + 1,
      col: (index % 5) + 1,
      source: value,
      address,
      token: tape[address],
      output: out59,
      words: p57ByGp0.get(out59),
    });
  }
  if (p57ByGp0.has(out60)) {
    cellHits60.push({
      index: index + 1,
      row: Math.floor(index / 5) + 1,
      col: (index % 5) + 1,
      source: value,
      address,
      token: tape[address],
      output: out60,
      words: p57ByGp0.get(out60),
    });
  }
}

assert.deepEqual(cellHits59, [
  { index: 2, row: 1, col: 2, source: 1311, address: 31, token: "2D", output: 131, words: ["CIRCUMFERENCES"] },
  { index: 13, row: 3, col: 3, source: 809, address: 41, token: "1O", output: 83, words: ["EMERGE"] },
  { index: 24, row: 5, col: 4, source: 1311, address: 31, token: "2D", output: 131, words: ["CIRCUMFERENCES"] },
]);

// Preserve the radix rival instead of hiding it.
assert.deepEqual(cellHits60, [
  { index: 5, row: 1, col: 5, source: 966, address: 198, token: "1j", output: 105, words: ["DIVINITY"] },
  { index: 21, row: 5, col: 1, source: 966, address: 198, token: "1j", output: 105, words: ["DIVINITY"] },
]);

const outer = new Set([
  1,2,3,4,5,6,10,11,15,16,20,21,22,23,24,25,
]);
assert.ok(cellHits59.filter((hit) => outer.has(hit.index))
  .every((hit) => hit.words.includes("CIRCUMFERENCES")));
assert.deepEqual(
  cellHits59.filter((hit) => !outer.has(hit.index)),
  [cellHits59[1]],
);

const signedByGp0 = new Map();
for (const word of signedWords) {
  const value = gp0(word);
  if (!signedByGp0.has(value)) signedByGp0.set(value, []);
  signedByGp0.get(value).push(word);
}
const crossRegisterValues = [...p57ByGp0.keys()]
  .filter((value) => signedByGp0.has(value))
  .map((value) => ({
    gp0: value,
    p57Words: p57ByGp0.get(value),
    signed2016Words: signedByGp0.get(value),
  }))
  .sort((left, right) => left.gp0 - right.gp0);
assert.deepEqual(crossRegisterValues, [
  { gp0: 20, p57Words: ["THE", "THE", "THE"], signed2016Words: ["THE", "THE", "THE", "THE", "THE", "THE"] },
  { gp0: 25, p57Words: ["WE"], signed2016Words: ["IS", "IS"] },
  { gp0: 56, p57Words: ["AND"], signed2016Words: ["MAP", "AND", "SEEK", "AND"] },
  { gp0: 83, p57Words: ["EMERGE"], signed2016Words: ["NUMBERS"] },
]);

const authenticatedSquareCenters = parsedSquareBlocks.map((squareBlock, index) => {
  let currentSquare = squareBlock;
  while (currentSquare.length > 1) currentSquare = shedCircumference(currentSquare);
  const squareCenter = currentSquare[0][0];
  const address = tableAddress(squareCenter, "zero");
  const output59 = tableValue(address, alpha59);
  return {
    sourceOrder: index + 1,
    order: squareBlock.length,
    magicSum: squareBlock[0].reduce((sum, value) => sum + value, 0),
    center: squareCenter,
    address,
    token: tape[address],
    base59: output59,
    p57Words: p57ByGp0.get(output59) || [],
    signed2016Words: signedByGp0.get(output59) || [],
  };
});
assert.deepEqual(authenticatedSquareCenters, [
  { sourceOrder: 1, order: 5, magicSum: 3301, center: 809, address: 41, token: "1O", base59: 83, p57Words: ["EMERGE"], signed2016Words: ["NUMBERS"] },
  { sourceOrder: 2, order: 7, magicSum: 1033, center: 331, address: 75, token: "2v", base59: 174, p57Words: [], signed2016Words: [] },
  { sourceOrder: 3, order: 5, magicSum: 1033, center: 91, address: 91, token: "0n", base59: 48, p57Words: [], signed2016Words: [] },
]);
assert.deepEqual(authenticatedSquareCenters.filter((row) => row.p57Words.length), [authenticatedSquareCenters[0]]);

const derivedNumbers = [
  { name: "center", value: 809 },
  { name: "phi(center)", value: 808 },
  { name: "primeOrdinal1", value: 140 },
  { name: "primeOrdinal0", value: 139 },
];
const rivalFamily = [];
for (const candidate of derivedNumbers) {
  for (const origin of ["zero", "one"]) {
    const address = tableAddress(candidate.value, origin);
    for (const radix of [59, 60]) {
      const output = tableValue(address, radix === 59 ? alpha59 : alpha60);
      rivalFamily.push({
        ...candidate,
        origin,
        address,
        radix,
        token: tape[address],
        output,
        p57Words: p57ByGp0.get(output) || [],
      });
    }
  }
}

const token2DCount = tape.filter((token) => token === "2D").length;
const token1OCount = tape.filter((token) => token === "1O").length;
assert.equal(token2DCount, 2);
assert.equal(token1OCount, 3);
const exactFixedAddressNull = {
  numerator: token2DCount * token1OCount,
  denominator: tape.length * (tape.length - 1),
};
assert.equal(exactFixedAddressNull.numerator, 6);
assert.equal(exactFixedAddressNull.denominator, 65280);

const rivalHits = rivalFamily.filter((row) => row.p57Words.length);
assert.deepEqual(rivalHits, [{
  name: "center",
  value: 809,
  origin: "zero",
  address: 41,
  radix: 59,
  token: "1O",
  output: 83,
  p57Words: ["EMERGE"],
}]);

console.log(JSON.stringify({
  status: "PASS",
  instruction: "SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE",
  square: {
    rows: 5,
    cols: 5,
    magicSum: 3301,
    rings,
    center,
    solePrimeCell: flat.filter(isPrime),
  },
  crossRegisterValues,
  authenticatedSquareCenterHoldout: authenticatedSquareCenters,
  fixedBase59CellHits: cellHits59,
  radix60RivalHits: cellHits60,
  centerRivalFamily: rivalFamily,
  fixedAddressTokenMultisetNull: {
    ...exactFixedAddressNull,
    probability: exactFixedAddressNull.numerator / exactFixedAddressNull.denominator,
    exact: "1/10880",
  },
  centerRivalHits: rivalHits,
  independentPrimeEcho: {
    start: 761,
    startOrdinal1: primeOrdinal1(761),
    successorPrimes: primeSuccessors,
    centerOrdinal1: primeOrdinal1(809),
    steps: primeOrdinal1(809) - primeOrdinal1(761),
  },
  route: "p55 CIRCUMFERENCES131 selects p22; recursively shed the source-linked 5x5 square to sole-prime center809; zero-based mod256 p50[41]=1O; fixed base59=83=EMERGE.",
}, null, 2));
