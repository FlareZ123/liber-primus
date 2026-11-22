"use strict";

/**
 * Historical 2014 256-byte onion-source receiver gate for original LP2 p49–51.
 *
 * Compare source-archived 256-byte onion service snapshots against the entire
 * canonical 32x8 original base60 table, preserving printed row-major byte order.
 * These are bounded source-native comparisons. No tuned phase, byte rotation,
 * secret key, artificial marker, or retrospective source normalization.
 *
 * A zero-parameter stationary lookup S is impossible if the same input
 * byte occurs twice with different target output bytes. Check this exactly,
 * without searching the 256! potential tables.
 *
 * SFT (Windows 11, Node.js >=20): node
 * sims/lp2_p50_historical_onion256_exact_source_sft.cjs
 *
 * Read-only, repeatable, no third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const original = read("resources/liber-primus/base60-grid.json");
const archive = read("resources/cicada-hiddenservice-256-candidates.json");
const cells = original.rows.flat();
assert.equal(original.rows.length, 32);
assert(original.rows.every(row => row.length === 8));
assert.equal(cells.length, 256);
const bytes = cells.map(token => {
  assert.equal(token.length, 2);
  const a = original.alphabet.indexOf(token[0]);
  const b = original.alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0, "authentic two-character token");
  const value = 60 * a + b;
  assert(value >= 0 && value <= 255, "original table is exactly byte-valued");
  return value;
});
assert.equal(new Set(bytes).size, 161);
assert.equal(archive.sourceServices.length, 3);

/**
 * Longest exact consecutive byte overlap, allowing natural substring offsets.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {{length:number, aOffset:number, bOffset:number}}
 */
function longestOverlap(a, b) {
  let best = {length: 0, aOffset: 0, bOffset: 0};
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let n = 0;
      while (i + n < a.length && j + n < b.length &&
             a[i + n] === b[j + n]) n++;
      if (n > best.length) best = {length: n, aOffset: i, bOffset: j};
    }
  }
  return best;
}

/**
 * Find contradictions to *any* fixed one-byte lookup S(x) = y.
 * One conflicting repeated input is enough to reject the whole family.
 * @param {number[]} input
 * @param {number[]} target
 * @returns {{distinct:number, repeats:number, contradictory:number}}
 */
function stationaryConflicts(input, target) {
  const lookup = new Map();
  let repeats = 0;
  let contradictory = 0;
  input.forEach((byte, i) => {
    if (lookup.has(byte)) {
      repeats++;
      if (lookup.get(byte) !== target[i]) contradictory++;
    } else {
      lookup.set(byte, target[i]);
    }
  });
  return {distinct: lookup.size, repeats, contradictory};
}

/** @param {number[]} a @param {number[]} b */
function multisetOverlap(a, b) {
  const first = new Uint16Array(256);
  const second = new Uint16Array(256);
  a.forEach(x => first[x]++);
  b.forEach(x => second[x]++);
  return Array.from(first, (n, i) => Math.min(n, second[i]))
    .reduce((sum, n) => sum + n, 0);
}

const expected = {
  onion2: {matches: 1, printableXor: 97, distinct: 158,
    repeats: 98, contradictory: 98, maxRun: 1, multiset: 125},
  onion3: {matches: 1, printableXor: 99, distinct: 157,
    repeats: 99, contradictory: 99, maxRun: 2, multiset: 115},
  onion4: {matches: 3, printableXor: 82, distinct: 172,
    repeats: 84, contradictory: 84, maxRun: 2, multiset: 122}
};
for (const item of archive.sourceServices) {
  assert(/^[0-9a-f]{512}$/i.test(item.hex), "original snapshot is 256 source bytes");
  const source = item.hex.match(/../g).map(hex => parseInt(hex, 16));
  const matches = bytes.reduce((sum, value, i) => sum + Number(value === source[i]), 0);
  const printableXor = bytes.reduce((sum, value, i) =>
    sum + Number((value ^ source[i]) >= 32 && (value ^ source[i]) <= 126), 0);
  const lookup = stationaryConflicts(source, bytes);
  const maxRun = longestOverlap(bytes, source).length;
  const multiset = multisetOverlap(bytes, source);
  const actual = {matches, printableXor, ...lookup, maxRun, multiset};
  assert.deepEqual(actual, expected[item.id], item.id + ": exact source-only gate");
  assert(lookup.contradictory > 0, "all stateless byte substitutions excluded");
  assert(maxRun < 3, "no exact three-byte source substring");
  console.log(item.id + ": " + JSON.stringify(actual));
}
console.log("PASS: no 2014 onion2/3/4 snapshot is a direct, XOR-readable, "
  + "stationary-lookup, byte-transposed, or >=3-byte substrand source of "
  + "the original p49–51 row-major table.");
