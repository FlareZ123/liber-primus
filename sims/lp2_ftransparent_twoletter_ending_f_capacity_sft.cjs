"use strict";

/**
 * Native-GP two-rune F-position capacity under the genuine plaintext-F bypass.
 *
 * This is an exact necessary condition on same-word-boundary original LP2
 * ciphertext plus finite native-English-register comparison. It is NOT an
 * impossibility theorem for every conceivable unknown LP2 plaintext.
 *
 * Run with Node.js 22: node sims/lp2_ftransparent_twoletter_ending_f_capacity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const tokenNames = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
assert.equal(corpus.translit[0], "F");
assert.equal(corpus.translit[3], "O");
assert.equal(corpus.translit[10], "I");

/** @param {string} source */
function originalWords(source) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  function emit() {
    if (current.length) words.push(current);
    current = [];
  }
  for (const char of source) {
    const index = runeToIndex.get(char);
    if (index !== undefined) current.push(index);
    else if (char === "%" || char === "/" || /\s/u.test(char)) {
      // Neither a physical page break nor visual line wrap ends a word.
    } else emit();
  }
  emit();
  return words;
}

/** @param {string} source */
function nativeWords(source) {
  const normalized = source.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  return (normalized.match(/[A-Z]+/g) || []).map(word => {
    /** @type {number[]} */
    const result = [];
    for (let i = 0; i < word.length;) {
      const match = tokenNames.find(t => word.startsWith(t.s, i));
      assert.ok(match, "Unmapped GP token in " + word);
      result.push(match.i);
      i += match.s.length;
    }
    return result;
  });
}

/** @param {number} n @param {number} p @param {number} observed */
function binomialLowerTail(n, p, observed) {
  let mass = Math.pow(1 - p, n), result = mass;
  for (let k = 0; k < observed; k++) {
    mass *= (n - k) / (k + 1) * p / (1 - p);
    result += mass;
  }
  return result;
}
const original = originalWords(
  read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%"));
assert.equal(original.length, 2896);
assert.equal(original.reduce((n, word) => n + word.length, 0), 12956);
const originalTwo = original.filter(w => w.length === 2);
const originalEndingF = originalTwo.filter(w => w[1] === 0).length;
const originalOF = originalTwo.filter(w => w[0] === 3 && w[1] === 0).length;
const originalIF = originalTwo.filter(w => w[0] === 10 && w[1] === 0).length;
assert.equal(originalTwo.length, 448);
assert.equal(originalEndingF, 10);
// Exactly ten positions are eligible for a plaintext two-rune word ending F
// under the authentic F-bypass with unchanged displayed word boundaries.

const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 11782, 1247, 1034],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 3674, 600, 532],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 21041, 3573, 3303]
].map(([name, file, expectedTwo, expectedEndingF, expectedOF]) => {
  const words = nativeWords(read(file));
  const two = words.filter(w => w.length === 2);
  const endingF = two.filter(w => w[1] === 0).length;
  const of = two.filter(w => w[0] === 3 && w[1] === 0).length;
  const ifWords = two.filter(w => w[0] === 10 && w[1] === 0).length;
  assert.equal(two.length, expectedTwo);
  assert.equal(endingF, expectedEndingF);
  assert.equal(of, expectedOF);
  const rate = endingF / two.length;
  const ofRate = of / two.length;
  return {name, totalSourceWords: words.length,
    referenceTwoRuneWords: two.length, twoRuneEndingF: endingF,
    twoRuneOF: of, twoRuneIF: ifWords,
    endingFRate: rate, expectedEndingF: rate * originalTwo.length,
    ofRate, expectedOF: ofRate * originalTwo.length,
    pAtMost10EndingF: binomialLowerTail(originalTwo.length, rate, originalEndingF),
    pAtMost10OF: binomialLowerTail(originalTwo.length, ofRate, originalEndingF)};
});
assert.deepEqual(controls.map(c => c.twoRuneEndingF), [1247, 600, 3573]);
assert.ok(controls.every(c => c.expectedEndingF > 47));
assert.ok(controls.every(c => c.pAtMost10EndingF < 1e-11));

// Historical original positive: the single plaintext-F bypass on solved LP2
// p56 is the F in "OF", and it appears at precisely the same cipher word slot.
const p56Text =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const knownWords = nativeWords(p56Text);
const plain = knownWords.flat();
const ofAt = knownWords
  .flatMap((w, n) => w[0] === 3 && w[1] === 0 && w.length === 2 ? [n] : []);
const p56 = corpus.pages.find(page => page.page === 56).indices;
assert.deepEqual(ofAt.length, 1);
assert.equal(plain.length, 85);
assert.equal(plain[55], 3);
assert.equal(plain[56], 0);
assert.equal(p56[56], 0);
const primes = [];
for (let candidate = 2; primes.length < 90; candidate++) {
  let isPrime = true;
  for (let d = 2; d * d <= candidate; d++) {
    if (candidate % d === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(candidate);
}
let clock = 0;
const reencryption = plain.map(p =>
  p === 0 ? 0 : (p + primes[clock++] - 1) % 29);
assert.deepEqual(reencryption, p56);
assert.equal(clock, 84);
assert.equal(knownWords.filter(w => w.length === 2 && w[1] === 0).length, 1);
const p56PrintedTwoEndingF = originalWords(
  read("resources/lp2-transcription.txt").split("%")[56])
  .filter(w => w.length === 2 && w[1] === 0).length;
assert.equal(p56PrintedTwoEndingF, 1);

console.log(JSON.stringify({
  original: {words: original.length, runes: 12956,
    twoRuneWords: originalTwo.length,
    ciphertextTwoRuneEndingF: originalEndingF,
    ciphertextTwoRuneOF: originalOF, ciphertextTwoRuneIF: originalIF,
    maximumPlaintextTwoRuneEndingFUnderFBypass: originalEndingF},
  controls,
  originalSolvedP56: {knownWords: knownWords.length,
    plainOFWordPositions: ofAt,
    plaintextOFAtOriginalRuneOffsets: [55, 56],
    ciphertextSuffixFAt: 56,
    exactSourceForwardReencryption: true},
  decision: "Exact original 10/448 capacity is far below these sampled ordinary-English word registers conditional on authentic plaintext-F bypass and identical printed word boundaries. This does not rule out a different unknown cipher, altered segmentation, or deliberately atypical English."
}, null, 2));
