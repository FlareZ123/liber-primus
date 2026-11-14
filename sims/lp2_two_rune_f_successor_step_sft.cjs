'use strict';

/**
 * Original LP2 two-rune word gate for chapter-fixed predecessor-step substitutions.
 * Reads only repository-pinned sources. No mutable output or external dependencies.
 * Run: node sims/lp2_two_rune_f_successor_step_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const gp = new Map([...('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ')].map((r, i) => [r, i]));

/** @param {string} source @returns {number[][]} */
function parseWords(source) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let word = [];
  for (const rune of source) {
    if (gp.has(rune)) {
      word.push(gp.get(rune));
    } else if (!'/\r\n%'.includes(rune) && word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

/** @param {number[]} cells @returns {number[]} */
function stepHistogram(cells) {
  const counts = Array(29).fill(0);
  for (const value of cells) counts[value]++;
  return counts;
}

/** @param {string} source @returns {{count:number, ofif:number, min448:number, first448:number}} */
function nativeTwoLetterStats(source) {
  const two = (source.match(/[A-Za-z]+/g) || []).filter(w => w.length === 2);
  const hits = two.map(w => /^(of|if)$/i.test(w) ? 1 : 0);
  let rolling = hits.slice(0, 448).reduce((sum, v) => sum + v, 0);
  const first448 = rolling;
  let min448 = rolling;
  for (let i = 448; i < hits.length; i++) {
    rolling += hits[i] - hits[i - 448];
    min448 = Math.min(min448, rolling);
  }
  return {count: two.length, ofif: hits.reduce((sum, v) => sum + v, 0), min448, first448};
}

const transcript = read('resources/lp2-transcription.txt');
// The canonical external transcription omits runeless physical page p50.
// Its first 55 rune-bearing blocks are exactly physical pp0-55.
const source = transcript.split('%').slice(0, 55).join('%');
const words = parseWords(source);
assert.equal(words.length, 2896, 'Original word inventory');
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956, 'Original rune inventory');

const two = words.filter(w => w.length === 2);
assert.equal(two.length, 448);
const allSteps = two.map(w => (w[1] - w[0] + 29) % 29);
const global = stepHistogram(allSteps);
assert.equal(global[0], 1, 'Only one two-rune original has equal adjacent runes');
assert.equal(Math.max(...global), 23, 'Maximum global constant step');

const chapterCounts = [158, 255, 383, 437, 224, 326, 378, 669, 66];
let offset = 0;
const chapters = chapterCounts.map((n, index) => {
  const segment = words.slice(offset, offset + n);
  offset += n;
  const steps = segment.filter(w => w.length === 2).map(w => (w[1] - w[0] + 29) % 29);
  const counts = stepHistogram(steps);
  return {chapter: index, two: steps.length, maximum: Math.max(...counts), zero: counts[0]};
});
assert.equal(offset, 2896);
assert.deepEqual(chapters.map(c => c.two), [28, 32, 56, 74, 33, 51, 62, 101, 11]);
assert.deepEqual(chapters.map(c => c.maximum), [3, 4, 4, 6, 4, 6, 5, 9, 1]);
const chapterMaximum = chapters.reduce((sum, c) => sum + c.maximum, 0);
assert.equal(chapterMaximum, 42);

const gibran = nativeTwoLetterStats(read('resources/control/gibran_prophet_58585.txt'));
const emerson = nativeTwoLetterStats(read('resources/control/emerson_essays_2944.txt'));
assert.deepEqual(gibran, {count: 2607, ofif: 600, min448: 75, first448: 96});
assert.deepEqual(emerson, {count: 15550, ofif: 3573, min448: 63, first448: 94});
assert.ok(gibran.min448 > chapterMaximum);
assert.ok(emerson.min448 > chapterMaximum);

// A planted chapter-fixed bijection must funnel every word-final plaintext F
// into the same step. This positive control checks the unrestricted-key invariant.
const first448Words = (read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g) || [])
  .filter(w => w.length === 2).slice(0, 448);
let pos = 0;
const planted = chapters.map(({two: n}, chapter) => {
  const values = first448Words.slice(pos, pos + n).map(w => {
    const isF = w[1].toUpperCase() === 'F';
    const plain = isF ? 0 : 1 + (w[1].toUpperCase().charCodeAt(0) - 65) % 28;
    return (7 * plain + 3 + chapter) % 29;
  });
  pos += n;
  const stepCounts = stepHistogram(values);
  return {f: first448Words.slice(pos - n, pos).filter(w => w[1].toUpperCase() === 'F').length,
    maximum: Math.max(...stepCounts)};
});
assert.equal(pos, 448);
assert.equal(planted.reduce((s, c) => s + c.f, 0), 96);
for (const c of planted) assert.ok(c.maximum >= c.f, 'Source-native F step survives a planted static mapping');

console.log('LP2 original: 2,896 words, 12,956 runes, 448 two-rune words');
console.log('Original two-rune step counts:', global.join(','));
console.log('Original maximum fixed F step, one global key:', Math.max(...global), '/448');
console.log('Original maximum fixed F steps, nine independent chapter keys:', chapterMaximum, '/448');
console.log('Original chapter inventory:', JSON.stringify(chapters));
console.log('Pinned native controls:', JSON.stringify({gibran, emerson}));
console.log('Source-positive chapter-mapping plant:', JSON.stringify(planted));
console.log('PASS: finite source-text exclusion; no unknown plaintext or key recovered');
