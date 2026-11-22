'use strict';

/**
 * Source-native GP29 necessary-condition test for all two-back rank28
 * encoders that map a fixed plaintext rune EA (28) to repeated ciphertext.
 *
 * The exact key/state is irrelevant to this necessary condition:
 * at every non-page-initial site P_i = EA iff C_i = C_(i-1).
 * This SFT tests the original printed 2,896 words with ALL 29,157
 * TextBlob English lexicon entries, preserving original source-native
 * IN[G], IO, EA and TH rune normalization from the existing tested module.
 *
 * No ciphertext key fitting or plaintext claims. This diagnostic can
 * reject the preserved-English-word EA-sentinel hypothesis as a plausible
 * source-native language model, without excluding all other languages or
 * cipher grammars.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runes = corpus.runes;
const runeIndex = new Map(runes.map((r, i) => [r, i]));
const regex = new RegExp('[' + runes.join('') + ']+', 'gu');
const original = (read('resources/liber-primus/lp2-transcription.txt')
  .replace(/[/\r\n%$&]/g, '').match(regex) || []).slice(0, 2896);
const cipher = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);

assert.equal(original.length, 2896);
assert.equal(cipher.length, 12956);
assert.deepEqual(original.flatMap(w => Array.from(w, ch => runeIndex.get(ch))), cipher);

/** @type {Set<number>} */
const starts = new Set();
let pos = 0;
for (const p of corpus.pages.filter(p => p.page < 56)) {
  starts.add(pos);
  pos += p.indices.length;
}
assert.equal(pos, 12956);

/**
 * @param {number[]} values
 * @returns {string} Word-local fixed-EA sentinel mask.
 */
function eaMask(values) {
  return values.map(v => v === 28 ? 'E' : 'n').join('');
}

/**
 * @param {string} mask One position '?' represents a page reset.
 * @returns {string[]} All assignments to reset-only undecidable positions.
 */
function assignments(mask) {
  if (!mask.includes('?')) return [mask];
  return ['n', 'E'].flatMap(ch => assignments(mask.replace('?', ch)));
}

/** @type {Map<string, {n: number, weight: number, words: string[]}>} */
const lexiconMasks = new Map();
/** @type {Map<number, {all: number, ea: number, types: number, eaTypes: number}>} */
const lexiconEnd = new Map();
let lexiconCount = 0;
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  if (!/^[a-z]+ \d+$/.test(line)) continue;
  const [word, rawCount] = line.split(' ');
  const weight = Number(rawCount);
  const gp = encodeSourceNativeGP(word);
  const mask = eaMask(gp);
  const k = gp.length + ':' + mask;
  const item = lexiconMasks.get(k) || {n: 0, weight: 0, words: []};
  item.n += 1;
  item.weight += weight;
  if (item.words.length < 5) item.words.push(word);
  lexiconMasks.set(k, item);

  const end = lexiconEnd.get(gp.length) || {all: 0, ea: 0, types: 0, eaTypes: 0};
  end.all += weight;
  end.types += 1;
  if (gp.at(-1) === 28) {
    end.ea += weight;
    end.eaTypes += 1;
  }
  lexiconEnd.set(gp.length, end);
  lexiconCount += 1;
}
assert.equal(lexiconCount, 29157);
assert.deepEqual(encodeSourceNativeGP('tea'), [16, 28]);
assert.deepEqual(encodeSourceNativeGP('area'), [24, 4, 28]);

const unknownMasks = [];
const endings = [];
const sizes = [];
const allEvents = [];
let offset = 0;
for (let i = 0; i < original.length; i += 1) {
  const width = Array.from(original[i]).length;
  sizes.push(width);
  const mask = [];
  for (let j = 0; j < width; j += 1) {
    const x = offset + j;
    const unknown = starts.has(x);
    const repeated = !unknown && cipher[x] === cipher[x - 1];
    mask.push(unknown ? '?' : repeated ? 'E' : 'n');
    if (repeated) {
      allEvents.push({wordIndex: i, letterIndex: j, globalOffset: x});
      if (j === width - 1) endings.push({wordIndex: i, wordLength: width});
    }
  }
  const pattern = mask.join('');
  const possible = assignments(pattern);
  const total = possible.reduce((n, m) =>
    n + (lexiconMasks.get(width + ':' + m)?.n || 0), 0);
  if (!total) unknownMasks.push({
    wordIndex: i, globalOffset: offset, width, pattern, source: original[i]
  });
  offset += width;
}
assert.equal(offset, 12956);
assert.equal(allEvents.length, 86);
assert.equal(endings.length, 19);
assert.deepEqual(unknownMasks.map(x => x.wordIndex), [167, 444, 1390, 1476, 1697]);
assert.equal(unknownMasks.find(x => x.wordIndex === 1476)?.pattern, 'nnnnnEnnnnnE');
assert.equal(unknownMasks.find(x => x.wordIndex === 1476)?.width, 12);

const solved = native.sections.flatMap(s => s.source_text.match(regex) || []);
assert.equal(solved.length, 740);
const originalNativeEndEA = solved.filter(w => Array.from(w).at(-1) === runes[28]).length;
assert.equal(originalNativeEndEA, 0);

/**
 * Exact Poisson-binomial right tail, conditional on the 2,896 original
 * word lengths and independent empirical frequency-weighted dictionary
 * draws for each length. Absorb all states >= threshold.
 *
 * @param {'weight'|'types'} weighting
 * @param {number} threshold Number of EA-ending words.
 * @returns {{mean: number, upperTail: number}}
 */
function lengthMatchedTail(weighting, threshold) {
  const dp = Array(threshold).fill(0);
  dp[0] = 1;
  let tail = 0;
  let mean = 0;
  for (const width of sizes) {
    const lex = lexiconEnd.get(width);
    assert(lex && lex[weighting] > 0);
    const p = weighting === 'weight' ? lex.ea / lex.all : lex.eaTypes / lex.types;
    mean += p;
    tail += dp[threshold - 1] * p;
    for (let i = threshold - 1; i >= 1; i -= 1)
      dp[i] = dp[i] * (1 - p) + dp[i - 1] * p;
    dp[0] *= 1 - p;
  }
  return {mean, upperTail: tail};
}
const weighted = lengthMatchedTail('weight', 19);
const uniformTypes = lengthMatchedTail('types', 19);
assert.ok(Math.abs(weighted.mean - 1.5187520268894459) < 1e-9);
assert.ok(Math.abs(weighted.upperTail - 4.844395216453808e-15) < 1e-20);
assert.ok(Math.abs(uniformTypes.mean - 17.08185791043271) < 1e-9);
assert.ok(Math.abs(uniformTypes.upperTail - 0.3516916056226294) < 1e-9);

console.log(JSON.stringify({
  originalRunes: cipher.length,
  originalWords: original.length,
  originalSamePageDoublets: allEvents.length,
  forcedEAAtWordEnd: endings.length,
  missingWordLengthAndEAProfiles: unknownMasks,
  independentSolvedNativeWords: solved.length,
  independentSolvedWordsEndingEA: originalNativeEndEA,
  dictionaryEnglishWords: lexiconCount,
  englishWeightedEndEA: weighted,
  englishUniformTypeEndEA: uniformTypes,
  interpretation: 'EA-sentinel + preserved GP-English word grammar is poorly supported under ' +
    'frequency-weighted words. Exact lexicon and weighting assumptions are essential; ' +
    'no authentic unknown-page plaintext/key is recovered.'
}, null, 2));
