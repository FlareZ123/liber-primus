"use strict";

/**
 * Bounded source-oriented consumer test for the p50 2+11 functional-graph
 * word pairs against the p0 13-atom marker/key.
 *
 * Run from the repository root:
 *   node sims/lp2_p50_cycle_wordpair_p0_key_consumer_sft.cjs
 *
 * Tests only direct GP29 index/GP0 pair reductions and the already fixed
 * outside-in H transform. It does not search permutations or fit a cipher.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

const sum = (values) => values.reduce((total, value) => total + value, 0);
const mod29 = (value) => ((value % 29) + 29) % 29;

/** Fixed p0 outside-in H: emit (x-y, x+y) mod29 for each outer pair. */
function H(values) {
  const out = [];
  for (let i = 0; i < Math.floor(values.length / 2); i += 1) {
    const x = values[i];
    const y = values[values.length - 1 - i];
    out.push(mod29(x - y), mod29(x + y));
  }
  if (values.length % 2) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

assert.equal(grid.bytes.length, 256);
const message = signedWords();
assert.equal(message.length, 43);

const cycle2 = [158, 249];
const cycle11 = [115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197];
assert.deepEqual(cycle2.map((node) => grid.bytes[node]), [249, 158]);
assert.deepEqual(cycle11.map((node) => grid.bytes[node]), [
  247, 192, 0, 203, 68, 199, 47, 76, 114, 197, 115,
]);

// The report's source-oriented order: 2-cycle first, then the 11-cycle
// beginning at the entry reached from GP0("The") = 20.
const nodes = [...cycle2, ...cycle11];
assert.equal(nodes.length, 13);

const rows = nodes.map((node) => {
  const q = Math.floor(node / 29);
  const r = node % 29;
  const qWord = message[q];
  const rWord = message[r];
  return {
    node, q, r, qWord, rWord,
    qGP0: sum(gp(qWord)),
    rGP0: sum(gp(rWord)),
  };
});

const q = rows.map((row) => row.q);
const r = rows.map((row) => row.r);
const qGP0 = rows.map((row) => mod29(row.qGP0));
const rGP0 = rows.map((row) => mod29(row.rGP0));

const vectors = {
  qIndex: q,
  rIndex: r,
  qIndexMinusR: rows.map((row) => mod29(row.q - row.r)),
  qIndexPlusR: rows.map((row) => mod29(row.q + row.r)),
  qGP0: qGP0,
  rGP0: rGP0,
  qGP0MinusR: rows.map((row) => mod29(row.qGP0 - row.rGP0)),
  qGP0PlusR: rows.map((row) => mod29(row.qGP0 + row.rGP0)),
  rGP0MinusQ: rows.map((row) => mod29(row.rGP0 - row.qGP0)),
};

const transformed = Object.fromEntries(
  Object.entries(vectors).map(([name, values]) => ["H(" + name + ")", H(values)]),
);

const K13 = [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19];
const R13 = [25, 28, 11, 25, 4, 8, 19, 8, 4, 7, 13, 20, 28];

// Positive control: the p0 marker serializer's own H transform is reproduced.
assert.deepEqual(H(R13), K13);

const candidates = {...vectors, ...transformed};
const targetHits = [];
for (const [name, values] of Object.entries(candidates)) {
  if (JSON.stringify(values) === JSON.stringify(K13)) targetHits.push({name, target: "K13"});
  if (JSON.stringify(values) === JSON.stringify(R13)) targetHits.push({name, target: "R13"});
}
assert.deepEqual(targetHits, []);

console.log(JSON.stringify({
  cycles: {cycle2, cycle11},
  rows,
  vectors,
  transformed,
  targets: {K13, R13},
  targetHits,
  decision: "No direct pair-index or pair-GP0 sum/difference vector, before or after H, reproduces the p0 K13 key or R13 marker input.",
}, null, 2));
