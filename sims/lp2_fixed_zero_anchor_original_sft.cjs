/**
 * Fixed zero-anchor differential LP2 test.
 * Run: node sims/lp2_fixed_zero_anchor_original_sft.cjs
 * Original source: source JPEG-backed GP29 transcription, not translated guesses.
 *
 * @typedef {{runes:string[],translit:string[]}} Corpus
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
/** @type {Corpus} */
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const known = new Set(corpus.runes);
const translitByRune = new Map(corpus.runes.map((r, i) => [r, corpus.translit[i]]));
const runeByTranslit = new Map(corpus.translit.map((r, i) => [r, i]));
const gpTokens = [...corpus.translit].sort((a, b) => b.length - a.length);

/** GP29 text encoder matches the repository's historical ING/IO/V/K/Q/Z conventions.
 * @param {string} raw
 * @returns {string[]|null}
 */
function gp(raw) {
  const text = raw.toUpperCase().replace(/ING/g, 'NG').replace(/IO/g, 'IA')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  /** @type {string[]} */
  const out = [];
  for (let i = 0; i < text.length;) {
    const token = gpTokens.find((s) => text.startsWith(s, i));
    if (!token) return null;
    out.push(token);
    i += token.length;
  }
  return out;
}

/** @returns {string[][]} */
function originalWords() {
  /** @type {string[][]} */
  const words = [];
  /** @type {string[]} */
  let current = [];
  let runeCount = 0;
  for (const ch of read('resources/liber-primus/lp2-transcription.txt')) {
    if (known.has(ch)) {
      current.push(translitByRune.get(ch));
      runeCount++;
      if (runeCount === 12956) {
        words.push(current);
        break;
      }
    } else if ((ch === '-' || ch === '.') && current.length) {
      words.push(current);
      current = [];
    }
  }
  assert.equal(runeCount, 12956);
  assert.equal(words.length, 2896);
  return words;
}

/** @param {string[]} word @returns {number[]} */
const zeroPositions = (word) => word.flatMap((s, i) =>
  i > 0 && word[i - 1] === s ? [i] : []);

/** @returns {Map<number,string[][]>} */
function sourceLexicon() {
  /** @type {Map<number,string[][]>} */
  const out = new Map();
  for (const line of read('resources/control/english_wordfreq_textblob.txt').split('\n')) {
    const match = /^([a-z]+) (\d+)$/.exec(line.trim());
    if (!match) continue;
    const symbols = gp(match[1]);
    if (!symbols) continue;
    if (!out.has(symbols.length)) out.set(symbols.length, []);
    out.get(symbols.length).push(symbols);
  }
  return out;
}

/** In this invertible cipher family, delta C=0 iff P=q at each noninitial
 * word position, although every other secret permutation is free to change.
 * This test is a necessary condition for all such permutations.
 */
function lexiconGate() {
  const words = originalWords();
  const marked = words.map((w) => ({ len: w.length, zeros: zeroPositions(w) }))
    .filter((w) => w.zeros.length);
  const zeroCount = marked.reduce((n, w) => n + w.zeros.length, 0);
  assert.equal(marked.length, 62);
  assert.equal(zeroCount, 63);
  const dict = sourceLexicon();
  const passing = [];
  const failures = {};
  for (const q of corpus.translit) {
    const bad = marked.filter((w) => !(dict.get(w.len) || []).some((p) =>
      p.every((s, j) => (s === q) === w.zeros.includes(j))));
    failures[q] = bad.length;
    if (!bad.length) passing.push(q);
  }
  const expectedSurvivors = ['A', 'C', 'D', 'E', 'L', 'N', 'S', 'T'];
  assert.deepEqual(passing.slice().sort(), expectedSurvivors);
  console.log('ORIGINAL GP29:', words.length, 'words; 12956 runes;',
    marked.length, 'marked words;', zeroCount, 'within-word zero steps');
  console.log('TextBlob original-word-pattern feasible fixed zero inputs:',
    passing.join(', '));
  console.log('TextBlob-original-word-pattern excluded candidates:',
    JSON.stringify(failures));
  return { words, zeroCount, passing };
}

/** @param {string} content @returns {Map<number, string[][]>} */
function referenceByLength(content) {
  /** @type {Map<number,string[][]>} */
  const out = new Map();
  for (const match of content.matchAll(/[a-zA-Z]+/g)) {
    const w = gp(match[0]);
    if (!w || w.length < 2) continue;
    if (!out.has(w.length)) out.set(w.length, []);
    out.get(w.length).push(w.slice(1));
  }
  return out;
}

/** A rigorous Chernoff lower-tail bound *under independent sampling of
 * source words, conditional on original word lengths*. Missing-length slots
 * are omitted, making the gate conservative.
 * @param {Map<number,string[][]>} byLength
 * @param {Map<number,number>} counts
 * @param {string} q
 * @param {number} originalUpper
 */
function bound(byLength, counts, q, originalUpper) {
  const samples = [];
  let mean = 0;
  let variance = 0;
  let covered = 0;
  for (const [length, multiplicity] of counts) {
    const source = byLength.get(length);
    if (!source) continue;
    covered += multiplicity;
    const freq = new Map();
    for (const w of source) {
      const n = w.filter((x) => x === q).length;
      freq.set(n, (freq.get(n) || 0) + 1);
    }
    const dist = [...freq].map(([count, n]) => [count, n / source.length]);
    const m = dist.reduce((s, [count, p]) => s + count * p, 0);
    const v = dist.reduce((s, [count, p]) => s + (count - m) ** 2 * p, 0);
    mean += m * multiplicity;
    variance += v * multiplicity;
    samples.push([multiplicity, dist]);
  }
  /** @param {number} t */
  function logChernoff(t) {
    let sum = -t * originalUpper;
    for (const [n, dist] of samples) {
      const moment = dist.reduce((s, [k, p]) => s + p * Math.exp(t * k), 0);
      sum += n * Math.log(moment);
    }
    return sum;
  }
  let lo = -10;
  let hi = 0;
  for (let i = 0; i < 120; i++) {
    const a = lo + (hi - lo) / 3;
    const b = hi - (hi - lo) / 3;
    if (logChernoff(a) < logChernoff(b)) hi = b;
    else lo = a;
  }
  const log10Bound = Math.min(0, logChernoff((hi + lo) / 2)) / Math.LN10;
  return { mean, sd: Math.sqrt(variance), covered, log10Bound };
}

/** Constructive invertible positive, for each of the 29 fixed anchors.
 * Rotor changes its entire nonzero permutation at every position.
 */
function positiveControl() {
  for (const q of corpus.translit) {
    const plain = [q, 'S', q, 'AE', 'TH', q, 'E', 'NG', q, 'O'];
    const alphabet = corpus.translit.filter((s) => s !== q);
    let c = 9;
    const ciphertext = [c];
    for (let i = 1; i < plain.length; i++) {
      const delta = plain[i] === q ? 0 :
        1 + (3 * alphabet.indexOf(plain[i]) + 7 * i) % 28;
      c = (c + delta) % 29;
      ciphertext.push(c);
    }
    const recovered = [plain[0]];
    for (let i = 1; i < plain.length; i++) {
      const delta = (ciphertext[i] - ciphertext[i - 1] + 29) % 29;
      const p = delta === 0 ? q :
        alphabet.find((s, j) => 1 + (3 * j + 7 * i) % 28 === delta);
      recovered.push(p);
      assert.equal(delta === 0, plain[i] === q);
    }
    assert.deepEqual(recovered, plain);
  }
  console.log('POSITIVE: 29/29 lossless, time-varying rotor plants');
}

function main() {
  positiveControl();
  const { words, zeroCount, passing } = lexiconGate();
  const slots = new Map();
  for (const w of words) slots.set(w.length, (slots.get(w.length) || 0) + 1);
  const sources = [
    'gibran_prophet_58585.txt',
    'shakespeare_first300k.txt',
    'emerson_essays_2944.txt',
  ];
  for (const source of sources) {
    const book = referenceByLength(read('resources/control/' + source));
    const stats = passing.map((q) => ({ q, ...bound(book, slots, q, zeroCount) }));
    const minMean = Math.min(...stats.map((s) => s.mean));
    const weakestLog10 = Math.max(...stats.map((s) => s.log10Bound));
    assert.equal(Math.min(...stats.map((s) => s.covered)), 2813);
    assert.ok(minMean > 300);
    assert.ok(weakestLog10 < -70);
    console.log(source, JSON.stringify({
      minReferenceExpectedZeros: +minMean.toFixed(2),
      observedZerosUpperBound: zeroCount,
      weakestReferenceLog10TailBound: +weakestLog10.toFixed(2),
      survivors: stats.map(({ q, mean, log10Bound }) => [
        q, +mean.toFixed(2), +log10Bound.toFixed(2)]),
    }));
  }
  console.log('PASS: fixed zero-anchor original-cipher necessary gate');
}
main();
