#!/usr/bin/env node
'use strict';

/**
 * Exact original GP29 rune-equality test for the 41-word LP2 p19 /
 * Shakespeare word-length bag coincidence.
 *
 * Allows arbitrary permutation of all 41 whole words and an independently
 * secret injective rune substitution in EACH word. Such a cipher necessarily
 * preserves the within-word equality pattern. Exhaustive bipartite matching
 * proves how many words can be explained under this generous cipher.
 *
 * Windows: node sims/lp2_p19_shakespeare_sourcebag_wordpattern_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const gpNames = ['ING', 'IO', ...corpus.translit]
  .sort((a, b) => b.length - a.length);

/**
 * @param {string} w
 * @returns {string[]} GP-native symbolic register.
 */
function encode(w) {
  const source = w.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let pos = 0; pos < source.length;) {
    const token = gpNames.find((name) => source.startsWith(name, pos));
    assert(token, 'Unrecognized GP token in ' + source.slice(pos));
    // NG and ING denote the same native GP rune in the solved text.
    // IO is a monograph in the source length register, kept separate here;
    // for this candidate none of the 41 source words contains IO.
    out.push(token === 'ING' ? 'NG' : token);
    pos += token.length;
  }
  return out;
}
/**
 * Canonical shape survives any injective within-word rune substitution.
 * @param {string[]} symbols
 * @returns {string}
 */
function pattern(symbols) {
  const key = new Map();
  return symbols.map((s) => {
    if (!key.has(s)) key.set(s, key.size);
    return key.get(s);
  }).join(',');
}

/**
 * Standard augmenting-path maximum bipartite matching on all word pairs.
 * @param {string[][]} ciphertext
 * @param {string[][]} source
 * @returns {{maxWords:number,sourceAssignment:number[],unmatchedCiphertext:number[]}}
 */
function matchPatterns(ciphertext, source) {
  const candidates = ciphertext.map((a) =>
    source.map((b, i) => pattern(a) === pattern(b) ? i : -1)
      .filter((i) => i >= 0));
  const sourceAssignment = Array(source.length).fill(-1);
  /** @param {number} i @param {Set<number>} seen */
  function augment(i, seen) {
    for (const j of candidates[i]) {
      if (seen.has(j)) continue;
      seen.add(j);
      if (sourceAssignment[j] === -1 ||
          augment(sourceAssignment[j], seen)) {
        sourceAssignment[j] = i;
        return true;
      }
    }
    return false;
  }
  let matched = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    if (augment(i, new Set())) matched++;
  }
  const assigned = new Set(sourceAssignment.filter((i) => i >= 0));
  return {maxWords:matched,sourceAssignment,
    unmatchedCiphertext:ciphertext.map((_, i) => i).filter((i) => !assigned.has(i))};
}

const alphaSet = new Set(corpus.runes);
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const pageBlocks = transcript.split('%').slice(0, 55);
const sourceWords = read('resources/control/shakespeare_first300k.txt')
  .replace(/\r?\n/g, ' ').split(/[.!?;:]+/)
  .flatMap((p) => p.match(/[A-Za-z]+/g) || []);
const sourceWindows = [35571, 35572];

/** @type {string[][][]} */
const spans = [];
let words = [];
let word = [];
function endWord() {
  if (word.length) words.push(word);
  word = [];
}
function endSpan() {
  endWord();
  if (words.length) spans.push(words);
  words = [];
}
for (const page of pageBlocks) {
  for (const ch of page) {
    if (alphaSet.has(ch)) word.push(ch);
    else if (ch === '-') endWord();
    else if ('.&$§'.includes(ch)) endSpan();
  }
}
endSpan();
assert.equal(spans.length, 175);
const cipher = spans[68].concat(spans[69]);
assert.equal(cipher.length, 41);
assert.equal(spans[68].length,23);
assert.equal(spans[69].length,18);
const sortedLengths = cipher.map((word)=>word.length)
  .sort((a,b)=>a-b).join(',');
const originalMatches = [];
for (const start of sourceWindows) {
  const originalWords = sourceWords.slice(start,start+41);
  const source = originalWords.map(encode);
  assert.equal(sortedLengths, source.map((word)=>word.length)
    .sort((a,b)=>a-b).join(','), 'Printed exact length match');
  const found=matchPatterns(cipher,source);
  assert(found.maxWords < 41);
  // Any arbitrary independent word substitution preserves the pattern.
  // Plant a scrambled source with one-to-one GP-symbol relabeling.
  const alphabet = corpus.runes;
  const encodedPlant=source.map((a) => a.map((s) => {
    const index=corpus.translit.indexOf(s);
    assert(index>=0);
    return alphabet[(index*7+3)%29];
  })).reverse();
  assert.equal(matchPatterns(encodedPlant,source).maxWords,41);
  originalMatches.push({
    sourceStart:start,
    sourceExcerpt:originalWords.join(' '),
    words:41,
    matchingWordlengthBag:true,
    maximumWordPatternMatching:found.maxWords,
    impossibleToMatchWords:41-found.maxWords,
    unmatchedOriginalCipherWordIndexes:found.unmatchedCiphertext
  });
}
console.log(JSON.stringify({
  status:'PASS',
  originalPhysicalPage:19,
  originalAdjacentPunctuationSpans:[68,69],
  originalWords:41,
  model:'arbitrary word permutation and arbitrary injective per-word GP29 substitution',
  matches:originalMatches,
  exact41WordSyntheticPositiveControls:2,
  interpretation:'Both Shakespeare length-only matches fail a necessary word-equality-pattern condition under an extremely flexible one-to-one per-word substitution. State-dependent/non-injective ciphers remain possible.'
},null,2));
