'use strict';

// Source-original LP2 p27/p55/p56 seam. Deterministic read-only Node 22 SFT.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {{page:number,indices:number[],runic_count:number,status:string}} Page */
/** @type {{pages:Page[],translit:string[]}} */
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));

/** @param {number} number @returns {number[]} */
function page(number) {
  const hit = corpus.pages.find((p) => p.page === number);
  assert.ok(hit, 'Missing LP2 page ' + number);
  return hit.indices;
}

/** @param {number[]} sequence @param {number} size @returns {number[][]} */
function repeatedWindows(sequence, size) {
  /** @type {Map<string,number>} */
  const seen = new Map();
  /** @type {number[][]} */
  const matches = [];
  for (let i = 0; i + size <= sequence.length; i++) {
    const key = sequence.slice(i, i + size).join(',');
    if (seen.has(key)) matches.push([seen.get(key), i]);
    else seen.set(key, i);
  }
  return matches;
}

const unknown = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
const all = corpus.pages.flatMap((p) => p.indices);
assert.equal(unknown.length, 12956);
assert.equal(all.length, 13136);
assert.equal(page(55).length, 76);
assert.equal(page(56).length, 85);

const six = [23, 11, 1, 17, 18, 10];
assert.deepEqual(page(27).slice(28, 37), [...six, 25, 0, 13]);
assert.deepEqual(page(55).slice(70), six);
assert.deepEqual(page(56).slice(0, 2), [25, 11]);
assert.deepEqual(repeatedWindows(unknown, 7), []);
assert.deepEqual(repeatedWindows(all, 7), [[6555, 12950]]);
assert.deepEqual(repeatedWindows(all, 8), []);

// Physical p55 ends with a period. The 7th rune 12956 is the first
// glyph of a separately enciphered red heading on p56.
// The numeric concatenation does not imply a shared cipher state.
assert.equal((25 - 1 + 29) % 29, 24); // p56: AE - phi(2) = A.

/**
 * Authentic p56 prime-totient phase-zero inverse with plaintext-F bypass.
 * @param {number[]} cipher
 * @returns {{plain:number[],keyIndex:number}[]}
 */
function decodeP56FirstThree(cipher) {
  const keys = [1, 2, 4]; // phi(2), phi(3), phi(5).
  /** @type {{plain:number[],keyIndex:number}[]} */
  let states = [{plain: [], keyIndex: 0}];
  for (const symbol of cipher) {
    /** @type {{plain:number[],keyIndex:number}[]} */
    const next = [];
    for (const state of states) {
      const plain = (symbol - keys[state.keyIndex] + 29) % 29;
      if (plain !== 0) next.push({
        plain: [...state.plain, plain], keyIndex: state.keyIndex + 1
      });
      if (symbol === 0) next.push({
        plain: [...state.plain, 0], keyIndex: state.keyIndex
      });
    }
    states = next;
  }
  return states;
}

// The next original p27 words after DJU-BEI are GP [AE,F] | [P].
const candidatePaths = decodeP56FirstThree(page(27).slice(34, 37));
const printedWords = candidatePaths.map((p) => [
  p.plain.slice(0, 2).map((v) => corpus.translit[v]).join(''),
  corpus.translit[p.plain[2]]
]);
assert.deepEqual(printedWords, [['AF', 'J'], ['AIA', 'N']]);
assert.ok(candidatePaths.every((p) => ![24, 10, 3].includes(p.plain[2])));

// Planted GP-native English [A,N] | [I] at the same fixed phase.
// Both original p56 first two ciphertext symbols [AE,J] are retained.
const planted = decodeP56FirstThree([25, 11, 14]);
assert.deepEqual(planted.map((p) => p.plain), [[24, 9, 10]]);

console.log('Original LP2 0..57 runes:', all.length);
console.log('Original unknown LP2 0..55 runes:', unknown.length);
console.log('Duplicated length-7 numeric windows, all pages:', [[6555,12950]]);
console.log('Duplicated length-7 numeric windows, unknown pages: none');
console.log('Duplicated length-8 numeric windows, all pages: none');
console.log('Fixed p56-key handoff after p27 echo, words:',
  printedWords.map((p) => p.join(' | ')).join(' OR '));
console.log('Source-native AN | I plant: 3/3 recovered');
console.log('PASS: physical seam is an unauthenticated state boundary; direct handoff fails.');
