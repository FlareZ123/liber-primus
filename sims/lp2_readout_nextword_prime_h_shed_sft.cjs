"use strict";

/**
 * READ OUT -> immediate two-rune word -> GP-prime H -> SHED64.
 *
 * The prime-H consumer was fixed on the independently selected EA109 two-rune
 * receiver. This transfer is not chronologically blind to p0 word22's bytes,
 * so the evidence comes from the frozen operation plus a matched-family census:
 * among all 23 whole-word-bounded 23-rune center-F spans, only the split p0
 * READ OUT receiver is followed by a two-rune word whose prime-H sum/difference
 * is GP0(SHED)=64. The whole READOUT sibling's next word has length3.
 *
 * After SHED, the already familywise-audited global drop-f base59 state is used
 * unchanged. No radix is selected from the downstream outputs here.
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

function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
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

assert.equal(gp0("READ"), 55);
assert.equal(gp0("OUT"), 20);
assert.equal(gp0("READOUT"), 75);
assert.equal(table60[55], 80);
assert.equal(table60[20], 102);
assert.equal(table60[75], 177);

const p0 = parsePage(physicalPart(0));
const splitWords = p0.words.filter((word) => word.start >= 80 && word.end <= 102);
const wholeWords = p0.words.filter((word) => word.start >= 166 && word.end <= 188);
assert.deepEqual(splitWords.map((word) => word.n), [18, 19, 20, 21]);
assert.deepEqual(wholeWords.map((word) => word.n), [38, 39, 40, 41, 42]);
assert.equal(splitWords.flatMap((word) => word.values).length, 23);
assert.equal(wholeWords.flatMap((word) => word.values).length, 23);
assert.equal(p0.runes[91], 0);
assert.equal(p0.runes[177], 0);

const splitNext = p0.words[21];
const wholeNext = p0.words[42];
assert.equal(splitNext.n, 22);
assert.deepEqual([splitNext.start, splitNext.end, splitNext.values], [103, 104, [8, 12]]);
assert.equal(wholeNext.n, 43);
assert.equal(wholeNext.values.length, 3);

const splitPrimes = splitNext.values.map((value) => corpus.prime[value]);
assert.deepEqual(splitPrimes, [23, 41]);
const splitRawH = [splitPrimes[0] - splitPrimes[1], splitPrimes[0] + splitPrimes[1]];
assert.deepEqual(splitRawH, [-18, 64]);
assert.equal(gp0("SHED"), 64);

// Freeze the already audited post-SHED global radix state.
assert.equal(tableTokens[64], "22");
assert.equal(base59(tableTokens[64]), 120);
assert.equal(table60[64], 122);
assert.equal(gp0("PARABLE"), 120);

assert.equal(tableTokens[120], "0g");
assert.equal(base59(tableTokens[120]), 41);
assert.equal(table60[120], 42);

assert.equal(tableTokens[41], "1O");
assert.equal(base59(tableTokens[41]), 83);
assert.equal(gp0("EMERGE"), 83);

// Matched-family census: all complete-word-bounded 23-rune spans whose exact
// center rune is F. Apply only the frozen next-word two-rune prime-H consumer.
let completeWord23Spans = 0;
let centerFSpans = 0;
let centerFWithNextWord = 0;
let centerFNextTwoRune = 0;
const shedHits = [];
const nextTwoRuneRows = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));

  for (let first = 0; first < parsed.words.length; first += 1) {
    let length = 0;
    for (let last = first; last < parsed.words.length && length < 23; last += 1) {
      length += parsed.words[last].values.length;
      if (length !== 23) continue;
      completeWord23Spans += 1;

      const start = parsed.words[first].start;
      const end = parsed.words[last].end;
      if (parsed.runes[start + 11] !== 0) continue;
      centerFSpans += 1;

      const next = parsed.words[last + 1];
      if (!next) continue;
      centerFWithNextWord += 1;
      if (next.values.length !== 2) continue;
      centerFNextTwoRune += 1;

      const primes = next.values.map((value) => corpus.prime[value]);
      const difference = Math.abs(primes[0] - primes[1]);
      const sum = primes[0] + primes[1];
      const row = {
        page,
        firstWord: first + 1,
        lastWord: last + 1,
        start,
        end,
        nextWord: next.n,
        nextStart: next.start,
        nextValues: next.values,
        primes,
        difference,
        sum,
      };
      nextTwoRuneRows.push(row);

      if (difference === gp0("SHED") || sum === gp0("SHED")) {
        shedHits.push({
          ...row,
          component: difference === gp0("SHED") ? "difference" : "sum",
        });
      }
    }
  }
}

assert.equal(completeWord23Spans, 614);
assert.equal(centerFSpans, 23);
assert.equal(centerFWithNextWord, 22);
assert.equal(centerFNextTwoRune, 5);
assert.deepEqual(shedHits, [{
  page: 0,
  firstWord: 18,
  lastWord: 21,
  start: 80,
  end: 102,
  nextWord: 22,
  nextStart: 103,
  nextValues: [8, 12],
  primes: [23, 41],
  difference: 18,
  sum: 64,
  component: "sum",
}]);

console.log(JSON.stringify({
  status: "PASS",
  splitReadOut: {
    receiver: [80, 102],
    words: splitWords.map((word) => word.n),
    immediateNextWord: {
      word: splitNext.n,
      offsets: [splitNext.start, splitNext.end],
      ciphertext: splitNext.values,
      primeWeights: splitPrimes,
      rawH: splitRawH,
      instructionGp0: { SHED: gp0("SHED") },
    },
  },
  wholeReadoutControl: {
    receiver: [166, 188],
    words: wholeWords.map((word) => word.n),
    immediateNextWord: {
      word: wholeNext.n,
      length: wholeNext.values.length,
      consumerTypeChecks: false,
    },
  },
  matchedFamily: {
    completeWord23Spans,
    centerFSpans,
    centerFWithNextWord,
    centerFNextTwoRune,
    nextTwoRuneRows,
    shedHits,
  },
  frozenPostShedContinuation: {
    shed: {
      gp0: 64,
      token: tableTokens[64],
      base59: base59(tableTokens[64]),
      base60Control: table60[64],
    },
    parable: {
      gp0: gp0("PARABLE"),
      token: tableTokens[120],
      base59: base59(tableTokens[120]),
      base60Control: table60[120],
    },
    address41: {
      token: tableTokens[41],
      base59: base59(tableTokens[41]),
      equalsGp0Emerge: base59(tableTokens[41]) === gp0("EMERGE"),
    },
  },
  classification:
    "cross-object transfer with matched-family discrimination: fixed prime-H on the immediate word after the split READ OUT receiver yields SHED64 uniquely among all 23 center-F 23-rune spans; the whole READOUT sibling fails the two-rune consumer type. Downstream uses the independently audited global post-SHED base59 state unchanged.",
}, null, 2));
