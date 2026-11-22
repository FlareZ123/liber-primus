"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const parts = transcription.split(/^\s*%\s*$/m);
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number, number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % 29;
    value = (value * value) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

/**
 * Parse printed words while preserving slash/line wrapping inside words.
 * @param {string} source
 * @returns {{start:number,values:number[]}[]}
 */
function parseWords(source) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  };

  for (const character of source) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (character === "-" || character === "." || character === "&") {
      flush();
    } else if (character === "/" || /\s/u.test(character)) {
      // Physical line wrapping preserves a word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} address @returns {number|null} */
function low60(address) {
  if (!Number.isInteger(address) || address < 0 || address >= tape.length) return null;
  return alpha60.indexOf(tape[address][1]);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} physicalPage @returns {string} */
function physicalPart(physicalPage) {
  assert.ok(physicalPage >= 0 && physicalPage <= 55 && physicalPage !== 50);
  return parts[physicalPage <= 49 ? physicalPage : physicalPage - 1];
}

const e = 3;
const q = 4;
const A = 8;
const K = 2;
const wordExponent = 27;
const readGp = [4, 28, 23];
assert.equal(spell(readGp), "READ");

// The p33 first black body is the text after the first title period and
// before the section divider.
const p33 = physicalPart(33);
const firstUnit = p33.split("&")[0];
const firstChunks = firstUnit.split(".");
assert.ok(firstChunks.length >= 2);
const upperBodyWords = parseWords(firstChunks.slice(1).join("."));
assert.equal(upperBodyWords.length, 21);
assert.equal(upperBodyWords.reduce((sum, word) => sum + word.values.length, 0), e ** q);
assert.deepEqual(
  upperBodyWords.map((word) => word.values.length),
  [2, 9, 6, 3, 3, 5, 3, 2, 7, 3, 3, 6, 5, 8, 2, 3, 2, 2, 2, 3, 2]
);

const upperWordGp0 = upperBodyWords.map((word) =>
  word.values.reduce((sum, value) => sum + value, 0)
);
assert.deepEqual(
  upperWordGp0,
  [34, 156, 94, 49, 40, 86, 20, 47, 105, 38, 33, 59, 63, 141, 40, 36, 19, 15, 31, 46, 31]
);

// Existing state quantities select four word positions before their values
// are consumed as a map: e=3, H(e,q)[1]=7, e^2=9 and A+K=10.
const hEq = H(e, q);
assert.deepEqual(hEq, [28, 7]);
const TUNNELNG_GP0 = 94;
const THE_GP0 = 20;
const FIND_GP0_MAP = 42;
const RISE_GP0 = 47;
const DIVINITY_GP0 = 105;
const WITHIN_GP0 = 38;
assert.equal(upperWordGp0[e - 1], TUNNELNG_GP0);
assert.equal(upperWordGp0[hEq[1] - 1], THE_GP0);
assert.equal(low60(THE_GP0), FIND_GP0_MAP);
assert.equal(upperWordGp0[A - 1], RISE_GP0);
assert.equal(upperWordGp0[e ** 2 - 1], DIVINITY_GP0);
assert.equal(upperWordGp0[A + K - 1], WITHIN_GP0);

// FIND THE DIVINITY WITHIN is executable inside the selected 21-word map:
// word9 is the DIVINITY object; its unique center is 8=A, and map word8 is
// RISE. This turns the recovered semantic phrase into a deterministic road.
const divinityWord = upperBodyWords[e ** 2 - 1];
assert.equal(divinityWord.values.length, 7);
const divinityCenter = divinityWord.values[(divinityWord.values.length - 1) / 2];
assert.equal(divinityCenter, A);
assert.equal(upperWordGp0[divinityCenter - 1], RISE_GP0);

// RISE then uses the same GP0->p50 number grammar. Its token has the two
// documented radix values 75/76.
assert.equal(tape[RISE_GP0], "1G");
const rise60 = 60 * alpha60.indexOf(tape[RISE_GP0][0])
  + alpha60.indexOf(tape[RISE_GP0][1]);
const rise59 = 59 * alpha59.indexOf(tape[RISE_GP0][0])
  + alpha59.indexOf(tape[RISE_GP0][1]);
assert.deepEqual([rise59, rise60], [75, 76]);

// TUNNELNG supplies the independently known adjacent terminal page pair.
assert.equal(tape[TUNNELNG_GP0], "0u");
const tunnel60 = 60 * alpha60.indexOf(tape[TUNNELNG_GP0][0])
  + alpha60.indexOf(tape[TUNNELNG_GP0][1]);
const tunnel59 = 59 * alpha59.indexOf(tape[TUNNELNG_GP0][0])
  + alpha59.indexOf(tape[TUNNELNG_GP0][1]);
assert.deepEqual([tunnel59, tunnel60], [55, 56]);

// e^2=9 selects exactly one word inside the already selected 81-rune body.
const selected = upperBodyWords
  .map((word, index) => ({ ...word, bodyWord: index + 1 }))
  .filter((word) => word.values.length === e ** 2);
assert.equal(selected.length, 1);
assert.equal(selected[0].bodyWord, 2);
assert.deepEqual(selected[0].values, [0, 16, 18, 22, 28, 24, 27, 15, 6]);

// Exponent27 is the already authenticated p28 word exponent. It is
// self-inverse on GP29, including 0 under this positive exponent convention.
const transformed = selected[0].values.map((value) => pow29(value, wordExponent));
assert.deepEqual(transformed, [0, 20, 21, 4, 28, 23, 14, 2, 5]);
assert.deepEqual(
  transformed.map((value) => pow29(value, wordExponent)),
  selected[0].values
);

// Partition the e^2 word into e equal e-rune blocks. The unique inner block
// is exactly READ in native GP transliteration.
const blocks = Array.from({ length: e }, (_, block) =>
  transformed.slice(block * e, (block + 1) * e)
);
assert.deepEqual(blocks[1], readGp);
assert.deepEqual(blocks.map(spell), ["FLNG", "READ", "XTHC"]);

// Before exponentiation, the two outer e-rune thirds have the canonical GP0
// sums of the independently recovered clue words THEIR and HERE.
const THEIR_GP0 = 34;
const HERE_GP0 = 48;
const sourceThirdSums = Array.from({ length: e }, (_, block) =>
  selected[0].values.slice(block * e, (block + 1) * e)
    .reduce((sum, value) => sum + value, 0)
);
assert.deepEqual(sourceThirdSums, [34, 74, 48]);
assert.equal(sourceThirdSums[0], THEIR_GP0);
assert.equal(sourceThirdSums[2], HERE_GP0);
assert.equal(low60(sourceThirdSums[1]), 25);

// The recovered READ center has the pre-existing READ OUT state consumer.
const READ_GP0 = readGp.reduce((sum, value) => sum + value, 0);
const OUT_GP0 = 20;
const FIND_GP0 = 42;
assert.equal(READ_GP0, 55);
assert.equal(low60(READ_GP0), OUT_GP0);
assert.equal(low60(OUT_GP0), FIND_GP0);
assert.equal(low60(FIND_GP0), 28);

// Charge the exact state-selected word map across every 21-word manuscript
// window. The receiver is unique without language scoring.
let mapWindows = 0;
const mapTupleHits = [];
const mapRoadHits = [];
const divinityWithinPairHits = [];
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const words = parseWords(physicalPart(physicalPage));
  const sums = words.map((word) =>
    word.values.reduce((sum, value) => sum + value, 0)
  );

  for (let start = 0; start + 21 <= words.length; start += 1) {
    mapWindows += 1;
    const window = sums.slice(start, start + 21);
    if (
      window[e - 1] === TUNNELNG_GP0
      && window[hEq[1] - 1] === THE_GP0
      && window[e ** 2 - 1] === DIVINITY_GP0
      && window[A + K - 1] === WITHIN_GP0
    ) {
      mapTupleHits.push({
        physicalPage,
        startWord: start + 1,
        startOffset: words[start].start,
      });
    }

    const localDivinity = words[start + e ** 2 - 1];
    const localCenter = localDivinity.values.length % 2 === 1
      ? localDivinity.values[(localDivinity.values.length - 1) / 2]
      : null;
    if (
      window[hEq[1] - 1] === THE_GP0
      && window[A - 1] === RISE_GP0
      && window[e ** 2 - 1] === DIVINITY_GP0
      && window[A + K - 1] === WITHIN_GP0
      && localCenter === A
    ) {
      mapRoadHits.push({
        physicalPage,
        startWord: start + 1,
        startOffset: words[start].start,
      });
    }
  }

  for (let index = 0; index + 1 < sums.length; index += 1) {
    if (sums[index] === DIVINITY_GP0 && sums[index + 1] === WITHIN_GP0) {
      divinityWithinPairHits.push({
        physicalPage,
        word: index + 1,
        pageOffset: words[index].start,
      });
    }
  }
}
assert.equal(mapWindows, 1833);
assert.deepEqual(mapTupleHits, [{
  physicalPage: 33,
  startWord: 3,
  startOffset: 10,
}]);
assert.deepEqual(divinityWithinPairHits, [{
  physicalPage: 33,
  word: 11,
  pageOffset: 43,
}]);
assert.deepEqual(mapRoadHits, [{
  physicalPage: 33,
  startWord: 3,
  startOffset: 10,
}]);

// Reproduce incoming-carry lengths so the RISE 75/76 pair can be typed
// against physical-page counts rather than merely noticed numerically.
const rawSegments = transcription.split("%").slice(0, 55);
const continuous = rawSegments.join("%");
const runePattern = /[\u16A0-\u16FF]/u;
/** @type {{page:number}[][]} */
const continuousWords = [];
/** @type {{page:number}[]} */
let currentWord = [];
let runePage = 0;
const finishContinuousWord = () => {
  if (!currentWord.length) return;
  continuousWords.push(currentWord);
  currentWord = [];
};
for (const character of continuous) {
  if (runePattern.test(character)) {
    currentWord.push({ page: runePage });
  } else if (character === "%") {
    runePage += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Printed line wrapping preserves words.
  } else {
    finishContinuousWord();
  }
}
finishContinuousWord();

const physicalFromRunePage = (page) => page >= 50 ? page + 1 : page;
const carryByPhysical = new Map([[0, 0]]);
for (let pageIndex = 1; pageIndex < rawSegments.length; pageIndex += 1) {
  const crossing = continuousWords.find((word) =>
    word[0].page < pageIndex && word.some((site) => site.page === pageIndex)
  );
  carryByPhysical.set(
    physicalFromRunePage(pageIndex),
    crossing ? crossing.filter((site) => site.page === pageIndex).length : 0
  );
}
const risePageHits = corpus.pages
  .filter((page) => page.page <= 55)
  .map((page) => ({
    physicalPage: page.page,
    runes: page.indices.length,
    carry: carryByPhysical.get(page.page) || 0,
    localRunes: page.indices.length - (carryByPhysical.get(page.page) || 0),
  }))
  .filter((page) => page.runes === rise60 && page.localRunes === rise59);
assert.deepEqual(risePageHits, [{
  physicalPage: 55,
  runes: 76,
  carry: 1,
  localRunes: 75,
}]);

// Manuscript-wide fixed control: every complete nine-rune unknown-page word,
// same exponent27, same central three-rune extraction.
let nineRuneWords = 0;
let leftTheirHits = 0;
let rightHereHits = 0;
let bothOuterHits = 0;
let centerPointer25Hits = 0;
let fullSourceSelectorHits = 0;
const centerReadHits = [];
const tripleHits = [];
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const words = parseWords(physicalPart(physicalPage));
  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    if (word.values.length !== e ** 2) continue;
    nineRuneWords += 1;
    const output = word.values.map((value) => pow29(value, wordExponent));
    const center = output.slice(e, 2 * e);
    const leftSum = word.values.slice(0, e).reduce((sum, value) => sum + value, 0);
    const middleSum = word.values.slice(e, 2 * e).reduce((sum, value) => sum + value, 0);
    const rightSum = word.values.slice(2 * e).reduce((sum, value) => sum + value, 0);
    const centerPointer = low60(middleSum);
    const isRead = center.every((value, index) => value === readGp[index]);
    if (leftSum === THEIR_GP0) leftTheirHits += 1;
    if (rightSum === HERE_GP0) rightHereHits += 1;
    if (leftSum === THEIR_GP0 && rightSum === HERE_GP0) bothOuterHits += 1;
    if (centerPointer === 25) centerPointer25Hits += 1;
    if (leftSum === THEIR_GP0 && centerPointer === 25 && rightSum === HERE_GP0) {
      fullSourceSelectorHits += 1;
    }
    if (isRead) {
      centerReadHits.push({
        physicalPage,
        pageWord: wordIndex + 1,
        pageOffset: word.start,
        source: word.values,
        transformed: output,
      });
    }
    if (leftSum === THEIR_GP0 && rightSum === HERE_GP0 && isRead) {
      tripleHits.push({
        physicalPage,
        pageWord: wordIndex + 1,
        pageOffset: word.start,
      });
    }
  }
}
assert.equal(nineRuneWords, 77);
assert.equal(leftTheirHits, 2);
assert.equal(rightHereHits, 2);
assert.equal(bothOuterHits, 1);
assert.equal(centerPointer25Hits, 2);
assert.equal(fullSourceSelectorHits, 1);
assert.deepEqual(
  centerReadHits.map((hit) => [hit.physicalPage, hit.pageWord, hit.pageOffset]),
  [[33, 4, 12]]
);
assert.deepEqual(tripleHits, [{
  physicalPage: 33,
  pageWord: 4,
  pageOffset: 12,
}]);

// Symmetry check only: the p33 lower body has two length-nine words, and
// neither contains OUT under the analogous central/any-position exponent27
// reading. This prevents silently promoting READ into an unsupported full
// phrase.
const secondUnit = p33.split("&")[1];
const secondChunks = secondUnit.split(".");
const lowerBodyWords = parseWords(secondChunks.slice(1).join("."));
assert.equal(lowerBodyWords.length, 28);
assert.equal(lowerBodyWords.reduce((sum, word) => sum + word.values.length, 0), 115);
const outGp = [3, 1, 16];
const lowerNine = lowerBodyWords.filter((word) => word.values.length === e ** 2);
assert.equal(lowerNine.length, 2);
for (const word of lowerNine) {
  const output = word.values.map((value) => pow29(value, wordExponent));
  for (let start = 0; start + outGp.length <= output.length; start += 1) {
    assert.ok(!outGp.every((value, index) => output[start + index] === value));
  }
}

console.log(JSON.stringify({
  status: "PASS",
  sourceState: { e, q, A, K, hEq, upperBodyRunes: e ** q },
  wordMap: {
    upperWordGp0,
    selectedPositions: {
      tunnelng: e,
      the: hEq[1],
      divinity: e ** 2,
      rise: A,
      within: A + K,
    },
    selectedValues: {
      tunnelng: upperWordGp0[e - 1],
      the: upperWordGp0[hEq[1] - 1],
      findViaLowDigitOfThe: low60(THE_GP0),
      rise: upperWordGp0[A - 1],
      divinity: upperWordGp0[e ** 2 - 1],
      divinityCenter,
      within: upperWordGp0[A + K - 1],
    },
    recoveredInstruction: "FIND THE DIVINITY WITHIN",
    manuscriptWindowsCharged: mapWindows,
    exactMapTupleHits: mapTupleHits,
    exactMapRoadHits: mapRoadHits,
    exactDivinityWithinPairHits: divinityWithinPairHits,
    risenReceiver: {
      riseGp0: RISE_GP0,
      token: tape[RISE_GP0],
      base59: rise59,
      base60: rise60,
      uniquePageCountHit: risePageHits,
      tunnelngToken: tape[TUNNELNG_GP0],
      tunnelngBase59: tunnel59,
      tunnelngBase60: tunnel60,
    },
  },
  selection: {
    uniqueUpperBodyLength: e ** 2,
    bodyWord: selected[0].bodyWord,
    pageWord: 4,
    pageOffset: selected[0].start + 10,
    sourceValues: selected[0].values,
  },
  recoveredReadConsumer: {
    readGp0: READ_GP0,
    readToOut: low60(READ_GP0),
    outToFind: low60(OUT_GP0),
    findToPage: low60(FIND_GP0),
    destination: "p28",
    p33SourceRightThirdGp0: HERE_GP0,
    destinationPageStartCandidate: "HERE",
  },
  transform: {
    exponent: wordExponent,
    transformedValues: transformed,
    transformedSymbols: transformed.map((value) => corpus.translit[value]),
    equalBlocks: blocks.map((block) => ({
      gp: block,
      text: spell(block),
    })),
    recoveredCenter: spell(blocks[1]),
  },
  control: {
    completeNineRuneWords: nineRuneWords,
    sourceOuterThirds: {
      leftTheirHits,
      rightHereHits,
      bothOuterHits,
      selectedLeftGp0: THEIR_GP0,
      selectedMiddleGp0: sourceThirdSums[1],
      selectedMiddleLow60: low60(sourceThirdSums[1]),
      selectedRightGp0: HERE_GP0,
      centerPointer25Hits,
      fullSourceSelectorHits,
    },
    exactTripleHits: tripleHits,
    exactCenterReadHits: centerReadHits.map((hit) => ({
      physicalPage: hit.physicalPage,
      pageWord: hit.pageWord,
      pageOffset: hit.pageOffset,
    })),
    lowerBodyNineRuneWords: lowerNine.length,
    analogousLowerOutHits: 0,
  },
  decision: "Strong source-constrained p33 word-map and upper-body plaintext candidate: state-selected positions e=3, H(e,q)[1]=7, e^2=9 and A+K=10 yield TUNNELNG / THE / DIVINITY / WITHIN, with the pre-existing THE->FIND transition giving FIND THE DIVINITY WITHIN; this four-position tuple is unique across 1,833 manuscript 21-word windows. the risen-THEIR route recovers [e,q]=[3,4] and selects the 81-rune body; its unique e^2=9 word has source third sums [34,74,48] = [THEIR, p50-low->25(second THEIR), HERE], and under the already authenticated p28 word exponent27 its central e=3 GP runes are R-EA-D = READ. Across all 77 complete nine-rune words, only two have left THEIR, two have right HERE, one has both outer identities, and that same sole word is the unique center READ hit. Preserve as a conditional plaintext recovery pending independent adjudication; do not infer OUT or a whole-body cipher.",
}, null, 2));
