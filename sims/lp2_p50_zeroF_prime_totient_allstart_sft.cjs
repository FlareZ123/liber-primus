"use strict";

/**
 * Director #1422 source-exact composite gate.
 * Fixed zero->F p50 surface inverse, then exact solved-p56 prime/totient
 * F-transparent inverse over starts 0..463 and both signs in each visual chapter.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));

const tokens = grid.pages.flatMap(page => page.tokens);
const bytes = grid.bytes;
const pages = corpus.pages.filter(page => page.page <= 55 && page.indices.length);
const original = pages.flatMap(page => page.indices);
assert.equal(original.length, 12956);

const special = [0, 2, 12, 21, 22, 25, 27, 28];

/** @param {number} v @param {number} a @param {number} b @returns {number} */
function swap(v, a, b) {
  if (a === b) return v;
  if (v === a) return b;
  if (v === b) return a;
  return v;
}

/** @param {number} control @returns {number} */
function surfaceMarker(control) {
  return tokens[control][0] === "0" ? 0 : special[bytes[control] & 7];
}

/** @param {number[]} plain @returns {number[]} */
function surfaceEncrypt(plain) {
  const out = new Array(plain.length);
  out[0] = plain[0];
  for (let i = 1; i < plain.length; i++) {
    out[i] = swap(plain[i], out[i - 1], surfaceMarker((i - 1) & 255));
  }
  return out;
}

/** @param {number[]} cipher @returns {number[]} */
function surfaceDecrypt(cipher) {
  const out = new Array(cipher.length);
  out[0] = cipher[0];
  for (let i = 1; i < cipher.length; i++) {
    out[i] = swap(cipher[i], cipher[i - 1], surfaceMarker((i - 1) & 255));
  }
  return out;
}

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primes = firstPrimes(6000);
const key = primes.map(p => mod(p - 1));
assert.equal(primes[463], 3301);

/**
 * Historical solved-p56 forward rule.
 * @param {number[]} plain
 * @param {number} start
 * @param {-1|1} sign
 * @returns {{cipher:number[],end:number,skips:number}}
 */
function primeEncrypt(plain, start, sign) {
  const cipher = [];
  let j = start;
  let skips = 0;
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
      skips++;
    } else {
      cipher.push(mod(p + sign * key[j]));
      j++;
    }
  }
  return { cipher, end: j, skips };
}

/**
 * Complete all-start, all-displayed-F-branch feasibility.
 * @param {number[]} cipher
 * @param {-1|1} sign
 * @returns {{firstEmpty:number,count:number,last:Uint8Array}}
 */
function reachable(cipher, sign) {
  let current = new Uint8Array(6000);
  current.fill(1, 0, 464);

  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const next = new Uint8Array(6000);
    for (let j = 0; j < 464 + i; j++) {
      if (!current[j]) continue;
      if (c === 0) next[j] = 1;
      if (mod(c - sign * key[j]) !== 0) next[j + 1] = 1;
    }
    current = next;
    const count = current.reduce((sum, value) => sum + value, 0);
    if (count === 0) return { firstEmpty: i, count, last: current };
  }
  return {
    firstEmpty: -1,
    count: current.reduce((sum, value) => sum + value, 0),
    last: current
  };
}

const defs = [
  [0, 3], [3, 8], [8, 15], [15, 23], [23, 27],
  [27, 33], [33, 40], [40, 54], [54, 56]
];
const expected = [
  [729, 362, 331], [1145, 378, 391], [1729, 185, 263],
  [1903, 380, 201], [1021, 282, 428], [1433, 531, 492],
  [1680, 306, 333], [3008, 300, 251], [308, 271, 244]
];
const offsets = new Map();
let global = 0;
for (const page of pages) {
  offsets.set(page.page, global);
  global += page.indices.length;
}
assert.equal(global, original.length);

/** @param {number[]} stream @param {number} a @param {number} b @returns {number[]} */
function chapter(stream, a, b) {
  const start = offsets.get(a);
  const end = b <= 55 ? offsets.get(b) : stream.length;
  return stream.slice(start, end);
}

const intermediate = surfaceDecrypt(original);
assert.deepEqual(surfaceEncrypt(intermediate), original);
assert.equal(intermediate.reduce(
  (sum, value, index) => sum + Number(value !== original[index]), 0), 549);

const observed = [];
for (let index = 0; index < defs.length; index++) {
  const a = defs[index][0];
  const b = defs[index][1];
  const cipher = chapter(intermediate, a, b);
  assert.equal(cipher.length, expected[index][0]);
  for (const sign of /** @type {const} */ ([-1, 1])) {
    const result = reachable(cipher, sign);
    const predicted = sign === -1 ? expected[index][1] : expected[index][2];
    assert.equal(result.firstEmpty, predicted);
    assert.equal(result.count, 0);
    observed.push({
      pages: String(a) + "-" + String(b - 1),
      runes: cipher.length,
      sign,
      firstImpossibleZeroBased: result.firstEmpty
    });
  }
}

const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
const innerPlant = [];
const metadata = [];
for (let index = 0; index < defs.length; index++) {
  const length = expected[index][0];
  const plain = Array.from({ length }, (_, i) => p57[i % p57.length]);
  const start = (index * 37) % 464;
  const sign = index % 2 === 0 ? 1 : -1;
  const encrypted = primeEncrypt(plain, start, sign);
  innerPlant.push(...encrypted.cipher);
  metadata.push({ length, start, sign, end: encrypted.end, skips: encrypted.skips });
}
assert.equal(innerPlant.length, original.length);
const outerPlant = surfaceEncrypt(innerPlant);
const recoveredInner = surfaceDecrypt(outerPlant);
assert.deepEqual(recoveredInner, innerPlant);

let plantOffset = 0;
for (const meta of metadata) {
  const cipher = recoveredInner.slice(plantOffset, plantOffset + meta.length);
  plantOffset += meta.length;
  const result = reachable(cipher, meta.sign);
  assert.equal(result.firstEmpty, -1);
  assert.ok(result.count > 0);
  assert.equal(result.last[meta.end], 1);
}
assert.equal(plantOffset, original.length);

console.log(JSON.stringify({
  model: "fixed zero-F p50 surface inverse + exact solved-p56 prime/totient all-start true-F automaton",
  sourceBoundedStarts: "0..463",
  sourceBoundPrime: primes[463],
  original: observed,
  positive: {
    runes: outerPlant.length,
    exactSurfaceRecovery: true,
    allNineTruePrimePathsRetained: true,
    metadata
  },
  decision: "FAIL composite exactly: all 18 chapter/sign automata become impossible"
}, null, 2));
