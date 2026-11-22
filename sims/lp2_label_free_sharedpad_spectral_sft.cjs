'use strict';
/**
 * Permutation-invariant spectral test of a single page-aligned GP29 pad reused
 * over the first 192 rune positions of 47 long original LP2 pages.
 *
 * Model: C(page,t) = sigma_page((P(page,t)+K(t)) mod 29).
 * Sigma_page is an arbitrary unknown, independently sampled permutation.
 * Within-page equality survives sigma, allowing a source-blind test of reuse.
 * Source-native control pages are independent Shakespeare GP passages with
 * one shared random K, independently random sigma, and 81% suppression
 * of adjacent ciphertext equalities. This is a detector, not a decoder.
 *
 * SFT: node sims/lp2_label_free_sharedpad_spectral_sft.cjs
 * Node.js 22, built-ins only. Seed 0x52f17e3a.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const nativeText = fs.readFileSync(
  path.join(ROOT, 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8');
const T = 192;
const nativePages = corpus.pages
  .filter(p => p.page <= 55 && p.indices.length >= T)
  .map(p => p.indices);
assert.equal(nativePages.length, 47);

let seed = 0x52f17e3a;
/** @returns {number} Deterministic fractional draw in [0,1). */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
/** @param {number} n @returns {number} */
function randomInt(n) { return Math.floor(random() * n); }

/**
 * Longest-match, literal GP encoding of a disjoint English source.
 * Foreign letters K,V,Z,Q use explicit C,U,S,C folds.
 * @param {string} english
 * @returns {number[]}
 */
function encodeGP(english) {
  const map = new Map(corpus.translit.map((s, i) => [s, i]));
  const clean = english.toUpperCase()
    .replace(/[KVZQ]/g, c => ({K:'C', V:'U', Z:'S', Q:'C'})[c])
    .replace(/[^A-Z]/g, '');
  const result = [];
  for (let i = 0; i < clean.length;) {
    let index = map.get(clean.slice(i, i + 2));
    let advance = 2;
    if (index === undefined) {
      index = map.get(clean[i]);
      advance = 1;
    }
    if (index !== undefined) result.push(index);
    i += advance;
  }
  return result;
}
const nativeRunes = encodeGP(nativeText);
assert.equal(nativeRunes.length, 216874);

/**
 * Center the within-page glyph-equality Gram by each page's empirical
 * collision baseline, drop near-neighbor pairs (gap < 8), symmetrize and
 * compute the leading signed eigenvalue by seeded power iteration.
 * A per-page alphabet permutation cancels from every observed equality.
 * @param {number[][]} pages
 * @param {number[]|null} offsets
 * @returns {number}
 */
function leadingEigen(pages, offsets = null) {
  const n = pages.length;
  const matrix = new Float64Array(T * T);
  for (let p = 0; p < n; p++) {
    const a = pages[p], length = a.length;
    const offset = offsets ? offsets[p] : 0;
    const glyphs = new Uint8Array(T);
    const counts = new Int32Array(29);
    for (let t = 0; t < T; t++) {
      const value = a[(offset + t) % length];
      glyphs[t] = value;
      counts[value]++;
    }
    const baseline = counts.reduce((sum, v) => sum + v * (v - 1), 0)
      / (T * (T - 1));
    for (let t = 0; t < T - 8; t++) {
      for (let u = t + 8; u < T; u++) {
        matrix[t * T + u] += Number(glyphs[t] === glyphs[u]) - baseline;
      }
    }
  }
  for (let t = 0; t < T; t++) {
    for (let u = t + 8; u < T; u++) {
      const value = matrix[t * T + u] / Math.sqrt(n);
      matrix[t * T + u] = matrix[u * T + t] = value;
    }
  }
  let x = Float64Array.from({length: T}, () => random() - 0.5);
  for (let iter = 0; iter < 75; iter++) {
    const y = new Float64Array(T);
    for (let a = 0; a < T; a++) {
      let s = 0;
      for (let b = 0; b < T; b++) s += matrix[a * T + b] * x[b];
      y[a] = s;
    }
    let norm2 = 0;
    for (const z of y) norm2 += z * z;
    const norm = Math.sqrt(norm2);
    for (let a = 0; a < T; a++) x[a] = y[a] / norm;
  }
  let value = 0;
  for (let a = 0; a < T; a++) {
    for (let b = 0; b < T; b++) {
      value += x[a] * matrix[a * T + b] * x[b];
    }
  }
  return value;
}

/**
 * Native GP source encrypted with a shared secret K and arbitrary secret
 * page-wise 29-rune bijections. Published duplicate repair is applied after
 * the alphabet permutation to match the original rarity of adjacent equals.
 * @returns {{pages:number[][], repeatRate:number}}
 */
function plant() {
  const key = Array.from({length: T}, () => randomInt(29));
  let repeats = 0;
  let transitions = 0;
  const pages = nativePages.map(() => {
    const sigma = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const h = randomInt(i + 1);
      [sigma[h], sigma[i]] = [sigma[i], sigma[h]];
    }
    const start = randomInt(nativeRunes.length - T);
    const out = [];
    for (let t = 0; t < T; t++) {
      let v = sigma[(nativeRunes[start + t] + key[t]) % 29];
      if (t > 0 && v === out[t - 1] && random() < 0.81) {
        v = (v + 1 + randomInt(28)) % 29;
      }
      out.push(v);
      if (t > 0) {
        repeats += Number(v === out[t - 1]);
        transitions++;
      }
    }
    return out;
  });
  return {pages, repeatRate: repeats / transitions};
}
/** @param {number[]} values */
function describe(values) {
  const sorted = [...values].sort((a,b) => a-b);
  return {min: sorted[0], median: sorted[Math.floor(sorted.length / 2)],
    mean: sorted.reduce((a,b)=>a+b,0)/sorted.length,
    p95: sorted[Math.floor(0.95*sorted.length)], max: sorted.at(-1)};
}

function main() {
  const observed = leadingEigen(nativePages);
  const nulls = [];
  for (let rep = 0; rep < 120; rep++) {
    nulls.push(leadingEigen(nativePages,
      nativePages.map(page => randomInt(page.length))));
  }
  const plants = [], repeatRates = [];
  for (let rep = 0; rep < 100; rep++) {
    const generated = plant();
    plants.push(leadingEigen(generated.pages));
    repeatRates.push(generated.repeatRate);
  }
  const originalRepeats = nativePages.reduce((sum, a) =>
    sum + a.slice(1, T).filter((v, i) => v === a[i]).length, 0)
    / (nativePages.length * (T - 1));
  const nullAbove = nulls.filter(v => v >= observed).length;
  const detected = plants.filter(v => v > Math.max(...nulls)).length;
  assert.ok(observed > 5 && observed < 6);
  assert.equal(nullAbove, 9);
  assert.equal(detected, 100);
  assert.ok(Math.abs(originalRepeats - 0.006572351565110839) < 1e-12);
  console.log(JSON.stringify({
    test: 'LP2 source-blind common-pad spectral detector',
    seed: '0x52f17e3a', pages: nativePages.length, runesPerPage: T,
    sourceNativeRunes: nativeRunes.length, observed,
    nullRotation: describe(nulls),
    nullGreaterOrEqual: nullAbove, empiricalUpperTail: (nullAbove + 1) / 121,
    plantNativeGP: describe(plants),
    plantedAboveEveryNull: detected, plantedRepeatRate: describe(repeatRates),
    originalRepeatRate: originalRepeats,
    conclusion: 'No recovered key/plaintext; original score is null-compatible.'
  }, null, 2));
}
main();
