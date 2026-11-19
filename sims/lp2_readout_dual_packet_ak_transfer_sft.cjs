"use strict";

/**
 * Dual READOUT receiver blind transfer for the frozen (A,K) packet selector.
 *
 * Chronology:
 * 1. The canonical H shell and split READ OUT p0 receiver 80..102 existed.
 * 2. Agent14 committed the one-based (A,K)=(8,2) selector on that packet,
 *    which emits [a,p]=[6,23] and decrypts the following p0 word to THE.
 * 3. Director #1706 later selected the whole READOUT sibling 166..188 using
 *    only GP0/p50/base60/source geometry, before opening its H/DH contents.
 *
 * This SFT applies the already frozen H and (A,K) selector to both source-
 * selected receivers, then charges the selector/index-origin/additive-sign
 * family and every complete-word 23-rune span in the unknown manuscript.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      n: words.length + 1,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function shellWord(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

function shellWords(words) {
  return words.flatMap((word) => shellWord(word.values));
}

const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
const stateEntries = Object.entries(state);
const stateValues = new Set(Object.values(state));
const chainValues = new Set([state.K, state.A, state.B, state.b]);
const otherStateValues = new Set([state.p, state.g, state.a]);

const table60 = grid.pages.flatMap((page) => page.bytes);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(table60.length, 256);

// Derive both p0 receiver geometries from the already established READOUT
// whole/split GP0 -> zero-based p50 -> conventional-base60 semantics.
assert.equal(sum(gp("READOUT")), 75);
assert.equal(sum(gp("READ")), 55);
assert.equal(sum(gp("OUT")), 20);
assert.equal(tableTokens[75], "2v");
assert.equal(table60[75], 177);
assert.equal(table60[55], 80);
assert.equal(table60[20], 102);

const p0 = parsePage(physicalPart(0));

function completeWordsIn(start, end) {
  return p0.words.filter((word) => word.start >= start && word.end <= end);
}

const splitWords = completeWordsIn(80, 102);
const wholeWords = completeWordsIn(166, 188);
assert.deepEqual(splitWords.map((word) => word.n), [18, 19, 20, 21]);
assert.deepEqual(wholeWords.map((word) => word.n), [38, 39, 40, 41, 42]);
assert.equal(splitWords.flatMap((word) => word.values).length, 23);
assert.equal(wholeWords.flatMap((word) => word.values).length, 23);
assert.equal(p0.runes[91], 0);
assert.equal(p0.runes[177], 0);

const split = shellWords(splitWords);
const whole = shellWords(wholeWords);
assert.equal(split.length, 23);
assert.equal(whole.length, 23);
assert.deepEqual(split, [
  19, 23, 25, 4, 16, 12, 9, 6, 10, 14, 15, 8, 24, 5, 21, 5, 28, 26, 22, 9, 0, 18, 2,
]);
assert.deepEqual(whole, [
  15, 8, 22, 10, 11, 15, 10, 2, 13, 8, 28, 15, 14, 8, 20, 12, 9, 4, 25, 4, 7, 24, 19,
]);

// The selector was fixed by the earlier split-packet candidate before the
// whole READOUT receiver was selected. Values are one-based packet positions.
function selectOneBased(stream, first, second) {
  return [stream[first - 1], stream[second - 1]];
}

const splitAK = selectOneBased(split, state.A, state.K);
const wholeAK = selectOneBased(whole, state.A, state.K);
assert.deepEqual(splitAK, [state.a, state.p]);
assert.deepEqual(wholeAK, [state.K, state.A]);
assert.equal(mod29(state.K ** 3), state.A);

// Exact split inverse into the immediately following original p0 word.
const nextWord = p0.words.find((word) => word.n === 22);
assert.deepEqual(nextWord.values, [8, 12]);
const decrypted = nextWord.values.map((value, index) => mod29(value - splitAK[index]));
assert.deepEqual(decrypted, gp("THE"));

// The sibling's DH-valued symbols are confined to the K->A->B->b chain.
const wholeDh = whole.filter((value) => stateValues.has(value));
assert.deepEqual(wholeDh, [15, 8, 15, 2, 8, 15, 8, 19]);
assert.ok([...chainValues].every((value) => wholeDh.includes(value)));
assert.equal(wholeDh.some((value) => otherStateValues.has(value)), false);

// Census every complete-word-bounded 23-rune span.
let spans = 0;
let centerFSpans = 0;
let fixedSelectorBothDh = 0;
let fixedSelectorBothDhCenterF = 0;
let exactAP = 0;
let exactKA = 0;
const exact = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  for (let first = 0; first < parsed.words.length; first += 1) {
    let length = 0;
    for (let last = first; last < parsed.words.length && length < 23; last += 1) {
      length += parsed.words[last].values.length;
      if (length !== 23) continue;
      spans += 1;
      const start = parsed.words[first].start;
      const end = parsed.words[last].end;
      const centerF = parsed.runes[start + 11] === 0;
      if (centerF) centerFSpans += 1;

      const stream = shellWords(parsed.words.slice(first, last + 1));
      const pair = selectOneBased(stream, state.A, state.K);
      const bothDh = pair.every((value) => stateValues.has(value));
      if (bothDh) {
        fixedSelectorBothDh += 1;
        if (centerF) fixedSelectorBothDhCenterF += 1;
      }

      if (pair[0] === state.a && pair[1] === state.p) {
        exactAP += 1;
        exact.push({ type: "a,p", page, firstWord: first + 1, lastWord: last + 1, start, end, centerF });
      }
      if (pair[0] === state.K && pair[1] === state.A) {
        exactKA += 1;
        exact.push({ type: "K,A", page, firstWord: first + 1, lastWord: last + 1, start, end, centerF });
      }
    }
  }
}

assert.equal(spans, 614);
assert.equal(centerFSpans, 23);
assert.equal(fixedSelectorBothDh, 36);
assert.equal(fixedSelectorBothDhCenterF, 2);
assert.equal(exactAP, 1);
assert.equal(exactKA, 1);
assert.deepEqual(exact, [
  { type: "a,p", page: 0, firstWord: 18, lastWord: 21, start: 80, end: 102, centerF: true },
  { type: "K,A", page: 0, firstWord: 38, lastWord: 42, start: 166, end: 188, centerF: true },
]);

// Charge the retrospective selector freedom on the fixed split THE inverse and
// demand that the identical selector/origin also emits a DH pair on the sibling.
// The authenticated 2016 two-rune GP targets are THE, IS and BE.
const sourceTargets = new Map([
  [gp("THE").join(","), "THE"],
  [gp("IS").join(","), "IS"],
  [gp("BE").join(","), "BE"],
]);
const familyHits = [];

for (const origin of ["one", "zero"]) {
  for (const [firstName, firstValue] of stateEntries) {
    for (const [secondName, secondValue] of stateEntries) {
      const firstIndex = origin === "one" ? firstValue - 1 : firstValue;
      const secondIndex = origin === "one" ? secondValue - 1 : secondValue;
      if (firstIndex < 0 || secondIndex < 0 || firstIndex >= 23 || secondIndex >= 23) continue;

      const key = [split[firstIndex], split[secondIndex]];
      const sibling = [whole[firstIndex], whole[secondIndex]];
      if (!sibling.every((value) => stateValues.has(value))) continue;

      for (const sign of ["subtract", "add"]) {
        const plain = nextWord.values.map((value, index) => (
          sign === "subtract" ? mod29(value - key[index]) : mod29(value + key[index])
        ));
        const word = sourceTargets.get(plain.join(","));
        if (word) {
          familyHits.push({
            origin,
            selector: [firstName, secondName],
            indices: [firstValue, secondValue],
            key,
            sign,
            word,
            sibling,
          });
        }
      }
    }
  }
}

assert.equal(2 * 49 * 2, 196);
assert.deepEqual(familyHits, [
  {
    origin: "one",
    selector: ["A", "K"],
    indices: [8, 2],
    key: [6, 23],
    sign: "subtract",
    word: "THE",
    sibling: [2, 8],
  },
  {
    origin: "one",
    selector: ["K", "A"],
    indices: [2, 8],
    key: [23, 6],
    sign: "add",
    word: "THE",
    sibling: [8, 2],
  },
]);

console.log(JSON.stringify({
  status: "PASS",
  chronology: {
    frozenSelectorBeforeSibling: "(A,K)=(8,2), one-based, subtraction",
    laterBlindReceiver: "whole READOUT -> p0 166..188",
  },
  splitReceiver: {
    offsets: [80, 102],
    words: splitWords.map((word) => word.n),
    selected: splitAK,
    interpretation: "[a,p]",
    nextCipher: nextWord.values,
    plaintext: decrypted,
    plaintextText: "THE",
  },
  wholeReceiver: {
    offsets: [166, 188],
    words: wholeWords.map((word) => word.n),
    selected: wholeAK,
    interpretation: "[K,A]",
    cubeRelation: "K^3 mod29 = A",
    dhHits: wholeDh,
    dhHitsRestrictedToChain: true,
  },
  manuscriptCensus: {
    completeWord23Spans: spans,
    exactCenterFSpans: centerFSpans,
    fixedAKBothDh: fixedSelectorBothDh,
    fixedAKBothDhCenterF: fixedSelectorBothDhCenterF,
    exactAP,
    exactKA,
    exact,
  },
  selectorFamily: {
    configurations: 196,
    hits: familyHits,
    note: "The second hit is the algebraically equivalent reversed-selector/addition representation. Under the originally frozen subtraction convention, (A,K) is the sole hit.",
  },
  classification:
    "chronological blind transfer: a retrospective split-packet selector fixed before the sibling receiver existed transfers exactly to [K,A] on the later source-selected sibling, while [a,p] and [K,A] are each unique across all 614 complete-word 23-rune spans.",
}, null, 2));
