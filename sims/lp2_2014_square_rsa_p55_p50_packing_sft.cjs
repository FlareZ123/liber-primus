"use strict";

/**
 * Original-source RSA-centre packing test.
 * Pure CommonJS, Node.js 22, read-only, Windows 11 compatible.
 * Run from any current directory: node sims/lp2_2014_square_rsa_p55_p50_packing_sft.cjs
 *
 * This tests a *hypothesis*. No decrypted LP2 plaintext is claimed.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const source = fs.readFileSync(
  path.join(root, "resources", "cicada2014-openpuff-magic-squares.txt"),
  "utf8"
);

/** @param {string} text */
function parseSquares(text) {
  return text
    .trim()
    .split(/\r?\n[ \t]*\r?\n/)
    .filter(Boolean)
    .map((block) =>
      block.split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number))
    );
}

/** @param {number} value */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/** @param {number} exponent @param {number} modulus */
function inverse(exponent, modulus) {
  let [oldR, r] = [exponent, modulus];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  assert.equal(oldR, 1);
  return ((oldS % modulus) + modulus) % modulus;
}

/** @param {bigint} base @param {bigint} exponent @param {bigint} modulus */
function modPow(base, exponent, modulus) {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1n;
  }
  return result;
}

/** @param {number[]} runes @param {number} phase @param {number} period */
function phaseDistinct(runes, phase, period) {
  const values = [];
  for (let i = phase; i < runes.length; i += period) values.push(runes[i]);
  return new Set(values).size;
}

/** @param {number[]} symbols @param {boolean} littleEndian */
function blockValues(symbols, littleEndian) {
  const values = [];
  for (let i = 0; i + 4 <= symbols.length; i += 4) {
    const digits = symbols.slice(i, i + 4);
    if (littleEndian) digits.reverse();
    values.push(digits.reduce((a, b) => a * 29 + b, 0));
  }
  return values;
}

/** @param {number} value @param {number} digits @param {number} radix */
function fixedDigits(value, digits, radix) {
  const result = Array(digits).fill(0);
  for (let i = digits - 1; i >= 0; i--) {
    result[i] = value % radix;
    value = Math.floor(value / radix);
  }
  assert.equal(value, 0);
  return result;
}

const squares = parseSquares(source);
assert.deepEqual(squares.map((square) => square.length), [5, 7, 5]);
for (const square of squares) {
  assert.ok(square.every((row) => row.length === square.length));
}
const centres = squares.map((square) => square[Math.floor(square.length / 2)][Math.floor(square.length / 2)]);
assert.deepEqual(centres, [809, 331, 91]);
const [p, q, exponent] = centres;
assert.ok(isPrime(p) && isPrime(q));
const modulus = p * q;
const phi = (p - 1) * (q - 1);
const exponentGcd = gcd(exponent, phi);
const privateExponent = inverse(exponent, phi);
assert.equal(modulus, 267779);
assert.equal(phi, 266640);
assert.equal(exponentGcd, 1);
assert.equal(privateExponent, 26371);
assert.equal((exponent * privateExponent) % phi, 1);

const corpus = loadJson("resources/liber-primus/lp2-corpus.json");
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const book = corpus.pages
  .filter((page) => page.page >= 0 && page.page <= 55)
  .flatMap((page) => page.indices || []);
assert.equal(p55.length, 76);
assert.equal(book.length, 12956);

const highDigitMaximum = Math.floor((modulus - 1) / 29 ** 3);
assert.equal(highDigitMaximum, 10);
const allowedLeadGlyphs = highDigitMaximum + 1;
const p55PhaseDistinct = Array.from({ length: 4 }, (_, i) => phaseDistinct(p55, i, 4));
const bookPhaseDistinct = Array.from({ length: 4 }, (_, i) => phaseDistinct(book, i, 4));
assert.deepEqual(p55PhaseDistinct, [14, 15, 13, 15]);
assert.deepEqual(bookPhaseDistinct, [29, 29, 29, 29]);
assert.ok(p55PhaseDistinct.every((count) => count > allowedLeadGlyphs));

const p55Big = blockValues(p55, false);
const p55Little = blockValues(p55, true);
const bookBig = blockValues(book, false);
const bookLittle = blockValues(book, true);
const countInRange = (values) => values.filter((value) => value < modulus).length;
assert.equal(countInRange(p55Big), 6);
assert.equal(countInRange(p55Little), 9);
assert.equal(countInRange(bookBig), 1193);
assert.equal(countInRange(bookLittle), 1218);

// A three-byte big-endian RSA ciphertext with modulus 267779 can
// begin only with byte 0..4. The p50 tokens have 72 or 73 distinct
// spellings per possible leading-byte phase, before any radix is chosen.
const grid = loadJson("resources/liber-primus/base60-grid.json");
const cells = grid.rows.flat();
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(cells.length, 256);
const tokenPhaseDistinct = Array.from({ length: 3 }, (_, i) => {
  const tokens = cells.filter((_, index) => index % 3 === i);
  return new Set(tokens).size;
});
assert.deepEqual(tokenPhaseDistinct, [72, 73, 73]);
const allowedLeadBytes = Math.floor((modulus - 1) / 65536) + 1;
assert.equal(allowedLeadBytes, 5);
assert.ok(tokenPhaseDistinct.every((count) => count > allowedLeadBytes));

// Positive RSA packing controls prove the private exponent and byte/rune
// serializers work and that the leading-symbol obstruction is meaningful.
let rsaFourDigitPlantCount = 0;
for (let i = 0; i < 19; i++) {
  const message = (3301 + 1033 * i) % modulus;
  const encrypted = Number(modPow(BigInt(message), BigInt(exponent), BigInt(modulus)));
  const digits = fixedDigits(encrypted, 4, 29);
  assert.ok(digits[0] <= highDigitMaximum);
  assert.equal(digits.reduce((a, b) => a * 29 + b, 0), encrypted);
  assert.equal(Number(modPow(BigInt(encrypted), BigInt(privateExponent), BigInt(modulus))), message);
  rsaFourDigitPlantCount++;
}
let rsaThreeBytePlantCount = 0;
for (let i = 0; i < 85; i++) {
  const message = (3301 + 1033 * i) % modulus;
  const encrypted = Number(modPow(BigInt(message), BigInt(exponent), BigInt(modulus)));
  const bytes = fixedDigits(encrypted, 3, 256);
  assert.ok(bytes[0] < allowedLeadBytes);
  assert.equal(bytes.reduce((a, b) => a * 256 + b, 0), encrypted);
  assert.equal(Number(modPow(BigInt(encrypted), BigInt(privateExponent), BigInt(modulus))), message);
  rsaThreeBytePlantCount++;
}

const result = {
  sourceCentres: centres,
  rsa: { p, q, exponent, modulus, phi, privateExponent },
  packedFourRune: {
    allowedLeadingGlyphs: allowedLeadGlyphs,
    p55PhasesDistinct: p55PhaseDistinct,
    allBookPhasesDistinct: bookPhaseDistinct,
    p55AlignedLegal: { bigEndian: countInRange(p55Big), littleEndian: countInRange(p55Little), total: 19 },
    allBookAlignedLegal: { bigEndian: countInRange(bookBig), littleEndian: countInRange(bookLittle), total: 3239 }
  },
  p50ThreeByte: {
    sourceTokenCount: cells.length,
    allowedLeadingByteValues: allowedLeadBytes,
    allThreePhasesDistinctTokens: tokenPhaseDistinct
  },
  positiveControls: { fourRuneBlocks: rsaFourDigitPlantCount, threeByteBlocks: rsaThreeBytePlantCount },
  decision: "RSA-centre tuple exists; standard direct fixed-width original GP29/p50 RSA ciphertext packing is incompatible with original inputs for every constant symbol relabeling."
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
