"use strict";
/**
 * Original-root24 direct polynomial inverse for facing-tree LP2 pages 10–11.
 * An intentionally narrow, source-fixed reversible decoder, not a cipher claim.
 * Run from the repository root: node sims/lp2_tree24_divisor_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const ROOT = 24;
const F = 29;
const mod = (n) => (n % F + F) % F;
/** @param {number[]} source @param {number} x */
function divide(source, x) {
  const q = [source[0]];
  for (let i = 1; i < source.length - 1; i++) {
    q.push(mod(source[i] + x * q[i - 1]));
  }
  return {q, remainder: mod(source.at(-1) + x * q.at(-1))};
}
/** @param {number[]} plain @param {number} x */
function multiply(plain, x) {
  return [
    plain[0],
    ...plain.slice(1).map((v, i) => mod(v - x * plain[i])),
    mod(-x * plain.at(-1)),
  ];
}
/** @param {number[]} x */
function summary(x) {
  const counts = Array(F).fill(0);
  for (const i of x) counts[i]++;
  return {
    length: x.length,
    ioc: counts.reduce((n, v) => n + v * (v - 1), 0)
      / (x.length * (x.length - 1)),
    preview: x.slice(0, 54).map((i) => corpus.translit[i]).join(""),
  };
}
const originalPages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
assert.equal(originalPages.length, 55);
assert.equal(originalPages.reduce((a, b) => a + b.indices.length, 0), 12956);
const roots = originalPages.filter((p) => divide(p.indices, ROOT).remainder === 0)
  .map((p) => p.page);
assert.deepEqual(roots, [10, 11, 29, 36]);
const output = {root: ROOT, rootedPages: roots, controls: {}, originals: {}};
for (const pg of [10, 11, 29, 36, 12, 13, 56, 57]) {
  const source = corpus.pages.find((p) => p.page === pg).indices;
  const one = divide(source, ROOT);
  const two = divide(one.q, ROOT);
  assert.deepEqual(multiply(one.q, ROOT).slice(0, -1), source.slice(0, -1));
  if (one.remainder === 0) assert.deepEqual(multiply(one.q, ROOT), source);
  output.originals[pg] = {runeCount: source.length,
    firstRemainder: one.remainder, secondRemainder: two.remainder,
    original: summary(source), quotient: summary(one.q)};
}
assert.deepEqual([10, 11, 29, 36].map((x) =>
  output.originals[x].firstRemainder), [0, 0, 0, 0]);
assert.equal(output.originals[29].secondRemainder, 0);
for (const bad of [12, 13, 56, 57]) {
  assert.notEqual(output.originals[bad].firstRemainder, 0);
}
const solved = corpus.pages.find((p) => p.page === 57).indices;
const planted = multiply(solved, ROOT);
assert.deepEqual(divide(planted, ROOT), {q: solved, remainder: 0});
const other = divide(planted, 23);
assert.notEqual(other.remainder, 0);
output.controls.planted = {plaintextRunes: solved.length,
  cipherRunes: planted.length, exactRecovery: true,
  wrongRootRemainder: other.remainder};
console.log(JSON.stringify(output, null, 2));
