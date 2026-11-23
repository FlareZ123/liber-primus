#!/usr/bin/env node
'use strict';

/**
 * LP2 p39/p50 degree-238 coefficient bridge, exact original-source SFT.
 * Windows Node.js 22: node sims/lp2_p39_p50_r238_red5_lag16_sft.cjs
 *
 * Source-selected operands:
 * - p50 base60 printed 256-byte row-major table, reduced to GF(29)
 * - its degree-16 small-factor product and degree-238 quotient
 * - p39 red middle rune index 5, p39 after shedding first/last rune
 * - p15 16 printed Fibonacci-prime values, giving the lag 16
 *
 * The 22/222 lag-16 equality is an exploratory correlation, not plaintext.
 * This reproducer preserves original ciphertext, reads files, and writes none.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} p @returns {any} */
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}
/** @param {number[]} a @param {number[]} divisor @returns {{quotient:number[],remainder:number[]}} */
function divMonic(a, divisor) {
  assert.equal(divisor.at(-1), 1);
  const remainder = a.slice();
  const quotient = Array(a.length - divisor.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i--) {
    const x = remainder[i + divisor.length - 1];
    quotient[i] = x;
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - x * divisor[j]);
    }
  }
  return { quotient, remainder };
}
/** @param {number[]} a @param {number[]} b @param {number} lag @param {number} scalar @returns {number[]} */
function matchingIndices(a, b, lag, scalar) {
  assert.equal(a.length, b.length);
  const hits = [];
  for (let i = lag; i < a.length; i++) {
    if (mod(a[i] - a[i - lag]) === mod(scalar * (b[i] - b[i - lag]))) {
      hits.push(i);
    }
  }
  return hits;
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) count[value]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/** @param {number[]} observed @param {number[]} other @returns {number} */
function bestStaticMap(observed, other) {
  const rows = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (let i = 0; i < observed.length; i++) rows[observed[i]][other[i]]++;
  return rows.reduce((sum, counts) => sum + Math.max(...counts), 0);
}
/** @param {number[]} seq @param {number[]} coefficients @returns {number[]} */
function recurrenceMatches(seq, coefficients) {
  const out = [];
  for (let i = 16; i < seq.length; i++) {
    let predicted = 0;
    for (let j = 0; j < 16; j++) {
      predicted -= coefficients[j] * seq[i - 16 + j];
    }
    if (mod(predicted) === seq[i]) out.push(i);
  }
  return out;
}
/** @param {number[]} seed @param {number[]} coefficients @param {number} length @returns {number[]} */
function expandRecurrence(seed, coefficients, length) {
  const result = seed.slice();
  for (let i = result.length; i < length; i++) {
    let x = 0;
    for (let j = 0; j < 16; j++) x -= coefficients[j] * result[i - 16 + j];
    result.push(mod(x));
  }
  return result;
}

const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const allPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const book = allPages.flatMap(p => p.indices);
const page39 = corpus.pages.find(p => p.page === 39).indices;
const page36 = corpus.pages.find(p => p.page === 36).indices;
const solved57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(book.length, 12956);
assert.equal(grid.bytes.length, 256);
assert.equal(page39.length, 240);
assert.equal(page36.length, 238);
assert.deepEqual(page39.slice(119, 122), [27, 5, 15]);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Original source p15 printed 4-by-4 table: 16 magnitudes.
const p15Rows = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
  3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
assert.equal(p15Rows.length, 16);
assert.equal(p15Rows[5], 3299);

// The 203 entry disappears modulo29. The 231 entry is 28 mod29;
// multiplying by -1 normalizes the remaining degree254 polynomial to monic.
assert.equal(mod(grid.bytes[0]), 0);
assert.equal(mod(grid.bytes[1]), 28);
const originalMonic = grid.bytes.slice(1).reverse().map(x => mod(-x));
const smallFactors = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const F16 = smallFactors.reduce((acc, f) => mul(acc, f), [1]);
assert.deepEqual(F16, [13, 20, 26, 12, 6, 2, 13, 26, 6,
  26, 11, 7, 15, 11, 17, 25, 1]);
const { quotient: R238, remainder } = divMonic(originalMonic, F16);
assert.equal(R238.length, 239);
assert.equal(R238.at(-1), 1);
assert.ok(remainder.every(x => x === 0));
assert.deepEqual(mul(F16, R238), originalMonic);

const originalOrder = R238.slice(0, -1).reverse();
const reverseOrder = R238.slice(0, -1);
const originalTrim = page39.slice(1, -1);
assert.equal(originalOrder.length, 238);
assert.equal(originalTrim.length, 238);

// A printed, reproducible, source-constrained lag16 difference criterion.
const alpha = 5;
const lag = 16;
const hits = matchingIndices(originalTrim, originalOrder, lag, alpha);
const knownHits = [30, 32, 59, 74, 91, 94, 97, 111, 127, 128, 146,
  148, 152, 164, 174, 177, 195, 215, 225, 227, 228, 235];
assert.deepEqual(hits, knownHits);
assert.equal(matchingIndices(page39.slice(0, 238), originalOrder, lag, alpha).length, 6);
assert.equal(matchingIndices(page39.slice(2, 240), originalOrder, lag, alpha).length, 7);
assert.equal(matchingIndices(page36, originalOrder, lag, alpha).length, 11);
assert.equal(matchingIndices(originalTrim, reverseOrder, lag, alpha).length, 7);

// Exact all-source-window comparison: preserve the 12,956 original runes.
const delta = Array.from({ length: 238 - lag }, (_, j) =>
  mod(alpha * (originalOrder[j + lag] - originalOrder[j])));
let windows = 0;
const qualifyingWindows = [];
let bestOther = 0;
for (let start = 0; start + 238 <= book.length; start++) {
  windows++;
  let count = 0;
  for (let j = 0; j < delta.length; j++) {
    if (mod(book[start + j + lag] - book[start + j]) === delta[j]) count++;
  }
  if (count >= hits.length) qualifyingWindows.push({ start, count });
  if (start !== 9401 && count > bestOther) bestOther = count;
}
const p39Global = allPages.filter(p => p.page < 39)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(p39Global, 9400);
assert.equal(windows, 12719);
assert.deepEqual(qualifyingWindows, [{ start: p39Global + 1, count: 22 }]);
assert.equal(bestOther, 19);

// Allow all 29 secret multipliers at the otherwise frozen original p39 trim.
// This is a deliberately more permissive competitor than the red source 5.
const multipliers = Array.from({ length: 29 }, (_, a) =>
  ({ scalar: a, hits: matchingIndices(originalTrim, originalOrder, lag, a).length }));
multipliers.sort((a, b) => b.hits - a.hits || a.scalar - b.scalar);
assert.deepEqual(multipliers[0], { scalar: 5, hits: 22 });
assert.equal(multipliers[1].hits, 12);

const p36Matches = originalOrder.filter((c, i) => c === page36[i]).length;
const p39Matches = originalOrder.filter((c, i) => c === originalTrim[i]).length;
assert.equal(p36Matches, 14);
assert.equal(p39Matches, 10);
assert.equal(bestStaticMap(page36, originalOrder), 54);
assert.equal(bestStaticMap(originalTrim, originalOrder), 50);

// A full 16-periodic pad would satisfy every lag16 equation, which does not happen.
const residual = originalTrim.map((x, i) => mod(x - alpha * originalOrder[i]));
const f16RecurrenceHits = recurrenceMatches(residual, F16);
assert.equal(f16RecurrenceHits.length, 5);

// Test the stronger source-conditioned two-layer inverse:
// Q removes one affine layer, then the sixteen original p15 values remove
// a fixed 16-position additive shift. One can grant every circular phase,
// both signs, reversed orientation and the F16 factor-coefficient rival.
/** @param {number} n @returns {number} */
function nthPrime(n) {
  let count = 0;
  for (let k = 2; ; k++) {
    let isPrime = true;
    for (let p = 2; p * p <= k; p++) {
      if (k % p === 0) { isPrime = false; break; }
    }
    if (isPrime && ++count === n) return k;
  }
}
const fibIndices = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144,
  233, 377, 610, 987];
const spiralPositions = [5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12];
const spiralSigned = fibIndices.map(i => 3301 - nthPrime(i + 1));
assert.deepEqual(spiralSigned.map(Math.abs),
  spiralPositions.map(i => p15Rows[i]));

// A separate exact source-to-source factor test: the unsigned, physically
// printed p15 clockwise spiral has sole GF29 root 3301 mod29 = -5,
// shared with the p39 red quadratic and the doubled p50 polynomial root.
// This root equality is weaker evidence than a plaintext inverse.
/** @param {number[]} coefficients @param {number} x @returns {number} */
const evalPoly = (coefficients, x) =>
  coefficients.slice().reverse().reduce((acc, coefficient) =>
    mod(acc * x + coefficient), 0);
const cicadaRoot = mod(3301);
assert.equal(cicadaRoot, 24);
const redPolynomial = [27, 5, 15];
assert.equal(evalPoly(redPolynomial, cicadaRoot), 0);
assert.equal(evalPoly([5, 30], cicadaRoot), 0);
const unsignedSpiral = spiralPositions.map(i => mod(p15Rows[i]));
assert.equal(evalPoly(unsignedSpiral, cicadaRoot), 0);
assert.equal(evalPoly(unsignedSpiral.slice(1).map((v, i) =>
  mod((i + 1) * v)), cicadaRoot), 9);
assert.deepEqual(Array.from({ length: 29 }, (_, x) => x)
  .filter(x => evalPoly(unsignedSpiral, x) === 0), [24]);
assert.equal(evalPoly(spiralSigned.map(mod), cicadaRoot), 2);
assert.equal(evalPoly(p15Rows.map(mod), cicadaRoot), 15);

// This root condition also occurs for two other residue classes among
// nearby hypothetical prime-spiral centers; the match is not exclusive.
const originalPrimes = spiralSigned.map(v => 3301 - v);
const nearbyRootResidues = new Set();
for (let center = 3200; center <= 3400; center++) {
  const hypotheticalSpiral = originalPrimes.map(p =>
    mod(Math.abs(center - p)));
  if (evalPoly(hypotheticalSpiral, mod(center)) === 0) {
    nearbyRootResidues.add(mod(center));
  }
}
assert.deepEqual([...nearbyRootResidues].sort((a, b) => a - b),
  [9, 24, 25]);


// A higher-order common-root test with NO fitted key.
// Since p39's red polynomial selects r=3301 mod29, compare the first
// three Taylor coefficients of the printed p15 unsigned polynomial
// against p50's irreducible R238 factor at exactly that source root.
// Synthetic division by (X-r) avoids factorial inverses.
/** @param {number[]} coefficients @param {number} r @param {number} count @returns {number[]} */
function taylorAt(coefficients, r, count) {
  const out = [];
  let current = coefficients.slice();
  for (let k = 0; k < count; k++) {
    out.push(evalPoly(current, r));
    const next = Array(current.length - 1).fill(0);
    for (let i = next.length - 1; i >= 0; i--) {
      next[i] = mod(current[i + 1] + r * (next[i + 1] || 0));
    }
    current = next;
  }
  return out;
}
const p15Jet = taylorAt(unsignedSpiral, cicadaRoot, 4);
const quotientJet = taylorAt(R238, cicadaRoot, 4);
assert.deepEqual(p15Jet, [0, 9, 0, 16]);
assert.deepEqual(quotientJet, [2, 0, 19, 15]);
const sourceJetPrediction = [2, 0, mod(15 * p15Jet[1]), mod(15 * p15Jet[2])];
assert.deepEqual(quotientJet.slice(0, 3), sourceJetPrediction.slice(0, 3));
assert.notEqual(quotientJet[3], sourceJetPrediction[3]);
// Exact interpretation: R238(X) == 2 + inv(2)*(X-3301)*A15(X)
// modulo (X-3301)^3. At degree3 the equality fails.


// The cubic jet congruence selects a fully reversible, source-only peeling:
// E235(X) = [R238(X)-2-inv2*(X-3301)*A15(X)]/(X-3301)^3.
// It extracts 236 original GP29 field coefficients, but no native prose.
const rootLinear = [5, 1];
const rootCubic = mul(mul(rootLinear, rootLinear), rootLinear);
const sourceContribution = mul(rootLinear, unsignedSpiral)
  .map(value => mod(15 * value));
const reduced = R238.slice();
reduced[0] = mod(reduced[0] - 2);
for (let i = 0; i < sourceContribution.length; i++) {
  reduced[i] = mod(reduced[i] - sourceContribution[i]);
}
const cubicExtraction = divMonic(reduced, rootCubic);
assert.ok(cubicExtraction.remainder.every(value => value === 0));
assert.equal(cubicExtraction.quotient.length, 236);
const extractedIoC = ioc(cubicExtraction.quotient);
assert.equal(extractedIoC, 0.034799855751893254);

// Exact positive control: an untouched native source passage is planted as
// E235 and recovered through this identical GF29 polynomial constructor.
const genuinePlant = Array.from({ length: 236 },
  (_, i) => solved57[i % solved57.length]);
const generated = mul(rootCubic, genuinePlant);
generated[0] = mod(generated[0] + 2);
for (let i = 0; i < sourceContribution.length; i++) {
  generated[i] = mod(generated[i] + sourceContribution[i]);
}
assert.equal(generated.length, R238.length);
const reducedPlant = generated.slice();
reducedPlant[0] = mod(reducedPlant[0] - 2);
for (let i = 0; i < sourceContribution.length; i++) {
  reducedPlant[i] = mod(reducedPlant[i] - sourceContribution[i]);
}
const extractedPlant = divMonic(reducedPlant, rootCubic);
assert.ok(extractedPlant.remainder.every(value => value === 0));
assert.deepEqual(extractedPlant.quotient, genuinePlant);
assert.ok(ioc(genuinePlant) > 0.06);



// The highlighted p39 RED QUADRATIC itself supplies a source-typed
// polynomial divisor of degree2. A 240-rune original p39 polynomial
// divided by it yields exactly 238 quotient runes, naturally typed as
// the same degree/order as p50's irreducible quotient nonleading cells.
// The original printed red polynomial is G=27+5X+15X^2.
// Its monic form is 2*G=[25,10,1] in GF29.
const p39RedQuadratic = [27, 5, 15];
const p39RedMonic = p39RedQuadratic.map(x => mod(2 * x));
assert.deepEqual(p39RedMonic, [25, 10, 1]);
const redDividedCases = [];
for (const [p39Order, p39Polynomial] of [
  ['printed-high-first', page39.slice().reverse()],
  ['printed-low-first', page39]
]) {
  const quotientResult = divMonic(p39Polynomial, p39RedMonic);
  const quotient = quotientResult.quotient.map(x => mod(2 * x));
  assert.equal(quotient.length, 238);
  assert.deepEqual(quotientResult.remainder.slice(0, 2),
    p39Order === 'printed-high-first' ? [26, 27] : [21, 26]);
  assert.ok(quotientResult.remainder.slice(2).every(x => x === 0));
  const recomposed = mul(p39RedQuadratic, quotient);
  recomposed[0] = mod(recomposed[0] + quotientResult.remainder[0]);
  recomposed[1] = mod(recomposed[1] + quotientResult.remainder[1]);
  assert.deepEqual(recomposed, p39Polynomial);
  for (const [r238Order, source] of [
    ['high-degree-first', originalOrder],
    ['low-degree-first', reverseOrder]
  ]) {
    for (const scalar of [1, 5, 15]) {
      for (const sign of [-1, 1]) {
        const candidate = quotient.map((v, i) =>
          mod(v + sign * scalar * source[i]));
        redDividedCases.push({ p39Order, r238Order, scalar, sign,
          ioc: ioc(candidate) });
      }
    }
  }
}
redDividedCases.sort((a, b) => b.ioc - a.ioc);
assert.equal(redDividedCases.length, 24);
assert.deepEqual(redDividedCases[0], {
  p39Order: 'printed-high-first', r238Order: 'low-degree-first',
  scalar: 15, sign: 1, ioc: 0.03645002304719356
});
assert.ok(redDividedCases.every(x => x.ioc < 0.04));
// Reverse the true first-party RED polynomial: positive GP-native
// 238-symbol plaintext planted as its quotient, arbitrary known remainder.
const redDividedNativePlant = Array.from({ length: 238 },
  (_, i) => solved57[i % solved57.length]);
const redEncodedPlant = mul(p39RedQuadratic, redDividedNativePlant);
redEncodedPlant[0] = mod(redEncodedPlant[0] + 26);
redEncodedPlant[1] = mod(redEncodedPlant[1] + 27);
const redPlantInverse = divMonic(redEncodedPlant, p39RedMonic);
assert.deepEqual(redPlantInverse.quotient.map(x => mod(2 * x)),
  redDividedNativePlant);
assert.deepEqual(redPlantInverse.remainder.slice(0, 2), [26, 27]);
assert.ok(redPlantInverse.remainder.slice(2).every(x => x === 0));

// The cubic extraction has 236 coefficients. A second literal
// circumference-shedding on full p39 also has 236 runes, which gives a
// fixed original-cipher additive receiver with no fitted phases.
const p39ShedTwice = page39.slice(2, -2);
assert.equal(p39ShedTwice.length, cubicExtraction.quotient.length);
const peeledSourceCases = [];
for (const [direction, key] of [
  ['high-degree-first', cubicExtraction.quotient.slice().reverse()],
  ['low-degree-first', cubicExtraction.quotient]
]) {
  for (const scalar of [1, 5]) {
    for (const sign of [-1, 1]) {
      const candidate = p39ShedTwice.map((c, i) =>
        mod(c + sign * scalar * key[i]));
      peeledSourceCases.push({ direction, scalar, sign, ioc: ioc(candidate) });
    }
  }
}
peeledSourceCases.sort((a, b) => b.ioc - a.ioc);
assert.equal(peeledSourceCases.length, 8);
assert.deepEqual(peeledSourceCases[0], {
  direction: 'high-degree-first', scalar: 5, sign: -1,
  ioc: 0.03786512802019473
});
assert.ok(peeledSourceCases.every(x => x.ioc < 0.04));

// The actual printed p39 source has two separated paragraphs, 119/121 runes.
// Shed one boundary rune on each side of EACH paragraph, yielding 117+119
// source rune symbols. This is a distinct, visible 236-rune recipient, not
// a fitted or shifted version of the single contiguous 236-rune sequence.
const sourceTranscript = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const p39PrintedBlocks = sourceTranscript.split('%')[39].split('&')
  .map(text => (text.match(/[\u16a0-\u16ff]/g) || []).length);
assert.deepEqual(p39PrintedBlocks, [119, 121, 0]);
const p39BlockwiseShed = page39.slice(1, 118).concat(page39.slice(120, 239));
assert.equal(p39BlockwiseShed.length, 236);
const blockwiseSourceCases = [];
for (const [direction, key] of [
  ['high-degree-first', cubicExtraction.quotient.slice().reverse()],
  ['low-degree-first', cubicExtraction.quotient]
]) {
  for (const scalar of [1, 5]) {
    for (const sign of [-1, 1]) {
      const candidate = p39BlockwiseShed.map((c, i) =>
        mod(c + sign * scalar * key[i]));
      blockwiseSourceCases.push({
        direction, scalar, sign, ioc: ioc(candidate)
      });
    }
  }
}
blockwiseSourceCases.sort((a, b) => b.ioc - a.ioc);
assert.deepEqual(blockwiseSourceCases[0], {
  direction: 'low-degree-first', scalar: 5, sign: 1,
  ioc: 0.03609808871258565
});
assert.ok(blockwiseSourceCases.every(x => x.ioc < 0.04));

const exactPeelPlant = cubicExtraction.quotient.map((x, i) =>
  mod(5 * x + genuinePlant[i]));
assert.deepEqual(exactPeelPlant.map((x, i) =>
  mod(x - 5 * cubicExtraction.quotient[i])), genuinePlant);

const sourceKeyLists = [
  ['p15-row', p15Rows.map(mod)],
  ['p15-spiral-absolute', spiralPositions.map(i => mod(p15Rows[i]))],
  ['p15-spiral-signed', spiralSigned.map(mod)],
  ['F16', F16.slice(0, 16)]
];
const sourceTwoLayer = [];
for (const [keyName, fixedKey] of sourceKeyLists) {
  for (const reversed of [false, true]) {
    const key = reversed ? fixedKey.slice().reverse() : fixedKey;
    for (const sign of [-1, 1]) {
      for (let phase = 0; phase < 16; phase++) {
        const plaintext = residual.map((x, i) =>
          mod(x + sign * key[(i + phase) % 16]));
        sourceTwoLayer.push({
          keyName, reversed, sign, phase, ioc: ioc(plaintext)
        });
      }
    }
  }
}
sourceTwoLayer.sort((a, b) => b.ioc - a.ioc);
assert.equal(sourceTwoLayer.length, 256);
assert.deepEqual(sourceTwoLayer[0], {
  keyName: 'F16', reversed: false, sign: -1, phase: 6,
  ioc: 0.03974754458745523
});
assert.ok(sourceTwoLayer.every(x => x.ioc < 0.04));
const nativePlant = Array.from({ length: 238 },
  (_, i) => solved57[i % solved57.length]);
const signedSeed16 = spiralSigned.map(mod);
const twoLayerPlant = originalOrder.map((x, i) =>
  mod(5 * x + signedSeed16[i % 16] + nativePlant[i]));
const twoLayerInverse = twoLayerPlant.map((x, i) =>
  mod(x - 5 * originalOrder[i] - signedSeed16[i % 16]));
assert.deepEqual(twoLayerInverse, nativePlant);
assert.ok(ioc(nativePlant) > 0.06);

const plantedPeriodicKey = p15Rows.map(mod);
const plantedPeriodic = originalOrder.map((x, i) =>
  mod(alpha * x + plantedPeriodicKey[i % 16]));
assert.equal(matchingIndices(plantedPeriodic, originalOrder, lag, alpha).length, 222);
assert.deepEqual(plantedPeriodic.map((x, i) => mod(x - alpha * originalOrder[i])),
  originalOrder.map((_, i) => plantedPeriodicKey[i % 16]));
const plantedRecKey = expandRecurrence(plantedPeriodicKey, F16, 238);
const plantedRec = originalOrder.map((x, i) => mod(alpha * x + plantedRecKey[i]));
assert.equal(recurrenceMatches(plantedRec.map((x, i) =>
  mod(x - alpha * originalOrder[i])), F16).length, 222);


// Original p39's red13-dot glyphs divide it into 119 black + 3 red +118 black.
const physicalRedSelectorHits = {};
for (const [name, removed] of [
  ['redOuter', [119, 121]], ['redLeft', [119, 120]],
  ['redRight', [120, 121]], ['first13Outer', [118, 122]],
  ['after13Marks', [119, 122]], ['before13Marks', [118, 121]]
]) {
  const c = page39.filter((_, i) => !removed.includes(i));
  assert.equal(c.length, 238);
  physicalRedSelectorHits[name] = matchingIndices(
    c, originalOrder, lag, alpha).length;
  assert.equal(physicalRedSelectorHits[name], 7);
}
const black237 = page39.filter((_, i) => i < 119 || i > 121);
assert.equal(black237.length, 237);
const black237Counts = [R238.slice(1, -1).reverse(),
  R238.slice(0, -2).reverse(), R238.slice(1, -1), R238.slice(0, -2)]
  .map(q => matchingIndices(black237, q, lag, alpha).length);
assert.deepEqual(black237Counts, [6, 6, 6, 8]);

// Retain intact word segments and all original runes within each physical page.
// Test the same 12,719-window maximum over 240 seeded page-local word shuffles.
const masterParts = fs.readFileSync(path.join(root,
  'resources/transcriptions/liber_primus_master.txt'), 'utf8').split('%');
const pages0to55 = corpus.pages.filter(p => p.page <= 55);
const nativeWords = pages0to55.map((page, pi) => {
  const words = [];
  let word = [];
  for (const ch of Array.from(masterParts[pi + 16])) {
    const v = corpus.runes.indexOf(ch);
    if (v >= 0) word.push(v);
    else if ((ch === '-' || ch === '.') && word.length) {
      words.push(word); word = [];
    }
  }
  if (word.length) words.push(word);
  assert.deepEqual(words.flat(), page.indices);
  return words;
});
assert.equal(nativeWords.reduce((n, words) => n + words.length, 0), 2928);
let shuffleState = 0x3301abcd;
/** @returns {number} */
function shuffleRandom() {
  shuffleState ^= shuffleState << 13;
  shuffleState ^= shuffleState >>> 17;
  shuffleState ^= shuffleState << 5;
  return (shuffleState >>> 0) / 4294967296;
}
/** @param {number[]} tape @returns {{ best:number, p39:number }} */
function compareLagMax(tape) {
  const d = new Uint8Array(tape.length - 16);
  for (let i = 16; i < tape.length; i++) d[i - 16] =
    mod(tape[i] - tape[i - 16]);
  let best = 0;
  let p39 = 0;
  for (let start = 0; start <= tape.length - 238; start++) {
    let score = 0;
    for (let i = 0; i < delta.length; i++) if (d[start + i] === delta[i]) score++;
    if (score > best) best = score;
    if (start === 9401) p39 = score;
  }
  return { best, p39 };
}
assert.deepEqual(compareLagMax(book), { best: 22, p39: 22 });
const shuffledMaxHistogram = {};
const shuffledP39Histogram = {};
for (let trial = 0; trial < 240; trial++) {
  const tape = [];
  for (const wordList of nativeWords) {
    const words = wordList.slice();
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(shuffleRandom() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    for (const word of words) tape.push(...word);
  }
  const { best, p39 } = compareLagMax(tape);
  shuffledMaxHistogram[best] = (shuffledMaxHistogram[best] || 0) + 1;
  shuffledP39Histogram[p39] = (shuffledP39Histogram[p39] || 0) + 1;
}
assert.deepEqual(shuffledMaxHistogram,
  { 18: 4, 19: 55, 20: 96, 21: 57, 22: 16, 23: 8, 24: 3, 25: 1 });
assert.deepEqual(shuffledP39Histogram,
  { 1: 4, 2: 1, 3: 7, 4: 12, 5: 24, 6: 33, 7: 29, 8: 34,
    9: 41, 10: 22, 11: 12, 12: 11, 13: 5, 15: 4, 16: 1 });


/** @param {number[]} poly @returns {number[]} */
function fieldTrim(poly) {
  while (poly.length && poly.at(-1) === 0) poly.pop();
  return poly;
}
/** @param {number} a @returns {number} */
function fieldScalarInv(a) {
  assert.notEqual(a, 0);
  let b = 1;
  for (let i = 0; i < 27; i++) b = mod(b * a);
  assert.equal(mod(a * b), 1);
  return b;
}
/** @param {number[]} a @param {number[]} b @returns {{q:number[],r:number[]}} */
function fieldDivide(a, b) {
  const r = fieldTrim(a.slice());
  const q = Array(Math.max(0, r.length - b.length + 1)).fill(0);
  const inv = fieldScalarInv(b.at(-1));
  while (r.length >= b.length && r.length) {
    const k = r.length - b.length;
    const x = mod(r.at(-1) * inv);
    q[k] = x;
    for (let j = 0; j < b.length; j++) r[k + j] = mod(r[k + j] - x * b[j]);
    fieldTrim(r);
  }
  return { q: fieldTrim(q), r };
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function fieldSubtract(a, b) {
  return fieldTrim(Array.from({ length: Math.max(a.length, b.length) },
    (_, i) => mod((a[i] || 0) - (b[i] || 0))));
}
/** @param {number[]} a @param {number[]} field @returns {number[]} */
function fieldInverse(a, field) {
  let [r0, r1, t0, t1] = [field.slice(), fieldTrim(a.slice()), [], [1]];
  while (r1.length) {
    const { q, r } = fieldDivide(r0, r1);
    [r0, r1] = [r1, r];
    [t0, t1] = [t1, fieldSubtract(t0, mul(q, t1))];
  }
  assert.equal(r0.length, 1);
  return fieldDivide(mul(t0, [fieldScalarInv(r0[0])]), field).r;
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
const fieldMod = (a, b) => fieldDivide(a, b).r;
/** @param {number[]} v @param {number[]} key @returns {number[]} */
function fieldMultiply238(v, key) {
  const out = fieldMod(mul(v, key), R238);
  while (out.length < 238) out.push(0);
  assert.equal(out.length, 238);
  return out;
}
const redFieldUnit = page39.slice(119, 122);
const spiralFieldUnit = spiralPositions.map(i => mod(p15Rows[i]));
assert.deepEqual(spiralFieldUnit, [22,21,19,17,11,1,10,3,20,22,25,7,22,12,17,21]);
const redFieldInverse = fieldInverse(redFieldUnit, R238);
const spiralFieldInverse = fieldInverse(spiralFieldUnit, R238);
assert.deepEqual(fieldMod(mul(redFieldUnit, redFieldInverse), R238), [1]);
assert.deepEqual(fieldMod(mul(spiralFieldUnit, spiralFieldInverse), R238), [1]);
const fieldSourceUnits = [
  ['G', redFieldUnit], ['G-inverse', redFieldInverse],
  ['A15', spiralFieldUnit], ['A15-inverse', spiralFieldInverse],
  ['A15-over-G', fieldMod(mul(spiralFieldUnit, redFieldInverse), R238)],
  ['G-over-A15', fieldMod(mul(redFieldUnit, spiralFieldInverse), R238)],
  ['G-times-A15', fieldMod(mul(redFieldUnit, spiralFieldUnit), R238)],
  ['GA15-inverse', fieldInverse(mul(redFieldUnit, spiralFieldUnit), R238)]
];
const fieldOriginalResults = [];
for (const [name, unit] of fieldSourceUnits) {
  for (const orientation of ['high', 'low']) {
    const tape = orientation === 'high' ? originalTrim.slice().reverse() : originalTrim.slice();
    const decoded = fieldMultiply238(tape, unit);
    const output = orientation === 'high' ? decoded.reverse() : decoded;
    fieldOriginalResults.push({ name, orientation, ioc: ioc(output),
      transliterationPrefix: output.slice(0, 72).map(k => corpus.translit[k]).join('') });
  }
}
assert.equal(fieldOriginalResults.length, 16);
assert.ok(fieldOriginalResults.every(v => v.ioc < 0.037));
assert.equal(Math.max(...fieldOriginalResults.map(v => v.ioc)), 0.036414565826330535);
const fieldPlant = nativePlant.slice().reverse();
const fieldEncrypted = fieldMultiply238(fieldPlant, redFieldUnit);
const fieldRecovered = fieldMultiply238(fieldEncrypted, redFieldInverse);
assert.deepEqual(fieldRecovered, fieldPlant);
assert.ok(ioc(fieldRecovered) > 0.06);


// Further genuinely source-labelled register: convert the three literal red
// GP29 glyphs to their STANDARD PRINTED GP prime weights rather than alphabet
// ordinal indices, then work in the independently original GF(29^238).
const standardGpPrimes = [
   2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,
   53,59,61,67,71,73,79,83,89,97,101,103,107,109
];
assert.deepEqual(page39.slice(119,122).map(i=>standardGpPrimes[i]),
  [107,13,53]);
const primeRedFieldUnit=page39.slice(119,122)
  .map(i=>mod(standardGpPrimes[i]));
assert.deepEqual(primeRedFieldUnit,[20,13,24]);
const primeRedInverse=fieldInverse(primeRedFieldUnit,R238);
assert.deepEqual(fieldMod(mul(primeRedFieldUnit,primeRedInverse),R238),[1]);
const primeRedSourceUnits=[
  ['GP-printed-prime G',primeRedFieldUnit],
  ['GP-printed-prime G inverse',primeRedInverse],
  ['GP-printed-prime G times p15 A16',
    fieldMod(mul(primeRedFieldUnit,spiralFieldUnit),R238)],
  ['GP-printed-prime G times p15 A16 inverse',
    fieldInverse(mul(primeRedFieldUnit,spiralFieldUnit),R238)]
];
const primeRedSourceResults=[];
for(const [name,unit] of primeRedSourceUnits){
  for(const orientation of ['high','low']){
    const input=orientation==='high'
      ?originalTrim.slice().reverse():originalTrim.slice();
    const decoded=fieldMultiply238(input,unit);
    const output=orientation==='high'?decoded.reverse():decoded;
    primeRedSourceResults.push({name,orientation,ioc:ioc(output),
      prefix:output.slice(0,95).map(i=>corpus.translit[i]).join('')});
  }
}
assert.equal(primeRedSourceResults.length,8);
assert.ok(primeRedSourceResults.every(x=>x.ioc<0.045));
const primeRedPlant=fieldMultiply238(
  fieldMultiply238(fieldPlant,primeRedFieldUnit),primeRedInverse);
assert.deepEqual(primeRedPlant,fieldPlant);

// Genuinely nonlinear, reversible and fully keyless GF29^238 self-inversion.
// Same printed field modulus, source-receiver and two literal red mappings.
const sourceFieldReciprocal=[];
for(const orientation of ['high','low']){
  const input=orientation==='high'?originalTrim.slice().reverse():originalTrim.slice();
  const invCipher=fieldInverse(input,R238);
  const outputs=[
    ['1/C',invCipher],
    ['G/C',fieldMod(mul(redFieldUnit,invCipher),R238)],
    ['Gprime/C',fieldMod(mul(primeRedFieldUnit,invCipher),R238)]
  ];
  for(const [name,candidate] of outputs){
    const out=candidate.slice();
    while(out.length<238)out.push(0);
    if(orientation==='high')out.reverse();
    sourceFieldReciprocal.push({orientation,name,ioc:ioc(out),
      prefix:out.slice(0,100).map(v=>corpus.translit[v]).join('')});
  }
}
assert.equal(sourceFieldReciprocal.length,6);
assert.ok(sourceFieldReciprocal.every(x=>x.ioc<0.045));
const reciprocalNative=fieldInverse(fieldInverse(fieldPlant,R238),R238);
const reciprocalNativePad=reciprocalNative.slice();
while(reciprocalNativePad.length<238)reciprocalNativePad.push(0);
assert.deepEqual(reciprocalNativePad,fieldPlant);

// All-secret 16-position alphabet gate: for ANY bijection applied separately
// at each of the sixteen phases, equalities within a phase cannot change.
/** @param {number[]} v @returns {{samePhasePairs:number,adjacentLag16:number}} */
function fixed16Equalities(v) {
  assert.equal(v.length, 238);
  let samePhasePairs = 0;
  let adjacentLag16 = 0;
  for (let phase = 0; phase < 16; phase++) {
    const counts = Array(29).fill(0);
    for (let i = phase; i < 238; i += 16) {
      counts[v[i]]++;
      if (i >= 16 && v[i] === v[i - 16]) adjacentLag16++;
    }
    samePhasePairs += counts.reduce((sum, n) => sum + (n * (n - 1)) / 2, 0);
  }
  return { samePhasePairs, adjacentLag16 };
}
const fixed16Original = fixed16Equalities(residual);
assert.deepEqual(fixed16Original, { samePhasePairs: 75, adjacentLag16: 22 });
const solvedNativeSections = load('resources/external/relikd-solved-gp29-native-v1.json');
const solvedRuneSet = solvedNativeSections.runes;
assert.deepEqual(solvedRuneSet, corpus.runes);
const fixed16DonorWindows = [];
for (const section of solvedNativeSections.sections) {
  const gp = Array.from(section.source_text)
    .filter(ch => solvedRuneSet.includes(ch))
    .map(ch => solvedRuneSet.indexOf(ch));
  for (let start = 0; start + 238 <= gp.length; start++) {
    fixed16DonorWindows.push(fixed16Equalities(gp.slice(start, start + 238)));
  }
}
assert.equal(fixed16DonorWindows.length, 1421);
assert.equal(Math.min(...fixed16DonorWindows.map(x => x.samePhasePairs)), 73);
assert.equal(Math.max(...fixed16DonorWindows.map(x => x.adjacentLag16)), 20);
assert.equal(fixed16DonorWindows.filter(x =>
  x.samePhasePairs <= 75).length, 15);
assert.equal(fixed16DonorWindows.filter(x =>
  x.samePhasePairs <= 75 && x.adjacentLag16 >= 22).length, 0);
const solvedNativeFirst = Array.from(solvedNativeSections.sections[3].source_text)
  .filter(ch => solvedRuneSet.includes(ch)).map(ch => solvedRuneSet.indexOf(ch))
  .slice(0, 238);
assert.equal(solvedNativeFirst.length, 238);
const bijectivePhase16Plant = solvedNativeFirst.map((x, i) =>
  mod(x + 7 * (i % 16) + 3));
assert.deepEqual(fixed16Equalities(bijectivePhase16Plant),
  fixed16Equalities(solvedNativeFirst));

const report = {
  sources: { p50Bytes: grid.bytes.length, p50MonicDegree: originalMonic.length - 1,
    factorDegrees: [F16.length - 1, R238.length - 1],
    p39Runes: page39.length, p39TrimmedRunes: originalTrim.length,
    p15PrintedNumerals: p15Rows.length, unknownRunes: book.length },
  coefficientCopy: { p36Exact: p36Matches, p39TrimmedExact: p39Matches,
    p36BestArbitrarySubstitution: 54, p39BestArbitrarySubstitution: 50 },
  sourceSelectedLag16: { multiplier: alpha, matches: hits.length,
    trials: originalTrim.length - lag, indexPositions: hits,
    allUnsolvedBookWindows: windows, windowsAtOrAbove22: qualifyingWindows,
    secondBestWindowScore: bestOther,
    otherMultiplierMax: multipliers[1] },
  candidateDecode: { p39InverseIoC: ioc(residual), solvedP57IoC: ioc(solved57),
    p39InverseTransliterationPrefix: residual.slice(0, 80).map(i => corpus.translit[i]).join(''),
    p39F16RecurrencePredictionsCorrect: f16RecurrenceHits.length, recurrenceTrials: 222 },
  commonSourceRoot: { gpResidue3301: cicadaRoot, p15UnsignedRoots: [24],
    p39RedQuadraticDoubleRoot: cicadaRoot, p15SignedValueAt3301: 2,
    nearbyCenterRootResidueClasses: [9, 24, 25],
    p15TaylorAt3301: p15Jet, r238TaylorAt3301: quotientJet,
    cubicCongruence: true, quarticCongruence: false,
    extracted236IoC: extractedIoC, extractedNativePlant: true,
    p39ShedTwiceOriginalReceiverCases: peeledSourceCases,
    p39PrintedBlockLengths: p39PrintedBlocks,
    blockwiseShedOriginalReceiverCases: blockwiseSourceCases,
    p39PeelNativePlant: true,
    directRedQuadraticOriginalQuotientCases: redDividedCases,
    directRedQuadraticNativePlant: true },
  sourceSelectedSecondLayer: { candidates: sourceTwoLayer.length, best: sourceTwoLayer[0],
    allHaveIoCLessThanFourPercent: true, signedP15PositiveRoundtrip: true },
  keylessPhase16: { original: fixed16Original, donorWindows: fixed16DonorWindows.length,
    donorsAtMost75: 15, donorMaxLag16: 20, donorsMatchingBoth: 0,
    solvedNativePhasePermutationPlant: true },
  sourceCipherReciprocal: { cases:sourceFieldReciprocal, nativePlantRecovered:true },
  sourcePrimeField: { sourceGpPrimes:[107,13,53],unit:primeRedFieldUnit,
    cases:primeRedSourceResults,nativePlantRecovered:true },
  sourceFiniteField: { originalCases: fieldOriginalResults, nativePlantExactlyRecovered: true },
  physicalSelectorCalibration: { red13Markers: [119, 122, 240],
    physicalRedSelectorHits, black237Counts, wordShuffleSeed: '0x3301abcd',
    wordShuffleTrials: 240, shuffledMaxHistogram, shuffledP39Histogram },
  positivePlants: { periodicMatches: 222, F16RecurrenceMatches: 222 },
  status: 'Intermediate alignment only; no direct decipherment, authentic key, or plaintext recovered.'
};
console.log(JSON.stringify(report, null, 2));
