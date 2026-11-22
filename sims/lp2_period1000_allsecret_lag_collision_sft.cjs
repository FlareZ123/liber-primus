'use strict';

/**
 * Original LP2 all-secret 1..1000-period GP29 substitution bound.
 * Windows Node.js 22 single-file test; no third-party dependencies or writes.
 * Reproduction: node sims/lp2_period1000_allsecret_lag_collision_sft.cjs
 *
 * If, independently in each visible chapter, C[i] = pi_(i mod m)(P[i])
 * for fixed bijections pi_0..pi_(m-1), then C[i] === C[i+m] is equivalent
 * to P[i] === P[i+m] wherever both positions are in the same chapter.
 * This covers every secret periodic additive, affine and general substitution
 * alphabet without recovering any of its secret keys. It does not cover
 * feedback, phase resets inside chapters, moving runes, or unknown language.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(original.length, 12956);
const boundaries = [[0, 2], [3, 7], [8, 14], [15, 22],
  [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const lengths = boundaries.map(([start, end]) => corpus.pages
  .filter(p => start <= p.page && p.page <= end)
  .reduce((sum, p) => sum + p.indices.length, 0));
assert.deepEqual(lengths, [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/**
 * This is the published source-native GP29 encoder, with source-authentic
 * ING and IO interpretations calibrated from independently solved LP1.
 * Normalize separately within each original English word.
 * @param {string} text @returns {number[]}
 */
function nativeGP(text) {
  const clean = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        out.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        out.push(27);
        i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert.ok(token, 'all GP source word segments must encode');
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}

const parable = 'PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE';
assert.deepEqual(nativeGP(parable), corpus.pages[57].indices,
  'complete source-authentic 95/95 original p57 GP plaintext positive');

/**
 * Return equal-symbol pairs at lag m entirely inside each source-visible
 * nine-chapter interval. With the same chapter boundaries on source/control,
 * available counts are identical independent of language.
 * @param {number[]} seq @param {number} m
 * @returns {{n:number,hits:number,rate:number}}
 */
function lag(seq, m) {
  let hits = 0;
  let n = 0;
  let offset = 0;
  for (const length of lengths) {
    for (let i = 0; i + m < length; i++) {
      if (seq[offset + i] === seq[offset + i + m]) hits++;
      n++;
    }
    offset += length;
  }
  assert.equal(offset, original.length);
  return { n, hits, rate: hits / n };
}
const referencePaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/gibran_prophet_58585.txt'
];
const controls = referencePaths.flatMap(sourcePath => {
  const gp = nativeGP(read(sourcePath));
  assert.ok(gp.length > 3 * original.length);
  return [0, Math.floor((gp.length - original.length) / 2),
    gp.length - original.length].map((start, idx) => ({
    sourcePath, window: idx, values: gp.slice(start, start + original.length)
  }));
});
assert.equal(controls.length, 9);

const selected = new Set([1, 2, 3, 4, 5, 13, 29, 35, 76,
  133, 331, 464, 717, 761, 1000]);
const examples = [];
let belowEveryControl = 0;
let maximalOriginalZ = -Infinity;
let maximalOriginalLag = null;
for (let m = 1; m <= 1000; m++) {
  const observed = lag(original, m);
  const natural = controls.map(w => lag(w.values, m));
  assert.ok(natural.every(x => x.n === observed.n));
  const minimum = Math.min(...natural.map(x => x.rate));
  const maximum = Math.max(...natural.map(x => x.rate));
  if (observed.rate < minimum) belowEveryControl++;
  const z = (observed.hits - observed.n / 29) /
    Math.sqrt(observed.n * 28 / (29 * 29));
  if (z > maximalOriginalZ) {
    maximalOriginalZ = z;
    maximalOriginalLag = m;
  }
  if (selected.has(m)) examples.push({
    period: m,
    pairCount: observed.n,
    originalHits: observed.hits,
    originalRate: Number(observed.rate.toFixed(9)),
    smallestGPControlRate: Number(minimum.toFixed(9)),
    largestGPControlRate: Number(maximum.toFixed(9)),
    zFromUniform: Number(z.toFixed(5))
  });
}
assert.equal(belowEveryControl, 1000);
assert.equal(maximalOriginalLag, 717);
assert.ok(Math.abs(maximalOriginalZ - 3.53694830424171) < 1e-8);
assert.equal(examples.find(x => x.period === 1).originalHits, 86);
assert.equal(examples.find(x => x.period === 717).originalHits, 292);
assert.equal(examples.find(x => x.period === 13).originalHits, 443);

// Synthetic positive: arbitrary distinct periodic additive alphabets in each
// chapter. The secret can change wholly at each visible chapter boundary.
// Equal-lag scores are *exactly* preserved for each tested period.
function plantGP(source, period) {
  const planted = [];
  let offset = 0;
  for (let ch = 0; ch < lengths.length; ch++) {
    const length = lengths[ch];
    for (let i = 0; i < length; i++) {
      const secret = (19 * (i % period) + ch * 7 + 13) % 29;
      planted.push((source[offset + i] + secret) % 29);
    }
    offset += length;
  }
  assert.equal(planted.length, source.length);
  return planted;
}
for (const period of [13, 331, 1000]) {
  const reference = controls[0].values;
  const planted = plantGP(reference, period);
  assert.equal(lag(planted, period).hits, lag(reference, period).hits);
  assert.notDeepEqual(planted, reference);
}


/**
 * Stateful sibling: an arbitrary *periodic permutation of the plaintext
 * step*, accumulated into the previous ciphertext rune:
 *
 * C(c,i) = C(c,i-1) + pi(c,i mod m)(P(c,i)) (mod29)
 *
 * Original difference D(c,i) = C(c,i)-C(c,i-1) (mod29), for i>=1,
 * is thus a periodic secret alphabet substitution of P(c,i).
 * The first rune is excluded per chapter. The pi key may change at each
 * illustrated chapter boundary; no true key is specified or fitted.
 * @param {number[]} seq @returns {number[]}
 */
function sourceDifferences(seq) {
  const result = Array(seq.length).fill(0);
  let offset = 0;
  for (const length of lengths) {
    for (let i = 1; i < length; i++) {
      result[offset + i] =
        (seq[offset + i] - seq[offset + i - 1] + 29) % 29;
    }
    offset += length;
  }
  return result;
}
/**
 * Two positions i and i+m must both have real within-chapter
 * ciphertext predecessors. i begins at 1 in every chapter.
 * @param {number[]} seq @param {number} m
 */
function stepLag(seq, m) {
  let hits = 0;
  let n = 0;
  let offset = 0;
  for (const length of lengths) {
    for (let i = 1; i + m < length; i++) {
      if (seq[offset + i] === seq[offset + i + m]) hits++;
      n++;
    }
    offset += length;
  }
  return { n, hits, rate: hits / n };
}
const differenceOriginal = sourceDifferences(original);
const unresolvedStepPeriods = [];
const stepSamples = [];
for (let m = 1; m <= 1000; m++) {
  const observed = stepLag(differenceOriginal, m);
  const controlsAtPeriod = controls.map(w => stepLag(w.values, m));
  assert.ok(controlsAtPeriod.every(x => x.n === observed.n));
  const minimum = Math.min(...controlsAtPeriod.map(x => x.rate));
  if (observed.rate >= minimum) unresolvedStepPeriods.push(m);
  if (selected.has(m)) stepSamples.push({
    period: m,
    comparisons: observed.n,
    sourceHits: observed.hits,
    sourceRate: Number(observed.rate.toFixed(9)),
    minimumNativeGP: Number(minimum.toFixed(9))
  });
}
// Every period >=2 is excluded by its exact difference-at-lag invariant,
// while m=1 needs a different *still key-independent* sufficient statistic.
assert.deepEqual(unresolvedStepPeriods, [1]);
assert.equal(stepSamples.find(x => x.period === 1).sourceHits, 436);
/**
 * A fixed arbitrary 29-rune permutation cannot change a frequency
 * histogram's sorted entries or the coincidence rate within a chapter.
 * The secret may differ between the nine chapters.
 * @param {number[]} seq
 * @returns {{matches:number,pairs:number,rate:number}}
 */
function withinChapterHistogram(seq) {
  let matches = 0;
  let pairs = 0;
  let offset = 0;
  for (const length of lengths) {
    const counts = Array(29).fill(0);
    for (let i = 1; i < length; i++) counts[seq[offset + i]]++;
    const n = length - 1;
    pairs += n * (n - 1) / 2;
    matches += counts.reduce((sum, count) =>
      sum + count * (count - 1) / 2, 0);
    offset += length;
  }
  return { matches, pairs, rate: matches / pairs };
}
const originalStepHistogram = withinChapterHistogram(differenceOriginal);
const referenceStepHistograms = controls.map(w => withinChapterHistogram(w.values));
const minimumStepHistogram = Math.min(...referenceStepHistograms.map(x => x.rate));
assert.equal(originalStepHistogram.matches, 415744);
assert.equal(originalStepHistogram.pairs, 11737862);
assert.ok(Math.abs(originalStepHistogram.rate - 0.035419056724299534) < 1e-12);
assert.ok(Math.abs(minimumStepHistogram - 0.059148846697976175) < 1e-12);
assert.ok(originalStepHistogram.rate < minimumStepHistogram);

/**
 * Check a fully reversible planted ciphertext-feedback chain using
 * independently phase-indexed chapter keys at lengths 1, 13, 331, 1000.
 * @param {number[]} plain @param {number} m @returns {number[]}
 */
function encryptFeedbackPlant(plain, m) {
  const output = [];
  let offset = 0;
  for (let ch = 0; ch < lengths.length; ch++) {
    let predecessor = 0;
    for (let i = 0; i < lengths[ch]; i++) {
      const shift = (7 * ch + 13 + 19 * (i % m)) % 29;
      predecessor = (predecessor + plain[offset + i] + shift) % 29;
      output.push(predecessor);
    }
    offset += lengths[ch];
  }
  return output;
}
for (const m of [1, 13, 331, 1000]) {
  const plain = controls[0].values;
  const cipher = encryptFeedbackPlant(plain, m);
  assert.equal(stepLag(sourceDifferences(cipher), m).hits,
    stepLag(plain, m).hits);
  assert.notDeepEqual(cipher, plain);
}

console.log(JSON.stringify({
  originalRunes: original.length,
  nineChapterLengths: lengths,
  testPeriods: 1000,
  nativeGPControls: controls.map(c => ({
    corpus: c.sourcePath, window: c.window
  })),
  belowEveryNativeControl: belowEveryControl,
  greatestOriginalZ: { period: maximalOriginalLag,
    z: maximalOriginalZ },
  periodSamples: examples,
  authenticCleartextPositive: { page: 57, recoveredRunes: 95 },
  chapterSpecificSecretPlantPeriods: [13, 331, 1000],
  ciphertextFeedback: {
    equalLagRejectedPeriods: 999,
    remainingLagOnlyPeriod: unresolvedStepPeriods,
    periodSamples: stepSamples,
    periodOneHistogram: {
      source: originalStepHistogram,
      smallestNativeGP: minimumStepHistogram
    },
    fullSecretFeedbackPlantPeriods: [1, 13, 331, 1000],
    fullyExcludedPeriods: 1000
  },
  inference: 'Neither stationary phase-substitution nor ciphertext-feedback phase-substitution of period 1..1000 matches any of nine native GP English controls under the original chapter geometry; no unknown plaintext has been recovered.'
}, null, 2));
