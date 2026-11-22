#!/usr/bin/env node
"use strict";

/**
 * Original LP2 source-selected five-fragment matrix as a literal GP29 Hill key.
 * A bounded direct receiver, with no fitted parameters or plaintext claims.
 * Run: node sims/lp2_fivefragment_source_hill_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const squareText = read("resources/external/derived/2014-stage04/05-square.txt");
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} n @returns {number} */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number} n @returns {number} */
const mod43 = n => ((n % 43) + 43) % 43;

/** @param {number} page @returns {number[][]} */
function pageFragments(page) {
  const raw = parts[page < 50 ? page : page - 1] || "";
  const result = [];
  let current = [];
  for (const ch of raw) {
    if (runeMap.has(ch)) current.push(runeMap.get(ch));
    else if (ch === "/" || /\s/u.test(ch)) continue;
    else if (current.length) { result.push(current); current = []; }
  }
  if (current.length) result.push(current);
  return result;
}
const signedWords = (signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "")
  .match(/[A-Za-z]+/g) || []).map(w => w.toUpperCase());
assert.equal(signedWords.length, 43);
const selected = [];
for (let page = 0; page < signedWords.length; page++) {
  const fragment = pageFragments(page)[page];
  if (fragment && fragment.length === 5) selected.push({page, fragment});
}
assert.deepEqual(selected.map(s => s.page), [9, 12, 15, 36, 40]);
const C = Array.from({length: 5}, (_, i) => selected.map(s => s.fragment[i]));
assert.deepEqual(C, [
  [15, 28, 10, 2, 0],
  [13, 1, 13, 22, 23],
  [14, 0, 8, 4, 4],
  [27, 15, 27, 1, 28],
  [6, 20, 17, 20, 6]
]);
assert.deepEqual(C.map(row => mod43(row.reduce((a, b) => a + b, 0))),
  [12, 29, 30, 12, 26]);
/** @param {number} n @returns {number} */
function totient(n) {
  let remainder = n, output = n;
  for (let p = 2; p * p <= remainder; p++) {
    if (remainder % p === 0) {
      while (remainder % p === 0) remainder /= p;
      output -= output / p;
    }
  }
  if (remainder > 1) output -= output / remainder;
  return output;
}
const rawSquare = (squareText.match(/\d+/g) || []).map(Number);
assert.equal(rawSquare.length, 25);
const M = Array.from({length: 5}, (_, i) =>
  rawSquare.slice(5 * i, 5 * i + 5).map(x => mod29(totient(x))));
assert.deepEqual(M, [
  [12, 15, 10, 14, 5],
  [4, 24, 19, 12, 6],
  [25, 23, 14, 23, 25],
  [6, 12, 19, 24, 4],
  [5, 14, 10, 15, 12]
]);
/** @param {number[][]} a @returns {number[][]} */
const transpose = a => a[0].map((_, i) => a.map(row => row[i]));
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
const multiply = (a, b) => a.map(row => b[0].map((_, column) =>
  mod29(row.reduce((sum, value, i) => sum + value * b[i][column], 0))));
/** @param {number[][]} a @returns {number[][]} */
function inverse(a) {
  const n = a.length;
  const matrix = a.map((row, i) => [...row.map(mod29),
    ...Array.from({length: n}, (_, j) => Number(i === j))]);
  for (let column = 0; column < n; column++) {
    const pivot = matrix.findIndex((row, i) => i >= column && row[column] !== 0);
    assert.ok(pivot >= 0, "source matrix is singular");
    [matrix[column], matrix[pivot]] = [matrix[pivot], matrix[column]];
    const pivotInv = Array.from({length: 29}, (_, i) => i)
      .find(x => mod29(x * matrix[column][column]) === 1);
    assert.ok(pivotInv !== undefined);
    matrix[column] = matrix[column].map(x => mod29(x * pivotInv));
    for (let i = 0; i < n; i++) {
      if (i === column) continue;
      const factor = matrix[i][column];
      matrix[i] = matrix[i].map((x, j) => mod29(x - factor * matrix[column][j]));
    }
  }
  return matrix.map(row => row.slice(n));
}
/** @param {number[][]} a @param {number[]} text @returns {number[]} */
function apply(a, text) {
  assert.equal(text.length % 5, 0);
  const output = [];
  for (let start = 0; start < text.length; start += 5) {
    for (const row of a) output.push(mod29(row.reduce((sum, x, j) =>
      sum + x * text[start + j], 0)));
  }
  return output;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const value of a) counts[value]++;
  return counts.reduce((total, n) => total + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
/** @param {number} start @param {number} end @returns {number[]} */
const pages = (start, end) => corpus.pages
  .filter(p => p.page >= start && p.page <= end)
  .flatMap(p => p.indices);
const bodies = [
  {name: "p0-p2", source: pages(0, 2).slice(0, 725)},
  {name: "p3-p7", source: pages(3, 7)},
  {name: "p40-p53", source: pages(40, 53).slice(0, 3005)},
  {name: "p55 body after p54 word carry", source: corpus.pages[55].indices.slice(1)}
];
assert.deepEqual(bodies.map(b => b.source.length), [725, 1145, 3005, 75]);
const fiveMatrices = {
  "five_fragments_C": C,
  "historical_totient_M_times_C": multiply(M, C),
  "C_times_transposed_M": multiply(C, transpose(M))
};
const control = corpus.pages[57].indices;
assert.equal(control.length, 95);
const results = [];
for (const [keyName, key] of Object.entries(fiveMatrices)) {
  const inverseKey = inverse(key);
  const inverseTransposedKey = inverse(transpose(key));
  const identity = Array.from({length: 5}, (_, i) =>
    Array.from({length: 5}, (_, j) => Number(i === j)));
  assert.deepEqual(multiply(key, inverseKey), identity);
  const consumers = {
    forward: key,
    inverse: inverseKey,
    transpose: transpose(key),
    inverse_transpose: inverseTransposedKey
  };
  for (const [mode, receiver] of Object.entries(consumers)) {
    const encoder = inverse(receiver);
    assert.deepEqual(apply(encoder, apply(receiver, control)), control);
    const result = {key: keyName, mode};
    for (const body of bodies) {
      const plaintext = apply(receiver, body.source);
      assert.deepEqual(apply(encoder, plaintext), body.source);
      result[body.name] = Number(ioc(plaintext).toFixed(9));
      if (body.source.length === 75) {
        result.p55_preview = plaintext.map(x => corpus.translit[x]).join(" ");
      }
    }
    results.push(result);
  }
}
assert.equal(results.length, 12);
console.log(JSON.stringify({
  conclusion: "No native GP-English prose from any direct source-selected 5x5 Hill receiver",
  preserved_source_lengths: bodies.map(b => [b.name, b.source.length]),
  clear_p57_ioc: ioc(control),
  original_input_ioc: Object.fromEntries(bodies.map(b => [b.name, ioc(b.source)])),
  source_matrix_C: C,
  historical_totient_M: M,
  tested: results
}, null, 2));
console.log("PASS: twelve exact original-source receivers, 12 complete 95-rune solved-native plants and 48 full source replays.");
