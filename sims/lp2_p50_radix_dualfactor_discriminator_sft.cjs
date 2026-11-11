"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "base60-grid.json"),
  "utf8"
));
const tokens = source.rows.flat();
const alphabet60 = source.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const expectedDigest = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} x @returns {number} */
function inv29(x) {
  for (let i = 1; i < 29; i++) {
    if (mod29(x * i) === 1) return i;
  }
  throw new RangeError("non-invertible divisor");
}

/**
 * @param {readonly string[]} cells
 * @param {string} alphabet
 * @returns {number[]}
 */
function parse(cells, alphabet) {
  return cells.map((token) =>
    alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]));
}

/**
 * Remainder of printed high-to-low coefficient polynomial by the
 * low-to-high supplied GP29 polynomial.
 * @param {readonly number[]} printed
 * @param {readonly number[]} divisor
 * @returns {number[]}
 */
function remainder(printed, divisor) {
  const coefficients = printed.map(mod29).reverse();
  const d = divisor.map(mod29);
  const pivotInverse = inv29(d[d.length - 1]);
  for (let k = coefficients.length - 1; k >= d.length - 1; k--) {
    const factor = mod29(coefficients[k] * pivotInverse);
    for (let j = 0; j < d.length; j++) {
      const i = k - d.length + 1 + j;
      coefficients[i] = mod29(coefficients[i] - factor * d[j]);
    }
  }
  return coefficients.slice(0, d.length - 1);
}

const H2013 = [3, 26, 24];
const G39 = [27, 5, 15];
const P3 = [13, 23, 2];
assert.equal(tokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(new Set(tokens).size <= 256, true);
const b60 = parse(tokens, alphabet60);
const b59 = parse(tokens, alphabet59);
assert.equal(crypto.createHash("sha256").update(Buffer.from(b60)).digest("hex"), expectedDigest);
assert.ok(b60.every((v) => Number.isInteger(v) && v >= 0 && v < 256));
assert.ok(b59.every((v) => Number.isInteger(v) && v >= 0 && v < 256));

assert.deepEqual(remainder(b60, H2013), [0, 0]);
assert.deepEqual(remainder(b60, G39), [0, 0]);
assert.deepEqual(remainder(b60, P3), [18, 26]);
assert.deepEqual(remainder(b59, H2013), [20, 17]);
assert.deepEqual(remainder(b59, G39), [22, 12]);
assert.deepEqual(remainder(b59, P3), [22, 10]);
assert.equal(b60[0], 203);
assert.equal(b59[0], 200);
assert.equal(b60.filter((v, i) => v !== b59[i]).length, 220);
assert.equal(b60.reduce((s, v, i) => s + v - b59[i], 0), 507);

const altered = b60.slice();
altered[255] = (altered[255] + 1) & 255;
assert.notDeepEqual(remainder(altered, H2013), [0, 0]);
assert.notDeepEqual(remainder(altered, G39), [0, 0]);

console.log(JSON.stringify({
  tableSha256: expectedDigest,
  sourceCells: 256,
  changedCellCount: 220,
  base60: {
    firstByte: b60[0],
    firstByteMod29: b60[0] % 29,
    H2013: remainder(b60, H2013),
    G39: remainder(b60, G39),
    P3: remainder(b60, P3),
  },
  base59: {
    firstByte: b59[0],
    firstByteMod29: b59[0] % 29,
    H2013: remainder(b59, H2013),
    G39: remainder(b59, G39),
    P3: remainder(b59, P3),
  },
}, null, 2));
