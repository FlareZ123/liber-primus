'use strict';

/**
 * Original LP2 nine-chapter native-F-transparent p56-totient transfer gate.
 * One fixed source-era model: chapter-local initial prime key, no reset at
 * physical page, word, inline punctuation or numeric-table boundaries.
 * Reads the unchanged 29-rune corpus; prints nine *first impossible* offsets.
 * No unknown plaintext guesses, dictionary training or fitted phase.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const gp = source.translit;
const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

/** @param {number} n Positive count @returns {number[]} */
function primes(n) {
  const values = [];
  for (let x = 2; values.length < n; x += 1) {
    let prime = true;
    for (let div = 2; div * div <= x; div += 1) {
      if (x % div === 0) { prime = false; break; }
    }
    if (prime) values.push(x);
  }
  return values;
}
const primeKey = primes(3200).map(p => (p - 1) % 29);
const mod29 = x => ((x % 29) + 29) % 29;

/**
 * Exact necessary condition for the historical forward transform:
 * P=F (index0) -> C=F, clock unchanged; every non-F P consumes the
 * next (prime-1) key and emits C=(P+key)%29.
 *
 * A ciphertext F is therefore ambiguous; non-F ciphertext is not.
 * At offset i, states are *all* reachable consumed-key counts after i
 * original ciphertext runes. When no state survives, every possible
 * transparent-F assignment has failed, irrespective of source language.
 *
 * @param {number[]} cipher Original GP29 ciphertext
 * @returns {{n:number,firstImpossible:number|null,peak:number,
 *   terminalStates:number[], precedingStates:number[], failRune:number|null}}
 */
function reach(cipher) {
  let states = new Set([0]);
  let peak = 1;
  for (let i = 0; i < cipher.length; i += 1) {
    const c = cipher[i];
    /** @type {Set<number>} */
    const next = new Set();
    for (const used of states) {
      if (c === 0) next.add(used);
      // A consuming inverse that yields F is illegal: F must be transparent.
      if (mod29(c - primeKey[used]) !== 0) next.add(used + 1);
    }
    if (!next.size) {
      return {
        n: cipher.length, firstImpossible: i, peak,
        terminalStates: [], precedingStates: [...states].sort((a,b) => a-b),
        failRune: c
      };
    }
    states = next;
    peak = Math.max(peak, states.size);
  }
  return {
    n: cipher.length, firstImpossible: null, peak,
    terminalStates: [...states].sort((a,b) => a-b),
    precedingStates: [], failRune: null
  };
}

/**
 * Original 29-rune direct GP label encoding of independently solved prose.
 * Word boundaries must be retained: TH/NG across adjacent words are separate.
 * @param {string} word Solved source-native spelling
 * @returns {number[]}
 */
function encodeWord(word) {
  const tokens = source.translit.map((t,i) => ({t,i}))
    .sort((a,b) => b.t.length-a.t.length);
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const match = tokens.find(t => normalized.startsWith(t.t,i));
    assert.ok(match, 'Unknown GP transliteration at ' + normalized.slice(i));
    out.push(match.i);
    i += match.t.length;
  }
  return out;
}

/** @param {number[]} plain @returns {number[]} */
function forwardFTransparent(plain) {
  let clock = 0;
  return plain.map(p => p === 0 ? 0 : mod29(p + primeKey[clock++]));
}

/* Full 85/85 authentic, independent p56 positive with real literal F at 56. */
const actualP56 = source.pages[56].indices;
const solvedP56 = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(encodeWord);
assert.equal(solvedP56.length, 85);
let knownClock = 0;
const positive = actualP56.map((c,i) => i === 56
  ? 0 : mod29(c - primeKey[knownClock++]));
assert.equal(knownClock, 84);
assert.deepEqual(positive, solvedP56);
assert.deepEqual(forwardFTransparent(positive), actualP56);
assert.ok(reach(actualP56).terminalStates.includes(84));

const expectedFailures = [235, 22, 30, 10, 0, 95, 58, 38, 105];
const original = chapters.map(([from,to],i) => {
  const cipher = source.pages.slice(from,to+1).flatMap(p => p.indices);
  const result = reach(cipher);
  assert.equal(result.firstImpossible, expectedFailures[i],
    'Original source first-impossibility regression p' + from);
  const before = result.precedingStates.map(used => ({
    keyConsumed: used, nextKey: primeKey[used],
    // For every possible prior F mask, c-nextKey=0 is illegal.
    forcedF: mod29(result.failRune - primeKey[used]) === 0
  }));
  assert.ok(before.length && before.every(x => x.forcedF));
  return {
    chapter: 'p'+from+'–'+to,
    originalRunes: result.n,
    firstImpossibleZeroBasedRune: result.firstImpossible,
    failCipherRune: gp[result.failRune],
    priorReachableKeyCounts: result.precedingStates,
    forcedIllegalPlaintextF: true,
    peakReachableKeyStates: result.peak
  };
});
const report = {
  model: 'Original p56 φ(prime) GP29 additive inverse with authentic plaintext-F skip, start key0 at each of nine original red-chapter beginnings',
  independentP56Positive: {
    originalRunes: actualP56.length,
    exactPlaintext: '85/85',
    trueLiteralFSourceOffset: 56,
    consumedKeyCount: 84,
    strictForwardReencryption: '85/85',
    reachableClockIncludesHistorical: true
  },
  unknownChapters: original,
  decision: 'All nine original chapters algebraically impossible under this exact real F-transparent p56 cipher transfer; first failure requires a consuming plaintext-F, which the historical encoder forbids. Other keys/starts/modes remain open.'
};
console.log(JSON.stringify(report,null,2));
module.exports = {reach, forwardFTransparent, chapters};
