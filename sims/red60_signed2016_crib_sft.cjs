'use strict';

/** Source-locked known-plaintext crib gate on LP2 p53+p54 terminal red ink. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.env.LP2_REPO_ROOT || path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8').replace(/\s+/g, ' ');
const sentence = 'Its words are the map, their meaning is the road, and their numbers are the direction.';
assert(signed.includes(sentence), 'Expected original signed 2016 sentence');

/** @param {string} s @returns {number[]} */
function gp(s) {
  const table = new Map(corpus.translit.map((t, i) => [t, i]));
  const letters = s.toUpperCase().replace(/[^A-Z]/g, '');
  const candidates = [...table.keys()].sort((a, b) => b.length - a.length);
  const result = [];
  for (let i = 0; i < letters.length;) {
    const t = candidates.find(x => letters.startsWith(x, i));
    assert(t, 'Unknown English digraph at ' + letters.slice(i));
    result.push(table.get(t));
    i += t.length;
  }
  return result;
}

const plaintext = gp(sentence);
const page53 = corpus.pages.find(p => p.page === 53).indices;
const page54 = corpus.pages.find(p => p.page === 54).indices;
const original = [...page53.slice(128, 179), ...page54.slice(0, 9)];
assert.equal(plaintext.length, 61);
assert.equal(original.length, 60);
assert.deepEqual(original.slice(15, 20), [23, 27, 2, 24, 10]);
assert.deepEqual(original.slice(54, 59), [23, 27, 2, 14, 10]);

/** @param {number[]} c @param {number} maximumPeriod
 *  @returns {{matches:number,period:number,deleted:number,sign:number}}
 */
function bestPeriodic(c, maximumPeriod) {
  let best = { matches: -1, period: 0, deleted: 0, sign: 0 };
  for (const sign of [-1, 1]) {
    for (let deleted = 0; deleted < plaintext.length; deleted++) {
      const p = plaintext.slice(0, deleted).concat(plaintext.slice(deleted + 1));
      for (let period = 1; period <= maximumPeriod; period++) {
        let matches = 0;
        for (let phase = 0; phase < period; phase++) {
          const hist = new Uint8Array(29);
          for (let i = phase; i < c.length; i += period) {
            const keyDigit = (c[i] + sign * p[i] + 29) % 29;
            hist[keyDigit]++;
          }
          matches += Math.max(...hist);
        }
        if (matches > best.matches) best = { matches, period, deleted, sign };
      }
    }
  }
  return best;
}

/** @param {number[]} c @returns {number} */
function minimumExactPeriod(c) {
  for (let period = 1; period <= c.length; period++) {
    const b = bestPeriodic(c, period);
    if (b.matches === c.length && b.period === period) return period;
  }
  return c.length;
}

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s; };
}

/** @param {number[]} a @param {() => number} next @returns {number[]} */
function shuffle(a, next) {
  const b = a.slice();
  for (let j = b.length - 1; j > 0; j--) {
    const k = next() % (j + 1);
    [b[j], b[k]] = [b[k], b[j]];
  }
  return b;
}

const sourceScore = bestPeriodic(original, 7);
const source13 = bestPeriodic(original, 13);
const smallestPeriod = minimumExactPeriod(original);
const next = rng(0x1201916);
const N = Number(process.env.LP2_NULL_COUNT || 1000);
let atLeast = 0;
let total = 0;
let maxNull = 0;
for (let i = 0; i < N; i++) {
  const m = bestPeriodic(shuffle(original, next), 7).matches;
  atLeast += Number(m >= sourceScore.matches);
  total += m;
  maxNull = Math.max(maxNull, m);
}

// Native-source positive: the source sentence with one deletion encrypted by a known GP29 length-seven key.
const planted = plaintext.slice(0, 17).concat(plaintext.slice(18)).map((v, i) => (v + [1, 4, 9, 16, 25, 5, 11][i % 7]) % 29);
const plantedScore = bestPeriodic(planted, 7);
assert.deepEqual({ matches: plantedScore.matches, period: plantedScore.period, deleted: plantedScore.deleted, sign: plantedScore.sign },
  { matches: 60, period: 7, deleted: 17, sign: -1 });
const recoveredPlain = planted.map((v, i) => (v - [1, 4, 9, 16, 25, 5, 11][i % 7] + 29) % 29);
assert.deepEqual(recoveredPlain, plaintext.slice(0, 17).concat(plaintext.slice(18)));
assert.deepEqual(recoveredPlain.map((v, i) => (v + [1, 4, 9, 16, 25, 5, 11][i % 7]) % 29), planted);
assert.equal(smallestPeriod, 60);
console.log(JSON.stringify({ source: '2016 signed central sentence versus p53 red 51 + p54 red 9', originalLength: original.length, cribLength: plaintext.length,
  bestThrough7: sourceScore, bestThrough13: source13, minimumExactKeyPeriod: smallestPeriod,
  histogramPreservingNull: { seed: '0x1201916', count: N, mean: total / N, atLeast, maxNull, upperTail: (atLeast + 1) / (N + 1) },
  positiveControlExact: true }, null, 2));
