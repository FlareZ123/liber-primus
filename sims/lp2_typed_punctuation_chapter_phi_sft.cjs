'use strict';

/**
 * One source-fixed type-aware punctuation cipher clock on LP2.
 * Original nine red-heading physical chapters reset authentic p56 phi(prime)
 * key; all diamond stops and inline ten-/thirteen-dot stencil punctuation
 * pass through without clock advancement, as demonstrated by solved p56.
 *
 * Reproduce: node sims/lp2_typed_punctuation_chapter_phi_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = rel => JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
const gp = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const punct = load('resources/liber-primus/lp2-punctuation-identity.json');
const byPage = new Map(gp.pages.map(p => [p.page, p]));
const byInk = new Map(ink.pages.map(p => [p.page, p]));
const firstPages = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const lastPages = [2, 7, 14, 22, 26, 32, 39, 53, 55];
const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(punct.source_audit.counts.visible_all_marks_including_31_large, 175);
assert.deepEqual([punct.events.filter(e => e.symbol === '⁜').length,
  punct.events.filter(e => e.symbol === '⁘').length,
  punct.events.filter(e => e.symbol === '⁚').length], [31, 145, 4]);
assert.equal(gp.runes.length, 29);

/** @param {number} n @returns {number[]} The first n ordinary primes. */
function primes(n) {
  const a = [2];
  for (let c = 3; a.length < n; c += 2) {
    let p = true;
    for (let f = 3; f * f <= c; f += 2) {
      if (c % f === 0) { p = false; break; }
    }
    if (p) a.push(c);
  }
  return a;
}
const key = primes(3010).map(p => (p - 1) % 29);
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} values @param {number} sign Encryption=+1, inverse=-1. */
function cipher(values, sign) {
  return values.map((v, i) => mod(v + sign * key[i]));
}
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) { assert(v >= 0 && v <= 28); counts[v]++; }
  return counts.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

const original = [], output = [], planted = [], rows = [];
const native = byPage.get(57).indices;
assert.equal(native.length, 95);
for (let i = 0; i < firstPages.length; i++) {
  const start = firstPages[i];
  assert.equal(byInk.get(start).red_spans[0].start, 0);
  let c = [];
  for (let p = start; p <= lastPages[i]; p++) c.push(...byPage.get(p).indices);
  assert.equal(c.length, lengths[i]);
  let dec = cipher(c, -1);
  assert.deepEqual(cipher(dec, +1), c);
  const text = Array.from({length: c.length}, (_, j) => native[j % native.length]);
  assert.deepEqual(cipher(cipher(text, +1), -1), text);
  original.push(...c); output.push(...dec); planted.push(...text);
  rows.push({pages: start + '-' + lastPages[i], runes: c.length,
    inverseIoC: Number(ioc(dec).toFixed(9)),
    opening: dec.slice(0, 10).map(x => gp.translit[x]).join(' ')});
}
assert.equal(original.length, 12956);

// Authentic solved p56 starts "AN END[4-dot stop] W...": the first six
// ciphertext runes must all take successive primes, despite the stop.
assert.deepEqual(byPage.get(56).indices.slice(0, 6), [25,11,22,15,4,19]);
assert.deepEqual(cipher(byPage.get(56).indices.slice(0, 6), -1),
  [24,9,18,9,23,7]);

const result = {
  originalRunes: original.length,
  typedMarks: '138 original four-dot, 5 three-dot, 31 large, 1 ambiguous',
  state: 'reset phi prime at nine red-heading starts; marks are no-ops',
  numericP50: 'no runes, no key advance',
  originalIoC: ioc(original),
  decodedIoC: ioc(output),
  withheldP40P55IoC: ioc(output.slice(9640)),
  syntheticNativeIoC: ioc(planted),
  recoveredSyntheticSymbols: planted.length,
  solvedP56FirstSix: 'AN END W (passes real four-dot stop)',
  nineChapters: rows,
  verdict: 'no unknown LP2 plaintext from this source-selected transfer'
};
assert(result.decodedIoC < 0.039);
assert(result.withheldP40P55IoC < 0.04);
assert(result.syntheticNativeIoC > 0.055);
console.log(JSON.stringify(result, null, 2));
