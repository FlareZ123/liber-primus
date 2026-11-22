'use strict';

/**
 * All-secret, all-original-word rejection of a GP29 multiplicative
 * ciphertext-step cipher with an arbitrary private nonzero word key.
 * Windows 11 / Node.js 22 standalone test:
 *   node sims/lp2_wordscalar_delta_nativelexicon_original_sft.cjs
 *
 * Model (within each preserved printed GP29 word):
 *   C_i = C_previous + k_word * (P_i + 1) mod29.
 * The predecessor is either global ciphertext or reset to 0 each word.
 * Word keys k[phase] may be chosen independently for each of 2,896 source words.
 * GP EA (index 28) is the sole zero-step plaintext.
 *
 * Exact key elimination: divide the vector of within-word ciphertext
 * differences by its first nonzero value. It must equal the similarly
 * normalized GP one-based plaintext-ordinal vector. Every secret k vanishes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const textblob = fs.readFileSync(
  path.join(root, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8');
const gibran = fs.readFileSync(
  path.join(root, 'resources', 'control', 'gibran_prophet_58585.txt'), 'utf8');
const latinReference = fs.readFileSync(
  path.join(root, 'resources', 'control', 'latin-vulgate-gp-wholewords.txt'), 'utf8');
const runeValue = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const latinValue = new Map(corpus.translit.map((label, i) => [label, i]));
const compounds = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
const inverse = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  inverse[a] = Array.from({length: 28}, (_, i) => i + 1)
    .find((b) => (a * b) % 29 === 1);
  assert.equal((a * inverse[a]) % 29, 1);
}

/** @param {number} x @returns {number} */
function mod(x) { return ((x % 29) + 29) % 29; }

/** @param {string} s @returns {number[]|null} */
function nativeGP(s) {
  /** @type {number[]} */ const out = [];
  const word = s.toUpperCase();
  for (let pos = 0; pos < word.length;) {
    const t = compounds.find((v) => word.startsWith(v, pos)) || word[pos];
    const value = latinValue.get(t === 'ING' ? 'NG' : t);
    if (value === undefined) return null;
    out.push(value);
    pos += t.length;
  }
  return out;
}

/**
 * Original physical page/line wraps never split a complete word;
 * punctuation, hyphens and section marks do.
 * @param {string} source
 * @returns {number[][]}
 */
function sourceWords(source) {
  const joined = source.split('%').slice(0, 55).join('%');
  /** @type {number[][]} */ const words = [];
  /** @type {number[]} */ let current = [];
  for (const ch of joined) {
    const x = runeValue.get(ch);
    if (x !== undefined) current.push(x);
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) continue;
    else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

/**
 * Canonical equality-under-nonzero-scalar signature in GF29.
 * A zero at any position is preserved; two arrays match iff they differ by
 * one arbitrary multiplicative nonzero key, including EA zero-step sites.
 * @param {number[]} v
 * @returns {string}
 */
function signature(v, period = 1) {
  /** @param {number[]} xs */
  function scalarSignature(xs) {
    const start = xs.find((x) => x !== 0);
    if (start === undefined) return xs.join(',');
    return xs.map((x) => mod(x * inverse[start])).join(',');
  }
  return Array.from({length: period}, (_, phase) =>
    scalarSignature(v.filter((_, i) => i % period === phase))).join('|');
}

/** @param {number[]} word @param {number} prev @param {boolean} reset @param {number} period */
function deltaSignature(word, prev, reset, period) {
  let old = reset ? 0 : prev;
  return signature(word.map((v) => {
    const d = mod(v - old);
    old = v;
    return d;
  }), period);
}

/** @param {number[]} plaintext @param {number} period */
function ordinalSignature(plaintext, period) {
  return signature(plaintext.map((x) => mod(x + 1)), period);
}

const originalWords = sourceWords(raw);
const original = originalWords.flat();
assert.equal(originalWords.length, 2896);
assert.equal(original.length, 12956);
assert.deepEqual(original, corpus.pages.slice(0, 56).flatMap((p) => p.indices));
const byLengthByPeriod = Array.from({length: 5}, () => new Map());
let dictionaryItems = 0;
for (const line of textblob.split(/\r?\n/)) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  const encoded = nativeGP(match[1]);
  if (!encoded) continue;
  for (let period = 1; period <= 5; period++) {
    const index = byLengthByPeriod[period - 1];
    if (!index.has(encoded.length)) index.set(encoded.length, new Set());
    index.get(encoded.length).add(ordinalSignature(encoded, period));
  }
  dictionaryItems++;
}
assert.equal(dictionaryItems, 23940);
const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinSource = latinReference.split(/\r?\n/)
  .filter((word) => word.length > 0 && !word.startsWith('#') && !word.startsWith(' '))
  .map((word) => [...word].map((ch) => latinAlphabet.indexOf(ch)))
  .filter((word) => word.every((value) => value >= 0 && value < 29));
assert.equal(latinSource.length, 39835);
const latinByPeriod = Array.from({length: 5}, () => new Map());
for (const encoded of latinSource) {
  for (let period = 1; period <= 5; period++) {
    const index = latinByPeriod[period - 1];
    if (!index.has(encoded.length)) index.set(encoded.length, new Set());
    index.get(encoded.length).add(ordinalSignature(encoded, period));
  }
}
const distinctLatinWords = new Set(latinSource.map((x) => x.join(','))).size;
assert.equal(distinctLatinWords, 7305);

/**
 * @param {number[][]} words
 * @param {boolean|null} mode true = word-reset ciphertext differences;
 * false = continuous ciphertext differences; null = native plaintext.
 */
function audit(words, mode, period, lexicon = byLengthByPeriod) {
  let previous = 0;
  /** @type {Map<number,{n:number,match:number}>} */
  const counts = new Map();
  for (const word of words) {
    const n = word.length;
    const sig = mode === null
      ? ordinalSignature(word, period)
      : deltaSignature(word, previous, mode, period);
    const hit = lexicon[period - 1].get(n)?.has(sig) ?? false;
    const record = counts.get(n) || {n: 0, match: 0};
    record.n++;
    if (hit) record.match++;
    counts.set(n, record);
    previous = word[word.length - 1];
  }
  /** @param {number} minLength */
  function tally(minLength) {
    return [...counts].filter(([n]) => n >= minLength)
      .reduce((total, [, x]) => ({
        n: total.n + x.n,
        match: total.match + x.match,
      }), {n: 0, match: 0});
  }
  return {
    total: words.length, long: tally(5), longer: tally(6),
    longEight: tally(8), longTen: tally(10),
    byLength: Object.fromEntries([...counts].sort((a, b) => a[0] - b[0])),
  };
}

const gibranWords = (gibran.match(/[A-Za-z]+/g) || [])
  .map(nativeGP).filter((w) => w !== null);
const summaries = [];
for (let period = 1; period <= 5; period++) {
  const continuous = audit(originalWords, false, period);
  const reset = audit(originalWords, true, period);
  const natural = audit(gibranWords, null, period);
  const latinContinuous = audit(originalWords, false, period, latinByPeriod);
  const latinReset = audit(originalWords, true, period, latinByPeriod);
  assert.deepEqual(latinContinuous.longTen, {n: 109, match: 0});
  assert.deepEqual(latinReset.longTen, {n: 109, match: 0});
  if (period === 1) {
    assert.deepEqual(latinContinuous.long, {n: 1132, match: 0});
    assert.deepEqual(latinReset.long, {n: 1132, match: 0});
  }
  assert.deepEqual(continuous.longTen, {n: 109, match: 0});
  assert.deepEqual(reset.longTen, {n: 109, match: 0});
  assert.deepEqual(natural.longTen, {n: 324, match: 289});
  if (period === 1) {
    assert.deepEqual(continuous.long, {n: 1132, match: 0});
    assert.deepEqual(reset.long, {n: 1132, match: 2});
  }
  summaries.push({
    period,
    continuous5: continuous.long,
    continuous8: continuous.longEight,
    continuous10: continuous.longTen,
    reset5: reset.long,
    reset8: reset.longEight,
    reset10: reset.longTen,
    LatinOriginal5Carry: latinContinuous.long,
    LatinOriginal10Carry: latinContinuous.longTen,
    LatinOriginal5Reset: latinReset.long,
    LatinOriginal10Reset: latinReset.longTen,
    GibranNative5: natural.long,
    GibranNative10: natural.longTen,
  });
}

// A planted entire-LP2-length native plaintext under five independent
// secret nonzero scalar keys per original printed word.
const plantPeriod = 5;
const sourceNative = new Map();
for (const word of gibranWords) {
  if (!byLengthByPeriod[plantPeriod - 1].get(word.length)
    ?.has(ordinalSignature(word, plantPeriod))) continue;
  if (!sourceNative.has(word.length)) sourceNative.set(word.length, []);
  sourceNative.get(word.length).push(word);
}
const plantedPlainWords = originalWords.map((word, i) => {
  const choices = sourceNative.get(word.length);
  assert.ok(choices?.length > 0, 'Missing native GP control of length ' + word.length);
  return choices[i % choices.length];
});
assert.equal(plantedPlainWords.flat().length, 12956);

/** @param {number[][]} plainWords */
function plant(plainWords) {
  let previous = 0;
  /** @type {number[][]} */ const out = [];
  for (let w = 0; w < plainWords.length; w++) {
    const cipherWord = plainWords[w].map((p, i) => {
      const key = 1 + (w * 13 + (i % plantPeriod) * 5) % 28;
      previous = mod(previous + key * (p + 1));
      return previous;
    });
    out.push(cipherWord);
  }
  return out;
}

const planted = plant(plantedPlainWords);
const positive = audit(planted, false, plantPeriod);
assert.deepEqual(positive.long, {n: 1132, match: 1132});
assert.equal(positive.total, 2896);
let prev = 0;
for (let w = 0; w < planted.length; w++) {
  for (let i = 0; i < planted[w].length; i++) {
    const key = 1 + (w * 13 + (i % plantPeriod) * 5) % 28;
    const curr = planted[w][i];
    const decoded = mod((curr - prev) * inverse[key] - 1);
    assert.equal(decoded, plantedPlainWords[w][i]);
    prev = curr;
  }
}

console.log(JSON.stringify({
  model: 'C_i=C_prev+k_word[i mod period]*(P_i+1) mod29',
  originalRunes: original.length,
  originalWords: originalWords.length,
  admissibleEnglishWords: dictionaryItems,
  latinOriginalTokens: latinSource.length,
  distinctLatinNativeWords: distinctLatinWords,
  periods: summaries,
  realNativeWordLengthPeriod5Plant: positive.long,
  plantedRoundTrip: 'PASS',
}, null, 2));
console.log('PASS: all period-1..5 secret word keys excluded on every original 10+-rune word under independent native English and Latin lexical inventories');
