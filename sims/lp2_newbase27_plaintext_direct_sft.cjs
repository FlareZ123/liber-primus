"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @type {{pages: Array<{page:number, indices:number[]}>}} */
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

/**
 * Re-express a positional integer in another radix, preserving its value.
 * @param {number[]} digits Most-significant digit first.
 * @param {number} fromBase
 * @param {number} toBase
 * @returns {number[]}
 */
function convertBase(digits, fromBase, toBase) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < fromBase);
    value = value * BigInt(fromBase) + BigInt(digit);
  }
  const output = [];
  while (value > 0n) {
    output.push(Number(value % BigInt(toBase)));
    value /= BigInt(toBase);
  }
  return output.reverse();
}

/**
 * @param {number[]} input
 * @param {string} alphabet
 * @returns {{outputLength:number, spaces:number, spaceFraction:number,
 *   occurrenceTHE:number, occurrenceAND:number, first80:string}}
 */
function decodeSummary(input, alphabet) {
  const text = convertBase(input, 29, alphabet.length)
    .map((digit) => alphabet[digit]).join("");
  return {
    outputLength: text.length,
    spaces: [...text].filter((char) => char === " ").length,
    spaceFraction: [...text].filter((char) => char === " ").length / text.length,
    occurrenceTHE: (text.match(/THE/g) || []).length,
    occurrenceAND: (text.match(/AND/g) || []).length,
    first80: text.slice(0, 80),
  };
}

const allUnknown = corpus.pages.filter((p) => p.page <= 55);
assert.equal(allUnknown.length, 56);
assert.equal(allUnknown.reduce((n, p) => n + p.indices.length, 0), 12956);

const sections = [
  ["p0–2 first section", [0, 1, 2], 729],
  ["p3–7 independent section", [3, 4, 5, 6, 7], 1145],
  ["p54–55 terminal section", [54, 55], 308],
  ["p0–55 continuous book", allUnknown.map((p) => p.page), 12956],
];
const alphabets = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ ", " ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

// Positive: a coherent Latin text with native spaces must survive a
// base27 -> GP29 -> base27 lossless positional conversion.
const plant = "THE BEGINNING OF WISDOM IS TO KNOW THAT THE WORLD HAS MANY PATHS AND ONLY ONE TRUTH";
for (const alphabet of alphabets) {
  const sourceDigits = [...plant].map((character) => alphabet.indexOf(character));
  const gp = convertBase(sourceDigits, 27, 29);
  const decoded = convertBase(gp, 29, 27).map((index) => alphabet[index]).join("");
  assert.equal(decoded, plant);
  assert.equal(gp.every((index) => index >= 0 && index < 29), true);
  console.log(JSON.stringify({control:"Latin planted 27-to-29-to-27",
    alphabet, plainLength:plant.length, gpLength:gp.length, exact:true}));
}
for (const [name, pageIDs, expectedLength] of sections) {
  const digits = allUnknown.filter((p) => pageIDs.includes(p.page))
    .flatMap((p) => p.indices);
  assert.equal(digits.length, expectedLength);
  for (const alphabet of alphabets) {
    console.log(JSON.stringify({
      source:name, inputRunes:digits.length, alphabet,
      ...decodeSummary(digits, alphabet),
    }));
  }
}
