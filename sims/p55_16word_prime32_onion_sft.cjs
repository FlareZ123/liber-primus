"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

/**
 * Derive one candidate *historical Tor v2* host from all complete words
 * beginning on original physical LP2 page 55.
 * The math is deterministic; the hypothesis is unauthenticated.
 *
 * Run: node sims/p55_16word_prime32_onion_sft.cjs
 */
function main() {
  const base = path.join(__dirname, "..");
  const corpus = JSON.parse(fs.readFileSync(
    path.join(base, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
  const parsed = parseSharedCorpus();
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.byStartPage.length, 55);

  const eligible = parsed.byStartPage
    .map((items, i) => ({page: physicalLP2Page(i), count: items.length}))
    .filter(({count}) => count === 16);
  assert.deepEqual(eligible.map(({page}) => page), [55]);

  const page = parsed.byStartPage[54];
  assert.equal(page.length, 16);
  assert.equal(corpus.pages[55].runic_count, 76);
  assert.equal(page.reduce((n, word) => n + word.length, 0), 75);
  assert.equal(corpus.pages[55].indices.length, 76);
  assert.equal(page[0].startPage, 54);
  assert.ok(page.every((word) => word.endPage === 54));

  /** @type {Map<string, number>} */
  const primes = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
  /** @param {string} text GP rune word */
  function sumPrimes(text) {
    let n = 0;
    for (const rune of text) {
      assert.ok(primes.has(rune), "unknown rune " + rune);
      n += primes.get(rune);
    }
    return n;
  }

  const sums = page.map(({runes}) => sumPrimes(runes));
  const expected = [222,114,118,306,283,30,596,365,
    138,108,341,291,88,284,129,159];
  assert.deepEqual(sums, expected);

  const base32 = "abcdefghijklmnopqrstuvwxyz234567";
  const indices = sums.map((sum) => sum % 32);
  const host = indices.map((index) => base32[index]).join("");
  assert.equal(host, "6sws36unkmvdy4b7");
  assert.match(host, /^[a-z2-7]{16}$/);
  const reversed = [...indices].reverse()
    .map((index) => base32[index]).join("");
  assert.equal(reversed, "7b4ydvmknu63sws6");

  // Syntactic validity alone is zero evidence: every consecutive set of
  // 16 source words generates a 16-character base32 string by this rule.
  const allWordSums = parsed.words.map(({runes}) => sumPrimes(runes));
  const windows = allWordSums.length - 15;
  assert.equal(windows, 2881);
  const available = Array.from({length: windows}, (_, start) =>
    allWordSums.slice(start, start + 16)
      .map((sum) => base32[sum % 32]).join(""));
  assert.ok(available.every((name) => /^[a-z2-7]{16}$/.test(name)));

  console.log(JSON.stringify({
    source: "LP2 physical page 55: 16 complete words beginning on page",
    otherUnknownPagesWithExactly16WordStarts: [],
    sourceRuneCount: 76,
    completeWordRunes: 75,
    incomingCarryRunes: 1,
    originalGPPrimeSums: sums,
    base32Indices: indices,
    candidateHistoricV2Onion: host + ".onion",
    reverseHypothesis: reversed + ".onion",
    ordinary16WordWindowsAlsoSyntacticallyValid: windows,
    evidence: "unauthenticated mathematical hypothesis; no original plaintext",
  }, null, 2));
}

if (require.main === module) main();

module.exports = {main};
