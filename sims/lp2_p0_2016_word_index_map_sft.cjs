#!/usr/bin/env node
"use strict";

// Reproduce the p0 split-READOUT inverse and test its key as a word-index
// into the complete signed 2016 cleartext. No external dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const signed = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const mod = (x) => ((x % 29) + 29) % 29;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pages = transcription.split(/^\s*%\s*$/m).slice(0, 55);

function parsePage(source) {
  const runes = [], words = [];
  let current = [], start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ start, end: start + current.length - 1, values: current.slice() });
    current = [];
  };
  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((ch === "-" || ch === ".") && current.length) flush();
  }
  flush();
  return { runes, words };
}
function outsideInH(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left++, right--) {
    out.push(mod(values[left] - values[right]), mod(values[left] + values[right]));
  }
  if (values.length % 2) out.push(values[(values.length - 1) / 2]);
  return out;
}
const tokens = [...corpus.translit].sort((a, b) => b.length - a.length);
function gpWord(word) {
  const normalized = word.toUpperCase().replace(/K/g, "C").replace(/V/g, "U").replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = tokens.find((candidate) => normalized.startsWith(candidate, i));
    if (!token) throw new Error("Unmapped GP29 token in " + word + " at " + i);
    out.push(corpus.translit.indexOf(token));
    i += token.length;
  }
  return out;
}
const p0 = parsePage(pages[0]);
const packet = p0.words.filter((w) => w.start >= 80 && w.end <= 102).flatMap((w) => outsideInH(w.values));
assert.deepEqual(packet, [19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2]);

const cleartext = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace("-----BEGIN PGP SIGNED MESSAGE-----", "")
  .replace(/^Hash:.*$/gm, "")
  .replace(/^\s*3301\s*$/gm, "")
  .replace(/\b7A35090F\b/g, "");
const sourceWords = (cleartext.match(/[A-Za-z]+/g) || []).map((w) => w.toUpperCase());
assert.equal(sourceWords.length, 43);
const sourceLengths = sourceWords.map((w) => gpWord(w).length);
const project = (values, origin = 1) => values.map((v) => {
  const i = origin === 1 ? v - 1 : v;
  return { index: v, word: i >= 0 && i < sourceWords.length ? sourceWords[i] : null,
    gpLength: i >= 0 && i < sourceWords.length ? sourceLengths[i] : null };
});
const projectUniqueSorted = (values) => [...new Set(values.filter((v) => v >= 1 && v <= sourceWords.length))]
  .sort((a, b) => a - b).map((v) => ({ index: v, word: sourceWords[v - 1] }));

const theHits = [], lengthMatches = [];
let eligibleTwoRuneGroups = 0;
for (let pi = 0; pi < pages.length; pi++) {
  const page = parsePage(pages[pi]);
  for (const w of page.words) {
    if (w.values.length !== 2 || !w.values.every((v) => v >= 1 && v <= 23)) continue;
    eligibleTwoRuneGroups++;
    const key = w.values.map((v) => packet[v - 1]);
    const plain = w.values.map((v, i) => mod(v - key[i]));
    const pageNumber = pi >= 50 ? pi + 1 : pi;
    const hit = { page: pageNumber, start: w.start, end: w.end, cipher: w.values, key, plain };
    if (plain[0] === 2 && plain[1] === 18) theHits.push(hit);
    if (key.every((v) => v >= 1 && v <= sourceWords.length) &&
        key.every((v, i) => sourceLengths[v - 1] === w.values[i])) lengthMatches.push(hit);
  }
}
assert.equal(eligibleTwoRuneGroups, 284);
assert.equal(theHits.length, 5);
assert.equal(lengthMatches.length, 20);
const lengthMatchedTHE = lengthMatches.filter((h) => h.plain[0] === 2 && h.plain[1] === 18);
assert.deepEqual(lengthMatchedTHE.map((h) => [h.page, h.start, h.cipher, h.key]), [
  [0, 235, [8,5], [6,16]], [38, 184, [8,5], [6,16]]
]);
const p0THE = theHits.find((h) => h.page === 0 && h.start === 235);
assert.deepEqual(p0THE, { page: 0, start: 235, end: 236, cipher: [8,5], key: [6,16], plain: [2,18] });

const titleCipher = p0.runes.slice(0, 13);
assert.deepEqual(titleCipher, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(p0.words.slice(0, 2).map((w) => w.values.length), [8,5]);
const epiphany = gpWord("EPIPHANY"), words = gpWord("WORDS"), seeks = gpWord("SEEKS");
const residual = (c, p) => c.map((v, i) => mod(v - p[i]));
const titleWordsKey = residual(titleCipher, [...epiphany, ...words]);
const titleSeeksKey = residual(titleCipher, [...epiphany, ...seeks]);
const p0Devoted = p0.words.find((w) => w.start === 237 && w.end === 243);
assert.ok(p0Devoted);
const devotedCipher = p0Devoted.values, devotedPlain = gpWord("DEVOTED");
const devotedKey = residual(devotedCipher, devotedPlain);
assert.deepEqual(devotedCipher, [15,22,16,22,21,1,4]);
assert.deepEqual(devotedPlain, [23,18,1,3,16,18,23]);
assert.deepEqual(devotedKey, [21,4,15,19,5,12,10]);

const eightRuneWords = sourceWords.filter((word) => gpWord(word).length === 8);
const fiveRuneWords = sourceWords.filter((word) => gpWord(word).length === 5);
const corePositions = [3,8,14,18,19,23,24,26,27];
assert.deepEqual(eightRuneWords, ["EPIPHANY"]);
assert.deepEqual(fiveRuneWords, ["HELLO","EMPTY","SEEKS","LIBER","WORDS","MEANING","FOUND","FALSE"]);
const boundedTitleScan = fiveRuneWords.map((candidate) => {
  const candidatePlain = [...epiphany, ...gpWord(candidate)];
  const candidateKey = residual(titleCipher, candidatePlain);
  const positions = [...new Set(candidateKey.filter((v) => v >= 1 && v <= sourceWords.length))]
    .sort((a, b) => a - b);
  const overlap = positions.filter((v) => corePositions.includes(v)).length;
  return {
    candidate,
    zeroCount: candidateKey.filter((v) => v === 0).length,
    uniqueValidPositions: positions.length,
    coreOverlap: overlap + "/9",
    exactCoreSet: positions.length === corePositions.length && positions.every((v, i) => v === corePositions[i])
  };
});
assert.equal(boundedTitleScan.filter((row) => row.exactCoreSet).length, 1);
assert.equal(boundedTitleScan.find((row) => row.exactCoreSet).candidate, "WORDS");

const bodyWords = sourceWords.slice(1, 30);
const output = {
  signedSource: {
    alphabeticWordCount: sourceWords.length,
    openingWord: sourceWords[0],
    oneBasedFullMessage: { 6: sourceWords[5], 16: sourceWords[15], 24: sourceWords[23] },
    oneBased29WordBodyExcludingHello: { 6: bodyWords[5], 16: bodyWords[15], 24: bodyWords[23] }
  },
  splitPacket: packet,
  globalTHEHits: theHits,
  twoRuneLengthControl: {
    eligibleGroups: eligibleTwoRuneGroups,
    sourceWordLengthMatches: lengthMatches.length,
    lengthMatchedTHE: lengthMatchedTHE
  },
  p0THE: {
    cipher: p0THE.cipher, key: p0THE.key, plain: p0THE.plain,
    oneBasedFullMessagePointers: project(p0THE.key, 1),
    zeroBasedFullMessagePointers: project(p0THE.key, 0),
    oneBasedBodyPointers: p0THE.key.map((v) => bodyWords[v - 1] || null),
    selectedOneBasedSourceWordLengths: p0THE.key.map((v) => sourceLengths[v - 1])
  },
  boundedTitleScan: {
    uniqueEightRuneSourceWord: eightRuneWords,
    fiveRuneCandidates: fiveRuneWords,
    corePositions,
    coreWords: corePositions.map((v) => sourceWords[v - 1]),
    candidates: boundedTitleScan
  },
  p0Title: {
    cipher: titleCipher,
    visualWordLengths: [8,5],
    EPIPHANY_WORDS_plain: [...epiphany, ...words],
    EPIPHANY_WORDS_residualKey: titleWordsKey,
    EPIPHANY_WORDS_keyPointersInOrder: project(titleWordsKey, 1),
    EPIPHANY_WORDS_keyPointersSortedUnique: projectUniqueSorted(titleWordsKey),
    EPIPHANY_SEEKS_residualKey: titleSeeksKey,
    EPIPHANY_SEEKS_zeroCount: titleSeeksKey.filter((v) => v === 0).length,
    EPIPHANY_SEEKS_keyPointersSortedUnique: projectUniqueSorted(titleSeeksKey)
  },
  p0DEVOTED_secondary: {
    cipher: devotedCipher, plain: devotedPlain, residualKey: devotedKey,
    residualKeyPointersSortedUnique: projectUniqueSorted(devotedKey)
  }
};
assert.deepEqual(p0THE.key.map((v) => sourceWords[v - 1]), ["EPIPHANY", "WORDS"]);
assert.deepEqual(p0THE.key.map((v) => sourceLengths[v - 1]), [8,5]);
assert.deepEqual(projectUniqueSorted(titleWordsKey).map((x) => x.word),
  ["PATH","THE","WAY","THE","MAP","THE","ROAD","THEIR","NUMBERS"]);
assert.deepEqual(projectUniqueSorted(devotedKey).map((x) => x.word),
  ["LIES","EMPTY","LIBER","IS","ITS","MAP","MEANING"]);
console.log(JSON.stringify(output, null, 2));
