"use strict";

/**
 * One source-selected very-long prime-totient running key for unknown LP2.
 *
 * Physical p15's red9 BASE29 number divided by 3301 gives 8,952,964.
 * The independently solved p56 applies phi(p_i)=p_i-1 to GP29 runes.
 * The p15 Fibonacci-prime square illustrates prime ordinal selection.
 * Interpret the quotient exactly once as zero-based prime ordinal, decrypt
 * unsolved LP2 with the same phi-prime additive rule, testing only two
 * signs and page-reset vs uninterrupted manuscript clock. No phase scan.
 *
 * Node.js 22: node sims/p15_quotient_primeordinal_totient_source_gate.cjs
 * This is an inferred cross-clue consumer, not an authorially established key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const p15 = corpus.pages.find((p) => p.page === 15);
assert.deepEqual(p15.indices.slice(0, 9), [0,1,20,19,24,28,26,22,24]);
const title = p15.indices.slice(0, 9)
  .reduce((n, c) => n * 29n + BigInt(c), 0n);
assert.equal(title, 29553734724n);
const quotient = Number(title / 3301n);
assert.equal(quotient, 8952964);
assert.equal(Number(title % 3301n), 560);
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const flat = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(flat.length, 12956);

/**
 * Enumerate a fixed-index subsequence of exact ordinary primes by a
 * segmented Eratosthenes sieve. Counts start at prime2, index0.
 * @param {number} firstOrdinal Zero-based index into all primes
 * @param {number} needed Number of sequential primes returned
 * @returns {number[]}
 */
function primeWindow(firstOrdinal, needed) {
  const bound = 200000000;
  const smallLimit = Math.floor(Math.sqrt(bound));
  const smallSieve = new Uint8Array(smallLimit + 1);
  const small = [];
  for (let p = 2; p <= smallLimit; p++) {
    if (smallSieve[p]) continue;
    small.push(p);
    if (p * p <= smallLimit) {
      for (let v = p * p; v <= smallLimit; v += p) smallSieve[v] = 1;
    }
  }
  let ordinal = 0;
  const window = [];
  for (let lo = 2; lo < bound; lo += 1000000) {
    const hi = Math.min(lo + 1000000, bound);
    const composite = new Uint8Array(hi - lo);
    for (const p of small) {
      if (p * p >= hi) break;
      const first = Math.max(p * p, Math.ceil(lo / p) * p);
      for (let n = first; n < hi; n += p) composite[n - lo] = 1;
    }
    for (let i = 0; i < composite.length; i++) {
      if (composite[i]) continue;
      if (ordinal >= firstOrdinal) window.push(lo + i);
      ordinal++;
      if (window.length === needed) return window;
    }
  }
  throw new Error("fixed sieve bound insufficient for selected ordinal");
}
/** @param {number} n */
const mod = (n) => ((n % 29) + 29) % 29;
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((n, x) => n + x * (x - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a */
const gp = (a) => a.map((n) => corpus.translit[n]).join("");

// Independent authentic p56 cipher control with its known literal F at 56.
// The authentic solver has a genuine 84-position phi-prime clock.
const smallPrimes = [];
for (let n = 2; smallPrimes.length < 90; n++) {
  if (smallPrimes.every((p) => p * p > n || n % p !== 0)) smallPrimes.push(n);
}
const encrypted56 = corpus.pages.find((p) => p.page === 56).indices;
const natural56 = [];
let primeCounter = 0;
for (let i = 0; i < encrypted56.length; i++) {
  if (i === 56) natural56.push(0);
  else natural56.push(mod(encrypted56[i] - (smallPrimes[primeCounter++] - 1)));
}
assert.equal(primeCounter, 84);
const solved = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const units = corpus.translit.map((str, i) => ({str, i})).sort((a,b) => b.str.length - a.str.length);
/** @param {string} phrase */
function encode(phrase) {
  const out = [];
  for (const word of phrase.split(" ")) {
    for (let i = 0; i < word.length;) {
      const next = units.find((x) => word.startsWith(x.str, i));
      assert.ok(next);
      out.push(next.i);
      i += next.str.length;
    }
  }
  return out;
}
assert.deepEqual(natural56, encode(solved));

const primes = primeWindow(quotient, flat.length);
assert.deepEqual(primes.slice(0, 4), [159595027, 159595039, 159595041, 159595063]);
const pad = primes.map((p) => (p - 1) % 29);
const solvedPlant = corpus.pages.find((p) => p.page === 57).indices;
for (const sign of [-1, 1]) {
  const ciphertext = solvedPlant.map((p, i) => mod(p - sign * pad[i]));
  assert.deepEqual(ciphertext.map((c, i) => mod(c + sign * pad[i])), solvedPlant);
}
const cases = [];
for (const sign of [-1, 1]) {
  const book = flat.map((c, i) => mod(c + sign * pad[i]));
  const reset = pages.flatMap((p) => p.indices.map((c, i) => mod(c + sign * pad[i])));
  cases.push({
    inverseSign: sign,
    bookIoC: ioc(book), pageResetIoC: ioc(reset),
    firstPageIoC: ioc(book.slice(0, pages[0].indices.length)),
    bookPreview: gp(book.slice(0, 70)),
    pageResetPreview: gp(reset.slice(0, 70)),
  });
}
console.log(JSON.stringify({
  source: {p15BASE29: title.toString(), quotientPrimeOrdinal: quotient,
    firstPrime: primes[0], lastPrime: primes.at(-1), fixedRemainder: 560},
  original: {unknownRuneCount: flat.length, originalIoC: ioc(flat)},
  authenticP56Positive: {runes: natural56.length, exactMatched: 85, literalFAt: 56},
  plantedP57Positive: {runes: solvedPlant.length, exactMatched: 95, signs: 2},
  tests: cases, conclusion: "No native-GP frequency recovery under frozen high-prime ordinal plus page/continuous φ(prime) masks; alternate keyed sources remain possible"
}, null, 2));
assert.ok(cases.every((v) => v.bookIoC < 0.04 && v.pageResetIoC < 0.04));
