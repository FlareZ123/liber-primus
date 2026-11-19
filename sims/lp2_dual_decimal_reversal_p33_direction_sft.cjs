"use strict";

/**
 * SFT for the dual decimal-reversal direction bridge:
 * WAY -> p13:3 -> 133 -> reverse -> 331 -> p33:1,
 * with p33's source-visible 1033/3301 reversal as an independent confirmation.
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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const historicalHtml = read("resources/cicada2014-onion7-index.html");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
parts.splice(50, 0, ""); // physical p50 is the non-rune numerical table

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

/** @param {number} page */
function lineStarts(page) {
  let runeOffset = 0;
  const lines = [];
  for (const physicalLine of parts[page].split("/")) {
    const length = [...physicalLine].filter((char) => runeIndex.has(char)).length;
    if (!length) continue;
    lines.push({
      line: lines.length + 1,
      start: runeOffset,
      length,
    });
    runeOffset += length;
  }
  return lines;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let factor = 2; factor * factor <= n; factor += 1) {
    if (n % factor === 0) return false;
  }
  return true;
}

/** @param {number} limit */
function primesBelow(limit) {
  const out = [];
  for (let n = 2; n < limit; n += 1) {
    if (isPrime(n)) out.push(n);
  }
  return out;
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

// Parse the authenticated natural-language 2016 body.
const bodyStart = signed2016.indexOf("Hello.");
const signatureStart = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(bodyStart >= 0 && signatureStart > bodyStart);
const body = signed2016
  .slice(bodyStart, signatureStart)
  .replace(/\b7A35090F\b/g, "");
const words = (body.match(/[A-Za-z]+/g) || []).map((word) => word.toUpperCase());
assert.equal(words.length, 43);

const theIndices = words
  .map((word, index) => word === "THE" ? index : null)
  .filter((index) => index !== null);
assert.deepEqual(theIndices, [1, 7, 12, 17, 22, 28]);

const followers = theIndices.map((theIndex) => ({
  theIndex,
  followerIndex: theIndex + 1,
  follower: words[theIndex + 1],
}));
assert.deepEqual(
  followers.map(({followerIndex, follower}) => [followerIndex, follower]),
  [
    [2, "PATH"],
    [8, "DEVOTED"],
    [13, "WAY"],
    [18, "MAP"],
    [23, "ROAD"],
    [29, "DIRECTION"],
  ]
);

// The historical labels are visibly paired and exact decimal reversals.
assert.match(historicalHtml, /<title>133<\/title>/);
assert.match(historicalHtml, /<div id="331">/);
assert.equal([..."133"].reverse().join(""), "331");

// Charge the same fixed line e=3 for all authenticated THE followers.
// Serialize page as two decimal digits plus one line digit, then reverse.
const reversalFamily = followers.map(({followerIndex, follower}) => {
  const code = String(followerIndex).padStart(2, "0") + String(e);
  const reversed = [...code].reverse().join("");
  const destinationPage = Number(reversed.slice(0, 2));
  const destinationLine = Number(reversed[2]);

  const destinationLines = destinationLine > 0
    ? lineStarts(destinationPage)
    : [];
  const line = destinationLines.find((candidate) =>
    candidate.line === destinationLine
  ) || null;

  const annotation = ink.pages.find((page) => page.page === destinationPage);
  const redAtLineStart = line
    ? (annotation?.red_spans || []).find((span) => span.start === line.start) || null
    : null;

  return {
    follower,
    sourcePage: followerIndex,
    sourceLine: e,
    code,
    reversed,
    destinationPage,
    destinationLine,
    valid: Boolean(line),
    destinationRuneStart: line?.start ?? null,
    destinationLineLength: line?.length ?? null,
    redAtLineStart: redAtLineStart
      ? {start: redAtLineStart.start, length: redAtLineStart.length}
      : null,
  };
});

assert.deepEqual(reversalFamily, [
  {
    follower: "PATH",
    sourcePage: 2,
    sourceLine: 3,
    code: "023",
    reversed: "320",
    destinationPage: 32,
    destinationLine: 0,
    valid: false,
    destinationRuneStart: null,
    destinationLineLength: null,
    redAtLineStart: null,
  },
  {
    follower: "DEVOTED",
    sourcePage: 8,
    sourceLine: 3,
    code: "083",
    reversed: "380",
    destinationPage: 38,
    destinationLine: 0,
    valid: false,
    destinationRuneStart: null,
    destinationLineLength: null,
    redAtLineStart: null,
  },
  {
    follower: "WAY",
    sourcePage: 13,
    sourceLine: 3,
    code: "133",
    reversed: "331",
    destinationPage: 33,
    destinationLine: 1,
    valid: true,
    destinationRuneStart: 0,
    destinationLineLength: 18,
    redAtLineStart: {start: 0, length: 10},
  },
  {
    follower: "MAP",
    sourcePage: 18,
    sourceLine: 3,
    code: "183",
    reversed: "381",
    destinationPage: 38,
    destinationLine: 1,
    valid: true,
    destinationRuneStart: 0,
    destinationLineLength: 23,
    redAtLineStart: null,
  },
  {
    follower: "ROAD",
    sourcePage: 23,
    sourceLine: 3,
    code: "233",
    reversed: "332",
    destinationPage: 33,
    destinationLine: 2,
    valid: true,
    destinationRuneStart: 18,
    destinationLineLength: 16,
    redAtLineStart: null,
  },
  {
    follower: "DIRECTION",
    sourcePage: 29,
    sourceLine: 3,
    code: "293",
    reversed: "392",
    destinationPage: 39,
    destinationLine: 2,
    valid: true,
    destinationRuneStart: 23,
    destinationLineLength: 22,
    redAtLineStart: null,
  },
]);

const redDestinationHits = reversalFamily.filter((row) => row.redAtLineStart);
assert.equal(redDestinationHits.length, 1);
assert.equal(redDestinationHits[0].follower, "WAY");
assert.equal(redDestinationHits[0].reversed, "331");

// Full unknown-page red-start control.
const redStarts = ink.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => (page.red_spans || [])
    .filter((span) => span.start === 0)
    .map((span) => ({page: page.page, length: span.length})));
assert.deepEqual(redStarts, [
  {page: 0, length: 13},
  {page: 3, length: 16},
  {page: 8, length: 12},
  {page: 15, length: 9},
  {page: 23, length: 16},
  {page: 27, length: 19},
  {page: 33, length: 10},
  {page: 40, length: 8},
  {page: 54, length: 9},
]);

// The source-visible p33/p34-39 cuneiform motif is canonically transcribed
// in the repository as decimal 1033 / 3301. Test the exact reversal relation.
const cuneiform = [1033, 3301];
assert.equal(
  Number([...String(cuneiform[0])].reverse().join("")),
  cuneiform[1]
);

// Secondary finite number-theory cross-check from the already established
// cuneiform pair. It is not used to select p33 or the reversal operation.
const primes = primesBelow(10000);
const primeRank = new Map(primes.map((prime, index) => [prime, index + 1]));
const reversibleFourDigitPrimePairs = [];
for (const prime of primes) {
  if (prime < 1000 || prime > 9999) continue;
  const reversed = Number([...String(prime)].reverse().join(""));
  if (reversed <= prime || reversed < 1000) continue;
  if (!primeRank.has(reversed)) continue;

  reversibleFourDigitPrimePairs.push({
    prime,
    reversed,
    rankPrime: primeRank.get(prime),
    rankReversed: primeRank.get(reversed),
  });
}
assert.equal(reversibleFourDigitPrimePairs.length, 102);

const bothRanksMultiple29 = reversibleFourDigitPrimePairs.filter((pair) =>
  pair.rankPrime % 29 === 0 &&
  pair.rankReversed % 29 === 0
);
assert.deepEqual(bothRanksMultiple29, [
  {
    prime: 1033,
    reversed: 3301,
    rankPrime: 174,
    rankReversed: 464,
  },
]);

console.log(JSON.stringify({
  status: "PASS",
  historical: {
    selectedCode: "133",
    pairedId: "331",
    exactReversal: true,
  },
  reversalFamily,
  uniqueRedDestination: redDestinationHits[0],
  unknownPageRedStarts: redStarts,
  p33Confirmation: {
    cuneiform,
    exactReversal: true,
    fourDigitReversiblePrimePairs: reversibleFourDigitPrimePairs.length,
    bothPrimeRanksMultiplesOf29: bothRanksMultiple29,
  },
  decision:
    "The fixed decimal-reversal operation maps independently selected 133 to p33:1. Across all six THE-follower line-3 coordinates, this is the only reversed destination beginning at a recorded red span. P33 independently carries the source-visible reversal pair 1033/3301. Promote reversal as a source-supported navigation direction, without inferring a p33 cipher inverse.",
}, null, 2));
