"use strict";

/**
 * Cicada's authentically used 2012 Britannica book-code edition as a possible
 * exact LP2 plaintext crib. The public-domain source is a pinned external input.
 *
 * Node.js 22, from repository root:
 *   node sims/lp2_2012_britannica_wordlength_crib_sft.cjs path\to\31447.txt
 *
 * Historical source:
 * neuroretransmit/cicada, 2012/006-two-book-codes/books/31447.txt,
 * pinned Git blob 8cba4356812ff852e3fe9c88e80ab1e9b5b8670c.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

assert(process.argv[2], "Supply the authentic 2012 Britannica 31447.txt path");
const input = fs.readFileSync(process.argv[2]);
const hash = crypto.createHash("sha1").update(Buffer.concat([
  Buffer.from("blob " + input.length + "\0"), input
])).digest("hex");
assert.equal(hash, "8cba4356812ff852e3fe9c88e80ab1e9b5b8670c");
const lines = input.toString("utf8").split(/\r?\n/);
const heading = lines.findIndex(x => /^\s*CICADA \(_Cicadidae_\)/u.test(x));
assert.equal(heading, 15388, "The originally used CICADA entry moved");

const original = parseLP2Words(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-transcription.txt"), "utf8"));
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
assert.equal(original.crossPageWords, 32);
const target = original.words.map(w => w.length);
const gpDigraphs = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
/** @param {string} word @returns {number} */
function gpLength(word) {
  let n = 0;
  for (let i = 0; i < word.length; i++) {
    if (word.slice(i, i + 3) === "ING") i += 2;
    else if (gpDigraphs.has(word.slice(i, i + 2))) i++;
    n++;
  }
  return n;
}

/**
 * @param {number[]} source
 * @param {number[]} ciphertext
 * @param {number} [seed=7]
 * @returns {Array<{cipherIndex:number, sourceIndex:number, n:number}>}
 */
function longestCommonRuns(source, ciphertext, seed = 7) {
  const index = new Map();
  for (let i = 0; i + seed <= ciphertext.length; i++) {
    const key = ciphertext.slice(i, i + seed).join(",");
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i);
  }
  const found = new Map();
  for (let j = 0; j + seed <= source.length; j++) {
    const key = source.slice(j, j + seed).join(",");
    for (const start of index.get(key) || []) {
      let i = start, b = j, n = seed;
      while (i > 0 && b > 0 && ciphertext[i - 1] === source[b - 1]) {
        i--; b--; n++;
      }
      while (i + n < ciphertext.length && b + n < source.length &&
             ciphertext[i + n] === source[b + n]) n++;
      found.set(i + ":" + b, {cipherIndex: i, sourceIndex: b, n});
    }
  }
  return [...found.values()].sort((a, b) =>
    b.n - a.n || a.cipherIndex - b.cipherIndex || a.sourceIndex - b.sourceIndex);
}

const sources = [
  ["historicalCICADAEntryToEnd", lines.slice(heading).join("\n"), 34487, [8, 8]],
  ["fullPublishedVolume", input.toString("utf8"), 186810, [9, 9]],
];
const results = [];
for (const [scope, sourceText, expectedCount, expectedMaxima] of sources) {
  const sourceWords = sourceText.toUpperCase().match(/[A-Z]+/gu) || [];
  assert.equal(sourceWords.length, expectedCount);
  for (const [mode, measure, expectedMax] of [
    ["literalLatin", w => w.length, expectedMaxima[0]],
    ["greedyGP29", gpLength, expectedMaxima[1]],
  ]) {
    const sourceLength = sourceWords.map(measure);
    const matches = longestCommonRuns(sourceLength, target);
    assert.equal(matches[0]?.n, expectedMax,
      "Authentic source exact-match results changed");
    assert(matches.every(m => m.n < 10), "Ten-word historical source crib found");
    const planted = target.slice();
    for (let j = 0; j < 16; j++) planted[1000 + j] = sourceLength[500 + j];
    assert(longestCommonRuns(sourceLength, planted).some(m =>
      m.cipherIndex <= 1000 && m.sourceIndex <= 500 &&
      m.cipherIndex + m.n >= 1016 && m.sourceIndex + m.n >= 516 &&
      1000 - m.cipherIndex === 500 - m.sourceIndex),
    "A planted verbatim 16-word quotation was not recovered");
    results.push({
      scope, mode, sourceWords: sourceWords.length,
      maxContiguousWords: expectedMax,
      matchesAtLeast10: 0,
      recoveredPositivePlant16: true,
      longestMatches: matches.filter(m => m.n === expectedMax).slice(0, 4).map(m => ({
        originalWord: m.cipherIndex,
        originalPhysicalPage: physicalLP2Page(original.words[m.cipherIndex].startPage),
        sourceWord: m.sourceIndex,
        length: m.n,
        // At most nine words, never reproduce a substantial part of the text.
        sourceExcerpt: sourceWords.slice(m.sourceIndex, m.sourceIndex + m.n).join(" "),
      })),
    });
  }
}
console.log(JSON.stringify({
  conclusion: "No 10-word exact Cicada-2012 Britannica quotations in original LP2",
  blobSHA1: hash,
  originalWords: original.words.length,
  originalRunes: original.runeCount,
  exactSourceCicadaHeadingZeroBasedLine: heading,
  results,
  limitation: "Assumes intact original printed word boundaries and source spellings",
}, null, 2));
