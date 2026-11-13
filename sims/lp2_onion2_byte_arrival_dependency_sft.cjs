// @ts-check
'use strict';

/**
 * Source-locked SFT for the Jan-2014 onion-2 byte-arrival timing channel.
 * Check whether waiting times are induced by adjacent published byte bits
 * or carry short-lag temporal memory. No LP2 key or plaintext is assumed.
 *
 * Node.js 22, CommonJS, repository root.
 */
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const source = JSON.parse(fs.readFileSync('resources/cicada2014-onion2-timing.json', 'utf8'));
const observations = JSON.parse(fs.readFileSync('im-results/lp2-2014-onion2-timing-merged-114.json', 'utf8'));
const tape = Buffer.from(source.final_hex, 'hex');
assert.equal(tape.length, 256);
assert.equal(crypto.createHash('sha256').update(tape).digest('hex'),
  '05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56');
const rows = observations.records;
assert.equal(rows.length, 114);
const elapsed = [];
const emitted = [];
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  assert.equal(row.byte_index_one_based, i + 143);
  assert.equal(row.byte_index_zero_based, i + 142);
  assert.equal(row.byte_hex.toLowerCase(), tape[i + 142].toString(16).padStart(2, '0'));
  elapsed.push(row.interval_div_5);
  emitted.push(tape[i + 142]);
}
assert.equal(elapsed.reduce((a, b) => a + b), 240);

function zerosLow(value, target) {
  let n = 0;
  for (let bit = 0; bit < 8; bit++) {
    if (((value >>> bit) & 1) !== target) break;
    n++;
  }
  return n;
}
function zerosHigh(value, target) {
  let n = 0;
  for (let bit = 7; bit >= 0; bit--) {
    if (((value >>> bit) & 1) !== target) break;
    n++;
  }
  return n;
}

const prediction = emitted.map(b => [
  zerosLow(b, 0) + 1, zerosHigh(b, 0) + 1,
  zerosLow(b, 1) + 1, zerosHigh(b, 1) + 1
]);
function matchCounts(times) {
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < times.length; i++)
    for (let rule = 0; rule < 4; rule++)
      if (times[i] === prediction[i][rule]) counts[rule]++;
  return counts;
}
/** @param {number} seed */
function generator(seed) {
  let state = seed >>> 0;
  return function random32() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/** @param {number[]} array @param {() => number} random32 */
function shuffle(array, random32) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    const b = array[i]; array[i] = array[j]; array[j] = b;
  }
}
function autocorrelation(values, lag) {
  const mean = values.reduce((a, b) => a + b) / values.length;
  let sum = 0, left = 0, right = 0;
  for (let i = lag; i < values.length; i++) {
    const u = values[i] - mean, v = values[i - lag] - mean;
    sum += u * v;
    left += u * u;
    right += v * v;
  }
  return sum / Math.sqrt(left * right);
}
const observed = matchCounts(elapsed);
assert.deepEqual(observed, [35, 36, 37, 38]);
const chosen = Math.max(...observed);
const permuted = elapsed.slice();
const rng1 = generator(0x6140f519);
const iterations = 50000;
let matchNullGe = 0;
const bestCounts = [];
const individualNullSums = [0, 0, 0, 0];
for (let i = 0; i < iterations; i++) {
  shuffle(permuted, rng1);
  const c = matchCounts(permuted);
  for (let j = 0; j < 4; j++) individualNullSums[j] += c[j];
  const best = Math.max(...c);
  bestCounts.push(best);
  if (best >= chosen) matchNullGe++;
}
assert.equal(matchNullGe, 38333);
const sourceCorrelation = Array.from({ length: 10 },
  (_, k) => autocorrelation(elapsed, k + 1));
const peak = Math.max(...sourceCorrelation.map(Math.abs));
const rng2 = generator(0x1041b5c1);
const permuted2 = elapsed.slice();
let lagNullGe = 0;
const lagNullPeaks = [];
for (let i = 0; i < iterations; i++) {
  shuffle(permuted2, rng2);
  let max = 0;
  for (let k = 1; k <= 10; k++)
    max = Math.max(max, Math.abs(autocorrelation(permuted2, k)));
  lagNullPeaks.push(max);
  if (max >= peak) lagNullGe++;
}
assert.equal(lagNullGe, 16362);
bestCounts.sort((a, b) => a - b);
lagNullPeaks.sort((a, b) => a - b);
const outcome = {
  input: { originalBytes: tape.length, sourceIntervals: elapsed.length,
    intervalUnitMinutes: 5, sumUnits: 240, firstBytePosition: 143, lastBytePosition: 256 },
  bitRuleNames: ['one plus trailing zero bits', 'one plus leading zero bits',
    'one plus trailing one bits', 'one plus leading one bits'],
  bitRuleMatches: observed,
  permutedBitRuleMeans: individualNullSums.map(n => n / iterations),
  maxObservedMatches: chosen, maxNullMedian: bestCounts[25000],
  maxNull95: bestCounts[47499], maxNull99: bestCounts[49499],
  familywiseBitRuleExceedances: matchNullGe,
  familywiseBitRuleP: (1 + matchNullGe) / (1 + iterations),
  lag1to10: sourceCorrelation, maximumAbsoluteLagCorrelation: peak,
  lagNull95: lagNullPeaks[47499], lagNull99: lagNullPeaks[49499],
  familywiseLagExceedances: lagNullGe,
  familywiseLagP: (1 + lagNullGe) / (1 + iterations),
  conclusion: 'Neither frozen source-byte bit-waiting rule nor 1..10 timing-memory family is enriched.'
};
console.log(JSON.stringify(outcome, null, 2));
