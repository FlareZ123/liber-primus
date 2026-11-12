"use strict";

/**
 * Original LP2 all-red-unit GP29 Atbash gate for Director Issue #601.
 * Inputs are fixed by original colored-rune spans and printed word delimiters.
 * No fitted shifts, offsets, alphabets or substring selection are permitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const base = path.join(__dirname, "..", "resources");
const corpus = require(path.join(base, "liber-primus", "lp2-corpus.json"));
const ink = require(path.join(base, "liber-primus", "lp2-ink-annotations.json"));
const lp2 = fs.readFileSync(path.join(base, "liber-primus", "lp2-transcription.txt"), "utf8")
  .replace(/\r\n/g, "\n")
  .split(/^%\s*$/m);
const lp1 = fs.readFileSync(path.join(base, "transcriptions", "lp1_wulfic_canonical.txt"), "utf8")
  .replace(/\r\n/g, "\n")
  .split(/^%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

assert.equal(lp2.length, 57, "LP2 source omits physical page50, which has no runes");
assert.equal(corpus.pages.length, 58);
assert.equal(ink.counts.red, 225);

/**
 * @param {string} original
 * @returns {string}
 */
function transform(original) {
  return Array.from(original, (character) => {
    const index = runeIndex.get(character);
    return index === undefined ? character : corpus.runes[28 - index];
  }).join("");
}

/**
 * @param {string} original
 * @returns {string}
 */
function transliterate(original) {
  return Array.from(original, (character) => {
    const index = runeIndex.get(character);
    return index === undefined ? character : corpus.translit[index];
  }).join("");
}

/**
 * @param {string} original
 * @returns {{positions:number[], indices:number[],chars:string[]}}
 */
function enumerate(original) {
  const chars = Array.from(original);
  const positions = [];
  const indices = [];
  for (let i = 0; i < chars.length; i++) {
    const index = runeIndex.get(chars[i]);
    if (index !== undefined) {
      positions.push(i);
      indices.push(index);
    }
  }
  return {positions, indices, chars};
}

let totalRed = 0;
const observed = [];
for (const page of corpus.pages) {
  if (page.page === 50) {
    assert.equal(page.indices.length, 0);
    continue;
  }
  const source = lp2[page.page < 50 ? page.page : page.page - 1];
  const parsed = enumerate(source);
  assert.deepStrictEqual(parsed.indices, page.indices, "Original page runes must match p" + page.page);

  const pageInk = ink.pages.find((entry) => entry.page === page.page);
  if (!pageInk || !pageInk.red_spans) continue;
  assert.equal(pageInk.rune_count, page.indices.length);

  for (const span of pageInk.red_spans) {
    const sourceGlyphs = parsed.positions.slice(span.start, span.start + span.length)
      .map((position) => parsed.chars[position]).join("");
    assert.equal(sourceGlyphs, span.runes);
    assert.equal(transform(transform(sourceGlyphs)), sourceGlyphs);
    const slice = parsed.chars.slice(
      parsed.positions[span.start],
      parsed.positions[span.start + span.length - 1] + 1
    ).join("");
    // Preserve the exact source word/sentence marks between red glyphs.
    // A slash is solely the physical line break, so render a unified line.
    const formatted = transliterate(transform(slice)).replace(/\r?\n/g, "").replace(/\//g, "");
    observed.push({page: page.page, start: span.start, length: span.length, atbash: formatted});
    totalRed += span.length;
  }
}
assert.equal(observed.length, 18);
assert.equal(totalRed, 225);
assert.deepStrictEqual(
  observed.filter((s) => s.length === 3).map((s) => [s.page, s.start, s.atbash]),
  [[3, 119, "SCY"], [39, 119, "UDP"]]
);
assert.ok(observed.some((s) => s.page === 56 && s.atbash === "OB-GPA"));
assert.ok(observed.some((s) => s.page === 57 && s.atbash === "SRARJHI"));

// The *authentic LP1 original* page0 is a positive control for the very same
// GP29 28-index Atbash; printed rune word/sentence boundaries are retained.
const lp1decoded = transliterate(transform(lp1[0])).replace(/\r?\n/g, "").replace(/\//g, "");
assert.ok(lp1decoded.startsWith("A-WARNNG.BELIEUE-NOTHNG-FROM-THIS-BOOC."),
  "Known LP1 opening A WARNING / BELIEVE NOTHING / THIS BOOK must decode");
assert.equal(transform(transform(lp1[0])), lp1[0]);

console.log("Original LP1 p0 Atbash control: " + lp1decoded.slice(0, 84));
console.log("Original LP2 colored spans, page/rune offsets and printed boundaries:");
for (const entry of observed) {
  console.log("p" + String(entry.page).padStart(2, "0")
    + " @" + String(entry.start).padStart(3, " ")
    + " len" + String(entry.length).padStart(2, " ")
    + " " + entry.atbash);
}
console.log("Red spans: 18; red runes: 225; isolated 3-rune words: SCY and UDP.");
console.log("The solved LP2 red headers p56/p57 become OB-GPA and SRARJHI under Atbash.");
console.log("RESULT: no third independently delimited network command or LP2 decode operation.");
