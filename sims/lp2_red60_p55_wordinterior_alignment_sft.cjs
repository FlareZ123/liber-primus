'use strict';
/**
 * Source-geometry red60 -> p55 noninitial-rune key, exact original-input gate.
 * Run: node sims/lp2_red60_p55_wordinterior_alignment_sft.cjs
 * Node.js 22, CommonJS, no network or external packages.
 *
 * Hypothesis: 51 red p53 runes followed by 9 red p54 runes serve as an
 * additive GP29 key for the 60 p55 positions other than the initial
 * runes of its 16 complete printed words. The p54->p55 carried suffix
 * occupies the first selected position. This alignment is a test, not
 * an authenticated Cicada cipher operation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const index = new Map(gp.runes.map((r, i) => [r, i]));
const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const words = (segments[54].replace(/\/\r?\n/g, '').match(
  new RegExp('[' + gp.runes.join('') + ']+', 'gu')
) || []).map(w => Array.from(w, r => index.get(r)));
const lengths = words.map(w => w.length);
assert.deepEqual(lengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3],
  'one p54 carry rune and sixteen complete p55 words');
const original = gp.pages[55].indices;
assert.deepEqual(words.flat(), original, 'original p55 runes and word segmentation');
assert.equal(original.length, 76);
const red = [
  ...gp.pages[53].indices.slice(128, 179),
  ...gp.pages[54].indices.slice(0, 9)
];
assert.equal(red.length, 60, '51 plus 9 source-ink red runes');
let position = 0;
const starts = [];
for (let w = 0; w < words.length; w++) {
  if (w > 0) starts.push(position);
  position += words[w].length;
}
assert.equal(position, original.length);
assert.equal(starts.length, 16);
const firsts = new Set(starts);
const keyedPositions = original.map((_, i) => i).filter(i => !firsts.has(i));
assert.equal(keyedPositions.length, red.length);
/** @param {number[]} source @param {1|-1} direction */
function transform(source, direction) {
  const output = source.slice();
  for (let j = 0; j < keyedPositions.length; j++) {
    const i = keyedPositions[j];
    output[i] = (source[i] + direction * red[j] + 29) % 29;
  }
  return output;
}
/** @param {number[]} stream */
function pairIoC(stream) {
  const freq = Array(29).fill(0);
  for (const rune of stream) freq[rune]++;
  return freq.reduce((n, c) => n + c * (c-1), 0) /
    (stream.length * (stream.length-1));
}
const recovered = transform(original, -1);
assert.deepEqual(transform(recovered, 1), original, 'all original ciphertext reencryption');
assert.equal(pairIoC(recovered), 162/5700);
assert.equal(pairIoC(keyedPositions.map(i => recovered[i])), 104/3540);
const dictionary = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => /^[a-z]+ \d+$/.test(line))
  .map(line => line.split(' ')[0]);
assert.equal(dictionary.length, 29157);
const byLength = new Map();
const suffixes = new Set();
for (const word of dictionary) {
  const runes = encodeSourceNativeGP(word);
  if (!byLength.has(runes.length)) byLength.set(runes.length, []);
  byLength.get(runes.length).push(runes);
  suffixes.add(runes.length + ':' + runes.slice(1).join(','));
}
/** @param {number[]} source */
function suffixMatches(source) {
  const out = [];
  let start = 1; // p54-carried suffix is not an independent p55 word.
  for (let w=1; w<words.length; w++) {
    const size = words[w].length;
    const suffix = source.slice(start+1, start+size);
    out.push({length:size, possible:suffixes.has(size+':'+suffix.join(','))});
    start += size;
  }
  return out;
}
const matches = suffixMatches(recovered);
assert.equal(matches.filter(x => x.possible).length, 5,
  'only five complete words can be repaired by any initial GP symbol');
assert.equal(matches.filter(x => x.length >= 4 && x.possible).length, 0,
  'all nine long-word interiors are excluded by the source-native lexicon');
// Independent positive control: genuine English words of identical
// rune lengths, using the exact same red key, selector and inverse.
const native = new Array(76).fill(0);
let begin = 1;
for (let w=1; w<words.length; w++) {
  const sample = byLength.get(words[w].length);
  assert(sample && sample.length, 'positive-control native GP length');
  const plain = sample[(w*13) % sample.length];
  for (let j=0;j<plain.length;j++) native[begin+j] = plain[j];
  begin += plain.length;
}
assert.equal(begin,76);
const plantedCipher = transform(native, 1);
assert.deepEqual(transform(plantedCipher, -1), native,
  'source-shaped planted English is exactly decoded');
assert.equal(suffixMatches(native).filter(x=>x.possible).length,16,
  'all source-native positive-control words are lexicon-completable');
console.log(JSON.stringify({
  scope:'Original p53 red51 + p54 red9 -> p55 60 noninitial slots',
  redRuneCount:red.length, originalPageRunes:original.length,
  completePrintedWords:16, incomingCarryRunes:1,
  keyedPositions:keyedPositions.length,
  originalFullIoC:pairIoC(original),
  reconstructedFullIoC:pairIoC(recovered),
  reconstructedNoninitialIoC:pairIoC(keyedPositions.map(i=>recovered[i])),
  corpusEnglishTypes:dictionary.length,
  longWords:matches.filter(x=>x.length>=4).length,
  longWordsWithAnyDictionaryInitial:matches.filter(x=>x.length>=4&&x.possible).length,
  allWordsWithAnyDictionaryInitial:matches.filter(x=>x.possible).length,
  authenticUnknownPlaintextRecovered:0,
  positiveControl:{recoveredNativeRunes:76,lexiconCompletions:16},
  decodedWords:words.map((w, wi) => {
    const start = words.slice(0,wi).reduce((n,item)=>n+item.length,0);
    return recovered.slice(start,start+w.length).map(n=>gp.translit[n]).join('');
  })
},null,2));
