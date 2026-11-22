"use strict";

// @ts-check
// One-file test: source-frozen LP1 SACRED prime ranks + authentic LP2 p56
// plaintext-F-transparent encryption. Reads only committed original inputs.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @param {number} bound
 * @returns {number[]}
 */
function primesThrough(bound) {
  const composite = new Uint8Array(bound + 1);
  /** @type {number[]} */
  const primes = [];
  for (let n = 2; n <= bound; n++) {
    if (composite[n]) continue;
    primes.push(n);
    if (n * n <= bound) {
      for (let k = n * n; k <= bound; k += n) composite[k] = 1;
    }
  }
  return primes;
}

/**
 * A plaintext-F bypass is permitted only when ciphertext itself is rune F=0.
 * A consumed step is never allowed to decrypt to plaintext F.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @returns {number} First zero-based impossible ciphertext offset, or -1.
 */
function firstImpossible(ciphertext, key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    for (const clock of states) {
      const plaintext = (c - sign * key[clock] % 29 + 58) % 29;
      if (plaintext !== 0) next.add(clock + 1);
      if (c === 0) next.add(clock);
    }
    if (next.size === 0) return i;
    states = next;
  }
  return -1;
}

/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @returns {number[]}
 */
function encryptWithTransparentF(plaintext, key) {
  let clock = 0;
  return plaintext.map((symbol) => {
    if (symbol === 0) return 0;
    const result = (symbol + key[clock]) % 29;
    clock++;
    return result;
  });
}

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const ranges = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const chapters = ranges.map(([lo, hi]) => corpus.pages.filter((p) => p.page >= lo && p.page <= hi).flatMap((p) => p.indices));
assert.equal(chapters.reduce((sum, p) => sum + p.length, 0), 12956);
assert.deepEqual(chapters.map((p) => p.length), [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

// The source-published LP1 clauses give prime ranks 147,175,203, separated
// by 28. Its original 1033-magic-square value is prime of rank 174.
// Those four ranks, not a language-optimized range, are the only start seeds.
const starts = [147, 174, 175, 203];
const longest = Math.max(...chapters.map((p) => p.length));
const maxOrdinal = Math.max(...starts) + 28 * longest;
const primes = primesThrough(1200000);
assert.ok(primes.length > maxOrdinal);
assert.deepEqual([primes[146], primes[173], primes[174], primes[202]], [853, 1033, 1039, 1237]);

// The actual first-party p56 prime-totient GP29 + F-skip encryption is a
// native, exact-byte positive: 85 out of 85 ciphertext runes must agree.
const runeIndex = new Map(corpus.runes.map((symbol, i) => [symbol, i]));
const solvedP56 = solved.sections.find((section) => section.name === "p56_an_end").source_text;
const plain56 = [...solvedP56].filter((c) => runeIndex.has(c)).map((c) => runeIndex.get(c));
const cipher56 = corpus.pages.find((p) => p.page === 56).indices;
assert.equal(plain56.length, 85);
const p56Key = Array.from({ length: 86 }, (_, i) => (primes[i] - 1) % 29);
assert.deepEqual(encryptWithTransparentF(plain56, p56Key), cipher56);
assert.equal(plain56.filter((c) => c === 0).length, 1);
assert.equal(firstImpossible(cipher56, p56Key, 1), -1);

/** @type {{start: number, mode: string, sign: number, firstImpossible: number[]}[]} */
const results = [];
for (const start of starts) {
  for (const mode of ["prime", "totient", "rank"]) {
    const key = Array.from({ length: longest + 1 }, (_, i) => {
      const ordinal = start + 28 * i;
      const q = primes[ordinal - 1];
      if (mode === "prime") return q % 29;
      if (mode === "totient") return (q - 1) % 29;
      return ordinal % 29;
    });
    for (const sign of [1, -1]) {
      const failures = chapters.map((p) => firstImpossible(p, key, sign));
      assert.ok(failures.every((offset) => offset >= 0), "original would have a complete legal plaintext");
      results.push({ start, mode, sign, firstImpossible: failures });
    }
  }
}
assert.equal(results.length, 24);
assert.equal(Math.max(...results.flatMap((r) => r.firstImpossible)), 553);
assert.deepEqual(results.find((r) => r.start === 147 && r.mode === "totient" && r.sign === 1).firstImpossible,
  [2, 49, 58, 156, 277, 32, 93, 21, 49]);
console.log(JSON.stringify({
  source: "Original LP2 physical p0-p55; 9 original visual chapters",
  sourceClausesPrimeRanks: [147, 175, 203],
  sourceSquarePrimeRank: 174,
  originalRunes: 12956,
  sourceChapters: ranges,
  nativeSolvedP56: "85/85 exact re-encryption, with one automatic plaintext F skip",
  models: results.length,
  everyModelImpossibleInEveryChapter: true,
  maxZeroBasedFirstFailure: 553,
  results
}, null, 2));
