"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const tokens = corpus.translit.map((symbol, value) => ({ symbol, value })).sort((a, b) => b.symbol.length - a.symbol.length);
function gpWord(word) {
  const clean = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (clean.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = tokens.find(item => clean.startsWith(item.symbol, i));
    assert(token, "source word must encode in repository GP29 orthography");
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}
const clear = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u)?.[1];
assert(clear, "signed cleartext body must be present");
const sourceWords = clear.replace(/^\- /gm, "").match(/\b[A-Za-z]+\b/gu).map(word => word.toUpperCase());
assert.equal(sourceWords.length, 43);
const table = grid.pages.flatMap(page => page.bytes);
assert.equal(table.length, 256);
const entries = sourceWords.map((word, index) => {
  const gp = gpWord(word);
  const address = gp.reduce((sum, value) => sum + value, 0);
  assert(address >= 0 && address < 256);
  return { index, word, latinLength: word.length, gpLength: gp.length, address };
});
function evaluateShift(shift) {
  const matches = [];
  for (const entry of entries) {
    const value = table[(entry.address + shift) % 256];
    const quotient = Math.floor(value / 29);
    const remainder = value % 29;
    if (quotient === entry.latinLength) matches.push({ ...entry, value, quotient, remainder, targetPage: entry.index + remainder });
  }
  return { shift, hits: matches.length, validTargets: matches.filter(hit => hit.targetPage <= 55).length, matches };
}
const rotations = Array.from({ length: 256 }, (_, shift) => evaluateShift(shift));
const canonical = rotations[0];
const ranked = rotations.slice().sort((a, b) => b.hits - a.hits || b.validTargets - a.validTargets);
const distribution = {};
for (const result of rotations) distribution[result.hits] = (distribution[result.hits] || 0) + 1;
assert.equal(canonical.hits, 10);
assert.equal(canonical.validTargets, 10);
assert.equal(ranked[0].shift, 144);
assert.equal(ranked[0].hits, 14);
assert.equal(rotations.filter(result => result.hits === 14).length, 1);
assert.deepEqual(canonical.matches.map(hit => hit.word), ["THE", "EPIPHANY", "THE", "THE", "THE", "THE", "THE", "WILL", "LUCK", "PATHS"]);
const byWord = Object.fromEntries(canonical.matches.filter(hit => hit.word === "WILL" || hit.word === "PATHS").map(hit => [hit.word, {
  sourceIndex: hit.index, GP0: hit.address, tableByte: hit.value, divmod29: [hit.quotient, hit.remainder], proposedTargetPage: hit.targetPage
}]));
assert.deepEqual(byWord.WILL.divmod29, [4, 2]);
assert.deepEqual(byWord.PATHS.divmod29, [5, 11]);
assert.equal(byWord.WILL.proposedTargetPage, 35);
assert.equal(byWord.PATHS.proposedTargetPage, 51);
console.log(JSON.stringify({
  testedSourceWords: sourceWords.length,
  testedTableRotations: rotations.length,
  predicate: "divmod29 quotient == Latin alphabetic length",
  targetPageHypothesis: "zero-based signed-word index + remainder",
  canonical,
  topRotations: ranked.slice(0, 10).map(({ shift, hits, validTargets }) => ({ shift, hits, validTargets })),
  distribution
}, null, 2));
