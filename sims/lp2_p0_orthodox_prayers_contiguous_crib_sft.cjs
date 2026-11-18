"use strict";

/**
 * Source-cued contiguous plaintext crib gate for the actual 2014 LP2
 * Orthodox-cross chapter, physical pp0-2, against the pre-2014 English
 * Project Gutenberg "Orthodox Daily Prayers" (ebook 34981).
 *
 * Every test uses the original, uninterrupted GP29 printed-word lengths.
 * Equal GP rune length is a necessary condition for an unchanged-word
 * quotation under word-length-preserving encryption. No secret key is
 * fitted and no ciphertext symbols are adjusted.
 *
 * Windows Node.js 22: node sims/lp2_p0_orthodox_prayers_contiguous_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const sourceFile = path.join(root, "resources/control/orthodox_daily_prayers_pg34981.txt");
const source = fs.readFileSync(sourceFile, "utf8");
const begin = source.indexOf("*** START OF THE PROJECT GUTENBERG");
const end = source.indexOf("*** END OF THE PROJECT GUTENBERG");
assert(begin >= 0 && end > begin, "frozen Gutenberg text framing");
const mainText = source.slice(source.indexOf("\n", begin) + 1, end);
const sourceWords = mainText.match(/[A-Za-z]+/g) || [];

/** @param {string} spelling @returns {number} Native GP rune length. */
function gpLength(spelling) {
  const normalized = spelling.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  return (normalized.match(/ING|TH|NG|EO|OE|AE|IA|EA|IO|[A-Z]/g) || []).length;
}
const sourceLengths = sourceWords.map(gpLength);
assert.equal(sourceLengths.length, 25088, "frozen source edition/tokenization");

const original = parseSharedCorpus();
assert.equal(original.runeCount, 12956);
assert.equal(original.words.length, 2896);
assert.equal(original.crossPageWords, 32);
const chapter = original.words.filter(w => w.startPage <= 2 && w.endPage <= 2);
assert.equal(chapter.length, 158, "source p0..2 true whole words");
assert.equal(chapter.reduce((sum, w) => sum + w.length, 0), 729);
const chapterLengths = chapter.map(w => w.length);

/**
 * Find every full exact length match of at least seven adjacent words.
 * @param {number[]} reference
 * @param {number[]} target
 * @returns {Array<{sourceStart:number,targetStart:number,length:number}>}
 */
function exactRuns(reference, target) {
  const k = 7;
  const index = new Map();
  for (let i = 0; i + k <= reference.length; i++) {
    const key = reference.slice(i, i + k).join(",");
    let bucket = index.get(key);
    if (!bucket) {
      bucket = [];
      index.set(key, bucket);
    }
    bucket.push(i);
  }
  const matches = new Map();
  for (let i = 0; i + k <= target.length; i++) {
    const key = target.slice(i, i + k).join(",");
    for (const j of index.get(key) || []) {
      let atTarget = i, atReference = j, length = k;
      while (atTarget > 0 && atReference > 0 &&
        target[atTarget - 1] === reference[atReference - 1]) {
        atTarget--;
        atReference--;
        length++;
      }
      while (atTarget + length < target.length &&
        atReference + length < reference.length &&
        target[atTarget + length] === reference[atReference + length]) {
        length++;
      }
      const row = {sourceStart:atReference,targetStart:atTarget,length};
      matches.set(atReference + ":" + atTarget, row);
    }
  }
  return [...matches.values()].sort((a,b) => b.length-a.length ||
    a.targetStart-b.targetStart || a.sourceStart-b.sourceStart);
}

const runs = exactRuns(sourceLengths, chapterLengths);
assert.equal(runs.length, 4);
assert(runs.every(x => x.length === 7));
assert.deepEqual(runs.map(x => [x.targetStart, x.sourceStart]),
  [[22,10012],[73,21991],[98,21291],[118,15845]]);
const planted = exactRuns(sourceLengths, sourceLengths.slice(7000, 7016));
assert.equal(planted[0].length, 16, "a genuine 16-word source quotation is detected");

console.log(JSON.stringify({
  hypothesis: "Orthodox cross artwork points to English Orthodox Daily Prayers verbatim plaintext",
  source: "Gutenberg ebook 34981 (main text only), repo-pinned source",
  original: "physical LP2 pp0-2, 729 GP29 runes and 158 contiguous actual words",
  sourceWordCount: sourceWords.length,
  tested: "unmodified adjacent GP29 word-length runs of seven or longer",
  longestOriginalRun: runs[0].length,
  numberOfSevenWordRuns: runs.length,
  originalMatches: runs.map(x => ({
    ...x,
    candidateSourceWords: sourceWords.slice(x.sourceStart,
      x.sourceStart + x.length).join(" ")
  })),
  sixteenWordPositive: planted[0],
  decision: "No eight-word or longer exact word-preserving plaintext quotation in this named source; does not exclude paraphrase, translation, changed segmentation or a different book",
  recoveredUnknownPlaintext: false
}, null, 2));
