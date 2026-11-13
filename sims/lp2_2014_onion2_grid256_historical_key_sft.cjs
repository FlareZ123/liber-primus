"use strict";
/**
 * SFT: an original 256-byte Cicada 2014 onion-2 stream and the original
 * 256-byte LP2 numeric table. These are two independently source-complete
 * historical artifacts, not a claimed historical pairing.
 *
 * Frozen operations: bytewise XOR, modular +/-; same/reversed order.
 * Additional conditional source-composed GP29 consumer: the 256-byte pad
 * repeated on all unknown LP2 GP indices under native additive +/- and
 * solved-page literal-F transparency, with original phase zero. No phase,
 * seed, page, offset or language-model search.
 *
 * Run: node sims/lp2_2014_onion2_grid256_historical_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const db = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"))
  .byte_rows.flat();
const hex = read("resources/2014-onion2-final-256byte-hex.txt").trim();
assert.match(hex, /^[0-9a-f]{512}$/);
const onion2 = hex.match(/../g).map(x => Number.parseInt(x, 16));
assert.equal(onion2.length, 256);
assert.equal(grid.length, 256);
assert.deepEqual(onion2.slice(0, 4), [99, 66, 146, 186]);
assert.deepEqual(onion2.slice(-4), [17, 68, 40, 70]);
assert.deepEqual(grid.slice(0, 4), [203, 231, 167, 186]);
assert.deepEqual(grid.slice(-4), [180, 36, 189, 80]);
const original = db.pages.filter(x => x.page <= 55)
  .flatMap(x => x.indices);
assert.equal(original.length, 12956);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const h = new Uint16Array(29);
  for (const x of a) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    h[x]++;
  }
  return h.reduce((sum, count) => sum + count * (count - 1), 0) /
    (a.length * (a.length - 1));
}
/** @param {number} n */
const mod29 = n => (n % 29 + 29) % 29;
/** @param {number} n */
const mod256 = n => (n % 256 + 256) % 256;
/**
 * @param {number[]} body
 * @param {number[]} key
 * @param {"xor"|"subtract"|"add"} mode
 * @returns {number[]}
 */
function binary(body, key, mode) {
  assert.equal(body.length, key.length);
  return body.map((v, i) => mode === "xor" ? (v ^ key[i]) :
    mode === "subtract" ? mod256(v - key[i]) : mod256(v + key[i]));
}
const bytes = [];
for (const reversed of [false, true]) {
  const key = reversed ? [...onion2].reverse() : onion2;
  for (const operation of ["xor", "subtract", "add"]) {
    const transformed = binary(grid, key, operation);
    const inverseOperation = operation === "subtract" ? "add" :
      operation === "add" ? "subtract" : "xor";
    assert.deepEqual(binary(transformed, key, inverseOperation), grid);
    bytes.push({
      reversed, operation,
      printableAscii: transformed.filter(v => v >= 32 && v <= 126).length,
      leadingHex: transformed.slice(0, 8).map(x =>
        x.toString(16).padStart(2, "0")).join(""),
      fullByteRoundtrip: true
    });
  }
}
assert.deepEqual(bytes.map(x => x.printableAscii), [97, 88, 95, 82, 98, 78]);
const unique = xs => new Set(xs).size;
const alignedByteMatches = grid.filter((v, i) => v === onion2[i]).length;
assert.equal(alignedByteMatches, 1);
const sharedByteValues = [...new Set(grid)].filter(v =>
  onion2.includes(v)).length;
assert.equal(sharedByteValues, 100);
// Every native-source selected vector is tested in one repeatable,
// fixed-phase 256-byte GP pad without searching offsets or lengths.
const keys = [
  ["onion2", onion2],
  ["printed grid", grid],
  ["grid XOR onion2", binary(grid, onion2, "xor")]
];
/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} transparentF
 */
function gpShift(plaintext, key, sign, transparentF) {
  let offset = 0;
  return plaintext.map(v => {
    if (transparentF && v === 0) return 0;
    const result = mod29(v + sign * key[offset % 256]);
    offset++;
    return result;
  });
}
const runeDecodes = [];
const nativePlant = Array.from({length: original.length}, (_, i) =>
  db.pages[57].indices[i % db.pages[57].indices.length]);
for (const [keyName, key] of keys) {
  for (const sign of [-1, 1]) {
    for (const transparentF of [false, true]) {
      const decoded = gpShift(original, key, sign, transparentF);
      const cipher = gpShift(nativePlant, key, -sign, transparentF);
      // When F skips key and is preserved, running the inverse on the
      // observed ciphertext is not an inverse: ciphertext created by
      // shifting another rune can itself equal F. This fixture therefore
      // round-trips only the no-skip variant; skip is a conditional
      // hypothesis whose injectivity must be supplied by a real encoder.
      if (!transparentF) {
        assert.deepEqual(gpShift(cipher, key, sign, false), nativePlant);
      }
      runeDecodes.push({
        keyName, sign, transparentF,
        totalGp29IoC: ioc(decoded),
        noSkipNativeGpPlant: !transparentF
      });
    }
  }
}
const reference = {
  "onion2": [0.034461096, 0.035584407, 0.034462872, 0.035710034],
  "printed grid": [0.034467197, 0.035811414, 0.034451516, 0.035797449],
  "grid XOR onion2": [0.034474037, 0.035597705, 0.034523976, 0.035754254]
};
for (const name of Object.keys(reference)) {
  const observedValues = runeDecodes.filter(x => x.keyName === name)
    .map(x => Number(x.totalGp29IoC.toFixed(9)));
  assert.deepEqual(observedValues, reference[name]);
}
console.log(JSON.stringify({
  source: "Cicada-served 2014 onion-2 256-byte string, original 256-cell LP2 base60 grid",
  sourceLengths: {onion2: onion2.length, grid: grid.length},
  uniqueByteValues: {onion2: unique(onion2), grid: unique(grid)},
  alignedByteMatches, sharedByteValues,
  sourcePairedBinaryOperations: bytes,
  rawUnknownGp29IoC: ioc(original),
  allUnknownGp29SourceKeyDecodes: runeDecodes,
  decision: "No source-paired binary header/ASCII plaintext or full-book GP29 plaintext under the frozen direct operations; no author-prescribed pairing or recovered authentic key",
  limitation: "Ciphertext can remain high-entropy after a genuine XOR layer; this only retires direct readable-message and GP29 repeating-key consumers."
}, null, 2));
