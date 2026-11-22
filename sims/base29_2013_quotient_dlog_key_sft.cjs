"use strict";

/**
 * Source-constrained continuation of the 2013 BASE29/DH -> LP2 grid-factor bridge.
 *
 * After dividing the original 256 grid coefficients by the two independently
 * source-linked quadratics, pair the exact 252-slot quotient into F29^2,
 * take discrete logs in the p3 field using z = 23 - 2u, serialize each log as
 * two BASE29 digits, and test both (a) the 252-digit register as candidate text
 * and (b) the same register as a fixed repeating additive key on untouched LP2.
 *
 * Run: node sims/base29_2013_quotient_dlog_key_sft.cjs
 * Node.js 22, built-ins only.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const grid = json("resources/liber-primus/lp2-grid-256.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");
const native = json("resources/control/latin-vulgate-heldout-gp.json").runes;
const pages = corpus.pages.filter(page => page.page < 56).map(page => page.indices);
const original = pages.flat();

/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} a */
function inverse(a) {
  for (let b = 1; b < 29; b++) if (mod(a * b) === 1) return b;
  throw new Error("zero divisor coefficient");
}
/** @param {number[]} polynomial @param {number[]} divisor */
function divide(polynomial, divisor) {
  const remainder = polynomial.map(mod);
  const quotient = [];
  const leadingInverse = inverse(divisor[0]);
  for (let i = 0; i <= polynomial.length - divisor.length; i++) {
    const coefficient = mod(remainder[i] * leadingInverse);
    quotient.push(coefficient);
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
    }
  }
  return {quotient, remainder: remainder.slice(quotient.length)};
}
/** @param {[number, number]} x @param {[number, number]} y @returns {[number, number]} */
function multiplyField(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}
/** @param {number[]} xs */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

assert.equal(grid.bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
assert.equal(original.length, 12956);
assert.equal(native.length, 2400);

const first = divide(grid.bytes.map(mod), [24, 26, 3]);
assert.deepEqual(first.remainder, [0, 0]);
const second = divide(first.quotient, [15, 5, 27]);
assert.deepEqual(second.remainder, [0, 0]);
const quotient = second.quotient;
assert.equal(quotient.length, 252);
assert.equal(quotient[0], 0);

const z = /** @type {[number, number]} */ ([23, 27]);
const logs = new Map();
let state = /** @type {[number, number]} */ ([1, 0]);
for (let exponent = 0; exponent < 840; exponent++) {
  const code = state[0] + 29 * state[1];
  assert.equal(logs.has(code), false);
  logs.set(code, exponent);
  state = multiplyField(state, z);
}
assert.deepEqual(state, [1, 0]);
assert.equal(logs.size, 840);

/** @param {Array<[number, number]>} pairs */
function base29LogDigits(pairs) {
  const exponents = [];
  const digits = [];
  for (const pair of pairs) {
    const code = pair[0] + 29 * pair[1];
    const exponent = code === 0 ? 840 : logs.get(code);
    assert.notEqual(exponent, undefined);
    exponents.push(exponent);
    if (exponent === 840) digits.push(28, 28);
    else digits.push(Math.floor(exponent / 29), exponent % 29);
  }
  return {exponents, digits};
}

/** @returns {Map<string, {exponents:number[], digits:number[]}>} */
function buildKeys() {
  const keys = new Map();
  for (const reverse of [false, true]) {
    const source = reverse ? quotient.slice().reverse() : quotient;
    for (const swap of [false, true]) {
      const adjacent = [];
      const halves = [];
      for (let i = 0; i < 252; i += 2) {
        const pair = /** @type {[number, number]} */ ([source[i], source[i + 1]]);
        adjacent.push(swap ? [pair[1], pair[0]] : pair);
      }
      for (let i = 0; i < 126; i++) {
        const pair = /** @type {[number, number]} */ ([source[i], source[i + 126]]);
        halves.push(swap ? [pair[1], pair[0]] : pair);
      }
      const suffix = `${reverse ? "rev" : "fwd"}_${swap ? "swap" : "ab"}`;
      keys.set(`adj_${suffix}`, base29LogDigits(adjacent));
      keys.set(`half_${suffix}`, base29LogDigits(halves));
    }
  }
  return keys;
}
const keys = buildKeys();
assert.equal(keys.size, 8);

const trigram = new Uint32Array(29 * 29 * 29);
let trigramCount = 0;
for (let i = 0; i + 2 < native.length; i++) {
  trigram[(native[i] * 29 + native[i + 1]) * 29 + native[i + 2]]++;
  trigramCount++;
}
const alpha = 0.1;
const denominator = trigramCount + alpha * trigram.length;
/** @param {number[]} xs */
function score(xs) {
  let sum = 0;
  for (let i = 0; i + 2 < xs.length; i++) {
    const count = trigram[(xs[i] * 29 + xs[i + 1]) * 29 + xs[i + 2]];
    sum += Math.log((count + alpha) / denominator);
  }
  return sum / (xs.length - 2);
}
/** @param {number[]} key @param {-1|1} sign @param {"book"|"page"} clock */
function decode(key, sign, clock) {
  const output = [];
  let global = 0;
  for (const page of pages) {
    for (let i = 0; i < page.length; i++) {
      const keyIndex = clock === "book" ? global : i;
      output.push(mod(page[i] + sign * key[keyIndex % key.length]));
      global++;
    }
  }
  return output;
}

const registerModels = [...keys].map(([name, value]) => ({
  name,
  ioc: ioc(value.digits),
  trigramScore: score(value.digits),
  byteRangeLogs: value.exponents.filter(x => x < 256).length,
  printableAsciiLogs: value.exponents.filter(x => x >= 32 && x <= 126).length,
  prefix: value.digits.slice(0, 80).map(x => corpus.translit[x]).join("")
})).sort((a, b) => b.trigramScore - a.trigramScore);

const keyModels = [];
for (const [name, value] of keys) {
  for (const sign of /** @type {const} */ ([-1, 1])) {
    for (const clock of /** @type {const} */ (["book", "page"])) {
      const plain = decode(value.digits, sign, clock);
      keyModels.push({
        name, sign, clock,
        ioc: ioc(plain),
        trigramScore: score(plain),
        prefix: plain.slice(0, 90).map(x => corpus.translit[x]).join("")
      });
    }
  }
}
keyModels.sort((a, b) => b.trigramScore - a.trigramScore);
assert.equal(keyModels.length, 32);

const plant = native.slice();
const controlKey = keys.get("adj_fwd_ab").digits;
const cipher = plant.map((x, i) => mod(x + controlKey[i % controlKey.length]));
const recovered = cipher.map((x, i) => mod(x - controlKey[i % controlKey.length]));
assert.deepEqual(recovered, plant);

const rawScore = score(original);
const nativeScore = score(native);
assert.ok(registerModels.every(model => model.trigramScore < -10.5));
assert.ok(registerModels.every(model => model.ioc < 0.036));
assert.ok(keyModels.every(model => model.trigramScore < -10.5));
assert.ok(keyModels.every(model => model.ioc < 0.036));
assert.ok(nativeScore > -8.0);

console.log(JSON.stringify({
  classification: "bounded negative: source-linked quotient discrete-log register and repeating-key use",
  quotientSlots: quotient.length,
  fieldBase: z,
  registerModels,
  raw: {ioc: ioc(original), trigramScore: rawScore},
  native: {ioc: ioc(native), trigramScore: nativeScore},
  keyModels,
  positiveControlExact: true,
  conclusion: "The natural quotient -> F29^2 discrete-log -> BASE29 continuation is nonlinguistic as direct GP text and as a fixed repeating additive key under the eight natural pairings, both signs, and book/page clocks."
}, null, 2));
