'use strict';

/**
 * Finite prime_echo -> first intact complete-word pair handoff.
 *
 * Reconstructs all source-bounded exhaustion boundaries in p54-p55, then asks
 * whether the first two complete words beginning at or after each boundary
 * form an adjacent pair that occurs elsewhere in canonical p0-p55.
 *
 * Run:
 *   node sims/lp2_primeecho_intact_pair_handoff_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const unknown = source.split('%').slice(0, 55).join('%');
const physicalPage = (page) => page >= 50 ? page + 1 : page;

const words = [];
let fragment = [];
let rawPage = 0;
let line = 1;
let startRune = -1;
let runeOffset = 0;
let startRawPage = -1;
let endRawPage = -1;
let startLine = -1;
let endLine = -1;

function finishWord() {
  if (!fragment.length) return;
  words.push({
    index: words.length,
    startRune,
    endRune: runeOffset,
    runes: fragment.map((index) => corpus.runes[index]).join(''),
    translit: fragment.map((index) => corpus.translit[index]).join(''),
    startPage: physicalPage(startRawPage),
    endPage: physicalPage(endRawPage),
    startLine,
    endLine
  });
  fragment = [];
}

for (const char of unknown) {
  if (alphabet.has(char)) {
    if (!fragment.length) {
      startRune = runeOffset;
      startRawPage = rawPage;
      startLine = line;
    }
    fragment.push(alphabet.get(char));
    endRawPage = rawPage;
    endLine = line;
    runeOffset++;
  } else if (char === '%') {
    rawPage++;
    line = 1;
  } else if (char === '/') {
    line++;
  } else if (/\s/u.test(char)) {
    // Physical wrapping is not a complete-word delimiter.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(runeOffset, 12956);
assert.equal(words.length, 2896);

const adjacentPairs = new Map();
for (let i = 0; i + 1 < words.length; i++) {
  const key = words[i].runes + '\0' + words[i + 1].runes;
  if (!adjacentPairs.has(key)) adjacentPairs.set(key, []);
  adjacentPairs.get(key).push(i);
}

const repeatedPairs = [...adjacentPairs.entries()]
  .filter(([, indices]) => indices.length > 1);
assert.equal(repeatedPairs.length, 1);

const repeatedKey = repeatedPairs[0][0];
assert.deepEqual(
  repeatedPairs[0][1].map((i) => ({
    page: words[i].startPage,
    line: words[i].startLine,
    pair: [words[i].translit, words[i + 1].translit]
  })),
  [
    {page: 27, line: 2, pair: ['DJU', 'BEI']},
    {page: 55, line: 4, pair: ['DJU', 'BEI']}
  ]
);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

const primes = [];
for (let n = 2; n <= 3301; n++) {
  if (isPrime(n)) primes.push(n);
}
assert.equal(primes.length, 464);

const p54 = corpus.pages.find((page) => page.page === 54);
const p55 = corpus.pages.find((page) => page.page === 55);
assert(p54 && p55);
const terminal = p54.indices.concat(p55.indices);
assert.equal(terminal.length, 308);

/**
 * @returns {{start:number,j:number,boundary:number}[]}
 */
function firstExhaustions() {
  let states = primes.map((unused, start) => ({start, j: start}));
  const exhausted = [];

  for (let i = 0; i < terminal.length; i++) {
    const c = terminal[i];
    const next = [];

    for (const state of states) {
      if (c === 0) next.push(state);

      if (state.j < primes.length) {
        const plain = (c - ((primes[state.j] - 1) % 29) + 29) % 29;
        if (plain !== 0) {
          const advanced = {start: state.start, j: state.j + 1};
          if (advanced.j === primes.length) {
            exhausted.push({...advanced, boundary: i + 1});
          } else {
            next.push(advanced);
          }
        }
      }
    }
    states = next;
  }
  return exhausted;
}

const exhaustions = firstExhaustions();
assert.equal(exhaustions.length, 41);
const boundaries = [...new Set(exhaustions.map((state) => state.boundary))]
  .sort((a, b) => a - b);
assert.equal(boundaries.length, 36);

const terminalGlobalStart = 12956 - 308;
const handoffs = [];

for (const boundary of boundaries) {
  const globalBoundary = terminalGlobalStart + boundary;
  const firstIndex = words.findIndex((word) => word.startRune >= globalBoundary);
  if (firstIndex < 0 || firstIndex + 1 >= words.length) continue;

  const first = words[firstIndex];
  const second = words[firstIndex + 1];
  const pairKey = first.runes + '\0' + second.runes;
  const occurrences = adjacentPairs.get(pairKey);

  if (occurrences.length > 1) {
    handoffs.push({
      boundary,
      firstIndex,
      pair: [first.translit, second.translit],
      occurrences: occurrences.map((i) => ({
        page: words[i].startPage,
        line: words[i].startLine
      }))
    });
  }
}

assert.deepEqual(handoffs, [{
  boundary: 300,
  firstIndex: 2894,
  pair: ['DJU', 'BEI'],
  occurrences: [
    {page: 27, line: 2},
    {page: 55, line: 4}
  ]
}]);

const boundary300Global = terminalGlobalStart + 300;
const cutWord = words.find(
  (word) => word.startRune < boundary300Global &&
    word.endRune > boundary300Global);
assert(cutWord);
assert.equal(cutWord.translit, 'CEAIMCX');
assert.equal(boundary300Global - cutWord.startRune, 4);
assert.equal(cutWord.endRune - boundary300Global, 2);

console.log('CANONICAL WORD GRAPH: 2,896 words, 2,895 adjacent windows');
console.log('GLOBAL REPEATED ADJACENT PAIRS: exactly one type, DJU / BEI at p27 and p55');
console.log('FINITE PRIME_ECHO: 41 exhaustion histories at 36 distinct boundaries');
console.log('FIRST-INTACT-PAIR HANDOFFS: only boundary300 yields a pair repeated elsewhere');
console.log('BOUNDARY300: cuts CEAIMCX after 4/6 runes; first intact words are DJU / BEI');
console.log('DESTINATION: the pair\'s only other occurrence is p27 line2');
console.log('INTERPRETATION: source-constrained p55 -> p27 navigation candidate; no direction rule or plaintext');
