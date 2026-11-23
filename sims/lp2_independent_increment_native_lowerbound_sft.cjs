'use strict';

/**
 * Original LP2 GP29 additive-key-increment lower-bound and native-register plants.
 *
 * A plaintext-independent stationary additive key increment V has
 *   C_i - C_(i-1) = (P_i - P_(i-1)) + V_i (mod 29).
 * Therefore Pr(C_i=C_(i-1)) = sum_d p_P(d) * q_V(-d)
 *                              >= min_d p_P(d).
 * This inequality is an EXPECTED-rate restriction under independence, not
 * an all-keys deterministic cipher exclusion: a one-time pad may correlate
 * with an already-fixed word stream by coincidence, and the unknown plaintext
 * may have different transition frequencies. The source-shaped controls test
 * whether the original's suppression is typical for natural GP English.
 *
 * Windows 11, Node.js 22; all inputs read-only; no packages; no files written.
 * Usage: node sims/lp2_independent_increment_native_lowerbound_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const printed = read('resources/liber-primus/lp2-transcription.txt');
const originalPages = corpus.pages.filter(page => page.page <= 55);
const original = originalPages.flatMap(page => page.indices);
assert.equal(original.length, 12956);
assert.equal(corpus.translit.length, 29);

/** @type {Set<number>} Original physical page-start positions. */
const cuts = new Set();
let lengthSoFar = 0;
for (const page of originalPages) {
  if (lengthSoFar) cuts.add(lengthSoFar);
  lengthSoFar += page.indices.length;
}
assert.equal(lengthSoFar, original.length);

/**
 * @param {number[]} runes
 * @returns {number[]} 29 circular adjacent-difference counts, omitting physical page breaks
 */
function differences(runes) {
  const count = Array(29).fill(0);
  assert.equal(runes.length, original.length);
  for (let i = 1; i < runes.length; i++) {
    if (!cuts.has(i)) count[(runes[i] - runes[i - 1] + 29) % 29]++;
  }
  return count;
}
/**
 * Nontrivial Fourier magnitudes of an empirical circular GP29 difference distribution.
 * Independence gives spectrum(C)=spectrum(P)*spectrum(K) and |spectrum(K)| <= 1.
 * @param {number[]} histogram
 * @returns {number[]}
 */
function spectrum(histogram) {
  const total = histogram.reduce((sum, x) => sum + x, 0);
  assert.ok(total > 0);
  return Array.from({length: 14}, (_, k) => {
    let real = 0, imag = 0;
    for (let d = 0; d < 29; d++) {
      const angle = 2 * Math.PI * (k + 1) * d / 29;
      real += histogram[d] * Math.cos(angle);
      imag += histogram[d] * Math.sin(angle);
    }
    return Math.hypot(real, imag) / total;
  });
}
const origCounts = differences(original);
assert.equal(origCounts.reduce((a, b) => a + b, 0), 12901);
assert.equal(origCounts[0], 86);
assert.deepEqual(origCounts, [86,457,503,436,435,445,430,470,425,510,
  497,454,443,499,470,468,446,401,432,472,467,460,420,485,
  466,466,456,472,430]);
const originalSpectrum = spectrum(origCounts);
assert.ok(Math.abs(originalSpectrum[4] - 0.043846016962099) < 1e-12);
/** @param {number[]} sourceSpectrum */
function excludedFourierModes(sourceSpectrum) {
  return sourceSpectrum.flatMap((amplitude, i) =>
    originalSpectrum[i] > amplitude + 1e-12
      ? [{harmonic: i + 1, plainAmplitude: amplitude,
          cipherAmplitude: originalSpectrum[i]}] : []);
}

const runeSet = new Set(corpus.runes);
const slotLengths = [];
let runeCount = 0;
let currentLength = 0;
for (const mark of printed) {
  if (runeSet.has(mark)) {
    currentLength++;
    runeCount++;
    if (runeCount === original.length) {
      slotLengths.push(currentLength);
      break;
    }
  } else if (mark === '-' || mark === '.' || mark === '&') {
    if (currentLength) slotLengths.push(currentLength);
    currentLength = 0;
  }
}
assert.equal(runeCount, 12956);
assert.equal(slotLengths.length, 2896);
assert.equal(slotLengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(Math.max(...slotLengths), 14);

const spellings = [...corpus.translit].sort((a, b) => b.length - a.length);
const gpIndex = new Map(corpus.translit.map((token, i) => [token, i]));
/**
 * Native GP orthography as in prior established LP2 corpus control encoders.
 * @param {string} raw
 * @returns {number[]}
 */
function gpWord(raw) {
  const word = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { out.push(21); i += 3; continue; }
    if (word.startsWith('IO', i)) { out.push(27); i += 2; continue; }
    const token = spellings.find(t => word.startsWith(t, i));
    assert.ok(token, 'Unknown GP orthography ' + raw);
    out.push(gpIndex.get(token));
    i += token.length;
  }
  return out;
}
/**
 * @param {string} sourceText
 * @returns {{buckets:number[][][],nWords:number,nRunes:number,fullSourceDeltas:number[]}}
 */
function donor(sourceText) {
  const sourceWords = sourceText.match(/[A-Za-z]+/g) || [];
  const buckets = Array.from({length: 15}, () => []);
  let nRunes = 0;
  let lastSymbol = null;
  const fullSourceDeltas = Array(29).fill(0);
  for (const w of sourceWords) {
    const g = gpWord(w);
    nRunes += g.length;
    if (g.length <= 14) buckets[g.length].push(g);
    for (const rune of g) {
      if (lastSymbol !== null) fullSourceDeltas[(rune - lastSymbol + 29) % 29]++;
      lastSymbol = rune;
    }
  }
  for (const width of new Set(slotLengths)) assert.ok(buckets[width]?.length,
    'Missing native GP word-length bucket ' + width);
  assert.equal(fullSourceDeltas.reduce((a,b)=>a+b,0),nRunes-1);
  return {buckets, nWords: sourceWords.length, nRunes, fullSourceDeltas};
}

/** Exact conversion of a fixed word stream to stationary-increment pad and back. */
function counterPad(runes, step, decrypt = false) {
  return runes.map((x, i) => ((x + (decrypt ? -step : step) * i) % 29 + 29) % 29);
}
function sourceRunicFirstParty() {
  const source = read('resources/transcriptions/lp1_wulfic_canonical.txt');
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const groups = source.split('%');
  const pages = [];
  for (const index of [3, 8, 9, 10, 11, 14]) {
    const local = groups[index].split('&').map(part => [...part]
      .filter(glyph => runeIndex.has(glyph))
      .map(glyph => runeIndex.get(glyph))).filter(x => x.length);
    pages.push(...local);
  }
  let counts = Array(29).fill(0);
  let nRunes = 0, nPairs = 0;
  for (const page of pages) {
    nRunes += page.length;
    for (let i = 1; i < page.length; i++) {
      nPairs++;
      counts[(page[i] - page[i - 1] + 29) % 29]++;
    }
  }
  assert.deepEqual([pages.length, nRunes, nPairs, counts[0], Math.min(...counts)],
    [10, 1001, 991, 28, 7]);
  return {pages: pages.length, nRunes, nPairs, nativeRepeats: 28,
    minimumPossibleRepeatCountUnderOneCounterStep: 7,
    minimumNativeDifferenceResidue: counts.indexOf(7),
    allKeyFourierIncompatibilities: excludedFourierModes(spectrum(counts))};
}

const counts = [];
const donors = [
  ['Gibran', donor(read('resources/control/gibran_prophet_58585.txt'))],
  ['Shakespeare', donor(read('resources/control/shakespeare_first300k.txt'))]
];
assert.deepEqual(donors.map(([,s]) => [s.nWords,s.nRunes]),
  [[15733,62492],[55407,217106]]);

for (const [name, source] of donors) {
  const minima = [];
  const originalShapedRepeats = [];
  const rarestResidues = [];
  let sourceShapeFourierFailures = 0;
  // This is exactly the source-shaped 128-plant experiment, seeded once
  // per donor and advanced continuously through all 2,896 word slots.
  let state = 0x33011717;
  for (let sample = 0; sample < 128; sample++) {
    const plant = [];
    for (const len of slotLengths) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const pool = source.buckets[len];
      plant.push(...pool[(state >>> 0) % pool.length]);
    }
    assert.equal(plant.length, original.length);
    const histogram = differences(plant);
    const min = Math.min(...histogram);
    minima.push(min);
    originalShapedRepeats.push(histogram[0]);
    rarestResidues.push(histogram.indexOf(min));
    const frequencies = spectrum(histogram);
    if (excludedFourierModes(frequencies).length) sourceShapeFourierFailures++;
    if (sample === 0) {
      // A shift at the *rarest native difference* attains the exact lower
      // count for a single deterministic counter key. It stays visibly
      // nonuniform in the remaining 28 bins, unlike the original.
      const step = (29 - histogram.indexOf(min)) % 29;
      const encrypted = counterPad(plant, step);
      assert.deepEqual(counterPad(encrypted, step, true), plant);
      assert.equal(differences(encrypted)[0], min);
      assert.ok(spectrum(differences(encrypted)).every((value, i) =>
        Math.abs(value - frequencies[i]) < 1e-10),
        'Counterpad GP29 difference spectra must be pure circular shifts');
    }
  }
  minima.sort((a, b) => a - b);
  originalShapedRepeats.sort((a, b) => a - b);
  counts.push({donor: name, controls: 128, sourceWords: source.nWords,
    sourceRunes: source.nRunes, minimumNativeDifferenceCount: {
      min: minima[0], median: minima[64], max: minima[127]},
    nativeActualRepeatCount: {
      min: originalShapedRepeats[0], max: originalShapedRepeats[127]},
    dominantRarestDelta: rarestResidues.reduce((acc, x) =>
      (acc[x] = (acc[x] || 0) + 1, acc), {}),
    sourceShapeFourierFailures,
    allKeyFourierIncompatibilitiesFullDonor: excludedFourierModes(
      spectrum(source.fullSourceDeltas))});
}
assert.deepEqual(counts.map(x => x.minimumNativeDifferenceCount),
  [{min:151,median:188,max:227},{min:165,median:209,max:249}]);
assert.deepEqual(counts.map(x => x.nativeActualRepeatCount),
  [{min:381,max:486},{min:400,max:492}]);
assert.ok(counts.every(x=>x.minimumNativeDifferenceCount.min > 86));
assert.deepEqual(counts.map(x => x.sourceShapeFourierFailures),[50,128]);
assert.equal(counts[0].allKeyFourierIncompatibilitiesFullDonor[0].harmonic,1);
assert.equal(counts[1].allKeyFourierIncompatibilitiesFullDonor[0].harmonic,1);

const nonzero = origCounts.slice(1);
const mean = nonzero.reduce((a,b)=>a+b,0)/nonzero.length;
const nonzeroChi2 = nonzero.reduce((sum,n)=>sum+(n-mean)**2/mean,0);
assert.ok(Math.abs(nonzeroChi2 - 42.05595005852516) < 1e-9);

const result = {
  source: 'original LP2 p0–55 12,956 GP29 runes, 55 rune-bearing physical pages, 2,896 printed words',
  observed: {withinPagePairs:12901,repeatPairs:86,
    repeatRate:86/12901, nonzeroMod29DifferenceChi2df27:nonzeroChi2},
  independentIncrementExpectation: 'Pr(Cdiff=0) = sum_d Pr(Pdiff=d) Pr(Kdiff=-d) >= min_d Pr(Pdiff=d)',
  spectralExpectation: 'For each k=1..14, |DFT(Cdiff)[k]| <= |DFT(Pdiff)[k]| for any stationary independent increment distribution; a violating native control excludes an exact population convolution, not every finite plaintext instance',
  originalNonzeroFourierMagnitudes: originalSpectrum,
  nativeSourceWordshapeExactLengthPlants: counts,
  firstPartyClearLP1: sourceRunicFirstParty(),
  positive: 'Exact deterministic additive counter-pad forward+inverse plants pass and attain their native-delta minimum by choosing the best constant step',
  decision: 'Original repeats are below all 256 native donor wordshape-plant minimum transition counts, and source-shape Fourier constraints fail for 50 Gibran plus all 128 Shakespeare controls. Exact population convolution also fails at author LP1 modes 4 and 5 despite that source having a 7/991 native delta. These are model-dependent expected-register conflicts, NOT an all-key, all-language or finite one-time-pad impossibility.'
};
console.log(JSON.stringify(result, null, 2));
