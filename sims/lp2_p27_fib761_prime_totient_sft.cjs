"use strict";

/**
 * Source-selected 761-prime start for the authentic solved-p56 phi(prime)
 * decoder on original LP2 physical p27, with exact literal-F skip reachability.
 *
 * The source-selected value is p27's Fibonacci-pickup GP-prime sum 761
 * (also the original 2013 761.MP3 filename); 761 is the 135th prime.
 * The original p27 has a 19-rune red heading followed by black body.
 *
 * Source inputs: canonical LP2 images' GP transcript and original red spans.
 * Reads no English crib. Tests full literal-F branching without fitting keys.
 * Run with Node22: node sims/lp2_p27_fib761_prime_totient_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const p27 = corpus.pages.find(p => p.page === 27).indices;
const p56 = corpus.pages.find(p => p.page === 56).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
const rubric = ink.pages.find(p => p.page === 27).red_spans[0];
assert.deepEqual([rubric.start, rubric.length], [0, 19]);
assert.equal(p27.length, 234);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);

const primes = [];
for (let n = 2; primes.length < 1000; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(n);
}
assert.equal(primes[0], 2);
assert.equal(primes[134], 761);
assert.equal(primes[135], 769);
const mod29 = value => (value % 29 + 29) % 29;

/**
 * Exact reachability over all skips of visible ciphertext rune F (index 0).
 * On a skip, emitted plaintext is a literal, unconsuming F.
 * On a key-consuming output, plaintext F is prohibited (authentic p56 rule).
 * State j is precisely the number of consumed prime totients.
 *
 * @param {number[]} cipher Original GP29 rune indices
 * @param {number} primeOrigin Zero-based prime ordinal
 * @returns {{processed:number, contradiction:number, endingKeyPositions:number[]}}
 */
function reachable(cipher, primeOrigin) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const j of states) {
      const key = (primes[primeOrigin + j] - 1) % 29;
      if (cipher[i] === 0) next.add(j);
      const plain = mod29(cipher[i] - key);
      if (plain !== 0) next.add(j + 1);
    }
    if (next.size === 0) {
      return {processed: i + 1, contradiction: i, endingKeyPositions: []};
    }
    states = next;
  }
  return {
    processed: cipher.length, contradiction: -1,
    endingKeyPositions: [...states].sort((a, b) => a - b),
  };
}

/**
 * Positive plaintext plant under solved-p56's exact F-bypass semantics.
 * @param {number[]} plain
 * @param {number} firstPrimeIndex
 */
function encryptTransparentF(plain, firstPrimeIndex) {
  const out = [];
  let j = 0;
  for (const rune of plain) {
    if (rune === 0) {
      out.push(0);
    } else {
      out.push(mod29(rune + primes[firstPrimeIndex + j] - 1));
      j++;
    }
  }
  return {cipher: out, keyConsumed: j};
}
const plant = encryptTransparentF(p57, 134);
const plantReach = reachable(plant.cipher, 134);
assert.equal(plantReach.contradiction, -1);
assert(plantReach.endingKeyPositions.includes(plant.keyConsumed));
assert.notDeepEqual(plant.cipher, p57);

const solved = reachable(p56, 0);
assert.equal(solved.contradiction, -1);
assert(solved.endingKeyPositions.includes(84)); // authentic one F interruption
const initial = reachable(p27, 134);
const body = reachable(p27.slice(19), 134);
assert.equal(initial.contradiction, 24);
assert.equal(initial.processed, 25);
assert.equal(body.contradiction, 70);
assert.equal(body.processed, 71);

console.log(JSON.stringify({
  observation: "p27 Fibonacci-indexed source sum 761 = 135th ordinary prime; also historic 761.MP3",
  hypothesis: "literal solved-p56 phi(prime) inverse, start at prime761, no additional secret phase",
  sourcePage: 27,
  originalRunes: p27.length,
  independentlyPrintedRedHeadingLength: 19,
  allOriginalStart: initial,
  originalBodyStart: body,
  originalPage56SolvedStart2Control: solved,
  authenticPage57Positive761Plant: {
    sourceRunes: p57.length, totalKeyConsumed: plant.keyConsumed,
    inverseReachable: plantReach.endingKeyPositions.includes(plant.keyConsumed),
  },
  result: "Original p27 cannot be decoded by this source-selected totient key with ANY legal F-skip mask, even on the first page. No plaintext is claimed.",
}, null, 2));
