"use strict";

/**
 * Source-original gate for unsupported long ciphertext-overlap claims about LP2.
 * Windows 11 / Node.js 22: node sims/lp2_source_exact_long_repeat_sft.cjs
 *
 * Reads the canonical, image-backed physical LP2 page-index corpus and the
 * unchanged source JPEGs. Counts repeats only when both occurrences lie
 * completely inside their respective physical pages.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = source.pages.slice(0, 56).map((page, index) => {
  assert.equal(page.page, index);
  return page.indices;
});
assert.equal(pages.length, 56);
assert.equal(pages.flat().length, 12956);
assert.deepEqual([pages[25].length, pages[27].length,
  pages[44].length, pages[50].length, pages[55].length],
  [273, 234, 273, 0, 76]);

/** @param {number} page @param {string} expectedSha */
function checkOriginalImage(page, expectedSha) {
  const file = path.join(root, "resources", "liber-primus",
    String(page + 17).padStart(2, "0") + ".jpg");
  const actual = crypto.createHash("sha256")
    .update(fs.readFileSync(file)).digest("hex");
  assert.equal(actual, expectedSha, "Original source JPEG changed for LP2 p" + page);
}
checkOriginalImage(27, "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e");
checkOriginalImage(44, "463cf95229ccb6ae179cdd0fce2338df9f616da0db38813573a9fb1706846208");
checkOriginalImage(55, "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba");

/** @param {number[]} a @param {number[]} b */
function longestCommonSubstring(a, b) {
  const dp = new Uint16Array(b.length + 1);
  let length = 0;
  let atA = -1;
  let atB = -1;
  for (let i = 1; i <= a.length; i++) {
    for (let j = b.length; j >= 1; j--) {
      dp[j] = a[i - 1] === b[j - 1] ? dp[j - 1] + 1 : 0;
      if (dp[j] > length) {
        length = dp[j];
        atA = i - length;
        atB = j - length;
      }
    }
  }
  return { length, atA, atB };
}

/** @param {number} n */
function crossPageMatches(n) {
  /** @type {Map<string, {page:number,offset:number}>} */
  const seen = new Map();
  const hits = [];
  for (let p = 0; p < pages.length; p++) {
    const runes = pages[p];
    for (let offset = 0; offset + n <= runes.length; offset++) {
      const key = runes.slice(offset, offset + n).join(",");
      const earlier = seen.get(key);
      if (!earlier) seen.set(key, {page: p, offset});
      else if (earlier.page !== p) {
        hits.push({first: earlier, second: {page: p, offset},
          runes: runes.slice(offset, offset + n)});
      }
    }
  }
  return hits;
}

const p27p44 = longestCommonSubstring(pages[27], pages[44]);
assert.equal(pages[27][0], 19); // M
assert.equal(pages[44][0], 28); // EA
assert.deepEqual(p27p44, {length: 3, atA: 90, atB: 96});
assert.deepEqual(pages[27].slice(90, 93), pages[44].slice(96, 99));
const six = crossPageMatches(6);
assert.equal(six.length, 1);
assert.deepEqual(six[0].first, {page: 27, offset: 28});
assert.deepEqual(six[0].second, {page: 55, offset: 70});
assert.equal(six[0].runes.map(x => source.translit[x]).join(""), "DJUBEI");
assert.equal(crossPageMatches(7).length, 0);
assert.equal(crossPageMatches(97).length, 0);
console.log(JSON.stringify({
  input: "Original LP2 physical pages 0–55: 12,956 runes; p50 is runeless",
  originalJpegsSha256Verified: ["44.jpg", "61.jpg", "72.jpg"],
  p27VersusP44: {
    page27Length: pages[27].length,
    page44Length: pages[44].length,
    commonPrefixRunes: 0,
    longestCommonSubstring: p27p44
  },
  crossPhysicalPageRepetitions: {
    maxRunes: 6,
    uniqueSixRunePair: six[0],
    sevenRunePairs: 0,
    ninetySevenRunePairs: 0
  },
  caveat: "Page-internal matches only, not across page breaks; no plaintext or key recovered"
}, null, 2));