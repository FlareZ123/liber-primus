'use strict';

/**
 * Agent 27, Director #2218: original source-motif lag-13/lag-31 decoder.
 *
 * Both repeated floral five-dot ornaments give source-visible numerals 13
 * and 31. This SFT treats them specifically as ciphertext-feedback LAGS.
 * Compare one continuous state across p40..53 with state resets per page.
 * Exhaust a,b in GF(29) and additionally grant free constant shifts and
 * arbitrary static secret alphabets (IoC invariance). No fitted cipher key
 * or authentic plaintext is inferred from a coincidental top score.
 *
 * Windows 11 / Node.js 22: node sims/lp2_floral_lag13_lag31_two_tap_allsecret_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const allPages = gp.pages.slice(40, 54);
const pages = allPages.filter((p) => p.indices.length);
const pageLengths = pages.map((p) => p.indices.length);
const original = pages.flatMap((p) => p.indices);
assert.equal(allPages.length, 14);
assert.equal(pages.length, 13);
assert.deepEqual(pageLengths,
  [231, 273, 272, 274, 273, 270, 270, 274, 271, 66, 92, 263, 179]);
assert.equal(allPages.find((p) => p.page === 50).indices.length, 0);
assert.equal(original.length, 3008);
/** @param {number} x @returns {number} */
const mod = (x) => (x % 29 + 29) % 29;
/** @param {number[]} items @returns {number} */
function pairs(items) {
  const h = new Uint32Array(29);
  for (const value of items) h[value]++;
  let n = 0;
  for (const value of h) n += value * (value - 1);
  return n;
}
/** @param {number[]} items @returns {number} */
const ioc = (items) => pairs(items) / (items.length * (items.length - 1));

/**
 * Stateless on the actual original C once initialized: both taps are
 * PREVIOUS CIPHERTEXT, not previous plaintext. The 31 initial source
 * runes per state clock are unrestricted IVs.
 * @param {number[]} data
 * @param {number} a
 * @param {number} b
 * @param {boolean} resetPages
 * @returns {number[]}
 */
function decrypt(data, a, b, resetPages) {
  const out = data.slice();
  if (resetPages) {
    let offset = 0;
    for (const length of pageLengths) {
      for (let j = 31; j < length; j++) {
        const i = offset + j;
        out[i] = mod(data[i] - a * data[i - 13] - b * data[i - 31]);
      }
      offset += length;
    }
  } else {
    for (let i = 31; i < data.length; i++)
      out[i] = mod(data[i] - a * data[i - 13] - b * data[i - 31]);
  }
  return out;
}
/**
 * Exact feedback forward encoder, for real source-native plants.
 * @param {number[]} plain
 * @param {number} a
 * @param {number} b
 * @param {boolean} resetPages
 * @returns {number[]}
 */
function encrypt(plain, a, b, resetPages) {
  const out = plain.slice();
  if (resetPages) {
    let offset = 0;
    for (const length of pageLengths) {
      for (let j = 31; j < length; j++) {
        const i = offset + j;
        out[i] = mod(plain[i] + a * out[i - 13] + b * out[i - 31]);
      }
      offset += length;
    }
  } else {
    for (let i = 31; i < out.length; i++)
      out[i] = mod(plain[i] + a * out[i - 13] + b * out[i - 31]);
  }
  return out;
}
/** @param {number[]} data @returns {number[]} */
function continuousEligible(data) { return data.slice(31); }
/** @param {number[]} data @returns {number[][]} */
function pageEligible(data) {
  let at = 0;
  return pageLengths.map((n) => {
    const out = data.slice(at + 31, at + n);
    at += n;
    return out;
  });
}
/** @param {number[][]} parts @returns {{numerator: number, denominator: number, rate: number}} */
function pooledWithin(parts) {
  let numerator = 0, denominator = 0;
  for (const part of parts) {
    numerator += pairs(part);
    denominator += part.length * (part.length - 1);
  }
  return {numerator, denominator, rate: numerator / denominator};
}
let bestFull = {a: -1, b: -1, numerator: -1};
let bestOpening = {a: -1, b: -1, numerator: -1};
const pageMax = pageLengths.map(() => ({numerator: -1, a: -1, b: -1}));
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const decoded = decrypt(original, a, b, false);
    const wholeNumerator = pairs(continuousEligible(decoded));
    if (wholeNumerator > bestFull.numerator)
      bestFull = {a, b, numerator: wholeNumerator};
    const opening = decoded.slice(31, pageLengths[0]);
    const firstNumerator = pairs(opening);
    if (firstNumerator > bestOpening.numerator)
      bestOpening = {a, b, numerator: firstNumerator};
    const decodedPages = pageEligible(decrypt(original, a, b, true));
    for (let p = 0; p < pageLengths.length; p++) {
      const numerator = pairs(decodedPages[p]);
      if (numerator > pageMax[p].numerator)
        pageMax[p] = {a, b, numerator};
    }
  }
}
const totalEligible = original.length - 31;
const totalPageEligible = original.length - 31 * pages.length;
assert.equal(totalEligible, 2977);
assert.equal(totalPageEligible, 2605);
assert.deepEqual(bestFull, {a: 1, b: 5, numerator: 308188});
assert.deepEqual(bestOpening, {a: 14, b: 6, numerator: 1554});
const globalDen = totalEligible * (totalEligible - 1);
const pageDen = pageLengths.reduce((v, n) => v + (n - 31) * (n - 32), 0);
const pageNumerator = pageMax.reduce((v, p) => v + p.numerator, 0);
assert.equal(globalDen, 8859552);
assert.equal(pageDen, 583218);
assert.equal(pageNumerator, 22858);
const trained = decrypt(original, bestOpening.a, bestOpening.b, false);
const holdouts = [
  {name: 'p45-46 untouched middle', values: trained.slice(1323, 1863)},
  {name: 'p52-53 untouched late', values: trained.slice(2566, 3008)}
];
// The full-index trained array contains 31 unrestricted original IV runes,
// but these two holdouts start hundreds of symbols later.
assert.deepEqual(holdouts.map((h) => h.values.length), [540, 442]);
const direct = continuousEligible(decrypt(original, 1, 1, false));
const motifCoefficients = continuousEligible(decrypt(original, 13, 2, false));
assert(Math.abs(ioc(direct) - 0.034313021696808145) < 1e-12);
assert(Math.abs(ioc(motifCoefficients) - 0.03456788785708352) < 1e-12);

// Independently attested source-native English, with the exact GP-native
// orthography from original solved LP1: ING->21, IO->27, QU->CW, V->U.
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function native(text) {
  const clean = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  /** @type {number[]} */
  const result = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) { result.push(21); i += 3; }
      else if (word.startsWith('IO', i)) { result.push(27); i += 2; }
      else {
        const token = tokens.find((item) => word.startsWith(item.s, i));
        assert(token, 'native GP source mapping: ' + word);
        result.push(token.i);
        i += token.s.length;
      }
    }
  }
  return result;
}
const refs = [
  {name: 'Gibran', file: 'resources/control/gibran_prophet_58585.txt',
    expectedLen: 62492, expectedWindows: 20,
    minContinuous: 0.05869190676910074, minPage: 0.0590379583620533},
  {name: 'Shakespeare', file: 'resources/control/shakespeare_first300k.txt',
    expectedLen: 217106, expectedWindows: 72,
    minContinuous: 0.05647418740812177, minPage: 0.05662719600561025},
  {name: 'Emerson', file: 'resources/control/emerson_essays_2944.txt',
    expectedLen: 321327, expectedWindows: 106,
    minContinuous: 0.05909305572110193, minPage: 0.05816007050536849}
];
const nativeControls = refs.map((ref) => {
  const source = native(read(ref.file));
  assert.equal(source.length, ref.expectedLen);
  let minContinuous = Infinity, minPage = Infinity, windows = 0;
  for (let i = 0; i + original.length <= source.length; i += original.length) {
    const window = source.slice(i, i + original.length);
    minContinuous = Math.min(minContinuous, ioc(continuousEligible(window)));
    minPage = Math.min(minPage, pooledWithin(pageEligible(window)).rate);
    windows++;
  }
  assert.equal(windows, ref.expectedWindows);
  assert(Math.abs(minContinuous - ref.minContinuous) < 1e-12);
  assert(Math.abs(minPage - ref.minPage) < 1e-12);
  return {name: ref.name, nonoverlappingWindows: windows,
    minimumNativeContinuousIoC: minContinuous,
    minimumNativePageIoC: minPage};
});
const bestContinuousIoC = bestFull.numerator / globalDen;
const bestPageOracleIoC = pageNumerator / pageDen;
assert(nativeControls.every((x) => x.minimumNativeContinuousIoC > bestContinuousIoC));
assert(nativeControls.every((x) => x.minimumNativePageIoC > bestPageOracleIoC));

// Source-native 95-rune p57 planted as a full chapter; a second plant
// exercises every GP29 value. Exact independent forward/inverse both ways.
const solved = gp.pages[57].indices;
assert.equal(solved.length, 95);
for (const plaintext of [
  Array.from({length: original.length}, (_, i) => solved[i % solved.length]),
  Array.from({length: original.length}, (_, i) => i % 29)
]) for (const resetPages of [false, true]) {
  for (const [a, b] of [[13, 2], [14, 6]]) {
    assert.deepEqual(decrypt(encrypt(plaintext, a, b, resetPages),
      a, b, resetPages), plaintext);
    assert.deepEqual(encrypt(decrypt(original, a, b, resetPages),
      a, b, resetPages), original);
  }
}
console.log(JSON.stringify({
  source: 'physical p40..53 original GP29, floral binary 13 and 31 as literal lag taps',
  modes: {
    continuous: {originalRunes: 3008, eligible: totalEligible,
      sourceSelectedCoefficients: [1, 1], directIoC: ioc(direct),
      motifCoefficients: [13, 2], motifCoefficientIoC: ioc(motifCoefficients),
      allSecretBest: bestFull, allSecretBestIoC: bestContinuousIoC},
    resetEachPhysicalPage: {pageClocks: pages.length,
      eligible: totalPageEligible,
      independentlyOptimalCoefficientsForEachPage: pageMax,
      evenPageAllSecretIoC: bestPageOracleIoC},
    openingOnlySelection: {best: bestOpening,
      trainIoC: bestOpening.numerator / (200 * 199),
      untouchedMiddleIoC: ioc(holdouts[0].values),
      untouchedLateIoC: ioc(holdouts[1].values)}
  },
  controls: nativeControls,
  sourceNativePositivePlants: '8/8 per two architectures, two coefficient pairs, and two plaintext registers',
  result: 'Neither common continuous nor independent page-local lag-13/31 affine ciphertext-feedback recovers source-native English'
}, null, 2));
