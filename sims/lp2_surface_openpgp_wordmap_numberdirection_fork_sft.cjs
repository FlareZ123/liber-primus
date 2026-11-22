"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function hOutsideIn(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

/** @param {number[][]} square @returns {number[]} */
function outerRing(square) {
  const n = square.length;
  const out = [];
  for (let column = 0; column < n; column += 1) out.push(square[0][column]);
  for (let row = 1; row < n; row += 1) out.push(square[row][n - 1]);
  for (let column = n - 2; column >= 0; column -= 1) out.push(square[n - 1][column]);
  for (let row = n - 2; row > 0; row -= 1) out.push(square[row][0]);
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const alphabet59 = grid.alphabet.replace("f", "");
const tape = grid.pages.flatMap((page) => page.tokens);
const squares = squareText
  .trim()
  .split(/\n\s*\n/u)
  .map((block) => block
    .split("\n")
    .map((line) => line.trim().split(/\s+/u).map(Number)));

assert.equal(squares.length, 3);
assert.equal(tape.length, 256);

/** @param {number} source @returns {{source:number,address:number,token:string,value:number}} */
function p50Base59(source) {
  const address = ((source % 256) + 256) % 256;
  const token = tape[address];
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.notEqual(high, -1);
  assert.notEqual(low, -1);
  return {source, address, token, value: 59 * high + low};
}

const clearMatch = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clearMatch);
const sourceWords = (clearMatch[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[42], "OPENPGP");
assert.deepEqual(sourceWords.slice(0, 3), ["HELLO", "THE", "PATH"]);
assert.deepEqual(sourceWords.slice(25, 30), ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]);
assert.match(clearMatch[1], /Verify OpenPGP 7A35090F\./u);

// Existing p22 square route selects the first source square and reaches SURFACE.
// Here we charge only the literal outer surface under the already-frozen base59 consumer.
const targetSurface = [...new Set(outerRing(squares[0]))];
const surfaceReads = targetSurface.map(p50Base59);
const openPgpSurface = surfaceReads.filter((row) => row.value === 75);
assert.deepEqual(openPgpSurface, [{
  source: 1071,
  address: 47,
  token: "1G",
  value: 75,
}]);

// Rebuild the source-numbered diagonal receiver to verify the word/map branch.
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = parts.map((_, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
let crossingWordCount = 0;

function flushWord() {
  if (current.length === 0) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      page: page.page,
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  } else {
    crossingWordCount += 1;
  }
  current = [];
}

for (let segment = 0; segment < parts.length; segment += 1) {
  for (const char of [...parts[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (current.length === 0) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char !== "/" && !/\s/u.test(char)) {
      flushWord();
    }
  }
}
flushWord();

assert.equal(crossingWordCount, 32);
const p42 = pages.find((page) => page.page === 42);
assert.ok(p42);
const openPgpReceiver = p42.words[42];
assert.ok(openPgpReceiver);
assert.equal(openPgpReceiver.ordinal, 43);
assert.deepEqual(openPgpReceiver.values, [16, 0, 14]);

const h = hOutsideIn(openPgpReceiver.values);
const interval = h.slice().sort((left, right) => left - right);
assert.deepEqual(h, [2, 1, 0]);
assert.deepEqual(interval, [0, 1, 2]);
assert.deepEqual(interval.map((index) => sourceWords[index]), ["HELLO", "THE", "PATH"]);

// Same authenticated OPENPGP source sentence provides a printed key-ID number.
const keyId = 0x7A35090Fn;
assert.equal(keyId % 58n, 23n);

console.log(JSON.stringify({
  status: "PASS",
  sourceCheckpoint: {
    word: "OPENPGP",
    sourceIndex: 42,
    selectedBySquareSurface: openPgpSurface[0],
  },
  wordMapBranch: {
    selector: "OPENPGP42",
    receiver: "p42 canonical word43",
    receiverValues: openPgpReceiver.values,
    hCoordinates: h,
    increasingSourceInterval: interval,
    output: interval.map((index) => sourceWords[index]),
  },
  numberDirectionBranch: {
    authenticatedText: "Verify OpenPGP 7A35090F.",
    numberRepresentation: "conventional hexadecimal OpenPGP short key ID",
    modulo: 58,
    destinationPhysicalPage: Number(keyId % 58n),
  },
  unresolvedRoadLeg:
    "This SFT does not assign an operation to 'their meaning is the road'. The two verified branches use the authenticated word identity and its adjacent printed key-ID number only.",
  decision:
    "SURFACE selects OPENPGP. The same source checkpoint supports two independently existing consumers: OPENPGP42 maps to HELLO THE PATH, while 0x7A35090F mod58 selects physical p23. Preserve the fork as navigation evidence, not body plaintext.",
}, null, 2));
