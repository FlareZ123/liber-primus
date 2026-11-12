'use strict';

/**
 * SFT: independently marked 119-rune prefixes on original LP2 physical
 * pages 3 and 39 versus a shared GP29 additive keystream.
 *
 * Run: node sims/lp2_red119_reused_additive_pad_sft.cjs
 * Does not depend on third-party packages, the network or CLI options.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const LEN = 119;
const MOD = 29;
const N = 50000;
const SEED = 0x03301301;

/** @param {number[]} a @param {number[]} b */
function difference(a, b) {
  assert.ok(a.length >= LEN && b.length >= LEN);
  const h = Array(MOD).fill(0);
  for (let i = 0; i < LEN; i++) h[(a[i] - b[i] + MOD) % MOD]++;
  return h;
}

/** @param {number[]} histogram */
function chiSquare(histogram) {
  const expected = LEN / MOD;
  return histogram.reduce((s, v) => s + (v - expected) ** 2 / expected, 0);
}

/**
 * Approximate GP spelling of reference English. Editorial labels and notes
 * are omitted; K→C, V→U, Q→CW are documented, fixed GP conveniences.
 * A finite GP-normalized English reference is a control, not a plaintext crib.
 *
 * @param {string} raw
 * @returns {number[]}
 */
function normalizeReference(raw) {
  const text = raw.split(/\r?\n/)
    .filter(line => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ').toUpperCase().replace(/K/g, 'C').replace(/V/g, 'U').replace(/Q/g, 'CW');
  const keys = corpus.translit.map((v, i) => ({ v, i }))
    .sort((a, b) => b.v.length - a.v.length);
  const gp = [];
  for (let i = 0; i < text.length;) {
    const token = keys.find(key => text.startsWith(key.v, i));
    if (token) {
      gp.push(token.i);
      i += token.v.length;
    } else {
      i++;
    }
  }
  return gp;
}

/**
 * Probability of plaintext residue difference under independent monograms
 * estimated from a training subset (with a small positive floor).
 *
 * @param {number[]} reference
 * @returns {number[]}
 */
function differenceProbabilities(reference) {
  const f = Array(MOD).fill(0);
  reference.forEach(i => f[i]++);
  return Array.from({ length: MOD }, (_, d) => {
    let sum = 0;
    for (let x = 0; x < MOD; x++) sum += f[x] * f[(x - d + MOD) % MOD];
    return Math.max(1e-12, sum / reference.length ** 2);
  });
}

/**
 * Maximized over every unknown constant additive offset between two pages;
 * this protects the hypothesis from arbitrary per-page Caesar constants.
 *
 * @param {number[]} h
 * @param {number[]} q
 * @returns {number}
 */
function bestLogLikelihood(h, q) {
  let best = -Infinity;
  for (let offset = 0; offset < MOD; offset++) {
    let s = 0;
    for (let d = 0; d < MOD; d++) s += h[d] * Math.log(q[(d + offset) % MOD]);
    if (s > best) best = s;
  }
  return best;
}

let seed = SEED;
/** @returns {number} */
function randomUnit() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

/** @param {number} maxExclusive @returns {number} */
function randomIndex(maxExclusive) {
  return Math.floor(randomUnit() * maxExclusive);
}

assert.equal(corpus.runes.length, MOD);
const p3 = corpus.pages.find(p => p.page === 3).indices;
const p39 = corpus.pages.find(p => p.page === 39).indices;
assert.equal(p3.length, 217);
assert.ok(p39.length >= LEN + 3);
assert.deepEqual(p3.slice(LEN, LEN + 3), [13, 23, 2]);
assert.deepEqual(p39.slice(LEN, LEN + 3), [27, 5, 15]);
assert.equal(p3.slice(LEN, LEN + 3).map(r => corpus.translit[28 - r]).join(''), 'SCY');
assert.equal(p39.slice(LEN, LEN + 3).map(r => corpus.translit[28 - r]).join(''), 'UDP');

const english = normalizeReference(source);
assert.equal(english.length, 3287);
const split = Math.floor(english.length / 2);
const training = english.slice(0, split);
const heldout = english.slice(split);
const q = differenceProbabilities(training);
const original = difference(p3, p39);
const score = bestLogLikelihood(original, q);
const chi = chiSquare(original);
assert.equal(original[0], 3);
assert.ok(Math.abs(chi - 17.226890756302517) < 1e-10);
assert.ok(Math.abs(score + 402.0554162393941) < 1e-9);

// Positive control: same nonstationary keystream on two different native
// messages; the second page also has an arbitrary Caesar shift of seven.
const plantA = heldout.slice(0, LEN);
const plantB = heldout.slice(200, 200 + LEN);
const pad = Array.from({ length: LEN }, (_, i) => (i * i + 7 * i + 3) % MOD);
const encryptedA = plantA.map((r, i) => (r + pad[i]) % MOD);
const encryptedB = plantB.map((r, i) => (r + pad[i] + 7) % MOD);
assert.deepEqual(encryptedA.map((v, i) => (v - pad[i] + MOD) % MOD), plantA);
assert.deepEqual(encryptedB.map((v, i) => (v - pad[i] - 7 + 2 * MOD) % MOD), plantB);
assert.ok(Math.abs(
  bestLogLikelihood(difference(encryptedA, encryptedB), q) -
  bestLogLikelihood(difference(plantA, plantB), q)
) < 1e-9);

const scores = [];
for (let trial = 0; trial < N; trial++) {
  const startA = randomIndex(heldout.length - LEN + 1);
  const startB = randomIndex(heldout.length - LEN + 1);
  if (Math.abs(startA - startB) < LEN) {
    trial--;
    continue;
  }
  scores.push(bestLogLikelihood(
    difference(heldout.slice(startA, startA + LEN), heldout.slice(startB, startB + LEN)), q
  ));
}
scores.sort((a, b) => a - b);
const below = scores.filter(v => v <= score).length;
assert.equal(below, 8);

// Matched source-cipher comparison, using the same statistic and fixed clock.
const candidates = corpus.pages.filter(p => p.page < 56 && p.indices.length >= LEN);
let belowOriginal = 0;
let sourcePairs = 0;
for (let i = 0; i < candidates.length; i++) {
  for (let j = i + 1; j < candidates.length; j++) {
    const comparison = bestLogLikelihood(difference(candidates[i].indices, candidates[j].indices), q);
    if (comparison <= score + 1e-12) belowOriginal++;
    sourcePairs++;
  }
}
assert.equal(sourcePairs, 1326);
assert.equal(belowOriginal, 7);

console.log('Original source: physical p3/p39 prefixes [0,119), red Atbash SCY/UDP [119,122).');
console.log('Original GP29 difference histogram:', JSON.stringify(original));
console.log('Original chi-square:', chi.toFixed(12), 'zero differences:', original[0]);
console.log('Original maximum-over-29-shifts log likelihood:', score.toFixed(12));
console.log('LP1 GP control: train', training.length, 'heldout', heldout.length, 'runes; seed', SEED);
console.log('LP1 holdout disjoint 119-rune pairings:', N, 'scores <= original:', below);
console.log('LP1 holdout quantiles 1%,5%,50%,95%:',
  [499, 2499, 24999, 47499].map(i => scores[i].toFixed(9)).join(', '));
console.log('LP2 source-page control pairs:', sourcePairs, 'scores <= original:', belowOriginal);
console.log('PASS: original source anchors, independent monogram train/heldout, shared-pad + Caesar positive control.');
console.log('No decoded unknown plaintext. Conditional evidence against shared additive GP29 keystream on these two prefixes.');
