"use strict";

/**
 * Source-exact SFT for the p28 BASE29 -> GOODBYE bracket.
 *
 * Reconstructs the authenticated command cut points through the frozen
 * GP0 -> p50 -> base59 grammar, then checks the bracketed p28 words and
 * literal circumference-peel signatures manuscript-wide.
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
const signedProtocol = read("resources/external/2013-tcp-server-signed-source.md");

assert.match(
  signedProtocol,
  /RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, and GOODBYE/
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");
const parts = transcription.split(/\r?\n%\r?\n/);

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} text */
function englishToGp(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP text at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} token */
function decode59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 59 + low;
}

/** @param {string} text */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} physicalPage */
function wordsOnPhysicalPage(physicalPage) {
  assert.notEqual(physicalPage, 50);
  const partIndex = physicalPage <= 49 ? physicalPage : physicalPage - 1;
  return runeWords(parts[partIndex]);
}

/** @param {number[]} word */
function peelSums(word) {
  const output = [];
  for (let current = word; current.length > 0; current = current.slice(1, -1)) {
    output.push(sum(current));
  }
  return output;
}

const base29Address = sum(englishToGp("BASE29"));
const goodbyeAddress = sum(englishToGp("GOODBYE"));
const nextAddress = sum(englishToGp("NEXT"));
assert.deepEqual(
  { base29Address, goodbyeAddress, nextAddress },
  { base29Address: 74, goodbyeAddress: 96, nextAddress: 57 }
);

assert.equal(table[base29Address], "3P");
assert.equal(table[goodbyeAddress], "3g");
const base29Cut = decode59(table[base29Address]);
const goodbyeCut = decode59(table[goodbyeAddress]);
assert.deepEqual({ base29Cut, goodbyeCut }, { base29Cut: 202, goodbyeCut: 218 });

const p28Words = wordsOnPhysicalPage(28);
assert.equal(p28Words.length, 59);

let cursor = 0;
const p28Rows = p28Words.map((word, index) => {
  const start = cursor;
  cursor += word.length;
  return {
    number: index + 1,
    start,
    end: cursor - 1,
    values: word,
    gp0: sum(word),
    peels: peelSums(word),
  };
});
assert.equal(cursor, 269);

const bracket = p28Rows.slice(43, 46);
assert.deepEqual(
  bracket.map((row) => [row.number, row.start, row.end, row.values, row.gp0]),
  [
    [44, 202, 206, [24, 18, 19, 13, 9], 83],
    [45, 207, 211, [0, 28, 6, 23, 17], 74],
    [46, 212, 217, [3, 14, 6, 9, 26, 6], 64],
  ]
);
assert.equal(bracket[0].start, base29Cut);
assert.equal(bracket[2].end + 1, goodbyeCut);
assert.deepEqual(bracket.map((row) => row.peels), [
  [83, 50, 19],
  [74, 57, 6],
  [64, 55, 15],
]);

const allWords = runeWords(parts.slice(0, 55).join("\n"));
assert.equal(allWords.length, 2896);

const signatures = [
  [83, 50, 19],
  [74, 57, 6],
  [64, 55, 15],
];
const signatureCounts = signatures.map(() => 0);
for (const word of allWords) {
  const peels = peelSums(word);
  for (let index = 0; index < signatures.length; index += 1) {
    const signature = signatures[index];
    if (signature.every((value, position) => peels[position] === value)) {
      signatureCounts[index] += 1;
    }
  }
}
assert.deepEqual(signatureCounts, [1, 1, 1]);

let tripleHits = 0;
for (let index = 0; index + 2 < allWords.length; index += 1) {
  if (
    sum(allWords[index]) === 83 &&
    sum(allWords[index + 1]) === 74 &&
    sum(allWords[index + 2]) === 64
  ) {
    tripleHits += 1;
  }
}
assert.equal(allWords.length - 2, 2894);
assert.equal(tripleHits, 1);

console.log(JSON.stringify({
  status: "PASS",
  cuts: {
    BASE29: { address: 74, token: "3P", base59: 202 },
    GOODBYE: { address: 96, token: "3g", base59: 218 },
  },
  bracket: bracket.map((row) => ({
    word: row.number,
    start: row.start,
    end: row.end,
    gp0: row.gp0,
    peels: row.peels,
  })),
  corpus: {
    words: allWords.length,
    tripleWindows: allWords.length - 2,
    ordered837464Hits: tripleHits,
    nestedSignatureCounts: signatureCounts,
  },
}, null, 2));
