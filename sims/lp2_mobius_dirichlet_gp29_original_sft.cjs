"use strict";
/**
 * Original GP29 source and printed LP1 p05 MOBIUS word: freeze the standard
 * arithmetic Möbius (Dirichlet convolution) inverse on whole book, printed
 * pages and nine source-visible chapters. No fitted seed, phase, rune key,
 * missing symbols or output-selected clocks.
 *
 * Windows 11, Node.js 22: node sims/lp2_mobius_dirichlet_gp29_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const book = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
/** @param {number} value @returns {number} */
const mod29 = value => (value % 29 + 29) % 29;
/**
 * Standard divisor-sum zeta transform: C(n) = sum_{d|n} P(d) mod 29.
 * @param {number[]} plain @returns {number[]}
 */
function forwardZeta(plain) {
  const cipher = plain.slice();
  for (let d = 1; d <= plain.length; d++)
    for (let m = 2 * d; m <= plain.length; m += d)
      cipher[m - 1] = mod29(cipher[m - 1] + plain[d - 1]);
  return cipher;
}
/**
 * Möbius inversion: P(n) = sum_{d|n} mu(n/d)*C(d) mod29.
 * The ascending triangular elimination is exactly equivalent and avoids
 * hand-coded factorization or rounding errors.
 * @param {number[]} cipher @returns {number[]}
 */
function inverseMobius(cipher) {
  const plain = cipher.slice();
  for (let d = 1; d <= plain.length; d++)
    for (let m = 2 * d; m <= plain.length; m += d)
      plain[m - 1] = mod29(plain[m - 1] - plain[d - 1]);
  return plain;
}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  assert.ok(xs.length > 1);
  const counts = Array(29).fill(0);
  for (const x of xs) { assert.ok(Number.isInteger(x) && x >= 0 && x < 29); counts[x]++; }
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (xs.length * (xs.length - 1));
}
function run() {
  const pages = book.pages.filter(page => page.page <= 55 && page.indices.length);
  assert.equal(pages.length, 55);
  const all = pages.flatMap(page => page.indices);
  assert.equal(all.length, 12956);
  const doublets = pages.reduce((total, page) =>
    total + page.indices.slice(1).filter((x, i) => x === page.indices[i]).length, 0);
  assert.equal(doublets, 86);
  const datasets = [
    ["wholeBook", [all]],
    ["visualChapters", chapters.map(([start, end]) => pages
      .filter(p => p.page >= start && p.page <= end).flatMap(p => p.indices))],
    ["physicalPages", pages.map(page => page.indices)]
  ];
  const results = datasets.map(([name, segments]) => {
    const plainSegments = segments.map(inverseMobius);
    for (let i = 0; i < segments.length; i++)
      assert.deepEqual(forwardZeta(plainSegments[i]), segments[i],
        `Exact original GP29 forward reconstruction: ${name}, block ${i}`);
    const decoded = plainSegments.flat();
    assert.equal(decoded.length,12956);
    return {name, blockCount:segments.length, runes:decoded.length,
      originalCipherIoC:ioc(all), decodedIoC:ioc(decoded),
      first55GP:decoded.slice(0,55).map(i => book.translit[i]).join(" ")};
  });
  const expected = {
    wholeBook:0.034479208135983576,
    visualChapters:0.03449567571219586,
    physicalPages:0.03448913396158765
  };
  for (const result of results) {
    assert.ok(Math.abs(result.decodedIoC - expected[result.name]) < 1e-14);
    assert.ok(result.decodedIoC < 0.04, "Source-native GP English must be considered separately");
  }
  const solvedP57 = book.pages.find(page => page.page === 57).indices;
  assert.equal(solvedP57.length,95);
  assert.deepEqual(inverseMobius(forwardZeta(solvedP57)),solvedP57,
    "Authentic clear p57 native-GP inverse positive");
  assert.ok(ioc(solvedP57) > 0.06);
  assert.deepEqual(forwardZeta([1,2,3,4,5,6]),[1,3,4,7,6,12]);
  assert.deepEqual(inverseMobius([1,3,4,7,6,12]),[1,2,3,4,5,6]);
  const outcome = {operator:"Dirichlet zeta sum over positive rune ordinals modulo29",
    originalContext:"LP1 p05 printed MOBIUS and prime/totient wording",
    clocks:["all unknown GP runes","nine artwork-delimited chapters","physical pages"],
    nativeControlLength:solvedP57.length,nativeControlIoC:ioc(solvedP57),
    originalCipherCount:all.length,originalDoublets:doublets,results,
    decision:"All three frozen keyless arithmetic Möbius inverses are random-like GP29, not recovered ordinary GP prose."};
  console.log(JSON.stringify(outcome,null,2));
  return outcome;
}
if (require.main === module) run();
module.exports = {run,forwardZeta,inverseMobius};
