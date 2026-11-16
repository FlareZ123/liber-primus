'use strict';

/**
 * Original-source fixed-self-loop GP29 cipher necessary-condition test.
 *
 * Hypothesis under test: a single globally fixed plaintext rune S is encoded
 * by repeating the previous ciphertext rune. Every other plaintext rune is
 * encoded by a nonzero predecessor step. The rule is reversible if those
 * nonzero steps form a permutation of Z_29 \ {0}.
 *
 * Source data: lp2-corpus.json, lp2-transcription.txt and public TextBlob
 * word frequencies. The lexical exclusion is conditional on this vocabulary.
 * No claimed LP2 plaintext or key is produced.
 *
 * Usage: node sims/lp2_fixed_selfloop_symbol_original_gate.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const readText = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(readText('resources/liber-primus/lp2-corpus.json'));
const transcript = readText('resources/liber-primus/lp2-transcription.txt');
const dictionaryText = readText('resources/control/english_wordfreq_textblob.txt');
const runeSet = new Set(corpus.runes);
const words = transcript.replace(/[\/\n%&$§]/g, '').split(/[-.]/)
  .map((word) => Array.from(word).filter((glyph) => runeSet.has(glyph)).join(''))
  .filter(Boolean).slice(0, 2896);
const originalRunes = corpus.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(words.length, 2896);
assert.equal(originalRunes.length, 12956);
assert.deepEqual(words.join(''), originalRunes.map((index) => corpus.runes[index]).join(''));

const observed = [];
let predecessor = null;
let doublets = 0;
let boundaryDoublets = 0;
let intraDoublets = 0;
const lengthInventory = new Map();
for (const word of words) {
  let mask = 0;
  for (let i = 0; i < word.length; i += 1) {
    if (word[i] === predecessor) {
      mask |= 1 << i;
      doublets += 1;
      if (i === 0) boundaryDoublets += 1;
      else intraDoublets += 1;
    }
    predecessor = word[i];
  }
  observed.push({ length: word.length, mask });
  lengthInventory.set(word.length, (lengthInventory.get(word.length) || 0) + 1);
}
assert.equal(doublets, 86);
assert.equal(boundaryDoublets, 23);
assert.equal(intraDoublets, 63);

const tokens = [
  ['ING', 21], ['NG', 21], ['IO', 27],
  ...corpus.translit.map((token, index) => [token, index]).filter(([token]) => token !== 'IA'),
].sort((a, b) => b[0].length - a[0].length);

/** @param {string} input Native plaintext word
 *  @returns {number[] | null} Source-calibrated GP29 encoding
 */
function encodeEnglish(input) {
  const source = input.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < source.length;) {
    const token = tokens.find(([name]) => source.startsWith(name, i));
    if (!token) return null;
    result.push(token[1]);
    i += token[0].length;
  }
  return result;
}

const english = [];
for (const line of dictionaryText.split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  const indices = encodeEnglish(match[1]);
  if (indices && indices.length <= 14) {
    english.push({ word: match[1], indices, count: Number(match[2]) });
  }
}
assert.equal(english.length, 29088);

const byLength = new Map();
const patternTypes = Array.from({ length: 29 }, () => new Set());
for (const entry of english) {
  const length = entry.indices.length;
  let bucket = byLength.get(length);
  if (!bucket) {
    bucket = { words: [], totalWeight: 0, weightedMean: new Float64Array(29), weightedSquare: new Float64Array(29) };
    byLength.set(length, bucket);
  }
  bucket.totalWeight += entry.count;
  const glyphCounts = new Uint8Array(29);
  entry.indices.forEach((value) => { glyphCounts[value] += 1; });
  for (let symbol = 0; symbol < 29; symbol += 1) {
    let mask = 0;
    for (let i = 0; i < length; i += 1) if (entry.indices[i] === symbol) mask |= 1 << i;
    patternTypes[symbol].add(length + ':' + mask);
    bucket.weightedMean[symbol] += entry.count * glyphCounts[symbol];
    bucket.weightedSquare[symbol] += entry.count * glyphCounts[symbol] ** 2;
  }
  bucket.words.push({ indices: entry.indices, count: entry.count, cum: bucket.totalWeight });
}

const results = [];
for (let symbol = 0; symbol < 29; symbol += 1) {
  const impossiblePositions = [];
  for (let i = 0; i < observed.length; i += 1) {
    const item = observed[i];
    if (!patternTypes[symbol].has(item.length + ':' + item.mask)) impossiblePositions.push(i);
  }
  let mean = 0;
  let variance = 0;
  for (const [length, n] of lengthInventory) {
    const bucket = byLength.get(length);
    const m = bucket.weightedMean[symbol] / bucket.totalWeight;
    mean += n * m;
    variance += n * (bucket.weightedSquare[symbol] / bucket.totalWeight - m ** 2);
  }
  results.push({
    rune: corpus.translit[symbol],
    impossible: impossiblePositions.length,
    examples: impossiblePositions.slice(0, 6),
    expected: mean,
    sd: Math.sqrt(variance),
    z: (doublets - mean) / Math.sqrt(variance),
  });
}

const survivors = results.filter((row) => row.impossible === 0);
assert.deepEqual(survivors.map((row) => row.rune), ['C', 'N', 'S', 'T', 'E', 'L', 'D', 'A']);
assert.equal(results.filter((row) => row.impossible > 0).length, 21);
assert.ok(survivors.every((row) => row.expected >= 499 && row.z < -19));

// Deterministic length-matched source-English draw, independent per word.
// This is only a calibrated finite control, not a global significance claim.
let rng = 1928747277;
function randomFraction() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return (rng >>> 0) / 4294967296;
}
const minCounts = Array(29).fill(Infinity);
for (let trial = 0; trial < 500; trial += 1) {
  const totalCounts = new Uint32Array(29);
  for (const [length, quantity] of lengthInventory) {
    const bucket = byLength.get(length);
    for (let j = 0; j < quantity; j += 1) {
      const selected = randomFraction() * bucket.totalWeight;
      let lo = 0;
      let hi = bucket.words.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (bucket.words[mid].cum > selected) hi = mid;
        else lo = mid + 1;
      }
      bucket.words[lo].indices.forEach((index) => { totalCounts[index] += 1; });
    }
  }
  for (let symbol = 0; symbol < 29; symbol += 1) {
    minCounts[symbol] = Math.min(minCounts[symbol], totalCounts[symbol]);
  }
}
assert.ok(survivors.every((row) => minCounts[corpus.translit.indexOf(row.rune)] > 400));

// Fully reversible positive: assign secret-like nonzero unique steps to all
// 28 non-escape runes; the escape rune itself gives zero displacement.
for (let sentinel = 0; sentinel < 29; sentinel += 1) {
  const plaintext = english.slice(0, 160).flatMap((entry) => entry.indices);
  const step = Array(29).fill(0);
  let next = 1;
  for (let symbol = 0; symbol < 29; symbol += 1) if (symbol !== sentinel) step[symbol] = next++;
  const inverse = new Array(29);
  for (let symbol = 0; symbol < 29; symbol += 1) inverse[step[symbol]] = symbol;
  let state = 7;
  const encoded = [];
  for (const symbol of plaintext) {
    state = (state + step[symbol]) % 29;
    encoded.push(state);
  }
  let last = 7;
  const decoded = encoded.map((value) => {
    const diff = (value - last + 29) % 29;
    last = value;
    return inverse[diff];
  });
  assert.deepEqual(decoded, plaintext);
  for (let i = 0; i < encoded.length; i += 1) {
    assert.equal(encoded[i] === (i === 0 ? 7 : encoded[i - 1]), plaintext[i] === sentinel);
  }
}

console.log('Original source: 12,956 runes / 2,896 exact printed words');
console.log('Original consecutive repeats: 86 (23 at word entry, 63 within word)');
console.log('Source-native English lexicon GP words: ' + english.length);
console.log('29 inverse-candidate symbols checked, 21 impossible in exact dictionary word shapes');
for (const row of results) {
  console.log([
    row.rune.padEnd(3), 'unmatched=' + String(row.impossible).padStart(2),
    'examples=' + row.examples.join(','), 'expected=' + row.expected.toFixed(2),
    'sigma=' + row.sd.toFixed(2), 'z=' + row.z.toFixed(2),
    'min500=' + minCounts[corpus.translit.indexOf(row.rune)],
  ].join('  '));
}
console.log('PASS: all 29 explicit inverse positive plants, original source invariants and lexical test');
