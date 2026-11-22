"use strict";
/**
 * Director #615: original p57 words as candidate 2016 tree-image coordinates.
 * Exploratory source-constrained test; not a historical decoder.
 * Run: node sims/lp2_2016_p57_tree_coordinates_sft.cjs
 * @module lp2_2016_p57_tree_coordinates_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const signed = fs.readFileSync(path.join(ROOT,
  "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
assert.ok(signed.includes("Its words are the map, their \nmeaning is the road"));
assert.ok(signed.includes("their numbers are the direction."));
const p32 = corpus.pages.find(p => p.page === 32).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p32.length, 121);
assert.equal(p57.length, 95);
const prime = corpus.prime;
assert.equal(p32.slice(0, 11).reduce((s, i) => s + prime[i], 0), 563);
assert.equal(Array.from({length: 11}, (_, r) => prime[p32[r * 11]])
  .reduce((s, n) => s + n, 0), 569);
assert.equal(fs.statSync(path.join(ROOT,
  "resources/historical/cicada2016-4gq25.jpg")).size, 26342);
const words = (
  "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED " +
  "OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
).split(" ");
const tokens = corpus.translit.map((label, index) => ({label, index}))
  .sort((a, b) => b.label.length - a.label.length);
/** @param {string} word @returns {number[]} */
function encode(word) {
  let rest = word.replaceAll("K", "C").replaceAll("V", "U");
  if (rest === "TUNNELING") rest = "TUNNELNG";
  const out = [];
  while (rest.length) {
    const found = tokens.find(t => rest.startsWith(t.label));
    assert.ok(found, "GP spelling: " + rest);
    out.push(found.index);
    rest = rest.slice(found.label.length);
  }
  return out;
}
const encodedWords = words.map(encode);
assert.deepEqual(encodedWords.flat(), p57,
  "All 95 original physical p57 glyphs must match independent plaintext");
assert.equal(words.length, 20);
const sums = encodedWords.map(w => w.reduce((n, i) => n + prime[i], 0));
assert.deepEqual(sums, [
  449, 184, 72, 280, 339, 66, 72, 246, 86, 186, 232, 21, 55, 451,
  151, 72, 376, 115, 215, 300
]);
const coordinates = [];
for (let i = 0; i < sums.length; i += 2)
  coordinates.push([sums[i], sums[i + 1]]);
assert.ok(coordinates.every(([x, y]) => x < 563 && y < 569));
/* A deliberately *generous*, visually inspected region containing the
 * faint tree silhouette of the 2016 JPEG. This is a negative geometry
 * diagnostic, not a pixel-perfect mask or an authenticated path legend. */
const broadTreeRegion = {x0: 150, x1: 450, y0: 210, y1: 475};
const inside = coordinates.filter(([x, y]) =>
  x >= broadTreeRegion.x0 && x <= broadTreeRegion.x1 &&
  y >= broadTreeRegion.y0 && y <= broadTreeRegion.y1);
assert.deepEqual(inside, [[215, 300]]);
const cells = sums.slice(1).map(s => s % 121);
const output = cells.map(i => corpus.translit[p32[i]]).join("-");
assert.equal(output, "TH-U-W-B-S-U-AE-P-B-Y-W-T-T-F-U-B-J-U-G");
const reversedControl = cells.map(i => corpus.translit[p32[120 - i]]).join("-");
console.log(JSON.stringify({
  evidence: "2016 PGP-signed map words, original 2016 JPEG, original p32/p57 runes",
  imageDimensions: [563, 569],
  p32PrimeAxisChecksums: [563, 569],
  p57Words: words,
  p57PrimeSums: sums,
  twentyWordsAsTenOrderedPixelPairs: coordinates,
  generousVisibleTreeRegion: broadTreeRegion,
  pointsWithinRegion: inside.length,
  bodyNineteenWordSumsMod121: cells,
  bodyToP32Readout: output,
  reverseMapWrongOrientation: reversedControl,
  conclusion: "One potential reading fails; original sources do not specify pairing, modulus, cursor, direction, or extraction"
}, null, 2));
