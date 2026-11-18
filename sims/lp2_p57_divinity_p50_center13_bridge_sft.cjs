"use strict";

/**
 * Source-exact bridge:
 * solved p57 DIUINITY -> canonical GP0 sum 105 ->
 * unique p50 nested-bracket center cell 105 -> unique printed token "13".
 *
 * Also enumerates, without selecting a winner, the original red rune spans
 * that are immediately followed by a red 13-dot mark and are long enough
 * to possess a one-based 13th rune.
 *
 * Run: node sims/lp2_p57_divinity_p50_center13_bridge_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(
  read("resources/liber-primus/lp2-ink-annotations.json")
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);

function parseRuneWords(text) {
  const out = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(ch)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

function primePi(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = parseRuneWords(p57.source_text);
assert.equal(p57Words.length, 20);

const wordRows = p57Words.map((word) => ({
  text: word.map((value) => corpus.translit[value]).join(""),
  gp0: word.reduce((sum, value) => sum + value, 0),
  gp1: word.reduce((sum, value) => sum + value + 1, 0),
  prime: word.reduce((sum, value) => sum + corpus.prime[value], 0),
  length: word.length,
}));

const divinity = wordRows.find((row) => row.text === "DIUINITY");
assert.deepEqual(divinity, {
  text: "DIUINITY",
  gp0: 105,
  gp1: 113,
  prime: 376,
  length: 8,
});

assert.equal(tokens.length, 256);
assert.equal(grid.bytes[82], 201);
assert.equal(grid.bytes[128], 201);
assert.equal(128 - 82, primePi(201));
assert.equal(grid.bytes[83], 193);
assert.equal(grid.bytes[127], 193);
assert.equal(127 - 83, primePi(193));

const payloadLeft = 84;
const payloadRight = 126;
const payloadCenter = (payloadLeft + payloadRight) / 2;
assert.equal(payloadRight - payloadLeft + 1, 43);
assert.equal(payloadCenter, 105);
assert.equal(tokens[payloadCenter], "13");
assert.deepEqual(
  tokens.map((token, index) => token === "13" ? index : null)
    .filter((index) => index !== null),
  [105]
);

assert.deepEqual(
  wordRows.filter((row) => row.gp0 === payloadCenter)
    .map((row) => row.text),
  ["DIUINITY"]
);
assert.deepEqual(
  wordRows.filter((row) => row.gp1 === payloadCenter)
    .map((row) => row.text),
  []
);
assert.deepEqual(
  wordRows.filter((row) => row.prime === payloadCenter)
    .map((row) => row.text),
  []
);
assert.deepEqual(
  wordRows.filter((row) => row.prime % 256 === payloadCenter)
    .map((row) => row.text),
  []
);
assert.deepEqual(
  wordRows.filter((row) => row.length === payloadCenter)
    .map((row) => row.text),
  []
);

const adjacentRed13 = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    const end = span.start + span.length;
    const mark = (page.large_punctuation || []).find(
      (candidate) =>
        candidate[0] === end &&
        candidate[1] === 13 &&
        candidate[2] === "red"
    );
    if (!mark) continue;
    const values = [...span.runes].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    adjacentRed13.push({
      page: page.page,
      start: span.start,
      length: span.length,
      values,
    });
  }
}

const indexable = adjacentRed13
  .filter((row) => row.length >= 13)
  .map((row) => {
    const primeSum = row.values.reduce(
      (sum, value) => sum + corpus.prime[value],
      0
    );
    return {
      page: row.page,
      start: row.start,
      length: row.length,
      thirteenthIndex: row.values[12],
      thirteenthTranslit: corpus.translit[row.values[12]],
      thirteenthPrime: corpus.prime[row.values[12]],
      residual: row.length - 13,
      primeSum,
      primeSumIsPrime: isPrime(primeSum),
    };
  });

assert.deepEqual(
  indexable.map((row) => row.page),
  [0, 3, 7, 23, 27, 53]
);
assert.deepEqual(
  indexable.map((row) => row.primeSum),
  [662, 742, 766, 786, 1109, 2262]
);
assert.deepEqual(
  indexable.filter((row) => row.primeSumIsPrime)
    .map((row) => row.page),
  [27]
);
const p27 = indexable.find((row) => row.page === 27);
assert.ok(p27);
assert.equal(p27.thirteenthTranslit, "I");
assert.equal(p27.thirteenthPrime, 31);
assert.equal(p27.residual, 6);
assert.equal(p27.thirteenthPrime * p27.residual, 186);

console.log(JSON.stringify({
  status: "PASS: p57 DIUINITY GP0 sum lands on the unique p50 bracket center token 13",
  p57: {
    wordCount: wordRows.length,
    divinity,
    gp0CenterHits: wordRows
      .filter((row) => row.gp0 === payloadCenter)
      .map((row) => row.text),
    alternateOperandCenterHits: {
      gp1: wordRows.filter((row) => row.gp1 === payloadCenter)
        .map((row) => row.text),
      prime: wordRows.filter((row) => row.prime === payloadCenter)
        .map((row) => row.text),
      primeMod256: wordRows
        .filter((row) => row.prime % 256 === payloadCenter)
        .map((row) => row.text),
      length: wordRows.filter((row) => row.length === payloadCenter)
        .map((row) => row.text),
    },
  },
  bracket: {
    outer: [82, 128],
    inner: [83, 127],
    strictInterior: [payloadLeft, payloadRight],
    strictInteriorLength: 43,
    center: payloadCenter,
    centerPrintedToken: tokens[payloadCenter],
    centerTokenOccurrences: 1,
  },
  red13Consequence: {
    adjacentRedSpans: adjacentRed13.length,
    oneBased13IndexablePages: indexable.map((row) => row.page),
    candidates: indexable.map((row) => ({
      page: row.page,
      length: row.length,
      thirteenthTranslit: row.thirteenthTranslit,
      thirteenthPrime: row.thirteenthPrime,
      residual: row.residual,
      primeSum: row.primeSum,
      primeSumIsPrime: row.primeSumIsPrime,
    })),
    uniquePrimeSumPage: 27,
    p27Closure: "31 * 6 = 186",
  },
  interpretation:
    "The solved word DIUINITY uniquely reaches the independently selected p50 bracket center under canonical GP0 summation, where the table-global unique printed token is 13. Reading that visible 13 as a cue to red 13-dot punctuation is a downstream hypothesis, not a proved operator; if adopted, the original red-span/13-dot family that supports a one-based 13th-rune lookup is exactly pp0,3,7,23,27,53, with p27 alone having prime GP-prime sum.",
}, null, 2));
