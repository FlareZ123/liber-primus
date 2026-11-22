"use strict";

/** Source-anchored GP29 experiment, Node.js 22, CommonJS, read-only. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (name) => fs.readFileSync(path.resolve(__dirname, "..", name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));

const echo = read("resources/historical/cicada2013-os-original-prime-echo.sh");
const records = echo.split(/\r?\n/u).map((line) =>
  /^echo(?:\s+-n)?\s+"(\d+)\s*";\s+sleep\s+(\d+(?:\.\d+)?|\.\d+)$/u.exec(line.trim()))
  .filter(Boolean).map((m) => [Number(m[1]), Number(m[2])]);
assert.equal(records.length, 464);
assert.deepEqual(records.filter((r) => r[1] === 2).map((r) => r[0]), [1033, 3301]);
const primes = records.map((r) => r[0]);
for (let n = 2; n <= 3301; n++) {
  let isPrime = true;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) { isPrime = false; break; }
  assert.equal(primes.includes(n), isPrime);
}
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const squares = squareText.trim().split(/\r?\n\s*\r?\n/u).map((part) =>
  part.trim().split(/\r?\n/u).map((line) => line.trim().split(/\s+/u).map(Number)));
const sizes = squares.map((square) => square.length);
assert.deepEqual(sizes, [5, 7, 5]);
const sums = [3301, 1033, 1033];
for (let j = 0; j < 3; j++) {
  for (const row of squares[j]) {
    assert.equal(row.length, sizes[j]);
    assert.equal(row.reduce((a, b) => a + b, 0), sums[j]);
  }
}
const product = sizes.reduce((a, b) => a * b, 1);
const side = sizes.reduce((a, b) => a + b, 0);
assert.equal(product, 175);
assert.equal(side, 17);
const first = primes.indexOf(1033) + 1;
const lastExclusive = primes.indexOf(3301);
assert.equal(first, product - 1);
assert.equal(lastExclusive - first, side * side);
const interior = primes.slice(first, lastExclusive);
assert.equal(interior[0], 1039);
assert.equal(interior.at(-1), 3299);
const historicalGpPhrase = "ᚦᛖᛏᚩᛏᛁᛖᚾᛏᚠᚢᚾᚳᛏᛡᚾᛁᛋᛋᚪᚳᚱᛖᛞ";
const valueOf = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
assert.equal(Array.from(historicalGpPhrase).reduce((s, r) => s + valueOf.get(r), 0), 1039);

const grid = Array.from({length: side}, (_, row) =>
  interior.slice(row * side, (row + 1) * side));
const spiral = [];
const rings = [];
for (let row = 0; row <= 8; row++) {
  const end = side - 1 - row;
  const previous = spiral.length;
  if (row === end) {
    spiral.push(grid[row][row]);
  } else {
    for (let c = row; c <= end; c++) spiral.push(grid[row][c]);
    for (let r = row + 1; r < end; r++) spiral.push(grid[r][end]);
    for (let c = end; c >= row; c--) spiral.push(grid[end][c]);
    for (let r = end - 1; r > row; r--) spiral.push(grid[r][row]);
  }
  rings.push(spiral.length - previous);
}
assert.deepEqual(rings, [64, 56, 48, 40, 32, 24, 16, 8, 1]);
assert.equal(new Set(spiral).size, 289);

const pages = corpus.pages;
const units = [
  pages[36].indices.slice(99),
  pages[37].indices.slice(0, 91),
  pages[37].indices.slice(91, 189),
  pages[37].indices.slice(189).concat(pages[38].indices.slice(0, 57)),
  pages[38].indices.slice(57, 186)
];
assert.deepEqual(units.map((x) => x.length), [139, 91, 98, 96, 129]);

/** @param {number[]} C @param {number[]} K @param {number} sign */
function inverse(C, K, sign) {
  let states = new Set([0]);
  for (let i = 0; i < C.length; i++) {
    const next = new Set();
    for (const j of states) {
      if (C[i] === 0) next.add(j); // Literal F does not consume the prime.
      const p = ((C[i] - sign * K[j % K.length]) % 29 + 29) % 29;
      if (p !== 0) next.add(j + 1);
    }
    if (!next.size) return i;
    states = next;
  }
  return null; // At least one legal complete plaintext history.
}
/** @param {number[]} P @param {number[]} K @param {number} sign */
function forward(P, K, sign) {
  let j = 0;
  return P.map((p) => {
    if (p === 0) return 0;
    const c = ((p + sign * K[j % K.length]) % 29 + 29) % 29;
    j++;
    return c;
  });
}
const clear = pages[57].indices;
const outcomes = [];
for (const [reading, sequence] of [["ascending", interior], ["clockwise-perimeter", spiral]]) {
  const K = sequence.map((p) => (p - 1) % 29);
  for (const sign of [1, -1]) {
    const firstFailures = units.map((unit) => inverse(unit, K, sign));
    for (const length of units.map((unit) => unit.length)) {
      const nativeP = Array.from({length}, (_, i) => clear[i % clear.length]);
      assert.equal(inverse(forward(nativeP, K, sign), K, sign), null);
    }
    assert.notEqual(firstFailures[0], null);
    assert.notEqual(firstFailures[1], null);
    outcomes.push({reading, sign, firstFailures});
  }
}
assert.deepEqual(outcomes.map((o) => o.firstFailures), [
  [68, 57, 0, 23, 29],
  [110, 12, null, 15, 1],
  [36, 33, 0, 39, 35],
  [21, 12, 56, 15, 1]
]);

// Secondary, specifically typed source fact: every interpause prime has
// exactly two positional base-60 digits, giving 578 = 553 + 25 digits.
// No first-party instruction selects dropping an initial 5*5 square.
const digits = interior.flatMap((p) => [Math.floor(p / 60), p % 60]);
assert.equal(digits.length, 578);
assert.equal(digits.length - units.flat().length, sizes[0] ** 2);
assert.equal(digits.every((digit) => digit >= 0 && digit < 60), true);
const digitKey = digits.map((digit) => digit % 29);
/** @param {number[]} C @param {number} start @param {number} sign */
function finiteDigitInverse(C, start, sign) {
  let states = new Set([start]);
  for (let i = 0; i < C.length; i++) {
    const next = new Set();
    for (const cursor of states) {
      if (C[i] === 0) next.add(cursor);
      const p = ((C[i] - sign * digitKey[cursor]) % 29 + 29) % 29;
      if (p !== 0) next.add(cursor + 1);
    }
    if (!next.size) return i;
    states = next;
  }
  return null;
}
const originalDigitCases = [];
for (const start of [0, 25]) {
  for (const sign of [1, -1]) {
    const failures = units.map((unit, index) => finiteDigitInverse(
      unit, start + units.slice(0, index).reduce((sum, x) => sum + x.length, 0), sign));
    assert.notEqual(failures[1], null);
    originalDigitCases.push({start, sign, failures});
  }
}
assert.deepEqual(originalDigitCases.map((o) => o.failures), [
  [27, 13, 5, null, null],
  [2, 0, 38, 48, 2],
  [7, 37, 7, 24, 8],
  [null, 19, 11, 47, 50]
]);
// Native GP source-positive for the peculiar position25 one-unit survivor.
// Use an explicit cipher output and require every original plaintext F skip.
const plantedDigitPlain = Array.from({length: 139}, (_, i) => clear[i % 95]);
const explicitDigitCipher = [];
let ptr = 25;
for (const letter of plantedDigitPlain) {
  if (letter === 0) {
    explicitDigitCipher.push(0);
  } else {
    explicitDigitCipher.push(((letter - digitKey[ptr]) % 29 + 29) % 29);
    ptr++;
  }
}
assert.equal(finiteDigitInverse(explicitDigitCipher, 25, -1), null);

console.log(JSON.stringify({
  status: "PASS; exact historical interval, original 139+91 rune inverse fails",
  sizes, rowSums: sums, product, side,
  primeOrdinals: [174, 175, 463, 464],
  range: [1039, 3299], rangeSize: interior.length,
  rings, itemLengths: units.map((unit) => unit.length), outcomes,
  sourceBase60DigitCount: digits.length, digitCases: originalDigitCases
}, null, 2));
