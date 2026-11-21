'use strict';

/**
 * Source-selected original-cipher necessary condition: can p57 PARABLE root201
 * supply the 56 out of 256 global table phases at which equal adjacent
 * ciphertext runes are allowed? If so, ordinary 29-way no-repeat suppression
 * outside those exact phases predicts ZERO doublets there, whatever the key.
 * The raw observed global rate resembles 56/(256*29), so test location.
 *
 * Four frozen natural phase conventions (continuous vs page reset, previous
 * vs next state) are exhaustive for the proposed literal source mask.
 *
 * Run on Windows Node.js 22: node sims/lp2_parable_root201_doublet_allowlist_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
const rev = Array.from({length: 256}, () => []);
bytes.forEach((value, index) => rev[value].push(index));

/** @param {number} node @returns {Set<number>} */
function incomingClosure(node) {
  const seen = new Set([node]), queue = [node];
  for (let i = 0; i < queue.length; i++) {
    for (const predecessor of rev[queue[i]]) {
      if (!seen.has(predecessor)) {
        seen.add(predecessor);
        queue.push(predecessor);
      }
    }
  }
  return seen;
}
const subset = incomingClosure(201);
assert.equal(subset.size, 56);
assert.deepEqual(rev[201], [82, 128]);
const source50 = incomingClosure(82);
assert.equal(source50.size, 50);
const pages = corpus.pages.slice(0, 56);
assert.deepEqual(pages.map(p => p.page), Array.from({length: 56}, (_,i) => i));

/**
 * Test only within-physical-page transitions: no invented page-edge markers.
 * @param {'continuous'|'page'} reset
 * @param {0|1} shift
 */
function observe(reset, shift) {
  let inside = 0, outside = 0, eligible = 0, other = 0, index = 0;
  for (const page of pages) {
    const runes = page.indices;
    for (let j = 0; j + 1 < runes.length; j++) {
      const phase = (((reset === 'continuous' ? index + j : j) + shift) % 256);
      const matched = runes[j] === runes[j+1];
      if (subset.has(phase)) {
        eligible++;
        if (matched) inside++;
      } else {
        other++;
        if (matched) outside++;
      }
    }
    index += runes.length;
  }
  const total = inside + outside;
  assert.equal(total, 86);
  assert.equal(eligible + other, 12901);
  return {
    reset, phaseOf: shift ? 'second rune' : 'first rune',
    doubletsInside: inside,
    doubletsOutside: outside,
    insideTransitions: eligible,
    outsideTransitions: other,
    expectedInsideUnderLocationBlindNull: Number((total * eligible / (eligible+other)).toFixed(4)),
    insideToOutsideRateRatio: Number(((inside/eligible)/(outside/other)).toFixed(5)),
    contradictsStrictSourceMask: outside > 0
  };
}

const cases = [
  observe('continuous', 0),
  observe('continuous', 1),
  observe('page', 0),
  observe('page', 1)
];
assert.deepEqual(cases.map(c => [c.doubletsInside, c.doubletsOutside]),
  [[18,68], [22,64], [22,64], [15,71]]);
assert(cases.every(c => c.contradictsStrictSourceMask));
assert(cases.every(c => c.insideToOutsideRateRatio > 0.75 &&
  c.insideToOutsideRateRatio < 1.25));

// Positive control: the exact root201 allowlist would detect a planted
// 86-position event vector permitted at table phases and no others.
const planted = Array(12901).fill(false);
let placed = 0;
for (let j = 0; j < planted.length && placed < 86; j++) {
  if (subset.has(j % 256)) {
    planted[j] = true;
    placed++;
  }
}
assert.equal(placed, 86);
assert.equal(planted.filter((flag,i) => flag && subset.has(i % 256)).length, 86);
assert.equal(planted.filter((flag,i) => flag && !subset.has(i % 256)).length, 0);

// The 50-node first branch more closely matches the *overall* residual
// doublet rate: 50/(256*29) ≈ 0.006735 versus 86/12901 ≈ 0.006666.
// Its exact clock locations, however, fail as a source mask.
let branch50AllowedEvents = 0, branch50ForbiddenEvents = 0;
let flatIndex = 0;
for (const page of pages) {
  for (let j = 0; j + 1 < page.indices.length; j++) {
    if (page.indices[j] === page.indices[j + 1]) {
      if (source50.has((flatIndex + j) & 255)) branch50AllowedEvents++;
      else branch50ForbiddenEvents++;
    }
  }
  flatIndex += page.indices.length;
}
assert.deepEqual([branch50AllowedEvents, branch50ForbiddenEvents], [17, 69]);


/**
 * The authenticated 2016 clue says the book's words are the map and their
 * numbers give direction. Test the independently specified GP-prime sum of
 * each original complete ciphertext word as a p50 table address. A strict
 * 50-state or 56-state equal-rune exception mask must have no duplicates in
 * words whose sum is outside its source-selected reverse closure.
 */
const transcript = fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const stream = transcript.split('%').slice(0, 55).join('%');
const lookup = new Map(corpus.runes.map((symbol, index) => [symbol, index]));
const wordTokens = [];
let currentWord = [];
for (const symbol of stream) {
  if (lookup.has(symbol)) currentWord.push(lookup.get(symbol));
  else if (symbol === '/' || symbol === '%' || /\s/u.test(symbol)) {
    // Page and printed line wrapping do not split lexical words.
  } else if (currentWord.length) {
    wordTokens.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) wordTokens.push(currentWord);
assert.equal(wordTokens.length, 2896);
assert.equal(wordTokens.reduce((s, w) => s + w.length, 0), 12956);

/** @param {Set<number>} allow */
function wordPrimeSumMask(allow) {
  let selectedWords = 0, inside = 0, outside = 0, eligible = 0, other = 0;
  for (const word of wordTokens) {
    const address = word.reduce((s, symbol) => s + corpus.prime[symbol], 0) % 256;
    const selected = allow.has(address);
    selectedWords += selected ? 1 : 0;
    for (let i=1; i<word.length; i++) {
      const repeated = word[i] === word[i-1];
      if (selected) {
        eligible++;
        inside += repeated ? 1 : 0;
      } else {
        other++;
        outside += repeated ? 1 : 0;
      }
    }
  }
  return {selectedWords, inside, outside, eligible, other,
    expectedInsideUnderLocationBlindNull:
      Number(((inside+outside)*eligible/(eligible+other)).toFixed(4)),
    strictExceptionMaskRejected: outside > 0};
}
const wordSource50 = wordPrimeSumMask(source50);
const wordSource56 = wordPrimeSumMask(subset);
assert.deepEqual([wordSource50.selectedWords, wordSource50.inside,
  wordSource50.outside, wordSource50.eligible, wordSource50.other],
  [584, 10, 53, 1988, 8072]);
assert.deepEqual([wordSource56.selectedWords, wordSource56.inside,
  wordSource56.outside, wordSource56.eligible, wordSource56.other],
  [647, 10, 53, 2190, 7870]);

console.log(JSON.stringify({
  status: 'PASS: source-graph literal allowlist is rejected on original cipher',
  source: 'p57 prime-ordinal201 reversed through original p50 base60 table',
  hypothesis: 'only the 56 table-index phases in the reverse-closure may allow repeated ciphertext runes',
  unknownRunes: pages.reduce((s,p)=>s+p.indices.length,0),
  literalMaskPhases: subset.size,
  source50Branch: {size: source50.size, prediction: 50/(256*29), equalEventsInside: branch50AllowedEvents, equalEventsOutside: branch50ForbiddenEvents},
  signed2016WordNumbers: {source50: wordSource50, source56: wordSource56},
  sourcePredictedUnconditionalDoubletRate: 56/(256*29),
  actualWithinPageDoubletRate: 86/12901,
  cases,
  plantedPositiveInside: 86,
  verdict: 'Matching overall frequency is misleading; observed repeat locations are ordinary and mostly outside all four fixed source masks. No cipher/plaintext recovered.'
}, null, 2));
