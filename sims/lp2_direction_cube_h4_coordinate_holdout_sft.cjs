"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const unknownSegments = parts.slice(0, 55);
const pages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let currentWord = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushWord() {
  if (!currentWord.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: currentWord.slice(),
    });
  }
  currentWord = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!currentWord.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      pages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Printed wraps can continue a word.
    } else {
      flushWord();
    }
  }
}
flushWord();

const wordsByPage = new Map(pages.map((page) => [page.page, page.words]));
const allWords = pages.flatMap((page) =>
  page.words.map((word) => ({ page: page.page, ...word }))
);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent */
function modPow(base, exponent) {
  let result = 1;
  let x = mod29(base);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % 29;
    x = (x * x) % 29;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number[]} values */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} values @param {number} exponent */
function power(values, exponent) {
  return values.map((value) => modPow(value, exponent));
}

/** @param {number[]} values */
function permutations(values) {
  if (values.length <= 1) return [values];
  const out = [];
  for (let index = 0; index < values.length; index += 1) {
    const rest = values.slice(0, index).concat(values.slice(index + 1));
    for (const tail of permutations(rest)) out.push([values[index], ...tail]);
  }
  return out;
}

const target = [23, 5, 28, 0];
const uniquePermutations = [
  ...new Map(permutations(target).map((row) => [row.join(","), row])).values(),
];

const operations = new Map([
  ["cube-before-h4", (values) => h4(power(values, 3))],
  ["h4-before-cube", (values) => power(h4(values), 3)],
  ["inverse-cube-before-h4", (values) => h4(power(values, 19))],
  ["h4-before-inverse-cube", (values) => power(h4(values), 19)],
  ["raw-h4", (values) => h4(values)],
]);

const direction = wordsByPage.get(29)[29];
assert.deepEqual(direction.values, [11, 26, 11, 18]);
assert.deepEqual(operations.get("cube-before-h4")(direction.values), target);

const p23word5 = wordsByPage.get(23)[4];
const p23gp0 = p23word5.values.reduce((sum, value) => sum + value, 0) % 29;
assert.equal(p23word5.start, 16);
assert.deepEqual(p23word5.values, [28, 6, 15, 25, 13, 7, 19, 28]);
assert.equal(p23gp0, 25);
assert.notEqual(p23gp0, 28);

const fourRuneWords = allWords.filter((word) => word.values.length === 4);
assert.equal(fourRuneWords.length, 509);

const counts = {};
for (const [name, operation] of operations) {
  let exact = 0;
  let permuted = 0;
  const permutedHits = [];
  for (const word of fourRuneWords) {
    const output = operation(word.values);
    if (output.every((value, index) => value === target[index])) exact += 1;
    if (
      uniquePermutations.some((candidate) =>
        candidate.every((value, index) => value === output[index])
      )
    ) {
      permuted += 1;
      permutedHits.push([word.page, word.ordinal, word.start, output]);
    }
  }
  counts[name] = { exact, permuted, permutedHits };
}

assert.deepEqual(counts["cube-before-h4"], {
  exact: 1,
  permuted: 1,
  permutedHits: [[29, 30, 108, target]],
});
for (const name of [
  "h4-before-cube",
  "inverse-cube-before-h4",
  "h4-before-inverse-cube",
  "raw-h4",
]) {
  assert.equal(counts[name].exact, 0);
  assert.equal(counts[name].permuted, 0);
}

console.log("PASS DIRECTION cube-before-H4 coordinate holdout");
console.log(JSON.stringify({
  direction: {
    page: 29,
    ordinal: 30,
    values: direction.values,
    output: target,
  },
  sealedHoldout: {
    page: 23,
    ordinal: 5,
    start: p23word5.start,
    values: p23word5.values,
    predictedGp0: 28,
    observedGp0: p23gp0,
    pass: false,
  },
  controls: {
    fourRuneWords: fourRuneWords.length,
    targetPermutations: uniquePermutations.length,
    counts,
  },
}, null, 2));
