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

// A standard independent control: Josephus(7, constant step 2) leaves item 6.
assert.deepEqual(josephus(Array(6).fill(2), 7).remaining, [6]);

const forward = josephus(totientSteps, 56);
const reversed = josephus(totientSteps.slice().reverse(), 56);
const prime = josephus(interiors.map(index => corpus.prime[index]), 56);
const ordinal = josephus(interiors.map(index => index + 1), 56);
const reducedTotient = josephus(totientSteps.map(step => step % 29 || 29), 56);
assert.equal(forward.survivor, 50);
assert.equal(reversed.survivor, 50);
assert.equal(prime.survivor, 21);
assert.equal(ordinal.survivor, 12);
assert.equal(reducedTotient.survivor, 20);
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
    runeless_numeric_page: 50
  },
  totient_steps: totientSteps,
  clockwise_forward: forward,
  clockwise_reversed_steps: reversed,
  controls: {
    original_prime_values_survivor: prime.survivor,
    gp_ordinal_plus_one_survivor: ordinal.survivor,
    totient_reduced_mod29_survivor: reducedTotient.survivor,
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