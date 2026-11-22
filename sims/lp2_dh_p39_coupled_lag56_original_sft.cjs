/**
 * Source-derived candidate: coupled lag-5/lag-6 nonlinear GP29 feedback.
 *
 * Run: node sims/lp2_dh_p39_coupled_lag56_original_sft.cjs
 * Requires Node.js 22, no packages, no writes, no network.
 * This is a candidate cipher rejection, not recovered LP2 plaintext.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % 29) + 29) % 29;
}

/** Signed 2013 DH affine operation, T(x)=24-2x (mod29). @param {number} x @returns {number} */
function T(x) {
  return mod(24 - 2 * x);
}

/** Exact inverse of T: T^-1(y)=14(y-24) (mod29). @param {number} y @returns {number} */
function inverseT(y) {
  return mod(14 * (y - 24));
}

/** Original p39 red triad [27,5,15]: G(x)=15(x+5)^2. @param {number} x @returns {number} */
function G(x) {
  return mod(15 * (x + 5) * (x + 5));
}

/**
 * Fixed proposed forward consumer for a source-visible red title seed.
 * C[i] = T(P[i] + C[i-5] + G(T(C[i-6]))) mod29.
 * @param {number[]} seed Original red-title ciphertext runes (length >= 6).
 * @param {number[]} plaintext Native GP29 message symbols.
 * @returns {number[]} Complete ciphertext with unchanged title seed.
 */
function encode(seed, plaintext) {
  const cipher = [...seed];
  for (const plain of plaintext) {
    const i = cipher.length;
    cipher.push(T(mod(plain + cipher[i - 5] + G(T(cipher[i - 6])))));
  }
  return cipher;
}

/**
 * Exact inverse with no hidden key or per-page reset.
 * @param {number[]} ciphertext Original GP29 register, title included.
 * @param {number} seedLength Number of original red-title seed runes.
 * @returns {number[]} Proposed plaintext starting after the title.
 */
function decode(ciphertext, seedLength) {
  const out = [];
  for (let i = seedLength; i < ciphertext.length; i += 1) {
    out.push(mod(inverseT(ciphertext[i]) - ciphertext[i - 5] - G(T(ciphertext[i - 6]))));
  }
  return out;
}

/** @param {number[]} text @returns {number} */
function indexOfCoincidence(text) {
  const freq = new Array(29).fill(0);
  for (const x of text) freq[x] += 1;
  return freq.reduce((total, f) => total + f * (f - 1), 0) / (text.length * (text.length - 1));
}

/** @param {number[]} symbols @param {number} count @returns {string} */
function transliterate(symbols, count) {
  return symbols.slice(0, count).map((x) => corpus.translit[x]).join(' ');
}

for (let x = 0; x < 29; x += 1) {
  assert.equal(inverseT(T(x)), x);
  assert.equal(G(x), mod(27 + 5 * x + 15 * x * x));
  assert.equal(G(T(x)), mod(2 * x * x));
}

const page = (n) => corpus.pages[n].indices;
const span = (n) => ink.pages.find((p) => p.page === n).red_spans[0];

assert.equal(span(39).start, 119);
assert.equal(span(39).length, 3);
assert.deepEqual(page(39).slice(119, 122), [27, 5, 15]);
assert.equal(span(40).start, 0);
assert.equal(span(40).length, 8);
assert.equal(span(53).start, 128);
assert.equal(span(53).length, 51);
assert.equal(span(54).start, 0);
assert.equal(span(54).length, 9);
assert.equal(page(55).length, 76);
assert.equal(page(57).length, 95);

const chapter40 = corpus.pages.slice(40, 54).flatMap((p) => p.indices);
const blackEnd40 = chapter40.length - span(53).length;
const blackCipher40 = chapter40.slice(0, blackEnd40);
const seed40 = blackCipher40.slice(0, 8);
const plain40 = decode(blackCipher40, 8);
assert.equal(chapter40.length, 3008);
assert.equal(plain40.length, 2949);
assert.deepEqual(encode(seed40, plain40), blackCipher40);

// Reserve the separate final chapter for a genuine unchanged source holdout.
const chapter54 = [...page(54), ...page(55)];
const seed54 = chapter54.slice(0, 9);
const plain54 = decode(chapter54, 9);
assert.equal(chapter54.length, 308);
assert.equal(plain54.length, 299);
assert.deepEqual(encode(seed54, plain54), chapter54);

// Independently source-native, known 95-rune GP plaintext, with the same
// original red title as the IV. This controls the complete forward/inverse.
const native = page(57);
const planted = encode(seed40, native);
assert.deepEqual(decode(planted, 8), native);
const wrongLag = planted.slice(8).map((value, j) => {
  const i = j + 8;
  return mod(inverseT(value) - planted[i - 4] - G(T(planted[i - 6])));
});
const wrongMatches = wrongLag.filter((x, i) => x === native[i]).length;
assert.equal(wrongMatches, 0);

const outcome = {
  source: 'Original LP2 pp39-40, pp40-53 and independent pp54-55; p57 known-GP control',
  signedDH: 'T(x)=24-2x mod29',
  originalRedTriad: '[27,5,15], G(x)=15(x+5)^2 mod29',
  nonlinearIdentity: 'G(T(x))=2x^2 mod29 for all 29 symbols',
  proposedCipher: 'C[i]=T(P[i]+C[i-5]+G(T(C[i-6]))) mod29',
  seed: 'last six original runes of the red 8-rune p40 title / 9-rune p54 title',
  p40to53: {
    originalRunes: chapter40.length,
    unencryptedRedP40Seed: 8,
    withheldRedP53Tail: 51,
    testedOriginalBlackRunes: plain40.length,
    ciphertextIoC: indexOfCoincidence(blackCipher40.slice(8)),
    inverseIoC: indexOfCoincidence(plain40),
    exactReencryption: true,
    first80InverseRunes: transliterate(plain40, 80)
  },
  p54to55Holdout: {
    originalRunes: chapter54.length,
    redTitleSeed: 9,
    testedOriginalBlackRunes: plain54.length,
    inverseIoC: indexOfCoincidence(plain54),
    exactReencryption: true,
    first80InverseRunes: transliterate(plain54, 80)
  },
  nativePositiveControl: {
    knownPlainRunes: native.length,
    nativePlainIoC: indexOfCoincidence(native),
    recoveredExactly: native.length,
    wrongLagMatches: wrongMatches
  },
  decision: 'Rejected frozen coupled nonlinear feedback: both original inverses remain nonlinguistic; no unknown plaintext or original cipher key recovered.'
};
assert.ok(outcome.p40to53.inverseIoC < 0.04);
assert.ok(outcome.p54to55Holdout.inverseIoC < 0.04);
console.log(JSON.stringify(outcome, null, 2));
