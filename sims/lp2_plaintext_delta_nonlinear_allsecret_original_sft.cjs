'use strict';

/**
 * SFT: original LP2 versus a stationary, secret permutation of plaintext differences.
 *
 * Cipher family:
 *   C[w,i] = C[w,i-1] + h(P[w,i] - P[w,i-1]) (mod 29).
 * One free ciphertext/plaintext initial value per original printed word.
 * h is ANY 29-element permutation and is constant across all words.
 *
 * Unlike D=h(P_i), D=h(P_i +/- GPprime(P_prev)) or a multiplicative
 * difference with h(0)=0, this permits a nonlinear map of the actual
 * PLAINTEXT predecessor difference and a hidden nonzero h(0).
 * All 29! h are covered by the sorted-difference count invariant.
 *
 * Windows 11: node sims/lp2_plaintext_delta_nonlinear_allsecret_original_sft.cjs
 * Read-only; Node 22; no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
/** @param {string} relative */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const wordSources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];

/** @param {number} value */
const mod = value => (value % 29 + 29) % 29;

/** @returns {{ a: number[], page: number }[]} */
function originalWords() {
  const first55 = read('resources/lp2-transcription.txt').split('%')
    .slice(0, 55).join('%');
  const words = [];
  let runes = [];
  let page = 0;
  let wordPage = 0;
  for (const char of first55) {
    const index = runeToIndex.get(char);
    if (index !== undefined) {
      if (!runes.length) wordPage = page;
      runes.push(index);
    } else if (char === '%') {
      page++;
    } else if (char === '/' || /\s/u.test(char)) {
      // A printed line or physical-page boundary may split one word.
    } else if (runes.length) {
      words.push({ a: runes, page: wordPage });
      runes = [];
    }
  }
  if (runes.length) words.push({ a: runes, page: wordPage });
  const source = gp.pages.filter(p => p.page < 56 && p.indices.length);
  assert.equal(source.length, 55);
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, w) => n + w.a.length, 0), 12956);
  assert.deepEqual(words.flatMap(w => w.a), source.flatMap(p => p.indices));
  return words;
}

/** @param {number[][]} words @returns {number[]} */
function deltaCounts(words) {
  const counts = Array(29).fill(0);
  for (const a of words) {
    for (let i = 1; i < a.length; i++) counts[mod(a[i] - a[i - 1])]++;
  }
  return counts;
}

/**
 * Exact minimum TV distance over ALL 29! fixed hidden GP29 alphabets:
 * sorted frequencies are a complete class invariant for an unlabeled histogram.
 * @param {number[]} left
 * @param {number[]} right
 */
function minimumTV(left, right) {
  const a = left.slice().sort((x, y) => x - y);
  const b = right.slice().sort((x, y) => x - y);
  const na = a.reduce((x, y) => x + y, 0);
  const nb = b.reduce((x, y) => x + y, 0);
  return a.reduce((s, count, i) => s + Math.abs(count / na - b[i] / nb), 0) / 2;
}

/** @param {number} power @param {number} exp */
function pow29(power, exp) {
  let value = 1;
  for (let i = 0; i < exp; i++) value = mod(value * power);
  return value;
}

// A genuine nonlinear field permutation. gcd(5,28)=1; 5^(-1)=17 mod28.
// 7^(-1)=25 mod29; the affine offset moves the zero-step to ciphertext 3.
/** @param {number} difference */
const secretH = difference => mod(7 * pow29(difference, 5) + 3);
/** @param {number} difference */
const inverseH = difference => pow29(mod(25 * mod(difference - 3)), 17);

/**
 * @param {number[]} plain
 * @param {number} firstCipher
 * @param {(x: number) => number} h
 * @returns {number[]}
 */
function encipher(plain, firstCipher, h) {
  const c = [firstCipher];
  for (let i = 1; i < plain.length; i++) {
    c.push(mod(c[i - 1] + h(mod(plain[i] - plain[i - 1]))));
  }
  return c;
}

/**
 * @param {number[]} cipher
 * @param {number} firstPlain
 * @param {(x: number) => number} hInverse
 * @returns {number[]}
 */
function decipher(cipher, firstPlain, hInverse) {
  const p = [firstPlain];
  for (let i = 1; i < cipher.length; i++) {
    p.push(mod(p[i - 1] + hInverse(mod(cipher[i] - cipher[i - 1]))));
  }
  return p;
}

const original = originalWords();
const originalHistogram = deltaCounts(original.map(w => w.a));
assert.equal(originalHistogram.reduce((s, n) => s + n, 0), 10060);
assert.deepEqual(originalHistogram,
  [63,356,373,354,338,349,325,372,328,397,377,362,343,381,369,
    365,333,313,349,368,373,366,334,390,371,352,349,380,330]);
assert.equal(Math.max(...originalHistogram), 397);
assert.equal(Math.min(...originalHistogram), 63);

const sourceWords = wordSources.flatMap(file =>
  (read(file).match(/[A-Za-z]+/g) || []).map(word => encodeSourceNativeGP(word)));
assert.equal(sourceWords.length, 149072);
const sourceHistogram = deltaCounts(sourceWords);
assert.equal(sourceHistogram.reduce((s, n) => s + n, 0), 451853);
const sourceTV = minimumTV(originalHistogram, sourceHistogram);
assert.ok(Math.abs(sourceTV - 0.13538428873525826) < 1e-12);

const byLength = Array.from({ length: 15 }, () => []);
for (const word of sourceWords) {
  if (word.length < byLength.length) byLength[word.length].push(word);
}
assert.ok(original.every(w => byLength[w.a.length].length > 0));

let state = 0x33012026;
/** Reproducible xorshift32 draws, one uniformly chosen matching-length word. */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
/** @returns {number[][]} */
function drawWords() {
  return original.map(w => {
    const pool = byLength[w.a.length];
    return pool[Math.floor(random() * pool.length)];
  });
}

let minMatchedTV = Infinity;
let maxMatchedTV = -Infinity;
let sumMatchedTV = 0;
let minNativePeak = Infinity;
let minNativeZero = Infinity;
let originalExceedances = 0;
let plantedWords = null;
const trials = 1000;
for (let trial = 0; trial < trials; trial++) {
  const draw = drawWords();
  if (trial === 0) plantedWords = draw;
  const hist = deltaCounts(draw);
  const distance = minimumTV(originalHistogram, hist);
  minMatchedTV = Math.min(minMatchedTV, distance);
  maxMatchedTV = Math.max(maxMatchedTV, distance);
  sumMatchedTV += distance;
  minNativePeak = Math.min(minNativePeak, Math.max(...hist));
  minNativeZero = Math.min(minNativeZero, hist[0]);
  if (distance <= 0.03) originalExceedances++;
}
assert.equal(originalExceedances, 0);
assert.equal(minNativePeak, 645);
assert.equal(minNativeZero, 253);
assert.ok(Math.abs(minMatchedTV - 0.1167992047713718) < 1e-12);
assert.ok(Math.abs(maxMatchedTV - 0.14652087475149106) < 1e-12);

// A complete native-English positive with identical 2,896 word lengths.
// It consumes every non-initial rune, permits independent word IVs and
// uses a NONLINEAR 29-symbol bijection with h(0) nonzero.
assert(plantedWords);
const encryptedPlant = plantedWords.map((plain, i) =>
  encipher(plain, original[i].a[0], secretH));
for (let i = 0; i < plantedWords.length; i++) {
  assert.deepEqual(decipher(encryptedPlant[i], plantedWords[i][0], inverseH),
    plantedWords[i]);
  assert.equal(encryptedPlant[i].length, original[i].a.length);
}
assert.equal(encryptedPlant.reduce((s, a) => s + a.length, 0), 12956);
assert.ok(minimumTV(deltaCounts(plantedWords),
  deltaCounts(encryptedPlant)) < 1e-12);

// Original source-selected prime-field exponent illustrations: 3301 =25 mod28,
// 3299 =23 mod28. The direct inverse uses exponent 9 or 11 respectively.
// These are two special permutations inside the all-secret class, but show
// an actual complete reversible original-cipher readout.
const originalSourcePages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const powers = [[3301, 25, 9], [3299, 23, 11]].map(([origin, exp, inverse]) => {
  assert.equal((exp * inverse) % 28, 1);
  const recovered = originalSourcePages.map(page =>
    decipher(page.indices, 0, x => pow29(x, inverse)));
  for (let i = 0; i < recovered.length; i++) {
    assert.deepEqual(encipher(recovered[i], originalSourcePages[i].indices[0],
      x => pow29(x, exp)), originalSourcePages[i].indices);
  }
  // Free per-page initial plaintext symbols make a pooled index-sensitive
  // letter histogram arbitrary, so report the true within-page IoC.
  let collisions = 0, pairs = 0;
  for (const a of recovered) {
    const counts = Array(29).fill(0);
    for (const x of a) counts[x]++;
    collisions += counts.reduce((s, n) => s + n * (n - 1), 0);
    pairs += a.length * (a.length - 1);
  }
  return {
    origin, exp, inverse, withinPageIoC: collisions / pairs,
    originalReencipheredRunes: recovered.reduce((s, a) => s + a.length, 0),
    p0Prefix: recovered[0].slice(0, 24).map(x => gp.translit[x]).join('')
  };
});

const out = {
  status: 'bounded negative: no authentic unknown plaintext or key',
  originalWords: original.length, originalRunes: 12956,
  originalWordInternalPairs: 10060,
  originalDeltaHistogram: originalHistogram,
  sourceReferenceWords: sourceWords.length,
  sourceReferenceDeltaPairs: 451853,
  minimumTVSourceReference: sourceTV,
  minOriginalCount: 63, maxOriginalCount: 397,
  exactAllSecretBijectiveAlphabets: '29!',
  sampledMatchedEnglishBooks: trials,
  minMatchedTV, meanMatchedTV: sumMatchedTV / trials, maxMatchedTV,
  minMatchedEnglishMostCommonDelta: minNativePeak,
  minMatchedEnglishEqualDelta: minNativeZero,
  sampledNativePositiveRuneRecovery: 12956,
  fieldPowerDirectOriginalInversions: powers,
  interpretation: 'stationary h(plaintext-difference), source-native GP English and printed word boundaries only'
};
console.log(JSON.stringify(out, null, 2));
console.log('PASS: original source all-secret delta permutation gate and complete native control');
