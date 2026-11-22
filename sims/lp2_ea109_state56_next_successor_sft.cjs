"use strict";

/**
 * EA109 prime-H raw state56 -> unique p50/p0 successor -> NEXT.
 *
 * Chronological holdout:
 * - Agent2 froze/corrected the numeric state56 p50 consumer before EA109's
 *   selected ciphertext contents were inspected.
 * - Agent4 later obtained |prime(X)-prime(Y)|=56 prospectively at EA109.
 *
 * This test does not depend on the exact plaintext interpretation MAP, because
 * it treats 56 as a numeric state and charges every p50 address plus the four
 * source-supported radix/origin modes.
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

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function parseWords(text) {
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

const p0 = parseWords(parts[0]);
const eaWord = p0.words.find((word) => word.start === 109);
assert.ok(eaWord);
assert.equal(eaWord.n, 24);
assert.deepEqual(eaWord.values, [14, 26]);
assert.deepEqual(eaWord.values.map((value) => corpus.prime[value]), [47, 103]);

const primePair = eaWord.values.map((value) => corpus.prime[value]);
const rawDifferenceMagnitude = Math.abs(primePair[0] - primePair[1]);
const rawSum = primePair[0] + primePair[1];
assert.equal(rawDifferenceMagnitude, 56);
assert.equal(rawSum, 150);
assert.deepEqual([
  ((primePair[0] - primePair[1]) % 29 + 29) % 29,
  rawSum % 29,
], [2, 5]); // [K,g]

const tokens = grid.pages.flatMap((page) => page.tokens);
const base60 = grid.pages.flatMap((page) => page.bytes);
assert.equal(tokens.length, 256);
assert.equal(base60.length, 256);

const alphabet59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
function base59(token) {
  let value = 0;
  for (const char of token) {
    const digit = alphabet59.indexOf(char);
    if (digit < 0) return null;
    value = value * 59 + digit;
  }
  return value;
}

// The numeric state56 consumer was frozen before EA109 produced 56.
assert.equal(tokens[56], "4E");
assert.equal(base60[56], 254);
assert.equal(base59(tokens[56]), 250);

const wordStarts = new Map(p0.words.map((word) => [word.start, word.n]));
assert.equal(wordStarts.get(254), 57);
assert.equal(wordStarts.get(250), undefined);

const nextGp0 = sum(gp("NEXT"));
assert.equal(nextGp0, 57);
assert.equal(wordStarts.get(base60[56]), nextGp0);

// Charge every table address and all four source-supported radix/origin modes.
// A "successor" means numeric state n maps to the exact start of p0 word n+1.
const modes = {
  "base60-zero": (address) => base60[address],
  "base60-one": (address) => base60[address] - 1,
  "base59-zero": (address) => base59(tokens[address]),
  "base59-one": (address) => {
    const value = base59(tokens[address]);
    return value === null ? null : value - 1;
  },
};

const modeResults = {};
for (const [name, decode] of Object.entries(modes)) {
  const boundaries = [];
  const successors = [];
  for (let address = 0; address < 256; address += 1) {
    const offset = decode(address);
    if (offset === null || offset < 0) continue;
    const word = wordStarts.get(offset);
    if (word === undefined) continue;
    boundaries.push({ address, offset, word, token: tokens[address] });
    if (word === address + 1) {
      successors.push({ address, offset, word, token: tokens[address] });
    }
  }
  modeResults[name] = {
    boundaryCount: boundaries.length,
    successorCount: successors.length,
    successors,
  };
}

assert.deepEqual(modeResults, {
  "base60-zero": {
    boundaryCount: 68,
    successorCount: 1,
    successors: [{ address: 56, offset: 254, word: 57, token: "4E" }],
  },
  "base60-one": {
    boundaryCount: 61,
    successorCount: 0,
    successors: [],
  },
  "base59-zero": {
    boundaryCount: 63,
    successorCount: 0,
    successors: [],
  },
  "base59-one": {
    boundaryCount: 51,
    successorCount: 0,
    successors: [],
  },
});

// Existing independently published NEXT edge.
assert.equal(tokens[nextGp0], "1w");
assert.equal(base60[nextGp0], 118);

console.log(JSON.stringify({
  status: "PASS",
  ea109: {
    word: eaWord.n,
    offsets: [eaWord.start, eaWord.end],
    ciphertext: eaWord.values,
    primeWeights: primePair,
    rawHadamard: [primePair[0] - primePair[1], rawSum],
    rawDifferenceMagnitude,
    mod29: [2, 5],
    stateLabels: ["K", "g"],
  },
  successorRule: {
    state: rawDifferenceMagnitude,
    p50Address: 56,
    token: tokens[56],
    base60Offset: base60[56],
    p0Word: wordStarts.get(base60[56]),
    gp0Next: nextGp0,
    exactRelation: "state n -> start of p0 word n+1",
  },
  exhaustiveModes: modeResults,
  existingNextContinuation: {
    address: nextGp0,
    token: tokens[nextGp0],
    base60: base60[nextGp0],
    publishedReceiver: "one-based p28 rune118 -> DH",
  },
  classification:
    "chronological numeric holdout: EA109 independently emits the already frozen state56, and n=56 under base60-zero is the sole table address across all charged radix/origin modes that maps to p0 word n+1, with n+1=GP0(NEXT).",
}, null, 2));
