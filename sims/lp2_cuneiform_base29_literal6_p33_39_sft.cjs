'use strict';

// A source-bounded test of the authenticated 2013 BASE29 conversion on LP2 p33-39.
// The six-rune GP29 key and its use as a Vigenere key are *investigator hypotheses*.
// No original Cicada source selects the GP digit->rune mapping or this cipher.
// Run on Windows 11 / Node.js 22: node sims/lp2_cuneiform_base29_literal6_p33_39_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8'
);
const digits = '0123456789ABCDEFGHIJKLMNOPQRS';

/** @param {number} value Positive integer. @returns {string} Historical numeral. */
function base29(value) {
  let n = value;
  let result = '';
  while (n) {
    result = digits[n % 29] + result;
    n = Math.floor(n / 29);
  }
  return result || '0';
}

/** @param {number} x Integer. @returns {number} Canonical GP29 residue. */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number[]} values GP29 sequence. @returns {number} Index of coincidence. */
function ioc(values) {
  const freq = new Array(29).fill(0);
  for (const x of values) freq[x] += 1;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * Exhaust all plaintext-F-transparent inverse key-phase paths.
 * Ciphertext 0 can be a passthrough F or a normally encrypted non-F.
 * Every non-F ciphertext must consume a key entry and decode non-F.
 *
 * @param {number[]} cipher Actual ciphertext.
 * @param {number[]} key Six GP29 indices from the numeric BASE29 output.
 * @param {number} sign +1 or -1 in C = P + sign*K.
 * @returns {{failure:number|null,states:number}}
 */
function inverseReachability(cipher, key, sign) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i += 1) {
    const next = new Set();
    for (const position of states) {
      const plaintext = mod29(cipher[i] - sign * key[position % key.length]);
      if (plaintext !== 0) next.add(position + 1);
      if (cipher[i] === 0) next.add(position);
    }
    if (next.size === 0) return { failure: i, states: 0 };
    states = next;
  }
  return { failure: null, states: states.size };
}

/** @param {number[]} plain Solved native GP29 test string.
 * @param {number[]} key Cipher key.
 * @param {number} sign Cipher sign.
 * @returns {number[]} Ciphertext preserving plaintext-F skips. */
function encryptPlant(plain, key, sign) {
  let clock = 0;
  return plain.map((x) => {
    if (x === 0) return 0;
    const c = mod29(x + sign * key[clock % key.length]);
    clock += 1;
    return c;
  });
}

assert.equal(base29(3301), '3QO'); // Signed 2013 positive example.
assert.equal(base29(1033), '16I'); // Predicted, not an original server transcript.
const numeral = base29(1033) + base29(3301);
const key = Array.from(numeral, (ch) => digits.indexOf(ch));
assert.deepEqual(key, [1, 6, 18, 3, 26, 24]);
assert.equal(key.map((idx) => corpus.translit[idx]).join(''), 'UGEOYA');

const originals = corpus.pages.filter((p) => p.page >= 33 && p.page <= 39);
assert.deepEqual(originals.map((p) => p.indices.length),
  [214, 261, 271, 238, 228, 228, 240]);
const runeSet = new Set(corpus.runes);
const physicalParts = transcription.replace(/\r/g, '').split('%');
const p39BeforeFirstAmpersand = physicalParts[39].split('&')[0];
const p39MarkedLength = [...p39BeforeFirstAmpersand]
  .filter((rune) => runeSet.has(rune)).length;
assert.equal(p39MarkedLength, 119);

const sections = originals.map((page, index) => {
  if (index === 0) return page.indices.slice(91);
  if (index === 6) return page.indices.slice(0, p39MarkedLength);
  return page.indices;
});
assert.deepEqual(sections.map((v) => v.length),
  [123, 261, 271, 238, 228, 228, 119]);
const marked = sections.flat();
assert.equal(marked.length, 1468);

console.log('2013 BASE29: 1033 =>', base29(1033), '3301 =>', base29(3301));
console.log('Hypothetical GP29 six-key:', numeral, '=>', key, '=> UGEOYA');
console.log('Original marked length', marked.length, 'cipher IoC', ioc(marked));

for (const sign of [1, -1]) {
  const readout = marked.map((c, i) => mod29(c - sign * key[i % key.length]));
  const full = inverseReachability(marked, key, sign);
  console.log('sign', sign, 'no-skip IoC', ioc(readout),
    'complete-stream first F-skip contradiction', full.failure);
  assert.equal(full.states, 0);
  assert.equal(full.failure, sign === 1 ? 13 : 8);

  const expectedFailures = sign === 1
    ? [13, 14, 48, 9, 2, 0, 12]
    : [8, 101, 34, 105, 20, 82, 27];
  for (let i = 0; i < sections.length; i += 1) {
    const out = inverseReachability(sections[i], key, sign);
    console.log('  physical page', originals[i].page, 'length',
      sections[i].length, 'first impossible', out.failure);
    assert.equal(out.failure, expectedFailures[i]);
    assert.equal(out.states, 0);
  }

  // Full original-length positive: the same fixed key, transparency rule,
  // page clocks and original segment lengths. Clear p57 is a genuine source.
  const seed = corpus.pages.find((p) => p.page === 57).indices;
  assert.equal(seed.length, 95);
  let exact = 0;
  for (const section of sections) {
    const plain = Array.from({ length: section.length }, (_, i) => seed[i % seed.length]);
    const cipher = encryptPlant(plain, key, sign);
    assert.equal(inverseReachability(cipher, key, sign).failure, null);
    let clock = 0;
    for (let j = 0; j < cipher.length; j += 1) {
      const decoded = plain[j] === 0 ? 0 :
        mod29(cipher[j] - sign * key[clock++ % key.length]);
      assert.equal(decoded, plain[j]);
      exact += 1;
    }
  }
  assert.equal(exact, 1468);
  console.log('  source-native original-shaped plant: 1468/1468 recovered');
}

console.log('PASS: both original signs contradicted; no unknown plaintext recovered.');
