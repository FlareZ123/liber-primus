"use strict";

/**
 * SFT for the calibrated DH-state prime-index map:
 *   F(v) = prime(29 * v)
 *
 * Source cross-checks:
 *   e=3 -> 449
 *   a=6 -> 1033
 *   K^b mod p=16 -> 3301 -> p33 line01
 *   B=19 -> 4001 -> p40 line01
 *
 * Node.js 22, CommonJS, read-only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
parts.splice(50, 0, ""); // physical p50 is the non-rune numerical table

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let factor = 2; factor * factor <= n; factor += 1) {
    if (n % factor === 0) return false;
  }
  return true;
}

/** @param {number} rank */
function nthPrime(rank) {
  let count = 0;
  for (let candidate = 2; ; candidate += 1) {
    if (!isPrime(candidate)) continue;
    count += 1;
    if (count === rank) return candidate;
  }
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} value @param {number} modulus */
function inverse(value, modulus) {
  assert.equal(gcd(value, modulus), 1);
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("inverse not found");
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power >>= 1;
  }
  return result;
}

/** @param {number} page */
function physicalLineCount(page) {
  return parts[page]
    .split("/")
    .filter((line) => [...line].some((char) => runeIndex.has(char)))
    .length;
}

/** @param {number} value */
function F(value) {
  return nthPrime(29 * value);
}

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});
const e = inverse(state.b, state.p - 1);
assert.equal(e, 3);

const kToB = modPow(state.K, state.b, state.p);
const gToB = modPow(state.g, state.b, state.p);
assert.equal(kToB, 16);
assert.equal(gToB, state.B);

const charged = [
  ["e", e],
  ["K", state.K],
  ["g", state.g],
  ["a", state.a],
  ["A", state.A],
  ["b", state.b],
  ["B", state.B],
  ["p", state.p],
  ["K^b", kToB],
].map(([name, value]) => ({
  name,
  value,
  rank: 29 * value,
  prime: F(value),
}));

assert.deepEqual(charged, [
  {name: "e", value: 3, rank: 87, prime: 449},
  {name: "K", value: 2, rank: 58, prime: 271},
  {name: "g", value: 5, rank: 145, prime: 829},
  {name: "a", value: 6, rank: 174, prime: 1033},
  {name: "A", value: 8, rank: 232, prime: 1459},
  {name: "b", value: 15, rank: 435, prime: 3037},
  {name: "B", value: 19, rank: 551, prime: 4001},
  {name: "p", value: 23, rank: 667, prime: 4987},
  {name: "K^b", value: 16, rank: 464, prime: 3301},
]);

// Frozen source cross-checks.
assert.equal(F(e), 449);             // solved PARABLE heading GP-prime sum
assert.equal(F(state.a), 1033);     // original p33-p39 cuneiform number
assert.equal(F(kToB), 3301);        // original p33-p39 cuneiform number
assert.equal(F(state.B), 4001);     // forward navigation output

function parseFourDigitPageLine(prime) {
  const code = String(prime);
  if (!/^\d{4}$/u.test(code)) return null;

  const page = Number(code.slice(0, 2));
  const line = Number(code.slice(2));
  if (page < 0 || page > 55 || page === 50 || line < 1) return null;

  const lineCount = physicalLineCount(page);
  if (line > lineCount) return null;

  const annotation = ink.pages.find((candidate) => candidate.page === page);
  const redStart = (annotation?.red_spans || []).find((span) => span.start === 0);

  return {
    code,
    page,
    line,
    lineCount,
    redPageStart: redStart
      ? {start: redStart.start, length: redStart.length}
      : null,
  };
}

const addressable = charged
  .map((row) => ({...row, address: parseFourDigitPageLine(row.prime)}))
  .filter((row) => row.address);

assert.deepEqual(addressable, [
  {
    name: "B",
    value: 19,
    rank: 551,
    prime: 4001,
    address: {
      code: "4001",
      page: 40,
      line: 1,
      lineCount: 11,
      redPageStart: {start: 0, length: 8},
    },
  },
  {
    name: "K^b",
    value: 16,
    rank: 464,
    prime: 3301,
    address: {
      code: "3301",
      page: 33,
      line: 1,
      lineCount: 11,
      redPageStart: {start: 0, length: 10},
    },
  },
]);

// Both valid state-derived addresses point exactly to red page starts.
assert.equal(addressable.every((row) => row.address.redPageStart), true);

// Red-start inventory confirms these are two of only nine unknown-page red starts.
const redStartPages = ink.pages
  .filter((page) =>
    page.page <= 55 &&
    (page.red_spans || []).some((span) => span.start === 0)
  )
  .map((page) => page.page);
assert.deepEqual(redStartPages, [0, 3, 8, 15, 23, 27, 33, 40, 54]);
assert.equal(redStartPages.includes(33), true);
assert.equal(redStartPages.includes(40), true);

// Source-state audit on the red spans themselves.
const stateValues = new Set(Object.values(state));
const redStateRows = ink.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => (page.red_spans || []).map((span) => {
    const values = [...span.runes].map((rune) => runeIndex.get(rune));
    const primeSum = values.reduce(
      (sum, value) => sum + corpus.prime[value],
      0
    );
    const mod28 = primeSum % 28;
    const mod29 = primeSum % 29;
    return {
      page: page.page,
      start: span.start,
      length: span.length,
      primeSum,
      mod28,
      mod29,
      bothState: stateValues.has(mod28) && stateValues.has(mod29),
    };
  }));

const bothStateRows = redStateRows.filter((row) => row.bothState);
assert.deepEqual(bothStateRows, [
  {
    page: 33,
    start: 0,
    length: 10,
    primeSum: 379,
    mod28: state.b,
    mod29: state.K,
    bothState: true,
  },
  {
    page: 33,
    start: 91,
    length: 8,
    primeSum: 295,
    mod28: state.b,
    mod29: state.g,
    bothState: true,
  },
]);

const p40Red = redStateRows.find((row) => row.page === 40 && row.start === 0);
assert.deepEqual(p40Red, {
  page: 40,
  start: 0,
  length: 8,
  primeSum: 435,
  mod28: state.b,
  mod29: 0,
  bothState: false,
});
assert.equal(p40Red.primeSum, 29 * state.b);

console.log(JSON.stringify({
  status: "PASS",
  state: {...state, e, "K^b": kToB},
  map: "F(v)=prime(29*v)",
  charged,
  sourceCrosschecks: {
    eToParable449: F(e),
    aToCuneiform1033: F(state.a),
    kPowBToCuneiform3301: F(kToB),
  },
  navigation: {
    B: state.B,
    FofB: F(state.B),
    address: parseFourDigitPageLine(F(state.B)),
  },
  addressableStateOutputs: addressable,
  selectedRedStateRows: bothStateRows,
  p40RedClosure: p40Red,
  decision:
    "The fixed prime-index map links independently calibrated DH state to solved/source numbers 449, 1033 and 3301, then sends B=19 to 4001, a valid p40 line01 address at an original red page start. Preserve this as a source-constrained navigation candidate, not a plaintext decoder.",
}, null, 2));
