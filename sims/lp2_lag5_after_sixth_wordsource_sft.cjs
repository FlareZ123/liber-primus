'use strict';

/**
 * Original LP2 word-local lag-five phase test, no decrypted-text assumptions.
 * Windows Node.js 22, standard library only. Reads the canonical shared corpus.
 * A Fisher-Yates rejection sampler preserves each printed word's rune multiset
 * and exactly the original position of every adjacent equal-rune pair.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const source = fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));

// The rune-only transcription omits physical p50, so its first 55 page blocks
// correspond to original unsolved physical p0..p49 and p51..p55.
const words = [];
let pageBlock = 0;
let startBlock = 0;
let current = [];
for (const symbol of source) {
  if (pageBlock >= 55) break;
  if (index.has(symbol)) {
    if (current.length === 0) startBlock = pageBlock;
    current.push(index.get(symbol));
  } else if ((symbol === '-' || symbol === '.') && current.length > 0) {
    const physicalPage = startBlock < 50 ? startBlock : startBlock + 1;
    words.push({ a: current, g: physicalPage >= 27 ? 1 : 0 });
    current = [];
  }
  if (symbol === '%') pageBlock++;
}
if (current.length > 0) {
  const physicalPage = startBlock < 50 ? startBlock : startBlock + 1;
  words.push({ a: current, g: physicalPage >= 27 ? 1 : 0 });
}
assert.equal(pageBlock, 55);
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, word) => sum + word.a.length, 0), 12956);

// Per group: total lag-5, internal, final rune, j==5, j>=6.
// All positions j are zero-based from the start of a printed word.
function addMatches(a, record) {
  for (let j = 5; j < a.length; j++) {
    if (a[j] !== a[j - 5]) continue;
    record[0]++;
    record[j < a.length - 1 ? 1 : 2]++;
    record[j === 5 ? 3 : 4]++;
  }
}
const names = ['all_lag5', 'interior', 'word_final', 'sixth_rune_j5', 'seventh_or_later'];
const observed = [Array(5).fill(0), Array(5).fill(0)];
for (const { a, g } of words) addMatches(a, observed[g]);
assert.deepEqual(observed, [[56, 38, 18, 22, 34], [48, 29, 19, 14, 34]]);

const active = words.filter(({ a }) => a.length > 5 && new Set(a).size < a.length);
assert.equal(active.length, 441);
const N = 3000;
let state = 0x4a3b2c1d;
function random() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
}
const mean = [Array(5).fill(0), Array(5).fill(0)];
const sumSq = [Array(5).fill(0), Array(5).fill(0)];
const ge = [Array(5).fill(0), Array(5).fill(0)];

for (let n = 0; n < N; n++) {
  const simulated = [Array(5).fill(0), Array(5).fill(0)];
  for (const { a, g } of active) {
    const adjacent = Array.from({ length: a.length - 1 }, (_, j) => a[j] === a[j + 1]);
    const shuffled = a.slice();
    // Rejection from uniform permutations is exact for the conditioned null;
    // all stored original words have at least one admissible arrangement.
    for (;;) {
      for (let j = shuffled.length - 1; j > 0; j--) {
        const k = Math.floor(random() * (j + 1));
        [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
      }
      if (adjacent.every((value, j) => (shuffled[j] === shuffled[j + 1]) === value)) break;
    }
    addMatches(shuffled, simulated[g]);
  }
  for (let g = 0; g < 2; g++) for (let k = 0; k < 5; k++) {
    const delta = simulated[g][k] - mean[g][k];
    mean[g][k] += delta / (n + 1);
    sumSq[g][k] += delta * (simulated[g][k] - mean[g][k]);
    if (simulated[g][k] >= observed[g][k]) ge[g][k]++;
  }
}
const result = {
  source: 'resources/liber-primus/lp2-transcription.txt',
  corpus: 'resources/liber-primus/lp2-corpus.json',
  seed: '0x4a3b2c1d',
  shuffles: N,
  rune_count: 12956,
  word_count: words.length,
  randomized_repeat_words: active.length,
  groups: observed.map((row, g) => ({
    physical_pages: g === 0 ? 'p0..p26' : 'p27..p55',
    metrics: row.map((count, k) => ({
      metric: names[k],
      observed: count,
      null_mean: +mean[g][k].toFixed(3),
      null_sd: +Math.sqrt(sumSq[g][k] / (N - 1)).toFixed(3),
      one_sided_tail: +( (ge[g][k] + 1) / (N + 1) ).toFixed(6)
    }))
  }))
};
console.log(JSON.stringify(result, null, 2));
