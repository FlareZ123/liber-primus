#!/usr/bin/env node
"use strict";

// Independent, one-label reproduction of Wulfic Stage AK's immediate
// two-ciphertext-context discriminator. No Wulfic implementation code is copied.
//
// Input: local canonical page-index corpus, pages 0..55 (12,956 GP29 runes).
// Wulfic main was pinned at 521cb08a689d2159cf54e3c569fd59588601f875.
// Its canonical master file SHA-256 is
// df7eaaa0c92243946803a7a90a7bfdcb36c0eba73f964f3a093c238ab01a5746.
// Wulfic's nine source sections have these rune lengths; local transcription
// dollar markers do not preserve the same partition, so do not infer them from
// resources/lp2-transcription.txt.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CORPUS_PATH = path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json");
const SEGMENT_LENGTHS = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
const KEEP = 0.19;
const NULL_DRAWS = 1000;
const POSITIVE_DRAWS = 20;
const NEGATIVE_DRAWS = 20;

const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, "utf8"));
assert.equal(corpus.runes.length, 29, "expected Gematria Primus 29-rune alphabet");
const pages = corpus.pages
  .filter((page) => page.page >= 0 && page.page <= 55)
  .sort((a, b) => a.page - b.page);
assert.equal(pages.length, 56, "expected LP2 pages 0..55, including runeless p50");
const tape = pages.flatMap((page) => page.indices);
assert.equal(tape.length, 12956, "canonical LP2 rune count changed");
assert.equal(SEGMENT_LENGTHS.reduce((a, b) => a + b, 0), tape.length,
  "pinned Wulfic source section lengths no longer cover the local rune tape");

const segmentPosition = new Uint16Array(tape.length);
let cursor = 0;
for (const length of SEGMENT_LENGTHS) {
  for (let i = 0; i < length; i++) segmentPosition[cursor + i] = i;
  cursor += length;
}

const lp2Frequency = Array(29).fill(0);
for (const rune of tape) lp2Frequency[rune]++;

function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedSampler(weights, random) {
  const cumulative = [];
  let total = 0;
  for (const weight of weights) {
    total += weight;
    cumulative.push(total);
  }
  return function sample() {
    const target = random() * total;
    let low = 0;
    let high = cumulative.length - 1;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (target < cumulative[middle]) high = middle;
      else low = middle + 1;
    }
    return low;
  };
}

// Stage-Z-style anti-doublet rule: initially queue every adjacent equality;
// retain it with probability KEEP, otherwise redraw a uniform GP29 rune.
// Newly created next-position doublets are inserted into the queue.
function antiDoublet(segment, random) {
  const output = segment.slice();
  const queue = [];
  for (let i = 1; i < output.length; i++) {
    if (output[i] === output[i - 1]) queue.push(i);
  }
  let head = 0;
  while (head < queue.length) {
    const i = queue[head++];
    if (output[i] !== output[i - 1]) continue;
    if (random() >= KEEP) output[i] = Math.floor(random() * 29);
    if (i + 1 < output.length &&
        output[i + 1] === output[i] &&
        (head >= queue.length || queue[head] !== i + 1)) {
      queue.splice(head, 0, i + 1);
    }
  }
  return output;
}

function applyNullRule(stream, random) {
  const output = [];
  let offset = 0;
  for (const length of SEGMENT_LENGTHS) {
    output.push(...antiDoublet(stream.slice(offset, offset + length), random));
    offset += length;
  }
  return output;
}

// K = sum over (previous-cipher pair, current rune) of choose(count, 2).
// The context resets at each source segment, but equal labels are pooled
// across segments, matching Stage AK's context_codes/coincidences logic.
function collisionCount(ciphertext) {
  const counts = new Map();
  for (let i = 0; i < ciphertext.length; i++) {
    if (segmentPosition[i] < 2) continue;
    const key = ciphertext[i - 1] + "," + ciphertext[i - 2] + "," + ciphertext[i];
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let pairs = 0;
  for (const count of counts.values()) pairs += count * (count - 1) / 2;
  return pairs;
}

function drawNull(seed) {
  const random = mulberry32(seed);
  const sample = weightedSampler(lp2Frequency, random);
  const stream = Array.from({length: tape.length}, sample);
  return collisionCount(applyNullRule(stream, random));
}

// Synthetic positive: English-letter-frequency proxy over 29 GP29 symbols,
// with one fixed additive table indexed by (C[i-1], C[i-2]).
// This is a planted model control, not Wulfic's Emerson-word control.
const ENGLISH_FREQUENCY = [
  12.7, 9.1, 8.2, 7.5, 7.0, 6.7, 6.3, 6.1, 6.0, 4.3,
  4.0, 2.8, 2.8, 2.4, 2.4, 2.2, 2.0, 2.0, 1.9, 1.5,
  1.0, 0.8, 0.15, 0.15, 0.10, 0.07, 0.03, 0.03, 0.03
];

function drawPositive(seed) {
  const random = mulberry32(seed);
  const rekeyRandom = mulberry32(seed ^ 0xA5A5A5A5);
  const sample = weightedSampler(ENGLISH_FREQUENCY, random);
  const plaintext = Array.from({length: tape.length}, sample);
  const table = Array.from({length: 29 * 29}, () => Math.floor(random() * 29));
  const ciphertext = Array(tape.length);
  let offset = 0;
  for (const length of SEGMENT_LENGTHS) {
    for (let j = 0; j < length; j++) {
      const i = offset + j;
      let value = j >= 2
        ? (plaintext[i] + table[ciphertext[i - 1] * 29 + ciphertext[i - 2]]) % 29
        : (plaintext[i] + Math.floor(random() * 29)) % 29;
      if (j > 0 && value === ciphertext[i - 1] && rekeyRandom() >= KEEP) {
        value = (value + 1 + Math.floor(rekeyRandom() * 28)) % 29;
      }
      ciphertext[i] = value;
    }
    offset += length;
  }
  return collisionCount(ciphertext);
}

// Negative: the same English-frequency proxy, but an independent random
// additive key at every position, followed by the anti-doublet redraw rule.
function drawNegative(seed) {
  const random = mulberry32(seed);
  const sample = weightedSampler(ENGLISH_FREQUENCY, random);
  const plaintext = Array.from({length: tape.length}, sample);
  const ciphertext = plaintext.map((rune) => (rune + Math.floor(random() * 29)) % 29);
  return collisionCount(applyNullRule(ciphertext, random));
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sampleSd(values) {
  const average = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    (values.length - 1));
}

const originalK = collisionCount(tape);
const nullValues = Array.from({length: NULL_DRAWS}, (_, i) => drawNull(0x330100 + i));
const positiveValues = Array.from({length: POSITIVE_DRAWS}, (_, i) => drawPositive(0x441000 + i));
const negativeValues = Array.from({length: NEGATIVE_DRAWS}, (_, i) => drawNegative(0x551000 + i));
const nullMean = mean(nullValues);
const nullSd = sampleSd(nullValues);
const nullMax = Math.max(...nullValues);
const positiveMean = mean(positiveValues);
const positiveSd = sampleSd(positiveValues);
const positiveCutoff = positiveMean - 5 * positiveSd;
const z = (value) => (value - nullMean) / nullSd;
const fires = (value) => z(value) >= 5 && value > nullMax;
const positiveFires = positiveValues.filter(fires).length;
const negativeFires = negativeValues.filter(fires).length;
const negativeMaxZ = Math.max(...negativeValues.map(z));

const result = {
  input: {
    corpus: "resources/liber-primus/lp2-corpus.json",
    pages: "0..55",
    runeCount: tape.length,
    segmentLengths: SEGMENT_LENGTHS,
    segmentLengthSum: SEGMENT_LENGTHS.reduce((a, b) => a + b, 0),
    context: "C[i-1], C[i-2]",
    keep: KEEP,
    rng: "mulberry32",
    seeds: {null: "0x330100+i", positive: "0x441000+i", negative: "0x551000+i"}
  },
  original: {
    K: originalK,
    nullZ: z(originalK),
    aboveNullMaximum: originalK > nullMax,
    positiveFiveSdCutoff: positiveCutoff,
    excludedBySelectedPositiveControl: originalK <= positiveCutoff
  },
  null: {
    draws: nullValues.length,
    mean: nullMean,
    sampleSd: nullSd,
    min: Math.min(...nullValues),
    max: nullMax
  },
  positive: {
    draws: positiveValues.length,
    mean: positiveMean,
    sampleSd: positiveSd,
    min: Math.min(...positiveValues),
    max: Math.max(...positiveValues),
    fires: positiveFires
  },
  negative: {
    draws: negativeValues.length,
    fires: negativeFires,
    minZ: Math.min(...negativeValues.map(z)),
    maxZ: negativeMaxZ
  },
  scope: "One C29 label only; not the full 66-pair, triple-context, or unit-period suite."
};

assert.equal(originalK, 3569, "original statistic changed");
assert.equal(positiveFires, 20, "planted context-table positive lost power");
assert.equal(negativeFires, 0, "independent-key negative unexpectedly fired");
assert.ok(originalK <= positiveCutoff, "original did not fall below the positive exclusion threshold");

console.log(JSON.stringify(result, null, 2));
