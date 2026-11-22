"use strict";

/**
 * Original-source H*G quotient252 as a 249-rune GP29 key for the physical
 * p0 black body, with the remaining three quotient symbols reserved as
 * a candidate red-triad checksum. This is a pre-fixed negative consumer:
 * no plaintext is searched or fitted.
 *
 * Run (Windows 11 / Node.js 22):
 *   node sims/lp2_q252_p0_black249_gp29_pad_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;
/** @param {number[]} x @param {number[]} y @returns {number[]} */
function multiply(x, y) {
  const out = new Array(x.length + y.length - 1).fill(0);
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < y.length; j++) out[i + j] = mod29(out[i + j] + x[i] * y[j]);
  }
  return out;
}
/** @param {number} n @returns {number} */
function inverse29(n) {
  for (let i = 1; i < 29; i++) if ((i * n) % 29 === 1) return i;
  throw new Error("Nonunit modulo29 " + n);
}
/** @param {number[]} numerator @param {number[]} divisor @returns {{ quotient: number[], remainder: number[] }} */
function divideDesc(numerator, divisor) {
  assert(numerator.length >= divisor.length);
  const remainder = numerator.slice();
  const quotient = new Array(numerator.length - divisor.length + 1).fill(0);
  const inv = inverse29(divisor[0]);
  for (let i = 0; i < quotient.length; i++) {
    const q = mod29(remainder[i] * inv);
    quotient[i] = q;
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod29(remainder[i + j] - q * divisor[j]);
    }
  }
  return { quotient, remainder: remainder.slice(-divisor.length + 1) };
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const count = new Array(29).fill(0);
  for (const value of a) count[value]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @param {number[]} b @param {number} sign @returns {number[]} */
function shifted(a, b, sign) {
  assert.equal(a.length, b.length);
  return a.map((x, i) => mod29(x + sign * b[i]));
}

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);

// 2013 signed BASE29 3301 = 3QO gives original H in ascending order.
// Physical p39 three-rune red inscription gives G in ascending order.
const H = [3, 26, 24];
const G = [27, 5, 15];
const HG = multiply(H.slice().reverse(), G.slice().reverse());
assert.deepEqual(HG, [12, 17, 11, 21, 23]);
const table = grid.bytes.map(mod29);
const { quotient, remainder } = divideDesc(table, HG);
assert.equal(quotient.length, 252);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 20),
  [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]);
assert.deepEqual(multiply(quotient, HG), table);

const p0 = corpus.pages[0].indices;
assert.equal(p0.length, 262);
const red = ink.physical_zero_based.red_words.reduce((sum, w) => sum + w.length, 0);
assert.equal(red, 13);
const black = p0.slice(red);
assert.equal(black.length, 249);
assert.equal(quotient.length - black.length, 3);
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
assert.ok(ioc(solved) > 0.06);

const results = [];
for (const trim of ["tail3", "head3"]) {
  const forwardKey = trim === "tail3" ? quotient.slice(0, 249) : quotient.slice(3);
  assert.equal(forwardKey.length, 249);
  for (const reverse of [false, true]) {
    const key = reverse ? forwardKey.slice().reverse() : forwardKey;
    for (const sign of [-1, +1]) {
      const plain = shifted(black, key, sign);
      assert.deepEqual(shifted(plain, key, -sign), black);
      const controlKey = key.slice(0, solved.length);
      const encrypted = shifted(solved, controlKey, -sign);
      assert.deepEqual(shifted(encrypted, controlKey, sign), solved);
      results.push({
        trim, reverse, sign, ioc: ioc(plain),
        first80: plain.slice(0, 80).map((x) => corpus.translit[x]).join(""),
      });
    }
  }
}
assert.equal(results.length, 8);
assert(results.every((r) => r.ioc < 0.04));
console.log(JSON.stringify({
  input: {table: table.length, q252: quotient.length, p0Black: black.length,
    spareCoefficients: 3, HG, knownP57Ioc: ioc(solved)},
  baselineP0BlackIoc: ioc(black),
  candidates: results,
  conclusion: "No native-GP prose in 8 source-layout-fixed direct quotient249 pad inverses. No plaintext recovered."
}, null, 2));
