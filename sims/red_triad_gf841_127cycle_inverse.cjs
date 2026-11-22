"use strict";

/**
 * Source-locked two-rune GF(29^2) inverse on the ORIGINAL unknown LP2 stream.
 *
 * Observations motivating this one test (not an authenticated cipher):
 * - The only red three-rune inscriptions are p3 [13,23,2] and p39 [27,5,15].
 * - The former defines u^2=3u+8; the latter is 15(x-24)^2 and exactly divides
 *   the ORIGINAL 256-byte grid polynomial over F29, read high-degree first.
 * - Dividing gives a fixed-width 254-coefficient quotient: 127 GF(29^2) pairs.
 * - The 12,956 original unknown runes are 2 + 51*(127*2), exactly.
 *
 * Single preregistered hypothesis:
 * - First original two runes supply the PUBLIC field initialization.
 * - Each remaining original two-rune pair is one field element.
 * - Decrypt by plaintext=ciphertext-state in GF(29^2).
 * - Update state = u*state + quotient_pair[t modulo 127].
 * - Continue across printed words, pages and the runeless 256-byte table.
 *
 * This tests a fully specified source-state cipher. A perfect roundtrip is an
 * implementation check and must not be interpreted as key identification.
 *
 * Run from repository root with: node sims/red_triad_gf841_127cycle_inverse.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");

/** @param {string} relative @returns {any} */
function loadJSON(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
}

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % 29) + 29) % 29;
}

/** @typedef {[number, number]} Field */
/** @param {Field} x @param {Field} y @returns {Field} */
function add(x, y) {
  return [mod(x[0] + y[0]), mod(x[1] + y[1])];
}

/** @param {Field} x @param {Field} y @returns {Field} */
function subtract(x, y) {
  return [mod(x[0] - y[0]), mod(x[1] - y[1])];
}

/** @param {Field} x @param {Field} y @returns {Field} */
function multiply(x, y) {
  // The red p3 quadratic: 13+23*u+2*u^2=0, hence u^2=8+3*u.
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
  ];
}

/** @param {number[]} bytes @returns {Field[]} */
function quotientForcing(bytes) {
  assert.equal(bytes.length, 256);
  const residue = bytes.slice().reverse().map(mod);
  const factor = [27, 5, 15];
  const quotient = Array(254).fill(0);
  // Inverse of 15 modulo29 is 2.
  for (let j = 253; j >= 0; j--) {
    const coefficient = mod(2 * residue[j + 2]);
    quotient[j] = coefficient;
    for (let k = 0; k < 3; k++) {
      residue[j + k] = mod(residue[j + k] - coefficient * factor[k]);
    }
  }
  assert.deepEqual(residue.slice(0, 2), [0, 0], "printed grid has p39 factor");
  assert.equal(quotient[253], 0, "retain one fixed-width leading zero");
  return Array.from({length: 127}, (_, i) =>
    /** @type {Field} */ ([quotient[2 * i], quotient[2 * i + 1]]));
}

/**
 * Same schedule for encoding and decoding. The sign selects which direction.
 * @param {number[]} symbols Even-length rune-index payload
 * @param {Field} seed Original two-rune initialization
 * @param {Field[]} forcing Source quotient field elements
 * @param {1 | -1} sign +1 encrypts, -1 decrypts
 * @returns {number[]}
 */
function transform(symbols, seed, forcing, sign) {
  assert.equal(symbols.length % 2, 0);
  assert.equal(forcing.length, 127);
  const result = [];
  let state = seed.slice();
  for (let t = 0; t < symbols.length / 2; t++) {
    const pair = /** @type {Field} */ ([symbols[2 * t], symbols[2 * t + 1]]);
    const mapped = sign === 1 ? add(pair, state) : subtract(pair, state);
    result.push(mapped[0], mapped[1]);
    state = add(multiply([0, 1], state), forcing[t % 127]);
  }
  return result;
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {string} text @returns {number[]} */
function nativeGP(text) {
  // A transparent Latin-to-GP control; Q/K map to C, V to U, Z to S.
  const map = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,
    J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,
    T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
  return [...text.toUpperCase()].flatMap(letter =>
    Object.hasOwn(map, letter) ? [map[letter]] : []);
}

function main() {
  const corpus = loadJSON("resources/liber-primus/lp2-corpus.json");
  const grid = loadJSON("resources/liber-primus/lp2-grid-256.json");
  const ciphertext = corpus.pages.filter(page => page.page <= 55)
    .flatMap(page => page.indices);
  const forcing = quotientForcing(grid.pages.flatMap(page => page.bytes));
  assert.equal(ciphertext.length, 12956);
  assert.equal((ciphertext.length - 2) / (2 * forcing.length), 51);
  const seed = /** @type {Field} */ ([ciphertext[0], ciphertext[1]]);
  const originalPayload = ciphertext.slice(2);

  const decoded = transform(originalPayload, seed, forcing, -1);
  assert.deepEqual(transform(decoded, seed, forcing, 1), originalPayload,
    "every original rune must reencrypt, preserving 86 doublets and all boundaries");

  const sourceText = fs.readFileSync(
    path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  const native = nativeGP(sourceText).slice(0, originalPayload.length);
  assert.equal(native.length, originalPayload.length);
  const encryptedPlant = transform(native, seed, forcing, 1);
  assert.deepEqual(transform(encryptedPlant, seed, forcing, -1), native,
    "original-length native-language plant must recover exactly");
  const wrongForcing = forcing.slice(1).concat([forcing[0]]);
  const wrongPlant = transform(encryptedPlant, seed, wrongForcing, -1);

  const reading = decoded.slice(0, 100).map(index => corpus.translit[index]).join(" ");
  const report = {
    source: "original p3/p39 red quadratics, canonical 256-byte grid, p0-55 ciphertext",
    cipherHypothesis: "first two original runes seed GF841; 51x127 source-forced affine pair updates",
    originalRuneCount: ciphertext.length,
    ciphertextInitialSeed: seed,
    sourceForcingPairs: forcing.length,
    sourceForcingCycles: 51,
    originalIoC: coincidence(originalPayload),
    decodedOriginalIoC: coincidence(decoded),
    first100DecodedOriginalGP: reading,
    nativePlantIoC: coincidence(native),
    recoveredNativePlantIoC: coincidence(transform(encryptedPlant, seed, forcing, -1)),
    wrongSourcePlantIoC: coincidence(wrongPlant),
    exactOriginalReencryption: true,
    exactNativePlantRecovery: true,
    interpretation: "Direct GP-English version of this frozen field-state cipher is unsupported if output remains near the random-rune baseline; no key/plaintext is identified."
  };
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {quotientForcing, transform, coincidence, nativeGP};
