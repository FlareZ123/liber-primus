"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length; ) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

const parts = raw.split(/^\s*%\s*$/m);
const unknownSegments = parts.slice(0, 55);
const pages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Continue canonical words through printed wraps.
    } else {
      flushWord();
    }
  }
}
flushWord();

const wordsByPage = new Map(pages.map((page) => [page.page, page.words]));
const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((value) => /^[A-Za-z]+$/u.test(value))
  .map((word, index) => ({
    ordinal: index + 1,
    word: word.toUpperCase(),
    gp: gp(word),
  }));

const fiveRuneOccurrences = source
  .filter((row) => row.gp.length === 5)
  .map((row) => {
    const page = row.ordinal - 1;
    const receiver = (wordsByPage.get(page) || [])[row.ordinal - 1] || null;
    return {
      ordinal: row.ordinal,
      word: row.word,
      page,
      receiverStart: receiver ? receiver.start : null,
      receiverLength: receiver ? receiver.values.length : null,
    };
  });

assert.deepEqual(fiveRuneOccurrences, [
  { ordinal: 1, word: "HELLO", page: 0, receiverStart: 0, receiverLength: 8 },
  { ordinal: 5, word: "EMPTY", page: 4, receiverStart: 22, receiverLength: 2 },
  { ordinal: 7, word: "SEEKS", page: 6, receiverStart: 30, receiverLength: 6 },
  { ordinal: 10, word: "LIBER", page: 9, receiverStart: 36, receiverLength: 11 },
  { ordinal: 16, word: "WORDS", page: 15, receiverStart: 71, receiverLength: 5 },
  { ordinal: 36, word: "FOUND", page: 35, receiverStart: 164, receiverLength: 2 },
  { ordinal: 40, word: "FALSE", page: 39, receiverStart: 176, receiverLength: 3 },
]);
assert.deepEqual(
  fiveRuneOccurrences.filter((row) => row.receiverLength === 5),
  [{ ordinal: 16, word: "WORDS", page: 15, receiverStart: 71, receiverLength: 5 }]
);

const receiver = wordsByPage.get(15)[15];
assert.equal(receiver.start, 71);
assert.deepEqual(receiver.values, [10, 13, 8, 27, 17]);

const targets = [
  ...new Map(
    source
      .filter((row) => row.gp.length === 5)
      .map((row) => [row.gp.join(","), { word: row.word, values: row.gp }])
  ).values(),
];
assert.deepEqual(
  targets.map((row) => row.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]
);
const targetMap = new Map(targets.map((row) => [row.values.join(","), row.word]));
const WORDS = gp("WORDS");
assert.deepEqual(WORDS, [7, 3, 4, 23, 15]);

const W1 = [24, 16, 14, 17];
const titleH = [2, 26, 5, 6];
const B = 19;
const inverse2 = 15;

/** @param {number[]} shell */
function inverseShell5(shell) {
  const [d0, s0, d1, s1, center] = shell;
  return [
    mod29((d0 + s0) * inverse2),
    mod29((d1 + s1) * inverse2),
    center,
    mod29((s1 - d1) * inverse2),
    mod29((s0 - d0) * inverse2),
  ];
}

const pairs = [];
for (let left = 0; left < 4; left += 1) {
  for (let right = left + 1; right < 4; right += 1) {
    pairs.push([left, right]);
  }
}

let labeledForms = 0;
let wordsHits = 0;
let allTargetHits = 0;
const uniqueShells = new Set();

for (let xIndex = 0; xIndex < 4; xIndex += 1) {
  for (let yIndex = 0; yIndex < 4; yIndex += 1) {
    for (let uIndex = 0; uIndex < 4; uIndex += 1) {
      for (let vIndex = 0; vIndex < 4; vIndex += 1) {
        for (const pair of pairs) {
          for (const order of [0, 1]) {
            for (const sign of [-1, 1]) {
              labeledForms += 1;
              const x = W1[xIndex];
              const y = W1[yIndex];
              const z = mod29(titleH[uIndex] * titleH[vIndex]);
              const shell = [null, null, null, null, B];
              shell[pair[0]] = x;
              shell[pair[1]] = x;
              const remaining = [0, 1, 2, 3].filter((slot) => !pair.includes(slot));
              shell[remaining[0]] = order === 0 ? y : z;
              shell[remaining[1]] = order === 0 ? z : y;
              uniqueShells.add(shell.join(","));

              const key = inverseShell5(shell);
              const plain = receiver.values.map((value, index) =>
                mod29(value + sign * key[index])
              );
              if (plain.every((value, index) => value === WORDS[index])) wordsHits += 1;
              if (targetMap.has(plain.join(","))) allTargetHits += 1;
            }
          }
        }
      }
    }
  }
}

assert.equal(labeledForms, 6144);
assert.equal(uniqueShells.size, 1555);
assert.equal(wordsHits, 0);
assert.equal(allTargetHits, 0);

console.log("PASS p6 five-rune WORDS16 prospective negative");
console.log(JSON.stringify({
  fiveRuneOccurrences,
  receiver: {
    projectPage: 15,
    physicalPage: 16,
    ordinal: 16,
    start: receiver.start,
    values: receiver.values,
  },
  target: { word: "WORDS", values: WORDS },
  family: {
    labeledForms,
    uniqueShells: uniqueShells.size,
    wordsHits,
    allAuthenticatedFiveRuneHits: allTargetHits,
  },
}, null, 2));
