'use strict';

/**
 * Original-source GP29 pair-codec test for p15's visible red 3299 and the
 * seven recovered from all red floral GP-prime weights (3301 - 3294 = 7).
 *
 * The RSA-style, format-preserving cycle walk is a hypothesis, never an
 * authenticated Cicada cipher. Run: node sims/lp2_p15_red3299_rsa_cyclewalk_sft.cjs
 * Node.js 22, built-in modules only, original source resources unchanged.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

/** @param {string} relative @returns {any} */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
}
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const MOD = 3299;
const ALPHABET = 29;
const DOMAIN = ALPHABET * ALPHABET;
const EXPONENT = 7;
const INVERSE_EXPONENT = 2827;

assert.equal((EXPONENT * INVERSE_EXPONENT) % (MOD - 1), 1);
assert.equal(corpus.pages.slice(40, 56).length, 16);
assert.deepEqual(corpus.pages.slice(40, 56).map(p => p.runic_count),
  [231,273,272,274,273,270,270,274,271,66,0,92,263,179,232,76]);

const visibleRed = ink.pages
  .filter(p => p.page >= 40 && p.page <= 55)
  .flatMap(p => (p.red_spans || []).map(s => ({
    page: p.page, start: s.start, length: s.length
  })));
assert.deepEqual(visibleRed, [
  {page:40,start:0,length:8},
  {page:53,start:128,length:51},
  {page:54,start:0,length:9}
]);
const redPrimeSum = visibleRed.reduce((total, s) =>
  total + corpus.pages[s.page].indices
    .slice(s.start, s.start + s.length)
    .reduce((a, index) => a + corpus.prime[index], 0), 0);
assert.equal(redPrimeSum, 3294);
assert.equal(3301 - redPrimeSum, EXPONENT);

const headings = new Array(58).fill(0);
headings[40] = 8;
headings[54] = 9;
const full = corpus.pages.slice(40, 56).flatMap(p => p.indices);
const body = corpus.pages.slice(40, 56)
  .flatMap(p => p.indices.slice(headings[p.page]));
assert.equal(full.length, 3316);
assert.equal(body.length, MOD);
assert.equal(full.length, 4 * 829);

/** @param {number} base @param {number} exponent @returns {number} */
function powMod(base, exponent) {
  let out = 1;
  let x = base % MOD;
  let n = exponent;
  while (n > 0) {
    if (n % 2) out = (out * x) % MOD;
    x = (x * x) % MOD;
    n = Math.floor(n / 2);
  }
  return out;
}

/**
 * Restrict the RSA permutation on F_3299 to the 841 base29 two-rune values.
 * The first forward iterate that re-enters the domain is taken.
 * @param {number} x original packed two-rune word
 * @param {number} exponent power 7 or its inverse 2827
 * @returns {{value:number,steps:number}}
 */
function cycleWalk(x, exponent) {
  assert.ok(Number.isInteger(x) && x >= 0 && x < DOMAIN);
  let value = x;
  let steps = 0;
  do {
    value = powMod(value, exponent);
    steps++;
    assert.ok(steps <= MOD - 1);
  } while (value >= DOMAIN);
  return { value, steps };
}

/**
 * Complete word-preserving inverse over GP29 rune pairs.
 * If the source has odd length, transmit its final rune unchanged. This is
 * only a diagnostic of the 3299-rune titleless register, not a proposed
 * authenticated historical padding rule.
 * @param {number[]} input
 * @param {number} exponent
 * @param {boolean} little whether first GP29 symbol is low base29 digit
 * @returns {{symbols:number[],maxSteps:number,averageSteps:number}}
 */
function transform(input, exponent, little) {
  const symbols = [];
  let maxSteps = 0;
  let totalSteps = 0;
  let pairs = 0;
  for (let i = 0; i + 1 < input.length; i += 2) {
    const a = input[i], b = input[i + 1];
    const packed = little ? b * ALPHABET + a : a * ALPHABET + b;
    const result = cycleWalk(packed, exponent);
    const hi = Math.floor(result.value / ALPHABET);
    const lo = result.value % ALPHABET;
    if (little) symbols.push(lo, hi);
    else symbols.push(hi, lo);
    maxSteps = Math.max(maxSteps, result.steps);
    totalSteps += result.steps;
    pairs++;
  }
  if (input.length % 2) symbols.push(input[input.length - 1]);
  return { symbols, maxSteps, averageSteps: totalSteps / pairs };
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const h = Array(ALPHABET).fill(0);
  for (const x of symbols) h[x]++;
  return h.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[]} symbols @returns {number} */
function doubles(symbols) {
  let total = 0;
  for (let i = 1; i < symbols.length; i++)
    if (symbols[i] === symbols[i-1]) total++;
  return total;
}

// Exhaust the ENTIRE 841-symbol pair alphabet. The format-preserving
// permutation is bijective and its literal inverse works without fitting.
for (const little of [false, true]) {
  const forward = [];
  for (let x = 0; x < DOMAIN; x++) {
    const a = Math.floor(x / ALPHABET), b = x % ALPHABET;
    const pair = little ? [b, a] : [a, b];
    const actual = transform(pair, EXPONENT, little).symbols;
    const inverse = transform(actual, INVERSE_EXPONENT, little).symbols;
    assert.deepEqual(inverse, pair);
    forward.push(little ? actual[1] * ALPHABET + actual[0] :
      actual[0] * ALPHABET + actual[1]);
  }
  assert.equal(new Set(forward).size, DOMAIN);
}

const expected = {
  floral3316: {
    decrypt: [0.034517591020819575, 0.03459491618861519],
    encrypt: [0.034432988190172605, 0.03438550144006754]
  },
  body3299: {
    decrypt: [0.034498757456501786, 0.03460114620248964],
    encrypt: [0.034442140340228425, 0.034383501184088165]
  }
};
const results = [];
for (const [scope, ciphertext] of [['floral3316', full], ['body3299', body]]) {
  for (const [reading, exponent] of
    [['decrypt', INVERSE_EXPONENT], ['encrypt', EXPONENT]]) {
    for (const little of [false, true]) {
      const decoded = transform(ciphertext, exponent, little);
      const restored = transform(decoded.symbols,
        reading === 'decrypt' ? EXPONENT : INVERSE_EXPONENT, little);
      assert.deepEqual(restored.symbols, ciphertext);
      const index = Number(little);
      assert.ok(Math.abs(ioc(decoded.symbols) -
        expected[scope][reading][index]) < 1e-14);
      let byteRangePairs = 0;
      let printableAsciiPairs = 0;
      for (let i = 0; i + 1 < decoded.symbols.length; i += 2) {
        const pairValue = little
          ? decoded.symbols[i + 1] * ALPHABET + decoded.symbols[i]
          : decoded.symbols[i] * ALPHABET + decoded.symbols[i + 1];
        if (pairValue < 256) byteRangePairs++;
        if (pairValue >= 32 && pairValue <= 126) printableAsciiPairs++;
      }
      if (scope === 'floral3316') {
        const expectedByteRange = {
          decrypt: [490, 502], encrypt: [485, 510]
        };
        assert.equal(byteRangePairs, expectedByteRange[reading][index]);
      }
      results.push({
        byteRangePairs, printableAsciiPairs,
        scope, reading, digitOrder: little ? 'low-first' : 'high-first',
        runeCount: ciphertext.length,
        cipherIoC: ioc(ciphertext),
        decodedIoC: ioc(decoded.symbols),
        ciphertextDoublets: doubles(ciphertext),
        decodedDoublets: doubles(decoded.symbols),
        maximumCycleIterations: decoded.maxSteps,
        meanCycleIterations: decoded.averageSteps,
        first40Gp: decoded.symbols.slice(0, 40)
          .map(x => corpus.translit[x]).join('.')
      });
    }
  }
}

// A source-native plaintext plant exercises the complete inverse on the
// original layout. The actual p57 text is a clear GP passage of 95 glyphs.
const plant = Array.from({length: full.length},
  (_, i) => corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
assert.ok(ioc(plant) > 0.05);
for (const little of [false, true]) {
  const encrypted = transform(plant, EXPONENT, little).symbols;
  const decrypted = transform(encrypted, INVERSE_EXPONENT, little).symbols;
  assert.deepEqual(decrypted, plant);
}
console.log(JSON.stringify({
  source: 'original LP2 pp40-55, p15 spiral and all visible floral red ink',
  modulus: MOD, exponent: EXPONENT, inverseExponent: INVERSE_EXPONENT,
  completePairAlphabet: DOMAIN, fullRunes: full.length,
  titlelessRunes: body.length, redPrimeSum,
  nativePlaintextPlantIoC: ioc(plant),
  results,
  verdict: 'Every source-parameterized pair-codec inverse remains GP29 noise-like. No original unknown LP2 plaintext recovered.'
}, null, 2));
