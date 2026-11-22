"use strict";

/**
 * SFT: source-selected p38 DH packet family charge.
 *
 * The receiver was selected before this audit by the independently transferred
 * p50 low-base60 pointer. This script measures the finite DH packet family and
 * its immediate H-difference continuation.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const RUNIC = /[\u16A0-\u16FF]/u;
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exp @param {number} mod @returns {number} */
function modPow(base, exp, mod) {
  let result = 1;
  let x = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = (result * x) % mod;
    x = (x * x) % mod;
    e >>= 1;
  }
  return result;
}

/** @param {number[]} values @returns {number[]} */
function hDiffs(values) {
  const out = [];
  for (let i = 0; i < Math.floor(values.length / 2); i += 1) {
    out.push(mod29(values[i] - values[values.length - 1 - i]));
  }
  return out;
}

const segments = source.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/** @returns {Map<number, Array<object>>} */
function pageWords() {
  const pages = segments.map((text, segment) => ({ page: physicalPage(segment), words: [] }));
  const offsets = new Array(segments.length).fill(0);
  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        ordinal: page.words.length,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        length: values.length,
      });
    }
    values = [];
  }

  for (let segment = 0; segment < segments.length; segment += 1) {
    for (const char of segments[segment]) {
      if (RUNIC.test(char)) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(runeIndex.get(char));
        offsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();
  return new Map(pages.map((page) => [page.page, page.words]));
}

/** @param {number} page @returns {number[][]} */
function runeLines(page) {
  const segment = page <= 49 ? page : page - 1;
  return segments[segment]
    .trim()
    .split("/")
    .filter((line) => RUNIC.test(line))
    .map((line) => [...line].map((char) => runeIndex.get(char)).filter((v) => v !== undefined));
}

const p28Lines = runeLines(28);
assert.equal(p28Lines.length, 12);
const dhLine = p28Lines[5];
assert.equal(dhLine[0], state.p);
assert.equal(dhLine[1], state.A); // source-visible "DH" are the first two runes
assert.equal(dhLine[state.a - 1], 12);
assert.equal(dhLine.filter((value) => value === 12).length, 1);
assert.equal(dhLine.indexOf(12) + 1, state.a);

const dhAtA = dhLine[state.a - 1];
const dhAtB = dhLine[state.b - 1];
const templates = Object.freeze([
  {
    side: "alice",
    values: [state.g, dhAtA, state.B],
    privateIndex: state.a,
    peerPublic: state.B,
  },
  {
    side: "bob",
    values: [state.g, dhAtB, state.A],
    privateIndex: state.b,
    peerPublic: state.A,
  },
]);

assert.deepEqual(templates[0].values, [5, 12, 19]);
assert.equal(mod29(state.g - state.B), state.b);
assert.equal(modPow(state.g, state.a, state.p), state.A);
assert.equal(modPow(state.g, state.b, state.p), state.B);
assert.equal(modPow(state.B, state.a, state.p), state.K);
assert.equal(modPow(state.A, state.b, state.p), state.K);

const expectedSecond = [state.b, state.A, dhAtA];
assert.deepEqual(expectedSecond, [15, 8, 12]);

const pages = pageWords();
const threeWords = [];
const sixWords = [];
const templateHits = [];
const pairedHits = [];

for (const [page, words] of pages) {
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (word.length === 3) threeWords.push(word);
    if (word.length === 6) sixWords.push(word);
    if (word.length !== 3) continue;

    for (const template of templates) {
      if (!word.values.every((value, index) => value === template.values[index])) continue;
      const hit = {
        page,
        ordinal: word.ordinal,
        start: word.start,
        end: word.end,
        values: word.values,
        side: template.side,
        privateIndex: template.privateIndex,
        peerPublic: template.peerPublic,
      };
      templateHits.push(hit);

      const next = words[i + 1];
      if (!next || next.length !== 6) continue;
      const diffs = hDiffs(next.values);
      const expected = template.side === "alice"
        ? expectedSecond
        : [state.a, state.B, dhAtB];
      if (!diffs.every((value, index) => value === expected[index])) continue;

      pairedHits.push({
        ...hit,
        nextOrdinal: next.ordinal,
        nextStart: next.start,
        nextEnd: next.end,
        nextValues: next.values,
        hDiffs: diffs,
        expected,
      });
    }
  }
}

assert.deepEqual(templateHits, [{
  page: 38,
  ordinal: 10,
  start: 54,
  end: 56,
  values: [5, 12, 19],
  side: "alice",
  privateIndex: 6,
  peerPublic: 19,
}]);

assert.deepEqual(pairedHits, [{
  page: 38,
  ordinal: 10,
  start: 54,
  end: 56,
  values: [5, 12, 19],
  side: "alice",
  privateIndex: 6,
  peerPublic: 19,
  nextOrdinal: 11,
  nextStart: 57,
  nextEnd: 62,
  nextValues: [8, 25, 14, 2, 17, 22],
  hDiffs: [15, 8, 12],
  expected: [15, 8, 12],
}]);

console.log(JSON.stringify({
  status: "PASS: source-selected p38 DH packet is unique and its H continuation matches",
  fixedState: state,
  dhLookup: {
    dhAtA,
    dhAtB,
    reverse12OneBased: dhLine.indexOf(12) + 1,
    reverse12Unique: dhLine.filter((value) => value === 12).length === 1,
  },
  packetSemantics: {
    aliceTemplate: templates[0],
    bobTemplate: templates[1],
    outerDiffOfAliceEndpoints: mod29(state.g - state.B),
    expectedOtherPrivate: state.b,
    derivedA: modPow(state.g, state.a, state.p),
    derivedK: modPow(state.B, state.a, state.p),
    expectedSecondHDiffs: expectedSecond,
  },
  population: {
    threeRuneWords: threeWords.length,
    sixRuneWords: sixWords.length,
    packetTemplateHits: templateHits.length,
    packetPlusContinuationHits: pairedHits.length,
  },
  templateHits,
  pairedHits,
  classification:
    "post-selection family charge on a word independently selected by the transferred low-digit pointer; exact state packet and adjacent H continuation are source-constrained structural evidence, not yet plaintext.",
}, null, 2));
