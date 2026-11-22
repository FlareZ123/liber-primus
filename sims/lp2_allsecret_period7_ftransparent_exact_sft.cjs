'use strict';

/**
 * LP2 original: all-secret period-seven F-transparent GP29 additive gate.
 * Windows: node sims/lp2_allsecret_period7_ftransparent_exact_sft.cjs
 *
 * Exhaust every feasible common seven-digit key without searching 29^7.
 * Overapproximated partial-key automata reject entire subtrees safely.
 * Each original rune-bearing page may pick an independent starting phase;
 * all ciphertext-F interpretations legal under solved p56 are retained.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8',
));
const PERIOD = 7;
const ALL_PHASES = (1 << PERIOD) - 1;
const pages = data.pages.filter((p) => p.page <= 55 && p.indices.length !== 0);
const cipher = pages.flatMap((p) => p.indices);
assert.equal(pages.length, 55);
assert.equal(cipher.length, 12956);
assert.equal(data.pages[57].indices.length, 95);
for (const v of cipher) assert.ok(Number.isInteger(v) && v >= 0 && v < 29);

/**
 * Return first impossible rune offset, or -1 if at least one path survives.
 * Phase is key index at this source position. Unknown partial assignments
 * use -1. With relaxed=true every ciphertext F can advance OR skip even
 * where a concrete key would disallow one branch, making this a safe
 * necessary condition for EVERY completion of the assigned digits.
 *
 * @param {readonly number[]} source
 * @param {readonly number[]} key
 * @param {boolean} relaxed
 * @returns {number}
 */
function firstImpossible(source, key, relaxed) {
  let states = ALL_PHASES;
  for (let i = 0; i < source.length; i++) {
    let next = 0;
    const c = source[i];
    for (let j = 0; j < PERIOD; j++) {
      if ((states & (1 << j)) === 0) continue;
      const k = key[j];
      const advance = 1 << ((j + 1) % PERIOD);
      if (c === 0) {
        next |= 1 << j; // Native plaintext F always bypasses the key.
        if (relaxed || k !== 0) next |= advance;
      } else if (k < 0 || k !== c) {
        // If C==K, the inverse would be forbidden encrypted plaintext F.
        next |= advance;
      }
    }
    states = next;
    if (states === 0) return i;
  }
  return -1;
}

/**
 * Entire original with an arbitrary new starting phase on each page.
 * This is strictly more permissive than a continuous book clock.
 *
 * @param {readonly number[]} key
 * @param {boolean} relaxed
 * @returns {boolean}
 */
function allPagesPossible(key, relaxed) {
  for (const page of pages) {
    if (firstImpossible(page.indices, key, relaxed) >= 0) return false;
  }
  return true;
}

/**
 * Positive source-native plant using transparent plaintext F.
 *
 * @param {readonly number[]} plain
 * @param {readonly number[]} key
 * @param {number} startPhase
 * @returns {{cipher: number[], consumed: number}}
 */
function encryptPlant(plain, key, startPhase) {
  let phase = startPhase;
  let consumed = 0;
  const result = plain.map((p) => {
    if (p === 0) return 0;
    const c = (p + key[phase]) % 29;
    phase = (phase + 1) % PERIOD;
    consumed++;
    return c;
  });
  return {cipher: result, consumed};
}

const plantKey = [0, 14, 2, 0, 5, 0, 8];
const clearPage = data.pages[57].indices;
const plant = encryptPlant(clearPage, plantKey, 4);
assert.equal(clearPage.filter((v) => v === 0).length, 3);
assert.equal(plant.consumed, 92);
assert.equal(firstImpossible(plant.cipher, plantKey, false), -1);

// Exclude a single nonzero key digit if ANY original page refutes it,
// while granting all remaining phases an unknown unrestricted key and
// granting both F clock moves. Cyclic relabelling puts the test at slot 0.
const options = [0];
const excludedSingleDigits = [];
for (let v = 1; v <= 28; v++) {
  const partial = Array(PERIOD).fill(-1);
  partial[0] = v;
  let witness = null;
  for (const page of pages) {
    const localOffset = firstImpossible(page.indices, partial, true);
    if (localOffset >= 0) {
      witness = {value: v, page: page.page, localOffset};
      break;
    }
  }
  if (witness) excludedSingleDigits.push(witness);
  else options.push(v);
}
assert.deepEqual(options, [
  0, 1, 2, 3, 4, 6, 7, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27,
]);
assert.equal(excludedSingleDigits.length, 5);

// A monotone exact-cover search of all permitted key tuples. A partially
// assigned key that fails the relaxed overapproximation cannot possibly
// have ANY valid extension, so we skip its whole remaining key subtree.
const key = Array(PERIOD).fill(-1);
const visited = Array(PERIOD + 1).fill(0);
const alive = Array(PERIOD + 1).fill(0);
const survivors = [];
let relaxedFullKeys = 0;

/** @param {number} depth */
function search(depth) {
  visited[depth]++;
  if (!allPagesPossible(key, true)) return;
  alive[depth]++;
  if (depth === PERIOD) {
    relaxedFullKeys++;
    if (allPagesPossible(key, false)) survivors.push([...key]);
    return;
  }
  for (const value of options) {
    key[depth] = value;
    search(depth + 1);
  }
  key[depth] = -1;
}
search(0);

assert.deepEqual(visited, [1, 24, 576, 2088, 4440, 7560, 11448, 16176]);
assert.deepEqual(alive, [1, 24, 87, 185, 315, 477, 674, 911]);
assert.equal(relaxedFullKeys, 911);
assert.equal(survivors.length, 8);

// Those eight are the identity and rotations of [14,0,0,0,0,0,0].
assert.ok(survivors.some((k) => k.every((v) => v === 0)));
for (const k of survivors) {
  const nonzero = k.filter((v) => v !== 0);
  assert.ok(nonzero.length === 0 ||
    (nonzero.length === 1 && nonzero[0] === 14));
}

// On the whole book with no page phase resets, all seven nonzero keys
// become impossible at the SAME original global rune offset 971.
const identity = Array(PERIOD).fill(0);
assert.equal(firstImpossible(cipher, identity, false), -1);
for (const k of survivors) {
  if (k.some((v) => v !== 0)) {
    assert.equal(firstImpossible(cipher, k, false), 971);
  }
}

// Each page may begin at the most favorable phase. At most ceil(length/7)
// positions per original page can have the one nonzero key digit and thus
// differ from the ciphertext. Minimize empirical 29-class entropy over ALL
// conceivable <=M arbitrary rune edits by maximizing concentration:
// move counts from the sparsest bins into the originally largest bin.
const maxEdits = pages.reduce(
  (sum, page) => sum + Math.ceil(page.indices.length / PERIOD), 0,
);
assert.equal(maxEdits, 1873);
const frequencies = Array(29).fill(0);
for (const c of cipher) frequencies[c]++;
/** @param {readonly number[]} counts */
function entropy(counts) {
  const n = counts.reduce((total, count) => total + count, 0);
  return counts.reduce((total, count) => {
    if (!count) return total;
    const p = count / n;
    return total - p * Math.log2(p);
  }, 0);
}
const lowerBoundCounts = [...frequencies];
const largest = frequencies.indexOf(Math.max(...frequencies));
const donors = frequencies.map((count, i) => ({count, i}))
  .filter(({i}) => i !== largest)
  .sort((a, b) => a.count - b.count || a.i - b.i);
let left = maxEdits;
for (const {i} of donors) {
  if (left <= 0) break;
  const change = Math.min(left, lowerBoundCounts[i]);
  lowerBoundCounts[i] -= change;
  lowerBoundCounts[largest] += change;
  left -= change;
}
assert.equal(left, 0);
assert.ok(Math.abs(entropy(frequencies) - 4.856503613708271) < 1e-12);
assert.ok(Math.abs(entropy(lowerBoundCounts) - 4.423603076224787) < 1e-12);

const result = {
  model: 'any shared period-seven GP29 additive key, literal plaintext-F bypass',
  pages: pages.length,
  runes: cipher.length,
  vetoedNonzeroDigits: excludedSingleDigits,
  perSlotChoices: options,
  searchNodes: visited,
  survivingRelaxedNodes: alive,
  fullyAssignedRelaxedKeys: relaxedFullKeys,
  exactPageResetKeys: survivors,
  nonzeroContinuousKeyFirstImpossibleAt: 971,
  maximumRuneChangesUnderSurvivingNonzeroKey: maxEdits,
  originalEntropyBits: entropy(frequencies),
  minimumPossiblePlaintextEntropyBits: entropy(lowerBoundCounts),
  sourceNativePlantRunes: clearPage.length,
  sourceNativePlantKeysConsumed: plant.consumed,
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
