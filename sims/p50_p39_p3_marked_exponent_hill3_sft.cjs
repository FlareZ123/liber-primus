"use strict";
/**
 * Source-selected terminal triad state trial: 83 (p50 global 3D cell offset)
 * and 167 (prime selected by 2013 NUMBER on the p53 word26 prime sum).
 * Tests M^(-83), M^(+83), M^(-167), M^(+167) without phase search.
 * Reproduce from repository root with Node.js 22.
 * Exploratory source model only: neither exponent selection nor Hill3 mode
 * is an authenticated original instruction.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (name) => JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", name), "utf8")
);
const corpus = read("resources/liber-primus/lp2-corpus.json");
const redInk = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const q = 29;
const mod = (x) => ((x % q) + q) % q;
const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const multiply = (a, b) => a.map((row) =>
  b[0].map((_, j) => mod(row.reduce(
    (sum, x, k) => sum + x * b[k][j], 0))));
function power(a, n) {
  let result = I;
  let base = a;
  while (n > 0) {
    if (n % 2 === 1) result = multiply(result, base);
    base = multiply(base, base);
    n = Math.floor(n / 2);
  }
  return result;
}
function apply3(mat, symbols) {
  assert.equal(symbols.length % 3, 0);
  const out = [];
  for (let at = 0; at < symbols.length; at += 3) {
    const col = symbols.slice(at, at + 3);
    for (const row of mat)
      out.push(mod(row.reduce((sum, x, k) => sum + x * col[k], 0)));
  }
  return out;
}
function ioc(symbols) {
  const counts = Array(q).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
function translit(symbols) {
  return symbols.map((x) => corpus.translit[x]).join(" ");
}
const p3 = corpus.pages.find((x) => x.page === 3);
const p39 = corpus.pages.find((x) => x.page === 39);
const p53 = corpus.pages.find((x) => x.page === 53);
const p55 = corpus.pages.find((x) => x.page === 55);
const solved = corpus.pages.find((x) => x.page === 57);
const red3 = redInk.pages.find((x) => x.page === 3);
const red39 = redInk.pages.find((x) => x.page === 39);
const red53 = redInk.pages.find((x) => x.page === 53);
assert.ok(red3.red_spans.some((x) => x.start === 119 && x.length === 3));
assert.ok(red39.red_spans.some((x) => x.start === 119 && x.length === 3));
assert.deepEqual(p3.indices.slice(119, 122), [13, 23, 2]);
assert.deepEqual(p39.indices.slice(119, 122), [27, 5, 15]);
assert.ok(red53.red_spans.some((x) => x.start === 128 && x.length === 51));
assert.deepEqual(p53.indices.slice(122, 125), [12, 1, 17]);
assert.equal(corpus.prime[12] + corpus.prime[1] + corpus.prime[17], 105);

// Printed cell3 on the original rune-free physical p50 is the 84th
// row-major table byte (global zero-based 83); the original token is 3D.
const originalGridTokens = grid.pages.flatMap((x) => x.tokens);
assert.equal(originalGridTokens.length, 256);
assert.equal(originalGridTokens[83], "3D");
assert.equal(grid.bytes[83], 193);
assert.equal(grid.pages.find((x) => x.page === 50).tokens[3], "3D");

// The independently reported p55 signed-word-fold state gives the
// third row [24,21,18] only under the *conditional* base60 convention.
assert.equal(grid.pages.find((x) => x.page === 50).bytes[6] % q, 24);
const M = [
  [...p3.indices.slice(119, 122)],
  [...p39.indices.slice(119, 122)],
  [24, 21, 18]
];
assert.deepEqual(M, [[13, 23, 2], [27, 5, 15], [24, 21, 18]]);
assert.deepEqual(power(M, 840), I);
for (const d of [2, 3, 5, 7])
  assert.notDeepEqual(power(M, 840 / d), I);
const original = [
  ...p53.indices.slice(128),
  ...p55.indices.slice(1)
];
assert.equal(original.length, 126);
assert.equal(p53.indices.slice(128).length, 51);
assert.equal(p55.indices.slice(1).length, 75);

// 83 is the source table offset; 167 follows source-number reversal
// 105 -> 501 = 3*167. Both forward/inverse use identical frozen blocks.
const settings = [83, -83, 167, -167];
const expected = [
  0.03492063492063492,
  0.03606349206349206,
  0.035682539682539684,
  0.035555555555555556
];
const output = [];
for (let index = 0; index < settings.length; index++) {
  const exponent = settings[index];
  const normalized = (exponent + 840) % 840;
  const transform = power(M, normalized);
  const undo = power(M, (840 - normalized) % 840);
  assert.deepEqual(multiply(transform, undo), I);
  const decoded = apply3(transform, original);
  assert.deepEqual(apply3(undo, decoded), original);
  assert.ok(Math.abs(ioc(decoded) - expected[index]) < 1e-12);
  const positive = solved.indices.slice(0, 75);
  assert.deepEqual(apply3(undo, apply3(transform, positive)), positive);
  output.push({
    exponent,
    normalized,
    transformedRunes: decoded.length,
    ioc: ioc(decoded),
    first30GP: translit(decoded.slice(0, 30)),
    originalExactRoundTrip: true,
    solvedNativeControl: "75/75"
  });
}
console.log(JSON.stringify({
  source: "p3/p39 visible triads, base60 p55-fold third row, p50 byte83, p53 word26",
  table83Token: originalGridTokens[83],
  table83Value: grid.bytes[83],
  groupOrder: 840,
  originalRunes: original.length,
  originalIoC: ioc(original),
  outcomes: output,
  finding: "four source-exponent terminal Hill3 variants remain unreadable"
}, null, 2));
