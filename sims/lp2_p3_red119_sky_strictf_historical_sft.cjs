"use strict";

/**
 * 2013 signed "knock on the sky" plus original LP2 p3 isolated red triad.
 *
 * Earlier work established that the only complete p3 red triad is ᛈᛞᚦ
 * (GP [13,23,2]), which authentic LP1 GP29 Atbash maps to SCY (SKY).
 * This SFT tests exactly one historically demonstrated value-changing
 * consumer: an LP1-style GP29 Vigenere subtractive cipher with the
 * source-derived three-rune key and literal-plaintext-F nonconsumption.
 *
 * No fitted shift, inferred plaintext, reranked key, guessed OCR,
 * or outfile mutation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const dir = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(dir, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(dir, "lp2-ink-annotations.json"), "utf8"));
const modulus = 29;

/** @param {number} x @returns {number} */
const mod = x => (x % modulus + modulus) % modulus;
/** @param {number} n @returns {number[]} */
function page(n) {
  const entry = corpus.pages.find(x => x.page === n);
  assert.ok(entry, `Missing original LP2 page ${n}`);
  return entry.indices;
}
/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const counts = Array(modulus).fill(0);
  for (const n of stream) counts[n]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (stream.length * (stream.length - 1));
}

const p3 = page(3);
assert.equal(p3.length, 217);
const spans = ink.pages.find(x => x.page === 3).red_spans;
assert.deepEqual(spans.map(x => [x.start, x.length]), [[0, 16], [119, 3]]);
assert.deepEqual(p3.slice(119, 122), [13, 23, 2]);
assert.deepEqual(ink.pages.find(x => x.page === 6).red_spans.map(x => [x.start, x.length]), [[71, 11]]);
assert.deepEqual(ink.pages.find(x => x.page === 7).red_spans.map(x => [x.start, x.length]), [[194, 14]]);
const key = p3.slice(119, 122).map(x => 28 - x);
assert.deepEqual(key, [15, 5, 26]);
assert.equal(key.map(x => corpus.translit[x]).join(""), "SCY");
const chapters = [3, 4, 5, 6, 7].map(page);
assert.deepEqual(chapters.map(x => x.length), [217, 261, 263, 196, 208]);
const input = chapters.flat();
assert.equal(input.length, 1145);
const control = page(57);
assert.equal(control.length, 95);

/**
 * Simulate exactly Cicada's historical plaintext-F literal/nonconsuming
 * convention with a 3-rune key. Sign is the encryption sign.
 * @param {number[]} plaintext
 * @param {1|-1} sign
 */
function encryptPlaintext(plaintext, sign) {
  let clock = 0;
  return plaintext.map(p => {
    if (p === 0) return 0;
    const c = mod(p + sign * key[clock % key.length]);
    clock++;
    return c;
  });
}
/**
 * Exhaustively propagate every permitted ciphertext-F bypass path.
 * Non-F ciphertext may not decrypt to F because original F is literal.
 * Key phase 0 at original physical p3 rune0.
 * @param {number[]} ciphertext
 * @param {1|-1} sign Decryption sign.
 * @returns {{firstImpossible: number|null, survivorCount:number}}
 */
function strictInverseStates(ciphertext, sign) {
  // Multiple paths with the same clock produce the same future legality.
  let clocks = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i], next = new Set();
    for (const clock of clocks) {
      const p = mod(c + sign * key[clock % key.length]);
      if (p !== 0) next.add(clock + 1);
      if (c === 0) next.add(clock); // literal plaintext F
    }
    if (next.size === 0) return {firstImpossible: i, survivorCount: 0};
    clocks = next;
  }
  return {firstImpossible: null, survivorCount: clocks.size};
}
for (const sign of /** @type {Array<1|-1>} */ ([-1, 1])) {
  const rawCandidate = input.map((c, i) => mod(c + sign * key[i % 3]));
  const strict = strictInverseStates(input, sign);
  assert.equal(strict.firstImpossible, sign === -1 ? 20 : 22);
  // Inverse of encryption sign is the negative of decryption sign.
  const ciphertextPlant = encryptPlaintext(control, /** @type {1|-1} */ (-sign));
  const positive = strictInverseStates(ciphertextPlant, sign);
  assert.equal(positive.firstImpossible, null);
  const recovered = [];
  let plantedClock = 0;
  for (let i = 0; i < control.length; i++) {
    if (control[i] === 0) {
      assert.equal(ciphertextPlant[i], 0);
      recovered.push(0);
      continue;
    }
    recovered.push(mod(ciphertextPlant[i] + sign * key[plantedClock % 3]));
    plantedClock++;
  }
  assert.deepEqual(recovered, control);
  console.log("SKY_SOURCE_FIXED " + JSON.stringify({
    sign, fullChapterRunes: input.length,
    firstImpossibleZeroBased: strict.firstImpossible,
    cipherRune: corpus.translit[input[strict.firstImpossible]],
    keyRune: corpus.translit[key[strict.firstImpossible % 3]],
    allConsumingIoC: Number(ioc(rawCandidate).toFixed(12)),
    preview: rawCandidate.slice(0, 32).map(n => corpus.translit[n]).join(" "),
    nativePositiveSurvivors: positive.survivorCount
  }));
}
console.log("SKY_SOURCE_GATE_COMPLETE " + JSON.stringify({
  sourcePage3Triple: p3.slice(119,122),
  key, chapterPages: [3,4,5,6,7],
  sourceClearPositiveRunes: control.length,
  negativeDecision: "Both historical GP Vigenere signs algebraically illegal under plaintext-F bypass"
}));
