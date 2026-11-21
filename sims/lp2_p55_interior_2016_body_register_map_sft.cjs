#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc").replace(/\r\n/g, "\n");
const lines = signed.split("\n");
const hashLine = lines.findIndex((line) => /^Hash:/.test(line));
const signatureLine = lines.findIndex((line) => line.includes("-----BEGIN PGP SIGNATURE-----"));
assert(hashLine >= 0 && signatureLine > hashLine);
const payload = lines.slice(hashLine + 2, signatureLine).join("\n");
const paragraphs = payload.split(/\n[ \t]*\n/).filter((p) => p.trim().length > 0);
const paragraphWords = paragraphs.map((p) =>
  (p.replace(/\b3301\b/g, "").replace(/\b7A35090F\b/gi, "").match(/[A-Za-z]+/g) || [])
);
assert.deepEqual(paragraphWords.map((p) => p.length), [1, 8, 21, 6, 2, 0, 5]);
const core = paragraphWords[1].concat(paragraphWords[2]);
assert.equal(core.length, 29);
const symbols = corpus.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
function gpIndices(word) {
  const text = word.toUpperCase().replace(/[KVZ]/g, (c) => ({K:"C",V:"U",Z:"S"}[c]));
  const out = [];
  for (let i = 0; i < text.length;) {
    const token = symbols.find((entry) => text.startsWith(entry.symbol, i));
    assert(token, "unmapped GP text at " + text.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}
const gp0 = (word) => gpIndices(word).reduce((a, b) => a + b, 0);
const mod29 = (x) => ((x % 29) + 29) % 29;
const gpText = (values) => values.map((v) => corpus.translit[v]).join("");
const page = corpus.pages.find((p) => p.page === 55).indices;
const fragmentLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(page.length, 76);
assert.equal(fragmentLengths.reduce((a, b) => a + b, 0), 76);
const interiorPositions = [];
let cursor = 0;
for (let i = 0; i < fragmentLengths.length; i++) {
  const length = fragmentLengths[i];
  if (i > 0) {
    for (let p = cursor + 1; p < cursor + length - 1; p++) interiorPositions.push(p);
  }
  cursor += length;
}
assert.equal(interiorPositions.length, 43);
assert.deepEqual(interiorPositions, [
  2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,37,38,39,40,
  43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74
]);
const interior = interiorPositions.map((p) => page[p]);
assert.deepEqual(interior, [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,
  18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18
]);
// GP29 remainder v=0..28 maps to the human one-based body ordinal v+1.
const mapWords = interior.map((v) => core[v]);
const rawKey = mapWords.map(gp0);
const key = rawKey.map(mod29);
const plain = interior.map((cipher, i) => mod29(cipher - key[i]));
let sourceOffset = 0, plainOffset = 0;
const reconstructedWords = [];
for (let i = 0; i < fragmentLengths.length; i++) {
  const length = fragmentLengths[i];
  const original = page.slice(sourceOffset, sourceOffset + length);
  if (i === 0) {
    reconstructedWords.push(gpText(original));
  } else {
    const decodedInterior = plain.slice(plainOffset, plainOffset + length - 2);
    reconstructedWords.push(gpText([original[0], ...decodedInterior, original[length - 1]]));
    plainOffset += length - 2;
  }
  sourceOffset += length;
}
assert.equal(plainOffset, 43);
function walk(start, depth) {
  assert(Number.isInteger(start) && start >= 0 && start < 256);
  let node = start;
  for (let i = 0; i < depth; i++) node = grid.bytes[node];
  return node;
}
const p50Endpoints = mapWords.map((word) => walk(gp0(word), 23));
const seeksPositions = mapWords.map((word, i) => word.toLowerCase() === "seeks" ? i + 1 : null).filter(Boolean);
assert.deepEqual(seeksPositions, [10,17,41]);
assert.deepEqual(seeksPositions.map((i) => p50Endpoints[i - 1]), [32,32,32]);
assert.deepEqual(p50Endpoints, [
  114,47,68,114,115,197,114,197,115,32,199,114,114,47,114,76,32,192,192,114,47,
  199,115,114,192,192,68,197,47,114,114,114,199,68,197,197,197,199,47,114,32,114,197
]);
console.log(JSON.stringify({
  source: "p55 original page-local 43 strict-word-interior runes; authenticated 2016 body-only 29-word register",
  bodyWords: core, fragmentLengths, interiorPositions,
  interior: gpText(interior),
  oneBasedMappedWords: mapWords.map((word, i) => ({i:i+1, rune:interior[i], bodyOrdinal:interior[i]+1, word})),
  mapSequence: mapWords.map((word) => word.toUpperCase()).join(" "),
  gp0RawKey: rawKey, gp0Modulo29Key: key,
  subtractivePlaintext: gpText(plain),
  reconstructedWordsWithOriginalExteriors: reconstructedWords,
  p50T23Endpoints: p50Endpoints, seeksPositions, seeksEndpoints: [32,32,32],
  conclusion: "The direct one-based 29-word book map is not plaintext. Its GP0 word values used as a continuous C-K key also fail; the fixed p50 T^23 route sends only the three SEEKS selections to p32 state 32, a navigation observation rather than a cipher."
}, null, 2));
