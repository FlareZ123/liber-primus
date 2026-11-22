"use strict";
/**
 * Original LP2 p15 first-unprinted Fibonacci prime → p42 full word
 * → real 2014 Stage10 magic-square center 91, with a single p56-
 * authentic receiver seeded by source number 91 at original word start.
 *
 * Scientific status: the cross-artifact center match was POST-NOTICED.
 * A matching numeric value is not proof of an intended cipher. The
 * finite inverse test excludes only this single exact receiver.
 *
 * Windows Node.js 22:
 * node sims/lp2_p15_f17_to_p42_pnw_2014_center91_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}
/** @param {number} n */
function fibonacci(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
/** @param {number} count */
function firstPrimes(count) {
  const limit = 60000;
  const marked = new Uint8Array(limit + 1);
  const result = [];
  for (let p = 2; p <= limit; p++) {
    if (marked[p]) continue;
    result.push(p);
    for (let j = p * p; j <= limit; j += p) marked[j] = 1;
    if (result.length >= count) break;
  }
  assert.equal(result.length, count);
  return result;
}
/**
 * Preserve every legitimate original p56 F bypass interpretation.
 * There are no guessed plaintext symbols, phases or language scorers.
 * @param {number[]} ciphertext
 * @param {number[]} primes
 * @param {number} startOrdinal One-based next prime ordinal
 */
function transparentFTotient(ciphertext, primes, startOrdinal) {
  let states = new Set([0]);
  for (let offset = 0; offset < ciphertext.length; offset++) {
    const next = new Set();
    for (const consumed of states) {
      if (ciphertext[offset] === 0) next.add(consumed);
      const prime = primes[startOrdinal + consumed - 1];
      assert.notEqual(prime, undefined);
      const key = (prime - 1) % 29;
      const plaintext = (ciphertext[offset] - key + 29) % 29;
      if (plaintext !== 0) next.add(consumed + 1);
    }
    if (next.size === 0) return {
      possible: false,
      firstFailureOffset: offset,
      statesBefore: [...states]
    };
    states = next;
  }
  return { possible: true, endStates: [...states] };
}
const original = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const table = read("resources/cicada2014-openpuff-magic-squares.txt");
const printedSquares = table.trim().split(/\n\s*\n/g).map(block => block.trim()
  .split(/\r?\n/g).map(line => line.trim().split(/\s+/g).map(Number)));
assert.equal(printedSquares.length, 3);
assert.deepEqual(printedSquares.map(square => square[Math.floor(square.length / 2)][Math.floor(square.length / 2)]), [809, 331, 91]);
assert.deepEqual(printedSquares.map(square => square[0].reduce((a, b) => a + b, 0)), [3301, 1033, 1033]);

const primes = firstPrimes(5000);
assert.equal(fibonacci(17), 1597);
assert.equal(primes[1597], 13477);
const futurePosition = Math.abs(3301 - primes[fibonacci(17)]);
assert.equal(futurePosition, 10176);

const segments = text.split("%").slice(0, 55);
assert.equal(segments.length, 55);
const runeToIndex = new Map(original.runes.map((r, i) => [r, i]));
const tokens = [];
let globalOffset = 0;
for (let segment = 0; segment < segments.length; segment++) {
  // Original page 50 contains only numerical table characters. Its
  // zero-rune blank is omitted in the runic-only transcription.
  const page = segment < 50 ? segment : segment + 1;
  const normalized = segments[segment]
    .replace(/\/\s*\n/g, "")
    .replace(/\s+/g, "");
  let localOffset = 0;
  for (const m of normalized.matchAll(/[\u16a0-\u16ff]+/gu)) {
    const indices = Array.from(m[0], rune => runeToIndex.get(rune));
    assert.ok(indices.every(n => Number.isInteger(n)));
    tokens.push({
      globalStart: globalOffset + localOffset + 1,
      page,
      localStart: localOffset,
      gp: indices.map(i => original.translit[i]).join(""),
      length: indices.length,
      gpPrimeSum: indices.reduce((total, i) => total + original.prime[i], 0),
      indices
    });
    localOffset += indices.length;
  }
  assert.equal(localOffset, original.pages[page].indices.length, "source page rune count");
  globalOffset += localOffset;
}
assert.equal(globalOffset, 12956);

const printedFIndices = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const originalSpiral = [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
];
assert.deepEqual(printedFIndices.map(n => Math.abs(3301 - primes[n])), originalSpiral);
const containingWord = globalOneBased => tokens.find(w =>
  w.globalStart <= globalOneBased &&
  globalOneBased < w.globalStart + w.length
);
const printedLookup = originalSpiral.map(position => {
  const word = containingWord(position);
  assert.ok(word);
  return {position, word: word.gp, sum: word.gpPrimeSum};
});
assert.ok(printedLookup.every(w => ![809,331,91].includes(w.sum)));
const circularExtensions = [18,19].map(n => {
  const difference = Math.abs(3301 - primes[fibonacci(n)]);
  const wrapped = (difference - 1) % 12956 + 1;
  const word = containingWord(wrapped);
  assert.ok(word);
  return {F_index: n, difference, wrapped, word: word.gp,
    primeSum: word.gpPrimeSum};
});
assert.deepEqual(circularExtensions, [
  {F_index:18,difference:19866,wrapped:6910,word:"IEPEAH",primeSum:273},
  {F_index:19,difference:36490,wrapped:10578,word:"JXSJ",primeSum:174}
]);

const center91Words = tokens.filter(w => w.gpPrimeSum === 91);
assert.equal(tokens.length, 2928); // maximal source rune runs, including open word fragments
assert.equal(center91Words.length, 6);
assert.equal(center91Words.filter(w => w.length === 3).length, 3);
const selected = tokens.filter(w => w.globalStart === futurePosition);
assert.equal(selected.length, 1);
const token = selected[0];
assert.equal(token.page, 42);
assert.equal(token.localStart, 31);
assert.equal(token.gp, "PNW");
assert.deepEqual(token.indices, [13, 9, 7]);
assert.deepEqual(token.indices.map(i => original.prime[i]), [43, 29, 19]);
assert.equal(token.gpPrimeSum, 91);

const p56Positive = transparentFTotient(original.pages[56].indices, primes, 1);
assert.equal(p56Positive.possible, true);
assert.ok(p56Positive.endStates.includes(84), "actual solved p56 consumes 84 primes");

const p42Suffix = original.pages[42].indices.slice(token.localStart);
assert.equal(p42Suffix.length, 241);
const p42FromCenter91 = transparentFTotient(p42Suffix, primes, 91);
assert.deepEqual(p42FromCenter91, {
  possible: false,
  firstFailureOffset: 28,
  statesBefore: [28]
});
assert.equal(p42Suffix[p42FromCenter91.firstFailureOffset], 14);
assert.equal(primes[118], 653);
assert.equal((primes[118] - 1) % 29, 14);
console.log(JSON.stringify({
  new_plaintext: false,
  source_square_centers: [809,331,91],
  first_unprinted_F: 1597,
  p1598: 13477,
  p15_continuation_global_position: futurePosition,
  original_unknown_runes: globalOffset,
  maximal_original_wordlike_runs: tokens.length,
  no_center_matches_from_sixteen_printed_addresses: printedLookup.every(w => ![809,331,91].includes(w.sum)),
  circular_extensions_after_first_unprinted: circularExtensions,
  whole_runs_summing_to_91: center91Words.map(w => ({
    start: w.globalStart, page: w.page, gp: w.gp, length: w.length
  })),
  selected: {
    page: token.page,
    local_zero_based_offset: token.localStart,
    full_word: token.gp,
    gp_prime_values: [43,29,19],
    sum: 91
  },
  exact_p42_receiver: {
    origin: "at PNW",
    seed: "one-based prime ordinal 91 from source Wisdom center",
    p56_positive_control: "PASS",
    result: p42FromCenter91,
    first_failure_original_global_rune: futurePosition + 28,
    forced_F_conflict: "cipher X index14 minus phi(prime119=653) mod29 index14 forces plaintext F; authentic F is literal"
  },
  inference_warning: "The 91 comparison and prime-ordinal receiver are retrospective and unauthenticated."
}, null, 2));
console.log("PASS: source-locked p15 to original p42 to 2014 center91; selected p56 receiver impossible.");
