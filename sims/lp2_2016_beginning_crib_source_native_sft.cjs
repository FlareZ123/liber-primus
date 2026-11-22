"use strict";

/**
 * Source-native spelling gate for the 22 May 2016 participant's speculative
 * LP2 p54 heading "A BEGINNING".
 *
 * This tests that exact phrase and documented fixed-width consumers. It is
 * NOT a plaintext identification and does not exclude an alternate GP spelling
 * or a variable-length cipher.
 *
 * SFT: node sims/lp2_2016_beginning_crib_source_native_sft.cjs
 * Node.js 20+, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const p54 = gp.pages.find(page => page.page === 54);
assert(p54);
assert.equal(p54.runic_count, 232);

const head = p54.indices.slice(0, 9);
const printedHeading = "ᚪ-ᛗᛝᛞᛡᚦᛉᛁᛗ";
assert(transcription.includes(printedHeading));
assert.equal(head.map(i => gp.runes[i]).join("").length, 9);
assert.equal(head.map(i => gp.runes[i]).join(""), printedHeading.replace("-", ""));
assert.deepEqual(head, [24, 19, 21, 23, 27, 2, 14, 10, 19]);

// Genuine solved-language witnesses for the source spelling of ING.
assert(lp1.includes("ᚠᚩᛚᛚᚩᚹᛝ")); // FOLLOWING, not FOLLOW-I-NG
assert(lp1.includes("ᚦᛝᛋ"));       // THINGS, not TH-I-NG-S
const p57 = gp.pages.find(page => page.page === 57);
assert(p57);
assert(p57.indices.join(",").includes("16,1,9,9,18,20,21")); // TUNNELING

const sourceNative = encodeSourceNativeGP("BEGINNING");
const inventoryLabels = encodeSourceNativeGP("BEGINNING", false);
assert.deepEqual(sourceNative, [17, 18, 6, 10, 9, 9, 21]);
assert.deepEqual(inventoryLabels, [17, 18, 6, 10, 9, 9, 10, 21]);
const cipherWord = head.slice(1);
assert.equal(cipherWord.length, 8);
assert.equal(sourceNative.length, 7);
assert.equal(inventoryLabels.length, 8);

/**
 * Does any deterministic one-symbol map, however secret, send the given
 * unmodified plaintext symbol sequence to the observed ciphertext word?
 * @param {number[]} plain
 * @param {number[]} cipher
 * @returns {{possible:boolean, firstContradiction:number|null}}
 */
function deterministicMap(plain, cipher) {
  if (plain.length !== cipher.length) {
    return {possible: false, firstContradiction: null};
  }
  const mapping = new Map();
  for (let i = 0; i < plain.length; i++) {
    if (mapping.has(plain[i]) && mapping.get(plain[i]) !== cipher[i]) {
      return {possible: false, firstContradiction: i};
    }
    mapping.set(plain[i], cipher[i]);
  }
  return {possible: true, firstContradiction: null};
}
const sourceTest = deterministicMap(sourceNative, cipherWord);
const legacyTest = deterministicMap(inventoryLabels, cipherWord);
assert.deepEqual(sourceTest, {possible: false, firstContradiction: null});
assert.deepEqual(legacyTest, {possible: false, firstContradiction: 5});
assert.equal(cipherWord[0], cipherWord[7]); // original M…M; legacy B…NG differ
assert.notEqual(inventoryLabels[0], inventoryLabels[7]);

console.log(JSON.stringify({
  status: "conditional historical-crib constraint; no LP2 plaintext recovered",
  originalPage: 54,
  originalWordRunes: cipherWord.length,
  sourceNativeBeginNINGRunes: sourceNative.length,
  legacyInventoryBeginNINGRunes: inventoryLabels.length,
  sourceNativeFixedWidthCompatible: false,
  legacyFixedSubstitutionCompatible: false,
  legacyFirstConflictZeroBased: legacyTest.firstContradiction,
  survivingInterpretations: [
    "alternate non-native GP spelling plus nonstationary or position-keyed cipher",
    "source-native spelling with insertion/variable-length transport",
    "an unrelated plaintext heading"
  ]
}, null, 2));
