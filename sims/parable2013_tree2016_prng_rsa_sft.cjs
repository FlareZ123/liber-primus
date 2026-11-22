"use strict";
/**
 * Source-led, finite inversion tests connecting the original 2013 PARABLE
 * number to 2016's p32 tree/image dimensions. Two independent hypotheses:
 * (1) a 32-bit full-period LCG; (2) small three-prime RSA.
 * Node 22 built-ins only, original LP2 corpus, no writes or random key sweeps.
 * Both hypotheses are speculative until an original text selects the operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const ciphertext = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(ciphertext.length, 12956);
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const solvedText = read("resources/lp2-transcription.txt").split("%")[56];
const clauseSums = solvedText.split(".")
  .map(s => [...s].reduce((sum, r) =>
    sum + (runeIndex.has(r) ? gp.prime[runeIndex.get(r)] : 0), 0))
  .filter(Boolean);
assert.deepEqual(clauseSums, [449, 1259, 1031, 1229]);
const PARABLE = clauseSums.slice(1).reduce((p, x) => p * x, 1);
assert.equal(PARABLE, 1595277641);
const TREE = gp.pages.find(p => p.page === 32).indices;
assert.equal(TREE.length, 121);
const width = TREE.slice(0, 11).reduce((s, x) => s + gp.prime[x], 0);
const height = Array.from({length: 11}, (_, i) => gp.prime[TREE[11*i]])
  .reduce((s, x) => s + x, 0);
assert.deepEqual([width, height], [563, 569]);
const DIMENSION_MULTIPLE = width * height * 3301;
assert.equal(DIMENSION_MULTIPLE, 1057465447);
assert.equal(PARABLE % 4, 1);
assert.equal(DIMENSION_MULTIPLE % 2, 1);
const mod29 = x => (x % 29 + 29) % 29;

/** @param {number[]} values */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const x of values) hist[x]++;
  return hist.reduce((s, n) => s + n*(n-1), 0) /
    (values.length*(values.length-1));
}
/** @param {number[]} values */
function doublets(values) {
  let total = 0;
  for (let i = 1; i < values.length; i++)
    if (values[i] === values[i-1]) total++;
  return total;
}
/** @param {number} seed
 * @param {"low-residue"|"high5-rejection"|"high8-rejection"} readout
 * @param {number} wanted
 */
function stream(seed, readout, wanted) {
  let x = seed >>> 0;
  const keys = [];
  while (keys.length < wanted) {
    x = (Math.imul(PARABLE, x) + DIMENSION_MULTIPLE) >>> 0;
    let digit;
    if (readout === "low-residue") digit = x % 29;
    if (readout === "high5-rejection") {
      digit = x >>> 27;
      if (digit >= 29) continue;
    }
    if (readout === "high8-rejection") {
      digit = x >>> 24;
      if (digit >= 232) continue;
      digit %= 29;
    }
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    keys.push(digit);
  }
  return keys;
}
const lcg = [];
for (const seed of [3301, 1033, 761, 449])
  for (const readout of [
    "low-residue", "high5-rejection", "high8-rejection"
  ]) {
    const pad = stream(seed, readout, ciphertext.length);
    const solved = gp.pages[57].indices;
    const planted = Array.from({length: ciphertext.length},
      (_, i) => solved[i % solved.length]);
    const plantedCipher = planted.map((p, i) => mod29(p + pad[i]));
    assert.deepEqual(plantedCipher.map((c, i) =>
      mod29(c - pad[i])), planted);
    for (const sign of [-1, 1]) {
      const candidate = ciphertext.map((c, i) => mod29(c + sign*pad[i]));
      assert.deepEqual(candidate.map((p, i) => mod29(p - sign*pad[i])),
        ciphertext);
      lcg.push({
        seed, readout, sign, ioc: ioc(candidate),
        doublets: doublets(candidate),
        first60: candidate.slice(0, 60).map(i => gp.translit[i]).join("")
      });
    }
  }
assert.equal(lcg.length, 24);
assert(lcg.every(row => row.ioc < 0.035));

/** @param {bigint} x @param {bigint} y */
function gcd(x, y) {
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}
/** @param {bigint} x @param {bigint} n */
function inverse(x, n) {
  let [r0, r1, t0, t1] = [n, x, 0n, 1n];
  while (r1 !== 0n) {
    const quotient = r0 / r1;
    [r0, r1] = [r1, r0 - quotient*r1];
    [t0, t1] = [t1, t0 - quotient*t1];
  }
  assert.equal(r0, 1n);
  return (t0 % n + n) % n;
}
/** @param {bigint} b @param {bigint} e @param {bigint} n */
function modpow(b, e, n) {
  let r = 1n;
  while (e > 0n) {
    if ((e & 1n) !== 0n) r = r*b % n;
    b = b*b % n;
    e >>= 1n;
  }
  return r;
}
/** @param {number[]} digits */
function base29(digits) {
  return digits.reduce((n, digit) => n*29n + BigInt(digit), 0n);
}
const modulus = BigInt(PARABLE);
const phi = clauseSums.slice(1)
  .reduce((p, x) => p*(BigInt(x)-1n), 1n);
const capacity = 29n ** 6n;
assert.equal(modulus, 1595277641n);
assert.equal(phi, 1591168720n);
assert.equal(capacity, 594823321n);
// All ordinary 7-GP-digit RSA ciphertext blocks would have to be <N.
const seven = [];
for (const page of pages)
  for (let i = 0; i+7 <= page.indices.length; i+=7)
    seven.push(base29(page.indices.slice(i, i+7)));
assert(seven.some(n => n >= modulus));
const cases = [];
for (const e of [3301n, 1033n, 449n, 761n]) {
  assert.equal(gcd(e, phi), 1n);
  const d = inverse(e, phi);
  // Recoverable native-GP numerical plant: choose a nonzero 6-rune
  // native plaintext in range whose exact RSA ciphertext also fits 6 runes.
  let plant = null;
  for (let p = 2n; p < 10000n; p++) {
    const enc = modpow(p, e, modulus);
    if (enc < capacity) { plant = {p, enc}; break; }
  }
  assert(plant);
  assert.equal(modpow(plant.enc, d, modulus), plant.p);
  for (const [clock, groups] of [
    ["book", [ciphertext]], ["page", pages.map(p => p.indices)]
  ]) {
    for (const reversed of [false, true]) {
      const values = [];
      for (const group of groups)
        for (let i = 0; i+6 <= group.length; i+=6) {
          const digits = group.slice(i, i+6);
          if (reversed) digits.reverse();
          values.push(modpow(base29(digits), d, modulus));
        }
      cases.push({
        exponent: String(e), clock, reversed,
        blocks: values.length,
        validSixDigits: values.filter(v => v < capacity).length,
        outOfRange: values.filter(v => v >= capacity).length,
        plantRecovered: true
      });
    }
  }
}
assert.equal(cases.length, 16);
assert(cases.every(row => row.outOfRange > 0));
console.log(JSON.stringify({
  provenance: "2013 audio PARABLE product and source LP2 p57 primes; 2016 signed tree image dimensions linked to original p32 prime-weight square",
  source: {p57ClausePrimeSums: clauseSums, p32Width: width,
    p32Height: height, lcgMultiplier: PARABLE,
    lcgIncrement: DIMENSION_MULTIPLE},
  lcg: {
    stateBits: 32, fullPeriodByHullDobell: true,
    sourceIoc: ioc(ciphertext), sourceDoublets: doublets(ciphertext),
    nativePlantIoc: ioc(Array.from({length: ciphertext.length},
      (_,i) => gp.pages[57].indices[i % gp.pages[57].indices.length])),
    cases: lcg
  },
  rsa: {
    modulus: String(modulus), totient: String(phi),
    sixGPdigitCapacity: String(capacity), sevenGPdigitCapacity: String(29n**7n),
    sourceSevenDigitBlocks: seven.length,
    invalidSevenDigitBlocks: seven.filter(n => n>=modulus).length,
    cases
  },
  conclusion: "None of these finite historically sourced LCG masks or direct GP29 fixed-block RSA inversions recovers original unknown plaintext"
}, null, 2));
