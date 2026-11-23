'use strict';

/**
 * Original-input SFT for a complete, unknown-seed GP29 plaintext-autokey family.
 *
 * Model (0-based rune clock, one shared 13-rune lag per intact section):
 *   C[i] = P[i] + P[i-13] (mod 29), i >= 13.
 * First 13 ciphertext symbols can be encrypted with any arbitrary secret header.
 * For each residue r modulo 13 and step parity, all unknown-header choices
 * translate the candidate plaintext symbols by the same additive constant.
 * Their within-stratum collision counts are therefore EXACTLY key-invariant.
 *
 * Original LP2 corpus is used verbatim, with page carry words left intact.
 * Controls are original, visibly plaintext LP1 GP runes and solved LP2 p57.
 * No source content is modified or written by this script.
 *
 * Run from the repository: node sims/lp2_plaintext_autokey_k13_allsecret_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const lp1 = fs.readFileSync(
  path.join(root, 'resources', 'transcriptions', 'lp1_wulfic_canonical.txt'),
  'utf8'
);
const M = 29;
const lag = 13;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % M) + M) % M;
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} hypotheticalHeaderPlain
 * @returns {number[]}
 */
function decrypt(ciphertext, hypotheticalHeaderPlain) {
  const out = ciphertext.slice(0, lag).map((_, i) => hypotheticalHeaderPlain[i]);
  for (let i = lag; i < ciphertext.length; i += 1) {
    out[i] = mod(ciphertext[i] - out[i - lag]);
  }
  return out;
}

/**
 * @param {number[]} plaintext
 * @param {number[]} secretHeader
 * @returns {number[]}
 */
function encrypt(plaintext, secretHeader) {
  return plaintext.map((p, i) => (i < lag
    ? mod(p + secretHeader[i])
    : mod(p + plaintext[i - lag])));
}

/**
 * Count within-cell equal-value pairs at positions i >= lag, grouped by
 * (i mod lag, floor(i/lag) mod 2). The cells' values can all be translated
 * independently without changing this statistic.
 *
 * @param {number[]} sequence
 * @returns {{ collisions: number, pairs: number, ioc: number }}
 */
function parityCollision(sequence) {
  const buckets = Array.from({ length: lag * 2 }, () => Array(M).fill(0));
  const sizes = Array(lag * 2).fill(0);
  for (let i = lag; i < sequence.length; i += 1) {
    const cell = 2 * (i % lag) + (Math.floor(i / lag) % 2);
    buckets[cell][sequence[i]] += 1;
    sizes[cell] += 1;
  }
  let collisions = 0;
  let pairs = 0;
  for (let cell = 0; cell < buckets.length; cell += 1) {
    collisions += buckets[cell].reduce((a, n) => a + n * (n - 1), 0);
    pairs += sizes[cell] * (sizes[cell] - 1);
  }
  return { collisions, pairs, ioc: collisions / pairs };
}

/** @param {number[]} ciphertext */
function seedFreeStatistic(ciphertext) {
  return parityCollision(decrypt(ciphertext, Array(lag).fill(0)));
}

/** @param {number} lower @param {number} upper @returns {number[]} */
function originals(lower, upper) {
  const pages = corpus.pages.filter((p) => p.page >= lower && p.page <= upper);
  return pages.flatMap((p) => p.indices);
}

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const lp1Segments = lp1.split('%');
const nativeGP = [3, 8, 9, 10, 11, 12, 14]
  .flatMap((section) => Array.from(lp1Segments[section])
    .filter((ch) => runeIndex.has(ch))
    .map((ch) => runeIndex.get(ch)))
  .concat(originals(57, 57));

assert.equal(nativeGP.length, 1322, 'Unexpected native-GP control length');
const opening = originals(0, 2);
const independent = originals(16, 21);
assert.equal(opening.length, 729, 'Unexpected p0–p2 length');
assert.equal(independent.length, 1613, 'Unexpected p16–p21 length');

const actualCases = [
  { name: 'original p0–p2', cipher: opening, native: nativeGP.slice(0, 729) },
  { name: 'original p16–p21 prefix', cipher: independent.slice(0, 1322), native: nativeGP },
  { name: 'original p16–p21 full', cipher: independent, native: null }
];
const sourceHeader = Array.from({ length: lag }, (_, i) => (11 + 7 * i) % M);

console.log('GP29 unknown-header plaintext autokey, lag=13');
console.log('Invariant: collisions within (position mod 13, 13-step parity) cells, omitting header.');
console.log('Original 13-rune red heading is a candidate lag cue, not a proved key or opcode.');
for (const sample of actualCases) {
  const actual = seedFreeStatistic(sample.cipher);
  const line = [
    sample.name,
    'runes=' + sample.cipher.length,
    'original=' + actual.collisions + '/' + actual.pairs,
    'IoC=' + actual.ioc.toFixed(12)
  ];
  if (sample.native) {
    const encryptedPlant = encrypt(sample.native, sourceHeader);
    const recovered = decrypt(encryptedPlant, sample.native.slice(0, lag));
    assert.deepEqual(recovered, sample.native, 'Positive plaintext-autokey decrypt failed');
    assert.deepEqual(encrypt(recovered, sourceHeader), encryptedPlant, 'Exact reencryption failed');
    const plant = seedFreeStatistic(encryptedPlant);
    const sourceDirect = parityCollision(sample.native);
    assert.deepEqual(plant, sourceDirect, 'Positive control invariant differs from native plaintext');
    assert.ok(plant.ioc > actual.ioc + 0.01, 'Original unexpectedly matches native IoC');
    line.push('authentic-GP-plant=' + plant.collisions + '/' + plant.pairs);
    line.push('plant-IoC=' + plant.ioc.toFixed(12));
  }

  // Verify key-invariance explicitly for thirty differently chosen plaintext headers.
  for (let g = 0; g < 30; g += 1) {
    const arbitrary = Array.from({ length: lag }, (_, i) => (i * 3 + g) % M);
    const trial = parityCollision(decrypt(sample.cipher, arbitrary));
    assert.deepEqual(trial, actual, 'Header-independent collision theorem failed');
  }
  console.log(line.join(' | '));
}
console.log('PASS: original-input samples, 30 alternate seeds, authentic native-GP plants and reencryption.');
