"use strict";

/**
 * One frozen original-cipher test of the 252-coefficient p50 quotient as a
 * direct operand for the unique two-page, section-ending 252-rune pair.
 *
 * SFT: node sims/lp2_p22_p32_q252_terminal_original_sft.cjs
 * Inputs: canonical original rune indices and original p50 table values.
 * No external packages, plaintext fitting, file mutation, or phase search.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");

/** @param {number} value @returns {number} */
function mod(value) { return ((value % 29) + 29) % 29; }
/** @param {number[]} first @param {number[]} second @returns {number[]} */
function multiply(first, second) {
  const out = Array(first.length + second.length - 1).fill(0);
  for (let i = 0; i < first.length; i++)
    for (let j = 0; j < second.length; j++)
      out[i + j] = mod(out[i + j] + first[i] * second[j]);
  return out;
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
/** @param {number[]} left @param {number[]} right @returns {number} */
function equalityDisagreements(left, right) {
  let disagreements = 0;
  for (let i = 1; i < left.length; i++)
    for (let j = 0; j < i; j++)
      disagreements += Number((left[i] === left[j]) !== (right[i] === right[j]));
  return disagreements;
}
const getPage = (n) => corpus.pages.find((entry) => entry.page === n);
const pages = corpus.pages.filter((page) => page.page < 56 && page.runic_count > 0);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.runic_count, 0), 12956);
assert.deepEqual(getPage(23).indices.slice(6, 9), [23, 6, 10]);
assert.deepEqual(getPage(39).indices.slice(119, 122), [27, 5, 15]);
const product = multiply([23, 6, 10], [27, 5, 15]);
assert.deepEqual(product, [12, 16, 7, 24, 5]);
assert.equal(grid.bytes.length, 256);

const remainder = grid.bytes.map((value) => value % 29);
const divisor = product.slice().reverse();
const quotient = [];
for (let i = 0; i < 252; i++) {
  const coefficient = mod(remainder[i] * 6); // 5^-1 in GF(29)
  quotient.push(coefficient);
  for (let j = 0; j < divisor.length; j++)
    remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
}
assert.deepEqual(remainder.slice(-4), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 12), [0, 23, 10, 15, 28, 2, 3, 4, 20, 15, 4, 6]);

const uniquePairs = [];
for (let i = 0; i < pages.length; i++)
  for (let j = i + 1; j < pages.length; j++)
    if (pages[i].runic_count + pages[j].runic_count === 252)
      uniquePairs.push([pages[i].page, pages[j].page]);
assert.deepEqual(uniquePairs, [[22, 32]]);
assert.equal(getPage(22).runic_count, 131);
assert.equal(getPage(32).runic_count, 121);

const all = [];
for (const [label, original] of [
  ["p22|p32", [...getPage(22).indices, ...getPage(32).indices]],
  ["p32|p22", [...getPage(32).indices, ...getPage(22).indices]]
]) {
  assert.equal(original.length, 252);
  for (const sign of [-1, 1]) {
    const plaintext = original.map((value, i) => mod(value + sign * quotient[i]));
    const replay = plaintext.map((value, i) => mod(value - sign * quotient[i]));
    assert.deepEqual(replay, original);
    all.push({
      originalOrder: label, sign,
      ioc: ioc(plaintext),
      preview: plaintext.slice(0, 36).map((v) => corpus.translit[v]).join("")
    });
  }
  for (const reverse of [false, true]) {
    const operand = reverse ? quotient.slice().reverse() : quotient;
    const disagreements = equalityDisagreements(operand, original);
    assert.ok(disagreements > 0);
    all.push({originalOrder: label, fixedAlphabetReversed: reverse, disagreements});
  }
}
const expected = [0.03408587870739265, 0.03788022513122115,
  0.03427559602858408, 0.03234680326313792];
const observed = all.filter((entry) => "sign" in entry);
for (let i = 0; i < expected.length; i++)
  assert.ok(Math.abs(observed[i].ioc - expected[i]) < 1e-12);
assert.deepEqual(
  all.filter((entry) => "disagreements" in entry).map((entry) => entry.disagreements),
  [2224, 2232, 2234, 2218]
);
const solvedP57 = getPage(57).indices;
const synthetic = solvedP57.map((value, i) => mod(value + quotient[i]));
assert.deepEqual(
  synthetic.map((value, i) => mod(value - quotient[i])),
  solvedP57
);
console.log(JSON.stringify({
  originalRunes: 12956, uniquePairs, p50QuotientLength: quotient.length,
  p50Remainder: remainder.slice(-4), originalCombinedIoC: ioc([
    ...getPage(22).indices, ...getPage(32).indices
  ]), solvedP57IoC: ioc(solvedP57), originalSourceResults: all,
  syntheticPositiveControl: String(solvedP57.length) + "/95"
}, null, 2));
