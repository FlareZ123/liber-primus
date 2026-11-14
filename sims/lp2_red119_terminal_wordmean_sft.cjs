"use strict";

/**
 * Original-input cross-artifact witness for LP2 red-119 inscriptions and the
 * unique terminal p27/p55 two-word ciphertext echo.
 *
 * Run with Node.js 22: node sims/lp2_red119_terminal_wordmean_sft.cjs
 * Tests are deliberately bounded; no unidentified LP2 plaintext is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const prime = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
const {words, runeCount} = parseSharedCorpus();
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);

/** @param {string} runes */
function sum(runes) {
  return [...runes].reduce((v, c) => {
    assert(prime.has(c), "unknown source rune");
    return v + prime.get(c);
  }, 0);
}
/** @param {number} p */
function page(p) {
  const found = corpus.pages.find(x => x.page === p);
  assert(found);
  return found.indices;
}
/** @param {number[]} sequence */
function ioc(sequence) {
  const hist = Array(29).fill(0);
  for (const x of sequence) hist[x]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
/** @param {number[]} sequence @param {number[]} key @param {1|-1} sign */
function inverse(sequence, key, sign) {
  return sequence.map((c, i) => (c + sign * key[i % key.length] + 29) % 29);
}
const sourceRed = [3, 39].map(n => ({
  p: n,
  indices: page(n).slice(119, 122),
  primes: page(n).slice(119, 122).map(v => corpus.prime[v])
}));
assert.deepEqual(sourceRed[0].indices, [13, 23, 2]);
assert.deepEqual(sourceRed[1].indices, [27, 5, 15]);
assert.deepEqual(sourceRed.map(x => x.primes), [[43, 89, 5], [107, 13, 53]]);
assert.deepEqual(sourceRed.map(x => x.primes.reduce((a, b) => a + b, 0)), [137, 173]);
assert.deepEqual([731, 371].map(n => [
  n === 731 ? 17 : 7, n === 731 ? 43 : 53
]), [[17, 43], [7, 53]]);
assert.equal(17 * 43, 731);
assert.equal(7 * 53, 371);
assert.equal(17 + 43, 60);
assert.equal(7 + 53, 60);
assert.equal(17 * 7, 119, "two smaller reversed factors reproduce BOTH red starts");

const adjacent33 = [];
for (let i = 0; i < words.length - 1; i++) {
  const a = words[i], b = words[i + 1];
  if (a.length !== 3 || b.length !== 3) continue;
  adjacent33.push({
    i, p: physicalLP2Page(a.startPage),
    runes: [a.runes, b.runes],
    sums: [sum(a.runes), sum(b.runes)]
  });
}
assert.equal(adjacent33.length, 184);
const hit = adjacent33.filter(x => x.sums[0] === 129 && x.sums[1] === 159);
assert.deepEqual(hit.map(x => [x.i, x.p]), [[1462, 27], [2894, 55]]);
const expected = ["ᛞᛄᚢ", "ᛒᛖᛁ"];
for (const h of hit) assert.deepEqual(h.runes, expected);
assert.deepEqual(hit[0].sums.map(v => v / 3), [43, 53]);
assert.deepEqual(hit[0].sums.map(v => corpus.translit[corpus.prime.indexOf(v / 3)]),
  ["P", "S"]);
const bothPrimeMean = adjacent33.filter(x => x.sums.every(v =>
  corpus.prime.includes(v / 3)));
assert.equal(bothPrimeMean.length, 4);

const candidateKeys = {
  GPOS: [6, 13, 3, 15], GOPS: [6, 3, 13, 15],
  PS: [13, 15], factorsMod29: [17, 14, 7, 24]
};
const tests = [];
for (const [keyName, key] of Object.entries(candidateKeys)) {
  for (const sign of [-1, 1]) {
    for (const p of [27, 55]) {
      const decoded = inverse(page(p), key, /** @type {1|-1} */ (sign));
      const rebuilt = inverse(decoded, key, /** @type {1|-1} */ (-sign));
      assert.deepEqual(rebuilt, page(p), "original-cipher forward reconstruction");
      // Calibrate executable encoder/decoder on independently solved clear p57.
      const solved = page(57);
      const plant = inverse(solved, key, /** @type {1|-1} */ (-sign));
      assert.deepEqual(inverse(plant, key, /** @type {1|-1} */ (sign)), solved);
      tests.push({
        key: keyName, sign, page: p, length: decoded.length, ioc: ioc(decoded)
      });
    }
  }
}
assert.equal(tests.length, 16);
assert.ok(Math.max(...tests.map(x => x.ioc)) < 0.05);
console.log(JSON.stringify({
  observation: {
    redInscriptionPrimeSums: [137, 173],
    reversedDecimalFactors: [[17, 43], [7, 53]],
    complements: [60, 60],
    commonRedOffset: 119,
    offsetFromSmallFactors: 17 * 7,
    repeatedWordSums: [129, 159],
    repeatedWordMeanPrimes: [43, 53],
    allAdjacentThreeThreePairs: adjacent33.length,
    exactPairPositions: hit.map(x => ({wordOrdinal: x.i, physicalPage: x.p})),
    bothPrimeMeanPairs: bothPrimeMean.map(x => ({
      wordOrdinal: x.i, physicalPage: x.p, sums: x.sums
    }))
  },
  directOriginalCipherTests: tests,
  knownSolvedP57Ic: ioc(page(57)),
  status: "An exact but retrospective source linkage; no unknown plaintext or selected decoder."
}, null, 2));
