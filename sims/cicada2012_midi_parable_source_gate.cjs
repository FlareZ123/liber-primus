#!/usr/bin/env node
'use strict';

/**
 * Exact source-only comparison of the decoded 2012 MIDI submission words and
 * the historically reused 2013 PARABLE text in solved LP2 physical p57.
 *
 * Run: node sims/cicada2012_midi_parable_source_gate.cjs
 * Input artifact: neuroretransmit/cicada/2012/009-midi-puzzle/words.txt,
 * pinned Git blob 4351148626eaaed6854713b0c037fc3cdedff6f1.
 * This test does not decode any unknown Liber Primus ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));

const originalMidiWords = (
  'muscle drop pump knee birdwatch bell ball hammer pocket hook house brake ' +
  'feather knot ticket boat box moon cloud bulb carriage box tray square cup ' +
  'station match tooth oven horse pencil tray collar tree scissors brush drawer ' +
  'brick arm engine sock umbrella sheep apple horn hat chain fork screw'
).split(' ');

// Exact rune-to-Roman values in the solved p57, preserving historical GP
// orthography (C for K, U for V, and the dedicated NG rune).
const p57Words = (
  'PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN ' +
  'CIRCUMFERENCES FIND THE DIUINITY WITHIN AND EMERGE'
).split(' ');

const p57 = corpus.pages.find((page) => page.page === 57);
assert.equal(p57.status, 'solved');
assert.equal(p57.runic_count, 95);
const p57Source = p57.indices.map((index) => corpus.translit[index]).join('');
assert.equal(p57Words.join(''), p57Source);
assert.equal(p57Words.length, 20);
assert.equal(originalMidiWords.length, 49);

const duplicates = originalMidiWords.filter((word, i) =>
  originalMidiWords.indexOf(word) === i &&
  originalMidiWords.lastIndexOf(word) !== i
);
assert.deepEqual(duplicates, ['box', 'tray']);
assert.equal(new Set(originalMidiWords).size, 47);

const bodyWords = p57Words.slice(1).map((word) => word.toLowerCase());
const sourceSet = new Set(originalMidiWords);
const literalCommon = [...new Set(bodyWords)].filter((word) =>
  sourceSet.has(word)
);
assert.deepEqual(literalCommon, []);

const conventionalBody = (
  'LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN ' +
  'CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE'
).toLowerCase().split(' ');
assert.equal(conventionalBody.length, 19);
const conventionalCommon = [...new Set(conventionalBody)].filter((word) =>
  sourceSet.has(word)
);
assert.deepEqual(conventionalCommon, []);

/** Return consecutive word sequences, preserving order and duplicates.
 * @param {string[]} words
 * @param {number} width
 * @returns {Set<string>}
 */
function windows(words, width) {
  const out = new Set();
  for (let i = 0; i + width <= words.length; i++) {
    out.add(words.slice(i, i + width).join(' '));
  }
  return out;
}
const midiBigrams = windows(originalMidiWords, 2);
const bodyBigrams = windows(conventionalBody, 2);
const sharedBigrams = [...bodyBigrams].filter((pair) => midiBigrams.has(pair));
assert.deepEqual(sharedBigrams, []);

console.log(JSON.stringify({
  classification: 'bounded original-source comparison, no LP2 decryption',
  midi: {
    recordedStage: '2012 009-midi-puzzle, original 49-word submission',
    witnessGitBlob: '4351148626eaaed6854713b0c037fc3cdedff6f1',
    count: originalMidiWords.length,
    distinctWords: new Set(originalMidiWords).size,
    repeatedEntries: duplicates
  },
  parable: {
    recordedStage: '2013 761.MP3 metadata, repeated as solved LP2 p57',
    bodyWords: bodyWords.length,
    originalRuneCount: p57.runic_count,
    transliterationMatchesOriginal: true
  },
  directSharedWords: literalCommon,
  conventionalSpellingSharedWords: conventionalCommon,
  sharedConsecutivePairs: sharedBigrams,
  established2012Instruction: 'encrypt and sign this 49-word list and send it',
  sourceSelected49To19Operation: false,
  recoveredUnknownPlaintext: false
}, null, 2));
