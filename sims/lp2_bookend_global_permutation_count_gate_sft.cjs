/**
 * Liber Primus LP2 bookend original-input global-glyph relabeling/deletion gate.
 * SFT: node sims/lp2_bookend_global_permutation_count_gate_sft.cjs
 *
 * Reads the canonical source, checks the 81^2 / 80^2 bookend cut, and
 * computes the exact minimum substitutions needed to transform the first
 * 6,561 rune multiset into the final 6,395 visible runes, allowing deletion,
 * arbitrary position permutation, and a fixed alphabet relabeling.
 *
 * The second block's five printed numeral positions remain glyphless holes.
 * This is an exclusion for direct copying, not a claimed decryption.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

/** @param {number[]} xs @returns {number[]} */
function counts(xs) {
  const out = Array(29).fill(0);
  for (const value of xs) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    out[value] += 1;
  }
  return out;
}

/**
 * Minimum edits for fixed bijective source rune to target rune map,
 * assuming arbitrary spatial permutation and deletion of source cells.
 * @param {number[]} source
 * @param {number[]} target
 * @param {number[]} map
 * @returns {number}
 */
function fixedBound(source, target, map) {
  const mapped = Array(29).fill(0);
  assert.equal(new Set(map).size, 29);
  for (let i = 0; i < 29; i++) mapped[map[i]] = source[i];
  return target.reduce((sum, n, i) => sum + Math.max(0, n - mapped[i]), 0);
}

/**
 * Exact optimum across all 29! global rune permutations.
 * Sorted matching minimizes L1 displacement, and because the source total
 * exceeds target total, the positive-part shortfall equals substitution cost.
 * @param {number[]} source
 * @param {number[]} target
 * @returns {number}
 */
function unrestrictedBound(source, target) {
  const a = [...source].sort((x, y) => y - x);
  const b = [...target].sort((x, y) => y - x);
  return b.reduce((sum, n, i) => sum + Math.max(0, n - a[i]), 0);
}

/** @param {number[]} source @param {number[]} target */
function affineBest(source, target) {
  let best = { multiplier: 0, offset: 0, substitutions: Number.POSITIVE_INFINITY };
  for (let multiplier = 1; multiplier < 29; multiplier++) {
    for (let offset = 0; offset < 29; offset++) {
      const map = Array.from({ length: 29 }, (_, i) => (multiplier * i + offset) % 29);
      const substitutions = fixedBound(source, target, map);
      if (substitutions < best.substitutions) best = { multiplier, offset, substitutions };
    }
  }
  return best;
}

function main() {
  const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
  const corpus = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const tape = corpus.pages.filter(p => p.page >= 0 && p.page <= 55).flatMap(p => p.indices || []);
  assert.equal(tape.length, 12956);
  const bookend = [23, 11, 1, 17, 18, 10];
  assert.deepEqual(tape.slice(6555, 6561), bookend);
  assert.deepEqual(tape.slice(12950, 12956), bookend);
  const first = tape.slice(0, 6561);
  const last = tape.slice(6561);
  assert.equal(first.length, 81 ** 2);
  assert.equal(last.length, 80 ** 2 - 5);
  const numberedHoleSlots = [2244, 2384, 2476, 2575, 2672];
  assert.equal(new Set(numberedHoleSlots).size, 5);

  const a = counts(first);
  const b = counts(last);
  const identity = fixedBound(a, b, Array.from({ length: 29 }, (_, i) => i));
  const affine = affineBest(a, b);
  const allSecret = unrestrictedBound(a, b);
  assert.equal(identity, 195);
  assert.deepEqual(affine, { multiplier: 21, offset: 11, substitutions: 98 });
  assert.equal(allSecret, 16);
  const sortedA = [...a].sort((x, y) => y - x);
  const sortedB = [...b].sort((x, y) => y - x);
  assert.equal(sortedA[27], 192);
  assert.equal(sortedA[28], 190);
  assert.equal(sortedB[27], 199);
  assert.equal(sortedB[28], 199);
  const identityViolations = b.map((n, i) => (n > a[i] ? i : -1)).filter(i => i >= 0);
  assert.equal(identityViolations.length, 15);

  // Positive control: valid affine relabeling followed by 166 deletions.
  const plant = first.slice(0, 6395).map(x => (x + 7) % 29);
  assert.equal(fixedBound(a, counts(plant), Array.from({ length: 29 }, (_, i) => (i + 7) % 29)), 0);
  assert.equal(unrestrictedBound(a, counts(plant)), 0);
  // Negative control: target 6 of a class where source maximum is 5.
  const smallA = Array(29).fill(0);
  const smallB = Array(29).fill(0);
  smallA[0] = 5;
  smallA[1] = 4;
  smallB[0] = 6;
  smallB[1] = 2;
  assert.equal(unrestrictedBound(smallA, smallB), 1);

  console.log(JSON.stringify({
    test: 'LP2 81^2/80^2 global relabeling + deletion impossibility',
    source: 'resources/liber-primus/lp2-corpus.json',
    sha256_gp_index_tape: createHash('sha256').update(Buffer.from(tape)).digest('hex'),
    first_runes: first.length,
    second_visible_runes: last.length,
    original_number_hole_slots: numberedHoleSlots,
    required_deleted_source_runes_for_visible_match: first.length - last.length,
    fixed_identity_min_substitutions: identity,
    fixed_affine_all_812_min: affine,
    arbitrary_global_29factorial_min_substitutions: allSecret,
    sorted_source_rarest: sortedA.slice(-2),
    sorted_target_rarest: sortedB.slice(-2),
    identity_deficit_class_count: identityViolations.length,
    positive_and_negative_controls: 'PASS'
  }, null, 2));
}

main();
