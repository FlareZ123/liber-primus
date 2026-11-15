'use strict';

/**
 * Source-visible word-aware cuneiform header reset invariant.
 * Six physically identical top headers on LP2 pp34–39 might reset the
 * same positionwise GP29 bijection at the next complete word.
 * Two page transitions carry an already-started word, so we exclude
 * only those prefix fragments from the shared start clock.
 *
 * Run: node sims/lp2_cuneiform_wordaware_sharedclock_sft.cjs
 * Node.js 22, no external dependencies, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt')
  .split(/%\r?\n/);
const pageIds = [34, 35, 36, 37, 38, 39];
const lengths = [261, 271, 238, 228, 228, 240];
const pages = pageIds.map((page) => corpus.pages[page].indices);
assert.deepEqual(pages.map((p) => p.length), lengths);
assert.equal(transcript.length, 57);
const glyphs = new Set(corpus.runes);
/** @param {string} text @returns {boolean} */
function hasIncomingWord(text) {
  const last = [...text.replace(/[\r\n\/&$]/g, '').trim()].at(-1);
  return glyphs.has(last);
}
/** @param {string} text @returns {number} */
function leadingFragmentLength(text) {
  let count = 0;
  for (const glyph of text) {
    if (glyph === '-' || glyph === '.') break;
    if (glyphs.has(glyph)) count++;
  }
  return count;
}
const carries = pageIds.map((p) =>
  hasIncomingWord(transcript[p - 1]) ? leadingFragmentLength(transcript[p]) : 0);
assert.deepEqual(carries, [2, 0, 2, 0, 0, 0]);
const trimmedLengths = lengths.map((n, i) => n - carries[i]);
assert.deepEqual(trimmedLengths, [259, 271, 236, 228, 228, 240]);
const total = lengths.reduce((a, b) => a + b, 0);
assert.equal(total, 1466);

/** @param {number[][]} six @returns {{equal:number, possible:number}} */
function sameOffset(six) {
  let equal = 0;
  let possible = 0;
  for (let j = 0; j < Math.max(...trimmedLengths); j++) {
    for (let a = 0; a < six.length; a++) {
      if (j >= six[a].length) continue;
      for (let b = a + 1; b < six.length; b++) {
        if (j >= six[b].length) continue;
        possible++;
        if (six[a][j] === six[b][j]) equal++;
      }
    }
  }
  return {equal, possible};
}
/** @param {number[][]} six @returns {number[][]} */
function trim(six) {
  return six.map((page, i) => page.slice(carries[i]));
}
const actual = sameOffset(trim(pages));
assert.deepEqual(actual, {equal: 142, possible: 3499});
console.log('ORIGINAL', {carries, lengths, trimmedLengths, ...actual});

const tokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} source @returns {number[]} */
function gp(source) {
  const words = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || [];
  const result = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find((t) => word.startsWith(t.token, i));
      assert(token, 'unknown source token');
      result.push(token.index);
      i += token.token.length;
    }
  }
  return result;
}
/** @param {number[]} source @param {number} start @returns {number[][]} */
function partition(source, start) {
  let cursor = start;
  return lengths.map((n) => {
    const page = source.slice(cursor, cursor + n);
    cursor += n;
    return page;
  });
}
const controls = [
  {file: 'resources/control/gibran_prophet_58585.txt', n: 63114, windows: 1989, min: 157},
  {file: 'resources/control/shakespeare_first300k.txt', n: 218800, windows: 7011, min: 156},
  {file: 'resources/control/emerson_essays_2944.txt', n: 324630, windows: 10425, min: 168},
];
for (const control of controls) {
  const text = gp(read(control.file));
  assert.equal(text.length, control.n);
  let windows = 0;
  let below = 0;
  let minimum = Infinity;
  for (let begin = 0; begin + total <= text.length; begin += 31) {
    const observation = sameOffset(trim(partition(text, begin)));
    assert.equal(observation.possible, actual.possible);
    minimum = Math.min(minimum, observation.equal);
    if (observation.equal <= actual.equal) below++;
    windows++;
  }
  assert.equal(windows, control.windows);
  assert.equal(minimum, control.min);
  assert.equal(below, 0);
  console.log('REFERENCE', control.file, {windows, minimum, below});
}

// Entire 1,466-rune synthetic positive. One secret affine bijection per
// offset measured after the original first-new-word boundary, shared
// across pages. The two incoming partial words retain separate state.
const plant = partition(gp(read(controls[0].file)), 0);
const key = Array.from({length: Math.max(...trimmedLengths)}, (_, i) =>
  ({a: 1 + (i % 28), b: (7 * i + 3) % 29}));
const ciphertext = plant.map((page, p) => page.map((x, j) => {
  if (j < carries[p]) return x;
  const k = key[j - carries[p]];
  return (k.a * x + k.b) % 29;
}));
const inverse = ciphertext.map((page, p) => page.map((x, j) => {
  if (j < carries[p]) return x;
  const k = key[j - carries[p]];
  const ai = Array.from({length: 28}, (_, t) => t + 1)
    .find((t) => t * k.a % 29 === 1);
  assert(ai !== undefined);
  return ai * ((x - k.b + 29) % 29) % 29;
}));
assert.deepEqual(inverse, plant);
assert.deepEqual(sameOffset(trim(ciphertext)), sameOffset(trim(plant)));
assert(sameOffset(trim(plant)).equal > actual.equal);
console.log('POSITIVE', 'recovered all', total, 'runes');
console.log('PASS: identical word-aware positionwise header-reset alphabet is incompatible with tested native English');
