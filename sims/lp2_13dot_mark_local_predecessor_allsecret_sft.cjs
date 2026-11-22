'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');

const ROOT = path.join(__dirname, '..');
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const readJson = (rel) => JSON.parse(readText(rel));
const Q = 29;
const SELECTED_K = [1, 2, 5, 9, 14];

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const annotations = readJson('resources/liber-primus/lp2-ink-annotations.json');
const punctuation = readJson('resources/liber-primus/lp2-punctuation-identity.json');
const p0Override = readJson('resources/liber-primus/lp2-p0-physical-ink-override.json');
const parsed = parseSharedCorpus();

const cipher = corpus.pages
  .filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(cipher.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);

const pageStarts = new Map();
let totalRunes = 0;
for (const page of corpus.pages) {
  pageStarts.set(page.page, totalRunes);
  totalRunes += page.indices.length;
}
assert.equal(totalRunes, 13136);

function collectMarks(maxPage) {
  const marks = [];
  for (const page of annotations.pages) {
    if (page.page > maxPage) continue;
    for (const mark of page.large_punctuation || []) {
      if (mark[1] !== 13) continue;
      marks.push({
        page: page.page,
        local: mark[0],
        offset: pageStarts.get(page.page) + mark[0],
        dots: mark[1],
        ink: mark[2]
      });
    }
  }
  return marks.sort((a, b) => a.offset - b.offset || a.page - b.page || a.local - b.local);
}

const unknownMarks = collectMarks(55);
const allMarks = collectMarks(57);
assert.equal(unknownMarks.length, 28);
assert.equal(allMarks.length, 31);
assert.equal(unknownMarks[unknownMarks.length - 1].offset, 12956);
assert.equal(p0Override.physical_zero_based.large_punctuation[0].after_runes, 13);
assert.equal(punctuation.large_mark_alignment.dot_count_distribution['13'], 28);
assert.equal(punctuation.large_mark_alignment.dot_count_distribution['10'], 3);
assert.deepEqual(punctuation.large_mark_alignment.duplicate_rune_offsets, [1860, 3603]);

const wordSpans = [];
let wordOffset = 0;
for (const word of parsed.words) {
  const length = word.length;
  wordSpans.push({
    start: wordOffset,
    end: wordOffset + length,
    length,
    startPage: word.startPage,
    endPage: word.endPage
  });
  wordOffset += length;
}
assert.equal(wordOffset, cipher.length);

const wordBoundaries = new Set([0, ...wordSpans.map((word) => word.end)]);
const allUnknownMarksAtWordBoundaries = unknownMarks.every((mark) => wordBoundaries.has(mark.offset));
assert.equal(allUnknownMarksAtWordBoundaries, true);

const unknownBounds = [0, ...unknownMarks.map((mark) => mark.offset)];
const intervals = [];
for (let i = 0; i < unknownBounds.length - 1; i++) {
  const start = unknownBounds[i];
  const end = unknownBounds[i + 1];
  const slots = wordSpans.filter((word) => word.start >= start && word.end <= end);
  assert.equal(slots.reduce((sum, word) => sum + word.length, 0), end - start);
  intervals.push({
    index: i,
    start,
    end,
    length: end - start,
    slots,
    wordCount: slots.length,
    crossPageWords: slots.filter((word) => word.startPage !== word.endPage).length
  });
}
assert.equal(intervals.length, 28);
assert.equal(intervals.filter((interval) => interval.length === 0).length, 2);
assert.equal(intervals.reduce((sum, interval) => sum + interval.length, 0), 12956);
assert.equal(intervals.reduce((sum, interval) => sum + interval.wordCount, 0), 2896);
assert.equal(intervals.reduce((sum, interval) => sum + interval.crossPageWords, 0), 32);

const fullBounds = [0, ...allMarks.map((mark) => mark.offset), totalRunes];
const fullIntervalLengths = fullBounds.slice(1).map((end, i) => end - fullBounds[i]);
assert.equal(fullIntervalLengths.length, 32);
const solvedControlLengths = fullIntervalLengths.slice(28);
assert.deepEqual(solvedControlLengths, [5, 80, 7, 88]);

const gpSymbols = corpus.translit;
assert.equal(gpSymbols.length, Q);
const symbols = gpSymbols
  .map((name, index) => ({ name, index }))
  .sort((a, b) => b.name.length - a.name.length);

function encodeWord(word) {
  const out = [];
  for (let i = 0; i < word.length;) {
    const symbol = symbols.find((candidate) => word.startsWith(candidate.name, i));
    if (!symbol) throw new Error('Unmapped source token: ' + word);
    out.push(symbol.index);
    i += symbol.name.length;
  }
  return out;
}

function encodeWords(text, alternate) {
  let clean = text.replace(/^#.*$/gm, ' ').toUpperCase();
  if (alternate) clean = clean.replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  clean = clean
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/Q/g, 'C');
  return (clean.match(/[A-Z]+/g) || [])
    .map(encodeWord)
    .filter((word) => word.length > 0);
}

const sourceTexts = [
  { name: 'Gibran', text: readText('resources/control/gibran_prophet_58585.txt') },
  { name: 'Emerson', text: readText('resources/control/emerson_essays_2944.txt') },
  { name: 'Shakespeare', text: readText('resources/control/shakespeare_first300k.txt') },
  {
    name: 'LP1',
    text: readText('resources/liber-primus/lp1-plaintext-reference.txt').split(/^### 56\s*$/m)[0]
  }
];

const sourceVariants = [];
const dictionaryByLength = Array.from({ length: 30 }, () => new Map());
const genuineByLength = Array.from({ length: 30 }, () => new Map());

function addDictionaryWords(words, destination, label) {
  for (const word of words) {
    if (!word.length || word.length >= destination.length) continue;
    const key = word.join(',');
    if (!destination[word.length].has(key)) destination[word.length].set(key, word);
  }
}

for (const source of sourceTexts) {
  for (const alternate of [false, true]) {
    const words = encodeWords(source.text, alternate);
    const label = source.name + (alternate ? '/ING-IO' : '/ordinary');
    sourceVariants.push({ name: source.name, spelling: alternate ? 'ING>NG, IO>IA' : 'ordinary', words });
    addDictionaryWords(words, dictionaryByLength, label);
    addDictionaryWords(words, genuineByLength, label);
  }
}

const wordFrequencyText = readText('resources/control/english_wordfreq_textblob.txt');
const wordFrequencyWords = wordFrequencyText
  .split(/\r?\n/)
  .map((line) => {
    const match = line.match(/^([a-z]+)\s+\d+$/i);
    return match ? match[1] : null;
  })
  .filter(Boolean)
  .join(' ');
addDictionaryWords(encodeWords(wordFrequencyWords, false), dictionaryByLength, 'TextBlob/ordinary');
addDictionaryWords(encodeWords(wordFrequencyWords, true), dictionaryByLength, 'TextBlob/ING-IO');

const dictionaryWords = dictionaryByLength.reduce((sum, map) => sum + map.size, 0);
const dictionaryByLengthCounts = dictionaryByLength.map((map) => map.size);
assert.ok(dictionaryWords > 30000);

function transitionMatrix(sequence, start, end) {
  const matrix = Array.from({ length: Q }, () => new Uint32Array(Q));
  for (let i = start + 1; i < end; i++) matrix[sequence[i - 1]][sequence[i]]++;
  return matrix;
}

function capacityFor(matrix, intervalLength) {
  const capacity = Array(Q + 1).fill(0);
  for (const row of matrix) {
    const sorted = Array.from(row).sort((a, b) => b - a);
    let running = 0;
    for (let k = 1; k <= Q; k++) {
      running += sorted[k - 1];
      capacity[k] += running;
    }
  }
  for (let k = 1; k <= Q; k++) if (intervalLength > 0) capacity[k]++;
  return capacity;
}

function sortedRowSpectra(matrix) {
  return matrix.map((row) => Array.from(row).sort((a, b) => b - a));
}

function histogramKey(lengths) {
  const hist = Array(30).fill(0);
  for (const length of lengths) hist[length]++;
  return hist.join(',');
}

function buildSourceIndex(words) {
  const prefixLength = new Uint32Array(words.length + 1);
  const prefixCounts = Array.from({ length: Q }, () => new Uint32Array(words.length + 1));
  const flat = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    prefixLength[i + 1] = prefixLength[i] + word.length;
    for (let symbol = 0; symbol < Q; symbol++) prefixCounts[symbol][i + 1] = prefixCounts[symbol][i];
    for (const symbol of word) {
      prefixCounts[symbol][i + 1]++;
      flat.push(symbol);
    }
  }
  return { words, prefixLength, prefixCounts, flat };
}

function scanSourceWindows(source, target, originalMatrix) {
  const index = buildSourceIndex(source.words);
  const windowWords = target.wordCount;
  const windowRunes = target.length;
  const targetHist = histogramKey(target.slots.map((word) => word.length));
  const targetSpectra = sortedRowSpectra(originalMatrix);
  const minimumTopK = Array(Q + 1).fill(Infinity);
  const minimumTopKAt = Array(Q + 1).fill(null);
  let matches = 0;
  let exactSlotHistogramMatches = 0;
  let exactRowSpectrumMatches = 0;
  let bestSpectrumL1 = Infinity;
  let bestSpectrumMaxRowL1 = Infinity;
  let bestSpectrumAt = null;

  for (let startWord = 0; startWord + windowWords <= index.words.length; startWord++) {
    const endWord = startWord + windowWords;
    if (index.prefixLength[endWord] - index.prefixLength[startWord] !== windowRunes) continue;
    matches++;

    const frequencies = index.prefixCounts
      .map((prefix) => prefix[endWord] - prefix[startWord])
      .sort((a, b) => b - a);
    let running = 0;
    for (let k = 1; k <= Q; k++) {
      running += frequencies[k - 1];
      if (running < minimumTopK[k]) {
        minimumTopK[k] = running;
        minimumTopKAt[k] = startWord;
      }
    }

    const candidateLengths = [];
    for (let j = startWord; j < endWord; j++) candidateLengths.push(index.words[j].length);
    if (histogramKey(candidateLengths) === targetHist) exactSlotHistogramMatches++;

    const flatStart = index.prefixLength[startWord];
    const sourceMatrix = Array.from({ length: Q }, () => new Uint32Array(Q));
    for (let offset = 1; offset < windowRunes; offset++) {
      const state = cipher[target.start + offset - 1];
      const plainSymbol = index.flat[flatStart + offset];
      sourceMatrix[state][plainSymbol]++;
    }

    let spectrumL1 = 0;
    let maximumRowL1 = 0;
    for (let state = 0; state < Q; state++) {
      const sourceSpectrum = Array.from(sourceMatrix[state]).sort((a, b) => b - a);
      let rowL1 = 0;
      for (let j = 0; j < Q; j++) rowL1 += Math.abs(sourceSpectrum[j] - targetSpectra[state][j]);
      spectrumL1 += rowL1;
      maximumRowL1 = Math.max(maximumRowL1, rowL1);
    }
    if (spectrumL1 === 0) exactRowSpectrumMatches++;
    if (spectrumL1 < bestSpectrumL1) {
      bestSpectrumL1 = spectrumL1;
      bestSpectrumMaxRowL1 = maximumRowL1;
      bestSpectrumAt = startWord;
    }
  }

  return {
    source: source.name,
    spelling: source.spelling,
    matches,
    exactSlotHistogramMatches,
    exactRowSpectrumMatches,
    minimumTopK,
    minimumTopKAt,
    bestSpectrumL1: Number.isFinite(bestSpectrumL1) ? bestSpectrumL1 : null,
    bestSpectrumMaxRowL1: Number.isFinite(bestSpectrumMaxRowL1) ? bestSpectrumMaxRowL1 : null,
    bestSpectrumAt
  };
}

const longResults = [];
for (const interval of intervals.filter((candidate) => candidate.length >= 150)) {
  const matrix = transitionMatrix(cipher, interval.start, interval.end);
  const capacity = capacityFor(matrix, interval.length);
  const sourceStats = sourceVariants.map((source) => scanSourceWindows(source, interval, matrix));
  const minimumTopK = Array(Q + 1).fill(Infinity);
  const minimumTopKSource = Array(Q + 1).fill(null);
  let totalMatches = 0;
  let totalHistogramMatches = 0;
  let totalExactSpectra = 0;
  let bestSpectrumL1 = Infinity;
  let bestSpectrumSource = null;

  for (const stats of sourceStats) {
    totalMatches += stats.matches;
    totalHistogramMatches += stats.exactSlotHistogramMatches;
    totalExactSpectra += stats.exactRowSpectrumMatches;
    for (let k = 1; k <= Q; k++) {
      if (stats.minimumTopK[k] < minimumTopK[k]) {
        minimumTopK[k] = stats.minimumTopK[k];
        minimumTopKSource[k] = {
          source: stats.source,
          spelling: stats.spelling,
          startWord: stats.minimumTopKAt[k]
        };
      }
    }
    if (stats.bestSpectrumL1 !== null && stats.bestSpectrumL1 < bestSpectrumL1) {
      bestSpectrumL1 = stats.bestSpectrumL1;
      bestSpectrumSource = {
        source: stats.source,
        spelling: stats.spelling,
        maxRowL1: stats.bestSpectrumMaxRowL1,
        startWord: stats.bestSpectrumAt
      };
    }
  }

  const failedK = [];
  for (let k = 1; k <= Q; k++) {
    if (Number.isFinite(minimumTopK[k]) && minimumTopK[k] > capacity[k]) failedK.push(k);
  }
  longResults.push({
    interval: interval.index,
    start: interval.start,
    end: interval.end,
    length: interval.length,
    words: interval.wordCount,
    crossPageWords: interval.crossPageWords,
    capacity: Object.fromEntries(SELECTED_K.map((k) => [k, capacity[k]])),
    minimumSourceTopK: Object.fromEntries(SELECTED_K.map((k) => [
      k,
      Number.isFinite(minimumTopK[k]) ? minimumTopK[k] : null
    ])),
    minimumSourceTopKFrom: Object.fromEntries(SELECTED_K.map((k) => [k, minimumTopKSource[k]])),
    failedK,
    sourceWindows: totalMatches,
    exactSlotHistogramMatches: totalHistogramMatches,
    exactConditionalSpectrumMatches: totalExactSpectra,
    bestConditionalSpectrumL1: Number.isFinite(bestSpectrumL1) ? bestSpectrumL1 : null,
    bestConditionalSpectrumFrom: bestSpectrumSource,
    sourceControlExclusion: failedK.length > 0
  });
}

const stampForward = new Int32Array(Q * Q);
const stampBackward = new Int32Array(Q * Q);
const valueForward = new Int8Array(Q * Q);
const valueBackward = new Int8Array(Q * Q);
let candidateStamp = 0;
let impossibleSlots = 0;
let impossibleSlotRunes = 0;
let minimumLocalCandidates = Infinity;
let maximumLocalCandidates = 0;
let totalLocalCandidates = 0;
let totalSlots = 0;

for (const interval of intervals) {
  for (const slot of interval.slots) {
    totalSlots++;
    const states = [];
    const outputs = [];
    for (let j = 0; j < slot.length; j++) {
      const position = slot.start + j;
      states.push(position === interval.start ? -1 : cipher[position - 1]);
      outputs.push(cipher[position]);
    }
    const candidates = Array.from(dictionaryByLength[slot.length].values());
    let compatible = 0;
    for (const candidate of candidates) {
      candidateStamp++;
      let valid = true;
      for (let j = 0; j < slot.length; j++) {
        const state = states[j];
        if (state < 0) continue;
        const plainSymbol = candidate[j];
        const cipherSymbol = outputs[j];
        const forwardIndex = state * Q + plainSymbol;
        const backwardIndex = state * Q + cipherSymbol;
        if (
          (stampForward[forwardIndex] === candidateStamp && valueForward[forwardIndex] !== cipherSymbol) ||
          (stampBackward[backwardIndex] === candidateStamp && valueBackward[backwardIndex] !== plainSymbol)
        ) {
          valid = false;
          break;
        }
        stampForward[forwardIndex] = candidateStamp;
        valueForward[forwardIndex] = cipherSymbol;
        stampBackward[backwardIndex] = candidateStamp;
        valueBackward[backwardIndex] = plainSymbol;
      }
      if (valid) compatible++;
    }
    totalLocalCandidates += compatible;
    minimumLocalCandidates = Math.min(minimumLocalCandidates, compatible);
    maximumLocalCandidates = Math.max(maximumLocalCandidates, compatible);
    if (compatible === 0) {
      impossibleSlots++;
      impossibleSlotRunes += slot.length;
    }
  }
}

const positiveRng = (() => {
  let state = 0x1337c0de;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
})();

function randomPermutation() {
  const permutation = Array.from({ length: Q }, (_, i) => i);
  for (let i = Q - 1; i > 0; i--) {
    const j = Math.floor(positiveRng() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  return permutation;
}

const positiveControl = [];
let positiveControlIntervals = 0;
let positiveControlWords = 0;
for (const interval of intervals) {
  if (interval.length === 0) continue;
  const plainWords = interval.slots.map((slot, j) => {
    const candidates = Array.from(genuineByLength[slot.length].values());
    const pool = candidates.length ? candidates : Array.from(dictionaryByLength[slot.length].values());
    assert.ok(pool.length > 0, 'No positive-control word for slot length ' + slot.length);
    return pool[(interval.index * 31 + j * 17 + 7) % pool.length];
  });
  const plain = plainWords.flat();
  assert.equal(plain.length, interval.length);
  const forward = Array.from({ length: Q }, () => randomPermutation());
  const inverse = forward.map((row) => {
    const inv = Array(Q);
    row.forEach((cipherSymbol, plainSymbol) => { inv[cipherSymbol] = plainSymbol; });
    return inv;
  });
  const encrypted = new Uint8Array(plain.length);
  encrypted[0] = plain[0];
  for (let i = 1; i < plain.length; i++) encrypted[i] = forward[encrypted[i - 1]][plain[i]];
  const decoded = new Uint8Array(plain.length);
  decoded[0] = encrypted[0];
  for (let i = 1; i < encrypted.length; i++) decoded[i] = inverse[encrypted[i - 1]][encrypted[i]];
  assert.deepEqual(Array.from(decoded), plain);

  const plantedMatrix = transitionMatrix(Array.from(encrypted), 0, encrypted.length);
  const plantedCapacity = capacityFor(plantedMatrix, encrypted.length);
  const plainCounts = Array(Q).fill(0);
  for (const symbol of plain) plainCounts[symbol]++;
  const sortedPlain = plainCounts.sort((a, b) => b - a);
  let runningPlain = 0;
  for (let k = 1; k <= Q; k++) {
    runningPlain += sortedPlain[k - 1];
    assert.ok(runningPlain <= plantedCapacity[k]);
  }

  const plainRows = Array.from({ length: Q }, () => new Uint32Array(Q));
  const cipherRows = Array.from({ length: Q }, () => new Uint32Array(Q));
  for (let i = 1; i < encrypted.length; i++) {
    const state = encrypted[i - 1];
    plainRows[state][plain[i]]++;
    cipherRows[state][encrypted[i]]++;
  }
  for (let state = 0; state < Q; state++) {
    const a = Array.from(plainRows[state]).sort((x, y) => y - x);
    const b = Array.from(cipherRows[state]).sort((x, y) => y - x);
    assert.deepEqual(a, b);
  }

  const reencrypted = new Uint8Array(decoded.length);
  reencrypted[0] = decoded[0];
  for (let i = 1; i < decoded.length; i++) reencrypted[i] = forward[reencrypted[i - 1]][decoded[i]];
  assert.deepEqual(Array.from(reencrypted), Array.from(encrypted));
  positiveControlIntervals++;
  positiveControlWords += interval.wordCount;
  positiveControl.push({ interval: interval.index, length: interval.length, words: interval.wordCount, roundTrip: true, exactRowSpectra: true, all29TopKBounds: true });
}

const report = {
  model: 'For each original 13-dot interval, C[i] = S_interval[C[i-1]][P[i]], with an arbitrary secret bijection S_interval[state] over all 29 GP symbols and one free first rune per nonempty interval. Repeated ciphertext runes are ordinary table outputs, not exceptions.',
  sourceIntegrity: {
    unknownRunes: cipher.length,
    unknownWords: parsed.words.length,
    crossPageWords: parsed.crossPageWords,
    unknown13DotMarks: unknownMarks.length,
    fullManuscript13DotMarks: allMarks.length,
    unknownIntervals: intervals.length,
    nonemptyUnknownIntervals: intervals.filter((interval) => interval.length > 0).length,
    zeroLengthUnknownIntervals: intervals.filter((interval) => interval.length === 0).length,
    allMarkersAtPrintedWordBoundaries: allUnknownMarksAtWordBoundaries,
    fullManuscriptIntervals: fullIntervalLengths.length,
    solvedControlIntervalLengths: solvedControlLengths,
    p0MarkerAfterRunes: p0Override.physical_zero_based.large_punctuation[0].after_runes,
    dotCountAlignment: punctuation.large_mark_alignment.dot_count_distribution,
    duplicateLargeMarkOffsets: punctuation.large_mark_alignment.duplicate_rune_offsets
  },
  longIntervalGate: longResults,
  exactSlotLexiconGate: {
    dictionaryUniqueGPWords: dictionaryWords,
    dictionaryByLength: dictionaryByLengthCounts,
    printedWordSlotsTested: totalSlots,
    impossibleSlots: impossibleSlots,
    impossibleSlotRunes: impossibleSlotRunes,
    minimumLocallyCompatibleWordsForAnySlot: minimumLocalCandidates,
    maximumLocallyCompatibleWordsForAnySlot: maximumLocalCandidates,
    meanLocallyCompatibleWordsPerSlot: Number((totalLocalCandidates / totalSlots).toFixed(1)),
    interpretation: 'Every printed word slot has at least one source-native/lexicon word that is locally compatible with the within-slot equality constraints. This is only a per-slot necessary test; it does not solve the cross-slot shared-permutation CSP.'
  },
  positiveControl: {
    seed: '0x1337c0de',
    intervals: positiveControlIntervals,
    words: positiveControlWords,
    allRoundTrips: true,
    allExactConditionalSpectra: true,
    all29TopKBounds: true,
    preservesOriginalWordSlotLengths: true,
    interpretation: 'Synthetic mechanics validation only. Each slot is filled with a genuine source/lexicon GP word of the exact printed length, then encrypted under independent random row bijections. It is not an LP2 plaintext proposal.'
  },
  scope: {
    sourceWindows: 'Gibran, Emerson, Shakespeare, and solved LP1; ordinary GP29 spelling plus ING>NG and IO>IA variants. Each control window is word-boundary-aligned and matches the interval rune count and word count.',
    exactSlotMatching: 'No source window matched the exact target word-length histogram in the long intervals; exact ordered slot-length sequence was not assumed. Exact target slot lengths were instead preserved in the finite per-word lexicon gate and planted positive control.',
    conditionalSpectra: 'For each candidate source window, compare the sorted 29-symbol successor-frequency spectrum separately for each of the 29 predecessor-state rows. A zero L1 distance is necessary and sufficient for some bijection per row for that fixed plaintext window.',
    p56: 'Solved prime-totient/F page, excluded from the unknown mark-local family and treated as an out-of-model control.',
    p57: 'Clear solved text, excluded from unknown ciphertext statistics.'
  }
};

console.log(JSON.stringify(report, null, 2));
