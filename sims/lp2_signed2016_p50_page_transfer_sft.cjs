#!/usr/bin/env node
"use strict";

// Prospective transfer test for the three p50 source-shell keys.
// No key search is performed: the fixed local keys are applied to every
// complete same-length word on each target page.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gp = corpus.translit;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

function completeWords() {
  const blocks = read("resources/liber-primus/lp2-transcription.txt")
    .replace(/\r/g, "")
    .split("%")
    .slice(0, 55);
  const offsets = Array(blocks.length).fill(0);
  const words = [];
  let values = [];
  let startSegment = null;
  let endSegment = null;
  let startOffset = null;

  function flush() {
    if (values.length && startSegment === endSegment) {
      words.push({
        page: physicalPage(startSegment),
        start: startOffset,
        values: values.slice(),
        length: values.length,
      });
    }
    values = [];
    startSegment = null;
    endSegment = null;
    startOffset = null;
  }

  for (let segment = 0; segment < blocks.length; segment++) {
    for (const character of blocks[segment]) {
      const value = runeIndex.get(character);
      if (value !== undefined) {
        if (!values.length) {
          startSegment = segment;
          startOffset = offsets[segment];
        }
        endSegment = segment;
        values.push(value);
        offsets[segment]++;
      } else if (character === "/" || /\s/u.test(character)) {
        // Layout separators do not end a word.
      } else {
        flush();
      }
    }
  }
  flush();
  return words;
}

const mod29 = (value) => ((value % 29) + 29) % 29;
const normalizeEnglish = (word) => word.toUpperCase()
  .replace(/QU/g, "CW")
  .replace(/V/g, "U")
  .replace(/K/g, "C")
  .replace(/Z/g, "S")
  .replace(/Q/g, "C");

const gpTokens = gp.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeEnglish(word) {
  const normalized = normalizeEnglish(word);
  const encoded = [];
  for (let position = 0; position < normalized.length;) {
    const match = gpTokens.find(({ token }) => normalized.startsWith(token, position));
    if (!match) throw new Error(`Unmapped GP29 text at ${normalized.slice(position)}`);
    encoded.push(match.index);
    position += match.token.length;
  }
  return encoded;
}

function decodeWord(cipherWord, key) {
  let keyPosition = 0;
  const output = [];
  for (const value of cipherWord.values) {
    if (value === 0) {
      // F is transparent and does not advance the word key.
      output.push(0);
      continue;
    }
    output.push(mod29(value - key[keyPosition % key.length]));
    keyPosition++;
  }
  return output;
}

function render(values) {
  return values.map((value) => gp[value]).join("");
}

const targets = [
  { name: "WILL", page: 33, key: [25, 5, 26, 2] },
  { name: "PATHS", page: 40, key: [20, 20, 12, 6] },
  { name: "BEWARE", page: 38, key: [20, 7, 7, 7, 13, 4] },
];

const shakespeare = read("resources/control/shakespeare_first300k.txt");
const trigramCounts = new Map();
const vocabularyByLength = new Map();

for (const word of shakespeare.toUpperCase().match(/[A-Z]+/g) || []) {
  const encoded = encodeEnglish(word);
  if (!vocabularyByLength.has(encoded.length)) vocabularyByLength.set(encoded.length, []);
  vocabularyByLength.get(encoded.length).push(encoded);
  for (let i = 0; i + 2 < encoded.length; i++) {
    const id = encoded[i] * 841 + encoded[i + 1] * 29 + encoded[i + 2];
    trigramCounts.set(id, (trigramCounts.get(id) || 0) + 1);
  }
}

const trigramTotal = [...trigramCounts.values()].reduce((sum, count) => sum + count, 0);
const alpha = 0.05;
const denominator = trigramTotal + alpha * (29 ** 3);

function score(groups) {
  let sum = 0;
  let count = 0;
  for (const word of groups) {
    for (let i = 0; i + 2 < word.length; i++) {
      const id = word[i] * 841 + word[i + 1] * 29 + word[i + 2];
      sum += Math.log(((trigramCounts.get(id) || 0) + alpha) / denominator);
      count++;
    }
  }
  return sum / count;
}

let randomState = 0xA20C0DE;
function random32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}

const words = completeWords();
const results = [];

for (const target of targets) {
  const pageWords = words.filter((word) => word.page === target.page && word.length === target.key.length);
  const decoded = pageWords.map((word) => decodeWord(word, target.key));
  const targetPlain = encodeEnglish(target.name);
  const targetHits = decoded.filter((word) =>
    word.length === targetPlain.length && word.every((value, i) => value === targetPlain[i])
  ).length;

  const expectedCount = target.name === "WILL" ? 7 : target.name === "PATHS" ? 15 : 5;
  assert.equal(pageWords.length, expectedCount);
  assert.equal(targetHits, 1, `Expected exactly one ${target.name} crib hit on p${target.page}`);

  const observed = score(decoded);
  const controls = [];
  const nativeWords = vocabularyByLength.get(target.key.length);
  assert(nativeWords && nativeWords.length > 0);

  for (let sample = 0; sample < 2000; sample++) {
    const nativeSample = pageWords.map(() => nativeWords[random32() % nativeWords.length]);
    controls.push(score(nativeSample));
  }
  controls.sort((a, b) => a - b);

  const result = {
    target: target.name,
    page: target.page,
    key: target.key,
    sameLengthWords: pageWords.length,
    exactCribHits: targetHits,
    observedTrigramScore: observed,
    nativeControls: {
      samples: controls.length,
      minimum: controls[0],
      p05: controls[99],
      median: controls[1000],
      p95: controls[1900],
    },
    empiricalPercentile: controls.filter((value) => value <= observed).length / controls.length,
    decodedWords: decoded.map(render),
  };

  assert(
    observed < controls[0],
    `Page-level transfer unexpectedly reaches native English controls for ${target.name}`
  );
  results.push(result);
}

console.log(JSON.stringify({
  method: "fixed local p50-shell key; word reset; F transparent",
  corpus: "resources/control/shakespeare_first300k.txt",
  nativeSamplesPerTarget: 2000,
  results,
}, null, 2));
