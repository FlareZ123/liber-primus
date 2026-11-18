"use strict";

/**
 * Director #1540: exact p57 shed/interior sums under all source-natural
 * 32x8 p50 address conventions.
 *
 * Conventions:
 * - zero/one-based row-major
 * - zero/one-based column-major
 * - inner+outer / outer+inner printed-token concatenation
 *
 * No wrapping, reflection, rotation, phase or radix conversion.
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

const rows = 32;
const cols = 8;
const cells = grid.pages.flatMap((page) => page.tokens);
assert.equal(cells.length, rows * cols);

const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));

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

function rowMajor0(address) {
  return address >= 0 && address < 256 ? address : null;
}

function rowMajor1(address) {
  return address >= 1 && address <= 256 ? address - 1 : null;
}

function columnMajor0(address) {
  if (address < 0 || address >= 256) return null;
  const row = address % rows;
  const col = Math.floor(address / rows);
  return row * cols + col;
}

function columnMajor1(address) {
  if (address < 1 || address > 256) return null;
  const value = address - 1;
  const row = value % rows;
  const col = Math.floor(value / rows);
  return row * cols + col;
}

const addressors = [
  ["row-major-0", rowMajor0],
  ["row-major-1", rowMajor1],
  ["column-major-0", columnMajor0],
  ["column-major-1", columnMajor1]
];

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const words = parseRuneWords(p57.source_text).map((word) => ({
  word: translit(word),
  innerSum: primeSum(word.slice(1, -1)),
  outerSum: primeSum([word[0], word[word.length - 1]])
}));
assert.equal(words.length, 20);

const conventions = [];
for (const [addressName, addressor] of addressors) {
  for (const order of ["inner-outer", "outer-inner"]) {
    const outputs = [];
    for (const item of words) {
      const innerIndex = addressor(item.innerSum);
      const outerIndex = addressor(item.outerSum);
      if (innerIndex === null || outerIndex === null) {
        outputs.push({...item, valid: false});
        continue;
      }
      const innerCell = cells[innerIndex];
      const outerCell = cells[outerIndex];
      const printedPair = order === "inner-outer"
        ? innerCell + outerCell : outerCell + innerCell;
      outputs.push({
        ...item,
        valid: true,
        innerIndex,
        outerIndex,
        innerCell,
        outerCell,
        printedPair,
        decimal: /^\d{4}$/.test(printedPair)
      });
    }

    const decimals = outputs.filter((row) => row.decimal);
    const divinity = outputs.find((row) => row.word === "DIUINITY");
    conventions.push({
      name: addressName + "/" + order,
      addressName,
      order,
      validWords: outputs.filter((row) => row.valid).length,
      decimalCount: decimals.length,
      decimalRows: decimals.map((row) => ({
        word: row.word,
        innerSum: row.innerSum,
        outerSum: row.outerSum,
        printedPair: row.printedPair
      })),
      divinity: {
        valid: divinity.valid,
        innerIndex: divinity.innerIndex,
        outerIndex: divinity.outerIndex,
        innerCell: divinity.innerCell,
        outerCell: divinity.outerCell,
        printedPair: divinity.printedPair,
        decimal: divinity.decimal === true
      },
      divinityUniqueDecimal:
        divinity.decimal === true && decimals.length === 1,
      exact2800Rows: outputs.filter((row) => row.printedPair === "2800")
        .map((row) => row.word)
    });
  }
}

// Historical bridge control from #1497 must remain exact in its original convention.
const canonical = conventions.find((row) =>
  row.name === "row-major-0/inner-outer");
assert.deepEqual(canonical.divinity, {
  valid: true,
  innerIndex: 184,
  outerIndex: 192,
  innerCell: "28",
  outerCell: "00",
  printedPair: "2800",
  decimal: true
});
assert.equal(canonical.divinityUniqueDecimal, true);
assert.deepEqual(canonical.exact2800Rows, ["DIUINITY"]);

console.log(JSON.stringify({
  shape: {rows, cols},
  p57Words: words.length,
  conventions
}, null, 2));
