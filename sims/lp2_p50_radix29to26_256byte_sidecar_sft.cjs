"use strict";

/**
 * Frozen exact base29-to-base26 256-byte sidecar on original LP2 sources.
 * Read-only Node.js 22 / Windows 11 single-file test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const runes = pages.flatMap(p => p.indices);
const N = runes.length;
assert.equal(N, 12956);
assert.equal(pages.length, 55);
assert.equal(grid.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
const alphabet60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59 = alphabet60.replace("f", "");
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const bytes = [alphabet60, alphabet59].map(alphabet => {
  const radix = alphabet.length;
  return tokens.map(t => {
    const hi = alphabet.indexOf(t[0]), lo = alphabet.indexOf(t[1]);
    assert.ok(t.length === 2 && hi >= 0 && lo >= 0);
    const v = hi * radix + lo;
    assert.ok(v >= 0 && v < 256);
    return v;
  });
});
assert.deepEqual(bytes[0], grid.bytes);
const base26Power = 26n ** BigInt(N);
const base29Power = 29n ** BigInt(N);
const maximumQuotient = (base29Power - 1n) / base26Power;
/** @param {bigint} number */
const bitLength = number => number === 0n ? 0 : number.toString(2).length;
assert.equal(bitLength(maximumQuotient), 2042);
assert.equal(maximumQuotient.toString(16).padStart(512, "0").slice(0, 16),
  "02269228b1c45fce");

/**
 * The eight actual 32-by-8 source-grid traversals: rows/columns and
 * two independently source-visible axis directions. No fitted word phase
 * or arbitrary sorting is permitted.
 * @param {number[]} cells
 * @param {"row"|"column"} mode
 * @param {boolean} reverseRows
 * @param {boolean} reverseColumns
 * @returns {number[]}
 */
function readGrid(cells, mode, reverseRows, reverseColumns) {
  const out = [];
  const rowAt = r => reverseRows ? 31 - r : r;
  const columnAt = c => reverseColumns ? 7 - c : c;
  if (mode === "row") {
    for (let row = 0; row < 32; row++)
      for (let column = 0; column < 8; column++)
        out.push(cells[8 * rowAt(row) + columnAt(column)]);
  } else {
    for (let column = 0; column < 8; column++)
      for (let row = 0; row < 32; row++)
        out.push(cells[8 * rowAt(row) + columnAt(column)]);
  }
  assert.equal(out.length, 256);
  return out;
}
/** @param {number[]} data @returns {bigint} */
function integer256(data) {
  let x = 0n;
  for (const v of data) x = x * 256n + BigInt(v);
  return x;
}
/** @param {number[]} data @param {bigint} base */
function integerRadix(data, base) {
  let x = 0n;
  for (const digit of data) {
    assert.ok(digit >= 0 && BigInt(digit) < base);
    x = x * base + BigInt(digit);
  }
  return x;
}
/**
 * Big-endian digits of exactly length n, with preserved leading zeroes.
 * @param {bigint} input
 * @param {bigint} base
 * @param {number} n
 * @returns {number[]}
 */
function digitVector(input, base, n) {
  assert.ok(input >= 0n && input < base ** BigInt(n));
  const result = new Array(n);
  let value = input;
  for (let i = n - 1; i >= 0; i--) {
    result[i] = Number(value % base);
    value /= base;
  }
  assert.equal(value, 0n);
  return result;
}
/**
 * Lossless radix sidecar codec: GP29 numeral X = Q * 26^N + R,
 * 0 <= R < 26^N. The 26-letter output is N uppercase A..Z
 * symbols; the sidecar Q is serialized as a 256-byte unsigned integer.
 * @param {number[]} originalRunes
 */
function splitToLatin(originalRunes) {
  assert.equal(originalRunes.length, N);
  const X = integerRadix(originalRunes, 29n);
  const quotient = X / base26Power;
  const remainder = X % base26Power;
  assert.ok(quotient <= maximumQuotient);
  const latin = digitVector(remainder, 26n, N);
  return {quotient, remainder, latin};
}
/** @param {number[]} runes29 @param {bigint} q @param {number[]} latin26 */
function joinFromLatin(runes29, q, latin26) {
  assert.ok(q >= 0n && q <= maximumQuotient);
  assert.equal(latin26.length, N);
  const X = q * base26Power + integerRadix(latin26, 26n);
  assert.ok(X < base29Power);
  const restored = digitVector(X, 29n, N);
  assert.deepEqual(restored, runes29);
}
/** @param {number[]} x */
function coincidence(x) {
  const freq = Array(26).fill(0);
  for (const v of x) freq[v]++;
  return freq.reduce((s, v) => s + v * (v - 1), 0) / (x.length * (x.length - 1));
}
/** @param {number[]} x */
const toLatin = x => x.map(d => String.fromCharCode(65 + d)).join("");
const sourcePayload = [
  {name: "printed GP29", runes},
  {name: "reversed GP29", runes: [...runes].reverse()},
  {name: "continuous GP29 first-differences", runes: runes.map((v, i) =>
    i ? (v - runes[i - 1] + 29) % 29 : v)},
  {name: "reversed first-differences", runes: runes.map((v, i) =>
    i ? (v - runes[i - 1] + 29) % 29 : v).reverse()}
];
const originalValues = sourcePayload.map(entry => {
  const q = splitToLatin(entry.runes);
  joinFromLatin(entry.runes, q.quotient, q.latin);
  return {name: entry.name, ...q};
});
assert.deepEqual(originalValues.map(x => bitLength(x.quotient)),
  [2041, 2040, 2036, 2041]);
const layouts = [];
for (const [i, cells] of bytes.entries())
  for (const mode of ["row", "column"])
    for (const reverseRows of [false, true])
      for (const reverseColumns of [false, true]) {
        const ordering = readGrid(cells, mode, reverseRows, reverseColumns);
        const Q = integer256(ordering);
        const bits = bitLength(Q);
        assert.ok(bits >= 2047);
        assert.ok(Q > maximumQuotient,
          "the published 256-byte sidecar does not fit the complete GP29-to-Latin26 quotient range");
        for (const original of originalValues)
          assert.notEqual(Q, original.quotient);
        layouts.push({radix: i === 0 ? 60 : 59, mode, reverseRows,
          reverseColumns, quotientBits: bits, firstByte: ordering[0]});
      }
assert.equal(layouts.length, 16);

// Real GP26 Latin positive: use a full N-letter source passage and a quotient
// genuinely in range, then prove exact 12,956-symbol encrypt/decrypt.
const authenticLatin = read("resources/control/gibran_prophet_58585.txt")
  .toUpperCase().replace(/[^A-Z]/g, "").slice(0, N);
assert.equal(authenticLatin.length, N);
const native26 = [...authenticLatin].map(ch => ch.charCodeAt(0) - 65);
const plantedQ = maximumQuotient / 2n;
const originalX = plantedQ * base26Power + integerRadix(native26, 26n);
assert.ok(originalX < base29Power);
const planted29 = digitVector(originalX, 29n, N);
const recovered = splitToLatin(planted29);
assert.equal(recovered.quotient, plantedQ);
assert.deepEqual(recovered.latin, native26);
joinFromLatin(planted29, recovered.quotient, recovered.latin);
assert.ok(coincidence(native26) > 0.05);
console.log("PASS original LP2 exact base29-to-base26 256-byte sidecar gate");
console.log(JSON.stringify({
  runes: N, bitCapacity: 256 * 8,
  exactMaximumQuotientBits: bitLength(maximumQuotient),
  logRatioBits: N * Math.log2(29 / 26),
  original: originalValues.map(x => ({
    name: x.name, quotientBits: bitLength(x.quotient),
    sidecarHexPrefix: x.quotient.toString(16).padStart(512, "0").slice(0, 32),
    latinIoC: coincidence(x.latin),
    latinPrefix: toLatin(x.latin.slice(0, 64))
  })),
  layouts,
  positivePlant: {runesRecovered: N, sidecarBits: bitLength(plantedQ),
    latinIoC: coincidence(native26), latinPrefix: authenticLatin.slice(0, 64)}
}, null, 2));
