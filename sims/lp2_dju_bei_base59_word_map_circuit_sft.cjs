"use strict";

/**
 * Source-exact GP0/base59 word-map circuit from the independently selected
 * DJU / BEI pair.
 *
 * Fixed grammar already established elsewhere:
 *   complete word -> canonical GP0 sum -> p50 table address -> base59 value.
 *
 * This SFT asks whether the selected adjacent pair gives a typed page/offset,
 * then keeps the same base59 rule while requiring every subsequent offset to
 * land exactly at a complete word start. It also freezes the immediate NEXT
 * adjacent pair after DJU/BEI as a blind continuation check. It exhausts every eligible
 * adjacent complete-word occurrence in pp0-55 under the identical rule.
 *
 * Run:
 *   node sims/lp2_dju_bei_base59_word_map_circuit_sft.cjs
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

const RUNIC = /[\u16A0-\u16FF]/u;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {string} token */
function decode59(token) {
  return decode(token, alphabet59);
}

/** @param {string} token */
function decode60(token) {
  return decode(token, alphabet60);
}

/** @param {number} runePage */
function physicalPage(runePage) {
  return runePage >= 50 ? runePage + 1 : runePage;
}

const pageSegments = transcription.split("%").slice(0, 55);
const stream = pageSegments.join("%");
const localOffsets = Array(55).fill(0);
const words = [];

let page = 0;
let current = [];
let startRunePage = 0;
let lastRunePage = 0;
let startOffset = 0;

function finishWord() {
  if (!current.length) return;
  words.push({
    runes: current.map((value) => corpus.runes[value]).join(""),
    translit: current.map((value) => corpus.translit[value]).join(""),
    gp0: current.reduce((sum, value) => sum + value, 0),
    startPage: physicalPage(startRunePage),
    endPage: physicalPage(lastRunePage),
    startOffset,
    length: current.length,
  });
  current = [];
}

for (const character of stream) {
  if (RUNIC.test(character)) {
    if (!current.length) {
      startRunePage = page;
      startOffset = localOffsets[page];
    }
    const value = runeIndex.get(character);
    assert.notEqual(value, undefined);
    current.push(value);
    lastRunePage = page;
    localOffsets[page] += 1;
  } else if (character === "%") {
    page += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Printed line/page wrapping is not a word delimiter.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(words.length, 2896);

const startsByPage = new Map();
const wordAtStart = new Map();
for (const word of words) {
  if (word.startPage !== word.endPage) continue;
  if (!startsByPage.has(word.startPage)) {
    startsByPage.set(word.startPage, new Set());
  }
  startsByPage.get(word.startPage).add(word.startOffset);
  wordAtStart.set(`${word.startPage}:${word.startOffset}`, word);
}

/**
 * Follow the fixed base59 grammar from one adjacent word pair.
 * @param {number} index Index of first word in the global canonical word list.
 */
function followPair(index) {
  const first = words[index];
  const second = words[index + 1];
  if (!first || !second) return null;
  if (
    first.startPage !== first.endPage ||
    second.startPage !== second.endPage ||
    first.startPage !== second.startPage ||
    first.gp0 >= 256 ||
    second.gp0 >= 256
  ) {
    return null;
  }

  const targetPage = decode59(tokens[first.gp0]);
  const targetOffset = decode59(tokens[second.gp0]);
  if (targetPage < 0 || targetPage > 55 || targetPage === 50) return null;

  const starts = startsByPage.get(targetPage);
  if (!starts || !starts.has(targetOffset)) return null;

  const firstLandedWord = wordAtStart.get(`${targetPage}:${targetOffset}`);
  assert.ok(firstLandedWord);
  if (firstLandedWord.gp0 >= 256) return null;

  const secondOffset = decode59(tokens[firstLandedWord.gp0]);
  if (!starts.has(secondOffset)) return null;

  const secondLandedWord = wordAtStart.get(`${targetPage}:${secondOffset}`);
  assert.ok(secondLandedWord);
  if (secondLandedWord.gp0 >= 256) return null;

  const terminal = decode59(tokens[secondLandedWord.gp0]);

  return {
    sourceIndex: index,
    sourcePage: first.startPage,
    sourceOffsets: [first.startOffset, second.startOffset],
    sourceWords: [first.translit, second.translit],
    sourceGp0: [first.gp0, second.gp0],
    targetPage,
    targetOffset,
    firstLandedWord: {
      translit: firstLandedWord.translit,
      gp0: firstLandedWord.gp0,
      startOffset: firstLandedWord.startOffset,
    },
    secondOffset,
    secondLandedWord: {
      translit: secondLandedWord.translit,
      gp0: secondLandedWord.gp0,
      startOffset: secondLandedWord.startOffset,
    },
    terminal,
  };
}

const eligibleIndices = [];
const twoBoundaryHits = [];
const tableReturns = [];

for (let index = 0; index + 1 < words.length; index += 1) {
  const first = words[index];
  const second = words[index + 1];
  if (
    first.startPage !== first.endPage ||
    second.startPage !== second.endPage ||
    first.startPage !== second.startPage ||
    first.gp0 >= 256 ||
    second.gp0 >= 256
  ) {
    continue;
  }
  eligibleIndices.push(index);
  const route = followPair(index);
  if (!route) continue;
  twoBoundaryHits.push(route);
  if (route.terminal === 50) tableReturns.push(route);
}

assert.equal(eligibleIndices.length, 2809);
assert.equal(twoBoundaryHits.length, 23);
assert.equal(tableReturns.length, 2);
assert.deepEqual(
  tableReturns.map((route) => ({
    sourcePage: route.sourcePage,
    sourceOffsets: route.sourceOffsets,
    sourceWords: route.sourceWords,
  })),
  [
    { sourcePage: 27, sourceOffsets: [28, 31], sourceWords: ["DJU", "BEI"] },
    { sourcePage: 55, sourceOffsets: [70, 73], sourceWords: ["DJU", "BEI"] },
  ]
);

// The immediate forward-order NEXT pair after p27 DJU/BEI is a blind holdout.
const blindHoldoutIndex = words.findIndex((word, index) =>
  word.startPage === 27 &&
  word.startOffset === 34 &&
  word.translit === "AEF" &&
  words[index + 1]?.translit === "P" &&
  words[index + 1]?.startOffset === 36
);
assert.notEqual(blindHoldoutIndex, -1);
const blindHoldoutFirst = words[blindHoldoutIndex];
const blindHoldoutSecond = words[blindHoldoutIndex + 1];
assert.deepEqual([blindHoldoutFirst.gp0, blindHoldoutSecond.gp0], [25, 13]);
const blindHoldout = {
  sourcePage: 27,
  sourceOffsets: [blindHoldoutFirst.startOffset, blindHoldoutSecond.startOffset],
  sourceWords: [blindHoldoutFirst.translit, blindHoldoutSecond.translit],
  sourceGp0: [blindHoldoutFirst.gp0, blindHoldoutSecond.gp0],
  sourceTokens: [tokens[25], tokens[13]],
  base59: [decode59(tokens[25]), decode59(tokens[13])],
  base60: [decode60(tokens[25]), decode60(tokens[13])],
};
assert.deepEqual(blindHoldout.sourceOffsets, [34, 36]);
assert.deepEqual(blindHoldout.sourceWords, ["AEF", "P"]);
assert.deepEqual(blindHoldout.sourceTokens, ["3I", "04"]);
assert.deepEqual(blindHoldout.base59, [195, 4]);
assert.deepEqual(blindHoldout.base60, [198, 4]);
assert.equal(followPair(blindHoldoutIndex), null);

for (const route of tableReturns) {
  assert.deepEqual(route.sourceGp0, [35, 45]);
  assert.equal(route.targetPage, 39);
  assert.equal(route.targetOffset, 105);
  assert.deepEqual(route.firstLandedWord, {
    translit: "HGREOT",
    gp0: 46,
    startOffset: 105,
  });
  assert.equal(route.secondOffset, 196);
  assert.deepEqual(route.secondLandedWord, {
    translit: "WLYNU",
    gp0: 63,
    startOffset: 196,
  });
  assert.equal(route.terminal, 50);
}

// Base60 is an explicit falsification control at every branch point.
assert.equal(tokens[35], "0d");
assert.equal(decode59(tokens[35]), 39);
assert.equal(decode60(tokens[35]), 39);
assert.equal(tokens[45], "1l");
assert.equal(decode59(tokens[45]), 105);
assert.equal(decode60(tokens[45]), 107);
assert.ok(startsByPage.get(39).has(105));
assert.ok(!startsByPage.get(39).has(107));

assert.equal(tokens[46], "3J");
assert.equal(decode59(tokens[46]), 196);
assert.equal(decode60(tokens[46]), 199);
assert.ok(startsByPage.get(39).has(196));
assert.ok(!startsByPage.get(39).has(199));

assert.equal(tokens[63], "0p");
assert.equal(decode59(tokens[63]), 50);
assert.equal(decode60(tokens[63]), 51);

// Secondary observation only: selected p39 word-start196 is 44 runes before
// the terminal red13 mark/page end. Do not count this as an independent gate.
const p39 = corpus.pages.find((candidate) => candidate.page === 39);
assert.ok(p39);
assert.equal(p39.indices.length, 240);
assert.equal(p39.indices.length - 196, 44);

console.log(JSON.stringify({
  status:
    "PASS: observed DJU/BEI loop reproduced; immediate NEXT pair AEF/P fails; no authenticated general navigation rule",
  circuit: {
    sourcePair: ["DJU", "BEI"],
    sourceGp0: [35, 45],
    sourceOccurrences: [
      { page: 27, offsets: [28, 31] },
      { page: 55, offsets: [70, 73] },
    ],
    pairTable59: [39, 105],
    firstDestination: {
      page: 39,
      offset: 105,
      word: "HGREOT",
      gp0: 46,
      next59: 196,
    },
    secondDestination: {
      page: 39,
      offset: 196,
      word: "WLYNU",
      gp0: 63,
      next59: 50,
    },
    terminal: "physical p50 numerical table",
  },
  radixControl: {
    pairBase60: [39, 107],
    base60FirstOffsetIsWordStart: false,
    hgReotBase60: 199,
    base60SecondOffsetIsWordStart: false,
    wlynuBase60: 51,
  },
  blindContinuation: blindHoldout,
  census: {
    eligibleAdjacentOccurrences: eligibleIndices.length,
    twoConsecutiveWordStartHits: twoBoundaryHits.length,
    completeP50Returns: tableReturns.length,
    completeP50ReturnPairs: tableReturns.map((route) => ({
      page: route.sourcePage,
      offsets: route.sourceOffsets,
      words: route.sourceWords,
    })),
  },
  secondary: {
    p39RuneCount: p39.indices.length,
    secondSelectedOffset: 196,
    runesToPageEnd: p39.indices.length - 196,
  },
  interpretation:
    "The two DJU/BEI occurrences reproduce the same realized base59 loop, but the immediate forward-order NEXT pair AEF/P maps to p195:4, outside LP2 pages0–55. The loop is an isolated post-hoc observation, not an authenticated general navigation rule or plaintext recovery.",
}, null, 2));
