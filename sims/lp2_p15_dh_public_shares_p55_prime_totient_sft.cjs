"use strict";

// Run from the repository root with Node 22:
// node sims/lp2_p15_dh_public_shares_p55_prime_totient_sft.cjs
//
// Frozen human-solve-path hypothesis:
// p15 red-span lengths 9 and 11 are DH public shares; p57's unique red-23 mark
// selects p=23; the signed 2013 challenge supplies g=5. Their DH shared secret
// is 2, independently echoed by p15's red 3299 = 3301-2 and by the p56
// prime-totient start at prime 2. p57's circumference instruction selects all
// 43 interior runes on p55. Apply the solved p56 inverse exactly once.
// No fitted phase, alternate group, reset, reversal, or literal-F skip.

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

const p15 = annotations.pages.find((page) => page.page === 15);
const p57 = annotations.pages.find((page) => page.page === 57);
assert.ok(p15 && p57, "Missing p15 or p57 annotation");
const publicShares = p15.red_spans.map((span) => span.length);
assert.deepEqual(publicShares, [9, 11]);
assert.deepEqual(p15.red_spans.map((span) => [...span.runes].length), [9, 11]);
assert.equal(annotations.counts.red23, 1);
assert.deepEqual(
  p57.large_punctuation.filter((mark) => mark[1] === 23),
  [[95, 23, "red"]]
);

const modulus = 23;
const generator = 5;
function modPow(base, exponent, mod) {
  let result = 1;
  for (let i = 0; i < exponent; i++) result = (result * base) % mod;
  return result;
}
function discreteLog(base, target, mod) {
  for (let exponent = 1; exponent < mod - 1; exponent++) {
    if (modPow(base, exponent, mod) === target) return exponent;
  }
  throw new Error("No discrete log in the selected DH group");
}

const [aliceShare, bobShare] = publicShares;
const alicePrivate = discreteLog(generator, aliceShare, modulus);
const bobPrivate = discreteLog(generator, bobShare, modulus);
assert.equal(modPow(generator, alicePrivate, modulus), aliceShare);
assert.equal(modPow(generator, bobPrivate, modulus), bobShare);
const sharedFromAlice = modPow(bobShare, alicePrivate, modulus);
const sharedFromBob = modPow(aliceShare, bobPrivate, modulus);
assert.equal(sharedFromAlice, 2);
assert.equal(sharedFromBob, sharedFromAlice);

// Independent p15 numerical cross-check: its central red value is 3299.
const p15CentralRed = 3299;
assert.equal(3301 - p15CentralRed, sharedFromAlice);

// Physical p55 is rune-bearing corpus page index 54 because physical p50 is numeric-only.
const parsed = parseSharedCorpus();
const p55Words = parsed.byContainedPage[54];
assert.equal(p55Words.length, 16);
const wordLengths = p55Words.map((word) => word.length);
assert.deepEqual(wordLengths, [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

const interiorGroups = p55Words.map((word) => [...word.runes].slice(1, -1));
const interior = interiorGroups.flat();
assert.equal(interior.length, 43);

const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const ciphertext = interior.map((rune) => runeToIndex.get(rune));
assert.ok(ciphertext.every((value) => Number.isInteger(value) && value >= 0 && value < 29));
assert.deepEqual(ciphertext, [
  19, 10, 12, 6, 23, 2, 27, 24, 17, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20, 15,
  23, 27, 13, 8, 12, 18, 10, 6, 14, 6, 15, 12, 2, 2, 18, 28, 10, 19, 5, 11, 18
]);

// The shared secret 2 selects the solved p56 stream's first prime, p=2.
// Use 43 consecutive prime-totient shifts; all p55 interiors consume one key.
const sieveLimit = 300;
const composite = new Uint8Array(sieveLimit + 1);
for (let p = 2; p * p <= sieveLimit; p++) {
  if (composite[p]) continue;
  for (let n = p * p; n <= sieveLimit; n += p) composite[n] = 1;
}
const primes = [];
for (let n = 2; n <= sieveLimit; n++) if (!composite[n]) primes.push(n);
assert.ok(primes.length >= 43);
const primeStream = primes.slice(0, 43);
const key = primeStream.map((prime) => prime - 1);
const mod29 = (value) => ((value % 29) + 29) % 29;
const keyMod29 = key.map(mod29);
const plaintext = ciphertext.map((value, i) => mod29(value - keyMod29[i]));
assert.deepEqual(
  plaintext.map((value, i) => mod29(value + keyMod29[i])),
  ciphertext
);

// Independent arithmetic positive control under the exact 43-position key.
const plantedPlaintext = Array.from({ length: 43 }, (_, i) => (7 * i + 3) % 29);
const plantedCiphertext = plantedPlaintext.map((value, i) => mod29(value + keyMod29[i]));
assert.deepEqual(
  plantedCiphertext.map((value, i) => mod29(value - keyMod29[i])),
  plantedPlaintext
);

const groupedPlaintext = [];
let cursor = 0;
for (let wordIndex = 0; wordIndex < interiorGroups.length; wordIndex++) {
  const group = interiorGroups[wordIndex].map(() => corpus.translit[plaintext[cursor++]]);
  if (group.length) groupedPlaintext.push({ originalWordIndex: wordIndex + 1, gp: group.join(" ") });
}
assert.equal(cursor, 43);

console.log(JSON.stringify({
  classification: "SOURCE-CONSTRAINED ORIGINAL-INPUT NEGATIVE",
  hypothesis: "p15 red spans as DH public shares -> DH23 shared secret 2 -> p56 prime-totient stream from prime 2 -> p55 word interiors",
  dh: {
    modulus,
    generator,
    publicShares: [aliceShare, bobShare],
    privateExponentsRecoveredFromPublicShares: [alicePrivate, bobPrivate],
    publicSharesVerified: [
      modPow(generator, alicePrivate, modulus),
      modPow(generator, bobPrivate, modulus)
    ],
    sharedSecretFromEitherSide: sharedFromAlice
  },
  p15CrossCheck: {
    centralRedValue: p15CentralRed,
    subtraction: "3301 - 3299",
    result: sharedFromAlice
  },
  p57Selector: p57.large_punctuation.filter((mark) => mark[1] === 23),
  p55Input: {
    completeWordCount: p55Words.length,
    wordLengths,
    interiorRuneCount: interior.length,
    interiorGP: ciphertext.map((value) => corpus.translit[value]).join(" "),
    interiorIndices: ciphertext
  },
  key: {
    primeStart: 2,
    primeValues: primeStream,
    primeMinusOneMod29: keyMod29
  },
  originalOutput: {
    plaintextIndices: plaintext,
    plaintextGP: plaintext.map((value) => corpus.translit[value]).join(" "),
    groupedByOriginalWord: groupedPlaintext
  },
  controls: {
    original43RuneReencryptsExactly: true,
    synthetic43RunePositiveControlRecoversExactly: true
  },
  decision: "The exact DH-selected prime-2 totient stream does not produce recognizable GP-English plaintext from p55's 43 circumferential interiors. Retire this direct model."
}, null, 2));
