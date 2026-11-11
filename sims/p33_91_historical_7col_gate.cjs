#!/usr/bin/env node
"use strict";

// Apply only the historically authenticated 2014 seven-position inverse
// to the source-titled p33 offset 0..90 unit. No alternate orders or phases.
// Run from the repository root:
//   node sims/p33_91_historical_7col_gate.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const read = path => fs.readFileSync(path, "utf8");

assert(fs.statSync("resources/liber-primus/50.jpg").size > 0,
  "original physical p33 JPEG 50.jpg must be present");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alpha = corpus.translit;
const page = corpus.pages.find(item => item.page === 33);
assert(page);
assert.equal(page.runic_count, 214);
const original = page.indices.slice(0, 91);
assert.equal(original.length, 91);
assert.equal(original.length, 13 * 7);
assert.deepEqual(
  original.slice(0, 10).map(index => alpha[index]),
  ["D","EO","X","C","F","I","A","W","H","G"],
  "the 10-rune red heading must be included in offsets 0..90"
);

const FORWARD_ORDER = [0,4,2,6,5,3,1];
const INVERSE_ORDER = [0,6,2,5,1,4,3];

function permuteSeven(sequence, order) {
  assert.equal(sequence.length % 7, 0, "only complete seven-rune blocks are allowed");
  const output = [];
  for (let offset = 0; offset < sequence.length; offset += 7) {
    const block = sequence.slice(offset, offset + 7);
    for (const sourceIndex of order) output.push(block[sourceIndex]);
  }
  return output;
}

const historicalPlain = "TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133";
const historicalCipher = "TLBEIEOVUTHTREIDTSEOSTPOSOYRSLBTIIIYT4DGUQIMNU442I15339M";
const historicalForward = permuteSeven([...historicalPlain], FORWARD_ORDER).join("");
const historicalInverse = permuteSeven([...historicalCipher], INVERSE_ORDER).join("");
assert.equal(historicalForward, historicalCipher,
  "the frozen historical forward positive control must match all 56 characters");
assert.equal(historicalInverse, historicalPlain,
  "the frozen historical inverse positive control must recover all 56 characters");

const candidate = permuteSeven(original, INVERSE_ORDER);
const reencrypted = permuteSeven(candidate, FORWARD_ORDER);
assert.deepEqual(reencrypted, original,
  "the exact historical forward permutation must restore all 91 original indices");

function normalizeControl(source) {
  return source.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
}

function tokenizeGP(source) {
  const text = normalizeControl(source);
  const indexByToken = new Map(alpha.map((token, index) => [token, index]));
  const multi = alpha.filter(token => token.length > 1).sort((a, b) => b.length - a.length);
  const output = [];
  for (let i = 0; i < text.length;) {
    const ch = text[i];
    if (ch >= "A" && ch <= "Z") {
      const token = multi.find(item => text.startsWith(item, i));
      if (token) {
        output.push(indexByToken.get(token));
        i += token.length;
      } else if (indexByToken.has(ch)) {
        output.push(indexByToken.get(ch));
        i++;
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  return output;
}

function trainTrigram(symbols) {
  const trigrams = new Float64Array(29 ** 3);
  const bigrams = new Float64Array(29 ** 2);
  for (let i = 0; i + 2 < symbols.length; i++) {
    trigrams[symbols[i] * 841 + symbols[i + 1] * 29 + symbols[i + 2]]++;
    bigrams[symbols[i] * 29 + symbols[i + 1]]++;
  }
  return function score(sequence) {
    let total = 0;
    for (let i = 0; i + 2 < sequence.length; i++) {
      const a = sequence[i], b = sequence[i + 1], c = sequence[i + 2];
      total += Math.log(
        (trigrams[a * 841 + b * 29 + c] + 0.1) /
        (bigrams[a * 29 + b] + 0.1 * 29)
      );
    }
    return total / (sequence.length - 2);
  };
}

function rng(seed) {
  let state = seed >>> 0;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function shuffleWithinSevenBlocks(sequence, random) {
  const output = [];
  for (let offset = 0; offset < sequence.length; offset += 7) {
    const block = sequence.slice(offset, offset + 7);
    for (let i = block.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [block[i], block[j]] = [block[j], block[i]];
    }
    output.push(...block);
  }
  return output;
}

function quantile(sorted, probability) {
  return sorted[Math.min(sorted.length - 1, Math.floor(probability * (sorted.length - 1)))];
}

function chunk(sequence, size) {
  const output = [];
  for (let i = 0; i < sequence.length; i += size) output.push(sequence.slice(i, i + size));
  return output;
}

const sourceFiles = [
  {name: "Shakespeare", path: "resources/control/shakespeare_first300k.txt"},
  {name: "Gibran", path: "resources/control/gibran_prophet_58585.txt"},
  {name: "Emerson", path: "resources/control/emerson_essays_2944.txt"},
];
const sources = sourceFiles.map(item => ({
  name: item.name,
  tokens: tokenizeGP(read(item.path)),
}));
const sourceReports = [];
let plantedControl = null;

for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
  const source = sources[sourceIndex];
  const split = Math.floor(source.tokens.length * 0.8);
  const score = trainTrigram(source.tokens.slice(0, split));
  const heldout = source.tokens.slice(split);
  const random = rng(0x330100 + sourceIndex);
  const nativeScores = [];
  const shuffledScores = [];

  for (let sample = 0; sample < 1000; sample++) {
    const start = Math.floor(random() * Math.max(1, heldout.length - 91));
    const window = heldout.slice(start, start + 91);
    if (window.length !== 91) continue;
    nativeScores.push(score(window));
    shuffledScores.push(score(shuffleWithinSevenBlocks(window, random)));
  }

  nativeScores.sort((a, b) => a - b);
  shuffledScores.sort((a, b) => a - b);
  const candidateScore = score(candidate);
  sourceReports.push({
    source: source.name,
    tokenCount: source.tokens.length,
    trainingTokens: split,
    heldoutTokens: heldout.length,
    p33RawScore: score(original),
    p33HistoricalInverseScore: candidateScore,
    nativeWindowCount: nativeScores.length,
    nativeMedian: quantile(nativeScores, 0.5),
    nativeP05: quantile(nativeScores, 0.05),
    nativeP95: quantile(nativeScores, 0.95),
    shuffledWindowCount: shuffledScores.length,
    shuffledMedian: quantile(shuffledScores, 0.5),
    shuffledP95: quantile(shuffledScores, 0.95),
    shuffledMaximum: shuffledScores[shuffledScores.length - 1],
    candidatePercentileVsShuffled:
      shuffledScores.filter(value => value <= candidateScore).length / shuffledScores.length,
  });

  if (source.name === "Shakespeare") {
    const plantedPlain = source.tokens.slice(split + 100, split + 191);
    assert.equal(plantedPlain.length, 91);
    const plantedCipher = permuteSeven(plantedPlain, FORWARD_ORDER);
    const plantedRecovered = permuteSeven(plantedCipher, INVERSE_ORDER);
    assert.deepEqual(plantedRecovered, plantedPlain,
      "the planted 91-rune GP-English positive control must recover exactly");
    plantedControl = {
      plaintext: plantedPlain.map(index => alpha[index]).join(""),
      forwardCiphertext: plantedCipher.map(index => alpha[index]).join(""),
      recovered: plantedRecovered.map(index => alpha[index]).join(""),
      plaintextScore: score(plantedPlain),
      forwardCiphertextScore: score(plantedCipher),
      exactRecovery: true,
    };
  }
}

assert(plantedControl);
const output = {
  sourceImage: "resources/liber-primus/50.jpg",
  page: 33,
  pageRuneCount: page.runic_count,
  unitOffsets: "0..90 inclusive",
  unitRuneCount: original.length,
  unitBlocks: original.length / 7,
  includedTenRuneHeading: original.slice(0, 10).map(index => alpha[index]).join(" "),
  forwardOrder: FORWARD_ORDER,
  inverseOrder: INVERSE_ORDER,
  historical2014PositiveControl: {
    plaintext: historicalPlain,
    forwardCiphertext: historicalForward,
    inverseRecovered: historicalInverse,
    exactForward: true,
    exactInverse: true,
  },
  planted91RuneGP29EnglishControl: plantedControl,
  originalInputBlocks: chunk(original.map(index => alpha[index]), 7),
  exactHistoricalInverseOutputBlocks: chunk(candidate.map(index => alpha[index]), 7),
  exactHistoricalInverseOutput: candidate.map(index => alpha[index]).join(""),
  reencryptedOriginalBlocks: chunk(reencrypted.map(index => alpha[index]), 7),
  reencryptsOriginalExactly: true,
  sourceReports,
};

console.log(JSON.stringify(output, null, 2));
