'use strict';

// Direct source-key test: the five products of p7's five red words are a
// five-symbol GP29 key for the immediately following p8 black body.
// Test a repeating additive/Vigenere stream under ordinary and p56-derived
// F-transparent clocks. No fitted phase, reset, rotation, or extra layer.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages = read('resources/liber-primus/lp2-transcription.txt').split(/\n%\s*\n/);
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const mod = (x) => ((x % 29) + 29) % 29;
const page = (n) => corpus.pages.find((p) => p.page === n).indices;

const p7 = page(7);
const p8 = page(8);
const p57 = page(57);
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p57.length, 95);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
function redWordsOn(n) {
  const annotation = ink.pages.find((p) => p.page === n);
  const out = [];
  let offset = 0;
  let start = 0;
  let running = [];
  function flush() {
    if (!running.length) return;
    const span = (annotation.red_spans || []).find((s) =>
      start >= s.start && start + running.length <= s.start + s.length);
    if (span) out.push({ start, indices: running, spanStart: span.start });
    running = [];
  }
  for (const ch of pages[n]) {
    const i = runeIndex.get(ch);
    if (i !== undefined) {
      if (!running.length) start = offset;
      running.push(i);
      offset++;
    } else if (ch === '-' || ch === '.') flush();
  }
  flush();
  return out;
}
const p7RedWords = redWordsOn(7);
const p8RedWords = redWordsOn(8);
assert.deepEqual(p7RedWords.map((w) => w.indices), [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
]);
assert.deepEqual(p7RedWords.map((w) => w.indices.length), [2, 4, 3, 2, 3]);
assert.deepEqual(p8RedWords.map((w) => w.indices), [
  [14, 10, 14, 19], [1, 14, 19, 5, 2, 13, 3, 17]
]);
assert.deepEqual(p7.slice(194), p7RedWords.flatMap((w) => w.indices));
assert.deepEqual(ink.pages.find((p) => p.page === 7).red_spans, [{ start: 194, length: 14 }]);
assert.deepEqual(ink.pages.find((p) => p.page === 8).red_spans, [{ start: 0, length: 12 }]);

const product29 = (xs) => xs.reduce((v, x) => mod(v * x), 1);
const key = p7RedWords.map((w) => product29(w.indices));
assert.deepEqual(key, [11, 26, 8, 15, 2]);
const body = p8.slice(12);
assert.equal(body.length, 243);
assert.equal(body.length, 3 ** 5);
const fCount = body.filter((x) => x === 0).length;
assert.equal(fCount, 8);

function decodeOrdinary(ct, sign) {
  return ct.map((c, i) => mod(c + sign * key[i % key.length]));
}
function encodeOrdinary(plain, sign) {
  return plain.map((p, i) => mod(p - sign * key[i % key.length]));
}
function decodeTransparentDP(ct, sign) {
  let states = [{ j: 0, p: [] }];
  for (const c of ct) {
    const next = [];
    for (const state of states) {
      const k = key[state.j % key.length];
      if (c !== 0) {
        const p = mod(c + sign * k);
        if (p !== 0) next.push({ j: state.j + 1, p: state.p.concat(p) });
      } else {
        next.push({ j: state.j, p: state.p.concat(0) });
        const p = mod(sign * k);
        if (p !== 0) next.push({ j: state.j + 1, p: state.p.concat(p) });
      }
    }
    states = next;
  }
  return states;
}
function encodeTransparent(plain, sign) {
  let j = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    const k = key[j % key.length];
    j++;
    return mod(p - sign * k);
  });
}

const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const training = [];
for (const paragraph of reference.split(/\n\s*\n/)) {
  const sequence = [];
  for (const word of paragraph.split('\n')
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ').match(/[A-Za-z]+/g) || []) {
    const encoded = encodeSourceNativeGP(word);
    if (encoded.length) sequence.push(...encoded);
  }
  if (sequence.length >= 3) training.push(sequence);
}
const trigrams = new Map();
let total = 0;
for (const sequence of training) {
  for (let i = 2; i < sequence.length; i++) {
    const k = sequence.slice(i - 2, i + 1).join(',');
    trigrams.set(k, (trigrams.get(k) || 0) + 1);
    total++;
  }
}
const denominator = total + 0.1 * (29 ** 3);
function score(xs) {
  let value = 0;
  for (let i = 2; i < xs.length; i++) {
    value += Math.log(((trigrams.get(xs.slice(i - 2, i + 1).join(',')) || 0) + 0.1) / denominator);
  }
  return value / (xs.length - 2);
}
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
const nativeWindows = [];
for (const sequence of training) {
  for (let i = 0; i + body.length <= sequence.length; i++) {
    nativeWindows.push(score(sequence.slice(i, i + body.length)));
  }
}
assert.equal(nativeWindows.length, 710);
nativeWindows.sort((a, b) => a - b);

const planted = Array.from({ length: body.length }, (_, i) => p57[i % p57.length]);
const ordinary = [];
for (const sign of [-1, 1]) {
  const plain = decodeOrdinary(body, sign);
  assert.deepEqual(encodeOrdinary(plain, sign), body);
  ordinary.push({
    direction: sign < 0 ? 'C-minus-K' : 'C-plus-K',
    keystream_symbols_consumed: body.length,
    ioc: ioc(plain),
    native_gp_trigram_mean_log_score: score(plain),
    first120: plain.slice(0, 120).map((x) => corpus.translit[x]).join(''),
    exact_round_trip_runes: body.length
  });
}
const transparent = [];
for (const sign of [-1, 1]) {
  const states = decodeTransparentDP(body, sign);
  const ranked = states.map((s) => ({
    j: s.j,
    score: score(s.p),
    first120: s.p.slice(0, 120).map((x) => corpus.translit[x]).join('')
  })).sort((a, b) => b.score - a.score);
  transparent.push({
    direction: sign < 0 ? 'C-minus-K' : 'C-plus-K',
    valid_plaintext_paths: states.length,
    best_score: ranked[0]?.score ?? null,
    best_first120: ranked[0]?.first120 ?? null
  });
}
const transparentPositive = [];
for (const sign of [-1, 1]) {
  const plantedCipher = encodeTransparent(planted, sign);
  const states = decodeTransparentDP(plantedCipher, sign);
  const found = states.some((s) => s.p.length === planted.length && s.p.every((v, i) => v === planted[i]));
  assert(found);
  transparentPositive.push({
    direction: sign < 0 ? 'C-minus-K' : 'C-plus-K',
    candidate_count: states.length,
    planted_recovered: found
  });
}

console.log(JSON.stringify({
  source: 'original p7 five red words -> original p8 12-rune red heading -> p8 243-rune black body',
  p7_red_word_indices: p7RedWords.map((w) => w.indices),
  p7_red_word_products_gp29: key,
  p8_red_word_indices: p8RedWords.map((w) => w.indices),
  p8_black_body_runes: body.length,
  p8_F_runes: fCount,
  repeating_key_period: key.length,
  native_gp_training_sequences: training.length,
  native_gp_trigrams: total,
  native_243_window_count: nativeWindows.length,
  native_243_window_score_min_median_max: [
    nativeWindows[0], nativeWindows[Math.floor(nativeWindows.length / 2)], nativeWindows[nativeWindows.length - 1]
  ],
  raw_body: { ioc: ioc(body), native_gp_trigram_mean_log_score: score(body) },
  ordinary_clock_outputs: ordinary,
  exact_p56_plaintext_F_transparent_DP: transparent,
  exact_transparent_planted_p57_controls: transparentPositive
}, null, 2));

// Agent 9: use the full integer product digits, retaining all upper places.
const fullProducts = p7RedWords.map(w => w.indices.reduce((a, b) => a * b, 1));
function base29(n) {
  const digits = [];
  do { digits.unshift(n % 29); n = Math.floor(n / 29); } while (n);
  return digits;
}
const fullKey = fullProducts.flatMap(base29);
assert.deepEqual(fullKey, [2,11,20,26,26,13,8,13,15,3,23,2]);
assert.equal(fullKey.length, p8RedWords.flatMap(w => w.indices).length);
function firstImpossible(ct, sign) {
  let states = new Set([0]);
  for (let i = 0; i < ct.length; i++) {
    const next = new Set();
    for (const j of states) {
      if (ct[i] === 0) next.add(j);
      if (mod(ct[i] + sign * fullKey[j]) !== 0) next.add((j + 1) % fullKey.length);
    }
    if (!next.size) return i;
    states = next;
  }
  return null;
}
for (const sign of [-1, 1]) {
  const p = p8.map((x, i) => mod(x + sign * fullKey[i % fullKey.length]));
  assert.deepEqual(p.map((x, i) => mod(x - sign * fullKey[i % fullKey.length])), p8);
  let k = 0;
  const ctrl = p57.map(x => x === 0 ? 0 : mod(x - sign * fullKey[(k++) % fullKey.length]));
  assert.equal(firstImpossible(ctrl, sign), null);
  const failure = firstImpossible(p8, sign);
  assert.equal(failure, sign === -1 ? 17 : 12);
  console.log(JSON.stringify({fullProducts, fullKey, sign, ioc:ioc(p), heading:p.slice(0,12).map(x=>corpus.translit[x]).join(''), firstImpossible:failure, controlReach:true}));
}
