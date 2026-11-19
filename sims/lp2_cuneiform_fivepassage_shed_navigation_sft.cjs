#!/usr/bin/env node
"use strict";

/*
 * Source-selected SHED transfer of the five red-numbered cuneiform passages.
 *
 * The word-level circumference-shedding operation is inherited unchanged
 * from the solved p57 instruction and the p49/p55 transfer. The p50 lookup
 * is the existing 256-cell/base59 consumer. The final page-ordinal reading
 * is explicitly a hypothesis: direct one-based page number for 1..58, or
 * one-based prime rank for a larger prime. This script preserves the raw
 * values and does not claim a plaintext decryption.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");

const raw = fs.readFileSync("resources/lp2-transcription.txt", "utf8").replace(/\r/g, "");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const grid = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json", "utf8"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const segments = raw.split("%").slice(0, 55);
assert.equal(segments.length, 55, "the transcription must expose the 55 source pages used by the corpus");

function parsePage(segment) {
  let runeOffset = 0;
  let current = [];
  let currentStart = 0;
  const words = [];

  function finishWord() {
    if (current.length) {
      words.push({ start: currentStart, end: runeOffset, values: current.slice() });
      current = [];
    }
  }

  for (const ch of segment) {
    if (runeIndex.has(ch)) {
      if (!current.length) currentStart = runeOffset;
      current.push(runeIndex.get(ch));
      runeOffset += 1;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line-wrap slashes and whitespace do not end a word.
    } else {
      finishWord();
    }
  }
  finishWord();
  return { runeCount: runeOffset, words };
}

const pages = segments.map(parsePage);
for (const page of [36, 37, 38]) {
  assert.equal(
    pages[page].runeCount,
    corpus.pages[page].indices.length,
    "source transcription and canonical corpus rune counts disagree on p" + page
  );
}

const passageSpecs = [
  { number: 1, parts: [{ page: 36, start: 99, end: 238 }] },
  { number: 2, parts: [{ page: 37, start: 0, end: 91 }] },
  { number: 3, parts: [{ page: 37, start: 91, end: 189 }] },
  { number: 4, parts: [{ page: 37, start: 189, end: 228 }, { page: 38, start: 0, end: 57 }] },
  { number: 5, parts: [{ page: 38, start: 57, end: 186 }] }
];

function recursiveCenter(values) {
  let remaining = values.slice();
  while (remaining.length > 1) remaining = remaining.slice(1, -1);
  return remaining.length ? remaining[0] : null;
}

const tableTokens = grid.pages.flatMap(page => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");
assert.equal(tableTokens.length, 256, "the source p50 table must contain 256 cells");
assert.equal(alphabet59.length, 59, "the established base59 alphabet must have 59 symbols");

function base59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.notEqual(high, -1, "unknown high base59 digit");
  assert.notEqual(low, -1, "unknown low base59 digit");
  return 59 * high + low;
}

function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

function primeRank(n) {
  assert.ok(isPrime(n), "primeRank requires a prime");
  let rank = 0;
  for (let candidate = 2; candidate <= n; candidate += 1) {
    if (isPrime(candidate)) rank += 1;
  }
  return rank;
}

function candidatePageOrdinal(value) {
  if (value >= 1 && value <= 58) return value;
  if (isPrime(value)) return primeRank(value);
  return null;
}

const expectedWordCounts = [30, 20, 25, 19, 28];
const expectedRuneLengths = [139, 91, 98, 96, 129];
const expectedCoreCounts = [17, 7, 12, 10, 17];
const expectedCoreSums = [199, 95, 160, 188, 271];
const expectedTokens = ["0l", "0Z", "3r", "0c", null];
const expectedBase59 = [46, 35, 229, 38, null];
const expectedPageOrdinals = [46, 35, 50, 38, 58];

const results = passageSpecs.map(spec => {
  const selectedWords = [];
  let runeLength = 0;

  for (const part of spec.parts) {
    assert.ok(part.start >= 0 && part.end > part.start, "invalid source passage boundary");
    assert.ok(part.end <= pages[part.page].runeCount, "passage boundary exceeds source page");
    runeLength += part.end - part.start;

    const overlapping = pages[part.page].words.filter(
      word => word.start < part.end && word.end > part.start
    );
    for (const word of overlapping) {
      assert.ok(
        word.start >= part.start && word.end <= part.end,
        "a red-numbered passage boundary cuts a complete printed word"
      );
      selectedWords.push(word.values);
    }
  }

  const centers = selectedWords.map(recursiveCenter).filter(value => value !== null);
  const centerSum = centers.reduce((sum, value) => sum + value, 0);
  const token = centerSum < tableTokens.length ? tableTokens[centerSum] : null;
  const tableValue = token === null ? null : base59(token);

  // The p50 table is not wrapped or reduced modulo 256. If the center sum
  // is outside its 256 cells, retain the raw sum for the prime-rank check.
  const routedValue = tableValue === null ? centerSum : tableValue;
  const pageOrdinal = candidatePageOrdinal(routedValue);

  return {
    passage: spec.number,
    parts: spec.parts,
    runeLength,
    wordCount: selectedWords.length,
    wordLengths: selectedWords.map(word => word.length),
    coreCount: centers.length,
    centers,
    centerLetters: centers.map(index => corpus.translit[index]),
    centerSum,
    p50Token: token,
    base59Value: tableValue,
    routedValue,
    routedValuePrimeRank: isPrime(routedValue) ? primeRank(routedValue) : null,
    candidatePageOrdinal: pageOrdinal,
    candidatePhysicalPage: pageOrdinal === null ? null : pageOrdinal - 1,
    candidateArchiveScan: pageOrdinal === null ? null : pageOrdinal + 16,
    rawSumPrimeRank: isPrime(centerSum) ? primeRank(centerSum) : null
  };
});

assert.deepEqual(results.map(result => result.runeLength), expectedRuneLengths);
assert.deepEqual(results.map(result => result.wordCount), expectedWordCounts);
assert.deepEqual(results.map(result => result.coreCount), expectedCoreCounts);
assert.deepEqual(results.map(result => result.centerSum), expectedCoreSums);
assert.deepEqual(results.map(result => result.p50Token), expectedTokens);
assert.deepEqual(results.map(result => result.base59Value), expectedBase59);
assert.deepEqual(results.map(result => result.candidatePageOrdinal), expectedPageOrdinals);
assert.deepEqual(results.map(result => result.candidatePhysicalPage), [45, 34, 49, 37, 57]);
assert.deepEqual(results.map(result => result.candidateArchiveScan), [62, 51, 66, 54, 74]);

// Independent arithmetic cross-checks against the repository's GP29 alphabet.
const translitIndex = new Map(corpus.translit.map((symbol, index) => [symbol, index]));
function gp0Word(symbols) {
  return symbols.reduce((sum, symbol) => {
    assert.ok(translitIndex.has(symbol), "missing GP29 transliteration " + symbol);
    return sum + translitIndex.get(symbol);
  }, 0);
}
const wordChecks = {
  ARE: gp0Word(["A", "R", "E"]),
  BE: gp0Word(["B", "E"]),
  WITHIN: gp0Word(["W", "I", "TH", "I", "N"])
};
assert.deepEqual(wordChecks, { ARE: 46, BE: 35, WITHIN: 38 });
assert.equal(primeRank(199), 46, "passage 1 raw sum independently points to page 46");
assert.equal(primeRank(229), 50, "passage 3 p50 value points to page 50");
assert.equal(primeRank(271), 58, "passage 5 raw sum points to the 58th page");

console.log(JSON.stringify({
  interpretation: {
    status: "provisional page-navigation hypothesis, not a decipherment",
    pageCount: 58,
    rule: "use p50/base59 when the SHED sum is within 256 cells; otherwise retain the raw sum; values 1..58 are one-based page ordinals, larger primes map to one-based prime rank",
    candidatePageOrdinals: expectedPageOrdinals,
    candidatePhysicalPages: [45, 34, 49, 37, 57],
    archiveScans: [62, 51, 66, 54, 74],
    noModuloOrWrap: true
  },
  wordChecks,
  passages: results
}, null, 2));
