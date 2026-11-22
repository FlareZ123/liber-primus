"use strict";

/**
 * Exact p0 receiver comparison of the two source-supported p50 radix readings.
 *
 * Frozen operation:
 *   signed word -> canonical GP0 sum -> p50 token address -> decoded byte
 *   -> p0 zero-based rune offset.
 *
 * Radices compared:
 *   - conventional base60 source alphabet;
 *   - base59 obtained by removing the only source-absent digit, lowercase f.
 *
 * The test exhausts all 42 adjacent signed-word pairs under both radices.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const grid = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")
);
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"),
  "utf8"
);
const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(tokens.length, 256);
assert.equal(tokens.some((token) => token.includes("f")), false);

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const bytes = {
  base59: tokens.map((token) => decode(token, alphabet59)),
  base60: tokens.map((token) => decode(token, alphabet60)),
};
assert.ok(bytes.base59.every((value) => value >= 0 && value <= 255));
assert.deepEqual(bytes.base60, grid.bytes);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @returns {{index:number,start:number,end:number,length:number}[]} */
function p0Words() {
  const source = transcription.split(/\r?\n%\r?\n/)[0];
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      length: current.length,
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  assert.equal(offset, 262);
  assert.equal(words.length, 59);
  return words;
}

const p0 = p0Words();
const endMap = new Map(p0.map((word) => [word.end, word]));
const startMap = new Map(p0.map((word) => [word.start, word]));

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map(
  (word, index) => {
    const values = gp(word);
    return {
      index,
      word: word.toUpperCase(),
      sum: sum(values),
      length: values.length,
    };
  }
);
assert.equal(signedWords.length, 43);

/** @param {number} x @param {number} y @returns {number[]} */
function enclosedWordLengths(x, y) {
  const low = Math.min(x, y);
  const high = Math.max(x, y);
  return p0
    .filter((word) => word.start > low && word.end <= high)
    .map((word) => word.length);
}

/** @param {number[]} vector @returns {{start:number,phrase:string}[]} */
function matchingSignedPhrases(vector) {
  const hits = [];
  for (let i = 0; i + vector.length <= signedWords.length; i += 1) {
    const candidate = signedWords.slice(i, i + vector.length);
    if (candidate.every((word, j) => word.length === vector[j])) {
      hits.push({
        start: i,
        phrase: candidate.map((word) => word.word).join(" "),
      });
    }
  }
  return hits;
}

/**
 * @param {number[]} decoded
 * @returns {{
 *   consecutivePairs:{i:number,pair:string,x:number,y:number}[],
 *   boundaryCrossings:object[],
 *   bracketCandidates:object[],
 *   bracketPhraseMatches:object[]
 * }}
 */
function census(decoded) {
  const consecutivePairs = [];
  const boundaryCrossings = [];
  const bracketCandidates = [];
  const bracketPhraseMatches = [];

  for (let i = 0; i < signedWords.length - 1; i += 1) {
    const left = signedWords[i];
    const right = signedWords[i + 1];
    const x = decoded[left.sum];
    const y = decoded[right.sum];
    const pair = left.word + " / " + right.word;

    if (Math.abs(x - y) === 1) {
      consecutivePairs.push({ i, pair, x, y });
    }

    const ending = endMap.get(x);
    const starting = startMap.get(y);
    if (
      ending &&
      starting &&
      y === x + 1 &&
      starting.index === ending.index + 1
    ) {
      boundaryCrossings.push({
        i,
        pair,
        x,
        y,
        boundary: [ending.index, starting.index],
        lengths: [ending.length, starting.length],
      });
    }

    if (endMap.has(x) && endMap.has(y) && x !== y) {
      const vector = enclosedWordLengths(x, y);
      if (!vector.length) continue;
      const matches = matchingSignedPhrases(vector);
      bracketCandidates.push({
        i,
        pair,
        x,
        y,
        vector,
        matchCount: matches.length,
      });
      for (const match of matches) {
        bracketPhraseMatches.push({ pair, x, y, vector, ...match });
      }
    }
  }

  return {
    consecutivePairs,
    boundaryCrossings,
    bracketCandidates,
    bracketPhraseMatches,
  };
}

const result59 = census(bytes.base59);
const result60 = census(bytes.base60);

assert.deepEqual(result59.consecutivePairs, [
  { i: 4, pair: "EMPTY / EPIPHANY", x: 232, y: 233 },
]);
assert.deepEqual(result59.boundaryCrossings, []);
assert.deepEqual(result59.bracketCandidates, []);
assert.deepEqual(result59.bracketPhraseMatches, []);

assert.deepEqual(result60.consecutivePairs, [
  { i: 4, pair: "EMPTY / EPIPHANY", x: 236, y: 237 },
]);
assert.deepEqual(result60.boundaryCrossings, [
  {
    i: 4,
    pair: "EMPTY / EPIPHANY",
    x: 236,
    y: 237,
    boundary: [52, 53],
    lengths: [2, 7],
  },
]);
assert.deepEqual(result60.bracketCandidates, [
  {
    i: 6,
    pair: "SEEKS / THE",
    x: 108,
    y: 102,
    vector: [2, 4],
    matchCount: 1,
  },
  {
    i: 28,
    pair: "THE / DIRECTION",
    x: 102,
    y: 72,
    vector: [2, 2, 3, 3, 7, 5, 8],
    matchCount: 0,
  },
]);
assert.deepEqual(result60.bracketPhraseMatches, [
  {
    pair: "SEEKS / THE",
    x: 108,
    y: 102,
    vector: [2, 4],
    start: 22,
    phrase: "THE ROAD",
  },
]);

console.log(JSON.stringify({
  status:
    "PASS: within the frozen p0 receiver grammar, conventional base60 uniquely preserves the boundary and bracket typing across both source-supported radices",
  base59: result59,
  base60: result60,
}, null, 2));
