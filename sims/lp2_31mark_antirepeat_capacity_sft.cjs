'use strict';
/**
 * LP2 no-adjacent-repeat / printed-large-punctuation lossless-capacity gate.
 *
 * Tests an entire all-secret length-preserving encoder class by counting
 * distinct possible messages. Neither a language model nor a conjectured
 * key/phase is needed.
 *
 * Windows 11, Node.js 22, CommonJS, standard library; read-only SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const annotations = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-ink-annotations.json'), 'utf8'
));
const transcript = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const allRunes = pages.flatMap(p => p.indices);
const symbols = new Set(corpus.runes);
const joined = transcript.split(/\r?\n%\r?\n/).slice(0, 55).join('')
  .replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
const words = joined.split(/[-.&$§]/)
  .map(chunk => [...chunk].filter(c => symbols.has(c)))
  .filter(word => word.length > 0);
const readback = words.flat().map(c => corpus.runes.indexOf(c));
assert.equal(pages.length, 55);
assert.equal(allRunes.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(readback, allRunes, 'Original words reproduce all source runes');
const transitions = pages.reduce((n, p) => n + p.indices.length - 1, 0);
const repeats = pages.reduce((n, p) => n + p.indices.reduce((s, x, i, a) =>
  s + Number(i > 0 && x === a[i - 1]), 0), 0);
assert.equal(transitions, 12901);
assert.equal(repeats, 86);
const marks = annotations.pages.filter(p => p.page <= 55)
  .flatMap(p => p.large_punctuation || []);
assert.equal(marks.length, 31);
assert.equal(marks.filter(p => p[1] === 13).length, 28);
assert.equal(marks.filter(p => p[1] === 10).length, 3);
assert.equal(marks.filter(p => p[2] === 'black').length, 1);
assert.equal(marks.filter(p => p[2] === 'red').length, 30);

/** @param {number} n @param {number} k */
function logChoose(n, k) {
  let value = 0;
  for (let j = 1; j <= k; j++)
    value += Math.log2(n - k + j) - Math.log2(j);
  return value;
}
/** @param {number} a @param {number} b */
function logSum2(a, b) {
  if (!Number.isFinite(a)) return b;
  if (b > a) return logSum2(b, a);
  return a + Math.log2(1 + 2 ** (b - a));
}
/**
 * Log2 of the number of length-N transition tapes having at most R
 * unchanged-predecessor transitions, each other transition choosing
 * any of the 28 remaining GP29 symbols.
 * @param {number} N @param {number} R
 */
function logConstrained(N, R) {
  let logTerm = N * Math.log2(28);
  let sum = -Infinity;
  for (let k = 0; k <= R; k++) {
    sum = logSum2(sum, logTerm);
    if (k < R)
      logTerm += Math.log2(N - k) - Math.log2(k + 1) - Math.log2(28);
  }
  return sum;
}
// Positive counting control: brute-force all 29^3 small GP29 tapes.
// The first symbol chooses one of 29 values; the other two are transitions.
for (let r = 0; r <= 2; r++) {
  let brute = 0;
  for (let a = 0; a < 29; a++)
    for (let b = 0; b < 29; b++)
      for (let c = 0; c < 29; c++)
        if (Number(a === b) + Number(b === c) <= r) brute++;
  const formula = 29 * 2 ** logConstrained(2, r);
  assert.ok(Math.abs(formula - brute) < 1e-8, 'Exact toy count');
}
const sidecarSlots = words.length + 2 * 56;
// Overgrant one site per existing complete word, plus both ends of
// all 56 original unknown physical pages (including rune-free p50).
// Grant arbitrary repeated marks at a single slot (p7 exhibits this),
// and 4 independent punctuation identities per mark, although the artifact
// has 28 13-dot, three 10-dot, and only one black mark.
const disallowedBits = transitions * Math.log2(29) -
  logConstrained(transitions, repeats);
const maximumMarksBits = logChoose(sidecarSlots + marks.length - 1, marks.length) +
  2 * marks.length;
const actualTypePatternBits = logChoose(sidecarSlots + marks.length - 1, marks.length) +
  logChoose(marks.length, 3) + Math.log2(marks.length);
assert.ok(disallowedBits - maximumMarksBits > 17);
assert.ok(disallowedBits - actualTypePatternBits > 62);

console.log(JSON.stringify({
  source: 'Original LP2 pp0..55 runes, words and large punctuation',
  pages: 56, runeBearingPages: pages.length, originalRunes: allRunes.length,
  originalWords: words.length, withinPageTransitions: transitions,
  equalAdjacencies: repeats,
  originalLargePunctuation: marks.length, original13dot: 28,
  original10dot: 3, originalBlack: 1,
  mode: 'universal fixed-layout injective GP29->GP29 code; at most 86 output repeats',
  generousPossibleSidecarSlots: sidecarSlots,
  lostFullAlphabetBits: disallowedBits,
  overGrantedPunctuationBits: maximumMarksBits,
  remainingInformationDeficitBits: disallowedBits - maximumMarksBits,
  originalTypeInventoryCapacityBits: actualTypePatternBits,
  sourceTypeRestrictedDeficitBits: disallowedBits - actualTypePatternBits,
  result: 'No universal length-preserving reversible full-GP29 encoder can force <=86 repeats with only 31 word/page-boundary-position marks and at most four mark identities. English-restricted plaintext or external state remains possible.'
}, null, 2));
