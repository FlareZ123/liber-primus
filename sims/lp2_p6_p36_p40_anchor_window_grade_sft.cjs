"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildCandidates } = require("./lp2_p6_p36_p40_anchor_window_serializer_sft.cjs");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, `unmapped GP spelling ${normalized.slice(offset)}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[36], "GOOD");
assert.equal(sourceWords[40], "PATHS");
const target36 = gp(sourceWords[36]);
const target40 = gp(sourceWords[40]);
assert.deepEqual(target36, [6, 3, 3, 23]);
assert.deepEqual(target40, [13, 24, 2, 15]);

/** @param {number[]} left @param {number[]} right @returns {boolean} */
function same(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

/** @param {number[]} left @param {number[]} right @returns {number} */
function matches(left, right) {
  return left.reduce((count, value, index) => count + (value === right[index] ? 1 : 0), 0);
}

const { records, meta } = buildCandidates();
assert.equal(meta.candidateCount, 720);
const exact36 = records.filter((row) => same(row.out36, target36));
const exact40 = records.filter((row) => same(row.out40, target40));
const exactBoth = records.filter((row) => same(row.out36, target36) && same(row.out40, target40));
const scores = records.map((row) => matches(row.out36, target36) + matches(row.out40, target40));
const histogram = new Map();
for (const score of scores) histogram.set(score, (histogram.get(score) || 0) + 1);
const maxMatches = Math.max(...scores);

assert.equal(exact36.length, 0);
assert.equal(exact40.length, 0);
assert.equal(exactBoth.length, 0);
assert.equal(maxMatches, 3);
assert.deepEqual([...histogram.entries()].sort((left, right) => left[0] - right[0]), [
  [0, 514],
  [1, 186],
  [2, 18],
  [3, 2],
]);

console.log("PASS lp2_p6_p36_p40_anchor_window_grade_sft");
console.log(JSON.stringify({
  candidateCount: records.length,
  frozenDigest: meta.digest,
  exact36: exact36.length,
  exact40: exact40.length,
  exactBoth: exactBoth.length,
  maxMatches,
  histogram: Object.fromEntries([...histogram.entries()].sort((left, right) => left[0] - right[0])),
}, null, 2));
