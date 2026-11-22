#!/usr/bin/env node
'use strict';

/**
 * Exhaustive all-secret GP29 Gromark/Fibonacci-primer diagnostic.
 * Run from the repository: node sims/lp2_gromark_fib5_allsecret_original_sft.cjs
 * A digit primer of length five develops as k[i]=(k[i-5]+k[i-4]) mod 10.
 * This statistic is invariant under every fixed secret 29-symbol permutation
 * in C[i]=M((P[i]+k[i]) mod 29). It also grants one secret permutation PER
 * digit class, a larger cipher family than ordinary Gromark.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ciphertext = Uint8Array.from(
  source.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices)
);
const N = ciphertext.length;
assert.equal(N, 12956);
assert(ciphertext.every((x) => x < 29));

const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latin = Uint8Array.from(
  read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/)
    .filter((line) => /^[0-9A-S]+$/.test(line))
    .join('')
    .slice(0, N),
  (glyph) => latinAlphabet.indexOf(glyph)
);
assert.equal(latin.length, N);
assert(latin.every((x) => x < 29));

/** @param {number} seed @param {number} multiplier @returns {number} */
function rescalePrimer(seed, multiplier) {
  let value = seed;
  let mapped = 0;
  let place = 10000;
  for (let i = 0; i < 5; i++) {
    const digit = Math.floor(value / place);
    value -= digit * place;
    mapped = mapped * 10 + (digit * multiplier) % 10;
    place /= 10;
  }
  return mapped;
}

// Units of Z/10Z act on every Fibonacci digit stream by a global relabeling.
// Thus all four primers in each ordinary orbit have IDENTICAL statistics.
// Special all-(0,5) primers are singleton orbits.
const units = [1, 3, 7, 9];
const representatives = [];
let singletonOrbits = 0;
for (let primer = 0; primer < 100000; primer++) {
  const orbit = units.map((unit) => rescalePrimer(primer, unit));
  if (primer === Math.min(...orbit)) {
    representatives.push(primer);
    if (new Set(orbit).size === 1) singletonOrbits++;
  }
}
assert.equal(representatives.length, 25024);
assert.equal(singletonOrbits, 32);
assert.equal(32 + 24992 * 4, 100000);

/** @param {number} primer @param {Uint8Array} key */
function develop(primer, key) {
  let value = primer;
  for (let i = 4; i >= 0; i--) {
    key[i] = value % 10;
    value = Math.floor(value / 10);
  }
  for (let i = 5; i < key.length; i++) {
    key[i] = (key[i - 5] + key[i - 4]) % 10;
  }
}

/**
 * Collision probability grouped by actual key digit.
 * Secret GP29 substitutions merely permute each class's histogram.
 * @param {Uint8Array} input
 * @param {Uint8Array} key
 * @param {Uint16Array} bins
 * @param {Uint16Array} sizes
 * @returns {{rate:number,hits:number,pairs:number}}
 */
function coincidence(input, key, bins, sizes) {
  bins.fill(0);
  sizes.fill(0);
  for (let i = 0; i < input.length; i++) {
    const digit = key[i];
    bins[digit * 29 + input[i]]++;
    sizes[digit]++;
  }
  let twiceHits = 0;
  let twicePairs = 0;
  for (let i = 0; i < bins.length; i++) {
    twiceHits += bins[i] * (bins[i] - 1);
  }
  for (let i = 0; i < sizes.length; i++) {
    twicePairs += sizes[i] * (sizes[i] - 1);
  }
  return { rate: twiceHits / twicePairs, hits: twiceHits / 2, pairs: twicePairs / 2 };
}

/** @param {Uint8Array} input */
function sweep(input) {
  const key = new Uint8Array(input.length);
  const bins = new Uint16Array(290);
  const sizes = new Uint16Array(10);
  let min = { primer: -1, rate: Infinity };
  let max = { primer: -1, rate: -Infinity };
  let sum = 0;
  for (const primer of representatives) {
    develop(primer, key);
    const measured = coincidence(input, key, bins, sizes);
    sum += measured.rate;
    if (measured.rate < min.rate) min = { primer, ...measured };
    if (measured.rate > max.rate) max = { primer, ...measured };
  }
  return { min, max, meanOverOrbits: sum / representatives.length };
}
const original = sweep(ciphertext);
const control = sweep(latin);

// The illustrated manuscript defines nine independent sections. Allow a separate
// unknown five-digit seed at each original section boundary, which is a strictly
// larger set of possible ciphers than one primer shared across the whole book.
// For each chapter enumerate all 100,000 primers independently by the same
// exact orbit reduction; no exhaustive 100000^9 joint search is needed because
// the necessary collision invariant factors by independently reset chapter.
const chapterPageRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
let referenceOffset = 0;
const chapters = chapterPageRanges.map(([firstPage, lastPage]) => {
  const originalSegment = Uint8Array.from(
    source.pages.filter((p) => p.page >= firstPage && p.page <= lastPage)
      .flatMap((p) => p.indices)
  );
  const nativeSegment = latin.subarray(referenceOffset, referenceOffset + originalSegment.length);
  assert.equal(nativeSegment.length, originalSegment.length);
  referenceOffset += originalSegment.length;
  const originalResult = sweep(originalSegment);
  const nativeResult = sweep(nativeSegment);
  return {
    pages: [firstPage, lastPage],
    runes: originalSegment.length,
    originalMaximum: originalResult.max,
    nativeMinimum: nativeResult.min,
    originalBelowEveryNativePrimer: originalResult.max.rate < nativeResult.min.rate
  };
});
assert.equal(referenceOffset, N);
assert.deepEqual(chapters.map((p) => p.runes), [
  729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308
]);
assert(chapters.every((p) => p.originalBelowEveryNativePrimer));
const expectedChapterMax = [
  [11662, 0.03978899773926149],
  [26374, 0.0374366445112143],
  [14500, 0.03645945857474876],
  [10153, 0.036424768842813114],
  [26502, 0.03751031293770026],
  [2201, 0.03622645912127016],
  [1711, 0.03638693780446358],
  [51909, 0.03556660005363647],
  [22659, 0.04638297872340426]
];
const expectedChapterNativeMin = [
  [11403, 0.07033766627505969],
  [21494, 0.07016260534296469],
  [11465, 0.07306519684200716],
  [21565, 0.07464096280131038],
  [22450, 0.07048204340311119],
  [14620, 0.07314019507934197],
  [52352, 0.0748516775777414],
  [27003, 0.07324887613954474],
  [16180, 0.06425110596165999]
];
for (let i = 0; i < chapters.length; i++) {
  assert.equal(chapters[i].originalMaximum.primer, expectedChapterMax[i][0]);
  assert(Math.abs(chapters[i].originalMaximum.rate - expectedChapterMax[i][1]) < 1e-14);
  assert.equal(chapters[i].nativeMinimum.primer, expectedChapterNativeMin[i][0]);
  assert(Math.abs(chapters[i].nativeMinimum.rate - expectedChapterNativeMin[i][1]) < 1e-14);
}

// These are independently repeatable original-input values, not fitted keys.
assert.equal(original.max.primer, 16019);
assert.equal(original.max.hits, 298487);
assert.equal(original.max.pairs, 8592315);
assert(Math.abs(original.max.rate - 0.03473883348084888) < 1e-14);
assert.equal(original.min.primer, 15312);
assert(Math.abs(original.min.rate - 0.03426556912129264) < 1e-14);
assert.equal(control.min.primer, 23545);
assert.equal(control.min.hits, 691201);
assert.equal(control.min.pairs, 9353474);
assert(Math.abs(control.min.rate - 0.07389778386084143) < 1e-14);
assert.equal(control.max.primer, 16990);
assert(Math.abs(control.max.rate - 0.0752216258513073) < 1e-14);
assert(original.max.rate < control.min.rate);

// Source-native positive: a complete GP29 Gromark stream with a secret
// affine permutation M(x)=7x+3 and the true primer, decoded and reencrypted.
const primer = 16019;
const key = new Uint8Array(N);
develop(primer, key);
const forwardMap = Array.from({ length: 29 }, (_, i) => (7 * i + 3) % 29);
const inverseMap = Array.from({ length: 29 });
for (let i = 0; i < 29; i++) inverseMap[forwardMap[i]] = i;
const planted = Uint8Array.from(latin, (p, i) => forwardMap[(p + key[i]) % 29]);
const recovered = Uint8Array.from(planted, (c, i) =>
  (inverseMap[c] - key[i] + 29) % 29
);
assert.deepEqual(recovered, latin);
const reencrypted = Uint8Array.from(recovered, (p, i) =>
  forwardMap[(p + key[i]) % 29]
);
assert.deepEqual(reencrypted, planted);
const bins = new Uint16Array(290);
const sizes = new Uint16Array(10);
assert.deepEqual(
  coincidence(planted, key, bins, sizes),
  coincidence(latin, key, bins, sizes)
);

console.log(JSON.stringify({
  status: 'PASS',
  originalRunes: N,
  fiveDigitPrimers: 100000,
  primerOrbits: representatives.length,
  orbitSizes: { singletons: singletonOrbits, quadruples: 24992 },
  testFamily: 'global GP29 Fibonacci five-digit primer; arbitrary fixed or per-digit-class secret alphabets',
  original,
  nativeLatinControl: control,
  independentlyResetChapters: chapters,
  positiveNativePlant: { primer, recovered: recovered.length, exactReencryption: true },
  conclusion: 'No stationary five-digit Fibonacci/Gromark family candidate makes the original ciphertext GP29-English/Latin-like under this exact all-secret invariant.'
}, null, 2));
