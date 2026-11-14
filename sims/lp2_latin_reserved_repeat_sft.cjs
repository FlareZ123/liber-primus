'use strict';
/**
 * LP2 fixed-repeat-sentinel challenge using independently pinned Latin Vulgate
 * GP29 words. Run with Node.js 22 from any working directory.
 * This is an original-cipher exclusion, not a plaintext decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const translit = JSON.parse(read('resources/liber-primus/lp2-corpus.json')).translit;
const raw = read('resources/lp2-transcription.txt').split('%').slice(0, 55).join('%');
const words = [];
let word = [], previous = null;
/** Commit the current typographic word. */
function finishWord() {
  if (word.length) words.push(word);
  word = [];
}
for (const rune of raw) {
  if (/[\u16A0-\u16FF]/u.test(rune)) {
    word.push(Number(previous === rune));
    previous = rune;
  } else if (rune === '%' || rune === '/' || /\s/u.test(rune)) {
    // Printed page and line breaks do not terminate the word or predecessor.
  } else {
    finishWord();
  }
}
finishWord();
const observed = [86, 23, 19];
const lengths = new Array(15).fill(0);
const actual = [0, 0, 0];
for (const w of words) {
  lengths[w.length]++;
  w.forEach((repeat, i) => {
    if (!repeat) return;
    actual[0]++;
    if (i === 0) actual[1]++;
    if (i === w.length - 1) actual[2]++;
  });
}
assert.deepEqual([words.length, words.flat().length, ...actual], [2896, 12956, ...observed]);

const pools = Array.from({ length: 15 }, () => []);
for (const line of read('resources/control/latin-vulgate-gp-wholewords.txt').split(/\r?\n/)) {
  const token = line.trim();
  if (!token || token.startsWith('#')) continue;
  if (token.length <= 14 && [...token].every((c) => alphabet.includes(c))) {
    pools[token.length].push([...token].map((c) => alphabet.indexOf(c)));
  }
}
for (let length = 1; length <= 14; length++) {
  if (lengths[length]) assert(pools[length].length > 0, 'Uncovered Latin GP word length');
}

/**
 * Fixed original word-length histogram, Latin per-length conditional moments.
 * @param {number} symbol
 * @returns {{mean:number[],sd:number[]}}
 */
function moments(symbol) {
  const mean = [0, 0, 0];
  const variance = [0, 0, 0];
  for (let length = 1; length <= 14; length++) {
    if (!lengths[length]) continue;
    const pool = pools[length], sums = [0, 0, 0], squares = [0, 0, 0];
    for (const native of pool) {
      const sample = [
        native.filter((v) => v === symbol).length,
        Number(native[0] === symbol),
        Number(native.at(-1) === symbol),
      ];
      sample.forEach((v, j) => { sums[j] += v; squares[j] += v * v; });
    }
    for (let j = 0; j < 3; j++) {
      const m = sums[j] / pool.length;
      mean[j] += lengths[length] * m;
      variance[j] += lengths[length] * Math.max(0, squares[j] / pool.length - m * m);
    }
  }
  return { mean, sd: variance.map(Math.sqrt) };
}

/** @param {number[]} actualCounts @param {{mean:number[],sd:number[]}} model */
function discrepancy(actualCounts, model) {
  const cases = [
    actualCounts,
    [actualCounts[0] + 1, actualCounts[1] + 1, actualCounts[2]],
  ];
  return Math.min(...cases.map((v) => Math.max(...v.map(
    (count, j) => Math.abs((count - model.mean[j]) / model.sd[j]),
  ))));
}
const candidates = translit.map((symbol, index) => {
  const m = moments(index);
  return {
    rune: symbol,
    gpIndex: index,
    maxDeviationSD: discrepancy(observed, m),
    expected: m.mean,
    sd: m.sd,
  };
}).sort((a, b) => a.maxDeviationSD - b.maxDeviationSD);

assert.equal(candidates[0].rune, 'EO');
assert(Math.abs(candidates[0].maxDeviationSD - 5.778034320114986) < 1e-8);
assert(candidates.every((c) => c.maxDeviationSD > 5.7));
console.log(JSON.stringify({
  source: 'resources/control/latin-vulgate-gp-wholewords.txt',
  observed: { words: words.length, runes: 12956, repeatEvents: observed },
  coveredOriginalLengths: lengths.slice(1),
  sourcePoolLengths: pools.slice(1).map((p) => p.length),
  bestReservedPlaintextSymbols: candidates.slice(0, 5),
  conclusion: 'No single reserved GP rune has a plausible original word-edge profile in this Latin register.',
}, null, 2));