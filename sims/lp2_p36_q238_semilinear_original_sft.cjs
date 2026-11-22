"use strict";

/**
 * One complete frozen original-cipher inverse using the original p36 key
 * and the original 256-cell table's canonical GF(29^238) field.
 * Semilinear encoder alternatives:
 *   A: C = Frobenius(K * P)
 *   B: C = K * Frobenius(P)
 * The p36 source key is inverted with Euclidean arithmetic, not brute force.
 * Windows Node.js 22 SFT: node sims/lp2_p36_q238_semilinear_original_sft.cjs
 */
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { createHash } = require("node:crypto");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = join(__dirname, "..");
const corpus = JSON.parse(readFileSync(join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const bytes = JSON.parse(readFileSync(join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")).bytes;
assert.equal(bytes.length, 256);
assert.equal(createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const dimension = 238;
const mod = x => (x % 29 + 29) % 29;
const inverse = Array.from({ length: 29 }, (_, x) => x === 0 ? 0 :
  Array.from({ length: 28 }, (_, j) => j + 1).find(y => x * y % 29 === 1));

/** Mutable canonical GF29 polynomial representation, ascending coefficients. */
function trim(polynomial) {
  while (polynomial.length && polynomial[polynomial.length - 1] === 0) polynomial.pop();
  return polynomial;
}

/** Polynomial quotient/remainder over GF29, requires nonzero divisor. */
function divide(dividend, divisor) {
  assert(divisor.length && divisor[divisor.length - 1] !== 0);
  const r = trim(dividend.slice());
  const quotient = Array(Math.max(0, r.length - divisor.length + 1)).fill(0);
  while (r.length >= divisor.length) {
    const shift = r.length - divisor.length;
    const scale = mod(r[r.length - 1] * inverse[divisor[divisor.length - 1]]);
    quotient[shift] = scale;
    for (let j = 0; j < divisor.length; j++) r[shift + j] = mod(r[shift + j] - scale * divisor[j]);
    trim(r);
  }
  return [trim(quotient), r];
}

function multiplyPolynomials(a, b) {
  if (!a.length || !b.length) return [];
  const output = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) if (a[i] !== 0) {
    for (let j = 0; j < b.length; j++) if (b[j] !== 0) {
      output[i + j] = mod(output[i + j] + a[i] * b[j]);
    }
  }
  return trim(output);
}

function subtractPolynomials(a, b) {
  return trim(Array.from({ length: Math.max(a.length, b.length) },
    (_, i) => mod((a[i] ?? 0) - (b[i] ?? 0))));
}

// Derive Q238 afresh from the ORIGINAL grid; factors from established source factorization.
let Q = trim(bytes.slice().reverse().map(x => x % 29));
for (const factor of [
  [5, 1], [5, 1], [11, 18, 1], [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
]) {
  const [quotient, remainder] = divide(Q, factor);
  assert.equal(remainder.length, 0, "source polynomial factorization");
  Q = quotient;
}
assert.equal(Q.length, dimension + 1);
Q = Q.map(x => mod(x * inverse[Q[dimension]]));
assert.equal(Q[dimension], 1);

const pad = a => a.concat(Array(dimension - a.length).fill(0));

/** Multiply full GF29 field elements, reducing modulo the canonical Q238. */
function multiply(a, b) {
  assert.equal(a.length, dimension);
  assert.equal(b.length, dimension);
  return pad(divide(multiplyPolynomials(a, b), Q)[1]);
}

/** Extended Euclidean field inverse of nonzero source key, preserving all 238 coordinates. */
function invertKey(key) {
  let a = Q.slice(), b = trim(key.slice()), u = [], v = [1];
  while (b.length) {
    const [quotient, remainder] = divide(a, b);
    const next = subtractPolynomials(u, multiplyPolynomials(quotient, v));
    [a, b] = [b, remainder];
    [u, v] = [v, next];
  }
  assert.equal(a.length, 1, "source key is invertible");
  const inverseKey = pad(divide(u.map(x => mod(x * inverse[a[0]])), Q)[1]);
  assert.deepEqual(multiply(key, inverseKey), [1, ...Array(dimension - 1).fill(0)]);
  return inverseKey;
}

/** Build full GF29-linear Frobenius, then invert its 238x238 matrix exactly. */
function frobeniusPair() {
  function timesX(v) {
    const result = new Uint8Array(dimension);
    const top = v[dimension - 1];
    result[0] = mod(-top * Q[0]);
    for (let j = 1; j < dimension; j++) result[j] = mod(v[j - 1] - top * Q[j]);
    return result;
  }
  const F = Array.from({ length: dimension }, () => new Uint8Array(dimension));
  let vector = new Uint8Array(dimension);
  vector[0] = 1;
  for (let column = 0; column < dimension; column++) {
    for (let row = 0; row < dimension; row++) F[row][column] = vector[row];
    for (let power = 0; power < 29; power++) vector = timesX(vector);
  }
  const augmented = F.map((row, i) => {
    const array = new Uint8Array(2 * dimension);
    array.set(row);
    array[dimension + i] = 1;
    return array;
  });
  for (let j = 0; j < dimension; j++) {
    let pivot = j;
    while (pivot < dimension && !augmented[pivot][j]) pivot++;
    assert(pivot < dimension, "field Frobenius invertible");
    [augmented[j], augmented[pivot]] = [augmented[pivot], augmented[j]];
    const factor = inverse[augmented[j][j]];
    for (let k = j; k < dimension * 2; k++) augmented[j][k] = augmented[j][k] * factor % 29;
    for (let i = 0; i < dimension; i++) if (i !== j) {
      const scale = augmented[i][j];
      if (scale === 0) continue;
      for (let k = j; k < dimension * 2; k++) augmented[i][k] =
        mod(augmented[i][k] - scale * augmented[j][k]);
    }
  }
  return { forward: F, inverse: augmented.map(x => x.slice(dimension)) };
}

function transform(rows, vector) {
  assert.equal(vector.length, dimension);
  return rows.map(row => {
    let value = 0;
    for (let j = 0; j < dimension; j++) value += row[j] * vector[j];
    return value % 29;
  });
}

function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const rune of indices) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (indices.length * (indices.length - 1));
}

const p36 = corpus.pages.find(page => page.page === 36).indices;
const original = corpus.pages.filter(page => page.page < 56 && page.indices.length)
  .flatMap(page => page.indices);
const afterP36 = corpus.pages.filter(page => page.page < 37)
  .reduce((n, page) => n + page.indices.length, 0);
assert.equal(p36.length, dimension);
assert.equal(original.length, 12956);
assert.equal(afterP36, 8944);
const F = frobeniusPair();
const control = encodeSourceNativeGP(readFileSync(join(root, "resources/control/gibran_prophet_58585.txt"), "utf8"))
  .slice(0, dimension);
assert.equal(control.length, dimension);
assert.deepEqual(transform(F.inverse, transform(F.forward, control)), control);

const rows = [];
for (const reverseKey of [false, true]) {
  const key = reverseKey ? p36.slice().reverse() : p36.slice();
  const inverseKey = invertKey(key);

  for (const order of ["F(KP)", "K F(P)"]) {
    const plantCipher = order === "F(KP)"
      ? transform(F.forward, multiply(key, control))
      : multiply(key, transform(F.forward, control));
    const planted = order === "F(KP)"
      ? multiply(transform(F.inverse, plantCipher), inverseKey)
      : transform(F.inverse, multiply(plantCipher, inverseKey));
    assert.deepEqual(planted, control, "full native GP field-multiplied cipher positive control");

    for (const clock of ["book", "post-p36"]) {
      const start = clock === "book" ? 0 : afterP36;
      for (const reverseBlock of [false, true]) {
        const output = [];
        for (let offset = start; offset + dimension <= original.length; offset += dimension) {
          const cipher = original.slice(offset, offset + dimension);
          if (reverseBlock) cipher.reverse();
          const plain = order === "F(KP)"
            ? multiply(transform(F.inverse, cipher), inverseKey)
            : transform(F.inverse, multiply(cipher, inverseKey));
          if (reverseBlock) plain.reverse();
          output.push(...plain);
        }
        rows.push({ reverseKey, clock, reverseBlock, order,
          blocks: output.length / dimension, rate: ioc(output),
          first30: output.slice(0, 30).map(x => corpus.translit[x]).join(" ") });
      }
    }
  }
}
assert.equal(rows.length, 16);
const highest = Math.max(...rows.map(x => x.rate));
assert(highest < 0.03453, "original direct inverse produced unexpected native GP concentration");
assert(highest > 0.03452, "original cipher stream or source interpretation changed");
console.log(JSON.stringify({
  classification: "source-fixed original LP2 semilinear field inverse negative",
  exactKey: "original 238 GP runes on p36",
  operations: "F(KP) and K F(P), over exact source Q238",
  physicalSourceClocks: "p0 or first rune after p36",
  originalCount: original.length, testedModels: rows,
  highestIoc: highest, nativeGPControlIoc: ioc(control),
  nativeSourceCipherPlantRecovery: "238/238 for both operations and both p36 orientations"
}, null, 2));
