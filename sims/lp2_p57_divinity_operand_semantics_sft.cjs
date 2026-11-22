"use strict";

/**
 * Director #1547: frozen p57 endpoint/interior operand-semantics census.
 *
 * Receiver is fixed from #1540:
 *   zero-based row-major p50 literal token lookup, inner then outer.
 *
 * Operand families only:
 *   1. GP-prime sums
 *   2. canonical GP 0..28 index sums
 *   3. rune counts
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
const cells = grid.pages.flatMap((page) => page.tokens);
assert.equal(cells.length, 256);

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

function translit(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const words = parseRuneWords(p57.source_text);
assert.equal(words.length, 20);

const operandFamilies = [
  {
    name: "gp-prime-sum",
    inner: (word) => sum(word.slice(1, -1).map((v) => corpus.prime[v])),
    outer: (word) => corpus.prime[word[0]] + corpus.prime[word[word.length - 1]]
  },
  {
    name: "gp-index-sum",
    inner: (word) => sum(word.slice(1, -1)),
    outer: (word) => word[0] + word[word.length - 1]
  },
  {
    name: "rune-count",
    inner: (word) => Math.max(0, word.length - 2),
    outer: (word) => Math.min(2, word.length)
  }
];

const families = operandFamilies.map((family) => {
  const rows = words.map((word) => {
    const innerAddress = family.inner(word);
    const outerAddress = family.outer(word);
    const valid = innerAddress >= 0 && innerAddress < 256 &&
      outerAddress >= 0 && outerAddress < 256;
    if (!valid) {
      return {word: translit(word), innerAddress, outerAddress, valid};
    }
    const innerCell = cells[innerAddress];
    const outerCell = cells[outerAddress];
    const printedPair = innerCell + outerCell;
    return {
      word: translit(word),
      innerAddress,
      outerAddress,
      valid,
      innerCell,
      outerCell,
      printedPair,
      decimal: /^\d{4}$/.test(printedPair)
    };
  });

  const decimals = rows.filter((row) => row.decimal);
  const divinity = rows.find((row) => row.word === "DIUINITY");
  return {
    name: family.name,
    validWords: rows.filter((row) => row.valid).length,
    decimalCount: decimals.length,
    decimalRows: decimals.map((row) => ({
      word: row.word,
      innerAddress: row.innerAddress,
      outerAddress: row.outerAddress,
      printedPair: row.printedPair
    })),
    exact2800Rows: rows.filter((row) => row.printedPair === "2800")
      .map((row) => row.word),
    divinity
  };
});

const prime = families.find((family) => family.name === "gp-prime-sum");
assert.equal(prime.divinity.innerAddress, 184);
assert.equal(prime.divinity.outerAddress, 192);
assert.equal(prime.divinity.printedPair, "2800");
assert.deepEqual(prime.exact2800Rows, ["DIUINITY"]);
assert.equal(prime.decimalCount, 1);

console.log(JSON.stringify({p57Words: words.length, families}, null, 2));
