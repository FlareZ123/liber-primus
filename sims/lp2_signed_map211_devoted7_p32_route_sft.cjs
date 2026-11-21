"use strict";
/**
 * Source-selected MAP→p32 graph entry, with one fixed 7-step word-length
 * selector and a complete source-word competition census.
 *
 * This records authentic table navigation. It does not decrypt LP2.
 * Run on Windows 11 / Node 22:
 *   node sims/lp2_signed_map211_devoted7_p32_route_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert(table.every(value => Number.isInteger(value) && value >= 0 && value < 256));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const words = signed.slice(signed.indexOf("Hello."), signed.indexOf("7A35090F."))
  .match(/[A-Za-z]+/gu).map(value => value.toUpperCase());
assert.equal(words.length, 43);
assert.equal(words[5], "EPIPHANY");
assert.equal(words[8], "DEVOTED");
assert.equal(words[18], "MAP");

const gpTokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/**
 * Read native Gematria Primus rune indices with the published 29-symbol
 * alphabet and its QU/V/K/Q/Z/ING/IO orthographic conventions.
 * @param {string} text
 * @returns {number[]}
 */
function gp(text) {
  const native = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S")
    .replace(/ING/g, "NG").replace(/IO/g, "IA");
  const out = [];
  for (let offset = 0; offset < native.length;) {
    const candidate = gpTokens.find(item => native.startsWith(item.token, offset));
    assert.ok(candidate, `Unencodable GP text: ${native.slice(offset)}`);
    out.push(candidate.index);
    offset += candidate.token.length;
  }
  return out;
}
const gp0 = word => gp(word).reduce((sum, rune) => sum + rune, 0);
const gpPrime = word => gp(word).reduce((sum, rune) => sum + corpus.prime[rune], 0);

/** @param {number} start @param {number} depth @returns {number[]} */
function pointerPath(start, depth) {
  assert(start >= 0 && start < 256);
  const route = [start];
  for (let i = 0; i < depth; i++) route.push(table[route[route.length - 1]]);
  return route;
}
const seed = gpPrime("MAP"), depth = gp("DEVOTED").length;
const route = pointerPath(seed, depth + 1);
assert.equal(seed, 211);
assert.equal(depth, 7);
assert.deepEqual(route, [211,61,196,176,235,121,237,32,115]);
assert.equal(route[5], gp0("EPIPHANY"));
assert.equal(route[7], 32);
assert.equal(route[8], table[32]);
assert.equal(corpus.pages[32].indices.length, gp0("EPIPHANY"));
assert.equal(gp0("THE"), 20);
assert.equal(gp0("CIRCUMFERENCES"), 131);

// Traverse the selected p50 reverse tree from the next-pointer node 115,
// discarding all 11-cycle links. A depth-20 nonroot cut has exactly 121
// cells, and the entire rooted component has 131 cells including root.
const cycle = new Set([0,203,68,199,47,76,114,197,115,247,192]);
const reverse = Array.from({length: 256}, () => []);
table.forEach((target, source) => reverse[target].push(source);
/** @param {number} maxDepth */
function treeCount(maxDepth) {
  const seen = new Set([115]), queue = [{node:115,depth:0}];
  for (let i=0; i<queue.length; i++) {
    const {node,depth} = queue[i];
    if (depth >= maxDepth) continue;
    for (const child of reverse[node]) {
      if (cycle.has(child) || seen.has(child)) continue;
      seen.add(child);
      queue.push({node:child,depth:depth+1});
    }
  }
  return seen.size;
}
assert.equal(treeCount(gp0("THE")) - 1, gp0("EPIPHANY"));
assert.equal(treeCount(256), gp0("CIRCUMFERENCES"));

// Complete source-word competition at the exact signed-source DEVOTED=7
// depth: among all 43 signed words, include exactly those whose source GP
// prime weight is a legal original byte-table address.
const eligible = words.map((word,index) => ({word,index,seed:gpPrime(word)}))
  .filter(record => record.seed < 256);
const hits = eligible.filter(record => pointerPath(record.seed, depth)[depth] === 32);
assert.equal(eligible.length,35);
assert.deepEqual(hits, [{word:"MAP",index:18,seed:211}]);

console.log(JSON.stringify({
  status:"PASS",source:"Original 2016 signed words + original p50 base60 byte table",
  selectors:{mapGpPrime:seed,devotedGpRuneLength:depth,
    epiphanyGp0:gp0("EPIPHANY"),theGp0:gp0("THE"),
    circumferencesGp0:gp0("CIRCUMFERENCES")},
  path:route,
  p32Runes:corpus.pages[32].indices.length,
  reverseTree:{depth20Nonroot:treeCount(20)-1,
    fullComponentIncludingRoot:treeCount(256)},
  signedWordCompetition:{count:words.length,eligibleCount:eligible.length,
    exactDepth7ToP32Hits:hits},
  interpretation:"Alternative clue-constrained route to already selected p32; it gives a receiver, not a GP29 ciphertext key or plaintext. Exact path observed post hoc, no design-level authentication."
},null,2));
