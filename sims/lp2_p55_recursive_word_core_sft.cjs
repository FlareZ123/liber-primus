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

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const WITHIN_GP0 = 38;
const GOOD_SOURCE_INDEX = 36;
const CIRCUMFERENCES_GP0 = 131;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let value = 1;
  for (let index = 0; index < exponent; index += 1) {
    value = (value * base) % modulus;
  }
  return value;
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
 * Return the H coordinates for every recursive layer on which exactly one
 * active word remains and still has a circumference pair.
 * @param {number[][]} wordValues
 * @returns {{depth:number,wordIndex:number,length:number,h:[number,number]}[]}
 */
function singleSurvivorHLayers(wordValues) {
  let active = wordValues.map((values, index) => ({
    values: values.slice(),
    index,
  }));
  const layers = [];
  let depth = 0;

  while (active.length) {
    if (active.length === 1 && active[0].values.length >= 2) {
      const values = active[0].values;
      layers.push({
        depth,
        wordIndex: active[0].index,
        length: values.length,
        h: H(values[0], values[values.length - 1]),
      });
    }

    const next = [];
    for (const word of active) {
      if (word.values.length <= 1) continue;
      const inner = word.values.slice(1, -1);
      if (inner.length > 1) {
        next.push({ values: inner, index: word.index });
      }
    }
    active = next;
    depth += 1;
  }

  return layers;
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

const numberedDiagonal = [];
for (let sourceIndex = 0; sourceIndex <= 42; sourceIndex += 1) {
  const pageWords = completeWordsByPhysicalPage.get(sourceIndex) || [];
  const oneBasedWord = sourceIndex + 1;
  if (oneBasedWord > pageWords.length) continue;

  const values = pageWords[oneBasedWord - 1];
  const row = {
    sourceIndex,
    physicalPage: sourceIndex,
    oneBasedWord,
    values,
    gp0: values.reduce((sum, value) => sum + value, 0),
    h: values.length === 2 ? H(values[0], values[1]) : null,
  };
  numberedDiagonal.push(row);
}

const p24Diagonal = numberedDiagonal.find((row) => row.sourceIndex === 24);
assert.ok(p24Diagonal);
assert.deepEqual(p24Diagonal, {
  sourceIndex: 24,
  physicalPage: 24,
  oneBasedWord: 25,
  values: [27, 15],
  gp0: 42,
  h: [12, 13],
});

const twoRuneDiagonal = numberedDiagonal.filter((row) => row.h !== null);
const ascendingDiagonal = twoRuneDiagonal.filter((row) =>
  row.h[1] === row.h[0] + 1
);
const descendingDiagonal = twoRuneDiagonal.filter((row) =>
  row.h[0] === row.h[1] + 1
);

assert.equal(numberedDiagonal.length, 42);
assert.equal(twoRuneDiagonal.length, 10);
assert.deepEqual(
  ascendingDiagonal.map((row) => ({
    sourceIndex: row.sourceIndex,
    h: row.h,
  })),
  [{ sourceIndex: 24, h: [12, 13] }]
);
assert.deepEqual(
  descendingDiagonal.map((row) => ({
    sourceIndex: row.sourceIndex,
    h: row.h,
  })),
  [{ sourceIndex: 11, h: [26, 25] }]
);

const p12Diagonal = numberedDiagonal.find((row) => row.sourceIndex === 12);
const p13Diagonal = numberedDiagonal.find((row) => row.sourceIndex === 13);
assert.ok(p12Diagonal);
assert.ok(p13Diagonal);

assert.deepEqual(p12Diagonal.values, [28, 1, 0, 15, 20]);
assert.equal(p12Diagonal.gp0, 64);
assert.deepEqual([
  ...H(p12Diagonal.values[0], p12Diagonal.values[4]),
  ...H(p12Diagonal.values[1], p12Diagonal.values[3]),
  p12Diagonal.values[2],
], [8, 19, 15, 16, 0]);

assert.deepEqual(p13Diagonal.values, [18, 3, 25, 6, 26, 20]);
assert.equal(p13Diagonal.gp0, 98);

const p13OuterH = H(
  p13Diagonal.values[0],
  p13Diagonal.values[p13Diagonal.values.length - 1]
);
assert.deepEqual(p13OuterH, [27, 9]);

const outerHRows = numberedDiagonal
  .filter((row) => row.values.length >= 2)
  .map((row) => ({
    sourceIndex: row.sourceIndex,
    h: H(row.values[0], row.values[row.values.length - 1]),
  }));
const exactWayLiberOuter = outerHRows.filter((row) =>
  row.h[0] === 27 && row.h[1] === 9
);
const outerSumLiber = outerHRows.filter((row) => row.h[1] === 9);

assert.deepEqual(exactWayLiberOuter, [
  { sourceIndex: 13, h: [27, 9] },
]);
assert.deepEqual(
  outerSumLiber.map((row) => row.sourceIndex),
  [1, 8, 13]
);
assert.deepEqual([
  ...H(p13Diagonal.values[0], p13Diagonal.values[5]),
  ...H(p13Diagonal.values[1], p13Diagonal.values[4]),
  ...H(p13Diagonal.values[2], p13Diagonal.values[3]),
], [27, 9, 6, 0, 19, 2]);

const adjacentDiagonal = [];
for (let sourceIndex = 0; sourceIndex < 42; sourceIndex += 1) {
  const left = numberedDiagonal.find((row) => row.sourceIndex === sourceIndex);
  const right = numberedDiagonal.find((row) => row.sourceIndex === sourceIndex + 1);
  if (!left || !right) continue;
  adjacentDiagonal.push({
    from: sourceIndex,
    to: sourceIndex + 1,
    rise: right.gp0 - left.gp0,
  });
}
const theirRise = adjacentDiagonal.filter((pair) => pair.rise === 34);
const absoluteTheirRise = adjacentDiagonal.filter((pair) => Math.abs(pair.rise) === 34);

assert.equal(adjacentDiagonal.length, 40);
assert.deepEqual(theirRise, [{ from: 12, to: 13, rise: 34 }]);
assert.deepEqual(absoluteTheirRise, [{ from: 12, to: 13, rise: 34 }]);

assert.equal(tape[p12Diagonal.gp0], "22");
assert.deepEqual([
  grid.alphabet.indexOf(tape[p12Diagonal.gp0][0]),
  grid.alphabet.indexOf(tape[p12Diagonal.gp0][1]),
], [state.K, state.K]);

const diagonalKkHits = numberedDiagonal.filter((row) => {
  if (row.gp0 < 0 || row.gp0 >= tape.length) return false;
  const token = tape[row.gp0];
  return (
    grid.alphabet.indexOf(token[0]) === state.K
    && grid.alphabet.indexOf(token[1]) === state.K
  );
});
assert.deepEqual(
  diagonalKkHits.map((row) => row.sourceIndex),
  [12]
);

const firstTheirDiagonal = numberedDiagonal.find((row) => row.sourceIndex === 19);
const secondTheirDiagonal = numberedDiagonal.find((row) => row.sourceIndex === 25);
assert.ok(firstTheirDiagonal);
assert.ok(secondTheirDiagonal);

assert.equal(firstTheirDiagonal.gp0, 114);
assert.deepEqual(secondTheirDiagonal.values, [20, 9]);
assert.equal(secondTheirDiagonal.gp0, 29);

const direction29DiagonalHits = numberedDiagonal.filter((row) => row.gp0 === 29);
assert.deepEqual(
  direction29DiagonalHits.map((row) => row.sourceIndex),
  [25]
);

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

const p55SingleLayers = singleSurvivorHLayers(p55Words);
assert.deepEqual(p55SingleLayers, [
  { depth: 3, wordIndex: 6, length: 7, h: [6, 22] },
  { depth: 4, wordIndex: 6, length: 5, h: [26, 23] },
  { depth: 5, wordIndex: 6, length: 3, h: [14, 24] },
]);
assert.deepEqual(p55SingleLayers.map((layer) => layer.h[1]), [22, 23, 24]);

const pFromHiddenCounts = p55HiddenCounts[2];
const gPlusKFromHiddenCounts = p55HiddenCounts[3];
const gFromHiddenCounts = p55HiddenCounts[4];
const eFromHiddenCounts = p55HiddenCounts[5];
const KFromHiddenCounts = gPlusKFromHiddenCounts - gFromHiddenCounts;

assert.equal(pFromHiddenCounts, state.p);
assert.equal(gFromHiddenCounts, state.g);
assert.equal(eFromHiddenCounts, state.e);
assert.equal(KFromHiddenCounts, state.K);
assert.deepEqual([
  p55HiddenCounts[2] - p55HiddenCounts[3],
  p55HiddenCounts[3] - p55HiddenCounts[4],
  p55HiddenCounts[4] - p55HiddenCounts[5],
  p55HiddenCounts[5] - p55HiddenCounts[6],
], [16, state.K, state.K, state.e]);

const bSolutions = [];
for (let candidate = 1; candidate < state.p; candidate += 1) {
  if ((state.e * candidate) % (state.p - 1) === 1) bSolutions.push(candidate);
}
assert.deepEqual(bSolutions, [state.b]);

const BFromHiddenState = powMod(state.g, bSolutions[0], state.p);
assert.equal(BFromHiddenState, state.B);

const aSolutions = [];
for (let candidate = 1; candidate < state.p; candidate += 1) {
  if (powMod(BFromHiddenState, candidate, state.p) === state.K) {
    aSolutions.push(candidate);
  }
}
assert.deepEqual(aSolutions, [state.a]);
assert.equal(powMod(state.g, aSolutions[0], state.p), state.A);
assert.equal(state.e + 1, state.q);

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
const prefix75To41To23Hits = [];
let fullHiddenSequenceWindows = 0;
let dualOpenPgpWindows = 0;
let singleSurvivorTripleSites = 0;
let sumAscendingTriples = 0;
let differenceAscendingTriples = 0;
let eitherAscendingTriples = 0;
let exactSource222324Sum = 0;
let exactSource222324Difference = 0;
const sourceTripleHits = [];
const hiddenSequenceHits = [];
const exactHits = [];

for (let page = 0; page <= 55; page += 1) {
  const pageWords = completeWordsByPhysicalPage.get(page) || [];
  for (let start = 0; start + 16 <= pageWords.length; start += 1) {
    chargedWindows += 1;
    const windowWords = pageWords.slice(start, start + 16);
    const signature = coreSignature(windowWords);
    const hiddenCounts = hiddenRuneCounts(windowWords);
    const singleLayers = singleSurvivorHLayers(windowWords);
    for (let layerIndex = 0; layerIndex + 2 < singleLayers.length; layerIndex += 1) {
      const triple = singleLayers.slice(layerIndex, layerIndex + 3);
      if (
        triple[1].depth !== triple[0].depth + 1
        || triple[2].depth !== triple[1].depth + 1
      ) {
        continue;
      }

      singleSurvivorTripleSites += 1;
      const differences = triple.map((layer) => layer.h[0]);
      const sums = triple.map((layer) => layer.h[1]);
      const sumAscending =
        sums[1] === sums[0] + 1
        && sums[2] === sums[1] + 1;
      const differenceAscending =
        differences[1] === differences[0] + 1
        && differences[2] === differences[1] + 1;

      if (sumAscending) sumAscendingTriples += 1;
      if (differenceAscending) differenceAscendingTriples += 1;
      if (sumAscending || differenceAscending) eitherAscendingTriples += 1;

      const sumExact = sums[0] === 22 && sums[1] === 23 && sums[2] === 24;
      const differenceExact =
        differences[0] === 22
        && differences[1] === 23
        && differences[2] === 24;

      if (sumExact) exactSource222324Sum += 1;
      if (differenceExact) exactSource222324Difference += 1;

      if (sumAscending || differenceAscending || sumExact || differenceExact) {
        sourceTripleHits.push({
          physicalPage: page,
          startWord: start + 1,
          depth: triple[0].depth,
          differences,
          sums,
        });
      }
    }
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
      prefix75To41To23Hits.push({
        physicalPage: page,
        startWord: start + 1,
        hiddenCounts,
      });
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
assert.deepEqual(prefix75To41To23Hits, [
  {
    physicalPage: 35,
    startWord: 14,
    hiddenCounts: [75, 41, 23, 9, 3, 0],
  },
  {
    physicalPage: 55,
    startWord: 1,
    hiddenCounts: [75, 41, 23, 7, 5, 3, 0],
  },
]);
assert.equal(fullHiddenSequenceWindows, 1);
assert.equal(dualOpenPgpWindows, 4);
assert.equal(singleSurvivorTripleSites, 49);
assert.equal(sumAscendingTriples, 1);
assert.equal(differenceAscendingTriples, 0);
assert.equal(eitherAscendingTriples, 1);
assert.equal(exactSource222324Sum, 1);
assert.equal(exactSource222324Difference, 0);
assert.deepEqual(sourceTripleHits, [{
  physicalPage: 55,
  startWord: 1,
  depth: 3,
  differences: [6, 26, 14],
  sums: [22, 23, 24],
}]);
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
    wayToLiber: {
      sourceIndex: 13,
      sourceWord: "WAY",
      directedPage: 13,
      oneBasedWord: 14,
      outerH: p13OuterH,
      differenceState: "-K",
      sumSourceIndex: 9,
      sumSourceWord: "LIBER",
      exactOuterPairHits: exactWayLiberOuter,
      outerSumLiberHits: outerSumLiber.map((row) => row.sourceIndex),
    },
    theirNumberDirection: {
      recoveredOccurrence: 25,
      sourceWord: "THEIR",
      directedPage: 25,
      oneBasedWord: 26,
      ciphertext: secondTheirDiagonal.values,
      gp0: secondTheirDiagonal.gp0,
      gp0SourceWord: "DIRECTION",
      firstTheirGp0: firstTheirDiagonal.gp0,
      direction29DiagonalHits: direction29DiagonalHits.map((row) => row.sourceIndex),
    },
    theirRise: {
      directionWords: ["THE", "WAY"],
      sourceIndices: [12, 13],
      receiverGp0: [p12Diagonal.gp0, p13Diagonal.gp0],
      rise: p13Diagonal.gp0 - p12Diagonal.gp0,
      riseLabel: "THEIR",
      adjacentPairCount: adjacentDiagonal.length,
      exactRiseHits: theirRise,
      p12HState: [8, 19, 15, 16, 0],
      p12P50Token: tape[p12Diagonal.gp0],
      p13HState: [27, 9, 6, 0, 19, 2],
    },
    directedP24: {
      sourceIndex: 24,
      sourceWord: "AND",
      physicalPage: 24,
      oneBasedWord: 25,
      ciphertext: p24Diagonal.values,
      gp0: p24Diagonal.gp0,
      gp0SourceWord: "OPENPGP",
      h: p24Diagonal.h,
      hSourceWords: ["THE", "WAY"],
      diagonalTwoRuneCount: twoRuneDiagonal.length,
      ascendingDiagonalCount: ascendingDiagonal.length,
      descendingDiagonalCount: descendingDiagonal.length,
    },
    sourceFragment: {
      hDifferenceBranch: p55SingleLayers.map((layer) => layer.h[0]),
      hSumBranch: p55SingleLayers.map((layer) => layer.h[1]),
      signedWords: ["THE", "ROAD", "AND"],
    },
    hiddenCountState: {
      counts: p55HiddenCounts,
      p: pFromHiddenCounts,
      gPlusK: gPlusKFromHiddenCounts,
      g: gFromHiddenCounts,
      K: KFromHiddenCounts,
      e: eFromHiddenCounts,
      b: bSolutions[0],
      B: BFromHiddenState,
      a: aSolutions[0],
      A: powMod(state.g, aSolutions[0], state.p),
      q: state.e + 1,
      tailDrops: [16, state.K, state.K, state.e],
    },
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
    prefix75To41To23Hits,
    fullHiddenSequenceWindows,
    dualOpenPgpWindows,
    singleSurvivorTripleSites,
    sumAscendingTriples,
    differenceAscendingTriples,
    eitherAscendingTriples,
    exactSource222324Sum,
    exactSource222324Difference,
    sourceTripleHits,
    hiddenSequenceHits,
    exactHits,
  },
}, null, 2));
