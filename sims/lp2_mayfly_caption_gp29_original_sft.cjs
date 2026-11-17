"use strict";

/**
 * Source-locked mayfly caption -> GP29 Vigenere test on original LP2.
 * External Figure 4, item 5: "Ephemerella ignita".
 * https://www.metafysica.nl/wings/wings_14.html
 *
 * The sole proposed GP29 key is the 17 ordinary Latin letters of that caption.
 * Fix the key, consuming one key letter per ciphertext rune, then decode
 * original p23-26 and independent p27-32 from each chapter's first glyph.
 *
 * Usage (repository root): node sims/lp2_mayfly_caption_gp29_original_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
    "utf8"
  )
);

const MODULUS = 29;
const ORIGINAL_CAPTION = "EPHEMERELLA IGNITA";
const WRONG_FIGURE_CAPTION = "SIPHLONURUS LACUSTRIS";

/**
 * @param {readonly number[]} symbols
 * @param {readonly number[]} key
 * @param {1 | -1} sign
 * @returns {number[]}
 */
function transform(symbols, key, sign) {
  return symbols.map((symbol, index) =>
    (symbol + sign * key[index % key.length] + MODULUS) % MODULUS
  );
}

/**
 * @param {string} printedCaption
 * @returns {number[]}
 */
function makeKey(printedCaption) {
  const text = printedCaption.replace(/[^A-Z]/g, "");
  assert.equal(text.length > 0, true);
  return Array.from(text, (letter) => {
    const value = corpus.translit.indexOf(letter);
    assert.notEqual(value, -1, "Missing GP rune for " + letter);
    return value;
  });
}

/**
 * @param {readonly number[]} symbols
 * @returns {number}
 */
function normalizedCoincidence(symbols) {
  const counts = new Array(MODULUS).fill(0);
  for (const symbol of symbols) counts[symbol]++;
  const pairs = counts.reduce((total, count) => total + count * (count - 1), 0);
  return (MODULUS * pairs) / (symbols.length * (symbols.length - 1));
}

/**
 * @param {readonly number[]} symbols
 * @returns {string}
 */
function preview(symbols) {
  return symbols.slice(0, 24).map((symbol) => corpus.translit[symbol]).join(" ");
}

/**
 * @param {readonly number[]} physicalPages
 * @returns {number[]}
 */
function pageRunes(physicalPages) {
  return physicalPages.flatMap((page) => corpus.pages[page].indices);
}

function run() {
  assert.equal(corpus.runes.length, MODULUS);
  assert.equal(corpus.pages.length, 58);
  assert.equal(
    pageRunes(Array.from({ length: 56 }, (_, index) => index)).length,
    12956
  );
  assert.equal(corpus.pages[50].indices.length, 0);

  const key = makeKey(ORIGINAL_CAPTION);
  const wrongKey = makeKey(WRONG_FIGURE_CAPTION);
  assert.equal(key.length, 17);
  const training = pageRunes([23, 24, 25, 26]);
  const withheld = pageRunes([27, 28, 29, 30, 31, 32]);
  assert.equal(training.length, 1021);
  assert.equal(withheld.length, 1433);

  // The native clear-p57 positive must reproduce all 95 source glyphs exactly.
  const native = pageRunes([57]);
  assert.equal(native.length, 95);
  const plantedCipher = transform(native, key, 1);
  assert.deepEqual(transform(plantedCipher, key, -1), native);
  assert.notDeepEqual(transform(plantedCipher, wrongKey, -1), native);

  const originalRuns = [
    { label: "original p23-26", source: training },
    { label: "withheld p27-32", source: withheld }
  ];
  for (const { label, source } of originalRuns) {
    const candidate = transform(source, key, -1);
    assert.deepEqual(transform(candidate, key, 1), source);
    const wrong = transform(source, wrongKey, -1);
    console.log(JSON.stringify({
      label,
      originalRunes: source.length,
      captionKeyRunes: key.length,
      normalizedIoC: normalizedCoincidence(candidate),
      wrongFigureNormalizedIoC: normalizedCoincidence(wrong),
      first24Runes: preview(candidate)
    }));
  }

  console.log(JSON.stringify({
    nativeControl: "p57 GP-native clear parable",
    clearRunes: native.length,
    normalizedIoC: normalizedCoincidence(native),
    positiveRecovery: "95/95",
    originalCaption: ORIGINAL_CAPTION,
    originalKey: key
  }));
}

run();
