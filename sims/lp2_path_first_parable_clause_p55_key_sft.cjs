'use strict';
/**
 * Original-only bounded test: use the 30 GP runes in p57's first clear
 * PARABLE sentence (independently nominated by the conditional signed-2016
 * PATH -> p39 SW -> p50[74]=205 -> 205th prime1259 path) as a repeated key
 * on the complete 76 original p55 runes (p50[205]=76).
 *
 * Two source-era arithmetic operands only:
 *   GP0 index of each genuine p57 sentence rune;
 *   Euler phi of its genuine GP prime, phi(prime)=prime-1.
 * The two sign conventions and p56-style ciphertext F interrupter are printed
 * separately. This test does not infer a key from ciphertext or remove runes.
 *
 * Windows: node sims/lp2_path_first_parable_clause_p55_key_sft.cjs
 * Dependencies: Node built-ins only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const p55 = corpus.pages[55].indices;
const p57 = corpus.pages[57].indices;
const key = p57.slice(7, 37);
const names = corpus.translit;
const native = p57.slice(0, 76);

assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.equal(key.length, 30);
assert.equal(key.reduce((s, k) => s + corpus.prime[k], 0), 1259);
assert.equal(key.map(k => names[k]).join(''),
  'LICETHEINSTARTUNNELNGTOTHESURFACE');

/**
 * @param {number} k source rune index
 * @param {'gp-index'|'prime-totient'} mode
 * @returns {number} additive key residue
 */
function shift(k, mode) {
  return mode === 'gp-index' ? k : (corpus.prime[k] - 1) % 29;
}

/**
 * @param {number[]} ciphertext
 * @param {'gp-index'|'prime-totient'} mode
 * @param {-1|1} sign
 * @param {boolean} transparentF
 * @returns {number[]}
 */
function decrypt(ciphertext, mode, sign, transparentF) {
  let clock = 0;
  return ciphertext.map(c => {
    if (transparentF && c === 0) return 0;
    const p = (c + sign * shift(key[clock % key.length], mode) + 29) % 29;
    clock++;
    return p;
  });
}

/**
 * @param {number[]} plaintext
 * @param {'gp-index'|'prime-totient'} mode
 * @param {-1|1} sign
 * @returns {number[]}
 */
function encryptNontransparent(plaintext, mode, sign) {
  return plaintext.map((p, i) =>
    (p - sign * shift(key[i % key.length], mode) + 29) % 29
  );
}

/** @param {number[]} input @returns {number} */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const s of input) counts[s]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}

/** @param {number[]} input @returns {string} */
function translit(input) {
  return input.map(i => names[i]).join(' ');
}

const reference = [];
for (let offset = 0; offset <= p57.length - 76; offset++) {
  reference.push(ioc(p57.slice(offset, offset + 76)));
}
const minNativeIoC = Math.min(...reference);
const results = [];
for (const mode of /** @type {const} */ (['gp-index', 'prime-totient'])) {
  for (const sign of /** @type {const} */ ([-1, 1])) {
    const plant = encryptNontransparent(native, mode, sign);
    assert.deepEqual(decrypt(plant, mode, sign, false), native);
    for (const transparentF of [false, true]) {
      const p = decrypt(p55, mode, sign, transparentF);
      // Under the naive cipher-side F-interrupter rule, any non-F source
      // cipher glyph mapped to F is an ambiguity requiring a separate escape.
      const extraF = [];
      if (transparentF) {
        for (let i = 0; i < p55.length; i++) {
          if (p55[i] !== 0 && p[i] === 0) extraF.push(i);
        }
      }
      results.push({
        mode,
        sign,
        transparentF,
        ioc: Number(ioc(p).toFixed(9)),
        sourceFPositionsZeroBased: [15, 25, 41],
        nonliteralFPositionsZeroBased: extraF,
        transliteration: translit(p),
      });
    }
  }
}
assert.equal(results.length, 8);
assert(results.every(r => r.ioc < minNativeIoC));
assert.equal(results.filter(r => r.transparentF && r.nonliteralFPositionsZeroBased.length)
  .length, 2);
console.log(JSON.stringify({
  label: 'Conditional PATH-first-PARABLE-clause -> whole p55 inverse',
  input: 'Original LP2 p55 76 runes, original clear p57 first 30-sentence runes',
  keyPrimeSum: 1259,
  nativeP57IoCMinAt76Runes: Number(minNativeIoC.toFixed(9)),
  nativeP57IoCMaxAt76Runes: Number(Math.max(...reference).toFixed(9)),
  plantedExactGP29Replays: 4,
  originalResults: results,
  originalPlaintextRecovered: false
}, null, 2));
