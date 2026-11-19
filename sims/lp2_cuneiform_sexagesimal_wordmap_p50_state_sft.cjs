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
function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("value has no modular inverse");
}
function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const numerator = counts.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (values.length * (values.length - 1));
}
function adjacentEqualCount(values) {
  let count = 0;
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] === values[index - 1]) count += 1;
  }
  return count;
}
function summarizePassages(passages, translit) {
  const flat = passages.flat();
  return {
    length: flat.length,
    ioc: indexOfCoincidence(flat),
    adjacentEqual: passages.reduce((sum, passage) => sum + adjacentEqualCount(passage), 0),
    heads: passages.map((passage) => passage.slice(0, 24).map((value) => translit[value]).join(" ")),
  };
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

// Parse the three 2014 square centers in the exact order of the source document.
const magicText = read("resources/cicada2014-openpuff-magic-squares.txt");
const numericRows = magicText
  .replace(/\r\n?/g, "\n")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => /^\d+(?:\s+\d+)*$/.test(line))
  .map((line) => line.split(/\s+/).map(Number));
const squareGroups = [];
for (const row of numericRows) {
  if (squareGroups.length === 0 ||
      squareGroups[squareGroups.length - 1][0].length !== row.length) {
    squareGroups.push([]);
  }
  squareGroups[squareGroups.length - 1].push(row);
}
assert.deepEqual(squareGroups.map((group) => [group.length, group[0].length]), [
  [5, 5], [7, 7], [5, 5],
]);
const squareCenters = squareGroups.map((square) => {
  const middle = Math.floor(square.length / 2);
  return square[middle][middle];
});
assert.deepEqual(squareCenters, [809, 331, 91]);

// The two cuneiform numerals are read from the p33 original scan.
const cuneiformNumbers = [1033, 3301];
const sourceOrderNumbers = [...squareCenters, ...cuneiformNumbers];
const fivePacket = sourceOrderNumbers.map(selectCoordinate);
assert.deepEqual(fivePacket.map((item) => item.wordText), [
  "TEI", "THYEOTHJTHRU", "TXELR", "FREAMEAA", "NG",
]);
assert.deepEqual(fivePacket.map((item) => [
  item.positional, item.tableAddress, item.token, item.byte, item.output,
]), [
  [13988, 164, "1j", 105, 18],
  [50212977392, 240, "2O", 144, 28],
  [11673664, 64, "22", 122, 6],
  [3528831, 127, "3D", 193, 19],
  [21, 21, "2H", 137, 21],
]);
const fiveKey = fivePacket.map((item) => item.output);
assert.deepEqual(fiveKey, [18, 28, 6, 19, 21]);
assert.deepEqual(fivePacket.map((item) => item.outputRune), ["E", "EA", "G", "M", "NG"]);

// The final two values alone return the p33 oversized marker pair.
const selected = fivePacket.slice(3);
assert.deepEqual(selected.map((item) => [item.pageNumber, item.wordOrdinal]), [
  [17, 13], [55, 1],
]);
assert.deepEqual(selected.map((item) => item.outputRune), ["M", "NG"]);

const target = [19, 21];
const matches = [];
let validVariants = 0;
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
for (const pageOrigin of [0, 1]) {
  for (const wordOrigin of [0, 1]) {
    for (const tableOrigin of [0, 1]) {
      for (const order of ["row", "column"]) {
        for (const encoding of ["positional", "sum"]) {
          for (const reverse of [false, true]) {
            const config = { pageOrigin, wordOrigin, tableOrigin, order, encoding, reverse };
            const output = cuneiformNumbers.map((number) => variantOutput(number, config));
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

// Five red-numbered passage intervals from the existing five-passage analysis.
const pageRunes = new Map(corpus.pages.map((page) => [page.page, page.indices]));
const passages = [
  pageRunes.get(36).slice(99, 238),
  pageRunes.get(37).slice(0, 91),
  pageRunes.get(37).slice(91, 189),
  [...pageRunes.get(37).slice(189, 228), ...pageRunes.get(38).slice(0, 57)],
  pageRunes.get(38).slice(57, 186),
];
assert.deepEqual(passages.map((passage) => passage.length), [139, 91, 98, 96, 129]);
assert.equal(passages.flat().length, 553);
const passageStarts = passages.map((passage) => corpus.translit[passage[0]]);
const passageEnds = passages.map((passage) => corpus.translit[passage[passage.length - 1]]);
assert.deepEqual(passageStarts, ["L", "N", "D", "NG", "H"]);
assert.deepEqual(passageEnds, ["A", "B", "W", "M", "C"]);

const originalPassageStats = summarizePassages(passages, corpus.translit);
const simpleConsumers = [];
for (const sign of [-1, 1]) {
  const constant = passages.map((passage, passageIndex) =>
    passage.map((value) => mod(value + sign * fiveKey[passageIndex], 29)));
  const period5Reset = passages.map((passage) =>
    passage.map((value, index) => mod(value + sign * fiveKey[index % 5], 29)));
  const period5Global = passages.flat().map((value, index) =>
    mod(value + sign * fiveKey[index % 5], 29));
  simpleConsumers.push({
    operation: "one constant additive symbol per passage",
    sign,
    ...summarizePassages(constant, corpus.translit),
  });
  simpleConsumers.push({
    operation: "period-5 additive key reset at each passage",
    sign,
    ...summarizePassages(period5Reset, corpus.translit),
  });
  simpleConsumers.push({
    operation: "period-5 additive key over concatenated passages",
    sign,
    length: period5Global.length,
    ioc: indexOfCoincidence(period5Global),
    adjacentEqual: adjacentEqualCount(period5Global),
    head: period5Global.slice(0, 80).map((value) => corpus.translit[value]).join(" "),
  });
}
for (const inverse of [false, true]) {
  const multiplied = passages.map((passage, passageIndex) => {
    const factor = inverse ? inverseMod(fiveKey[passageIndex], 29) : fiveKey[passageIndex];
    return passage.map((value) => mod(value * factor, 29));
  });
  simpleConsumers.push({
    operation: inverse ? "per-passage multiplicative inverse" : "per-passage multiplicative",
    ...summarizePassages(multiplied, corpus.translit),
  });
}

// Direct marker-key consumers on p33's two black bodies.
const p33Indices = corpus.pages.find((page) => page.page === 33).indices;
const p33Bodies = [
  p33Indices.slice(10, 91),
  p33Indices.slice(99, 214),
];
assert.deepEqual(p33Bodies.map((body) => body.length), [81, 115]);
const p33MarkerKey = [19, 21];
const p33RawIoc = indexOfCoincidence(p33Bodies.flat());
const p33MarkerConsumers = [];
for (const sign of [-1, 1]) {
  const constant = p33Bodies.map((body, bodyIndex) =>
    body.map((value) => mod(value + sign * p33MarkerKey[bodyIndex], 29)));
  const period2Reset = p33Bodies.map((body) =>
    body.map((value, index) => mod(value + sign * p33MarkerKey[index % 2], 29)));
  const period2Continuous = p33Bodies.flat().map((value, index) =>
    mod(value + sign * p33MarkerKey[index % 2], 29));
  p33MarkerConsumers.push({
    operation: "per-body constant additive M/NG",
    sign,
    ...summarizePassages(constant, corpus.translit),
  });
  p33MarkerConsumers.push({
    operation: "period-2 additive key reset per body",
    sign,
    ...summarizePassages(period2Reset, corpus.translit),
  });
  p33MarkerConsumers.push({
    operation: "period-2 additive key continuous across bodies",
    sign,
    length: period2Continuous.length,
    ioc: indexOfCoincidence(period2Continuous),
    adjacentEqual: adjacentEqualCount(period2Continuous),
    head: period2Continuous.slice(0, 80).map((value) => corpus.translit[value]).join(" "),
  });
}
for (const inverse of [false, true]) {
  const multiplied = p33Bodies.map((body, bodyIndex) => {
    const factor = inverse
      ? inverseMod(p33MarkerKey[bodyIndex], 29)
      : p33MarkerKey[bodyIndex];
    return body.map((value) => mod(value * factor, 29));
  });
  p33MarkerConsumers.push({
    operation: inverse ? "per-body multiplicative inverse" : "per-body multiplicative",
    ...summarizePassages(multiplied, corpus.translit),
  });
}

console.log(JSON.stringify({
  classification: "retrospective navigation/state-selector candidate; no plaintext or body cipher",
  sourceOrderNumbers,
  fiveValuePacket: fivePacket,
  cuneiformMarkerPair: selected,
  conventionAudit: {
    validVariants,
    target: ["M", "NG"],
    matches,
  },
  fivePassageStructure: {
    lengths: passages.map((passage) => passage.length),
    starts: passageStarts,
    ends: passageEnds,
    original: originalPassageStats,
  },
  simpleFiveKeyConsumers: simpleConsumers,
  p33MarkerKeyConsumers: {
    bodyLengths: p33Bodies.map((body) => body.length),
    rawIoc: p33RawIoc,
    tests: p33MarkerConsumers,
  },
}, null, 2));
