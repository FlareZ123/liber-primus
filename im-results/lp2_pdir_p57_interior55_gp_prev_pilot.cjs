#!/usr/bin/env node
'use strict';

// Bounded source-derived pdir pilot. Run from the repository root:
//   node im-results/lp2_pdir_p57_interior55_gp_prev_pilot.cjs
//
// This is an independent implementation of one reference-style skip/coin
// pointer-walk convention. It is not the full 66-rule / 18-convention search.

const fs = require('node:fs');
const assert = require('node:assert/strict');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeWord = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const pageTexts = transcription.split('%').map(s => s.replace(/\/\r?\n/g, '').replace(/\r?\n/g, ''));
const wordPages = pageTexts.map(s =>
  (s.match(runeWord) || []).map(w => Array.from(w, ch => runeIndex.get(ch)))
);

// The first three transcription pages are an exact source/corpus alignment
// check. The numeric p50 table has no rune transcription, so p57 is last.
for (let p = 0; p < 3; p++) {
  assert.deepEqual(wordPages[p].flat(), corpus.pages[p].indices, 'transcription/corpus mismatch at page ' + p);
}
assert.equal(pageTexts.length, 57);
const p57Words = wordPages.at(-1);
assert.equal(p57Words.length, 20);
assert.equal(p57Words.reduce((n, w) => n + w.length, 0), 95);

const trimCircumference = w => w.slice(1, -1);
const titleInterior = trimCircumference(p57Words[0]);
const bodyInterior = p57Words.slice(1).flatMap(trimCircumference);
assert.equal(titleInterior.length, 5);
assert.equal(bodyInterior.length, 50);
assert.equal(titleInterior.length + bodyInterior.length, 55);

// First 300 source runes from pages 0-2, preserving printed word boundaries.
const sourceWords = wordPages.slice(0, 3).flat();
const ciphertext = sourceWords.flat().slice(0, 300);
const N = ciphertext.length;
assert.equal(N, 300);

const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const gpPrimeSums = sourceWords.map(w => w.reduce((s, i) => s + corpus.prime[i], 0));

// GP_prev: direction of this word is +1 iff the preceding ciphertext word's
// GP-prime-value sum is prime; otherwise -1. First word defaults to +1.
const directions = [];
for (let w = 0; w < sourceWords.length && directions.length < N; w++) {
  const direction = w === 0 ? 1 : (isPrime(gpPrimeSums[w - 1]) ? 1 : -1);
  for (let j = 0; j < sourceWords[w].length && directions.length < N; j++) {
    directions.push(direction);
  }
}
assert.equal(directions.length, N);

const mod = x => ((x % 29) + 29) % 29;
const keyCandidates = [
  ['title-first-GP-index', [...titleInterior, ...bodyInterior]],
  ['body-first-GP-index', [...bodyInterior, ...titleInterior]],
  ['title-first-GP-prime-mod29', [...titleInterior, ...bodyInterior].map(i => corpus.prime[i] % 29)],
  ['body-first-GP-prime-mod29', [...bodyInterior, ...titleInterior].map(i => corpus.prime[i] % 29)]
];

function scaledIoC(counts, n) {
  const pairs = counts.reduce((s, x) => s + x * (x - 1), 0);
  return 29 * pairs / (n * (n - 1));
}

const rawCounts = Array(29).fill(0);
for (const x of ciphertext) rawCounts[x]++;
const rawIoC = scaledIoC(rawCounts, N);

// conv000: no extra pointer movement at word boundaries, and the collision
// comparator is the immediately preceding ciphertext rune.
// model 0 = deterministic skip; model 1 = retain both collision branches.
// Beam state is (cyclic key pointer, accumulated coincidence score, counts).
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

    states = [...next.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, beamWidth);
  }

  const best = states[0];
  return {
    scaled_ioc: best.score / (N * (N - 1) / 29),
    final_pointer: best.j,
    counts: best.counts
  };
}

const results = [];
for (const [keyName, key] of keyCandidates) {
  for (const model of [0, 1]) {
    for (const reverseDirections of [false, true]) {
      for (const keyMultiplier of [1, 28]) {
        const result = beamDecode(key, model, reverseDirections, keyMultiplier);
        results.push({
          key: keyName,
          collision_model: model === 0 ? 'skip' : 'coin',
          reverse_directions: reverseDirections,
          key_multiplier: keyMultiplier,
          ...result
        });
      }
    }
  }
}
results.sort((a, b) => b.scaled_ioc - a.scaled_ioc);

console.log(JSON.stringify({
  test: 'p57 interior55 cyclic key + ciphertext-word GP_prev direction + conv000 skip/coin beam',
  input: {
    transcription_pages: pageTexts.length,
    p57_words: p57Words.length,
    p57_runes: 95,
    p57_title_interior: titleInterior.length,
    p57_body_interior: bodyInterior.length,
    key_length: 55,
    window_runes: N,
    window_source_pages: [0, 1, 2],
    beam_width: 16,
    key_pointer_start: 0
  },
  raw_scaled_ioc: rawIoC,
  best: results[0],
  top_results: results.slice(0, 8)
}, null, 2));
