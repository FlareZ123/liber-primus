"use strict";
/**
 * Frozen p15 Fibonacci-prime => p55 16-word prime-totient decoder gate.
 * Usage: node sims/p55_p15_16word_fibonacci_totient_sft.cjs
 * Original unknown p55 ciphertext is never used to select any key or phase.
 *
 * Scope: One reversible candidate only. A failed result is not a general
 * exclusion of Fibonacci keys or page-dependent LP2 encryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const PAGE = corpus.pages.find(page => page.page === 55).indices;
const CONTROL = corpus.pages.find(page => page.page === 57).indices.slice(0, 76);
const FIB = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const LENGTHS = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(FIB.length, 16);
assert.equal(LENGTHS.reduce((a, b) => a + b, 0), 76);
assert.equal(PAGE.length, 76);
assert.equal(CONTROL.length, 76);

/** @param {number} upper Maximum required prime index, zero-based. */
function primeTable(upper) {
  const primes = [2];
  for (let candidate = 3; primes.length <= upper; candidate += 2) {
    let isPrime = true;
    for (const divisor of primes) {
      if (divisor * divisor > candidate) break;
      if (candidate % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
  }
  return primes;
}
const primes = primeTable(FIB.at(-1) + Math.max(...LENGTHS));
assert.equal(primes[0], 2);
assert.equal(primes[987], 7817);
const mod = value => (value % 29 + 29) % 29;

/**
 * Preserves the one-rune p54->p55 carry as an explicit reversible literal.
 * For each of 16 complete p55 words, start the prime index at F_n+1,
 * subtract phi(prime(F_n+1+i)) = prime(F_n+1+i)-1 modulo29,
 * and reset at the next word boundary.
 * @param {number[]} text 76 original GP29 indices.
 * @param {1|-1} sign +1 encodes, -1 decodes.
 * @returns {number[]}
 */
function transform(text, sign) {
  assert.equal(text.length, 76);
  const out = [];
  let at = 0;
  for (let word = 0; word < LENGTHS.length; word++) {
    for (let i = 0; i < LENGTHS[word]; i++) {
      const source = text[at++];
      const key = word === 0 ? 0 : mod(primes[FIB[word - 1] + i] - 1);
      out.push(mod(source + sign * key));
    }
  }
  assert.equal(at, 76);
  return out;
}
/** @param {number[]} input */
function ioc(input) {
  const freq = Array(29).fill(0);
  for (const digit of input) freq[digit]++;
  return freq.reduce((a, k) => a + k * (k - 1), 0) /
    (input.length * (input.length - 1));
}
/** @param {number[]} input */
function words(input) {
  let at = 0;
  return LENGTHS.map(length => {
    const text = input.slice(at, at + length).map(index => corpus.translit[index]).join("");
    at += length;
    return text;
  });
}
const plaintext = transform(PAGE, -1);
assert.deepEqual(transform(plaintext, +1), PAGE);
const plantedCipher = transform(CONTROL, +1);
assert.deepEqual(transform(plantedCipher, -1), CONTROL);
const rendered = words(plaintext);
const expected = "NG ABGU PP IP NTHDWPO BJGAGF XC RJGXHJELOEPLJEA EALOEEFX XOUB JJ UTAEPBUG THEUTXYN UM DURNEOW EODN THYEO";
assert.equal(rendered.join(" "), expected);
assert.ok(Math.abs(ioc(plaintext) - 0.03754385964912281) < 1e-14);
console.log(JSON.stringify({
  source: "LP2 original p15 16-cell Fibonacci prime spiral; source p56 prime-totient operation",
  target: "Original physical LP2 p55, one incoming carry plus 16 complete printed words",
  sourceKeyStartIndicesZeroBased: FIB,
  actualPrimeAtF16: primes[987],
  p55OriginalLength: PAGE.length,
  nativeGPPlantRecovered: CONTROL.length,
  ciphertextRoundtrip: transform(plaintext, +1).every((x, i) => x === PAGE[i]),
  rawP55Ioc: ioc(PAGE),
  decodedP55Ioc: ioc(plaintext),
  solvedP57ControlIoc: ioc(CONTROL),
  decodedP55Words: rendered,
  authenticUnknownPlaintextRecovered: false,
  decision: "This exact reset-per-word Fibonacci prime-totient subtraction does not yield coherent source-native GP prose."
}, null, 2));
