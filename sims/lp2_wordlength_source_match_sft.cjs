'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const ruby = new Map(corpus.runes.map((r, i) => [r, i]));
const rune = /[\u16A0-\u16FF]/u;
const digraphs = new Set(['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']);

/**
 * Exact original community source-word clock. The slash, whitespace and
 * percent sign are line/page breaks, not lexical separators.
 * @param {string} text @returns {string[]}
 */
function runeWords(text) {
  const words = [];
  let token = '';
  const finish = () => { if (token) words.push(token); token = ''; };
  for (const ch of text) {
    if (rune.test(ch)) token += ch;
    else if (ch === '/' || ch === '%' || /\s/u.test(ch)) continue;
    else finish();
  }
  finish();
  return words;
}

/**
 * Official corpus GP29 greedy word mapping, as in the repository's
 * encodeEnglish: V=U, K/Q=C, Z=S, ING=NG (single rune) then digraphs.
 * @param {string} word @returns {number}
 */
function englishGpLength(word) {
  const s = word.toUpperCase().replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Q/g, 'C').replace(/Z/g, 'S');
  let n = 0;
  for (let i = 0; i < s.length;) {
    if (s.slice(i, i + 3) === 'ING') i += 3;
    else if (digraphs.has(s.slice(i, i + 2))) i += 2;
    else i++;
    n++;
  }
  return n;
}

/** @param {string} text @returns {number[]} */
const englishLengths = (text) =>
  [...text.matchAll(/[A-Za-z]+/g)].map((m) => englishGpLength(m[0]));

/**
 * Exact word-length substring search, with native GP rune count.
 * A 10-word match can potentially identify a copied source passage.
 * No cipher transform, key, clock or plaintext fit is guessed.
 * @param {number[]} target
 * @param {number[]} source
 * @param {number} [window=8]
 * @returns {{sourceWords:number, matchedWindows:number, longestAtLeast8:number, example:{target:number,source:number,length:number}|null}}
 */
function matchLengths(target, source, window = 8) {
  const dictionary = new Map();
  for (let i = 0; i + window <= target.length; i++) {
    const key = target.slice(i, i + window).join(',');
    if (!dictionary.has(key)) dictionary.set(key, []);
    dictionary.get(key).push(i);
  }
  let matchedWindows = 0;
  let longest = 0;
  let example = null;
  for (let j = 0; j + window <= source.length; j++) {
    const slots = dictionary.get(source.slice(j, j + window).join(','));
    if (!slots) continue;
    for (const i of slots) {
      matchedWindows++;
      let left = 0, right = window;
      while (i - left - 1 >= 0 && j - left - 1 >= 0 &&
        target[i - left - 1] === source[j - left - 1]) left++;
      while (i + right < target.length && j + right < source.length &&
        target[i + right] === source[j + right]) right++;
      if (left + right > longest) {
        longest = left + right;
        example = {target: i - left, source: j - left, length: longest};
      }
    }
  }
  return {sourceWords: source.length, matchedWindows,
    longestAtLeast8: longest, example};
}

const pages = transcription.split('%');
assert.equal(pages.length, 57);
const unknown = runeWords(pages.slice(0, 55).join('%'));
const lens = unknown.map((word) => Array.from(word).length);
const observed = unknown.flatMap((word) => [...word].map((r) => ruby.get(r)));
const expected = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
assert.deepEqual(observed, expected);
assert.equal(unknown.length, 2896);
assert.equal(observed.length, 12956);

// Authentic independent solved-page word-clock positive control.
const p57Runes = runeWords(pages[56]).map((word) => [...word].length);
const p57English = englishLengths(reference.split('### 57').at(-1));
assert.equal(p57Runes.length, 20);
assert.deepEqual(p57Runes, p57English);
const planted = lens.slice();
planted.splice(137, 20, ...p57Runes);
const plantMatch = matchLengths(planted, englishLengths(reference));
assert(plantMatch.longestAtLeast8 >= 20);

const beowulf = JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
const latinLines = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
const sources = [
  {name:'Shakespeare first 300k', source:'resources/control/shakespeare_first300k.txt', expected:[55407, 35, 9], values:englishLengths(read('resources/control/shakespeare_first300k.txt'))},
  {name:'Gibran The Prophet', source:'resources/control/gibran_prophet_58585.txt', expected:[15733, 19, 9], values:englishLengths(read('resources/control/gibran_prophet_58585.txt'))},
  {name:'Emerson Essays I', source:'resources/control/emerson_essays_2944.txt', expected:[77932, 25, 9], values:englishLengths(read('resources/control/emerson_essays_2944.txt'))},
  {name:'Blake Song of Liberty', source:'resources/control/blake_song_of_liberty_train.txt', expected:[479, 0, 0], values:englishLengths(read('resources/control/blake_song_of_liberty_train.txt'))},
  {name:'Solved LP1/LP2 reference', source:'resources/liber-primus/lp1-plaintext-reference.txt', expected:[942, 0, 0], values:englishLengths(reference)},
  {name:'Latin Vulgate GP29 words', source:'resources/control/latin-vulgate-gp-wholewords.txt', expected:[39835, 7, 9], values:latinLines.map((s) => s.length)},
  {name:'Old English Beowulf GP29 words', source:'resources/control/beowulf_oe_gp_profile_corrected.json', expected:[10885, 4, 8], values:beowulf.allSourceGpWordLengths},
];

for (const item of sources) {
  const summary = matchLengths(lens, item.values);
  assert.deepEqual([summary.sourceWords, summary.matchedWindows,
    summary.longestAtLeast8], item.expected);
  console.log(JSON.stringify({name:item.name, source:item.source,
    ...summary, matchAtLeast10:summary.longestAtLeast8 >= 10}));
}
console.log(JSON.stringify({status:'PASS', originalPages:55, originalWords:lens.length,
  originalRunes:observed.length, knownP57Exact:'20/20',
  plantedP57Detected:plantMatch.longestAtLeast8 >= 20, corpora: sources.length}));
