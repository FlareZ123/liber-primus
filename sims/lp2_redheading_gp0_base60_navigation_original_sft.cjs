'use strict';
/**
 * LP2 red-heading GP0 -> 256-cell base60 page-navigation test.
 *
 * Upstream clue: the authenticated 2016 text says that the book's words
 * are the map and their numbers the direction. The *printed, red* chapter
 * headings and base60 numerical table are author-visible inputs.
 *
 * This is a candidate navigation mechanism, not a cipher inverse.
 * Explicitly charge the GP-index/GP-prime, split-red-heading, and
 * zero/one-based-cell alternatives in the control null.
 *
 * Windows Node.js 22, CommonJS, no dependencies or file mutations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {unknown} */
const load = (filename) => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const grid = load('resources/liber-primus/base60-grid.json');
const starts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const startsSet = new Set(starts);
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(grid.alphabet.length, 60);
assert.equal(ink.pages.length >= 56, true);
assert.equal(corpus.pages.length, 58);
assert.deepEqual(grid.rows.flat().map(token =>
  grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1])), bytes);

const headings = starts.map(page => {
  const markings = ink.pages.find(item => item.page === page);
  assert(markings, 'missing red ink page ' + page);
  const spans = markings.red_spans
    .filter(span => span.start === 0 || (page === 15 && span.start === 9));
  const expected = page === 15 ? [[0, 9], [9, 11]] : [[0, spans[0].length]];
  assert.deepEqual(spans.map(span => [span.start, span.length]), expected);
  const values = spans.flatMap(span => corpus.pages[page].indices
    .slice(span.start, span.start + span.length));
  assert.equal(values.length, spans.reduce((s, v) => s + v.length, 0));
  const first = corpus.pages[page].indices.slice(0, spans[0].length);
  /** @param {number[]} indices */
  const gp0 = indices => indices.reduce((sum, index) => sum + index, 0);
  /** @param {number[]} indices */
  const gpPrime = indices => indices.reduce(
    (sum, index) => sum + corpus.prime[index], 0);
  return {page, length: values.length,
    gp0: gp0(values), prime: gpPrime(values),
    firstGP0: gp0(first), firstPrime: gpPrime(first)};
});
assert.deepEqual(headings.map(x => x.length), [13, 16, 12, 20, 16, 19, 10, 8, 9]);
assert.deepEqual(headings.map(x => x.gp0),
  [181, 208, 131, 284, 220, 305, 109, 116, 159]);
assert.deepEqual(headings.map(x => x.prime),
  [662, 742, 446, 1068, 786, 1109, 379, 435, 597]);

/**
 * @param {number[]} table
 * @param {number[]} addresses
 * @returns {{inside:number,solved:number,sentinel:number,longest:number,chain:number[],edges:number[][]}}
 */
function measure(table, addresses) {
  const edges = starts.map((page, i) => [page, table[addresses[i]]]);
  const map = new Map(edges);
  let inside = 0, solved = 0, sentinel = 0, longest = 0, chain = [];
  for (const [source, destination] of edges) {
    if (startsSet.has(destination)) inside++;
    if (destination === 56 || destination === 57) solved++;
    if (destination === 58) sentinel++;
    const seen = new Set();
    const walk = [];
    let current = source;
    while (startsSet.has(current) && !seen.has(current)) {
      seen.add(current);
      walk.push(current);
      current = map.get(current);
    }
    if (walk.length > longest) {
      longest = walk.length;
      chain = walk;
    }
  }
  return {inside, solved, sentinel, longest, chain, edges};
}

/**
 * @param {number[]} table
 * @param {number[]} addresses
 * @returns {boolean}
 */
function success(table, addresses) {
  const {longest, solved} = measure(table, addresses);
  return longest >= 3 && solved >= 1;
}

const variants = [];
for (const kind of ['GP0', 'prime']) {
  for (const firstOnly of [false, true]) {
    for (const offset of [0, -1]) {
      const addresses = headings.map(item => {
        const field = firstOnly
          ? (kind === 'GP0' ? 'firstGP0' : 'firstPrime')
          : (kind === 'GP0' ? 'gp0' : 'prime');
        const number = item[field];
        assert(Number.isInteger(number));
        return ((number + offset) % 256 + 256) % 256;
      });
      variants.push({kind, firstOnly, offset, addresses,
        observed: measure(bytes, addresses)});
    }
  }
}
const primary = variants[0];
assert.deepEqual(primary.addresses,
  [181, 208, 131, 28, 220, 49, 109, 116, 159]);
assert.deepEqual(primary.observed.edges,
  [[0, 40], [3, 57], [8, 120], [15, 150], [23, 58],
   [27, 16], [33, 184], [40, 54], [54, 248]]);
assert.deepEqual(primary.observed.chain, [0, 40, 54]);
assert.deepEqual([primary.observed.inside, primary.observed.solved,
  primary.observed.sentinel, primary.observed.longest], [2, 1, 1, 3]);
assert(variants.every(v => success(bytes, v.addresses) ===
  (v.kind === 'GP0' && v.offset === 0)));

/* Positive control: physically transplant the four directed pointers into
 * an unrelated permutation, preserving the entire byte multiset. */
const planted = bytes.slice().reverse();
const fixed = new Set();
for (const [address, desired] of [[181, 40], [116, 54], [208, 57], [220, 58]]) {
  const old = planted.findIndex((v, i) => v === desired && !fixed.has(i));
  assert(old >= 0);
  [planted[address], planted[old]] = [planted[old], planted[address]];
  fixed.add(address);
}
assert.deepEqual([...planted].sort((a, b) => a - b),
  [...bytes].sort((a, b) => a - b));
assert(success(planted, primary.addresses));
assert.equal(measure(planted, primary.addresses).sentinel, 1);

/** @returns {number} deterministic xorshift32 draw */
let rngState = 0x2f330101;
function random32() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
const trials = 150000;
let primaryHits = 0, familyHits = 0, chainHits = 0, fullHits = 0;
for (let run = 0; run < trials; run++) {
  const permuted = bytes.slice();
  for (let i = permuted.length - 1; i > 0; i--) {
    // Float scaling avoids the low-bit pathology of LCG modulo shuffles.
    const j = Math.floor((random32() / 4294967296) * (i + 1));
    [permuted[i], permuted[j]] = [permuted[j], permuted[i]];
  }
  const metric = measure(permuted, primary.addresses);
  if (metric.longest >= 3) chainHits++;
  if (metric.longest >= 3 && metric.solved >= 1 && metric.sentinel >= 1)
    fullHits++;
  if (metric.longest >= 3 && metric.solved >= 1) primaryHits++;
  if (variants.some(v => success(permuted, v.addresses))) familyHits++;
}
assert.deepEqual({primaryHits, familyHits}, {primaryHits: 115, familyHits: 548});
assert(chainHits >= primaryHits && primaryHits >= fullHits);
const parable = corpus.pages[57].indices.slice(0, 7);
const parableGP0 = parable.reduce((sum, i) => sum + i, 0);
assert.equal(parableGP0, 120);
assert.equal(bytes[parableGP0], 42);

console.log(JSON.stringify({
  classification: 'exploratory source-selected page-navigation candidate; no plaintext',
  headings, primary: primary.observed,
  otherInterpretations: variants.slice(1).map(v => ({
    kind: v.kind, firstOnly: v.firstOnly, offset: v.offset,
    internalEdges: v.observed.inside, longest: v.observed.longest,
    solvedLinks: v.observed.solved
  })),
  independentSolvedPageReadout: {
    sourcePage: 57, title: 'PARABLE', gp0: parableGP0, tableValue: 42,
    note: 'observed only; not a locked holdout'
  },
  shuffledSourceTable: {
    trials, seed: '0x2f330101', fixedMultiset: true,
    primaryHits, primaryProbability: primaryHits / trials,
    eightVariantFamilyHits: familyHits, familyProbability: familyHits / trials,
    chainHits, chainProbability: chainHits / trials,
    chainSolvedAndSentinelHits: fullHits
  },
  caveat: 'The cipher, key, starting page, alternate numbering, and use of GP0 sums remain unauthenticated.'
}, null, 2));
