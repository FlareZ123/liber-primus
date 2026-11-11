"use strict";

// Source-constrained forest-block count and 45x18 selector gate.
// This tests one direct reading of the authenticated 2013/2016 clues;
// it does not claim that this is the intended transformation.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const readBuffer = (relative) => fs.readFileSync(path.join(root, relative));
const RUNIC = /[\u16A0-\u16FF]/u;
const countRunes = (text) => (text.match(/[\u16A0-\u16FF]/gu) || []).length;

function jpegDimensions(buffer) {
  let offset = 2;
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }
    while (buffer[offset] === 0xff) offset++;
    const marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = buffer.readUInt16BE(offset);
    if (sof.has(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5)
      };
    }
    offset += length;
  }
  throw new Error("JPEG SOF marker not found");
}

const transcript = read("resources/liber-primus/lp2-transcription.txt");
const segments = transcript.split("%");
assert.equal(segments.length, 57, "expected 57 rune-bearing transcript segments");

const targetSegments = segments.slice(40, 55);
assert.equal(targetSegments.length, 15);

function rawFragmentsForPage(page) {
  return page.split(/[-\s]+/u)
    .filter((token) => RUNIC.test(token))
    .map((token) => (token.match(/[\u16A0-\u16FF]+/gu) || []).join(""));
}
const fragments = targetSegments.flatMap(rawFragmentsForPage);
const runes = targetSegments.reduce((n, page) => n + countRunes(page), 0);

const parsed = parseLP2Words(transcript, 55);
const logicalWords = parsed.words.filter((word) =>
  word.startPage >= 40 && word.startPage <= 54
);
const pageLocalFragments = targetSegments.reduce((n, page) =>
  n + page.replace(/\/\s*/gu, "").split(/[\s.%$&§-]+/u)
    .filter((word) => /^[\u16A0-\u16FF]+$/u.test(word)).length, 0);

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
assert.equal(corpus.runes.length, 29);
const numericPage = corpus.pages.find((page) => page.page === 50);
assert.ok(numericPage);
assert.equal(numericPage.runic_count, 0, "LP2 p50 is numeric-only in the rune corpus");

const physicalPages = Array.from({length: 15}, (_, i) => physicalLP2Page(40 + i));
const archiveJpegs = physicalPages.map((page) => page + 17);
assert.deepEqual(
  physicalPages,
  Array.from({length: 10}, (_, i) => 40 + i).concat(
    Array.from({length: 5}, (_, i) => 51 + i)
  )
);
assert.deepEqual(
  archiveJpegs,
  Array.from({length: 10}, (_, i) => 57 + i).concat(
    Array.from({length: 5}, (_, i) => 68 + i)
  )
);
const physicalBlock = Array.from({length: 16}, (_, i) => 40 + i);
const archiveBlock = Array.from({length: 16}, (_, i) => 57 + i);

const forestClue = read("resources/historical/cicada2013-forest-clue.asc");
assert.ok(forestClue.includes("You can't see the forest when you're looking at the trees."));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const bodyStart = signed2016.indexOf("Hello.");
const bodyEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(bodyStart >= 0 && bodyEnd > bodyStart);
const messageBody = signed2016.slice(bodyStart, bodyEnd);
const rawMessageTokens = messageBody.trim().split(/\s+/u);
const messageTokens = rawMessageTokens.map((token) =>
  token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
);
const naturalWords = messageBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(rawMessageTokens.length, 45);
assert.equal(naturalWords.length, 43);

const image = jpegDimensions(readBuffer("resources/historical/cicada2016-4gq25.jpg"));
assert.deepEqual(image, {width: 563, height: 569});
const heightMod29 = image.height % corpus.runes.length;
assert.equal(heightMod29, 18);

assert.equal(runes, 3316);
assert.equal(runes, 3301 + 15);
assert.equal(logicalWords.length, 735);
assert.equal(pageLocalFragments, 747);
assert.equal(fragments.length, 810);
assert.equal(fragments.length, rawMessageTokens.length * heightMod29);

const windows = [];
for (let start = 0; start + 15 <= segments.length; start++) {
  const pageWindow = segments.slice(start, start + 15);
  windows.push({
    start,
    end: start + 14,
    runes: pageWindow.reduce((n, page) => n + countRunes(page), 0),
    rawFragments: pageWindow.reduce((n, page) => n + rawFragmentsForPage(page).length, 0)
  });
}
const matchingWindows = windows.filter((window) =>
  window.runes === 3316 && window.rawFragments === 810
);
assert.deepEqual(matchingWindows, [{start: 40, end: 54, runes: 3316, rawFragments: 810}]);

const alphabet = corpus.translit.map((token, index) => ({
  token: token.toLowerCase(),
  index
})).sort((a, b) => b.token.length - a.token.length);

function gpPrimeSum(word) {
  const normalized = word.toLowerCase().replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
    const hit = alphabet.find(({token}) => normalized.startsWith(token, offset));
    assert.ok(hit, "unmapped token: " + word + " at " + normalized.slice(offset));
    sum += corpus.prime[hit.index];
    offset += hit.token.length;
  }
  return sum;
}

function selectorValue(token) {
  if (/^\d+$/u.test(token)) return Number(token);
  if (/^[0-9a-f]+$/iu.test(token) && /\d/u.test(token)) return Number.parseInt(token, 16);
  return gpPrimeSum(token);
}

const values = messageTokens.map(selectorValue);
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}
function toLatin(fragment) {
  return [...fragment].map((rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.ok(index >= 0, "unknown rune " + rune);
    return corpus.translit[index];
  }).join("");
}

const layouts = [
  {
    name: "contiguous-18-per-token",
    index: (tokenIndex, row) => tokenIndex * 18 + row
  },
  {
    name: "row-major-18x45-columns",
    index: (tokenIndex, row) => row * 45 + tokenIndex
  }
];
const selectorTests = [];
for (const layout of layouts) {
  for (const indexBase of [0, 1]) {
    const selected = messageTokens.map((token, tokenIndex) => {
      const row = mod(values[tokenIndex] - indexBase, 18);
      const fragmentIndex = layout.index(tokenIndex, row);
      return {
        token,
        value: values[tokenIndex],
        slot: row + indexBase,
        selected: toLatin(fragments[fragmentIndex])
      };
    });
    selectorTests.push({
      layout: layout.name,
      indexBase,
      output: selected.map((item) => item.selected).join(" "),
      selected
    });
  }
}

console.log(JSON.stringify({
  historical: {
    forestCluePresent: true,
    signed2016WhitespaceTokens: rawMessageTokens.length,
    signed2016NaturalWords: naturalWords.length,
    image,
    imageHeightMod29: heightMod29
  },
  pageSelection: {
    physicalPages: physicalBlock,
    archiveJpegs: archiveBlock,
    runeBearingPhysicalPages: physicalPages,
    runeBearingArchiveJpegs: archiveJpegs,
    numericOnlyPhysicalPage: 50,
    numericOnlyArchiveJpeg: 67
  },
  counts: {
    runes,
    logicalWords: logicalWords.length,
    slashNormalizedPageFragments: pageLocalFragments,
    rawWhitespaceHyphenFragments: fragments.length,
    runeEquation: "3316 = 3301 + 15",
    fragmentEquation: "810 = 45 * 18"
  },
  unique15PageWindows: matchingWindows,
  directMod18Selectors: selectorTests
}, null, 2));
