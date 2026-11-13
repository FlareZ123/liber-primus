'use strict';
// Source-calibrated GP29 word-initial doublet audit. Read-only single-file test.
// Run with Node.js 22; all inputs are checked-in original or pinned control files.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeNames = new Map(source.translit.map((name, i) => [name, i]));
const multi = ['ING', 'TH', 'EO', 'NG', 'OE', 'AE', 'EA', 'IO', 'IA'];

/** Encode English using the authentic LP1 ING/IO convention. @param {string} word @returns {number[]} */
function encodeNative(word) {
  const w = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const codes = [];
  for (let i = 0; i < w.length;) {
    const match = multi.find(s => w.startsWith(s, i));
    const literal = match || w[i];
    const label = literal === 'ING' ? 'NG' : literal === 'IO' ? 'IA' : literal;
    assert.ok(runeNames.has(label), 'Unknown source-normalized GP: ' + label);
    codes.push(runeNames.get(label));
    i += literal.length;
  }
  return codes;
}

/** @param {number[]} word @returns {number[]} */
function duplicatePositions(word) {
  const result = [];
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] === word[i + 1]) result.push(i);
  }
  return result;
}

/** @param {number} n @param {number} k @param {number} p */
function binomialTail(n, k, p) {
  let mass = Math.pow(1 - p, n);
  let tail = 0;
  for (let i = 0; i <= n; i++) {
    if (i >= k) tail += mass;
    if (i < n) mass *= (n - i) * p / ((i + 1) * (1 - p));
  }
  return tail;
}

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  const q = Math.min(k, n - k);
  let answer = 1;
  for (let i = 1; i <= q; i++) answer *= (n - q + i) / i;
  return answer;
}

// The text resource omits the runeless physical p50. Keep physical mapping explicit.
const blocks = read('resources/liber-primus/lp2-transcription.txt')
  .split(/^\s*%\s*$/m);
assert.equal(blocks.length, 57);
const fragments = [];
const events = [];
let textRuneCount = 0;
for (let textPage = 0; textPage < 55; textPage++) {
  const physical = textPage < 50 ? textPage : textPage + 1;
  const text = blocks[textPage].replace(/\/\s*\n/g, '');
  const originalRunes = (text.match(/[\u16a0-\u16ff]/g) || []).join('');
  const canonical = source.pages.find(page => page.page === physical);
  assert.ok(canonical);
  const indexedRunes = canonical.indices.map(i => source.runes[i]).join('');
  assert.equal(originalRunes, indexedRunes, 'Source mismatch physical p' + physical);
  textRuneCount += canonical.indices.length;
  for (const printed of text.match(/[\u16a0-\u16ff]+/g) || []) {
    const word = [...printed];
    fragments.push(word);
    for (const position of duplicatePositions(word)) {
      events.push({ physical, length: word.length, position });
    }
  }
}
assert.equal(textRuneCount, 12956);
assert.equal(fragments.length, 2928);
assert.equal(events.length, 63);
const observed = [0, 0, 0, 0];
for (const event of events) observed[Math.min(event.position, 3)]++;
assert.deepEqual(observed, [12, 21, 7, 23]);

const floral = events.filter(event => event.physical >= 40 && event.physical <= 53);
const rest = events.filter(event => event.physical < 40 || event.physical > 53);
assert.equal(floral.length, 14);
assert.equal(rest.length, 49);
assert.equal(floral.filter(event => event.position === 0).length, 7);
assert.equal(rest.filter(event => event.position === 0).length, 5);
const fisherUpper = Array.from({ length: 6 }, (_, i) => i + 7)
  .reduce((acc, j) => acc + choose(14, j) * choose(49, 12 - j) / choose(63, 12), 0);
assert.ok(Math.abs(fisherUpper - 0.002705255334169455) < 1e-12);

const english = read('resources/liber-primus/lp1-plaintext-reference.txt');
const lp1Plain = english.split('\n').filter(line => !line.startsWith('#'))
  .join('\n').match(/[A-Za-z]+/g).map(encodeNative);
assert.equal(lp1Plain.length, 875);
assert.equal(lp1Plain.reduce((total, word) => total + word.length, 0), 3510);
const lp1Doublets = lp1Plain.flatMap(duplicatePositions);
assert.equal(lp1Doublets.length, 61);
assert.equal(lp1Doublets.filter(x => x === 0).length, 0);
const parable = english.split('### 57')[1].match(/[A-Za-z]+/g)
  .flatMap(encodeNative);
assert.deepEqual(parable, source.pages.find(page => page.page === 57).indices);

const lengths = new Map();
for (const word of fragments) lengths.set(word.length, (lengths.get(word.length) || 0) + 1);
const controls = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const results = [];
for (const filename of controls) {
  const words = read(filename).match(/[A-Za-z]+/g).map(encodeNative);
  const byLength = new Map();
  for (const word of words) {
    let bin = byLength.get(word.length);
    if (!bin) {
      bin = { n: 0, sites: Array(Math.max(word.length - 1, 0)).fill(0) };
      byLength.set(word.length, bin);
    }
    bin.n++;
    for (const j of duplicatePositions(word)) bin.sites[j]++;
  }
  const expected = [0, 0, 0, 0];
  for (const [length, count] of lengths) {
    const bin = byLength.get(length);
    assert.ok(bin && bin.n > 0, 'Missing native control words of length ' + length);
    for (let j = 0; j < length - 1; j++) {
      expected[Math.min(j, 3)] += count * bin.sites[j] / bin.n;
    }
  }
  const totalExpected = expected.reduce((a, b) => a + b, 0);
  const p0 = expected[0] / totalExpected;
  const pUpper = binomialTail(events.length, observed[0], p0);
  results.push({ filename, controlWords: words.length,
    expectedUnthinnedDoublets: totalExpected, expectedByPosition: expected,
    startFraction: p0, observedStartFraction: observed[0] / events.length,
    conditionalBinomialUpperTail: pUpper });
}
assert.deepEqual(results.map(x => x.controlWords), [55407, 15733, 77932]);
assert.ok(results.every(x => x.conditionalBinomialUpperTail < 0.00001));

// Distinguish natural plaintext-doublet thinning from a genuinely different
// competing mechanism: zero ciphertext transitions generated without reference
// to plaintext letter doubling. Keep true printed whole words across pages.
const wholeWords = [];
let wholeWord = [];
let predecessor = null;
const finishWord = () => {
  if (wholeWord.length) {
    wholeWords.push(wholeWord);
    wholeWord = [];
  }
};
for (let textPage = 0; textPage < 55; textPage++) {
  const text = blocks[textPage];
  predecessor = null; // No known within-page predecessor at first glyph.
  for (const glyph of text) {
    if (/^[\\u16a0-\\u16ff]$/u.test(glyph)) {
      wholeWord.push({ eligible: predecessor !== null, equal: predecessor === glyph });
      predecessor = glyph;
    } else if (glyph === '-' || glyph === '.') {
      finishWord();
    }
  }
}
finishWord();
assert.equal(wholeWords.length, 2896);
const opportunities = [0, 0, 0, 0];
const zeroEvents = [0, 0, 0, 0];
for (const word of wholeWords) {
  word.forEach((site, position) => {
    if (!site.eligible) return;
    const bin = Math.min(position, 3);
    opportunities[bin]++;
    if (site.equal) zeroEvents[bin]++;
  });
}
assert.deepEqual(opportunities, [2873, 2806, 2360, 4862]);
assert.deepEqual(zeroEvents, [23, 12, 21, 30]);
const allOpportunities = opportunities.reduce((a, b) => a + b, 0);
const allZeroEvents = zeroEvents.reduce((a, b) => a + b, 0);
assert.equal(allOpportunities, 12901);
assert.equal(allZeroEvents, 86);
const zeroExpected = opportunities.map(n => n * allZeroEvents / allOpportunities);
const zeroChiSquared = zeroExpected.reduce(
  (sum, expected, i) => sum + (zeroEvents[i] - expected) ** 2 / expected, 0
);
assert.ok(Math.abs(zeroChiSquared - 5.120079152075703) < 1e-10);
const naiveRandomZeroPositions = {
  allOpportunityCount: allOpportunities, allZeroCount: allZeroEvents,
  opportunities, observations: zeroEvents, expected: zeroExpected,
  pearsonChiSquared: zeroChiSquared, degreesOfFreedom: 3
};

console.log(JSON.stringify({
  originalRunes: textRuneCount,
  pageLocalFragments: fragments.length,
  withinFragmentEqualPairs: events.length,
  observedPositions: observed,
  floral: { equalPairs: floral.length, firstPairs: 7 },
  rest: { equalPairs: rest.length, firstPairs: 5 },
  exploratoryFloralFisherUpperTail: fisherUpper,
  sourceSolvedLP1: { words: lp1Plain.length, equalPairs: lp1Doublets.length, firstPairs: 0 },
  sourceSolvedP57: { exactRunes: parable.length },
  controls: results,
  naiveRandomZeroPositions
}, null, 2));
