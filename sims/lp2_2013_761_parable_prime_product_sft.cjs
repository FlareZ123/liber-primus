"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Independent 2013->2014 prime-Gematria arithmetic bridge.
 * Historical input: the 2013 Cicada OS 761.mp3 ID3 title and TXXX metadata
 * as documented in the cicada-solvers original ISO extraction archive.
 * Original LP2 p57 rune spellings and prime values are from the repo.
 * This is an arithmetic authorship constraint, not an unknown-page inverse.
 */
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/liber-primus/lp2-transcription.txt");
const expectedTitle = "The Instar Emergence";
const historicalFilename = 761;
const historicalID3Number = 1595277641;
const glyph = new Map(corpus.runes.map((r, i) => [r, i]));
const literalPage = original.split("%").at(-1);
assert(literalPage.includes("§"));
const printedSentences = literalPage.split(".").slice(1, 4);
assert.equal(printedSentences.length, 3);

/** @param {string} source @returns {number[]} */
function runeValues(source) {
  return [...source].filter(ch => glyph.has(ch)).map(ch => glyph.get(ch));
}
const clauses = printedSentences.map(runeValues);
assert.deepEqual(clauses.map(a => a.length), [30, 30, 28]);
const titleRuneIndices = runeValues(literalPage.split(".")[0]);
assert.equal(titleRuneIndices.length, 7);
const wholePage = titleRuneIndices.concat(...clauses);
assert.deepEqual(wholePage, corpus.pages.find(p => p.page === 57).indices);
assert.equal(wholePage.length, 95);

/** @param {number} number @returns {boolean} */
function isPrime(number) {
  if (number < 2) return false;
  for (let k = 2; k * k <= number; k++) if (number % k === 0) return false;
  return true;
}
const clauseSums = clauses.map(clause =>
  clause.reduce((sum, i) => sum + corpus.prime[i], 0));
assert.deepEqual(clauseSums, [1259, 1031, 1229]);
assert(clauseSums.every(isPrime));
assert.equal(clauseSums.reduce((a, b) => a * b, 1), historicalID3Number);

// Original Cicada OS metadata spellings are Latin letters. Use the same
// 29-rune convention that the clear printed PARABLE text uses (TH is a rune).
const units = corpus.translit.map((name, index) => ({ name, index }))
  .sort((a, b) => b.name.length - a.name.length);
const english = expectedTitle.toUpperCase().replace(/\s/g, "");
const titleUnits = [];
for (let i = 0; i < english.length;) {
  const token = units.find(x => english.startsWith(x.name, i));
  assert(token, "all title characters have source-native GP transliterations");
  titleUnits.push(token.index);
  i += token.name.length;
}
const titlePrimeSum = titleUnits.reduce((sum, index) => sum + corpus.prime[index], 0);
assert.equal(titlePrimeSum, historicalFilename);
assert(isPrime(historicalFilename));

// Archived 2013 onion TCP response controls are independently original-era.
// count THE INSTAR EMERGENCE -> 761+
// count PARABLE -> 449*
const printedParablePrimeSum = titleRuneIndices.reduce((sum, i) => sum + corpus.prime[i], 0);
assert.equal(printedParablePrimeSum, 449);
function reverseDecimal(n) {
  return Number(String(n).split("").reverse().join(""));
}
/** @param {number} n @returns {string} */
function tcpCountSuffix(n) {
  return !isPrime(n) ? "" : isPrime(reverseDecimal(n)) ? "+" : "*";
}
assert.equal(reverseDecimal(titlePrimeSum), 167);
assert.equal(reverseDecimal(printedParablePrimeSum), 944);
assert.equal(tcpCountSuffix(titlePrimeSum), "+");
assert.equal(tcpCountSuffix(printedParablePrimeSum), "*");
const archivedTcpResponses = {
  "count the instar emergence": String(titlePrimeSum) + tcpCountSuffix(titlePrimeSum),
  "count parable": String(printedParablePrimeSum) + tcpCountSuffix(printedParablePrimeSum)
};
assert.deepEqual(archivedTcpResponses, {
  "count the instar emergence": "761+",
  "count parable": "449*"
});
console.log(JSON.stringify({
  status: "PASS",
  primaryHistoricalArtifact: "Cicada OS, AUDIO/761.mp3 (2013)",
  archivalGitBlob: "7e2bd299fbc7b96283219cf15e2904641daf631f",
  historicalID3Title: expectedTitle,
  historicalMP3Name: "761.mp3",
  titlePrimeSum,
  originalPrintedParableTitlePrimeSum: printedParablePrimeSum,
  archivedTcpResponses,
  historicalID3TextLabel: "Parable 1,595,277,641",
  originalPrintedLP2Page: 57,
  originalRunesTotal: 95,
  parableClauseRuneCounts: clauses.map(c => c.length),
  parableClausePrimeSums: clauseSums,
  allClauseSumsPrime: true,
  product: historicalID3Number,
  recoveredUnknownPlaintext: false
}, null, 2));
