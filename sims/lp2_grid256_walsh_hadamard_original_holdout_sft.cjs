"use strict";

/**
 * Original 32x8 LP2 numeric table as a single 256-point Walsh-Hadamard packet.
 * Direct GP29/ASCII257 inverse with untouched solved p57 holdout.
 * Runs on Windows Node22 using only built-in CommonJS; no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const base = path.resolve(__dirname, "..", "resources", "liber-primus");
const grid = JSON.parse(fs.readFileSync(path.join(base, "base60-grid.json"), "utf8"));
const canonical = JSON.parse(fs.readFileSync(path.join(base, "lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const tokens = grid.rows.flat();
const repeatedSource = canonical.pages.flatMap((page) => page.tokens);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(tokens.length, 256);
assert.deepEqual(tokens, repeatedSource, "exact 256 physical p49-p51 token source");
const byte = tokens.map((token) => {
  assert.equal([...token].length, 2);
  const hi = grid.alphabet.indexOf(token[0]);
  const lo = grid.alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  const value = 60 * hi + lo;
  assert.ok(value >= 0 && value <= 255);
  return value;
});
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(byte)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
const terminal = [55, 56, 57].flatMap((page) => corpus.pages[page].indices);
assert.equal(terminal.length, 256);
const clear = corpus.pages[57].indices;
assert.deepEqual(terminal.slice(161), clear);

/**
 * Exact in-place 256-point Walsh-Hadamard transform, paired [a+b,a-b].
 * @param {number[]} input 256 field elements
 * @param {number} prime 29 or 257
 * @returns {number[]} New field vector
 */
function hadamard(input, prime) {
  assert.equal(input.length, 256);
  const data = input.map((value) => value % prime);
  for (let stride = 1; stride < 256; stride *= 2) {
    for (let group = 0; group < 256; group += 2 * stride) {
      for (let offset = 0; offset < stride; offset += 1) {
        const left = group + offset;
        const right = left + stride;
        const a = data[left];
        const b = data[right];
        data[left] = (a + b) % prime;
        data[right] = (a - b + prime) % prime;
      }
    }
  }
  return data;
}

/** @param {number[]} values GP29 symbols @returns {number} 29-normalized index of coincidence */
function normalizedIoc(values) {
  const count = Array(29).fill(0);
  values.forEach((x) => { count[x] += 1; });
  return 29 * count.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number[]} values Rune indices @returns {string} GP Latin transliteration */
const translit = (values) => values.map((value) => corpus.translit[value]).join("");

for (const field of [
  { prime: 29, inv256: 23, unit: "GP29" },
  { prime: 257, inv256: 256, unit: "ASCII257" },
]) {
  const { prime, inv256, unit } = field;
  assert.equal((256 * inv256) % prime, 1);
  const forward = hadamard(byte, prime);
  const inverse = forward.map((value) => value * inv256 % prime);
  assert.deepEqual(hadamard(forward, prime), byte.map((x) => x * 256 % prime));
  assert.deepEqual(hadamard(inverse, prime), byte.map((x) => x % prime));
  // Authentic native GP positive, never borrowed as a key.
  const planted = Array.from({ length: 256 }, (_, i) => clear[i % clear.length]);
  const encrypted = hadamard(planted, prime);
  assert.deepEqual(hadamard(encrypted, prime).map((x) => x * inv256 % prime), planted);

  for (const [direction, output] of [["forward", forward], ["inverse", inverse]]) {
    const match = clear.reduce((sum, x, i) => sum + Number(output[161 + i] === x), 0);
    const reducedMatch = clear.reduce((sum, x, i) => sum + Number(output[161 + i] % 29 === x), 0);
    const common = {
      field: unit,
      direction,
      originalSource: "p49-p51 exact 256 base60 bytes, row-major",
      independentlySolvedP57: "95 GP runes at terminal positions 161-255",
      exactP57Matches: match,
      mod29P57Matches: reducedMatch,
      originalSourceRoundTrip: "256/256",
      plantedSolvedP57RoundTrip: "256/256",
    };
    if (prime === 29) {
      common.normalizedIoc = normalizedIoc(output);
      common.transliteration = translit(output);
      common.zeroCoefficients = output.filter((x) => x === 0).length;
    } else {
      common.asciiPrintable = output.filter((x) => x >= 32 && x <= 126).length;
      common.illegalByte256 = output.filter((x) => x === 256).length;
      common.asciiPreview = output.slice(0, 100).map((x) => x >= 32 && x <= 126 ? String.fromCharCode(x) : ".").join("");
    }
    console.log(JSON.stringify(common));
    if (prime === 29 && direction === "forward") {
      assert.equal(match, 4);
      assert.ok(Math.abs(normalizedIoc(output) - 1.0368566176470588) < 1e-12);
    }
    if (prime === 29 && direction === "inverse") {
      assert.equal(match, 8);
    }
    if (prime === 257) {
      assert.equal(match, 0);
      assert.equal(output.filter((x) => x >= 32 && x <= 126).length, direction === "forward" ? 93 : 92);
    }
  }
}
console.log("PASS: both original 256-point field transforms and both genuine native positive plants invert exactly; no direct solved-final-page Walsh linkage.");
