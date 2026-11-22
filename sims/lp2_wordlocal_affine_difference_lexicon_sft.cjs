'use strict';

/**
 * SFT: exact original LP2 wordwise affine predecessor-difference inverse.
 * For each authentic printed word w and each interior position j>=1:
 *   (C[w,j]-C[w,j-1]) mod 29 = a[w]*P[w,j]+b[w] mod 29,
 * with ANY secret a[w] in 1..28 and b[w] in 0..28, separately per word.
 * The first plaintext rune is entirely unconstrained.
 * Run with Node.js 22: node sims/lp2_wordlocal_affine_difference_lexicon_sft.cjs
 * This test is purely lexical; it does not assert a complete LP2 solution.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const load = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const solved = JSON.parse(load('resources/external/relikd-solved-gp29-native-v1.json'));
const sourceText = load('resources/liber-primus/lp2-transcription.txt');
const dictionaryText = load('resources/control/english_wordfreq_textblob.txt');

const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const indexToRune = new Map(corpus.translit.map((r, i) => [r, i]));
indexToRune.set('ING', indexToRune.get('NG'));

/**
 * Original '/' and newlines are physical line breaks, and '%' is a page
 * break: none is a genuine printed word boundary. This retains all 32
 * original across-page carried words. Solved-source bullet/newline delimiters
 * are editorial plaintext separators instead.
 * @param {string} source
 * @param {boolean} nativeSolved
 * @returns {number[][]}
 */
function wordsFromRunes(source, nativeSolved) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  for (const ch of source) {
    const idx = runeToIndex.get(ch);
    if (idx !== undefined) {
      current.push(idx);
    } else if ((nativeSolved && '-.,;&$•⁘⁜ \n'.includes(ch)) ||
      (!nativeSolved && '-.,;&$•⁘⁜ '.includes(ch))) {
      if (current.length) words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

const pageSegments = sourceText.split('%');
assert.equal(pageSegments.length, 57, 'Original derived transcription contains 55 unknown rune pages plus two solved pages');
const originalWords = wordsFromRunes(pageSegments.slice(0, 55).join('%'), false);
const nativeWords = solved.sections.flatMap((s) => wordsFromRunes(s.source_text, true));
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.reduce((n, w) => n + w.length, 0), 12956);

const multigraphs = ['ING', 'TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
const alias = { K: 'C', V: 'U', Q: 'C', Z: 'S' };

/**
 * Reproduce one conventional GP29 English transliteration for an independent
 * finite dictionary control. Exact published solved-page GP runes supplement
 * these heuristic spellings, covering all native positive-control tokens.
 * @param {string} word
 * @returns {number[] | null}
 */
function encodeEnglish(word) {
  const input = word.toUpperCase().replace(/[KVQZ]/g, (ch) => alias[ch]);
  /** @type {number[]} */
  const result = [];
  for (let i = 0; i < input.length;) {
    const part = multigraphs.find((g) => input.startsWith(g, i)) || input[i];
    const idx = indexToRune.get(part);
    if (idx === undefined) return null;
    result.push(idx);
    i += part.length;
  }
  return result;
}

/** @param {number} x */
function inv29(x) {
  for (let y = 1; y < 29; y++) if (x * y % 29 === 1) return y;
  throw new Error('Noninvertible nonzero residue in prime field');
}

/**
 * Complete invariant of all nonzero slopes and arbitrary intercepts over
 * F_29. Two nonconstant vectors have the same canonical form iff exactly one
 * nonzero affine map sends one to the other. Constant vectors have one class.
 * @param {number[]} seq
 */
function affineCanonical(seq) {
  const pivot = seq.findIndex((v) => v !== seq[0]);
  if (pivot < 0) return 'constant';
  const inv = inv29((seq[pivot] - seq[0] + 29) % 29);
  return seq.map((v) => (v - seq[0] + 29) * inv % 29).join(',');
}

/** @type {{word: string, v: number[]}[]} */
const lexicon = [];
for (const line of dictionaryText.split('\n')) {
  const m = /^([a-z]+) (\d+)$/.exec(line.trim());
  if (!m) continue;
  const v = encodeEnglish(m[1]);
  if (v && v.length >= 6) lexicon.push({ word: m[1], v });
}
for (const v of nativeWords.filter((w) => w.length >= 6)) {
  lexicon.push({ word: v.map((i) => corpus.translit[i]).join(''), v });
}

/** @type {Map<string, {word: string, v: number[]}[]>} */
const lexBySuffixClass = new Map();
for (const e of lexicon) {
  const k = e.v.length + ':' + affineCanonical(e.v.slice(1));
  const arr = lexBySuffixClass.get(k) || [];
  arr.push(e);
  lexBySuffixClass.set(k, arr);
}

/**
 * @param {number[]} c
 * @returns {{word: string, v: number[]}[]}
 */
function recoverLexicalCandidates(c) {
  const step = c.slice(1).map((v, j) => (v - c[j] + 29) % 29);
  return lexBySuffixClass.get(c.length + ':' + affineCanonical(step)) || [];
}

// Actual source question, with ALL 812 secret (a,b) pairs available anew on
// every original word. Original first rune and original page clocks are free.
const byLen = new Map();
const matchesByLen = new Map();
for (const word of originalWords) {
  if (word.length < 6) continue;
  byLen.set(word.length, (byLen.get(word.length) || 0) + 1);
  if (recoverLexicalCandidates(word).length) {
    matchesByLen.set(word.length, (matchesByLen.get(word.length) || 0) + 1);
  }
}
assert.deepEqual([...byLen].sort((a, b) => a[0] - b[0]), [
  [6, 256], [7, 216], [8, 156], [9, 78], [10, 52],
  [11, 32], [12, 18], [13, 4], [14, 3],
]);
assert.deepEqual([...matchesByLen], [[6, 45]]);
const long = [...byLen].filter(([n]) => n >= 7).reduce((s, [, n]) => s + n, 0);
assert.equal(long, 559);

// Independent positive: generate a fresh secret affine slope/intercept per
// published native GP29 word and reconstruct the EXACT true suffix from its
// ciphertext alone via the same ALL-SECRET invariant.
let planted = 0;
for (const p of nativeWords.filter((w) => w.length >= 6)) {
  const a = (p.length * 7 + 3) % 29 || 1;
  const b = p.reduce((s, x) => s + x, 0) % 29;
  const c = [17];
  for (let j = 1; j < p.length; j++) c.push((c[j - 1] + a * p[j] + b) % 29);
  for (let j = 1; j < p.length; j++) {
    assert.ok((c[j] - c[j - 1] - a * p[j] - b) % 29 === 0);
    assert.equal(((c[j] - c[j - 1] - b + 58) * inv29(a)) % 29, p[j]);
  }
  assert.ok(recoverLexicalCandidates(c).some((e) =>
    e.v.length === p.length && e.v.every((r, j) => r === p[j])));
  planted++;
}
assert.equal(planted, 178);

console.log(JSON.stringify({
  target: 'LP2 physical p0-p55 (55 rune-bearing pages)',
  originalWords: originalWords.length,
  originalRunes: originalWords.reduce((n, w) => n + w.length, 0),
  matchingRule: 'delta_cipher = a*plaintext + b (mod29), a!=0, each printed word independently',
  freelyChosenSecretAlphabetsPerWord: 28 * 29,
  totalLexiconEntries: lexicon.length,
  originalWordCountsByLength: Object.fromEntries(byLen),
  originalLexiconMatchesByLength: Object.fromEntries(matchesByLen),
  originalWordsLengthAtLeast7WithoutAnyMatch: long,
  plantedExactNativeWordRecoveries: planted,
}, null, 2));