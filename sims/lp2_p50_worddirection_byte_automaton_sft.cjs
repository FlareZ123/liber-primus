'use strict';

/**
 * Original-input SFT for a p50 32x8 byte-state decoder suggested by the signed
 * 2016 phrase "numbers are the direction".
 *
 * State is one byte.  Its high five bits choose a table row and a word-derived
 * three-bit direction chooses the table column:
 *
 *   d(w) = sum(GP-prime-weight(cipher rune)) mod 8
 *   S'   = B[(S & 0xf8) | d(w)]
 *
 * The two rigid GP29 consumers use S mod 29 immediately before or after the
 * state transition, with either additive sign.  Both word-step and rune-step
 * variants are exhausted over all 256 initial states.
 *
 * This is a bounded hypothesis test.  It does not claim the construction is an
 * authored cipher.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const fs = require('node:fs');
const path = require('node:path');

const transcription = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
);

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const result = [];
  for (let x = 2; result.length < n; x += 1) {
    if (result.every((p) => x % p !== 0)) result.push(x);
  }
  return result;
}

/** @returns {number[][]} */
function parseUnknownWords() {
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const words = [];
  let current = [];

  for (const ch of transcription) {
    if (runeIndex.has(ch)) {
      current.push(runeIndex.get(ch));
    } else if ("-.'".includes(ch) && current.length > 0) {
      words.push(current);
      current = [];
    }
  }
  if (current.length > 0) words.push(current);

  return words.slice(0, 2896);
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/**
 * @param {number} state
 * @param {number} direction
 * @returns {number}
 */
function transition(state, direction) {
  return grid.bytes[(state & 0xf8) | direction];
}

/**
 * @param {'word'|'rune'} stepping
 * @returns {{step:number, wordIndex:number, runeInWord:number, state:number}}
 */
function coalescence(stepping) {
  let states = Array.from({length: 256}, (_, i) => i);
  let step = 0;

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const direction = directions[wordIndex];
    const repetitions = stepping === 'word' ? 1 : words[wordIndex].length;

    for (let runeInWord = 0; runeInWord < repetitions; runeInWord += 1) {
      states = states.map((state) => transition(state, direction));
      step += 1;
      const unique = [...new Set(states)];
      if (unique.length === 1) {
        return {step, wordIndex, runeInWord, state: unique[0]};
      }
    }
  }
  throw new Error('state family did not coalesce');
}

/**
 * @param {number} start
 * @param {1|-1} sign
 * @param {'before'|'after'} timing
 * @param {'word'|'rune'} stepping
 * @returns {{plaintext:number[], reencoded:number[], endState:number}}
 */
function decode(start, sign, timing, stepping) {
  let state = start;
  const plaintext = [];
  const reencoded = [];

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    const direction = directions[wordIndex];

    if (stepping === 'word') {
      const before = state;
      state = transition(state, direction);
      const key = (timing === 'before' ? before : state) % 29;
      for (const cipher of word) {
        const plain = mod29(cipher + sign * key);
        plaintext.push(plain);
        reencoded.push(mod29(plain - sign * key));
      }
    } else {
      for (const cipher of word) {
        const before = state;
        state = transition(state, direction);
        const key = (timing === 'before' ? before : state) % 29;
        const plain = mod29(cipher + sign * key);
        plaintext.push(plain);
        reencoded.push(mod29(plain - sign * key));
      }
    }
  }

  return {plaintext, reencoded, endState: state};
}

/**
 * @param {'word'|'rune'} stepping
 * @returns {Array<object>}
 */
function exhaust(stepping) {
  const rows = [];
  for (const sign of [-1, 1]) {
    for (const timing of ['before', 'after']) {
      let best = null;
      let worst = null;
      for (let start = 0; start < 256; start += 1) {
        const run = decode(start, sign, timing, stepping);
        assert.deepEqual(run.reencoded, ciphertext);
        const score = ioc(run.plaintext);
        if (best === null || score > best.ioc) best = {start, ioc: score, endState: run.endState};
        if (worst === null || score < worst.ioc) worst = {start, ioc: score, endState: run.endState};
      }
      rows.push({stepping, sign, timing, worst, best});
    }
  }
  return rows;
}

assert.equal(grid.bytes.length, 256);
assert.deepEqual(grid.pages.map((p) => p.tokens.length), [80, 104, 72]);

const words = parseUnknownWords();
assert.equal(words.length, 2896);
const ciphertext = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
assert.equal(ciphertext.length, 12956);
assert.deepEqual(words.flat(), ciphertext);

const gpPrimeWeights = firstPrimes(29);
const directions = words.map(
  (word) => word.reduce((sum, rune) => sum + gpPrimeWeights[rune], 0) % 8
);

const wordCoalescence = coalescence('word');
const runeCoalescence = coalescence('rune');
assert.deepEqual(wordCoalescence, {step: 53, wordIndex: 52, runeInWord: 0, state: 144});
assert.deepEqual(runeCoalescence, {step: 53, wordIndex: 10, runeInWord: 3, state: 189});

const wordResults = exhaust('word');
const runeResults = exhaust('rune');

const byKey = (rows, sign, timing) =>
  rows.find((row) => row.sign === sign && row.timing === timing).best.ioc;

// Frozen original-source maxima.  These assertions detect source or algorithm drift.
assert.equal(byKey(wordResults, -1, 'before'), 0.034470783695764985);
assert.equal(byKey(wordResults, -1, 'after'), 0.03446345550519295);
assert.equal(byKey(wordResults, 1, 'before'), 0.03445955905264489);
assert.equal(byKey(wordResults, 1, 'after'), 0.034454542518936225);
assert.equal(byKey(runeResults, -1, 'before'), 0.03447576448220257);
assert.equal(byKey(runeResults, -1, 'after'), 0.034534532995863204);
assert.equal(byKey(runeResults, 1, 'before'), 0.03449772522240463);
assert.equal(byKey(runeResults, 1, 'after'), 0.03449734391817974);

console.log(JSON.stringify({
  unknownRunes: ciphertext.length,
  words: words.length,
  wordCoalescence,
  runeCoalescence,
  wordResults,
  runeResults
}, null, 2));
console.log('PASS: p50 high5/low3 word-direction byte automaton exhaustively rejected in both rigid stepping variants.');
