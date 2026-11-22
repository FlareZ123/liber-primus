'use strict';
/**
 * An exact all-secret word-local five-phase additive cipher gate for original
 * LP2, including a zero-state five-back ciphertext-feedback variant.
 *
 * Each of 2,896 words may have its OWN independent five-element GF(29) key.
 * No key is fitted. At rune positions j>=5, either model necessarily obeys:
 *   direct:   C[j+5]-C[j] = P[j+5]-P[j] (mod 29);
 *   feedback: D[j+5]-D[j] = P[j+5]-P[j] (mod 29),
 * where D[j] = C[j] for j<5 and C[j]-C[j-5] thereafter.
 * This tests 29,157 period-source English dictionary spellings with unchanged
 * original words; it does not claim any actual unknown LP2 plaintext.
 *
 * SFT, Node 22: node sims/lp2_wordlocal_fivephase_allkey_lexicon_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
function read(filename) { return fs.readFileSync(path.join(root, filename), 'utf8'); }
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const spelling = read('resources/control/english_wordfreq_textblob.txt');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = transcription.split('%');
assert.equal(sections.length, 57);
const sourceWords = [];
let current = [];
for (const r of sections.slice(0, 55).join('%')) {
  if (runeIndex.has(r)) current.push(runeIndex.get(r));
  else if (r === '%' || r === '/' || /\s/u.test(r)) {}
  else if (current.length) { sourceWords.push(current); current = []; }
}
if (current.length) sourceWords.push(current);
assert.equal(sourceWords.length, 2896);
assert.deepEqual(sourceWords.flat(),
  corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
assert.equal(sourceWords.flat().length, 12956);

const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} source @returns {number[]} */
function native(source) {
  const normalized = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const symbol = tokens.find(t => normalized.startsWith(t.s, i));
    assert(symbol, 'unencoded dictionary word: ' + source);
    result.push(symbol.i);
    i += symbol.s.length;
  }
  return result;
}
const entries = [];
for (const line of spelling.split('\n')) {
  const m = /^([a-z]+) (\d+)$/u.exec(line);
  if (m) entries.push({ original: m[1], frequency: Number(m[2]),
    values: native(m[1]) });
}
assert.equal(entries.length, 29157);
/** @param {number[]} word @returns {string} */
function deltaFingerprint(word) {
  const deltas = [];
  for (let j = 5; j < word.length; j++)
    deltas.push((word[j] - word[j - 5] + 29) % 29);
  return word.length + ':' + deltas.join(',');
}
const lookup = new Map();
const sameLength = new Map();
for (const entry of entries) {
  const key = deltaFingerprint(entry.values);
  if (!lookup.has(key)) lookup.set(key, []);
  lookup.get(key).push(entry.original);
  if (!sameLength.has(entry.values.length)) sameLength.set(entry.values.length, []);
  sameLength.get(entry.values.length).push(entry.values);
}
/** @param {number[]} word @param {string} mode @returns {number[]} */
function observedOperand(word, mode) {
  if (mode === 'direct') return word.slice();
  return word.map((value, j) => j < 5 ? value :
    (value - word[j - 5] + 29) % 29);
}
/** @param {number[]} plaintext @param {number[]} key @param {string} mode @returns {number[]} */
function encrypt(plaintext, key, mode) {
  const out = [];
  for (let j = 0; j < plaintext.length; j++) {
    const previous = mode === 'feedback' && j >= 5 ? out[j - 5] : 0;
    out.push((plaintext[j] + key[j % 5] + previous) % 29);
  }
  return out;
}
/** @param {number[]} ciphertext @param {number[]} key @param {string} mode @returns {number[]} */
function decrypt(ciphertext, key, mode) {
  const observed = observedOperand(ciphertext, mode);
  return observed.map((x, j) => (x - key[j % 5] + 29) % 29);
}
const longOriginalWords = sourceWords.filter(w => w.length >= 10);
assert.equal(longOriginalWords.length, 109);
const longWithoutLiteralF = longOriginalWords.filter(w => !w.includes(0));
assert.equal(longWithoutLiteralF.length, 73);
const results = {};
for (const mode of ['direct', 'feedback']) {
  const byLength = {};
  let compatible = 0, noMatch = 0, tested = 0, plantRecovered = 0;
  const firstContradictions = [];
  for (let ordinal = 0; ordinal < sourceWords.length; ordinal++) {
    const ciphertext = sourceWords[ordinal];
    const n = ciphertext.length;
    const candidatePool = sameLength.get(n);
    assert(candidatePool && candidatePool.length, 'dictionary length ' + n);
    const plaintext = candidatePool[(ordinal * 4999 + 17) % candidatePool.length];
    const key = Array.from({ length: 5 },
      (_, j) => (17 * (ordinal + 1) + 23 * j * j + 7) % 29);
    const plantedCiphertext = encrypt(plaintext, key, mode);
    assert.deepEqual(decrypt(plantedCiphertext, key, mode), plaintext);
    if (n < 6) continue;
    const plantMatches = lookup.get(deltaFingerprint(
      observedOperand(plantedCiphertext, mode))) || [];
    assert(plantMatches.length > 0,
      'a genuine native-English five-phase plant must be found');
    plantRecovered++;
    const matches = lookup.get(deltaFingerprint(observedOperand(ciphertext, mode))) || [];
    const row = byLength[n] || { words: 0, compatible: 0 };
    row.words++;
    row.compatible += Number(matches.length > 0);
    byLength[n] = row;
    tested++;
    if (matches.length) compatible++;
    else {
      noMatch++;
      if (n >= 10 && firstContradictions.length < 4) {
        firstContradictions.push({ wordOrdinal: ordinal, runicLength: n,
          sourceTransliteration: ciphertext.map(i => corpus.translit[i]).join(' '),
          exactFivePhaseDifferences: deltaFingerprint(
            observedOperand(ciphertext, mode)) });
      }
    }
  }
  assert.equal(tested, 815);
  assert.equal(plantRecovered, 815);
  assert.equal(Object.entries(byLength).filter(([n]) => Number(n) >= 10)
    .reduce((total, [, v]) => total + v.words, 0), 109);
  for (const [n, v] of Object.entries(byLength))
    if (Number(n) >= 10) assert.equal(v.compatible, 0);
  if (mode === 'direct') {
    assert.equal(compatible, 488);
    assert.equal(noMatch, 327);
  } else {
    assert.equal(compatible, 484);
    assert.equal(noMatch, 331);
  }
  results[mode] = { tested, compatible, noMatch, byLength,
    lengthTenPlusNoMatch: 109, lengthTenPlusWithoutLiteralF: longWithoutLiteralF.length, nativeEnglishPlantsRecovered: plantRecovered,
    firstContradictions };
}
console.log(JSON.stringify({
  source: { lp2UnknownRunes: 12956, completePrintedWords: sourceWords.length,
    dictionaryNativeWords: entries.length },
  test: 'word-specific arbitrary secret five-phase ADDITIVE key',
  firstFiveFeedbackState: 'zero predecessor, same key as later phases',
  result: results,
  conclusion: 'All 109 unchanged original words of GP length >=10 lack a native-English candidate under either complete additive model; 73 have no original literal F and also cannot be rescued by the authenticated literal-F key-clock skip. Other secret alphabets, non-English registers and unrestricted first-block feedback states remain untested.'
}, null, 2));
