'use strict';
/**
 * Source-fixed 2012–2013 Cicada prose crib fingerprint census.
 * Run: node sims/cicada_2012_2013_prose_crib_original_sft.cjs
 * Exact original printed word lengths; never split across image page wraps.
 * Does not fit keys, English phrases, page offsets or original ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = JSON.parse(read('resources/derived/cicada2012-2013-prose-gp-wordlengths.json'));
const originalLP2 = read('resources/liber-primus/lp2-transcription.txt').split('%');
const master = read('resources/transcriptions/liber_primus_master.txt').split('%');
const alphabet = new Set(corpus.runes);
/**
 * Follow the original printed manuscript punctuation, allowing words to
 * continue over line and physical-page boundaries. No screen/text key guessed.
 * @param {string} raw
 */
function printWordLengths(raw) {
  const words = [];
  let n = 0, runes = 0;
  for (const ch of raw) {
    if (alphabet.has(ch)) {
      runes++;
      n++;
    } else if ('- .&$§'.includes(ch)) {
      if (n) words.push(n);
      n = 0;
    }
  }
  if (n) words.push(n);
  return {words, runes};
}
assert.equal(originalLP2.length, 57);
const unknown = printWordLengths(originalLP2.slice(0, 55).join(''));
assert.deepEqual([unknown.runes, unknown.words.length], [12956, 2896]);
assert.deepEqual([source.inputs.original_rune_count, source.inputs.original_word_count], [12956, 2896]);
/** @param {string} w */
function gpWordLength(w) {
  const text = w.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const tokens = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
  let n = 0;
  for (let i = 0; i < text.length;) {
    const token = tokens.find(x => text.startsWith(x, i));
    i += token ? token.length : 1;
    n++;
  }
  return n;
}
/**
 * @param {number[]} sourceWords
 * @param {number[]} targetWords
 */
function maximalExactSubstring(sourceWords, targetWords) {
  let best = 0;
  const matches = [];
  for (let i = 0; i < sourceWords.length; i++) {
    for (let j = 0; j < targetWords.length; j++) {
      let length = 0;
      while (i + length < sourceWords.length &&
        j + length < targetWords.length &&
        sourceWords[i + length] === targetWords[j + length]) length++;
      if (length > best) {
        best = length;
        matches.length = 0;
        matches.push({source_word: i, unknown_original_word: j});
      } else if (length === best && length >= 8 && matches.length < 12) {
        matches.push({source_word: i, unknown_original_word: j});
      }
    }
  }
  return {length: best, matches};
}
assert.equal(source.sources.length, 11);
const output = [];
for (const entry of source.sources) {
  assert.equal(entry.word_count, entry.gp_word_lengths.length);
  assert(/^[0-9a-f]{40}$/.test(entry.original_git_blob_sha1));
  const original = maximalExactSubstring(entry.gp_word_lengths, unknown.words);
  assert.equal(original.length, entry.longest_uninterrupted_original_unknown_length_match,
    'source max disagreement: ' + entry.name);
  assert.deepEqual(original.matches, entry.max_match_coordinates,
    'source alignment disagreement: ' + entry.name);
  output.push({
    name: entry.name,
    sourceWords: entry.word_count,
    longestMatchedWords: original.length,
    coordinates: original.matches
  });
}
const p57 = printWordLengths(master[73]);
assert.equal(p57.runes, 95);
assert.equal(p57.words.length, 20);
const authenticOriginalTXXX = 'Like the instar tunneling to the surface ' +
  'We must shed our own circumferences Find the divinity within and emerge';
const parable = authenticOriginalTXXX.match(/[A-Za-z]+/g).map(gpWordLength);
assert.equal(parable.length, 19);
assert.deepEqual(parable, p57.words.slice(1),
  '2013 real audio ID3 words must fully match 2014 real solved p57 words');

/** A single historical passage that has an 8-word exact original length fit. */
const candidateText = 'few of our past projects and if you';
const candidateWords = candidateText.toUpperCase().match(/[A-Z]+/g);
const wordIndices = [];
const originalRuneToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
let currentWord = [];
for (const ch of originalLP2.slice(0, 55).join('')) {
  if (originalRuneToIndex.has(ch)) currentWord.push(originalRuneToIndex.get(ch));
  else if ('- .&$§'.includes(ch) && currentWord.length) {
    wordIndices.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) wordIndices.push(currentWord);
assert.equal(wordIndices.length, 2896);
const translit = corpus.translit.map((letters, i) => ({letters, i}))
  .sort((a, b) => b.letters.length - a.letters.length);
/** @param {string} word */
function gpIndices(word) {
  const text = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < text.length;) {
    const hit = translit.find(r => text.startsWith(r.letters, i));
    assert(hit, 'Unknown GP transliteration: ' + text);
    result.push(hit.i);
    i += hit.letters.length;
  }
  return result;
}
const trialPlain = candidateWords.flatMap(gpIndices);
const trialCipher = wordIndices.slice(410, 418).flat();
assert.equal(trialPlain.length, 28);
assert.equal(trialCipher.length, 28);
assert.deepEqual(candidateWords.map(w => gpIndices(w).length),
  wordIndices.slice(410, 418).map(w => w.length));
const periodTest = [];
for (const sign of [-1, 1]) {
  const key = trialCipher.map((cipher, i) =>
    (cipher + sign * trialPlain[i] + 29) % 29);
  let shortest = null;
  for (let p = 1; p <= 20; p++) {
    let conflicts = 0;
    for (let i = p; i < key.length; i++) {
      if (key[i] !== key[i % p]) conflicts++;
    }
    if (!shortest || conflicts < shortest.conflicts)
      shortest = {period: p, conflicts};
  }
  assert(shortest.conflicts > 0,
    'Rejected crib unexpectedly contains a perfect short periodic GP key');
  periodTest.push({cipherRelation: sign === -1 ? 'C = P + K' : 'C = -P + K',
    ...shortest});
}


/**
 * Unfitted source-negative controls: nonoverlapping windows of exactly 406
 * native-English words, the same length as the two signed 2013 invitations.
 * These are descriptive source-window frequencies, not independent p-values.
 */
const eight = new Map();
for (let i = 0; i + 7 < unknown.words.length; i++) {
  const key = unknown.words.slice(i, i + 8).join(',');
  if (!eight.has(key)) eight.set(key, []);
  eight.get(key).push(i);
}
/** @param {number[]} sourceWordLengths */
function anchoredEightOrLonger(sourceWordLengths) {
  let best = 0;
  for (let i = 0; i + 7 < sourceWordLengths.length; i++) {
    const hits = eight.get(sourceWordLengths.slice(i, i + 8).join(','));
    if (!hits) continue;
    for (const j of hits) {
      let n = 8;
      while (i + n < sourceWordLengths.length &&
        j + n < unknown.words.length &&
        sourceWordLengths[i + n] === unknown.words[j + n]) n++;
      if (n > best) best = n;
    }
  }
  return best;
}
const controls = [];
for (const control of [
  {name:'Shakespeare',file:'resources/control/shakespeare_first300k.txt',
    expected:{sourceWords:55407,windows:136,match8:23,match9:4}},
  {name:'Gibran',file:'resources/control/gibran_prophet_58585.txt',
    expected:{sourceWords:15733,windows:38,match8:10,match9:3}}
]) {
  const lengths = (read(control.file).match(/[A-Za-z]+/g) || []).map(gpWordLength);
  assert.equal(lengths.length, control.expected.sourceWords);
  const windows = Math.floor(lengths.length / 406), counts = new Map();
  for (let j = 0; j < windows; j++) {
    const longest = anchoredEightOrLonger(lengths.slice(406 * j, 406 * (j + 1)));
    counts.set(longest, (counts.get(longest) || 0) + 1);
  }
  assert.equal(windows, control.expected.windows);
  assert.equal(counts.get(8), control.expected.match8);
  assert.equal(counts.get(9), control.expected.match9);
  assert.equal((counts.get(0) || 0) + (counts.get(8) || 0) + (counts.get(9) || 0),
    windows);
  controls.push({
    author:control.name, sourceWords:lengths.length,
    nonoverlapping406WordWindows:windows,
    originalWordShapeMatchesAtLeast8:(counts.get(8) || 0) + (counts.get(9) || 0),
    originalWordShapeMatches9:(counts.get(9) || 0)
  });
}

const maxNew = Math.max(...output.map(x => x.longestMatchedWords));
assert.equal(maxNew, 8);
process.stdout.write(JSON.stringify({
  originalUnknownRunes: unknown.runes,
  originalUnknownWords: unknown.words.length,
  sourceDocuments: output.length,
  original2013To2014PositiveControl: {
    actualSolvedPage: 57,
    originalRunes: p57.runes,
    bodyWords: parable.length,
    consecutiveEqualGPWordLengths: 19,
    wordOffsetAfter_PARABLE_heading: 1
  },
  results: output,
  strongestUnknownRunLength: maxNew,
  independentNativeEnglish406WordShapeControls: controls,
  boundedEightWordCandidate: {unknownWord: 410, sourceWord: 308, sourcePhrase: candidateText, runeLength: 28, periodTests: periodTest},
  conclusion: 'No authenticated unknown-page crib, source-selected key or inverse'
}, null, 2) + '\n');
