"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}
function base60(token, alphabet) {
  let value = 0;
  for (const ch of token) {
    const digit = alphabet.indexOf(ch);
    assert.notEqual(digit, -1, "unknown base60 token character");
    value = value * 60 + digit;
  }
  return value;
}
function base29Positional(values) {
  return values.reduce((value, digit) => value * 29 + digit, 0);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\r\n?/g, "\n")
  .trim();
const segments = transcription.split(/\n%\n/);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages.find((page) => page.page === 50).runic_count, 0);
assert.equal(segments.length, 57);
assert.equal(grid.alphabet.length, 60);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(grid.rows.flat().length, 256);

function wordsAt(pageNumber) {
  // The source transcription omits empty p50; p51..p57 therefore shift by one segment.
  const segmentIndex = pageNumber >= 51 ? pageNumber - 1 : pageNumber;
  assert.ok(segmentIndex >= 0 && segmentIndex < segments.length);
  const source = segments[segmentIndex];
  const words = [];
  let current = [];
  // Slash and whitespace are physical line breaks, not word boundaries.
  // Other non-rune marks (including hyphen and punctuation) close the current word.
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (ch === "/" || /\s/u.test(ch)) {
      continue;
    } else if (current.length > 0) {
      words.push(current);
      current = [];
    }
  }
  if (current.length > 0) words.push(current);
  return words;
}

function selectCoordinate(number) {
  const pageNumber = Math.floor(number / 60);
  const wordOrdinal = number % 60;
  assert.equal(number, pageNumber * 60 + wordOrdinal);
  assert.ok(pageNumber >= 0 && pageNumber <= 57);
  assert.ok(wordOrdinal >= 1);
  const word = wordsAt(pageNumber)[wordOrdinal - 1];
  assert.ok(word, "page:word coordinate must exist");
  const wordText = word.map((value) => corpus.translit[value]).join("");
  const positional = base29Positional(word);
  const tableAddress = positional % 256;
  const token = grid.rows[Math.floor(tableAddress / 8)][tableAddress % 8];
  const byte = base60(token, grid.alphabet);
  const output = byte % 29;
  return {
    number,
    pageNumber,
    wordOrdinal,
    wordText,
    wordValues: word,
    positional,
    tableAddress,
    token,
    byte,
    output,
    outputRune: corpus.translit[output],
  };
}

const selected = [1033, 3301].map(selectCoordinate);
assert.deepEqual(
  selected.map((item) => [item.pageNumber, item.wordOrdinal]),
  [[17, 13], [55, 1]]
);
assert.deepEqual(selected.map((item) => item.wordText), ["FREAMEAA", "NG"]);
assert.deepEqual(selected.map((item) => item.wordValues), [
  [0, 4, 28, 19, 28, 24],
  [21],
]);
assert.deepEqual(selected.map((item) => [
  item.positional, item.tableAddress, item.token, item.byte, item.output,
]), [
  [3528831, 127, "3D", 193, 19],
  [21, 21, "2H", 137, 21],
]);
// These are the two oversized p33 section markers read from the original p33 scan.
assert.deepEqual(selected.map((item) => item.output), [19, 21]);
assert.deepEqual(selected.map((item) => item.outputRune), ["M", "NG"]);

// Independent 2014 square-center controls under the unchanged natural convention.
const controls = [91, 331, 809].map(selectCoordinate);
assert.deepEqual(controls.map((item) => item.output), [6, 28, 18]);
assert.deepEqual(controls.map((item) => item.outputRune), ["G", "EA", "E"]);

function variantOutput(number, config) {
  const pageNumber = Math.floor(number / 60) - config.pageOrigin;
  const wordIndex = number % 60 - config.wordOrigin;
  if (pageNumber < 0 || pageNumber > 57 || wordIndex < 0) return null;
  const word = wordsAt(pageNumber)[wordIndex];
  if (!word) return null;
  const values = config.reverse ? [...word].reverse() : word;
  const wordNumber = config.encoding === "positional"
    ? base29Positional(values)
    : values.reduce((sum, value) => sum + value, 0);
  const tableAddress = mod(wordNumber - config.tableOrigin, 256);
  const row = config.order === "row"
    ? Math.floor(tableAddress / 8)
    : tableAddress % 32;
  const column = config.order === "row"
    ? tableAddress % 8
    : Math.floor(tableAddress / 32);
  const token = grid.rows[row][column];
  return base60(token, grid.alphabet) % 29;
}

const target = [19, 21];
const matches = [];
let validVariants = 0;
for (const pageOrigin of [0, 1]) {
  for (const wordOrigin of [0, 1]) {
    for (const tableOrigin of [0, 1]) {
      for (const order of ["row", "column"]) {
        for (const encoding of ["positional", "sum"]) {
          for (const reverse of [false, true]) {
            const config = { pageOrigin, wordOrigin, tableOrigin, order, encoding, reverse };
            const output = [1033, 3301].map((number) => variantOutput(number, config));
            if (output.every((value) => value !== null)) {
              validVariants += 1;
              if (output[0] === target[0] && output[1] === target[1]) {
                matches.push({ config, output });
              }
            }
          }
        }
      }
    }
  }
}
assert.equal(validVariants, 64);
assert.equal(matches.length, 1);
assert.deepEqual(matches[0].config, {
  pageOrigin: 0,
  wordOrigin: 1,
  tableOrigin: 0,
  order: "row",
  encoding: "positional",
  reverse: false,
});

console.log(JSON.stringify({
  classification: "retrospective navigation/state-selector candidate; no plaintext or body cipher",
  selected,
  squareCenterControls: controls,
  conventionAudit: {
    validVariants,
    target: ["M", "NG"],
    matches,
  },
}, null, 2));
