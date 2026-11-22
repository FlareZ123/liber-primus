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
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let value = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % modulus;
    value = (value * value) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} source
 * @returns {{start:number,values:number[]}[]}
 */
function parseWords(source) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  /** @returns {void} */
  function flush() {
    if (current.length === 0) return;
    words.push({start, values: current.slice()});
    current = [];
  }

  for (const character of source) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (current.length === 0) start = offset;
      current.push(value);
      offset += 1;
    } else if (character === "-" || character === "." || character === "&") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} page @returns {number[]} */
function strictInterior(page) {
  return parseWords(physicalPart(page)).flatMap((word) =>
    word.values.length >= 2 ? word.values.slice(1, -1) : []
  );
}

/** @param {{values:number[]}[]} words @returns {number[]} */
function gp0(words) {
  return words.map((word) => word.values.reduce((sum, value) => sum + value, 0));
}

const p = 23;
const g = 5;
const a = 6;
const A = 8;
const riseGp0 = 47;

// Reproduce the fixed p55 shedding consequence.
const p55Strict = strictInterior(55);
assert.equal(p55Strict.length, 43);
const p55Span = p55Strict.slice(4, 23);
assert.equal(p55Span.length, 19);
assert.deepEqual([p55Span[0], p55Span[18]], [23, 23]);

const shedTwice = p55Span.slice(2, -2);
assert.equal(shedTwice.length, 15);
const risePair = [shedTwice[0], shedTwice[shedTwice.length - 1]];
assert.deepEqual(risePair, [27,20]);
assert.equal(risePair[0] + risePair[1], riseGp0);

const we = H(risePair[0], risePair[1]);
assert.deepEqual(we, [7,18]);
assert.equal(we.map((value) => corpus.translit[value]).join(""), "WE");

// Parse the independently selected p33 upper 21-word map.
const p33 = physicalPart(33);
const firstUnit = p33.split("&")[0];
const firstChunks = firstUnit.split(".");
assert.ok(firstChunks.length >= 2);
const upper = parseWords(firstChunks.slice(1).join("."));
assert.equal(upper.length, 21);
assert.equal(upper.reduce((sum, word) => sum + word.values.length, 0), 81);
const upperGp0 = gp0(upper);

// WE values are used unchanged as one-based map coordinates.
const selectedPair = [upperGp0[we[0] - 1], upperGp0[we[1] - 1]];
assert.deepEqual(selectedPair, [20,15]);

const statePair = H(selectedPair[0], selectedPair[1]);
assert.deepEqual(statePair, [g,a]);

const derivedA = powMod(statePair[0], statePair[1], p);
assert.equal(derivedA, A);
assert.equal(upperGp0[derivedA - 1], riseGp0);

// Preserve the upstream p50 RISE selector.
assert.equal(tape[riseGp0], "1G");
const rise59 = 59 * alpha59.indexOf(tape[riseGp0][0])
  + alpha59.indexOf(tape[riseGp0][1]);
const rise60 = 60 * alpha60.indexOf(tape[riseGp0][0])
  + alpha60.indexOf(tape[riseGp0][1]);
assert.deepEqual([rise59, rise60], [75,76]);
assert.equal(corpus.pages.find((page) => page.page === 55).indices.length, 76);

// Charge the exact typed map predicate across every 21-word window.
let windows = 0;
const gaHits = [];
const gaRiseHits = [];
const rawPairHits = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = parseWords(physicalPart(page));
  const sums = gp0(words);

  for (let start = 0; start + 21 <= words.length; start += 1) {
    windows += 1;
    const pair = [sums[start + we[0] - 1], sums[start + we[1] - 1]];
    const mapped = H(pair[0], pair[1]);
    const record = {
      page,
      startWord: start + 1,
      startOffset: words[start].start,
      pair,
      H: mapped,
      positionA: sums[start + A - 1],
    };

    if (mapped[0] === g && mapped[1] === a) gaHits.push(record);
    if (
      mapped[0] === g
      && mapped[1] === a
      && sums[start + A - 1] === riseGp0
    ) {
      gaRiseHits.push(record);
    }
    if (pair[0] === 20 && pair[1] === 15) rawPairHits.push(record);
  }
}

assert.equal(windows, 1833);
assert.equal(gaHits.length, 1);
assert.equal(gaRiseHits.length, 1);
assert.equal(rawPairHits.length, 1);
assert.deepEqual(gaRiseHits[0], {
  page:33,
  startWord:3,
  startOffset:10,
  pair:[20,15],
  H:[5,6],
  positionA:47,
});

console.log(JSON.stringify({
  status:"PASS",
  p55:{
    strictInteriorLength:p55Strict.length,
    selectedSpanLength:p55Span.length,
    twiceShedCircumference:risePair,
    circumferenceGp0:risePair[0] + risePair[1],
    H:we,
    HText:we.map((value) => corpus.translit[value]).join(""),
  },
  p33Map:{
    wordCount:upper.length,
    coordinatesFromWE:we,
    selectedGp0:selectedPair,
    H:statePair,
    stateLabels:["g","a"],
    dh:{p,g,a,A:derivedA},
    positionA_Gp0:upperGp0[derivedA - 1],
  },
  returnToP55:{
    riseGp0,
    p50Token:tape[riseGp0],
    base59:rise59,
    base60:rise60,
    p55PhysicalRunes:corpus.pages.find((page) => page.page === 55).indices.length,
  },
  control:{
    manuscriptWindows:windows,
    hEqualsGa:gaHits.length,
    hEqualsGaAndPositionAIsRise:gaRiseHits,
    exactRawPairHits:rawPairHits.length,
  },
  decision:"The recovered p55 WE=[7,18] closes through the already selected one-based p33 map: positions7/18 have GP0 [20,15], H gives [g,a], DH gives A=8, and map position8 is RISE=47, returning to the existing p55 selector. The typed H predicate is unique across 1,833 manuscript 21-word windows. Preserve as retrospective structural closure.",
}, null, 2));
