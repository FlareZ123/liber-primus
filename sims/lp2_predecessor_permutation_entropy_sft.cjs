'use strict';
/**
 * Original-LP2 key-independent predecessor-permutation entropy gate.
 *
 * Contract: C_i = permutation[C_(i-1)](P_i), where each permutation of
 * GP29 is fixed across the entire unsolved book. One reset per physical page.
 * No secret state, external pad, variable length, or changing page key.
 *
 * The finite-sample identity is H(C_i | C_(i-1)) = H(P_i | C_(i-1))
 * <= H(P_i). It holds for every possible secret choice of 29 permutations.
 *
 * Run: node sims/lp2_predecessor_permutation_entropy_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tokens = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} source @returns {number[]} */
function gp(source) {
  const words = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || [];
  const numbers = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find((x) => word.startsWith(x.token, i));
      assert(t, 'Unknown GP29 token: ' + word.slice(i));
      numbers.push(t.index);
      i += t.token.length;
    }
  }
  return numbers;
}
/** @param {number[]} data @returns {number} */
function entropy(data) {
  const counts = Array(29).fill(0);
  for (const value of data) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value]++;
  }
  return -counts.reduce((sum, n) => n === 0 ? sum :
    sum + (n / data.length) * Math.log2(n / data.length), 0);
}
/**
 * Empirical H(nextSymbol | previousState), over original physical-page
 * transitions only. States can be ciphertext or any other GP29 sequence.
 * @param {number[][]} symbols
 * @param {number[][]} states
 * @returns {number}
 */
function conditionalEntropy(symbols, states) {
  assert.equal(symbols.length, states.length);
  const rows = Array.from({length: 29}, () => Array(29).fill(0));
  const counts = Array(29).fill(0);
  let total = 0;
  for (let page = 0; page < symbols.length; page++) {
    assert.equal(symbols[page].length, states[page].length);
    for (let i = 1; i < symbols[page].length; i++) {
      const state = states[page][i - 1];
      const symbol = symbols[page][i];
      assert(state >= 0 && state < 29 && symbol >= 0 && symbol < 29);
      rows[state][symbol]++;
      counts[state]++;
      total++;
    }
  }
  assert(total > 0);
  let weighted = 0;
  for (let s = 0; s < 29; s++) {
    if (counts[s] === 0) continue;
    const n = counts[s];
    const rowEntropy = -rows[s].reduce((sum, count) => count === 0 ? sum :
      sum + (count / n) * Math.log2(count / n), 0);
    weighted += rowEntropy * n / total;
  }
  return weighted;
}
/** @param {number[][]} pages @returns {number} */
function transitions(pages) {
  return pages.reduce((sum, p) => sum + Math.max(0, p.length - 1), 0);
}
/** @param {number[][]} pages @returns {number} */
function doublets(pages) {
  return pages.reduce((sum, p) => sum + p.reduce((n, v, i) =>
    n + (i > 0 && v === p[i - 1] ? 1 : 0), 0), 0);
}
const original = db.pages.filter((p) => p.page <= 55).map((p) => p.indices);
const originalFlat = original.flat();
assert.equal(original.length, 56);
assert.equal(originalFlat.length, 12956);
assert.equal(transitions(original), 12901);
assert.equal(doublets(original), 86);
const originalH = entropy(originalFlat);
const originalConditionalH = conditionalEntropy(original, original);
assert(Math.abs(originalH - 4.856503613708271) < 1e-10);
assert(Math.abs(originalConditionalH - 4.785306737223472) < 1e-10);
const controlPaths = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
];
const controls = controlPaths.map((file) => {
  const numbers = gp(read(file));
  return {file, runeCount: numbers.length, entropy: entropy(numbers), numbers};
});
assert.deepEqual(controls.map((c) => c.runeCount), [63114, 218800, 324630]);
assert(controls.every((c) => c.entropy < originalConditionalH - 0.4));
const p57H = entropy(db.pages.find((p) => p.page === 57).indices);
/**
 * Source-native positive control: choose rare EA after seeing the original
 * doublet count; it occurs exactly 86 times in the fixed native window.
 * EA emits preceding cipher rune; remaining 28 GP29 runes are cyclically
 * shifted. Every previous-cipher rune selects a full 29-symbol bijection.
 * This is a capacity illustration, never a claimed historical key.
 * @param {number[][]} plainPages
 * @returns {number[][]}
 */
function encode(plainPages) {
  return plainPages.map((plain) => {
    const cipher = [];
    for (let i = 0; i < plain.length; i++) {
      const value = plain[i];
      if (i === 0) cipher.push(value);
      else if (value === 28) cipher.push(cipher[i - 1]);
      else cipher.push((cipher[i - 1] + 1 + value) % 29);
    }
    return cipher;
  });
}
/** @param {number[][]} cipherPages @returns {number[][]} */
function decode(cipherPages) {
  return cipherPages.map((cipher) => cipher.map((value, i) => {
    if (i === 0) return value;
    const prev = cipher[i - 1];
    return value === prev ? 28 : (value - prev - 1 + 29) % 29;
  }));
}
const native = controls[1].numbers.slice(1500, 1500 + originalFlat.length);
assert.equal(native.length, originalFlat.length);
const plainPages = [];
let offset = 0;
for (const page of original) {
  plainPages.push(native.slice(offset, offset + page.length));
  offset += page.length;
}
assert.equal(offset, native.length);
const cipherPages = encode(plainPages);
assert.deepEqual(decode(cipherPages), plainPages);
assert.equal(doublets(cipherPages), doublets(original));
const nativeH = entropy(plainPages.flat());
const syntheticH = entropy(cipherPages.flat());
const syntheticConditionalH = conditionalEntropy(cipherPages, cipherPages);
const originalPlainGivenCipherStateH = conditionalEntropy(plainPages, cipherPages);
assert(Math.abs(syntheticConditionalH - originalPlainGivenCipherStateH) < 1e-12);
assert(syntheticConditionalH <= entropy(plainPages.flatMap((p) => p.slice(1))));
assert(Math.abs(syntheticH - originalH) < 0.00002);
assert(Math.abs(syntheticConditionalH - 4.2129849361225045) < 1e-10);
if (require.main === module) console.log(JSON.stringify({
  status: 'PASS',
  scope: 'Fixed 29-row GP29 permutation indexed by prior ciphertext rune',
  original: {runes: originalFlat.length, transitions: transitions(original),
    doublets: doublets(original), symbolEntropy: originalH,
    conditionalEntropy: originalConditionalH},
  nativeControls: controls.map(({file, runeCount, entropy: h}) =>
    ({file, runeCount, symbolEntropy: h})),
  solvedP57: {runes: 95, symbolEntropy: p57H},
  syntheticShakespearePlant: {runes: native.length,
    plainEntropy: nativeH, cipherEntropy: syntheticH,
    cipherConditionalEntropy: syntheticConditionalH,
    equalityCount: doublets(cipherPages), exactDecoder: true,
    matchedOriginalRepeatCount: true},
  theorem: 'For every fixed predecessor-indexed GP29 permutation, the exact empirical next-plaintext entropy must be at least the observed original conditional entropy.',
  caveat: 'Does not apply to an evolving secret key, page-specific changes, variable-length coding, hidden state, or arbitrary high-entropy plaintext.'
}, null, 2));
module.exports = {gp, entropy, conditionalEntropy, encode, decode};
