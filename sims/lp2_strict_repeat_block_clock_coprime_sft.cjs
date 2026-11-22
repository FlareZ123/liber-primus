"use strict";
/**
 * Original LP2 exact obstruction for strict periodic adjacency-repeat leakage.
 * Windows Node.js 22 / CommonJS, read-only, no external dependencies.
 *
 * Hypothetical clock: every non-F ciphertext glyph consumes one step of a
 * fixed B-symbol block. An equal adjacent ciphertext glyph can be emitted
 * only at a new block's first step. Each ciphertext F MAY instead be an
 * unencrypted plaintext F, skipping the clock (as in solved p56). Each page
 * and each recorded punctuation mark MAY reset to an arbitrary phase.
 *
 * This is a NECESSARY OUTPUT CONDITION, not an asserted Cicada cipher.
 * It does not claim to recover a key or unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punctuation = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const byPage = new Map(pages.map(p => [p.page, p]));
const events = punctuation.events;
const eventSites = new Map();
for (const event of events) {
  if (!eventSites.has(event.page)) eventSites.set(event.page, new Set());
  eventSites.get(event.page).add(event.local_rune_offset);
}
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(pages.reduce((n, p) =>
  n + p.indices.slice(1).filter((c, j) => c === p.indices[j]).length, 0), 86);
assert.equal(punctuation.rune_count, 12956);

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/**
 * A fixed repeat-only-at-B-block-boundary clock needs B to divide the
 * distance between any two non-F doublets in an F-free, punctuation-free
 * interval. Cipher keys, alphabet substitutions and initial phases cancel.
 *
 * @param {number} page
 * @param {number} a
 * @param {number} b
 * @param {number[]} expectedGpIndices
 * @returns {number}
 */
function witness(page, a, b, expectedGpIndices) {
  const row = byPage.get(page);
  assert(row && a > 0 && b < row.indices.length && b > a);
  for (const [site, value] of [[a, expectedGpIndices[0]], [b, expectedGpIndices[1]]]) {
    assert.equal(row.indices[site - 1], value);
    assert.equal(row.indices[site], value);
    assert.notEqual(value, 0, "witness must be non-F");
  }
  for (let i = a + 1; i <= b; i++) {
    assert.notEqual(row.indices[i], 0, "an F might change the clock");
    assert(!eventSites.get(page)?.has(i), "a punctuation mark might reset the clock");
  }
  return b - a;
}

// These are zero-based local rune offsets in ORIGINAL JPEGs 36.jpg and 41.jpg.
// p19 has adjacent O-O at 17→18 and M-M at 44→45: distance 27.
// p24 has adjacent G-G at 51→52 and IA-IA at 58→59: distance 7.
const d19 = witness(19, 18, 45, [3, 19]);
const d24 = witness(24, 52, 59, [6, 27]);
assert.equal(d19, 27);
assert.equal(d24, 7);
assert.equal(gcd(d19, d24), 1);

// Independent natural word-reset version: if every printed word begins at
// phase 0, a pair of doubles at offsets 5 and 11 (no F) requires B|gcd(5,11).
const originalBody = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runeToGp = new Map(gp.runes.map((r, i) => [r, i]));
const runeWords = originalBody.match(new RegExp("[" + gp.runes.join("") + "]+", "gu")) || [];
const words = runeWords.map(w => Array.from(w, ch => runeToGp.get(ch)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
const word = words[1476];
assert.deepEqual(word, [12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]);
assert.equal(word.includes(0), false);
assert.equal(word[4], word[5]);
assert.equal(word[10], word[11]);
assert.equal(gcd(5, 11), 1);
const wordStart = words.slice(0, 1476).reduce((n, w) => n + w.length, 0);
const p27Start = pages.filter(p => p.page < 27)
  .reduce((n, p) => n + p.indices.length, 0);
assert.equal(wordStart - p27Start, 79);
assert.deepEqual(byPage.get(27).indices.slice(79, 91), word);

/**
 * An intentionally generous finite-state check:
 * - each source F can be consumed or bypassed without an advance;
 * - every original recorded punctuation mark, including editorial ones,
 *   can reset the block to ANY starting phase;
 * - every physical page starts at ANY phase.
 * @param {number[]} ciphertext
 * @param {number} B
 * @param {Set<number>} resets
 * @returns {number} first impossible index, or -1
 */
function firstImpossible(ciphertext, B, resets) {
  let states = new Set(Array.from({length: B}, (_, i) => i));
  for (let i = 0; i < ciphertext.length; i++) {
    const reset = resets.has(i);
    if (reset) states = new Set(Array.from({length: B}, (_, x) => x));
    const c = ciphertext[i];
    const before = i === 0 ? -1 : ciphertext[i - 1];
    const next = new Set();
    for (const phase of states) {
      if (c === 0) next.add(phase); // permissive literal-F bypass
      if (reset || c !== before || phase === 0) next.add((phase + 1) % B);
    }
    if (next.size === 0) return i;
    states = next;
  }
  return -1;
}

// Positive model: block B=5, an allowed same-glyph boundary (positions 4→5)
// and one literal-F bypass. The phase-zero path is feasible.
const plant = [1, 2, 3, 4, 5, 5, 0, 6, 7, 8, 9, 10];
assert.equal(firstImpossible(plant, 5, new Set()), -1);

// Test all finite periods as an independent check, not as the main proof.
// The coprime witness already excludes EVERY fixed integer B>=2.
const failures = [];
for (let B = 2; B <= 50; B++) {
  const rejected = pages
    .filter(p => firstImpossible(p.indices, B, eventSites.get(p.page) || new Set()) >= 0)
    .map(p => p.page);
  assert(rejected.includes(19) || rejected.includes(24),
    "coprime-witness pages must obstruct each nontrivial period");
  assert(rejected.length > 0);
  failures.push({B, failedPages: rejected.length});
}
console.log(JSON.stringify({
  source: "original LP2 pp0–55; source-only exact necessary condition",
  pages: pages.length,
  runeCount: 12956,
  adjacentEqualWithinPages: 86,
  page19: {originalJpeg: "36.jpg", repeats: ["O-O @18", "M-M @45"], gap: d19},
  page24: {originalJpeg: "41.jpg", repeats: ["G-G @52", "IA-IA @59"], gap: d24},
  gcdOfUninterruptedGaps: gcd(d19, d24),
  page27Word1476: {GP: word, repeatedRunePositions: [5, 11], gcd: gcd(5, 11)},
  periods2to50: {allRejected: true, first: failures.slice(0, 5), last: failures.slice(-3)},
  conclusion: "No strict fixed-block boundary-only repeat rule with B>=2 in this clock/reset model; no LP2 plaintext recovered"
}, null, 2));
