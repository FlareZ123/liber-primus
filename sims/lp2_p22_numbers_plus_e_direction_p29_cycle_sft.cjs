"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const M = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % M) + M) % M;
}

/** @param {number} n @returns {number[]} */
function base29(n) {
  if (n === 0) return [0];
  const out = [];
  let value = n;
  while (value > 0) {
    out.unshift(value % M);
    value = Math.floor(value / M);
  }
  return out;
}

/** @param {string} text @returns {number[][][]} */
function parseSquares(text) {
  return text.trim().split(/\n\s*\n/u).map((block) =>
    block.split("\n").map((line) => line.trim().split(/\s+/u).map(Number))
  );
}

/** @param {number[][]} square @returns {number} */
function center(square) {
  const middle = Math.floor(square.length / 2);
  return square[middle][middle];
}

/**
 * Parse canonical complete words from one physical transcription segment.
 * Whitespace and slash preserve a word across printed line wraps.
 * @param {string} part
 * @param {Map<string,number>} runeIndex
 * @returns {Array<{start:number,values:number[]}>}
 */
function canonicalWords(part, runeIndex) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const finish = () => {
    if (!current.length) return;
    words.push({start, values: current});
    current = [];
  };

  for (const character of [...part]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Layout only.
    } else {
      finish();
    }
  }
  finish();
  return words;
}

/**
 * Fixed four-rune H serialization used by the p29 DIRECTION packet.
 * @param {number[]} values
 * @returns {number[]}
 */
function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const squares = parseSquares(read("resources/cicada2014-openpuff-magic-squares.txt"));

// The smaller 1033-sum square fixes [e,q]=[3,4].
const same1033 = squares
  .filter((square) => square[0].reduce((sum, value) => sum + value, 0) === 1033)
  .sort((left, right) => left.length - right.length);
assert.equal(same1033.length, 2);
const [e, q] = base29(center(same1033[0]));
assert.deepEqual([e, q], [3, 4]);

// P22 visibly mirrors the 809-centered source illustration. The already fixed
// BASE29 read therefore reverses 809=[27,26] to [26,27].
const square3301 = squares.find((square) =>
  square[0].reduce((sum, value) => sum + value, 0) === 3301
);
assert.ok(square3301);
assert.equal(center(square3301), 809);
const centerDigits = base29(center(square3301));
assert.deepEqual(centerDigits, [27, 26]);
const p22RegisterRead = [...centerDigits].reverse();
assert.deepEqual(p22RegisterRead, [26, 27]);

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clear = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const sourceWords = (clear.match(/[A-Za-z]+/gu) || []).map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.deepEqual(p22RegisterRead.map((index) => sourceWords[index]), ["NUMBERS", "ARE"]);

// The source semantic translation established independently is +e:
// NUMBERS26 --e--> DIRECTION29.
const numbersIndex = p22RegisterRead[0];
const directionIndex = numbersIndex + e;
assert.equal(directionIndex, 29);
assert.equal(sourceWords[directionIndex], "DIRECTION");

// The state fields are charged as direct shifts from NUMBERS. Only e reaches
// the authenticated DIRECTION endpoint.
const stateFields = {
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e,
  q,
};
const shiftTrials = Object.entries(stateFields).map(([field, value]) => {
  const destination = numbersIndex + value;
  return {
    field,
    value,
    destination,
    word: destination < sourceWords.length ? sourceWords[destination] : null,
    direction: destination === directionIndex,
  };
});
assert.deepEqual(
  shiftTrials.filter((trial) => trial.direction).map((trial) => trial.field),
  ["e"]
);

// DIRECTION29 selects project p29 under the already established zero-based
// source-index/project-page convention. Its one-based source ordinal is30,
// selecting canonical word30 on physical project p29.
const projectPage = directionIndex;
assert.equal(projectPage, 29);

const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const segment = projectPage >= 51 ? projectPage - 1 : projectPage;
const words = canonicalWords(parts[segment], runeIndex);
const directionWord = words[29];
assert.ok(directionWord);
assert.equal(directionWord.start, 108);
assert.deepEqual(directionWord.values, [11, 26, 11, 18]);

const packet = H4(directionWord.values);
assert.deepEqual(packet, [22, 15, 8, 0]);

const [pMinus1, b, A, sentinel] = packet;
assert.equal(sentinel, 0);
const p = pMinus1 + 1;
assert.equal(p, 23);

const inverseCandidates = [];
for (let candidate = 1; candidate < p - 1; candidate += 1) {
  if ((candidate * b) % (p - 1) === 1) inverseCandidates.push(candidate);
}
assert.deepEqual(inverseCandidates, [3]);
const recoveredE = inverseCandidates[0];
assert.equal(recoveredE, e);

console.log(JSON.stringify({
  status: "PASS",
  p22Square: {
    center: 809,
    base29: centerDigits,
    mirroredRegisterRead: p22RegisterRead,
    words: p22RegisterRead.map((index) => sourceWords[index]),
  },
  semanticStep: {
    from: numbersIndex,
    fromWord: sourceWords[numbersIndex],
    operator: "+e",
    e,
    to: directionIndex,
    toWord: sourceWords[directionIndex],
    stateFieldShiftCharge: shiftTrials,
  },
  p29DirectionObject: {
    projectPage,
    canonicalWord: 30,
    start: directionWord.start,
    cipher: directionWord.values,
    H4: packet,
    typing: ["p-1", "b", "A", "0"],
  },
  closure: {
    p,
    b,
    A,
    recoveredE,
    equalsSquareE: recoveredE === e,
  },
}, null, 2));
