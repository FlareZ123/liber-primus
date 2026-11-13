'use strict';

/**
 * SFT: original non-dropcap red passages, 76-rune terminal key, and an exact
 * two-text shared-pad vocabulary feasibility test (Node.js 22, CommonJS).
 *
 * Reads the original-derived GP29 corpus, ink annotations and printed
 * segmentation. No guessed phase, plaintext, word order or secret key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = require(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'));
const ink = require(path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'));
const transcript = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
).split('%');
const wordFreq = fs.readFileSync(
  path.join(ROOT, 'resources/control/english_wordfreq_textblob.txt'), 'utf8'
);
const COORDS = [[7, 194, 14], [15, 9, 11], [53, 128, 51]];
const GP = corpus.translit;
const runeSet = new Set(corpus.runes);
const allOffsets = Array.from({length: 29}, (_, i) => i);
const p55 = corpus.pages.find(p => p.page === 55).indices;
const key = COORDS.flatMap(([page, offset, length]) =>
  corpus.pages.find(p => p.page === page).indices.slice(offset, offset + length)
);
assert.equal(ink.pages.filter(p => p.page <= 55)
  .reduce((n, p) => n + (p.red_spans || []).length, 0), 16);
assert.deepEqual(COORDS.map(([page, start, length]) => {
  const p = ink.pages.find(x => x.page === page);
  const span = p.red_spans.find(x => x.start === start);
  assert.equal(span.length, length);
  return length;
}), [14, 11, 51]);
assert.equal(key.length, 76);
assert.equal(p55.length, 76);
assert.equal(transcript.length, 57); // Physical p50 contains no runic text.
function printedLengths(page, offset, length) {
  const original = transcript[page >= 50 ? page - 1 : page];
  const positions = [];
  for (let i = 0; i < original.length; i++) {
    if (runeSet.has(original[i])) positions.push(i);
  }
  const expected = corpus.pages.find(p => p.page === page).runic_count;
  assert.equal(positions.length, expected);
  const slice = original.slice(positions[offset], positions[offset + length - 1] + 1);
  let count = 0;
  const lengths = [];
  for (const ch of slice) {
    if (runeSet.has(ch)) count++;
    if ((ch === '-' || ch === '.') && count > 0) {
      lengths.push(count);
      count = 0;
    }
  }
  if (count > 0) lengths.push(count);
  assert.equal(lengths.reduce((a, b) => a + b, 0), length);
  return lengths;
}
const leftLengths = COORDS.flatMap(([p, s, n]) => printedLengths(p, s, n));
const rightLengths = printedLengths(55, 0, 76);
assert.deepEqual(leftLengths,
  [2,4,3,2,3, 4,2,5, 5,4,4,11,2,3,2,6,5,5,2,2]);
assert.deepEqual(rightLengths,
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

function ioc(values) {
  const hist = Array(29).fill(0);
  for (const v of values) hist[v]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
function spelling(values) { return values.map(x => GP[x]).join(''); }
const direct = [-1, 1].map(sign => {
  const decoded = p55.map((c, i) => (c + sign * key[i] + 29) % 29);
  return {sign, coincidence: ioc(decoded), opening: spelling(decoded).slice(0, 70)};
});
assert(Math.abs(direct[0].coincidence - 0.036491228070175435) < 1e-12);
assert(Math.abs(direct[1].coincidence - 0.03543859649122807) < 1e-12);

// Native-GP vocabulary from the already checked-in English source list.
// This is a generous possibility test, not a language-model plaintext claim.
const order = GP.map((t, i) => [t, i]).sort((a, b) => b[0].length - a[0].length);
function tokenize(english) {
  let s = english.toUpperCase()
    .replace(/QU/g, 'CW').replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S');
  const out = [];
  while (s.length) {
    const hit = order.find(([token]) => s.startsWith(token));
    if (!hit) return null;
    out.push(hit[1]);
    s = s.slice(hit[0].length);
  }
  return out;
}
const vocabulary = new Map();
for (const line of wordFreq.split(/\r?\n/)) {
  const word = line.split(' ')[0];
  if (!/^[a-z]+$/.test(word)) continue;
  const chars = tokenize(word);
  if (chars && chars.length <= 13) vocabulary.set(chars.join(','), chars);
}
for (const word of ['A', 'I', 'O', 'LIBER', 'PRIMUS', 'DIVINITY', 'WISDOM']) {
  const chars = tokenize(word);
  if (chars && chars.length <= 13) vocabulary.set(chars.join(','), chars);
}
const node = [new Map()];
const terminal = new Set();
const byLength = Array.from({length: 14}, () => []);
for (const word of vocabulary.values()) {
  byLength[word.length].push(word);
  let at = 0;
  for (const char of word) {
    let next = node[at].get(char);
    if (next === undefined) {
      next = node.length;
      node[at].set(char, next);
      node.push(new Map());
    }
    at = next;
  }
  terminal.add(at);
}
assert(byLength.slice(1, 14).every(words => words.length > 0));
function boundaries(lengths) {
  let n = 0;
  const ends = new Set();
  for (const length of lengths) {
    n += length;
    ends.add(n - 1);
  }
  return ends;
}
const leftEnds = boundaries(leftLengths);
const rightEnds = boundaries(rightLengths);
assert(leftEnds.has(75) && rightEnds.has(75));

/**
 * A same-sign reused additive pad gives P_B=P_A-C_A+C_B+delta;
 * an opposite-sign reused pad gives P_B=C_A+C_B-P_A+delta.
 * For "segmented", a fresh completely arbitrary Caesar delta is permitted
 * at each original red-span start (positions 0, 14, 25). We still require
 * both printed word streams to belong to the stated native-GP vocabulary.
 * Page p55's first incoming carried rune is unconstrained as a word.
 * @param {number[]} a Printed red ciphertext.
 * @param {number[]} b Printed page-55 ciphertext.
 * @param {boolean} opposite Opposite cipher signs.
 * @param {boolean} segmented Independent Caesar offsets per red span.
 * @returns {{positions:number, states:number, statesAt25:number}}
 */
function reach(a, b, opposite, segmented) {
  assert.equal(a.length, 76);
  assert.equal(b.length, 76);
  let states = new Map([[0, [0, 0, 0]]]);
  let statesAt25 = 0;
  for (let i = 0; i < 76; i++) {
    const nextStates = new Map();
    const newSpan = i === 0 || i === 14 || i === 25;
    for (const [left, right, precedingOffset] of states.values()) {
      const options = segmented && newSpan ? allOffsets : [precedingOffset];
      for (const delta of options) {
        for (const [plainA, nextA] of node[left]) {
          const plainB = (opposite
            ? a[i] + b[i] - plainA + delta + 58
            : plainA - a[i] + b[i] + delta + 58) % 29;
          let nextB = i === 0 ? 0 : node[right].get(plainB);
          if (nextB === undefined) continue;
          if (i !== 0 && rightEnds.has(i)) {
            if (!terminal.has(nextB)) continue;
            nextB = 0;
          }
          let freshA = nextA;
          if (leftEnds.has(i)) {
            if (!terminal.has(freshA)) continue;
            freshA = 0;
          }
          const id = ((freshA * node.length + nextB) * 29) + delta;
          nextStates.set(id, [freshA, nextB, delta]);
        }
      }
    }
    states = nextStates;
    if (i === 25) statesAt25 = states.size;
    if (states.size === 0) return {positions: i, states: 0, statesAt25};
  }
  return {positions: 76, states: states.size, statesAt25};
}

const original = {
  samePad: reach(key, p55, false, false),
  oppositePad: reach(key, p55, true, false),
  threePageOffsetsSame: reach(key, p55, false, true),
  threePageOffsetsOpposite: reach(key, p55, true, true)
};
for (const x of Object.values(original)) assert(x.positions < 76);

// Independent source-shaped planted controls, including all three red keys.
// The planted GP-native words are generated before the secret pad.
let rng = 0x13167655;
function rand(n) {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return (rng >>> 0) % n;
}
function drawWords(lengths) {
  return lengths.flatMap(len => byLength[len][rand(byLength[len].length)]);
}
const plainA = drawWords(leftLengths);
const plainB = drawWords(rightLengths);
const pad = Array.from({length: 76}, () => rand(29));
const plantedA = plainA.map((x, i) => (x + pad[i]) % 29);
const plantedB = plainB.map((x, i) => (x + pad[i]) % 29);
const plantedOpposite = plainB.map((x, i) => (x - pad[i] + 29) % 29);
const offsets = [11, 7, 23];
const markedA = plantedA.map((x, i) =>
  (x + offsets[i < 14 ? 0 : i < 25 ? 1 : 2]) % 29);
assert.equal(reach(plantedA, plantedB, false, false).positions, 76);
assert.equal(reach(plantedA, plantedOpposite, true, false).positions, 76);
assert.equal(reach(markedA, plantedB, false, true).positions, 76);
assert.equal(reach(markedA, plantedOpposite, true, true).positions, 76);

console.log(JSON.stringify({
  source: 'Original GP29 p7:194-207 + p15:9-19 + p53:128-178 => p55:0-75',
  redPassages: COORDS, redLengths: leftLengths, p55Lengths: rightLengths,
  sourceRunes: key.length, lastCipherPageRunes: p55.length,
  dictionaryGPWords: vocabulary.size, trieNodes: node.length,
  directAdditive: direct, feasibility: original,
  positiveControls: 'All four native-GP planted controls reach 76 of 76 positions',
  interpretation: 'No authentic unknown plaintext/key recovered. Literal common-pad native-English readings fail even with independent per-red-span Caesar offsets.'
}, null, 2));
