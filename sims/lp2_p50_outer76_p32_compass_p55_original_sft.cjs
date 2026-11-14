"use strict";
/**
 * Original-LP2 outer-ring 76 -> p32 11x11 compass -> p55 GP29 key gate.
 *
 * Source inputs are read-only. No fitted offsets, keys, start cells, or
 * source-page permutations. Node.js 22 single-file runnable test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
const readJSON = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const table = readJSON("resources/liber-primus/lp2-grid-256.json");
const p32 = corpus.pages[32].indices;
const p55 = corpus.pages[55].indices;
const solvedParable = corpus.pages[57].indices;

assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
assert.equal(solvedParable.length, 95);
assert.equal(table.bytes.length, 256);
assert.deepEqual(table.pages.map(x => x.page), [49, 50, 51]);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(table.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
assert.equal(corpus.pages.filter(x => x.page <= 55)
  .reduce((n, x) => n + x.indices.length, 0), 12956);
assert.equal(p32.slice(33, 38).map(x => corpus.translit[x]).join(""), "HOMEX");

const compass = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
/** @param {number} x @param {number} m */
const mod = (x, m) => ((x % m) + m) % m;

/** The clockwise 32x8 circumference, beginning at source top-left. */
function originalPerimeter() {
  /** @type {number[]} */
  const addresses = [];
  for (let c = 0; c < 8; c++) addresses.push(c);
  for (let r = 1; r < 32; r++) addresses.push(8 * r + 7);
  for (let c = 6; c >= 0; c--) addresses.push(31 * 8 + c);
  for (let r = 30; r >= 1; r--) addresses.push(8 * r);
  assert.equal(addresses.length, 76);
  assert.equal(new Set(addresses).size, 76);
  return addresses;
}

/**
 * The signed-2016 "numbers are direction" question, interpreted with the
 * previously documented N/NE/E/SE/S/SW/W/NW byte-low-three-bit compass,
 * byte-high-five-bit distance and toroidal p32 11x11 map.
 * @param {number[]} bytes
 */
function walk(bytes) {
  let row = 3, col = 0;
  /** @type {number[]} */
  const visited = [];
  for (const b of bytes) {
    assert(Number.isInteger(b) && b >= 0 && b <= 255);
    const [dr, dc] = compass[b & 7], distance = b >> 3;
    row = mod(row + dr * distance, 11);
    col = mod(col + dc * distance, 11);
    visited.push(row * 11 + col);
  }
  return {visited, row, col};
}

/**
 * Test all possible F-transparent plaintext clock paths without fitting a
 * key. Historically solved p56 emits literal plaintext F (GP index zero)
 * as ciphertext F without consuming a key.
 * @param {number[]} cipher
 * @param {number[]} key
 */
function transparentFStates(cipher, key) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const clock of states) {
      if (cipher[i] === 0) next.add(clock);
      if (clock < key.length && mod(cipher[i] - key[clock], 29) !== 0) {
        next.add(clock + 1);
      }
    }
    if (!next.size) return {legal: false, firstImpossibleOffset: i,
      reachableBefore: [...states]};
    states = next;
  }
  return {legal: true, terminalClocks: [...states]};
}

/**
 * Encryption control using the exact same F-transparent rule.
 * @param {number[]} plaintext
 * @param {number[]} key
 */
function encryptNative(plaintext, key) {
  let clock = 0;
  const cipher = [];
  for (const p of plaintext) {
    if (p === 0) cipher.push(0);
    else {
      assert(clock < key.length);
      cipher.push(mod(p + key[clock], 29));
      clock++;
    }
  }
  return {cipher, clock};
}

/** @param {number[]} indices */
const tokens = indices => indices.map(x => corpus.translit[x]).join(" ");
/** @param {number[]} indices */
function ioc(indices) {
  const freq = Array(29).fill(0);
  for (const v of indices) freq[v]++;
  return freq.reduce((n, v) => n + v * (v - 1), 0) /
    (indices.length * (indices.length - 1));
}

const addresses = originalPerimeter();
const walkResult = walk(addresses.map(i => table.bytes[i]));
const key = walkResult.visited.map(i => p32[i]);
assert.deepEqual([walkResult.row, walkResult.col], [5, 6]);
assert.equal(walkResult.visited.at(-1), 61);
assert.equal(corpus.translit[p32[61]], "X");

const original = transparentFStates(p55, key);
assert.equal(original.legal, false);
assert.deepEqual(original.reachableBefore, [4]);
assert.equal(original.firstImpossibleOffset, 4);
assert.deepEqual(p55.slice(0, 5).map(i => corpus.translit[i]),
  ["NG", "AE", "M", "I", "W"]);
assert.deepEqual(key.slice(0, 5).map(i => corpus.translit[i]),
  ["IA", "C", "TH", "TH", "W"]);
assert.equal(p55[4], key[4]);
assert.equal(p55[4], 7);

// A genuine GP-native positive plant, independent of original unknown p55,
// proves the decoder admits ciphertext generated by the specified law.
const planted = encryptNative(solvedParable.slice(0, 76), key);
const control = transparentFStates(planted.cipher, key);
assert.equal(control.legal, true);
assert.ok(control.terminalClocks.includes(planted.clock));

const direct = p55.map((v, i) => mod(v - key[i], 29));
assert.deepEqual(direct.slice(0, 10).map(i => corpus.translit[i]),
  ["D", "L", "B", "H", "F", "IA", "A", "NG", "EO", "IA"]);
assert.ok(Math.abs(ioc(direct) - 0.03263157894736842) < 1e-14);

console.log(JSON.stringify({
  sourcePages: {map: 32, numeric: [49, 50, 51], target: 55, solvedPlant: 57},
  ringCells: addresses.length, keyLength: key.length,
  originCell: 33, compassEndpoint: walkResult.visited.at(-1),
  destinationRune: corpus.translit[p32[walkResult.visited.at(-1)]],
  targetCipherPrefix: tokens(p55.slice(0, 10)),
  sourceKeyPrefix: tokens(key.slice(0, 10)),
  originalFtransparent: original,
  firstObstruction: {
    offset: 4, ciphertext: "W", currentKey: "W",
    attemptedPlaintextIndex: mod(p55[4] - key[4], 29),
    reason: "The known plaintext-F bypass would require ciphertext F"
  },
  solvedParablePlant: {length: planted.cipher.length,
    consumedKey: planted.clock, legal: control.legal},
  naiveDirect: {ioc: ioc(direct), prefix: tokens(direct.slice(0, 30))},
  interpretation: "Exact candidate excluded; no plaintext, key, or destination"
}, null, 2));
