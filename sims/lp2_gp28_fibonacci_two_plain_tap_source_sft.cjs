'use strict';
/**
 * Original LP2 two-plaintext-tap Fibonacci GP28 difference cipher.
 * Node.js 22, CommonJS, read-only single-file test. No external packages.
 * The proposed cipher is conditional: it is not an authenticated Cicada rule.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const shakespeare = fs.readFileSync(path.join(ROOT, 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8');
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const names = corpus.translit;
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
assert.equal(names.length, 29);

const mod = (x, n) => ((x % n) + n) % n;
/** @param {number[]} runes @returns {number} Normalized GP29 index of coincidence. */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return 29 * counts.reduce((s, c) => s + c * (c - 1), 0) / (runes.length * (runes.length - 1));
}
/**
 * P[0],P[1] are independent secret starting symbols in 0..27.
 * For nonrepeat C[i], D=(C[i]-C[i-1]-1) mod29 is 0..27.
 * Decode P[i]=(D-P[i-1]-P[i-2]) mod28. A repeat decodes as EA=28,
 * contributing zero to subsequent modulo-28 state updates.
 * @param {number[]} ciphertext @param {number} p0 @param {number} p1
 * @returns {number[]}
 */
function decode(ciphertext, p0, p1) {
  const plain = [p0, p1];
  for (let i = 2; i < ciphertext.length; i++) {
    if (ciphertext[i] === ciphertext[i - 1]) plain.push(28);
    else {
      const digit = mod(ciphertext[i] - ciphertext[i - 1] - 1, 29);
      plain.push(mod(digit - plain[i - 1] - plain[i - 2], 28));
    }
  }
  return plain;
}
/** @param {number[]} plain @returns {number[]} */
function encode(plain) {
  const ciphertext = [13, 6];
  for (let i = 2; i < plain.length; i++) {
    if (plain[i] === 28) ciphertext.push(ciphertext[i - 1]);
    else {
      const digit = mod(plain[i] + plain[i - 1] + plain[i - 2], 28);
      ciphertext.push(mod(ciphertext[i - 1] + digit + 1, 29));
    }
  }
  return ciphertext;
}
/** Exhaust all 28^2 genuine secret initial plaintext symbols. */
function bestStart(ciphertext) {
  let best = { ioc: -1, first: -1, second: -1, decoded: [] };
  for (let a = 0; a < 28; a++) for (let b = 0; b < 28; b++) {
    const plain = decode(ciphertext, a, b);
    const score = ioc(plain);
    if (score > best.ioc) best = { ioc: score, first: a, second: b, decoded: plain };
  }
  return best;
}
/** Exact GP29 transliteration of clean English letter words. */
function gpText(text) {
  const byName = new Map(names.map((s, i) => [s, i]));
  const words = text.toUpperCase().replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/Q/g, 'CW').match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      const token = byName.has(pair) ? pair : word[i];
      assert.ok(byName.has(token), 'Unmapped GP token: ' + token);
      out.push(byName.get(token));
      i += token.length;
    }
  }
  return out;
}
const natural = gpText(shakespeare);
assert.equal(natural.length, 219090);
const originalChapters = [
  ['opening_p0_p2', pages.filter((p) => p.page <= 2).flatMap((p) => p.indices), 729],
  ['floral_p40_p53', pages.filter((p) => p.page >= 40 && p.page <= 53).flatMap((p) => p.indices), 3008]
];
const original = originalChapters.map(([name, ciphertext, length]) => {
  assert.equal(ciphertext.length, length);
  const best = bestStart(ciphertext);
  return { name, runes: length, original_normalized_ioc: ioc(ciphertext),
    maximum_of_all_784_seeds_normalized_ioc: best.ioc, best_seeds: [best.first, best.second],
    first40: best.decoded.slice(0, 40).map((c) => names[c]).join('') };
});
assert.ok(Math.abs(original[0].maximum_of_all_784_seeds_normalized_ioc - 1.0446758317128688) < 1e-10);
assert.ok(Math.abs(original[1].maximum_of_all_784_seeds_normalized_ioc - 1.0331053782309363) < 1e-10);

const planted = [0, 7000, 25000].map((offset) => {
  const plain = natural.slice(offset, offset + 729);
  const ciphertext = encode(plain);
  assert.deepEqual(decode(ciphertext, plain[0], plain[1]), plain);
  const best = bestStart(ciphertext);
  assert.ok(best.ioc + 1e-12 >= ioc(plain));
  return { offset, length: plain.length, plain_normalized_ioc: ioc(plain),
    encrypted_normalized_ioc: ioc(ciphertext),
    encrypted_repeats: ciphertext.slice(1).filter((c, i) => c === ciphertext[i]).length,
    seed_free_best_normalized_ioc: best.ioc, full_roundtrip: true };
});
assert.ok(planted.every((p) => p.seed_free_best_normalized_ioc > 1.65));
assert.ok(original.every((o) => o.maximum_of_all_784_seeds_normalized_ioc < 1.05));
console.log(JSON.stringify({ mechanism: 'GP28 predecessor-excluding Fibonacci two-plaintext-tap with EA zero-step',
  original, planted, verdict: 'No unknown LP2 plaintext recovered under this fixed reversible model.' }, null, 2));


// Independent physical-page state resets. Grant both new secret starting
// plaintext symbols on every one of the 55 original rune-bearing pages.
// Score within-page ordered equal-symbol pairs, without pooling alphabets
// across independently optimized pages.
function pairCount(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((s, c) => s + c * (c - 1), 0);
}
const resetPageBest = pages.map((page) => {
  const best = bestStart(page.indices);
  return { page: page.page, n: page.indices.length, numerator: pairCount(best.decoded),
    denominator: page.indices.length * (page.indices.length - 1) };
});
const weightedPageIoC = (rows) =>
  29 * rows.reduce((s, row) => s + row.numerator, 0) /
    rows.reduce((s, row) => s + row.denominator, 0);
const optimizedResetIoC = weightedPageIoC(resetPageBest);
assert.ok(Math.abs(optimizedResetIoC - 1.1112753520968237) < 1e-10);
const firstThreeResetIoC = weightedPageIoC(resetPageBest.filter((p) => p.page <= 2));
assert.ok(Math.abs(firstThreeResetIoC - 1.1501407255182272) < 1e-10);

function nativeResetIoC(nativeWindow) {
  let begin = 0, numerator = 0, denominator = 0;
  for (const page of pages) {
    const slice = nativeWindow.slice(begin, begin + page.indices.length);
    begin += page.indices.length;
    numerator += pairCount(slice);
    denominator += slice.length * (slice.length - 1);
  }
  assert.equal(begin, 12956);
  return 29 * numerator / denominator;
}
const independentNativeWindows = Array.from({ length: 10 }, (_, i) => {
  const offset = 20000 * i;
  return { offset, weighted_normalized_ioc: nativeResetIoC(natural.slice(offset, offset + 12956)) };
});
assert.ok(independentNativeWindows.every((x) => x.weighted_normalized_ioc > 1.70));
console.log(JSON.stringify({ additional_scope: 'arbitrary 28^2 plaintext starts at all 55 physical page boundaries',
  optimized_original_allpage_normalized_ioc: optimizedResetIoC,
  optimized_original_p0_p2_normalized_ioc: firstThreeResetIoC,
  independent_native_shakespeare_windows: independentNativeWindows,
  interpretation: 'The original maximum remains far below all ten native GP-English complete-size control windows.' }, null, 2));
