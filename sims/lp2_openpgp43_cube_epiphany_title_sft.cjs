"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const runeToValue = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = raw.split(/^\s*%\s*$/m);

/** @param {string} text */
function physicalResetWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  function flush() {
    if (!current.length) return;
    words.push({
      ordinal: words.length + 1,
      start,
      values: current.slice(),
    });
    current = [];
  }
  for (const char of [...text]) {
    const value = runeToValue.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // line/page formatting does not end a printed word
    } else {
      flush();
    }
  }
  flush();
  return words;
}

const oldP42 = physicalResetWords(parts[42]);
assert.deepEqual(oldP42[42], {
  ordinal: 43,
  start: 203,
  values: [11, 13, 11],
});

// Canonical parser keeps printed words intact across physical page boundaries.
const segments = parts.slice(0, 55);
const pages = segments.map((text, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;

function flushCanonical() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}

for (let segment = 0; segment < segments.length; segment += 1) {
  for (const char of [...segments[segment]]) {
    const value = runeToValue.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // a printed word may continue across this boundary
    } else {
      flushCanonical();
    }
  }
}
flushCanonical();

const p42 = pages.find((page) => page.page === 42);
assert.ok(p42);

assert.deepEqual(p42.words[41], {
  ordinal: 42,
  start: 203,
  values: [11, 13, 11],
});
assert.deepEqual(p42.words[42], {
  ordinal: 43,
  start: 206,
  values: [16, 0, 14],
});

assert.notDeepEqual(p42.words[42].values, oldP42[42].values);

console.log("PASS retracted OPENPGP cube endpoint is a physical-reset ordinal artifact");
console.log(JSON.stringify({
  oldPhysicalResetWord43: oldP42[42],
  canonicalWord42: p42.words[41],
  canonicalOPENPGP43: p42.words[42],
}, null, 2));
