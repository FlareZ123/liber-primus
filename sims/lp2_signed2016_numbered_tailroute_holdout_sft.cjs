"use strict";

/**
 * Source-only SFT for Director Issue #1877.
 *
 * Tests the exact fixed interpretation: signed-source zero-based index i
 * selects physical LP2 page p(i), then the (i+1)th complete canonical word
 * wholly on that page. It also executes Agent16's precommitted p42->p43
 * holdout without changing receiver, origin, orientation, or operation.
 *
 * Run: node sims/lp2_signed2016_numbered_tailroute_holdout_sft.cjs
 * Node 22 / CommonJS / standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const sourcePages = transcription.split("%");
const unknownSource = sourcePages.slice(0, 55).join("%");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

const allWords = [];
const wordsByPage = new Map();
let segment = 0;
let current = [];
let breaks = [];
const offsets = Array(58).fill(0);

function finishWord() {
  if (current.length === 0) return;

  const segments = [...new Set(current.map((site) => site.segment))];
  const word = {
    startPage: physicalPage(segments[0]),
    endPage: physicalPage(segments[segments.length - 1]),
    start: current[0].offset,
    end: current[current.length - 1].offset,
    values: current.map((site) => site.value),
    breaks: breaks.slice(),
  };
  allWords.push(word);

  // The issue's numbered receiver means a complete canonical word wholly
  // on the assigned physical page. Page and line wraps do not flush words.
  if (segments.length === 1) {
    const page = physicalPage(segments[0]);
    if (page <= 55) {
      const pageWords = wordsByPage.get(page) || [];
      pageWords.push({
        ...word,
        ordinal: pageWords.length + 1,
      });
      wordsByPage.set(page, pageWords);
    }
  }

  current = [];
  breaks = [];
}

for (const character of unknownSource) {
  if (character === "%") {
    segment += 1;
  } else if (runeIndex.has(character)) {
    current.push({
      segment,
      offset: offsets[segment],
      value: runeIndex.get(character),
    });
    offsets[segment] += 1;
  } else if (character === "/") {
    if (current.length > 0) breaks.push(current.length);
  } else if (/\s/u.test(character)) {
    // Printed line wrapping is not a word delimiter.
  } else {
    finishWord();
  }
}
finishWord();

const signedClear = signedSource.slice(
  0,
  signedSource.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const signedBody = signedClear.slice(signedClear.indexOf("Hello."));
const signedWords =
  signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);

const expectedSourceWords = [
  "SEEK", "AND", "YOU", "WILL", "BE", "FOUND", "GOOD",
  "LUCK", "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
];
assert.deepEqual(
  signedWords.slice(30, 43).map((word) => word.toUpperCase()),
  expectedSourceWords
);

const gp0 = (word) => word.values.reduce((sum, value) => sum + value, 0);
const describe = (word) => ({
  ordinal: word.ordinal,
  start: word.start,
  end: word.end,
  length: word.values.length,
  values: word.values,
  gp0: gp0(word),
  breaks: word.breaks,
});

const rows = [];
for (let index = 30; index <= 42; index += 1) {
  const pageWords = wordsByPage.get(index) || [];
  const word = pageWords[index];
  rows.push({
    sourceIndex: index,
    sourceWord: signedWords[index].toUpperCase(),
    page: index,
    localOrdinal: index + 1,
    pageWordCount: pageWords.length,
    receiver: word ? describe(word) : null,
  });
}

assert.equal(allWords.length, 2896);
assert.equal(allWords.filter((word) => word.startPage !== word.endPage).length, 32);
assert.deepEqual(
  rows.map((row) => row.pageWordCount),
  [60, 63, 21, 52, 60, 60, 49, 53, 47, 55, 54, 60, 56]
);

const expectedReceivers = [
  [130, 132, [28, 4, 12], 44],
  [126, 128, [12, 23, 1], 36],
  null,
  [130, 131, [12, 24], 36],
  [148, 152, [25, 14, 18, 9, 7], 73],
  [164, 165, [14, 5], 19],
  [174, 179, [1, 2, 15, 1, 23, 20], 62],
  [146, 149, [3, 2, 6, 27], 38],
  [184, 185, [8, 5], 13],
  [176, 178, [5, 13, 10], 28],
  [171, 175, [0, 23, 4, 28, 6], 61],
  [178, 184, [27, 12, 5, 0, 17, 13, 19], 93],
  [206, 208, [16, 0, 14], 30],
];

for (let i = 0; i < rows.length; i += 1) {
  const actual = rows[i].receiver;
  const expected = expectedReceivers[i];
  if (expected === null) {
    assert.equal(actual, null);
  } else {
    assert.deepEqual(
      [actual.start, actual.end, actual.values, actual.gp0],
      expected
    );
  }
}

// p32 contains one incoming crossing word at offset0 and only 21 complete
// page-local words. There is no 33rd canonical local receiver.
const p32 = wordsByPage.get(32) || [];
const p32Incoming = allWords.filter(
  (word) => word.startPage === 31 && word.endPage === 32
);
const p32Outgoing = allWords.filter(
  (word) => word.startPage === 32 && word.endPage === 33
);
assert.equal(p32.length, 21);
assert.equal(p32Incoming.length, 1);
assert.equal(p32Outgoing.length, 0);
assert.deepEqual(
  [p32Incoming[0].start, p32Incoming[0].end, p32Incoming[0].values],
  [266, 0, [28, 19, 3, 20]]
);
assert.equal(p32[32], undefined);

// Reproduce Agent16's exact p42 receiver and H3 output.
const p42 = wordsByPage.get(42) || [];
const p42Word43 = p42[42];
assert.ok(p42Word43);
assert.deepEqual(
  [p42Word43.start, p42Word43.end, p42Word43.values],
  [206, 208, [16, 0, 14]]
);
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
const H = (left, right) => [
  mod(left - right, 29),
  mod(left + right, 29),
];
const h3 = [...H(p42Word43.values[0], p42Word43.values[2]), p42Word43.values[1]];
assert.deepEqual(h3, [2, 1, 0]);
assert.deepEqual([...h3].sort((a, b) => a - b), [0, 1, 2]);
assert.deepEqual(
  signedWords.slice(0, 3).map((word) => word.toUpperCase()),
  ["HELLO", "THE", "PATH"]
);
assert.equal(signedWords[3].toUpperCase(), "LIES");

// The incoming p42->p43 word occupies p43 offsets0..1. The first complete
// word beginning on p43 is therefore p43 local word1 at offsets2..5.
const p43Incoming = allWords.filter(
  (word) => word.startPage === 42 && word.endPage === 43
);
assert.equal(p43Incoming.length, 1);
assert.deepEqual(
  [p43Incoming[0].start, p43Incoming[0].end, p43Incoming[0].values],
  [263, 1, [23, 28, 1, 9, 21, 0, 9, 18, 25, 8, 11]]
);
const p43 = wordsByPage.get(43) || [];
const p43Word1 = p43[0];
assert.ok(p43Word1);
assert.deepEqual(
  [p43Word1.start, p43Word1.end, p43Word1.values],
  [2, 5, [10, 18, 16, 27]]
);
assert.equal(p43Word1.values.length, 4);
assert.equal(gp0(p43Word1), 71);
assert.notDeepEqual(p43Word1.values, [3]);

process.stdout.write(JSON.stringify({
  status: "PASS — exact numbered-tailroute rejected",
  canonicalCorpus: {
    unknownPageWords: allWords.length,
    crossingWords: allWords.filter((word) => word.startPage !== word.endPage).length,
  },
  numberedCoordinates: rows,
  p32Boundary: {
    incomingWord: {
      startPage: 31,
      endPage: 32,
      startOffset: p32Incoming[0].start,
      endOffset: p32Incoming[0].end,
      values: p32Incoming[0].values,
    },
    completeLocalWords: p32.length,
    ordinal33Exists: false,
  },
  p42ToP43Holdout: {
    p42Word43: { start: p42Word43.start, end: p42Word43.end, values: p42Word43.values },
    h3: h3,
    ascendingRegister: [0, 1, 2],
    sourceWords: ["HELLO", "THE", "PATH", "LIES"],
    frozenPrediction: { page: 43, localWordOrdinal: 1, values: [3], length: 1 },
    observed: {
      start: p43Word1.start,
      end: p43Word1.end,
      values: p43Word1.values,
      length: p43Word1.values.length,
      gp0: gp0(p43Word1),
    },
    passed: false,
  },
  verdict:
    "The p32 word33 receiver does not exist, and the precommitted p43 word1 prediction fails. This rejects only the exact p(i)/local-word(i+1) tailroute; it does not refute independent p36-p40 correspondences or the separate p55-directed source-register recovery.",
}, null, 2) + "\n");
