'use strict';

/**
 * Exact original LP2 all-secret period-six GP29 additive key feasibility.
 * Windows Node22: node sims/lp2_allsecret_period6_ftransparent_exact_sft.cjs
 *
 * The same unknown six-symbol key is shared across the book, each physical
 * page chooses any start phase, and GP plaintext F bypasses key consumption.
 * Source-independent native clear-p57 plant verifies the cipher inverse.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const book = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8',
));
const pages = book.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const original = pages.flatMap((p) => p.indices);
const PERIOD = 6;
const ALL_PHASES = (1 << PERIOD) - 1;
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(book.pages[57].indices.length, 95);
for (const c of original) assert.ok(Number.isInteger(c) && c >= 0 && c < 29);

/**
 * @param {readonly number[]} input
 * @param {readonly number[]} key - Value -1 means unrestricted key symbol.
 * @param {boolean} relaxed - F clock can both skip and advance regardless of key.
 * @returns {number} First impossible source rune offset or -1.
 */
function firstImpossible(input, key, relaxed) {
  let phases = ALL_PHASES;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    let next = 0;
    for (let phase = 0; phase < PERIOD; phase++) {
      if ((phases & (1 << phase)) === 0) continue;
      const k = key[phase];
      const advance = 1 << ((phase + 1) % PERIOD);
      if (c === 0) {
        next |= 1 << phase; // Unencrypted plaintext F bypass.
        if (relaxed || k !== 0) next |= advance;
      } else if (k < 0 || k !== c) {
        next |= advance; // Must not decode a non-F ciphertext to F.
      }
    }
    phases = next;
    if (phases === 0) return i;
  }
  return -1;
}

/**
 * Every original physical page may choose an unrelated initial phase.
 * @param {readonly number[]} key
 * @param {boolean} relaxed
 * @returns {boolean}
 */
function allPagesPossible(key, relaxed) {
  return pages.every((p) => firstImpossible(p.indices, key, relaxed) === -1);
}

// A vetoed digit cannot appear in ANY phase of a book-common key.
// All other key phases are unknown, every F can advance or bypass,
// and every source page starts from all possible initial phases.
const allowed = [0];
const forbidden = [];
const key = Array(PERIOD).fill(-1);
for (let digit = 1; digit <= 28; digit++) {
  key[0] = digit;
  (allPagesPossible(key, true) ? allowed : forbidden).push(digit);
}
key[0] = -1;
assert.deepEqual(forbidden, [5, 6, 7, 12, 16, 20, 22, 27, 28]);
assert.deepEqual(allowed, [
  0, 1, 2, 3, 4, 8, 9, 10, 11, 13,
  14, 15, 17, 18, 19, 21, 23, 24, 25, 26,
]);

// The relaxed partial-key automaton accepts a superset of every possible
// completion. Rejecting a partial key therefore safely prunes every one
// of its not-yet-assigned completions; no 29^6 brute force is necessary.
const visited = Array(PERIOD + 1).fill(0);
const relaxedFeasible = Array(PERIOD + 1).fill(0);
const exactSurvivors = [];
/** @param {number} depth */
function traverse(depth) {
  visited[depth]++;
  if (!allPagesPossible(key, true)) return;
  relaxedFeasible[depth]++;
  if (depth === PERIOD) {
    if (allPagesPossible(key, false)) exactSurvivors.push([...key]);
    return;
  }
  for (const v of allowed) {
    key[depth] = v;
    traverse(depth + 1);
  }
  key[depth] = -1;
}
traverse(0);
assert.deepEqual(visited, [1, 20, 400, 780, 1160, 1540, 1920]);
assert.deepEqual(relaxedFeasible, [1, 20, 39, 58, 77, 96, 115]);
assert.deepEqual(exactSurvivors, [[0, 0, 0, 0, 0, 0]]);

// Source-native positive plant, with a six-digit nonzero key and an F-skipping
// initial phase unknown to the inverse. This prevents trivial reject-all code.
const clear = book.pages[57].indices;
const plantKey = [3, 9, 0, 24, 8, 19];
let phase = 2;
let consumed = 0;
const plant = clear.map((p) => {
  if (p === 0) return 0;
  const c = (p + plantKey[phase]) % 29;
  phase = (phase + 1) % PERIOD;
  consumed++;
  return c;
});
assert.equal(clear.filter((c) => c === 0).length, 3);
assert.equal(consumed, 92);
assert.equal(firstImpossible(plant, plantKey, false), -1);
assert.equal(allPagesPossible(Array(PERIOD).fill(0), false), true);

process.stdout.write(JSON.stringify({
  source: 'LP2 original 55 rune-bearing unknown pages',
  runeCount: original.length,
  model: 'six-position shared additive GP29 key with literal plaintext-F skip',
  excludedIndividualDigitValues: forbidden,
  remainingDigitChoices: allowed,
  partialKeyNodes: visited,
  relaxedPassingNodes: relaxedFeasible,
  survivingExactPagePhaseKeys: exactSurvivors,
  sourceNativePlantSize: clear.length,
  sourceNativePlantFSkips: clear.length - consumed,
}, null, 2) + '\n');
