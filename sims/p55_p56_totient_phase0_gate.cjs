"use strict";

/**
 * Exact phase-zero transfer of the independently solved physical-p56 decoder
 * onto adjacent physical p55.
 *
 * Established p56 rule: subtract phi(p_i)=p_i-1 mod29 from successive
 * non-literal ciphertext runes, starting at p_1=2. A ciphertext F may instead
 * be literal plaintext F and consume no prime. Physical p55 has only three F
 * positions, so all 2^3 literal-F masks are the complete transferred family.
 *
 * No prime-index start, sign, offset, alternate key schedule, page permutation,
 * or language-fitted parameter is searched.
 *
 * Run: node sims/p55_p56_totient_phase0_gate.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(path.join(
  ROOT, "resources/control/emerson_essays_2944.txt"), "utf8");

const MOD = 29;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p56 = corpus.pages.find((page) => page.page === 56).indices;
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
const fPositions = p55.map((rune, index) => rune === 0 ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(fPositions, [15, 25, 41]);

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const primes = firstPrimes(100);

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % MOD) + MOD) % MOD;
}

/**
 * Apply the exact p56 rule at phase zero.
 * @param {number[]} cipher
 * @param {number} literalFMask
 * @returns {number[]}
 */
function decode(cipher, literalFMask) {
  let primeIndex = 0;
  return cipher.map((rune, position) => {
    const fIndex = fPositions.indexOf(position);
    if (fIndex >= 0 && (literalFMask & (1 << fIndex))) return 0;
    const shift = primes[primeIndex++] - 1;
    return mod(rune - shift);
  });
}

/**
 * Exact forward emitter for a fixed mask. Literal positions must contain F.
 * @param {number[]} plain
 * @param {number} literalFMask
 * @returns {number[]}
 */
function encrypt(plain, literalFMask) {
  let primeIndex = 0;
  return plain.map((value, position) => {
    const fIndex = fPositions.indexOf(position);
    if (fIndex >= 0 && (literalFMask & (1 << fIndex))) {
      assert.equal(value, 0);
      return 0;
    }
    const shift = primes[primeIndex++] - 1;
    return mod(value + shift);
  });
}

const gp = new Map(corpus.translit.map((token, index) => [token, index]));
gp.set("ING", gp.get("NG"));
const tokens = [...gp.keys()].sort((a, b) => b.length - a.length);

/** @param {string} source @returns {number[]} */
function encodeEnglish(source) {
  const out = [];
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let offset = 0; offset < word.length;) {
      const token = tokens.find((candidate) => word.startsWith(candidate, offset));
      assert.ok(token, "Unmappable reference spelling: " + word.slice(offset));
      out.push(gp.get(token));
      offset += token.length;
    }
  }
  return out;
}

const english = encodeEnglish(reference);
assert.ok(english.length > 220000);
const tri = new Uint32Array(MOD ** 3);
const TRAIN = 50000;
for (let i = 2; i < TRAIN; i++) {
  tri[english[i - 2] * MOD * MOD + english[i - 1] * MOD + english[i]]++;
}
const alpha = 0.2;
const denominator = TRAIN - 2 + tri.length * alpha;

/** @param {number[]} values @returns {number} */
function score(values) {
  let total = 0;
  for (let i = 2; i < values.length; i++) {
    const index = values[i - 2] * MOD * MOD + values[i - 1] * MOD + values[i];
    total += Math.log((tri[index] + alpha) / denominator);
  }
  return total / (values.length - 2);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((index) => corpus.translit[index]).join("");
}

const candidates = Array.from({length: 1 << fPositions.length}, (_, mask) => {
  const plain = decode(p55, mask);
  return {mask, score: score(plain), transliteration: translit(plain), plain};
}).sort((a, b) => b.score - a.score);

const controls = [];
for (let i = 0; i < 1000; i++) {
  const offset = 60000 + i * 137;
  controls.push(score(english.slice(offset, offset + p55.length)));
}
controls.sort((a, b) => a - b);

const plant = english.slice(210000, 210076);
for (const position of fPositions) plant[position] = 0;
const plantedMask = 0b111;
assert.deepEqual(decode(encrypt(plant, plantedMask), plantedMask), plant);

const result = {
  classification:
    "exact solved-p56 consecutive-prime-totient transfer to adjacent p55",
  source: {
    targetPage: 55,
    targetRunes: p55.length,
    fixedPrimeStartOneBased: 1,
    fixedOrientation: "plaintext = ciphertext - (prime - 1) mod29",
    ciphertextFPositions: fPositions,
    completeLiteralFMaskCount: 1 << fPositions.length
  },
  candidates: candidates.map(({plain, ...candidate}) => candidate),
  reference: {
    nativeWindows: controls.length,
    nativeMinimum: controls[0],
    nativeMedian: controls[500],
    nativeMaximum: controls.at(-1),
    candidatesBeatingNativeMinimum: candidates.filter(
      (candidate) => candidate.score >= controls[0]).length
  },
  positiveControl: {
    mask: plantedMask,
    exactRecovery: true,
    recoveredScore: score(plant)
  },
  decision: candidates[0].score >= controls[0]
    ? "At least one exact p56-transfer candidate reaches native-GP range; inspect before any plaintext claim."
    : "All eight exact phase-zero p56-transfer masks score below every matched native-GP window; retire direct adjacent-page reuse of the solved p56 decoder."
};
console.log(JSON.stringify(result, null, 2));
