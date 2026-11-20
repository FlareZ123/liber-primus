"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
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

// Match the repository's canonical transcription convention: punctuation closes
// a word; the page marker closes any final word and skips runeless numeric p50.
function parseWords() {
  const runeSet = new Set(corpus.runes);
  const words = [];
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let values = [];
  function close() {
    if (values.length) {
      words.push({
        startPage,
        startOffset,
        endPage: page,
        endOffset: pageOffset - 1,
        values: values.slice()
      });
    }
    startPage = null;
    startOffset = null;
    values = [];
  }
  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (!values.length) {
        startPage = page;
        startOffset = pageOffset;
      }
      values.push(corpus.runes.indexOf(ch));
      pageOffset++;
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
      close();
    } else if (ch === "%") {
      close();
      block++;
      page = block < 50 ? block : block + 1;
      pageOffset = 0;
    }
  }
  close();
  return words;
}
const words = parseWords();

function score(segments) {
  return model.scoreChapters(segments).mean;
}
function spell(indices) {
  return model.spell(indices);
}
function analyze({ page, offset, name, target, cipherAnchor, expectedKey, expectedH }) {
  const source = corpus.pages.find(item => item.page === page).indices;
  const pageWords = words.filter(word => word.startPage === page && word.endPage === page);
  const anchor = pageWords.find(word => word.startOffset === offset);
  assert(anchor, "selected anchor must be a canonical page-local word");
  assert.equal(anchor.values.length, 4, "anchor must be four runes");
  assert.deepEqual(anchor.values, cipherAnchor);
  assert.equal(pageWords.reduce((sum, word) => sum + word.values.length, 0), source.length);

  const key = Array.from({ length: 4 }, (_, i) => mod(source[offset + i] - target[i], 29));
  assert.deepEqual(key, expectedKey);
  const hShell = [
    mod(key[0] - key[3], 29),
    mod(key[1] - key[2], 29),
    mod(key[1] + key[2], 29),
    mod(key[0] + key[3], 29)
  ];
  assert.deepEqual(hShell, expectedH);

  // Model A: a four-symbol additive key repeats from the physical page start.
  // Rotate the locally recovered anchor key so its phase at the anchor is offset%4.
  const pageKey = Array.from({ length: 4 }, (_, phase) => key[mod(phase - (offset % 4), 4)]);
  const pageDecoded = source.map((value, i) => mod(value - pageKey[i % 4], 29));
  const pageSegments = [pageDecoded.slice(0, offset), pageDecoded.slice(offset + 4)];
  const rawSegments = [source.slice(0, offset), source.slice(offset + 4)];

  // Model B: the same page-specific key restarts at every printed word.
  const anchorWordIndex = pageWords.indexOf(anchor);
  const decodedWords = pageWords.map(word =>
    word.values.map((value, i) => mod(value - key[i % 4], 29))
  );
  const wordSegments = [
    decodedWords.slice(0, anchorWordIndex).flat(),
    decodedWords.slice(anchorWordIndex + 1).flat()
  ];

  const pageNonAnchor = [...pageSegments[0], ...pageSegments[1]];
  const wordNonAnchor = [...wordSegments[0], ...wordSegments[1]];
  return {
    page,
    sourceRunes: source.length,
    pageWords: pageWords.length,
    anchor: name,
    anchorOffset: offset,
    anchorCipher: cipherAnchor,
    anchorPlain: target,
    localKey: key,
    hShell,
    pageStartKey: pageKey,
    rawNonAnchorScore: score(rawSegments),
    pageResetScore: score(pageSegments),
    pageResetIoC: ioc(pageNonAnchor),
    wordResetScore: score(wordSegments),
    wordResetIoC: ioc(wordNonAnchor),
    pageResetExcerpt: spell(pageDecoded).slice(0, 112),
    wordResetFirstWords: decodedWords.slice(0, 18).map(spell),
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
    expectedH: [23, 8, 2, 27]
  }),
  analyze({
    page: 40,
    offset: 71,
    name: "PATHS (2016 signed-message ordinal 40)",
    target: [13, 24, 2, 15],
    cipherAnchor: [4, 15, 14, 21],
    expectedKey: [20, 20, 12, 6],
    expectedH: [14, 8, 3, 26]
  })
];

const expected = [
  { pageResetScore: -3.399071858142244, wordResetScore: -3.4250521427746596 },
  { pageResetScore: -3.420879915638835, wordResetScore: -3.4182428972487475 }
];
for (let i = 0; i < results.length; i++) {
  assert(Math.abs(results[i].pageResetScore - expected[i].pageResetScore) < 1e-12);
  assert(Math.abs(results[i].wordResetScore - expected[i].wordResetScore) < 1e-12);
  assert.deepEqual(results[i].anchorDecodedPageReset, results[i].anchorPlain);
  assert.deepEqual(results[i].anchorDecodedWordReset, results[i].anchorPlain);
}

console.log(JSON.stringify({
  trainingRunes: model.trainingLength,
  trainingScore: model.trainingScore,
  p57PositiveControlScore: model.p57Score,
  uniform29IoC: 1 / 29,
  results
}, null, 2));
