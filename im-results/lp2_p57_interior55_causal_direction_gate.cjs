#!/usr/bin/env node
'use strict';

// Source-constrained causal direction gates for the p57 interior-55 key.
// Run from the repository root:
//   node im-results/lp2_p57_interior55_causal_direction_gate.cjs
//
// Only the coin collision model is scored here because its matched synthetic
// controls recover exactly. The deterministic multi-skip beam did not pass
// the same positive-control gate and is therefore not treated as a negative.

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
const sourceWords = toWords(pageTexts.slice(0, 3).join(''));
const pagewiseSourceWords = pageTexts.slice(0, 3).flatMap(toWords);
const p57Words = toWords(pageTexts.at(-1));

assert.equal(sourceWords.length, 158);
assert.equal(pagewiseSourceWords.length, 160);
assert.equal(sourceWords.flat().length, 729);
assert.equal(p57Words.length, 20);
assert.equal(p57Words.reduce((n, w) => n + w.length, 0), 95);

const trim = w => w.slice(1, -1);
const title = trim(p57Words[0]);
const body = p57Words.slice(1).flatMap(w => w.slice(1, -1));
const baseKey = title.concat(body);
assert.equal(title.length, 5);
assert.equal(body.length, 50);
assert.equal(baseKey.length, 55);

const N = 300;
const windowWords = [];
let remaining = N;
for (const w of sourceWords) {
  if (remaining <= 0) break;
  const part = w.slice(0, remaining);
  if (part.length) windowWords.push(part);
  remaining -= part.length;
}
const ciphertext = windowWords.flat();
assert.equal(ciphertext.length, N);

const mod = x => ((x % 29) + 29) % 29;
const isPrime = n => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
const keyVariants = (t, b) => [
  ['title-index', t.concat(b)],
  ['body-index', b.concat(t)],
  ['title-prime-mod29', t.concat(b).map(i => corpus.prime[i] % 29)],
  ['body-prime-mod29', b.concat(t).map(i => corpus.prime[i] % 29)]
];
const scaledIoC = (counts, n) =>
  29 * counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
const rawCounts = Array(29).fill(0);
for (const x of ciphertext) rawCounts[x]++;
const rawScaledIoC = scaledIoC(rawCounts, N);

function makeLengthDirections(words, rule, positiveForward, n) {
  const dirs = [];
  for (const w of words) {
    const d = rule(w.length) === positiveForward ? 1 : -1;
    for (let i = 0; i < w.length && dirs.length < n; i++) dirs.push(d);
    if (dirs.length >= n) break;
  }
  assert.equal(dirs.length, n);
  return dirs;
}

// Reference-style coin collision model, conv000: no extra word-boundary move.
// A repeated ciphertext rune consumes one coin position; the next key value
// is used to produce the current ciphertext rune.
function decodeCoinPrecomputed(words, key, dirs, multiplier, beamWidth) {
  const c = words.flat();
  const n = c.length;
  let states = [{ j: 0, score: 0, counts: new Uint16Array(29), plain: '' }];
  let pos = 0;

  for (const ci of c) {
    const d = dirs[pos];
    const prev = pos === 0 ? -1 : c[pos - 1];
    const next = new Map();

    for (const st of states) {
      const j = st.j;
      const k0 = mod(key[mod(j, key.length)] * multiplier);
      const k2 = mod(key[mod(j + 2 * d, key.length)] * multiplier);
      const t0 = mod(ci - k0);
      const options = [[t0, prev === ci ? j + 2 * d : j + d]];

      if (prev >= 0) {
        const t2 = mod(ci - k2);
        if (mod(t2 + k0) === prev) options.push([t2, j + 3 * d]);
      }

      for (const [plain, nextPointer] of options) {
        const counts = st.counts.slice();
        const score = st.score + 2 * counts[plain];
        counts[plain]++;
        const old = next.get(nextPointer);
        if (!old || score > old.score) {
          next.set(nextPointer, {
            j: nextPointer,
            score,
            counts,
            plain: st.plain + String.fromCharCode(plain)
          });
        }
      }
    }

    states = [...next.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);
    pos++;
  }

  const best = states[0];
  return {
    score: scaledIoC(best.counts, n),
    plain: Array.from(best.plain, ch => ch.charCodeAt(0))
  };
}

function plantCoinPrecomputed(words, key, rule, positiveForward, multiplier) {
  let j = 0;
  let prev = -1;
  const out = [];

  for (const word of words) {
    const d = rule(word.length) === positiveForward ? 1 : -1;
    for (const p of word) {
      let y = mod(p + mod(key[mod(j, key.length)] * multiplier));
      j += d;
      if (prev >= 0 && y === prev) {
        j += d;
        y = mod(p + mod(key[mod(j, key.length)] * multiplier));
        j += d;
      }
      out.push(y);
      prev = y;
    }
  }
  return out;
}

function decodeCoinPreviousPlain(words, key, multiplier, primeForward, beamWidth) {
  const c = words.flat();
  const n = c.length;
  let states = [{
    j: 0,
    previousWordPrime: true,
    currentWordPrimeSum: 0,
    score: 0,
    counts: new Uint16Array(29),
    plain: ''
  }];
  let pos = 0;

  for (const word of words) {
    for (const ci of word) {
      const prev = pos === 0 ? -1 : c[pos - 1];
      const next = new Map();

      for (const st of states) {
        const d = st.previousWordPrime === primeForward ? 1 : -1;
        const j = st.j;
        const k0 = mod(key[mod(j, key.length)] * multiplier);
        const k2 = mod(key[mod(j + 2 * d, key.length)] * multiplier);
        const t0 = mod(ci - k0);
        const options = [[t0, prev === ci ? j + 2 * d : j + d]];

        if (prev >= 0) {
          const t2 = mod(ci - k2);
          if (mod(t2 + k0) === prev) options.push([t2, j + 3 * d]);
        }

        for (const [plain, nextPointer] of options) {
          const counts = st.counts.slice();
          const score = st.score + 2 * counts[plain];
          counts[plain]++;
          const sum = st.currentWordPrimeSum + corpus.prime[plain];
          const stateKey = nextPointer + '|' + (st.previousWordPrime ? 1 : 0) + '|' + sum;
          const old = next.get(stateKey);
          if (!old || score > old.score) {
            next.set(stateKey, {
              j: nextPointer,
              previousWordPrime: st.previousWordPrime,
              currentWordPrimeSum: sum,
              score,
              counts,
              plain: st.plain + String.fromCharCode(plain)
            });
          }
        }
      }

      states = [...next.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);
      pos++;
    }

    const merged = new Map();
    for (const st of states) {
      const previousWordPrime = isPrime(st.currentWordPrimeSum);
      const stateKey = st.j + '|' + (previousWordPrime ? 1 : 0);
      const old = merged.get(stateKey);
      const nextState = { ...st, previousWordPrime, currentWordPrimeSum: 0 };
      if (!old || nextState.score > old.score) merged.set(stateKey, nextState);
    }
    states = [...merged.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);
  }

  const best = states[0];
  return {
    score: scaledIoC(best.counts, n),
    plain: Array.from(best.plain, ch => ch.charCodeAt(0))
  };
}

function plantCoinPreviousPlain(words, key, multiplier, primeForward) {
  let j = 0;
  let prev = -1;
  let previousWordPrime = true;
  const out = [];

  for (const word of words) {
    const d = previousWordPrime === primeForward ? 1 : -1;
    let sum = 0;
    for (const p of word) {
      let y = mod(p + mod(key[mod(j, key.length)] * multiplier));
      j += d;
      if (prev >= 0 && y === prev) {
        j += d;
        y = mod(p + mod(key[mod(j, key.length)] * multiplier));
        j += d;
      }
      out.push(y);
      prev = y;
      sum += corpus.prime[p];
    }
    previousWordPrime = isPrime(sum);
  }
  return out;
}

function splitFlatByWords(flat, words) {
  let i = 0;
  return words.map(w => {
    const part = flat.slice(i, i + w.length);
    i += w.length;
    return part;
  });
}

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
function median(values) {
  const s = values.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function preview(indices, n = 110) {
  return indices.slice(0, n).map(i => corpus.translit[i]).join('');
}

const lengthRules = [
  ['L_odd', L => L % 2 === 1],
  ['L_prime', L => isPrime(L)]
];

const lengthActual = [];
for (const [ruleName, rule] of lengthRules) {
  for (const positiveForward of [true, false]) {
    const dirs = makeLengthDirections(sourceWords, rule, positiveForward, N);
    for (const [keyName, key] of keyVariants(title, body)) {
      for (const multiplier of [1, 28]) {
        const d = decodeCoinPrecomputed(windowWords, key, dirs, multiplier, 800);
        lengthActual.push({
          rule: ruleName,
          positiveForward,
          key: keyName,
          multiplier,
          score: d.score,
          preview: preview(d.plain)
        });
      }
    }
  }
}
lengthActual.sort((a, b) => b.score - a.score);

const controlWords = Array.from({ length: 3 }, () => p57Words).flat();
const lengthControlCipher = plantCoinPrecomputed(controlWords, baseKey, lengthRules[1][1], true, 1);
const lengthControlWords = splitFlatByWords(lengthControlCipher, controlWords);
const lengthControlDirs = makeLengthDirections(controlWords, lengthRules[1][1], true, lengthControlCipher.length);
const lengthControlDecoded = decodeCoinPrecomputed(lengthControlWords, baseKey, lengthControlDirs, 1, 800);
const lengthControlExact = lengthControlDecoded.plain.every((x, i) => x === controlWords.flat()[i]);

const lengthRng = rng32(0x3301f00d);
const lengthNullMaxima = [];
for (let r = 0; r < 12; r++) {
  const perm = shuffle(baseKey, lengthRng);
  const nullTitle = perm.slice(0, 5);
  const nullBody = perm.slice(5);
  let best = 0;
  for (const [, rule] of lengthRules) {
    for (const positiveForward of [true, false]) {
      const dirs = makeLengthDirections(sourceWords, rule, positiveForward, N);
      for (const [, key] of keyVariants(nullTitle, nullBody)) {
        for (const multiplier of [1, 28]) {
          const d = decodeCoinPrecomputed(windowWords, key, dirs, multiplier, 800);
          if (d.score > best) best = d.score;
        }
      }
    }
  }
  lengthNullMaxima.push(best);
}
const lengthBest = lengthActual[0].score;
const lengthExceed = lengthNullMaxima.filter(x => x >= lengthBest).length;

const previousPlainActual = [];
for (const [keyName, key] of keyVariants(title, body)) {
  for (const multiplier of [1, 28]) {
    for (const primeForward of [true, false]) {
      const d = decodeCoinPreviousPlain(windowWords, key, multiplier, primeForward, 800);
      previousPlainActual.push({
        key: keyName,
        multiplier,
        primeForward,
        score: d.score,
        preview: preview(d.plain)
      });
    }
  }
}
previousPlainActual.sort((a, b) => b.score - a.score);

const previousPlainControlCipher = plantCoinPreviousPlain(controlWords, baseKey, 1, true);
const previousPlainControlWords = splitFlatByWords(previousPlainControlCipher, controlWords);
const previousPlainControlDecoded = decodeCoinPreviousPlain(previousPlainControlWords, baseKey, 1, true, 800);
const previousPlainControlExact = previousPlainControlDecoded.plain.every((x, i) => x === controlWords.flat()[i]);

const previousPlainRng = rng32(0x3301cafe);
const previousPlainNullMaxima = [];
for (let r = 0; r < 16; r++) {
  const perm = shuffle(baseKey, previousPlainRng);
  const nullTitle = perm.slice(0, 5);
  const nullBody = perm.slice(5);
  let best = 0;
  for (const [, key] of keyVariants(nullTitle, nullBody)) {
    for (const multiplier of [1, 28]) {
      for (const primeForward of [true, false]) {
        const d = decodeCoinPreviousPlain(windowWords, key, multiplier, primeForward, 800);
        if (d.score > best) best = d.score;
      }
    }
  }
  previousPlainNullMaxima.push(best);
}
const previousPlainBest = previousPlainActual[0].score;
const previousPlainExceed = previousPlainNullMaxima.filter(x => x >= previousPlainBest).length;

console.log(JSON.stringify({
  test: 'p57 interior55 cyclic key + source-motivated causal word directions + reference coin collision model',
  source: {
    p0_p2_words_joined: sourceWords.length,
    p0_p2_words_pagewise: pagewiseSourceWords.length,
    p0_p2_page_carries: pagewiseSourceWords.length - sourceWords.length,
    p0_p2_runes: sourceWords.flat().length,
    p57_words: p57Words.length,
    p57_runes: p57Words.reduce((n, w) => n + w.length, 0),
    key_length: baseKey.length,
    window_runes: N,
    window_words: windowWords.length,
    beam_width: 800,
    collision_model: 'coin',
    key_start: 0,
    cyclic_key: true
  },
  raw_scaled_ioc: rawScaledIoC,
  current_word_length_gate: {
    rules: ['odd/even word length', 'prime/composite word length'],
    best: lengthActual[0],
    top_results: lengthActual.slice(0, 8),
    null_count: lengthNullMaxima.length,
    null_median: median(lengthNullMaxima),
    null_max: Math.max(...lengthNullMaxima),
    null_maxima: lengthNullMaxima,
    empirical_p: (1 + lengthExceed) / (1 + lengthNullMaxima.length),
    positive_control: {
      plaintext: 'p57 clear text repeated three times',
      runes: lengthControlCipher.length,
      exact_recovery: lengthControlExact,
      recovered_scaled_ioc: lengthControlDecoded.score
    }
  },
  previous_plaintext_word_prime_sum_gate: {
    rule: 'prime GP-prime-value sum => forward for next word; composite => backward (opposite polarity also tested)',
    best: previousPlainActual[0],
    top_results: previousPlainActual.slice(0, 8),
    null_count: previousPlainNullMaxima.length,
    null_median: median(previousPlainNullMaxima),
    null_max: Math.max(...previousPlainNullMaxima),
    null_maxima: previousPlainNullMaxima,
    empirical_p: (1 + previousPlainExceed) / (1 + previousPlainNullMaxima.length),
    positive_control: {
      plaintext: 'p57 clear text repeated three times',
      runes: previousPlainControlCipher.length,
      exact_recovery: previousPlainControlExact,
      recovered_scaled_ioc: previousPlainControlDecoded.score
    }
  }
}, null, 2));
