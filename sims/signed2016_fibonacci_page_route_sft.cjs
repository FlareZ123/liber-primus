"use strict";

/**
 * Source-locked page-route consequence of the authenticated 2016/2017 signed messages.
 *
 * The existing 2016 source analysis places four signed-message GP sums on one
 * Fibonacci decrement walk through ordinary prime indices ending at p_464=3301.
 * This SFT asks one narrower question: if the Fibonacci decrement values are
 * read literally as LP2 physical page numbers, what route is selected?
 *
 * It also tests the two most literal word-number readings on those pages:
 * use the current Fibonacci page number, or the next Fibonacci route number,
 * as a one-based word index. No cipher family, phase, scoring model, or key is
 * fitted to ciphertext.
 *
 * Run: node sims/signed2016_fibonacci_page_route_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(
  ROOT, "resources/lp2-transcription.txt"), "utf8");
const signed2016 = fs.readFileSync(path.join(
  ROOT, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const signed2017 = fs.readFileSync(path.join(
  ROOT, "resources/historical/cicada2017-yEiTHhvF.asc"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gp = new Map(corpus.translit.map((token, index) => [token, index]));
gp.set("ING", gp.get("NG"));
gp.set("IO", gp.get("IA"));
gp.set("K", gp.get("C"));
gp.set("V", gp.get("U"));
const tokens = [...gp.keys()].sort((a, b) => b.length - a.length);

/**
 * Encode historical Latin text under the exact GP spelling convention used
 * by the checked-in 2016 source analysis. Digits and punctuation are ignored.
 * @param {string} source
 * @returns {number[]}
 */
function encodeGP(source) {
  const letters = source.toUpperCase().replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < letters.length;) {
    const token = tokens.find((candidate) => letters.startsWith(candidate, offset));
    assert.ok(token, "Unmapped GP source at " + letters.slice(offset));
    out.push(gp.get(token));
    offset += token.length;
  }
  return out;
}

/**
 * Generate the first n ordinary primes.
 * @param {number} count
 * @returns {number[]}
 */
function primes(count) {
  const out = [];
  for (let value = 2; out.length < count; value++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= value; divisor++) {
      if (value % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) out.push(value);
  }
  return out;
}

/**
 * Return GP rune count and GP-prime sum.
 * @param {string} source
 * @returns {{runes:number, primeSum:number}}
 */
function measure(source) {
  const encoded = encodeGP(source);
  return {
    runes: encoded.length,
    primeSum: encoded.reduce((sum, index) => sum + corpus.prime[index], 0)
  };
}

/**
 * Convert one parsed rune word to compact diagnostics.
 * @param {{runes:string,startPage:number,endPage:number,length:number}|undefined} word
 * @returns {object|null}
 */
function wordInfo(word) {
  if (!word) return null;
  const indices = [...word.runes].map((rune) => runeIndex.get(rune));
  assert.ok(indices.every((index) => index !== undefined));
  return {
    runes: word.runes,
    translit: indices.map((index) => corpus.translit[index]).join(""),
    length: indices.length,
    primeSum: indices.reduce((sum, index) => sum + corpus.prime[index], 0),
    startPage: word.startPage,
    endPage: word.endPage
  };
}

function run() {
  const section1 =
    "Hello. The path lies empty; epiphany seeks the devoted. Liber Primus is the way.";
  const section2 =
    "Its words are the map, their meaning is the road, and their numbers are the direction.";
  const section3 =
    "Seek and you will be found. Good luck. 3301. Beware false paths. Verify OpenPGP 7A35090F.";
  assert.ok(signed2016.includes("Liber Primus is the way."));
  assert.ok(signed2016.includes("their numbers are the direction."));
  assert.ok(signed2016.includes("Verify OpenPGP 7A35090F."));

  const raw2016 = [section1, section2, section3].map(measure);
  assert.deepEqual(raw2016, [
    {runes: 59, primeSum: 2999},
    {runes: 59, primeSum: 2819},
    {runes: 59, primeSum: 2581}
  ]);
  const fPrime = corpus.prime[gp.get("F")];
  assert.equal(fPrime, 2);
  const adjusted2016 = [
    raw2016[0].primeSum + fPrime,
    raw2016[1].primeSum,
    raw2016[2].primeSum - fPrime
  ];
  assert.deepEqual(adjusted2016, [3001, 2819, 2579]);

  const warning2017 =
    "Beware false paths. Always verify PGP signature from 7A35090F. 3301.";
  assert.ok(signed2017.includes("Always verify PGP signature from 7A35090F."));
  const measured2017 = measure(warning2017);
  assert.deepEqual(measured2017, {runes: 45, primeSum: 2131});

  const primeList = primes(464);
  assert.equal(primeList[463], 3301);
  const fibonacci = [1, 1];
  while (fibonacci.length < 12) fibonacci.push(
    fibonacci.at(-1) + fibonacci.at(-2));

  const primeIndices = [464];
  for (const step of fibonacci) primeIndices.push(primeIndices.at(-1) - step);
  const primeValues = primeIndices.map((index) => primeList[index - 1]);
  assert.deepEqual(primeValues, [
    3301, 3299, 3271, 3257, 3229, 3191, 3119,
    3001, 2819, 2579, 2131, 1459, 457
  ]);

  const signedSums = [...adjusted2016, measured2017.primeSum];
  const selected = signedSums.map((sum) => {
    const walkPosition = primeValues.indexOf(sum);
    assert.ok(walkPosition > 0);
    return {
      gpPrimeSum: sum,
      primeIndex: primeIndices[walkPosition],
      fibonacciStep: fibonacci[walkPosition - 1]
    };
  });
  assert.deepEqual(selected.map((item) => item.fibonacciStep), [13, 21, 34, 55]);
  assert.deepEqual(selected.map((item) => item.primeIndex), [431, 410, 376, 321]);

  const pageRoute = selected.map((item) => item.fibonacciStep);
  const routePages = pageRoute.map((pageNumber) => {
    const page = corpus.pages.find((candidate) => candidate.page === pageNumber);
    assert.ok(page);
    assert.equal(page.status, "unsolved");
    return {page: pageNumber, runes: page.indices.length, status: page.status};
  });
  assert.deepEqual(routePages.map((page) => page.runes), [272, 273, 261, 76]);
  assert.equal(corpus.pages.find((page) => page.page === 56).status, "solved");
  assert.equal(corpus.pages.find((page) => page.page === 57).status, "solved");
  assert.ok(fibonacci.includes(89));
  assert.ok(89 > 57);

  const parsed = parseLP2Words(transcript, 57);
  const transcriptPageIndex = (physicalPage) => {
    const index = parsed.byStartPage.findIndex(
      (_, runeBearingIndex) => physicalLP2Page(runeBearingIndex) === physicalPage);
    assert.ok(index >= 0);
    return index;
  };
  const routeWordPages = pageRoute.map((page) =>
    parsed.byStartPage[transcriptPageIndex(page)]);
  const pageWordCounts = routeWordPages.map((words) => words.length);
  assert.deepEqual(pageWordCounts, [61, 55, 60, 16]);

  const currentNumberWords = routeWordPages.map((words, index) =>
    wordInfo(words[pageRoute[index] - 1]));
  const nextNumbers = [21, 34, 55, 89];
  const nextNumberWords = routeWordPages.map((words, index) =>
    wordInfo(words[nextNumbers[index] - 1]));

  assert.deepEqual(currentNumberWords.map((word) => word?.translit ?? null),
    ["YMFX", "PHSOE", "DNGEAA", null]);
  assert.deepEqual(nextNumberWords.map((word) => word?.translit ?? null),
    ["IAO", "AU", "YDSCIAX", null]);

  const result = {
    classification:
      "source-locked signed-message Fibonacci page selector; candidate route, no plaintext or key",
    source: {
      signed2016AdjustedSums: adjusted2016,
      signed2016RuneCounts: raw2016.map((section) => section.runes),
      signed2017: measured2017,
      prime464: primeList[463],
      primeWalk: primeIndices.map((primeIndex, index) => ({
        fibonacciStep: index === 0 ? null : fibonacci[index - 1],
        primeIndex,
        prime: primeValues[index]
      }))
    },
    selected: {
      matches: selected,
      physicalPageRoute: pageRoute,
      routePages,
      nextFibonacciValue: 89,
      stopReason: "89 exceeds the 0..57 physical LP2 page range; p56 and p57 are already solved"
    },
    literalWordNumberChecks: {
      pageWordCounts,
      currentPageNumberAsOneBasedWordIndex: currentNumberWords,
      nextRouteNumberAsOneBasedWordIndex: nextNumberWords,
      decision:
        "Both direct word-index readings terminate naturally at p55 but yield no readable instruction or key; do not tune indexing conventions without a new source clue."
    }
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) run();
module.exports = {encodeGP, primes, measure, wordInfo, run};
