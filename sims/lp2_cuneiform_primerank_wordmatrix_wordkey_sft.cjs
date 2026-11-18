#!/usr/bin/env node
'use strict';

// Source-bounded test: the 290-prime interval after 1033 through 3301 is
// partitioned into ten 29-prime rows. Word ordinal modulo ten selects a row;
// within a word, phi(prime) mod 29 is consumed left-to-right. The inverse
// applies the known p56 plaintext-F non-consuming rule.
//
// Run from the repository root:
//   node sims/lp2_cuneiform_primerank_wordmatrix_wordkey_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pages = transcription.split('%');

function parseWords(raw) {
  const kept = [...raw].filter(ch => runeSet.has(ch) || ch === '-' || ch === '.').join('');
  return kept.split(/[-.]/).filter(Boolean).map(word => [...word].map(ch => {
    const value = runeIndex.get(ch);
    assert.notEqual(value, undefined, 'Unknown rune ' + ch);
    return value;
  }));
}
function flatten(words) { return words.flat(); }
function same(a, b) { return a.length === b.length && a.every((x, i) => x === b[i]); }
function primesThrough(limit) {
  const prime = new Uint8Array(limit + 1);
  prime.fill(1);
  prime[0] = 0;
  prime[1] = 0;
  for (let p = 2; p * p <= limit; p++) {
    if (prime[p]) for (let q = p * p; q <= limit; q += p) prime[q] = 0;
  }
  return Array.from({ length: limit - 1 }, (_, i) => i + 2).filter(p => prime[p]);
}

// The cuneiform endpoints are prime ranks 174 and 464. The selected 290
// values are ranks 175..464 inclusive: 1039..3301.
const primes = primesThrough(3301);
assert.equal(primes.length, 464);
assert.equal(primes[173], 1033);
assert.equal(primes[174], 1039);
assert.equal(primes[463], 3301);

const keyRows = Array.from({ length: 10 }, (_, row) =>
  primes.slice(174 + row * 29, 174 + (row + 1) * 29).map(p => (p - 1) % 29)
);
assert.equal(keyRows.length, 10);
assert(keyRows.every(row => row.length === 29));

// The cuneiform-marked register begins immediately after the p33 ampersand
// marker. Remove page separators without inserting word breaks, preserving
// words that continue across a physical page boundary. Hyphens and periods
// are the transcription's word/punctuation boundaries.
const p33Marker = pages[33].indexOf('&');
assert.notEqual(p33Marker, -1);
const p33PrefixRuneCount = [...pages[33].slice(0, p33Marker)].filter(ch => runeSet.has(ch)).length;
assert.equal(p33PrefixRuneCount, 91);
const markedRaw = pages[33].slice(p33Marker + 1) + pages.slice(34, 40).join('');
const markedWords = parseWords(markedRaw);
const markedCipher = flatten(markedWords);
const expectedMarked = [
  ...corpus.pages[33].indices.slice(91),
  ...corpus.pages.slice(34, 40).flatMap(page => page.indices)
];
assert.equal(markedWords.length, 355);
assert.equal(markedCipher.length, 1589);
assert(same(markedCipher, expectedMarked));

// For zero-based word ordinal w, choose key row w mod 10. The within-word
// key clock starts at column zero and advances only for non-F plaintext.
// Ciphertext F can be either transparent plaintext F (no advance), or a
// normally encrypted non-F symbol (advance).
function decodeWord(cipherWord, row) {
  let states = new Map([[0, [[]]]]);
  for (const c of cipherWord) {
    const next = new Map();
    const add = (offset, sequence) => {
      if (!next.has(offset)) next.set(offset, []);
      next.get(offset).push(sequence);
    };
    for (const [offset, sequences] of states) {
      const key = keyRows[row][offset % 29];
      for (const sequence of sequences) {
        if (c === 0) add(offset, sequence.concat(0));
        const p = (c - key + 29) % 29;
        if (p !== 0) add(offset + 1, sequence.concat(p));
      }
    }
    states = next;
    if (!states.size) break;
  }
  return [...states.values()].flat();
}

const decoded = markedWords.map((word, wordIndex) => {
  const row = wordIndex % 10;
  const candidates = decodeWord(word, row);
  return { wordIndex, row, cipher: word, candidates };
});
const noPath = decoded.filter(x => x.candidates.length === 0);
const uniquePath = decoded.filter(x => x.candidates.length === 1);
const maxPaths = Math.max(...decoded.map(x => x.candidates.length));
assert.equal(noPath.length, 47);
assert.equal(uniquePath.length, 278);
assert.equal(maxPaths, 4);

const firstFailure = noPath[0];
assert.equal(firstFailure.wordIndex, 13);
assert.deepEqual(firstFailure.cipher, [13]); // GP29 P
assert.equal(firstFailure.row, 3);
assert.equal(keyRows[3][0], 13); // would require forbidden plaintext F

// Source-native positive control: encrypt and then invert every word of the
// clear p57 parable using the same matrix and F-bypass clock.
const p57Words = parseWords(pages[56]); // p50 has no rune transcription segment.
const p57Plain = flatten(p57Words);
assert.equal(p57Words.length, 20);
assert.equal(p57Plain.length, 95);
function encodeWord(plainWord, row) {
  let offset = 0;
  return plainWord.map(p => {
    if (p === 0) return 0;
    const c = (p + keyRows[row][offset % 29]) % 29;
    offset++;
    return c;
  });
}
const p57Controls = p57Words.map((word, wordIndex) => {
  const row = wordIndex % 10;
  const cipher = encodeWord(word, row);
  const candidates = decodeWord(cipher, row);
  return {
    wordIndex,
    row,
    paths: candidates.length,
    recovered: candidates.some(candidate => same(candidate, word))
  };
});
assert(p57Controls.every(x => x.recovered));

const output = {
  hypothesis: '10x29 prime-totient key matrix; word ordinal mod 10 selects row; p56 F bypass',
  sourceSelection: {
    cuneiformPrimeRanks: [174, 464],
    cuneiformPrimeValues: [1033, 3301],
    keyPrimeRanks: [175, 464],
    keyPrimeValues: [1039, 3301],
    matrix: '10 rows x 29 columns',
    key: '(prime - 1) mod 29'
  },
  original: {
    physicalPages: 'p33 after rune 91 through p39',
    runeCount: markedCipher.length,
    wordCount: markedWords.length,
    wordsWithNoLegalInverse: noPath.length,
    wordsWithOneLegalInverse: uniquePath.length,
    maximumPathsForOneWord: maxPaths,
    firstFailure: {
      zeroBasedWordIndex: firstFailure.wordIndex,
      ciphertext: firstFailure.cipher.map(x => corpus.translit[x]).join(''),
      selectedKeyRow: firstFailure.row,
      firstKeyValue: keyRows[firstFailure.row][0],
      explanation: 'C=13 and K=13 force P=F at a non-F ciphertext; F must bypass and cannot be produced by consuming the key.'
    }
  },
  positiveControl: {
    source: 'clear p57 parable',
    runes: p57Plain.length,
    words: p57Words.length,
    wordsRecoveringOriginalUnderSameEncoderAndDecoder: p57Controls.filter(x => x.recovered).length,
    allWordsRecover: p57Controls.every(x => x.recovered),
    pathCounts: p57Controls.map(x => x.paths)
  },
  decision: 'Reject this exact word-indexed 10x29 prime-totient receiver. No unknown plaintext or key recovered.'
};
console.log(JSON.stringify(output, null, 2));
