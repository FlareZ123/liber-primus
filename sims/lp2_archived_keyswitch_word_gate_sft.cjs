/**
 * Historical 2014 community "Key Switch" hypothesis: necessary two-key word gate.
 * This is NOT an authenticated Cicada cipher. Run from the repository root:
 * node sims/lp2_archived_keyswitch_word_gate_sft.cjs
 *
 * The source illustration is archived in krisyotam/cicada3301 at
 * archives/cijhho/EXTRA WIKI PAGES/Liber Primus Ideas and Suggestions/Algorithm.png
 * Git blob ff0491218e17b53bc8c98da22dbc8ec3b9aad911.
 *
 * The historically displayed 1-based keys are fixed below. We deliberately
 * relax its look-ahead switch to the union of both possible letters, which
 * is more generous than the proposed forward cipher. Test both plausible
 * 1-based and 0-based key-value conventions without changing the key clocks.
 * No changes to original source files. No CLI options, external packages, or writes.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const transcript = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const dictionaryText = fs.readFileSync(path.join(root, 'resources/control/english_wordfreq_textblob.txt'), 'utf8');

const glyphs = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const glyphMap = new Map(glyphs.map((v, i) => [v, i]));
glyphMap.set('ᛂ', 11);
const keys = [
  [24, 11, 2, 11, 10, 11, 17, 27], // DIVINITY: historical image, 1-based
  [6, 11, 5, 6, 2, 20, 1, 19, 5, 19, 16, 6, 19, 16], // CIRCUMFERENCES
];
const plainLetters = {
  f: 0, u: 1, o: 3, r: 4, c: 5, g: 6, w: 7, h: 8, n: 9,
  i: 10, j: 11, p: 13, x: 14, s: 15, t: 16, b: 17,
  e: 18, m: 19, l: 20, d: 23, a: 24, y: 26,
};

/** @param {string} word @returns {number[]} */
function toGp(word) {
  const normalized = word.replace(/v/g, 'u').replace(/[kq]/g, 'c').replace(/z/g, 's');
  const contractions = [['ing', 21], ['th', 2], ['eo', 12], ['oe', 22], ['ae', 25], ['ia', 27], ['ea', 28]];
  /** @type {number[]} */
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const found = contractions.find(([prefix]) => normalized.startsWith(prefix, i));
    if (found) {
      result.push(found[1]);
      i += found[0].length;
    } else {
      const value = plainLetters[normalized[i]];
      if (value === undefined) return [];
      result.push(value);
      i++;
    }
  }
  return result;
}

const firstPage = transcript.slice(0, transcript.indexOf('%')).replace(/[\s/]/g, '');
const words = firstPage.split(/[-.]/g).filter(Boolean)
  .map(token => [...token].map(g => {
    assert(glyphMap.has(g), 'Unexpected rune in first page: ' + g);
    return glyphMap.get(g);
  }));
const ciphertext = words.flat();
assert.deepEqual(ciphertext, corpus.pages[0].indices);
assert.equal(ciphertext.length, 262);

/** @type {Map<number, {word:string,runes:number[],frequency:number}[]>} */
const wordList = new Map();
for (const line of dictionaryText.split(/\r?\n/)) {
  if (!/^[a-z]+ \d+$/.test(line)) continue;
  const [word, amount] = line.split(' ');
  const runes = toGp(word);
  if (!runes.length) continue;
  if (!wordList.has(runes.length)) wordList.set(runes.length, []);
  wordList.get(runes.length).push({ word, runes, frequency: Number(amount) });
}
for (const list of wordList.values()) list.sort((a, b) => b.frequency - a.frequency);

/** @param {number[]} cipherWord @param {number} start @param {number} convention */
function candidates(cipherWord, start, convention) {
  const permitted = cipherWord.map((c, j) => keys.map(k => (c - k[(start + j) % k.length] - convention + 58) % 29));
  return (wordList.get(cipherWord.length) || []).filter(candidate =>
    candidate.runes.every((r, i) => permitted[i].includes(r)));
}

let position = 0;
let longTotal = 0;
let zeroWithImageValues = 0;
let zeroWithMinusOne = 0;
let controlMatched = 0;
console.log('Source: archived "Key Switch" image, SHA ff0491218e17b53bc8c98da22dbc8ec3b9aad911');
console.log('Authentic first page:', ciphertext.length, 'GP29 runes;', words.length, 'source-printed words');
console.log('Hypothesis: at every position allow either of two historical keys, discarding the restrictive switch condition');
console.log('Reference: TextBlob/Norvig English source lexicon with GP contractions and documented approximate spelling aliases');
for (let wi = 0; wi < words.length; wi++) {
  const original = words[wi];
  const currentPosition = position;
  position += original.length;
  if (original.length < 5) continue;
  longTotal++;
  const imageValues = candidates(original, currentPosition, 0);
  const zeroBased = candidates(original, currentPosition, -1);
  if (imageValues.length === 0) zeroWithImageValues++;
  if (zeroBased.length === 0) zeroWithMinusOne++;
  console.log('p0 w' + (wi + 1), 'rune offset', currentPosition,
    'length', original.length, 'possible native words:',
    imageValues.length, zeroBased.length);
  // A synthetic membership positive uses a real native lexicon word of the
  // identical GP length; it does not claim the flawed historical switch is invertible.
  const known = (wordList.get(original.length) || [])[0];
  assert(known);
  const plant = known.runes.map((v, j) => (v + keys[0][(currentPosition + j) % 8]) % 29);
  assert(candidates(plant, currentPosition, 0).some(w => w.word === known.word));
  controlMatched++;
}
assert.equal(longTotal, 22);
assert.equal(zeroWithImageValues, 22);
assert.equal(zeroWithMinusOne, 22);
assert.equal(controlMatched, 22);
console.log('TEST PASS: source p0 long word count', longTotal,
  'zero native-English candidates under image-value rule', zeroWithImageValues,
  'zero candidates under off-by-one convention', zeroWithMinusOne,
  'synthetic source-length membership plants', controlMatched, '/', longTotal);
console.log('Scope: excludes ordinary fixed-word native GP-English under this exact historical key alignment');
console.log('No claim against unknown key, lexical register, inserted/deleted text, source-unselected clock, or other cipher.');
