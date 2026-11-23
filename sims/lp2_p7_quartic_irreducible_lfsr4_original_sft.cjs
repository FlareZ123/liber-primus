'use strict';

/**
 * Source p7 quartic as a degree-four GF29 linear-feedback key for p8.
 * Reproduce: node sims/lp2_p7_quartic_irreducible_lfsr4_original_sft.cjs
 * Reads original physical LP2 rune and word references; never edits files.
 * Frozen long-word candidate tests are independent of any unknown four-state seed.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
const root = path.resolve(__dirname, '..');
/** @param {string} pathname @returns {string} */
const read = pathname => fs.readFileSync(path.join(root, pathname), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalP7 = gp.pages.find(page => page.page === 7).indices;
const originalP8 = gp.pages.find(page => page.page === 8).indices;
const originalP57 = gp.pages.find(page => page.page === 57).indices;
const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11],
  [14, 28], [6, 28, 19]];
assert.deepEqual(originalP7.slice(194, 208), redWords.flat());
const coeff = redWords.map(word => word.reduce((product, value) =>
  mod(product * value), 1));
assert.deepEqual(coeff, [11, 26, 8, 15, 2]);
assert.deepEqual(originalP8.slice(0, 12),
  [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);

/** @param {number[]} polynomial @param {number} value @returns {number} */
function evaluate(polynomial, value) {
  return polynomial.reduceRight((sum, coefficient) =>
    mod(sum * value + coefficient), 0);
}

/** @param {number[]} polynomial @returns {boolean} */
function isIrreducibleQuartic(polynomial) {
  for (let value = 0; value < 29; value++) {
    if (evaluate(polynomial, value) === 0) return false;
  }
  // No root and no monic quadratic divisor is an exact irreducibility proof.
  for (let b = 0; b < 29; b++) {
    for (let c = 0; c < 29; c++) {
      const a = polynomial.slice();
      for (let degree = 4; degree >= 2; degree--) {
        const factor = a[degree];
        a[degree] = 0;
        a[degree - 1] = mod(a[degree - 1] - factor * b);
        a[degree - 2] = mod(a[degree - 2] - factor * c);
      }
      if (a[0] === 0 && a[1] === 0) return false;
    }
  }
  return true;
}

/** @param {number[]} a @param {number[]} b @param {number[]} polynomial @returns {number[]} */
function multiplyField(a, b, polynomial) {
  const out = Array(7).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i + j] += a[i] * b[j];
    }
  }
  let inverseLeading = 1;
  while (mod(inverseLeading * polynomial[4]) !== 1) inverseLeading++;
  for (let k = 6; k >= 4; k--) {
    const factor = mod(out[k] * inverseLeading);
    for (let j = 0; j < 5; j++) out[k - 4 + j] -= factor * polynomial[j];
  }
  return out.slice(0, 4).map(mod);
}

/** @param {number[]} polynomial @param {number} exponent @returns {number[]} */
function powerRoot(polynomial, exponent) {
  let result = [1, 0, 0, 0];
  let base = [0, 1, 0, 0];
  for (let n = exponent; n > 0; n = Math.floor(n / 2)) {
    if (n % 2 === 1) result = multiplyField(result, base, polynomial);
    base = multiplyField(base, base, polynomial);
  }
  return result;
}

/** @param {number[]} polynomial @returns {number} */
function rootOrder(polynomial) {
  assert.ok(isIrreducibleQuartic(polynomial));
  let order = 29 ** 4 - 1;
  assert.deepEqual(powerRoot(polynomial, order), [1, 0, 0, 0]);
  for (const prime of [2, 3, 5, 7, 421]) {
    while (order % prime === 0 &&
        powerRoot(polynomial, order / prime).every((v, i) => v === Number(i === 0))) {
      order /= prime;
    }
  }
  return order;
}
assert.equal(isIrreducibleQuartic(coeff), true);
assert.equal(rootOrder(coeff), 29470);
const rootOrderFrequency = {};
let testedOrders = 0;
function orders(a, pos = 0) {
  if (pos === a.length) {
    testedOrders++;
    if (isIrreducibleQuartic(a)) {
      const order = rootOrder(a);
      rootOrderFrequency[order] = (rootOrderFrequency[order] || 0) + 1;
    }
    return;
  }
  for (let i = pos; i < a.length; i++) {
    [a[pos], a[i]] = [a[i], a[pos]];
    orders(a, pos + 1);
    [a[pos], a[i]] = [a[i], a[pos]];
  }
}
orders(coeff.slice());
assert.equal(testedOrders, 120);
assert.equal(rootOrderFrequency[29470], 2);
assert.equal(Object.values(rootOrderFrequency).reduce((a, b) => a + b, 0), 38);

/**
 * Characteristic polynomial P(x)=11+26x+8x²+15x³+2x⁴.
 * @param {number[]} polynomial
 * @returns {number[]}
 */
function weights(polynomial) {
  let inv = 1;
  while (mod(inv * polynomial[4]) !== 1) inv++;
  return polynomial.slice(0, 4).reverse().map(value => mod(-inv * value));
}
const originalWeights = weights(coeff);
const reciprocalWeights = weights(coeff.slice().reverse());
assert.deepEqual(originalWeights, [7, 25, 16, 9]);
assert.deepEqual(reciprocalWeights, [24, 23, 25, 13]);

/** @param {number[]} seed @param {number[]} taps @param {number} count @returns {number[]} */
function generate(seed, taps, count) {
  const out = seed.slice();
  for (let i = 4; i < count; i++) {
    out.push(mod(taps.reduce((sum, value, j) =>
      sum + value * out[i - j - 1], 0)));
  }
  return out;
}

/** @param {number[]} list @returns {number} */
function ioc(list) {
  const counts = Array(29).fill(0);
  list.forEach(value => { counts[value]++; });
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (list.length * (list.length - 1));
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} integrated
 */
function decrypt(cipher, key, sign, integrated) {
  return cipher.slice(4).map((v, i) =>
    mod((integrated ? v - cipher[i + 3] : v) + sign * key[i + 4]));
}

/**
 * @param {number[]} plain
 * @param {number[]} seed
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} integrated
 */
function encrypt(plain, seed, key, sign, integrated) {
  const cipher = seed.slice();
  plain.forEach((value, i) => {
    const base = integrated ? cipher[cipher.length - 1] : 0;
    cipher.push(mod(base + value - sign * key[i + 4]));
  });
  return cipher;
}

const section = gp.pages.filter(page => page.page >= 8 && page.page <= 14);
assert.deepEqual(section.map(page => page.runic_count),
  [255, 268, 263, 273, 261, 272, 137]);
const cipher = section.flatMap(page => page.indices);
assert.equal(cipher.length, 1729);
const initial = cipher.slice(0, 4);
const directKey = generate(initial, originalWeights, cipher.length);
assert.deepEqual(directKey.slice(0, 12),
  [14, 10, 14, 19, 15, 24, 16, 21, 22, 20, 10, 9]);

const models = [];
for (const integrated of [false, true]) {
  for (const sign of [-1, 1]) {
    const plain = decrypt(cipher, directKey, sign, integrated);
    assert.deepEqual(encrypt(plain, initial, directKey, sign, integrated), cipher);
    const native = Array.from({ length: plain.length },
      (_, i) => originalP57[i % originalP57.length]);
    assert.deepEqual(decrypt(
      encrypt(native, initial, directKey, sign, integrated),
      directKey, sign, integrated), native);
    models.push({
      register: integrated ? 'integrated' : 'direct',
      sign,
      ioc: ioc(plain),
      first_24: plain.slice(0, 24).map(i => gp.translit[i]).join(' ')
    });
  }
}
assert.ok(models.every(row => row.ioc < 0.035),
  'all direct IV-source quartic decodes remain flat');

/**
 * Native English GP rune spelling from the repository's solved-LP1 calibrated rule.
 * @param {string} word
 * @returns {number[]}
 */
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function encodeWord(word) {
  const clean = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (clean.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => clean.startsWith(t.s, i));
      assert.ok(token, 'all normalized English tokens must map to GP');
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

const english = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(line => line && !line.startsWith(';'))
  .map(line => line.split(/\s+/)[0]).filter(word => /^[a-z]+$/i.test(word))
  .map(encodeWord);
const latin = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).filter(line => /^[0-9A-S]+$/.test(line))
  .map(line => Array.from(line).map(ch =>
    ch.charCodeAt(0) - (ch <= '9' ? 48 : 55)));
assert.equal(english.length, 29157);
assert.equal(latin.length, 39835);
const testedSites = [[8, 9], [112, 10], [128, 12],
  [160, 10], [174, 9], [221, 9]];

/**
 * Checks the homogeneous linear key law on ALL positions of one intact word.
 * Any global unknown source seed or key phase must obey this local law.
 * @param {number[]} original
 * @param {number[]} native
 * @param {number[]} taps
 * @returns {boolean}
 */
function matches(original, native, taps) {
  if (original.length !== native.length) return false;
  const key = original.map((value, i) => mod(value - native[i]));
  for (let i = 4; i < key.length; i++) {
    if (mod(key[i] - taps.reduce((sum, v, j) =>
      sum + v * key[i - j - 1], 0)) !== 0) return false;
  }
  return true;
}

const allSecret = [];
for (const [offset, length] of testedSites) {
  const printed = originalP8.slice(12 + offset, 12 + offset + length);
  const entry = { body_rune_offset: offset, length };
  for (const [name, dictionary] of [['english', english], ['latin', latin]]) {
    for (const [orientation, taps] of [['printed', originalWeights],
      ['reciprocal', reciprocalWeights]]) {
      entry[name + '_' + orientation] = dictionary.filter(word =>
        matches(printed, word, taps)).length;
      assert.equal(entry[name + '_' + orientation], 0);
    }
  }
  allSecret.push(entry);
}
// Exact positive: the same unknown-seed word invariant accepts a planted word.
for (const taps of [originalWeights, reciprocalWeights]) {
  const native = encodeWord('INTERCONNECTEDNESS');
  const pad = generate([14, 10, 14, 19], taps, native.length);
  const encrypted = native.map((v, i) => mod(v + pad[i]));
  assert.ok(matches(encrypted, native, taps));
  const falsePlain = native.map((v, i) => mod(v + (i === 4 ? 1 : 0)));
  assert.ok(!matches(encrypted, falsePlain, taps));
}
console.log(JSON.stringify({
  source_coefficients: coeff,
  quartic_irreducible: true,
  root_multiplicative_order: 29470,
  root_order_frequency_in_120_orders: rootOrderFrequency[29470],
  p8_original_source_seed: initial,
  chapter_original_runes: cipher.length,
  models,
  long_word_all_seed_tests: allSecret,
  english_dictionary: english.length,
  latin_dictionary: latin.length,
  authentic_source_replay_and_native_positive: true
}, null, 2));
console.log('PASS: original source quartic and reciprocal all-seed word gates.');
