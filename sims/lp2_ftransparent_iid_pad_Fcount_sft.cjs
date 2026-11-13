'use strict';

/**
 * Source-conditional rejection of a uniformly independent GP29 additive pad
 * combined with historical plaintext-F transparency on all unknown LP2.
 *
 * If plaintext F is emitted literally without consuming key and each other
 * plaintext symbol consumes an independent uniform GP29 shift, then
 * C_F = P_F + Binomial(N-P_F,1/29), not C_F = P_F.
 *
 * This is an exact conditional probability under a declared model, NOT an
 * exclusion of all F-transparent ciphers and not a decryption.
 *
 * Run: node sims/lp2_ftransparent_iid_pad_Fcount_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
const N = original.length;
const cipherFs = original.filter(rune => rune === 0).length;
assert.equal(N, 12956);
assert.equal(cipherFs, 458);

/**
 * Count native plaintext Fs in every contiguous N-rune window; no fitting.
 * @param {number[]} source
 * @param {number} length
 */
function minima(source, length) {
  let count = 0, minimum = Infinity, windows = 0;
  for (let index = 0; index < source.length; index++) {
    if (source[index] === 0) count++;
    if (index >= length && source[index - length] === 0) count--;
    if (index >= length - 1) {
      minimum = Math.min(minimum, count);
      windows++;
    }
  }
  return { minimum, windows };
}
const controls = [];
for (const [name, sourceFile, expectedLength, expectedMinimum] of [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 217106, 203],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 62492, 255],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 321327, 294]
]) {
  const text = encodeSourceNativeGP(read(sourceFile));
  assert.equal(text.length, expectedLength);
  const lower = minima(text, N);
  assert.equal(lower.minimum, expectedMinimum);
  controls.push({ name, nativeRunes: text.length, ...lower });
}
assert.equal(controls.reduce((sum, item) => sum + item.windows, 0), 562060);
const minimumFs = Math.min(...controls.map(item => item.minimum));
assert.equal(minimumFs, 203);

/**
 * Binomial Pr(X<=atMost) for this precisely bounded case, using the stable
 * initial P(X=0) term and the exact recurrence. Here exp(-447)>1e-194,
 * so no term underflows a JavaScript double over the specified range.
 * @param {number} trials
 * @param {number} probability
 * @param {number} atMost
 * @returns {number}
 */
function binomialCDF(trials, probability, atMost) {
  assert.ok(Number.isInteger(trials) && trials > 0);
  assert.ok(probability > 0 && probability < 1);
  assert.ok(Number.isInteger(atMost) && atMost >= 0 && atMost < trials);
  let probabilityTerm = Math.exp(trials * Math.log1p(-probability));
  let sum = probabilityTerm;
  for (let i = 1; i <= atMost; i++) {
    probabilityTerm *= ((trials - i + 1) / i) *
      (probability / (1 - probability));
    sum += probabilityTerm;
  }
  return sum;
}

const p = 1 / 29;
const ordinaryRunes = N - minimumFs;
const allowedRandomFs = cipherFs - minimumFs;
const tail = binomialCDF(ordinaryRunes, p, allowedRandomFs);
const expectedFs = minimumFs + ordinaryRunes * p;
const sdFs = Math.sqrt(ordinaryRunes * p * (1 - p));
assert.ok(Math.abs(tail - 1.9051853961566012e-22) / tail < 1e-10);
assert.ok(Math.abs(expectedFs - 642.7586206896551) < 1e-10);
const totalWindows = controls.reduce((sum, item) => sum + item.windows, 0);
const unionBound = totalWindows * tail;
assert.ok(unionBound < 1.1e-16);

// Authentic solved LP2 p56 has one plain F and five cipher Fs.
// Its 85-symbol count is a plausible small-sample IID-key outcome,
// showing why the full-book native-English source constraint matters.
const p56 = corpus.pages.find(page => page.page === 56).indices;
assert.equal(p56.length, 85);
assert.deepEqual(p56.flatMap((v, i) => v === 0 ? [i] : []),
  [35, 47, 51, 56, 74]);
const p56PlainFs = 1;
const p56CdfFourOrFewerExtra = binomialCDF(84, p, 3);
const p56AtLeastFiveTotal = 1 - p56CdfFourOrFewerExtra;
assert.ok(Math.abs(p56AtLeastFiveTotal - 0.3291720829295204) < 1e-12);

console.log(JSON.stringify({
  hypothesis: 'Independently uniformly random modulo29 additive pad on ordinary non-F symbols, literal plaintext-F bypass',
  originalUnknown: { n: N, cipherFs },
  nativeControls: controls,
  strongestAcrossAllControls: {
    minimumPlainFs: minimumFs,
    ordinaryEncryptedSymbols: ordinaryRunes,
    expectedCipherFs: expectedFs,
    standardDeviation: sdFs,
    observedCipherFs: cipherFs,
    exactOneSidedProbabilityAtMostObserved: tail,
    windows: totalWindows,
    unionBoundAllWindows: unionBound
  },
  authenticShortP56Comparison: {
    cipherFs: 5, plainFs: p56PlainFs,
    probabilityFiveOrMoreCipherFsUnderSameIIDModel: p56AtLeastFiveTotal
  },
  decision: 'This iid-uniform-key-with-F-bypass model is strongly disfavoured for any complete plaintext window from the three pinned native-GP English sources. Arbitrary dependent/nonuniform keys and English from outside these sources are not excluded. No unknown plaintext or key recovered.'
}, null, 2));
