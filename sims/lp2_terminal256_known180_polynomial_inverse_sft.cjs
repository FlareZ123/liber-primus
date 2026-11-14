'use strict';

/**
 * Exact source-original [256 = 76 + 180] polynomial inverse.
 * Tests whether a 180-rune independently known terminal text polynomial
 * divides the 256 numerical-table residues and thereby yields a 76-rune
 * unknown quotient. Does not fit a key, orientation, radix, or secret clock.
 *
 * Run: node sims/lp2_terminal256_known180_polynomial_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} filename */
const read = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const gp = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const mod = n => (n % 29 + 29) % 29;

/** @param {number} value */
function inv(value) {
  for (let i = 1; i < 29; i++) if (mod(i * value) === 1) return i;
  throw new RangeError('zero divisor in GF(29)');
}

/** @param {number} n */
function firstPrimes(n) {
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let prime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

/** @param {string} english */
function parseGP(english) {
  const tokens = gp.translit.map((text, value) => ({text, value}))
    .sort((a, b) => b.text.length - a.text.length);
  const result = [];
  for (const word of english.split(/\s+/)) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find(item => word.startsWith(item.text, i));
      assert(token, 'unknown GP transliteration ' + word.slice(i));
      result.push(token.value);
      i += token.text.length;
    }
  }
  return result;
}

/** @param {number[]} cipher */
function solvedP56(cipher) {
  const primes = firstPrimes(cipher.length);
  let keyIndex = 0;
  return cipher.map((rune, i) => i === 56
    ? rune  // Authenticated plaintext F; do not consume a prime.
    : mod(rune - (primes[keyIndex++] - 1)));
}

/** @param {number[]} highFirst @param {number[]} factor */
function divide(highFirst, factor) {
  assert(highFirst.length >= factor.length);
  const work = highFirst.slice();
  const quotient = Array(highFirst.length - factor.length + 1).fill(0);
  const inverseLeading = inv(factor[0]);
  for (let i = 0; i < quotient.length; i++) {
    const q = mod(work[i] * inverseLeading);
    quotient[i] = q;
    for (let j = 0; j < factor.length; j++) {
      work[i + j] = mod(work[i + j] - q * factor[j]);
    }
  }
  return {quotient, remainder: work.slice(quotient.length)};
}

/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  const product = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      product[i + j] = mod(product[i + j] + a[i] * b[j]);
    }
  }
  return product;
}

const bytes = grid.rows.flat().map(token => {
  assert.match(token, /^[0-9A-Za-z]{2}$/);
  const hi = symbols.indexOf(token[0]);
  const lo = symbols.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  return hi * 60 + lo;
});
assert.equal(bytes.length, 256);
assert(bytes.every(n => n >= 0 && n < 256));
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const table = bytes.map(mod);
assert.equal(table[0], 0); // First byte 203 = 7*29; useful leading-zero alignment.

const p55 = gp.pages[55].indices;
const p56 = gp.pages[56].indices;
const p57 = gp.pages[57].indices;
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);
const plain56 = solvedP56(p56);
const knownWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
assert.deepEqual(plain56, parseGP(knownWords), 'complete authentic 85-rune p56 decipherment');
const readings = [
  ['plain56_then_p57', [...plain56, ...p57]],
  ['cipher56_then_p57', [...p56, ...p57]],
  ['p57_then_plain56', [...p57, ...plain56]],
  ['p57_then_cipher56', [...p57, ...p56]]
];
const expectedNonzero = [168, 171, 176, 176];
const results = readings.map(([name, divisor], i) => {
  assert.equal(divisor.length, 180);
  const {quotient, remainder} = divide(table, divisor);
  assert.equal(quotient.length, 77);
  assert.equal(quotient[0], 0);  // Effective 76-rune quotient.
  assert.equal(remainder.length, 179);
  const nonzero = remainder.filter(x => x !== 0).length;
  assert.equal(nonzero, expectedNonzero[i], name);
  return {
    name, known_runes: divisor.length, unknown_quotient_slots: quotient.length - 1,
    remainder_nonzero: nonzero, remainder_slots: remainder.length,
    original_p55_ciphertext_equal_slots:
      quotient.slice(1).filter((value, j) => value === p55[j]).length
  };
});

// Positive plant: a genuine length-180 factor and a separately chosen 76-rune
// native GP message. Recover all 76 symbols without ever supplying that message
// to the inverse. The zero-padded product has the source's 256-slot structure.
const planted = p57.slice(0, 76);
const syntheticTable = [0, ...multiply([...plain56, ...p57], planted)];
assert.equal(syntheticTable.length, 256);
const positive = divide(syntheticTable, [...plain56, ...p57]);
assert.deepEqual(positive.quotient, [0, ...planted]);
assert(positive.remainder.every(x => x === 0));
assert(results.every(x => x.remainder_nonzero > 0));

console.log(JSON.stringify({
  source: 'original LP2 numerical 32x8 table and p55/p56/p57; GF(29)',
  table_size: table.length, first_byte: bytes[0], first_residue: table[0],
  original_result: results,
  positive_control: {
    known_factor_runes: 180, planted_unknown_native_runes: 76,
    exactly_recovered: planted.length, remainder_nonzero: 0
  },
  decision: 'Exact 180*76 polynomial product interpretation fails; no unknown plaintext, key or destination.'
}, null, 2));
