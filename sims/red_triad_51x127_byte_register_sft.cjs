"use strict";

/**
 * Exact original-input capacity test for the source-motivated 51 x 127
 * byte-register hypothesis. No unknown plaintext/key is recovered.
 *
 * Source: original GP red triads p3 and p39, printed p49-51 256-byte grid,
 * p53's exactly 51 red runes and all 12,956 original unknown ciphertext runes.
 *
 * 12,956 = 2 + 51 * 127 * 2. Treat the first two runes as a possible header,
 * then each pair of GP indices as a GF(29^2) element. Division by the p39
 * polynomial produces a canonical 254-coefficient / 127-pair source register.
 *
 * Proposed row/column byte transport (for row r, column j):
 *   C[r,j] = a[r] * B[r,j] + Q[j] + hidden_beta[r]
 *   B[r,j] = [floor(byte/29), byte % 29], 0 <= byte <= 255.
 *
 * We grant EACH ROW any of all 841 hidden affine offsets beta[r], so this
 * capacity test is stronger than testing a guessed row seed. Two cases:
 *   a[r] = 1 (free row offsets); a[r] = u^(p53_red[r]), u^2=3u+8.
 *
 * Original ciphertext necessarily has a viable row offset for every row
 * under this canonical one-byte-per-pair scheme. Any row <127 refutes it.
 *
 * Execute: node sims/red_triad_51x127_byte_register_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");

/** @param {string} name @returns {any} */
function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}

/** @param {number} value @returns {number} */
function mod(value) {
  return ((value % 29) + 29) % 29;
}

/** @typedef {[number, number]} Field */
/** @param {Field} x @param {Field} y @returns {Field} */
function add(x, y) {
  return [mod(x[0] + y[0]), mod(x[1] + y[1])];
}

/** @param {Field} x @param {Field} y @returns {Field} */
function sub(x, y) {
  return [mod(x[0] - y[0]), mod(x[1] - y[1])];
}

/** @param {Field} x @param {Field} y @returns {Field} */
function mul(x, y) {
  // p3: 13+23u+2u^2=0 in F29; u^2 = 8+3u.
  return [
    mod(x[0] * y[0] + 8 * x[1] * y[1]),
    mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
  ];
}

/** @param {Field} x @param {number} exponent @returns {Field} */
function pow(x, exponent) {
  let result = /** @type {Field} */ ([1, 0]);
  let base = x;
  for (let n = exponent; n > 0; n = Math.floor(n / 2)) {
    if (n % 2 === 1) result = mul(result, base);
    base = mul(base, base);
  }
  return result;
}

/** @param {number[]} bytes @returns {Field[]} */
function sourceForcing(bytes) {
  assert.equal(bytes.length, 256);
  const a = bytes.slice().reverse().map(mod);
  const q = Array(254).fill(0);
  for (let j = 253; j >= 0; j--) {
    const x = mod(2 * a[j + 2]); // 15^-1 mod29
    q[j] = x;
    for (let k = 0; k < 3; k++) {
      a[j + k] = mod(a[j + k] - x * [27, 5, 15][k]);
    }
  }
  assert.deepEqual(a.slice(0, 2), [0, 0]);
  assert.equal(q[253], 0);
  return Array.from({length: 127}, (_, j) =>
    /** @type {Field} */ ([q[2 * j], q[2 * j + 1]]));
}

/**
 * Grant every row any possible unknown additive key. First decode its
 * source-fixed multiplier and quotient-column subtraction.
 * @param {number[]} ciphertext Exact GP-index ciphertext, including header
 * @param {Field[]} forcing Original grid quotient pairs
 * @param {number[]} red p53's exactly 51 original red GP indices
 * @param {"plain"|"red"} variant Public row-multiplier rule
 * @returns {number[]} Maximum canonical byte values per row over 841 keys
 */
function exactRowCapacities(ciphertext, forcing, red, variant) {
  assert.equal(ciphertext.length, 12956);
  assert.equal(red.length, 51);
  assert.equal(forcing.length, 127);
  const best = [];
  for (let row = 0; row < 51; row++) {
    const alpha = variant === "red" ? pow([0, 1], red[row]) :
      /** @type {Field} */ ([1, 0]);
    const alphaInverse = pow(alpha, 839); // every nonzero GF841 element^840=1
    assert.deepEqual(mul(alpha, alphaInverse), [1, 0]);
    const adjusted = Array.from({length: 127}, (_, j) => {
      const index = 2 + 2 * (row * 127 + j);
      return mul(alphaInverse, sub(
        /** @type {Field} */ ([ciphertext[index], ciphertext[index + 1]]),
        forcing[j]));
    });
    let maxValid = 0;
    for (let a = 0; a < 29; a++) {
      for (let b = 0; b < 29; b++) {
        let valid = 0;
        for (const x of adjusted) {
          if (29 * mod(x[0] - a) + mod(x[1] - b) < 256) valid++;
        }
        if (valid > maxValid) maxValid = valid;
      }
    }
    best.push(maxValid);
  }
  return best;
}

function main() {
  const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
  const ink = readJSON("resources/liber-primus/lp2-ink-annotations.json");
  const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
  const ciphertext = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  const forcing = sourceForcing(grid.pages.flatMap(p => p.bytes));
  const redSpan = ink.pages.find(p => p.page === 53).red_spans
    .find(span => span.start === 128 && span.length === 51);
  const red = [...redSpan.runes].map(rune => corpus.runes.indexOf(rune));
  assert.equal(red.length, 51);
  assert.ok(red.every(index => index >= 0 && index < 29));
  assert.equal((ciphertext.length - 2) / 2, 51 * 127);

  const literal = exactRowCapacities(ciphertext, forcing, red, "plain");
  const redField = exactRowCapacities(ciphertext, forcing, red, "red");
  assert.ok(literal.some(count => count < 127));
  assert.ok(redField.some(count => count < 127));

  // Positive: 6,477 independently chosen bytes encoded as canonical GP29
  // pairs, hidden row offsets, source quotient and p53 red field multipliers.
  const plant = ciphertext.slice();
  const expected = [];
  for (let row = 0; row < 51; row++) {
    const alpha = pow([0, 1], red[row]);
    const beta = /** @type {Field} */ ([(7 * row + 2) % 29, (17 * row + 4) % 29]);
    for (let j = 0; j < 127; j++) {
      const byte = (73 * (127 * row + j) + 41) % 256;
      expected.push(byte);
      const encoded = /** @type {Field} */ ([Math.floor(byte / 29), byte % 29]);
      const encrypted = add(add(mul(alpha, encoded), forcing[j]), beta);
      const index = 2 + 2 * (row * 127 + j);
      plant[index] = encrypted[0];
      plant[index + 1] = encrypted[1];
      // Exact left inverse given the true hidden beta and authentic source.
      const inverse = mul(pow(alpha, 839),
        sub(sub(encrypted, forcing[j]), beta));
      assert.equal(29 * inverse[0] + inverse[1], byte);
    }
  }
  assert.equal(expected.length, 6477);
  const positive = exactRowCapacities(plant, forcing, red, "red");
  assert.ok(positive.every(count => count === 127));
  const summary = counts => ({
    fullRows: counts.filter(n => n === 127).length,
    smallestBest: Math.min(...counts),
    largestBest: Math.max(...counts),
    meanBest: counts.reduce((sum, n) => sum + n, 0) / counts.length,
    firstTenRows: counts.slice(0, 10)
  });
  process.stdout.write(JSON.stringify({
    hypothesis: "51x127 canonical-byte, source-quotient GF841 transport with arbitrary secret row offsets",
    originalRuneCount: ciphertext.length,
    sourceQuotientPairs: forcing.length,
    sourceRedRunes: red.length,
    directField: summary(literal),
    redMultiplierField: summary(redField),
    originalCanonicalByteRegister: "excluded for both precisely specified source models",
    nativeBytePlant: summary(positive),
    recoveredNativeBytePlantCount: expected.length,
    caveat: "Does not exclude modular/noncanonical byte codings, unknown 256-element codebooks, differently framed pages, evolving within-row state or nonbyte plaintext."
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = {sourceForcing, exactRowCapacities};
