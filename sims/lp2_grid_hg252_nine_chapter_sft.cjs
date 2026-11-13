"use strict";

/**
 * Original-source, bounded decoding experiment: 2013 BASE29/DH-derived
 * degree-four factor of the 256-cell LP2 table -> 252 coefficient quotient.
 * Test 9x28 visual-section schedules, whole-quotient schedules and the
 * characteristic polynomial as an LFSR. No parameters are fitted to plaintext.
 *
 * Standalone test: node sims/lp2_grid_hg252_nine_chapter_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const base = path.resolve(__dirname, "..");

/** @param {string} name */
const readJson = name => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/base60-grid.json");
const bytes = grid.byte_rows.flat();
const mod29 = x => ((x % 29) + 29) % 29;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/**
 * Divide the original source B(X), high-coefficient first, by
 * F(X)=14+9X+13X²+28X³+X⁴ over GF(29).
 * @param {number[]} sourceBytes
 * @returns {number[]}
 */
function quotient252(sourceBytes) {
  const rem = sourceBytes.map(mod29).reverse();
  const factor = [14, 9, 13, 28, 1];
  const quotient = Array(252).fill(0);
  for (let k = 255; k >= 4; k--) {
    const coefficient = rem[k];
    quotient[k - 4] = coefficient;
    for (let j = 0; j < 5; j++)
      rem[k - 4 + j] = mod29(rem[k - 4 + j] - coefficient * factor[j]);
  }
  assert.deepEqual(rem.slice(0, 4), [0, 0, 0, 0]);
  return quotient.reverse();
}
const quotient = quotient252(bytes);
assert.equal(quotient.length, 9 * 28);
assert.deepEqual(quotient.slice(0, 5), [0, 28, 21, 17, 24]);
assert.deepEqual(bytes.slice(-4).map(mod29), [6, 7, 15, 22]);

const ranges = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const pages = corpus.pages.filter(p => p.page <= 55 && p.runic_count > 0);
const chapters = ranges.map(([lo, hi]) =>
  pages.filter(p => p.page >= lo && p.page <= hi).flatMap(p => p.indices));
assert.deepEqual(chapters.map(a => a.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.equal(chapters.flat().length, 12956);

/**
 * @param {number[]} seed Four actual source table residues.
 * @param {number} length
 * @returns {number[]}
 */
function lfsrKey(seed, length) {
  const key = seed.slice();
  for (let i = 4; i < length; i++) {
    key.push(mod29(-14 * key[i-4] - 9 * key[i-3] -
      13 * key[i-2] - 28 * key[i-1]));
  }
  return key.slice(0, length);
}

/** @param {number[]} data */
function coincidence(data) {
  const freq = Array(29).fill(0);
  for (const v of data) freq[v]++;
  return freq.reduce((a, n) => a + n * (n-1), 0) /
    (data.length * (data.length-1));
}

/**
 * Encode a source-native plaintext and exactly recover it for a selected
 * key schedule; source-page tests use the inverse in the same clock.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 */
function assertPlant(plain, key, sign) {
  assert.equal(key.length, plain.length);
  const encrypted = plain.map((x, i) => mod29(x - sign * key[i]));
  const restored = encrypted.map((x, i) => mod29(x + sign * key[i]));
  assert.deepEqual(restored, plain);
}

const solvedControl = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solvedControl.length, 95);
assert(coincidence(solvedControl) > 0.06);
const experiments = [];

/**
 * @param {string} family
 * @param {number[][]} parts
 * @param {(part:number[],partIndex:number)=>number[]} makeKey
 * @param {number} sign
 */
function test(family, parts, makeKey, sign) {
  const output = [];
  for (let s = 0; s < parts.length; s++) {
    const part = parts[s], key = makeKey(part, s);
    assert.equal(key.length, part.length);
    const decoded = part.map((x, i) => mod29(x + sign * key[i]));
    const plant = solvedControl.slice(0, Math.min(key.length, solvedControl.length));
    assertPlant(plant, key.slice(0, plant.length), sign);
    const restored = decoded.map((x, i) => mod29(x - sign * key[i]));
    assert.deepEqual(restored, part);
    output.push(...decoded);
  }
  const ioc = coincidence(output);
  const prefix = output.slice(0, 36).map(v => corpus.translit[v]).join(" ");
  experiments.push({family, sign, ioc, prefix});
  assert(ioc > 0.025 && ioc < 0.045, "Unexpected original language signal: investigate");
}

/** @param {number[]} key @param {number} length */
const repeat = (key, length) =>
  Array.from({length}, (_, i) => key[i % key.length]);
const wholeBook = [chapters.flat()];
const perPage = pages.map(p => p.indices);

// Nine visual chapters and a distinct 28-element quotient row per chapter.
for (const reversed of [false, true]) {
  for (const sign of [-1, 1]) {
    test("nine-by-28-" + (reversed ? "reversed" : "printed"),
      chapters, (part, s) => repeat(
        reversed ? quotient.slice(s*28, s*28+28).reverse() :
          quotient.slice(s*28, s*28+28), part.length), sign);
  }
}

// All 252 decoded coefficients, reused without data-fitted phase search.
for (const [scope, parts] of [
  ["book", wholeBook], ["chapter", chapters], ["page", perPage]
]) {
  for (const sign of [-1, 1]) {
    test("period252-" + scope, parts,
      part => repeat(quotient, part.length), sign);
  }
}

// The factor itself as a fourth-order field-feedback generator, seeded by
// the last four source-printed table residues (not a discovered LP2 key).
const seed = bytes.slice(-4).map(mod29);
for (const [scope, parts] of [
  ["book", wholeBook], ["chapter", chapters]
]) {
  for (const sign of [-1, 1]) {
    test("HG-feedback-" + scope, parts,
      part => lfsrKey(seed, part.length), sign);
  }
}

const max = Math.max(...experiments.map(x => x.ioc));
assert.equal(experiments.length, 14);
assert(max < 0.045);
console.log(JSON.stringify({
  input:"original base60 table and exact physical p0-55 GP ciphertext",
  matrixFactor:"14+9X+13X^2+28X^3+X^4",
  quotientLength:quotient.length,
  quotientIoC:coincidence(quotient),
  sectionLengths:chapters.map(c => c.length),
  rawIoC:coincidence(chapters.flat()),
  solvedP57ControlIoC:coincidence(solvedControl),
  maxDecodedIoC:max,
  models:experiments,
  conclusion:"no unknown original GP-native plaintext or authentic key recovered"
}, null, 2));
