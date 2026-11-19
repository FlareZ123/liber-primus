"use strict";

/**
 * Prospective continuation of the READ OUT -> p0[80..102] receiver.
 *
 * The receiver was selected independently before this test. This script
 * freezes its four whole-word GP0 residues, the literal Roman-numeral reading,
 * and the already selected p33-p39 1680-rune chapter. It enumerates a small
 * natural address/walk family rather than tuning a successful output.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {number} page */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (current.length === 0) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      words.push({ start, values: current });
      current = [];
    }
  }

  if (current.length) words.push({ start, values: current });
  return words;
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/**
 * @param {string} token
 * @param {string} alphabet
 */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);
const p0Words = parseWords(physicalPart(0));

// READ OUT had already selected exactly p0 offsets 80..102 before this test.
const selectedWords = p0Words.filter(
  (word) =>
    word.start >= 80 &&
    word.start + word.values.length - 1 <= 102
);
assert.equal(selectedWords.length, 4);
assert.deepEqual(
  selectedWords.map((word) => [
    word.start,
    word.values.length,
    gp0(word.values),
    gp0(word.values) % 29,
  ]),
  [
    [80, 3, 48, 19],
    [83, 7, 78, 20],
    [90, 5, 63, 5],
    [95, 8, 139, 23],
  ]
);

const residues = selectedWords.map((word) => gp0(word.values) % 29);
assert.equal(translit(residues), "MLCD");

// The residues are exactly the four largest Roman-numeral denominations.
const romanValue = new Map([
  [19, 1000], // M
  [20, 50],   // L
  [5, 100],   // C
  [23, 500],  // D
]);
const romanSteps = residues.map((value) => romanValue.get(value));
assert.deepEqual(romanSteps, [1000, 50, 100, 500]);
assert.equal(romanSteps.reduce((sum, value) => sum + value, 0), 1650);
assert.equal(2 * 1650 + 1, 3301);

// Matched manuscript census. This is descriptive because the Roman-symbol
// property was noticed after the receiver had been selected.
const targetSet = [...romanValue.keys()].sort((a, b) => a - b).join(",");
let fourWordWindows = 0;
let exactSetCount = 0;
let exactOrderCount = 0;
let highRomanOnlyCount = 0;
const highRomanWindows = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  for (let index = 0; index <= words.length - 4; index += 1) {
    const window = words.slice(index, index + 4);
    const mods = window.map((word) => gp0(word.values) % 29);
    fourWordWindows += 1;

    const exactSet =
      [...mods].sort((a, b) => a - b).join(",") === targetSet;
    const exactOrder = translit(mods) === "MLCD";
    const highRomanOnly = mods.every((value) => romanValue.has(value));

    if (exactSet) exactSetCount += 1;
    if (exactOrder) exactOrderCount += 1;
    if (highRomanOnly) {
      highRomanOnlyCount += 1;
      highRomanWindows.push({
        page,
        word: index + 1,
        start: window[0].start,
        length: window.reduce((sum, word) => sum + word.values.length, 0),
        text: translit(mods),
      });
    }
  }
}

assert.equal(fourWordWindows, 2763);
assert.equal(exactSetCount, 1);
assert.equal(exactOrderCount, 1);
assert.equal(highRomanOnlyCount, 4);
assert.deepEqual(highRomanWindows[0], {
  page: 0,
  word: 18,
  start: 80,
  length: 23,
  text: "MLCD",
});

// The same route independently selects the unresolved p33-p39 chapter.
const chapter = corpus.pages
  .filter((page) => page.page >= 33 && page.page <= 39)
  .flatMap((page) => page.indices);
assert.equal(chapter.length, 1680);

// Charge the finite natural coordinate family:
// - original or reversed four-symbol order;
// - absolute addresses or cumulative steps;
// - forward or backward direction;
// - zero- or one-origin indexing.
//
// Only the original-order, cumulative, forward, zero-origin read spells PADA.
const variants = [];
for (const reversed of [false, true]) {
  const steps = reversed ? [...romanSteps].reverse() : romanSteps;
  for (const cumulative of [false, true]) {
    for (const sign of [1, -1]) {
      for (const origin of [0, 1]) {
        let accumulator = 0;
        const positions = [];
        for (const step of steps) {
          accumulator = cumulative
            ? accumulator + sign * step
            : sign * step;
          const position =
            ((accumulator - origin) % chapter.length + chapter.length) %
            chapter.length;
          positions.push(position);
        }

        const values = positions.map((position) => chapter[position]);
        variants.push({
          reversed,
          cumulative,
          sign,
          origin,
          positions,
          values,
          text: translit(values),
        });
      }
    }
  }
}

assert.equal(variants.length, 16);
const padaVariants = variants.filter((variant) => variant.text === "PADA");
assert.deepEqual(padaVariants, [{
  reversed: false,
  cumulative: true,
  sign: 1,
  origin: 0,
  positions: [1000, 1050, 1150, 1650],
  values: [13, 24, 23, 24],
  text: "PADA",
}]);

// PADA is a four-rune GP29 word candidate with GP0=84. Continue through the
// already-frozen post-MUST drop-f base59 table state without retuning it.
const pada = padaVariants[0].values;
const padaGp0 = gp0(pada);
assert.equal(padaGp0, 84);
assert.equal(tokens[padaGp0], "2r");

const base59Target = decode(tokens[padaGp0], alphabet59);
const base60Rival = decode(tokens[padaGp0], alphabet60);
assert.equal(base59Target, 170);
assert.equal(base60Rival, 173);
assert.equal(p0.indices[base59Target], 2);
assert.equal(corpus.translit[p0.indices[base59Target]], "TH");
assert.equal(p0.indices[base60Rival], 22);
assert.equal(corpus.translit[p0.indices[base60Rival]], "OE");

// The p28 state independently fixes shared DH secret K=2.
const K = 2;
assert.equal(p0.indices[base59Target], K);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    page: 0,
    span: [80, 102],
    wordResidues: residues,
    residueText: translit(residues),
    romanSteps,
    romanSum: 1650,
  },
  matchedCensus: {
    fourWordWindows,
    exactSetCount,
    exactOrderCount,
    highRomanOnlyCount,
    highRomanWindows,
    discoveryWarning:
      "descriptive only; Roman-numeral recognition was post-receiver inspection",
  },
  chapterWalk: {
    length: chapter.length,
    familySize: variants.length,
    padaVariants,
  },
  continuation: {
    padaGp0,
    token: tokens[padaGp0],
    frozenBase59Target: base59Target,
    targetRune: corpus.translit[p0.indices[base59Target]],
    targetValue: p0.indices[base59Target],
    fixedDhK: K,
    base60Rival,
    base60Rune: corpus.translit[p0.indices[base60Rival]],
  },
  classification:
    "provisional source-linked continuation; PADA/roman recognition and K landing require independent blind confirmation before promotion",
}, null, 2));
