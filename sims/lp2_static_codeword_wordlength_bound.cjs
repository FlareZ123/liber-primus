'use strict';

/**
 * Original-input necessary length bound for a position-independent, injective
 * GP29-rune -> nonempty alphabetic-string codebook preserving printed words.
 *
 * The English-language condition is narrow: only A/I are treated as valid
 * one-letter whole words. An optional archaic-O sensitivity is also printed.
 * This makes no claim about plaintext decoded with other cipher architectures.
 *
 * Run against the repository's canonical resources, using Node built-ins.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const src = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');

const alphabet = new Map(src.runes.map((r, i) => [r, i]));
const unsolved = src.pages.filter((p) => p.page >= 0 && p.page <= 55);
const originalIndices = unsolved.flatMap((p) => p.indices);
assert.equal(originalIndices.length, 12956);
assert.equal(src.runes.length, 29);

/*
 * Slash is a printed LINE break and percent is a printed PAGE break; both
 * can occur inside an original word. '-' and '.' terminate printed words.
 * '&', '$', and '§' annotate source sections, without adding a word break.
 * This tokenizer is cross-checked against every original rune in the JSON.
 */
const filtered = transcription.replace(/[\r\n/%&$§]/g, '');
const candidates = filtered.split(/[-.]/u)
  .map((w) => [...w].filter((c) => alphabet.has(c)).join(''))
  .filter(Boolean);

const words = [];
let counted = 0;
for (const word of candidates) {
  if (counted === originalIndices.length) break;
  assert.ok(counted + word.length <= originalIndices.length);
  words.push(word);
  counted += word.length;
}
assert.equal(words.length, 2896);
assert.equal(counted, 12956);
assert.deepEqual(words.join('').split('').map((r) => alphabet.get(r)), originalIndices);

const frequencies = Array(29).fill(0);
for (const i of originalIndices) frequencies[i] += 1;

const loneTokens = words.filter((w) => w.length === 1);
const loneCounts = Array(29).fill(0);
for (const w of loneTokens) loneCounts[alphabet.get(w)] += 1;
const loneTypes = loneCounts.map((count, i) => ({ i, count, freq: frequencies[i] }))
  .filter((x) => x.count > 0)
  .sort((a, b) => b.freq - a.freq || a.i - b.i);
assert.equal(loneTypes.length, 28);
assert.equal(loneTokens.length, 83);
assert.deepEqual(loneCounts.map((c, i) => c === 0 ? i : -1).filter((i) => i >= 0), [5]);

/**
 * For an injective codebook, only m of the 28 standalone cipher symbols can
 * map to m different one-letter English whole words. Every other standalone
 * glyph must map to a string of at least two letters, whenever it occurs.
 * The one remaining nonstandalone glyph may map to one letter.
 *
 * Sort by global corpus frequency to minimize the mandatory expansion.
 * @param {number} maxOneLetterWords
 * @returns {{oneLetterRuneTypes:number[],added:number,minimumLetters:number,meanWordLength:number}}
 */
function lowerBound(maxOneLetterWords) {
  assert.ok(Number.isInteger(maxOneLetterWords) && maxOneLetterWords >= 0 && maxOneLetterWords <= 28);
  const oneLetterRuneTypes = loneTypes.slice(0, maxOneLetterWords).map((x) => x.i);
  const added = loneTypes.slice(maxOneLetterWords).reduce((s, x) => s + x.freq, 0);
  const minimumLetters = originalIndices.length + added;
  return { oneLetterRuneTypes, added, minimumLetters, meanWordLength: minimumLetters / words.length };
}

const standard = lowerBound(2);
const archaicO = lowerBound(3);
assert.equal(standard.added, 11539);
assert.equal(standard.minimumLetters, 24495);
assert.equal(archaicO.minimumLetters, 24024);
assert.deepEqual(standard.oneLetterRuneTypes, [22, 24]);

/*
 * Synthetic structural plant: choose A/I for the top two standalone types,
 * a single-letter Z for the only rune never printed as a standalone word,
 * and 26 distinct two-letter codes starting with B for the other types.
 * This mapping is prefix-free. It witnesses tightness of the COMBINATORIAL
 * lower bound, while intentionally making NO English-plaintext claim.
 */
const codewords = Array(29).fill('');
standard.oneLetterRuneTypes.forEach((i, j) => { codewords[i] = ['A', 'I'][j]; });
codewords[5] = 'Z';
const longer = loneTypes.filter((x) => !standard.oneLetterRuneTypes.includes(x.i));
assert.equal(longer.length, 26);
longer.forEach((x, j) => { codewords[x.i] = 'B' + String.fromCharCode(65 + j); });
assert.ok(codewords.every(Boolean));
assert.equal(new Set(codewords).size, 29);

const encoded = words.map((word) => [...word].map((r) => codewords[alphabet.get(r)]).join(''));
assert.equal(encoded.reduce((s, w) => s + w.length, 0), standard.minimumLetters);

const decode = (text) => {
  const chars = [];
  for (let i = 0; i < text.length;) {
    let cw;
    if (text[i] === 'B') { cw = text.slice(i, i + 2); i += 2; }
    else { cw = text[i]; i += 1; }
    const index = codewords.indexOf(cw);
    assert.ok(index >= 0, 'synthetic positive-control codeword');
    chars.push(src.runes[index]);
  }
  return chars.join('');
};
assert.deepEqual(encoded.map(decode), words);

const maxMeanSix = Array.from({ length: 29 }, (_, m) => ({ m, ...lowerBound(m) }))
  .find((r) => r.meanWordLength <= 6);
assert.equal(maxMeanSix.m, 18);

console.log(JSON.stringify({
  result: 'CONDITIONAL ORIGINAL-SOURCE LENGTH BOUND; NO LP2 DECRYPTION',
  unsolvedPages: 56,
  runes: originalIndices.length,
  words: words.length,
  loneTokens: loneTokens.length,
  loneTypes: loneTypes.length,
  missingLoneRune: src.translit[5],
  standardTwoOneLetterWords: {
    ...standard,
    chosen: standard.oneLetterRuneTypes.map((i) => src.translit[i])
  },
  archaicThreeOneLetterWords: archaicO,
  maxMeanSix: {
    requiredLoneTypesMappedToOneLetter: maxMeanSix.m,
    unavoidableTypeCollisionsWhenOnlyTwoEnglishOneLetterWords: maxMeanSix.m - 2,
    minimumLetters: maxMeanSix.minimumLetters
  },
  syntheticPrefixFreeRoundTrip: true,
  caveat: 'Only static injective rune-to-nonempty alphabetic-string codebooks with exactly preserved printed word boundaries.'
}, null, 2));
