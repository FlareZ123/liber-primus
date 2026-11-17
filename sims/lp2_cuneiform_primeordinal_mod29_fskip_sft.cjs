'use strict';

/**
 * Source-constrained prime-ordinal residue key with solved-p56 literal-F
 * clock semantics, tested on the original p33..p39 marked interval.
 *
 * The 2013 prime_echo source pauses at 1033 and 3301. Their one-based prime
 * ranks are 174 and 464. The separately highlighted p15 red value 3299 is
 * prime rank 463. Modulo the 29-symbol GP alphabet these ranks give:
 *   174 -> 0, 463 -> 28, 464 -> 0.
 * Thus ranks 174..463 are ten repetitions of 0..28.
 *
 * Hypothesis only: use rank mod 29 as an additive key, with the independently
 * solved p56 rule that plaintext F is transparent and does not consume a key
 * symbol. Test both signs and the two source-plausible clocks: continuous from
 * p33's 1033 marker, or reset at each marked physical page.
 *
 * Run from repository root:
 *   node sims/lp2_cuneiform_primeordinal_mod29_fskip_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const mod29 = n => ((n % 29) + 29) % 29;

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primes = firstPrimes(464);
const rankOf = value => primes.indexOf(value) + 1;
assert.equal(rankOf(1033), 174);
assert.equal(rankOf(3299), 463);
assert.equal(rankOf(3301), 464);
assert.equal(174 % 29, 0);
assert.equal(463 % 29, 28);
assert.equal(464 % 29, 0);

const selected = primes.slice(173, 463); // ranks 174..463, inclusive
assert.equal(selected.length, 290);
const key = selected.map((_, i) => (174 + i) % 29);
assert.deepEqual(key, Array.from({ length: 10 }, () =>
  Array.from({ length: 29 }, (_, i) => i)).flat());
assert.equal(key[0], 0);
assert.equal(key.at(-1), 28);

// The cuneiform 1033 marker follows the 91-rune preface on physical p33.
// The marked interval then continues through the end of physical p39.
const sourcePages = corpus.pages
  .filter(p => p.page >= 33 && p.page <= 39)
  .sort((a, b) => a.page - b.page);
assert.deepEqual(sourcePages.map(p => p.page), [33, 34, 35, 36, 37, 38, 39]);
const segments = sourcePages.map(p => ({
  page: p.page,
  indices: p.page === 33 ? p.indices.slice(91) : p.indices
}));
assert.deepEqual(segments.map(s => s.indices.length), [123, 261, 271, 238, 228, 228, 240]);
assert.equal(segments.reduce((n, s) => n + s.indices.length, 0), 1589);

function addCount(map, phase, count) {
  map.set(phase, (map.get(phase) || 0n) + count);
}

/**
 * All-history inverse reachability for the p56 literal-F rule.
 * Cipher F may be plaintext F (no key advance) or encrypted non-F
 * (consume a key symbol). Non-F ciphertext must decode to non-F plaintext.
 *
 * @param {{page:number,indices:number[]}[]} inputSegments
 * @param {boolean} resetAtPage
 * @param {-1|1} sign P = C + sign*K (mod 29)
 */
function decodeReachability(inputSegments, resetAtPage, sign) {
  let states = new Map([[0, 1n]]);
  let globalOffset = 0;
  let firstFailure = null;
  const pageResults = [];

  for (const segment of inputSegments) {
    if (resetAtPage) states = new Map([[0, 1n]]);
    let localOffset = 0;

    for (const c of segment.indices) {
      const next = new Map();
      for (const [phase, count] of states) {
        // Literal plaintext F: preserve ciphertext F and do not consume K.
        if (c === 0) addCount(next, phase, count);

        // Ordinary encrypted non-F: consume the current rank-residue key.
        const p = mod29(c + sign * phase);
        if (p !== 0) addCount(next, (phase + 1) % 29, count);
      }

      states = next;
      if (states.size === 0) {
        firstFailure = {
          page: segment.page,
          local_offset: localOffset,
          marked_interval_offset: globalOffset + localOffset,
          ciphertext_index: c
        };
        break;
      }
      localOffset++;
    }

    pageResults.push({
      page: segment.page,
      runes: segment.indices.length,
      reachable_phases_after_page: states.size,
      reachable_path_count_after_page:
        [...states.values()].reduce((a, b) => a + b, 0n).toString()
    });
    if (firstFailure) break;
    globalOffset += segment.indices.length;
  }

  return {
    total_processed: firstFailure
      ? firstFailure.marked_interval_offset + 1
      : globalOffset,
    firstFailure,
    final_reachable_phases: states.size,
    final_reachable_path_count:
      [...states.values()].reduce((a, b) => a + b, 0n).toString(),
    pageResults
  };
}

/**
 * Encrypt a known plaintext plant under the exact candidate clock.
 * Plaintext F is emitted literally and does not consume the key.
 */
function encodeKnownPlaintext(plainSegments, resetAtPage, sign) {
  let phase = 0;
  return plainSegments.map(segment => {
    if (resetAtPage) phase = 0;
    const cipher = [];
    const skipMask = [];
    for (const p of segment.indices) {
      if (p === 0) {
        cipher.push(0);
        skipMask.push(true);
      } else {
        cipher.push(mod29(p - sign * phase));
        skipMask.push(false);
        phase = (phase + 1) % 29;
      }
    }
    return { page: segment.page, indices: cipher, skipMask };
  });
}

function decodeKnownMask(cipherSegments, resetAtPage, sign, expectedSegments) {
  let phase = 0;
  for (let s = 0; s < cipherSegments.length; s++) {
    if (resetAtPage) phase = 0;
    const cipher = cipherSegments[s].indices;
    const mask = cipherSegments[s].skipMask;
    const expected = expectedSegments[s].indices;
    const recovered = [];
    for (let i = 0; i < cipher.length; i++) {
      if (mask[i]) {
        assert.equal(cipher[i], 0);
        recovered.push(0);
      } else {
        const p = mod29(cipher[i] + sign * phase);
        assert.notEqual(p, 0);
        recovered.push(p);
        phase = (phase + 1) % 29;
      }
    }
    assert.deepEqual(recovered, expected);
  }
}

const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const nativePlant = segments.map(segment => ({
  page: segment.page,
  indices: Array.from(
    { length: segment.indices.length },
    (_, i) => p57[i % p57.length]
  )
}));

const cases = [];
for (const resetAtPage of [false, true]) {
  for (const sign of [-1, 1]) {
    const original = decodeReachability(segments, resetAtPage, sign);
    const plantCipher = encodeKnownPlaintext(nativePlant, resetAtPage, sign);
    decodeKnownMask(plantCipher, resetAtPage, sign, nativePlant);
    const plantReachability = decodeReachability(
      plantCipher.map(({ page, indices }) => ({ page, indices })),
      resetAtPage,
      sign
    );
    assert.equal(plantReachability.firstFailure, null);

    cases.push({
      clock: resetAtPage ? 'reset at each printed page' : 'continuous from p33 offset91',
      decoder: sign === -1 ? 'P=C-K' : 'P=C+K',
      original,
      sourceNativePositive: {
        exactKnownMaskRoundtrip: true,
        allHistoryReachable: true,
        planted_runes: nativePlant.reduce((n, s) => n + s.indices.length, 0)
      },
      plantReachability
    });
  }
}

// Frozen original-input predictions; no phase, sign, or reset was fitted.
const expected = [
  [false, -1, 137, 34, 14],
  [false,  1, 251, 34, 128],
  [true,  -1, 139, 34, 16],
  [true,   1, 144, 34, 21]
];
for (let i = 0; i < expected.length; i++) {
  const [reset, sign, offset, page, local] = expected[i];
  const result = cases[i].original;
  assert.equal(result.firstFailure.marked_interval_offset, offset);
  assert.equal(result.firstFailure.page, page);
  assert.equal(result.firstFailure.local_offset, local);
  assert.equal(result.final_reachable_phases, 0);
}

console.log(JSON.stringify({
  source: {
    prime_echo_rank_174: 1033,
    highlighted_p15_prime_rank_463: 3299,
    prime_echo_rank_464: 3301,
    selected_prime_ranks: [174, 463],
    selected_prime_count: selected.length,
    rank_residues: [174 % 29, 463 % 29, 464 % 29],
    rank_key_period: 29,
    repeated_key_cycles_in_source_interval: 10,
    p33_preface_skipped_runes: 91,
    marked_page_lengths: segments.map(s => s.indices.length),
    marked_original_runes: 1589
  },
  cipher_hypothesis:
    'additive GP29 rank-mod-29 key with source-authenticated p56 plaintext-F nonconsumption',
  tested_models: cases.length,
  cases
}, null, 2));
