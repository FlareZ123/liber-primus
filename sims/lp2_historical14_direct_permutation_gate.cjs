#!/usr/bin/env node
"use strict";

// Apply the exact recovered 2014 14-position row permutation to original
// LP2 p0-p55, without adding the already-known p56 totient layer.
// This is a source-motivated transfer test, not an authenticated LP2 cipher.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  rowPermute,
  trainNativeGP,
  languageScore
} = require("./historical_solve_path_transfer.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const model = trainNativeGP(read("resources/control/emerson_essays_2944.txt"));

const ORDER = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
const INVERSE = ORDER.map((_, i) => ORDER.indexOf(i));
assert.deepEqual(INVERSE, [11, 3, 0, 10, 7, 8, 12, 9, 1, 2, 13, 6, 4, 5]);

// The 2014 solved 70-character message is the authentic operation control.
const HISTORICAL_70 =
  "IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ";
const EXPECTED_70 =
  "GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO";
assert.equal(HISTORICAL_70.length, 70);
assert.equal(EXPECTED_70.length, 70);
assert.equal(rowPermute([...HISTORICAL_70], ORDER).join(""), EXPECTED_70);
assert.equal(rowPermute([...EXPECTED_70], INVERSE).join(""), HISTORICAL_70);

const pages = corpus.pages.filter(page => page.page < 56 && page.indices.length > 0);
assert.equal(pages.length, 55);
const runeCount = pages.reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(runeCount, 12956);
const joined = pages.flatMap(page => page.indices);
const p56 = corpus.pages.find(page => page.page === 56).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;

function score(values) {
  return languageScore(values, model);
}
function roundTrip(values) {
  return rowPermute(rowPermute(values, ORDER), INVERSE);
}
function pageReset(order) {
  return pages.flatMap(page => rowPermute(page.indices, order));
}
function preview(values, limit = 100) {
  return values.slice(0, limit).map(index => corpus.translit[index]).join("");
}

const rawScore = score(joined);
const pageForward = pageReset(ORDER);
const pageInverse = pageReset(INVERSE);
const bookForward = rowPermute(joined, ORDER);
const bookInverse = rowPermute(joined, INVERSE);

for (const page of pages) {
  assert.deepEqual(roundTrip(page.indices), page.indices);
  assert.deepEqual(
    rowPermute(rowPermute(page.indices, INVERSE), ORDER),
    page.indices
  );
}
assert.deepEqual(roundTrip(joined), joined);
assert.deepEqual(
  rowPermute(rowPermute(joined, INVERSE), ORDER),
  joined
);

const pageScores = pages.map(page => ({
  page: page.page,
  runes: page.indices.length,
  tailUnpermuted: page.indices.length % 14,
  raw: score(page.indices),
  forward: score(rowPermute(page.indices, ORDER)),
  inverse: score(rowPermute(page.indices, INVERSE))
}));
const bestForwardPage = pageScores.reduce((best, item) =>
  item.forward > best.forward ? item : best);
const bestInversePage = pageScores.reduce((best, item) =>
  item.inverse > best.inverse ? item : best);

const result = {
  classification: "bounded direct historical-operation transfer; no LP2 plaintext",
  sourceOperation: {
    width: 14,
    order: ORDER,
    inverse: INVERSE,
    historicalCiphertext70: HISTORICAL_70,
    historicalPlaintext70: EXPECTED_70,
    exactHistoricalPositive: true
  },
  originalInput: {
    physicalPages: pages.length,
    runes: runeCount,
    sourceOrder: "physical page order p0-p55; p50 is the rune-free numeric table and contributes no GP symbols",
    pageResetTailRule: "each physical rune page starts a new 14-symbol row; incomplete tail remains unchanged",
    continuousTailRule: "one 14-symbol row clock across all rune-bearing pages; final incomplete tail remains unchanged",
    pageTailRemainders: pageScores.map(({ page, tailUnpermuted }) => ({ page, tailUnpermuted })),
    continuousTailUnpermuted: joined.length % 14
  },
  languageScoresPerRune: {
    rawBook: rawScore,
    pageResetForward: score(pageForward),
    pageResetInverse: score(pageInverse),
    bookContinuousForward: score(bookForward),
    bookContinuousInverse: score(bookInverse),
    solvedP56CiphertextControl: score(p56),
    solvedP57PlaintextControl: score(p57)
  },
  strongestPageReadouts: {
    forward: {
      page: bestForwardPage.page,
      score: bestForwardPage.forward,
      preview: preview(rowPermute(
        pages.find(page => page.page === bestForwardPage.page).indices, ORDER
      ))
    },
    inverse: {
      page: bestInversePage.page,
      score: bestInversePage.inverse,
      preview: preview(rowPermute(
        pages.find(page => page.page === bestInversePage.page).indices, INVERSE
      ))
    }
  },
  pageScores,
  exactForwardInverseRoundTrips: true,
  status: "all four source-frozen LP2 transfers remain ciphertext-like; the direct 14-position permutation alone is not the LP2 decipherment"
};
console.log(JSON.stringify(result, null, 2));
