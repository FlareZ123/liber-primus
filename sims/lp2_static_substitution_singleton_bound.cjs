#!/usr/bin/env node
'use strict';

// Exact source-bound for a fixed global symbolwise map preserving printed words.
// The original-ink table marks complete one-rune words with kind "S".
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const lines = fs.readFileSync(
  path.join(root, 'im-results/lp2-original-ink-critical-sites.tsv'), 'utf8'
).trim().split(/\r?\n/);
const rows = lines.slice(1).map(line => line.split('\t'));
const singletonRows = rows.filter(row => row[2] === 'S');
const singletonTypes = new Set(singletonRows.map(row => row[4]));

assert.equal(corpus.runes.length, 29);
assert.equal(singletonRows.length, 83);
assert.equal(singletonTypes.size, 28);
for (const rune of singletonTypes) assert(corpus.runes.includes(rune));
const absent = corpus.runes.filter(rune => !singletonTypes.has(rune));
assert.deepEqual(absent, ['ᚳ']);

// If 28 source symbols occur as one-rune words and one source symbol does not,
// then all 28 images under a fixed word-preserving symbol map must be valid
// one-symbol plaintext words. The single remaining source symbol can add at
// most one further output symbol. A target with m singleton words therefore
// uses at most m+1 distinct plaintext symbols in the entire stream.
const sourceAlphabetSize = corpus.runes.length;
const singletonSourceTypes = singletonTypes.size;
const nonsingletonSourceTypes = sourceAlphabetSize - singletonSourceTypes;
const maxOutputSymbols = m => m + nonsingletonSourceTypes;
const minSingletonWordsForFullRegister = k => k - nonsingletonSourceTypes;

assert.equal(nonsingletonSourceTypes, 1);
assert.equal(maxOutputSymbols(3), 4); // English A/I, optionally O.
assert.equal(maxOutputSymbols(8), 9); // Union of five frozen Old English controls.
assert.equal(minSingletonWordsForFullRegister(16), 15);

console.log(JSON.stringify({
  source_runes: sourceAlphabetSize,
  singleton_words: singletonRows.length,
  singleton_source_rune_types: singletonSourceTypes,
  absent_from_singleton_words: absent,
  nonsingleton_source_rune_types: nonsingletonSourceTypes,
  max_output_symbols_if_m_singleton_words: {
    english_m3: maxOutputSymbols(3),
    old_english_union_m8: maxOutputSymbols(8)
  },
  minimum_singleton_words_for_full_16_symbol_output:
    minSingletonWordsForFullRegister(16),
  conclusion: 'fixed global symbolwise maps preserving printed spaces cannot produce source-normal English/Old English or a full 16-symbol YF natural-language register'
}, null, 2));
