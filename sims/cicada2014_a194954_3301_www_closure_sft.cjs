"use strict";

/**
 * Source-fixed 2014 Onion7 / A194954 closure test.
 *
 * Reproduces the signed-message whitespace prefix and destination HTML fields,
 * then checks the finite arithmetic diamond:
 *
 *   missing prime 19 -> GP W (index 7)
 *   title 133 = 7 * 19
 *   133 + 331 = primePi(3301) = 464
 *   A194954(7 * (29 + 1)) = A194954(210) = 3301
 *   210 = 7 * 29 + 7 -> GP "WW"
 *
 * The resulting source-level readout is W + WW = "WWW". This file tests the
 * arithmetic and a finite three-digit-title null family; it does not claim an
 * LP2 decipherment.
 *
 * Run: node sims/cicada2014_a194954_3301_www_closure_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const signed = fs.readFileSync(
  path.join(root, "resources", "historical", "cicada2014-stage11-message.asc"),
  "utf8"
);
const html = fs.readFileSync(
  path.join(root, "resources", "external", "cicada2014-stage11-onion7-original-index.html"),
  "utf8"
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  if (value % 2 === 0) return value === 2;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} value @returns {number} */
function popcount(value) {
  let count = 0;
  for (let x = value; x > 0; x = Math.floor(x / 2)) count += x % 2;
  return count;
}

/** @param {number} count @returns {number[]} */
function a194954(count) {
  const values = [2];
  for (let n = 2; n <= count; n++) {
    const step = popcount(n - 1);
    let candidate = values[values.length - 1] + step;
    while (!isPrime(candidate)) candidate += step;
    values.push(candidate);
  }
  return values;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const values = [];
  for (let candidate = 2; values.length < count; candidate++) {
    if (isPrime(candidate)) values.push(candidate);
  }
  return values;
}

/** @param {number} value @returns {number} */
function reverse3(value) {
  return Number(String(value).padStart(3, "0").split("").reverse().join(""));
}

/** @param {number} value @param {number} radix @returns {number[]} */
function digits(value, radix) {
  const out = [];
  for (let x = value; x > 0; x = Math.floor(x / radix)) out.unshift(x % radix);
  return out.length ? out : [0];
}

/** @param {string} message @returns {number[]} */
function whitespaceRuns(message) {
  const normalized = message.replace(/\r\n/g, "\n");
  const contentStart = normalized.indexOf("\n\n");
  const contentEnd = normalized.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(contentStart > 0 && contentEnd > contentStart);
  const lines = normalized.slice(contentStart + 2, contentEnd).split("\n");
  const runs = [];
  for (const line of lines) {
    const leading = (line.match(/^ */) || [""])[0].length;
    const trailing = (line.match(/ *$/) || [""])[0].length;
    if (line.trim() === "") {
      if (leading) runs.push(leading);
    } else {
      if (leading) runs.push(leading);
      if (trailing) runs.push(trailing);
    }
  }
  return runs;
}

const observed = whitespaceRuns(signed);
assert.deepEqual(observed, [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]);

const first12 = firstPrimes(12);
const missing = first12.filter((value) => !observed.includes(value));
assert.deepEqual(missing, [19]);

const titleMatch = html.match(/<title>(\d+)<\/title>/);
const idMatch = html.match(/<div id="(\d+)"/);
assert.ok(titleMatch && idMatch);
const title = Number(titleMatch[1]);
const divId = Number(idMatch[1]);
assert.equal(title, 133);
assert.equal(divId, 331);
assert.equal(reverse3(title), divId);

const q = corpus.runes.length;
assert.equal(q, 29);
assert.equal(corpus.translit.length, q);
assert.equal(corpus.prime.length, q);

const omittedPrime = missing[0];
const gpIndex = corpus.prime.indexOf(omittedPrime);
assert.equal(gpIndex, 7);
assert.equal(corpus.translit[gpIndex], "W");
assert.equal(title / omittedPrime, gpIndex);

const termIndex = gpIndex * (q + 1);
assert.equal(termIndex, 210);
assert.equal(Math.floor(termIndex / q), gpIndex);
assert.equal(termIndex % q, gpIndex);

const sequenceToTerm = a194954(termIndex);
const cicadaPrime = sequenceToTerm[termIndex - 1];
assert.equal(cicadaPrime, 3301);

// The Onion7 HTML id is itself an A194954 term. Inverse indexing through the
// already source-selected sequence gives 42, whose GP/base-29 digits are U,P.
const divIdTermIndex = sequenceToTerm.indexOf(divId) + 1;
assert.equal(divIdTermIndex, 42);
assert.deepEqual(digits(divIdTermIndex, q), [1, 13]);
assert.deepEqual(digits(divIdTermIndex, q).map((i) => corpus.translit[i]), ["U", "P"]);
assert.deepEqual(digits(termIndex, q), [7, 7]);
assert.deepEqual(digits(termIndex, q).map((i) => corpus.translit[i]), ["W", "W"]);

const primesTo2000 = firstPrimes(2000);
const primeOrdinal = primesTo2000.indexOf(cicadaPrime) + 1;
assert.equal(primeOrdinal, 464);
assert.equal(title + divId, primeOrdinal);

// Finite null family: preserve the source-fixed GP alphabet size and search all
// three-digit titles paired with a prime <= 37. A candidate must be divisible
// by that prime and satisfy the same two-route closure.
const sourcePrimeRange = first12;
const maxTermIndex = Math.floor(999 / 2) * (q + 1);
const sequence = a194954(maxTermIndex);
const closurePairs = [];
let testedPairs = 0;
for (let candidateTitle = 100; candidateTitle <= 999; candidateTitle++) {
  const candidateReverse = reverse3(candidateTitle);
  const ordinal = candidateTitle + candidateReverse;
  const ordinalPrime = primesTo2000[ordinal - 1];
  for (const candidateMissing of sourcePrimeRange) {
    if (candidateTitle % candidateMissing !== 0) continue;
    testedPairs++;
    const digit = candidateTitle / candidateMissing;
    const index = digit * (q + 1);
    if (sequence[index - 1] === ordinalPrime) {
      closurePairs.push({
        title: candidateTitle,
        reversed: candidateReverse,
        omittedPrime: candidateMissing,
        gpDigit: digit,
        termIndex: index,
        value: sequence[index - 1],
        primeOrdinal: ordinal
      });
    }
  }
}
assert.equal(testedPairs, 1432);
assert.deepEqual(closurePairs, [{
  title: 133,
  reversed: 331,
  omittedPrime: 19,
  gpDigit: 7,
  termIndex: 210,
  value: 3301,
  primeOrdinal: 464
}]);

console.log(JSON.stringify({
  status: "PASS",
  whitespaceRuns: observed,
  omittedPrime,
  gpIndex,
  gpRune: corpus.translit[gpIndex],
  htmlTitle: title,
  htmlDivId: divId,
  divIdTermIndex,
  divIdTermIndexBase29: digits(divIdTermIndex, q),
  divIdTermIndexGP: digits(divIdTermIndex, q).map((i) => corpus.translit[i]).join(""),
  termIndex,
  termIndexBase29: digits(termIndex, q),
  a194954AtTermIndex: cicadaPrime,
  primeOrdinal,
  sourceReadout: corpus.translit[gpIndex] +
    digits(termIndex, q).map((i) => corpus.translit[i]).join("") +
    digits(divIdTermIndex, q).map((i) => corpus.translit[i]).join(""),
  finiteNull: {
    testedThreeDigitTitlePrimePairs: testedPairs,
    closureHits: closurePairs
  },
  interpretation: "Exact source-level arithmetic closure reads WWWUP; no LP2 plaintext recovered"
}, null, 2));
