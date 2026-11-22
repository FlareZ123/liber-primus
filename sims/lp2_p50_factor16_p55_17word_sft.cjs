"use strict";

/**
 * Independent original LP2 p50-lowfactor16 -> p54/55 17-word
 * complete GP29 inverse. One frozen assignment: 17 monic coefficients
 * (high degree to low) to the 17 original p55 page-local segments,
 * retaining the original p54-to-p55 carried 11-rune word as segment 0.
 * GP29 additive subtraction is the known historic Cicada primitive.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname, "..", "resources", "liber-primus");
const corpus = require(path.join(base, "lp2-corpus.json"));
const grid = require(path.join(base, "lp2-grid-256.json"));
const source = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8")
  .replace(/\r\n/g, "\n").split(/^%\s*$/m);
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;

/**
 * Polynomial coefficients in increasing power order.
 * @param {number[]} lhs
 * @param {number[]} rhs
 * @returns {number[]}
 */
function multiply(lhs, rhs) {
  const result = new Array(lhs.length + rhs.length - 1).fill(0);
  for (let i = 0; i < lhs.length; i++) {
    for (let j = 0; j < rhs.length; j++) {
      result[i + j] = mod(result[i + j] + lhs[i] * rhs[j]);
    }
  }
  return result;
}

/**
 * @param {number[]} dividend
 * @param {number[]} divisor
 * @returns {number[]}
 */
function divideExact(dividend, divisor) {
  const value = dividend.slice();
  const quotient = new Array(value.length - divisor.length + 1).fill(0);
  assert.equal(divisor.at(-1), 1, "the chosen factor must be monic");
  for (let i = value.length - 1; i >= divisor.length - 1; i--) {
    const k = value[i];
    quotient[i - divisor.length + 1] = k;
    for (let j = 0; j < divisor.length; j++) {
      value[i - divisor.length + j] =
        mod(value[i - divisor.length + j] - k * divisor[j]);
    }
  }
  assert.ok(value.slice(0, divisor.length - 1).every((x) => x === 0));
  return quotient;
}

/** @param {number[]} x @returns {string} */
const translit = (x) => x.map((v) => corpus.translit[v]).join("");
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const hist = new Array(29).fill(0);
  for (const v of x) hist[v]++;
  return hist.reduce((sum, f) => sum + f * (f - 1), 0) / (x.length * (x.length - 1));
}

/** @param {string} page @returns {number[][]} */
function parseWords(page) {
  const filtered = Array.from(page).filter((s) =>
    alphabet.has(s) || s === "-" || s === ".");
  return filtered.join("").split(/[-.]/).filter(Boolean)
    .map((word) => Array.from(word, (rune) => {
      const i = alphabet.get(rune);
      assert.notEqual(i, undefined);
      return i;
    }));
}

assert.equal(grid.bytes.length, 256);
assert.equal(source.length, 57);
const factors = [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
];
const low = factors.reduce(multiply, [1]); // monic degree16
assert.equal(low.length, 17);
assert.deepStrictEqual(low, [13, 20, 26, 12, 6, 2, 13, 26, 6, 26, 11, 7, 15, 11, 17, 25, 1]);
const polynomial = grid.bytes.slice().reverse().map((x) => x % 29);
assert.equal(polynomial.length, 256);
const quotient = divideExact(polynomial, low);
assert.equal(quotient.length, 240);
assert.equal(quotient[239], 0); // printed leading 203 = 0 modulo 29
assert.deepStrictEqual(multiply(quotient, low), polynomial);

const p54 = corpus.pages.find((p) => p.page === 54).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const w54 = parseWords(source[53]);
const w55 = parseWords(source[54]);
assert.deepStrictEqual(w54.flat(), p54);
assert.deepStrictEqual(w55.flat(), p55);
assert.deepStrictEqual(w55.map((w) => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const carry = w54.at(-1).concat(w55[0]);
assert.equal(carry.length, 11);
assert.deepStrictEqual(carry, [...p54.slice(-10), p55[0]]);
const complete = [carry, ...w55.slice(1)];
assert.equal(complete.length, 17);
const shifts = low.slice().reverse();
assert.deepStrictEqual(shifts, [1,25,17,8,10,2,26,14,28,7,25,11,15,8,5,20,13]);

const recovered = complete.map((word, wordIndex) =>
  word.map((rune) => mod(rune - shifts[wordIndex])));
const restored = recovered.map((word, wordIndex) =>
  word.map((rune) => mod(rune + shifts[wordIndex])));
assert.deepStrictEqual(restored, complete);
const body = recovered.slice(1).flat();
assert.equal(body.length, 75);
assert.equal(recovered[0].length, 11);
assert.equal(body.length + 1, p55.length);
const candidate = recovered.map(translit);
assert.deepStrictEqual(candidate, [
  "CTHSUPBIAOCAEL", "FMIJ", "IAF", "OH", "FYLHTI",
  "OELBIIAD", "AEOE", "LTHOBPOERHTJADS", "PNBNGWD", "LJSH",
  "EAC", "YTHREORP", "EONGAEAEEON", "MI", "HTHPOEHB", "OLI", "RCY"
]);

// Genuine native GP plant preserved word-for-word under the exact
// 17-unit source shape, without fitting any shifts.
const planted = p57.concat(p57).slice(0, 86);
let offset = 0;
const nativeWords = complete.map((word) => {
  const part = planted.slice(offset, offset + word.length);
  offset += word.length;
  return part;
});
assert.equal(offset, 86);
const plantedCipher = nativeWords.map((word, i) =>
  word.map((x) => mod(x + shifts[i])));
assert.deepStrictEqual(plantedCipher.map((word, i) =>
  word.map((x) => mod(x - shifts[i]))), nativeWords);

const native75 = [];
for (let i = 0; i + 75 <= p57.length; i++) native75.push(ioc(p57.slice(i, i+75)));
const rawIoc = ioc(p55.slice(1)), decodedIoc = ioc(body);
assert.ok(decodedIoc < Math.min(...native75));
console.log("Original full 256 table polynomial divided exactly by monic low-degree16 factor.");
console.log("Source factor coefficients high→low: " + shifts.join(","));
console.log("Decoded carried p54→p55 11-rune word: " + candidate[0]);
console.log("Decoded complete p55 words: " + candidate.slice(1).join(" / "));
console.log("Original p55 body IoC: " + rawIoc + "; decoded " + decodedIoc);
console.log("Native p57 75-rune window minimum: " + Math.min(...native75));
console.log("All 86/86 full original symbols reverse exactly, including p54 carry; source-native plant 86/86.");
console.log("RESULT: one fully source-shaped factor16→17-segment fixed GP29 additive transfer fails to recover GP plaintext.");
