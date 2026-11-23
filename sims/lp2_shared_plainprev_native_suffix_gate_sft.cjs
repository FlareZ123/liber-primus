'use strict';

/**
 * Key-independent obstruction for ONE shared 29x29 plaintext-feedback
 * permutation cipher: C[i] = Q[P[i-1]][P[i]]. For complete words >=3,
 * equal plaintext suffixes of length three force equal ciphertext endings
 * of length two, under any secret 29! row permutations.
 *
 * Reproducible 2,048 creator-authentic GP donor samples, exact original
 * printed word layout, standalone Node.js 22/CommonJS, read-only.
 * No original plaintext/key is claimed.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const paths = [
  'resources/liber-primus/lp2-transcription.txt',
  'resources/liber-primus/lp2-corpus.json',
  'resources/external/relikd-solved-gp29-native-v1.json'
];
const inputs = paths.map(p => fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = JSON.parse(inputs[1]);
const solved = JSON.parse(inputs[2]);
const index = new Map(corpus.runes.map((r, i) => [r, i]));
assert.deepEqual(corpus.runes, solved.runes);

/** @typedef {{word:number[],start:number,end:number}} Word */

/** Original newline, slash and page % mark are *not* word separators.
 * @param {string} text
 * @returns {Word[]}
 */
function parseOriginal(text) {
  const source = text.split('%').slice(0, 55).join('%');
  /** @type {Word[]} */
  const out = [];
  let page = 0, start = 0, lastRunePage = 0;
  /** @type {number[]} */
  let word = [];
  function finish() {
    if (!word.length) return;
    const physical = n => n >= 50 ? n + 1 : n;
    out.push({word, start: physical(start), end: physical(lastRunePage)});
    word = [];
  }
  for (const ch of source) {
    if (index.has(ch)) {
      if (!word.length) start = page;
      word.push(index.get(ch));
      lastRunePage = page;
    } else if (ch === '%') {
      page++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      finish();
    }
  }
  finish();
  return out;
}

/** @param {string} text @returns {number[][]} */
function parseSolved(text) {
  const out = [];
  let word = [];
  for (const ch of text) {
    if (index.has(ch)) word.push(index.get(ch));
    else if (word.length) {
      out.push(word);
      word = [];
    }
  }
  if (word.length) out.push(word);
  return out;
}
const original = parseOriginal(inputs[0]);
const donorWords = solved.sections.flatMap(s => parseSolved(s.source_text));
assert.equal(original.length, 2896);
assert.equal(original.flatMap(w => w.word).length, 12956);
assert.equal(original.filter(w => w.start !== w.end).length, 32);
assert.deepEqual(original.flatMap(w => w.word),
  corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
assert.equal(donorWords.length, 740);
assert.equal(donorWords.flat().length, 2979);

const byLength = new Map();
for (const word of donorWords) {
  const group = byLength.get(word.length) ?? [];
  group.push(word);
  byLength.set(word.length, group);
}
for (const {word} of original) assert.ok(byLength.has(word.length));

/**
 * Number of equal suffixes across independent complete printed words.
 * Scope selection is deliberately independent of unknown secret key.
 * @param {Word[]} words
 * @param {2|3} width
 * @param {(word:Word)=>string|null} scope
 * @returns {number}
 */
function suffixPairs(words, width, scope) {
  const groups = new Map();
  for (const w of words) {
    if (w.word.length < 3) continue;
    const key = scope(w);
    if (key === null) continue;
    let group = groups.get(key);
    if (!group) { group = new Map(); groups.set(key, group); }
    const suffix = w.word.slice(-width).join(',');
    group.set(suffix, (group.get(suffix) ?? 0) + 1);
  }
  let pairs = 0;
  for (const group of groups.values()) {
    for (const n of group.values()) pairs += n * (n - 1) / 2;
  }
  return pairs;
}
const scopes = {
  wholeBook: w => 'oneSharedKey',
  pagePrivate: w => w.start === w.end ? 'page' + w.start : null,
  train16to21: w => w.start >= 16 && w.end <= 21 ? 'train' : null,
  holdout40to53: w => w.start >= 40 && w.end <= 53 ? 'heldout' : null
};
const capacities = Object.fromEntries(Object.entries(scopes).map(([name, select]) =>
  [name, suffixPairs(original, 2, select)]));
assert.deepEqual(capacities, {
  wholeBook: 3479, pagePrivate: 52,
  train16to21: 45, holdout40to53: 201
});

/** Fixed-seed, balanced native-length resampling. */
let seed = 0x33012713;
function rand(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return Math.floor(seed / 4294967296 * n);
}
const sampleCount = 2048;
const measurements = Object.fromEntries(Object.keys(scopes).map(k => [k, []]));
let positive = null;
for (let iteration = 0; iteration < sampleCount; iteration++) {
  const plant = original.map(w => ({
    word: byLength.get(w.word.length)[rand(byLength.get(w.word.length).length)],
    start: w.start, end: w.end
  }));
  for (const [name, select] of Object.entries(scopes)) {
    measurements[name].push(suffixPairs(plant, 3, select));
  }
  if (iteration === 0) positive = plant;
}
function summarize(values, limit) {
  const sorted = values.slice().sort((a, b) => a - b);
  return {samples: sorted.length, min: sorted[0], p05: sorted[102],
    median: sorted[1024], p95: sorted[1945], max: sorted.at(-1),
    compatibleWithObserved: sorted.filter(v => v <= limit).length};
}
const results = Object.fromEntries(Object.entries(measurements)
  .map(([name, values]) => [name, summarize(values, capacities[name])]));
for (const name of Object.keys(scopes)) {
  assert.equal(results[name].compatibleWithObserved, 0);
}
assert.deepEqual(Object.values(results).map(x => x.min),
  [32710, 563, 362, 1604]);

/** A complete secret key: 29 independently shuffled 29-way GP29 rows. */
const rows = Array.from({length:29}, () => {
  const a = Array.from({length:29}, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
});
const inverse = rows.map(row => {
  const inv = Array(29).fill(-1);
  row.forEach((v,i) => { inv[v] = i; });
  assert.equal(new Set(row).size, 29);
  return inv;
});

/** @param {number[]} tape @returns {number[]} */
function encrypt(tape) {
  let prior = 0;
  return tape.map(p => {
    const out = rows[prior][p];
    prior = p;
    return out;
  });
}
/** @param {number[]} tape @returns {number[]} */
function decrypt(tape) {
  let prior = 0;
  return tape.map(c => {
    const p = inverse[prior][c];
    prior = p;
    return p;
  });
}
const plaintext = positive.flatMap(w => w.word);
const ciphertext = encrypt(plaintext);
assert.deepEqual(decrypt(ciphertext), plaintext);
assert.deepEqual(encrypt(decrypt(ciphertext)), ciphertext);
let k=0;
const encryptedWords = positive.map(w => {
  const x = ciphertext.slice(k, k + w.word.length);
  k += w.word.length;
  return {word:x, start:w.start, end:w.end};
});
assert.equal(k, 12956);
const positives = Object.fromEntries(Object.entries(scopes).map(([name, select]) =>
  [name, {plainTripletPairs: suffixPairs(positive, 3, select),
    ciphertextDoubletPairs: suffixPairs(encryptedWords, 2, select)}]));
for (const pair of Object.values(positives)) {
  assert.ok(pair.plainTripletPairs <= pair.ciphertextDoubletPairs);
}
const hashes = Object.fromEntries(paths.map((p,i) =>
  [p,crypto.createHash('sha256').update(inputs[i]).digest('hex')]));
console.log('FROZEN_INPUT_SHA256', JSON.stringify(hashes));
console.log('ORIGINAL_CIPHERTEXT_ENDING_CAPACITIES', JSON.stringify(capacities));
console.log('CREATOR_NATIVE_MATCHED_LENGTH_CONTROL', JSON.stringify(results));
console.log('SHARED_29X29_INVERTIBLE_POSITIVE', JSON.stringify(positives));
console.log('PASS: original book and independent train/heldout each fail native GP29 suffix necessity for all shared plaintext-predecessor permutation keys; no unknown LP2 plaintext');
