"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const model = buildSourceNativeTrigramModel({ corpus, referenceText });
const mod = (n, m) => ((n % m) + m) % m;

function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const value of indices) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (indices.length * (indices.length - 1));
}
const score = segments => model.scoreChapters(segments).mean;

// Use the canonical cross-page word contract from the numbered-OpenPGP SFT.
// Slash/whitespace are printed wraps and may continue a word; other non-runes
// close it. Words crossing a page boundary are not assigned to either page.
function parseCanonicalWords() {
  const parts = transcription.split(/^\s*%\s*$/m);
  const segments = parts.slice(0, 55);
  const pages = segments.map((_, segment) => ({
    page: segment >= 50 ? segment + 1 : segment,
    words: [],
    offset: 0
  }));
  const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
  let currentWord = [];
  let startSegment = 0;
  let endSegment = 0;
  let startOffset = 0;
  let crossingWords = 0;

  function flush() {
    if (!currentWord.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        ordinal: page.words.length + 1,
        start: startOffset,
        end: startOffset + currentWord.length - 1,
        values: currentWord.slice()
      });
    } else {
      crossingWords++;
    }
    currentWord = [];
  }

  for (let segment = 0; segment < segments.length; segment++) {
    for (const character of [...segments[segment]]) {
      const value = runeIndex.get(character);
      if (value !== undefined) {
        if (!currentWord.length) {
          startSegment = segment;
          startOffset = pages[segment].offset;
        }
        endSegment = segment;
        currentWord.push(value);
        pages[segment].offset++;
      } else if (character === "/" || /\s/u.test(character)) {
        // A printed line/page wrap does not necessarily end a word.
      } else {
        flush();
      }
    }
  }
  flush();
  return {
    pages,
    crossingWords,
    canonicalWordCount: pages.reduce((sum, page) => sum + page.words.length, 0)
  };
}
const parsed = parseCanonicalWords();
assert.equal(parsed.crossingWords, 32);
assert.equal(parsed.canonicalWordCount, 2864);
assert.equal(parsed.canonicalWordCount + parsed.crossingWords, 2896);

function analyze({ page, offset, name, target, cipherAnchor, expectedKey, expectedH, expectedPageWords, expectedCoverage }) {
  const source = corpus.pages.find(item => item.page === page).indices;
  const pageData = parsed.pages.find(item => item.page === page);
  const pageWords = pageData.words;
  assert.equal(pageData.offset, source.length);
  const coverageRunes = pageWords.reduce((sum, word) => sum + word.values.length, 0);
  assert.equal(pageWords.length, expectedPageWords);
  assert.equal(coverageRunes, expectedCoverage);

  const anchor = pageWords.find(word => word.start === offset);
  assert(anchor, "selected anchor must be a canonical page-local word");
  assert.equal(anchor.values.length, 4);
  assert.deepEqual(anchor.values, cipherAnchor);

  const key = Array.from({ length: 4 }, (_, i) => mod(source[offset + i] - target[i], 29));
  assert.deepEqual(key, expectedKey);
  const hShell = [
    mod(key[0] - key[3], 29),
    mod(key[1] - key[2], 29),
    mod(key[1] + key[2], 29),
    mod(key[0] + key[3], 29)
  ];
  assert.deepEqual(hShell, expectedH);

  // Model A: period-four additive key, reset at physical page start.
  const pageKey = Array.from({ length: 4 }, (_, phase) => key[mod(phase - (offset % 4), 4)]);
  const pageDecoded = source.map((value, i) => mod(value - pageKey[i % 4], 29));
  const pageSegments = [pageDecoded.slice(0, offset), pageDecoded.slice(offset + 4)];
  const rawPageSegments = [source.slice(0, offset), source.slice(offset + 4)];

  // Model B: the same key restarts at every complete printed word on the page.
  const anchorWordIndex = pageWords.indexOf(anchor);
  const decodedWords = pageWords.map(word =>
    word.values.map((value, i) => mod(value - key[i % 4], 29))
  );
  const wordSegments = [
    decodedWords.slice(0, anchorWordIndex).flat(),
    decodedWords.slice(anchorWordIndex + 1).flat()
  ];
  const rawWordSegments = [
    pageWords.slice(0, anchorWordIndex).flatMap(word => word.values),
    pageWords.slice(anchorWordIndex + 1).flatMap(word => word.values)
  ];

  const pageNonAnchor = [...pageSegments[0], ...pageSegments[1]];
  const wordNonAnchor = [...wordSegments[0], ...wordSegments[1]];
  return {
    page,
    sourceRunes: source.length,
    completePageLocalWords: pageWords.length,
    completePageLocalWordRunes: coverageRunes,
    omittedCrossPageWordRunes: source.length - coverageRunes,
    anchor: name,
    anchorPageWordOrdinal: anchor.ordinal,
    anchorOffset: offset,
    anchorCipher: cipherAnchor,
    anchorPlain: target,
    localKey: key,
    hShell,
    pageStartKey: pageKey,
    rawPageNonAnchorScore: score(rawPageSegments),
    pageResetScore: score(pageSegments),
    pageResetIoC: ioc(pageNonAnchor),
    rawCompleteWordNonAnchorScore: score(rawWordSegments),
    wordResetScore: score(wordSegments),
    wordResetIoC: ioc(wordNonAnchor),
    pageResetExcerpt: model.spell(pageDecoded).slice(0, 112),
    wordResetFirstWords: decodedWords.slice(0, 18).map(model.spell),
    anchorDecodedPageReset: pageDecoded.slice(offset, offset + 4),
    anchorDecodedWordReset: decodedWords[anchorWordIndex]
  };
}

const results = [
  analyze({
    page: 33,
    offset: 132,
    name: "WILL (2016 signed-message ordinal 33)",
    target: [7, 10, 20, 20],
    cipherAnchor: [3, 15, 17, 22],
    expectedKey: [25, 5, 26, 2],
    expectedH: [23, 8, 2, 27],
    expectedPageWords: 52,
    expectedCoverage: 213
  }),
  analyze({
    page: 40,
    offset: 71,
    name: "PATHS (2016 signed-message ordinal 40)",
    target: [13, 24, 2, 15],
    cipherAnchor: [4, 15, 14, 21],
    expectedKey: [20, 20, 12, 6],
    expectedH: [14, 8, 3, 26],
    expectedPageWords: 54,
    expectedCoverage: 229
  })
];

const expected = [
  {
    rawPageNonAnchorScore: -3.442944574208728,
    pageResetScore: -3.399071858142244,
    rawCompleteWordNonAnchorScore: -3.4433135924732268,
    wordResetScore: -3.425333880885822
  },
  {
    rawPageNonAnchorScore: -3.412189085088643,
    pageResetScore: -3.420879915638835,
    rawCompleteWordNonAnchorScore: -3.4125953588904725,
    wordResetScore: -3.418402185755652
  }
];
for (let i = 0; i < results.length; i++) {
  for (const key of Object.keys(expected[i])) {
    assert(Math.abs(results[i][key] - expected[i][key]) < 1e-12, key);
  }
  assert.deepEqual(results[i].anchorDecodedPageReset, results[i].anchorPlain);
  assert.deepEqual(results[i].anchorDecodedWordReset, results[i].anchorPlain);
}

console.log(JSON.stringify({
  trainingRunes: model.trainingLength,
  trainingScore: model.trainingScore,
  p57PositiveControlScore: model.p57Score,
  uniform29IoC: 1 / 29,
  crossingWords: parsed.crossingWords,
  canonicalWordCount: parsed.canonicalWordCount,
  results
}, null, 2));
