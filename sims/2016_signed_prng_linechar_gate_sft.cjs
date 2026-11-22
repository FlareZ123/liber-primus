"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const text = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const signed = fs.readFileSync(path.join(root, "resources", "historical", "cicada2016-4gq25-outguess.asc"), "utf8");
const runeIndex = new Map(gp.runes.map((rune, index) => [rune, index]));
const lineBodies = text.split(/[%\/\r\n]+/u).filter((line) => [...line].some((c) => runeIndex.has(c)));
const toName = (c) => gp.translit[runeIndex.get(c)];
const runeOnly = lineBodies.map((line) => [...line].filter((c) => runeIndex.has(c)).map(toName));
const separatorPositions = lineBodies.map((line) => [...line].filter((c) => runeIndex.has(c) || c === "-" || c === ".").map((c) => runeIndex.has(c) ? toName(c) : c));
const symbols = gp.translit.map((token, index) => ({token, prime: gp.prime[index]})).sort((a, b) => b.token.length - a.token.length);

/** Sum prime values after longest-first GP transcription (K→C, V→U). @param {string} word @returns {number} */
function primeSum(word) {
  const normalized = word.toUpperCase().replace(/K/g, "C").replace(/V/g, "U");
  let total = 0;
  for (let i = 0; i < normalized.length;) {
    const symbol = symbols.find((item) => normalized.startsWith(item.token, i));
    assert.ok(symbol, "Untranscribable word: " + word);
    total += symbol.prime;
    i += symbol.token.length;
  }
  return total;
}

/**
 * Deterministic address readout with explicit coordinate convention.
 * @param {string} word
 * @param {"remainder-line"|"quotient-line"} order
 * @param {string[][]} lines
 * @returns {{word:string,sum:number,line:number,character:number,glyph:string}}
 */
function lookup(word, order, lines) {
  const sum = primeSum(word);
  const q = Math.floor(sum / 29);
  const r = sum % 29;
  const line = (order === "remainder-line" ? r : q) + 1;
  const character = (order === "remainder-line" ? q : r) + 1;
  return {word, sum, line, character, glyph: lines[line - 1]?.[character - 1] ?? "OOB"};
}

/** @param {string[]} words @param {"remainder-line"|"quotient-line"} order @param {string[][]} lines @returns {string[]} */
function read(words, order, lines) {
  return words.map((word) => lookup(word, order, lines).glyph);
}

const instruction = "Its words are the map Their meaning is the road and their numbers are the direction".toUpperCase().split(" ");
const body = signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n\n");
const fullWords = (body.match(/\b[A-Za-z]+\b/gu) || []).map((w) => w.toUpperCase());
const primary = read(instruction, "remainder-line", runeOnly);
const swapped = read(instruction, "quotient-line", runeOnly);
const separators = read(instruction, "remainder-line", separatorPositions);
const complete = read(fullWords, "remainder-line", runeOnly);

assert.equal(fullWords.length, 43);
assert.deepEqual(primary, ["L", "C", "B", "P", "P", "R", "NG", "NG", "P", "A", "R", "R", "TH", "B", "P", "C"]);
assert.deepEqual(swapped, ["OOB", "W", "Y", "IA", "NG", "OOB", "T", "OOB", "IA", "X", "R", "OOB", "OE", "Y", "IA", "D"]);
assert.deepEqual(separators, ["L", "U", "W", "P", "X", "R", "E", "-", "P", "B", "OE", "R", "F", "W", "P", "-"]);
assert.deepEqual(complete, ["E", "P", "M", "C", "M", "AE", "OE", "P", "M", "E", "EA", "NG", "P", "S", "L", "C", "B", "P", "P", "R", "NG", "NG", "P", "A", "R", "R", "TH", "B", "P", "C", "I", "R", "EA", "N", "N", "AE", "P", "J", "Y", "B", "EO", "O", "S"]);
assert.deepEqual(instruction.slice(4, 7).map((word) => lookup(word, "remainder-line", runeOnly)), [
  {word: "MAP", sum: 211, line: 9, character: 8, glyph: "P"},
  {word: "THEIR", sum: 114, line: 28, character: 4, glyph: "R"},
  {word: "MEANING", sum: 319, line: 1, character: 12, glyph: "NG"}
]);

// GP 'EA' has prime weight 109, whereas an explicit E + A has 67 + 97.
// No 2016 source states which tokenization an English word must use.
const splitEA = primeSum("MEANING") + (67 + 97 - 109);
assert.equal(splitEA, 374);
assert.equal(runeOnly[splitEA % 29][Math.floor(splitEA / 29)], "D");

console.log("PASS: 43 authenticated signed-message words; " + runeOnly.length + " original transcript lines");
console.log("16 words, post-selected convention:", primary.join(" "));
console.log("All 43 words, same convention:", complete.join(" "));
console.log("Quotient-as-line control:", swapped.join(" "));
console.log("Count printed separators control:", separators.join(" "));
console.log("MEANING with E+A instead of EA: sum=374, line27/rune13 = D (not NG)");
console.log("No selected PRNG family/seed, unknown-page plaintext or original-cipher inverse is established.");
