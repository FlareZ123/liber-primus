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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runePattern = /[\u16A0-\u16FF]/u;
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha59 = grid.alphabet.replace("f", "");

const state = Object.freeze({ g: 5, K: 2, B: 19 });
const DIRECTION_GP0 = 112;
const CIRCUMFERENCES_GP0 = 131;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number, number]} */
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
    // Printed line wrapping preserves the current word.
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

assert.match(signed2016, /their\s+numbers\s+are\s+the\s+direction/i);
const directionRunes = [23, 10, 4, 18, 5, 16, 27, 9]; // D I R E C T IA N
assert.equal(directionRunes.reduce((sum, value) => sum + value, 0), DIRECTION_GP0);

const p49Words = completeWordsByPhysicalPage.get(49);
const p55Words = completeWordsByPhysicalPage.get(55);
assert.ok(p49Words);
assert.ok(p55Words);
assert.equal(p49Words.length, 17);
assert.equal(p55Words.length, 16);

const p49 = coreSignature(p49Words);
const p55 = coreSignature(p55Words);

assert.deepEqual(p49.cores, [20, 19, 19, 14, 4]);
assert.equal(p49.cores.length, state.g);
assert.equal(p49.middle, state.B);
assert.equal(p49.gp0, 76);
assert.equal(p49.h0, 21);
assert.equal(p49.h1, 28);
assert.equal(tape[p49.gp0], "1s");
assert.equal(base59TableValue(p49.gp0), DIRECTION_GP0);

assert.deepEqual(p55.cores, [1, 6, 2, 11, 18]);
assert.equal(p55.cores.length, state.g);
assert.equal(p55.middle, state.K);
assert.equal(p55.gp0, 38);
assert.equal(p55.h0, 36);
assert.equal(p55.h1, 36);
assert.equal(tape[p55.gp0], "2D");
assert.equal(base59TableValue(p55.gp0), CIRCUMFERENCES_GP0);

const fiveCorePages = [];
const directionPages = [];
for (let page = 0; page <= 55; page += 1) {
  const signature = coreSignature(completeWordsByPhysicalPage.get(page) || []);
  if (signature.cores.length === state.g) {
    fiveCorePages.push({
      page,
      wordCount: (completeWordsByPhysicalPage.get(page) || []).length,
      ...signature,
      postShedBase59: signature.gp0 < tape.length
        ? base59TableValue(signature.gp0)
        : null,
    });
  }
  if (
    signature.gp0 < tape.length
    && base59TableValue(signature.gp0) === DIRECTION_GP0
  ) {
    directionPages.push(page);
  }
}

assert.deepEqual(
  fiveCorePages.map((row) => ({
    page: row.page,
    cores: row.cores,
    gp0: row.gp0,
    postShedBase59: row.postShedBase59,
  })),
  [
    { page: 49, cores: [20, 19, 19, 14, 4], gp0: 76, postShedBase59: DIRECTION_GP0 },
    { page: 55, cores: [1, 6, 2, 11, 18], gp0: 38, postShedBase59: CIRCUMFERENCES_GP0 },
  ],
);
assert.deepEqual(directionPages, [49]);

let chargedWindows = 0;
let fiveCoreWindows = 0;
let fiveCoreDirectionWindows = 0;
let p49FullSignatureWindows = 0;
let p55FullSignatureWindows = 0;
const directionWindowHits = [];

for (let page = 0; page <= 55; page += 1) {
  const pageWords = completeWordsByPhysicalPage.get(page) || [];
  for (let start = 0; start + 16 <= pageWords.length; start += 1) {
    chargedWindows += 1;
    const signature = coreSignature(pageWords.slice(start, start + 16));
    const output = signature.gp0 < tape.length
      ? base59TableValue(signature.gp0)
      : null;

    if (signature.cores.length === state.g) {
      fiveCoreWindows += 1;
      if (output === DIRECTION_GP0) {
        fiveCoreDirectionWindows += 1;
        directionWindowHits.push({
          page,
          startWord: start + 1,
          cores: signature.cores,
          gp0: signature.gp0,
          h0: signature.h0,
          h1: signature.h1,
          middle: signature.middle,
        });
      }
    }

    if (
      signature.cores.length === state.g
      && signature.gp0 === 76
      && signature.h0 === 21
      && signature.h1 === 28
      && signature.middle === state.B
    ) {
      p49FullSignatureWindows += 1;
    }

    if (
      signature.cores.length === state.g
      && signature.gp0 === 38
      && signature.h0 === 36
      && signature.h1 === 36
      && signature.middle === state.K
    ) {
      p55FullSignatureWindows += 1;
    }
  }
}

assert.equal(chargedWindows, 2039);
assert.equal(fiveCoreWindows, 116);
assert.equal(fiveCoreDirectionWindows, 8);
assert.equal(p49FullSignatureWindows, 2);
assert.equal(p55FullSignatureWindows, 1);
assert.deepEqual(
  directionWindowHits.filter((hit) => hit.page === 49).map((hit) => hit.startWord),
  [1, 2],
);

console.log(JSON.stringify({
  status: "PASS",
  operation: "Recursively shed each complete word's first and last rune; sum surviving centers; use that GP0 as the fixed zero-based p50 address; read the fixed post-SHED base59 value.",
  p49: {
    completeWords: p49Words.length,
    cores: p49.cores,
    translitCores: p49.cores.map((value) => corpus.translit[value]),
    coreCount: p49.cores.length,
    middle: p49.middle,
    HBranchSums: [p49.h0, p49.h1],
    coreGp0: p49.gp0,
    p50Token: tape[p49.gp0],
    postShedBase59: base59TableValue(p49.gp0),
    authenticatedLabel: "DIRECTION",
  },
  p55Control: {
    cores: p55.cores,
    coreGp0: p55.gp0,
    postShedBase59: base59TableValue(p55.gp0),
    label: "CIRCUMFERENCES",
  },
  controls: {
    fiveCorePages,
    charged16WordWindows: chargedWindows,
    fiveCoreWindows,
    fiveCoreDirectionWindows,
    p49FullSignatureWindows,
    p55FullSignatureWindows,
    directionWindowHits,
  },
}, null, 2));
