"use strict";

/**
 * Original LP2 zero-bracket/PARABLE known-plaintext XOR inverse.
 * Run as a read-only Windows Node.js 22 single-file test from repository root.
 * All original data are loaded from the canonical immutable-source resources.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}
const gp = readJson("resources/liber-primus/lp2-corpus.json");
const table = readJson("resources/liber-primus/lp2-grid-256.json").bytes;
const pages = new Map(gp.pages.map(p => [p.page, p.indices]));
const p55 = pages.get(55);
const c56 = pages.get(56);
const p57 = pages.get(57);
assert.deepEqual([p55.length, c56.length, p57.length], [76, 85, 95]);
assert.equal(table.length, 256);
assert.deepEqual(table.flatMap((v, i) => v === 0 ? [i] : []), [192, 229]);
// The source's original zero-based numeric-table image is LP2 page 50.jpg.
// The 50th ordinary prime independently indexes the second zero cell.
let ordinal = 0, prime50 = 0;
for (let n = 2; ordinal < 50; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) prime = false;
  if (prime) { ordinal++; prime50 = n; }
}
assert.equal(prime50, 229);
assert.equal(table[prime50], 0);

/** @param {number[]} a */
const sum = a => a.reduce((acc, v) => acc + v, 0);
/** @param {number[]} a */
const xor = a => a.reduce((acc, v) => acc ^ v, 0);
/** @param {number} n */
const mod29 = n => ((n % 29) + 29) % 29;
/** @param {number} i */
const phase = i => ((i - 193) % 36 + 36) % 36;
/** @param {number} n */
function isPrime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n >= 2;
}

/** Recreate authentic solved-page prime-totient, plaintext-F-transparent inverse. */
function solvedPage56() {
  const prime = [];
  for (let n = 2; prime.length < c56.length; n++) if (isPrime(n)) prime.push(n);
  let k = 0;
  return c56.map((v, i) => i === 56 ? 0 : mod29(v - (prime[k++] - 1)));
}
const plain56 = solvedPage56();
assert.deepEqual(plain56.slice(0, 5), [24, 9, 18, 9, 23]);

const heading = p57.slice(0, 7).map(v => gp.prime[v]);
const body = p57.slice(7).map(v => gp.prime[v]);
const headingSum = sum(heading), bodySum = sum(body);
assert.deepEqual([headingSum, bodySum, headingSum + bodySum], [449, 3519, 3968]);
assert.equal((headingSum + bodySum) / 31, 128);
assert.deepEqual([headingSum % 256, bodySum % 256], [193, 191]);
assert.equal(table[192], 0);
assert.deepEqual([table[191], table[193], table[228], table[230]], [33, 155, 144, 117]);
assert.equal(table[191] ^ table[193], 186);
assert.equal(sum(p57.slice(39, 43).map(v => gp.prime[v])), 186); // "MUST"
assert.equal(table[228] ^ table[230], 229);

const enclosed = table.slice(193, 229);
const clearSpan = p57.slice(32, 68);
assert.equal(enclosed.length, 36);
assert.equal(clearSpan.length, 36);
assert.equal(xor(enclosed), 95);
assert.equal(gp.translit[p57[31]], "U"); // SURFACE, before the enclosed span
assert.equal(gp.translit[p57[68]], "I"); // FIND, after the enclosed span
assert.equal(clearSpan.map(v => gp.translit[v]).join(""),
  "RFACEWEMUSTSHEDOUROWNCIRCUMFERENCESF");

const known = plain56.concat(p57);
assert.equal(known.length, 180);

/**
 * Recover a 36-byte candidate XOR pad from the fully known p57 interval.
 * Exactly 144 other actual known runes are reserved for evaluation.
 * @param {"index"|"prime"} encoding
 * @param {number[]} ciphertext
 * @param {number[]} reference
 */
function invert(encoding, ciphertext, reference) {
  /** @param {number} v */
  const encode = v => encoding === "index" ? v : gp.prime[v];
  const pad = Array.from({length: 36},
    (_, j) => ciphertext[193 + j] ^ encode(reference[193 + j]));
  const decoded = ciphertext.map((v, i) => v ^ pad[phase(i)]);
  const legalSet = new Set(encoding === "index" ?
    gp.runes.map((_, i) => i) : gp.prime);
  const knownHoldout = [];
  for (let i = 76; i < 256; i++) {
    if (i >= 193 && i < 229) continue;
    knownHoldout.push(i);
  }
  assert.equal(knownHoldout.length, 144);
  const first76 = decoded.slice(0, 76);
  return {
    pad,
    decoded,
    exact: knownHoldout.filter(i => decoded[i] === encode(reference[i])).length,
    validKnown: knownHoldout.filter(i => legalSet.has(decoded[i])).length,
    validFirst76: first76.filter(v => legalSet.has(v)).length,
    trained: Array.from({length: 36}, (_, j) => 193 + j)
      .every(i => decoded[i] === encode(reference[i]))
  };
}
const reference = p55.concat(known);
assert.equal(reference.length, 256);
const actual = {};
for (const encoding of ["index", "prime"]) {
  const result = invert(encoding, table, reference);
  actual[encoding] = {
    known_training: 36,
    heldout: 144,
    exact: result.exact,
    validKnown: result.validKnown,
    validFirst76: result.validFirst76,
    padXor: xor(result.pad)
  };
  assert.equal(result.trained, true);
  assert.equal(result.exact, 1);
  assert.deepEqual([result.validKnown, result.validFirst76],
    encoding === "index" ? [11, 9] : [14, 6]);

  // Independent solved-source terminal plant, with unknown p55 replaced by
  // a length76 excerpt of already clear p57. Its true secret is withheld.
  const plantPlain = p57.slice(0, 76).concat(known);
  const encode = v => encoding === "index" ? v : gp.prime[v];
  const secret = Array.from({length: 36},
    (_, i) => (13 + 37 * i + i * i) % 256);
  const plantTable = plantPlain.map((v, i) => encode(v) ^ secret[phase(i)]);
  const planted = invert(encoding, plantTable, plantPlain);
  assert.equal(planted.exact, 144);
  assert.equal(planted.validKnown, 144);
  assert.equal(planted.validFirst76, 76);
  assert.deepEqual(planted.pad, secret);
  assert.deepEqual(planted.decoded, plantPlain.map(encode));
}
assert.deepEqual([xor(clearSpan), xor(enclosed)], [19, 95]);
assert.equal(xor(enclosed) ^ xor(clearSpan), p55.length);

console.log(JSON.stringify({
  status: "PASS", source: "original LP2 table and terminal source pages",
  zeroCells: [192, 229], primeOfTablePage50: prime50,
  clearAddressPair: [193, 191],
  gapBytes: 36, gapByteXor: 95, parableRunes: p57.length,
  neighboringByteXors: [186, 229],
  clear36GpOrdinalXor: 19, masked36GpOrdinalXor: 76,
  directPeriodicXorGate: actual,
  control: "Both 256/256 original-sized planted terminals recovered"
}, null, 2));
