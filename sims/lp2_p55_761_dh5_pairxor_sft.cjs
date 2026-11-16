"use strict";
/**
 * Original LP2 p55, 76 runes -> 38 source-native BASE29 digit pairs.
 * Reversible 2013-DH5 / 761.MP3-source XOR challenge. The 2013 Cicada
 * stages separately taught BASE29, a worked DH base5, and byte XOR; the
 * source audio number is 761 (GP-prime sum of its actual title).
 *
 * Every original candidate must decode to legal two-rune GP29 pairs.
 * Both original digit directions and three predetermined source exponents
 * (zero, AN END=311, PARABLE=449) are tested without key fitting.
 *
 * Run: node sims/lp2_p55_761_dh5_pairxor_sft.cjs
 * No files are written; the original corpus is read without mutation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"));
/** @param {number} page */
function pageRunes(page) {
  const entry = corpus.pages.find(p => p.page === page);
  assert.ok(entry, "Missing source page");
  return entry.indices;
}
const source = pageRunes(55), control = pageRunes(57);
assert.equal(source.length, 76);
assert.equal(control.length, 95);
const MOD = 761, BASE = 29, ORBIT = 38;
const powers = [];
let x = 1;
for (let i = 0; i < ORBIT; i++) {
  powers.push(x);
  x = x * 5 % MOD;
}
assert.equal(x, 1);
assert.equal(new Set(powers).size, ORBIT);

/** @param {number} high @param {number} low @param {"high"|"low"} order */
function pair(high, low, order) {
  assert(high >= 0 && high < BASE && low >= 0 && low < BASE);
  return order === "high" ? BASE * high + low : BASE * low + high;
}
/** @param {number} n @param {"high"|"low"} order */
function unpair(n, order) {
  assert(n >= 0 && n < BASE * BASE);
  const hi = Math.floor(n / BASE), lo = n % BASE;
  return order === "high" ? [hi, lo] : [lo, hi];
}
/**
 * @param {number[]} runes
 * @param {"high"|"low"} order
 * @param {number} exponent
 * @returns {{indices:number[],invalid:number[],keystream:number[]}}
 */
function transform(runes, order, exponent) {
  assert.equal(runes.length % 2, 0);
  const indices = [], invalid = [], keystream = [];
  for (let i = 0; i < runes.length / 2; i++) {
    const k = powers[(exponent + i) % ORBIT];
    const n = pair(runes[2 * i], runes[2 * i + 1], order) ^ k;
    keystream.push(k);
    if (n >= BASE * BASE) invalid.push({pair:i,decoded:n});
    else indices.push(...unpair(n, order));
  }
  return {indices, invalid, keystream};
}
const cases = [];
const expected = {
  high: {0:6, 311:9, 449:7},
  low: {0:6, 311:6, 449:7}
};
for (const order of ["high", "low"]) {
  for (const exponent of [0, 311, 449]) {
    const original = transform(source, order, exponent);
    assert.equal(original.invalid.length, expected[order][exponent]);
    const nativePlant = control.slice(0, 76);
    const plantedPlain = [], plantedCipher = [];
    let nativePairs = 0;
    for (let i = 0; i < 38; i++) {
      const key = powers[(exponent + i) % ORBIT];
      const native = pair(nativePlant[2 * i], nativePlant[2 * i + 1], order);
      const chosenPlain = (native ^ key) < 841 ? native : key;
      const encoded = chosenPlain ^ key;
      assert(encoded < 841);
      plantedPlain.push(...unpair(chosenPlain, order));
      plantedCipher.push(...unpair(encoded, order));
      if (chosenPlain === native) nativePairs++;
    }
    const decodedControl = transform(plantedCipher, order, exponent);
    assert.deepEqual(decodedControl.invalid, []);
    assert.deepEqual(decodedControl.indices, plantedPlain);
    cases.push({order, exponent, originalInvalidPairs:original.invalid.length,
      invalidPairPositions:original.invalid.map(v=>v.pair),
      firstInvalid:original.invalid[0], fullLegalDecode:false,
      control:{GP29Pairs:38, sourceNativePairsPreserved:nativePairs,
        exactReverseRoundTrip:true}});
  }
}
assert.equal(cases.length, 6);
assert(cases.every(c => !c.fullLegalDecode && c.originalInvalidPairs > 0));
console.log(JSON.stringify({
  classification:"Original-source paired-DH5 XOR negative; no recovered plaintext",
  source:{runes:76, pairs:38, GP29PairRange:[0,840],
    modulus:761, DHBase:5, DHOrder:38, exponents:[0,311,449]},
  cases
}, null, 2));
module.exports = {transform, pair, unpair};
