"use strict";

/**
 * One frozen nonlinear word-feedback candidate:
 *   shift(word_i) = M7(sum(GP-prime(previous ciphertext word)) mod 29)
 * with M7's pole interpreted as an empty/no-op shift.
 *
 * This composes the historical 0_wisdom word-prime-sum operation, the
 * source-derived p32 projectivity M7, and the p56 subtract direction.
 * The composition is a hypothesis, not an authenticated LP2 instruction.
 *
 * Run from repository root with Node.js 22:
 *   node sims/lp2_word_sum_m7_feedback_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const MOD = 29;
const mod = (n) => ((n % MOD) + MOD) % MOD;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((r, i) => [r, i]));

function inverse(a) {
  for (let i = 1; i < MOD; i++) if (mod(a * i) === 1) return i;
  throw new Error("non-invertible field element");
}

/** M7(x) = (14x+25)/(25x+28) on P^1(F_29); 29 denotes infinity. */
function projectiveM7(x) {
  assert(Number.isInteger(x) && x >= 0 && x < MOD);
  const denominator = mod(25 * x + 28);
  if (denominator === 0) return MOD;
  return mod((14 * x + 25) * inverse(denominator));
}

/** @param {number[]} word GP indices */
function wordPrimeResidue(word) {
  return mod(word.reduce((sum, index) => sum + corpus.prime[index], 0));
}

/**
 * Encryption is causal: each word's shift is determined by the previous
 * ciphertext word. During decryption that previous ciphertext word is
 * already available. The first word has no predecessor and is unchanged.
 *
 * @param {number[][]} input
 * @param {boolean} decrypt
 */
function transform(input, decrypt) {
  const output = [];
  const shifts = [];
  let previousCiphertext = null;
  let poleEvents = 0;

  for (const word of input) {
    let shift = 0;
    if (previousCiphertext !== null) {
      const mapped = projectiveM7(wordPrimeResidue(previousCiphertext));
      if (mapped === MOD) {
        // The p32 projective pole is the "empty" state in this frozen model.
        shift = 0;
        poleEvents++;
      } else {
        shift = mapped;
      }
    }
    shifts.push(shift);
    const mappedWord = word.map((x) => mod(x + (decrypt ? -shift : shift)));
    output.push(mappedWord);
    previousCiphertext = decrypt ? word : mappedWord;
  }
  return { words: output, shifts, poleEvents };
}

function ioc(data) {
  const counts = Array(MOD).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

/** Existing GP-English control normalization used by the word-sum gate. */
function englishGpWords(text) {
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map((word) => {
    const normalized = word.replace(/V/g, "U").replace(/K/g, "C")
      .replace(/Z/g, "S").replace(/Q/g, "C");
    const parts = normalized.match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || [];
    return parts.map((part) => {
      const index = translitIndex.get(part);
      assert(index !== undefined, "unmapped GP token " + part);
      return index;
    });
  });
}

function trigramModel(data, alpha = 0.1) {
  const triples = new Map();
  const pairs = new Map();
  for (let i = 2; i < data.length; i++) {
    const prefix = data[i - 2] * MOD + data[i - 1];
    const triple = prefix * MOD + data[i];
    triples.set(triple, (triples.get(triple) || 0) + 1);
    pairs.set(prefix, (pairs.get(prefix) || 0) + 1);
  }
  return { triples, pairs, alpha };
}

function trigramScore(data, model) {
  let total = 0;
  let n = 0;
  for (let i = 2; i < data.length; i++) {
    const prefix = data[i - 2] * MOD + data[i - 1];
    const triple = prefix * MOD + data[i];
    total += Math.log(
      ((model.triples.get(triple) || 0) + model.alpha) /
      ((model.pairs.get(prefix) || 0) + MOD * model.alpha)
    );
    n++;
  }
  return total / n;
}

const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);

const words = parsed.words.map((word) => [...word.runes].map((r) => {
  const index = runeIndex.get(r);
  assert(index !== undefined, "unknown rune " + r);
  return index;
}));
const original = words.flat();
assert.equal(original.length, 12956);

// Check the source-derived M7 projectivity has order seven on all 30 points.
function applyP1(x) {
  if (x === MOD) return mod(14 * inverse(25));
  return projectiveM7(x);
}
for (let x = 0; x <= MOD; x++) {
  let y = x;
  for (let i = 0; i < 7; i++) y = applyP1(y);
  assert.equal(y, x, "M7 order check failed at " + x);
}

const decodedResult = transform(words, true);
const decoded = decodedResult.words;
const decodedFlat = decoded.flat();
assert.equal(decodedFlat.length, original.length);
assert.equal(decodedResult.poleEvents, 92);

// Algebraic round-trip on the actual input is an implementation check only.
assert.deepEqual(transform(decoded, false).words, words);

const shakespeareWords = englishGpWords(read("resources/control/shakespeare_first300k.txt"));
const gibranWords = englishGpWords(read("resources/control/gibran_prophet_58585.txt"));
const shakespeareFlat = shakespeareWords.flat();
const gibranFlat = gibranWords.flat();
const shakespeareModel = trigramModel(shakespeareFlat);
const gibranModel = trigramModel(gibranFlat);

const originalScores = {
  shakespeare: trigramScore(original, shakespeareModel),
  gibran: trigramScore(original, gibranModel)
};
const decodedScores = {
  shakespeare: trigramScore(decodedFlat, shakespeareModel),
  gibran: trigramScore(decodedFlat, gibranModel)
};

// Independent native-English positive: encrypt/decrypt 2,896 actual
// Shakespeare GP words with the exact same ciphertext-feedback rule.
const plant = shakespeareWords.slice(0, 2896);
assert.equal(plant.length, 2896);
const plantRuneCount = plant.reduce((n, word) => n + word.length, 0);
const encryptedPlant = transform(plant, false).words;
const recoveredPlant = transform(encryptedPlant, true).words;
assert.deepEqual(recoveredPlant, plant);

const shiftHistogram = decodedResult.shifts.reduce((hist, shift) => {
  hist[shift] = (hist[shift] || 0) + 1;
  return hist;
}, {});
const first40 = decoded.slice(0, 40)
  .map((word) => word.map((index) => corpus.translit[index]).join(""));

const output = {
  classification: "single source-motivated hypothesis; no LP2 plaintext recovered",
  input: {
    words: parsed.words.length,
    runes: parsed.runeCount,
    crossPageWords: parsed.crossPageWords
  },
  frozenModel: {
    m7: [[14, 25], [25, 28]],
    rule: "next-word shift = M7(previous ciphertext word GP-prime sum mod 29)",
    direction: "subtract, matching the solved p56 inverse direction",
    pole: "M7(7)=infinity; infinity is interpreted as zero/no-op shift",
    reset: "continuous across the canonical word stream",
    initialWord: "unshifted because no previous ciphertext word exists",
    poleEvents: decodedResult.poleEvents,
    distinctShifts: Object.keys(shiftHistogram).length,
    shiftHistogram
  },
  originalInput: {
    rawIoC: ioc(original),
    decodedIoC: ioc(decodedFlat),
    originalTrigramScores: originalScores,
    decodedTrigramScores: decodedScores,
    trigramSmoothingAlpha: 0.1,
    first40DecodedWords: first40
  },
  positiveControl: {
    source: "first 2,896 Shakespeare GP words",
    words: plant.length,
    runes: plantRuneCount,
    exactRecovered: recoveredPlant.length,
    exact: true
  },
  scope: "This rejects only the frozen M7-transformed preceding-cipherword sum schedule. It does not reject other nonlinear moving-word keys or establish creator intent."
};

assert(Math.abs(ioc(original) - 0.03447839786450569) < 1e-12);
assert(Math.abs(ioc(decodedFlat) - 0.03448513026722634) < 1e-12);
assert(Math.abs(originalScores.shakespeare - (-4.679396311885891)) < 1e-9);
assert(Math.abs(decodedScores.shakespeare - (-4.667196415621322)) < 1e-9);
assert(Math.abs(originalScores.gibran - (-4.349374190815645)) < 1e-9);
assert(Math.abs(decodedScores.gibran - (-4.365713452958419)) < 1e-9);

console.log(JSON.stringify(output, null, 2));
