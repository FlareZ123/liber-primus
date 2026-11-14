'use strict';

/**
 * Original-cipher universal word-break gate for GP29 identity and Atbash.
 *
 * All 29 rune identities, the 175 printed full stops, all original page lengths,
 * the 32 carried words and every original rune remain fixed. For each hard-stop
 * segment, a trie/BigInt dynamic program allows EVERY possible interior
 * placement and count of word breaks, with no hand-chosen plaintext boundaries.
 *
 * English word candidates are source-calibrated GP29 encodings of the existing
 * TextBlob lexicon, three pinned literary reference files, and authentic
 * solved LP2 p57 reference words. The finite register does not cover all
 * proper names, other languages, ciphers or unknown orthographies.
 *
 * SFT: node sims/lp2_boundary_anybreak_lexicon_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/lp2-transcription.txt');
const originalText = source.split('%').slice(0, 55).join('').replace(/[\/\s]/gu, '');
const wordRE = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const runeIndex = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const sentences = originalText.split(/[.&$§]+/u)
  .map(piece => piece.match(wordRE) || []).filter(words => words.length > 0);
const words = sentences.flat();
const letters = words.join('');
const original = Array.from(letters, rune => runeIndex.get(rune));
const sourceIndices = gp.pages.filter(page => page.page < 56).flatMap(page => page.indices);
assert.deepEqual(original, sourceIndices, 'transcription must match canonical source indices');
assert.equal(sentences.length, 175);
assert.equal((originalText.match(/\./gu) || []).length, 175);
assert.equal(words.length, 2896);
assert.equal(original.length, 12956);

/** @returns {string[]} */
function buildNativeEnglishLexicon() {
  const dictionary = read('resources/control/english_wordfreq_textblob.txt')
    .split(/\r?\n/u).filter(line => /^[a-z]+ \d+$/u.test(line))
    .map(line => line.split(' ')[0]);
  assert.equal(dictionary.length, 29157);

  const lexicon = new Set(dictionary);
  const sourceFiles = [
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt'
  ];
  for (const filename of sourceFiles) {
    let text = read(filename);
    if (filename.includes('gibran')) {
      text = text.split('*** START OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***')[1];
      assert(text, 'expected pinned Gutenberg text boundary');
      text = text.split('*** END OF')[0];
    }
    for (const word of text.toLowerCase().match(/[a-z]+/gu) || []) lexicon.add(word);
  }
  // Independently solved LP2 p57 words are legitimate native GP controls.
  const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const p57 = reference.split('### 57\n')[1];
  assert(p57, 'expected authentic p57 plaintext');
  for (const word of p57.toLowerCase().match(/[a-z]+/gu) || []) lexicon.add(word);
  assert.equal(lexicon.size, 32191);
  return Array.from(lexicon);
}

/**
 * Trie indices identify nodes with a Map from GP rune index to next node.
 * @param {string[]} dictionary
 */
function makeTrie(dictionary) {
  /** @type {Map<number, number>[]} */
  const next = [new Map()];
  /** @type {boolean[]} */
  const terminal = [false];
  /** @type {Map<number, number[]>} */
  const sampleByLength = new Map();
  for (const word of dictionary) {
    const runes = encodeSourceNativeGP(word);
    if (!sampleByLength.has(runes.length)) sampleByLength.set(runes.length, runes);
    let node = 0;
    for (const rune of runes) {
      let child = next[node].get(rune);
      if (child === undefined) {
        child = next.length;
        next[node].set(rune, child);
        next.push(new Map());
        terminal.push(false);
      }
      node = child;
    }
    terminal[node] = true;
  }
  return { next, terminal, sampleByLength };
}

/**
 * Bit k at position i means there exists a source-native dictionary parsing
 * of the first i GP runes into exactly k words. No word-count cap is applied.
 * @param {number[]} cipherRunes
 * @param {number} printedWordCount
 * @param {{next: Map<number,number>[],terminal:boolean[]}} trie
 */
function wordBreakReachability(cipherRunes, printedWordCount, trie) {
  const n = cipherRunes.length;
  /** @type {bigint[]} */
  const possible = Array(n + 1).fill(0n);
  possible[0] = 1n;
  for (let i = 0; i < n; i++) {
    if (possible[i] === 0n) continue;
    let node = 0;
    for (let j = i; j < n; j++) {
      node = trie.next[node].get(cipherRunes[j]);
      if (node === undefined) break;
      if (trie.terminal[node]) possible[j + 1] |= possible[i] << 1n;
    }
  }
  const allCounts = possible[n];
  return {
    someCount: allCounts !== 0n,
    printedCount: ((allCounts >> BigInt(printedWordCount)) & 1n) === 1n
  };
}

/**
 * An explicit keyless, five-gap, invertible delimiter-only channel.
 * Reflect the printed delimiter bits within blocks of five legal rune gaps,
 * resetting at every printed full stop. The same operation is the inverse.
 * @param {number[]} gaps strictly increasing, 1..n-1
 * @param {number} n runes before the printed stop
 * @returns {number[]}
 */
function reflectFiveGaps(gaps, n) {
  const result = [];
  for (const position of gaps) {
    assert(position > 0 && position < n);
    const lo = 1 + 5 * Math.floor((position - 1) / 5);
    const hi = Math.min(n - 1, lo + 4);
    result.push(lo + hi - position);
  }
  return result.sort((a, b) => a - b);
}

/** @param {number[]} lengths @returns {number[]} */
function cumulativeGaps(lengths) {
  const positions = [];
  let offset = 0;
  for (let i = 0; i < lengths.length - 1; i++) {
    offset += lengths[i];
    positions.push(offset);
  }
  return positions;
}

const dictionary = buildNativeEnglishLexicon();
const trie = makeTrie(dictionary);
assert.equal(trie.next.length, 78629);

const inverseFamilies = [
  { name: 'identity', inverse: x => x },
  { name: 'GP29 Atbash', inverse: x => 28 - x }
];
const originalResults = inverseFamilies.map(family => {
  const outcomes = sentences.map(sentence => {
    const indexes = Array.from(sentence.join(''), rune => family.inverse(runeIndex.get(rune)));
    return wordBreakReachability(indexes, sentence.length, trie);
  });
  return {
    family: family.name,
    unrestrictedSegments: outcomes.filter(result => result.someCount).length,
    sourceWordCountSegments: outcomes.filter(result => result.printedCount).length,
    disjointSegmentsNeedingRuneChanges:
      outcomes.filter(result => !result.someCount).length,
    disjointSegmentsNeedingRuneChangesWithFixedWordCount:
      outcomes.filter(result => !result.printedCount).length
  };
});
assert.deepEqual(originalResults.map(result =>
  [result.unrestrictedSegments, result.sourceWordCountSegments]),
[[11, 0], [15, 1]]);

/**
 * Exact key-free obstruction for every GP29 affine inverse, allowing
 * a distinct *secret* invertible affine symbol map for EVERY original
 * punctuation-delimited segment, and any interior word boundaries.
 *
 * This is a genuine superset of a single Caesar or Atbash alphabet and of
 * any fixed page/chapter alphabet. The finite English register remains a
 * necessary assumption. A segmentation match (especially using rare
 * dictionary one-letter types) is NOT a credible plaintext recovery.
 *
 * @param {number[]} runes
 * @param {{next: Map<number,number>[],terminal:boolean[]}} trie
 * @returns {boolean}
 */
function hasAnyWordSegmentation(runes, trie) {
  const n = runes.length;
  const reach = new Uint8Array(n + 1);
  reach[0] = 1;
  for (let i = 0; i < n; i++) {
    if (!reach[i]) continue;
    let node = 0;
    for (let j = i; j < n; j++) {
      node = trie.next[node].get(runes[j]);
      if (node === undefined) break;
      if (trie.terminal[node]) reach[j + 1] = 1;
    }
  }
  return Boolean(reach[n]);
}

/**
 * @param {number[]} src
 * @param {{next: Map<number,number>[],terminal:boolean[]}} trie
 * @returns {{count:number,first:{a:number,b:number}|null}}
 */
function allAffineEnglish(src, trie) {
  let count = 0;
  let first = null;
  const transformed = new Array(src.length);
  for (let a = 1; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let i = 0; i < src.length; i++) {
        transformed[i] = (a * src[i] + b) % 29;
      }
      if (hasAnyWordSegmentation(transformed, trie)) {
        count++;
        if (first === null) first = {a, b};
      }
    }
  }
  return {count, first};
}

const allSecretAffine = sentences.map((sentence, i) => {
  const original = Array.from(sentence.join(''), rune => runeIndex.get(rune));
  const {count, first} = allAffineEnglish(original, trie);
  return {sentence:i, runes:original.length, printedWords:sentence.length,
    possibleAffines:count, first};
});
const affineCoverage = {
  testedAffinesPerSegment: 812,
  independentlyKeyedSegments: 175,
  atLeastOneLexicalSegmentation:
    allSecretAffine.filter(result => result.possibleAffines > 0).length,
  impossibleForEverySecretAffine:
    allSecretAffine.filter(result => result.possibleAffines === 0).length,
  impossibleExamples: allSecretAffine.filter(x => x.possibleAffines === 0)
    .slice(0, 12).map(x => ({sentence:x.sentence, runes:x.runes,
      printedWords:x.printedWords})),
  maximumUncoveredSegmentRunes:
    Math.max(...allSecretAffine.filter(x => x.possibleAffines === 0)
      .map(x => x.runes))
};
assert.equal(affineCoverage.atLeastOneLexicalSegmentation, 102);
assert.equal(affineCoverage.impossibleForEverySecretAffine, 73);

// Positive 3: a changing hidden affine alphabet, independent for every one
// of the 175 complete source-sized native planted punctuation segments,
// must always have the correctly recovered GP-native lexical segmentation.
for (let index = 0; index < plantedSentences.length; index++) {
  const plain = plantedSentences[index].flat();
  const a = 1 + (index % 28);
  const b = (7 * index + 13) % 29;
  let aInverse = 1;
  while ((a * aInverse) % 29 !== 1) aInverse++;
  const cipher = plain.map(p => (aInverse * ((p - b + 29) % 29)) % 29);
  assert.deepEqual(cipher.map(c => (a * c + b) % 29), plain);
  const result = allAffineEnglish(cipher, trie);
  assert(result.count > 0, 'source-sized affine native-English positive');
}

// Positive 1: authentic 95-rune p57 GP plaintext, including three uncommon
// words absent from the TextBlob+literature lexicon, must be recognized.
const solvedP57 = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split('### 57\n')[1];
const p57Words = solvedP57.match(/[A-Z]+/gu) || [];
const p57Runes = p57Words.flatMap(encodeSourceNativeGP);
assert.equal(p57Words.length, 20);
assert.deepEqual(p57Runes, gp.pages[57].indices);
assert.deepEqual(wordBreakReachability(p57Runes, p57Words.length, trie), {
  someCount: true, printedCount: true
});

// Positive 2: an original-size source-native dictionary-word plant keeps
// exactly every original printed word length, all hard stops, physical page
// rune lengths and the 32 original page-spanning words.
const plantedSentences = sentences.map(sentence => sentence.map(word => {
  const gpWord = trie.sampleByLength.get(word.length);
  assert(gpWord, 'positive dictionary control lacks native rune length ' + word.length);
  return gpWord;
}));
const plantedRunes = plantedSentences.flat(2);
assert.equal(plantedRunes.length, original.length);
assert.equal(plantedSentences.flat().length, words.length);
const nativeCoverage = plantedSentences.map(sentence =>
  wordBreakReachability(sentence.flat(), sentence.length, trie));
assert.equal(nativeCoverage.filter(x => x.printedCount).length, 175);

// Demonstrate exact reversibility on the genuine original and native control.
let transformations = 0;
for (const sequence of [sentences.map(s => s.map(w => Array.from(w).length)),
  plantedSentences.map(s => s.map(w => w.length))]) {
  for (const sentence of sequence) {
    const n = sentence.reduce((a, b) => a + b, 0);
    const gaps = cumulativeGaps(sentence);
    const encoded = reflectFiveGaps(gaps, n);
    const decoded = reflectFiveGaps(encoded, n);
    assert.deepEqual(decoded, gaps, 'five-gap delimiter channel must invert');
    assert.equal(encoded.length, gaps.length);
    transformations++;
  }
}
assert.equal(transformations, 350);

const prefixEnds = gp.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices.length).slice(0, -1);
let end = 0, across = 0;
const wordGaps = new Set(cumulativeGaps(words.map(w => w.length)));
for (const pageLength of prefixEnds) {
  end += pageLength;
  if (!wordGaps.has(end)) across++;
}
assert.equal(across, 32);

console.log(JSON.stringify({
  status: 'finite original-language exclusion; no unknown plaintext',
  corpus: {runicPages:55, runes:original.length, printedWords:words.length,
    punctuationSegments:sentences.length, carriedWords:across},
  sourceNativeEnglishLexicon: dictionary.length,
  nativeTrieNodes: trie.next.length,
  original: originalResults,
  allSecretSentenceAffine: affineCoverage,
  controls: {solvedP57NativeRunes:95, solvedP57Words:20,
    originalGeometryPlantedRunes:plantedRunes.length,
    plantedSentencesWithOriginalWordCount:175,
    exactFiveGapReflectionInverses:transformations},
  scope: 'original punctuation and rune order; identity/Atbash or all 812 independent per-sentence affine GP29 inverses; finite English lexicon'
}, null, 2));
