"use strict";

// Run from the repository root with Node 22:
// node sims/lp2_p50_43byte_p55_interior_base29_key_sft.cjs
//
// Frozen 43:43 hypothesis:
// - The 43 bytes strictly between p50's two 0x3D markers are the key source.
// - p57's circumference instruction selects p55's 43 word-interior runes.
// - 2013 BASE29 converts each byte B into high=floor(B/29), low=B mod 29.
// - The solved p56 inverse supplies the additive direction P=C-key mod 29.
// Test the high and low digit channels separately; no mixed stream, phase,
// sign, reversal, word reset, or extra transform is fitted.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"
));
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));

const p50Bytes = grid.byte_rows.flat();
assert.equal(p50Bytes.length, 256);
assert.equal(p50Bytes[83], 0x3d);
assert.equal(p50Bytes[127], 0x3d);
const interval = p50Bytes.slice(84, 127);
assert.equal(interval.length, 43);
assert.deepEqual(interval, [
  173, 28, 111, 65, 211, 220, 198, 49, 236, 84, 56, 35, 222, 150, 72,
  34, 83, 229, 32, 206, 122, 63, 31, 218, 14, 184, 32, 115, 73, 143,
  197, 247, 54, 171, 35, 184, 42, 237, 86, 54, 13, 20, 163
]);

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
assert.deepEqual(ciphertext, [
  19, 10, 12, 6, 23, 2, 27, 24, 17, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20,
  15, 23, 27, 13, 8, 12, 18, 10, 6, 14, 6, 15, 12, 2, 2, 18, 28, 10, 19, 5, 11, 18
]);

const highDigits = interval.map((byte) => Math.floor(byte / 29));
const lowDigits = interval.map((byte) => byte % 29);
assert.ok(highDigits.every((digit) => digit >= 0 && digit < 29));
assert.ok(lowDigits.every((digit) => digit >= 0 && digit < 29));
const mod29 = (value) => ((value % 29) + 29) % 29;
function decrypt(key) {
  assert.equal(key.length, 43);
  return ciphertext.map((value, i) => mod29(value - key[i]));
}
function encrypt(plain, key) {
  assert.equal(plain.length, key.length);
  return plain.map((value, i) => mod29(value + key[i]));
}

const highPlaintext = decrypt(highDigits);
const lowPlaintext = decrypt(lowDigits);
assert.deepEqual(encrypt(highPlaintext, highDigits), ciphertext);
assert.deepEqual(encrypt(lowPlaintext, lowDigits), ciphertext);

// Independent arithmetic positive controls for both fixed digit channels.
const plantedPlaintext = Array.from({ length: 43 }, (_, i) => (7 * i + 3) % 29);
assert.deepEqual(
  encrypt(plantedPlaintext, highDigits).map((value, i) => mod29(value - highDigits[i])),
  plantedPlaintext
);
assert.deepEqual(
  encrypt(plantedPlaintext, lowDigits).map((value, i) => mod29(value - lowDigits[i])),
  plantedPlaintext
);

const grouped = (plain) => {
  let cursor = 0;
  return interiorGroups.map((group, wordIndex) => ({
    originalWordIndex: wordIndex + 1,
    gp: group.map(() => corpus.translit[plain[cursor++]]).join(" ")
  })).filter((group) => group.gp.length > 0);
};

console.log(JSON.stringify({
  classification: "SOURCE-CONSTRAINED ORIGINAL-INPUT NEGATIVE",
  hypothesis: "p50 43-byte interval between 0x3D markers -> BASE29 digit channel -> additive GP29 key for p55 43 word interiors",
  p50: {
    leftMarkerOffset: 83,
    leftMarker: p50Bytes[83],
    rightMarkerOffset: 127,
    rightMarker: p50Bytes[127],
    intervalOffsets: "84..126 inclusive",
    intervalBytes: interval
  },
  p55: {
    completeWordCount: p55Words.length,
    wordLengths,
    interiorCount: interior.length,
    interiorIndices: ciphertext,
    interiorGP: ciphertext.map((value) => corpus.translit[value]).join(" ")
  },
  base29: {
    highDigits: highDigits,
    lowDigits: lowDigits
  },
  highDigitChannel: {
    key: highDigits,
    plaintextIndices: highPlaintext,
    plaintextGP: highPlaintext.map((value) => corpus.translit[value]).join(" "),
    groupedByOriginalWord: grouped(highPlaintext)
  },
  lowDigitChannel: {
    key: lowDigits,
    plaintextIndices: lowPlaintext,
    plaintextGP: lowPlaintext.map((value) => corpus.translit[value]).join(" "),
    groupedByOriginalWord: grouped(lowPlaintext)
  },
  controls: {
    highChannelOriginalReencryptsExactly: true,
    lowChannelOriginalReencryptsExactly: true,
    highChannelSyntheticPositiveControl: true,
    lowChannelSyntheticPositiveControl: true
  },
  decision: "Neither direct BASE29 digit channel yields recognizable GP-English plaintext. Retire both fixed 43:43 additive-key models."
}, null, 2));
