"use strict";

/**
 * Exact original-source intersection: all GP-prime-sum/mod32, 16-complete-word
 * windows of the 2014 LP2 unknown ciphertext against an independently archived
 * participant-published September 2014 onion-v2 hostname inventory.
 *
 * Run with Node.js 22 from any working directory after cloning the repository.
 * All source bytes are committed locally, so the test makes no network calls.
 * This is a candidate-address discriminator, never a plaintext decryption.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root,
  "resources/external/2014-09-stage11-period-onion-hosts.txt"));
const originalGitBlob = crypto.createHash("sha1")
  .update(Buffer.from("blob " + source.length + String.fromCharCode(0), "utf8"))
  .update(source).digest("hex");
assert.equal(source.length, 73692);
assert.equal(originalGitBlob, "8722ee2edd749f01b4fffbd91053fac5a8ca0ff3");

const rows = source.toString("utf8").split(/\r?\n/u).filter(Boolean);
const exactValidRows = rows.filter((s) => /^[a-z2-7]{16}\.onion$/iu.test(s));
const hosts = new Set(exactValidRows.map((s) => s.toLowerCase().slice(0, 16)));
assert.equal(rows.length, 3204);
assert.equal(exactValidRows.length, 3174);
assert.equal(hosts.size, 3173, "One 2014 host is duplicated in mixed case");
assert.ok(hosts.has("3g2upl4pq6kufc4m"), "Contemporary DuckDuckGo control absent");
assert.ok(!hosts.has("ky2khlqdf7qdznac"), "Known Cicada distributor unexpectedly indexed");

const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const indexByRune = new Map(corpus.runes.map((rune, i) => [rune, i]));
const {words, runeCount, crossPageWords} = parseSharedCorpus();
assert.equal(words.length, 2896);
assert.equal(runeCount, 12956);
assert.equal(crossPageWords, 32);

/** @param {string} word Complete GP rune word. @returns {number} Prime sum. */
function primeSum(word) {
  return [...word].reduce((sum, rune) => sum + corpus.prime[indexByRune.get(rune)], 0);
}
const sums = words.map((w) => primeSum(w.runes));
const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
const allHostnames = [];
const matches = [];
let physicalPageContained = 0;
for (let i = 0; i + 16 <= words.length; i++) {
  const hostname = sums.slice(i, i + 16)
    .map((n) => alphabet[n % 32]).join("");
  allHostnames.push(hostname);
  if (words[i].startPage === words[i + 15].endPage) {
    physicalPageContained++;
  }
  if (hosts.has(hostname)) {
    matches.push({
      startWord: i,
      sourceStartPage: words[i].startPage,
      sourceEndPage: words[i + 15].endPage,
      hostname,
    });
  }
}
assert.equal(allHostnames.length, 2881);
assert.equal(new Set(allHostnames).size, 2881);
assert.equal(physicalPageContained, 2039);
assert.equal(allHostnames[2880], "6sws36unkmvdy4b7");
assert.deepEqual(sums.slice(-16), [
  222, 114, 118, 306, 283, 30, 596, 365,
  138, 108, 341, 291, 88, 284, 129, 159,
]);
assert.equal(matches.length, 0);

/* Matched-source positive plant: inserting the exact original last-window
 * output into a copy of the independent directory is detected precisely. */
const planted = new Set(hosts);
planted.add(allHostnames[2880]);
const hitIndices = allHostnames
  .flatMap((name, i) => planted.has(name) ? [i] : []);
assert.deepEqual(hitIndices, [2880]);

console.log(JSON.stringify({
  originalGitBlob,
  originalDirectory: {lines: rows.length, syntacticallyValidRows: exactValidRows.length,
    uniqueCaseInsensitiveHosts: hosts.size, knownCicadaDistributorPresent: false,
    contemporaryDuckDuckGoPresent: true},
  originalCiphertext: {runes: runeCount, completeWords: words.length,
    crossPageWords, allSixteenWordWindows: allHostnames.length,
    physicallyContainedSixteenWordWindows: physicalPageContained,
    uniqueDerivedHosts: new Set(allHostnames).size},
  frozenFinalPageHost: allHostnames[2880],
  historicalDirectoryMatches: matches,
  plantedFinalPageMatchPositions: hitIndices,
}, null, 2));
