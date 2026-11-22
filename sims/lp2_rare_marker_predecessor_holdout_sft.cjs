'use strict';

/**
 * Director #589: an explicit lossless GP29 anti-doublet emitter.
 *
 * Model: each page's first rune is copied. Thereafter, the plaintext
 * sentinel R maps to the preceding ciphertext rune. All 28 other input
 * runes map, in sorted order, bijectively to the other 28 output runes.
 *
 * Fit only R using pp0–39 doublet sites and source-independent native-GP
 * word-length/within-word-position statistics. Test pp40–55 unchanged.
 * The site model is conditional on GP-native English and printed word breaks.
 * No plaintext, source-selected historical R, or genuine LP2 decryptor claimed.
 *
 * Run: node sims/lp2_rare_marker_predecessor_holdout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..');
const load = relative => fs.readFileSync(path.join(base, relative), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const transcribed = load('resources/liber-primus/lp2-transcription.txt').split('%');
const alphabet = new Set(corpus.runes);
const ALIASES = [...'FU@ORCGWHNIJ#PXSTBEML!+DA%Y^~'];
const ALIAS_INDEX = new Map(ALIASES.map((char, i) => [char, i]));
const DIGRAPHS = { TH:'@', EO:'#', OE:'+', AE:'%', IA:'^', EA:'~', NG:'!' };
const SOURCE_TEXTS = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
];

/** @param {string} raw @returns {string} */
function normalizeGP(raw) {
  const word = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  let out = '';
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { out += '!'; i += 3; }
    else if (DIGRAPHS[word.slice(i, i + 2)]) {
      out += DIGRAPHS[word.slice(i, i + 2)]; i += 2;
    } else out += word[i++];
  }
  return out;
}

/** @param {number[]} input @param {number} sentinel @returns {number[]} */
function encode(input, sentinel) {
  if (!input.length) return [];
  const out = [input[0]];
  for (let i = 1; i < input.length; i++) {
    const prev = out[i - 1];
    if (input[i] === sentinel) out.push(prev);
    else {
      const rank = input[i] - (input[i] > sentinel ? 1 : 0);
      out.push(rank + (rank >= prev ? 1 : 0));
    }
  }
  return out;
}

/** @param {number[]} input @param {number} sentinel @returns {number[]} */
function decode(input, sentinel) {
  if (!input.length) return [];
  const out = [input[0]];
  for (let i = 1; i < input.length; i++) {
    const prev = input[i - 1];
    if (input[i] === prev) out.push(sentinel);
    else {
      const rank = input[i] - (input[i] > prev ? 1 : 0);
      out.push(rank + (rank >= sentinel ? 1 : 0));
    }
  }
  return out;
}

const sourcePages = corpus.pages.filter(page => page.page <= 55);
const runePages = sourcePages.filter(page => page.indices.length);
assert.equal(runePages.length, 55);
assert.equal(sourcePages.reduce((n, page) => n + page.indices.length, 0), 12956);

// Recover *printed* word length and position without splitting at line/page wraps.
const wordPlaces = Array(12956);
let unfinished = [];
let globalRune = 0;
function finishWord() {
  for (let i = 0; i < unfinished.length; i++) {
    wordPlaces[unfinished[i]] = { length: unfinished.length, pos: i };
  }
  unfinished = [];
}
for (let p = 0; p < runePages.length; p++) {
  const fromPage = [];
  for (const char of transcribed[p]) {
    if (alphabet.has(char)) {
      fromPage.push(corpus.runes.indexOf(char));
      unfinished.push(globalRune++);
    } else if ('-.&$§'.includes(char)) finishWord();
  }
  assert.deepEqual(fromPage, runePages[p].indices,
    'The printed page and canonical runes must agree at every position');
}
finishWord();
assert.equal(globalRune, 12956);
assert.ok(wordPlaces.every(Boolean));

const pool = new Map();
const loadedTexts = SOURCE_TEXTS.map(load);
for (const source of loadedTexts) {
  for (const raw of source.match(/[A-Za-z]+/g) || []) {
    const word = normalizeGP(raw);
    if ([...word].some(char => !ALIAS_INDEX.has(char))) continue;
    let bucket = pool.get(word.length);
    if (!bucket) {
      bucket = { n: 0, counts: Array.from({ length: word.length }, () => new Int32Array(29)) };
      pool.set(word.length, bucket);
    }
    bucket.n++;
    for (let i = 0; i < word.length; i++) bucket.counts[i][ALIAS_INDEX.get(word[i])]++;
  }
}
assert.ok(pool.size >= 17);

/** Dirichlet half-count smoothing for all 29 classes, frozen before the test. */
function eventProbability(global, sentinel) {
  const place = wordPlaces[global], bucket = pool.get(place.length);
  assert.ok(bucket, 'Missing native-GP source word length');
  return (bucket.counts[place.pos][sentinel] + 0.5) / (bucket.n + 14.5);
}

let offset = 0;
const allSites = [];
const heldoutPages = [];
for (const page of sourcePages) {
  const localSites = [];
  for (let j = 1; j < page.indices.length; j++) {
    const site = {
      page: page.page,
      global: offset + j,
      event: page.indices[j] === page.indices[j - 1],
    };
    allSites.push(site);
    localSites.push(site);
  }
  if (page.page >= 40) heldoutPages.push(localSites);
  offset += page.indices.length;
}
assert.equal(allSites.length, 12901);
const train = allSites.filter(site => site.page <= 39);
const test = allSites.filter(site => site.page >= 40);
const countEvents = sites => sites.filter(site => site.event).length;
assert.equal(train.length, 9600);
assert.equal(countEvents(train), 65);
assert.equal(test.length, 3301);
assert.equal(countEvents(test), 21);

function likelihood(sites, sentinel) {
  let ll = 0, expected = 0;
  for (const site of sites) {
    const prob = eventProbability(site.global, sentinel);
    ll += site.event ? Math.log(prob) : Math.log1p(-prob);
    expected += prob;
  }
  return { ll, expected };
}
const fit = Array.from({ length: 29 }, (_, sentinel) => ({
  sentinel, ...likelihood(train, sentinel),
})).sort((a, b) => b.ll - a.ll);
const selected = fit[0].sentinel;
assert.equal(selected, 6, 'Frozen pre-holdout training selector is GP G');
const trainResult = likelihood(train, selected);
const testResult = likelihood(test, selected);
const trainFrequency = countEvents(train) / train.length;
const constantLL = sites => sites.reduce((acc, site) =>
  acc + (site.event ? Math.log(trainFrequency) : Math.log1p(-trainFrequency)), 0);
const trainBaseline = constantLL(train);
const testBaseline = constantLL(test);

// Page-conditioned null preserves each heldout physical page's event count.
// Only *placement* of events inside that page is shuffled. Original word
// positions and all GP profile probabilities stay unchanged.
let randomState = 0x3301589;
/** @returns {number} */
function randomUint32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
const siteBaseline = test.reduce((acc, site) =>
  acc + Math.log1p(-eventProbability(site.global, selected)), 0);
const pageArrays = heldoutPages.map(sites => sites.map(site => {
  const probability = eventProbability(site.global, selected);
  return {
    logOdds: Math.log(probability / (1 - probability)),
    event: site.event,
  };
}));
let atOrBelow = 0, sumLL = 0, squaredLL = 0;
const N = 20000;
for (let trial = 0; trial < N; trial++) {
  let ll = siteBaseline;
  for (const original of pageArrays) {
    const count = original.filter(site => site.event).length;
    const shuffled = original.slice();
    for (let k = 0; k < count; k++) {
      const next = k + (randomUint32() % (shuffled.length - k));
      [shuffled[k], shuffled[next]] = [shuffled[next], shuffled[k]];
      ll += shuffled[k].logOdds;
    }
  }
  sumLL += ll;
  squaredLL += ll * ll;
  if (ll <= testResult.ll) atOrBelow++;
}
const mean = sumLL / N;
const sd = Math.sqrt(squaredLL / N - mean * mean);
assert.equal(atOrBelow, 6126);

// The inverse has no missing marker information. Every GP symbol survives.
// Original roundtrips are only an implementation invariant, not evidence of
// an authentic key; a source-native heldout plant is the positive control.
for (const page of sourcePages) {
  const original = page.indices;
  assert.deepEqual(encode(decode(original, selected), selected), original);
}
const originalTest = sourcePages.filter(page => page.page >= 40);
const nativeRunes = [];
for (const raw of loadedTexts[1].match(/[A-Za-z]+/g) || []) {
  const normalized = [...normalizeGP(raw)];
  if (normalized.some(char => !ALIAS_INDEX.has(char))) continue;
  for (const char of normalized) nativeRunes.push(ALIAS_INDEX.get(char));
}
const nativeSlice = nativeRunes.slice(3000, 3000 + 3316);
assert.equal(nativeSlice.length, 3316);
let plantCursor = 0;
let exactPlantSymbols = 0;
for (const page of originalTest) {
  const plain = nativeSlice.slice(plantCursor, plantCursor + page.indices.length);
  plantCursor += plain.length;
  const cipher = encode(plain, selected);
  const decrypted = decode(cipher, selected);
  assert.deepEqual(decrypted, plain);
  assert.deepEqual(encode(decrypted, selected), cipher);
  exactPlantSymbols += plain.length;
}
assert.equal(plantCursor, 3316);
assert.equal(exactPlantSymbols, 3316);

console.log(JSON.stringify({
  cipher: 'Lossless one-symbol-per-rune sorted predecessor exclusion, page resets',
  sentinelSelection: 'best of 29 GP29 classes using only original pp0–39 event sites',
  selectedMarker: { index: selected, gp: corpus.translit[selected] },
  sourceWordCount: wordPlaces.filter(place => place.pos === 0).length,
  training: { sites: train.length, actual: countEvents(train), expected: trainResult.expected,
    logLikelihood: trainResult.ll, stationaryBaseline: trainBaseline },
  heldout: { sites: test.length, actual: countEvents(test), expected: testResult.expected,
    logLikelihood: testResult.ll, stationaryBaseline: testBaseline,
    deltaVsBaseline: testResult.ll - testBaseline },
  heldoutPageConditionedPlacementNull: { replications: N, seed: '0x3301589',
    mean, sd, countAtOrBelow: atOrBelow, lowerTail: (atOrBelow + 1) / (N + 1) },
  completeOriginalInverseReencryption: 12956,
  nativeGpHeldoutPlantedExactRecovery: exactPlantSymbols,
  decision: 'This exact source-native rare-marker site model lacks predictive support; it does not identify the historical LP2 cipher.',
}, null, 2));
