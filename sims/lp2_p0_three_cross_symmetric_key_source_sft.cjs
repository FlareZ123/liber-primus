'use strict';

/**
 * Source-selected per-page central inversion gate for a symmetric additive
 * GP29 secret key, using the original p0–p2 180-degree cross ornaments.
 *
 * The original 2400x3600 pages 17–19 each print a distinctive left cross
 * that is the right cross turned by 180 degrees around the page centre.
 * Test only the literal matching rune-index involution i ↔ N−1−i,
 * both on each independent source page and over the whole three-page
 * exactly 729-rune block. This is a scoped observation, not a claimed cipher.
 *
 * For C_i=P_i+K_i (mod29) with K_i=K_{N−1−i},
 * C_i==C_{N−1−i} iff P_i==P_{N−1−i}. This is independent
 * of every unknown key value. A true long native GP29 plaintext should
 * carry its ordinary equal-letter probability to the ciphertext.
 *
 * Run: node sims/lp2_p0_three_cross_symmetric_key_source_sft.cjs
 * Node 22 CommonJS, no external dependencies, reads source files only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (p) => JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', p), 'utf8'));
const original = read('resources/liber-primus/lp2-corpus.json');
const solved = read('resources/external/relikd-solved-gp29-native-v1.json');
assert.equal(original.pages.slice(0, 3)
  .reduce((sum, p) => sum + p.indices.length, 0), 729);

/** @param {number[]} values */
function mirroredEqualCount(values) {
  let matched = 0;
  for (let i = 0, j = values.length - 1; i < j; i++, j--) {
    if (values[i] === values[j]) matched++;
  }
  return matched;
}

/** @param {number[]} plain @returns {number[]} */
function symmetricPositivePlant(plain) {
  const cipher = Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    const key = (7 + 11 * Math.min(i, plain.length - 1 - i)) % 29;
    cipher[i] = (plain[i] + key) % 29;
  }
  assert.equal(mirroredEqualCount(cipher), mirroredEqualCount(plain));
  for (let i = 0; i < cipher.length; i++) {
    const key = (7 + 11 * Math.min(i, plain.length - 1 - i)) % 29;
    assert.equal((cipher[i] - key + 29) % 29, plain[i]);
  }
  return cipher;
}

const lengths = [262, 266, 201];
const pages = original.pages.slice(0, 3).map((p, i) => {
  assert.equal(p.indices.length, lengths[i]);
  return p.indices;
});
const observedPageEqual = pages.map(mirroredEqualCount);
assert.deepEqual(observedPageEqual, [0, 4, 2]);
assert.equal(mirroredEqualCount(pages.flat()), 10);

const reference = solved.sections.map(section => ({
  name: section.name,
  runes: Array.from(section.source_text)
    .filter(ch => solved.runes.includes(ch))
    .map(ch => solved.runes.indexOf(ch)),
}));
const sourceLen = reference.reduce((sum, p) => sum + p.runes.length, 0);
assert.equal(sourceLen, 2979);
const windows = lengths.map((n) => {
  const counts = Array(30).fill(0);
  for (const section of reference) {
    for (let i = 0; i + n <= section.runes.length; i++) {
      counts[mirroredEqualCount(section.runes.slice(i, i + n))]++;
    }
  }
  return counts;
});
const totals = windows.map(counts => counts.reduce((a, b) => a + b, 0));
assert.deepEqual(totals, [1325, 1309, 1569]);

// Deterministic exact convolution: independently draw one uniformly chosen
// length-matched contiguous window from each solved-source multiset.
// Overlapping controls make this an empirical calibration, not an iid p-value.
let distribution = [1];
for (const counts of windows) {
  const total = counts.reduce((a, b) => a + b);
  const next = Array(distribution.length + counts.length - 1).fill(0);
  for (let i = 0; i < distribution.length; i++) {
    for (let j = 0; j < counts.length; j++) {
      next[i + j] += distribution[i] * counts[j] / total;
    }
  }
  distribution = next;
}
const observedTotal = observedPageEqual.reduce((s, x) => s + x, 0);
const empiricalLowTail = distribution.slice(0, observedTotal + 1)
  .reduce((a, b) => a + b, 0);
assert.ok(Math.abs(empiricalLowTail - 0.00002447164449019197) < 1e-12);

const section = (name) => reference.find(x => x.name === name).runes;
const plants = [
  section('0_koan_1').slice(0, lengths[0]),
  section('0_welcome').slice(0, lengths[1]),
  section('0_loss_of_divinity').slice(0, lengths[2]),
];
const positivePairs = plants.map(p => mirroredEqualCount(symmetricPositivePlant(p)));
assert.deepEqual(positivePairs, [11, 6, 7]);

const p729 = [];
for (const section of reference) {
  for (let i = 0; i + 729 <= section.runes.length; i++) {
    p729.push(mirroredEqualCount(section.runes.slice(i, i + 729)));
  }
}
assert.equal(p729.length, 79);
assert.equal(Math.min(...p729), 13);
assert.ok(p729.every(n => n > 10));

const result = {
  originalPages: [0, 1, 2],
  keyAssumption: 'K[i]=K[N-1-i] per original physical page, additive GP29',
  originalRuneLengths: lengths,
  originalMirroredEqualPairs: observedPageEqual,
  observedPooledEqualPairs: observedTotal,
  distinctSolvedTextWindowCounts: totals,
  controlWindowExpectedPairs: windows.map((counts, idx) =>
    counts.reduce((sum, n, j) => sum + j * n, 0) / totals[idx]),
  empiricalNativeIndependentWindowLowTail: empiricalLowTail,
  whole729OriginalMirroredEquals: 10,
  nativeSolvedLength729Min: Math.min(...p729),
  nativeSolvedLength729Windows: p729.length,
  positivePlantMirrorPairs: positivePairs,
  positivePlantExactReencryption: true,
  decision: 'Negative under native GP29 text: symmetric per-page key-pairs cannot create the original 0/4/2 mirrored equal-pair deficit. No unknown plaintext recovered.',
};
console.log(JSON.stringify(result, null, 2));
console.log('PASS: native planted symmetric pads preserve exact original mirrored-pair invariant.');
