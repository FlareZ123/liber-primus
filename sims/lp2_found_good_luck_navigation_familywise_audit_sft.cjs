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
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/lp2-transcription.txt");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/).slice(1).join("\n");
const sourceWords = clear.split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({ index, word: word.toUpperCase(), values: gp(word) }));
assert.equal(sourceWords.length, 43);

const runeSet = new Set(corpus.runes);
const p0 = transcription.split("%")[0];
const p0Words = [];
let pageLength = 0;
let wordStart = -1;

/** @returns {void} */
function flushWord() {
  if (wordStart < 0) return;
  p0Words.push({
    index: p0Words.length,
    start: wordStart,
    end: pageLength - 1,
    length: pageLength - wordStart,
  });
  wordStart = -1;
}

for (const char of [...p0]) {
  if (runeSet.has(char)) {
    if (wordStart < 0) wordStart = pageLength;
    pageLength += 1;
  } else if (char === "-" || char === ".") {
    flushWord();
  }
}
flushWord();
assert.equal(pageLength, 262);
assert.equal(p0Words.length, 59);

const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {string} token @param {string} alphabet @returns {number|null} */
function decode(token, alphabet) {
  let value = 0;
  for (const char of token) {
    const digit = alphabet.indexOf(char);
    if (digit < 0) return null;
    value = value * alphabet.length + digit;
  }
  return value;
}

/** @param {string} token @param {string} nextWord @returns {boolean} */
function literalMatch(token, nextWord) {
  const match = token.match(/^([0-9])([A-Za-z])$/);
  if (!match) return false;
  const letter = match[2].toLowerCase();
  const count = [...nextWord.toLowerCase()].filter((char) => char === letter).length;
  return Number(match[1]) === count;
}

/**
 * @param {string} token
 * @param {number} nextLength
 * @param {{index:number,start:number,end:number,length:number}[]} geometry
 * @returns {{radix:string,origin:string,boundary:string,pos:number}[]}
 */
function numericModes(token, nextLength, geometry) {
  const hits = [];
  for (const [radix, alphabet] of [["base60", alphabet60], ["base59", alphabet59]]) {
    const raw = decode(token, alphabet);
    if (raw === null) continue;
    for (const [origin, pos] of [["zero", raw], ["one", raw - 1]]) {
      if (pos < 0 || pos >= pageLength) continue;
      for (const boundary of ["start", "end"]) {
        const word = geometry.find((row) => row[boundary] === pos);
        if (word && word.length === nextLength) hits.push({ radix, origin, boundary, pos });
      }
    }
  }
  return hits;
}

/**
 * @param {string} token
 * @param {{word:string,values:number[]}} next
 * @param {{index:number,start:number,end:number,length:number}[]} geometry
 * @returns {boolean}
 */
function qualifies(token, next, geometry) {
  return literalMatch(token, next.word) &&
    numericModes(token, next.values.length, geometry).length > 0;
}

const literalRows = [];
const actualEdges = [];
const edgeSets = [];
const sourceAddresses = [];

for (let index = 0; index + 1 < sourceWords.length; index += 1) {
  const current = sourceWords[index];
  const next = sourceWords[index + 1];
  const address = current.values.reduce((sum, value) => sum + value, 0);
  sourceAddresses.push(address);
  const token = tokens[address];

  if (literalMatch(token, next.word)) {
    const match = token.match(/^([0-9])([A-Za-z])$/);
    literalRows.push({
      index,
      from: current.word,
      to: next.word,
      address,
      token,
      count: Number(match[1]),
      nextLength: next.values.length,
    });
  }

  const qualifying = [];
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
    if (qualifies(tokens[tokenIndex], next, p0Words)) qualifying.push(tokenIndex);
  }
  edgeSets.push(qualifying);

  if (qualifies(token, next, p0Words)) {
    actualEdges.push({
      index,
      from: current.word,
      to: next.word,
      address,
      token,
      modes: numericModes(token, next.values.length, p0Words),
    });
  }
}

assert.deepEqual(literalRows, [
  { index:8, from:"DEVOTED", to:"LIBER", address:102, token:"0W", count:0, nextLength:5 },
  { index:14, from:"ITS", to:"WORDS", address:41, token:"1O", count:1, nextLength:5 },
  { index:32, from:"YOU", to:"WILL", address:30, token:"2L", count:2, nextLength:4 },
  { index:35, from:"FOUND", to:"GOOD", address:36, token:"0s", count:0, nextLength:4 },
  { index:36, from:"GOOD", to:"LUCK", address:35, token:"0d", count:0, nextLength:4 },
]);

assert.deepEqual(actualEdges, [
  {
    index:32, from:"YOU", to:"WILL", address:30, token:"2L",
    modes:[{ radix:"base60", origin:"zero", boundary:"start", pos:141 }],
  },
  {
    index:35, from:"FOUND", to:"GOOD", address:36, token:"0s",
    modes:[{ radix:"base59", origin:"one", boundary:"end", pos:52 }],
  },
  {
    index:36, from:"GOOD", to:"LUCK", address:35, token:"0d",
    modes:[
      { radix:"base60", origin:"zero", boundary:"start", pos:39 },
      { radix:"base59", origin:"zero", boundary:"start", pos:39 },
    ],
  },
]);

const holdout31 = p0Words.find((row) => row.start <= 31 && 31 <= row.end);
const holdout32 = p0Words.find((row) => row.start <= 32 && 32 <= row.end);
assert.deepEqual(holdout31, { index:5, start:23, end:33, length:11 });
assert.deepEqual(holdout32, holdout31);
assert.equal(holdout31.start === 31 || holdout31.end === 31, false);
assert.equal(holdout32.start === 32 || holdout32.end === 32, false);

/**
 * @param {number[]} left
 * @param {number[]} right
 * @param {boolean} sameAddress
 * @returns {number}
 */
function orderedPairCount(left, right, sameAddress) {
  const rightSet = new Set(right);
  if (sameAddress) return left.filter((value) => rightSet.has(value)).length;
  let total = left.length * right.length;
  for (const value of left) if (rightSet.has(value)) total -= 1;
  return total;
}

const foundGood = edgeSets[35];
const goodLuck = edgeSets[36];
assert.equal(foundGood.length, 17);
assert.equal(goodLuck.length, 22);
const fglPairCount = orderedPairCount(foundGood, goodLuck, false);
assert.equal(fglPairCount, 361);
assert.equal(256 * 255, 65280);
const fglTokenRate = fglPairCount / 65280;
assert.ok(Math.abs(fglTokenRate - 0.005530024509803922) < 1e-15);

const expectedEdges = edgeSets.reduce((sum, set) => sum + set.length / 256, 0);
assert.ok(Math.abs(expectedEdges - 1.57421875) < 1e-15);

let expectedRuns = 0;
for (let index = 0; index + 1 < edgeSets.length; index += 1) {
  const sameAddress = sourceAddresses[index] === sourceAddresses[index + 1];
  const denominator = sameAddress ? 256 : 256 * 255;
  expectedRuns += orderedPairCount(edgeSets[index], edgeSets[index + 1], sameAddress) / denominator;
}
assert.ok(Math.abs(expectedRuns - 0.11446078431372546) < 1e-15);

let tokenRotationsWithRun = 0;
let tokenRotationMaxRun = 0;
let observedRotation = null;
for (let shift = 0; shift < 256; shift += 1) {
  const hits = [];
  for (let index = 0; index + 1 < sourceWords.length; index += 1) {
    const next = sourceWords[index + 1];
    const token = tokens[(sourceAddresses[index] + shift) % 256];
    hits.push(qualifies(token, next, p0Words));
  }
  let maxRun = 0;
  let currentRun = 0;
  let runCount = 0;
  for (let index = 0; index < hits.length; index += 1) {
    if (hits[index]) {
      currentRun += 1;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 0;
    }
    if (index + 1 < hits.length && hits[index] && hits[index + 1]) runCount += 1;
  }
  if (runCount > 0) tokenRotationsWithRun += 1;
  tokenRotationMaxRun = Math.max(tokenRotationMaxRun, maxRun);
  if (shift === 0) observedRotation = {
    edges: hits.filter(Boolean).length,
    runs: runCount,
    maxRun,
  };
}
assert.equal(tokenRotationsWithRun, 25);
assert.equal(tokenRotationMaxRun, 4);
assert.deepEqual(observedRotation, { edges:3, runs:1, maxRun:2 });

/**
 * @param {number} shift
 * @returns {{index:number,start:number,end:number,length:number}[]}
 */
function shiftedGeometry(shift) {
  return p0Words.map((word) => ({
    ...word,
    start: (word.start + shift) % pageLength,
    end: (word.end + shift) % pageLength,
  }));
}

let geometryPhasesWithRun = 0;
let geometryMaxRun = 0;
let actualFglTokenPhases = 0;
let totalJointExpectedRuns = 0;
let totalSpecificFglProbability = 0;

for (let shift = 0; shift < pageLength; shift += 1) {
  const geometry = shiftedGeometry(shift);
  const actual = [];
  const shiftedSets = [];

  for (let index = 0; index + 1 < sourceWords.length; index += 1) {
    const next = sourceWords[index + 1];
    const actualToken = tokens[sourceAddresses[index]];
    actual.push(qualifies(actualToken, next, geometry));

    const set = [];
    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
      if (qualifies(tokens[tokenIndex], next, geometry)) set.push(tokenIndex);
    }
    shiftedSets.push(set);
  }

  let runCount = 0;
  let maxRun = 0;
  let currentRun = 0;
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index]) {
      currentRun += 1;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 0;
    }
    if (index + 1 < actual.length && actual[index] && actual[index + 1]) runCount += 1;
  }
  if (runCount > 0) geometryPhasesWithRun += 1;
  geometryMaxRun = Math.max(geometryMaxRun, maxRun);
  if (actual[35] && actual[36]) actualFglTokenPhases += 1;

  let expectedAtShift = 0;
  for (let index = 0; index + 1 < shiftedSets.length; index += 1) {
    const sameAddress = sourceAddresses[index] === sourceAddresses[index + 1];
    const denominator = sameAddress ? 256 : 256 * 255;
    expectedAtShift += orderedPairCount(
      shiftedSets[index],
      shiftedSets[index + 1],
      sameAddress
    ) / denominator;
  }
  totalJointExpectedRuns += expectedAtShift;
  totalSpecificFglProbability += orderedPairCount(
    shiftedSets[35],
    shiftedSets[36],
    false
  ) / (256 * 255);
}

assert.equal(geometryPhasesWithRun, 11);
assert.equal(geometryMaxRun, 2);
assert.equal(actualFglTokenPhases, 11);

const meanJointExpectedRuns = totalJointExpectedRuns / pageLength;
const meanSpecificFglProbability = totalSpecificFglProbability / pageLength;
assert.ok(Math.abs(meanJointExpectedRuns - 0.0885100939230654) < 1e-15);
assert.ok(Math.abs(meanSpecificFglProbability - 0.0026115921082173342) < 1e-15);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "Director #1739 negative: the literal digit-letter plus p50-numeric boundary grammar reproduces YOU->WILL and the FOUND->GOOD->LUCK run, but a sealed DEVOTED->LIBER transfer fails and familywise token/boundary controls produce comparable two-edge runs often enough to retire this grammar as a reusable plaintext router",
  literalRows,
  actualEdges,
  holdout: {
    pair: "DEVOTED -> LIBER",
    token: "0W",
    testedPositions: [31, 32],
    containingWord: holdout31,
    result: "FAIL",
  },
  tokenMultiset: {
    foundGoodQualifying: foundGood.length,
    goodLuckQualifying: goodLuck.length,
    fglOrderedPairs: fglPairCount,
    allOrderedPairs: 65280,
    fglRate: fglTokenRate,
    expectedEdges,
    expectedRuns,
  },
  tokenRotation: {
    rotations: 256,
    rotationsWithRun: tokenRotationsWithRun,
    maxRun: tokenRotationMaxRun,
    observed: observedRotation,
  },
  boundaryRotation: {
    phases: pageLength,
    phasesWithRun: geometryPhasesWithRun,
    maxRun: geometryMaxRun,
    actualFglTokenPhases,
  },
  joint: {
    meanExpectedRuns: meanJointExpectedRuns,
    meanSpecificFglProbability,
  },
}, null, 2));
