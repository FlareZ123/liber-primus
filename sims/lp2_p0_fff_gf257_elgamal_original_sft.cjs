'use strict';
/**
 * FFF->00 source-field ElGamal receiver: a bounded, fixed negative test.
 * Original p0 three F-headed GP-prime sums nominate (257, 38, 48).
 * In an ElGamal interpretation, these are p, generator g and private x.
 * Original p50 is a 32x8 grid of 256 two-character radix-60 tokens.
 * Freeze adjacent row-major BYTES as (c1,c2), encode each byte b as a
 * GF(257) unit b+1, and decrypt one byte from each source pair.
 *
 * Run with Node.js 22 from any working directory:
 *   node sims/lp2_p0_fff_gf257_elgamal_original_sft.cjs
 * No network, random search, key fit, or external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const readJson = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const source = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const tokens = grid.pages.flatMap(page => page.tokens);
const original = grid.pages.flatMap(page => page.bytes);
assert.equal(original.length, 256);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.map(page => page.page), [49, 50, 51]);
for (let i = 0; i < original.length; i++) {
  const token = tokens[i];
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  assert.equal(60 * a + b, original[i]);
  assert(original[i] >= 0 && original[i] < 256);
}
assert.equal(original[189], 192);
assert.equal(tokens[192], '00');
assert.equal(original[192], 0);
assert.equal(tokens[229], '00');

const p0 = source.pages.find(page => page.page === 0).indices;
const fieldPrime = p0.slice(177, 183).reduce((n, i) => n + source.prime[i], 0);
const fieldGeneratorSum = p0.slice(183, 189).reduce((n, i) => n + source.prime[i], 0);
const privateExponent = p0.slice(189, 192).reduce((n, i) => n + source.prime[i], 0);
assert.deepEqual([p0[177], p0[183], p0[189]], [0, 0, 0]);
assert.deepEqual([fieldPrime, fieldGeneratorSum, privateExponent], [257, 295, 48]);
const modulus = fieldPrime;
const order = modulus - 1;
const generator = fieldGeneratorSum % modulus;

/** @param {number} a @param {number} e @returns {number} */
function power(a, e) {
  let result = 1;
  while (e > 0) {
    if (e % 2) result = result * a % modulus;
    a = a * a % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}
assert.equal(power(generator, order), 1);
for (const divisor of [2]) assert.notEqual(power(generator, order / divisor), 1);
assert.equal(power(generator, 24), 15);
assert.equal(power(generator, 48), 225);
const publicKey = power(generator, privateExponent);

/**
 * Every source byte is encoded as a nonzero field element via +1.
 * The first byte in a printed adjacent pair is C1; the second is C2.
 * @param {number[]} pairBytes @returns {number[]}
 */
function decrypt(pairBytes) {
  assert.equal(pairBytes.length % 2, 0);
  const out = [];
  for (let i = 0; i < pairBytes.length; i += 2) {
    const c1 = pairBytes[i] + 1;
    const c2 = pairBytes[i + 1] + 1;
    const message = c2 * power(c1, order - privateExponent) % modulus;
    out.push(message - 1);
  }
  return out;
}

/**
 * True ElGamal plant. A known ephemeral k determines C1=g^k,
 * C2=(m+1)*y^k. Zero-based message byte is native GP rune index.
 * @param {number[]} messageBytes @returns {number[]}
 */
function encryptPlant(messageBytes) {
  const out = [];
  for (let i = 0; i < messageBytes.length; i++) {
    const k = i + 1;
    const c1 = power(generator, k);
    const c2 = (messageBytes[i] + 1) * power(publicKey, k) % modulus;
    out.push(c1 - 1, c2 - 1);
  }
  return out;
}

// Exact source-native positive, including GP ligatures from solved p57.
const p57 = source.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
const planted = Array.from({length: 128}, (_, i) => p57[i % p57.length]);
assert(planted.every(x => x >= 0 && x < 29));
const encryptedPlant = encryptPlant(planted);
assert.equal(encryptedPlant.length, original.length);
assert.deepEqual(decrypt(encryptedPlant), planted);
for (let i = 0; i < encryptedPlant.length; i++) {
  assert(encryptedPlant[i] >= 0 && encryptedPlant[i] <= 255);
}

const raw = decrypt(original);
assert.equal(raw.length, 128);
const printed = raw.map(v => v >= 32 && v <= 126 ? String.fromCharCode(v) : '.').join('');
const asciiPrintable = raw.filter(v => v >= 32 && v <= 126).length;
const asciiLetters = raw.filter(v => (v >= 65 && v <= 90) || (v >= 97 && v <= 122)).length;
const nativeGp29 = raw.filter(v => v < 29).length;
assert.deepEqual(raw.slice(0, 16), [140,22,68,91,223,120,193,66,141,33,187,168,199,51,94,80]);
assert.deepEqual([asciiPrintable, asciiLetters, nativeGp29], [50, 29, 13]);
// The supplied inverse re-encrypts any source pair under this hypothesized
// private exponent; this is a correctness invariant, not key authentication.
for (let i = 0; i < raw.length; i++) {
  const c1 = original[2 * i] + 1;
  const restoredC2 = (raw[i] + 1) * power(c1, privateExponent) % modulus;
  assert.equal(restoredC2, original[2 * i + 1] + 1);
}
console.log(JSON.stringify({
  status: 'PASS: authentic p50 ElGamal receiver has no native-GP or ASCII prose',
  originalP0PrimeSums: [fieldPrime, fieldGeneratorSum, privateExponent],
  primitiveGenerator: generator,
  p39Link: {power24: power(generator, 24), power48: publicKey},
  ciphertextPairs: original.length / 2,
  originalP50Sha256: crypto.createHash('sha256').update(Buffer.from(original)).digest('hex'),
  plaintextSha256: crypto.createHash('sha256').update(Buffer.from(raw)).digest('hex'),
  first32: raw.slice(0, 32),
  asciiPrintable, asciiLetters, nativeGp29,
  nativeGp29Violations: raw.length - nativeGp29,
  escapedAscii: printed,
  solvedP57PlantedSymbols: planted.length,
  solvedP57PlantedRecovered: decrypt(encryptedPlant).length,
  exactSourcePairReencryption: true,
  caveat: 'This excludes only the source-fixed byte+1, adjacent-pair ElGamal and direct GP29/ASCII prose formats. No source authenticates the ElGamal opcode or ensures the p50 is its ciphertext.'
}, null, 2));
