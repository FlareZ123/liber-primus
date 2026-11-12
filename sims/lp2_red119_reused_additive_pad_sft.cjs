'use strict';

/**
 * Single-file test: the 119 GP29 prefix runes immediately preceding the
 * red Atbash SCY/UDP triads on original LP2 physical pages 3 and 39.
 * Tests reuse of the same GP29 additive keystream at the two prefixes.
 *
 * Run from any directory: node sims/lp2_red119_reused_additive_pad_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const reference = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const LEN = 119;
const MOD = 29;
const SAMPLES = 50000;
const SOURCE_SEED = 0x03301301;

/** @param {number[]} a @param {number[]} b */
function deltaHistogram(a, b) {
  assert.ok(a.length >= LEN && b.length >= LEN);
  const hist = Array(MOD).fill(0);
  for (let i = 0; i < LEN; i++) hist[(a[i] - b[i] + MOD) % MOD]++;
  return hist;
}

/** @param {number[]} hist */
function chiSquare(hist) {
  const expected = LEN / MOD;
  return hist.reduce((total, count) => total + (count - expected) ** 2 / expected, 0);
}

/**
 * Approximate the 29-symbol GP-native spelling in the editorial LP1 reference.
 * Exclude its metadata and editorial bracketed notes; collapse K→C, V→U,
 * Q→CW and greedily tokenize original GP transliterations.
 * This source is an approximate English control, not a cryptographic crib.
 *
 * @param {string} raw
 */
function nativeRunes(raw) {
  const text = raw.split(/\r?\n/)
    .filter(line => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ').toUpperCase().replace(/K/g, 'C').replace(/V/g, 'U').replace(/Q/g, 'CW');
  const keys = corpus.translit.map((v, i) => ({ v, i }))
    .sort((a, b) => b.v.length - a.v.length);
  const out = [];
  for (let i = 0; i < text.length;) {
    const token = keys.find(key => text.startsWith(key.v, i));
    if (token) {
      out.push(token.i);
      i += token.v.length;
    } else {
      i++;
    }
  }
  return out;
}

/** @returns {number} deterministic uniform value in [0,1) */
let seed = SOURCE_SEED;
function nextRandom() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
}

/** @param {number} maxExclusive */
function randomIndex(maxExclusive) {
  return Math.floor(nextRandom() * maxExclusive);
}

const p3 = corpus.pages.find(p => p.page === 3).indices;
const p39 = corpus.pages.find(p => p.page === 39).indices;
assert.equal(corpus.runes.length, MOD);
assert.equal(p3.length, 217);
assert.ok(p39.length >= LEN + 3);
assert.deepEqual(p3.slice(LEN, LEN + 3), [13, 23, 2]);
assert.deepEqual(p39.slice(LEN, LEN + 3), [27, 5, 15]);
assert.equal(p3.slice(LEN, LEN + 3).map(r => corpus.translit[28 - r]).join(''), 'SCY');
assert.equal(p39.slice(LEN, LEN + 3).map(r => corpus.translit[28 - r]).join(''), 'UDP');

const target = deltaHistogram(p3, p39);
const targetChi = chiSquare(target);
const english = nativeRunes(reference);
assert.ok(english.length > 2000);
const scores = [];
const startCount = english.length - LEN + 1;
for (let trial = 0; trial < SAMPLES; trial++) {
  const a = randomIndex(startCount);
  const b = randomIndex(startCount);
  if (Math.abs(a - b) < LEN) {
    trial--;
    continue;
  }
  const first = english.slice(a, a + LEN);
  const second = english.slice(b, b + LEN);

  // Positive control: encrypt both unrelated native texts under an
  // identical, independently drawn additive keystream and recover their
  // exact difference inventory.
  if (trial === 0) {
    const pad = Array.from({ length: LEN }, () => randomIndex(MOD));
    const c1 = first.map((v, i) => (v + pad[i]) % MOD);
    const c2 = second.map((v, i) => (v + pad[i]) % MOD);
    assert.deepEqual(deltaHistogram(c1, c2), deltaHistogram(first, second));
    assert.deepEqual(c1.map((v, i) => (v - pad[i] + MOD) % MOD), first);
  }
  scores.push(chiSquare(deltaHistogram(first, second)));
}
scores.sort((a, b) => a - b);
const under = scores.filter(score => score <= targetChi + 1e-12).length;
const targetIoc = target.reduce((sum, count) => sum + count * (count - 1), 0) / (LEN * (LEN - 1));
assert.equal(target[0], 3);
assert.ok(Math.abs(targetChi - 17.226890756302517) < 1e-10);
assert.ok(Math.abs(targetIoc - 0.031334567725395245) < 1e-12);

console.log('Original: physical p3/p39 GP29 source prefixes [0,119), red triads [119,122)');
console.log('Hypothesis: same 119-symbol GP29 additive pad and printed source alignment');
console.log('Difference histogram:', JSON.stringify(target));
console.log('Original difference chi-square:', targetChi.toFixed(12));
console.log('Original difference IoC:', targetIoc.toFixed(12));
console.log('Control: LP1 reference GP-normalized runes:', english.length);
console.log('Control: seed', SOURCE_SEED.toString(16), 'disjoint pairs', SAMPLES);
console.log('LP1 chi-square quantiles 1%, 5%, 50%, 95%:',
  [499, 2499, 24999, 47499].map(i => scores[i].toFixed(9)).join(', '));
console.log('Original chi-square lower-tail control fraction:',
  under + '/' + SAMPLES + ' = ' + (under / SAMPLES).toFixed(6));
console.log('PASS: source constraints and same-pad positive-control recovery.');
console.log('This is finite statistical evidence against the fixed reuse model, not a proof of an alternative cipher.');
