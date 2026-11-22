"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeToValue = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} text */
function gp(text) {
  const words = text.match(/[A-Za-z]+/g) || [];
  const out = [];
  for (const word of words) {
    const normalized = word
      .toUpperCase()
      .replace(/QU/g, "CW")
      .replace(/V/g, "U")
      .replace(/[KQ]/g, "C")
      .replace(/Z/g, "S")
      .replace(/[^A-Z]/g, "");
    for (let index = 0; index < normalized.length; ) {
      if (normalized.startsWith("ING", index)) {
        out.push(21);
        index += 3;
        continue;
      }
      if (normalized.startsWith("IO", index)) {
        out.push(27);
        index += 2;
        continue;
      }
      const token = gpTokens.find((row) =>
        normalized.startsWith(row.symbol, index)
      );
      assert.ok(token, "unmapped GP spelling " + normalized.slice(index));
      out.push(token.value);
      index += token.symbol.length;
    }
  }
  return out;
}

/** @param {number[]} haystack @param {number[]} needle */
function findSequence(haystack, needle) {
  const hits = [];
  for (let start = 0; start + needle.length <= haystack.length; start += 1) {
    let match = true;
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[start + offset] !== needle[offset]) {
        match = false;
        break;
      }
    }
    if (match) hits.push(start);
  }
  return hits;
}

const p0 = corpus.pages.find((page) => page.page === 0).indices.slice(0, 13);
assert.deepEqual(p0, [15,8,18,3,6,19,27,0,15,26,18,21,5]);

const key = gp("LIBER PRIMUS IS");
assert.equal(key.length, 13);
assert.deepEqual(key, [20,10,17,18,4,13,4,10,19,1,15,10,15]);

const minus = p0.map((value, index) => mod29(value - key[index]));
const plus = p0.map((value, index) => mod29(value + key[index]));
assert.deepEqual(minus, [24,27,1,14,2,6,23,19,25,25,3,11,19]);
assert.deepEqual(plus, [6,18,6,21,10,3,2,10,5,27,4,2,20]);

const epiphanySeeks = gp("EPIPHANY SEEKS");
assert.deepEqual(epiphanySeeks, [18,13,10,13,8,24,9,26,15,18,18,5,15]);
assert.notDeepEqual(minus, epiphanySeeks);
assert.notDeepEqual(plus, epiphanySeeks);

const residual = p0.map((value, index) =>
  mod29(value - epiphanySeeks[index])
);
assert.deepEqual(residual, [26,24,8,19,27,24,18,3,0,8,0,16,19]);

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n")
  .replace(/\b7A35090F\b/g, "");
const sourceGp = gp(clear);
assert.deepEqual(findSequence(sourceGp, residual), []);
assert.deepEqual(findSequence(sourceGp, [...residual].reverse()), []);

const unknownParts = raw.split(/^\s*%\s*$/m).slice(0, 55);
const pageHits = [];
for (let segment = 0; segment < unknownParts.length; segment += 1) {
  const page = segment <= 49 ? segment : segment + 1;
  const values = [...unknownParts[segment]]
    .map((char) => runeToValue.get(char))
    .filter((value) => value !== undefined);
  for (const start of findSequence(values, residual)) {
    pageHits.push({ page, start, reverse: false });
  }
  for (const start of findSequence(values, [...residual].reverse())) {
    pageHits.push({ page, start, reverse: true });
  }
}
assert.deepEqual(pageHits, []);

console.log("PASS p0 source-key and exact-residual reuse negative gates");
console.log(JSON.stringify({
  directKey: { key, minus, plus },
  residual,
  sourceGpLength: sourceGp.length,
  pageHits,
}, null, 2));
