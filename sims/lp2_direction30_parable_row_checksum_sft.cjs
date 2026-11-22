#!/usr/bin/env node
"use strict";

/**
 * Source-native p50 row-30 / solved p57 clause checksum, with a conditional
 * 100,000-shuffle null and an explicit distinct-radix negative.
 *
 * Run from the repository root: node sims/lp2_direction30_parable_row_checksum_sft.cjs
 * Read-only. No keys, phase fitting, unknown plaintext or cipher inverse.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");

const read = (path) => fs.readFileSync(path, "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const onion = read("resources/cicada2014-onion7-index.html");

assert.equal(gp.pages[57].indices.length, 95);
assert.equal(table.pages.flatMap((p) => p.tokens).length, 256);
assert.equal(gp.prime.length, 29);

const sourceWords = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE".split(" ");
const tokenOrder = gp.translit.map((name, index) => ({name, index}))
  .sort((a, b) => b.name.length - a.name.length);

/** @param {string} word */
function encode(word) {
  let rest = word.toUpperCase()
    .replaceAll("QU", "CW")
    .replaceAll("V", "U")
    .replaceAll("K", "C")
    .replaceAll("Z", "S")
    .replaceAll("ING", "NG")
    .replaceAll("IO", "IA");
  const indices = [];
  while (rest.length) {
    const token = tokenOrder.find((entry) => rest.startsWith(entry.name));
    assert.ok(token, "Unrepresentable GP token " + rest);
    indices.push(token.index);
    rest = rest.slice(token.name.length);
  }
  return indices;
}
const words = sourceWords.map(encode);
assert.deepEqual(words.flat(), gp.pages[57].indices);
const p57Weights = words.map((word) => word.reduce((sum, index) => sum + gp.prime[index], 0));

const signedStart = signed.toUpperCase().indexOf("HELLO");
const signedEnd = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(signedStart >= 0 && signedEnd > signedStart);
const signedWords = signed.slice(signedStart, signedEnd).match(/[A-Za-z]+/g);
assert.ok(signedWords);
const directionOrdinal = signedWords.findIndex((word) => word.toUpperCase() === "DIRECTION") + 1;
assert.equal(directionOrdinal, 30);

const tokens = table.pages.flatMap((p) => p.tokens);
const base60 = table.alphabet;
const base59 = base60.replace("f", "");
assert.equal(base60.length, 60);
assert.equal(base59.length, 59);
assert.ok(tokens.every((token) => token.length === 2));
/** @param {string} alphabet */
function byteStream(alphabet) {
  return tokens.map((token) => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, "Invalid numeral " + token);
    return alphabet.length * hi + lo;
  });
}
const bytes60 = byteStream(base60);
const bytes59 = byteStream(base59);
assert.deepEqual(tokens.slice(232, 240), ["1k", "3s", "3G", "21", "3w", "0W", "29", "2r"]);
assert.deepEqual(bytes60.slice(232, 240), [106, 234, 196, 121, 238, 32, 129, 173]);

const sum = (array) => array.reduce((total, value) => total + value, 0);
const finalClauseSum = sum(p57Weights.slice(-6));
assert.equal(finalClauseSum, 1229);
assert.equal(sum(bytes60.slice(232, 240)), 1229);
assert.equal(sum(bytes59.slice(232, 240)), 1209);
const parableSum = sum(words[0].map((index) => gp.prime[index]));
assert.equal(parableSum, 449);
assert.equal(finalClauseSum % parableSum, 331);
assert.ok(onion.includes("<title>133</title>"));
assert.ok(onion.includes('<div id="331">'));

// Census every contiguous sequence of at least two authentic solved p57 words.
const spanBySum = new Map();
for (let start = 0; start < p57Weights.length; start++) {
  let running = 0;
  for (let end = start; end < p57Weights.length; end++) {
    running += p57Weights[end];
    if (end === start) continue;
    if (!spanBySum.has(running)) spanBySum.set(running, []);
    spanBySum.get(running).push({start, end});
  }
}
const rowSums = Array.from({length: 32}, (_, row) => sum(bytes60.slice(8 * row, 8 * row + 8)));
const exactSpans = rowSums.flatMap((rowSum, row) =>
  (spanBySum.get(rowSum) || []).map((span) => ({row: row + 1, sum: rowSum, ...span})));
assert.deepEqual(exactSpans, [
  {row: 4, sum: 995, start: 4, end: 9},
  {row: 12, sum: 1089, start: 3, end: 8},
  {row: 21, sum: 1345, start: 1, end: 8},
  {row: 30, sum: 1229, start: 14, end: 19}
]);

// Conditional calibration. Every trial permutes the exact table-byte multiset,
// reconstitutes the same 32x8 geometry and tests exactly the same p57 spans.
let state = 0x33011229;
function randomUint32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
function score(arr) {
  let rowsMatched = 0;
  let row30Exact = false;
  for (let row = 0; row < 32; row++) {
    const rowSum = sum(arr.slice(row * 8, row * 8 + 8));
    if (spanBySum.has(rowSum)) rowsMatched++;
    if (row === 29) row30Exact = rowSum === 1229;
  }
  return {rowsMatched, row30Exact};
}
const observed = score(bytes60);
assert.deepEqual(observed, {rowsMatched: 4, row30Exact: true});
const trials = 100_000;
let atLeastFour = 0;
let row30Hits = 0;
for (let trial = 0; trial < trials; trial++) {
  const shuffled = bytes60.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomUint32() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const {rowsMatched, row30Exact} = score(shuffled);
  if (rowsMatched >= 4) atLeastFour++;
  if (row30Exact) row30Hits++;
}
assert.equal(atLeastFour, 27701);
assert.equal(row30Hits, 126);
console.log(JSON.stringify({
  directionOrdinal,
  row30Tokens: tokens.slice(232, 240),
  row30Bytes: bytes60.slice(232, 240),
  row30Sum: 1229,
  p57FinalSixWordPrimeSum: finalClauseSum,
  base59Row30Sum: 1209,
  exactSpans,
  conditionalRowsTail: (atLeastFour + 1) / (trials + 1),
  conditionalFixedRow30Rate: (row30Hits + 1) / (trials + 1),
  decision: "Exploratory numerical selector only; no authenticated key, inverse or unknown plaintext."
}, null, 2));
