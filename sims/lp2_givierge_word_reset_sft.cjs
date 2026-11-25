#!/usr/bin/env node
'use strict';

// Test the standard five-singleton Givierge/straddling-checkerboard grammar
// with a parser reset at each printed word boundary on LP2 p0.
//
// The transcription supplies visible word boundaries; the canonical corpus
// supplies the numeric GP29 rune sequence. A candidate singleton set S must
// parse each word independently. Every non-singleton pair must join symbols
// in opposite row/column classes, so the global pair graph must be bipartite.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const transcription = fs.readFileSync(
  path.join(root, 'resources/transcriptions/lp2-image-corrected.txt'),
  'utf8'
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));

const runeCount = text => Array.from(text).filter(ch => {
  const cp = ch.codePointAt(0);
  return cp >= 0x16A0 && cp <= 0x16FF;
}).length;

const firstPageBlock = transcription.split('%').filter(block => block.trim())[0];
if (!firstPageBlock) throw new Error('No p0 transcription block found.');

const wordLengths = firstPageBlock
  .split('-')
  .map(runeCount)
  .filter(length => length > 0);

const p0 = corpus.pages[0].indices;
if (wordLengths.length !== 57 || wordLengths.reduce((a, b) => a + b, 0) !== 262) {
  throw new Error('Unexpected p0 word segmentation; refusing to run.');
}
if (p0.length !== 262) throw new Error('Canonical p0 rune count is not 262.');

const words = [];
let cursor = 0;
for (const length of wordLengths) {
  words.push(p0.slice(cursor, cursor + length));
  cursor += length;
}
if (cursor !== p0.length) throw new Error('Word/rune alignment failed.');

function testSingletonMask(mask) {
  const singleton = new Uint8Array(29);
  for (let i = 0; i < 29; i++) {
    if (mask & (1 << i)) singleton[i] = 1;
  }

  const parent = Int16Array.from({ length: 29 }, (_, i) => i);
  const parity = new Int8Array(29);

  function find(x) {
    if (parent[x] !== x) {
      const p = parent[x];
      const [root, parentParity] = find(p);
      parity[x] ^= parentParity;
      parent[x] = root;
    }
    return [parent[x], parity[x]];
  }

  function addOppositeEdge(a, b) {
    const [ra, pa] = find(a);
    const [rb, pb] = find(b);
    if (ra === rb) return (pa ^ pb) === 1;
    parent[ra] = rb;
    parity[ra] = pa ^ pb ^ 1;
    return true;
  }

  let pairCount = 0;
  for (const word of words) {
    // Reset the parser at each printed word boundary.
    for (let pos = 0; pos < word.length;) {
      const a = word[pos];
      if (singleton[a]) {
        pos += 1;
        continue;
      }
      if (pos + 1 >= word.length) return null;
      const b = word[pos + 1];
      if (singleton[b] || a === b || !addOppositeEdge(a, b)) return null;
      pairCount += 1;
      pos += 2;
    }
  }

  // Count whether the connected bipartite components can be oriented
  // to produce exactly 12 row labels and 12 column labels.
  const components = new Map();
  for (let i = 0; i < 29; i++) {
    if (singleton[i]) continue;
    const [component, color] = find(i);
    const counts = components.get(component) || [0, 0];
    counts[color] += 1;
    components.set(component, counts);
  }

  let possible = new Set([0]);
  for (const [a, b] of components.values()) {
    const next = new Set();
    for (const n of possible) {
      next.add(n + a);
      next.add(n + b);
    }
    possible = next;
  }

  return {
    pairCount,
    componentCount: components.size,
    balanced12x12: possible.has(12)
  };
}

let tested = 0;
let structurallyValid = 0;
let balanced = 0;
let firstStructural = null;

for (let a = 0; a < 25; a++) {
  for (let b = a + 1; b < 26; b++) {
    for (let c = b + 1; c < 27; c++) {
      for (let d = c + 1; d < 28; d++) {
        for (let e = d + 1; e < 29; e++) {
          const mask = (1 << a) | (1 << b) | (1 << c) | (1 << d) | (1 << e);
          tested += 1;
          const result = testSingletonMask(mask);
          if (result) {
            structurallyValid += 1;
            if (!firstStructural) firstStructural = { singletonSet: [a, b, c, d, e], ...result };
            if (result.balanced12x12) balanced += 1;
          }
        }
      }
    }
  }
}

console.log(JSON.stringify({
  page: 0,
  printedWords: words.length,
  runes: p0.length,
  singletonCount: 5,
  singletonSetsTested: tested,
  structurallyValidBipartitions: structurallyValid,
  balanced12x12Partitions: balanced,
  firstStructural
}, null, 2));
