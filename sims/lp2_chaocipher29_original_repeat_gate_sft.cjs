'use strict';

/**
 * Standard Byrne Chaocipher and 29-rune generalized-wheel adjacency gate.
 * Published Chaocipher reference vector from Moshe Rubin (2010),
 * "Chaocipher Revealed: The Algorithm":
 * https://chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf
 *
 * This asks whether two independently rotating, dynamically permuted wheels
 * naturally predict LP2's 86/12955 adjacent equalities. It does not attempt
 * a blind search over all 29!^2 initial states or claim a decryption.
 *
 * SFT: node sims/lp2_chaocipher29_original_repeat_gate_sft.cjs
 * Node.js 22, CommonJS, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(original.length, 12956);
const originalAdjacentEqual = original.slice(1).reduce(
  (n, c, i) => n + Number(c === original[i]), 0);
assert.equal(originalAdjacentEqual, 86);
const observed = originalAdjacentEqual / (original.length - 1);

/**
 * Rotate to the named output character, remove the character at index 1,
 * and reinsert it at the fixed nadir.
 * @template T
 * @param {T[]} alphabet
 * @param {T} selected
 * @param {number} nadir
 * @returns {T[]}
 */
function permuteLeft(alphabet, selected, nadir) {
  const at = alphabet.indexOf(selected);
  assert(at >= 0);
  const a = alphabet.slice(at).concat(alphabet.slice(0, at));
  const extracted = a.splice(1, 1)[0];
  a.splice(nadir, 0, extracted);
  return a;
}

/**
 * Rotate to the plaintext character, rotate one further position, then
 * remove index 2 and reinsert it at the nadir.
 * @template T
 * @param {T[]} alphabet
 * @param {T} selected
 * @param {number} nadir
 * @returns {T[]}
 */
function permuteRight(alphabet, selected, nadir) {
  const at = alphabet.indexOf(selected);
  assert(at >= 0);
  const a = alphabet.slice(at + 1).concat(alphabet.slice(0, at + 1));
  const extracted = a.splice(2, 1)[0];
  a.splice(nadir, 0, extracted);
  return a;
}

/**
 * Original Chaocipher with configurable alphabet size/nadir and mode.
 * @template T
 * @param {T[]} input
 * @param {T[]} left
 * @param {T[]} right
 * @param {number} nadir
 * @param {boolean} decipher
 * @returns {T[]}
 */
function chaocipher(input, left, right, nadir, decipher = false) {
  const out = [];
  for (const symbol of input) {
    const j = (decipher ? left : right).indexOf(symbol);
    assert(j >= 0);
    const c = left[j], p = right[j];
    out.push(decipher ? p : c);
    left = permuteLeft(left, c, nadir);
    right = permuteRight(right, p, nadir);
  }
  return out;
}

// Exact 2010 original 26-character published vector is the algorithm oracle.
const left26 = [...'HXUCZVAMDSLKPEFJRIGTWOBNYQ'];
const right26 = [...'PTLNBQDEOYSFAVZKGJRIHWXUMC'];
const plain26 = [...'WELLDONEISBETTERTHANWELLSAID'];
const cipher26 = [...'OAHQHCNYNXTSZJRRHJBYHQKSOUJY'];
assert.deepEqual(chaocipher(plain26, left26, right26, 13), cipher26);
assert.deepEqual(chaocipher(cipher26, left26, right26, 13, true), plain26);

// Source-native English encoding, tested against exact independent solved p57.
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/**
 * @param {string} prose
 * @returns {number[]}
 */
function encodeGP(prose) {
  const clean = prose.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) { out.push(21); i += 3; continue; }
      if (word.startsWith('IO', i)) { out.push(27); i += 2; continue; }
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert(token, 'unsupported GP token at ' + word.slice(i));
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const knownText = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split('### 57\n')[1];
assert(knownText);
assert.deepEqual(encodeGP(knownText), corpus.pages[57].indices);
const plain = encodeGP(read('resources/control/gibran_prophet_58585.txt'))
  .slice(0, original.length);
assert.equal(plain.length, 12956);
const alphabet29 = Array.from({length: 29}, (_, i) => i);
assert.deepEqual(chaocipher(
  chaocipher(plain, alphabet29, alphabet29, 13),
  alphabet29, alphabet29, 13, true), plain);

// Deterministic independent scrambled initial alphabet pairs. Key discovery
// is not asserted. Nadir 13 is a literal classic transplant;
// 14 and 15 are two neighboring 29-position interpretations.
let seed = 0x16915a1f;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @returns {number[]} */
function permutation() {
  const result = alphabet29.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = random32() % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
/** @param {number[]} values @returns {number} */
function adjacentEqual(values) {
  let count = 0;
  for (let i = 1; i < values.length; i++)
    if (values[i] === values[i - 1]) count++;
  return count;
}
const checks = [];
for (const nadir of [13, 14, 15]) {
  const trials = [];
  for (let trial = 0; trial < 24; trial++) {
    const left = trial === 0 ? alphabet29.slice() : permutation();
    const right = trial === 0 ? alphabet29.slice() : permutation();
    const output = chaocipher(plain, left, right, nadir);
    trials.push(adjacentEqual(output));
  }
  checks.push({
    nadir, natural: trials[0], min: Math.min(...trials),
    max: Math.max(...trials), mean: trials.reduce((a, b) => a + b) / trials.length,
    expectedUniform: (plain.length - 1) / 29,
    trialCounts: trials
  });
  assert.ok(trials.every(x => x >= 250),
    'model should not accidentally be counted as source-level repeat suppression');
}
assert.equal(checks.length, 3);
console.log(JSON.stringify({
  cipher: 'Byrne Chaocipher, 29-GP rune generalization',
  source: 'exact original LP2 and source-native Gibran 12956-rune control',
  originalEqualities: originalAdjacentEqual, transitions: original.length - 1,
  observedRate: observed,
  published2010Vector: 'PASS',
  exactSolvedP57GPEncoding: 'PASS',
  full29RuneRoundTrip: 'PASS',
  randomizedInitialAlphabetTrials: checks
}, null, 2));
