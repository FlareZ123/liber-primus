"use strict";
/**
 * Exact GF(29) syndrome obstruction for a chapter-reset 256-rune additive
 * key that would turn each original LP2 block into a table-H/G codeword.
 * All 256 key symbols are arbitrary and remain secret; no key search.
 *
 * Inputs: resources/liber-primus/lp2-corpus.json, base60-grid.json
 * Run: node sims/lp2_hg256_chapter_key_syndrome_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", name), "utf8"));
const corpus = load("lp2-corpus.json");
const table = load("base60-grid.json");
const mod = v => ((v % 29) + 29) % 29;

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function product(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      result[i + j] = mod(result[i + j] + a[i] * b[j]);
  return result;
}
const H = [3, 26, 24]; // 2013 signed BASE29 3301 -> 3QO
const G = [27, 5, 15]; // original LP2 p39 isolated red triad
const F = product(H, G);
assert.deepEqual(F, [23, 21, 11, 17, 12]);
assert.equal(mod(F[4] * 17), 1);

/**
 * Source-order block coefficients are descending powers X^255 to X^0.
 * Return the four low GF(29) coefficients of the remainder modulo H*G.
 * @param {number[]} sourceOrder
 * @returns {number[]}
 */
function syndrome(sourceOrder) {
  assert.equal(sourceOrder.length, 256);
  const remainder = sourceOrder.slice().reverse().map(mod);
  for (let degree = remainder.length - 1; degree >= 4; degree--) {
    const factor = mod(remainder[degree] * 17);
    for (let j = 0; j <= 4; j++)
      remainder[degree - 4 + j] = mod(remainder[degree - 4 + j] - factor * F[j]);
  }
  return remainder.slice(0, 4);
}
const flatTokens = table.rows.flat();
assert.equal(table.rows.length, 32);
assert(table.rows.every(row => row.length === 8));
const digits = table.alphabet;
const tableBytes = flatTokens.map(token => 60 * digits.indexOf(token[0]) + digits.indexOf(token[1]));
assert.equal(tableBytes.length, 256);
assert(tableBytes.every(value => Number.isInteger(value) && value >= 0 && value <= 255));
assert.deepEqual(syndrome(tableBytes), [0, 0, 0, 0]);

/** @param {number[]} values @returns {number[][]} */
const signatures = values => Array.from({length: Math.floor(values.length / 256)}, (_, i) =>
  syndrome(values.slice(i * 256, (i + 1) * 256)));
/** @param {number[][]} signatureSet @returns {number} */
const unique = signatureSet => new Set(signatureSet.map(s => s.join(","))).size;

// Source-visible section cuts; physical page50 contains numeric data only.
const originalChapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const report = [];
for (const [start, end] of originalChapters) {
  const symbols = corpus.pages
    .filter(p => p.page >= start && p.page <= end && p.status === "unsolved")
    .flatMap(p => p.indices);
  const marks = signatures(symbols);
  assert.equal(unique(marks), marks.length,
    "Original chapter unexpectedly admits repeated H/G syndrome frames");
  report.push({
    physicalPages: [start, end],
    sourceRunes: symbols.length,
    complete256Blocks: marks.length,
    distinctSyndromes: unique(marks),
    firstTwo: marks.slice(0, 2)
  });
}
assert.deepEqual(report.map(r => r.complete256Blocks), [2, 4, 6, 7, 3, 5, 6, 11, 1]);

const original = corpus.pages.filter(p => p.status === "unsolved").flatMap(p => p.indices);
assert.equal(original.length, 12956);
const bookSyndromes = signatures(original);
assert.equal(bookSyndromes.length, 50);
assert.equal(unique(bookSyndromes), 50);

// Source-disjoint positive plant: random-looking degree251 messages multiplied
// by source factor H*G give legitimate 256-rune codewords. One frozen 256-rune
// additive key creates a *constant* nonzero syndrome across all blocks.
const key = Array.from({length: 256}, (_, i) => mod((7*i*i + 3*i + 11) % 256));
const planted = [];
for (let block = 0; block < 8; block++) {
  const quotient = Array.from({length: 252}, (_, i) => mod((17*block + 7*i*i + i*block) % 256));
  const plaintext = product(F, quotient).reverse();
  assert.equal(plaintext.length, 256);
  assert.deepEqual(syndrome(plaintext), [0, 0, 0, 0]);
  const ciphertext = plaintext.map((x, i) => mod(x + key[i]));
  assert.deepEqual(ciphertext.map((x, i) => mod(x - key[i])), plaintext);
  planted.push(syndrome(ciphertext));
}
assert.equal(unique(planted), 1);
assert.deepEqual(planted[0], syndrome(key));
assert.notDeepEqual(planted[0], [0, 0, 0, 0]);

console.log(JSON.stringify({
  architecture: "P_i = C_i - K_(i mod 256) mod 29; P blocks multiples of H*G",
  originalChapterChecks: report,
  originalWholeBook: {complete256Blocks: bookSyndromes.length, distinctSyndromes: unique(bookSyndromes)},
  positivePlant: {complete256Blocks: planted.length, distinctSyndromes: unique(planted), syndrome: planted[0]},
  decision: "Original-negative for these source-aligned frames and any chapter-local repeated 256-position additive key"
}, null, 2));
