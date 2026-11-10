"use strict";

/**
 * Classify the 86 repeated adjacent GP runes in the 55 unsolved rune-bearing
 * LP2 transcription segments by the separators between the two occurrences.
 *
 * Run from repository root:
 *   node sims/lp2_doublet_boundary_audit.cjs
 *
 * This distinguishes true same-word/same-line visual adjacencies from pairs
 * that are adjacent only after word and/or line separators are stripped.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const RUNIC = /[\u16A0-\u16FF]/u;
const WORD_DELIMITER = /[-.&$§]/u;
const LINE_DELIMITER = /[\/\r\n]/u;

function corpusPageForTranscriptionSegment(segmentIndex) {
  // The numerical-only physical LP2 page 50 has no rune transcription.
  return segmentIndex < 50 ? segmentIndex : segmentIndex + 1;
}

function main() {
  const raw = read("resources/lp2-transcription.txt");
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
  const segments = raw.split("%").slice(0, 55);

  const counts = {
    sameWordSameLine: 0,
    sameWordCrossLine: 0,
    crossWordSameLine: 0,
    crossWordCrossLine: 0,
    otherBoundary: 0
  };
  const doublets = [];
  const byPage = {};

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
    const pageNumber = corpusPageForTranscriptionSegment(segmentIndex);
    const page = corpus.pages.find((entry) => entry.page === pageNumber);
    assert.ok(page, "missing corpus page " + pageNumber);

    const segment = segments[segmentIndex];
    const rawRunes = [...segment].filter((character) => RUNIC.test(character));
    const encoded = rawRunes.map((rune) => {
      assert.ok(runeIndex.has(rune), "rune absent from GP29 alphabet: " + rune);
      return runeIndex.get(rune);
    });
    assert.deepEqual(encoded, page.indices,
      "transcription/corpus mismatch on page " + pageNumber);

    let previousRune = null;
    let previousRuneIndex = -1;
    let currentRuneIndex = 0;
    let between = "";

    for (const character of segment) {
      if (RUNIC.test(character)) {
        if (previousRune === character) {
          const hasWordDelimiter = WORD_DELIMITER.test(between);
          const hasLineDelimiter = LINE_DELIMITER.test(between);
          let category = "otherBoundary";
          if (hasWordDelimiter && hasLineDelimiter)
            category = "crossWordCrossLine";
          else if (hasWordDelimiter)
            category = "crossWordSameLine";
          else if (hasLineDelimiter)
            category = "sameWordCrossLine";
          else
            category = "sameWordSameLine";

          counts[category]++;
          byPage[pageNumber] ??= {};
          byPage[pageNumber][category] =
            (byPage[pageNumber][category] || 0) + 1;
          doublets.push({
            page: pageNumber,
            previousRuneIndex,
            rune: character,
            transliteration: corpus.translit[runeIndex.get(character)],
            delimiterBetween: between,
            category
          });
        }
        previousRune = character;
        previousRuneIndex = currentRuneIndex;
        currentRuneIndex++;
        between = "";
      } else if (previousRune !== null) {
        between += character;
      }
    }
  }

  const total = doublets.length;
  assert.equal(total, 86, "expected the established 86 within-page doublets");
  assert.deepEqual(counts, {
    sameWordSameLine: 60,
    sameWordCrossLine: 3,
    crossWordSameLine: 22,
    crossWordCrossLine: 1,
    otherBoundary: 0
  });

  console.log(JSON.stringify({
    transcriptionSegments: segments.length,
    corpusPageMapping: "segment 0-49 -> corpus page 0-49; segment 50-54 -> corpus page 51-55; page 50 is numeric-only",
    totalWithinPageDoublets: total,
    counts,
    physicallyAdjacentSameWordSameLine: counts.sameWordSameLine,
    notPhysicallyAdjacentAfterSeparatorStripping:
      total - counts.sameWordSameLine,
    byPage,
    doublets
  }, null, 2));
}

if (require.main === module) main();

module.exports = { corpusPageForTranscriptionSegment };
