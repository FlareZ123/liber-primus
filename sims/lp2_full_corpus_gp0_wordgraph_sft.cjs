#!/usr/bin/env node
'use strict';

// Whole-corpus holdout for the direct GP0(word_i) -> p50[GP0] -> GP0(word_{i+1})
// successor hypothesis. Uses the canonical complete-word parser, preserving
// line and page carries. The shuffle null preserves the 256-token multiset.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const raw = transcription.split('%').slice(0, 55).join('%');
const physicalPage = p => p >= 50 ? p + 1 : p;

const words = [];
let fragment = [];
let rawPage = 0;
let line = 1;
let startPage = -1;
let endPage = -1;
let startLine = -1;
let startRune = -1;
let endRune = -1;
let runeOffset = 0;

function finishWord() {
  if (!fragment.length) return;
  words.push({
    indices: fragment.slice(),
    gp0: fragment.reduce((a, b) => a + b, 0),
    translit: fragment.map(i => corpus.translit[i]).join(''),
    page: physicalPage(startPage),
    endPage: physicalPage(endPage),
    line: startLine,
    startRune,
    endRune
  });
  fragment = [];
}

for (const ch of raw) {
  if (runeIndex.has(ch)) {
    if (!fragment.length) {
      startPage = rawPage;
      startLine = line;
      startRune = runeOffset;
    }
    fragment.push(runeIndex.get(ch));
    endPage = rawPage;
    endRune = runeOffset;
    runeOffset++;
  } else if (ch === '%') {
    rawPage++;
    line = 1;
  } else if (ch === '/') {
    line++;
  } else if (/\s/u.test(ch)) {
    // Formatting whitespace is not a word boundary in this transcription.
  } else {
    finishWord();
  }
}
finishWord();

const tokens = grid.pages.flatMap(p => p.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(tokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

function decodeTokens(alphabet) {
  return tokens.map(token => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, `token outside alphabet: ${token}`);
    return hi * alphabet.length + lo;
  });
}

const base60 = decodeTokens(alphabet60);
const base59 = decodeTokens(alphabet59);
const pairs = words.slice(0, -1).map((w, i) => ({
  i,
  source: w.gp0,
  target: words[i + 1].gp0
}));

function edgeRows(table) {
  return pairs.filter(p => p.source < 256 && table[p.source] === p.target)
    .map(p => {
      const from = words[p.i];
      const to = words[p.i + 1];
      return {
        page: from.page,
        line: from.line,
        from: from.translit,
        fromGP0: from.gp0,
        token: tokens[from.gp0],
        to: to.translit,
        toGP0: to.gp0,
        fromStart: from.startRune,
        toStart: to.startRune
      };
    });
}

function runLengths(table) {
  const runs = [];
  let current = 0;
  for (const p of pairs) {
    const hit = p.source < 256 && table[p.source] === p.target;
    if (hit) current++;
    else if (current) {
      runs.push(current);
      current = 0;
    }
  }
  if (current) runs.push(current);
  return runs;
}

function expectedHits(table) {
  const tokenFrequency = new Map();
  for (const value of table) tokenFrequency.set(value, (tokenFrequency.get(value) || 0) + 1);
  const weights = Array.from({ length: 256 }, () => new Map());
  for (const p of pairs) {
    if (p.source >= 256) continue;
    const m = weights[p.source];
    m.set(p.target, (m.get(p.target) || 0) + 1);
  }
  let expected = 0;
  for (let source = 0; source < 256; source++) {
    for (const [target, count] of weights[source]) {
      expected += count * (tokenFrequency.get(target) || 0) / 256;
    }
  }
  return expected;
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function shuffled(values, nextRandom) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = nextRandom() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function permutationNull(table, observed, iterations = 50000, seed = 0x3301) {
  const nextRandom = xorshift32(seed);
  let atLeastObserved = 0;
  let anyAdjacentTwoEdgeRun = 0;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const permuted = shuffled(table, nextRandom);
    let hits = 0;
    let run = 0;
    let hasTwoEdgeRun = false;

    // Iterate every original adjacent word pair. Invalid GP0 addresses break runs.
    for (const p of pairs) {
      const hit = p.source < 256 && permuted[p.source] === p.target;
      if (hit) {
        hits++;
        run++;
        if (run >= 2) hasTwoEdgeRun = true;
      } else {
        run = 0;
      }
    }

    if (hits >= observed) atLeastObserved++;
    if (hasTwoEdgeRun) anyAdjacentTwoEdgeRun++;
  }

  return {
    seed: '0x3301',
    iterations,
    pUpperTail: atLeastObserved / iterations,
    pAnyAdjacentTwoEdgeRun: anyAdjacentTwoEdgeRun / iterations
  };
}

const edges60 = edgeRows(base60);
const edges59 = edgeRows(base59);
const runs60 = runLengths(base60);
const runs59 = runLengths(base59);
const expectation = expectedHits(base60);
const nullResult = permutationNull(base60, edges60.length);

const crossPageWords = words.filter(w => w.page !== w.endPage).length;

assert.equal(words.length, 2896);
assert.equal(runeOffset, 12956);
assert.equal(crossPageWords, 32);
assert.equal(pairs.length, 2895);
assert.equal(new Set(words.map(w => w.gp0)).size, 193);
assert.equal(edges60.length, 10);
assert.equal(edges59.length, 11);
assert.deepEqual(runs60, []);
assert.deepEqual(runs59, []);
assert.ok(Math.abs(expectation - 11.83984375) < 1e-12);
assert.equal(nullResult.pUpperTail, 0.73624);
assert.equal(nullResult.pAnyAdjacentTwoEdgeRun, 0.0451);

console.log(JSON.stringify({
  scope: 'physical LP2 p0-p55; p50 is the rune-free table page',
  wordCount: words.length,
  runeCount: runeOffset,
  crossPageWords,
  adjacentPairs: pairs.length,
  distinctGP0Addresses: new Set(words.map(w => w.gp0)).size,
  base60: {
    edgeCount: edges60.length,
    expectedUnderFixedTokenShuffle: expectation,
    runLengths: runs60,
    edges: edges60
  },
  base59Sensitivity: {
    edgeCount: edges59.length,
    runLengths: runs59,
    edges: edges59
  },
  fixedMultisetPermutationNull: nullResult
}, null, 2));
