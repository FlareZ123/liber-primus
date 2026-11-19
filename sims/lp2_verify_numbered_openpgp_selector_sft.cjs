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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * Pair-interleaved outside-in H shell used by the numbered-route reports.
 * Each outer pair emits difference then sum; an odd center is appended last.
 * @param {number[]} values
 * @returns {number[]}
 */
function shell(values) {
  const out = [];
  let left = 0;
  let right = values.length - 1;
  while (left < right) {
    out.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right])
    );
    left += 1;
    right -= 1;
  }
  if (left === right) out.push(values[left]);
  return out;
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
let crossingWords = 0;

/** Flush one printed word under the canonical cross-page contract. */
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
  } else {
    crossingWords += 1;
  }
  currentWord = [];
}

for (let segment = 0; segment < unknownSegments.length; segment += 1) {
  for (const character of [...unknownSegments[segment]]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!currentWord.length) {
        startSegment = segment;
        startOffset = canonicalPages[segment].offset;
      }
      endSegment = segment;
      currentWord.push(value);
      canonicalPages[segment].offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed line and physical-page wraps can continue a word.
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

/** @param {number} page @returns {{ordinal:number,start:number,end:number,values:number[]}[]} */
function pageWords(page) {
  return wordsByPage.get(page) || [];
}

assert.equal(crossingWords, 32);
assert.equal(canonicalWords.length, 2864);
assert.equal(canonicalWords.length + crossingWords, 2896);

const signedStart = signed2016.indexOf("Hello.");
const signedEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(signedStart >= 0 && signedEnd > signedStart);
const source = signed2016
  .slice(signedStart, signedEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)
  .map((word, index) => ({
    index,
    ordinal: index + 1,
    word: word.toUpperCase(),
  }));
assert.equal(source.length, 43);

const verify = source[41];
assert.deepEqual(verify, {index: 41, ordinal: 42, word: "VERIFY"});

// Correct numbered route: source ordinal42 -> physical page42 -> project p41
// -> complete page-local canonical word42.
const p41 = pageWords(41);
const verifyObject = p41[41];
assert.ok(verifyObject);
assert.equal(verifyObject.ordinal, 42);
assert.equal(verifyObject.start, 178);
assert.equal(verifyObject.end, 184);
assert.deepEqual(verifyObject.values, [27, 12, 5, 0, 17, 13, 19]);

const verifyShell = shell(verifyObject.values);
assert.deepEqual(verifyShell, [8, 17, 28, 25, 17, 22, 0]);
const verifyInner = verifyShell.slice(-3);
assert.deepEqual(verifyInner, [17, 22, 0]);

// The object formerly attributed to VERIFY42 is the immediately preceding
// canonical word41. This freezes the exact off-by-one failure.
const staleObject = p41[40];
assert.ok(staleObject);
assert.equal(staleObject.ordinal, 41);
assert.equal(staleObject.start, 171);
assert.equal(staleObject.end, 177);
assert.deepEqual(staleObject.values, [0, 14, 13, 19, 3, 6, 9]);
const staleShell = shell(staleObject.values);
assert.deepEqual(staleShell, [20, 9, 8, 20, 10, 16, 19]);
const staleInner = staleShell.slice(-3);
assert.deepEqual(staleInner, [10, 16, 19]);

// VERIFY42 no longer selects the old PRIMUS/16/THEIR triple.
assert.notDeepEqual(verifyInner, staleInner);
assert.notEqual(verifyInner[0], 10);
assert.notEqual(verifyInner[1], 16);
assert.notEqual(verifyInner[2], 19);

/**
 * @param {number[]} values
 * @returns {(string|null)[]}
 */
function sourceWords0(values) {
  return values.map((value) =>
    value >= 0 && value < source.length ? source[value].word : null
  );
}

assert.deepEqual(sourceWords0(verifyInner), ["THE", "THE", "HELLO"]);
assert.deepEqual(sourceWords0(staleInner), ["PRIMUS", "WORDS", "THEIR"]);

// Exhaust the exact inner-core claims under the current canonical corpus.
let eligibleOddWords = 0;
const verifyCoreHits = [];
const staleCoreHits = [];
for (const word of canonicalWords) {
  if (word.values.length < 3 || word.values.length % 2 === 0) continue;
  eligibleOddWords += 1;
  const core = shell(word.values).slice(-3);
  if (core.every((value, index) => value === verifyInner[index])) {
    verifyCoreHits.push({
      page: word.page,
      ordinal: word.ordinal,
      start: word.start,
      length: word.values.length,
    });
  }
  if (core.every((value, index) => value === staleInner[index])) {
    staleCoreHits.push({
      page: word.page,
      ordinal: word.ordinal,
      start: word.start,
      length: word.values.length,
    });
  }
}

assert.ok(
  verifyCoreHits.some((hit) =>
    hit.page === 41 && hit.ordinal === 42 && hit.start === 178
  )
);
assert.ok(
  staleCoreHits.some((hit) =>
    hit.page === 41 && hit.ordinal === 41 && hit.start === 171
  )
);

console.log(JSON.stringify({
  status: "PASS",
  canonicalContract: {
    completePageLocalWords: canonicalWords.length,
    crossingWords,
    totalPrintedWords: canonicalWords.length + crossingWords,
  },
  verify42: {
    sourceIndex: verify.index,
    sourceOrdinal: verify.ordinal,
    projectPage: 41,
    canonicalWord: verifyObject.ordinal,
    start: verifyObject.start,
    end: verifyObject.end,
    values: verifyObject.values,
    shell: verifyShell,
    innerCore: verifyInner,
    innerCoreSourceWords0: sourceWords0(verifyInner),
  },
  staleWord41: {
    canonicalWord: staleObject.ordinal,
    start: staleObject.start,
    end: staleObject.end,
    values: staleObject.values,
    shell: staleShell,
    innerCore: staleInner,
    innerCoreSourceWords0: sourceWords0(staleInner),
  },
  controls: {
    eligibleOddWords,
    verifyCoreHits,
    staleCoreHits,
  },
  decision: "The historical [10,16,19] core belongs to p41 canonical word41, not VERIFY-selected word42. Under the canonical cross-page word contract VERIFY42 is p41 word42 at 178..184 with H core [17,22,0]. Therefore VERIFY42 does not independently select the OPENPGP stride/base60/full-state route.",
}, null, 2));
