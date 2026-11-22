"use strict";
/**
 * Source-linked p50 row-sum / 2013 telnet prime-gap gate.
 * Exact original bytes -> one row selected by the historically observed 1229;
 * direct GP29 Vigenere-style p55 consumer and 20,000 source-byte shuffle controls.
 * Run with Node.js 22 from the repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {unknown} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
}
const grid = load("resources/liber-primus/base60-grid.json");
const book = load("resources/liber-primus/lp2-corpus.json");
const radix60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const radix59 = radix60.replace("f", "");
const cells = grid.byte_rows;
assert.equal(cells.length, 32);
assert.ok(cells.every((row) => row.length === 8 &&
  row.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)));
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
/** @param {string} token @param {string} alphabet @returns {number} */
function parseToken(token, alphabet) {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  return a * alphabet.length + b;
}
for (let r = 0; r < 32; r++) {
  for (let c = 0; c < 8; c++) {
    assert.equal(parseToken(grid.rows[r][c], radix60), cells[r][c]);
  }
}
const sourcePrimes = [];
for (let p = 2; p <= 3301; p++) {
  if (sourcePrimes.every((q) => q * q > p || p % q)) sourcePrimes.push(p);
}
assert.equal(sourcePrimes.length, 464);
assert.equal(sourcePrimes[19], 71);
assert.equal(sourcePrimes[20], 73);
assert.equal(sourcePrimes[199], 1223);
assert.equal(sourcePrimes[200], 1229);
assert.equal(sourcePrimes[463], 3301);
const target = sourcePrimes[200];
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const sums = cells.map(sum);
const matches = sums.flatMap((v, row) => v === target ? [row] : []);
assert.deepEqual(matches, [29]);
assert.deepEqual(cells[29], [106, 234, 196, 121, 238, 32, 129, 173]);
assert.equal(sum(cells[29]), 1229);
const radix59Row = grid.rows[29].map((token) => parseToken(token, radix59));
assert.equal(sum(radix59Row), 1209);
const text = book.pages.find((p) => p.page === 55).indices;
assert.equal(text.length, 76);
const key = cells[29].map((v) => v % 29);
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const hist = Array(29).fill(0);
  for (const x of arr) hist[x]++;
  return hist.reduce((acc, n) => acc + n * (n - 1), 0) /
    (arr.length * (arr.length - 1));
}
/** @param {number[]} input @param {number} sign @returns {number[]} */
function invert(input, sign) {
  return input.map((x, i) => (x + 29 + sign * key[i % 8]) % 29);
}
/** @param {number[]} input @param {number} sign @returns {number[]} */
function encrypt(input, sign) {
  return input.map((x, i) => (x + 29 - sign * key[i % 8]) % 29);
}
const native = Array.from({ length: 76 }, (_, i) => book.pages[57].indices[i]);
for (const sign of [-1, 1]) {
  const out = invert(text, sign);
  assert.deepEqual(encrypt(out, sign), text);
  assert.deepEqual(invert(encrypt(native, sign), sign), native);
}
// Conditional random-arrangement controls: preserve all source bytes, shuffle cells.
// The fixed-row and any-row p values are both reported because row 29 was noticed
// after inspecting the printed row sums and is not a preregistered address.
let seed = 0x20131229 >>> 0;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
let fixedMatches = 0;
let anyMatches = 0;
const trials = 20000;
const flattened = cells.flat();
for (let k = 0; k < trials; k++) {
  const shuffled = flattened.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random32() / 4294967296 * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const rowSums = Array.from({ length: 32 }, (_, r) =>
    sum(shuffled.slice(r * 8, r * 8 + 8)));
  if (rowSums[29] === target) fixedMatches++;
  if (rowSums.includes(target)) anyMatches++;
}
const report = {
  origin: "2013 participant telnet PRIMES gap 71 ... 1229",
  p50: { rows: 32, cols: 8, targetSum: target,
    matchingZeroBasedRows: matches, rowTokens: grid.rows[29],
    rowBytes: cells[29], radix59RowSum: sum(radix59Row) },
  shuffle: { trials, fixedMatches, anyMatches,
    fixedRowPlusOneP: (fixedMatches + 1) / (trials + 1),
    anyRowPlusOneP: (anyMatches + 1) / (trials + 1) },
  p55: {
    n: 76, rawIoc: ioc(text), keyMod29: key,
    sub: { ioc: ioc(invert(text, -1)),
      gp: invert(text, -1).map((x) => book.translit[x]).join(" ") },
    add: { ioc: ioc(invert(text, 1)),
      gp: invert(text, 1).map((x) => book.translit[x]).join(" ") }
  }
};
assert.equal(report.shuffle.fixedMatches, 35);
assert.equal(report.shuffle.anyMatches, 791);
assert.ok(report.p55.sub.ioc < 0.045 && report.p55.add.ioc < 0.045);
console.log(JSON.stringify(report, null, 2));
