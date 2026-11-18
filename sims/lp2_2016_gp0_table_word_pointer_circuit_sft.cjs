"use strict";

/**
 * SFT: authenticated 2016 words -> GP0 address -> original p50 table byte ->
 * original p0/p27 rune offset.
 *
 * This reproduces the EMPTY/EPIPHANY boundary circuit on p0 and the
 * independent FIND -> p27:28 handoff replication. It does not assume a
 * global p0 plaintext or fit a key.
 *
 * Run: node sims/lp2_2016_gp0_table_word_pointer_circuit_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tableTokens = grid.pages.flatMap((page) => page.tokens);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Parse page-local complete words while treating slash-newline as physical
 * wrapping only. Hyphen and full stop are word terminators in this source.
 * @param {number} pageNumber
 * @returns {{index:number,start:number,length:number,indices:number[]}[]}
 */
function parsePageWords(pageNumber) {
  const pages = transcription.split(/\n%\n/);
  const source = pages[pageNumber];
  assert.ok(source, "missing transcription page " + pageNumber);
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({index: words.length, start, length: current.length, indices: current});
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  assert.equal(offset, corpus.pages.find((page) => page.page === pageNumber).indices.length);
  return words;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

assert.equal(grid.bytes.length, 256);
assert.equal(tableTokens.length, 256);

const message = signedWords();
assert.equal(message.length, 43);
assert.deepEqual(message.slice(0, 9).map((word) => word.toLowerCase()),
  ["hello", "the", "path", "lies", "empty", "epiphany", "seeks", "the", "devoted"]);

const p0 = parsePageWords(0);
const p27 = parsePageWords(27);
assert.equal(p0.length, 59);
assert.equal(p0[0].start, 0);
assert.equal(p0[0].length, 8);
assert.equal(p0[1].start, 8);
assert.equal(p0[1].length, 5);

const later27 = [];
for (let i = 2; i < p0.length - 1; i += 1) {
  if (p0[i].length === 2 && p0[i + 1].length === 7) later27.push(i);
}
assert.deepEqual(later27, [52]);
const theCandidate = p0[52];
const devotedCandidate = p0[53];
assert.deepEqual(
  {start: theCandidate.start, length: theCandidate.length},
  {start: 235, length: 2}
);
assert.deepEqual(
  {start: devotedCandidate.start, length: devotedCandidate.length},
  {start: 237, length: 7}
);
assert.equal(gp("THE").length, 2);
assert.equal(gp("DEVOTED").length, 7);
assert.equal(gp("EPIPHANY").length, 8);
assert.equal(gp("SEEKS").length, 5);

const messageRows = message.map((word, index) => {
  const number = sum(gp(word));
  assert.ok(number < 256, "signed word GP0 exceeds table address: " + word);
  return {index, word, number, target: grid.bytes[number]};
});
const consecutiveTargets = [];
for (let i = 0; i < messageRows.length - 1; i += 1) {
  if (Math.abs(messageRows[i + 1].target - messageRows[i].target) === 1) {
    consecutiveTargets.push([messageRows[i], messageRows[i + 1]]);
  }
}
assert.equal(consecutiveTargets.length, 1);
assert.equal(consecutiveTargets[0][0].word.toLowerCase(), "empty");
assert.equal(consecutiveTargets[0][1].word.toLowerCase(), "epiphany");

const emptyNumber = sum(gp("EMPTY"));
const epiphanyNumber = sum(gp("EPIPHANY"));
assert.equal(emptyNumber, 92);
assert.equal(epiphanyNumber, 121);
assert.equal(grid.bytes[emptyNumber], 236);
assert.equal(grid.bytes[epiphanyNumber], 237);
assert.equal(236, theCandidate.start + theCandidate.length - 1);
assert.equal(237, devotedCandidate.start);
assert.ok(emptyNumber >= 84 && emptyNumber <= 126);
assert.ok(epiphanyNumber >= 84 && epiphanyNumber <= 126);

// The selected two-rune word closes through literal table token 04 and the
// zero-based signed-word map entry EMPTY, then returns to its final rune.
assert.equal(sum(theCandidate.indices), 13);
assert.equal(tableTokens[13], "04");
assert.equal(grid.bytes[13], 4);
assert.equal(message[4].toLowerCase(), "empty");
assert.equal(grid.bytes[sum(gp(message[4]))], 236);

// Independently solved p57 vocabulary plus GP29 circumference reduction selects
// all four lexical words of the authenticated 2016 clause.
const p57Find = sum(gp("FIND"));
const p57Circumferences = sum(gp("CIRCUMFERENCES"));
const p57The = sum(gp("THE"));
const p57Within = sum(gp("WITHIN"));
const p57Emerge = sum(gp("EMERGE"));
assert.equal(p57Find, 42);
assert.equal(p57Circumferences, 131);
assert.equal(p57The, 20);
assert.equal(p57Within, 38);
assert.equal(p57Emerge, 83);

const signedRows = message.map((word, index) => ({
  index,
  word,
  length: gp(word).length,
  number: sum(gp(word)),
  residue: sum(gp(word)) % 29,
}));
const lexicalTypesAtResidue = (residue) =>
  [...new Set(signedRows.filter((row) => row.residue === residue)
    .map((row) => row.word.toLowerCase()))];

assert.deepEqual(lexicalTypesAtResidue(p57Find % 29), ["seeks"]);
assert.deepEqual(lexicalTypesAtResidue(p57Circumferences % 29), ["devoted"]);
assert.deepEqual(lexicalTypesAtResidue(p57The % 29), ["the"]);
assert.equal(p57Find % 29, 13);
assert.equal(sum(gp("SEEKS")) % 29, 13);
assert.equal(p57Circumferences % 29, sum(gp("DEVOTED")) % 29);
assert.equal(p57Within + p57Emerge, 121);
const exact121 = signedRows.filter((row) => row.number === 121);
assert.deepEqual(exact121.map((row) => row.word.toLowerCase()), ["epiphany"]);

// Complete adjacent signed-pair boundary census. Only two source pairs land
// on two p0 word ends and enclose complete words. Comparing each enclosed
// length vector against every contiguous signed phrase of the same word count
// yields one match: SEEKS/THE brackets THE/ROAD at p0 words21/22.
const p0EndToWord = new Map(
  p0.map((word) => [word.start + word.length - 1, word.index])
);
const boundaryIntervals = [];
for (let i = 0; i < messageRows.length - 1; i += 1) {
  const a = messageRows[i];
  const b = messageRows[i + 1];
  const low = Math.min(a.target, b.target);
  const high = Math.max(a.target, b.target);
  const leftWord = p0EndToWord.get(low);
  const rightWord = p0EndToWord.get(high);
  if (leftWord === undefined || rightWord === undefined || leftWord >= rightWord) continue;
  boundaryIntervals.push({
    sourcePair: [i, i + 1],
    sourceWords: [a.word, b.word],
    outputs: [a.target, b.target],
    orderedBoundaries: [low, high],
    p0Range: [leftWord + 1, rightWord],
    lengths: p0.slice(leftWord + 1, rightWord + 1).map((word) => word.length),
  });
}
assert.deepEqual(boundaryIntervals, [
  {
    sourcePair: [6, 7],
    sourceWords: ["seeks", "the"],
    outputs: [108, 102],
    orderedBoundaries: [102, 108],
    p0Range: [21, 22],
    lengths: [2, 4],
  },
  {
    sourcePair: [28, 29],
    sourceWords: ["the", "direction"],
    outputs: [102, 72],
    orderedBoundaries: [72, 102],
    p0Range: [14, 20],
    lengths: [2, 2, 3, 3, 7, 5, 8],
  },
]);

const boundaryPhraseMatches = [];
for (const interval of boundaryIntervals) {
  const width = interval.lengths.length;
  for (let i = 0; i + width <= signedRows.length; i += 1) {
    const candidate = signedRows.slice(i, i + width);
    if (candidate.every((row, j) => row.length === interval.lengths[j])) {
      boundaryPhraseMatches.push({
        sourcePair: interval.sourcePair,
        p0Range: interval.p0Range,
        signedRange: [i, i + width - 1],
        words: candidate.map((row) => row.word),
      });
    }
  }
}
assert.deepEqual(boundaryPhraseMatches, [{
  sourcePair: [6, 7],
  p0Range: [21, 22],
  signedRange: [22, 23],
  words: ["the", "road"],
}]);
assert.equal(p0[21].start, 103);
assert.equal(p0[21].length, 2);
assert.equal(p0[22].start, 105);
assert.equal(p0[22].length, 4);
assert.equal(sum(p0[21].indices), 20);
assert.equal(sum(gp("THE")), 20);
assert.equal(gp("ROAD").length, 4);

// Original p0 line layout independently marks both body placements.
// The canonical transcription uses "/" for physical line wraps.
const p0Source = transcription.split(/\n%\n/)[0];
const layoutWords = [];
let layoutCurrent = [];
let layoutOffset = 0;
let layoutStart = 0;
let layoutLine = 0;
const flushLayoutWord = () => {
  if (!layoutCurrent.length) return;
  layoutWords.push({
    index: layoutWords.length,
    line: layoutLine,
    start: layoutStart,
    end: layoutStart + layoutCurrent.length - 1,
    length: layoutCurrent.length,
  });
  layoutCurrent = [];
};
for (const ch of [...p0Source]) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    if (!layoutCurrent.length) layoutStart = layoutOffset;
    layoutCurrent.push(value);
    layoutOffset += 1;
  } else if (ch === "-" || ch === ".") {
    flushLayoutWord();
  }
  if (ch === "/") layoutLine += 1;
}
flushLayoutWord();
assert.equal(layoutWords.length, p0.length);

const lineBreakPairs = [];
for (let i = 0; i < layoutWords.length - 1; i += 1) {
  const left = layoutWords[i];
  const right = layoutWords[i + 1];
  if (left.line !== right.line) {
    lineBreakPairs.push({
      left: left.index,
      right: right.index,
      lengths: [left.length, right.length],
      boundary: [left.end, right.start],
    });
  }
}
assert.equal(lineBreakPairs.filter((row) =>
  row.lengths[0] === 2 && row.lengths[1] === 4).length, 1);
assert.equal(lineBreakPairs.filter((row) =>
  row.lengths[0] === 2 && row.lengths[1] === 7).length, 1);
assert.deepEqual(
  lineBreakPairs.find((row) => row.lengths[0] === 2 && row.lengths[1] === 4),
  {left: 21, right: 22, lengths: [2, 4], boundary: [104, 105]}
);
assert.deepEqual(
  lineBreakPairs.find((row) => row.lengths[0] === 2 && row.lengths[1] === 7),
  {left: 52, right: 53, lengths: [2, 7], boundary: [236, 237]}
);

// Source quantities from solved p57 plus the authenticated p50 bracket
// reconstruct both original red-title ciphertext word sums.
assert.equal(sum(gp("FIND")), 42);
assert.equal(sum(gp("EMERGE")), 83);
assert.equal(sum(gp("DIVINITY")), 105);
const strictInteriorLength = 127 - 83 - 1;
assert.equal(strictInteriorLength, 43);
assert.equal(tableTokens[105], "13");
const centerTokenValue = grid.bytes[105];
assert.equal(centerTokenValue, 63); // byte value; the printed decimal-looking token is "13".
const printedCenterDirection = 13;
assert.equal(sum(p0[0].indices), 96);
assert.equal(sum(p0[1].indices), 85);
assert.equal(sum(gp("EMERGE")) + printedCenterDirection, 96);
assert.equal(sum(gp("FIND")) + strictInteriorLength, 85);

const adjacentTitleSumPairs = [];
for (let i = 0; i < p0.length - 1; i += 1) {
  if (sum(p0[i].indices) === 96 && sum(p0[i + 1].indices) === 85) {
    adjacentTitleSumPairs.push(i);
  }
}
assert.deepEqual(adjacentTitleSumPairs, [0]);

const byte28Cells = grid.bytes
  .map((value, index) => value === 28 ? index : null)
  .filter((index) => index !== null);
assert.deepEqual(byte28Cells, [42, 85]);
assert.equal(tableTokens[42], "0S");
assert.equal(tableTokens[85], "0S");
assert.equal(85 - 42, strictInteriorLength);

const duplicatePairsAt43 = [];
for (let i = 0; i + strictInteriorLength < tableTokens.length; i += 1) {
  const j = i + strictInteriorLength;
  if (tableTokens[i] === tableTokens[j]) {
    duplicatePairsAt43.push({i, j, token: tableTokens[i]});
  }
}
assert.deepEqual(duplicatePairsAt43, [
  {i: 33, j: 76, token: "1s"},
  {i: 42, j: 85, token: "0S"},
  {i: 69, j: 112, token: "1D"},
]);

// Holdout discovered only after the EMPTY/EPIPHANY boundary had selected the
// later 2/7 target: the original second red-title ciphertext word itself points
// through the signed message to THE and then to GP0(DEVOTED).
assert.deepEqual(p0[1].indices, [15, 26, 18, 21, 5]);
assert.equal(sum(p0[1].indices), 85);
assert.equal(grid.bytes[85], 28);
assert.equal(message[28].toLowerCase(), "the");
assert.equal(sum(gp(message[28])), 20);
assert.equal(grid.bytes[20], 102);
assert.equal(sum(gp("DEVOTED")), 102);

// Across all signed-message source-order adjacencies, THE / DEVOTED is the
// only pair for which base60 T[GP0(current)] equals GP0(next).
const directWordEdges = [];
for (let i = 0; i < message.length - 1; i += 1) {
  const from = sum(gp(message[i]));
  const to = sum(gp(message[i + 1]));
  if (from < 256 && grid.bytes[from] === to) {
    directWordEdges.push({index: i, from: message[i], to: message[i + 1]});
  }
}
assert.deepEqual(directWordEdges, [{index: 7, from: "the", to: "devoted"}]);

// Fixed-multiset finite calibration for the two-address title holdout.
const theIndices = message
  .map((word, index) => word.toLowerCase() === "the" ? index : null)
  .filter((index) => index !== null);
assert.deepEqual(theIndices, [1, 7, 12, 17, 22, 28]);
const theIndexSet = new Set(theIndices);
const selectableTheBytes = grid.bytes.filter((value) => theIndexSet.has(value));
assert.deepEqual([...selectableTheBytes].sort((a, b) => a - b), [22, 28, 28]);
assert.equal(grid.bytes.filter((value) => value === 102).length, 1);
assert.equal(256 * 255 / 3, 21760);

// The selected seven-rune word points to the already salient table address229.
assert.equal(sum(devotedCandidate.indices), 101);
assert.equal(grid.bytes[101], 229);
assert.equal(3301 % 256, 229);
assert.equal(tableTokens[229], "00");
assert.equal(grid.bytes[229], 0);

// Broader typed closure census: every p0 word whose GP0 table byte is a valid
// zero-based index into the 43 signed words is admitted. Only the selected
// two-rune word returns, through that signed word's GP0 table byte, to one of
// its own boundaries.
const typedCandidates = [];
const typedClosures = [];
for (const word of p0) {
  const cipherNumber = sum(word.indices);
  if (cipherNumber >= 256) continue;
  const signedIndex = grid.bytes[cipherNumber];
  if (signedIndex >= message.length) continue;
  const signedWord = message[signedIndex];
  const signedNumber = sum(gp(signedWord));
  if (signedNumber >= 256) continue;
  const destination = grid.bytes[signedNumber];
  const row = {
    p0Word: word.index,
    start: word.start,
    end: word.start + word.length - 1,
    length: word.length,
    cipherNumber,
    signedIndex,
    signedWord,
    signedNumber,
    destination,
  };
  typedCandidates.push(row);
  if (destination === row.start || destination === row.end) typedClosures.push(row);
}
assert.equal(typedCandidates.length, 8);
assert.deepEqual(typedClosures, [{
  p0Word: 52,
  start: 235,
  end: 236,
  length: 2,
  cipherNumber: 13,
  signedIndex: 4,
  signedWord: "empty",
  signedNumber: 92,
  destination: 236,
}]);

// Independent same-operator replication: solved p57 FIND -> 42 -> byte28,
// which is the exact original p27 start of the independently selected DJU/BEI pair.
assert.equal(sum(gp("FIND")), 42);
assert.equal(grid.bytes[42], 28);
const p27At28 = p27.find((word) => word.start === 28);
assert.ok(p27At28);
assert.equal(p27At28.indices.map((value) => corpus.translit[value]).join(""), "DJU");
const p27Next = p27[p27At28.index + 1];
assert.equal(p27Next.start, 31);
assert.equal(p27Next.indices.map((value) => corpus.translit[value]).join(""), "BEI");

// Existing p57 DIVINITY bridge uses the same GP0 address grammar and reads the
// visible table token at the independently established 43-cell bracket center.
assert.equal(sum(gp("DIVINITY")), 105);
assert.equal(tableTokens[105], "13");

console.log(JSON.stringify({
  status: "PASS: source-word GP0 table pointers close EMPTY/EPIPHANY and title->THE->DEVOTED p0 circuits and replicate FIND->p27:28",
  signedMessageWords: message.length,
  uniqueAdjacentConsecutiveOutputPair: {
    sourceWords: ["EMPTY", "EPIPHANY"],
    gp0Addresses: [emptyNumber, epiphanyNumber],
    tableBytes: [236, 237],
  },
  p0: {
    openingWordLengths: [p0[0].length, p0[1].length],
    onlyLaterTwoSevenPair: {
      wordIndices: [52, 53],
      starts: [theCandidate.start, devotedCandidate.start],
      lengths: [theCandidate.length, devotedCandidate.length],
      boundary: [236, 237],
      candidateSourceWords: ["THE", "DEVOTED"],
    },
    typedClosureCensus: {candidates: typedCandidates.length, closures: typedClosures.length},
    layoutHoldout: {
      lineBreakCount: lineBreakPairs.length,
      uniqueTwoFour: lineBreakPairs.find((row) =>
        row.lengths[0] === 2 && row.lengths[1] === 4),
      uniqueTwoSeven: lineBreakPairs.find((row) =>
        row.lengths[0] === 2 && row.lengths[1] === 7),
    },
    roadPlacement: {
      directionSourcePair: ["SEEKS", "THE"],
      directionOffsets: [108, 102],
      p0WordRange: [21, 22],
      p0Offsets: [103, 108],
      p0WordLengths: [2, 4],
      selectedSignedPhrase: ["THE", "ROAD"],
      completeBoundaryIntervals: boundaryIntervals.length,
      completePhraseMatches: boundaryPhraseMatches.length,
      firstCiphertextGp0: sum(p0[21].indices),
    },
    p57ClauseVocabulary: {
      find: {gp0: p57Find, residue: p57Find % 29, signedType: "SEEKS"},
      circumferences: {
        gp0: p57Circumferences,
        residue: p57Circumferences % 29,
        signedType: "DEVOTED",
      },
      the: {gp0: p57The, residue: p57The % 29, signedType: "THE"},
      withinPlusEmerge: {
        gp0: p57Within + p57Emerge,
        signedType: exact121[0].word,
      },
      orderedByAuthenticated2016Source: ["EPIPHANY", "SEEKS", "THE", "DEVOTED"],
    },
    p57TitleSumBridge: {
      titleCiphertextGp0: [sum(p0[0].indices), sum(p0[1].indices)],
      emergePlusCenter13: sum(gp("EMERGE")) + printedCenterDirection,
      findPlusWithin43: sum(gp("FIND")) + strictInteriorLength,
      findDuplicateCells: byte28Cells,
      duplicatePairsAt43,
      orderedTitlePairOccurrences: adjacentTitleSumPairs,
    },
    titleHoldout: {
      ciphertextGp0: sum(p0[1].indices),
      signedWordIndex: grid.bytes[85],
      signedWord: message[28],
      signedWordGp0: sum(gp(message[28])),
      destinationGp0: grid.bytes[20],
      expectedDestinationWord: "DEVOTED",
      directSignedAdjacencyEdges: directWordEdges.length,
      fixedMultisetInverseProbability: 21760,
    },
    twoRuneCircuit: {
      ciphertextGp0: sum(theCandidate.indices),
      tableToken: tableTokens[13],
      signedWordIndex: 4,
      signedWord: message[4],
      signedWordGp0: emptyNumber,
      returnedRuneOffset: grid.bytes[emptyNumber],
    },
    sevenRuneReturn: {
      ciphertextGp0: sum(devotedCandidate.indices),
      tableByte: grid.bytes[101],
      matches3301Modulo256: 3301 % 256,
      destinationToken: tableTokens[229],
    },
  },
  independentReplication: {
    sourceWord: "FIND",
    gp0Address: 42,
    tableByte: 28,
    destination: "p27:28 DJU / BEI",
  },
  interpretation:
    "The signed words define a source-selected navigation circuit. THE/DEVOTED is a strongly supported p0 crib placement, pending recovery of the page cipher or another independent letter-level check.",
}, null, 2));
