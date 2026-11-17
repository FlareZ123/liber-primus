'use strict';

/**
 * SFT: lower bound on hidden state for a lossless, deterministic,
 * one-GP-rune-in / one-GP-rune-out sequential cipher.
 *
 * Run with Node.js 22 and the exact repository source files.
 * All source-native controls are contiguous literary passages,
 * without assuming the LP2 printed word boundaries are plaintext spaces.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalPages = gp.pages.filter((p) => p.page < 56 && p.indices.length > 0);
const original = originalPages.flatMap((p) => p.indices);
assert.equal(original.length, 12956);
assert.equal(originalPages.length, 55);

const nativePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
];
const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), original.length);

/** @type {{start:number,end:number}[]} */
const chapters = [];
let cursor = 0;
for (const n of chapterLengths) {
  chapters.push({ start: cursor, end: cursor + n });
  cursor += n;
}
/** @type {{start:number,end:number}[]} */
const pageSpans = [];
cursor = 0;
for (const p of originalPages) {
  pageSpans.push({ start: cursor, end: cursor + p.indices.length });
  cursor += p.indices.length;
}

const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Canonical solved-source native GP spelling folds.
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  const result = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (const word of words) {
    const w = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let pos = 0; pos < w.length;) {
      if (w.startsWith('ING', pos)) {
        result.push(21);
        pos += 3;
      } else if (w.startsWith('IO', pos)) {
        result.push(27);
        pos += 2;
      } else {
        const match = tokens.find((t) => w.startsWith(t.s, pos));
        assert(match, 'Unencodable GP-native source word');
        result.push(match.i);
        pos += match.s.length;
      }
    }
  }
  return result;
}

/**
 * For any deterministic sequential encoder with K hidden states, the
 * same plaintext L-gram and same starting state give exactly the same
 * ciphertext L-gram. Thus for every observed plaintext L-gram, at most
 * K distinct ciphertext L-grams can occupy its occurrence positions.
 *
 * No deciphering key, transition function, word alignment or state
 * history is fitted. Every possible state sequence is granted.
 *
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {number} start
 * @param {number} end
 * @param {number} order
 * @returns {number}
 */
function lowerBound(plain, cipher, start, end, order) {
  const byPlain = new Map();
  for (let i = start; i + order <= end; i++) {
    let p = 0;
    let c = 0;
    for (let j = 0; j < order; j++) {
      p = p * 29 + plain[i + j];
      c = c * 29 + cipher[i + j];
    }
    let values = byPlain.get(p);
    if (!values) {
      values = new Set();
      byPlain.set(p, values);
    }
    values.add(c);
  }
  let k = 0;
  for (const values of byPlain.values()) {
    k = Math.max(k, values.size);
  }
  return k;
}

/**
 * @param {number[]} values
 * @returns {{min:number,max:number,mean:number,le29:number,le58:number,le128:number}}
 */
function stats(values) {
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((a, b) => a + b, 0) / values.length,
    le29: values.filter((v) => v <= 29).length,
    le58: values.filter((v) => v <= 58).length,
    le128: values.filter((v) => v <= 128).length,
  };
}

// Exact positive: a known deterministic 29-state reversible transducer.
// Current state + plaintext determines the output and next state.
const plantedPlain = encode(read(nativePaths[0])).slice(0, original.length);
let state = 7;
/** @type {number[]} */
const plantedCipher = [];
for (const p of plantedPlain) {
  plantedCipher.push((p + state) % 29);
  state = (state + p + 1) % 29;
}
const reconstructed = [];
state = 7;
for (const c of plantedCipher) {
  const p = (c - state + 29) % 29;
  reconstructed.push(p);
  state = (state + p + 1) % 29;
}
assert.deepEqual(reconstructed, plantedPlain);
const plantedBound = lowerBound(plantedPlain, plantedCipher,
  0, plantedPlain.length, 2);
assert(plantedBound <= 29 && plantedBound > 1);

const controls = [];
for (const nativePath of nativePaths) {
  const native = encode(read(nativePath));
  assert(native.length > original.length);
  const data = { book2: [], book3: [], book4: [], chapter2: [], page2: [] };
  for (let trial = 0; trial < 150; trial++) {
    // Source-independent and reproducible: 150 evenly spaced contiguous
    // GP-native windows, preserving prose order and ignoring source spaces.
    const offset = Math.floor(trial * (native.length - original.length - 1) / 149);
    const plain = native.slice(offset, offset + original.length);
    data.book2.push(lowerBound(plain, original, 0, original.length, 2));
    data.book3.push(lowerBound(plain, original, 0, original.length, 3));
    data.book4.push(lowerBound(plain, original, 0, original.length, 4));
    data.chapter2.push(Math.max(...chapters.map((s) =>
      lowerBound(plain, original, s.start, s.end, 2))));
    data.page2.push(Math.max(...pageSpans.map((s) =>
      lowerBound(plain, original, s.start, s.end, 2))));
  }
  controls.push({
    source: nativePath,
    nativeRunes: native.length,
    windows: 150,
    twoRuneGlobal: stats(data.book2),
    threeRuneGlobal: stats(data.book3),
    fourRuneGlobal: stats(data.book4),
    twoRuneNineIndependentChapters: stats(data.chapter2),
    twoRune55IndependentPages: stats(data.page2),
  });
}
assert.deepEqual(controls.map((x) => x.nativeRunes),
  [217106, 62492, 321327]);
assert.deepEqual(controls.map((x) => x.twoRuneGlobal.min),
  [176, 214, 205]);
assert.deepEqual(controls.map((x) =>
  x.twoRuneNineIndependentChapters.min), [46, 53, 52]);
assert.deepEqual(controls.map((x) =>
  x.twoRune55IndependentPages.max), [20, 25, 19]);
assert(controls.every((x) => x.twoRuneGlobal.le128 === 0));
assert(controls.every((x) => x.twoRuneNineIndependentChapters.le29 === 0));
assert(controls.every((x) => x.twoRune55IndependentPages.le29 === 150));

console.log(JSON.stringify({
  experiment: 'Original LP2 finite-state rune-gram output multiplicity',
  originalRunes: original.length,
  originalPages: originalPages.length,
  sourceWordBoundariesUsed: false,
  message: 'Conditional necessary state bounds; no decipherment or recovered key',
  reversible29StatePlant: {
    exactRecoveredRunes: reconstructed.length, stateCount: 29,
    observedTwoRuneLowerBound: plantedBound,
  },
  coherentLiteraryControls: controls,
}, null, 2));
