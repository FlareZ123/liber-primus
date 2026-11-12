"use strict";
/**
 * Source-fixed direct decipherment trial:
 * LP2 pp49-51 table -> H*G polynomial quotient -> solved-p56 totient inverse.
 * Usage: node sims/p50_hg_quotient_p56_totient_sft.cjs
 * No fitted GP29 plaintext, key, table cell, alignment, or secret phase.
 *
 * This tests a possible direct continuation, not an authenticated Cicada
 * instruction that the polynomial quotient should be read as text.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const table = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.deepEqual(bytes.slice(0, 8), [203,231,167,186,97,237,126,183]);
assert.deepEqual(bytes.slice(-8), [113,158,172,230,180,36,189,80]);

/** @param {number} value @returns {number} */
const mod = value => (value % 29 + 29) % 29;
/** @param {number[]} left @param {number[]} right @returns {number[]} */
function multiply(left, right) {
  const result = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i++) {
    for (let j = 0; j < right.length; j++) {
      result[i + j] = mod(result[i + j] + left[i] * right[j]);
    }
  }
  return result;
}
// H = 2013 signed BASE29 3301 -> 3QO quadratic (monic after scaling).
// G = the independently identified p39 red-triad double-root quadratic.
// Descending table coefficients are reversed for ascending polynomial division.
const HG = multiply(multiply([5,1], [5,1]), [11,18,1]);
assert.deepEqual(HG, [14,9,13,28,1]);
const remainder = bytes.slice().reverse().map(value => value % 29);
const quotient = Array(252).fill(0);
for (let i = 251; i >= 0; i--) {
  const scalar = remainder[i + 4];
  quotient[i] = scalar;
  for (let j = 0; j < HG.length; j++) {
    remainder[i + j] = mod(remainder[i + j] - scalar * HG[j]);
  }
}
assert.deepEqual(remainder.slice(0, 4), [0,0,0,0]);
assert.equal(quotient.length, 252);
assert.equal(quotient.at(-1), 0); // formal leading zero of the 252-slot code
assert.equal(quotient[0], 14);

/** @param {number} maxIndex inclusive, zero-based @returns {number[]} */
function primesTo(maxIndex) {
  const primes = [2];
  for (let candidate = 3; primes.length <= maxIndex; candidate += 2) {
    let prime = true;
    for (const divisor of primes) {
      if (divisor * divisor > candidate) break;
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) primes.push(candidate);
  }
  return primes;
}
const primes = primesTo(251);
/** @param {number[]} input @param {1|-1} sign @returns {number[]} */
function primeTotient(input, sign) {
  return input.map((value, i) => mod(value + sign * mod(primes[i] - 1)));
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const frequencies = Array(29).fill(0);
  for (const symbol of input) frequencies[symbol]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}
/** @param {number[]} input @returns {string} */
function translit(input) {
  return input.map(index => corpus.translit[index]).join("");
}
// Source-authentic mechanism control: first five red runes on solved p56,
// decoded under its actual first prime-totient shifts, spell ANEND.
const redP56 = corpus.pages.find(page => page.page === 56).indices.slice(0, 5);
assert.equal(translit(primeTotient(redP56, -1)), "ANEND");
const nativeP57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(nativeP57.length, 95);
const nativePlant = Array.from({length:252}, (_, i) => nativeP57[i % nativeP57.length]);
const syntheticCipher = primeTotient(nativePlant, +1);
assert.deepEqual(primeTotient(syntheticCipher, -1), nativePlant);

const interpretations = [
  {name:"original printed left-to-right",cipher:quotient.slice().reverse()},
  {name:"ascending polynomial coefficient order",cipher:quotient.slice()},
].map(({name,cipher})=>{
  const plain = primeTotient(cipher, -1);
  assert.deepEqual(primeTotient(plain, +1), cipher);
  return {
    orientation:name,
    length:plain.length,
    sourceIoc:ioc(cipher),
    decodedIoc:ioc(plain),
    decodedGPTransliteration:translit(plain),
  };
});
assert.ok(Math.abs(interpretations[0].decodedIoc - 0.034655030670966924) < 1e-14);
assert.ok(Math.abs(interpretations[1].decodedIoc - 0.03361158540441409) < 1e-14);
console.log(JSON.stringify({
  status:"original-input direct inverse tested, no recovered plaintext",
  rationale:"signed 2013 BASE29 H and p39 G select quotient; solved p56 supplies prime-totient inverse",
  generatedGP29Digits:quotient.length,
  exactHGRemainder:remainder.slice(0, 4),
  solvedP56TitleVerified:"ANEND",
  nativeP57PlantRecovered:nativePlant.length,
  interpretations,
  decision:"Neither source-defined coefficient orientation yields readable GP-native English; quotient is not direct p56-ciphered plaintext under this rule."
}, null, 2));
