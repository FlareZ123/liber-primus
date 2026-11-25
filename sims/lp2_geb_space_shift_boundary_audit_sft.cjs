#!/usr/bin/env node
"use strict";

// Reproduce the fixed one-unit reading-frame shift from GEB's
// "Canon by Intervallic Augmentation" example on the canonical LP2
// word-boundary register. No offset, key, or delimiter rule is fitted.

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const runeSet = new Set(corpus.runes);

function parseText(text, firstPage = 0) {
  let runeCount = 0, page = firstPage, length = 0;
  let startPage = page, lastPage = page;
  const ends = [], delimiterTypes = [], words = [];
  for (const ch of text) {
    if (runeSet.has(ch)) {
      if (length === 0) startPage = page;
      length++;
      lastPage = page;
      runeCount++;
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\\s/u.test(ch)) {
      // Line wraps and whitespace in the transcription are layout only.
    } else if (length > 0) {
      ends.push(runeCount);
      delimiterTypes.push(ch);
      words.push({ length, startPage, endPage: lastPage });
      length = 0;
    }
  }
  if (length > 0) words.push({ length, startPage, endPage: lastPage });
  // A terminal delimiter closes the last word; it is not an internal gap.
  while (ends.at(-1) === runeCount) {
    ends.pop();
    delimiterTypes.pop();
  }
  return { runeCount, ends, delimiterTypes, words };
}

function frameShiftExample(words) {
  const tape = words.join("");
  const ends = [];
  let n = 0;
  for (let i = 0; i < words.length - 1; i++) {
    n += words[i].length;
    ends.push(n);
  }
  // Shift every boundary, including the implicit start/end frame, +1.
  const shiftedEnds = [1, ...ends.map(x => x + 1).filter(x => x < tape.length)];
  const bounds = [0, ...shiftedEnds, tape.length];
  const output = bounds.slice(1).map((x, i) => tape.slice(bounds[i], x));
  const inverseEnds = shiftedEnds.map(x => x - 1).filter(x => x > 0 && x < tape.length);
  return {
    input: words.join(" "),
    output: output.join(" "),
    inverseExact: JSON.stringify(inverseEnds) === JSON.stringify(ends),
    expected: "O NEW ART WOE ARE WE"
  };
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function makeBounds(ends, runeCount) {
  return [0, ...ends, runeCount];
}
function lengthsFromBounds(bounds) {
  return bounds.slice(1).map((x, i) => x - bounds[i]);
}

function main() {
  // The transcription omits the empty physical p50 page, so its first 55
  // page parts cover all 55 rune-bearing LP2 pages p0-p55.
  const parts = raw.split("%");
  const original = parseText(parts.slice(0, 55).join("%"), 0);
  const N = original.runeCount;
  const internal = original.ends;
  const originalBounds = makeBounds(internal, N);
  const originalLengths = lengthsFromBounds(originalBounds);

  // Exact canonical boundary-frame shift: every word gap moves +1 rune,
  // and the implicit initial boundary moves +1 (GEB's leading singleton).
  const allShiftEnds = [1, ...internal.map(x => x + 1).filter(x => x < N)];
  const allShiftBounds = makeBounds(allShiftEnds, N);
  const allShiftLengths = lengthsFromBounds(allShiftBounds);

  // Literal-space sensitivity: only transcription hyphens are spaces;
  // periods remain fixed punctuation boundaries. This is not silently
  // repaired when a shifted space coincides with a fixed boundary.
  const spaces = internal.filter((x, i) => original.delimiterTypes[i] === "-");
  const fixed = internal.filter((x, i) => original.delimiterTypes[i] !== "-");
  const literalSet = new Set([1, ...spaces.map(x => x + 1).filter(x => x < N), ...fixed]);
  const literalEnds = [...literalSet].sort((a, b) => a - b);
  const literalBounds = makeBounds(literalEnds, N);
  const literalLengths = lengthsFromBounds(literalBounds);
  const literalCollisions = 1 + spaces.length + fixed.length - literalSet.size;

  // Physical page coordinates, excluding the empty p50 page.
  const pageOffsets = [];
  let offset = 0;
  for (const p of corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0)) {
    pageOffsets.push({ page: p.page, start: offset, end: offset + p.indices.length });
    offset += p.indices.length;
  }
  function pageOf(i) {
    const p = pageOffsets.find(x => i >= x.start && i < x.end);
    return p ? p.page : -1;
  }
  function crossPageWords(bounds) {
    let n = 0;
    for (let i = 0; i < bounds.length - 1; i++) {
      if (pageOf(bounds[i]) !== pageOf(bounds[i + 1] - 1)) n++;
    }
    return n;
  }

  const markPositions = [];
  const redEdges = [];
  offset = 0;
  for (const p of corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0)) {
    const a = ink.pages.find(x => x.page === p.page);
    for (const [j, n] of a?.large_punctuation || []) if (n === 13) markPositions.push(offset + j);
    for (const s of a?.red_spans || []) redEdges.push(offset + s.start, offset + s.start + s.length);
    offset += p.indices.length;
  }
  const pageStarts = pageOffsets.map(p => p.start);
  const countHits = (set, xs) => xs.filter(x => set.has(x)).length;
  const originalSet = new Set(internal);
  const allShiftSet = new Set(allShiftEnds);
  const literalShiftSet = literalSet;

  const offsets = [];
  for (let k = 0; k < 29; k++) {
    const set = new Set([k, ...internal.map(x => x + k).filter(x => x > 0 && x < N)]);
    offsets.push({
      k,
      thirteenDotHits: countHits(set, markPositions),
      redEdgeHits: countHits(set, redEdges),
      pageStartHits: countHits(set, pageStarts)
    });
  }

  const p56 = parseText(parts[55], 56);
  const p57 = parseText(parts[56], 57);
  function control(p) {
    const n = p.runeCount;
    const ends = [];
    let sum = 0;
    for (let i = 0; i < p.words.length - 1; i++) {
      sum += p.words[i].length;
      ends.push(sum);
    }
    const shifted = [1, ...ends.map(x => x + 1).filter(x => x < n)];
    const inverse = shifted.map(x => x - 1).filter(x => x > 0 && x < n);
    return {
      runes: n,
      words: p.words.length,
      shiftedWords: shifted.length + 1,
      inverseExact: JSON.stringify(inverse) === JSON.stringify(ends)
    };
  }

  const result = {
    source: {
      operation: "shift the reading frame / all word spaces one unit to the right",
      selector: "2014 first-party GEB book-code coordinate CBIA:3:7:2 selects the CBIA dialogue; the dialogue contains the one-unit frame-shift example",
      transcriptSha: "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7",
      corpusSha: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
      inkSha: "0614aca67969a14ae006e0c1ae6aee6dcd8136e6"
    },
    scope: {
      physicalPages: "p0-p55; p50 is blank and omitted from the transcription",
      runeBearingPages: pageOffsets.length,
      runes: N,
      words: original.words.length,
      internalBoundaries: internal.length,
      delimiters: original.delimiterTypes.reduce((a, x) => (a[x] = (a[x] || 0) + 1, a), {}),
      originalSingletons: originalLengths.filter(x => x === 1).length,
      originalCrossPageWords: crossPageWords(originalBounds)
    },
    sourceExample: frameShiftExample(["ONE", "WAR", "TWO", "EAR", "EWE"]),
    canonicalAllBoundaryShift: {
      words: allShiftLengths.length,
      singletonCount: allShiftLengths.filter(x => x === 1).length,
      firstLengths: allShiftLengths.slice(0, 8),
      lastLengths: allShiftLengths.slice(-8),
      crossPageWords: crossPageWords(allShiftBounds),
      wordCountPrime: isPrime(allShiftLengths.length),
      thirteenDotHits: countHits(allShiftSet, markPositions),
      redEdgeHits: countHits(allShiftSet, redEdges),
      pageStartHits: countHits(allShiftSet, pageStarts)
    },
    literalHyphenSpaceShift: {
      words: literalLengths.length,
      singletonCount: literalLengths.filter(x => x === 1).length,
      firstLengths: literalLengths.slice(0, 8),
      lastLengths: literalLengths.slice(-8),
      crossPageWords: crossPageWords(literalBounds),
      wordCountPrime: isPrime(literalLengths.length),
      thirteenDotHits: countHits(literalShiftSet, markPositions),
      redEdgeHits: countHits(literalShiftSet, redEdges),
      pageStartHits: countHits(literalShiftSet, pageStarts),
      shiftedExplicitSpaces: spaces.length,
      fixedPunctuationBoundaries: fixed.length,
      coincidentBoundaryCount: literalCollisions
    },
    originalFeature: {
      thirteenDotHits: countHits(originalSet, markPositions),
      redEdgeHits: countHits(originalSet, redEdges),
      pageStartHits: countHits(originalSet, pageStarts)
    },
    allOffsets: offsets,
    solvedControls: { p56: control(p56), p57: control(p57) }
  };

  if (N !== 12956 || original.words.length !== 2896) throw new Error("Unexpected p0-p55 corpus dimensions");
  if (result.sourceExample.output !== result.sourceExample.expected || !result.sourceExample.inverseExact) {
    throw new Error("GEB source example failed");
  }
  if (!result.solvedControls.p56.inverseExact || !result.solvedControls.p57.inverseExact) {
    throw new Error("Solved-text round-trip control failed");
  }
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}

main();
