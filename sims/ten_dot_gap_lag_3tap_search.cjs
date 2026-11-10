#!/usr/bin/env node
"use strict";

// Reproduce the source-derived 10-dot lag experiment.
// Run from repository root: node sims/ten_dot_gap_lag_3tap_search.cjs

const fs = require("node:fs");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const annotations = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-ink-annotations.json", "utf8"));

const special = annotations.pages
  .flatMap((page) => (page.large_punctuation || [])
    .filter((mark) => mark[1] === 10)
    .map(([offset, dots]) => ({ page: page.page, offset, dots })))
  .sort((a, b) => a.page - b.page);

const gaps = special.slice(1).map((mark, i) => mark.page - special[i].page);
const q = special.map((mark) => mark.offset / 3);
const C = corpus.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices);
const LAGS = [2, 11, 7];
const MAX_LAG = Math.max(...LAGS);
const N = C.length;

function iocFromCounts(counts, n) {
  let numerator = 0;
  for (const count of counts) numerator += count * (count - 1);
  return numerator / (n * (n - 1));
}

function rawIoC(values) {
  const counts = new Int32Array(29);
  for (const value of values) counts[value]++;
  return iocFromCounts(counts, values.length);
}

function exhaustiveCipherFeedback() {
  const add = Array.from({ length: 29 }, (_, a) =>
    Array.from({ length: 29 }, (_, b) => (a + b) % 29));
  const A = Array.from({ length: 29 }, (_, a) => {
    const values = new Int8Array(N);
    for (let i = MAX_LAG; i < N; i++) values[i] = (a * C[i - LAGS[0]]) % 29;
    return values;
  });
  const B = Array.from({ length: 29 }, (_, b) => {
    const values = new Int8Array(N);
    for (let i = MAX_LAG; i < N; i++) values[i] = (b * C[i - LAGS[1]]) % 29;
    return values;
  });
  const D = Array.from({ length: 29 }, (_, d) => {
    const values = new Int8Array(N);
    for (let i = MAX_LAG; i < N; i++) values[i] = (d * C[i - LAGS[2]]) % 29;
    return values;
  });

  const scores = [];
  let min = Infinity, max = -Infinity, sum = 0, sum2 = 0, models = 0;
  const decodedLength = N - MAX_LAG;

  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let d = 0; d < 29; d++) {
        const counts = new Int32Array(29);
        for (let i = MAX_LAG; i < N; i++) {
          const key = add[add[A[a][i]][B[b][i]]][D[d][i]];
          counts[(C[i] - key + 29) % 29]++;
        }
        const score = iocFromCounts(counts, decodedLength);
        min = Math.min(min, score);
        max = Math.max(max, score);
        sum += score;
        sum2 += score * score;
        models++;
        scores.push({ a, b, d, ioc: score });
      }
    }
  }
  scores.sort((x, y) => y.ioc - x.ioc);
  const mean = sum / models;
  return {
    models,
    decodedLength,
    min,
    max,
    mean,
    sd: Math.sqrt(sum2 / models - mean * mean),
    top: scores.slice(0, 20),
  };
}

function exhaustivePlaintextFeedback() {
  const add = Array.from({ length: 29 }, (_, a) =>
    Array.from({ length: 29 }, (_, b) => (a + b) % 29));
  const P = new Int8Array(N);
  const scores = [];
  let min = Infinity, max = -Infinity, sum = 0, sum2 = 0, models = 0;

  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let d = 0; d < 29; d++) {
        P.set(C.subarray ? C.subarray(0, MAX_LAG) : C.slice(0, MAX_LAG));
        const counts = new Int32Array(29);
        for (let i = 0; i < MAX_LAG; i++) counts[P[i]]++;
        for (let i = MAX_LAG; i < N; i++) {
          const key = add[add[(a * P[i - LAGS[0]]) % 29][(b * P[i - LAGS[1]]) % 29]]
            [(d * P[i - LAGS[2]]) % 29];
          const plain = (C[i] - key + 29) % 29;
          P[i] = plain;
          counts[plain]++;
        }
        const score = iocFromCounts(counts, N);
        min = Math.min(min, score);
        max = Math.max(max, score);
        sum += score;
        sum2 += score * score;
        models++;
        scores.push({ a, b, d, ioc: score });
      }
    }
  }
  scores.sort((x, y) => y.ioc - x.ioc);
  const mean = sum / models;
  return {
    models,
    decodedLength: N,
    seedLength: MAX_LAG,
    seed: C.slice(0, MAX_LAG),
    min,
    max,
    mean,
    sd: Math.sqrt(sum2 / models - mean * mean),
    top: scores.slice(0, 20),
  };
}

const result = {
  source: {
    tenDotMarks: special,
    allOffsetsDivisibleBy3: special.every((mark) => mark.offset % 3 === 0),
    offsetThirds: q,
    offsetThirdsMod29: q.map((x) => x % 29),
    pageGaps: gaps,
    pageGapsPrime: gaps.every((x) => {
      if (x < 2) return false;
      for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
      return true;
    }),
    lags: LAGS,
    redTriangleCoefficientsMod29: [15, 22, 78].map((x) => x % 29),
  },
  input: { pageRange: "0-55", runeCount: N, rawIoC: rawIoC(C) },
  ciphertextFeedback: exhaustiveCipherFeedback(),
  plaintextFeedback: exhaustivePlaintextFeedback(),
};

console.log(JSON.stringify(result, null, 2));
