"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const squareText = fs.readFileSync(
  path.join(root, "resources", "cicada2014-openpuff-magic-squares.txt"), "utf8");
const rows = squareText.trim().split(/\r?\n/u)
  .map(line => line.trim().split(/\s+/u).map(Number))
  .filter(row => row.length === 7);
assert.equal(rows.length, 7, "expected exactly one 7x7 square");
const square = rows.flat();
assert.equal(square.length, 49);
const magicConstant = 1033;
assert.ok(rows.every(row => row.reduce((a, b) => a + b, 0) === magicConstant));
const columnSums = Array.from({length: 7}, (_, col) =>
  rows.reduce((sum, row) => sum + row[col], 0));
assert.ok(columnSums.every(sum => sum === magicConstant));

const parsed = parseSharedCorpus();
const selected = parsed.words.filter(word =>
  word.startPage >= 40 && word.startPage <= 54);
assert.equal(selected.length, 735, "canonical words starting in p40-55 span");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeWords = selected.map(word => [...word.runes].map(rune => {
  const index = runeIndex.get(rune);
  assert.notEqual(index, undefined);
  return index;
}));
const totalRunes = runeWords.reduce((sum, word) => sum + word.length, 0);
assert.equal(totalRunes, 3316);
assert.equal(selected.length, 15 * 49);

const mod29 = value => ((value % 29) + 29) % 29;
const rowMajor = square.map(mod29);
const columnMajor = Array.from({length: 7}, (_, col) =>
  rows.map(row => row[col])).flat().map(mod29);
const wordPrimeSums = runeWords.map(word =>
  word.reduce((sum, index) => sum + corpus.prime[index], 0));

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

function perWordShift(key, sign) {
  return runeWords.map((word, wordIndex) => {
    const shift = key[wordIndex % 49];
    return word.map(value => mod29(value + sign * shift));
  });
}

function wordPrimeReadout(key, sign) {
  return wordPrimeSums.map((sum, wordIndex) =>
    mod29(sum + sign * key[wordIndex % 49]));
}

function multisetIntersection(left, right) {
  const counts = new Map();
  for (const value of left) counts.set(value, (counts.get(value) || 0) + 1);
  let matches = 0;
  for (const value of right) {
    const remaining = counts.get(value) || 0;
    if (remaining > 0) {
      matches++;
      counts.set(value, remaining - 1);
    }
  }
  return matches;
}

const blocks = Array.from({length: 15}, (_, block) =>
  wordPrimeSums.slice(block * 49, (block + 1) * 49));
const blockChecks = blocks.map((values, block) => {
  const matrix = Array.from({length: 7}, (_, row) =>
    values.slice(row * 7, row * 7 + 7));
  const rowSums = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = Array.from({length: 7}, (_, col) =>
    matrix.reduce((sum, row) => sum + row[col], 0));
  return {
    block,
    rowSums,
    colSums,
    magicHits: rowSums.filter(x => x === magicConstant).length +
      colSums.filter(x => x === magicConstant).length,
    squareMultisetMatches: multisetIntersection(values, square)
  };
});

const variants = {};
for (const [orientation, key] of Object.entries({rowMajor, columnMajor})) {
  for (const sign of [-1, 1]) {
    const shifted = perWordShift(key, sign).flat();
    const readout = wordPrimeReadout(key, sign);
    variants[orientation + (sign < 0 ? "_subtract" : "_add")] = {
      runeIoC: ioc(shifted),
      wordReadoutIoC: ioc(readout),
      first120Runes: shifted.slice(0, 120).map(x => corpus.translit[x]).join(" "),
      first120WordReadout: readout.slice(0, 120).map(x => corpus.translit[x]).join(" ")
    };
  }
}

// Positive arithmetic control: the frozen inverse recovers all original runes.
for (const key of [rowMajor, columnMajor]) {
  const encrypted = perWordShift(key, 1);
  const recovered = encrypted.map((word, wordIndex) =>
    word.map(value => mod29(value - key[wordIndex % 49])));
  assert.deepEqual(recovered, runeWords);
}

const result = {
  selectedWords: selected.length,
  groupsOf49: selected.length / 49,
  runeCount: totalRunes,
  squareRows: rows,
  squareCells: square.length,
  squareUniqueValues: new Set(square).size,
  squareUniqueResiduesMod49: new Set(square.map(x => x % 49)).size,
  squareMagicConstant: magicConstant,
  squareTotal: square.reduce((a, b) => a + b, 0),
  reverse3301: Number(String(3301).split("").reverse().join("")),
  rawRuneIoC: ioc(runeWords.flat()),
  rawWordPrimeSumIoC: ioc(wordPrimeSums.map(mod29)),
  rowColumnMagicHitsAcrossBlocks: blockChecks.reduce((sum, x) => sum + x.magicHits, 0),
  blockSquareMultisetMatches: blockChecks.map(x => x.squareMultisetMatches),
  maxBlockSquareMultisetMatches: Math.max(...blockChecks.map(x => x.squareMultisetMatches)),
  variants,
  syntheticRoundTrips: "passed for row-major and column-major keys"
};
console.log(JSON.stringify(result, null, 2));
