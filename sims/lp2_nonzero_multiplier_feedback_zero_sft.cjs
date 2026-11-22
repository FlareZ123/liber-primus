'use strict';

/**
 * Key-independent original LP2 GP29 multiplicative-feedback zero gate.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_nonzero_multiplier_feedback_zero_sft.cjs
 *
 * Model, with any nonzero secret multiplier K_i and one fixed global zero rune s:
 *   C_i = C_(i-1) + K_i * (P_i - s) mod 29.
 * This is a necessary-condition test for direct source-native English output,
 * not an identification of the historical cipher. No files are written.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

/** @param {string} relativePath */
function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const originalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const originalLength = originalPages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(originalLength, 12956);
assert.equal(originalPages.length, 55);

const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number} a */
function inv29(a) {
  assert.notEqual(mod29(a), 0);
  for (let k = 1; k < 29; k++) if (mod29(a * k) === 1) return k;
  throw new Error('No inverse for a nonzero GP29 field element');
}

// Across a full physical page, all zero steps have the same plaintext label.
// Every first rune is an unobserved predecessor transition, conservatively
// permitting one additional zero-label plaintext rune per rune-bearing page.
const equalTransitions = originalPages.reduce((sum, page) =>
  sum + page.indices.slice(1).filter((x, i) => x === page.indices[i]).length, 0);
assert.equal(equalTransitions, 86);
const maxZeroLabelCount = equalTransitions + originalPages.length;
assert.equal(maxZeroLabelCount, 141);

// Original visual chapter pp27–32 permits an independently selected s,
// but that label must remain fixed throughout its six original pages.
const chapterPages = originalPages.filter(p => p.page >= 27 && p.page <= 32);
const chapterLength = chapterPages.reduce((n, p) => n + p.indices.length, 0);
const chapterEqualTransitions = chapterPages.reduce((sum, page) =>
  sum + page.indices.slice(1).filter((x, i) => x === page.indices[i]).length, 0);
const chapterMaxZero = chapterEqualTransitions + chapterPages.length;
assert.deepEqual([chapterPages.length, chapterLength, chapterEqualTransitions, chapterMaxZero],
  [6, 1433, 13, 19]);

// Continuous original printed words include seven cross-page fragments.
// Splitting at '/\n' or '%' would mis-state the original word constraints.
const parsed = parseLP2Words(source);
assert.equal(parsed.runeCount, originalLength);
assert.equal(parsed.words.length, 2896);
const affected = [];
let forcedWithinWord = 0;
for (let i = 0; i < parsed.words.length; i++) {
  const word = parsed.words[i];
  const glyphs = [...word.runes];
  const positions = [];
  for (let j = 1; j < glyphs.length; j++)
    if (glyphs[j] === glyphs[j - 1]) positions.push(j);
  if (positions.length) {
    forcedWithinWord += positions.length;
    affected.push({i, word, positions});
  }
}
assert.equal(forcedWithinWord, 63);
assert.equal(affected.length, 62);
const witness = affected.find(x => x.word.startPage === 27 &&
  x.word.runes === 'ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ');
assert.ok(witness, 'original p27 doublet word not found');
assert.equal(witness.word.length, 12);
assert.deepEqual(witness.positions, [5, 11]);

// Use the repo's established source-native GP spellings for English controls,
// including replacement of K/Q/V/Z, ING and IO. This exact routine appears in
// sims/lp2_p39_quadratic_multiplicative_feedback_sft.cjs.
const tokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} originalWord @returns {number[] | null} */
function encodeGP(originalWord) {
  const normalized = originalWord.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const found = tokens.find(t => normalized.startsWith(t.token, i));
    if (!found) return null;
    result.push(found.i);
    i += found.token.length;
  }
  return result;
}

const lexiconByLength = new Map();
for (const match of read('resources/control/english_wordfreq_textblob.txt')
  .matchAll(/^([a-z]+) (\d+)$/gm)) {
  const gp = encodeGP(match[1]);
  if (!gp) continue;
  const entries = lexiconByLength.get(gp.length) || [];
  entries.push(gp);
  lexiconByLength.set(gp.length, entries);
}
assert.equal([...lexiconByLength.values()].reduce((n, a) => n + a.length, 0), 29154);

// A global zero-label candidate must occur at BOTH positions 5 and 11 in
// SOME source-native English word of GP length 12. No other original words
// are fitted to obtain this independent, single-word witness.
const wordCandidates = lexiconByLength.get(12);
assert.ok(wordCandidates);
const possibleZeroLabels = corpus.translit
  .map((symbol, i) => ({symbol, i}))
  .filter(({i}) => wordCandidates.some(word => word[5] === i && word[11] === i));
assert.deepEqual(possibleZeroLabels.map(x => x.symbol),
  ['C', 'N', 'S', 'T', 'E', 'L', 'D', 'A']);

const sourceControls = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 391, 24],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 289, 21],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 408, 25],
];

for (const [name, relativePath, expectedMin, expectedChapterMin] of sourceControls) {
  const text = read(relativePath);
  const samples = (text.match(/[A-Za-z]+/g) || []).flatMap(word => encodeGP(word) || []);
  assert.ok(samples.length >= originalLength);
  const windowCount = new Int32Array(29);
  for (let i = 0; i < originalLength; i++) windowCount[samples[i]]++;
  const minimum = Int32Array.from(windowCount);
  for (let i = originalLength; i < samples.length; i++) {
    windowCount[samples[i]]++;
    windowCount[samples[i - originalLength]]--;
    for (const {i: rune} of possibleZeroLabels)
      if (windowCount[rune] < minimum[rune]) minimum[rune] = windowCount[rune];
  }
  const smallest = Math.min(...possibleZeroLabels.map(({i}) => minimum[i]));
  assert.equal(smallest, expectedMin);
  assert.ok(smallest > maxZeroLabelCount);
  const chapterCounts = new Int32Array(29);
  for (let i = 0; i < chapterLength; i++) chapterCounts[samples[i]]++;
  const chapterMin = Int32Array.from(chapterCounts);
  for (let i = chapterLength; i < samples.length; i++) {
    chapterCounts[samples[i]]++;
    chapterCounts[samples[i - chapterLength]]--;
    for (const {i: rune} of possibleZeroLabels)
      if (chapterCounts[rune] < chapterMin[rune]) chapterMin[rune] = chapterCounts[rune];
  }
  const smallestChapter = Math.min(...possibleZeroLabels.map(({i}) => chapterMin[i]));
  assert.equal(smallestChapter, expectedChapterMin);
  assert.ok(smallestChapter > chapterMaxZero);
  console.log(name, 'native GP runes', samples.length,
    'full-book minimum', smallest, 'original maximum', maxZeroLabelCount,
    'chapter p27–32 minimum', smallestChapter, 'chapter maximum', chapterMaxZero);
}

// Synthetic positive control proves both forward and inverse implementations,
// including the exact zero-step invariant, for two chosen zero-label mappings.
const plain = corpus.pages.find(p => p.page === 57).indices;
assert.equal(plain.length, 95);
for (const s of [0, 18]) {
  let previous = 17;
  const cipher = [];
  const recovered = [];
  for (let i = 0; i < plain.length; i++) {
    const k = 1 + (i % 28);
    const c = mod29(previous + k * (plain[i] - s));
    const p = mod29(s + inv29(k) * (c - previous));
    assert.equal(c === previous, plain[i] === s);
    cipher.push(c);
    recovered.push(p);
    previous = c;
  }
  assert.deepEqual(recovered, plain);
  console.log('Positive plant', corpus.translit[s], 'recovered', recovered.length, 'runes');
}
console.log('ORIGINAL', originalLength, 'runes;', originalPages.length,
  'pages;', equalTransitions, 'within-page equal ciphertext steps;',
  forcedWithinWord, 'within-word steps;', affected.length, 'affected words');
console.log('p27 witness, 12 runes, within-word zero-step positions',
  witness.positions.join(','), 'surviving zero labels',
  possibleZeroLabels.map(x => x.symbol).join(','));
console.log('DECISION: global or visual-chapter-fixed zero-label nonzero-multiplier feedback',
  'cannot yield this source-native English register with intact printed words.',
  'No original LP2 plaintext or secret key recovered.');
