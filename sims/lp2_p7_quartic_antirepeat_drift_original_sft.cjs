'use strict';

/**
 * Source-fixed LP2 p7 quartic -> p8 four-rune seed, with stochastic
 * collision-triggered additional LFSR key draws.
 *
 * Run as a read-only Node.js 22 CommonJS single-file test. It requires only
 * committed canonical sources and writes no files.
 *
 * The test is a likelihood exclusion, not a plaintext decoder:
 * hidden rejected draws are generally not uniquely invertible.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'external', 'relikd-solved-gp29-native-v1.json'), 'utf8'));

const index = new Map(corpus.runes.map((r, i) => [r, i]));
const native = solved.sections.flatMap(s =>
  [...s.source_text].filter(r => index.has(r)).map(r => index.get(r)));
assert.equal(native.length, 2979);
const counts = Array(29).fill(0.5);
for (const x of native) counts[x]++;
const denom = counts.reduce((x, y) => x + y, 0);
const unigram = counts.map(x => x / denom);

const cipher = corpus.pages.slice(8, 15).flatMap(p => p.indices);
assert.equal(corpus.pages[8].indices.length, 255);
assert.equal(cipher.length, 1729);
const seed = cipher.slice(0, 4);
assert.deepEqual(seed, [14, 10, 14, 19]);

// Last five complete red p7 word-products are [11,26,8,15,2].
// Q(X)=11+26X+8X^2+15X^3+2X^4 over GF(29).
// The monic-recurrence weights are the negatives of these coefficients /2.
const taps = [7, 25, 16, 9];
const keys = [...seed];
while (keys.length < 5 * cipher.length + 30) {
  const t = keys.length;
  keys.push((taps[0] * keys[t - 1] + taps[1] * keys[t - 2]
    + taps[2] * keys[t - 3] + taps[3] * keys[t - 4]) % 29);
}
assert.deepEqual(keys.slice(4, 12), [15, 24, 16, 21, 22, 20, 10, 9]);

// Four consecutive identical key values would permit four rejected draws.
// None occurs in the complete source-seeded generated register used here,
// so all possible histories have 0,1,2,3 rejected draws at any one rune.
for (let t = 0; t + 3 < keys.length; t++) {
  assert.ok(!(keys[t] === keys[t + 1] &&
    keys[t] === keys[t + 2] && keys[t] === keys[t + 3]));
}
const reject = 0.81;
const checkpoints = new Set([16, 64, 128, 243, 1717, 1725]);

/**
 * Numerically sum all possible source-key phases. At rune i, the next key
 * cursor is i + drift. A path rejecting m keys is legal iff each of those
 * m keys would output the previously observed ciphertext under the SAME
 * latent plaintext letter. The accepted rune consumes one more key.
 *
 * @param {number[]} tape Unmodified original or generated GP29 ciphertext.
 * @param {number} previous Source-visible preceding ciphertext rune.
 * @returns {{logLR:number, checkpoints:[number,number,number][]}}
 */
function likelihood(tape, previous) {
  const n = tape.length;
  let current = new Float64Array(3 * n + 4);
  current[0] = 1;
  let high = 0;
  let logLR = 0;
  const progress = [];
  for (let i = 0; i < n; i++) {
    const next = new Float64Array(3 * n + 4);
    let sum = 0;
    let top = 0;
    const observed = tape[i];
    const acceptance = observed === previous ? 1 - reject : 1;
    const flat = observed === previous ?
      (1 - reject) / (29 - reject) : 1 / (29 - reject);
    for (let drift = 0; drift <= high; drift++) {
      const weight = current[drift];
      if (weight === 0) continue;
      const clock = i + drift;
      for (let skipped = 0; skipped <= 3; skipped++) {
        const plain = (observed - keys[clock + skipped] + 29) % 29;
        let legal = true;
        for (let j = 0; j < skipped; j++) {
          if ((plain + keys[clock + j]) % 29 !== previous) {
            legal = false;
            break;
          }
        }
        if (!legal) continue;
        const mass = weight * unigram[plain] *
          Math.pow(reject, skipped) * acceptance;
        if (mass === 0) continue;
        next[drift + skipped] += mass;
        sum += mass;
        if (drift + skipped > top) top = drift + skipped;
      }
    }
    assert.ok(sum > 0, 'all histories disappeared at rune ' + i);
    for (let j = 0; j <= top; j++) next[j] /= sum;
    logLR += Math.log(sum / flat);
    current = next;
    high = top;
    previous = observed;
    if (checkpoints.has(i + 1) || i + 1 === n) {
      progress.push([i + 1, logLR, high + 1]);
    }
  }
  return {logLR, checkpoints: progress};
}

// Deterministic xorshift32; the positive draws actual 2014 solved GP runes.
let randomState = 0x66013301;
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}

/**
 * @param {number[]} plaintext Authentic known GP29 plaintext.
 * @param {number} previous Ciphertext predecessor.
 * @returns {{ciphertext:number[],rejections:number,consumed:number}}
 */
function encryptPlant(plaintext, previous) {
  let clock = 0;
  let rejections = 0;
  const ciphertext = [];
  for (const p of plaintext) {
    let emitted;
    while (true) {
      emitted = (p + keys[clock++]) % 29;
      if (emitted === previous && random() < reject) {
        rejections++;
        continue;
      }
      break;
    }
    ciphertext.push(emitted);
    previous = emitted;
  }
  return {ciphertext, rejections, consumed: clock};
}

/**
 * @param {number} n Number of source-shaped null symbols.
 * @param {number} previous Ciphertext predecessor.
 * @returns {number[]}
 */
function antiRepeatNull(n, previous) {
  const ciphertext = [];
  for (let i = 0; i < n; i++) {
    let emitted;
    while (true) {
      emitted = Math.floor(random() * 29);
      if (emitted === previous && random() < reject) continue;
      break;
    }
    ciphertext.push(emitted);
    previous = emitted;
  }
  return ciphertext;
}

const originalAfterRed4 = likelihood(cipher.slice(4), cipher[3]);
const originalBlackOnly = likelihood(cipher.slice(12), cipher[11]);
const positive = encryptPlant(native.slice(0, 1717), cipher[11]);
const nativePlant = likelihood(positive.ciphertext, cipher[11]);
const flatPlant = likelihood(antiRepeatNull(1717, cipher[11]), cipher[11]);

/** @param {number} got @param {number} expected */
function near(got, expected) {
  assert.ok(Math.abs(got - expected) < 0.000001,
    'drift likelihood mismatch: ' + got + ' vs ' + expected);
}
assert.equal(positive.rejections, 41);
assert.equal(positive.consumed, 1758);
near(originalAfterRed4.logLR, -1040.239340212424);
near(originalBlackOnly.logLR, -983.0891067633524);
near(nativePlant.logLR, 652.2571890260406);
near(flatPlant.logLR, -977.996978677665);
assert.ok(originalAfterRed4.logLR < -10);
assert.ok(originalBlackOnly.logLR < -10);
assert.ok(nativePlant.logLR > 30);
assert.ok(flatPlant.logLR < -10);

console.log(JSON.stringify({
  status: 'PASS',
  source: {seed, taps, originalRunes: cipher.length,
    originalAfterRed4: 1725, blackOnly: 1717, nativeControlRunes: native.length},
  originalAfterRed4, originalBlackOnly,
  actualSolvedGPPlant: {rejections: positive.rejections,
    keyDraws: positive.consumed, ...nativePlant},
  antiRepeatFlatPlant: flatPlant
}, null, 2));
