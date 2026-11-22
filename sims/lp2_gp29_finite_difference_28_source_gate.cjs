'use strict';

/**
 * Original-cipher GP29 k-fold integration inverse, k=0..28, under page
 * and printed-word resets. Includes a known p57 positive control.
 * Run: node sims/lp2_gp29_finite_difference_28_source_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const mod29 = n => ((n % 29) + 29) % 29;

/** @param {number[]} a @returns {number[]} */
function difference(a) {
  return a.slice(1).map((x, i) => mod29(x - a[i]));
}

/** @param {number[]} a @returns {number[]} */
function integrate(a) {
  const out = [a[0]];
  for (let i = 1; i < a.length; i += 1) {
    out.push(mod29(out[i - 1] + a[i]));
  }
  return out;
}

/** @param {number[]} a @returns {{n:number,ioc:number,peak:number}} */
function stats(a) {
  const hist = new Array(29).fill(0);
  for (const x of a) hist[x] += 1;
  return {
    n: a.length,
    ioc: hist.reduce((sum, x) => sum + x * (x - 1), 0)
      / (a.length * (a.length - 1)),
    peak: Math.max(...hist) / a.length
  };
}

const pages = source.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const originalDoublets = pages.reduce(
  (n, p) => n + p.indices.slice(1).filter((x, i) => x === p.indices[i]).length, 0);
assert.equal(originalDoublets, 86);

// A slash is a printed line wrap, not a word boundary. A percent/page
// break can also occur inside a printed word. The original hyphen or
// period is the word boundary; preserve page carry exactly.
const runeIndex = new Map(source.runes.map((r, i) => [r, i]));
const allWords = [];
let word = [];
for (const char of transcript) {
  if (runeIndex.has(char)) {
    word.push(runeIndex.get(char));
  } else if (char === '-' || char === '.') {
    if (word.length) allWords.push(word);
    word = [];
  }
}
const words = [];
let consumed = 0;
for (const w of allWords) {
  if (consumed === original.length) break;
  words.push(w);
  consumed += w.length;
}
assert.equal(consumed, original.length);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

// Positive control: finite integration of original clear p57 followed
// by the matching finite difference recovers its unchanged source runes.
const p57 = source.pages[57].indices;
for (let order = 1, encoded = p57; order <= 28; order += 1) {
  encoded = integrate(encoded);
  let decoded = encoded;
  for (let k = 0; k < order; k += 1) decoded = difference(decoded);
  assert.deepEqual(decoded, p57.slice(order));
}

function sequence(rows, maxOrder) {
  const records = [];
  for (let order = 0; order <= maxOrder; order += 1) {
    const s = stats(rows.flat());
    records.push({ order, n: s.n, ioc: Number(s.ioc.toFixed(8)),
      peak: Number(s.peak.toFixed(8)) });
    rows = rows.map(difference).filter(r => r.length > 0);
  }
  return records;
}
const page = sequence(pages.map(p => p.indices), 28);
const printedWord = sequence(words, 6);
const chapterCuts = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapters = chapterCuts.map(([start, end]) => {
  const data = pages.filter(p => p.page >= start && p.page <= end)
    .map(p => p.indices);
  const s = sequence(data, 28);
  const highest = s.reduce((a, b) => b.ioc > a.ioc ? b : a);
  return { pages: start + '-' + end, maximum_ioc: highest.ioc,
    maximum_at_order: highest.order };
});
const control = stats(p57);
assert.ok(page.every(r => r.ioc < 0.045));
assert.ok(printedWord.every(r => r.ioc < 0.045));
assert.ok(chapters.every(r => r.maximum_ioc < 0.045));
assert.ok(control.ioc > 0.055);
console.log(JSON.stringify({
  source: 'Unchanged GP29 LP2 p0-55, 12956 runes, 2896 printed words',
  known_p57: { n: control.n, ioc: control.ioc, peak: control.peak },
  page_reset_orders_0_to_28: page,
  word_reset_orders_0_to_6: printedWord,
  chapter_maxima_across_page_reset_orders_0_to_28: chapters,
  all_28_known_p57_inverse_plants: 'PASS'
}, null, 2));
