"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.resolve(__dirname, "..", relative), "utf8");
}

/** @param {number} n @returns {number} */
function mod29(n) {
  return (n % 29 + 29) % 29;
}

/** @param {number} base @param {number} power @param {number} modulus @returns {number} */
function modPow(base, power, modulus) {
  let x = 1;
  for (let i = 0; i < power; i += 1) x = x * base % modulus;
  return x;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens = table.pages.flatMap((page) => page.tokens);
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];

assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);
assert.equal(tokens.length, 256);
assert.deepEqual(tokens.flatMap((token, i) => token === "00" ? [i] : []), [192, 229]);

const events = [];
const phase = Array.from({ length: 256 }, () => []);
let globalOffset = 0;
for (const page of pages) {
  for (let local = 0; local < page.indices.length; local += 1, globalOffset += 1) {
    if (local === 0 || page.indices[local] !== page.indices[local - 1]) continue;
    const cell = (globalOffset - 1) % 256;
    const chapter = chapters.findIndex(([lo, hi]) => lo <= page.page && page.page <= hi);
    assert.ok(chapter >= 0);
    const event = { page: page.page, local, global: globalOffset, cell, chapter, rune: page.indices[local] };
    phase[cell].push(events.length);
    events.push(event);
  }
}
assert.equal(events.length, 86);
assert.deepEqual(phase[192].map((index) => events[index].rune), [26, 3, 1, 24]);
assert.deepEqual(phase[192].map((index) => events[index].page), [9, 24, 25, 34]);
assert.deepEqual(phase[229].map((index) => events[index].rune), [14]);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} input @returns {number[]} */
function gpEnglish(input) {
  const word = input.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const token = gpTokens.find(({ symbol }) => word.startsWith(symbol, i));
      assert.ok(token, "unmapped source word " + input);
      out.push(token.value);
      i += token.symbol.length;
    }
  }
  return out;
}

const signedBody = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => ({
  index, word: word.toUpperCase(), runes: gpEnglish(word),
}));
assert.equal(signedWords.length, 43);
const sourceWords = [...new Map(signedWords.map((row) => [row.word, row])).values()]
  .filter((row) => row.runes.length >= 3);
assert.equal(sourceWords.length, 31);

/** @param {number[]} labels @returns {Array<{cell:number,word:string,offset:number}>} */
function wordHits(labels) {
  const hits = [];
  for (let cell = 0; cell < 256; cell += 1) {
    const ids = phase[cell];
    if (ids.length < 3) continue;
    for (const { word, runes } of sourceWords) {
      for (let start = 0; start + runes.length <= ids.length; start += 1) {
        if (runes.every((r, i) => labels[ids[start + i]] === r)) {
          hits.push({ cell, word, offset: start });
        }
      }
    }
  }
  return hits;
}

const original = events.map((event) => event.rune);
assert.deepEqual(wordHits(original), [{ cell: 192, word: "YOU", offset: 0 }]);

// Explicit detection controls, independent of the actual YOU string.
const erased = original.slice();
erased[phase[192][2]] = 0;
assert.deepEqual(wordHits(erased), []);
const planted = erased.slice();
phase[140].forEach((index, i) => { planted[index] = gpEnglish("MAP")[i]; });
assert.ok(wordHits(planted).some((hit) => hit.cell === 140 && hit.word === "MAP"));

/** @type {number} */
let seed = 0x33011916;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/** @param {number[]} values @param {number[]} indexes @returns {void} */
function permute(values, indexes) {
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = random32() % (i + 1);
    const x = indexes[i], y = indexes[j];
    [values[x], values[y]] = [values[y], values[x]];
  }
}

const every = events.map((_, i) => i);
const byChapter = chapters.map((_, chapter) => every.filter((i) => events[i].chapter === chapter));
let globalHits = 0, chapterHits = 0;
const n = 50000;
for (let trial = 0; trial < n; trial += 1) {
  const globallyShuffled = original.slice();
  permute(globallyShuffled, every);
  if (wordHits(globallyShuffled).length) globalHits += 1;

  const withinChapters = original.slice();
  for (const indexes of byChapter) permute(withinChapters, indexes);
  if (wordHits(withinChapters).length) chapterHits += 1;
}
assert.equal(globalHits, 31);
assert.equal(chapterHits, 56);

// Previously frozen source route: signed YOU -> p50[GP0(YOU)] -> p0 WILL,
// with independently published p38 reciprocal packet and p28 DH23 state.
// The new event channel proposes only another route to YOU; it does not
// license the already-known key schedule or decrypt new unknown runes.
const you = gpEnglish("YOU"), will = gpEnglish("WILL"), found = gpEnglish("FOUND");
assert.deepEqual(you, [26, 3, 1]);
assert.equal(you.reduce((a, b) => a + b, 0), 30);
assert.equal(tokens[30], "2L");
const alphabet = table.alphabet;
/** @param {string} token @returns {number} */
function number60(token) {
  return alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]);
}
assert.equal(number60(tokens[30]), 141);
const p0 = pages.find((page) => page.page === 0);
const p38 = pages.find((page) => page.page === 38);
assert.ok(p0 && p38);
assert.deepEqual(p38.indices.slice(54, 57), [5, 12, 19]);
const packet = p38.indices.slice(54, 57);
const K = 2, a = packet[1] / K, A = modPow(packet[0], a, 23);
assert.equal(a, 6);
assert.equal(A, 8);
const H = [mod29(A - packet[2]), mod29(A + packet[2])];
assert.deepEqual(H, [18, 27]);
const willKey = [packet[1], a, ...H];
const willCipher = p0.indices.slice(141, 145);
assert.deepEqual(willCipher, [19, 16, 9, 18]);
assert.deepEqual(willCipher.map((r, i) => mod29(r - willKey[i])), will);
assert.equal(will.reduce((a, b) => a + b, 0), 57);
assert.equal(number60(tokens[57]), 118);
assert.equal(number60(tokens[118]), 35);
const foundCipher = p0.indices.slice(117, 122);
const foundKey = [packet[1], mod29(packet[0] - a), mod29(K * packet[0]), mod29(a - packet[0]), A];
assert.deepEqual(foundCipher.map((r, i) => mod29(r - foundKey[i])), found);

console.log("original source: 12956 runes, 86 same-page equalities, 256 source cells");
console.log("first source token 00: cell192 -> Y O U A (pages9,24,25,34); other 00: cell229 -> X");
console.log("43 signed words, 31 unique >=3-rune words, five eligible phase groups");
console.log("exact signed-word literal matches: YOU, cell192, first three events");
console.log("retrospective 50000-shuffle signed-vocabulary null: global " + globalHits
  + "/50000; chapter-preserving " + chapterHits + "/50000");
console.log("conditional known path: YOU -> 2L -> p0[141..144] WILL -> two hops -> p0[117..121] FOUND");
console.log("PASS. No new authenticated LP2 plaintext or cipher has been recovered.");
