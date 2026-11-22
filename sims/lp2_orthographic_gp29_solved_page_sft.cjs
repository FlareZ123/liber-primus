"use strict";

/**
 * Source-native orthography control for the historically attested Gematria Primus
 * rune table. This does not purport to decrypt unknown LP2 ciphertext.
 *
 * Run from repository root: node sims/lp2_orthographic_gp29_solved_page_sft.cjs
 * Node 22, standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const originalLP1 = read("resources/transcriptions/liber_primus_master.txt");
const p57Text = solved.split("### 57\n")[1].trim();

assert.equal(corpus.translit.length, 29);
assert.equal(corpus.runes.length, 29);
assert.deepEqual(corpus.translit, [
  "F","U","TH","O","R","C","G","W","H","N",
  "I","J","EO","P","X","S","T","B","E","M",
  "L","NG","OE","D","A","AE","Y","IA","EA"
], "Canonical table must retain original 2013 source ordering");

const spellings = new Map(corpus.translit.map((name, index) => [name, index]));
// 2013 table explicitly prints C/K, S/Z, NG/ING and IA/IO.
// U/V is a working orthographic alias visible in solved LP2, not labelled
// U/V in the original 2013 image itself.
for (const [alias, primary] of [
  ["K", "C"], ["Z", "S"], ["ING", "NG"], ["IO", "IA"], ["V", "U"]
]) spellings.set(alias, spellings.get(primary));

const grouped = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];

/** @param {string} plaintext @returns {number[]} */
function encode(plaintext) {
  const letters = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  /** @type {number[]} */
  const out = [];
  for (let i = 0; i < letters.length;) {
    const part = grouped.find(g => letters.startsWith(g, i)) || letters[i];
    const value = spellings.get(part);
    assert.notEqual(value, undefined, "Missing source glyph for " + part);
    out.push(value);
    i += part.length;
  }
  return out;
}

/** @param {string} plaintext @returns {string} */
const asRunes = plaintext => encode(plaintext).map(index => corpus.runes[index]).join("");

const p57Original = corpus.pages[57].indices;
const encoded = encode(p57Text);
assert.equal(p57Original.length, 95);
assert.deepEqual(encoded, p57Original, "Every rune of the original solved p57 must agree");
assert.equal(p57Text.replace(/[^A-Za-z]/g, "").length, 101);
assert.equal(asRunes("LIKE"), "ᛚᛁᚳᛖ");
assert.equal(asRunes("TUNNELING"), "ᛏᚢᚾᚾᛖᛚᛝ");
assert.equal(asRunes("SURFACE"), "ᛋᚢᚱᚠᚪᚳᛖ");
assert.equal(asRunes("THINGS"), "ᚦᛝᛋ");
assert.equal(asRunes("KNOW"), "ᚳᚾᚩᚹ");
assert(originalLP1.includes("ᚦᛝᛋ"), "Authentic solved LP1 THINGS control missing");
assert(originalLP1.includes("ᚳᚾᚩᚹ-ᚦᛁᛋ"), "Authentic solved LP1 KNOW THIS control missing");
// Literal naive single-Latin-letter-to-single-rune representation is disproved
// by the source 101-letter : 95-rune count; silent-E preservation in LIKE
// disproves a purely IPA-like phoneme-by-phoneme rendering of the known p57.
const noSilentE = p57Text.replace(/\bLIKE\b/, "LIK");
assert.notDeepEqual(encode(noSilentE), p57Original, "Removing silent E must break control");

console.log(JSON.stringify({
  corpus: "original solved LP2 p57, original solved LP1",
  source: "2013 Gematria Primus row order plus attested aliases",
  p57LatinLetters: 101,
  p57OriginalRunes: 95,
  p57ExactRunesMatched: 95,
  noSilentEControlExact: false,
  originalLP1KnownWord: asRunes("KNOW"),
  originalLP1ThingsWord: asRunes("THINGS"),
  implication: "GP29 encodes orthographic grapheme groups in its solved prose. No original unknown-page plaintext or phonemic switching instruction recovered."
}, null, 2));
