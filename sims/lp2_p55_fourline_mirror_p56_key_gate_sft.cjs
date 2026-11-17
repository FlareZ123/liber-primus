#!/usr/bin/env node
'use strict';

/**
 * Source-locked test of one spatial reflection readout for LP2 p55.
 * Node.js 22 CommonJS, Windows-compatible, read-only.
 *
 * Input: exact canonical original LP2 transcription, GP29 indices, and
 * independently solved p56 rune plaintext. No fitted key or ciphertext edits.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} source @returns {number[]} */
function onlyRunes(source) {
  return [...source].filter(ch => runeToIndex.has(ch)).map(ch => runeToIndex.get(ch));
}

/** @param {number} total @returns {number[]} */
function primes(total) {
  /** @type {number[]} */
  const values = [];
  for (let value = 2; values.length < total; value++) {
    let isPrime = true;
    for (const factor of values) {
      if (factor * factor > value) break;
      if (value % factor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) values.push(value);
  }
  return values;
}
const prime = primes(200);

/**
 * Exact authenticated p56 plaintext-F transparency:
 * plaintext F (index 0) emits F and consumes no prime;
 * any other plaintext rune consumes one totient prime.
 * @param {number[]} plain
 * @returns {{indices:number[], consumed:number}}
 */
function encrypt(plain) {
  let cursor = 0;
  const indices = plain.map(value => value === 0 ? 0 : (value + prime[cursor++] - 1) % 29);
  return {indices, consumed:cursor};
}

/**
 * Exhaustive inverse, retaining all ambiguous C=F interpretations.
 * The first impossible offset is zero based, or -1 on complete success.
 * @param {number[]} cipher
 * @returns {{firstImpossibleOffset:number, states:{cursor:number,plain:number[]}[]}}
 */
function invert(cipher) {
  /** @type {{cursor:number,plain:number[]}[]} */
  let states = [{cursor:0, plain:[]}];
  for (let offset = 0; offset < cipher.length; offset++) {
    const C = cipher[offset];
    /** @type {{cursor:number,plain:number[]}[]} */
    const next = [];
    for (const state of states) {
      if (C === 0) next.push({cursor:state.cursor, plain:[...state.plain, 0]});
      const value = ((C - prime[state.cursor] + 1) % 29 + 29) % 29;
      if (value !== 0) next.push({cursor:state.cursor + 1, plain:[...state.plain, value]});
    }
    if (!next.length) return {firstImpossibleOffset:offset, states:[]};
    states = next;
  }
  return {firstImpossibleOffset:-1, states};
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) count[value]++;
  return count.reduce((total, n) => total + n * (n - 1), 0) / (values.length * (values.length - 1));
}

// Historical positive: all 85 genuinely solved p56 plaintext runes exactly
// reproduce the unmodified original p56 ciphertext, consuming 84 primes.
const known = solved.sections.find(section => section.name === 'p56_an_end');
assert.ok(known);
const genuinePlain = onlyRunes(known.source_text);
const original56 = corpus.pages.find(page => page.page === 56).indices;
assert.equal(genuinePlain.length, 85);
assert.deepEqual(encrypt(genuinePlain), {indices:original56, consumed:84});
assert.equal(invert(original56).firstImpossibleOffset, -1);

// Source-printed line breaks, including the terminal 3+3 word pair.
const page55 = transcription.split('%')[54];
const lines = page55.split('/').map(onlyRunes).filter(row => row.length);
const original55 = corpus.pages.find(page => page.page === 55).indices;
assert.deepEqual(lines.map(row => row.length), [24, 22, 22, 8]);
assert.deepEqual(lines.flat(), original55);
assert.equal(original55.length, 76);

const reverse = row => row.slice().reverse();
const reversedLines = lines.slice().reverse();
const layouts = [
  ['original', original55],
  ['all-reversed', reverse(original55)],
  ['reverse-each-line', lines.flatMap(reverse)],
  ['reverse-line-order', reversedLines.flat()],
  ['boustrophedon-odd', lines.flatMap((row, i) => i % 2 ? reverse(row) : row)],
  ['boustrophedon-even', lines.flatMap((row, i) => i % 2 ? row : reverse(row))],
  ['reverse-line-order-boustrophedon-odd', reversedLines.flatMap((row, i) => i % 2 ? reverse(row) : row)],
  ['reverse-line-order-boustrophedon-even', reversedLines.flatMap((row, i) => i % 2 ? row : reverse(row))],
];

const expectedFailures = {
  original:39,
  'all-reversed':17,
  'reverse-each-line':-1,
  'reverse-line-order':19,
  'boustrophedon-odd':62,
  'boustrophedon-even':39,
  'reverse-line-order-boustrophedon-odd':17,
  'reverse-line-order-boustrophedon-even':19
};
const output = [];
for (const [name, indices] of layouts) {
  const result = invert(indices);
  assert.equal(result.firstImpossibleOffset, expectedFailures[name], name);
  const candidates = result.states.map(state => ({
    consumed:state.cursor,
    ioc:ioc(state.plain),
    transliteration:state.plain.map(index => corpus.translit[index]).join('')
  }));
  if (name === 'reverse-each-line') {
    assert.equal(candidates.length, 3);
    assert.deepEqual(candidates.map(candidate => candidate.consumed), [74, 74, 74]);
    for (const candidate of candidates) {
      assert.equal(candidate.transliteration.startsWith('TTHO'), true);
      assert.ok(candidate.ioc < 0.036);
    }
    // All candidate plaintext paths must re-encrypt exactly in the
    // declared spatial order, confirming key-pointer and F semantics.
    for (const state of result.states) assert.deepEqual(encrypt(state.plain).indices, indices);
  }
  output.push({name, firstImpossibleOffset:result.firstImpossibleOffset, candidates});
}
assert.equal(output.filter(item => item.firstImpossibleOffset === -1).length, 1);

console.log(JSON.stringify({
  status:'original p55 source-gate; no recovered plaintext',
  sourcePage:55,
  printedLineLengths:lines.map(row => row.length),
  genuineSolvedP56:{runes:85, consumedPrimes:84, plaintextIoc:ioc(genuinePlain)},
  layouts:output
}, null, 2));
