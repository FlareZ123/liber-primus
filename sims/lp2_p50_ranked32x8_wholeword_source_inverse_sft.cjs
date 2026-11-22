'use strict';
/**
 * Original LP2 32x8 numeric rows as changing per-eight-word permutation keys.
 * Reproducible, read-only CommonJS SFT, Node.js 22, no dependencies.
 * No reconstructed plaintext or author-authenticated cipher claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const numeric = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const words = [];
const parsed = [];
let current = [];
for (const ch of transcript.split('%').slice(0, 55).join('%')) {
  if (index.has(ch)) {
    const v = index.get(ch);
    current.push(v);
    parsed.push(v);
  } else if (ch !== '%' && ch !== '/' && !/\s/u.test(ch) && current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
assert.deepEqual(parsed, original);
assert.equal(parsed.length, 12956);
assert.equal(words.length, 2896);
assert.equal(numeric.byte_rows.length, 32);
assert.ok(numeric.byte_rows.every(r => r.length === 8 && r.every(v => Number.isInteger(v) && v >= 0 && v < 256)));
const lengths = words.map(w => w.length);
const cuts = [158, 413, 796, 1233, 1457, 1783, 2161, 2830, 2896];
function mi(data) {
  const joint = Array.from({ length: 10 }, () => Array(10).fill(0));
  const left = Array(10).fill(0);
  const right = Array(10).fill(0);
  let n = 0;
  for (let i = 1; i < data.length; i++) {
    if (cuts.includes(i)) continue;
    const x = Math.min(data[i - 1], 9);
    const y = Math.min(data[i], 9);
    joint[x][y]++;
    left[x]++;
    right[y]++;
    n++;
  }
  let out = 0;
  for (let x = 1; x <= 9; x++) {
    for (let y = 1; y <= 9; y++) {
      const v = joint[x][y];
      if (v) out += (v / n) * Math.log(v * n / (left[x] * right[y]));
    }
  }
  return out;
}
function ranks(rows) {
  return rows.map(row => row.map((_, j) => j).sort((a, b) => row[a] - row[b] || a - b));
}
/**
 * Sort the original eight byte values in every printed grid row to form an
 * eight-word read order. Repeat its 32 orders as needed, or restart at source
 * chapter cuts. Return the exact inverse when inverse=true.
 * @param {number[]} input
 * @param {number[][]} keys
 * @param {boolean} inverse
 * @param {boolean} chapterReset
 * @returns {number[]}
 */
function route(input, keys, inverse, chapterReset) {
  const result = input.slice();
  let start = 0;
  for (const end of chapterReset ? cuts : [input.length]) {
    let row = 0;
    for (let i = start; i + 8 <= end; i += 8, row++) {
      const key = keys[row % keys.length];
      for (let j = 0; j < 8; j++) {
        if (inverse) result[i + key[j]] = input[i + j];
        else result[i + j] = input[i + key[j]];
      }
    }
    start = end;
  }
  return result;
}
const keys = ranks(numeric.byte_rows);
const identity = mi(lengths);
const actual = [
  mi(route(lengths, keys, false, false)),
  mi(route(lengths, keys, true, false)),
  mi(route(lengths, keys, false, true)),
  mi(route(lengths, keys, true, true))
];
const expected = [
  0.011648629640675494,
  0.01167002040401762,
  0.009963629090300314,
  0.008304222761138182
];
assert.ok(Math.abs(identity - 0.012156100972938996) < 1e-12);
for (let i = 0; i < 4; i++) assert.ok(Math.abs(actual[i] - expected[i]) < 1e-12);
for (const chapter of [false, true]) {
  assert.deepEqual(route(route(lengths, keys, false, chapter), keys, true, chapter), lengths);
  assert.deepEqual(route(route(lengths, keys, true, chapter), keys, false, chapter), lengths);
}
const reference = (read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g) || []).slice(0, 2896);
assert.equal(reference.length, 2896);
const multirunes = ['ING', 'TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA', 'IO'];
function gpLength(word) {
  const s = word.toUpperCase();
  let len = 0;
  for (let i = 0; i < s.length;) {
    const match = multirunes.find(x => s.startsWith(x, i));
    i += match ? match.length : 1;
    len++;
  }
  return len;
}
const native = reference.map(gpLength);
const nativeMI = mi(native);
const scrambled = route(native, keys, false, false);
const restored = route(scrambled, keys, true, false);
assert.deepEqual(restored, native);
const scrambledMI = mi(scrambled);
assert.ok(nativeMI > identity && nativeMI > scrambledMI);
let seed = 0x9166abcd;
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const N = 1000;
const exceeded = [0, 0, 0, 0];
let maxExceeded = 0;
const nullMaxima = [];
for (let t = 0; t < N; t++) {
  const rows = numeric.byte_rows.map(row => {
    const shuffled = row.slice();
    for (let i = 7; i > 0; i--) {
      const j = random32() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const key = ranks(rows);
  const trial = [
    mi(route(lengths, key, false, false)),
    mi(route(lengths, key, true, false)),
    mi(route(lengths, key, false, true)),
    mi(route(lengths, key, true, true))
  ];
  for (let i = 0; i < 4; i++) if (trial[i] >= actual[i]) exceeded[i]++;
  const maximum = Math.max(...trial);
  nullMaxima.push(maximum);
  if (maximum >= Math.max(...actual)) maxExceeded++;
}
assert.deepEqual(exceeded, [377, 364, 691, 930]);
assert.equal(maxExceeded, 827);
nullMaxima.sort((a, b) => a - b);
console.log(JSON.stringify({
  source: { runes: parsed.length, words: words.length, numericRows: 32, numericColumns: 8 },
  key: { row0: keys[0], row1: keys[1], resetModes: ['book', 'chapter'] },
  wordLengthMI: { unchanged: identity, rankReadBook: actual[0], rankInverseBook: actual[1],
    rankReadChapter: actual[2], rankInverseChapter: actual[3] },
  sourcePreservingRowValueShuffleNull: {
    seed: '0x9166abcd', draws: N, branchExceedances: exceeded,
    bestExceedances: maxExceeded, familywiseAddOneTail: (maxExceeded + 1) / (N + 1),
    medianMaximum: nullMaxima[500], percentile95Maximum: nullMaxima[949]
  },
  nativeWordSequence: { words: native.length, MI: nativeMI, scrambledMI, restoredExactly: true },
  decision: 'No restored native-GP word-order signature or plaintext under this exact variable-row-key transposition'
}, null, 2));
