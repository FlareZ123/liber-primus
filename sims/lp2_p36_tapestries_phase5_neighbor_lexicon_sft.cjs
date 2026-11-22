'use strict';
/**
 * The p36 TAPESTRIES-crib cross-word obstruction for every five-phase
 * page-continuous, fixed, bijective GP29 alphabet substitution.
 *
 * Single runnable file, Node.js 22: node sims/lp2_p36_tapestries_phase5_neighbor_lexicon_sft.cjs
 * Exact source-printed GP runes and existing pinned English lexicon.
 * Neither candidate word is authenticated plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyph = new Map(db.runes.map((rune, index) => [rune, index]));
const source = read('resources/lp2-transcription.txt').split('%')[36];
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pageInk = ink.pages.find((page) => page.page === 36);
assert.deepEqual(pageInk.large_punctuation, [[99, 10, 'red']]);
const words = [];
let current = [];
let position = 0;
let start = 0;
function flush() {
  if (current.length) {
    words.push({ start, indices: current });
    current = [];
    start = position;
  }
}
for (const ch of source) {
  if (glyph.has(ch)) {
    current.push(glyph.get(ch));
    position++;
  } else if ('-.$&§'.includes(ch)) {
    flush();
  }
}
flush();
assert.equal(position, 238);
assert.equal(words.length, 50);
const first = words[11];
const second = words[44];
const markedWitness = words[33];
assert.equal(first.start, 41);
assert.equal(second.start, 213);
assert.equal(markedWitness.start, 153);
assert.deepEqual(markedWitness.indices, [28, 22, 23, 22, 11, 10, 21, 27]);
assert.deepEqual(first.indices, [13, 22, 11, 24, 21, 13, 2, 13, 24, 21]);
assert.deepEqual(second.indices, [10, 17, 21, 13, 9, 10, 4, 6]);
const tokens = db.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/**
 * Canonical pinned GP word encoding from the established p36 test.
 * @param {string} word
 * @returns {number[]}
 */
function native(word) {
  const s = word.toUpperCase().replace(/ING/g, 'NG').replace(/K/g, 'C')
    .replace(/Q/g, 'CW').replace(/V/g, 'U').replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = tokens.find((x) => s.startsWith(x.s, i));
    if (!t) return [];
    out.push(t.i);
    i += t.s.length;
  }
  return out;
}
const anchor = native('TAPESTRIES');
assert.deepEqual(anchor, [16, 24, 13, 18, 15, 16, 4, 10, 18, 15]);
/**
 * All five GP29 permutation alphabets are entirely unrestricted.
 * A symbol→plaintext map and its inverse must each be functions.
 * @param {{start:number,indices:number[]}} wordA
 * @param {number[]} plainA
 * @param {{start:number,indices:number[]}} wordB
 * @param {number[]} plainB
 * @param {'page'|'word'|'red10'} clock
 * @returns {boolean}
 */
function consistent(wordA, plainA, wordB, plainB, clock) {
  const forward = Array.from({ length: 5 }, () => new Map());
  const backward = Array.from({ length: 5 }, () => new Map());
  for (const [word, plain] of [[wordA, plainA], [wordB, plainB]]) {
    if (word.indices.length !== plain.length) return false;
    for (let i = 0; i < plain.length; i++) {
      const originalOffset = word.start + i;
      const phase = clock === 'word' ? i % 5 :
        clock === 'red10' && originalOffset >= 99 ? (originalOffset - 99) % 5 :
          originalOffset % 5;
      const cipher = word.indices[i];
      const letter = plain[i];
      if (forward[phase].has(cipher) && forward[phase].get(cipher) !== letter)
        return false;
      if (backward[phase].has(letter) && backward[phase].get(letter) !== cipher)
        return false;
      forward[phase].set(cipher, letter);
      backward[phase].set(letter, cipher);
    }
  }
  return true;
}
assert(consistent(first, anchor, first, anchor, 'page'));
const dictionary = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter((line) => /^[a-z]+ \d+$/.test(line));
assert.equal(dictionary.length, 29157);
const eight = dictionary.map((line) => {
  const word = line.split(' ')[0];
  return { word, encoded: native(word) };
}).filter((entry) => entry.encoded.length === second.indices.length);
assert.equal(eight.length, 4210);
const same = eight.filter((entry) => entry.encoded[0] === entry.encoded[5]);
const forcedST = same.filter((entry) =>
  entry.encoded[2] === 15 && entry.encoded[3] === 16);
assert.deepEqual(forcedST.map((entry) => entry.word),
  ['abstract', 'australia', 'restored', 'westaway']);
const pageMatches = eight.filter((entry) =>
  consistent(first, anchor, second, entry.encoded, 'page'));
const wordMatches = eight.filter((entry) =>
  consistent(first, anchor, second, entry.encoded, 'word'));
const red10Matches = eight.filter((entry) =>
  consistent(first, anchor, second, entry.encoded, 'red10'));
const markedWitnessMatches = eight.filter((entry) =>
  consistent(first, anchor, markedWitness, entry.encoded, 'red10'));
assert.equal(pageMatches.length, 0);
assert.equal(wordMatches.length, 94);
assert.equal(red10Matches.length, 105);
assert.equal(markedWitnessMatches.length, 0);
// Independent plant: true 29-way bijections and genuine dictionary words
// encode both source-shaped word positions under the same fixed five states.
const positive = native('ABSTRACT');
assert.equal(positive.length, 8);
const multipliers = [1, 3, 5, 7, 9];
const shifts = [4, 6, 8, 10, 12];
/** @param {number[]} plain @param {number} offset @returns {{start:number,indices:number[]}} */
function plant(plain, offset) {
  return { start: offset, indices: plain.map((p, i) => {
    const phase = (offset + i) % 5;
    return (multipliers[phase] * p + shifts[phase]) % 29;
  }) };
}
const plantedFirst = plant(anchor, first.start);
const plantedSecond = plant(positive, second.start);
assert(consistent(plantedFirst, anchor, plantedSecond, positive, 'page'));
const corruption = { start: plantedSecond.start, indices: plantedSecond.indices.slice() };
corruption.indices[5] = (corruption.indices[5] + 1) % 29;
assert(!consistent(plantedFirst, anchor, corruption, positive, 'page'));
console.log(JSON.stringify({
  originalLP2Page: 36, originalImage: '53.jpg',
  sourceRunes: 238, printedWords: 50,
  anchor: { wordIndex: 11, runeOffset: 41, length: 10,
    candidate: 'TAPESTRIES', status: 'conditional crib only' },
  independentTarget: { wordIndex: 44, runeOffset: 213, length: 8 },
  lexiconWords: dictionary.length, eightRuneWords: eight.length,
  targetSamePhaseRepeatCandidates: same.length,
  forcedSTPlusRepeatCandidates: forcedST.map((entry) => entry.word),
  fiveFixedBijectionsPageClockMatches: pageMatches.length,
  fiveFixedBijectionsWordResetMatches: wordMatches.length,
  sourceMarkedRed10Reset: { runeOffset: 99, dotCount: 10,
    secondWordMatches: red10Matches.length,
    thirdWord: { wordIndex: 33, runeOffset: 153,
      dictionaryMatches: markedWitnessMatches.length } },
  fullyInvertibleNativePlantAccepted: true,
  deliberatelyBrokenPositiveRejected: true,
  decision: 'Under this exact page-continuous five-phase model, assuming ' +
    'TAPESTRIES excludes every eight-rune word in this finite lexicon. ' +
    'Ten-dot reset allows 105 English words at word44, but zero at ' +
    'independent word33. These are conditional lexicon constraints, ' +
    'not an LP2 decryption.'
}, null, 2));
