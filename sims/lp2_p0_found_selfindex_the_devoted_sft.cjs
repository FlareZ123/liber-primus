"use strict";

/**
 * Authenticated-2016 navigation loop around the p0 word53/54 receiver pair.
 *
 * Existing independent selection:
 *   EMPTY / EPIPHANY -> p50 base60 bytes236 / 237, exactly the boundary between
 *   p0 word53 (end236) and word54 (start237).
 *
 * New transfer using Agent4's frozen prime-H operation:
 *   p0 word53 [8,5] -> GP-prime [23,13] -> sum36 = GP0(FOUND)
 *   FOUND36 -> p50[36]=0s -> base59 53 / base60 54.
 *
 * Thus FOUND points to the two receiver word ordinals. Under carried base59,
 * it self-indexes word53 exactly. The pair's GP rune lengths [2,7] uniquely
 * match THE DEVOTED among adjacent words of the authenticated 2016 message.
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

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
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

const tableTokens = grid.pages.flatMap((page) => page.tokens);
const table60 = grid.pages.flatMap((page) => page.bytes);
assert.equal(tableTokens.length, 256);

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

const p0 = parseWords(physicalPart(0));
const word53 = p0.words.find((word) => word.n === 53);
const word54 = p0.words.find((word) => word.n === 54);
assert.ok(word53);
assert.ok(word54);
assert.deepEqual([word53.start, word53.end, word53.values.length], [235, 236, 2]);
assert.deepEqual([word54.start, word54.end, word54.values.length], [237, 243, 7]);
assert.deepEqual(word53.values, [8, 5]);

// Existing signed-word boundary selection.
const empty = sum(gp("EMPTY"));
const epiphany = sum(gp("EPIPHANY"));
assert.deepEqual([empty, epiphany], [92, 121]);
assert.equal(table60[empty], 236);
assert.equal(table60[epiphany], 237);
assert.equal(table60[empty], word53.end);
assert.equal(table60[epiphany], word54.start);

// Transfer Agent4's fixed prime-H raw sum to the already selected two-rune word.
const primes53 = word53.values.map((value) => corpus.prime[value]);
assert.deepEqual(primes53, [23, 13]);
const primeSum53 = primes53[0] + primes53[1];
const primeDiff53 = Math.abs(primes53[0] - primes53[1]);
assert.equal(primeSum53, 36);
assert.equal(primeDiff53, 10);
assert.equal(sum(gp("FOUND")), 36);

// FOUND points directly to the two receiver ordinals under the two source
// supported radices; carried post-SHED base59 self-indexes word53.
assert.equal(tableTokens[36], "0s");
assert.equal(base59(tableTokens[36]), 53);
assert.equal(table60[36], 54);
assert.equal(base59(tableTokens[36]), word53.n);
assert.equal(table60[36], word54.n);

// Authenticated 2016 message.
const signedWords = (
  "HELLO THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED LIBER PRIMUS IS THE WAY " +
  "ITS WORDS ARE THE MAP THEIR MEANING IS THE ROAD AND THEIR NUMBERS ARE THE " +
  "DIRECTION SEEK AND YOU WILL BE FOUND GOOD LUCK"
).split(/\s+/);

const signedUnique = [...new Set(signedWords)];
const signedBySum = new Map();
for (const word of signedUnique) {
  const value = sum(gp(word));
  if (!signedBySum.has(value)) signedBySum.set(value, []);
  signedBySum.get(value).push(word);
}

// The receiver shape itself selects THE DEVOTED uniquely among adjacent signed
// message words, without inspecting candidate plaintext letters in p0.
const receiverShape = [word53.values.length, word54.values.length];
const signedShapeHits = [];
for (let i = 0; i + 1 < signedWords.length; i += 1) {
  const shape = [gp(signedWords[i]).length, gp(signedWords[i + 1]).length];
  if (shape[0] === receiverShape[0] && shape[1] === receiverShape[1]) {
    signedShapeHits.push([signedWords[i], signedWords[i + 1]]);
  }
}
assert.deepEqual(receiverShape, [2, 7]);
assert.deepEqual(signedShapeHits, [["THE", "DEVOTED"]]);

// Census the prime-sum self-index mechanism over all complete two-rune words.
const selfHits = { base59: [], base60: [] };
let twoRuneWords = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parseWords(physicalPart(page));
  for (const word of parsed.words) {
    if (word.values.length !== 2) continue;
    twoRuneWords += 1;

    const primes = word.values.map((value) => corpus.prime[value]);
    const primeSum = primes[0] + primes[1];
    if (primeSum >= 256) continue;

    const common = {
      page,
      word: word.n,
      start: word.start,
      values: word.values,
      primes,
      primeSum,
      signedWords: signedBySum.get(primeSum) || [],
      token: tableTokens[primeSum],
    };

    const value59 = base59(tableTokens[primeSum]);
    if (value59 === word.n) {
      selfHits.base59.push({ ...common, decoded: value59 });
    }
    if (table60[primeSum] === word.n) {
      selfHits.base60.push({ ...common, decoded: table60[primeSum] });
    }
  }
}

assert.equal(twoRuneWords, 465);
assert.equal(selfHits.base59.length, 3);
assert.equal(selfHits.base60.length, 2);

const signedBase59SelfHits = selfHits.base59.filter((hit) => hit.signedWords.length);
const signedBase60SelfHits = selfHits.base60.filter((hit) => hit.signedWords.length);

assert.deepEqual(signedBase59SelfHits, [{
  page: 0,
  word: 53,
  start: 235,
  values: [8, 5],
  primes: [23, 13],
  primeSum: 36,
  signedWords: ["FOUND"],
  token: "0s",
  decoded: 53,
}]);

assert.deepEqual(signedBase60SelfHits, [{
  page: 10,
  word: 54,
  start: 204,
  values: [5, 8],
  primes: [13, 23],
  primeSum: 36,
  signedWords: ["FOUND"],
  token: "0s",
  decoded: 54,
}]);

// Among authenticated signed words, only LIES and FOUND have p50 tokens whose
// base59/base60 interpretations are consecutive p0 word ordinals. Only FOUND's
// selected ordinal pair has the receiver shape [2,7].
const signedDualOrdinal = [];
for (const word of signedUnique) {
  const address = sum(gp(word));
  const v59 = base59(tableTokens[address]);
  const v60 = table60[address];
  if (
    v59 !== null &&
    v59 >= 1 && v59 <= p0.words.length &&
    v60 >= 1 && v60 <= p0.words.length &&
    Math.abs(v60 - v59) === 1
  ) {
    const low = Math.min(v59, v60);
    const high = Math.max(v59, v60);
    signedDualOrdinal.push({
      word,
      address,
      token: tableTokens[address],
      base59: v59,
      base60: v60,
      shape: [
        p0.words[low - 1].values.length,
        p0.words[high - 1].values.length,
      ],
    });
  }
}

assert.deepEqual(signedDualOrdinal, [
  { word: "LIES", address: 63, token: "0p", base59: 50, base60: 51, shape: [3, 7] },
  { word: "FOUND", address: 36, token: "0s", base59: 53, base60: 54, shape: [2, 7] },
]);

console.log(JSON.stringify({
  status: "PASS",
  existingBoundarySelection: {
    empty: { gp0: empty, p50Base60: table60[empty] },
    epiphany: { gp0: epiphany, p50Base60: table60[epiphany] },
    receiverBoundary: [word53.end, word54.start],
  },
  word53PrimeHTransfer: {
    ciphertext: word53.values,
    primes: primes53,
    rawH: [primes53[0] - primes53[1], primeSum53],
    primeSum: primeSum53,
    authenticatedWordAtThatGp0: signedBySum.get(primeSum53),
  },
  foundNavigation: {
    gp0: 36,
    token: tableTokens[36],
    base59: base59(tableTokens[36]),
    base60: table60[36],
    receiverWordOrdinals: [word53.n, word54.n],
    receiverShape,
    uniqueSignedAdjacentShape: signedShapeHits,
  },
  census: {
    twoRuneWords,
    base59SelfHits: selfHits.base59,
    base60SelfHits: selfHits.base60,
    signedBase59SelfHits,
    signedBase60SelfHits,
    signedDualOrdinal,
  },
  classification:
    "source-navigation loop: the independently selected p0 word53 returns authenticated FOUND through the fixed prime-H sum; FOUND's p50 token selects the two receiver ordinals 53/54 under the two source-supported radices, and their [2,7] GP-length shape uniquely identifies THE DEVOTED among adjacent authenticated 2016 words.",
}, null, 2));
