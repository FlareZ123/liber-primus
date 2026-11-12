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
console.log(JSON.stringify({
  premise: "LP2 p33 source primes 1033, 3301; LP1 p5 moth/totient allusion; p55 76 page-local runes",
  cipher: "source-pair RSA modulo 3409933, historical e=65537, 19 four-rune GP29 blocks, bijective cycle-walk",
  private_exponent: PRIVATE.toString(),
  original_source_runes_sha256: sha256(p55),
  raw_p55_ioc: indexOfCoincidence(p55),
  solved_p57_native_76_ioc: indexOfCoincidence(solvedP57.slice(0, 76)),
  cases,
  conclusion: "Negative: both source-shaped reversible readings remain ciphertext-like. The original sources do not specify RSA, cycle-walking or a page-local carry treatment."
}, null, 2));
