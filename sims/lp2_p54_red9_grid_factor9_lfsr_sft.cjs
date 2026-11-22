"use strict";

/** Original p54 red-nine / table degree-nine LFSR, frozen source test (Node 22). */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} pathname */
const read = (pathname) => JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", pathname), "utf8"));
/** @param {number} n */
const mod = (n) => ((n % 29) + 29) % 29;
/** @param {number[]} indices */
function ioc(indices) {
  const bins = Array(29).fill(0);
  for (const index of indices) bins[index] += 1;
  const n = indices.length;
  return bins.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/base60-grid.json");
assert.equal(table.byte_rows.length, 32);
assert.ok(table.byte_rows.every((row) => row.length === 8));
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
const p54 = corpus.pages.find((page) => page.page === 54).indices;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);

// Ascending coefficients of the degree-nine monic factor of the
// descending-coefficient base60 table polynomial over GF(29).
const factor = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
const remainder = bytes.map(mod).reverse();
for (let i = remainder.length - 1; i >= factor.length - 1; i -= 1) {
  const lead = remainder[i];
  for (let j = 0; j < factor.length; j += 1) {
    remainder[i - factor.length + 1 + j] = mod(remainder[i - factor.length + 1 + j] - lead * factor[j]);
  }
}
assert.deepEqual(remainder.slice(0, 9), Array(9).fill(0));
assert.equal(factor[factor.length - 1], 1);

// Source-visible first nine red p54 runes, no fitted key digits.
const seed = p54.slice(0, 9);
assert.deepEqual(seed, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
const ciphertext = [...p54.slice(9), ...p55];
assert.equal(ciphertext.length, 299);
const key = [...seed];
while (key.length < ciphertext.length) {
  const n = key.length;
  let sum = 0;
  for (let j = 0; j < 9; j += 1) sum += factor[j] * key[n - 9 + j];
  key.push(mod(-sum));
}

/** @param {number[]} cipher @param {"add"|"difference"} mode */
function decrypt(cipher, mode) {
  return cipher.map((value, i) => mod(value - key[i] - (mode === "difference" ? (i === 0 ? seed[8] : cipher[i - 1]) : 0)));
}
/** @param {number[]} plain @param {"add"|"difference"} mode */
function encrypt(plain, mode) {
  const out = [];
  for (let i = 0; i < plain.length; i += 1) {
    out.push(mod(plain[i] + key[i] + (mode === "difference" ? (i === 0 ? seed[8] : out[i - 1]) : 0)));
  }
  return out;
}

const native = Array.from({ length: ciphertext.length }, (_, i) => p57[i % p57.length]);
console.log("p54 red-nine LFSR factor:", JSON.stringify(factor));
console.log("source p54 heading:", JSON.stringify(seed));
console.log("299 original ciphertext GP runes, raw IoC:", ioc(ciphertext).toFixed(12));
for (const mode of ["add", "difference"]) {
  const out = decrypt(ciphertext, mode);
  assert.deepEqual(encrypt(out, mode), ciphertext);
  assert.deepEqual(decrypt(encrypt(native, mode), mode), native);
  const prefix = out.slice(0, 90).map((index) => corpus.translit[index]).join("");
  console.log(mode + ": original IoC " + ioc(out).toFixed(12) + ", first 90 runes " + prefix);
  if (mode === "add") assert.ok(Math.abs(ioc(out) - 0.0332652465713452) < 1e-12);
  if (mode === "difference") assert.ok(Math.abs(ioc(out) - 0.03674440528832125) < 1e-12);
}
console.log("PASS: original table factor; 299-rune inverse/forward; source-native positive controls");
