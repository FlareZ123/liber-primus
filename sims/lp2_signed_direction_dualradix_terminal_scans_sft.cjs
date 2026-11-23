"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const firstPartyHtml = read("resources/cicada2014-onion7-index.html");
const firstPartyPageNames = Array.from(firstPartyHtml.matchAll(/<img src="(\d+)\.jpg"/g),
  (match) => Number(match[1]));
assert.deepEqual(firstPartyPageNames, [...Array(58).keys()]);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const tape = grid.pages.flatMap((p) => p.tokens.flat());
const gp = corpus.translit
  .map((symbol, index) => ({ symbol, index }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

assert.equal(corpus.pages.length, 58);
assert.equal(tape.length, 256);
assert.equal(alpha60.length, 60);
assert.equal(alpha59.length, 59);
assert.equal(corpus.translit[27], "IA");
assert.equal(corpus.translit[21], "NG");

const signedText = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"),
).replace(/\b7A35090F\b/g, "");
const words = signedText.match(/[A-Za-z]+/g).map((w) => w.toUpperCase());
assert.equal(words.length, 43);
assert.equal(words[29], "DIRECTION");

/**
 * Two 2014-compatible ways to spell English in native GP29.
 * In the second, the historically printed IA/IO and NG/ING rune names
 * can each be a single rune. Other digraphs use the same longest match.
 * @param {string} word
 * @param {boolean} ligatures
 * @returns {number}
 */
function gp0(word, ligatures) {
  const latin = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let sum = 0;
  for (let pos = 0; pos < latin.length;) {
    if (ligatures && latin.startsWith("ING", pos)) {
      sum += 21;
      pos += 3;
      continue;
    }
    if (ligatures && latin.startsWith("IO", pos)) {
      sum += 27;
      pos += 2;
      continue;
    }
    const found = gp.find((item) => latin.startsWith(item.symbol, pos));
    assert.ok(found, "Unmapped GP29 source word " + word + " at " + pos);
    sum += found.index;
    pos += found.symbol.length;
  }
  return sum;
}

/**
 * @param {number} index
 * @param {string} alphabet
 * @returns {number|null}
 */
function cell(index, alphabet) {
  if (index >= 256) return null;
  const token = tape[index];
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "Invalid table digit " + token);
  return hi * alphabet.length + lo;
}

const register = words.map((word, ordinal) => {
  const literalIndex = gp0(word, false);
  const ligatedIndex = gp0(word, true);
  return {
    ordinal: ordinal + 1,
    word,
    literalIndex,
    ligatedIndex,
    literalBase59: cell(literalIndex, alpha59),
    literalBase60: cell(literalIndex, alpha60),
    ligatedBase59: cell(ligatedIndex, alpha59),
    ligatedBase60: cell(ligatedIndex, alpha60),
  };
});

const changed = register.filter((entry) => entry.literalIndex !== entry.ligatedIndex);
assert.deepEqual(changed.map((entry) => entry.word), ["MEANING", "DIRECTION"]);
const convergent = changed.filter((entry) =>
  entry.literalBase60 === entry.ligatedBase59);
assert.deepEqual(convergent.map((entry) => entry.word), ["DIRECTION"]);

const direction = register[29];
assert.deepEqual(
  [
    direction.literalIndex,
    direction.ligatedIndex,
    tape[direction.literalIndex],
    tape[direction.ligatedIndex],
    direction.literalBase59,
    direction.literalBase60,
    direction.ligatedBase59,
    direction.ligatedBase60,
  ],
  [98, 112, "1C", "1D", 71, 72, 72, 73],
);

assert.deepEqual(
  [71, 72, 73].map((scan) => ({
    scan,
    laterArchivePhysicalPage: scan - 17,
    runes: corpus.pages[scan - 17].runic_count,
    original2014FilenameExists: firstPartyPageNames.includes(scan),
    hypotheticalModulo58PhysicalPage: scan % 58,
  })),
  [
    { scan: 71, laterArchivePhysicalPage: 54, runes: 232, original2014FilenameExists: false, hypotheticalModulo58PhysicalPage: 13 },
    { scan: 72, laterArchivePhysicalPage: 55, runes: 76, original2014FilenameExists: false, hypotheticalModulo58PhysicalPage: 14 },
    { scan: 73, laterArchivePhysicalPage: 56, runes: 85, original2014FilenameExists: false, hypotheticalModulo58PhysicalPage: 15 },
  ],
);

// Source-valid alternative: cyclic page labels in the genuine 2014 0..57 index.
// Both GP spellings of DIRECTION pick chapter starts; one-based origin moves to
// the corresponding previous chapter-ending page. This is a conditional
// navigation grammar, not a demonstrated authorial cipher.
const chapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const chapterEndToNextStart = [39, 40, 53, 54];
const pageResidues = [
  direction.literalIndex % firstPartyPageNames.length,
  direction.ligatedIndex % firstPartyPageNames.length,
];
assert.deepEqual(pageResidues, [40, 54]);
assert.deepEqual(chapterEndToNextStart, [39, 40, 53, 54]);
for (const page of pageResidues) assert.ok(chapterStarts.includes(page));
assert.deepEqual(pageResidues.map((n) => n - 1), [39, 53]);
assert.deepEqual([corpus.pages[40].page, corpus.pages[54].page], [40, 54]);
assert.deepEqual(
  [40, 54].map((page) => ink.pages.find((entry) => entry.page === page).red_spans[0].length),
  [8, 9],
);
const changedWordsOnTwoChapterStarts = changed.filter((entry) =>
  chapterStarts.includes(entry.literalIndex % 58) &&
  chapterStarts.includes(entry.ligatedIndex % 58));
assert.deepEqual(changedWordsOnTwoChapterStarts.map((entry) => entry.word),
  ["DIRECTION"]);
const separated14ChapterStartPairs = chapterStarts.filter((page) =>
  chapterStarts.includes((page + 14) % 58));
assert.deepEqual(separated14ChapterStartPairs, [40]);

// Exact same-source token-order null census. Hold the 256 genuine printed
// tokens and both alphabet conventions fixed; vary only the ordered addresses.
/** @typedef {{first:number, second:number, source:string[], scan:number}} Match */
/** @type {Match[]} */
const offset14Matches = [];
let allOrderedCrossRadixMatches = 0;
let laterArchiveRangeCrossRadixMatches = 0;
let original2014PageMatches = 0;
let exact72CrossRadixMatches = 0;
for (let first = 0; first < tape.length; first++) {
  for (let second = 0; second < tape.length; second++) {
    if (first === second) continue;
    const scan = cell(first, alpha60);
    if (scan !== cell(second, alpha59)) continue;
    allOrderedCrossRadixMatches++;
    if (scan >= 17 && scan <= 74) laterArchiveRangeCrossRadixMatches++;
    if (firstPartyPageNames.includes(scan)) original2014PageMatches++;
    if (scan === 72) exact72CrossRadixMatches++;
    if (second - first === 14) {
      offset14Matches.push({
        first,
        second,
        source: [tape[first], tape[second]],
        scan,
      });
    }
  }
}
assert.deepEqual(offset14Matches, [
  { first: 98, second: 112, source: ["1C", "1D"], scan: 72 },
  { first: 135, second: 149, source: ["2p", "2s"], scan: 171 },
]);
assert.equal(allOrderedCrossRadixMatches, 249);
assert.equal(laterArchiveRangeCrossRadixMatches, 56);
assert.equal(original2014PageMatches, 40);
assert.equal(exact72CrossRadixMatches, 8);
assert.equal(tape.length * (tape.length - 1), 65280);

const namedFollowers = ["PATH", "DEVOTED", "WAY", "MAP", "ROAD", "DIRECTION"];
assert.deepEqual(
  namedFollowers.map((word) => gp0(word, false)),
  [39, 102, 57, 56, 54, 98],
);
assert.equal(tape[102], "0W");
assert.equal(cell(102, alpha60), 32);
assert.equal(cell(102, alpha59), 32);
assert.equal(corpus.pages[32].runic_count, 121);
assert.equal(gp0("EPIPHANY", false), 121);

console.log(JSON.stringify({
  status: "PASS",
  tokenOrderNullCensus: {
    orderedDistinctCellPairs: 65280,
    base60LiteralEqualsBase59Ligated: allOrderedCrossRadixMatches,
    landingInLaterMergedArchive17To74: laterArchiveRangeCrossRadixMatches,
    landingOnLaterArchive72: exact72CrossRadixMatches,
    landingInActual2014Pages0To57: original2014PageMatches,
    offset14Matches,
    conditionalLaterArchiveRangeRate: laterArchiveRangeCrossRadixMatches / 65280,
    conditionalLaterArchive72Rate: exact72CrossRadixMatches / 65280,
  },
  conditionalContemporaneousModulo58Route: {
    authorPublishedPageCount: firstPartyPageNames.length,
    signedWord: "DIRECTION",
    gpLiteral98ToPage40: pageResidues[0],
    gpLigated112ToPage54: pageResidues[1],
    zeroBasedSelectedChapterStarts: [40, 54],
    oneBasedSelectedPreviousChapterEnds: [39, 53],
    uniqueSignedChangedWordAtTwoVisualChapterStarts: changedWordsOnTwoChapterStarts.map((w) => w.word),
    uniqueFourteenSeparatedChapterStart: separated14ChapterStartPairs,
    alreadySignedFollowerRoadGp0: gp0("ROAD", false),
    inferenceLimit: "Modulo-58 is hypothetical; no original cipher operation or plaintext",
  },
  originalSignedWords: register.length,
  distinctWords: new Set(words).size,
  wordsAffectedByHistoricalLigature: changed,
  uniqueCrossRadixCrossSpellingConvergence: convergent,
  direction: {
    ordinal: direction.ordinal,
    direct: direction.literalIndex,
    phoneticIoToIa: direction.ligatedIndex,
    originalTokens: ["1C", "1D"],
    numericTableOutputs: { literalBase59: 71, literalBase60: 72,
      ligatedBase59: 72, ligatedBase60: 73 },
    firstParty2014ValidFilenameOutputs: [],
    laterMergedArchivePageOutputs: [54, 55, 55, 56],
    conditionalModulo58PageOutputs: [13, 14, 14, 15],
  },
  independentSignedDevoted: {
    gp0: 102,
    tableToken: "0W",
    decodedPhysicalPage: 32,
    pageRunes: 121,
    epiphanyGp0: 121,
  },
  inferenceLimit: "No 2014 page selector: all four outputs exceed source HTML last page 57. Later 17-page archive offset is unauthorized; neither plaintext nor cipher found.",
}, null, 2));
