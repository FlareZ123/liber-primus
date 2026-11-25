'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.join(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r\n/gu, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeSet = new Set(gp.runes);
const runeIndex = new Map(gp.runes.map((glyph, index) => [glyph, index]));

function parseTape(source) {
  const runes = [];
  const gaps = [];
  const punctuation = [];
  let between = '';
  for (const glyph of Array.from(source)) {
    if (runeSet.has(glyph)) {
      if (runes.length > 0) {
        gaps.push(between.includes('-'));
        punctuation.push(/[.&$§]/u.test(between));
      }
      runes.push(glyph);
      between = '';
    } else if (runes.length > 0) {
      between += glyph;
    }
  }
  return { runes, gaps, punctuation };
}

function groupsFrom(boundaries, runes) {
  const groups = [];
  let start = 0;
  for (let gap = 0; gap < boundaries.length; gap++) {
    if (!boundaries[gap]) continue;
    groups.push({
      start,
      end: gap + 1,
      length: gap + 1 - start,
      runes: runes.slice(start, gap + 1)
    });
    start = gap + 1;
  }
  if (start < runes.length) {
    groups.push({
      start,
      end: runes.length,
      length: runes.length - start,
      runes: runes.slice(start)
    });
  }
  return groups;
}

function splitAtAnchors(runes, anchors) {
  const segments = [];
  let start = 0;
  for (let gap = 0; gap < anchors.length; gap++) {
    if (!anchors[gap]) continue;
    segments.push(runes.slice(start, gap + 1).map(glyph => runeIndex.get(glyph)));
    start = gap + 1;
  }
  if (start < runes.length) {
    segments.push(runes.slice(start).map(glyph => runeIndex.get(glyph)));
  }
  return segments;
}

function buildNativeEnglishLexicon() {
  const dictionary = read('resources/control/english_wordfreq_textblob.txt')
    .split(/\r?\n/u)
    .filter(line => /^[a-z]+ \d+$/u.test(line))
    .map(line => line.split(' ')[0]);
  assert.equal(dictionary.length, 29157, 'pinned TextBlob register size');

  const lexicon = new Set(dictionary);
  const sourceFiles = [
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt'
  ];
  for (const filename of sourceFiles) {
    let text = read(filename).toLowerCase();
    if (filename.includes('gibran')) {
      text = text.split('*** start of this project gutenberg ebook the prophet ***')[1];
      assert(text, 'expected pinned Gibran source boundary');
      text = text.split('*** end of')[0];
    }
    for (const word of text.match(/[a-z]+/gu) || []) lexicon.add(word);
  }

  const p57 = read('resources/liber-primus/lp1-plaintext-reference.txt').split('### 57\n')[1];
  assert(p57, 'expected independently solved p57 reference');
  for (const word of p57.toLowerCase().match(/[a-z]+/gu) || []) lexicon.add(word);
  assert.equal(lexicon.size, 32191, 'source-calibrated finite English register');
  return Array.from(lexicon);
}

function makeTrie(dictionary) {
  const next = [new Map()];
  const terminal = [false];
  for (const word of dictionary) {
    const encoded = encodeSourceNativeGP(word);
    let node = 0;
    for (const rune of encoded) {
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
  return { next, terminal };
}

function isLexicalWord(word, trie) {
  let node = 0;
  for (const glyph of word) {
    const index = runeIndex.get(glyph);
    if (index === undefined) return false;
    node = trie.next[node].get(index);
    if (node === undefined) return false;
  }
  return trie.terminal[node];
}

function canSegment(runes, trie) {
  const reachable = new Uint8Array(runes.length + 1);
  reachable[0] = 1;
  for (let start = 0; start < runes.length; start++) {
    if (!reachable[start]) continue;
    let node = 0;
    for (let end = start; end < runes.length; end++) {
      node = trie.next[node].get(runes[end]);
      if (node === undefined) break;
      if (trie.terminal[node]) reachable[end + 1] = 1;
    }
  }
  return Boolean(reachable[runes.length]);
}

function lengthModel(sections) {
  const maxLength = 30;
  const alpha = 0.5;
  const unigram = Array(maxLength + 1).fill(0);
  const bigram = Array.from({ length: maxLength + 1 }, () => Array(maxLength + 1).fill(0));
  const rowTotals = Array(maxLength + 1).fill(0);
  let wordCount = 0;
  for (const section of sections) {
    wordCount += section.length;
    for (const length of section) if (length <= maxLength) unigram[length]++;
    for (let i = 1; i < section.length; i++) {
      const previous = section[i - 1];
      const current = section[i];
      if (previous <= maxLength && current <= maxLength) {
        bigram[previous][current]++;
        rowTotals[previous]++;
      }
    }
  }
  function score(sequence) {
    let total = 0;
    for (let i = 0; i < sequence.length; i++) {
      const current = sequence[i];
      if (i === 0) {
        total -= Math.log((unigram[current] + alpha) / (wordCount + alpha * maxLength));
      } else {
        const previous = sequence[i - 1];
        total -= Math.log((bigram[previous][current] + alpha) /
          (rowTotals[previous] + alpha * maxLength));
      }
    }
    return total / sequence.length;
  }
  return { score };
}

const lp1 = parseTape(read('resources/transcriptions/lp1_wulfic_canonical.txt'));
const lp2 = parseTape(read('resources/transcriptions/lp2-image-corrected.txt'));
const punctuationIdentity = JSON.parse(read('resources/liber-primus/lp2-punctuation-identity.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));

const windowLength = lp1.runes.length;
assert.equal(windowLength, 2797, 'LP1 source rune count');
assert.equal(lp2.runes.length, 13136, 'corrected LP2 rune count');
assert.deepEqual(
  lp2.runes.map(glyph => runeIndex.get(glyph)),
  gp.pages.flatMap(page => page.indices),
  'corrected transcription must match the canonical numerical corpus'
);
const gapCount = windowLength - 1;
const lp1Mask = lp1.gaps.slice(0, gapCount);
const lp2PrintedGaps = lp2.gaps.slice(0, gapCount);
assert.equal(lp1Mask.filter(Boolean).length, 610, 'LP1 internal word-gap bits');
assert.equal(lp2PrintedGaps.filter(Boolean).length, 576, 'LP2 prefix printed word-gap bits');

const pageStarts = new Map();
let globalOffset = 0;
for (const page of gp.pages) {
  pageStarts.set(page.page, globalOffset);
  globalOffset += page.indices.length;
}
assert.equal(globalOffset, lp2.runes.length);
const developmentEnd = pageStarts.get(8);
assert.equal(developmentEnd, 1874, 'physical p8 is the frozen-suffix boundary');

const punctuationAnchors = lp2.punctuation.slice(0, gapCount);
for (const event of punctuationIdentity.events) {
  const afterRunes = event.rune_offset;
  if (afterRunes > 0 && afterRunes < windowLength) {
    assert(punctuationAnchors[afterRunes - 1],
      'every source punctuation identity event must remain anchored');
  }
}
assert.equal(punctuationAnchors.filter(Boolean).length, 39);

const anchors = punctuationAnchors.slice();
let inkTransitionsAdded = 0;
let largePunctuationAdded = 0;
for (const page of ink.pages) {
  const pageStart = pageStarts.get(page.page);
  const pageLength = gp.pages.find(item => item.page === page.page).indices.length;
  for (const span of page.red_spans || []) {
    for (const localGap of [span.start - 1, span.start + span.length - 1]) {
      const globalGap = pageStart + localGap;
      if (localGap >= 0 && localGap < pageLength - 1 &&
          globalGap >= 0 && globalGap < gapCount && !anchors[globalGap]) {
        anchors[globalGap] = true;
        inkTransitionsAdded++;
      }
    }
  }
  for (const mark of page.large_punctuation || []) {
    const globalGap = pageStart + mark[0] - 1;
    if (mark[0] > 0 && mark[0] <= pageLength &&
        globalGap >= 0 && globalGap < gapCount && !anchors[globalGap]) {
      anchors[globalGap] = true;
      largePunctuationAdded++;
    }
  }
}
assert.equal(inkTransitionsAdded, 1, 'one additional red/black transition in the prefix');
assert.equal(largePunctuationAdded, 0, 'large punctuation is already represented');
assert.equal(anchors.filter(Boolean).length, 40);

const effectiveMask = lp1Mask.map((bit, index) => bit && !anchors[index]);
const effectiveMaskBits = effectiveMask.filter(Boolean).length;
assert.equal(effectiveMaskBits, 602, 'mask bits coincident with hard anchors are suppressed');
const candidateBoundaries = lp2PrintedGaps.map((bit, index) =>
  (bit !== effectiveMask[index]) || anchors[index]);
const candidateGroups = groupsFrom(candidateBoundaries, lp2.runes.slice(0, windowLength));
const printedGroups = groupsFrom(lp2PrintedGaps, lp2.runes.slice(0, windowLength));
assert.equal(candidateGroups.length, 942);
assert.equal(candidateGroups.filter(group => group.length === 1).length, 287);

const dictionary = buildNativeEnglishLexicon();
const trie = makeTrie(dictionary);
assert.equal(trie.next.length, 78629, 'source-native GP29 trie node count');
const lexicalMatches = candidateGroups.filter(group => isLexicalWord(group.runes, trie)).length;
assert.equal(lexicalMatches, 306);

const singletons = candidateGroups.filter(group => group.length === 1);
const oneLetterSet = new Set([
  ...encodeSourceNativeGP('A').map(index => gp.runes[index]),
  ...encodeSourceNativeGP('I').map(index => gp.runes[index])
]);
const validSingletons = singletons.filter(group => oneLetterSet.has(group.runes[0])).length;
assert.equal(validSingletons, 10);
assert.equal(singletons.length - validSingletons, 277);

const punctuationSegments = splitAtAnchors(lp2.runes.slice(0, windowLength), punctuationAnchors);
assert.equal(punctuationSegments.length, 40);
const punctuationParseability = punctuationSegments.map((segment, index) => ({
  index,
  runes: segment.length,
  parseable: canSegment(segment, trie)
}));
const parseableCount = punctuationParseability.filter(item => item.parseable).length;
assert.equal(parseableCount, 3);
assert.equal(punctuationParseability.length - parseableCount, 37);

const nativeSections = native.sections.map(section =>
  (section.source_text.match(new RegExp('[' + gp.runes.join('') + ']+', 'gu')) || [])
    .filter(word => Array.from(word).every(glyph => runeSet.has(glyph)))
);
const nativeWords = nativeSections.flat();
const nativeWordLengths = nativeWords.map(word => Array.from(word).length);
const nativeRuneCount = nativeWordLengths.reduce((sum, length) => sum + length, 0);
assert.equal(nativeWords.length, 740);
assert.equal(nativeRuneCount, 2979);
const nativeSingletons = nativeWordLengths.filter(length => length === 1).length;
const nativeShortWords = nativeWordLengths.filter(length => length <= 2).length;
assert.equal(nativeSingletons, 28);
assert.equal(nativeShortWords, 206);

const candidateLengths = candidateGroups.map(group => group.length);
const printedLengths = printedGroups.map(group => group.length);
const developmentLengths = candidateGroups
  .filter(group => group.end <= developmentEnd)
  .map(group => group.length);
const frozenSuffixLengths = candidateGroups
  .filter(group => group.start >= developmentEnd)
  .map(group => group.length);
assert.equal(developmentLengths.length, 623);
assert.equal(frozenSuffixLengths.length, 319);

const model = lengthModel(nativeSections.slice(0, 7).map(section =>
  section.map(word => Array.from(word).length)));
const candidateNll = model.score(candidateLengths);
const printedNll = model.score(printedLengths);
const developmentNll = model.score(developmentLengths);
const frozenSuffixNll = model.score(frozenSuffixLengths);
assert(Math.abs(candidateNll - 2.590067600035986) < 1e-9);
assert(Math.abs(printedNll - 2.4885996270991875) < 1e-9);
assert(Math.abs(developmentNll - 2.6108919322995314) < 1e-9);
assert(Math.abs(frozenSuffixNll - 2.5502044400234483) < 1e-9);

const nativeTape = nativeWords.join('');
const nativeGapBits = Array(nativeTape.length - 1).fill(false);
let nativeOffset = 0;
for (const word of nativeWords) {
  nativeOffset += Array.from(word).length;
  if (nativeOffset < nativeTape.length) nativeGapBits[nativeOffset - 1] = true;
}
const donorStarts = [0, 25, 50, 75, 100, 125, 150, 175];
const donorPlants = donorStarts.map(start => {
  const originalGaps = nativeGapBits.slice(start, start + gapCount);
  const encodedGaps = originalGaps.map((bit, index) => bit !== effectiveMask[index]);
  const decodedGaps = encodedGaps.map((bit, index) => bit !== effectiveMask[index]);
  return {
    start,
    runes: nativeTape.slice(start, start + windowLength).length,
    exact: decodedGaps.every((bit, index) => bit === originalGaps[index])
  };
});
assert(donorPlants.every(plant => plant.runes === windowLength && plant.exact));
assert.equal(donorPlants.length, 8);

let seed = 0x33012776;
function randomUnit() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const eligiblePositions = Array.from({ length: gapCount }, (_, index) => index)
  .filter(index => !anchors[index]);
const maskBits = effectiveMaskBits;
const nullCount = 2000;
const nullScores = [];
let exactWrongMaskDonorRecoveries = 0;
for (let sample = 0; sample < nullCount; sample++) {
  const positions = eligiblePositions.slice();
  for (let i = 0; i < maskBits; i++) {
    const j = i + Math.floor(randomUnit() * (positions.length - i));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const nullMask = Array(gapCount).fill(false);
  for (let i = 0; i < maskBits; i++) nullMask[positions[i]] = true;
  if (nullMask.every((bit, index) => bit === effectiveMask[index])) {
    exactWrongMaskDonorRecoveries++;
  }
  const nullBoundaries = lp2PrintedGaps.map((bit, index) =>
    (bit !== nullMask[index]) || anchors[index]);
  const nullLengths = groupsFrom(nullBoundaries, lp2.runes.slice(0, windowLength))
    .map(group => group.length);
  nullScores.push(model.score(nullLengths));
}
const nullsAtLeastAsGood = nullScores.filter(score => score <= candidateNll).length;
assert.equal(nullsAtLeastAsGood, 1415);
assert.equal(exactWrongMaskDonorRecoveries, 0);

const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const candidateShortWords = candidateLengths.filter(length => length <= 2).length;
const candidateMean = mean(candidateLengths);
const nativeMean = mean(nativeWordLengths);
const sortedNullScores = nullScores.slice().sort((a, b) => a - b);

console.log(JSON.stringify({
  status: 'bounded LP1-mask rejection as a standalone boundary-only plaintext inverse; no unknown plaintext or key',
  source: {
    lp1Runes: lp1.runes.length,
    lp1InternalGapBits: lp1Mask.filter(Boolean).length,
    lp2WindowRunes: windowLength,
    lp2PrintedGapBits: lp2PrintedGaps.filter(Boolean).length,
    punctuationAnchors: punctuationAnchors.filter(Boolean).length,
    additionalInkTransitions: inkTransitionsAdded,
    effectiveMaskBits: maskBits,
    developmentRunes: developmentEnd,
    frozenSuffixRunes: windowLength - developmentEnd
  },
  candidate: {
    groups: candidateGroups.length,
    meanWordLength: candidateMean,
    singletons: singletons.length,
    validAorISingletons: validSingletons,
    invalidSingletons: singletons.length - validSingletons,
    wordsOfLengthAtMostTwo: candidateShortWords,
    exactFiniteLexiconMatches: lexicalMatches,
    developmentNll: developmentNll,
    frozenSuffixNll: frozenSuffixNll,
    fullNll: candidateNll,
    printedBoundaryNll: printedNll
  },
  sourceNativeControl: {
    words: nativeWords.length,
    runes: nativeRuneCount,
    meanWordLength: nativeMean,
    singletons: nativeSingletons,
    wordsOfLengthAtMostTwo: nativeShortWords
  },
  unrestrictedOrderedEnglishGate: {
    punctuationSpans: punctuationSegments.length,
    parseableUnderAnyInteriorBreaks: parseableCount,
    impossibleUnderAnyInteriorBreaks: punctuationSegments.length - parseableCount,
    parseableSpans: punctuationParseability.filter(item => item.parseable)
  },
  equalDensityNulls: {
    count: nullCount,
    masksBetterOrEqual: nullsAtLeastAsGood,
    lowerTailP: (nullsAtLeastAsGood + 1) / (nullCount + 1),
    medianNll: sortedNullScores[Math.floor(nullCount / 2)],
    exactWrongMaskDonorRecoveries
  },
  matchedDonorPlants: donorPlants,
  scope: 'fixed global-zero LP1 hyphen-gap mask; first equal-length LP2 interval; punctuation and red-ink transitions held fixed; finite source-calibrated GP29 English register'
}, null, 2));
