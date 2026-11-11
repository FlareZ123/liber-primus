#!/usr/bin/env node
"use strict";

// Language/held-out evaluation of the already-tested p36 -> Q238 keystream
// family. No new seed, polynomial, phase or recurrence variants are introduced.
// Run from repository root:
//   node sims/lp2_q238_p36_seeded_keystream_language_gate.cjs

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const read = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;
const START = 29;
const VOCAB = 30;
const SMOOTHING = 0.15;

function trim(a) {
  let n = a.length;
  while (n > 1 && a[n - 1] === 0) n -= 1;
  return a.slice(0, n);
}
function inverse(x) {
  for (let y = 1; y < Q; y += 1) if (mod(x * y) === 1) return y;
  throw new Error("GF(29) inverse does not exist");
}
function divide(poly, factor) {
  const rem = poly.slice();
  const quotient = Array(poly.length - factor.length + 1).fill(0);
  for (let i = quotient.length - 1; i >= 0; i -= 1) {
    const scale = mod(rem[i + factor.length - 1] * inverse(factor.at(-1)));
    quotient[i] = scale;
    for (let j = 0; j < factor.length; j += 1) {
      rem[i + j] = mod(rem[i + j] - scale * factor[j]);
    }
  }
  assert(rem.slice(0, factor.length - 1).every((x) => x === 0), "Q238 factor division remainder");
  return trim(quotient);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const pages = corpus.pages
  .filter((p) => p.page <= 55 && p.status === "unsolved" && p.indices.length)
  .slice()
  .sort((a, b) => a.page - b.page);
const p36 = pages.find((p) => p.page === 36);
assert(p36, "missing physical p36");
const seed = p36.indices.slice();
const beforePages = pages.filter((p) => p.page < 36);
const afterPages = pages.filter((p) => p.page > 36);
const before = beforePages.flatMap((p) => p.indices);
const after = afterPages.flatMap((p) => p.indices);
const all = pages.flatMap((p) => p.indices);
assert.deepEqual([seed.length, before.length, after.length, all.length], [238, 8706, 4012, 12956]);

// Reconstruct the already-established monic degree-238 factor Q238 from the
// original 256-byte table. Coefficients are ascending after reversing bytes.
const exactFactorsAscending = [
  [5, 1],
  [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
];
assert.equal(grid.bytes.length, 256);
let residual = trim(grid.bytes.slice().reverse().map(mod));
for (const factor of exactFactorsAscending) residual = divide(residual, factor);
const q238 = residual.map((x) => mod(x * inverse(residual.at(-1))));
assert.equal(q238.length, 239);
assert.equal(q238[238], 1);
assert.equal(q238[0], 5);

function next(state) {
  let sum = 0;
  for (let j = 0; j < 238; j += 1) sum -= q238[j] * state[j];
  const value = mod(sum);
  state.shift();
  state.push(value);
  return value;
}
function previous(state) {
  let sum = state[237];
  for (let j = 1; j < 238; j += 1) sum += q238[j] * state[j - 1];
  const value = mod(-inverse(q238[0]) * sum);
  state.pop();
  state.unshift(value);
  return value;
}

// Check forward/backward recurrence consistency before using either clock.
{
  const state = seed.slice();
  for (let i = 0; i < 238; i += 1) previous(state);
  for (let i = 0; i < 238; i += 1) next(state);
  assert.deepEqual(state, seed);
}

const variants = [];
// Clock A: p36 is the state page and is excluded from plaintext. Extend the
// recurrence backwards over p0-p35 and forwards over p37-p55.
for (const reverseSeed of [false, true]) {
  const state = reverseSeed ? seed.slice().reverse() : seed.slice();
  const leftReverse = [];
  for (let i = 0; i < before.length; i += 1) leftReverse.push(previous(state));
  const right = [];
  for (let i = 0; i < after.length; i += 1) right.push(next(state));
  const key = [...leftReverse.reverse(), ...right];
  const cipher = [...before, ...after];
  const pageByRune = [
    ...beforePages.flatMap((p) => Array(p.indices.length).fill(p.page)),
    ...afterPages.flatMap((p) => Array(p.indices.length).fill(p.page)),
  ];
  for (const sign of [-1, 1]) {
    variants.push({
      clock: "p36-anchored; p36 excluded",
      seedOrder: reverseSeed ? "reverse" : "forward",
      includeSeedBlock: false,
      sign,
      key,
      cipher,
      pageByRune,
    });
  }
}

// Clock B: book starts at p0. The two source-visible choices are whether the
// first key block is the seed itself or the first recurrence output.
for (const reverseSeed of [false, true]) {
  for (const includeSeedBlock of [false, true]) {
    const state = reverseSeed ? seed.slice().reverse() : seed.slice();
    const key = includeSeedBlock ? state.slice() : [];
    while (key.length < all.length) key.push(next(state));
    const pageByRune = pages.flatMap((p) => Array(p.indices.length).fill(p.page));
    for (const sign of [-1, 1]) {
      variants.push({
        clock: "book-start p0",
        seedOrder: reverseSeed ? "reverse" : "forward",
        includeSeedBlock,
        sign,
        key,
        cipher: all,
        pageByRune,
      });
    }
  }
}
assert.equal(variants.length, 12);

// Train a continuous GP29 trigram model on the first 240,000 characters of
// the independent Shakespeare control. Spaces are stripped at scoring time.
const translit = corpus.translit;
function encodeWord(token) {
  const s = token.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    const pairIndex = translit.indexOf(pair);
    if (pairIndex >= 0) {
      out.push(pairIndex);
      i += 2;
    } else {
      const singleIndex = translit.indexOf(s[i]);
      if (singleIndex >= 0) out.push(singleIndex);
      i += 1;
    }
  }
  return out;
}
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const trainingWords = (shakespeare.slice(0, 240000).match(/[A-Za-z]+/gu) || [])
  .map(encodeWord)
  .filter((w) => w.length);
const trainingStream = trainingWords.flat();
const contextCounts = Array.from({ length: VOCAB }, () => Array(VOCAB).fill(0));
const trigramCounts = Array.from({ length: VOCAB }, () =>
  Array.from({ length: VOCAB }, () => Array(VOCAB).fill(0)));
const trainingSequence = [START, START, ...trainingStream];
for (let i = 2; i < trainingSequence.length; i += 1) {
  const a = trainingSequence[i - 2];
  const b = trainingSequence[i - 1];
  const c = trainingSequence[i];
  trigramCounts[a][b][c] += 1;
  contextCounts[a][b] += 1;
}
function scoreStream(sequence) {
  let score = 0;
  for (let i = 2; i < sequence.length; i += 1) {
    const a = sequence[i - 2];
    const b = sequence[i - 1];
    const c = sequence[i];
    score += Math.log(
      (trigramCounts[a][b][c] + SMOOTHING) /
      (contextCounts[a][b] + SMOOTHING * VOCAB),
    );
  }
  return score / Math.max(1, sequence.length - 2);
}
function scorePages(sequence, pageByRune, predicate) {
  let score = 0;
  let n = 0;
  for (let i = 2; i < sequence.length; i += 1) {
    if (!predicate(pageByRune[i])) continue;
    const a = sequence[i - 2];
    const b = sequence[i - 1];
    const c = sequence[i];
    score += Math.log(
      (trigramCounts[a][b][c] + SMOOTHING) /
      (contextCounts[a][b] + SMOOTHING * VOCAB),
    );
    n += 1;
  }
  return score / Math.max(1, n);
}

const scored = variants.map((v) => {
  const plain = v.cipher.map((c, i) => mod(c + v.sign * v.key[i]));
  return {
    ...v,
    plain,
    trainPages: scorePages(plain, v.pageByRune, (p) => p < 28),
    heldoutPages: scorePages(plain, v.pageByRune, (p) => p >= 28),
    fullStream: scoreStream(plain),
  };
}).sort((a, b) => b.trainPages - a.trainPages);

// Native LP1 controls are sampled with the exact original LP2 word-length
// profile. For the p36-excluded clock, remove the same 238-rune physical page.
const parsed = parseLP2Words(read("resources/lp2-transcription.txt"), 55);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
const wordLengths = parsed.words.map((w) => w.runes.length);
const nativeLines = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u)
  .filter((line) => {
    const s = line.trim();
    return !s.startsWith("#") && !s.startsWith("[") && !/^[0-9a-f]{25,}$/iu.test(s);
  });
const nativeWords = (nativeLines.join(" ").match(/[A-Za-z]+/gu) || [])
  .map(encodeWord)
  .filter((w) => w.length);
assert.equal(nativeWords.length, 796);
const pools = new Map();
for (const w of nativeWords) {
  if (!pools.has(w.length)) pools.set(w.length, []);
  pools.get(w.length).push(w);
}
for (const length of wordLengths) assert(pools.has(length), "missing LP1 control word length");

let randomState = 0x238119;
function randomUint32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}
const samples = [];
for (let draw = 0; draw < 300; draw += 1) {
  samples.push(wordLengths.map((length) => {
    const pool = pools.get(length);
    return pool[randomUint32() % pool.length];
  }).flat());
}
assert(samples.every((sample) => sample.length === 12956));
const p36Start = before.length;
const samplesWithoutP36 = samples.map((sample) => [
  ...sample.slice(0, p36Start),
  ...sample.slice(p36Start + seed.length),
]);
const fullControlScores = samples.map(scoreStream);
const noP36ControlScores = samplesWithoutP36.map(scoreStream);
function stats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const q = (p) => sorted[Math.floor((sorted.length - 1) * p)];
  return { mean, p05: q(0.05), p50: q(0.5), p95: q(0.95) };
}

const rawWithoutP36 = [...before, ...after];
const pageByRuneWithoutP36 = [
  ...pages.filter((p) => p.page < 36).flatMap((p) => Array(p.indices.length).fill(p.page)),
  ...pages.filter((p) => p.page > 36).flatMap((p) => Array(p.indices.length).fill(p.page)),
];
const rawScores = {
  bookStart: {
    trainPages: scorePages(all, pages.flatMap((p) => Array(p.indices.length).fill(p.page)), (p) => p < 28),
    heldoutPages: scorePages(all, pages.flatMap((p) => Array(p.indices.length).fill(p.page)), (p) => p >= 28),
    fullStream: scoreStream(all),
  },
  p36Excluded: {
    trainPages: scorePages(rawWithoutP36, pageByRuneWithoutP36, (p) => p < 28),
    heldoutPages: scorePages(rawWithoutP36, pageByRuneWithoutP36, (p) => p >= 28),
    fullStream: scoreStream(rawWithoutP36),
  },
};

const best = scored[0];
const plant = samples[0];
const plantKey = best.key;
const encryptedPlant = plant.map((value, i) => mod(value - best.sign * plantKey[i]));
const recoveredPlant = encryptedPlant.map((value, i) => mod(value + best.sign * plantKey[i]));
assert.deepEqual(recoveredPlant, plant, "LP1 positive control must round-trip exactly");

const counts = Array(Q).fill(0);
for (const value of best.plain) counts[value] += 1;
const ioc = counts.reduce((sum, count) => sum + count * (count - 1), 0) /
  (best.plain.length * (best.plain.length - 1));

const output = {
  hypothesis: "all 238 original p36 runes seed the exact degree-238 GF29 factor from the 256-byte table; recurrence output is an additive LP2 keystream",
  q238: { degree: 238, constant: q238[0], first12Ascending: q238.slice(0, 12) },
  sourceLengths: { p36Seed: seed.length, beforeP36: before.length, afterP36: after.length, fullLP2: all.length },
  candidates: scored.map((v) => ({
    clock: v.clock,
    seedOrder: v.seedOrder,
    includeSeedBlock: v.includeSeedBlock,
    sign: v.sign,
    trainPages: v.trainPages,
    heldoutPages: v.heldoutPages,
    fullStream: v.fullStream,
    ioc: v.plain.reduce((s, x) => s + (x === 28 ? 1 : 0), 0) / v.plain.length,
    prefix: v.plain.slice(0, 100).map((x) => translit[x]).join(""),
  })),
  selectedOnPages0To27: {
    clock: best.clock,
    seedOrder: best.seedOrder,
    includeSeedBlock: best.includeSeedBlock,
    sign: best.sign,
    trainPages: best.trainPages,
    heldoutPages: best.heldoutPages,
    fullStream: best.fullStream,
    ioc,
    prefix: best.plain.slice(0, 100).map((x) => translit[x]).join(""),
  },
  rawScores,
  nativeLP1MatchedControls: {
    sourceWords: nativeWords.length,
    draws: samples.length,
    full: stats(fullControlScores),
    excludingP36: stats(noP36ControlScores),
    positiveControlRunes: plant.length,
    exactRoundTripRunes: recoveredPlant.filter((x, i) => x === plant[i]).length,
  },
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
