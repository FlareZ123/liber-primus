"use strict";

// Discovery-wide calibration of the p27/p55 six-rune marker and length relation.
// Three nulls preserve page lengths, per-page rune frequencies, printed word
// boundaries, and fixed page/chapter/segment membership. No cipher is applied.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const TRANSCRIPTION_PATH = path.join(ROOT, "resources", "lp2-transcription.txt");
const CORPUS_PATH = path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json");
const raw = fs.readFileSync(TRANSCRIPTION_PATH, "utf8");
const corpusRaw = fs.readFileSync(CORPUS_PATH, "utf8");
const corpus = JSON.parse(corpusRaw);
const parsed = parseLP2Words(raw, 57); // 57 rune-bearing pages; physical p50 is image-only.
const verify = (condition, message) => {
  if (!condition) throw new Error(message);
};
const sha256 = value => crypto.createHash("sha256").update(value, "utf8").digest("hex");

const pageRecords = corpus.pages.filter(page => page.indices.length > 0);
const pageSeq = new Map(pageRecords.map(page => [page.page, page.indices.slice()]));
const pageStarts = [];
const pageLengths = [];
let globalRuneOffset = 0;
for (let runePage = 0; runePage < 57; runePage++) {
  const physicalPage = physicalLP2Page(runePage);
  const sequence = pageSeq.get(physicalPage);
  verify(sequence, "Missing corpus page " + physicalPage);
  pageStarts[runePage] = globalRuneOffset;
  pageLengths[runePage] = sequence.length;
  globalRuneOffset += sequence.length;
}

const completeWords = new Map(pageRecords.map(page => [page.page, []]));
const wordFragments = new Map(pageRecords.map(page => [page.page, []]));
let wordOffset = 0;
const flattenedTranscription = [];
for (const word of parsed.words) {
  const runes = Array.from(word.runes).map(rune => corpus.runes.indexOf(rune));
  verify(runes.every(index => index >= 0), "Unknown rune in canonical transcription");
  flattenedTranscription.push(...runes);
  const start = wordOffset;
  const end = start + runes.length;
  wordOffset = end;

  // Preserve the actual printed word clock, including the 32 words that cross
  // a physical page boundary. Fragments are used only for the within-word null.
  for (let runePage = word.startPage; runePage <= word.endPage; runePage++) {
    const pageStart = pageStarts[runePage];
    const pageEnd = pageStart + pageLengths[runePage];
    const fragmentStart = Math.max(start, pageStart);
    const fragmentEnd = Math.min(end, pageEnd);
    if (fragmentEnd > fragmentStart) {
      wordFragments.get(physicalLP2Page(runePage)).push([
        fragmentStart - pageStart, fragmentEnd - pageStart
      ]);
    }
  }

  // Only complete printed words wholly inside a page can be a page-local marker.
  if (word.startPage === word.endPage) {
    const physicalPage = physicalLP2Page(word.startPage);
    const localStart = start - pageStarts[word.startPage];
    completeWords.get(physicalPage).push({
      start: localStart,
      end: localStart + runes.length,
      length: runes.length
    });
  }
}

const flattenedCorpus = [];
for (const page of pageRecords) flattenedCorpus.push(...page.indices);
verify(parsed.runeCount === 13136, "Unexpected transcription rune count");
verify(parsed.words.length === 2941, "Unexpected full-corpus word count");
verify(parsed.crossPageWords === 32, "Unexpected cross-page word count");
verify(wordOffset === parsed.runeCount, "Word parser did not consume the transcription");
verify(flattenedTranscription.length === flattenedCorpus.length &&
  flattenedTranscription.every((value, index) => value === flattenedCorpus[index]),
  "Canonical transcription and GP29 page arrays disagree");

for (const page of pageRecords) {
  const fragments = wordFragments.get(page.page).slice().sort((a, b) => a[0] - b[0]);
  let cursor = 0;
  for (const fragment of fragments) {
    verify(fragment[0] === cursor, "Gap/overlap in word fragments on p" + page.page);
    cursor = fragment[1];
  }
  verify(cursor === page.indices.length, "Word fragments do not cover p" + page.page);
}

const sixSpans = new Map();
for (const page of pageRecords) {
  const words = completeWords.get(page.page);
  const spans = [];
  for (let i = 0; i < words.length; i++) {
    let length = 0;
    for (let j = i; j < words.length; j++) {
      if (j > i && words[j - 1].end !== words[j].start) break;
      length += words[j].length;
      if (length === 6) {
        spans.push({
          start: words[i].start,
          end: words[j].end,
          terminal: words[j].end === page.indices.length
        });
      }
      if (length >= 6) break;
    }
  }
  sixSpans.set(page.page, spans);
}

// Search every ordered page pair and every positive integer tape multiplier
// that is possible from the observed page lengths. The actual maximum is four.
const minPageLength = Math.min(...pageRecords.map(page => page.indices.length));
const maxPageLength = Math.max(...pageRecords.map(page => page.indices.length));
const maxMultiplier = Math.floor((maxPageLength - 6) / minPageLength);
const pairs = [];
for (let multiplier = 1; multiplier <= maxMultiplier; multiplier++) {
  for (const source of pageRecords) {
    for (const target of pageRecords) {
      if (source.page !== target.page &&
          source.indices.length === multiplier * target.indices.length + 6) {
        pairs.push({source: source.page, target: target.page, multiplier});
      }
    }
  }
}
const pairsByMultiplier = {};
for (let multiplier = 1; multiplier <= maxMultiplier; multiplier++) {
  pairsByMultiplier[multiplier] = pairs.filter(pair => pair.multiplier === multiplier).map(pair => {
    const sourceMarkers = sixSpans.get(pair.source);
    const targetMarkers = sixSpans.get(pair.target);
    return {
      source: pair.source,
      target: pair.target,
      sourceLength: pageSeq.get(pair.source).length,
      targetLength: pageSeq.get(pair.target).length,
      sourceCuts: sourceMarkers.length,
      targetMarkers: targetMarkers.length,
      terminalTargetMarkers: targetMarkers.filter(marker => marker.terminal).length
    };
  });
}
const usedPages = [...new Set(pairs.flatMap(pair => [pair.source, pair.target]))]
  .sort((a, b) => a - b);
const candidateComparisons = pairs.reduce((sum, pair) =>
  sum + sixSpans.get(pair.source).length * sixSpans.get(pair.target).length, 0);

function markerKey(sequence, span) {
  return sequence.slice(span.start, span.end).join(",");
}
function score(work) {
  const targetKeys = new Map();
  const sourceCounts = new Map();
  for (const page of usedPages) {
    const keys = sixSpans.get(page).map(span => ({
      key: markerKey(work.get(page), span),
      terminal: span.terminal
    }));
    targetKeys.set(page, keys);
    const counts = new Map();
    for (const item of keys) counts.set(item.key, (counts.get(item.key) || 0) + 1);
    sourceCounts.set(page, counts);
  }
  let all = 0;
  let k3 = 0;
  let terminal = 0;
  let terminalK3 = 0;
  const byMultiplier = {};
  for (let multiplier = 1; multiplier <= maxMultiplier; multiplier++) {
    byMultiplier[multiplier] = 0;
  }
  for (const pair of pairs) {
    const source = sourceCounts.get(pair.source);
    for (const targetMarker of targetKeys.get(pair.target)) {
      const count = source.get(targetMarker.key) || 0;
      all += count;
      byMultiplier[pair.multiplier] += count;
      if (pair.multiplier === 3) k3 += count;
      if (targetMarker.terminal) {
        terminal += count;
        if (pair.multiplier === 3) terminalK3 += count;
      }
    }
  }
  return {all, k3, terminal, terminalK3, byMultiplier};
}

function exactHits(work) {
  const hits = [];
  for (const pair of pairs) {
    const source = work.get(pair.source);
    const target = work.get(pair.target);
    for (const targetSpan of sixSpans.get(pair.target)) {
      for (const sourceSpan of sixSpans.get(pair.source)) {
        let equal = true;
        for (let i = 0; i < 6; i++) {
          if (source[sourceSpan.start + i] !== target[targetSpan.start + i]) {
            equal = false;
            break;
          }
        }
        if (equal) {
          hits.push({
            source: pair.source,
            target: pair.target,
            multiplier: pair.multiplier,
            sourceOffsets: [sourceSpan.start, sourceSpan.end],
            targetOffsets: [targetSpan.start, targetSpan.end],
            cutAfterSourceOffset: sourceSpan.end,
            targetTerminal: targetSpan.terminal,
            markerIndices: source.slice(sourceSpan.start, sourceSpan.end)
          });
        }
      }
    }
  }
  return hits;
}

const originalWork = new Map(usedPages.map(page => [page, pageSeq.get(page).slice()]));
const observed = score(originalWork);
const hits = exactHits(originalWork);
verify(pageRecords.length === 57, "Expected 57 rune-bearing pages");
verify(pageRecords.length * (pageRecords.length - 1) === 3192, "Unexpected ordered-pair count");
verify(maxMultiplier === 4, "Unexpected maximum tape multiplier");
verify(pairs.length === 51, "Unexpected length-compatible pair count");
verify(candidateComparisons === 8170, "Unexpected marker/cut comparison count");
verify(observed.all === 1 && observed.k3 === 1 && observed.terminalK3 === 1,
  "Unexpected discovery-wide match count");
verify(hits.length === 1, "Expected exactly one original marker match");
const hit = hits[0];
verify(hit.source === 27 && hit.target === 55 && hit.multiplier === 3,
  "Unique match is not p27 -> p55 with three tapes");
verify(hit.sourceOffsets[0] === 28 && hit.sourceOffsets[1] === 34 &&
  hit.targetOffsets[0] === 70 && hit.targetOffsets[1] === 76 && hit.targetTerminal,
  "Unexpected marker offsets or target terminality");
const markerTransliteration = hit.markerIndices.map(index =>
  corpus.translit ? corpus.translit[index] : String(index)).join("");
verify(markerTransliteration === "DJUBEI", "Unexpected GP29 marker identity");

const sourcePage = pageSeq.get(27);
const targetLength = pageSeq.get(55).length;
const remainder = sourcePage.slice(hit.sourceOffsets[1]).concat(
  sourcePage.slice(0, hit.sourceOffsets[0]));
verify(remainder.length === 3 * targetLength, "Three-tape remainder has wrong length");
const tapeRanges = [
  {start: 34, end: 110, length: 76},
  {start: 110, end: 186, length: 76},
  {start: 186, end: 234, wrapTo: 28, length: 76}
];
const tapes = [
  remainder.slice(0, targetLength),
  remainder.slice(targetLength, 2 * targetLength),
  remainder.slice(2 * targetLength, 3 * targetLength)
];
verify(tapes.every(tape => tape.length === targetLength), "Tape split failed");

function histogram(sequence) {
  const counts = new Array(corpus.runes.length).fill(0);
  for (const rune of sequence) counts[rune]++;
  return counts;
}
function cloneWork() {
  return new Map(usedPages.map(page => [page, pageSeq.get(page).slice()]));
}
function swapSpan(sequence, first, second) {
  const a = sequence.slice(first.start, first.end);
  const b = sequence.slice(second.start, second.end);
  verify(a.length === 6 && b.length === 6, "Planted-control spans must both be six runes");
  for (let i = 0; i < 6; i++) {
    sequence[first.start + i] = b[i];
    sequence[second.start + i] = a[i];
  }
}
const sourceSpan = sixSpans.get(27).find(span => span.start === 28 && span.end === 34);
const sourceAlternative = sixSpans.get(27).find(span => span.start === 34 && span.end === 40);
const targetSpan = sixSpans.get(55).find(span => span.start === 70 && span.end === 76);
const targetAlternative = sixSpans.get(55).find(span => span.start === 1 && span.end === 7);
verify(sourceSpan && sourceAlternative && targetSpan && targetAlternative,
  "Missing preselected planted-control spans");

const sourceShiftWork = cloneWork();
swapSpan(sourceShiftWork.get(27), sourceSpan, sourceAlternative);
const sourceShiftHits = exactHits(sourceShiftWork);
verify(sourceShiftHits.length === 1 && sourceShiftHits[0].sourceOffsets[0] === 34 &&
  sourceShiftHits[0].targetOffsets[0] === 70, "Source-shift positive control failed");

const bothShiftWork = cloneWork();
swapSpan(bothShiftWork.get(27), sourceSpan, sourceAlternative);
swapSpan(bothShiftWork.get(55), targetSpan, targetAlternative);
const bothShiftHits = exactHits(bothShiftWork);
verify(bothShiftHits.length === 1 && bothShiftHits[0].sourceOffsets[0] === 34 &&
  bothShiftHits[0].targetOffsets[0] === 1 && !bothShiftHits[0].targetTerminal,
  "Nonterminal target/source positive control failed");
const plantedFrequencyPreserved = [27, 55].every(page =>
  JSON.stringify(histogram(originalWork.get(page))) ===
  JSON.stringify(histogram(bothShiftWork.get(page))));
verify(plantedFrequencyPreserved, "Planted control changed a page rune frequency");

const negativeK3Pairs = pairs.filter(pair => pair.multiplier === 3 &&
  !(pair.source === 27 && pair.target === 55)).map(pair => {
    const count = exactHitsForPair(originalWork, pair).length;
    return {source: pair.source, target: pair.target, matches: count};
  });
function exactHitsForPair(work, pair) {
  const found = [];
  const source = work.get(pair.source);
  const target = work.get(pair.target);
  for (const targetSpan of sixSpans.get(pair.target)) {
    for (const sourceSpan of sixSpans.get(pair.source)) {
      let equal = true;
      for (let i = 0; i < 6; i++) {
        if (source[sourceSpan.start + i] !== target[targetSpan.start + i]) {
          equal = false;
          break;
        }
      }
      if (equal) found.push({source: pair.source, target: pair.target});
    }
  }
  return found;
}
verify(negativeK3Pairs.length === 3 && negativeK3Pairs.every(pair => pair.matches === 0),
  "An unrelated three-tape page pair produced a marker match");

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
function shuffleRange(sequence, start, end, random) {
  // Repeated fresh Fisher-Yates shuffles are independent uniform permutations
  // of the fixed multiset, even when applied to the previous trial's ordering.
  for (let i = end - 1; i > start; i--) {
    const j = start + Math.floor(random() * (i - start + 1));
    const value = sequence[i];
    sequence[i] = sequence[j];
    sequence[j] = value;
  }
}
function writeAt(sequence, values, start) {
  for (let i = 0; i < values.length; i++) sequence[start + i] = values[i];
}
function wilson95(successes, trials) {
  const z = 1.959963984540054;
  const p = successes / trials;
  const den = 1 + z * z / trials;
  const center = (p + z * z / (2 * trials)) / den;
  const half = z * Math.sqrt((p * (1 - p) / trials) +
    (z * z / (4 * trials * trials))) / den;
  return [Math.max(0, center - half), Math.min(1, center + half)];
}
function runNull(model, trials, seed) {
  const random = makeRandom(seed);
  const work = new Map(usedPages.map(page => [page, pageSeq.get(page).slice()]));
  const exceedances = {all: 0, k3: 0, terminalK3: 0};
  const wordGroups = new Map();
  if (model === "same-length-whole-word-permutation") {
    for (const page of usedPages) {
      const groups = new Map();
      for (const word of completeWords.get(page)) {
        if (!groups.has(word.length)) groups.set(word.length, []);
        groups.get(word.length).push(word);
      }
      wordGroups.set(page, [...groups.values()]);
    }
  }

  for (let trial = 0; trial < trials; trial++) {
    for (const page of usedPages) {
      const sequence = work.get(page);
      if (model === "page-rune-permutation") {
        shuffleRange(sequence, 0, sequence.length, random);
      } else if (model === "within-word-fragment-permutation") {
        for (const [start, end] of wordFragments.get(page)) {
          shuffleRange(sequence, start, end, random);
        }
      } else if (model === "same-length-whole-word-permutation") {
        for (const group of wordGroups.get(page)) {
          const contents = group.map(word => sequence.slice(word.start, word.end));
          for (let i = contents.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            const value = contents[i];
            contents[i] = contents[j];
            contents[j] = value;
          }
          for (let i = 0; i < group.length; i++) {
            writeAt(sequence, contents[i], group[i].start);
          }
        }
      } else {
        throw new Error("Unknown null model: " + model);
      }
    }

    const value = score(work);
    if (value.all >= observed.all) exceedances.all++;
    if (value.k3 >= observed.k3) exceedances.k3++;
    if (value.terminalK3 >= observed.terminalK3) exceedances.terminalK3++;
  }

  const p = {};
  const confidence95 = {};
  for (const key of Object.keys(exceedances)) {
    p[key] = (exceedances[key] + 1) / (trials + 1);
    confidence95[key] = wilson95(exceedances[key], trials);
  }
  return {model, trials, seed: "0x" + seed.toString(16), pagesRandomized: usedPages.length,
    exceedances, plusOneP: p, wilson95: confidence95};
}

const TRIALS = 100000;
const nullResults = [
  runNull("page-rune-permutation", TRIALS, 0x9412026),
  runNull("within-word-fragment-permutation", TRIALS, 0x9412027),
  runNull("same-length-whole-word-permutation", TRIALS, 0x9412028)
];

const pairCensus = {};
for (const [multiplier, rows] of Object.entries(pairsByMultiplier)) {
  pairCensus[multiplier] = rows.map(row => {
    const pair = {source: row.source, target: row.target, multiplier: Number(multiplier)};
    return {...row, matches: exactHitsForPair(originalWork, pair).length};
  });
}
const allNonmatches = pairCensus && Object.values(pairCensus).flat().filter(row => row.matches === 0).length;
const report = {
  inputs: {
    transcriptionPath: "resources/lp2-transcription.txt",
    transcriptionSha256: sha256(raw),
    corpusPath: "resources/liber-primus/lp2-corpus.json",
    corpusSha256: sha256(corpusRaw),
    parser: "sims/lp2_word_pages.cjs::parseLP2Words(raw, 57)"
  },
  corpus: {
    physicalJpegs: 58,
    runeBearingPages: pageRecords.length,
    imageOnlyPage: 50,
    orderedRuneBearingPagePairs: pageRecords.length * (pageRecords.length - 1),
    orderedPairsIncludingImageOnlyPage: 58 * 57,
    runes: parsed.runeCount,
    words: parsed.words.length,
    crossPageWords: parsed.crossPageWords,
    completeWords: parsed.words.length - parsed.crossPageWords
  },
  search: {
    markerLength: 6,
    multipliersTested: [1, 2, 3, 4],
    maximumPossibleMultiplier: maxMultiplier,
    lengthCompatibleOrderedPairs: pairs.length,
    uniquePagesInLengthPairs: usedPages.length,
    wordAlignedMarkerBySourceCutComparisons: candidateComparisons,
    threeTapePairs: pairsByMultiplier[3],
    pairCensus,
    nonmatchingLengthCompatiblePairs: allNonmatches
  },
  observed: {
    totalMatchesAcrossFullSearch: observed.all,
    matchesAtMultiplier3: observed.k3,
    terminalTargetMatchesAtMultiplier3: observed.terminalK3,
    exactHits: hits.map(value => ({
      sourcePage: value.source,
      targetPage: value.target,
      multiplier: value.multiplier,
      markerTransliteration: markerTransliteration,
      sourceOffsetsZeroBasedHalfOpen: value.sourceOffsets,
      targetOffsetsZeroBasedHalfOpen: value.targetOffsets,
      cutAfterSourceOffset: value.cutAfterSourceOffset,
      targetTerminal: value.targetTerminal
    })),
    sourceRemainderLength: remainder.length,
    threeTapeRangesInRotatedSource: tapeRanges,
    tapeLengths: tapes.map(tape => tape.length)
  },
  controls: {
    unrelatedThreeTapePairs: negativeK3Pairs,
    sourceShiftPositiveControl: sourceShiftHits,
    sourceAndTargetShiftNonterminalPositiveControl: bothShiftHits,
    plantedControlsPreservePerPageRuneFrequencies: plantedFrequencyPreserved,
    plantedControlsPreserveWordBoundaryPositions: true
  },
  nulls: nullResults,
  interpretation: {
    pageRuneNull: "Uniformly permutes all rune slots within each page; preserves each page's exact rune multiset and all word-boundary positions.",
    withinWordNull: "Uniformly permutes rune slots separately within each printed-word fragment; preserves each word's rune multiset where page-contained, and per-page frequencies.",
    wholeWordNull: "Permutes complete words only among same-length word slots within the same page; preserves each page's word inventory, per-page frequencies, and exact word-boundary positions.",
    chapterAndSegmentHandling: "No rune or word is moved between pages. Page identities and all original paragraph/segment/chapter delimiters remain fixed; cross-page words are kept as page-local fragments in the within-word null.",
    selectionCorrection: "Every ordered page pair is screened by length; every word-aligned six-rune target marker and every word-aligned six-rune source cut is tested. Multipliers 1 through 4 are all possible from observed page lengths."
  }
};
console.log(JSON.stringify(report, null, 2));
