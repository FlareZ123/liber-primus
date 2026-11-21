'use strict';

/**
 * P50 256-phase secret additive key plus unrestricted epoch offsets.
 *
 * Claimed model: C[i] = P[i] + K[i mod 256] + L[floor(i/256)] mod 29.
 * Every K and L is UNKNOWN and arbitrarily secret. Comparing cipher
 * differences at the same phase across cycles cancels both without
 * recovering or guessing any key. Phase255 crosses epoch offsets and is
 * deliberately excluded. Original page-edge pairs are also excluded.
 *
 * Windows 11 / Node.js 22: node sims/lp2_p50_256phase_epochoffset_allsecret_sft.cjs
 * The test is strictly conditional on preserved GP29 words with
 * ordinary English letter statistics, and does not recover plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const cipher = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(cipher.length, 12956);

// Locate original source page breaks, without manufacturing any new ones.
const samePhysicalPage = new Uint8Array(cipher.length);
let total = 0;
for (const p of pages) {
  for (let i = 1; i < p.indices.length; i++) {
    samePhysicalPage[total + i] = 1;
  }
  total += p.indices.length;
}
assert.equal(total, cipher.length);

// Derive the actual 2,896 printed word lengths, including page-carry words.
// Split('%') omits the rune-free physical page50; the first 55 pieces hold
// all original p0..55 runes. Line-wrap '/' and whitespace do not end words.
const runes = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const source = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('');
/** @type {number[]} */
const wordLengths = [];
let wordLength = 0;
for (const ch of source) {
  if (runes.has(ch)) wordLength++;
  else if (ch === '/' || /\s/u.test(ch)) continue;
  else if (wordLength) {
    wordLengths.push(wordLength);
    wordLength = 0;
  }
}
if (wordLength) wordLengths.push(wordLength);
assert.equal(wordLengths.length, 2896);
assert.equal(wordLengths.reduce((sum, n) => sum + n, 0), cipher.length);

/**
 * Count across-cycle equality of adjacent-rune increments at each fixed
 * phase. This value is EXACTLY invariant under every choice of 256
 * phase-specific additive keys and every choice of 51 epoch shifts.
 * @param {number[]} sequence
 * @returns {{equal:number,pairs:number,normalized:number}}
 */
function deltaCoincidence(sequence) {
  assert.equal(sequence.length, cipher.length);
  const bins = Array.from({ length: 255 }, () => new Uint16Array(29));
  for (let i = 1; i < sequence.length; i++) {
    const phase = (i - 1) & 255;
    if (phase === 255 || !samePhysicalPage[i]) continue;
    const delta = (sequence[i] - sequence[i - 1] + 29) % 29;
    bins[phase][delta]++;
  }
  let equal = 0;
  let pairs = 0;
  for (const row of bins) {
    let n = 0;
    for (const count of row) {
      n += count;
      equal += count * (count - 1) / 2;
    }
    pairs += n * (n - 1) / 2;
  }
  return { equal, pairs, normalized: 29 * equal / pairs };
}

const actual = deltaCoincidence(cipher);
assert.equal(actual.equal, 11301);
assert.equal(actual.pairs, 317458);
console.log('original exact all-secret invariant', actual);

const gp = new Map(corpus.translit.map((glyph, i) => [glyph, i]));
const digraphs = new Set(['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']);

/**
 * Convert source-prose words to GP29 letters using explicitly declared
 * deterministic normalization. It is an approximation to source register,
 * and the exclusion is conditional on these comparison corpora.
 * @param {string} text
 * @returns {number[][][]} words grouped by runic length
 */
function sourceWords(text) {
  const clean = text.toUpperCase()
    .replace(/K/g, 'C').replace(/V/g, 'U')
    .replace(/Q/g, 'C').replace(/Z/g, 'S');
  /** @type {number[][][]} */
  const buckets = Array.from({ length: 22 }, () => []);
  for (const match of clean.matchAll(/[A-Z]+/g)) {
    const token = match[0];
    /** @type {number[]} */
    const values = [];
    for (let i = 0; i < token.length;) {
      const two = token.slice(i, i + 2);
      if (digraphs.has(two)) {
        values.push(gp.get(two));
        i += 2;
      } else {
        const value = gp.get(token[i]);
        if (value === undefined) {
          values.length = 0;
          break;
        }
        values.push(value);
        i++;
      }
    }
    if (values.length && values.length < buckets.length) {
      buckets[values.length].push(values);
    }
  }
  return buckets;
}

let rng = 0x33013301;
/** @returns {number} */
function random() {
  rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
  return rng / 0x100000000;
}

/**
 * Draw an independent reference word of the exact original length at
 * every source word site. The cipher's original word boundaries remain
 * unchanged; no sentence words are chosen to favor the ciphertext.
 * @param {number[][][]} buckets
 * @returns {number[]}
 */
function drawEnglish(buckets) {
  /** @type {number[]} */
  const text = [];
  for (const length of wordLengths) {
    const words = buckets[length];
    assert.ok(words && words.length, 'missing source word of length ' + length);
    text.push(...words[Math.floor(random() * words.length)]);
  }
  assert.equal(text.length, cipher.length);
  return text;
}

const sourceFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
];
for (const file of sourceFiles) {
  const words = sourceWords(read(file));
  let minimum = Infinity;
  let maximum = -Infinity;
  let sum = 0;
  let lower = 0;
  for (let i = 0; i < 250; i++) {
    const sample = drawEnglish(words);
    const observed = deltaCoincidence(sample);
    if (i === 0) {
      // Independent secret keys and cycle offsets leave this invariant
      // unchanged even though ciphertext and plaintext look different.
      const plant = sample.map((p, index) =>
        (p + (37 * (index & 255) + 3) % 29
           + (17 * Math.floor(index / 256) + 2) % 29) % 29);
      assert.deepEqual(deltaCoincidence(plant), observed);
    }
    minimum = Math.min(minimum, observed.normalized);
    maximum = Math.max(maximum, observed.normalized);
    sum += observed.normalized;
    if (observed.normalized <= actual.normalized) lower++;
  }
  assert.equal(lower, 0);
  assert.ok(minimum > actual.normalized);
  console.log(JSON.stringify({
    corpus: file, samples: 250, mean: sum / 250,
    minimum, maximum, atOrBelowOriginal: lower,
    original: actual.normalized
  }));
}
console.log('PASS: 750/750 source-native word-shape controls exceed the source-exact original invariant.');
