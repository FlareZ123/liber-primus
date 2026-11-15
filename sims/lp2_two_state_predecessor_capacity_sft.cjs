'use strict';
/**
 * A key-independent GP29 bound for every reversible two-state predecessor rotor.
 *
 * Run: node sims/lp2_two_state_predecessor_capacity_sft.cjs
 * Source: unchanged LP2 physical-page indices from the canonical corpus.
 * The planted inversion uses original clear p57 runes and genuinely hidden state.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = source.pages.filter((p) => p.page <= 55 && p.indices.length);
const solved = source.pages.find((p) => p.page === 57).indices;
const TOTAL = pages.reduce((s, p) => s + p.indices.length, 0);
assert.equal(pages.length, 55);
assert.equal(TOTAL, 12956);
assert.equal(solved.length, 95);

/** @param {number[][]} vectors @returns {number[][]} */
function matrix(vectors) {
  const counts = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (const v of vectors) {
    for (let i = 1; i < v.length; i++) {
      counts[v[i - 1]][v[i]]++;
    }
  }
  return counts;
}
/** @param {number[][]} counts @param {number} k */
function capacity(counts, k) {
  return counts.reduce((s, row) =>
    s + row.slice().sort((a, b) => b - a).slice(0, k)
      .reduce((x, y) => x + y, 0), 0);
}

const sourceCounts = matrix(pages.map((p) => p.indices));
assert.equal(sourceCounts.flat().reduce((a, b) => a + b, 0), TOTAL - pages.length);
const B = [1, 2, 3, 4].map((k) => capacity(sourceCounts, k));
assert.deepEqual(B, [714, 1359, 1971, 2564]);
const freePageStarts = pages.length;
assert.equal(B[1] + freePageStarts, 1414);

/*
 * For each predecessor ciphertext c and each hidden bit s, a reversible
 * output alphabet is a permutation pi[c,s] of GP29. Any plaintext rune t
 * therefore occupies at most TWO ciphertext-successor columns for each c,
 * even if the hidden bit changes arbitrarily with history or plaintext.
 * The bound on occurrences of t is the sum of top TWO column counts per
 * predecessor, plus every unconstrained initial rune of every page.
 *
 * No secret-key search, assumption on bit transitions or English fitting
 * is needed. This is a bound for stationary [c,s] output maps; arbitrary
 * extra state, a changing key table and non-GP29 registers are outside it.
 */

/** @param {number} n */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number} previous @param {number} bit */
function affine(previous, bit) {
  return { a: 1 + ((previous + 13 * bit) % 28),
    b: mod(7 * previous + 11 * bit) };
}
const inverses = Array(29).fill(0);
for (let a = 1; a < 29; a++) {
  for (let n = 1; n < 29; n++) {
    if (a * n % 29 === 1) inverses[a] = n;
  }
  assert.notEqual(inverses[a], 0);
}
/** @param {number[]} plain @param {number} pageNo */
function encrypt(plain, pageNo) {
  let bit = pageNo % 2;
  const cipher = [mod(plain[0] + 11 * bit)];
  bit ^= plain[0] % 2;
  for (let i = 1; i < plain.length; i++) {
    const { a, b } = affine(cipher[i - 1], bit);
    cipher.push(mod(a * plain[i] + b));
    bit ^= plain[i] % 2;
  }
  return cipher;
}
/** @param {number[]} cipher @param {number} pageNo */
function decrypt(cipher, pageNo) {
  let bit = pageNo % 2;
  const plain = [mod(cipher[0] - 11 * bit)];
  bit ^= plain[0] % 2;
  for (let i = 1; i < cipher.length; i++) {
    const { a, b } = affine(cipher[i - 1], bit);
    plain.push(mod((cipher[i] - b) * inverses[a]));
    bit ^= plain[i] % 2;
  }
  return plain;
}

// Complete, original-length, independently known GP29 plaintext plant.
let pos = 0;
let plantTarget = 0;
const planted = pages.map((p) => {
  const plain = Array.from({ length: p.indices.length }, (_, i) =>
    solved[(pos + i) % solved.length]);
  pos += plain.length;
  plantTarget += plain.filter((v) => v === 18).length;
  const cipher = encrypt(plain, p.page);
  assert.deepEqual(decrypt(cipher, p.page), plain);
  return cipher;
});
assert.equal(pos, TOTAL);
const plantBound = capacity(matrix(planted), 2) + freePageStarts;
assert.ok(plantTarget <= plantBound,
  'Valid two-state rotor ciphertext must obey its own two-state bound');

console.log(JSON.stringify({
  source: 'original LP2 p0-55, 55 nonempty physical pages',
  runes: TOTAL,
  withinPageTransitions: TOTAL - freePageStarts,
  maxPlaintextRuneWithOneState: B[0] + freePageStarts,
  maxPlaintextRuneWithTwoStates: B[1] + freePageStarts,
  maxPlaintextRuneWithThreeStates: B[2] + freePageStarts,
  maxPlaintextRuneWithFourStates: B[3] + freePageStarts,
  twoStateRatePercent: ((B[1] + freePageStarts) / TOTAL * 100),
  nativeEnglishIllustration: '1607 E per 12956 runes, lower edge of existing Blake control windows',
  nativeEnglishExcessOverUpperBound: 1607 - (B[1] + freePageStarts),
  positivePlant: {
    source: 'actual solved p57 repeated to original page sizes',
    exactDecoded: TOTAL,
    observedRune18: plantTarget,
    measuredTwoStateCapacity: plantBound
  }
}, null, 2));
console.log('PASS: original-source two-state predecessor output-capacity theorem');
