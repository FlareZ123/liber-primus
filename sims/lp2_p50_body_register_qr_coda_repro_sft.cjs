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
assert.equal(grid.bytes.length, 256);
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
const coda11 = paragraphWords[3].concat(paragraphWords[4], paragraphWords[6].slice(0, 3));
const verify2 = paragraphWords[6].slice(3, 5);
assert.equal(core.length, 29);
assert.equal(coda11.length, 11);
assert.equal(verify2.length, 2);
assert.deepEqual(core.map((w) => w.toLowerCase()), [
  "the","path","lies","empty","epiphany","seeks","the","devoted","liber","primus",
  "is","the","way","its","words","are","the","map","their","meaning","is","the",
  "road","and","their","numbers","are","the","direction"
]);
assert.deepEqual(coda11.map((w) => w.toLowerCase()), [
  "seek","and","you","will","be","found","good","luck","beware","false","paths"
]);
assert.deepEqual(verify2.map((w) => w.toLowerCase()), ["verify","openpgp"]);
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
const H = (xs) => {
  const out = [];
  for (let i = 0; i < Math.floor(xs.length / 2); i++) {
    const x = xs[i], y = xs[xs.length - 1 - i];
    out.push(mod29(x - y), mod29(x + y));
  }
  if (xs.length % 2) out.push(xs[Math.floor(xs.length / 2)]);
  return out;
};
const cycle11 = [115,247,192,0,203,68,199,47,76,114,197];
const cycle2 = [158,249];
assert.deepEqual(cycle11.map((n) => grid.bytes[n]), cycle11.map((_, i) => cycle11[(i + 1) % cycle11.length]));
assert.deepEqual(cycle2.map((n) => grid.bytes[n]), [249,158]);
const nodes = cycle11.concat(cycle2);
const codaWords = coda11.concat(verify2);
const rows = nodes.map((node, i) => {
  const q = Math.floor(node / 29), r = node % 29;
  return {
    cycle: i < 11 ? "11-cycle" : "2-cycle",
    node, q, r, bodyOrdinalQ: q + 1, bodyOrdinalR: r + 1,
    wordQ: core[q], wordR: core[r],
    gp0Q: mod29(gp0(core[q])), gp0R: mod29(gp0(core[r])),
    codaWord: codaWords[i]
  };
});
const vectors = {
  qIndex: rows.map((x) => x.q),
  rIndex: rows.map((x) => x.r),
  qMinusR: rows.map((x) => mod29(x.q - x.r)),
  qPlusR: rows.map((x) => mod29(x.q + x.r)),
  gp0Q: rows.map((x) => x.gp0Q),
  gp0R: rows.map((x) => x.gp0R),
  gp0QMinusR: rows.map((x) => mod29(x.gp0Q - x.gp0R)),
  gp0QPlusR: rows.map((x) => mod29(x.gp0Q + x.gp0R)),
  gp0RMinusQ: rows.map((x) => mod29(x.gp0R - x.gp0Q))
};
const transformed = Object.fromEntries(Object.entries(vectors).map(([k, v]) => ["H(" + k + ")", H(v)]));
const candidates = {...vectors, ...transformed};
const R13 = corpus.pages.find((p) => p.page === 0).indices.slice(0, 13);
assert.deepEqual(R13, [25,28,11,25,4,8,19,8,4,7,13,20,28]);
const K13 = H(R13);
assert.deepEqual(K13, [26,24,8,19,27,24,18,3,0,8,0,16,19]);
const targetHits = Object.entries(candidates).flatMap(([name, values]) => {
  const hits = [];
  if (JSON.stringify(values) === JSON.stringify(R13)) hits.push({name, target:"R13"});
  if (JSON.stringify(values) === JSON.stringify(K13)) hits.push({name, target:"K13"});
  return hits;
});
assert.deepEqual(targetHits, []);
const cycleLookup = new Map();
cycle11.forEach((node, i) => cycleLookup.set(node, {cycle:"11-cycle", cycleIndex:i, codaWord:coda11[i]}));
cycle2.forEach((node, i) => cycleLookup.set(node, {cycle:"2-cycle", cycleIndex:i, codaWord:verify2[i]}));
function orbitToCycle(start) {
  let node = start, steps = 0;
  const seen = new Set();
  while (!cycleLookup.has(node)) {
    assert(!seen.has(node), "unexpected loop before selected cycle");
    seen.add(node);
    node = grid.bytes[node];
    steps++;
  }
  return {start, steps, terminal:node, ...cycleLookup.get(node)};
}
const codaAddresses = codaWords.map((word) => ({word, gp0:gp0(word), ...orbitToCycle(gp0(word))}));
assert(codaAddresses.every((x) => x.cycle === "11-cycle"));
assert.deepEqual(codaAddresses.slice(11).map((x) => x.terminal), [76,114]);
console.log(JSON.stringify({
  source: "2016 clear-signed payload; exact body-only 29-word register",
  nodeOrder: "11-cycle from T[32]=115, then 2-cycle 158->249",
  rows, vectors, transformed, R13, K13, targetHits, codaAddresses,
  conclusion: "The corrected direct q/r and H family does not reproduce the p0 marker/key. GP0-addressing the 13 coda words sends all 13 into the 11-cycle, including Verify/OpenPGP; the 11+2 length match is not an operational cycle selector."
}, null, 2));
