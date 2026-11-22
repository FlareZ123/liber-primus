"use strict";

/**
 * Exact all-secret GF(2) obstruction for source-motivated p50 table to known
 * p56/p57 native-GP plaintext. Windows Node.js 22; CommonJS, zero dependencies.
 *
 * Reads the original p49–p51 256 numeric cells and canonical p56/p57 corpus.
 * Each candidate applies an arbitrary stationary binary-linear output map to
 * a fixed W-byte input window, followed by an arbitrarily secret injective
 * GP-symbol label assignment. It is impossible if the dimension of all
 * class-constant outputs supports fewer than 23 distinct labels.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");

function firstPrimes(count) {
  /** @type {number[]} */
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let factor = 2; factor * factor <= n; factor++) {
      if (n % factor === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}
const mod29 = value => ((value % 29) + 29) % 29;
const p56 = corpus.pages.find(page => page.page === 56).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
const primes = firstPrimes(84);
let keyClock = 0;
const solved56 = p56.map((cipher, index) => {
  if (index === 56) {
    assert.equal(cipher, 0);
    return 0;
  }
  const key = primes[keyClock++] - 1;
  const plaintext = mod29(cipher - key);
  assert.equal(mod29(plaintext + key), cipher);
  return plaintext;
});
assert.equal(keyClock, 84);
assert.deepEqual(solved56.slice(0, 5), [24, 9, 18, 9, 23]);
const known = solved56.concat(p57);
const classCount = new Set(known).size;
assert.equal(known.length, 180);
assert.equal(classCount, 23);

const tokens = grid.pages.flatMap(page => page.tokens);
const base60 = grid.bytes;
const compact = grid.alphabet.replace("f", "");
const base59 = tokens.map(token => 59 * compact.indexOf(token[0]) + compact.indexOf(token[1]));
assert.equal(tokens.length, 256);
assert.equal(base60.length, 256);
const terminal = Array.from({ length: 180 }, (_, index) => 76 + index);
const interior = Array.from({ length: 256 }, (_, index) => index)
  .filter(index => {
    const row = Math.floor(index / 8);
    const column = index % 8;
    return row > 0 && row < 31 && column > 0 && column < 7;
  });
assert.equal(interior.length, 180);

/**
 * @param {bigint[]} vectors
 * @returns {number} GF(2) row-space rank
 */
function gf2Rank(vectors) {
  /** @type {Map<number, bigint>} */
  const pivot = new Map();
  for (let value of vectors) {
    while (value !== 0n) {
      const bit = value.toString(2).length - 1;
      const leading = pivot.get(bit);
      if (leading === undefined) {
        pivot.set(bit, value);
        break;
      }
      value ^= leading;
    }
  }
  return pivot.size;
}

/**
 * Equality of plaintext GP symbols forces an arbitrary stationary affine
 * binary output map to annihilate the XOR difference between corresponding
 * source input bit vectors. Its bias cancels in these differences.
 * @param {bigint[]} windows
 * @param {number[]} plaintext
 * @returns {number}
 */
function equalityDifferenceRank(windows, plaintext) {
  assert.equal(windows.length, plaintext.length);
  /** @type {Map<number, bigint>} */
  const first = new Map();
  /** @type {bigint[]} */
  const differences = [];
  plaintext.forEach((symbol, index) => {
    const value = windows[index];
    const reference = first.get(symbol);
    if (reference === undefined) first.set(symbol, value);
    else differences.push(value ^ reference);
  });
  return gf2Rank(differences);
}

/**
 * Circular byte lookback; each output uses the W bytes starting at its
 * source-addressed table cell, in decreasing table-index order.
 * @param {number[]} bytes
 * @param {number[]} addresses
 * @param {number} width
 * @returns {bigint[]}
 */
function firWindows(bytes, addresses, width) {
  return addresses.map(address => {
    let value = 0n;
    for (let delta = 0; delta < width; delta++) {
      value = (value << 8n) | BigInt(bytes[(address - delta + 256) % 256]);
    }
    return value;
  });
}

/**
 * Physical 3x3 neighborhood surrounding each interior grid cell.
 * @param {number[]} bytes
 * @param {number[]} addresses
 * @returns {bigint[]}
 */
function spatialWindows(bytes, addresses) {
  return addresses.map(address => {
    const row = Math.floor(address / 8);
    const column = address % 8;
    let value = 0n;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        value = (value << 8n) | BigInt(bytes[(row + dr) * 8 + column + dc]);
      }
    }
    return value;
  });
}

const rotl8 = value => ((value << 3) | (value >>> 5)) & 255;
const rotr8 = value => ((value >>> 3) | (value << 5)) & 255;
const plantEncode = value => rotl8(value) ^ 0xa5;
const plantDecode = value => rotr8(value ^ 0xa5);
const plantedLinear = Array.from({ length: 256 }, (_, index) => (37 * index + 19) & 255);
for (let index = 0; index < known.length; index++) {
  plantedLinear[terminal[index]] = plantEncode(known[index]);
}
assert.deepEqual(terminal.map(index => plantDecode(plantedLinear[index])), known);
assert.equal(equalityDifferenceRank(firWindows(plantedLinear, terminal, 1), known), 0);

const plantedSpatial = Array.from({ length: 256 }, (_, index) => (37 * index + 19) & 255);
for (let index = 0; index < known.length; index++) {
  plantedSpatial[interior[index]] = plantEncode(known[index]);
}
assert.deepEqual(interior.map(index => plantDecode(plantedSpatial[index])), known);
const plantSpatialRank = equalityDifferenceRank(spatialWindows(plantedSpatial, interior), known);
assert(plantSpatialRank <= 64, "the secret center-byte operator must be feasible");

let families = 0;
for (const [radix, values] of [["base60", base60], ["base59", base59]]) {
  for (const [direction, bytes] of [["forward", values], ["reversed", values.slice().reverse()]]) {
    for (const [mapping, addresses] of [["terminal76+180", terminal], ["rectangle-interior180", interior]]) {
      /** @type {number[]} */
      const ranks = [];
      for (let width = 1; width <= 20; width++) {
        const observed = equalityDifferenceRank(firWindows(bytes, addresses, width), known);
        const free = 8 * width - observed;
        const maxClasses = 2 ** free;
        assert(maxClasses < classCount, "unexpected feasible rank: " +
          [radix, direction, mapping, width, free].join("/"));
        ranks.push(observed);
      }
      for (let width = 1; width <= 19; width++) {
        assert.equal(ranks[width - 1], 8 * width, "window rank mismatch");
      }
      const finalRank = ranks[19];
      assert([156, 157].includes(finalRank));
      const spatialRank = mapping === "rectangle-interior180"
        ? equalityDifferenceRank(spatialWindows(bytes, addresses), known)
        : null;
      if (spatialRank !== null) assert.equal(spatialRank, 72);
      families++;
      console.log(JSON.stringify({
        radix, direction, mapping, sourceBytes: bytes.length, knownSymbols: classCount,
        testedWidth: [1, 20], rankAt19: ranks[18], rankAt20: finalRank,
        availableBitsAt20: 160 - finalRank, maximumDistinctSymbolsAt20: 2 ** (160 - finalRank),
        spatial3x3Rank: spatialRank, verdict: "EXCLUDED",
      }));
    }
  }
}
assert.equal(families, 8);

/* An independent 180-byte serialization: omit the 76 circumference cells
 * before advancing the FIR clock instead of looking back in all 256 bytes. */
let compactFamilies = 0;
for (const [radix, original] of [["base60", base60], ["base59", base59]]) {
  const ribbon = interior.map(index => original[index]);
  for (const [direction, bytes] of [["forward", ribbon], ["reversed", ribbon.slice().reverse()]]) {
    /** @type {number[]} */
    const ranks = [];
    for (let width = 1; width <= 20; width++) {
      const windows = Array.from({ length: 180 }, (_, index) => {
        let value = 0n;
        for (let delta = 0; delta < width; delta++) {
          value = (value << 8n) | BigInt(bytes[(index - delta + 180) % 180]);
        }
        return value;
      });
      const observed = equalityDifferenceRank(windows, known);
      assert(2 ** (8 * width - observed) < classCount);
      ranks.push(observed);
    }
    for (let width = 1; width <= 19; width++) assert.equal(ranks[width - 1], 8 * width);
    assert.equal(ranks[19], 157);
    compactFamilies++;
    console.log(JSON.stringify({
      radix, direction, mapping: "serialized-interior180",
      rankAt19: ranks[18], rankAt20: ranks[19],
      verdict: "EXCLUDED"
    }));
  }
}
assert.equal(compactFamilies, 4);
console.log("PASS: exact source excludes 12×20 secret local GF2 filters, four 3x3 raster filters; 180-rune positive plants pass.");
