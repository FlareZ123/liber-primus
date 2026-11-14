"use strict";

/**
 * Authenticated 2012 Cicada Agrippa book crib versus all original LP2 word shapes.
 * Copyrighted poem text is an external user-supplied input and is not committed.
 *
 * Node.js 22, from repository root:
 *   node sims/lp2_2012_agrippa_wordlength_crib_sft.cjs path\to\book-code.py
 *
 * Source: trizen/experimental-projects, cicada-3301/book-code.py,
 * pinned Git blob a4e13bdcbfa64be9c087e092b51f028126f51cb3.
 * This source quotes a 29 May 2013 archived Cicada solution.
 *
 * @param {string} original GitHub-tracked original source blob, unchanged
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

const repo = path.resolve(__dirname, "..");
const sourceFile = process.argv[2];
assert(sourceFile, "Provide the 2012 book-code.py source path as the first argument");
const source = fs.readFileSync(sourceFile, "utf8");
const bytes = Buffer.from(source, "utf8");
const blobHash = crypto.createHash("sha1").update(
  Buffer.concat([Buffer.from("blob " + bytes.length + "\0", "utf8"), bytes])
).digest("hex");
assert.equal(blobHash, "a4e13bdcbfa64be9c087e092b51f028126f51cb3",
  "The 2012 Agrippa source must be the pinned Git blob");

const section = source.match(/^book\s*=\s*"""([\s\S]*?)"""/mu);
assert(section, "Missing source poem in original 2012 book-code script");
const referenceWords = section[1].toUpperCase().match(/[A-Z]+/gu) || [];
assert.equal(referenceWords.length, 1682, "Source word count changed");

const input = fs.readFileSync(path.join(repo, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const original = parseLP2Words(input);
assert.equal(original.words.length, 2896, "Original physical word count changed");
assert.equal(original.runeCount, 12956, "Original rune count changed");
assert.equal(original.crossPageWords, 32, "Original cross-page word count changed");
const target = original.words.map(w => w.length);

const gpDigraphs = new Set(["TH", "NG", "EO", "OE", "AE", "IA", "EA"]);
/** @param {string} word @returns {number} */
function gp29Length(word) {
  let n = 0;
  for (let i = 0; i < word.length; i++) {
    if (word.slice(i, i + 3) === "ING") i += 2;
    else if (gpDigraphs.has(word.slice(i, i + 2))) i++;
    n++;
  }
  return n;
}

/**
 * Complete exact contiguous word-length matching with 7-word seeds.
 * Adjacent seeds are deduplicated after maximal bidirectional extension.
 * @param {number[]} sourceLengths
 * @param {number[]} unknownLengths
 * @returns {Array<{unknown:number,reference:number,n:number}>}
 */
function findMatches(sourceLengths, unknownLengths) {
  const width = 7;
  const index = new Map();
  for (let i = 0; i + width <= unknownLengths.length; i++) {
    const key = unknownLengths.slice(i, i + width).join(",");
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(i);
  }
  const matches = new Map();
  for (let j = 0; j + width <= sourceLengths.length; j++) {
    const key = sourceLengths.slice(j, j + width).join(",");
    for (const initial of index.get(key) || []) {
      let i = initial, b = j, n = width;
      while (i > 0 && b > 0 && unknownLengths[i - 1] === sourceLengths[b - 1]) {
        i--; b--; n++;
      }
      while (i + n < unknownLengths.length && b + n < sourceLengths.length &&
             unknownLengths[i + n] === sourceLengths[b + n]) n++;
      matches.set(i + ":" + b, {unknown: i, reference: b, n});
    }
  }
  return [...matches.values()].sort((a, b) => b.n - a.n ||
    a.unknown - b.unknown || a.reference - b.reference);
}

const out = [];
for (const [name, lengthFn, expected] of [
  ["literalLatin", w => w.length, 7],
  ["greedyGP29", gp29Length, 8],
]) {
  const lengths = referenceWords.map(lengthFn);
  const matches = findMatches(lengths, target);
  assert.equal(matches[0]?.n, expected, "Original historical source result changed");
  assert(matches.every(m => m.n < 9), "Nine-word quotation crib unexpectedly found");
  out.push({
    register: name, longestExactWords: expected, matchesAtLeast9: 0,
    top: matches.filter(m => m.n === expected).slice(0, 4).map(m => ({
      originalWord: m.unknown,
      physicalPage: physicalLP2Page(original.words[m.unknown].startPage),
      sourceWord: m.reference,
      length: m.n,
      sourceExcerpt: referenceWords.slice(m.reference, m.reference + m.n).join(" "),
    })),
  });
}

// Positive plant verifies that the matching algorithm can retrieve a real,
// long copied passage at original word position 1000.
const planted = target.slice();
const gp = referenceWords.map(gp29Length);
for (let i = 0; i < 16; i++) planted[1000 + i] = gp[500 + i];
assert(findMatches(gp, planted).some(m =>
  m.unknown === 1000 && m.reference === 500 && m.n >= 16),
  "16-word source-native planted crib was not recovered");

console.log(JSON.stringify({
  decision: "No nine-word verbatim contiguous Agrippa crib under either frozen register",
  sourceGitBlob: blobHash,
  sourceWords: referenceWords.length,
  originalWords: original.words.length,
  originalRunes: original.runeCount,
  originalCrossPageWords: original.crossPageWords,
  matchingMethod: "exact 7-word seeds extended maximally both directions",
  planted16WordsRecovered: true,
  results: out,
  scope: "Does not exclude edited quotations, different word boundaries, or Agrippa as a key",
}, null, 2));
