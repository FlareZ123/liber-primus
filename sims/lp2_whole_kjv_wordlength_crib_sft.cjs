"use strict";
/**
 * Source-first whole-book KJV crib scan. Check whether any contiguous runic
 * word-length sequence from all 55 unsolved LP2 rune pages matches a quoted or
 * unmarked historical Bible passage sufficiently to nominate actual plaintext.
 *
 * Unlike the prior quotation-only 405-rune KJV screen, test every one of the
 * original 2,896 source words, including all unmarked paragraphs.
 * Input is the pinned full KJV.txt used by the existing quote-only workflow.
 * Exact matching is independent of every ciphertext symbol's identity.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const sourceFile = process.argv[2];
assert.ok(sourceFile, "Supply the pinned KJV.txt source file");
const contents = fs.readFileSync(sourceFile);
assert.equal(
  crypto.createHash("sha256").update(contents).digest("hex"),
  "1ec99be81dcfcd4d601a5f988f3f8a544382c6b8594b0ec94a94599bcac29d73",
  "source text must be the byte-pinned 2014-available KJV edition"
);
const corpus = parseSharedCorpus();
assert.equal(corpus.runeCount, 12956);
assert.equal(corpus.words.length, 2896);
assert.equal(corpus.crossPageWords, 32);
const actual = corpus.words.map(word => word.length);
const words = contents.toString("utf8").toUpperCase().match(/[A-Z]+/g) || [];
assert.equal(words.length, 823810);
/** @param {string} word @returns {number} */
const gpLength = word => (word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;
const lengths = words.map(gpLength);
const seedWidth = 8;
/** @param {number[]} nums @param {number} i @returns {string} */
const signature = (nums, i) => nums.slice(i, i + seedWidth).join(",");

/**
 * @param {number[]} candidate Word lengths of an LP2-sized test manuscript
 * @returns {Array<{originalWord:number,sourceWord:number,length:number,physicalPage:number}>}
 */
function scan(candidate) {
  const index = new Map();
  for (let i = 0; i + seedWidth <= candidate.length; i++) {
    const code = signature(candidate, i);
    if (!index.has(code)) index.set(code, []);
    index.get(code).push(i);
  }
  const seen = new Map();
  for (let source = 0; source + seedWidth <= lengths.length; source++) {
    const refs = index.get(signature(lengths, source));
    if (!refs) continue;
    for (const original of refs) {
      let i = original, j = source, count = seedWidth;
      while (i > 0 && j > 0 && candidate[i - 1] === lengths[j - 1]) {
        i--; j--; count++;
      }
      while (i + count < candidate.length && j + count < lengths.length &&
             candidate[i + count] === lengths[j + count]) count++;
      const key = i + ":" + j;
      if (!seen.has(key)) seen.set(key, {
        originalWord: i, sourceWord: j, length: count,
        physicalPage: physicalLP2Page(corpus.words[i].startPage)
      });
    }
  }
  return [...seen.values()].sort((a, b) =>
    b.length - a.length || a.originalWord - b.originalWord ||
    a.sourceWord - b.sourceWord
  );
}
const hits = scan(actual);
const exemplar = lengths.slice(25001, 25035);
assert.equal(exemplar.length, 34);
const planted = actual.slice();
planted.splice(1200, 34, ...exemplar);
const recovered = scan(planted).some(x =>
  x.originalWord === 1200 && x.sourceWord === 25001 && x.length >= 34
);
assert.ok(recovered, "blind 34-word original-source positive control");
const top = hits.slice(0, 12).map(hit => ({
  ...hit, sourceExcerpt: words.slice(hit.sourceWord, hit.sourceWord +
    Math.min(hit.length, 20)).join(" ")
}));
console.log(JSON.stringify({
  scope: "Whole original LP2 unknown word stream, all passages of pinned KJV",
  sourceSHA256: "1ec99be81dcfcd4d601a5f988f3f8a544382c6b8594b0ec94a94599bcac29d73",
  sourceWords: words.length,
  originalWords: actual.length,
  originalRunes: corpus.runeCount,
  exactSeedWords: seedWidth,
  maximumExactMatch: hits[0] ? hits[0].length : 0,
  matchCounts: Object.fromEntries([10, 12, 15, 20, 30].map(n =>
    [n, hits.filter(hit => hit.length >= n).length])),
  top, recoveredKnownSource34WordPlant: true,
  plaintextRecovered: false,
  caution: "A matching length fingerprint nominates only a crib. Authentic plaintext requires independent cryptographic confirmation."
}, null, 2));
