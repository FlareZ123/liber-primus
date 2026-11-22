'use strict';

/**
 * Test every secret 29-entry GP29 Caesar lookup keyed by the previous
 * printed ciphertext word's prime sum under word-local five-back feedback.
 * No hidden alphabet is guessed; group IoC is invariant under every key.
 * Run: node sims/lp2_fiveback_prevwordprime_allsecret_original_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const trans = read('resources/liber-primus/lp2-transcription.txt');
const lookup = new Map(gp.runes.map((c, i) => [c, i]));
const pages = trans.split(/\s*%\s*/);
assert.equal(pages.length, 57);

/** @param {string} source @returns {number[][]} */
function parseWords(source) {
  return (source.replace(/[\s/]/g, '').match(/\p{Script=Runic}+/gu) || [])
    .map(word => [...word].map(rune => {
      const index = lookup.get(rune);
      assert.notEqual(index, undefined);
      return index;
    }));
}

const original = parseWords(pages.slice(0, 55).join(''));
assert.equal(original.length, 2896);
assert.equal(original.flat().length, 12956);
assert.deepEqual(original.flat(), gp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));

/** @param {number} n @returns {number} */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}
/** @param {number[]} runes @returns {number} */
function primeSum(runes) {
  return runes.reduce((sum, r) => sum + gp.prime[r], 0) % 29;
}
/**
 * The prior complete ciphertext word selects a 29-state key lookup.
 * Each printed ciphertext word is decoded to its fifth-back residual
 * D_j=C_j-(j>=5?C_{j-5}:0), grouped by that known preceding sum.
 * @param {number[][]} ciphertext
 * @returns {number[][]}
 */
function observedGroups(ciphertext) {
  const groups = Array.from({length: 29}, () => []);
  for (let i = 0; i < ciphertext.length; i++) {
    const word = ciphertext[i];
    const state = i ? primeSum(ciphertext[i - 1]) : 0;
    for (let j = 0; j < word.length; j++) {
      groups[state].push(mod29(word[j] -
        (j >= 5 ? word[j - 5] : 0)));
    }
  }
  return groups;
}
/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const hist = Array(29).fill(0);
  for (const value of values) hist[value]++;
  return hist.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
/**
 * Pair-weighted IoC within each source-observable previous-word-sum
 * class, invariant under any of the 29^29 secret Caesar lookup keys.
 * @param {number[][]} groups @returns {number}
 */
function pooledGroupCoincidence(groups) {
  let equals = 0, eligible = 0;
  for (const group of groups) {
    const pairs = group.length * (group.length - 1);
    eligible += pairs;
    equals += coincidence(group) * pairs;
  }
  return equals / eligible;
}

const sourceGroups = observedGroups(original);
assert.ok(sourceGroups.every(group => group.length > 1));
assert.equal(sourceGroups.reduce((n, group) => n + group.length, 0), 12956);
const originalRate = pooledGroupCoincidence(sourceGroups);
assert.ok(Math.abs(originalRate - 0.03446641349702658) < 1e-14);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} originalWord @returns {number[]} */
function encodeGP(originalWord) {
  const text = originalWord.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (text.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => text.startsWith(t.s, i));
      assert.ok(token, 'source word is GP-encodable');
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const reference = read('resources/control/gibran_prophet_58585.txt');
const buckets = Array.from({length: 20}, () => []);
for (const word of reference.match(/[a-zA-Z]+/g) || []) {
  const encoded = encodeGP(word);
  if (encoded.length < buckets.length) buckets[encoded.length].push(encoded);
}
assert.ok(original.every(word => buckets[word.length].length > 0));

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let state = (seed ^ 0x3301af75) >>> 0;
  return () => ((state =
    (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}
/**
 * An independent hidden 29-value lookup encrypts actual source-native
 * GP words, with exactly the original source's 2,896 word lengths.
 * @param {number[][]} plaintext
 * @param {number[]} hidden
 * @returns {number[][]}
 */
function encipher(plaintext, hidden) {
  const output = [];
  let state = 0;
  for (const plain of plaintext) {
    const key = hidden[state];
    const cipher = [];
    for (let j = 0; j < plain.length; j++) {
      cipher.push(mod29(plain[j] + key +
        (j >= 5 ? cipher[j - 5] : 0)));
    }
    output.push(cipher);
    state = primeSum(cipher);
  }
  return output;
}
/**
 * The genuine hidden key is used exclusively to check a synthetic
 * positive; it never enters original-cipher measurements.
 * @param {number[][]} ciphertext
 * @param {number[]} hidden
 * @returns {number[][]}
 */
function decipher(ciphertext, hidden) {
  const output = [];
  let state = 0;
  for (const cipher of ciphertext) {
    const key = hidden[state];
    output.push(cipher.map((value, j) => mod29(value -
      (j >= 5 ? cipher[j - 5] : 0) - key)));
    state = primeSum(cipher);
  }
  return output;
}

const controls = [];
for (let run = 0; run < 80; run++) {
  const rand = random(run);
  const hidden = Array.from({length: 29}, () => Math.floor(rand() * 29));
  const native = original.map(word => {
    const bucket = buckets[word.length];
    return bucket[Math.floor(rand() * bucket.length)];
  });
  const cipher = encipher(native, hidden);
  assert.deepEqual(decipher(cipher, hidden), native,
    'all original-format GP source words exactly recovered');
  controls.push(pooledGroupCoincidence(observedGroups(cipher)));
}
assert.equal(controls.length, 80);
assert.ok(controls.every(rate => rate > originalRate));
assert.ok(Math.min(...controls) > 0.058);
assert.ok(Math.max(...controls) < 0.062);
const sorted = controls.slice().sort((a, b) => a - b);
console.log(JSON.stringify({
  original_runes: 12956,
  original_words: 2896,
  original_prevwordprime_classes: 29,
  every_secret_key_is_one_of_29_power_29_lookup_tables: true,
  original_key_invariant_group_ioc: originalRate,
  native_reference: 'Gibran The Prophet GP-source-calibrated words',
  native_control_books: controls.length,
  native_control_min_ioc: sorted[0],
  native_control_median_ioc: sorted[40],
  native_control_max_ioc: sorted[79],
  native_control_at_or_below_original: 0,
  synthetic_plant_recovery: '80 x 12956/12956',
  authenticated_unknown_plaintext_recovered: false
}, null, 2));
