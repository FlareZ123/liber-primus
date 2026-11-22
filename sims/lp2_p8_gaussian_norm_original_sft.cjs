"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "liber-primus", "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "lp2-transcription.txt"), "utf8");
const glyph = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {readonly number[]} xs @returns {number} */
function product(xs) {
  return xs.reduce((a, b) => mod(a * b), 1);
}

/** @param {number} base @param {number} exponent @returns {number} */
function power(base, exponent) {
  let x = 1;
  for (let i = 0; i < exponent; i++) x = mod(x * base);
  return x;
}

/** @param {number} p @returns {number[]} */
function page(p) {
  const row = corpus.pages.find((x) => x.page === p);
  assert.ok(row, "Missing original physical page " + p);
  return row.indices;
}

/** @param {number} p @returns {number[]} */
function red(p) {
  const row = ink.pages.find((x) => x.page === p);
  assert.ok(row);
  assert.equal(row.red_spans.length, 1);
  return [...row.red_spans[0].runes].map((r) => glyph.get(r));
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const h = Array(29).fill(0);
  for (const x of a) h[x]++;
  return h.reduce((acc, n) => acc + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

/**
 * Detect a historically forbidden non-F ciphertext -> F plaintext
 * under an additive GP29 Vigenere inverse with a geometric keystream.
 * The generous skipF=false model even allows ciphertext F to change.
 * @param {number[]} original
 * @param {number} generator
 * @param {number} phase
 * @param {number} sign
 * @param {boolean} skipF
 * @returns {number}
 */
function illegalF(original, generator, phase, sign, skipF) {
  let key = power(generator, phase);
  let invalid = 0;
  for (const c of original) {
    if (skipF && c === 0) continue;
    const p = mod(c + sign * key);
    if (c !== 0 && p === 0) invalid++;
    key = mod(key * generator);
  }
  return invalid;
}

assert.equal(corpus.runes.length, 29);
assert.equal(transcription.split("%").length, 57);
const p7red = red(7);
const p8red = red(8);
const p27red = red(27);
assert.deepEqual(p7red, [23, 3, 22, 16, 2, 25, 5, 7, 11, 14, 28, 6, 28, 19]);
assert.deepEqual(p8red, [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
assert.equal(p7red.length, 14);
assert.equal(p8red.length, 12);
assert.equal(p27red.length, 19);
assert.equal(product(p7red), 26);
assert.equal(product(p8red), 12);
assert.equal(product(p27red), 9);
assert.deepEqual([p7red.at(-1), p8red.at(-1), p27red.at(-1)], [19, 17, 13]);
for (const a of [p7red, p8red, p27red]) {
  assert.equal(mod(product(a) * a.at(-1)), 1);
}
assert.equal(product(p7red.slice(-3)), 2);
assert.equal(product(p8red.slice(0, 4)), 4);
assert.equal(product(p8red.slice(4)), 3);
assert.equal(p8red[0], 14);
assert.equal(p8red.at(-1), 17);
assert.equal(page(8).length, 255);
assert.equal(page(8).at(-1), 12);
assert.equal(page(8).slice(12).length, 243);
assert.deepEqual(page(9).slice(0, 5), [26, 7, 25, 6, 11]);
assert.equal(product(page(9).slice(0, 5)), 5);
assert.equal(product([page(8).at(-1), ...page(9).slice(0, 5)]), 2);
assert.equal(mod(12 * 17), 1);
assert.equal(mod(12 * 12), 28);
assert.equal(mod(17 * 17), 28);
assert.equal(mod(12 + 17), 0);
assert.equal(2 * 2 + 5 * 5, 29);
assert.equal(mod(2 + 12), 14);
assert.equal(mod(2 - 12), 19);
assert.equal(mod(14 * 19), 5);
assert.equal(mod(14 * 14), mod(3 + 4 * 12));
assert.equal(power(14, 28), 1);
assert.equal(power(19, 28), 1);
for (const g of [14, 19]) {
  for (let n = 1; n < 28; n++) assert.notEqual(power(g, n), 1);
}

const receivers = [
  {physicalPage: 8, original: page(8).slice(12)},
  {physicalPage: 9, original: page(9)},
  {physicalPage: 27, original: page(27).slice(19)}
];
const diagnostics = [];
for (const receiver of receivers) {
  for (const generator of [12, 17, 14, 19]) {
    const period = generator === 12 || generator === 17 ? 4 : 28;
    for (const sign of [-1, 1]) {
      for (const skipF of [false, true]) {
        const all = Array.from({length: period}, (_, phase) =>
          illegalF(receiver.original, generator, phase, sign, skipF));
        const minInvalid = Math.min(...all);
        if (receiver.physicalPage === 8) {
          assert.ok(minInvalid > 0, "Found an unexpectedly F-legal p8 key");
        }
        diagnostics.push({
          page: receiver.physicalPage, generator, period, sign, skipF,
          minInvalid, maxInvalid: Math.max(...all),
          legalPhases: all.flatMap((n, phase) => n === 0 ? [phase] : [])
        });
      }
    }
  }
}
const multipliers = [];
for (const r of receivers) {
  for (const generator of [12, 17, 14, 19]) {
    for (const inverse of [false, true]) {
      let key = generator;
      const output = r.original.map((c) => {
        const factor = inverse ? power(key, 27) : key;
        const value = mod(c * factor);
        key = mod(key * generator);
        return value;
      });
      multipliers.push({
        page: r.physicalPage, generator, inverse,
        originalIoC: Number(ioc(r.original).toFixed(5)),
        decodedIoC: Number(ioc(output).toFixed(5))
      });
    }
  }
}
const solved57 = page(57);
console.log(JSON.stringify({
  source: "Original LP2 p7-p9/p27, GP0 modulo29",
  gaussian: {sqrtMinusOne: [12, 17], normPair: [14, 19], norm: 5,
    sourceRedWordProductsP8: [4, 3], lastP7RedWordProduct: 2,
    p8PageBreakRune: 12, p9FragmentProduct: 5},
  solved57OriginalIoC: Number(ioc(solved57).toFixed(5)),
  additiveFConstraints: diagnostics, multiplicativeReadouts: multipliers
}, null, 2));
console.log("PASS: source exact, additive F-exclusion, Gaussian norm and controls");
