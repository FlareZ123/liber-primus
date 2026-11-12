"use strict";
/**
 * Original-source p33 prime-pair RSA reading of terminal p55.
 *
 * Premise: LP2 p33-39 visibly prints 1033 and 3301 in sexagesimal notation,
 * LP1 p5's moth/primes/totient artwork recurs on LP2 p53 and p55,
 * and physical p55 has 76 GP29 glyphs = 19 four-glyph blocks.
 * The historical Cicada RSA public key has exponent 65537. A four-digit
 * GP29 block occupies 0 .. 29^4-1, less than N=1033*3301.
 *
 * Ordinary modular RSA cannot preserve all 4-digit strings, so we use
 * deterministic RSA cycle-walking, the simplest format-preserving repair:
 * repeatedly apply x^e mod N until the result lies below 29^4.
 * The inverse repeatedly applies x^d modulo N. A positive control uses
 * authentic solved p57 runes as the input; no plaintext fitting occurs.
 *
 * These inputs suggest a test; none authorizes RSA as Cicada's LP2 cipher.
 * In particular, p55's first NG belongs to a word begun on p54, making
 * page-local four-rune grouping a deliberately generous assumption.
 *
 * Run: node sims/lp2_p33_primepair_rsa_cyclewalk_p55_sft.cjs
 * Node.js >= 18, CommonJS and repository resources only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {dearmor, parseKeys} = require("./grid_rsa_pgp_signature.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const page = number => corpus.pages.find(p => p.page === number).indices;
const p55 = page(55);
const solvedP57 = page(57);
assert.equal(p55.length, 76);
assert.equal(solvedP57.length, 95);
assert.equal(p55[0], 21); // Inherited NG word continuation from physical p54.
assert.deepEqual(p55.slice(-6), [23, 11, 1, 17, 18, 10]);

const pub = parseKeys(dearmor(fs.readFileSync(
  path.join(ROOT, "resources/control/cicada-3301-public-key.asc"), "utf8")))[0];
assert.equal(pub.fingerprint, "6D854CD7933322A601C3286D181F01E57A35090F");
assert.equal(pub.exponent, 65537n);

const P = 1033n;
const Q = 3301n;
const MOD = P * Q;
const PHI = (P - 1n) * (Q - 1n);
const RADIX = 29n;
const BLOCK = 4;
const DOMAIN = RADIX ** BigInt(BLOCK);
const EXP = pub.exponent;

function isPrime(n) {
  for (let d = 2n; d * d <= n; d++) if (n % d === 0n) return false;
  return n > 1n;
}
assert(isPrime(P) && isPrime(Q));
assert.equal(MOD, 3409933n);
assert.equal(PHI, 3405600n);
assert(DOMAIN < MOD);

function modInverse(a, modulus) {
  let [oldR, r] = [modulus, a % modulus];
  let [oldT, t] = [0n, 1n];
  while (r > 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldT, t] = [t, oldT - q * t];
  }
  assert.equal(oldR, 1n, "RSA exponent must be a unit modulo totient");
  return (oldT % modulus + modulus) % modulus;
}
const PRIVATE = modInverse(EXP, PHI);
assert.equal(PRIVATE, 3398273n);
assert.equal(EXP * PRIVATE % PHI, 1n);

function modPow(base, exponent, modulus) {
  let output = 1n;
  for (base %= modulus; exponent; exponent >>= 1n, base = base * base % modulus) {
    if (exponent & 1n) output = output * base % modulus;
  }
  return output;
}
function walk(input, exponent) {
  assert(input >= 0n && input < DOMAIN);
  let value = input, iterations = 0;
  do {
    value = modPow(value, exponent, MOD);
    iterations++;
    assert(iterations < 10000, "unexpected cycle length");
  } while (value >= DOMAIN);
  return {value, iterations};
}
function numberFromDigits(digits, leastFirst) {
  assert.equal(digits.length, BLOCK);
  const sequence = leastFirst ? [...digits].reverse() : digits;
  return sequence.reduce((n, digit) => n * RADIX + BigInt(digit), 0n);
}
function digitsFromNumber(value, leastFirst) {
  assert(value >= 0n && value < DOMAIN);
  const result = [];
  for (let i = 0; i < BLOCK; i++) {
    result.unshift(Number(value % RADIX));
    value /= RADIX;
  }
  return leastFirst ? result.reverse() : result;
}
function transform(input, exponent, leastFirst) {
  assert.equal(input.length % BLOCK, 0);
  const result = [], iterations = [];
  for (let i = 0; i < input.length; i += BLOCK) {
    const {value, iterations: steps} = walk(
      numberFromDigits(input.slice(i, i + BLOCK), leastFirst), exponent);
    result.push(...digitsFromNumber(value, leastFirst));
    iterations.push(steps);
  }
  return {digits: result, iterations};
}
function indexOfCoincidence(digits) {
  const counts = Array(29).fill(0);
  for (const d of digits) counts[d]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (digits.length * (digits.length - 1));
}
function text(digits) { return digits.map(index => corpus.translit[index]).join(""); }
function sha256(digits) {
  return crypto.createHash("sha256").update(Buffer.from(digits)).digest("hex");
}
const cases = [];
for (const leastFirst of [false, true]) {
  const decrypted = transform(p55, PRIVATE, leastFirst);
  const reencrypted = transform(decrypted.digits, EXP, leastFirst);
  assert.deepEqual(reencrypted.digits, p55, "exact original p55 round trip");

  const plant = solvedP57.slice(0, 76);
  const plantedCipher = transform(plant, EXP, leastFirst);
  const recoveredPlant = transform(plantedCipher.digits, PRIVATE, leastFirst);
  assert.deepEqual(recoveredPlant.digits, plant, "authentic p57 GP native control");
  assert.equal(recoveredPlant.digits.length, 76);

  const score = indexOfCoincidence(decrypted.digits);
  const expected = leastFirst ? 0.03368421052631579 : 0.028771929824561403;
  assert(Math.abs(score - expected) < 1e-14);
  cases.push({
    interpretation: leastFirst ? "least-significant GP rune first" : "printed GP rune order",
    recovered: text(decrypted.digits),
    decoded_ioc: score,
    cycle_steps: decrypted.iterations,
    max_cycle_steps: Math.max(...decrypted.iterations),
    reencrypted_original_runes: p55.length,
    native_p57_plant_exact: true,
    decoded_sha256: sha256(decrypted.digits)
  });
}

// The adjacent full 32x8 original byte table is a second, independent
// source-shaped RSA consumer: its 256 bytes make 128 complete 16-bit blocks.
// No semantic claim that those bytes were intended as RSA ciphertext.
const grid = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/base60-grid.json"), "utf8"));
const gridBytes = grid.byte_rows.flat();
assert.equal(gridBytes.length, 256);
const BYTE_DOMAIN = 65536n; // 2^16 < source-pair modulus
assert(BYTE_DOMAIN < MOD);
function binaryCycleWalk(value, exponent) {
  assert(value >= 0n && value < BYTE_DOMAIN);
  let iterations = 0;
  do {
    value = modPow(value, exponent, MOD);
    iterations++;
    assert(iterations < 10000, "unexpected binary cycle");
  } while (value >= BYTE_DOMAIN);
  return {value: Number(value), iterations};
}
function transformBytePairs(bytes, exponent, littleFirst) {
  assert.equal(bytes.length % 2, 0);
  const result = [], iterations = [];
  for (let i = 0; i < bytes.length; i += 2) {
    const number = littleFirst ? bytes[i] + 256 * bytes[i+1]
      : 256 * bytes[i] + bytes[i+1];
    const walked = binaryCycleWalk(BigInt(number), exponent);
    result.push(littleFirst ? walked.value & 255 : walked.value >> 8);
    result.push(littleFirst ? walked.value >> 8 : walked.value & 255);
    iterations.push(walked.iterations);
  }
  return {bytes: result, iterations};
}
function entropy(bytes) {
  const counts = Array(256).fill(0);
  for (const byte of bytes) counts[byte]++;
  return counts.reduce((sum, c) => c
    ? sum - c / bytes.length * Math.log2(c / bytes.length) : sum, 0);
}
const byteCases = [];
const nativeBytePlant = Array.from(Buffer.from(
  "LIBER PRIMUS AN END WITHIN THE DEEP WEB. ".repeat(8)).subarray(0, 256));
assert.equal(nativeBytePlant.length, 256);
for (const littleFirst of [false, true]) {
  const decrypted = transformBytePairs(gridBytes, PRIVATE, littleFirst);
  const replay = transformBytePairs(decrypted.bytes, EXP, littleFirst);
  assert.deepEqual(replay.bytes, gridBytes, "original grid exact two-byte RSA roundtrip");

  const encryptedPlant = transformBytePairs(nativeBytePlant, EXP, littleFirst);
  const recoveredPlant = transformBytePairs(encryptedPlant.bytes, PRIVATE, littleFirst);
  assert.deepEqual(recoveredPlant.bytes, nativeBytePlant,
    "independent 256-byte ASCII plant exact RSA roundtrip");
  const printable = decrypted.bytes.filter(byte => byte >= 32 && byte <= 126).length;
  assert.equal(printable, littleFirst ? 93 : 88);
  const byteEntropy = entropy(decrypted.bytes);
  const expectedEntropy = littleFirst ? 7.168230652316841 : 7.094579273518898;
  assert(Math.abs(byteEntropy - expectedEntropy) < 1e-12);
  byteCases.push({
    byte_order: littleFirst ? "little-endian uint16" : "big-endian uint16",
    source_cells: gridBytes.length,
    blocks: gridBytes.length / 2,
    printable_ascii: printable,
    byte_entropy_bits: byteEntropy,
    byte_prefix_hex: Buffer.from(decrypted.bytes.slice(0, 32)).toString("hex"),
    max_cycle_steps: Math.max(...decrypted.iterations),
    mean_cycle_steps: decrypted.iterations.reduce((a,b) => a+b, 0)
      / decrypted.iterations.length,
    original_roundtrip: true,
    ascii_plant_recovered: true,
    output_sha256: crypto.createHash("sha256")
      .update(Buffer.from(decrypted.bytes)).digest("hex")
  });
}

// Third source-shaped consumer: divide the original 256 table bytes (mod 29)
// by the two independently selected ascending-coefficient quadratics:
// 2013 signed BASE29 3301 -> 3QO and original p39 red triple [27,5,15].
// A 252-rune quotient has exactly 63 complete four-rune RSA blocks.
function mod29(x) { return (x % 29 + 29) % 29; }
const signed3301 = [3, 26, 24];
const p39red = [27, 5, 15];
const factorAscending = Array(5).fill(0);
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
  factorAscending[i+j] = mod29(
    factorAscending[i+j] + signed3301[i] * p39red[j]);
}
assert.deepEqual(factorAscending, [23, 21, 11, 17, 12]);
const residues = gridBytes.map(byte => byte % 29);
const coefficients = residues.slice();
const quotient = [];
for (let i = 0; i < 252; i++) {
  const v = mod29(coefficients[i] * 17); // inverse of leading factor 12
  quotient.push(v);
  for (let j = 0; j < 5; j++) {
    coefficients[i+j] = mod29(coefficients[i+j] - v * factorAscending[4-j]);
  }
}
assert.deepEqual(coefficients.slice(-4), [0,0,0,0]);
assert.equal(quotient.length, 252);
assert(Math.abs(indexOfCoincidence(quotient) - 0.036330867008157845) < 1e-13);
const quotientCases = [];
for (const leastFirst of [false, true]) {
  const decrypted = transform(quotient, PRIVATE, leastFirst);
  const reencrypted = transform(decrypted.digits, EXP, leastFirst);
  assert.deepEqual(reencrypted.digits, quotient, "original Q252 exact inverse");
  const plant = Array.from({length: 252}, (_, i) => solvedP57[i % 95]);
  const encryptedPlant = transform(plant, EXP, leastFirst);
  assert.deepEqual(transform(encryptedPlant.digits, PRIVATE, leastFirst).digits,
    plant, "252-symbol solved-source language plant");
  const actualIoc = indexOfCoincidence(decrypted.digits);
  assert(Math.abs(actualIoc -
    (leastFirst ? 0.033706444065009805 : 0.0336748245114779)) < 1e-13);
  quotientCases.push({
    rune_order: leastFirst ? "least-significant GP first" : "printed coefficient order",
    quotient_runes: quotient.length,
    decoded_ioc: actualIoc,
    decoded_prefix: text(decrypted.digits).slice(0, 100),
    original_roundtrip: true,
    native_rune_plant_recovered: true,
    max_cycle_steps: Math.max(...decrypted.iterations),
    decoded_sha256: sha256(decrypted.digits)
  });
}
console.log(JSON.stringify({
  premise: "LP2 p33 source primes 1033, 3301; LP1 p5 moth/totient allusion; p55 76 page-local runes",
  cipher: "source-pair RSA modulo 3409933, historical e=65537, 19 four-rune GP29 blocks, bijective cycle-walk",
  private_exponent: PRIVATE.toString(),
  original_source_runes_sha256: sha256(p55),
  raw_p55_ioc: indexOfCoincidence(p55),
  solved_p57_native_76_ioc: indexOfCoincidence(solvedP57.slice(0, 76)),
  cases,
  source_grid256_two_byte_RSA_cases: byteCases,
  grid_q252_four_rune_RSA_cases: quotientCases,
  conclusion: "Negative: both source-shaped reversible readings remain ciphertext-like. The original sources do not specify RSA, cycle-walking or a page-local carry treatment."
}, null, 2));
