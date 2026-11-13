"use strict";

/**
 * One-file original-cipher test: use the 55 strict word interiors of solved
 * LP2 page 57 as per-page starts for the authentic page-56 prime-totient clock.
 * The exhaustive cursor DP admits every possible literal-F skip pattern.
 *
 * Run: node sims/lp2_p57_shed_primecursor_fskip_sft.cjs
 * Requires only the two checked-in canonical source files and Node.js 22.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const rawText = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8"
);

const runeMap = new Map(corpus.runes.map((rune, index) => [rune, index]));
const page57 = corpus.pages.find((page) => page.page === 57).indices;
const page56 = corpus.pages.find((page) => page.page === 56).indices;
const originalPages = corpus.pages.filter(
  (page) => page.page <= 55 && page.indices.length > 0
);
assert.equal(corpus.runes.length, 29);
assert.equal(originalPages.length, 55);
assert.equal(originalPages.reduce((n, page) => n + page.indices.length, 0), 12956);

const publishedWords = rawText.split("%")[56]
  .replace(/[/\r\n]/g, "")
  .split(/[-.&$§]/)
  .map((piece) => Array.from(piece).filter((rune) => runeMap.has(rune))
    .map((rune) => runeMap.get(rune)))
  .filter((word) => word.length > 0);

assert.deepEqual(publishedWords.map((word) => word.length),
  [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6]);
assert.deepEqual(publishedWords.flat(), page57);
assert.equal(publishedWords.length, 20);
assert.equal(page57.length, 95);

const shed = publishedWords.flatMap((word) => word.slice(1, -1));
assert.equal(shed.length, 55);
assert.equal(originalPages[49].page, 49);
assert.equal(originalPages[50].page, 51);

/**
 * @param {number} count
 * @returns {number[]}
 */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let isPrime = true;
    for (const prime of primes) {
      if (prime * prime > n) break;
      if (n % prime === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(n);
  }
  return primes;
}

const primeNumbers = firstPrimes(1024);
const totientKey = primeNumbers.map((prime) => (prime - 1) % 29);

/**
 * @param {number[]} cipher
 * @param {number} start
 * @returns {{feasible:boolean, firstContradiction:number|null, maxStates:number, terminalStates:number}}
 */
function allLiteralFPaths(cipher, start) {
  let states = new Set([start]);
  let maxStates = 1;
  for (let offset = 0; offset < cipher.length; offset++) {
    const next = new Set();
    const c = cipher[offset];
    for (const cursor of states) {
      if (c === 0) next.add(cursor); // literal F, does not consume key
      if (c !== totientKey[cursor]) next.add(cursor + 1); // non-F plaintext
    }
    if (next.size === 0) return {
      feasible: false, firstContradiction: offset, maxStates, terminalStates: 0
    };
    maxStates = Math.max(maxStates, next.size);
    states = next;
  }
  return {
    feasible: true, firstContradiction: null, maxStates,
    terminalStates: states.size
  };
}

/**
 * Minimum count of normally forbidden non-literal plaintext-F emissions,
 * with the original F skip choices otherwise free.
 *
 * @param {number[]} cipher
 * @param {number} start
 * @returns {number}
 */
function minimumInvalidEmissions(cipher, start) {
  let states = new Map([[start, 0]]);
  for (const c of cipher) {
    const next = new Map();
    for (const [cursor, cost] of states) {
      if (c === 0) {
        next.set(cursor, Math.min(cost, next.get(cursor) ?? Infinity));
      }
      const advanceCost = cost + Number(c === totientKey[cursor]);
      next.set(cursor + 1, Math.min(advanceCost,
        next.get(cursor + 1) ?? Infinity));
    }
    states = next;
  }
  return Math.min(...states.values());
}

/**
 * Use known solved-p57 GP text as a native plaintext plant.
 * A plaintext F is copied literally and does not consume the prime clock.
 *
 * @param {number} length
 * @param {number} start
 * @returns {number[]}
 */
function plantNative(length, start) {
  let cursor = start;
  const output = [];
  for (let i = 0; i < length; i++) {
    const plain = page57[i % page57.length];
    if (plain === 0) output.push(0);
    else output.push((plain + totientKey[cursor++]) % 29);
  }
  return output;
}

/**
 * @param {string} message
 * @returns {number[]}
 */
function encodeEnglishGP(message) {
  const tags = corpus.translit.map((tag, index) => ({tag, index}))
    .sort((a, b) => b.tag.length - a.tag.length);
  return message.toUpperCase().match(/[A-Z]+/g).flatMap((word) => {
    const norm = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    const symbols = [];
    for (let i = 0; i < norm.length;) {
      const found = tags.find((entry) => norm.startsWith(entry.tag, i));
      assert.ok(found, "unrecognized GP phoneme at " + word + ":" + i);
      symbols.push(found.index);
      i += found.tag.length;
    }
    return symbols;
  });
}

const knownPlain = encodeEnglishGP(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE"
);
assert.equal(knownPlain.length, 85);
assert.deepEqual(knownPlain.flatMap((x, i) => x === 0 ? [i] : []), [56]);
let consumed = 0;
for (let i = 0; i < 85; i++) {
  const plain = knownPlain[i];
  const expect = plain === 0 ? 0 : (plain + totientKey[consumed++]) % 29;
  assert.equal(page56[i], expect, "authentic p56 cipher rune at " + i);
}
assert.equal(consumed, 84);
assert.equal(allLiteralFPaths(page56, 0).feasible, true);
assert.equal(minimumInvalidEmissions(page56, 0), 0);
console.log("AUTHENTIC P56: 85/85 original ciphertext runes, one literal F at 56, 84 consumed primes.");

for (const seedType of ["index", "gp-prime-ordinal"]) {
  const rows = originalPages.map((page, ordinal) => {
    const sourceRune = shed[ordinal];
    const start = seedType === "index" ? sourceRune : corpus.prime[sourceRune] - 1;
    assert.equal(allLiteralFPaths(plantNative(page.indices.length, start), start).feasible,
      true, "source-shaped planted GP positive at page " + page.page);
    const reach = allLiteralFPaths(page.indices, start);
    const repairs = minimumInvalidEmissions(page.indices, start);
    assert.equal(reach.feasible, repairs === 0);
    return {page:page.page, start, length:page.indices.length, repairs, ...reach};
  });
  const feasiblePages = rows.filter((row) => row.feasible).map((row) => row.page);
  const failures = rows.filter((row) => !row.feasible).length;
  const sumRepairs = rows.reduce((total, row) => total + row.repairs, 0);
  const firstFailure = rows[0].firstContradiction;
  if (seedType === "index") {
    assert.deepEqual(feasiblePages, [43]);
    assert.equal(failures, 54);
    assert.equal(sumRepairs, 214);
    assert.equal(firstFailure, 49);
  } else {
    assert.deepEqual(feasiblePages, [49, 55]);
    assert.equal(failures, 53);
    assert.equal(sumRepairs, 179);
    assert.equal(firstFailure, 0);
  }
  console.log("MODEL", seedType,
    JSON.stringify({feasiblePages, failedPages:failures,
      minimumInvalidEmissions:sumRepairs, p0FirstContradiction:firstFailure,
      largestReachableSet:Math.max(...rows.map((row) => row.maxStates))}));
}


for (const candidateCount of [29, 110]) {
  const rows = originalPages.map((page) => {
    const workingStarts = [];
    for (let start = 0; start < candidateCount; start++) {
      if (allLiteralFPaths(page.indices, start).feasible) workingStarts.push(start);
    }
    return {page:page.page, workingStarts};
  });
  const impossible = rows.filter((row) => row.workingStarts.length === 0)
    .map((row) => row.page);
  assert.equal(impossible.length, candidateCount === 29 ? 34 : 20);
  if (candidateCount === 29) assert.ok(impossible.includes(0));
  else assert.deepEqual(rows[0].workingStarts, [107, 109]);
  console.log("ALL-SECRET CURSOR SUPSET", candidateCount,
    JSON.stringify({impossiblePageCount:impossible.length,
      impossiblePages:impossible,
      p0FeasibleStarts:rows[0].workingStarts}));
}

console.log("PASS: all original-source invariants, authentic p56 and native plants.");
