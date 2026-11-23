'use strict';

/**
 * Original LP2 adjacent-doublet gap autocorrelation under source-fixed nulls.
 *
 * Independent continuation of the preregistered external T7 gap statistic:
 * Dukotah/cicada3301 R44 W2-B3 RESULTS (2026-11-09).
 *
 * Run (Windows 11, Node.js 22):
 *   node sims/lp2_doublet_gap_sourceconditioned_null_sft.cjs
 *
 * No plaintext fit, no key search, no external packages, no file writes.
 * Nulls preserve the *exact original observed site count per source stratum*.
 * Samples draw site positions uniformly without replacement in each stratum.
 *
 * Interpretation is only conditional: this test does NOT identify the
 * mechanism that emitted source doublets or recover an LP2 plaintext/key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const text = read('resources/liber-primus/lp2-transcription.txt');
const original = book.pages.filter(p => p.page <= 55);
const words = text.replace(/[\/\n\r%&$\s]/g, '').split(/[-.]/)
  .filter(w => /[\u16A0-\u16FF]/u.test(w)).slice(0, 2896);
assert.equal(words.length, 2896);

const wordStarts = new Set();
let wordOffset = 0;
for (const word of words) {
  if (wordOffset) wordStarts.add(wordOffset);
  wordOffset += Array.from(word).length;
}
assert.equal(wordOffset, 12956);
const runeIndex = new Map(book.runes.map((r, i) => [r, i]));
const fromWords = words.flatMap(w => Array.from(w, r => {
  const index = runeIndex.get(r);
  assert.notEqual(index, undefined);
  return index;
}));
assert.deepEqual(fromWords, original.flatMap(p => p.indices));

/** @typedef {{position:number,page:number,across:boolean}} Site */
const eligible = [];
const doubled = [];
let offset = 0;
for (const page of original) {
  for (let i = 1; i < page.indices.length; i++) {
    const site = {
      position: offset + i, page: page.page,
      across: wordStarts.has(offset + i)
    };
    eligible.push(site);
    if (page.indices[i] === page.indices[i - 1]) doubled.push(site);
  }
  offset += page.indices.length;
}
assert.equal(offset, 12956);
assert.equal(eligible.length, 12901);
assert.equal(doubled.length, 86);
assert.equal(doubled.filter(s => s.across).length, 23);
assert.equal(doubled.filter(s => !s.across).length, 63);

const largeChapters = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const redSections = [0, 3, 6, 7, 8, 15, 23, 27, 33, 39, 40, 53, 54];

/** @param {number} page @param {number[]} starts */
function section(page, starts) {
  let group = 0;
  while (group + 1 < starts.length && starts[group + 1] <= page) group++;
  return group;
}
/** @param {number[]} sorted */
function lag1GapCorrelation(sorted) {
  const gaps = sorted.slice(1).map((position, i) => position - sorted[i]);
  const n = gaps.length - 1;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) {
    ma += gaps[i];
    mb += gaps[i + 1];
  }
  ma /= n;
  mb /= n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const a = gaps[i] - ma;
    const b = gaps[i + 1] - mb;
    cov += a * b;
    va += a * a;
    vb += b * b;
  }
  return cov / Math.sqrt(va * vb);
}
const observed = lag1GapCorrelation(doubled.map(s => s.position));
assert.ok(Math.abs(observed - 0.38001968924100965) < 1e-12);

/** Xorshift32 with an explicit fixed nonzero seed. @param {number} seed */
function randomSource(seed) {
  let state = seed >>> 0;
  assert.notEqual(state, 0);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}
/**
 * @param {string} name
 * @param {(s:Site)=>number} key
 * @param {number} seed
 * @param {number} samples
 */
function nullTest(name, key, seed, samples) {
  /** @type {Map<number,number[]>} */
  const pools = new Map();
  /** @type {Map<number,number>} */
  const counts = new Map();
  for (const site of eligible) {
    const group = key(site);
    if (!pools.has(group)) pools.set(group, []);
    pools.get(group).push(site.position);
  }
  for (const site of doubled) {
    const group = key(site);
    counts.set(group, (counts.get(group) || 0) + 1);
  }
  for (const [group, count] of counts) {
    assert.ok(count <= pools.get(group).length);
  }
  const rng = randomSource(seed);
  let hits = 0;
  let sum = 0;
  let squares = 0;
  let highest = -Infinity;
  for (let draw = 0; draw < samples; draw++) {
    const positions = [];
    for (const [group, count] of counts) {
      const pool = pools.get(group);
      const used = new Set();
      for (let n = 0; n < count; n++) {
        let pick;
        do { pick = Math.floor(rng() * pool.length); }
        while (used.has(pick));
        used.add(pick);
        positions.push(pool[pick]);
      }
    }
    assert.equal(positions.length, 86);
    positions.sort((a, b) => a - b);
    const value = lag1GapCorrelation(positions);
    if (value >= observed) hits++;
    sum += value;
    squares += value * value;
    if (value > highest) highest = value;
  }
  const mean = sum / samples;
  return {
    name,
    sourceStrataWithDoublets: counts.size,
    draws: samples, seed: '0x' + seed.toString(16),
    exceedObserved: hits,
    oneSidedAddOneP: (hits + 1) / (samples + 1),
    nullMean: mean,
    nullStdDev: Math.sqrt(squares / samples - mean * mean),
    nullMaximum: highest
  };
}

// Source-authored physical 10/13-dot marks are delimiters, not GP symbols.
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pageStarts = new Map();
let cumul = 0;
for (const page of original) {
  pageStarts.set(page.page, cumul);
  cumul += page.indices.length;
}
const red13 = [];
const allLarge = [];
for (const page of ink.pages.filter(p => p.page <= 55)) {
  for (const [local, dots] of page.large_punctuation || []) {
    const spot = pageStarts.get(page.page) + local;
    if (dots === 13) red13.push(spot);
    if (dots === 10 || dots === 13) allLarge.push(spot);
  }
}
red13.sort((a, b) => a - b);
allLarge.sort((a, b) => a - b);
assert.equal(red13.length, 28);
assert.equal(allLarge.length, 31);
/** @param {number} point @param {number[]} marks */
function punctuationInterval(point, marks) {
  let low = 0, high = marks.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (marks[mid] <= point) low = mid + 1;
    else high = mid;
  }
  return low;
}

const tests = [
  nullTest('uniform eligible-runic sites', () => 0, 0x33010001, 30000),
  nullTest('nine original red-heading chapters',
    s => section(s.page, largeChapters), 0x33010002, 30000),
  nullTest('thirteen original red-section starts',
    s => section(s.page, redSections), 0x33010003, 30000),
  nullTest('original 13-dot punctuation intervals',
    s => punctuationInterval(s.position, red13), 0x3301a15e, 30000),
  nullTest('original 10- and 13-dot punctuation intervals',
    s => punctuationInterval(s.position, allLarge), 0x3301a16e, 30000),
  nullTest('all physical pages, fixed observed page counts',
    s => s.page, 0x33010004, 30000),
  nullTest('pages and original across/within-word class, fixed observed counts',
    s => 2 * s.page + Number(s.across), 0x3301a14e, 40000)
];
assert.ok(tests.every(t => t.oneSidedAddOneP < 0.01));
assert.ok(tests[6].oneSidedAddOneP > 0.001,
  'p is a measured finite Monte Carlo tail, not deterministic exclusion');
console.log(JSON.stringify({
  source: 'LP2 original physical pp0-55, 12956 runes, 2896 words',
  doublets: 86, withinWords: 63, acrossWords: 23,
  eligiblePairs: 12901, originalT7Lag1GapAC: observed,
  nullTests: tests,
  decision: 'Page, chapter and printed-word-boundary counts do not fully explain T7 gap autocorrelation under these uniform-position conditional nulls. No decoder or author state selected.'
}, null, 2));
console.log('PASS: source-conditioned original-gap T7 nulls and controls.');
