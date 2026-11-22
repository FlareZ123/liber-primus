"use strict";

/**
 * Source-locked alternative to the literal 1977 Ephemerella caption key.
 *
 * The accepted 2002-era name SERRATELLA IGNITA is 16 GP29 runes, exactly the
 * length of the p23 red heading.  Treat it as a KNOWN PLAINTEXT heading, derive
 * the 16-rune additive key, and test the remainder of that chapter plus an
 * independent next chapter without phase or spelling optimisation.
 *
 * This does not claim that the heading actually names the insect.
 *
 * Source: https://www.nhm.ac.uk/our-science/data/uk-species/taxon?tvk=NBNSYS0100005496
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const A = corpus.translit;
const pages = corpus.pages;
const getRange = (start, end) =>
  pages.filter(p => p.page >= start && p.page <= end)
    .flatMap(p => p.indices);
const cipher = getRange(23, 26);
const holdout = getRange(27, 32);
const known = getRange(57, 57);
const species = "SERRATELLAIGNITA";
const knownHeading = [...species].map(s => A.indexOf(s));

assert.equal(cipher.length, 1021);
assert.equal(holdout.length, 1433);
assert.equal(known.length, 95);
assert.equal(knownHeading.length, 16);
assert(knownHeading.every(n => n >= 0));

const key = knownHeading.map((p, i) => (cipher[i] - p + 29) % 29);
const decrypt = values => values.map((c, i) => (c - key[i % key.length] + 29) % 29);
const encrypt = values => values.map((p, i) => (p + key[i % key.length]) % 29);

/**
 * Normalize the ordinary index of coincidence to a uniform 29-rune baseline of 1.
 * @param {readonly number[]} values
 * @returns {number}
 */
function ioc29(values) {
  const count = Array(29).fill(0);
  for (const n of values) count[n] += 1;
  const equalPairs = count.reduce((sum, n) => sum + n * (n - 1), 0);
  return 29 * equalPairs / (values.length * (values.length - 1));
}

const decoded = decrypt(cipher);
const blind = decrypt(holdout);
assert.deepEqual(decoded.slice(0, 16), knownHeading);
assert.deepEqual(encrypt(decoded), cipher);
assert.deepEqual(encrypt(blind), holdout);
assert.deepEqual(decrypt(encrypt(known)), known);

/**
 * Exact inverse reachability under authentic p56-style transparent plaintext F.
 * When plaintext F is emitted the clock does not advance; ciphertext F can
 * alternatively originate from a non-F plaintext rune with an encrypted key.
 * @param {readonly number[]} ciphertext
 * @returns {number | null} First impossible zero-based ciphertext position
 */
function firstImpossibleFSkip(ciphertext) {
  let clocks = new Set([0]);
  for (let i = 0; i < ciphertext.length; i += 1) {
    const C = ciphertext[i];
    const next = new Set();
    for (const k of clocks) {
      if (C === 0) next.add(k); // plaintext F skips the key clock
      const P = (C - key[k] + 29) % 29;
      if (P !== 0) next.add((k + 1) % key.length);
    }
    if (next.size === 0) return i;
    clocks = next;
  }
  return null;
}

/**
 * Encode a positive source-native control with the F-transparent key clock.
 * @param {readonly number[]} plaintext
 * @returns {number[]}
 */
function encodeFTransparent(plaintext) {
  const ciphertext = [];
  let k = 0;
  for (const P of plaintext) {
    if (P === 0) ciphertext.push(0);
    else {
      ciphertext.push((P + key[k]) % 29);
      k = (k + 1) % key.length;
    }
  }
  return ciphertext;
}

const originalFSkipImpossibleAt = firstImpossibleFSkip(cipher);
const heldoutFSkipImpossibleAt = firstImpossibleFSkip(holdout);
assert.equal(originalFSkipImpossibleAt, 17);
assert.equal(heldoutFSkipImpossibleAt, 16);
assert.equal(firstImpossibleFSkip(encodeFTransparent(known)), null);

const stats = {
  hypothesis: "p23 red16 title is Serratella ignita",
  hypothesis_is_not_an_authenticated_crib: true,
  key_gp29: key,
  original_body_runes: decoded.length - 16,
  f_transparent_original_first_impossible_offset: originalFSkipImpossibleAt,
  f_transparent_holdout_first_impossible_offset: heldoutFSkipImpossibleAt,
  f_transparent_known_p57_positive: "95/95 legal symbols under planted true key clock",
  original_body_norm_ioc: ioc29(decoded.slice(16)),
  independent_chapter_runes: blind.length,
  independent_chapter_norm_ioc: ioc29(blind),
  solved_p57_native_norm_ioc: ioc29(known),
  first_body_40: decoded.slice(16, 56).map(i => A[i]).join(" "),
  first_holdout_40: blind.slice(0, 40).map(i => A[i]).join(" "),
  positive_plant: "p57's genuine 95 runes recovered exactly after encryption with this key"
};
assert(Math.abs(stats.original_body_norm_ioc - 1.0136865473429664) < 1e-10);
assert(Math.abs(stats.independent_chapter_norm_ioc - 1.0026490505132413) < 1e-10);
console.log(JSON.stringify(stats, null, 2));
