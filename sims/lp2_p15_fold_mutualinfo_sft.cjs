'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'
), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-ink-annotations.json'
), 'utf8'));
const pages = new Map(corpus.pages.map((p) => [p.page, p.indices]));
const center = pages.get(15);
const centerInk = ink.pages.find((p) => p.page === 15);
assert.deepEqual(centerInk.red_spans.map((s) => [s.start, s.length]), [[0, 9], [9, 11]]);

const earlier = Array.from({ length: 8 }, (_, j) => pages.get(7 + j)).flat();
const later = Array.from({ length: 8 }, (_, j) => pages.get(16 + j)).flat();
assert.equal(earlier.length, 1937);
assert.equal(later.length, 1957);
const tapeA = [...center.slice(0, 9), ...earlier, ...center.slice(9, 20)];
const tapeB = later.slice().reverse();
assert.equal(tapeA.length, 1957);
assert.equal(tapeB.length, tapeA.length);

/**
 * Label-invariant mutual information of two 29-rune source tapes in bits.
 * Every fixed bijective recoding of either rune alphabet leaves this quantity unchanged.
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number}
 */
function mutualInformation(x, y) {
  assert.equal(x.length, y.length);
  const joint = new Uint16Array(29 * 29);
  const freqX = new Uint16Array(29);
  const freqY = new Uint16Array(29);
  for (let i = 0; i < x.length; i += 1) {
    assert.ok(x[i] >= 0 && x[i] < 29 && y[i] >= 0 && y[i] < 29);
    joint[29 * x[i] + y[i]] += 1;
    freqX[x[i]] += 1;
    freqY[y[i]] += 1;
  }
  let bits = 0;
  for (let a = 0; a < 29; a += 1) {
    for (let b = 0; b < 29; b += 1) {
      const n = joint[29 * a + b];
      if (n) bits += n / x.length * Math.log2(n * x.length / (freqX[a] * freqY[b]));
    }
  }
  return bits;
}

let state = 0x93192025;
/** @returns {number} */
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

const observed = mutualInformation(tapeA, tapeB);
const samples = 1500;
const shuffled = tapeB.slice();
let total = 0;
let squareSum = 0;
let atLeastObserved = 0;
for (let rep = 0; rep < samples; rep += 1) {
  for (let j = shuffled.length - 1; j > 0; j -= 1) {
    const k = nextRandom() % (j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  const bits = mutualInformation(tapeA, shuffled);
  total += bits;
  squareSum += bits * bits;
  atLeastObserved += Number(bits >= observed);
}
const nullMean = total / samples;
const nullSd = Math.sqrt(squareSum / samples - nullMean ** 2);
const upperTail = (atLeastObserved + 1) / (samples + 1);
assert.ok(Math.abs(observed - 0.33344794987348797) < 1e-11);
assert.ok(Math.abs(nullMean - 0.3278857297884941) < 1e-10);
assert.ok(Math.abs(nullSd - 0.01598509454956794) < 1e-10);
assert.equal(atLeastObserved, 548);

const plant = tapeA.map((v) => (7 * v + 11) % 29);
const plantedMi = mutualInformation(tapeA, plant);
const originalEntropy = mutualInformation(tapeA, tapeA);
assert.ok(Math.abs(plantedMi - originalEntropy) < 1e-12);
assert.ok(plantedMi > 4.5);
assert.ok(upperTail > 0.1);

console.log(JSON.stringify({
  pageHalves: [[7, 14], [16, 23]],
  centerRedCaps: [9, 11],
  tapeLength: 1957,
  observedMiBits: observed,
  nullPermutations: samples,
  nullMeanBits: nullMean,
  nullSdBits: nullSd,
  exactNullAboveObserved: atLeastObserved,
  empiricalUpperTail: upperTail,
  plantedBijectionMiBits: plantedMi,
  note: 'A low original MI does not exclude running-key ciphers or position-dependent symbol maps.',
}, null, 2));
