"use strict";

/**
 * Complete p57 GP0 -> p50 word-graph matched-multiset control.
 *
 * Frozen upstream hypothesis:
 *   solved p57 word GP0 sum -> zero-based p50 address;
 *   decode the addressed printed token under either documented base59/base60.
 *
 * The test counts, across all distinct p57 GP0 word addresses, how many
 * addressed tokens decode under either radix to any p57 GP0 word sum.
 * It then evaluates the exact without-replacement hypergeometric tail against
 * the original 256-token p50 multiset.
 *
 * Run:
 *   node sims/lp2_p57_wordgraph_multiset_control_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const runeIndex = new Map(
  corpus.runes.map((rune, index) => [rune, index])
);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

function parseRuneWords(text) {
  const out = [];
  let current = [];
  for (const ch of [...text]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(ch)) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= k; i += 1) {
    value *= (n - k + i) / i;
  }
  return value;
}

function hypergeometricProbability(N, K, n, x) {
  return choose(K, x) * choose(N - K, n - x) / choose(N, n);
}

const p57 = solved.sections.find(
  (section) => section.name === "p57_parable"
);
assert.ok(p57);

const rows = parseRuneWords(p57.source_text).map((word, index) => ({
  position: index + 1,
  text: word.map((value) => corpus.translit[value]).join(""),
  gp0: word.reduce((sum, value) => sum + value, 0),
}));
assert.equal(rows.length, 20);

const targetSums = new Set(rows.map((row) => row.gp0));
const addresses = [...targetSums].sort((a, b) => a - b);
assert.deepEqual(
  addresses,
  [8, 19, 20, 25, 38, 42, 51, 53, 56, 64, 67, 78, 83, 94, 105, 120, 131]
);

const capable = tokens.map((token, index) => {
  const base59 = decode(token, alphabet59);
  const base60 = decode(token, alphabet60);
  return {
    index,
    token,
    base59,
    base60,
    hit: targetSums.has(base59) || targetSums.has(base60),
  };
}).filter((row) => row.hit);

const observed = addresses.map((address) => {
  const token = tokens[address];
  const base59 = decode(token, alphabet59);
  const base60 = decode(token, alphabet60);
  return {
    address,
    token,
    base59,
    base60,
    hit: targetSums.has(base59) || targetSums.has(base60),
    target59: rows.filter((row) => row.gp0 === base59)
      .map((row) => row.text),
    target60: rows.filter((row) => row.gp0 === base60)
      .map((row) => row.text),
  };
});

const hits = observed.filter((row) => row.hit);
assert.equal(tokens.length, 256);
assert.equal(addresses.length, 17);
assert.equal(capable.length, 36);
assert.equal(hits.length, 5);

assert.deepEqual(
  hits.map((row) => [row.address, row.token, row.base59, row.base60]),
  [
    [38, "2D", 131, 133],
    [64, "22", 120, 122],
    [94, "0u", 55, 56],
    [120, "0g", 41, 42],
    [131, "20", 118, 120],
  ]
);

const N = 256;
const K = capable.length;
const n = addresses.length;
const x = hits.length;
let tail = 0;
for (let k = x; k <= Math.min(K, n); k += 1) {
  tail += hypergeometricProbability(N, K, n, k);
}
const expected = n * K / N;

assert.ok(Math.abs(expected - 2.390625) < 1e-12);
assert.ok(Math.abs(tail - 0.07211271486670322) < 1e-12);

// Explicit semantic edges in the observed full-family count.
const edgeRows = hits.map((row) => ({
  source: rows.filter((item) => item.gp0 === row.address)
    .map((item) => item.text),
  token: row.token,
  base59Targets: row.target59,
  base60Targets: row.target60,
}));
assert.deepEqual(edgeRows, [
  {
    source: ["WITHIN"],
    token: "2D",
    base59Targets: ["CIRCUMFERENCES"],
    base60Targets: [],
  },
  {
    source: ["SHED"],
    token: "22",
    base59Targets: ["PARABLE"],
    base60Targets: [],
  },
  {
    source: ["TUNNELNG"],
    token: "0u",
    base59Targets: [],
    base60Targets: ["AND"],
  },
  {
    source: ["PARABLE"],
    token: "0g",
    base59Targets: [],
    base60Targets: ["FIND"],
  },
  {
    source: ["CIRCUMFERENCES"],
    token: "20",
    base59Targets: [],
    base60Targets: ["PARABLE"],
  },
]);

console.log(JSON.stringify({
  status: "PASS: complete p57 word-graph matched-multiset control",
  family: {
    p57Words: rows.length,
    distinctGp0Addresses: addresses.length,
    p50Tokens: tokens.length,
    hitCapableTokens: capable.length,
  },
  observed: {
    hits: x,
    expectedHits: expected,
    exactHypergeometricTailAtLeastObserved: tail,
    inverseTail: 1 / tail,
    edges: edgeRows,
  },
  interpretation:
    "Five p57-word-to-p57-word edges are real, including TUNNELNG -> AND, but the full either-radix family has a 0.0721 exact-multiset tail. Specific semantic chains can remain source-useful; their tiny conditional token-placement probabilities are not familywise evidence for the complete word-graph search.",
}, null, 2));
