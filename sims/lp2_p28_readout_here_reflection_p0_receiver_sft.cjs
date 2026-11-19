"use strict";

/**
 * Source-only p28 READ OUT HERE -> reflected p50 geometry -> p0 receiver.
 *
 * Uses only:
 * - canonical GP0 word values,
 * - the source-derived p28 DH state,
 * - the source-visible 32x8 p50 horizontal reflection,
 * - canonical LP2 printed-word parsing.
 *
 * It never interprets p50 token values as LP rune offsets.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number} address @returns {number} */
function reflect8(address) {
  const row = Math.floor(address / 8);
  const column = address % 8;
  return row * 8 + (7 - column);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} fragment @returns {number[]} */
function runeValues(fragment) {
  return [...fragment]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/** @param {number[]} fragment @returns {number[]} */
function outerH(fragment) {
  assert.ok(fragment.length >= 2);
  return [
    mod29(fragment[0] - fragment.at(-1)),
    mod29(fragment[0] + fragment.at(-1)),
  ];
}

// Reconstruct the directly labeled p28 DH state fields needed below.
const p28Lines = physicalPart(28)
  .trim()
  .split("/")
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
const line6Fragments = (
  p28Lines[5].match(/[\u16A0-\u16FF]+/gu) || []
).map(runeValues);
assert.equal(line6Fragments.length, 5);
assert.deepEqual(line6Fragments[0], [23, 8]); // literal D,H => p,A
assert.deepEqual(outerH(line6Fragments[0]), [15, 2]); // b,K
assert.deepEqual(outerH(line6Fragments.at(-1)), [8, 19]); // A,B
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };

// Canonical GP values. READ uses the dedicated EA rune.
const READ = [4, 28, 23];
const OUT = [3, 1, 16];
const HERE = [8, 18, 4, 18];
const READOUT = [...READ, ...OUT];

assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);
assert.equal(gp0(HERE), 48);
assert.equal(gp0(READOUT), 75);

// P50 has A=8 columns. Its source-visible horizontal reflection is c -> 7-c.
assert.equal(state.A, 8);
assert.equal(reflect8(gp0(READ)), gp0(HERE));
assert.equal(reflect8(gp0(HERE)), gp0(READ));
assert.equal(reflect8(gp0(OUT)), state.B);
const roadReceiverSum = reflect8(gp0(READOUT));
assert.equal(roadReceiverSum, 76);

// Coordinate form of the same identities.
assert.deepEqual(
  [Math.floor(gp0(HERE) / state.A), gp0(HERE) % state.A],
  [state.a, 0]
);
assert.deepEqual(
  [Math.floor(gp0(READ) / state.A), gp0(READ) % state.A],
  [state.a, state.A - 1]
);
assert.deepEqual(
  [Math.floor(gp0(OUT) / state.A), gp0(OUT) % state.A],
  [state.K, state.a - state.K]
);
assert.equal(state.A - 1 - (state.a - state.K), 3); // GP(O)
assert.equal(reflect8(gp0(OUT)), state.B);

// Canonical complete-word parser: physical page boundaries do not flush a word.
const physicalPages = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  physicalPages.push({ page, text: physicalPart(page) });
}

const words = [];
let current = [];
let startPage = null;
let startOffset = 0;

function flush() {
  if (!current.length) return;
  words.push({
    startPage,
    startOffset,
    values: current.slice(),
    gp0: gp0(current),
  });
  current = [];
  startPage = null;
}

for (const { page, text } of physicalPages) {
  let offset = 0;
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
}
flush();

assert.equal(words.length, 2896);

const receiverHits = [];
for (let index = 0; index + 1 < words.length; index += 1) {
  if (
    words[index].gp0 === gp0(OUT) &&
    words[index + 1].gp0 === roadReceiverSum
  ) {
    receiverHits.push({
      word: index + 1,
      first: words[index],
      second: words[index + 1],
    });
  }
}
assert.deepEqual(receiverHits, [{
  word: 22,
  first: {
    startPage: 0,
    startOffset: 103,
    values: [8, 12],
    gp0: 20,
  },
  second: {
    startPage: 0,
    startOffset: 105,
    values: [16, 8, 25, 27],
    gp0: 76,
  },
}]);

// At the independently selected two-rune receiver, the authenticated 2016
// two-rune vocabulary contains THE=[2,18], IS=[10,15], BE=[17,18].
// Exhaust all ordered pairs of distinct DH fields and both additive signs.
const signedTwoRune = new Map([
  ["2,18", "THE"],
  ["10,15", "IS"],
  ["17,18", "BE"],
]);
const firstCipher = receiverHits[0].first.values;
const sourceVocabularyHits = [];

for (const [leftName, leftValue] of Object.entries(state)) {
  for (const [rightName, rightValue] of Object.entries(state)) {
    if (leftName === rightName) continue;
    for (const sign of [-1, 1]) {
      const output = [
        mod29(firstCipher[0] + sign * leftValue),
        mod29(firstCipher[1] + sign * rightValue),
      ];
      const word = signedTwoRune.get(output.join(","));
      if (word) {
        sourceVocabularyHits.push({
          key: [leftName, rightName],
          values: [leftValue, rightValue],
          sign,
          output,
          word,
        });
      }
    }
  }
}

assert.deepEqual(sourceVocabularyHits, [
  {
    key: ["p", "a"],
    values: [23, 6],
    sign: 1,
    output: [2, 18],
    word: "THE",
  },
  {
    key: ["a", "p"],
    values: [6, 23],
    sign: -1,
    output: [2, 18],
    word: "THE",
  },
]);

// The two rows are residue-equivalent modulo29.
assert.deepEqual(
  [mod29(-state.a), mod29(-state.p)],
  [state.p, state.a]
);
assert.deepEqual(
  [mod29(2 + state.a), mod29(18 + state.p)],
  firstCipher
);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "Source-linked receiver route: p50 reflection maps READ<->HERE and OUT->B, then maps READOUT GP0 75 to 76. The pair [OUT GP0=20,76] uniquely selects p0 words22-23 across all 2895 canonical adjacencies. At the selected two-rune word, the complete ordered-DH-pair/sign family has one residue-equivalent authenticated-2016 vocabulary result: THE.",
  state,
  reflection: {
    READ_to_HERE: [gp0(READ), reflect8(gp0(READ))],
    HERE_to_READ: [gp0(HERE), reflect8(gp0(HERE))],
    OUT_to_B: [gp0(OUT), reflect8(gp0(OUT))],
    READOUT_to_receiverSum: [gp0(READOUT), roadReceiverSum],
  },
  receiver: receiverHits[0],
  controls: {
    canonicalWords: words.length,
    canonicalAdjacencies: words.length - 1,
    receiverHitCount: receiverHits.length,
    sourceVocabularyHits,
  },
}, null, 2));
