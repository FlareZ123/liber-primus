'use strict';
/**
 * Critic's complete original-input GF(257) polynomial-root/page-length census.
 * Deterministic fixed-source-multiset null, no plaintext fitting.
 * Run with Node.js 22 from any working directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} file @returns {any} */
const load = file => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
  'liber-primus', file), 'utf8'));
const corpus = load('lp2-corpus.json');
const grid = load('lp2-grid-256.json');
const pages = corpus.pages.filter(page => page.page <= 55 && page.page !== 50);
assert.equal(pages.length, 55);
const targets = [...new Set(pages.map(page => page.runic_count)
  .filter(length => length < 257))].sort((a, b) => a - b);
const sources = pages.map(page => ({ page: page.page, symbols: page.indices }));
sources.push({ page: 'p50-table', symbols: grid.bytes });
assert.equal(sources.length, 56);
assert.equal(targets.length, 21);

/** @param {number[]} symbols @param {number} x @returns {number} */
function evaluate(symbols, x) {
  let value = 0;
  for (const symbol of symbols) value = (value * x + symbol) % 257;
  return value;
}
/** @param {number[]} symbols @returns {number[]} */
function roots(symbols) {
  return Array.from({ length: 257 }, (_, index) => index)
    .filter(x => evaluate(symbols, x) === 0);
}
/** @param {number[]} symbols @returns {boolean} */
function hasPageLengthRoot(symbols) {
  return targets.some(x => evaluate(symbols, x) === 0);
}
const observed = sources.map(source => {
  const r = roots(source.symbols);
  const matching = r.filter(x => targets.includes(x));
  return { page: source.page, roots: r, pageLengthRoots: matching };
}).filter(item => item.pageLengthRoots.length > 0);
assert.deepEqual(observed.map(item => [item.page, item.pageLengthRoots]), [
  [19, [238]], [26, [201, 228]], [29, [121]], [36, [196]],
  [51, [214]], ['p50-table', [213]]
]);
assert.equal(observed.filter(item => item.roots.length === 1).length, 4);

let seed = 0xC1CADA26;
/** @returns {number} */
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const N = 1200;
const frequency = Array(57).fill(0);
const permuted = sources.map(source => source.symbols.slice());
let total = 0;
let tail = 0;
for (let trial = 0; trial < N; trial++) {
  let hits = 0;
  for (const symbols of permuted) {
    // Deterministic Fisher-Yates preserves each original page's symbol histogram.
    for (let i = symbols.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      const temp = symbols[i];
      symbols[i] = symbols[j];
      symbols[j] = temp;
    }
    if (hasPageLengthRoot(symbols)) hits++;
  }
  frequency[hits]++;
  total += hits;
  if (hits >= observed.length) tail++;
}
assert.equal(total, 5183);
assert.equal(tail, 304);
console.log(JSON.stringify({
  fixedOriginalSourceCount: sources.length,
  distinctRunicPageLengthsBelow257: targets.length,
  exactMatches: observed,
  observedMatchedSources: observed.length,
  null: '1200 within-source symbol-multiset permutations, xorshift32 0xC1CADA26',
  nullMean: total / N,
  nullTailAtLeastSix: tail,
  nullTailFraction: tail / N,
  histogram: frequency.map((count, hits) => ({ hits, count })).filter(x => x.count)
}, null, 2));
