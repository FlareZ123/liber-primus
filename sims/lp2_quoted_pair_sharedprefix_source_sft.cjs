'use strict';

// Original source-qualified quoted-pair test. Run: node sims/lp2_quoted_pair_sharedprefix_source_sft.cjs
// Read-only, Windows Node 22, CommonJS. No external downloads or arbitrary key search.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const resource = (file) => readFileSync('resources/liber-primus/' + file, 'utf8');
const corpus = JSON.parse(resource('lp2-corpus.json'));
const quoteMap = JSON.parse(resource('lp2-quote-punctuation-spans.json'));
const grid = JSON.parse(resource('lp2-grid-256.json'));
const transcription = resource('lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const wordStops = new Set('-.$&§');

/** @typedef {{ start: number, end: number, indices: number[] }} Word */
/**
 * Original printed word grammar: line wraps and physical-page marks may split
 * a word; only the source-native five punctuation types close it.
 * @param {string} source
 * @returns {Word[]}
 */
function sourceWords(source) {
  const result = [];
  const clean = source.replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
  let start = 0;
  let position = 0;
  let indices = [];
  for (const glyph of clean) {
    const rune = runeIndex.get(glyph);
    if (rune !== undefined) {
      if (indices.length === 0) start = position;
      indices.push(rune);
      position += 1;
    } else if (wordStops.has(glyph) && indices.length) {
      result.push({ start, end: position, indices });
      indices = [];
    }
  }
  if (indices.length) result.push({ start, end: position, indices });
  assert.equal(position, 13136, 'Full original unknown + solved rune stream drifted');
  return result;
}

/** @param {Word[]} words @param {number} start @returns {number} */
function indexAt(words, start) {
  const index = words.findIndex((w) => w.start === start);
  assert(index >= 0, 'A quote no longer begins on a full printed word');
  return index;
}

/** @param {Word[]} words @param {number} first @param {number} count */
function pattern(words, first, count) {
  return words.slice(first, first + count).map((w) => w.indices.length);
}

/**
 * Exact additive equality under two independently keyed fixed affine maps.
 * With common plaintext, a page-/phase-specific affine encryption implies
 * c2[i] = a*c1[i]+b mod29 for each same phase class (a != 0).
 * @param {number[]} a @param {number[]} b @param {number[]} subset
 * @returns {number}
 */
function affineCandidates(a, b, subset) {
  let allowed = 0;
  for (let alpha = 1; alpha < 29; alpha += 1) {
    for (let beta = 0; beta < 29; beta += 1) {
      if (subset.every((i) => (alpha * a[i] + beta) % 29 === b[i])) {
        allowed += 1;
      }
    }
  }
  return allowed;
}

/**
 * @param {number[]} source
 * @param {number[]} destination
 * @param {number[]} phases
 * @param {number} period
 */
/**
 * Necessary bijection test for identical plaintext under arbitrary,
 * independently chosen page-substitution alphabets keyed only by phase.
 * Unlike affineCandidates, this permits all 29! possible permutations;
 * it fails only if equalities disagree in either direction.
 * @param {number[]} source
 * @param {number[]} destination
 * @param {number[]} phases
 * @param {number} period
 * @returns {{ period: number, possible: boolean, violationCount: number }}
 */
function permutationGate(source, destination, phases, period) {
  const forward = Array.from({ length: period }, () => new Map());
  const reverse = Array.from({ length: period }, () => new Map());
  let violations = 0;
  for (let i = 0; i < source.length; i += 1) {
    const phase = phases[i] % period;
    const a = forward[phase];
    const b = reverse[phase];
    if (a.has(source[i]) && a.get(source[i]) !== destination[i]) violations += 1;
    if (b.has(destination[i]) && b.get(destination[i]) !== source[i]) violations += 1;
    a.set(source[i], destination[i]);
    b.set(destination[i], source[i]);
  }
  return { period, possible: violations === 0, violationCount: violations };
}

function periodGate(source, destination, phases, period) {
  const slots = Array.from({ length: period }, () => []);
  for (let i = 0; i < source.length; i += 1) {
    slots[phases[i] % period].push(i);
  }
  const differences = source.map((c, i) => (c - destination[i] + 29) % 29);
  const distinct = slots.map((group) => new Set(group.map((i) => differences[i])).size);
  const affine = slots.map((group) => affineCandidates(source, destination, group));
  return {
    period, phaseCounts: slots.map((g) => g.length),
    phaseDifferenceVarieties: distinct,
    allowsPerPhaseAdditive: distinct.every((n) => n <= 1),
    affineCandidateCounts: affine,
    allowsPerPhaseAffine: affine.every((n) => n > 0)
  };
}

function main() {
  const words = sourceWords(transcription);
  assert.equal(words.length, 2941);
  assert.equal(corpus.pages.filter((p) => p.page <= 55)
    .reduce((sum, p) => sum + p.runic_count, 0), 12956);
  assert.equal(quoteMap.quote_rune_total, 405);
  const spans = quoteMap.quotes.map((q) => {
    const selected = words.filter((w) => w.start >= q.start && w.end <= q.end);
    assert.equal(selected.reduce((n, w) => n + w.indices.length, 0), q.length);
    return { start: q.start, end: q.end, length: selected.length,
      lengths: selected.map((w) => w.indices.length) };
  });
  assert.deepEqual(spans.map((s) => s.length), [4, 5, 2, 14, 13, 34, 14]);

  const first = spans[3];
  const last = spans[6];
  assert.equal(first.start, 9811);
  assert.equal(last.start, 12522);
  assert.equal(first.length, 14);
  assert.equal(last.length, 14);
  assert.deepEqual(first.lengths.slice(0, 5), [5, 7, 2, 3, 4]);
  assert.deepEqual(first.lengths.slice(0, 5), last.lengths.slice(0, 5));
  assert.notEqual(first.lengths[5], last.lengths[5]);

  let largest = 0;
  const longestPairs = [];
  for (let i = 0; i < spans.length; i += 1) {
    for (let j = i + 1; j < spans.length; j += 1) {
      let equal = 0;
      while (equal < Math.min(spans[i].length, spans[j].length) &&
        spans[i].lengths[equal] === spans[j].lengths[equal]) equal += 1;
      if (equal > largest) {
        largest = equal;
        longestPairs.length = 0;
        longestPairs.push([i, j]);
      } else if (equal === largest) {
        longestPairs.push([i, j]);
      }
    }
  }
  assert.equal(largest, 5);
  assert.deepEqual(longestPairs, [[3, 6]]);

  const key = (values) => values.join(',');
  const lengthSequence = words.map((w) => w.indices.length);
  const sourcePattern = key(first.lengths.slice(0, 5));
  const allMatches = [];
  let allPairCollisions = 0;
  const frequencies = new Map();
  for (let i = 0; i + 5 <= words.length; i += 1) {
    const label = key(lengthSequence.slice(i, i + 5));
    frequencies.set(label, (frequencies.get(label) || 0) + 1);
    if (label === sourcePattern) allMatches.push(words[i].start);
  }
  for (const count of frequencies.values()) allPairCollisions += count * (count - 1) / 2;
  assert.deepEqual(allMatches, [9811, 12522]);
  assert.equal(lengthSequence.length - 4, 2937);

  const runeStarts = [];
  let position = 0;
  for (const p of corpus.pages) {
    runeStarts[p.page] = position;
    position += p.runic_count;
  }
  const eligible = (page) => {
    const lo = runeStarts[page];
    const hi = lo + corpus.pages[page].runic_count;
    const found = [];
    for (let i = 0; i + 13 < words.length; i += 1) {
      if (words[i].start >= lo && words[i + 13].end <= hi) found.push(i);
    }
    return found;
  };
  const firstPage = eligible(40);
  const lastPage = eligible(53);
  let matchedPagePairs = 0;
  for (const a of firstPage) {
    for (const b of lastPage) {
      if (key(pattern(words, a, 5)) === key(pattern(words, b, 5))) {
        matchedPagePairs += 1;
      }
    }
  }
  assert.equal(firstPage.length, 41);
  assert.equal(lastPage.length, 26);
  assert.equal(matchedPagePairs, 2);
  console.log('ORIGINAL_QUOTED_PAIR', JSON.stringify({
    starts: [first.start, last.start],
    sourcePages: [40, 53],
    firstFiveWordLengths: first.lengths.slice(0, 5),
    firstSixthLength: first.lengths[5],
    lastSixthLength: last.lengths[5],
    completeQuoteLengths: [first.lengths, last.lengths],
    exactFivegramOccurrencesInEntireOriginal: allMatches,
    quoteStartPairsExamined: 21,
    longestQuoteStartMatchWords: largest,
    exactAllBookFivegramPairRate: allPairCollisions / (2937 * 2936 / 2),
    eligiblePage40Starts: firstPage.length,
    eligiblePage53Starts: lastPage.length,
    pageConditionedMatchingPairs: matchedPagePairs,
    pageConditionedPairRate: matchedPagePairs / (firstPage.length * lastPage.length)
  }));

  const aWords = words.slice(indexAt(words, first.start), indexAt(words, first.start) + 5);
  const bWords = words.slice(indexAt(words, last.start), indexAt(words, last.start) + 5);
  const a = aWords.flatMap((w) => w.indices);
  const b = bWords.flatMap((w) => w.indices);
  assert.equal(a.length, 21);
  assert.equal(b.length, 21);
  assert.equal(a.filter((c, i) => c === b[i]).length, 1);
  const globalPhases = Array.from({ length: a.length }, (_, i) => i);
  const wordPhases = aWords.flatMap((w) =>
    Array.from({ length: w.indices.length }, (_, i) => i));
  const globalGates = Array.from({ length: 5 },
    (_, i) => periodGate(a, b, globalPhases, i + 1));
  const wordGates = Array.from({ length: 5 },
    (_, i) => periodGate(a, b, wordPhases, i + 1));
  for (const gate of [...globalGates, ...wordGates]) {
    assert.equal(gate.allowsPerPhaseAdditive, false);
    assert.equal(gate.allowsPerPhaseAffine, false);
  }
  // Source-only test broader than affine: arbitrary page/phase permutations.
  // Word-reset 5-phase (or any longer period with the same word-local phase)
  // fails because p53's equal symbols at word-local offset 1 in word 4 and
  // word 5 correspond to unequal p40 symbols.
  const globalPermutations = Array.from({ length: 5 },
    (_, i) => permutationGate(a, b, globalPhases, i + 1));
  const wordPermutations = Array.from({ length: 5 },
    (_, i) => permutationGate(a, b, wordPhases, i + 1));
  assert.deepEqual(globalPermutations.map((g) => g.possible),
    [false, false, false, false, true]);
  assert(wordPermutations.every((g) => g.possible === false));
  assert.equal(b[15], b[18]);
  assert.notEqual(a[15], a[18]);

  // Original same-phrase hypothesis under a static page alphabet cannot map
  // p40's repeated ciphertext F to p53's three different symbols.
  assert.deepEqual([a[0], a[16], a[18]], [0, 0, 0]);
  assert.deepEqual([b[0], b[16], b[18]], [28, 15, 0]);

  const bytes = grid.pages.flatMap((p) => p.bytes);
  assert.equal(bytes.length, 256);
  const localA = first.start - runeStarts[40];
  const localB = last.start - runeStarts[53];
  const candidateA = a.map((_, i) => bytes[(localA + i) % 16] % 29);
  const candidateB = b.map((_, i) => bytes[13 * 16 + ((localB + i) % 16)] % 29);
  const matchingP50 = a.reduce((n, c, i) =>
    n + Number((c - b[i] + 29) % 29 ===
      (candidateA[i] - candidateB[i] + 29) % 29), 0);
  assert.equal(matchingP50, 2);
  // Original source-number action: treat only the shared 5 quoted *lengths*
  // as a frozen 5-shift key, try both historical additive directions and the
  // three visible state clocks. All 3,008 runes of the floral p40-53 chapter
  // remain in order and all 29 GP symbols count normally.
  const fullRunes = Array.from(
    transcription.replace(/\/\r?\n/g, '').replace(/\r?\n/g, ''),
    (glyph) => runeIndex.get(glyph)).filter((v) => v !== undefined);
  const wordPhasesAll = words.flatMap((w) =>
    w.indices.map((_, i) => i));
  assert.equal(fullRunes.length, 13136);
  assert.equal(wordPhasesAll.length, 13136);
  const chapterStart = runeStarts[40];
  const chapterEnd = runeStarts[54];
  assert.equal(chapterEnd - chapterStart, 3008);
  const sourceKey = first.lengths.slice(0, 5);
  const coincidence = (seq) => {
    const frequencies = Array(29).fill(0);
    for (const rune of seq) frequencies[rune] += 1;
    return frequencies.reduce((acc, count) =>
      acc + count * (count - 1), 0) / (seq.length * (seq.length - 1));
  };
  const directKeyResults = [];
  for (const clock of ['chapter', 'page', 'word']) {
    for (const sign of [-1, 1]) {
      const decoded = [];
      let page = 40;
      for (let i = chapterStart; i < chapterEnd; i += 1) {
        while (page < 53 && i >= runeStarts[page + 1]) page += 1;
        const phase = clock === 'chapter' ? i - chapterStart :
          clock === 'page' ? i - runeStarts[page] : wordPhasesAll[i];
        decoded.push((fullRunes[i] + sign * sourceKey[phase % 5] + 29) % 29);
      }
      const value = coincidence(decoded);
      assert(value > 0.03 && value < 0.04,
        'Unexpected original plaintext or data drift, inspect explicitly');
      directKeyResults.push({ clock, sign, originalDecodedIoc: value,
        firstTenGP: decoded.slice(0, 10).map((r) => corpus.translit[r]) });
    }
  }
  // Exact reversible control on a separately known original clear page.
  const clearP57 = fullRunes.slice(runeStarts[57]);
  assert.equal(clearP57.length, 95);
  const cipherPlant = clearP57.map((v, i) => (v + sourceKey[i % 5]) % 29);
  assert.deepEqual(cipherPlant.map((v, i) =>
    (v - sourceKey[i % 5] + 29) % 29), clearP57);
  console.log('QUOTE_LENGTHS_AS_NUMERIC_KEY', JSON.stringify({
    sourceKey, originalFloralChapterRunes: chapterEnd - chapterStart,
    unalteredCiphertextIoC: coincidence(fullRunes.slice(chapterStart, chapterEnd)),
    originalSixClockSignTests: directKeyResults,
    solvedP57PlantAndRecover: clearP57.length
  }));

  console.log('FROZEN_SAME_PHRASE_MECHANISM_GATES', JSON.stringify({
    sourceSymbolPairs: a.length,
    sameCipherSymbols: 1,
    staticPagePermutationContradiction: true,
    globalPhase1To5: globalGates,
    wordResetPhase1To5: wordGates,
    globalArbitraryPhase1To5: globalPermutations,
    wordResetArbitraryPhase1To5: wordPermutations,
    fixedGrid256PageRowAdditiveMatches: matchingP50,
    unchangedCiphertextA: a,
    unchangedCiphertextB: b
  }));
}

main();
