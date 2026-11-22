"use strict";

/**
 * LP2 p40-53: exact 32-row x 94-rune alignment of the 256-cell table.
 *
 * Original chapter length 3008 = 32*94. Each printed 8-byte table row is
 * permitted to define EIGHT COMPLETELY SECRET, INDEPENDENT GP29 alphabet
 * bijections within its 94-rune ciphertext block. The observable equality
 * rate inside all 32*8 source-determined cells is invariant under all of
 * these permutations, so an all-secret exclusion needs no key search.
 *
 * The source selects this geometry but supplies no corresponding cipher
 * instruction. Results only restrict this direct, word-order-preserving
 * characterwise alphabet model; they do not exclude matrix ciphers,
 * transposition, stateful operators or foreign/nontext plaintext.
 *
 * SFT: node sims/lp2_p40_32x94_rowkey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const byteTable = JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows.flat();
const chapter = gp.pages.filter(page => page.page >= 40 && page.page <= 53)
  .flatMap(page => page.indices);

assert.equal(chapter.length, 3008);
assert.equal(byteTable.length, 256);
assert.equal(gp.runes.length, 29);
assert.deepEqual(gp.pages.filter(page => page.page >= 40 && page.page <= 53)
  .map(page => page.page),
  Array.from({length:14}, (_, i) => i + 40));

/**
 * Equal-symbol pairs sharing a table-cell class. Classes are
 * (row=floor(i/94), col=(i mod94) mod8). Every row/col can have its
 * own arbitrary 29! bijection and the count remains unchanged.
 *
 * @param {number[]} symbols
 * @returns {{equalPairs:number,totalPairs:number,rate:number}}
 */
function withinCellCollisions(symbols) {
  assert.equal(symbols.length, 3008);
  let equalPairs = 0;
  let totalPairs = 0;
  for (let row = 0; row < 32; row++) {
    for (let col = 0; col < 8; col++) {
      const frequencies = Array(29).fill(0);
      for (let j = col; j < 94; j += 8) {
        const x = symbols[row * 94 + j];
        assert(Number.isInteger(x) && x >= 0 && x < 29);
        frequencies[x]++;
      }
      const n = frequencies.reduce((a, b) => a + b, 0);
      totalPairs += n * (n - 1) / 2;
      equalPairs += frequencies.reduce((a, k) => a + k * (k - 1) / 2, 0);
    }
  }
  return {equalPairs, totalPairs, rate:equalPairs / totalPairs};
}

/** @param {number[]} symbols */
function wholeIoC(symbols) {
  const f = Array(29).fill(0);
  symbols.forEach(s => f[s]++);
  return f.reduce((acc, n) => acc + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/**
 * Direct source-byte addition or subtraction, with row changes at
 * each original 94-runic interval; the eight table bytes repeat in-row.
 * @param {number[]} symbols
 * @param {-1|1} sign
 * @returns {number[]}
 */
function sourceRowShift(symbols, sign) {
  return symbols.map((n, i) => {
    const row = Math.floor(i / 94);
    const column = (i % 94) % 8;
    const key = byteTable[row * 8 + column] % 29;
    return (n + sign * key + 29) % 29;
  });
}

const original = withinCellCollisions(chapter);
assert.deepEqual([original.equalPairs, original.totalPairs],
  [572, 16192]);
assert(Math.abs(original.rate - 0.035326086956521736) < 1e-15);

const rowShiftResults = [];
for (const sign of [-1, 1]) {
  const decoded = sourceRowShift(chapter, sign);
  assert.deepEqual(sourceRowShift(decoded, -sign), chapter);
  assert.deepEqual(withinCellCollisions(decoded), original,
    "each source-cell fixed bijection preserves collision counts");
  rowShiftResults.push({sign, ioc:wholeIoC(decoded)});
}
assert(Math.abs(rowShiftResults[0].ioc - 0.034416370667025166) < 1e-14);
assert(Math.abs(rowShiftResults[1].ioc - 0.034543954177840355) < 1e-14);

/** @param {number} x @returns {number} */
function inverseMod29(x) {
  for (let i = 1; i <= 28; i++) if ((x * i) % 29 === 1) return i;
  throw new Error("mod29 inverse unavailable");
}

/**
 * Source-compatible positive: an ACTUAL secret, different affine
 * permutation at every table cell. It recovers all 3008 symbols
 * independently from the cipher while preserving collision counts.
 */
const plant = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"))
  .slice(0, 3008);
assert.equal(plant.length, 3008);
const plantedCipher = plant.map((p, i) => {
  const slot = Math.floor(i / 94) * 8 + (i % 94) % 8;
  const a = 1 + byteTable[slot] % 28;
  const b = byteTable[slot] % 29;
  return (a * p + b) % 29;
});
const recovered = plantedCipher.map((c, i) => {
  const slot = Math.floor(i / 94) * 8 + (i % 94) % 8;
  const a = 1 + byteTable[slot] % 28;
  const b = byteTable[slot] % 29;
  return ((c - b + 29) * inverseMod29(a)) % 29;
});
assert.deepEqual(recovered, plant, "3008/3008 source-native positive recovery");
assert.deepEqual(withinCellCollisions(plantedCipher), withinCellCollisions(plant));

const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 72],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 20],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 106]
];
let windows = 0;
const controls = [];
for (const [name, file, expectedWindows] of corpora) {
  const text = encodeSourceNativeGP(read(file));
  const rates = [];
  for (let offset = 0; offset + 3008 <= text.length; offset += 3008) {
    rates.push(withinCellCollisions(text.slice(offset, offset + 3008)).rate);
  }
  assert.equal(rates.length, expectedWindows);
  assert(rates.every(value => value > original.rate),
    name + " source-native prose must beat original under all-key invariant");
  windows += rates.length;
  controls.push({
    name,
    windows: rates.length,
    nativeRunes: text.length,
    minimum: Math.min(...rates),
    median: [...rates].sort((a, b) => a - b)[Math.floor(rates.length / 2)],
    maximum: Math.max(...rates)
  });
}
assert.equal(windows, 198);

console.log(JSON.stringify({
  input: "original 2014 LP2 p40-53, 3008 unmodified GP29 runes",
  geometry: "32 exact source table rows, 94 original runes each, 8 source byte cells per row",
  allSecretBijections: "arbitrary and independent 29! symbol permutation per 256 source cells",
  original,
  directOriginalWholeIoC: wholeIoC(chapter),
  rowShiftResults,
  positivePlantedSourceNativeRunesRecovered: recovered.length,
  positiveCollisionRate: withinCellCollisions(plantedCipher).rate,
  independentSourceNativeControlWindows: windows,
  controls,
  verdict: "Direct row-94 table-cell alphabet maps do not produce native GP prose. No unknown plaintext or key."
}, null, 2));
