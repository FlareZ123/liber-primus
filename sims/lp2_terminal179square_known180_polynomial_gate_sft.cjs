"use strict";

/**
 * Original terminal-256 source-known algebraic obstruction over Z/(179^2).
 * No polynomial degree or secret polynomial coefficients are fitted.
 * Run with Node.js 22:
 *   node sims/lp2_terminal179square_known180_polynomial_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const resource = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", name), "utf8"
));
const corpus = resource("lp2-corpus.json");
const grid = resource("base60-grid.json");
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(table)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
assert.equal(corpus.pages[55].indices.length, 76);
const p56 = corpus.pages[56].indices;
const p57 = corpus.pages[57].indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);

// Reconstruct the independently solved p56 plaintext. Exactly one literal F
// at physical page offset 56 does not consume a prime-totient step.
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes;
}

const primes = firstPrimes(84);
let clock = 0;
const plain56 = p56.map((c, i) => {
  if (i === 56) {
    assert.equal(c, 0, "source F must be literal");
    return 0;
  }
  const shift = (primes[clock++] - 1) % 29;
  return (c - shift + 29) % 29;
});
assert.equal(clock, 84);
assert.deepEqual(plain56.slice(0, 5), [24, 9, 18, 9, 23]);
const known = plain56.concat(p57);
assert.equal(known.length, 180);
assert.equal(known[0], 24); // A, p56 first authentic plaintext
assert.equal(known[179], 18); // E, p57 last original clear rune

// Any integer-coefficient polynomial F over Z/(179^2) obeys
// F(x + 179k) == F(x) (mod 179), independently of its degree.
// Native rune values 0...28 are strictly below 179, so such congruent
// plaintext outputs must be the SAME rune. A native GP-prime embedding
// 2...109 is also injective modulo 179.
/** @param {number[]} x @param {number[]} y */
function collisions(x, y) {
  assert.equal(x.length, 180);
  assert.equal(y.length, 180);
  const representatives = new Map();
  const witnesses = [];
  let collisionCount = 0;
  for (let i = 0; i < x.length; i++) {
    const residue = x[i] % 179;
    const prior = representatives.get(residue);
    if (prior) {
      collisionCount++;
      if (prior.y !== y[i]) {
        witnesses.push({
          first: prior.i, second: i,
          first_argument: prior.x, second_argument: x[i],
          first_gp: prior.y, second_gp: y[i],
        });
      }
    } else {
      representatives.set(residue, {i, x: x[i], y: y[i]});
    }
  }
  return {collisionCount, contradictionCount: witnesses.length,
    firstContradiction: witnesses[0]};
}

const ring = [];
for (let row = 0; row < 32; row++) {
  for (let col = 0; col < 8; col++) {
    if (row === 0 || row === 31 || col === 0 || col === 7) {
      ring.push(row * 8 + col);
    }
  }
}
assert.equal(ring.length, 76);
const ringIds = new Set(ring);
const interior = Array.from({length: 256}, (_, i) => i)
  .filter((i) => !ringIds.has(i));
assert.equal(interior.length, 180);

const spiral = [];
let top = 0, bottom = 31, left = 0, right = 7;
while (top <= bottom && left <= right) {
  for (let col = left; col <= right; col++) spiral.push(top * 8 + col);
  top++;
  for (let row = top; row <= bottom; row++) spiral.push(row * 8 + right);
  right--;
  if (top <= bottom) {
    for (let col = right; col >= left; col--) spiral.push(bottom * 8 + col);
    bottom--;
  }
  if (left <= right) {
    for (let row = bottom; row >= top; row--) spiral.push(row * 8 + left);
    left++;
  }
}
assert.equal(spiral.length, 256);
assert.equal(new Set(spiral).size, 256);
assert.deepEqual(new Set(spiral.slice(0, 76)), new Set(ring));

const sources = [
  {name: "index-linear", x: Array.from({length: 180}, (_, i) => 76 + i)},
  {name: "table-byte-linear", x: table.slice(76)},
  {name: "table-byte-inner-row-major", x: interior.map((i) => table[i])},
  {name: "table-byte-inner-spiral", x: spiral.slice(76).map((i) => table[i])},
];
const result = sources.map(({name, x}) => {
  const record = collisions(x, known);
  assert.ok(record.contradictionCount > 0, "original source must constrain this model");
  return {name, ...record};
});
assert.equal(result[0].collisionCount, 1);
assert.equal(result[0].contradictionCount, 1);
assert.deepEqual(result[0].firstContradiction,
  {first: 0, second: 179, first_argument: 76,
   second_argument: 255, first_gp: 24, second_gp: 18});
assert.deepEqual(result.map((r) => r.contradictionCount), [1, 72, 70, 74]);

// Positive: every integer polynomial automatically respects the necessary
// ring congruence, even for a substantial quadratic test polynomial.
const f = (x) => Number((BigInt(x) ** 2n + 37n * BigInt(x) + 91n) % (179n ** 2n));
for (const {x} of sources) {
  const output = x.map(f);
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < i; j++) {
      if (x[i] % 179 === x[j] % 179) {
        assert.equal(output[i] % 179, output[j] % 179);
      }
    }
  }
}
console.log(JSON.stringify({
  modulus: 179 ** 2, known_runes: known.length,
  known_first: corpus.translit[known[0]],
  known_last: corpus.translit[known[179]],
  positive_quadratic: "all congruence pairs satisfied",
  originals: result,
}, null, 2));
