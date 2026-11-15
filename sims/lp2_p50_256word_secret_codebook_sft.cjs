/**
 * LP2 p49–51 numerical table: 256-word periodic secret codebook invariant.
 * Reads original pp0–55, matches exact printed words, excludes tested GP-native
 * prose under ANY fixed shared symbol bijection per (word mod 256, position).
 * Windows Node 22 / CommonJS / no dependencies / no writes.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/** @param {string} name @returns {string} */
function resource(name) {
  return fs.readFileSync(path.resolve(__dirname, '..', 'resources', name), 'utf8');
}
/** @param {string} text @returns {string} */
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const corpusRaw = resource('liber-primus/lp2-corpus.json');
const transcript = resource('liber-primus/lp2-transcription.txt');
const gridRaw = resource('liber-primus/lp2-grid-256.json');
const corpus = JSON.parse(corpusRaw);
const grid = JSON.parse(gridRaw);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((r, i) => [r, i]));
assert.equal(runeIndex.size, 29);
assert.equal(translitIndex.size, 29);
assert.equal(grid.pages.flatMap(p => p.tokens).length, 256);
assert.equal(grid.pages.flatMap(p => p.bytes).length, 256);

/**
 * Parse exact printed words, retaining line/page wraps as continuations.
 * Stop at the 12,956 cipher runes, excluding solved pp56–57.
 * @returns {number[][]}
 */
function sourceWords() {
  const expected = corpus.pages.slice(0, 56).flatMap(p => p.indices);
  assert.equal(expected.length, 12956);
  const observed = [];
  const words = [];
  let current = [];
  for (const ch of transcript) {
    if (observed.length === expected.length) break;
    if (runeIndex.has(ch)) {
      const rune = runeIndex.get(ch);
      observed.push(rune);
      current.push(rune);
    } else if ((ch === '-' || ch === '.') && current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  assert.deepEqual(observed, expected);
  assert.equal(words.length, 2896);
  assert.equal(words.flat().length, 12956);
  assert.equal(Math.max(...words.map(w => w.length)), 14);
  return words;
}
const words = sourceWords();

/**
 * GP-native spelling, with solved-source ING/IO contractions and the
 * familiar QU, K, Q, V, Z normalizations.
 * @param {string} word @returns {number[] | null}
 */
function gp(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const tri = s.slice(i, i + 3);
    const duo = s.slice(i, i + 2);
    if (tri === 'ING') {
      out.push(translitIndex.get('NG'));
      i += 3;
    } else if (duo === 'IO') {
      out.push(translitIndex.get('IA'));
      i += 2;
    } else if (translitIndex.has(duo)) {
      out.push(translitIndex.get(duo));
      i += 2;
    } else if (translitIndex.has(s[i])) {
      out.push(translitIndex.get(s[i]));
      i++;
    } else {
      return null;
    }
  }
  return out;
}

/**
 * Exact ordered-pair collision invariant across words sharing the same
 * (word ordinal mod 256, character position in the printed word).
 * For any fixed 29-symbol bijection in a bucket, C1=C2 iff P1=P2.
 * @param {number[][]} ws
 */
function collision(ws) {
  const groups = 256 * 14;
  const hist = new Uint16Array(groups * 29);
  const count = new Uint16Array(groups);
  let equal = 0, eligible = 0, firstEqual = 0, firstEligible = 0;
  for (let wi = 0; wi < ws.length; wi++) {
    const w = ws[wi];
    const base = (wi % 256) * 14;
    for (let j = 0; j < w.length; j++) {
      const bucket = base + j;
      const matches = hist[bucket * 29 + w[j]];
      const earlier = count[bucket];
      equal += 2 * matches;
      eligible += 2 * earlier;
      if (j === 0) {
        firstEqual += 2 * matches;
        firstEligible += 2 * earlier;
      }
      hist[bucket * 29 + w[j]]++;
      count[bucket]++;
    }
  }
  return {
    allEqual: equal, allEligible: eligible, allQ: equal / eligible,
    firstEqual, firstEligible, firstQ: firstEqual / firstEligible,
  };
}
const original = collision(words);
assert.deepEqual(
  [original.allEqual, original.allEligible, original.firstEqual, original.firstEligible],
  [3340, 96560, 1000, 29920]
);

/**
 * A synthetic affine subset of the all-secret codebooks validates the
 * encoding/decoding and histogram-invariance software.
 * Every bucket has its own independent a,b; no guessed source key is used.
 * @param {number[][]} ws
 */
function positivePlant(ws) {
  let recovered = 0;
  const cipher = ws.map((w, wi) => w.map((x, j) => {
    const bucket = (wi % 256) * 14 + j;
    const a = 1 + ((17 * bucket + 3) % 28);
    const b = (13 * bucket + 11) % 29;
    const y = (a * x + b) % 29;
    let ainverse = 1;
    while ((a * ainverse) % 29 !== 1) ainverse++;
    assert.equal((ainverse * ((y - b + 29) % 29)) % 29, x);
    recovered++;
    return y;
  }));
  assert.deepEqual(collision(cipher), collision(ws));
  return recovered;
}
assert.equal(positivePlant(words), 12956);

/** Deterministic controls; the original ciphertext never trains any key. */
let state = 0x33015634;
/** @returns {number} */
function uniform() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
/** @param {number[]} a */
function moments(a) {
  const mean = a.reduce((sum, v) => sum + v, 0) / a.length;
  const sd = Math.sqrt(a.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (a.length - 1));
  return { mean, sd, min: Math.min(...a), max: Math.max(...a) };
}

const sources = [
  'control/shakespeare_first300k.txt',
  'control/emerson_essays_2944.txt',
  'control/gibran_prophet_58585.txt',
];
const lengths = words.map(w => w.length);
const trials = 1000;
const results = [];
for (const file of sources) {
  const raw = resource(file);
  const pools = Array.from({ length: 15 }, () => []);
  const matches = raw.match(/[A-Za-z]+/g) || [];
  for (const word of matches) {
    const encoded = gp(word);
    if (encoded && encoded.length >= 1 && encoded.length <= 14) {
      pools[encoded.length].push(encoded);
    }
  }
  for (const length of new Set(lengths)) {
    assert.ok(pools[length].length, file + ' has no GP-length ' + length);
  }
  const all = [], first = [];
  let allTail = 0, firstTail = 0;
  for (let trial = 0; trial < trials; trial++) {
    const sampled = lengths.map(len => {
      const available = pools[len];
      return available[Math.floor(uniform() * available.length)];
    });
    const q = collision(sampled);
    if (trial === 0) assert.equal(positivePlant(sampled), 12956);
    all.push(q.allQ);
    first.push(q.firstQ);
    if (q.allQ <= original.allQ) allTail++;
    if (q.firstQ <= original.firstQ) firstTail++;
  }
  results.push({
    source: file, sha256: sha256(raw), trials,
    all: moments(all), first: moments(first),
    atOrBelowOriginalAll: allTail, atOrBelowOriginalFirst: firstTail,
    lengthPools: Object.fromEntries([...new Set(lengths)].sort((a, b) => a - b)
      .map(n => [n, pools[n].length])),
  });
}
console.log(JSON.stringify({
  test: 'LP2 original 256-word stationary secret codebook, all-key invariant',
  sourceSha256: { corpus: sha256(corpusRaw), transcript: sha256(transcript), grid: sha256(gridRaw) },
  original: { words: words.length, runes: words.flat().length, gridCells: 256, ...original },
  positivePlants: 'all 12,956 runes invert exactly; equality invariant reproduced',
  controls: results,
  limitation: 'Only identical bijection for equal (whole-word ordinal mod256, rune position), source-native unchanged printed words.',
}, null, 2));
