'use strict';

/**
 * One source-fixed table-mediated GP29 feedback inverse for the intact
 * 138-rune pretable and 170-rune posttable sentences in LP2 pp48-52.
 *
 * Human-observable operands:
 *  - Exactly 32 rows of 8 numeric cells printed across pp49-51.
 *  - The complete pretable sentence has 33 GP words; the posttable one 40.
 *  - The authenticated 2016 signed message specifically mentions WORDS as
 *    the map, NUMBERS as direction. These motifs motivate, but do not prove,
 *    the word-clock/8-prior-rune interpretation.
 *
 * Freeze a single reversible GP29 causal FIR cipher:
 *   P[t] = C[t] - sum_{j=1}^8 B[(word(t)-word(0)) mod32][j-1]*C[t-j] (mod29),
 * treating the eight ciphertext values before the first sentence as F=0.
 * The key clock advances ONLY at authentic printed word breaks; it continues
 * across the numeric table without injecting artificial rune or word slots.
 * Printed row-major original radix60 bytes, reduced mod29, supply every
 * coefficient. No tuned seeds, guessed punctuation, blind posttable fit,
 * extra cipher layers, or language-optimized alternative clocks.
 *
 * Positive: exact reversible native GP29 308-rune plant with original word
 * framing and all 29 source symbols. Negative: no original GP-native prose.
 *
 * Windows Node.js 22, CommonJS, builtins only. Read-only.
 * Run via existing manual-node22-sft-runner.yml, SFT =
 * sims/lp2_p49_p51_p50_wordclock_eighttap_feedback_sft.cjs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildSourceNativeTrigramModel } =
  require('./lp1_source_native_trigram_model.cjs');
const root = path.resolve(__dirname, '..');

/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
}
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages = db.pages.filter(p => p.page <= 55 && p.indices.length);
const source = read('resources/lp2-transcription.txt').split('%');
const runeMap = new Map(db.runes.map((g, i) => [g, i]));
const stops = new Set(['-', '.', '&', '$', '§']);
assert.equal(pages.length, 55);
assert.equal(source.length, 57);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.shape[0], 32);
assert.equal(grid.shape[1], 8);
const key = grid.bytes.map(v => v % 29);

/** @type {number[]} */
const full = [];
/** @type {number[]} */
const wordIndices = [];
let wordNumber = 0;
let inWord = false;
for (let pi = 0; pi < pages.length; pi++) {
  let count = 0;
  for (const glyph of source[pi]) {
    if (runeMap.has(glyph)) {
      const v = runeMap.get(glyph);
      full.push(v);
      wordIndices.push(wordNumber);
      inWord = true;
      count++;
    } else if (stops.has(glyph) && inWord) {
      wordNumber++;
      inWord = false;
    }
  }
  assert.equal(count, pages[pi].indices.length,
    'transcription page ' + pages[pi].page);
}
if (inWord) wordNumber++;
assert.equal(full.length, 12956);
assert.equal(wordNumber, 2896);
assert.deepEqual(full, pages.flatMap(p => p.indices));

const starts = {};
let total = 0;
for (const page of db.pages) {
  starts[page.page] = total;
  total += page.indices.length;
}
const preStart = starts[48] + db.pages[48].indices.length - 72;
const postStart = starts[51];
const postEnd = starts[52] + 78;
assert.equal(postStart - preStart, 138);
assert.equal(postEnd - postStart, 170);
assert.equal(starts[50], starts[51]);

const original = full.slice(preStart, postEnd);
const w = wordIndices.slice(preStart, postEnd);
assert.equal(original.length, 308);
assert.equal(w.length, original.length);
assert.deepEqual(original.slice(0, 138), [
  ...db.pages[48].indices.slice(-72), ...db.pages[49].indices
]);
assert.deepEqual(original.slice(138), [
  ...db.pages[51].indices, ...db.pages[52].indices.slice(0, 78)
]);
assert.equal(new Set(w.slice(0, 138)).size, 33);
assert.equal(new Set(w.slice(138)).size, 40);
assert.equal(w[137] + 1, w[138]);
assert.equal(w[307] - w[0] + 1, 73);

/** @param {number} a @returns {number} */
const mod = a => ((a % 29) + 29) % 29;

/**
 * Exactly one table row per printed source word, reused after 32 words.
 * @param {number} at
 * @returns {number}
 */
function row(at) {
  return (w[at] - w[0]) % 32;
}

/** @param {number[]} cipher @returns {number[]} */
function decode(cipher) {
  assert.equal(cipher.length, w.length);
  const out = [];
  for (let i = 0; i < cipher.length; i++) {
    let feedback = 0;
    for (let j = 1; j <= 8; j++) {
      if (i >= j) feedback += key[row(i) * 8 + j - 1] * cipher[i - j];
    }
    out.push(mod(cipher[i] - feedback));
  }
  return out;
}

/** @param {number[]} plain @returns {number[]} */
function encode(plain) {
  assert.equal(plain.length, w.length);
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    let feedback = 0;
    for (let j = 1; j <= 8; j++) {
      if (i >= j) feedback += key[row(i) * 8 + j - 1] * cipher[i - j];
    }
    cipher.push(mod(plain[i] + feedback));
  }
  return cipher;
}

/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const freq = new Array(29).fill(0);
  arr.forEach(v => freq[v]++);
  return freq.reduce((sum, f) => sum + f * (f - 1), 0) /
    (arr.length * (arr.length - 1));
}
/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10,
    actual + ' != ' + expected);
}
const model = buildSourceNativeTrigramModel({
  corpus: db,
  referenceText: read('resources/liber-primus/lp1-plaintext-reference.txt')
});
const p = decode(original);
assert.deepEqual(encode(p), original);
near(ioc(p.slice(0, 138)), 0.03533269861419655);
near(ioc(p.slice(138)), 0.03362339018447616);
near(ioc(db.pages[57].indices), 0.06270996640537514);

// Independently authored native GP29 source with the exact same 33+40
// source-word clocks. The sender does not read the original ciphertext.
const planted = model.training.slice(800, 1108);
assert.equal(planted.length, 308);
const encrypted = encode(planted);
const recovered = decode(encrypted);
assert.deepEqual(recovered, planted);
assert.ok(new Set(planted).size >= 20);
const scores = {
  originalPre: model.scoreStream(p.slice(0, 138)).mean,
  originalPost: model.scoreStream(p.slice(138)).mean,
  nativePositivePre: model.scoreStream(recovered.slice(0, 138)).mean,
  nativePositivePost: model.scoreStream(recovered.slice(138)).mean
};
assert.ok(scores.nativePositivePre > scores.originalPre + 0.45);
assert.ok(scores.nativePositivePost > scores.originalPost + 0.45);
assert.ok(ioc(p.slice(0, 138)) < 0.05);
assert.ok(ioc(p.slice(138)) < 0.05);

console.log(JSON.stringify({
  status: 'PASS',
  source: 'original GP29 138+170 complete flank sentences and p50 32x8 bytes',
  claim: 'source-motivated but unselected word-clock 8-tap FIR, negative',
  sourceWords: { pre: 33, post: 40 },
  keyBytes: grid.bytes.length,
  rowClock: 'each complete printed word, modulo32; continuous through table',
  initialCipherContext: 'eight F=0 slots before pretable sentence',
  pre: {
    runes: 138,
    ioc: ioc(p.slice(0, 138)),
    trigram: scores.originalPre,
    preview: model.spell(p.slice(0, 100))
  },
  post: {
    runes: 170,
    ioc: ioc(p.slice(138)),
    trigram: scores.originalPost,
    preview: model.spell(p.slice(138, 238))
  },
  knownPositive: {
    runesRecovered: 308,
    trigramPre: scores.nativePositivePre,
    trigramPost: scores.nativePositivePost,
    exactOriginalReencryption: true
  },
  control: { p57IoC: ioc(db.pages[57].indices), p57Trigram: model.p57Score },
  verdict: 'No original plaintext; table does not specify the feedback equation.'
}, null, 2));
