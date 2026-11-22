"use strict";

// Run from the repository root with Node 22:
// node sims/lp2_p55_fibonacci_prime_totient_continuation_sft.cjs
//
// One frozen source-constrained hypothesis:
// - p57's unique red 23-dot mark selects the central 23 of p55's 43 word interiors.
// - p15's 16-cell grid gives the first 16 distinct Fibonacci values as prime ordinals;
//   its infinity mark is hypothesized to instruct continuing that sequence to 23 terms.
// - The solved p56 cipher supplies the additive GP29 inverse P=C-(prime-1) mod 29.
// No phase, offset, sign, reverse, word reset, or literal-F skip is fitted.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const annotations = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"
));

const p57 = annotations.pages.find((page) => page.page === 57);
assert.ok(p57, "Missing p57 annotations");
assert.equal(annotations.counts.red23, 1, "p57 23-dot red mark is no longer unique");
assert.deepEqual(
  p57.large_punctuation.filter((mark) => mark[1] === 23),
  [[95, 23, "red"]]
);

// Physical p55 is rune-bearing page index 54 because physical p50 is numeric-only.
const parsed = parseSharedCorpus();
const p55Words = parsed.byContainedPage[54];
assert.equal(p55Words.length, 16);
const wordLengths = p55Words.map((word) => word.length);
assert.deepEqual(wordLengths, [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

const interiorEntries = p55Words.flatMap((word, wordIndex) =>
  [...word.runes].slice(1, -1).map((rune, withinWord) => ({
    rune, wordIndex, withinWord
  }))
);
assert.equal(interiorEntries.length, 43);
const centralEntries = interiorEntries.slice(10, 33);
assert.equal(centralEntries.length, 23);

const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const ciphertext = centralEntries.map((entry) => runeToIndex.get(entry.rune));
assert.ok(ciphertext.every((value) => Number.isInteger(value) && value >= 0 && value < 29));
assert.deepEqual(ciphertext, [
  28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20, 15,
  23, 27, 13, 8, 12, 18, 10, 6, 14, 6, 15
]);

// The established p15 square contains the first 16 terms of this distinct
// Fibonacci sequence. The final seven terms are an explicit extrapolation.
const standardFib = [0, 1];
while (standardFib.length < 24) {
  standardFib.push(standardFib[standardFib.length - 1] + standardFib[standardFib.length - 2]);
}
const fibonacci = [0, ...standardFib.slice(2)];
assert.equal(fibonacci.length, 23);
assert.deepEqual(fibonacci.slice(0, 16), [
  0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987
]);

const printedGridSpiral = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const first16Primes = [
  2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817
];

// A 400,000-entry sieve contains more than the required 28,658 primes.
const sieveLimit = 400000;
const composite = new Uint8Array(sieveLimit + 1);
for (let p = 2; p * p <= sieveLimit; p++) {
  if (composite[p]) continue;
  for (let n = p * p; n <= sieveLimit; n += p) composite[n] = 1;
}
const primes = [];
for (let n = 2; n <= sieveLimit; n++) if (!composite[n]) primes.push(n);
function primeAt(oneBasedOrdinal) {
  assert.ok(Number.isInteger(oneBasedOrdinal) && oneBasedOrdinal >= 1);
  const value = primes[oneBasedOrdinal - 1];
  assert.ok(value, "Sieve too small for prime ordinal " + oneBasedOrdinal);
  return value;
}

for (let i = 0; i < 16; i++) {
  const p = primeAt(fibonacci[i] + 1);
  assert.equal(p, first16Primes[i], "p15 prime identity mismatch at spiral step " + i);
  assert.equal(Math.abs(3301 - p), printedGridSpiral[i],
    "p15 printed grid mismatch at spiral step " + i);
}

const primeOrdinals = fibonacci.map((value) => value + 1);
const primeValues = primeOrdinals.map(primeAt);
const key = primeValues.map((prime) => prime - 1);
const mod29 = (value) => ((value % 29) + 29) % 29;
const keyMod29 = key.map(mod29);

// Direct p56-style decryption; all 23 p55 symbols consume one key position.
// The special literal-F exception observed at p56 offset 56 is not generalized.
const plaintext = ciphertext.map((value, i) => mod29(value - keyMod29[i]));
const reencrypted = plaintext.map((value, i) => mod29(value + keyMod29[i]));
assert.deepEqual(reencrypted, ciphertext);

// Independent arithmetic positive control under the exact same 23-position key.
const plantedPlaintext = Array.from({ length: 23 }, (_, i) => (7 * i + 3) % 29);
const plantedCiphertext = plantedPlaintext.map((value, i) => mod29(value + keyMod29[i]));
assert.deepEqual(
  plantedCiphertext.map((value, i) => mod29(value - keyMod29[i])),
  plantedPlaintext
);

const translit = (values) => values.map((value) => corpus.translit[value]);
const groupedPlaintext = [];
for (let i = 0; i < centralEntries.length; i++) {
  const wordIndex = centralEntries[i].wordIndex;
  let group = groupedPlaintext[groupedPlaintext.length - 1];
  if (!group || group.wordIndex !== wordIndex) {
    group = { wordIndex, tokens: [] };
    groupedPlaintext.push(group);
  }
  group.tokens.push(corpus.translit[plaintext[i]]);
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

console.log(JSON.stringify({
  classification: "SOURCE-CONSTRAINED ORIGINAL-INPUT NEGATIVE",
  hypothesis: "p15 infinity -> continue distinct Fibonacci prime ordinals to 23 -> p56 prime-totient subtraction on p55 central 23",
  source: {
    p15PrintedGridSpiral: printedGridSpiral,
    first16UnderlyingPrimes: first16Primes,
    p57UniqueRed23Marker: p57.large_punctuation.filter((mark) => mark[1] === 23),
    p55CompleteWordCount: p55Words.length,
    p55WordLengths: wordLengths,
    p55InteriorCount: interiorEntries.length,
    centralSlice: "interior offsets 10..32 inclusive"
  },
  input: {
    central23Indices: ciphertext,
    central23GP: translit(ciphertext).join(" ")
  },
  key: {
    distinctFibonacci: fibonacci,
    oneBasedPrimeOrdinals: primeOrdinals,
    primeValues: primeValues,
    primeMinusOneMod29: keyMod29
  },
  original: {
    decryptedIndices: plaintext,
    decryptedGP: translit(plaintext).join(" "),
    decryptedGroupsByOriginalWord: groupedPlaintext.map((group) => ({
      originalWordIndex: group.wordIndex + 1,
      gp: group.tokens.join(" ")
    })),
    ciphertextIoC: ioc(ciphertext),
    decryptedIoC: ioc(plaintext)
  },
  controls: {
    original23RuneReencryptsExactly: true,
    synthetic23RunePositiveControlRecoversExactly: true
  },
  decision: "The exact source-fixed schedule produces no recognizable GP-English plaintext. Retire this direct model; do not fit starts, signs, reversals, or F-skip masks."
}, null, 2));
