'use strict';

/**
 * Source-root24 literal polynomial-division inverse, original floral chapters.
 * Read-only Node22 Windows SFT.
 *
 * The independently printed red headings at physical p40/p54 vanish at
 * x=3301 mod29 = 24. Under the same high-first polynomial coefficient
 * convention, test the literal human-simple operation "divide the
 * following original body polynomial by (x-24)".
 *
 * Distinct from preceding fixed periodic keys and h <- 24h+C,
 * P=C±h consumers: division emits P_i=C_i+24*P_(i-1).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mod = (x) => ((x % 29) + 29) % 29;
const root = 3301 % 29;
assert.equal(root, 24);

/** High-first polynomial division by x-root. */
function divide(cipher) {
  assert(cipher.length > 1);
  const quotient = [];
  let prior = 0;
  for (let i = 0; i < cipher.length - 1; i++) {
    const value = mod(cipher[i] + root * prior);
    quotient.push(value);
    prior = value;
  }
  const remainder = mod(cipher.at(-1) + root * prior);
  return { quotient, remainder };
}

/** Monic polynomial product with x-root, then add scalar remainder. */
function multiply(plain, remainder) {
  const out = Array(plain.length + 1);
  out[0] = plain[0];
  for (let i = 1; i < plain.length; i++)
    out[i] = mod(plain[i] - root * plain[i - 1]);
  out[out.length - 1] = mod(-root * plain.at(-1) + remainder);
  return out;
}

function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}

function runes(first, last) {
  return corpus.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
}
const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
const data = [
  { start: 40, end: 53, red: 8, body: 3000, expectedRemainder: 13,
    expectedIoC: 0.03444332455937614 },
  { start: 54, end: 55, red: 9, body: 299, expectedRemainder: 7,
    expectedIoC: 0.03493548459991413 },
];
const observed = [];

for (const v of data) {
  const joined = runes(v.start, v.end);
  const heading = joined.slice(0, v.red);
  const body = joined.slice(v.red);
  assert.equal(body.length, v.body);
  let headingSyndrome = 0;
  for (const h of heading) headingSyndrome = mod(root * headingSyndrome + h);
  assert.equal(headingSyndrome, 0);
  const result = divide(body);
  assert.equal(result.remainder, v.expectedRemainder);
  assert.equal(result.quotient.length, v.body - 1);
  assert(Math.abs(ioc(result.quotient) - v.expectedIoC) < 1e-12);
  assert.deepEqual(multiply(result.quotient, result.remainder), body);

  const nativePlant = Array.from({ length: body.length - 1 },
    (_, i) => native[i % native.length]);
  const codeword = multiply(nativePlant, 0);
  assert.deepEqual(divide(codeword),
    { quotient: nativePlant, remainder: 0 });
  observed.push({
    source: 'p' + v.start + '..p' + v.end,
    root: root,
    headingRunes: v.red,
    originalBodyRunes: body.length,
    originalBodyIoC: ioc(body),
    quotientRunes: result.quotient.length,
    quotientIoC: ioc(result.quotient),
    originalRemainder: result.remainder,
    quotientFirst80: result.quotient.slice(0, 80)
      .map(x => corpus.translit[x]).join(''),
    originalCipherReplay: 'exact',
    sourceNativePositive: nativePlant.length + '/' + nativePlant.length,
  });
}
console.log(JSON.stringify({
  hypothesis: 'literal high-first original body polynomial / (x-3301 mod29)',
  positiveLength: native.length,
  nativeClearPageIoC: ioc(native),
  results: observed,
  verdict: 'No source-native GP plaintext, despite exact division inverse on all original symbols and independent positive plants.'
}, null, 2));
