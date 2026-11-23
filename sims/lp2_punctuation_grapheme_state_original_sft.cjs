'use strict';

/**
 * Original-source GP29 punctuation-state grapheme test.
 * Node.js 22, standalone read-only SFT:
 *   node sims/lp2_punctuation_grapheme_state_original_sft.cjs
 *
 * Compare two completely frozen source-visible period/hyphen tie-breakers.
 * All words retain their printed rune count; slash and page marks carry words.
 * These are explicit candidate serializers, not claimed author algorithms.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const lp2 = load('resources/liber-primus/lp2-transcription.txt');
const lp1 = load('resources/transcriptions/lp1_wulfic_canonical.txt');
const runeOrdinal = new Map(corpus.runes.map((r, i) => [r, i]));
const spelling = corpus.translit;
assert.equal(spelling.length, 29);

/**
 * Printed word parser. A slash and a percent are typesetting carries.
 * Percent still increments the transcription's rune-bearing page number.
 * Physical LP2 p50 contains no runes and has no transcription part.
 * @param {string} source
 */
function parseWords(source) {
  let part = 0, runeOffset = 0, preceding = '^';
  let tokens = [], startingPart = 0, startingOffset = 0;
  const result = [];
  function flush() {
    if (tokens.length) {
      result.push({part: startingPart, at: startingOffset, preceding, tokens});
      tokens = [];
    }
  }
  for (const ch of source) {
    if (runeOrdinal.has(ch)) {
      if (tokens.length === 0) {
        startingPart = part;
        startingOffset = runeOffset;
      }
      tokens.push(runeOrdinal.get(ch));
      runeOffset++;
    } else if (ch === '%') {
      part++;
    } else if (!'/ \t\r\n'.includes(ch)) {
      flush();
      preceding = ch;
    }
  }
  flush();
  return result;
}

/** Return every legal same-rune-length reserialization in published GP order.
 * @param {{tokens: number[]}} word
 * @returns {number[][]}
 */
function alternatives(word) {
  const latin = word.tokens.map(i => spelling[i]).join('');
  const width = word.tokens.length;
  const result = [];
  /** @param {number} pos @param {number[]} tokens */
  function step(pos, tokens) {
    if (tokens.length > width) return;
    if (pos === latin.length) {
      if (tokens.length === width) result.push(tokens);
      return;
    }
    for (let i = 0; i < 29; i++) {
      if (latin.startsWith(spelling[i], pos)) {
        step(pos + spelling[i].length, [...tokens, i]);
      }
    }
  }
  step(0, []);
  result.sort((a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return 0;
  });
  return result;
}

/** @param {number[]} a @param {number[]} b */
function equal(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}
const canonical = parseWords(lp2);
const unknown = canonical.filter(w => w.part < 55);
const p57 = canonical.filter(w => w.part === 56);
const clearLP1 = parseWords(lp1).filter(w =>
  [3, 8, 9, 10, 11, 14].includes(w.part));
assert.equal(unknown.length, 2896);
assert.equal(unknown.reduce((a, w) => a + w.tokens.length, 0), 12956);
assert.equal(p57.length, 20);
assert.equal(clearLP1.length, 230);
assert.equal(clearLP1.reduce((a, w) => a + w.tokens.length, 0), 1001);

const cache = new Map();
/** @param {{tokens:number[]}} word */
function parses(word) {
  const key = word.tokens.length + ':' +
    word.tokens.map(i => spelling[i]).join('');
  if (!cache.has(key)) cache.set(key, alternatives(word));
  return cache.get(key);
}
const ambiguousUnknown = unknown.filter(w => parses(w).length > 1);
assert.equal(ambiguousUnknown.length, 204);
assert.equal(clearLP1.filter(w => parses(w).length > 1).length, 0);
assert.equal(p57.filter(w => parses(w).length > 1).length, 0);

// A complete, deterministic reversible output for a given Latin word, exact
// rune length and preceding printed punctuation. Rule A: '.' => smallest
// GP-order parse, every other mark => largest. Rule B reverses that choice.
// The original tokens must be reconstructed exactly; retention of Latin spelling
// and rune length alone cannot count as a successful original forward replay.
/** @param {number} rule @param {{preceding:string,tokens:number[]}} word */
function predict(rule, word) {
  const all = parses(word);
  const period = word.preceding === '.';
  const small = rule === 0 ? period : !period;
  return all[small ? 0 : all.length - 1];
}
const regions = [
  ['p0-2', w => w.part <= 2, 729, 7, [3, 3]],
  ['p16-21 word-origin', w => w.part >= 16 && w.part <= 21, 1615, 34, [15, 15]],
  ['p40-53 word-origin', w => w.part >= 40 && w.part <= 52, 3008, 58, [24, 24]],
  ['all original unknown', () => true, 12956, 204, [94, 88]]
];
for (const [name, includes, expectedRunes, expectedAmbiguous, expectedMatches] of regions) {
  const chosen = unknown.filter(includes);
  const ambiguous = chosen.filter(w => parses(w).length > 1);
  const runes = chosen.reduce((sum, w) => sum + w.tokens.length, 0);
  assert.equal(runes, expectedRunes);
  assert.equal(ambiguous.length, expectedAmbiguous);
  for (let rule = 0; rule < 2; rule++) {
    let matched = 0;
    for (const word of ambiguous) {
      const candidate = predict(rule, word);
      assert.equal(candidate.length, word.tokens.length);
      assert.equal(candidate.map(i => spelling[i]).join(''),
        word.tokens.map(i => spelling[i]).join(''));
      if (equal(candidate, word.tokens)) matched++;
    }
    assert.equal(matched, expectedMatches[rule]);
    console.log('SOURCE_PUNCTUATION_GATE', name, 'rule=' + (rule + 1),
      'runes=' + runes, 'ambiguous=' + ambiguous.length,
      'exact_original=' + matched,
      'different_original=' + (ambiguous.length - matched));
  }
}

// Condition only on physical source word lengths. If LP1 clear words were
// sampled without replacement from LP2 ciphertext words in each fixed-length
// stratum, compute the exact probability of observing no ambiguous parse.
// This is a descriptive, conditional comparison, not an author-intent p-value.
const lp2ByLength = new Map();
const nativeByLength = new Map();
for (const word of unknown) {
  const n = word.tokens.length;
  const bin = lp2ByLength.get(n) || {total: 0, ambiguous: 0};
  bin.total++;
  if (parses(word).length > 1) bin.ambiguous++;
  lp2ByLength.set(n, bin);
}
for (const word of clearLP1) {
  const n = word.tokens.length;
  nativeByLength.set(n, (nativeByLength.get(n) || 0) + 1);
}
let logZero = 0, expectation = 0;
for (const [length, draw] of nativeByLength) {
  const {total, ambiguous} = lp2ByLength.get(length);
  assert.ok(total >= draw);
  expectation += draw * ambiguous / total;
  for (let i = 0; i < draw; i++) {
    logZero += Math.log((total - ambiguous - i) / (total - i));
  }
}
assert.ok(Math.abs(expectation - 15.364092025457833) < 1e-9);
assert.ok(Math.abs(Math.exp(logZero) - 4.508988675116549e-8) < 1e-15);
console.log('SOURCE_NATIVE_CONTROL', 'LP1_clear_words=' + clearLP1.length,
  'LP1_clear_ambiguous=0', 'p57_solved_words=20',
  'p57_solved_ambiguous=0');
console.log('LENGTH_STRATIFIED_CONDITIONAL_NULL',
  'expected_ambiguous=' + expectation.toFixed(6),
  'P_zero=' + Math.exp(logZero).toExponential(8));
console.log('PASS: two punctuation-source tie-breakers fail the original replay;',
  'no genuine unknown LP2 plaintext or author-selected key recovered.');
