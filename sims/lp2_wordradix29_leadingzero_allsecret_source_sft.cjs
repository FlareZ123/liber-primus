"use strict";
/**
 * Original LP2 source-native numeral endpoint obstruction.
 *
 * A canonical unpadded base-29 integer with at least two digits cannot
 * begin with zero. This invariant survives every secret stationary
 * bijective rune-to-digit alphabet, independent of ciphertext language.
 *
 * JSDoc/CJS, Windows Node.js 22, no file writes or external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const text = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(original.length, 12956);

/** @type {number[][]} */
const words = [];
let current = [];
let runeCount = 0;
/**
 * End a source-visible word at hyphen, ordinary full stop or ampersand.
 * Page '%' and line '/' are transparent, including 32 page carries.
 */
for (const ch of text) {
  if (runeMap.has(ch)) {
    current.push(runeMap.get(ch));
    runeCount++;
    if (runeCount === original.length) {
      words.push(current);
      current = [];
      break;
    }
  } else if ((ch === "-" || ch === "." || ch === "&") && current.length) {
    words.push(current);
    current = [];
  }
}
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
const longWords = words.filter(word => word.length >= 2);
assert.equal(longWords.length, 2813);
assert.equal(words.length - longWords.length, 83);
const initial = new Array(29).fill(0);
const terminal = new Array(29).fill(0);
for (const word of longWords) {
  initial[word[0]]++;
  terminal[word[word.length - 1]]++;
}
assert.equal(Math.min(...initial), 78);
assert.equal(Math.max(...initial), 116);
assert.equal(Math.min(...terminal), 75);
assert.equal(Math.max(...terminal), 117);
const freq = array => Object.fromEntries(
  array.map((n, i) => [corpus.translit[i], n])
);
const chapterWordCounts = [158, 255, 383, 437, 224, 326, 378, 669, 66];
assert.equal(chapterWordCounts.reduce((a, b) => a + b), words.length);
let offset = 0;
const chapterEndpointCounts = chapterWordCounts.map((count, i) => {
  const segment = words.slice(offset, offset + count)
    .filter(word => word.length >= 2);
  offset += count;
  const leading = new Array(29).fill(0);
  const trailing = new Array(29).fill(0);
  for (const word of segment) {
    leading[word[0]]++;
    trailing[word[word.length - 1]]++;
  }
  const minLeading = Math.min(...leading);
  const minTrailing = Math.min(...trailing);
  if (i < 8) {
    assert.ok(minLeading > 0, "Chapter zero-digit contradiction, forward");
    assert.ok(minTrailing > 0, "Chapter zero-digit contradiction, reverse");
  }
  return {
    chapter: i + 1,
    multiRuneWords: segment.length,
    minLeading, minTrailing,
    missingLeadingRunes: corpus.translit.filter((_, j) => !leading[j]),
    missingTrailingRunes: corpus.translit.filter((_, j) => !trailing[j])
  };
});
assert.equal(offset, words.length);
/**
 * For any source-visible chapter, greedily extend each constant-zero
 * run until adding the next multi-digit word would cover all 29 rune
 * identities. Any longer run is impossible; the greedy cut is optimal
 * because every shorter valid prefix leaves a superset of remaining words.
 *
 * @param {number[][]} tokens
 * @param {"first"|"last"} side
 * @returns {number}
 */
function minimalDigitRuns(tokens, side) {
  let runs = 0;
  let symbols = new Set();
  for (const word of tokens) {
    if (word.length === 1) continue;
    const glyph = side === "first" ? word[0] : word[word.length - 1];
    if (symbols.size === 28 && !symbols.has(glyph)) {
      runs++;
      symbols = new Set();
    }
    symbols.add(glyph);
  }
  if (symbols.size) runs++;
  return runs;
}
offset = 0;
const minimumRunsPerChapter = chapterWordCounts.map(count => {
  const part = words.slice(offset, offset + count);
  offset += count;
  return {
    bigEndian: minimalDigitRuns(part, "first"),
    littleEndian: minimalDigitRuns(part, "last")
  };
});
assert.deepEqual(minimumRunsPerChapter.map(x => x.bigEndian),
  [2, 3, 4, 4, 2, 3, 3, 5, 1]);
assert.deepEqual(minimumRunsPerChapter.map(x => x.littleEndian),
  [2, 3, 4, 4, 3, 3, 4, 7, 1]);
const requiredBigEndianRuns = minimumRunsPerChapter.reduce(
  (sum, x) => sum + x.bigEndian, 0);
const requiredLittleEndianRuns = minimumRunsPerChapter.reduce(
  (sum, x) => sum + x.littleEndian, 0);
assert.equal(requiredBigEndianRuns, 27);
assert.equal(requiredLittleEndianRuns, 31);
const ink = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const pageStarts = new Map();
let pageRuneOffset = 0;
for (const page of corpus.pages.slice(0, 56)) {
  pageStarts.set(page.page, pageRuneOffset);
  pageRuneOffset += page.indices.length;
}
assert.equal(pageRuneOffset, original.length);
const everyMark = [];
const thirteenMark = [];
for (const page of ink.pages) {
  if (page.page > 55) continue;
  for (const [local, dotCount] of page.large_punctuation || []) {
    const absolute = pageStarts.get(page.page) + local;
    everyMark.push(absolute);
    if (dotCount === 13) thirteenMark.push(absolute);
  }
}
const orderedUnique = xs => [...new Set(xs)].sort((a, b) => a - b);
const everyMarkUnique = orderedUnique(everyMark);
const thirteenMarkUnique = orderedUnique(thirteenMark);
assert.equal(everyMarkUnique.length, 29);
assert.equal(thirteenMarkUnique.length, 26);
let wordRuneOffset = 0;
const positionedWords = words.map(word => {
  const result = {start: wordRuneOffset, end: wordRuneOffset + word.length,
    word};
  wordRuneOffset = result.end;
  return result;
});
assert.equal(wordRuneOffset, original.length);
for (const marker of everyMarkUnique) {
  assert.equal(positionedWords.some(w => w.start < marker && marker < w.end),
    false, "Large original punctuation must delimit, never split, a word");
}
/**
 * Every mark can rekey a word-numeral digit alphabet; test the longest
 * original ranges where a constant alphabet has no printed reset.
 *
 * @param {number[]} markers
 */
function punctuationResetEvidence(markers) {
  const cuts = [0, ...markers.filter(i => i > 0 && i < original.length),
    original.length];
  const bad = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const section = positionedWords.filter(w => w.word.length >= 2 &&
      w.start >= cuts[i] && w.end <= cuts[i + 1]);
    const a = new Array(29).fill(0);
    const b = new Array(29).fill(0);
    for (const entry of section) {
      a[entry.word[0]]++;
      b[entry.word[entry.word.length - 1]]++;
    }
    if (Math.min(...a) > 0 || Math.min(...b) > 0) {
      bad.push({interval: i + 1, runeStart: cuts[i],
        runeEnd: cuts[i + 1], multiRuneWords: section.length,
        forwardImpossible: Math.min(...a) > 0,
        reverseImpossible: Math.min(...b) > 0});
    }
  }
  return {uniqueMarks: markers.length, intervals: cuts.length - 1,
    intervalsWithImpossibleForwardOrReverse: bad};
}
const punctuationResetFindings = {
  thirteenDotOnly: punctuationResetEvidence(thirteenMarkUnique),
  allLargeDots: punctuationResetEvidence(everyMarkUnique)
};
assert.equal(punctuationResetFindings.thirteenDotOnly
  .intervalsWithImpossibleForwardOrReverse.length, 8);
assert.equal(punctuationResetFindings.allLargeDots
  .intervalsWithImpossibleForwardOrReverse.length, 10);
assert.equal(punctuationResetFindings.allLargeDots
  .intervalsWithImpossibleForwardOrReverse.filter(x =>
    x.forwardImpossible && x.reverseImpossible).length, 9);
console.log(JSON.stringify({
  classification: "conditional exact impossible, no plaintext",
  source: {runes: original.length, printedWords: words.length,
    wordsWithAtLeastTwoRunes: longWords.length},
  leadingDigitCounts: freq(initial),
  trailingDigitCounts: freq(terminal),
  leadingRange: [Math.min(...initial), Math.max(...initial)],
  trailingRange: [Math.min(...terminal), Math.max(...terminal)],
  zeroEligibleSymbolCountForAnyStationaryUnknownBijection: 0,
  chapterEndpointCounts,
  independentlyForcedContradictoryChapters: 8,
  minimumRunsPerChapter,
  punctuationResetFindings,
  minimumStationaryDigitAlphabetRunsWithChapterResets: {
    bigEndian: requiredBigEndianRuns,
    littleEndian: requiredLittleEndianRuns
  },
  statement: "Eight of nine original visual chapters individually contain all 29 rune identities at both multi-digit endpoints. Even allowing an independent secret rune-to-digit alphabet for each chapter fails for those eight chapters, in both directions."
}, null, 2));
