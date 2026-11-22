"use strict";

/**
 * Agent24: p38 FOUND <-> ROAD/PATHS reciprocal low-digit state.
 *
 * Chronology:
 * 1. base60 / low-digit / zero-origin transition was fixed by the p28
 *    READ OUT self-closure;
 * 2. Agent7 transferred that operator and selected p38 offsets54..56;
 * 3. only afterward was the authenticated reciprocal state pair noticed.
 *
 * This SFT tests the source-state cycle and its physical manuscript
 * realization without assigning plaintext to the three-rune receiver.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const tape = grid.pages.flatMap((page) => page.tokens);
const alphabet = grid.alphabet;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const gpTokens = corpus.translit
  .map((symbol, index) => ({ symbol: symbol.toUpperCase(), index }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

assert.equal(tape.length, 256);
assert.equal(alphabet.length, 60);

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.index);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number} address @returns {number|null} */
function low60(address) {
  if (!Number.isInteger(address) || address < 0 || address >= tape.length) {
    return null;
  }
  const value = alphabet.indexOf(tape[address][1]);
  assert.ok(value >= 0);
  return value;
}

/** @returns {Array<object>} */
function signedWords() {
  const clear = signedSource
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token))
    .map((word, index) => {
      const values = gpWord(word);
      return {
        source: "signed",
        index,
        label: word.toUpperCase(),
        values,
        gp0: sum(values),
      };
    });
}

/**
 * @param {object} section
 * @param {string} source
 * @returns {Array<object>}
 */
function runeWords(section, source) {
  const out = [];
  let current = [];

  for (const char of [...section.source_text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      out.push({
        source,
        index: out.length,
        label: current.map((item) => corpus.translit[item]).join(""),
        values: current.slice(),
        gp0: sum(current),
      });
      current = [];
    }
  }
  if (current.length) {
    out.push({
      source,
      index: out.length,
      label: current.map((item) => corpus.translit[item]).join(""),
      values: current.slice(),
      gp0: sum(current),
    });
  }
  return out;
}

const signed = signedWords();
assert.equal(signed.length, 43);

const p56 = runeWords(
  solved.sections.find((section) => section.name === "p56_an_end"),
  "p56"
);
const p57 = runeWords(
  solved.sections.find((section) => section.name === "p57_parable"),
  "p57"
);

const sourceWords = [...signed, ...p56, ...p57];
const distinctSourceWords = [
  ...new Map(
    sourceWords.map((word) => [word.source + ":" + word.label, word])
  ).values(),
];
const sourceStates = [
  ...new Set(
    distinctSourceWords
      .map((word) => word.gp0)
      .filter((value) => value >= 0 && value < 256)
  ),
].sort((left, right) => left - right);

assert.equal(sourceStates.length, 50);

const reciprocalCycles = [];
for (const left of sourceStates) {
  const right = low60(left);
  if (
    right === null ||
    right === left ||
    !sourceStates.includes(right) ||
    left >= right
  ) {
    continue;
  }
  if (low60(right) !== left) continue;
  reciprocalCycles.push({
    left,
    right,
    leftWords: distinctSourceWords
      .filter((word) => word.gp0 === left)
      .map((word) => [word.source, word.label]),
    rightWords: distinctSourceWords
      .filter((word) => word.gp0 === right)
      .map((word) => [word.source, word.label]),
    tokens: [tape[left], tape[right]],
  });
}

assert.deepEqual(reciprocalCycles, [
  {
    left: 36,
    right: 54,
    leftWords: [["signed", "FOUND"]],
    rightWords: [
      ["signed", "ROAD"],
      ["signed", "PATHS"],
    ],
    tokens: ["0s", "2a"],
  },
]);

assert.equal(sum(gpWord("FOUND")), 36);
assert.equal(sum(gpWord("ROAD")), 54);
assert.equal(sum(gpWord("PATHS")), 54);
assert.equal(low60(36), 54);
assert.equal(low60(54), 36);

// Parse all unknown-page words continuously and retain only words wholly
// contained on one physical page.
const segments = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  text,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushUnknownWord() {
  if (!current.length) return;

  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length,
      start: startOffset,
      end: startOffset + current.length - 1,
      length: current.length,
      values: current.slice(),
      gp0: sum(current),
      translit: current.map((value) => corpus.translit[value]).join(""),
    });
  }

  current = [];
}

for (let segment = 0; segment < segments.length; segment += 1) {
  for (const char of [...segments[segment]]) {
    if (runeSet.has(char)) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(runeIndex.get(char));
      pages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Physical line/page wrap does not terminate a word.
    } else {
      flushUnknownWord();
    }
  }
}
flushUnknownWord();

const unknownWords = pages.flatMap((page) => page.words);
assert.equal(unknownWords.length, 2864);

// Physical realizations of either orientation of the unique authenticated
// reciprocal pair.
const reciprocalPhysicalWords = unknownWords.filter(
  (word) =>
    (word.start === 54 && word.gp0 === 36) ||
    (word.start === 36 && word.gp0 === 54)
);

assert.deepEqual(reciprocalPhysicalWords, [
  {
    page: 38,
    ordinal: 10,
    start: 54,
    end: 56,
    length: 3,
    values: [5, 12, 19],
    gp0: 36,
    translit: "CEOM",
  },
]);

const p38 = pages.find((page) => page.page === 38);
assert.ok(p38);
const foundReceiver = p38.words.find(
  (word) => word.start === 49 && word.end === 53
);
const reciprocalReceiver = p38.words.find(
  (word) => word.start === 54 && word.end === 56
);
assert.ok(foundReceiver && reciprocalReceiver);
assert.equal(foundReceiver.gp0, 95);
assert.equal(reciprocalReceiver.gp0, 36);
assert.equal(reciprocalReceiver.start, 54);

// Confirm the two words are the last complete words before the literal
// numbered-section marker "5-" in the original transcription.
const p38Text = segments[38];
const markerIndex = p38Text.indexOf("5-");
assert.ok(markerIndex > 0);
const beforeFive = p38Text.slice(0, markerIndex);
assert.ok(beforeFive.trimEnd().endsWith("ᚳᛇᛗ./"));
assert.deepEqual(
  [..."ᚳᛇᛗ"].map((rune) => runeIndex.get(rune)),
  reciprocalReceiver.values
);

console.log(JSON.stringify({
  status: "PASS",
  sourceStateFamily: {
    distinctGp0States: sourceStates.length,
    reciprocalLow60Cycles: reciprocalCycles,
  },
  manuscriptPopulation: {
    containedUnknownWords: unknownWords.length,
    reciprocalPhysicalWords,
  },
  p38: {
    selectedFoundReceiver: {
      ordinal: foundReceiver.ordinal,
      start: foundReceiver.start,
      end: foundReceiver.end,
      gp0: foundReceiver.gp0,
    },
    nextReceiver: reciprocalReceiver,
    relation:
      "next receiver start=54=GP0(ROAD/PATHS), receiver GP0=36=GP0(FOUND)",
    boundary: "next literal numbered marker is section 5",
  },
  classification:
    "chronology-preserving structural corroboration: low60 was fixed before the p38 receiver was interpreted as the unique physical realization of the authenticated FOUND <-> ROAD/PATHS reciprocal state; no plaintext is assigned to the three-rune receiver",
}, null, 2));
