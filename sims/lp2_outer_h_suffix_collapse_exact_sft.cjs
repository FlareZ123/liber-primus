"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Exact algebraic collapse of LP2 sorted outer-H packets to two ciphertext
 * suffix values and a +2 first-rune relation, with original site assertions.
 * Tested on the immutable 29-symbol Gematria Primus corpus.
 */
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const MODULUS = 29;
/** @param {number} value @returns {number} */
const mod = value => ((value % MODULUS) + MODULUS) % MODULUS;
/** @param {number} first @param {number} last @returns {number[]} */
function sortedH(first, last) {
  return [mod(first - last), mod(first + last)].sort((a, b) => a - b);
}
/** @param {number} first @param {number} last @returns {number | null} */
function suffixStart(first, last) {
  const start = mod(first + 14);
  return (last === 14 || last === 15) && start <= 27 ? start : null;
}
let actualConsecutive = 0;
let predictedConsecutive = 0;
for (let first = 0; first < 29; first++) {
  for (let last = 0; last < 29; last++) {
    const [lo, hi] = sortedH(first, last);
    const isConsecutive = hi === lo + 1;
    const predicted = suffixStart(first, last);
    assert.equal(isConsecutive, predicted !== null);
    if (isConsecutive) {
      actualConsecutive++;
      predictedConsecutive++;
      assert.equal(lo, predicted);
      assert.deepEqual(last === 14
        ? [mod(first + 15), mod(first + 14)]
        : [mod(first + 14), mod(first + 15)],
      [mod(first - last), mod(first + last)]);
    }
  }
}
assert.equal(actualConsecutive, 56);
assert.equal(predictedConsecutive, 56);
const cases = [
  { page: 12, offsets: [122, 126], lengths: [4, 4],
    first: [20, 22], last: [14, 14], signed: [5, 6, 7, 8] },
  { page: 14, offsets: [64, 67], lengths: [3, 6],
    first: [5, 7], last: [15, 15], signed: [19, 20, 21, 22] },
  { page: 46, offsets: [39, 43], lengths: [4, 3],
    first: [25, 27], last: [14, 15], signed: [10, 11, 12, 13] }
];
for (const c of cases) {
  const page = corpus.pages.find(p => p.page === c.page);
  assert(page);
  const actual = c.offsets.map((offset, i) => page.indices.slice(offset, offset + c.lengths[i]));
  const first = actual.map(v => v[0]);
  const last = actual.map(v => v[v.length - 1]);
  assert.deepEqual(first, c.first);
  assert.deepEqual(last, c.last);
  assert.equal(mod(first[1] - first[0]), 2);
  const s1 = suffixStart(first[0], last[0]);
  const s2 = suffixStart(first[1], last[1]);
  assert.notEqual(s1, null);
  assert.equal(s2, s1 + 2);
  assert.deepEqual([s1, s1 + 1, s2, s2 + 1], c.signed);
  assert.deepEqual([...sortedH(first[0], last[0]), ...sortedH(first[1], last[1])], c.signed);
  console.log("site", c.page, "source starts", c.offsets,
    "first", first, "end", last, "signed indices", c.signed);
}
console.log(JSON.stringify({
  status: "PASS",
  source: "original LP2 canonical GP29 corpus",
  exhaustiveOriginalRunePairs: 29 * 29,
  consecutiveSortedH: actualConsecutive,
  equivalentSuffixRule:
    "last rune 14(X) or 15(S), first rune +14 mod29 <=27",
  exactSourceWitnessPages: cases.map(c => c.page),
  extraInformationInH: "none for this exact packet predicate",
  recoveredUnknownPlaintext: false
}, null, 2));
