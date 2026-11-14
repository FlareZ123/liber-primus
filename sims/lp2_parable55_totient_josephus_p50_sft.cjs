'use strict';

/**
 * Original-source PARABLE word-interior totient Josephus gate.
 *
 * Node.js 22 CommonJS. Reads repository sources and makes no file writes.
 * The 2013/2014 PARABLE's instruction to shed word circumferences gives
 * 55 interior GP runes; their prime totients drive a 56-page circular
 * Josephus elimination. The surviving physical page is the runeless
 * numerical-table p50. This is a clue hypothesis, not a decryption.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8'
);
const glyphIndex = new Map(corpus.runes.map((glyph, index) => [glyph, index]));

const terminalText = transcription.slice(
  transcription.lastIndexOf('%') + 1,
  transcription.lastIndexOf('§')
).replace(/[\/\s]/g, '');
const words = terminalText.split(/[.\-]+/).filter(Boolean);
const printed = words.flatMap(word => Array.from(word, glyph => {
  assert.ok(glyphIndex.has(glyph), 'Unexpected rune in PARABLE: ' + glyph);
  return glyphIndex.get(glyph);
}));
assert.equal(words.length, 20);
assert.equal(printed.length, 95);
assert.deepEqual(printed, corpus.pages[57].indices);
assert.equal(corpus.pages[50].runic_count, 0);
assert.equal(corpus.pages.slice(0, 56).filter(page => page.runic_count > 0).length, 55);

const wordInteriors = words.map(word => {
  const runes = Array.from(word, glyph => glyphIndex.get(glyph));
  assert.ok(runes.length >= 2);
  return runes.slice(1, -1);
});
const interiors = wordInteriors.flat();
assert.equal(interiors.length, 55);
const totientSteps = interiors.map(index => corpus.prime[index] - 1);

/**
 * Eliminate one indexed page per counting step; count the current
 * surviving page as 1 and resume at its immediate clockwise successor.
 * @param {number[]} steps - Positive integer step lengths.
 * @param {number} pageCount - Initial number of indexed pages.
 * @returns {{survivor:number|null,eliminated:number[],remaining:number[]}}
 */
function josephus(steps, pageCount) {
  const remaining = Array.from({ length: pageCount }, (_, i) => i);
  const eliminated = [];
  let cursor = 0;
  for (const step of steps) {
    assert.ok(Number.isSafeInteger(step) && step > 0);
    assert.ok(remaining.length > 0);
    cursor = (cursor + step - 1) % remaining.length;
    eliminated.push(remaining.splice(cursor, 1)[0]);
  }
  return { survivor: remaining.length === 1 ? remaining[0] : null, eliminated, remaining };
}

/**
 * Ordinary (non-eliminating) circular navigation; count the current page
 * as 1 on every step. Returns to the full original 56-page ring after
 * each hop, unlike Josephus, which removes its visited page.
 * @param {number[]} steps - Positive source step lengths.
 * @param {number} pageCount - Page-circle size.
 * @returns {number} Destination physical page index.
 */
function circularPageWalk(steps, pageCount) {
  let cursor = 0;
  for (const step of steps) {
    assert.ok(step > 0);
    cursor = (cursor + step - 1) % pageCount;
  }
  return cursor;
}
const ordinaryWalk = circularPageWalk(totientSteps, 56);
const fullPage57Steps = printed.map(index => corpus.prime[index] - 1);
const endpointSteps = words.flatMap(word => {
  const runes = Array.from(word, glyph => glyphIndex.get(glyph));
  return [corpus.prime[runes[0]] - 1, corpus.prime[runes.at(-1)] - 1];
});
const ordinaryWalkControls = {
  whole_95_runes: circularPageWalk(fullPage57Steps, 56),
  excluded_40_boundary_runes: circularPageWalk(endpointSteps, 56),
  raw_gp_primes: circularPageWalk(interiors.map(index => corpus.prime[index]), 56),
  gp_ordinal_plus_one: circularPageWalk(interiors.map(index => index + 1), 56)
};
assert.equal(totientSteps.reduce((a, b) => a + b, 0), 1952);
assert.equal(ordinaryWalk, 49);
assert.deepEqual(ordinaryWalkControls, {
  whole_95_runes: 26,
  excluded_40_boundary_runes: 33,
  raw_gp_primes: 48,
  gp_ordinal_plus_one: 13
});

// A standard independent control: Josephus(7, constant step 2) leaves item 6.
assert.deepEqual(josephus(Array(6).fill(2), 7).remaining, [6]);

const forward = josephus(totientSteps, 56);
const reversed = josephus(totientSteps.slice().reverse(), 56);
const prime = josephus(interiors.map(index => corpus.prime[index]), 56);
const ordinal = josephus(interiors.map(index => index + 1), 56);
const reducedTotient = josephus(totientSteps.map(step => step % 29 || 29), 56);
// The known p56 plaintext-F bypass, transplanted as a hypothetical skip,
// would remove only 53 pages and does not select the numerical-page spread.
const fTransparent = josephus(interiors.filter(index => index !== 0)
  .map(index => corpus.prime[index] - 1), 56);
assert.equal(forward.survivor, 50);
assert.equal(reversed.survivor, 50);
assert.equal(prime.survivor, 21);
assert.equal(ordinal.survivor, 12);
assert.equal(reducedTotient.survivor, 20);
assert.deepEqual(fTransparent.remaining, [18, 19, 55]);
assert.deepEqual(forward.eliminated.slice(0, 10), [39,49,35,43,8,40,54,27,31,46]);
assert.equal(forward.eliminated.length, 55);
assert.ok(!forward.eliminated.includes(50));

// Under all 55 circular phase shifts, the printed start phase is the
// only one for which forward AND reverse totient steps leave p50.
const phases = [];
for (let offset = 0; offset < totientSteps.length; offset++) {
  const steps = totientSteps.slice(offset).concat(totientSteps.slice(0, offset));
  if (josephus(steps, 56).survivor === 50
    && josephus(steps.slice().reverse(), 56).survivor === 50) {
    phases.push(offset);
  }
}
assert.deepEqual(phases, [0]);

// Negative shape control: no 55-rune unshorn contiguous window from the
// 95-rune PARABLE lands on p50 in the original forward reading.
const unshornWindows = [];
for (let start = 0; start <= printed.length - 55; start++) {
  const selected = printed.slice(start, start + 55)
    .map(index => corpus.prime[index] - 1);
  unshornWindows.push({
    offset: start,
    forward: josephus(selected, 56).survivor,
    reversed: josephus(selected.slice().reverse(), 56).survivor
  });
}
assert.equal(unshornWindows.length, 41);
assert.deepEqual(unshornWindows.filter(w => w.forward === 50), []);
assert.deepEqual(unshornWindows.filter(w => w.reversed === 50),
  [{ offset: 36, forward: 42, reversed: 50 }]);

// Direct cipher-consumer gate, without an unknown Fehu-bypass search.
// The genuine p56 encryptor leaves plaintext F unchanged; therefore all
// ciphertext positions BEFORE the first printed F have a unique key clock.
// Test whether the new Josephus assignment of 55 source runes to 55 pages
// selects ordinary p56 consecutive-prime φ() starting states.
const primeSieve = new Uint8Array(5001);
const ordinaryPrimes = [];
for (let n = 2; n < primeSieve.length; n++) {
  if (primeSieve[n]) continue;
  ordinaryPrimes.push(n);
  for (let k = n * n; k < primeSieve.length; k += n) primeSieve[k] = 1;
}

/**
 * Decode the exact unambiguous pre-first-F prefix of the published p56 cipher.
 * @param {number[]} cipher - Original observed GP rune indexes.
 * @param {number} startPrimeOrdinal - Zero-based starting ordinary prime index.
 * @returns {number[]} Decoded unambiguous prefix.
 */
function beforeFirstFehu(cipher, startPrimeOrdinal) {
  const firstF = cipher.indexOf(0);
  const limit = firstF === -1 ? cipher.length : firstF;
  return cipher.slice(0, limit).map((rune, i) => {
    assert.ok(ordinaryPrimes[startPrimeOrdinal + i]);
    return (rune - ((ordinaryPrimes[startPrimeOrdinal + i] - 1) % 29) + 29) % 29;
  });
}
const knownP56Prefix = beforeFirstFehu(corpus.pages[56].indices, 0);
assert.equal(
  knownP56Prefix.map(i => corpus.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETH'
);

/**
 * @param {number[]} runes - Numeric GP runes.
 * @returns {number} Unsmoothed global GP index of coincidence.
 */
function coincidence(runes) {
  const counts = new Uint32Array(29);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}
function assignedPagePrimeClock(seedFn) {
  const decoded = forward.eliminated.map((page, index) =>
    beforeFirstFehu(corpus.pages[page].indices, seedFn(interiors[index], index))
  );
  const raw = decoded.flat();
  return {
    prefix_runes: raw.length,
    ioc: coincidence(raw),
    first_p0_prefix: decoded[forward.eliminated.indexOf(0)]
      .map(i => corpus.translit[i]).join('')
  };
}
const sourcePageClock = {
  gp_ordinal: assignedPagePrimeClock(index => index),
  prime_value_as_ordinal: assignedPagePrimeClock(index => corpus.prime[index]),
  totient_value_as_ordinal: assignedPagePrimeClock(index => corpus.prime[index] - 1)
};
assert.equal(sourcePageClock.gp_ordinal.prefix_runes, 1441);
assert.ok(Math.abs(sourcePageClock.gp_ordinal.ioc - 0.03468752409592104) < 1e-12);
assert.ok(Math.abs(sourcePageClock.prime_value_as_ordinal.ioc - 0.034701981648546536) < 1e-12);
assert.ok(Math.abs(sourcePageClock.totient_value_as_ordinal.ioc - 0.034526563343357235) < 1e-12);

// Conditioning null: rearrange only the 20 complete interior word blocks,
// holding the original page count, word interiors and step values fixed.
// A planted model is not assumed; these are descriptive randomization
// frequencies, not discovery-adjusted historical-intent probabilities.
let seed = 0x3301a871;
function nextUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const blocks = wordInteriors.map(word => word.map(index => corpus.prime[index] - 1));
const N = 40000;
let forwardHits = 0;
let reverseHits = 0;
let jointHits = 0;
for (let sample = 0; sample < N; sample++) {
  const order = blocks.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = nextUint32() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const candidate = order.flatMap(index => blocks[index]);
  const hitForward = josephus(candidate, 56).survivor === 50;
  const hitReverse = josephus(candidate.slice().reverse(), 56).survivor === 50;
  if (hitForward) forwardHits++;
  if (hitReverse) reverseHits++;
  if (hitForward && hitReverse) jointHits++;
}
assert.deepEqual([forwardHits, reverseHits, jointHits], [699, 765, 14]);

console.log(JSON.stringify({
  classification: 'exact source relationship; unverified intended operation; no unknown plaintext',
  source: {
    solved_page: 57,
    original_printed_runes: printed.length,
    word_count: words.length,
    after_first_last_per_word: interiors.length,
    original_unsolved_pages: 56,
    rune_bearing_unsolved_pages: 55,
    runeless_numeric_page: 50,
    numeric_table_first_page: 49,
    numeric_table_last_page: 51
  },
  totient_steps: totientSteps,
  ordinary_circular_page_walk: { destination: ordinaryWalk, controls: ordinaryWalkControls },
  clockwise_forward: forward,
  clockwise_reversed_steps: reversed,
  controls: {
    original_prime_values_survivor: prime.survivor,
    gp_ordinal_plus_one_survivor: ordinal.survivor,
    totient_reduced_mod29_survivor: reducedTotient.survivor,
    skipped_plaintext_F_survivors: fTransparent.remaining,
    direct_known_p56_cipher_consumer: sourcePageClock,
    joint_p50_phase_shifts: phases
  },
  shuffled_whole_word_blocks: {
    seed: '0x3301a871',
    samples: N,
    forward_p50: forwardHits,
    reverse_p50: reverseHits,
    both_p50: jointHits
  }
}, null, 2));