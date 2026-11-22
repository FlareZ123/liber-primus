'use strict';

/**
 * Agent 8: exact M1 six-back generator and original S5 discriminant.
 * Run: node sims/lp2_sixback_m1_s5_generator_sft.cjs
 *
 * Uses original GP29 ciphertext and its printed words (including page-carries).
 * Forward generator implements the published external Phase25 M1, with its
 * collision probability independently calibrated from original surviving
 * doublets outside T6 target==previous positions. M1 assumes iid GP29 base
 * values; each is p+uniform k mod29, so plaintext itself is not needed.
 * Simulator preserves the nine source section boundaries. It never scans
 * lags, maps, marker values, repair rates, keys or original ciphertext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const dictionary = new Map(corpus.runes.map((rune, index) => [rune, index]));
const chunks = source.split('%').slice(0, 55);
const words = [];
let buffer = [];
for (const chunk of chunks) {
  for (const rune of chunk.replace(/[\/\s]/g, '')) {
    if (dictionary.has(rune)) buffer.push(dictionary.get(rune));
    else if (buffer.length > 0) {
      words.push(buffer);
      buffer = [];
    }
  }
}
if (buffer.length > 0) words.push(buffer);

const flat = words.flat();
const expected = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(words.length, 2896);
assert.equal(flat.length, 12956);
assert.deepEqual(flat, expected);

const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const chapterStarts = [0];
for (const length of lengths) chapterStarts.push(chapterStarts.at(-1) + length);
assert.equal(chapterStarts.at(-1), flat.length);
const starts = new Set(chapterStarts.slice(0, -1));

/** @param {number} source GP29 rune six positions earlier */
function target(source) {
  return (24 - 2 * source + 58) % 29;
}
const summary = {
  eligible: 0, targetHits: 0, nondegenerate: 0,
  nondegenerateEcho: 0, nondegenerateDoublet: 0,
  doublets: 0, s5Exposure: 0, s5Hits: 0, conditionalS5: 0
};

let at = 0;
for (const word of words) {
  for (let j = 0; j < word.length; j++) {
    const val = word[j];
    const prev = at === 0 || starts.has(at) ? -1 : flat[at - 1];
    if (prev === val) summary.doublets++;
    if (j >= 6) {
      const b = target(word[j - 6]);
      summary.eligible++;
      if (val === b) summary.targetHits++;
      if (b !== prev) {
        summary.nondegenerate++;
        if (val === b) summary.nondegenerateEcho++;
        if (val === prev) summary.nondegenerateDoublet++;
      }
    }
    at++;
  }
}
assert.deepEqual(
  [summary.eligible, summary.targetHits, summary.nondegenerate,
    summary.nondegenerateEcho, summary.nondegenerateDoublet, summary.doublets],
  [1290, 80, 1257, 79, 8, 86]
);

// Calibrate q using the original source's eight surviving j>=6 immediate
// repeats at sites with distinct target and predecessor.  S5 is withheld.
const q = 1 - 29 * summary.nondegenerateDoublet / summary.nondegenerate;
const qFromTarget = 29 * summary.nondegenerateEcho / summary.nondegenerate - 1;
assert.ok(q > 0 && q < 1);

for (const word of words) {
  for (let j = 5; j < word.length; j++) {
    if (word[j - 5] !== 15) continue;
    summary.s5Exposure++;
    if (word[j] === 15) summary.s5Hits++;
    const prev = word[j - 1];
    const b = j >= 6 ? target(word[j - 6]) : -1;
    // Exact M1 one-step emission probability conditional on original past.
    let p;
    if (j === 5 || prev === b) {
      p = prev === 15 ? (1 - q) / 29 : (1 + q / 28) / 29;
    } else if (b === 15) {
      p = (1 + q) / 29;
    } else if (prev === 15) {
      p = (1 - q) / 29;
    } else {
      p = 1 / 29;
    }
    summary.conditionalS5 += p;
  }
}
assert.deepEqual([summary.s5Exposure, summary.s5Hits], [74, 11]);
assert.ok(Math.abs(summary.conditionalS5 - 2.518584596211954) < 1e-12);

// M1 emission: one iid uniform base rune per plaintext rune. A collision
// against the preceding emitted cipher is repaired with probability q,
// choosing T(cipher six back) only inside the printed word; at the first six
// word slots or when T repeats predecessor, uniform-other fallback applies.
// The external Python simulator makes these exact choices.
let randomState = 0x152ff00d >>> 0;
/** @returns {number} seeded pseudorandom unit float in [0,1) */
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
}
/** @returns {{s5: number, exposures: number, t6: number, doublets: number}} */
function generate() {
  let previous = -1;
  let absolute = 0;
  let s5 = 0;
  let exposures = 0;
  let t6 = 0;
  let doublets = 0;
  for (const originalWord of words) {
    if (starts.has(absolute)) previous = -1;
    const out = new Uint8Array(originalWord.length);
    for (let j = 0; j < out.length; j++) {
      let value = Math.floor(random() * 29);
      if (previous >= 0 && value === previous && random() < q) {
        if (j >= 6) {
          value = target(out[j - 6]);
          if (value === previous) {
            value = (previous + 1 + Math.floor(random() * 28)) % 29;
          }
        } else {
          value = (previous + 1 + Math.floor(random() * 28)) % 29;
        }
      }
      out[j] = value;
      if (previous === value) doublets++;
      if (j >= 5 && out[j - 5] === 15) {
        exposures++;
        if (value === 15) s5++;
      }
      if (j >= 6 && value === target(out[j - 6])) t6++;
      previous = value;
      absolute++;
    }
  }
  assert.equal(absolute, flat.length);
  return {s5, exposures, t6, doublets};
}

const reps = Number(process.env.SIXBACK_M1_REPS || 15000);
assert.ok(Number.isInteger(reps) && reps >= 1000);
const hist = new Uint32Array(40);
const sums = {s5: 0, exposures: 0, t6: 0, doublets: 0};
let nHighS = 0;
let nHighT = 0;
let nBoth = 0;
for (let rep = 0; rep < reps; rep++) {
  const one = generate();
  for (const key of Object.keys(sums)) sums[key] += one[key];
  if (one.s5 < hist.length) hist[one.s5]++;
  if (one.s5 >= summary.s5Hits) nHighS++;
  if (one.t6 >= summary.targetHits) nHighT++;
  if (one.s5 >= summary.s5Hits && one.t6 >= summary.targetHits) nBoth++;
}
if (reps === 15000) {
  assert.equal(nHighS, 1);
  assert.equal(nHighT, 6500);
  assert.equal(nBoth, 0);
  assert.equal(sums.s5, 37589);
  assert.equal(sums.exposures, 1087673);
  assert.equal(sums.t6, 1174029);
  assert.equal(sums.doublets, 1236497);
}
console.log(JSON.stringify({
  source: 'unaltered LP2 p0-p55 12,956 GP29 symbols, 2,896 printed words, 9 chapters',
  externalModel: 'pnotisdev Phase25 M1 stochastic collision repair, iid GP29 base',
  original: summary,
  qCalibratedFromEightOriginalDoublets: q,
  qCrossCheckFrom79OriginalTargetEchoes: qFromTarget,
  originalS5ConditionalMean: summary.conditionalS5,
  generator: {
    seed: '0x152ff00d', repetitions: reps,
    means: Object.fromEntries(Object.entries(sums).map(([key, value]) => [key, value / reps])),
    S5AtLeast11: nHighS,
    S5AddOneProbability: (nHighS + 1) / (reps + 1),
    T6AtLeast80: nHighT,
    S5AtLeast11AndT6AtLeast80: nBoth,
    s5CountHistogram0to16: Array.from(hist).slice(0,17)
  }
}, null, 2));
