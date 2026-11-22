'use strict';

/**
 * Exact source-derived Bézout inverse for the original LP2 p29 and 32x8
 * number table. Run with Node.js 22, no third-party packages.
 *
 * This is an original-data mathematical candidate, not a proved LP2 cipher.
 * The original source does not specify Euclid or applying these coefficients
 * as a key to another page. No secret parameter or English fitting occurs.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative @returns {unknown} */
const json = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const table = json('resources/liber-primus/lp2-grid-256.json');
const M = 29;
/** @param {number} x @returns {number} */
const mod = x => (x % M + M) % M;
/** @param {number[]} values @returns {number[]} */
function trim(values) {
  while (values.length && values[values.length - 1] === 0) values.pop();
  return values;
}
/** @param {number} value @returns {number} */
function inverse(value) {
  assert(value > 0 && value < M);
  for (let k = 1; k < M; k++) if (value * k % M === 1) return k;
  throw new Error('noninvertible GF29 element');
}
/** @param {number[]} a @param {number[]} b @param {number} [sign] */
const add = (a, b, sign = 1) => trim(Array.from(
  { length: Math.max(a.length, b.length) },
  (_, i) => mod((a[i] || 0) + sign * (b[i] || 0))
));
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  if (!a.length || !b.length) return [];
  const output = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      output[i + j] = mod(output[i + j] + a[i] * b[j]);
  return trim(output);
}
/** @param {number[]} a @param {number} by @returns {number[]} */
const scale = (a, by) => trim(a.map(value => mod(value * by)));
/**
 * Euclidean division in ascending-power GF29 coefficients.
 * @param {number[]} a @param {number[]} b
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(a, b) {
  assert(b.length > 0);
  const remainder = trim(a.slice());
  const quotient = Array(Math.max(0, a.length - b.length + 1)).fill(0);
  while (remainder.length >= b.length) {
    const position = remainder.length - b.length;
    const factor = mod(remainder[remainder.length - 1] * inverse(b[b.length - 1]));
    quotient[position] = factor;
    for (let i = 0; i < b.length; i++)
      remainder[i + position] = mod(remainder[i + position] - factor * b[i]);
    trim(remainder);
  }
  assert.deepEqual(add(multiply(quotient, b), remainder), a);
  return { quotient: trim(quotient), remainder };
}
/**
 * Deterministic minimal-degree Bézout representation, monic gcd.
 * @param {number[]} a @param {number[]} b
 */
function bezout(a, b) {
  let u = a.slice(), v = b.slice(), s = [1], nextS = [], t = [], nextT = [1];
  let iterations = 0;
  while (v.length) {
    const { quotient, remainder } = divide(u, v);
    [u, v] = [v, remainder];
    [s, nextS] = [nextS, add(s, multiply(quotient, nextS), -1)];
    [t, nextT] = [nextT, add(t, multiply(quotient, nextT), -1)];
    iterations++;
  }
  const factor = inverse(u[u.length - 1]);
  const gcd = scale(u, factor), S = scale(s, factor), T = scale(t, factor);
  assert.deepEqual(add(multiply(S, a), multiply(T, b)), gcd);
  assert.deepEqual(divide(a, gcd).remainder, []);
  assert.deepEqual(divide(b, gcd).remainder, []);
  assert(S.length - 1 < b.length - gcd.length + 1);
  assert(T.length - 1 < a.length - gcd.length + 1);
  return { gcd, S, T, iterations };
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const hist = Array(M).fill(0);
  for (const value of a) hist[value]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @param {number[]} key @param {number} sign */
function shift(a, key, sign) {
  assert(key.length >= a.length);
  return a.map((value, i) => mod(value + sign * key[i]));
}
/** @param {number[]} a @returns {string} */
const literal = a => a.map(i => corpus.translit[i]).join('');
/** @param {string} phrase @returns {number[]} */
function encodeWords(phrase) {
  const alphabet = corpus.translit.map((token, i) => ({ token, i }))
    .sort((a, b) => b.token.length - a.token.length);
  const result = [];
  for (const word of phrase.split(' ')) {
    for (let k = 0; k < word.length;) {
      const item = alphabet.find(({ token }) => word.startsWith(token, k));
      assert(item, 'unmappable native GP text');
      result.push(item.i);
      k += item.token.length;
    }
  }
  return result;
}
const grid = table.bytes;
assert.equal(grid.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const page29 = corpus.pages.find(page => page.page === 29).indices;
assert.equal(page29.length, 277);
// Printed order is descending polynomial degree; arrays here use ascending.
const A = trim(page29.slice().reverse()), B = trim(grid.map(n => n % M).reverse());
assert.equal(A.length, 277);
assert.equal(B.length, 255);  // Leading original grid byte 203 is zero mod29.
const { gcd, S, T, iterations } = bezout(A, B);
assert.deepEqual(gcd, [25, 10, 1]); // (X-24)^2 = (X+5)^2 mod 29.
assert.equal(iterations, 248);
assert.equal(S.length, 252);
assert.equal(T.length, 274);
assert(Math.abs(ioc(S) - 0.03512932397394549) < 1e-12);
assert(Math.abs(ioc(T) - 0.0339563113285741) < 1e-12);

const page36 = corpus.pages.find(page => page.page === 36).indices;
const page56 = corpus.pages.find(page => page.page === 56).indices;
const page57 = corpus.pages.find(page => page.page === 57).indices;
assert.deepEqual([page36.length, page56.length, page57.length], [238, 85, 95]);
// Independent known-p56 cleartext, normalized exactly as in the authentic
// p56 totient regression. The 128-digit SHA-512 hash is nonrunic.
const known56 = encodeWords('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(known56.length, 85);
const tests = [];
for (const [name, key] of [['S', S], ['T', T]]) {
  for (const sign of [-1, 1]) {
    const recovered36 = shift(page36, key, sign);
    const recovered56 = shift(page56, key, sign);
    const altered57 = shift(page57, key, sign);
    tests.push({
      key: name, sign,
      p36Ioc: ioc(recovered36),
      p36Start: literal(recovered36.slice(0, 24)),
      p56KnownMatches: recovered56.filter((x, i) => x === known56[i]).length,
      p56KnownTotal: known56.length,
      p57UnchangedPositions: altered57.filter((x, i) => x === page57[i]).length,
      p57Total: page57.length
    });
  }
}
assert.deepEqual(tests.map(row => row.p56KnownMatches), [6, 2, 4, 6]);
assert.deepEqual(tests.map(row => row.p57UnchangedPositions), [3, 3, 3, 3]);
assert.deepEqual(tests.map(row => Number(row.p36Ioc.toFixed(9))),
  [0.034641705, 0.034003475, 0.034677162, 0.034358047]);
assert(tests.every(row => row.p36Ioc < 0.04));
// Authentic native-GP plant: exact source-selected coefficients, all 238
// positions, one known operation. Independent first-page solved text alone
// is 85 runes, so use the literal 238-rune native control below.
const reference = fs.readFileSync(path.join(ROOT,
  'resources/control/shakespeare_first300k.txt'), 'utf8')
  .toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
  .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
const words = reference.match(/[A-Z]+/g) || [];
const native = encodeWords(words.join(' ')).slice(0, 238);
assert.equal(native.length, 238);
for (const key of [S, T]) {
  const synthetic = shift(native, key, 1);
  assert.deepEqual(shift(synthetic, key, -1), native);
  assert.equal(shift(synthetic, key, -1).length, 238);
}

/**
 * Canonical polynomial-convolution consumer. Printed page order is
 * descending power, matching A/B; formal power-series inversion operates
 * on the reversed (ascending-power) original coefficients.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @returns {number[]} Printed-order candidate plaintext.
 */
function deconvolve(ciphertext, key) {
  const input = ciphertext.slice().reverse();
  const recovered = [];
  const inv0 = inverse(key[0]);
  for (let i = 0; i < input.length; i++) {
    let residue = input[i];
    for (let j = 1; j <= Math.min(i, key.length - 1); j++)
      residue -= key[j] * recovered[i - j];
    recovered.push(mod(residue * inv0));
  }
  return recovered.reverse();
}
/** @param {number[]} plaintext @param {number[]} key */
function convolve(plaintext, key) {
  const source = plaintext.slice().reverse();
  const output = [];
  for (let i = 0; i < source.length; i++) {
    let residue = 0;
    for (let j = 0; j <= Math.min(i, key.length - 1); j++)
      residue += key[j] * source[i - j];
    output.push(mod(residue));
  }
  return output.reverse();
}
const convolution = [];
for (const [name, key] of [['S', S], ['T', T]]) {
  const decrypted36 = deconvolve(page36, key);
  const decrypted56 = deconvolve(page56, key);
  const decrypted57 = deconvolve(page57, key);
  assert.deepEqual(convolve(decrypted36, key), page36);
  assert.deepEqual(convolve(decrypted56, key), page56);
  assert.deepEqual(convolve(decrypted57, key), page57);
  assert.deepEqual(deconvolve(convolve(native, key), key), native);
  convolution.push({
    key: name,
    p36Ioc: ioc(decrypted36),
    p56KnownMatches: decrypted56.filter((x, i) => x === known56[i]).length,
    p57UnchangedPositions: decrypted57.filter((x, i) => x === page57[i]).length
  });
}
assert.deepEqual(convolution.map(x => x.p56KnownMatches), [1, 3]);
assert.deepEqual(convolution.map(x => x.p57UnchangedPositions), [2, 7]);
assert.deepEqual(convolution.map(x => Number(x.p36Ioc.toFixed(9))),
  [0.035279935, 0.033400702]);
assert(convolution.every(x => x.p36Ioc < 0.04));

console.log(JSON.stringify({
  source: 'original p29 277 GP runes and original pp49-51 256 bytes',
  polynomial: 'descending printed coefficients over GF(29)',
  exact: {gcd, iterations, degrees:{A:276,B:254,S:251,T:273},
    sizes:{S:S.length,T:T.length}, ioc:{S:ioc(S),T:ioc(T)},
    SfirstGP:literal(S.slice(0, 48)), TfirstGP:literal(T.slice(0, 48))},
  originalTests: tests,
  originalPolynomialConvolution: convolution,
  p36UnchangedIoc: ioc(page36),
  native238Plant: '238/238 recovered and re-enciphered with each fixed S and T',
  decision: 'No native-GP plaintext from fixed S/T additive or polynomial-convolution consumers on p36; neither reproduces known p56/p57 plaintext. The source does not specify this Euclidean operation or its consumer.'
}, null, 2));
