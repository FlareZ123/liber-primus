#!/usr/bin/env node
'use strict';

// Corrected source-word segmentation for the p57 interior-55 GP_prev pilot.
// Run from the repository root:
//   node im-results/lp2_pdir_p57_interior55_gp_prev_pilot.cjs

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeWord = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const pageTexts = transcription.split('%').map(s =>
  s.replace(/\/\r?\n/g, '').replace(/\r?\n/g, '')
);
const toWords = s =>
  (s.match(runeWord) || []).map(w => Array.from(w, ch => runeIndex.get(ch)));

// A physical page break is not automatically a word boundary. The original
// transcription uses '-', '.', and '&' as separators; joining page segments
// preserves the 32 printed words that continue across page boundaries.
const sourceWords = toWords(pageTexts.slice(0, 3).join(''));
const pagewiseSourceWords = pageTexts.slice(0, 3).flatMap(toWords);
const allWords = toWords(pageTexts.join(''));
const pagewiseAllWords = pageTexts.flatMap(toWords);
const p56p57Words = toWords(pageTexts.slice(-2).join(''));
const p57Words = toWords(pageTexts.at(-1));

assert.equal(pageTexts.length, 57);
assert.equal(sourceWords.length, 158);
assert.equal(pagewiseSourceWords.length, 160);
assert.equal(sourceWords.flat().length, 729);
assert.deepEqual(
  sourceWords.flat(),
  corpus.pages.slice(0, 3).flatMap(p => p.indices),
  'joined transcription p0-p2 must match canonical rune corpus'
);
assert.equal(allWords.length, 2941);
assert.equal(pagewiseAllWords.length, 2973);
assert.equal(pagewiseAllWords.length - allWords.length, 32);
assert.equal(p56p57Words.length, 45);
assert.equal(allWords.length - p56p57Words.length, 2896);
assert.equal(p57Words.length, 20);
assert.equal(p57Words.reduce((n, w) => n + w.length, 0), 95);

const trimCircumference = w => w.slice(1, -1);
const titleInterior = trimCircumference(p57Words[0]);
const bodyInterior = p57Words.slice(1).flatMap(trimCircumference);
assert.equal(titleInterior.length, 5);
assert.equal(bodyInterior.length, 50);
assert.equal(titleInterior.length + bodyInterior.length, 55);

const sourceRuneStream = sourceWords.flat();
const ciphertext = sourceRuneStream.slice(0, 300);
const N = ciphertext.length;
assert.equal(N, 300);

const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const mod = x => ((x % 29) + 29) % 29;
const gpPrimeSums = sourceWords.map(w =>
  w.reduce((s, i) => s + corpus.prime[i], 0)
);

// GP_prev: direction of this word is +1 iff the preceding ciphertext word's
// GP-prime-value sum is prime; otherwise -1. The first word starts forward.
const directions = [];
for (let w = 0; w < sourceWords.length && directions.length < N; w++) {
  const direction = w === 0 ? 1 : (isPrime(gpPrimeSums[w - 1]) ? 1 : -1);
  for (let j = 0; j < sourceWords[w].length && directions.length < N; j++) {
    directions.push(direction);
  }
}
assert.equal(directions.length, N);

const keyCandidates = [
  ['title-first-GP-index', [...titleInterior, ...bodyInterior]],
  ['body-first-GP-index', [...bodyInterior, ...titleInterior]],
  ['title-first-GP-prime-mod29', [...titleInterior, ...bodyInterior].map(i => corpus.prime[i] % 29)],
  ['body-first-GP-prime-mod29', [...bodyInterior, ...titleInterior].map(i => corpus.prime[i] % 29)]
];

function scaledIoC(counts) {
  const pairs = counts.reduce((s, x) => s + x * (x - 1), 0);
  return 29 * pairs / (N * (N - 1));
}

// conv000, one-step skip/coin pilot as originally screened: no extra pointer
// motion at word boundaries; the previous ciphertext rune is the comparator.
function beamDecode(key, model, reverseDirections, keyMultiplier, beamWidth = 16) {
  let states = [{ j: 0, score: 0, counts: Array(29).fill(0) }];
  for (let i = 0; i < N; i++) {
    const d = directions[i] * (reverseDirections ? -1 : 1);
    const c = ciphertext[i];
    const previousCipher = i === 0 ? -1 : ciphertext[i - 1];
    const next = new Map();

    for (const state of states) {
      const j = state.j;
      const k0 = mod(key[mod(j, key.length)] * keyMultiplier);
      const p0 = mod(c - k0);
      let options;

      if (previousCipher < 0) {
        options = [[p0, j + d]];
      } else {
        const k1 = mod(key[mod(j + d, key.length)] * keyMultiplier);
        const p1 = mod(c - k1);
        const collision = mod(p1 + k0) === previousCipher;

        if (model === 0) {
          options = collision ? [[p1, j + 2 * d]] : [[p0, j + d]];
        } else {
          options = collision ? [[p0, j + d], [p1, j + 2 * d]] : [[p0, j + d]];
        }
      }

      for (const [plain, nextPointer] of options) {
        const counts = state.counts.slice();
        const score = state.score + 2 * counts[plain];
        counts[plain]++;
        const old = next.get(nextPointer);
        if (!old || score > old.score) {
          next.set(nextPointer, { j: nextPointer, score, counts });
        }
      }
    }

    states = [...next.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);
  }

  const best = states[0];
  return { scaled_ioc: scaledIoC(best.counts), final_pointer: best.j };
}

const actual = [];
for (const [keyName, key] of keyCandidates) {
  for (const model of [0, 1]) {
    for (const reverseDirections of [false, true]) {
      for (const keyMultiplier of [1, 28]) {
        actual.push({
          key: keyName,
          collision_model: model === 0 ? 'skip' : 'coin',
          reverse_directions: reverseDirections,
          key_multiplier: keyMultiplier,
          ...beamDecode(key, model, reverseDirections, keyMultiplier)
        });
      }
    }
  }
}
actual.sort((a, b) => b.scaled_ioc - a.scaled_ioc);

function rng32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(a, rng) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// Matched null: preserve the 55-symbol multiset and 5/50 title/body split,
// then test both orders, both encodings, both collision models, both signs,
// and both direction polarities for every permutation.
const rng = rng32(0x161116);
const nullMaxima = [];
for (let r = 0; r < 24; r++) {
  const perm = shuffle([...titleInterior, ...bodyInterior], rng);
  const nullTitle = perm.slice(0, 5);
  const nullBody = perm.slice(5);
  const nullKeys = [
    nullTitle.concat(nullBody),
    nullBody.concat(nullTitle),
    nullTitle.concat(nullBody).map(i => corpus.prime[i] % 29),
    nullBody.concat(nullTitle).map(i => corpus.prime[i] % 29)
  ];
  let best = 0;
  for (const key of nullKeys) {
    for (const model of [0, 1]) {
      for (const reverseDirections of [false, true]) {
        for (const keyMultiplier of [1, 28]) {
          const score = beamDecode(key, model, reverseDirections, keyMultiplier).scaled_ioc;
          if (score > best) best = score;
        }
      }
    }
  }
  nullMaxima.push(best);
}

const nullSorted = nullMaxima.slice().sort((a, b) => a - b);
const actualBest = actual[0].scaled_ioc;
const exceed = nullMaxima.filter(x => x >= actualBest).length;
const rawCounts = Array(29).fill(0);
for (const x of ciphertext) rawCounts[x]++;
const rawScaledIoC = scaledIoC(rawCounts);

console.log(JSON.stringify({
  test: 'p57 interior55 cyclic key + previous-ciphertext GP-prime-sum direction + conv000 one-step skip/coin beam',
  source: {
    p0_p2_words_joined: sourceWords.length,
    p0_p2_words_pagewise: pagewiseSourceWords.length,
    p0_p2_page_carries: pagewiseSourceWords.length - sourceWords.length,
    all_rune_page_words_joined: allWords.length,
    all_rune_page_words_pagewise: pagewiseAllWords.length,
    all_page_carries: pagewiseAllWords.length - allWords.length,
    p0_p2_runes: sourceRuneStream.length,
    p57_words: p57Words.length,
    p57_runes: p57Words.reduce((n, w) => n + w.length, 0),
    key_length: titleInterior.length + bodyInterior.length,
    window_runes: N,
    beam_width: 16,
    random_seed: '0x161116'
  },
  raw_scaled_ioc: rawScaledIoC,
  best: actual[0],
  top_results: actual.slice(0, 8),
  null_count: nullMaxima.length,
  null_median: nullSorted[Math.floor(nullSorted.length / 2)],
  null_max: nullSorted.at(-1),
  null_maxima: nullMaxima,
  empirical_p: (1 + exceed) / (1 + nullMaxima.length)
}, null, 2));
