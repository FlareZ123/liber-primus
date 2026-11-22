'use strict';

/**
 * LP2 prime-totient plus any fixed secret GP29 outer alphabet:
 * all-secret E/O occupancy bound, with arbitrary per-chapter prime starts
 * 0..4999 and any nonzero scalar applied to the prime-totient key.
 *
 * The candidate reversible model, independently for each printed chapter:
 *
 *   C[i] = sigma((P[i] + m*(prime[start+i]-1)) mod 29)
 *
 * sigma may be any permutation of 29 runes, and m any integer 1..28.
 * This test even RELAXES sigma to a separate possibly nonbijective inverse
 * assignment for each ciphertext label, so the upper bound is rigorous.
 *
 * All original rune positions, including GP F=0, consume a key. The solved
 * p56 plaintext-F transparency is NOT included and remains untested here.
 * A high-language-entropy or moving-alphabet second layer is likewise outside.
 *
 * Read-only SFT. Windows 11 / Node 22 / CommonJS, no dependencies.
 * Run with Node.js using the script path; prints structured results.
 *
 * Source: resources/liber-primus/lp2-corpus.json, original LP2 p0..p55.
 * Independent GP-native language E+O reference minimum (both recorded
 * orthographies): im-results/lp2-ninechapter-predecessor-sbox-original-capacity.md
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const FIRST = 0;
const LAST = 55;
const ALPHABET = 29;
const FIRST_OFFSETS = 5000;
const E = corpus.translit.indexOf('E');
const O = corpus.translit.indexOf('O');
assert.equal(E, 18);
assert.equal(O, 3);

const chapterPages = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
/** @type {number[][]} */
const chapters = chapterPages.map(([first, last]) =>
  corpus.pages.slice(first, last + 1).flatMap(page => page.indices));
const lengths = chapters.map(p => p.length);
assert.deepEqual(lengths, [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(lengths.reduce((s, x) => s + x, 0), 12956);
assert.equal(corpus.pages[50].indices.length, 0);

const maxLength = Math.max(...lengths);
const requiredPrimes = FIRST_OFFSETS + maxLength;

/**
 * Exact consecutive-prime residues of Euler totient(p)=p-1.
 * @param {number} count
 * @returns {number[]}
 */
function primeTotientResidues(count) {
  const composite = new Uint8Array(200000);
  /** @type {number[]} */
  const result = [];
  for (let candidate = 2; candidate < composite.length && result.length < count;
    candidate++) {
    if (composite[candidate]) continue;
    result.push((candidate - 1) % ALPHABET);
    for (let multiple = candidate * candidate; multiple < composite.length;
      multiple += candidate) composite[multiple] = 1;
  }
  assert.equal(result.length, count, 'prime sieve must span every tested offset');
  return result;
}
const prime = primeTotientResidues(requiredPrimes);
const shifts = Array.from({length: ALPHABET}, (_, delta) =>
  Array.from({length: ALPHABET}, (_, index) => (index + delta) % ALPHABET));

/**
 * Exact E-or-O upper bound for every secret outer 29-permutation and
 * every nonzero key multiplier, with a fixed source prime start.
 *
 * Let h[c,k] count original ciphertext output c when public key residue k
 * occurs. Under arbitrary inverse sigma^-1(c)=x and scalar m nonzero,
 * decoded P = x - m*k (mod 29).
 * P can equal E or O only when k is one of two residues with separation
 * delta = (E-O)*inverse(m) mod 29, delta in 1..28.
 *
 * For each delta, the bound is
 *   sum_c max_k (h[c,k] + h[c,(k+delta) mod29]).
 * This even allows a different x per label without injectivity, a
 * relaxation of every genuine 29! inverse alphabet.
 *
 * @param {number[]} ciphertext
 * @param {number} keyStart
 * @returns {{upper: number, delta: number}}
 */
function bound(ciphertext, keyStart) {
  const h = new Uint16Array(ALPHABET * ALPHABET);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    assert.ok(Number.isInteger(c) && c >= 0 && c < ALPHABET);
    h[c * ALPHABET + prime[keyStart + i]]++;
  }
  let maximum = 0;
  let winnerDelta = 1;
  for (let delta = 1; delta < ALPHABET; delta++) {
    let sum = 0;
    for (let c = 0; c < ALPHABET; c++) {
      const base = c * ALPHABET;
      let best = 0;
      for (let k = 0; k < ALPHABET; k++) {
        const n = h[base + k] + h[base + shifts[delta][k]];
        if (n > best) best = n;
      }
      sum += best;
    }
    if (sum > maximum) {
      maximum = sum;
      winnerDelta = delta;
    }
  }
  return {upper: maximum, delta: winnerDelta};
}

/** @param {number} seed @returns {() => number} */
function rng32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Source-native plaintext positive, planted with a different secret
 * arbitrary alphabet, prime phase and scalar in each real chapter.
 * @param {number} index
 * @returns {{eo: number, upper: number}}
 */
function plantedControl(index) {
  const clear = corpus.pages[57].indices;
  assert.equal(clear.length, 95);
  const plain = Array.from({length: chapters[index].length},
    (_, i) => clear[(i + index * 7) % clear.length]);
  const start = [1, 11, 17, 23, 41, 77, 101, 131, 181][index];
  const multiplier = index + 1;
  const random = rng32(0x3301 + index * 31);
  const sigma = Array.from({length: ALPHABET}, (_, i) => i);
  for (let j = ALPHABET - 1; j > 0; j--) {
    const k = random() % (j + 1);
    [sigma[j], sigma[k]] = [sigma[k], sigma[j]];
  }
  const inverse = Array(ALPHABET).fill(-1);
  sigma.forEach((v, i) => {inverse[v] = i;});
  assert.equal(new Set(sigma).size, ALPHABET);
  const encrypted = plain.map((v, i) =>
    sigma[(v + multiplier * prime[start + i]) % ALPHABET]);
  const recovered = encrypted.map((v, i) =>
    (inverse[v] - multiplier * prime[start + i] % ALPHABET + ALPHABET)
      % ALPHABET);
  assert.deepEqual(recovered, plain, 'plant must recover every GP rune');
  const eo = plain.filter(v => v === E || v === O).length;
  const upper = bound(encrypted, start).upper;
  assert.ok(upper >= eo, 'rigorous bound must accept known-secret plant');
  return {eo, upper};
}

/** @type {{chapter:number[],length:number,maximum:number,start:number,delta:number}[]} */
const winners = chapterPages.map(([first, last], index) => ({
  chapter: [first, last], length: lengths[index],
  maximum: 0, start: 0, delta: 1
}));
for (let start = 0; start < FIRST_OFFSETS; start++) {
  for (let i = 0; i < chapters.length; i++) {
    const result = bound(chapters[i], start);
    if (result.upper > winners[i].maximum) {
      winners[i].maximum = result.upper;
      winners[i].start = start;
      winners[i].delta = result.delta;
    }
  }
}
const maxima = winners.map(x => x.maximum);
assert.deepEqual(maxima, [160, 208, 279, 296, 196, 246, 275, 422, 95]);
const totalUpper = maxima.reduce((a, b) => a + b, 0);
assert.equal(totalUpper, 2177);
const nativeReferenceMinimum = 2408;
assert.ok(totalUpper < nativeReferenceMinimum);
const positives = chapters.map((_, i) => plantedControl(i));
const nativePlantEO = positives.reduce((sum, x) => sum + x.eo, 0);
assert.ok(nativePlantEO > totalUpper,
  'real GP-native text should be distinguishable from original fixed-key capacity');

console.log(JSON.stringify({
  question: 'Do nine independent arbitrary fixed GP29 outer alphabets rescue a prime-totient key?',
  originalPages: [FIRST, LAST],
  originalRunes: 12956,
  candidate: 'C = sigma(P + m*(prime[start+i]-1)) mod29; all F consume key',
  chapters: winners,
  startsPerChapter: FIRST_OFFSETS,
  nonzeroMultipliersPerChapter: 28,
  allSecretUpperEO: totalUpper,
  citedNativeGPReferenceMinimumEO: nativeReferenceMinimum,
  nativeReferenceMargin: nativeReferenceMinimum - totalUpper,
  plantedSolvedP57EO: nativePlantEO,
  plantedSolvedP57MaxPerChapter: positives.map(x => x.upper),
  excludes: 'Native-GP prose in this stated static outer-alphabet prime family even when phase, scalar and alphabet are independently secret for each chapter',
  doesNotExclude: 'Actual historical F transparency, skipped clocks, moving alphabets, other plaintext regimes, arbitrary key streams or word/rune transpositions'
}, null, 2));
