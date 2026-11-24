// HISTORICAL LEGACY INPUT: image-corrected source has 254 intervals, not 256.
// See im-results/lp2-original-punctuation-256-slot-grid-gate.md.
"use strict";
/**
 * Frozen original-source gate: p50 byte as a zero-based starting prime index
 * for each of 256 original punctuation/page intervals; carry p56's literal F.
 * Node 22 CommonJS, read-only. No key search or output adjustment.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pageText = transcription.split("%");
assert.equal(pageText.length, 57);
const physical = [...pageText.slice(0, 50), "", ...pageText.slice(50, 55)].join("%");
const originalMarks = [...physical].filter(c => ".&$%".includes(c));
const markCounts = Object.fromEntries([".", "&", "$", "%"].map(c =>
  [c, originalMarks.filter(x => x === c).length]));
assert.deepEqual(markCounts, {".": 175, "&": 17, "$": 8, "%": 55});
const groups = physical.split(/[.&$%]/u).map(text => [...text]
  .flatMap(c => runeIndex.has(c) ? [runeIndex.get(c)] : []));
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert.equal(groups.length, 256);
assert.equal(groups.filter(x => x.length === 0).length, 37);
assert.equal(groups.flat().length, 12956);
assert.deepEqual(groups.flat(), corpus.pages.slice(0, 56).flatMap(p => p.indices));
assert.equal(crypto.createHash("sha256").update(Buffer.from(table)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// GP-F is index zero. Under the exact solved-p56 bypass convention, a
// ciphertext zero may be literal F (consume no prime); an active ordinary
// cipher branch is allowed only if its inferred plaintext is nonzero.
// Keeping all live prime cursors gives this unselected model every F path.
/** @returns {number[]} */
function primeList() {
  const list = [];
  for (let n = 2; list.length < 700; n++) {
    let isPrime = true;
    for (const p of list) {
      if (p * p > n) break;
      if (n % p === 0) { isPrime = false; break; }
    }
    if (isPrime) list.push(n);
  }
  return list;
}
const primes = primeList();
/**
 * @param {number[]} ciphertext
 * @param {number} primeBase Zero-based starting index from original grid
 * @returns {{survivors:number, firstImpossible:number}}
 */
function viable(ciphertext, primeBase) {
  let cursors = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const advance of cursors) {
      const key = (primes[primeBase + advance] - 1) % 29;
      const clear = (ciphertext[i] - key + 29) % 29;
      if (clear !== 0) next.add(advance + 1);
      if (ciphertext[i] === 0) next.add(advance);
    }
    if (next.size === 0) return {survivors: 0, firstImpossible: i};
    cursors = next;
  }
  return {survivors: cursors.size, firstImpossible: -1};
}
/**
 * @param {number[]} plaintext GP indices
 * @param {number} primeBase
 * @returns {number[]}
 */
function encrypt(plaintext, primeBase) {
  let index = primeBase;
  return plaintext.map(p => p === 0 ? 0 : (p + primes[index++] - 1) % 29);
}
const original = groups.map((g, i) => ({
  ...viable(g, table[i]), slot: i, runes: g.length, primeStart: table[i]
}));
const nonempty = original.filter(x => x.runes > 0);
const failed = nonempty.filter(x => x.survivors === 0);
const long = nonempty.filter(x => x.runes >= 20);
assert.equal(nonempty.length, 219);
assert.equal(long.length, 169);
assert.equal(failed.length, 128);
assert.equal(long.filter(x => x.survivors === 0).length, 116);
assert.deepEqual(original.slice(0, 3).map(x => [x.runes, x.primeStart, x.firstImpossible]),
  [[13, 203, 4], [141, 231, 17], [108, 167, 8]]);
assert.deepEqual(
  [original[252].runes, original[252].primeStart, original[252].firstImpossible],
  [76, 180, 2]);

// Positive control: an actual solved LP2 plaintext corpus, including F,
// encrypted using each exact table byte and each original punctuation-slot
// length. The exhaustive bypass inverse must retain its authentic key path.
const sourcePlain = corpus.pages[57].indices;
let offset = 0;
const planted = groups.map((g, i) => {
  const plain = Array.from({length: g.length}, () => sourcePlain[offset++ % sourcePlain.length]);
  return viable(encrypt(plain, table[i]), table[i]);
});
assert.ok(planted.every(x => x.survivors > 0));
assert.ok(viable(corpus.pages[56].indices, 0).survivors > 0);
console.log(JSON.stringify({
  originalRunes: 12956, originalIntervals: 256, originalEmptyIntervals: 37,
  originalNonemptyIntervals: nonempty.length,
  originalNonemptyFailed: failed.length, originalLongIntervals: long.length,
  originalLongFailed: long.filter(x => x.survivors === 0).length,
  firstThreeFailures: original.slice(0, 3),
  lastRuneBearingFailure: original[252],
  positiveNativePlantsSurviving: planted.length,
  interpretation: "The exact p50-byte prime-start, 256-slot, p56-literal-F scheme is impossible for 128 original nonempty slots. The manuscript does not authorize this composite scheme."
}, null, 2));
