'use strict';

/**
 * Original p39 double root / p50 32-row table / 16x203 floral candidate:
 * derive the 2 required GF29 systematic parity symbols per 203-rune row,
 * then test original selected fifth table column or whole-row means.
 * Windows Node22, read only, self-contained, no dependencies/network.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '..');
/** @param {string} p */
const read = (p) => JSON.parse(fs.readFileSync(path.join(dir, p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const table = read('resources/liber-primus/lp2-grid-256.json');
const solved = read('resources/external/relikd-solved-gp29-native-v1.json');
/** @param {number} x */
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number} x @param {number} n */
function power(x, n) {
  let k = 1;
  for (let i = 0; i < n; i++) k = mod(k * x);
  return k;
}
/** @param {number[]} digits */
function root24(digits) {
  let p = 0, dp = 0;
  for (const c of digits) { dp = mod(24 * dp + p); p = mod(24 * p + c); }
  return [p, dp];
}
assert.deepEqual(corpus.pages.find((p) => p.page === 39).indices.slice(119, 122), [27, 5, 15]);
assert.equal(mod(27 + 5 * 24 + 15 * 24 * 24), 0);
assert.equal(mod(5 + 2 * 15 * 24), 0);
assert.equal(power(24, 203), 1);
assert.equal(mod(203 * power(24, 202)), 0); // x^203 -1 has a repeated root at24

const red = new Map(ink.pages.map((p) => [p.page, p.red_spans || []]));
const black = [];
for (let p = 40; p <= 55; p++) {
  const page = corpus.pages.find((q) => q.page === p);
  for (let j = 0; j < page.indices.length; j++) {
    if (!(red.get(p) || []).some((s) => j >= s.start && j < s.start + s.length)) black.push(page.indices[j]);
  }
}
assert.equal(black.length, 16 * 203);
const rows = Array.from({ length: 16 }, (_, k) => black.slice(k * 203, (k + 1) * 203));
/**
 * Required systematic parity at either end of an original 203-coefficient
 * row P(x). The resulting 205-coefficient codeword F(x) satisfies
 * F(24)=0 and F'(24)=0, i.e., (x-24)^2 divides F(x).
 * @param {number[]} row
 */
function parity(row) {
  assert.equal(row.length, 203);
  const [f, d] = root24(row);
  const ua = mod(-2 * 24 * f - 24 * 24 * d);
  const va = mod(-24 * 24 * f - 24 * ua);
  const up = mod(-d), vp = mod(-24 * up - f);
  assert.deepEqual(root24(row.concat([ua, va])), [0, 0]);
  assert.deepEqual(root24([up, vp].concat(row)), [0, 0]);
  return { app: [ua, va], pre: [up, vp] };
}
const output = rows.map(parity);
assert.deepEqual(output.slice(0, 4).map((p) => p.app), [[6,3],[12,15],[25,16],[17,4]]);
const srcTokens = table.pages.flatMap((p) => p.tokens);
const srcBytes = table.pages.flatMap((p) => p.bytes);
assert.equal(srcTokens.length, 256);
assert.equal(srcBytes.length, 256);
assert.equal(srcTokens[0], '3N');
assert.equal(srcBytes[0], 203);
const abc60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const abc59 = abc60.replace('f', '');
assert.equal(abc60.length, 60);
assert.equal(abc59.length, 59);
/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const hi = alphabet.indexOf(token[0]), lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}
assert.deepEqual(srcTokens.map((t) => decode(t, abc60)), srcBytes);

/**
 * The most an arbitrary fixed single-valued field-symbol substitution can
 * match: each source symbol must have a single output value everywhere.
 * @param {number[]} source
 * @param {number[]} target
 */
function bestUnknownMapping(source, target) {
  const lookup = new Map();
  for (let k = 0; k < source.length; k++) {
    let counts = lookup.get(source[k]);
    if (!counts) { counts = new Map(); lookup.set(source[k], counts); }
    counts.set(target[k], (counts.get(target[k]) || 0) + 1);
  }
  let accepted = 0;
  for (const counts of lookup.values()) accepted += Math.max(...counts.values());
  return accepted;
}
/** @param {'app'|'pre'} side @param {'inter'|'blocked'} layout */
function expected(side, layout) {
  return layout === 'inter'
    ? output.flatMap((r) => r[side])
    : output.map((r) => r[side][0]).concat(output.map((r) => r[side][1]));
}
/** @param {number[]} lhs @param {number[]} rhs */
function score(lhs, rhs) {
  const matches = lhs.filter((x, j) => x === rhs[j]).length;
  const upperBoundWithUnknownSymbolMap = bestUnknownMapping(lhs, rhs);
  return { matches, upperBoundWithUnknownSymbolMap };
}
const primary = srcBytes.filter((_, j) => j % 8 === 4).map((x) => x % 29);
const primaryResult = score(primary, expected('app', 'inter'));
assert.deepEqual(primaryResult, {matches: 4, upperBoundWithUnknownSymbolMap: 22});
const meanSums = Array.from({length: 32}, (_, r) =>
  srcBytes.slice(r * 8, (r + 1) * 8).reduce((a, b) => a + b, 0));
const rowArithmeticMean = meanSums.map((n) => Math.floor(n / 8 + 0.5) % 29);
const rowFieldMean = meanSums.map((n) => mod(11 * n)); // 8^-1 = 11 (mod29)
assert.equal(score(rowArithmeticMean, expected('app','inter')).matches, 1);
assert.equal(score(rowFieldMean, expected('app','inter')).matches, 1);
const variants = [];
for (const alphabet of [abc60, abc59]) {
  const radix = alphabet.length;
  for (let column = 0; column < 8; column++) {
    const source = Array.from({length: 32}, (_, r) => decode(srcTokens[r*8+column], alphabet) % 29);
    for (const side of ['app', 'pre']) for (const layout of ['inter', 'blocked']) {
      for (const reverse of [false, true]) {
        let target = expected(side, layout);
        if (reverse) target = target.slice().reverse();
        const result = score(source, target);
        variants.push({radix, column, side, layout, reverse, ...result});
      }
    }
  }
}
assert.equal(variants.length, 128);
const maxExact = Math.max(...variants.map((v) => v.matches));
const maxSecretMap = Math.max(...variants.map((v) => v.upperBoundWithUnknownSymbolMap));
assert.equal(maxExact, 4);
assert.equal(maxSecretMap, 23);

// An actual solved-native GP29 word stream is completed with exactly computed
// parity, and both possible original word carry / end conventions reconstruct it.
const runeMap = new Map(solved.runes.map((r, i) => [r, i]));
const native = Array.from(solved.sections.find((s) => s.name === '0_welcome').source_text)
  .filter((ch) => runeMap.has(ch)).map((ch) => runeMap.get(ch)).slice(0, 203);
assert.equal(native.length, 203);
const positive = parity(native);
assert.deepEqual(root24(native.concat(positive.app)), [0, 0]);
assert.deepEqual(root24(positive.pre.concat(native)), [0, 0]);
console.log(JSON.stringify({
  status: 'PASS',
  originalBlackRegister: '16x203 (3248 symbols)',
  directSourceSelectedFifthColumn: primaryResult,
  sourceMeanRow: {arithmeticNearest: score(rowArithmeticMean, expected('app','inter')),
    fieldMean: score(rowFieldMean, expected('app','inter'))},
  exploratoryNaturalTableSerializations: {variants: 128, highestExactMatches: maxExact,
    highestUnderArbitraryFixedSymbolLookup: maxSecretMap,
    bestVariants: variants.filter((v) => v.matches === maxExact)},
  nativePositive: '203/203 GP runes parity exact, both append and prepend',
  scope: 'No direct 32-parity field through one printed column or row mean, no original authenticated code'
}, null, 2));
