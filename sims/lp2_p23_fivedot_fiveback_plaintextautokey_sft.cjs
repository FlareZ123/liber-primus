'use strict';

/**
 * Exact all-secret test of one five-dot GP29 plaintext-autokey consumer:
 * C[t] = P[t] + P[t-5] (mod29) for t >= 5, with arbitrary independent
 * five-rune initial key at t = 0..4.
 *
 * Original LP2 p23–26, excluding the 16-rune opening rubric, has 1005 runes.
 * Complete seed enumeration is factorized into five independent lanes.
 * Source-native one-rune words are constrained to A, I or O; a separate test
 * grants F too. A positive plant uses original clear p57 GP29 runes.
 *
 * Node.js 22 / CommonJS; read-only; no fitted language scores or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const symbols = new Map(corpus.runes.map((r, i) => [r, i]));
const source = transcript.split('%').slice(0, 55).join('')
  .replace(/\/\s*/gu, '');
const words = (source.match(/[\u16A0-\u16FF]+/gu) || [])
  .map((s) => [...s].map((r) => {
    assert.ok(symbols.has(r), 'unknown source rune ' + r);
    return symbols.get(r);
  }));
const all = words.flat();
assert.equal(words.length, 2896);
assert.equal(all.length, 12956);
assert.deepEqual(all, corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices));

const bookStart = 5506;
const rubricLength = 16;
const start = bookStart + rubricLength;
const end = 6527;
const cipher = all.slice(start, end);
assert.equal(cipher.length, 1005);
assert.deepEqual(cipher, corpus.pages
  .filter((p) => p.page >= 23 && p.page <= 26)
  .flatMap((p) => p.indices).slice(rubricLength));

const singleton = [];
let cursor = 0;
for (const word of words) {
  if (cursor >= start && cursor < end && word.length === 1) {
    singleton.push(cursor - start);
  }
  cursor += word.length;
}
assert.deepEqual(singleton, [113, 177, 454, 469, 734]);

const mod29 = (x) => ((x % 29) + 29) % 29;

/**
 * @param {number[]} C Original or planted ciphertext
 * @param {number} lane A class in 0..4
 * @param {number} seed The arbitrary first plaintext rune P[lane]
 * @returns {number[]} Sparse recovered plaintext, populated in this lane
 */
function inverseLane(C, lane, seed) {
  const output = [];
  let previous = seed;
  for (let i = lane; i < C.length; i += 5) {
    previous = i === lane ? seed : mod29(C[i] - previous);
    output[i] = previous;
  }
  return output;
}

/**
 * Complete enumeration of every five-rune initial key. For any desired
 * first plaintext value seed, its corresponding key is C[lane] - seed.
 * Independent lanes therefore need only 5 * 29 evaluations, not 29**5.
 * @param {number[]} C Ciphertext to invert
 * @param {number[]} accepted Permitted genuine one-rune plaintext types
 * @returns {number[][]} Surviving first-plaintext seed per residue lane
 */
function seedSets(C, accepted) {
  const allowed = new Set(accepted);
  return Array.from({length: 5}, (_, lane) => {
    const positions = singleton.filter((i) => i % 5 === lane);
    return Array.from({length: 29}, (_, i) => i).filter((seed) => {
      const P = inverseLane(C, lane, seed);
      return positions.every((i) => allowed.has(P[i]));
    });
  });
}

/**
 * @param {number[]} P Plaintext GP29 sequence
 * @param {number[]} initialKey Exactly five GP29 integers
 * @returns {number[]} Ciphertext under the frozen plaintext-autokey rule
 */
function forward(P, initialKey) {
  assert.equal(initialKey.length, 5);
  return P.map((value, i) =>
    mod29(value + (i < 5 ? initialKey[i] : P[i - 5])));
}

/**
 * @param {number[]} C Ciphertext
 * @param {number[]} firstPlain Five plaintext seeds
 * @returns {number[]} Complete plaintext
 */
function inverse(C, firstPlain) {
  const P = new Array(C.length);
  for (let lane = 0; lane < 5; lane++) {
    const part = inverseLane(C, lane, firstPlain[lane]);
    for (let i = lane; i < C.length; i += 5) P[i] = part[i];
  }
  return P;
}

const nativeSingle = [24, 10, 3]; // A, I, O, mapped through original GP29
const originalCandidates = seedSets(cipher, nativeSingle);
assert.deepEqual(originalCandidates.map((s) => s.length), [29, 29, 3, 3, 0]);
const extended = seedSets(cipher, [0, ...nativeSingle]); // grants F too
assert.deepEqual(extended.map((s) => s.length), [29, 29, 4, 4, 0]);

// The contradiction needs just two words, without fitting any initial key.
// At p24:257 (body offset454) and p25:267 (offset734), the plaintext
// expressions are respectively P[454] = seed + 3 and P[734] = seed + 19.
const zero = inverseLane(cipher, 4, 0);
const one = inverseLane(cipher, 4, 1);
assert.deepEqual([zero[454], zero[734]], [3, 19]);
assert.deepEqual([one[454], one[734]], [4, 20]);
const allowedDifferences = new Set([0, ...nativeSingle]
  .flatMap((a) => [0, ...nativeSingle].map((b) => mod29(b - a))));
assert.equal(allowedDifferences.has(16), false);

// Positive control: original 95 GP29 plaintext runes from solved p57,
// repeated to the original 1005-rune geometry, with printed singleton
// slots set to independently attested A/I/O plaintext words.
const sourceNative = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(sourceNative.length, 95);
const plaintext = Array.from({length: cipher.length},
  (_, i) => sourceNative[i % sourceNative.length]);
for (let i = 0; i < singleton.length; i++) {
  plaintext[singleton[i]] = nativeSingle[i % nativeSingle.length];
}
const initialKey = [2, 3, 5, 7, 11]; // first five source GP primes
const planted = forward(plaintext, initialKey);
const plantedSeeds = seedSets(planted, nativeSingle);
const firstPlain = plaintext.slice(0, 5);
assert.deepEqual(plantedSeeds.map((s) => s.length), [29, 29, 3, 3, 1]);
for (let lane = 0; lane < 5; lane++) {
  assert.ok(plantedSeeds[lane].includes(firstPlain[lane]));
}
assert.deepEqual(inverse(planted, firstPlain), plaintext);
assert.deepEqual(forward(inverse(planted, firstPlain), initialKey), planted);

console.log(JSON.stringify({
  source: 'original LP2 p23-26, red rubric excluded',
  originalLength: cipher.length,
  singletons: singleton,
  originalSeedSetSizes: originalCandidates.map((s) => s.length),
  grantingLiteralFSeedSetSizes: extended.map((s) => s.length),
  sourceSingletonContradiction: {
    page24Local257: 'seed + 3', page25Local267: 'seed + 19',
    requiredMod29Difference: 16,
    allowedMod29Difference: false
  },
  plantedSeedSetSizes: plantedSeeds.map((s) => s.length),
  positiveNativeGpReconstruction: true,
  result: 'No inverse with unchanged printed A/I/O words and fixed five-rune plaintext-autokey clock'
}, null, 2));
