#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const controlText = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');

function mod29(x) {
  return ((x % 29) + 29) % 29;
}

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

// Match the repository's source-calibrated GP29 English control encoder.
const gpTokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

function encodeNativeGP(original) {
  const clean = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        out.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        out.push(27);
        i += 2;
      } else {
        const token = gpTokens.find(t => word.startsWith(t.s, i));
        assert(token, 'unmapped native GP spelling at ' + word.slice(i));
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}

assert.equal(corpus.translit.length, 29);
assert.equal(controlText.length, 300000);

const pages = corpus.pages.filter(p => p.page < 56).sort((a, b) => a.page - b.page);
assert.equal(pages.length, 56);
const pageLengths = pages.map(p => p.indices.length);
assert.deepEqual(pageLengths.slice(0, 3), [262, 266, 201]);

// The historical p0–2 candidate: fake preceding F, consecutive prime shifts,
// then the modular first difference of the shifted rune stream.
const firstChapter = pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(firstChapter.length, 729);
const primes = firstPrimes(730);
let previousShiftedFakeF = mod29(-primes[0]); // F has GP29 index 0.
const delta = [];
for (let i = 0; i < firstChapter.length; i++) {
  const shifted = mod29(firstChapter[i] - primes[i + 1]);
  delta.push(mod29(shifted - previousShiftedFakeF));
  previousShiftedFakeF = shifted;
}
let adjacentDeltaEqualities = 0;
for (let i = 2; i < delta.length; i++) {
  if (delta[i] === delta[i - 1]) adjacentDeltaEqualities++;
}
assert.equal(adjacentDeltaEqualities, 40);

// D[0] is the difference from the fictitious preceding F to the first real
// rune. Dropping it leaves the exact 56*13 tape proposed by the alignment.
const keyTape = delta.slice(1);
assert.equal(keyTape.length, 728);
assert.equal(keyTape.length, 56 * 13);

const train = encodeNativeGP(controlText.slice(0, 150000));
const held = encodeNativeGP(controlText.slice(150000));
const gramCounts = new Map();
let gramTotal = 0;
for (let i = 0; i + 4 <= train.length; i++) {
  const k = (((train[i] * 29 + train[i + 1]) * 29 + train[i + 2]) * 29 + train[i + 3]);
  gramCounts.set(k, (gramCounts.get(k) || 0) + 1);
  gramTotal++;
}
const denominator = gramTotal + 0.1 * Math.pow(29, 4);
const unseenLogProbability = Math.log(0.1 / denominator);
const gramLogProbability = new Map(
  [...gramCounts].map(([k, count]) => [k, Math.log((count + 0.1) / denominator)])
);

function scoreGp4(sequence, segmentLengths) {
  let score = 0;
  let offset = 0;
  for (const length of segmentLengths) {
    for (let j = 0; j + 4 <= length; j++) {
      const i = offset + j;
      const k = (((sequence[i] * 29 + sequence[i + 1]) * 29 + sequence[i + 2]) * 29 + sequence[i + 3]);
      score += gramLogProbability.get(k) ?? unseenLogProbability;
    }
    offset += length;
  }
  return score / sequence.length;
}

function keyRowForPage(pageIndex, orientation) {
  if (orientation === 'row-major') {
    return keyTape.slice(pageIndex * 13, (pageIndex + 1) * 13);
  }
  return Array.from({ length: 13 }, (_, j) => keyTape[j * 56 + pageIndex]);
}

function decryptPage(ciphertext, keyRow, sign, literalFBypass) {
  const plaintext = [];
  let keyPosition = 0;
  for (const c of ciphertext) {
    // Test the solved-p56-style literal-F/no-clock-advance rule as a separate
    // explicit variant; this is not assumed to transfer to unknown pages.
    if (literalFBypass && c === 0) {
      plaintext.push(0);
      continue;
    }
    plaintext.push(mod29(c + sign * keyRow[keyPosition % 13]));
    keyPosition++;
  }
  return plaintext;
}

const original = pages.flatMap(p => p.indices);
const variants = [];
for (const orientation of ['row-major', 'column-major']) {
  for (const sign of [-1, 1]) {
    for (const literalFBypass of [false, true]) {
      const decoded = pages.flatMap((page, pageIndex) =>
        decryptPage(page.indices, keyRowForPage(pageIndex, orientation), sign, literalFBypass));
      variants.push({
        orientation,
        operation: sign < 0 ? 'subtract-key' : 'add-key',
        literal_f_bypass: literalFBypass,
        ioc: ioc(decoded),
        gp29_4gram_log_probability_per_rune: scoreGp4(decoded, pageLengths)
      });
    }
  }
}

const bestScore = [...variants].sort((a, b) =>
  b.gp29_4gram_log_probability_per_rune - a.gp29_4gram_log_probability_per_rune)[0];
const bestIoc = [...variants].sort((a, b) => b.ioc - a.ioc)[0];
const result = {
  hypothesis: 'The 729-rune first chapter, after dropping the fake-F initial difference, supplies 56 per-page 13-symbol additive GP29 keys.',
  source_lengths: {
    lp2_pages: 56,
    p0_p2: pageLengths.slice(0, 3),
    first_chapter_runes: firstChapter.length,
    arithmetic: '729 - 1 = 728 = 56 * 13'
  },
  prime_delta_key_tape: {
    transformed_length: delta.length,
    dropped_initial_fake_f_difference: delta[0],
    key_tape_length: keyTape.length,
    adjacent_equalities_in_key_tape: adjacentDeltaEqualities,
    first_eight_key_symbols: keyTape.slice(0, 8)
  },
  scoring: {
    model: 'Repository GP29 4-gram; first 150,000 Shakespeare characters train, last 150,000 held out; page boundaries reset 4-gram scoring.',
    raw_ciphertext: {
      ioc: ioc(original),
      gp29_4gram_log_probability_per_rune: scoreGp4(original, pageLengths)
    },
    heldout_native_english: {
      gp29_4gram_log_probability_per_rune: scoreGp4(held, [held.length])
    },
    best_score_variant: bestScore,
    best_ioc_variant: bestIoc
  },
  variants,
  decision: 'No direct additive 13-symbol per-page key variant produces native-English signal. Retire this exact consumer only; the 56x13 arithmetic alignment does not establish or exclude other uses of the 728 values.'
};

console.log(JSON.stringify(result, null, 2));
