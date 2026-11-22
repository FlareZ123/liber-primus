"use strict";

/**
 * Direct 2012 Cicada signed Valēte! postscript RSA carry to final LP2 pages.
 *
 * Run: node sims/lp2_2012_ps_rsa_p55_source_sft.cjs
 *
 * The 2012 P.S. supplies N but no public exponent or LP2 consumer.
 * e=65537 is the original-era conventional *candidate* (not authenticated
 * as the P.S. exponent); GP29 positional integer input is equally conditional.
 * This one-file test explicitly rejects only that named direct consumer.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p56 = corpus.pages.find((page) => page.page === 56).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;

// Original 2012 P.S. decimal, retained as one concatenated signed integer.
// Historical source: cicada-solvers/neuroretransmit-cicada/2012/011-valete/README.md
const ORIGINAL_PS = "1041279065891998535982789873959431895640" +
  "442510695567564373922695237268242385295908173" +
  "9834390370374475764863415203423499357108713631";
const P = 99554414790940424414351515490472769096534141749790794321708050837n;
const Q = 104593961812606247801193807142122161186583731774511103180935025763n;
const N = P * Q;
const E = 65537n;
const PHI = (P - 1n) * (Q - 1n);

assert.equal(N.toString(), ORIGINAL_PS);
assert.equal(N.toString(2).length, 432);
assert.equal(P.toString(2).length, 216);
assert.equal(Q.toString(2).length, 216);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} a @param {bigint} modulus @returns {bigint} */
function inverse(a, modulus) {
  let current = a;
  let remainder = modulus;
  let x = 1n;
  let oldX = 0n;
  while (remainder !== 0n) {
    const quotient = current / remainder;
    [current, remainder] = [remainder, current - quotient * remainder];
    [x, oldX] = [oldX, x - quotient * oldX];
  }
  assert.equal(current, 1n);
  return (x % modulus + modulus) % modulus;
}

/**
 * @param {bigint} value
 * @param {bigint} exponent
 * @param {bigint} modulus
 * @returns {bigint}
 */
function powerMod(value, exponent, modulus) {
  let result = 1n;
  let base = value % modulus;
  for (let n = exponent; n > 0n; n >>= 1n) {
    if ((n & 1n) !== 0n) result = result * base % modulus;
    base = base * base % modulus;
  }
  return result;
}

/** @param {number[]} digits @returns {bigint} */
function pack29(digits) {
  return digits.reduce((result, digit) => {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    return 29n * result + BigInt(digit);
  }, 0n);
}

/** @param {bigint} value @returns {number[]} */
function unpack29(value) {
  const digits = [];
  for (let n = value; n > 0n; n /= 29n) digits.push(Number(n % 29n));
  return digits.reverse();
}

/** @param {number[]} digits @returns {number} */
function ioc(digits) {
  const count = Array(29).fill(0);
  for (const digit of digits) count[digit]++;
  const pairs = count.reduce((sum, n) => sum + n * (n - 1), 0);
  return pairs / (digits.length * (digits.length - 1));
}

/** @param {bigint} number @returns {{printable:number,longest:number,hex:string}} */
function byteDiagnostic(number) {
  const bytes = Array(54).fill(0);
  for (let i = 53; i >= 0; i--) {
    bytes[i] = Number(number & 255n);
    number >>= 8n;
  }
  let printable = 0;
  let longest = 0;
  let current = 0;
  for (const byte of bytes) {
    if (byte >= 32 && byte <= 126) {
      printable++;
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return {printable, longest, hex:Buffer.from(bytes).toString("hex")};
}

assert.equal(gcd(E, PHI), 1n);
const D = inverse(E, PHI);

// Positive control with native solved-p57 GP29, using the exact RSA exponent
// and decoding routine applied below. The ciphertext is expected to be
// longer than its 76-digit plaintext, showing why p55's length matters.
const planted = p57.slice(0, 76);
const plantedPlain = pack29(planted);
assert(plantedPlain < N);
const plantedCipher = powerMod(plantedPlain, E, N);
assert.deepEqual(unpack29(powerMod(plantedCipher, D, N)), planted);
assert.equal(unpack29(plantedCipher).length >= 76, true);

const results = [];
for (const [name, source] of [["p55", p55], ["solved-p56-ciphertext-control", p56]]) {
  for (const reverse of [false, true]) {
    const input = reverse ? [...source].reverse() : source;
    const ciphertext = pack29(input);
    assert(ciphertext < N);
    const plaintext = powerMod(ciphertext, D, N);
    const digits = unpack29(plaintext);
    assert.equal(powerMod(plaintext, E, N), ciphertext);
    const byteResult = byteDiagnostic(plaintext);
    results.push({
      source: name,
      reversed: reverse,
      inputRunes: input.length,
      inputBits: ciphertext.toString(2).length,
      outputRunesBase29: digits.length,
      outputIoC: ioc(digits),
      outputGP: digits.map((digit) => corpus.runes[digit]).join(""),
      printableBytes54: byteResult.printable,
      longestPrintableRun: byteResult.longest,
      outputHex54: byteResult.hex,
    });
  }
}

assert.deepEqual(results.map((item) => item.outputRunesBase29), [88, 89, 89, 89]);
assert.deepEqual(results.map((item) => item.printableBytes54), [17, 21, 23, 23]);
console.log(JSON.stringify({
  authenticated2012PSFactorization: true,
  actualOriginalModulusBits: 432,
  originalP55Runes: 76,
  exponentCandidate: E.toString(),
  validatedSolvedGPPlantRunes: planted.length,
  plantedCipherRunes: unpack29(plantedCipher).length,
  results,
}, null, 2));
