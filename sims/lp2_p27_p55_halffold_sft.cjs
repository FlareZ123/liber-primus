'use strict';

/**
 * Original-input test for a conjectured physical 28-page fold, prompted by
 * the sole repeated six-rune DJU-BEI phrase on LP2 pp27 and 55.
 * Run with Node.js 22. No additional dependencies.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const pages = corpus.pages;
assert.equal(pages.length, 58, '58 physical LP2 pages');
assert.equal(pages[50].indices.length, 0, 'p50 is the rune-free grid');
assert.deepEqual(pages[27].indices.slice(28, 34), [23, 11, 1, 17, 18, 10]);
assert.deepEqual(pages[55].indices.slice(70, 76), [23, 11, 1, 17, 18, 10]);

/** @param {number[]} indices @param {number} k @returns {Map<string,number>} */
function gramCounts(indices, k) {
  const counts = new Map();
  for (let i = 0; i <= indices.length - k; i += 1) {
    const gram = indices.slice(i, i + k).join('.');
    counts.set(gram, (counts.get(gram) || 0) + 1);
  }
  return counts;
}

/** @param {Map<string,number>} left @param {Map<string,number>} right */
function sharedOccurrences(left, right) {
  let matches = 0;
  for (const [gram, n] of left) matches += n * (right.get(gram) || 0);
  return matches;
}

/** @param {number} k @param {number} trials */
function run(k, trials = 30000) {
  const left = pages.slice(0, 28).map((p) => gramCounts(p.indices, k));
  const right = pages.slice(28, 56).map((p) => gramCounts(p.indices, k));
  const matrix = left.map((a) => right.map((b) => sharedOccurrences(a, b)));
  const fixed = matrix.reduce((s, r, i) => s + r[i], 0);
  const echoPair = matrix[27][27];
  const nonEchoPairs = fixed - echoPair;
  let seed = 13271337;
  /** @returns {number} Seeded pseudorandom sample in [0,1) */
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  }
  let total = 0;
  let squared = 0;
  let equalOrHigher = 0;
  for (let t = 0; t < trials; t += 1) {
    const permutation = Array.from({ length: 28 }, (_, i) => i);
    for (let i = 27; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    let n = 0;
    for (let i = 0; i < 28; i += 1) n += matrix[i][permutation[i]];
    total += n;
    squared += n * n;
    if (n >= fixed) equalOrHigher += 1;
  }
  const mean = total / trials;
  const sd = Math.sqrt(squared / trials - mean * mean);
  return {
    k, fixed, echoPair, nonEchoPairs, nullMean: mean, nullSD: sd,
    upperP: (equalOrHigher + 1) / (trials + 1), trials,
  };
}
for (const k of [2, 3, 4, 5, 6]) console.log(JSON.stringify(run(k)));
console.log('PASS physical p27/p55 six-rune echo and half-fold null');
