"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/**
 * Canonical outside-in H serialization used by the local inverse reports:
 * differences outside-in, odd center literal, then sums inside-out.
 * @param {number[]} values
 * @returns {number[]}
 */
function H(values) {
  const differences = [];
  const sums = [];
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    differences.push(mod29(values[left] - values[right]));
    sums.push(mod29(values[left] + values[right]));
    left += 1;
    right -= 1;
  }
  return [
    ...differences,
    ...(left === right ? [values[left]] : []),
    ...sums.reverse(),
  ];
}

const parts = transcription.split(/^\s*%\s*$/m);
const unknownSegments = parts.slice(0, 55);
const canonicalPages = unknownSegments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));

let currentWord = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushCanonicalWord() {
  if (!currentWord.length) return;
  if (startSegment === endSegment) {
    const page = canonicalPages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      end: startOffset + currentWord.length - 1,
      values: currentWord.slice(),
    });
  }
  currentWord = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!currentWord.length) {
        startSegment = segment;
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Printed line/page wraps can continue a word.
    } else {
      flushCanonicalWord();
    }
  }
}
flushCanonicalWord();

const canonicalWords = canonicalPages.flatMap((page) =>
  page.words.map((word) => ({page: page.page, ...word}))
);
const wordsByPage = new Map(
  canonicalPages.map((page) => [page.page, page.words])
);
const pageWords = (page) => wordsByPage.get(page) || [];

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({
    index,
    ordinal: index + 1,
    word: word.toUpperCase(),
    values: gp(word),
  }));
assert.equal(source.length, 43);


// Census of all keys induced by a source-target training hit.
const targets = [...new Map(source.filter(row => row.values.length === 3)
  .map(row => [row.values.join(","), row.values])).values()];
const words = canonicalWords.filter(word => word.values.length === 3);
assert.equal(targets.length, 7);
assert.equal(words.length, 716);

/** @type {Map<string, {page: number, ordinal: number, target: string}[]>} */
const induced = new Map();
for (const word of words) {
  for (const target of targets) {
    const key = word.values.map((value, i) => mod29(value - target[i])).join(",");
    if (!induced.has(key)) induced.set(key, []);
    induced.get(key).push({
      page: word.page,
      ordinal: word.ordinal,
      target: target.join(","),
    });
  }
}
const histogram = [29 ** 3 - induced.size, 0, 0, 0, 0, 0];
let crossPage = 0;
let pagePlusTwo = 0;
for (const hits of induced.values()) {
  histogram[hits.length] += 1;
  for (const hit of hits) {
    if (hits.some(other => other.page !== hit.page)) crossPage += 1;
    if (hits.some(other => other.page === hit.page + 2)) pagePlusTwo += 1;
  }
}
// A narrower descriptive family retains ordered adjacent three-rune source words.
const adjacentTargets = source.filter((row, i) =>
  i + 1 < source.length && row.values.length === 3 &&
  source[i + 1].values.length === 3
);
assert.deepEqual(adjacentTargets.map(row => [row.word, source[row.index + 1].word]),
  [["WAY", "ITS"], ["AND", "YOU"]]);
const adjacentHits = [];
for (const [key, hits] of induced) {
  for (const first of hits) {
    for (const second of hits) {
      if (second.page === first.page + 2 && adjacentTargets.some(row =>
        first.target === row.values.join(",") &&
        second.target === source[row.index + 1].values.join(",")
      )) adjacentHits.push({key, first, second});
    }
  }
}
assert.equal(adjacentHits.length, 1);
assert.equal(adjacentHits[0].key, "17,14,7");
const selected = induced.get("17,14,7");
assert.deepEqual(selected, [
  {page: 31, ordinal: 32, target: gp("AND").join(",")},
  {page: 33, ordinal: 29, target: gp("YOU").join(",")},
]);
assert.deepEqual(histogram, [19847, 4111, 396, 31, 4, 0]);
assert.equal(crossPage, 889);
assert.equal(pagePlusTwo, 27);
console.log(JSON.stringify({
  targets: targets.length,
  words: words.length,
  trainingConfigurations: words.length * targets.length,
  keyHitHistogram: histogram,
  selected,
  adjacentSourceTargetPairs: adjacentTargets.map(row => [row.word, source[row.index + 1].word]),
  adjacentPagePlusTwoHits: adjacentHits.length,
  crossPageTrainingConfigurations: crossPage,
  pagePlusTwoTrainingConfigurations: pagePlusTwo,
}, null, 2));

// Independently add a uniform 3-vector to every three-rune word on each page.
// Page+2 edges form a forest, so their relative offsets are independent.
let logNoHit = 0;
let comparisons = 0;
let edgeCount = 0;
for (let page = 0; page <= 53; page += 1) {
  const firstPage = words.filter(word => word.page === page);
  const secondPage = words.filter(word => word.page === page + 2);
  if (!firstPage.length || !secondPage.length) continue;
  const offsets = new Set();
  for (const first of firstPage) {
    for (const second of secondPage) {
      for (const row of adjacentTargets) {
        const following = source[row.index + 1];
        const delta = first.values.map((value, i) =>
          mod29((value - row.values[i]) -
            (second.values[i] - following.values[i]))
        );
        offsets.add(delta.join(","));
        comparisons += 1;
      }
    }
  }
  logNoHit += Math.log1p(-offsets.size / 29 ** 3);
  edgeCount += 1;
}
const expectedHits = comparisons / 29 ** 3;
const probabilityAtLeastOne = -Math.expm1(logNoHit);
assert.equal(comparisons, 17554);
assert.equal(edgeCount, 52);
assert.ok(Math.abs(expectedHits - 0.7197507072860715) < 1e-12);
assert.ok(Math.abs(probabilityAtLeastOne - 0.5136663792417163) < 1e-12);
console.log(JSON.stringify({
  pagePairEdges: edgeCount,
  wordPairTargetComparisons: comparisons,
  observedHits: adjacentHits.length,
  expectedHits,
  probabilityAtLeastOne,
}, null, 2));

// Narrower conditional null: keep p31's AND-derived key fixed and randomize
// only p33's shared three-coordinate page offset; target is fixed as YOU.
const sourceWord = pageWords(31).find(word => word.ordinal === 32);
assert.ok(sourceWord);
const fixedKey = sourceWord.values.map((value, i) => mod29(value - gp("AND")[i]));
assert.deepEqual(fixedKey, [17, 14, 7]);
const p33Words = pageWords(33).filter(word => word.values.length === 3);
const youOffsets = new Set(p33Words.map(word =>
  word.values.map((value, i) =>
    mod29(value - gp("YOU")[i] - fixedKey[i])
  ).join(",")
));
assert.equal(p33Words.length, 12);
assert.equal(youOffsets.size, 12);
assert.ok(youOffsets.has("0,0,0"));
console.log(JSON.stringify({
  conditionalP33WordCount: p33Words.length,
  distinctSuccessfulOffsets: youOffsets.size,
  probabilityAtLeastOne: youOffsets.size / 29 ** 3,
}, null, 2));

// Earlier page-local scans flush at each page edge, creating ten incomplete
// three-rune fragments. Compare exact physical page and rune offsets.
const pageLocalTriples = [];
for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  let current = [];
  let offset = 0;
  let start = 0;
  /** Flush the current legacy page-local fragment. */
  const flush = () => {
    if (current.length === 3) pageLocalTriples.push({page, start});
    current = [];
  };
  for (const char of [...unknownSegments[segment]]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
}
const completePositions = new Set(words.map(word => word.page + ":" + word.start));
const incomplete = pageLocalTriples.filter(word =>
  !completePositions.has(word.page + ":" + word.start)
);
assert.equal(pageLocalTriples.length, 726);
assert.deepEqual(incomplete.map(word => [word.page, word.start]), [
  [1,263], [3,214], [24,0], [27,231], [29,274],
  [31,266], [35,268], [41,0], [47,0], [51,89],
]);
console.log(JSON.stringify({pageLocalTriples: pageLocalTriples.length,
  completeCanonicalTriples: words.length, pageEdgeFragments: incomplete}, null, 2));
