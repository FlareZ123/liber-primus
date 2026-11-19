"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha59 = grid.alphabet.replace("f", "");

const state = { g: 5, K: 2, B: 19, b: 15 };
const WITHIN_GP0 = 38;
const GOOD_SOURCE_INDEX = 36;
const CIRCUMFERENCES_GP0 = 131;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number} address @returns {number} */
function base59TableValue(address) {
  const token = tape[address];
  return 59 * alpha59.indexOf(token[0]) + alpha59.indexOf(token[1]);
}

/** @param {number[]} values @returns {number|null} */
function recursiveCore(values) {
  let layer = values.slice();
  while (layer.length > 1) {
    layer = layer.slice(1, -1);
  }
  return layer.length ? layer[0] : null;
}

/**
 * @param {number[][]} wordValues
 * @returns {number[]}
 */
function hiddenRuneCounts(wordValues) {
  let active = wordValues.map((word) => word.length);
  const counts = [active.reduce((sum, length) => sum + length, 0)];

  while (active.length) {
    const next = [];
    for (const length of active) {
      if (length === 1) {
        // A pre-existing center has already emerged.
        continue;
      }
      const innerLength = length - 2;
      if (innerLength > 1) next.push(innerLength);
      // innerLength 1 emerges this round; innerLength 0 vanishes.
    }
    active = next;
    counts.push(active.reduce((sum, length) => sum + length, 0));
  }
  return counts;
}

/**
 * @param {number[][]} wordValues
 * @returns {{cores:number[],gp0:number,h0:number,h1:number,middle:number|null}}
 */
function coreSignature(wordValues) {
  const cores = wordValues.map(recursiveCore).filter((value) => value !== null);
  const pairs = [];
  for (let index = 0; index < Math.floor(cores.length / 2); index += 1) {
    pairs.push(H(cores[index], cores[cores.length - 1 - index]));
  }
  return {
    cores,
    gp0: cores.reduce((sum, value) => sum + value, 0),
    h0: pairs.reduce((sum, pair) => sum + pair[0], 0),
    h1: pairs.reduce((sum, pair) => sum + pair[1], 0),
    middle: cores.length % 2 ? cores[(cores.length - 1) / 2] : null,
  };
}

const segments = raw.split("%").slice(0, 55);
const stream = segments.join("%");

/** @typedef {{page:number,value:number}[]} Word */
/** @type {Word[]} */
const words = [];
/** @type {{page:number,value:number}[]} */
let current = [];
let runePage = 0;

function finishWord() {
  if (!current.length) return;
  words.push(current);
  current = [];
}

for (const character of stream) {
  if (runePattern.test(character)) {
    current.push({ page: runePage, value: runeIndex.get(character) });
  } else if (character === "%") {
    runePage += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Physical line wrapping preserves the current printed word.
  } else {
    finishWord();
  }
}
finishWord();

/** @param {number} page @returns {number} */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

/** @type {Map<number, number[][]>} */
const completeWordsByPhysicalPage = new Map();
for (let page = 0; page < segments.length; page += 1) {
  const completeWords = words
    .filter((word) => word[0].page === page && word[word.length - 1].page === page)
    .map((word) => word.map((site) => site.value));
  completeWordsByPhysicalPage.set(physicalPage(page), completeWords);
}
completeWordsByPhysicalPage.set(50, []);

const p55Words = completeWordsByPhysicalPage.get(55);
assert.ok(p55Words);
assert.equal(p55Words.length, 16);

const p55 = coreSignature(p55Words);
assert.deepEqual(p55.cores, [1, 6, 2, 11, 18]);
assert.equal(p55.cores.length, state.g);
assert.equal(p55.middle, state.K);
assert.equal(p55.gp0, WITHIN_GP0);

const p55HiddenCounts = hiddenRuneCounts(p55Words);
assert.deepEqual(p55HiddenCounts, [75, 41, 23, 7, 5, 3, 0]);

const p55Lengths = p55Words.map((word) => word.length);
const p55EvenLengthSum = p55Lengths
  .filter((length) => length % 2 === 0)
  .reduce((sum, length) => sum + length, 0);
const p55OddLengthSum = p55Lengths
  .filter((length) => length % 2 === 1)
  .reduce((sum, length) => sum + length, 0);

assert.equal(p55Lengths.reduce((sum, length) => sum + length, 0), 75);
assert.equal(p55EvenLengthSum, 42);
assert.equal(p55OddLengthSum, 33);

assert.deepEqual(H(p55.cores[0], p55.cores[4]), [12, 19]);
assert.deepEqual(H(p55.cores[1], p55.cores[3]), [24, 17]);
assert.equal(p55.h0, GOOD_SOURCE_INDEX);
assert.equal(p55.h1, GOOD_SOURCE_INDEX);
assert.deepEqual(
  [H(p55.cores[0], p55.cores[4])[1], H(p55.cores[1], p55.cores[3])[1]],
  [state.B, state.b + state.K]
);

assert.equal(tape[WITHIN_GP0], "2D");
assert.equal(base59TableValue(WITHIN_GP0), CIRCUMFERENCES_GP0);

const pageRows = [];
for (let page = 0; page <= 55; page += 1) {
  const pageWords = completeWordsByPhysicalPage.get(page) || [];
  const signature = coreSignature(pageWords);
  pageRows.push({ physicalPage: page, wordCount: pageWords.length, ...signature });
}

assert.deepEqual(
  pageRows
    .filter((row) => row.cores.length === state.g)
    .map((row) => ({ physicalPage: row.physicalPage, cores: row.cores, gp0: row.gp0 })),
  [
    { physicalPage: 49, cores: [20, 19, 19, 14, 4], gp0: 76 },
    { physicalPage: 55, cores: [1, 6, 2, 11, 18], gp0: WITHIN_GP0 },
  ]
);

assert.deepEqual(
  pageRows.filter((row) => row.gp0 === WITHIN_GP0).map((row) => row.physicalPage),
  [55]
);

let chargedWindows = 0;
let fiveCoreWindows = 0;
let withinWindows = 0;
let total75Windows = 0;
let prefix75To41Windows = 0;
let prefix75To41To23Windows = 0;
let fullHiddenSequenceWindows = 0;
let dualOpenPgpWindows = 0;
const hiddenSequenceHits = [];
const exactHits = [];

for (let page = 0; page <= 55; page += 1) {
  const pageWords = completeWordsByPhysicalPage.get(page) || [];
  for (let start = 0; start + 16 <= pageWords.length; start += 1) {
    chargedWindows += 1;
    const windowWords = pageWords.slice(start, start + 16);
    const signature = coreSignature(windowWords);
    const hiddenCounts = hiddenRuneCounts(windowWords);
    const lengths = windowWords.map((word) => word.length);
    const evenLengthSum = lengths
      .filter((length) => length % 2 === 0)
      .reduce((sum, length) => sum + length, 0);

    if (hiddenCounts[0] === 75) total75Windows += 1;
    if (hiddenCounts[0] === 75 && hiddenCounts[1] === 41) {
      prefix75To41Windows += 1;
    }
    if (
      hiddenCounts[0] === 75
      && hiddenCounts[1] === 41
      && hiddenCounts[2] === 23
    ) {
      prefix75To41To23Windows += 1;
    }
    if (JSON.stringify(hiddenCounts) === JSON.stringify([75, 41, 23, 7, 5, 3, 0])) {
      fullHiddenSequenceWindows += 1;
      hiddenSequenceHits.push({
        physicalPage: page,
        startWord: start + 1,
        hiddenCounts,
        evenLengthSum,
        coreGp0: signature.gp0,
      });
    }
    if (hiddenCounts[0] === 75 && evenLengthSum === 42) {
      dualOpenPgpWindows += 1;
    }

    if (signature.cores.length === state.g) fiveCoreWindows += 1;
    if (signature.gp0 === WITHIN_GP0) withinWindows += 1;
    if (
      signature.cores.length === state.g
      && signature.gp0 === WITHIN_GP0
      && signature.h0 === GOOD_SOURCE_INDEX
      && signature.h1 === GOOD_SOURCE_INDEX
      && signature.middle === state.K
    ) {
      exactHits.push({ physicalPage: page, startWord: start + 1, signature });
    }
  }
}

assert.equal(chargedWindows, 2039);
assert.equal(fiveCoreWindows, 116);
assert.equal(withinWindows, 6);
assert.equal(total75Windows, 76);
assert.equal(prefix75To41Windows, 18);
assert.equal(prefix75To41To23Windows, 2);
assert.equal(fullHiddenSequenceWindows, 1);
assert.equal(dualOpenPgpWindows, 4);
assert.deepEqual(hiddenSequenceHits, [{
  physicalPage: 55,
  startWord: 1,
  hiddenCounts: [75, 41, 23, 7, 5, 3, 0],
  evenLengthSum: 42,
  coreGp0: WITHIN_GP0,
}]);
assert.deepEqual(exactHits, [{
  physicalPage: 55,
  startWord: 1,
  signature: {
    cores: [1, 6, 2, 11, 18],
    gp0: WITHIN_GP0,
    h0: GOOD_SOURCE_INDEX,
    h1: GOOD_SOURCE_INDEX,
    middle: state.K,
  },
}]);

console.log(JSON.stringify({
  status: "PASS",
  operation: "Repeatedly shed each complete word's first and last rune until one center rune remains or the word vanishes.",
  p55: {
    completeWords: p55Words.length,
    cores: p55.cores,
    coreCount: p55.cores.length,
    coreCountState: "g",
    coreGp0: p55.gp0,
    coreGp0Label: "WITHIN",
    middleCore: p55.middle,
    middleCoreState: "K",
    hBranchGp0: [p55.h0, p55.h1],
    hBranchSourceLabel: "GOOD",
    hSumBranchState: ["B", "b+K"],
    postShedP50: {
      address: WITHIN_GP0,
      token: tape[WITHIN_GP0],
      radix: 59,
      value: base59TableValue(WITHIN_GP0),
      label: "CIRCUMFERENCES",
    },
  },
  controls: {
    charged16WordWindows: chargedWindows,
    fiveCoreWindows,
    withinWindows,
    total75Windows,
    prefix75To41Windows,
    prefix75To41To23Windows,
    fullHiddenSequenceWindows,
    dualOpenPgpWindows,
    hiddenSequenceHits,
    exactHits,
  },
}, null, 2));
