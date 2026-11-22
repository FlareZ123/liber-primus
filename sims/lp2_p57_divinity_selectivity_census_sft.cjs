"use strict";

/**
 * Director #1497: frozen p57 circumference selectivity census.
 *
 * Applies exactly one operation to every complete p57 word:
 *   1. shed first and last rune;
 *   2. GP-prime-sum the strict interior and the shed endpoints;
 *   3. when both sums are 0..255, read those row-major p50 cells;
 *   4. concatenate the two printed two-character cell tokens in inner/outer order.
 *
 * Run:
 *   node sims/lp2_p57_divinity_selectivity_census_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "external", "relikd-solved-gp29-native-v1.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const historical2013 = fs.readFileSync(
  path.join(root, "resources", "external", "2013-tcp-server-signed-source.md"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const cells = grid.pages.flatMap((page) => page.tokens);

function parseRuneWords(text) {
  const words = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n\r\t".includes(ch)) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

function primeSum(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

function translit(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

function analyzeWord(word) {
  if (word.length < 2) {
    return {
      word: translit(word),
      length: word.length,
      addressable: false,
      ineligible: "length<2"
    };
  }
  const innerAddress = primeSum(word.slice(1, -1));
  const outerAddress = primeSum([word[0], word[word.length - 1]]);
  const addressable = innerAddress >= 0 && innerAddress < cells.length &&
    outerAddress >= 0 && outerAddress < cells.length;
  if (!addressable) {
    return {
      word: translit(word),
      length: word.length,
      innerAddress,
      outerAddress,
      addressable
    };
  }
  const innerCell = cells[innerAddress];
  const outerCell = cells[outerAddress];
  const printedPair = innerCell + outerCell;
  return {
    word: translit(word),
    length: word.length,
    innerAddress,
    outerAddress,
    addressable,
    innerCell,
    outerCell,
    printedPair,
    decimalPair: /^\d{4}$/.test(printedPair)
  };
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Rows = parseRuneWords(p57.source_text).map(analyzeWord);
assert.equal(p57Rows.length, 20);
assert.equal(p57Rows.filter((row) => row.addressable).length, 18);

const p57Decimal = p57Rows.filter((row) => row.decimalPair);
assert.deepEqual(p57Decimal, [{
  word: "DIUINITY",
  length: 8,
  innerAddress: 184,
  outerAddress: 192,
  addressable: true,
  innerCell: "28",
  outerCell: "00",
  printedPair: "2800",
  decimalPair: true
}]);

// The target historical value is present in the retained participant exchange.
// The same source explicitly distinguishes the signed protocol from the
// participant-recorded concrete session tuple.
assert.match(historical2013, /client public share[^\n]*2800/);
assert.match(historical2013, /does \*\*not\*\* sign the surrounding DH exchange/);

// Because 2800 is the only all-decimal printed pair in the full p57 census,
// expanding or shrinking a comparison set of decimal historical operands
// cannot create another p57 match under this exact printed-pair rule.
assert.deepEqual(p57Decimal.map((row) => Number(row.printedPair)), [2800]);

// Exact finite control: apply the unchanged operation to every complete word
// in the pinned solved GP-native corpus.
let solvedWordCount = 0;
let solvedAddressable = 0;
const solvedDecimal = [];
for (const section of solved.sections) {
  const words = parseRuneWords(section.source_text || "");
  words.forEach((word, wordIndex) => {
    solvedWordCount++;
    const row = analyzeWord(word);
    if (row.addressable) solvedAddressable++;
    if (row.decimalPair) {
      solvedDecimal.push({
        section: section.name,
        wordIndex,
        ...row
      });
    }
  });
}
assert.equal(solvedWordCount, 735);
assert.equal(solvedAddressable, 639);
assert.equal(solvedDecimal.length, 13);
const solved2800 = solvedDecimal.filter((row) => row.printedPair === "2800");
assert.equal(solved2800.length, 4);
assert.ok(solved2800.every((row) => row.word === "DIUINITY"));
assert.equal(solvedDecimal.filter((row) => row.word !== "DIUINITY" &&
  row.printedPair === "2800").length, 0);

// Exact table-level baseline. These are scale checks, not authorship p-values.
const decimalCellCount = cells.filter((cell) => /^\d{2}$/.test(cell)).length;
const count28 = cells.filter((cell) => cell === "28").length;
const count00 = cells.filter((cell) => cell === "00").length;
assert.equal(decimalCellCount, 42);
assert.equal(count28, 1);
assert.equal(count00, 2);
assert.equal(decimalCellCount * decimalCellCount, 1764);
assert.equal(count28 * count00, 2);

const result = {
  p57: {
    words: p57Rows.length,
    addressable: p57Rows.filter((row) => row.addressable).length,
    decimalPairs: p57Decimal.length,
    uniqueDecimalResult: p57Decimal[0],
    rows: p57Rows
  },
  solvedControl: {
    words: solvedWordCount,
    addressable: solvedAddressable,
    decimalPairs: solvedDecimal.length,
    exact2800: solved2800.length,
    exact2800NonDivinity: 0,
    decimalRows: solvedDecimal
  },
  tableBaseline: {
    cells: cells.length,
    decimalCells: decimalCellCount,
    orderedAddressPairs: cells.length * cells.length,
    orderedDecimalPairs: decimalCellCount * decimalCellCount,
    exact2800AddressPairs: count28 * count00
  }
};

console.log(JSON.stringify(result, null, 2));
