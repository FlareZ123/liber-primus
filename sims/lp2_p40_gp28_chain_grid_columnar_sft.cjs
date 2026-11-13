"use strict";
/**
 * Director #696: original p40–53 fixed GP29 delta -> classic red8 columns
 * -> source table GP28 inverse. One frozen complete original-input test.
 * Node 22 / CommonJS. Run: node sims/lp2_p40_gp28_chain_grid_columnar_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} filename */
const read = filename => JSON.parse(fs.readFileSync(path.join(root, filename), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json").bytes;
const chapter = corpus.pages.slice(40, 54).flatMap(p => p.indices);
assert.equal(chapter.length, 3008);
const heading = chapter.slice(0, 8);
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
const order = heading.map((v, i) => ({ v, i }))
  .sort((a, b) => a.v - b.v).map(x => x.i);
assert.deepEqual(order, [0, 4, 7, 1, 2, 5, 6, 3]);
assert.equal(grid.length, 256);
const original = chapter.slice(8);
assert.equal(original.length, 3000);
const rows = 375;
const mod = (x, n) => (x % n + n) % n;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const hist = Array(29).fill(0);
  for (const x of a) hist[x]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
/** @param {number[]} a @param {number} lag */
function repeats(a, lag = 1) {
  let n = 0;
  for (let i = lag; i < a.length; i++) n += Number(a[i] === a[i - lag]);
  return n;
}
/** @param {number[]} a */
const gp = a => a.map(i => corpus.translit[i]).join("");
/**
 * Distinguish zero delta as the fixed GP29 EA rune (index 28).
 * For d in 1..28, rank the nonzero delta as d-1 in 0..27.
 * Undo eight sorted columns and subtract one row-major grid byte modulo28.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @returns {{plaintext: number[], steps: number[]}}
 */
function decrypt(ciphertext, key = grid) {
  assert.equal(ciphertext.length, 3000);
  assert.equal(key.length, 256);
  let previous = heading[7];
  const steps = ciphertext.map(c => {
    const delta = mod(c - previous, 29);
    previous = c;
    return delta === 0 ? 28 : delta - 1;
  });
  const columns = Array(8);
  for (let block = 0; block < 8; block++) {
    columns[order[block]] = steps.slice(block * rows, (block + 1) * rows);
  }
  const plaintext = Array.from({ length: 3000 }, (_, i) => {
    const row = Math.floor(i / 8), col = i % 8;
    const symbol = columns[col][row];
    return symbol === 28 ? 28 : mod(symbol - (key[(row % 32) * 8 + col] % 28), 28);
  });
  return { plaintext, steps };
}
/**
 * Reverse the complete decoder, including zero-delta EA exceptions.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @returns {number[]}
 */
function encrypt(plaintext, key = grid) {
  assert.equal(plaintext.length, 3000);
  assert.equal(key.length, 256);
  const columns = Array.from({ length: 8 }, () => []);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 8; col++) {
      const p = plaintext[row * 8 + col];
      assert.ok(p >= 0 && p < 29);
      columns[col].push(p === 28 ? 28 :
        mod(p + (key[(row % 32) * 8 + col] % 28), 28));
    }
  }
  const steps = order.flatMap(col => columns[col]);
  let previous = heading[7];
  return steps.map(s => {
    const c = mod(previous + (s === 28 ? 0 : s + 1), 29);
    previous = c;
    return c;
  });
}
const { plaintext, steps } = decrypt(original);
assert.equal(steps.filter(s => s === 28).length, 18);
assert.equal(plaintext.filter(s => s === 28).length, 18);
assert.equal(repeats(original), 18);
assert.deepEqual(encrypt(plaintext), original, "exact original 3000/3000 forward inversion");

const native = corpus.pages[57].indices;
assert.equal(native.length, 95);
const plant = Array.from({ length: 3000 }, (_, i) => native[i % native.length]);
const plantedCipher = encrypt(plant);
assert.deepEqual(decrypt(plantedCipher).plaintext, plant,
  "genuine solved-p57 GP native plant");
// Separate EA-bearing plant exercises all original exception sites, rather
// than relying on a native control with zero occurrences of EA.
const exceptionPlant = plant.slice();
plaintext.forEach((p, i) => { if (p === 28) exceptionPlant[i] = 28; });
assert.equal(exceptionPlant.filter(p => p === 28).length, 18);
const exceptionCipher = encrypt(exceptionPlant);
assert.deepEqual(decrypt(exceptionCipher).plaintext, exceptionPlant,
  "EA-exception original-position plant");

// Wrong independently chosen source-table direction: every key still has a
// mathematical inverse; that is not evidence of the historical key.
const wrongKey = grid.slice().reverse();
const wrongPlain = decrypt(original, wrongKey).plaintext;
assert.deepEqual(encrypt(wrongPlain, wrongKey), original);
const wrongKeyReplayedWithActual = encrypt(wrongPlain);
const wrongKeyMismatches = wrongKeyReplayedWithActual.reduce(
  (count, v, i) => count + Number(v !== original[i]), 0);
assert.ok(wrongKeyMismatches > 0);

const sourceTailMapped300 = Array.from({ length: 300 }, (_, j) => {
  const sourceIndex = 2700 + j;
  return plaintext[(sourceIndex % rows) * 8 +
    order[Math.floor(sourceIndex / rows)]];
});
const p53ClosingRed51 = sourceTailMapped300.slice(-51);

// Independent 3000-rune GP-native register from preserved Gibran source.
// This is a linguistic reference, never a key or decoder parameter.
const gibranSource = fs.readFileSync(
  path.join(root, "resources/control/gibran_prophet_58585.txt"), "utf8").toUpperCase();
const gpTokens = corpus.translit.map((text, i) => ({ text, i }))
  .sort((a, b) => b.text.length - a.text.length);
const gibranNative = [];
for (const raw of gibranSource.match(/[A-Z]+/g) || []) {
  const word = raw.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  for (let i = 0; i < word.length;) {
    const token = gpTokens.find(x => word.startsWith(x.text, i));
    assert.ok(token, "Gibran GP token");
    gibranNative.push(token.i);
    i += token.text.length;
  }
  if (gibranNative.length >= 3000) break;
}
gibranNative.length = 3000;
assert.equal(gibranNative.length, 3000);
assert.ok(ioc(gibranNative) > 0.05);

const report = {
  source: "LP2 physical p40-53 original 3000 body runes and 32x8 table",
  iv: heading[7], heading, order,
  sourceCiphertext3000: original.length,
  originalLagOneRepeats: repeats(original),
  zeroDeltaEAExceptions: steps.filter(x => x === 28).length,
  ciphertextIoC: ioc(original),
  decodedIoC: ioc(plaintext),
  decodedRowMajorLast300IoC: ioc(plaintext.slice(-300)),
  decodedSourceOrderLast300IoC: ioc(sourceTailMapped300),
  solvedP57Native3000IoC: ioc(plant),
  independentGibran3000IoC: ioc(gibranNative),
  wrongTableReorderIoC: ioc(wrongPlain),
  wrongKeyReplayedWithActualMismatches: wrongKeyMismatches,
  decodedFirst200: gp(plaintext.slice(0, 200)),
  decodedLast200: gp(plaintext.slice(-200)),
  sourceOrderClosingRed51GP: gp(p53ClosingRed51),
  originalExactReencryption: true,
  native3000PlantExactRecovery: true,
  EAException18PlantExactRecovery: true,
  fullDecoded3000GP: gp(plaintext),
  fullDecoded3000RuneIndices: plaintext,
};
console.log(JSON.stringify(report, null, 2));
