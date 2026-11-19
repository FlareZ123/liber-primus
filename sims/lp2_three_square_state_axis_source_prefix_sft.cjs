"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const MOD = 29;

/** @param {number} n @returns {number[]} */
function base29(n) {
  if (n === 0) return [0];
  const out = [];
  let x = n;
  while (x > 0) {
    out.unshift(x % MOD);
    x = Math.floor(x / MOD);
  }
  return out;
}

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** @param {string} text @returns {number[][][]} */
function parseSquares(text) {
  return text.trim().split(/\r?\n\s*\r?\n/u).map((block) =>
    block.split(/\r?\n/u).map((line) =>
      line.trim().split(/\s+/u).map(Number)
    )
  );
}

/** @param {number[][]} square @returns {number} */
function center(square) {
  const m = Math.floor(square.length / 2);
  return square[m][m];
}

const squares = parseSquares(
  fs.readFileSync(
    path.join(root, "resources/cicada2014-openpuff-magic-squares.txt"),
    "utf8"
  )
);
assert.deepEqual(
  squares.map((square) => [square.length, center(square)]),
  [[5, 809], [7, 331], [5, 91]]
);

const same1033 = squares
  .filter((square) => square[0].reduce((a, b) => a + b, 0) === 1033)
  .sort((a, b) => a.length - b.length);
assert.equal(same1033.length, 2);

const small = same1033[0];
const large = same1033[1];

const g = small.length;
const K = large.length - small.length;
const [e, q] = base29(center(small));
const [u0, u1] = base29(center(large));
assert.equal(u0 - e, u1 - q);
const A = u0 - e;

const [unit, a, aMinusB] = base29(1033);
const B = mod(A - aMinusB);

assert.equal(unit, q - e);
assert.equal(unit, e - K);
assert.deepEqual({g, K, e, q, A, a, B}, {
  g: 5,
  K: 2,
  e: 3,
  q: 4,
  A: 8,
  a: 6,
  B: 19,
});

const axis = [q - e, K, e, q, g, a, g + K];
assert.deepEqual(axis, [1, 2, 3, 4, 5, 6, 7]);

const risingStateRegister = [...axis, A];
assert.deepEqual(risingStateRegister, [1, 2, 3, 4, 5, 6, 7, 8]);

const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);
const clear = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const source = clear
  .replace(/\b7A35090F\b/gu, "")
  .match(/[A-Za-z]+/gu)
  .map((word) => word.toUpperCase());
assert.equal(source.length, 43);

const phrase = risingStateRegister.map((index) => source[index]);
assert.deepEqual(phrase, [
  "THE", "PATH", "LIES", "EMPTY",
  "EPIPHANY", "SEEKS", "THE", "DEVOTED",
]);
assert.deepEqual([source[g], source[a]], ["EPIPHANY", "SEEKS"]);

// The earlier BASE29 cell chain would need 211=[7,8] to reach DEVOTED.
// Confirm that this value is absent from all three source squares.
const neededCell = 7 * MOD + 8;
assert.equal(neededCell, 211);
assert.equal(squares.flat(2).includes(neededCell), false);

console.log(JSON.stringify({
  status: "PASS",
  metadataState: {g, K, e, q, A, a, B},
  stateAxis: axis,
  risingStateRegister,
  sourcePhrase: phrase,
  p0TitleSelector: {
    fields: ["g", "a"],
    values: [g, a],
    words: [source[g], source[a]],
  },
  missingCellContinuation: {
    value: neededCell,
    base29: base29(neededCell),
    presentInAuthenticatedSquares: false,
    recoveredEndpointInstead: {
      field: "A",
      value: A,
      word: source[A],
    },
  },
}, null, 2));
