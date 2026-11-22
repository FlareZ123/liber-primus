'use strict';

/**
 * All-key original-cipher necessity gate for GP29 Caesar shifts chosen afresh
 * for every one of the 2,896 printed LP2 words. This includes any
 * deterministic, secret or causal word-to-shift schedule with one shift
 * constant inside each printed word. Source-native positive plants check
 * all 12,956 positions. Ordinary GP English vocabulary is a conditional
 * reference register, not an assertion that LP2 plaintext is modern English.
 * Windows 11 / Node.js 22: run as a standalone CJS source test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const load = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const book = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const transcript = load('resources/liber-primus/lp2-transcription.txt');
const dictionary = load('resources/control/english_wordfreq_textblob.txt');
const runeSet = new Set(book.runes);

/** @param {number} n @returns {number} */
const mod29 = (n) => (n % 29 + 29) % 29;
/** @param {number[]} word @returns {string} */
const normalized = (word) => word.map((v) => mod29(v - word[0])).join(',');

const original = transcript.replace(/[\/\n%&$§]/g, '').split(/[-.]/)
  .map((word) => Array.from(word).filter((rune) => runeSet.has(rune))
    .map((rune) => book.runes.indexOf(rune)))
  .filter((word) => word.length)
  .slice(0, 2896);
const sourceTape = book.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(original.length, 2896);
assert.equal(sourceTape.length, 12956);
assert.deepEqual(original.flat(), sourceTape);

const tokens = [
  ['ING', 21], ['NG', 21], ['IO', 27],
  ...book.translit.map((name, index) => [name, index])
    .filter(([name]) => name !== 'IA'),
].sort((a, b) => b[0].length - a[0].length);

/**
 * Historical GP orthographic normalization, consistent with the existing
 * original-source TextBlob register in lp2_fixed_selfloop_symbol_original_gate.
 * @param {string} input
 * @returns {number[] | null}
 */
function encodeEnglish(input) {
  const source = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < source.length;) {
    const token = tokens.find(([name]) => source.startsWith(name, i));
    if (!token) return null;
    out.push(token[1]);
    i += token[0].length;
  }
  return out;
}

const byLength = new Map();
const allShapes = new Set();
let vocabularyWords = 0;
for (const line of dictionary.split(/\r?\n/)) {
  const found = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!found) continue;
  const word = encodeEnglish(found[1]);
  if (!word || word.length > 14) continue;
  vocabularyWords += 1;
  allShapes.add(normalized(word));
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
}
assert.equal(vocabularyWords, 29088);

const byLengthOutcome = new Map();
const unmatched = [];
for (let i = 0; i < original.length; i += 1) {
  const word = original[i];
  const length = word.length;
  if (!byLengthOutcome.has(length)) {
    byLengthOutcome.set(length, { length, total: 0, unmatched: 0 });
  }
  const tally = byLengthOutcome.get(length);
  tally.total += 1;
  if (!allShapes.has(normalized(word))) {
    tally.unmatched += 1;
    unmatched.push({
      wordIndex: i,
      length,
      originalGP: word.map((index) => book.translit[index]).join(''),
    });
  }
}
assert.equal(unmatched.length, 1879);
assert.equal(byLengthOutcome.get(5).unmatched, 316);
for (let length = 6; length <= 14; length += 1) {
  const tally = byLengthOutcome.get(length);
  assert.equal(tally.unmatched, tally.total);
}

// Exact source-length-matched English plant under a fresh arbitrary
// per-word key, including long words. A Caesar key cannot alter normalized
// differences, regardless of how it is chosen (even adaptively).
const nativePlaintext = [];
const nativeCiphertext = [];
for (let i = 0; i < original.length; i += 1) {
  const candidates = byLength.get(original[i].length);
  assert.ok(candidates && candidates.length > 0);
  const word = candidates[(17 * i + 13) % candidates.length];
  const shift = (11 * i + 3) % 29;
  const cipher = word.map((v) => mod29(v + shift));
  const recovered = cipher.map((v) => mod29(v - shift));
  assert.deepEqual(recovered, word);
  assert.ok(allShapes.has(normalized(cipher)));
  nativePlaintext.push(...word);
  nativeCiphertext.push(...cipher);
}
assert.equal(nativePlaintext.length, 12956);
assert.equal(nativeCiphertext.length, 12956);

console.log(JSON.stringify({
  scope: 'fresh arbitrary full-word constant Caesar shift, all 29 keys per word',
  originalRuneCount: sourceTape.length,
  originalPrintedWordCount: original.length,
  sourceNativeVocabularyWords: vocabularyWords,
  distinctNormalizedVocabularyShapes: allShapes.size,
  unmatchedOriginalWords: unmatched.length,
  allSourceWordsLengthSixOrMoreUnmatched: true,
  byLength: [...byLengthOutcome.values()].sort((a, b) => a.length - b.length),
  examples: unmatched.slice(0, 12),
  plantedGpRuneRecoveries: nativePlaintext.length,
  verdict: 'Every constant-in-word Caesar key schedule fails this conditional English-register necessity gate on the original ciphertext; no plaintext, key or cipher is recovered.',
}, null, 2));
