'use strict';

/**
 * Original LP2 p7 -> p8 adjacent red-product state packet and bounded
 * F-transparent key-clock receivers, without fitting output-dependent keys.
 * Run: node sims/lp2_p7_p8_red_product_keyclock_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} xs @returns {number} */
const product29 = (xs) => xs.reduce((p, x) => mod(p * x), 1);
/** @param {number} n @param {number} exponent @returns {number} */
function power29(n, exponent) {
  let out = 1;
  for (let k = 0; k < exponent; k++) out = mod(out * n);
  return out;
}
const p6 = page(6);
const p7 = page(7);
const p8 = page(8);
const p57 = page(57);
assert.equal(p6.length, 196);
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p57.length, 95);

const p7Red = p7.slice(194);
const length5 = [2, 4, 3, 2, 3];
const fiveWords = [];
for (let i = 0, offset = 0; i < length5.length; i++) {
  fiveWords.push(p7Red.slice(offset, offset + length5[i]));
  offset += length5[i];
}
assert.deepEqual(fiveWords, [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
]);
const products7 = fiveWords.map(product29);
assert.deepEqual(products7, [11, 26, 8, 15, 2]);
const state = {
  p: fiveWords[0][0],
  e: fiveWords[0][1],
  g: fiveWords[2][0],
  q: mod(products7.reduce((s, x) => s + x, 0)),
  A: products7[2]
};
assert.deepEqual(state, { p: 23, e: 3, g: 5, q: 4, A: 8 });

// Original p8 heading contains two consecutive printed red words of lengths
// 4 and 8, confirmed against original ink/transcription, not tuned after fit.
const heading = p8.slice(0, 12);
const redWords = [heading.slice(0, 4), heading.slice(4)];
assert.deepEqual(redWords, [
  [14, 10, 14, 19], [1, 14, 19, 5, 2, 13, 3, 17]
]);
const products8 = redWords.map(product29);
const primeSums8 = redWords.map((w) =>
  w.reduce((sum, rune) => sum + corpus.prime[rune], 0));
const indexSums8 = redWords.map((w) =>
  w.reduce((sum, rune) => sum + rune, 0));
assert.deepEqual(products8, [state.q, state.e]);
assert.deepEqual(redWords.map((w) => w.length), [state.q, state.A]);
assert.deepEqual(indexSums8, [57, 74]);
assert.deepEqual(primeSums8, [196, 250]);
assert.equal(primeSums8[0], p6.length);
assert.ok(heading.every((r) => r > 0 && r < state.p));
const black = p8.slice(12);
assert.equal(black.length, state.e ** state.g);
assert.deepEqual(ink.pages.find((p) => p.page === 8).red_spans
  .map(({ start, length }) => [start, length]), [[0, 12]]);

// A source-shaped 29-rune additive key clock: a printed seed and step/ratio.
// Exact p56 plaintext-F bypass: P=0 gives C=0 and does not consume key;
// nonzero plaintext consumes one shift; nonzero ciphertext can never
// represent a bypassed F. Unknown F choices are explored exactly by DP.
const schedules = [
  ['geometric-q-e', (t) => mod(state.q * power29(state.e, t % 28))],
  ['geometric-e-q', (t) => mod(state.e * power29(state.q, t % 28))],
  ['linear-q-e', (t) => mod(state.q + state.e * t)],
  ['linear-e-q', (t) => mod(state.e + state.q * t)],
  ['geometric-q-g', (t) => mod(state.q * power29(state.g, t % 28))],
  ['geometric-e-g', (t) => mod(state.e * power29(state.g, t % 28))]
];

/**
 * @param {number[]} ciphertext
 * @param {(clock:number)=>number} schedule
 * @param {number} sign
 * @returns {{legal:boolean, failOffset:number|null, terminalClocks:number[]}}
 */
function feasible(ciphertext, schedule, sign) {
  let possibleClocks = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    const c = ciphertext[i];
    for (const clock of possibleClocks) {
      const key = schedule(clock);
      const p = mod(c - sign * key);
      if (p !== 0) next.add(clock + 1);
      if (c === 0) next.add(clock);
    }
    if (next.size === 0) return {
      legal: false, failOffset: i, terminalClocks: []
    };
    possibleClocks = next;
  }
  return {
    legal: true, failOffset: null,
    terminalClocks: [...possibleClocks].sort((a, b) => a - b)
  };
}

/**
 * Source-native positive plant, an exactly genuine forward encoder.
 * @param {number[]} clear
 * @param {(clock:number)=>number} schedule
 * @param {number} sign
 * @returns {number[]}
 */
function encode(clear, schedule, sign) {
  let clock = 0;
  return clear.map((p) => {
    if (p === 0) return 0;
    const c = mod(p + sign * schedule(clock));
    clock++;
    return c;
  });
}

const positive = [...p57, ...p57, ...p57.slice(0, 53)];
assert.equal(positive.length, black.length);
const results = [];
for (const [name, schedule] of schedules) {
  for (const sign of [-1, 1]) {
    const planted = encode(positive, schedule, sign);
    assert.equal(feasible(planted, schedule, sign).legal, true,
      'positive p57 original-plaintext plant failed ' + name);
    const result = feasible(black, schedule, sign);
    assert.equal(result.legal, false,
      'unexpected complete original p8 inverse');
    results.push({
      schedule: name, sign, firstImpossibleLocalBlackOffset: result.failOffset,
      firstImpossibleAbsolutePageRune: result.failOffset + 12,
      positiveRoundtrip: true
    });
  }
}
assert.equal(results.length, 12);
assert.deepEqual(results.map((r) => r.firstImpossibleLocalBlackOffset), [
  17, 39, 68, 4, 60, 15, 40, 42, 1, 15, 11, 7
]);

console.log(JSON.stringify({
  source: {
    p7FiveWordProducts: products7,
    p7State: state,
    p8HeadingWordLengths: redWords.map((w) => w.length),
    p8HeadingWordProducts: products8,
    p8HeadingIndexSums: indexSums8,
    p8HeadingPrimeSums: primeSums8,
    p8BlackLength: black.length,
    allP8HeadingSymbolsInGF23Nonzero: true,
    sourceSelectedP6PageLength: p6.length
  },
  tested: 'p8 black243, source-derived seed/step GP29 key clocks, exact plaintext-F bypass',
  results,
  conclusion: 'All 12 source-shaped p8 key clocks become impossible before rune69, with all 12 original native-positive plants recovered exactly.'
}, null, 2));
