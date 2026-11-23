'use strict';

/**
 * A read-only single-file test of the authentic GP29 rune-to-Latin grapheme
 * chart and its reversible-serialization ambiguity on original LP2 pages.
 *
 * Run with Node.js 22: node sims/lp2_gp_contextual_grapheme_source_sft.cjs
 * The inputs are committed original-source-derived resources.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const allParts = transcription.split('%');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const compound = new Set(corpus.translit.filter(token => token.length > 1));

/** @param {string} source */
function runeSequence(source) {
  return Array.from(source).filter(ch => runeIndex.has(ch));
}

/**
 * Read printed words. The slash and percent are line and page wraps, so
 * neither terminates a word. Original hyphens and punctuation do.
 * @param {string} source
 * @returns {string[][]}
 */
function wordsIn(source) {
  /** @type {string[][]} */
  const words = [];
  /** @type {string[]} */
  let current = [];
  function flush() {
    if (current.length) words.push(current);
    current = [];
  }
  for (const ch of source) {
    if (runeIndex.has(ch)) current.push(corpus.translit[runeIndex.get(ch)]);
    else if (!'/%\n\r \t'.includes(ch)) flush();
  }
  flush();
  return words;
}

/**
 * Build an alternative word by merging two literal, one-Latin-letter runes
 * that form an existing compound and splitting a different compound rune.
 * It changes real GP signs, preserves *each* printed word's rune length,
 * and preserves its literal Latin expansion exactly.
 * @param {string[]} word
 * @returns {string[] | null}
 */
function sameLengthAlternative(word) {
  const pairAt = word.findIndex((token, i) => i + 1 < word.length && compound.has(token + word[i + 1]));
  const splitAt = word.findIndex(token => compound.has(token));
  if (pairAt < 0 || splitAt < 0) return null;
  const changed = word.slice();
  changed.splice(pairAt, 2, word[pairAt] + word[pairAt + 1]);
  const shiftedSplitAt = splitAt > pairAt ? splitAt - 1 : splitAt;
  changed.splice(shiftedSplitAt, 1, ...word[splitAt].split(''));
  assert.equal(changed.length, word.length);
  assert.equal(changed.join(''), word.join(''));
  assert.notDeepEqual(changed, word);
  return changed;
}

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.translit.length, 29);
assert.equal(allParts.length, 57);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.pages.find(page => page.page === 50).runic_count, 0);
const normalized = allParts.flatMap(runeSequence);
const canonical = corpus.pages.flatMap(page => page.indices.map(index => corpus.runes[index]));
assert.deepEqual(normalized, canonical, 'All 13,136 original and solved runes must match the canonical corpus');

const originalText = allParts.slice(0, 55).join('%');
const original = wordsIn(originalText);
assert.equal(runeSequence(originalText).length, 12956);
assert.equal(original.length, 2896);
assert.equal(original.filter(w => w.length === 1).length, 83);
assert.equal(original.filter(w => w.length === 2).length, 448);

const singletons = original.filter(w => w.length === 1).map(w => w[0]);
const singletonSigns = new Set(singletons);
assert.equal(singletonSigns.size, 28);
assert.deepEqual([...new Set(corpus.translit)].filter(t => !singletonSigns.has(t)), ['C']);
const ordinarySingletons = singletons.filter(t => ['A', 'I', 'O'].includes(t));
assert.equal(ordinarySingletons.length, 10);
assert.equal(singletons.length - ordinarySingletons.length, 73);

let adjacentAmbiguities = 0;
let disjointAmbiguities = 0;
let affectedWords = 0;
const witness = [];
for (let wi = 0; wi < original.length; wi++) {
  const word = original[wi];
  const dp = new Array(word.length + 1).fill(0);
  let localMatches = 0;
  for (let i = 1; i < word.length; i++) {
    const isPair = compound.has(word[i - 1] + word[i]);
    if (isPair) localMatches++;
    dp[i + 1] = Math.max(dp[i], dp[i - 1] + (isPair ? 1 : -1000000));
  }
  adjacentAmbiguities += localMatches;
  disjointAmbiguities += dp[word.length];
  if (localMatches) affectedWords++;
  const other = sameLengthAlternative(word);
  if (other) witness.push({ wordIndex: wi, original: word, alternative: other });
}
assert.equal(adjacentAmbiguities, 100);
assert.equal(disjointAmbiguities, 95);
assert.equal(affectedWords, 92);
assert.equal(witness.length, 52);
assert.equal(witness[0].wordIndex, 0);
assert.equal(witness[0].original.join('|'), 'S|H|E|O|G|M|IA|F');
assert.equal(witness[0].alternative.join('|'), 'S|H|EO|G|M|I|A|F');
assert.equal(2n ** BigInt(witness.length), 4503599627370496n);

const solved = wordsIn(allParts[56]).map(word => word.join(''));
assert.ok(solved.includes('LICE'), 'Source-runic LIKE has C/K spelling ambiguity');
assert.ok(solved.includes('TUNNELNG'), 'Source-runic TUNNELING requires NG/ING context');
assert.ok(solved.includes('DIUINITY'), 'Source-runic DIVINITY requires U/V context');

const opening = wordsIn(allParts.slice(0, 3).join('%'));
const holdout = wordsIn(allParts.slice(40, 53).join('%')); // physical p40..53, skip empty p50
assert.ok(opening.flat().length >= 300);
assert.ok(holdout.flat().length >= 150);
console.log('ORIGINAL_SOURCE_MATCH PASS: source runes=', normalized.length, 'unknown=', 12956, 'words=', original.length);
console.log('ONE_RUNE_REGISTER singleton_total=', singletons.length,
  'distinct=', singletonSigns.size, 'raw_English_A_I_O=', ordinarySingletons.length,
  'requires_context_or_cipher=', 73);
console.log('LATIN_CHART_AMBIGUITY adjacent_pairs=', adjacentAmbiguities,
  'max_disjoint=', disjointAmbiguities, 'affected_words=', affectedWords,
  'same_word_length_witnesses=', witness.length, 'equivalent_tapes>=2^52');
console.log('WITNESS word0_original=', witness[0].original.join('|'));
console.log('WITNESS word0_alternative=', witness[0].alternative.join('|'));
console.log('WITNESS both_spell=', witness[0].original.join(''));
console.log('SOLVED_POSITIVE p57 requires LICE/LIKE, DIUINITY/DIVINITY, TUNNELNG/TUNNELING');
console.log('OPENING_ORIGINAL p0..2_runes=', opening.flat().length,
  'chart_start=', opening.slice(0, 8).map(w => w.join('')).join(' '));
console.log('INDEPENDENT_ORIGINAL_HOLDOUT p40..53_runes=', holdout.flat().length,
  'chart_start=', holdout.slice(0, 8).map(w => w.join('')).join(' '));
console.log('PASS: ordinary chart expansion is ambiguous even under frozen intact-word rune lengths; no new plaintext/key');
