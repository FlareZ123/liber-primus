"use strict";

/**
 * SFT: p28 READ OUT -> p0 80..102 -> frozen H-shell DH state readout.
 *
 * Reconstructs the exact four-word receiver from the canonical LP2
 * transcription, applies H(x,y)=(x-y,x+y) mod29 outside-in within each word,
 * and exhausts all contiguous four-word windows on p0..p55 (excluding p50).
 *
 * Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {Array<{start:number,end:number,values:number[]}>}
 */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset - 1, values: current.slice()});
    current = [];
  };

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} values @returns {number[]} */
function hShell(values) {
  const output = [];
  for (let index = 0; index < Math.floor(values.length / 2); index += 1) {
    const left = values[index];
    const right = values[values.length - 1 - index];
    output.push(mod29(left - right), mod29(left + right));
  }
  if (values.length % 2 === 1) {
    output.push(values[(values.length - 1) / 2]);
  }
  assert.equal(output.length, values.length);
  return output;
}

/**
 * @param {number[]} sequence
 * @param {number[]} pattern
 * @returns {number[] | null}
 */
function subsequencePositions(sequence, pattern) {
  const positions = [];
  let patternIndex = 0;
  for (let index = 0; index < sequence.length && patternIndex < pattern.length; index += 1) {
    if (sequence[index] === pattern[patternIndex]) {
      positions.push(index);
      patternIndex += 1;
    }
  }
  return patternIndex === pattern.length ? positions : null;
}

const dh = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
const dhValues = new Set(Object.values(dh));
const orderedDh = [dh.B, dh.p, dh.a, dh.b, dh.A, dh.g, dh.K];

const p0Words = parseWords(physicalPart(0));
const selectedWords = p0Words.slice(17, 21);
assert.deepEqual(selectedWords.map((word) => word.start), [80, 83, 90, 95]);
assert.deepEqual(selectedWords.map((word) => word.end), [82, 89, 94, 102]);
assert.deepEqual(selectedWords.map((word) => word.values.length), [3, 7, 5, 8]);
assert.deepEqual(selectedWords.map((word) => word.values), [
  [21, 25, 2],
  [10, 25, 8, 14, 2, 13, 6],
  [26, 0, 21, 5, 11],
  [2, 24, 19, 10, 21, 10, 27, 26],
]);

const transformed = selectedWords.flatMap((word) => hShell(word.values));
assert.deepEqual(transformed, [
  19, 23, 25,
  4, 16, 12, 9, 6, 10, 14,
  15, 8, 24, 5, 21,
  5, 28, 26, 22, 9, 0, 18, 2,
]);
assert.deepEqual(transformed.slice(0, 2), [dh.B, dh.p]);
assert.equal(transformed.at(-1), dh.K);

const filteredState = transformed.filter((value) => dhValues.has(value));
assert.deepEqual(filteredState, [
  dh.B, dh.p, dh.a, dh.b, dh.A, dh.g, dh.g, dh.K,
]);
assert.equal(new Set(filteredState).size, 7);
assert.deepEqual(subsequencePositions(transformed, orderedDh), [0, 1, 7, 10, 11, 13, 22]);

let totalWindows = 0;
let startsBp = 0;
let endsK = 0;
let bothBoundaries = 0;
let fullStateCoverage = 0;
let total23Windows = 0;
let total23FullCoverage = 0;
let orderedDhHits = 0;
const boundaryHits = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));

  for (let first = 0; first + 3 < words.length; first += 1) {
    totalWindows += 1;
    const window = words.slice(first, first + 4);
    const values = window.flatMap((word) => hShell(word.values));
    const start = window[0].start;
    const end = window[3].end;
    const total = end - start + 1;
    const beginsBp = values[0] === dh.B && values[1] === dh.p;
    const endsShared = values.at(-1) === dh.K;
    const coversState = [...dhValues].every((value) => values.includes(value));
    const ordered = subsequencePositions(values, orderedDh);

    if (beginsBp) startsBp += 1;
    if (endsShared) endsK += 1;
    if (beginsBp && endsShared) {
      bothBoundaries += 1;
      boundaryHits.push({
        page,
        firstWord: first + 1,
        start,
        end,
        lengths: window.map((word) => word.values.length),
        coversState,
      });
    }
    if (coversState) fullStateCoverage += 1;
    if (ordered) orderedDhHits += 1;

    if (total === 23) {
      total23Windows += 1;
      if (coversState) total23FullCoverage += 1;
    }
  }
}

assert.equal(totalWindows, 2763);
assert.equal(startsBp, 3);
assert.equal(endsK, 98);
assert.equal(bothBoundaries, 1);
assert.equal(fullStateCoverage, 17);
assert.equal(total23Windows, 117);
assert.equal(total23FullCoverage, 4);
assert.equal(orderedDhHits, 1);
assert.deepEqual(boundaryHits, [{
  page: 0,
  firstWord: 18,
  start: 80,
  end: 102,
  lengths: [3, 7, 5, 8],
  coversState: true,
}]);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    page: 0,
    firstWord: 18,
    lastWord: 21,
    offsets: [80, 102],
    wordLengths: [3, 7, 5, 8],
    transformed,
    filteredState,
    orderedDhPositions: [0, 1, 7, 10, 11, 13, 22],
  },
  controls: {
    totalFourWordWindows: totalWindows,
    startsWithBp: startsBp,
    endsWithK: endsK,
    bothBoundaries,
    fullStateCoverage,
    total23Windows,
    total23FullCoverage,
    orderedDhHits,
    boundaryHits,
  },
  decision:
    "The independently selected READ OUT p0 receiver becomes a complete DH23 state carrier under the independently selected H shell map; no direct plaintext is claimed.",
}, null, 2));
