"use strict";

/**
 * Source-selected 179^2 extension-field terminal-256 original-known interpolation.
 * Original source p55 remains untouched; 180 independently clear p56/p57 are input.
 * Run under Windows Node.js 22: node sims/lp2_terminal179square_extensionfield_interpolation_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"
), "utf8"));

const PRIME = 179;
const FIELD_SIZE = PRIME * PRIME;

/** @param {number} a @returns {number} */
const residue = (a) => (a % PRIME + PRIME) % PRIME;
/** @param {number} a @param {number} b @returns {number} */
const pack = (a, b) => residue(a) + PRIME * residue(b);
/** @param {number} v @returns {[number, number]} */
const unpack = (v) => [v % PRIME, Math.floor(v / PRIME)];
/** @param {number} x @param {number} y @returns {number} */
const add = (x, y) => {
  const [a, b] = unpack(x);
  const [c, d] = unpack(y);
  return pack(a + c, b + d);
};
/** @param {number} x @returns {number} */
const negate = (x) => {
  const [a, b] = unpack(x);
  return pack(-a, -b);
};
/** @param {number} x @param {number} y @returns {number} */
const subtract = (x, y) => add(x, negate(y));
/** @param {number} x @param {number} y @returns {number} */
const multiply = (x, y) => {
  const [a, b] = unpack(x);
  const [c, d] = unpack(y);
  // alpha^2=2 is an irreducible extension polynomial over F_179.
  return pack(a * c + 2 * b * d, a * d + b * c);
};
/** @param {number} a @param {number} power @returns {number} */
function powPrime(a, power) {
  let r = 1;
  for (; power > 0; power >>= 1) {
    if (power & 1) r = (r * a) % PRIME;
    a = (a * a) % PRIME;
  }
  return r;
}
assert.equal(powPrime(2, 89), 178, "2 must be a quadratic nonresidue");
/** @param {number} x @returns {number} */
function inverse(x) {
  assert.notEqual(x, 0, "all field divisors must be nonzero");
  const [a, b] = unpack(x);
  const unit = powPrime(residue(a * a - 2 * b * b), PRIME - 2);
  return pack(a * unit, -b * unit);
}
assert.equal(multiply(179, 179), 2);
assert.equal(multiply(179, inverse(179)), 1);

// Embed 256 source positions in the smallest quadratic extension of F_179.
// Position 179 maps to alpha, 255 maps to 76+alpha, all inputs distinct.
const X = Array.from({length: 256}, (_, i) =>
  pack(i % PRIME, Math.floor(i / PRIME))
);
assert.equal(new Set(X).size, 256);
assert.equal(X[0], 0);
assert.equal(X[179], PRIME);
assert.equal(X[255], pack(76, 1));
assert.equal(corpus.pages[55].indices.length, 76);

const primeList = [];
for (let n = 2; primeList.length < 84; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { isPrime = false; break; }
  }
  if (isPrime) primeList.push(n);
}
let clock = 0;
const plain56 = corpus.pages[56].indices.map((c, i) => {
  if (i === 56) {
    assert.equal(c, 0);
    return 0;
  }
  return (c - (primeList[clock++] - 1) % 29 + 29) % 29;
});
assert.equal(clock, 84);
assert.deepEqual(plain56.slice(0, 5), [24, 9, 18, 9, 23]);
assert.equal(corpus.pages[57].indices.length, 95);
const plain = plain56.concat(corpus.pages[57].indices);
assert.equal(plain.length, 180);
assert.equal(plain[179], 18);

/**
 * Barycentric interpolation, unique polynomial of degree < n.
 * Coordinates are the untouched 180 terminal positions, first p56 rune at
 * source-terminal offset 76. The unknown 76 p55 runes never enter this fit.
 * @param {number[]} values source-known field elements
 */
function interpolate(values) {
  const n = values.length;
  const weight = [];
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      if (i !== j) product = multiply(product,
        subtract(X[76 + i], X[76 + j]));
    }
    weight.push(inverse(product));
  }

  /** @param {number} t @returns {number} */
  return (t) => {
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      if (t === X[76 + i]) return values[i];
      const w = multiply(weight[i], inverse(subtract(t, X[76 + i])));
      numerator = add(numerator, multiply(values[i], w));
      denominator = add(denominator, w);
    }
    return multiply(numerator, inverse(denominator));
  };
}
const fieldCode = interpolate(plain);
const recovered = X.slice(0, 76).map(fieldCode);
const fieldMemberCount = recovered.filter((v) => v < PRIME).length;
const validRuneCount = recovered.filter((v) => v < 29).length;
assert.equal(fieldMemberCount, 0);
assert.equal(validRuneCount, 0);
assert.equal(recovered[0], 3228); // 6 + 18 alpha
assert.deepEqual(recovered.slice(0, 10),
  [3228, 21418, 3984, 16546, 25509, 10563, 1369, 15112, 21120, 24764]);

// A separate, stronger source-native holdout for degree at most 178:
// 179 actual known samples predict the untouched last clear p57 rune.
const oneHeld = interpolate(plain.slice(0, 179))(X[255]);
assert.equal(oneHeld, 20188); // 140 + 112 alpha
assert.notEqual(oneHeld, plain[179]);

// Positive #1: a true nonconstant field polynomial is recovered at 76/76
// excluded inputs by the identical n=180 interpolation engine.
const evalPoly = (x) => add(
  add(17, multiply(3, x)),
  add(multiply(4, multiply(x, x)), multiply(5, (() => {
    let p = 1;
    for (let k = 0; k < 9; k++) p = multiply(p, x);
    return p;
  })()))
);
const plant = X.slice(76).map(evalPoly);
const plantRead = interpolate(plant);
assert.deepEqual(X.slice(0, 76).map(plantRead), X.slice(0, 76).map(evalPoly));

// Positive #2: genuine GP-rune-valued constant polynomial recovers all 76
// expected native runes, so native GP rejection is not a broken field decoder.
const native = interpolate(Array(180).fill(17));
assert.deepEqual(X.slice(0, 76).map(native), Array(76).fill(17));

console.log(JSON.stringify({
  field: "GF(179^2) with alpha^2=2",
  source_known_positions: 180, unknown_positions: 76,
  decoded_in_base_subfield: fieldMemberCount,
  decoded_valid_gp29: validRuneCount,
  first_prediction: unpack(recovered[0]),
  last_known_holdout_degree178: unpack(oneHeld),
  genuine_last_known_gp: plain[179],
  native_positive_recovered: 76,
  nonconstant_field_positive_recovered: 76,
}, null, 2));
