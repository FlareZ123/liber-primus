"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(ROOT, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const M = 29;

/** @param {number} n @returns {number} */
function mod(n) { return ((n % M) + M) % M; }

/** @param {number[]} coeff @param {number} x @returns {number[]} */
function hasseJet3(coeff, x) {
  // Descending polynomial coefficients. Evaluate P(x+z), truncating at z^3.
  const t = [0, 0, 0, 0];
  for (const raw of coeff) {
    for (let j = 3; j >= 1; --j) t[j] = mod(t[j] * x + t[j - 1]);
    t[0] = mod(t[0] * x + raw);
  }
  return t;
}

/** @param {number[]} coeff @param {number} x @returns {number} */
function directDerivative(coeff, x) {
  let d = 0;
  for (let i = 0; i < coeff.length - 1; ++i) {
    const exponent = coeff.length - 1 - i;
    let power = 1;
    for (let j = 0; j < exponent - 1; ++j) power = mod(power * x);
    d = mod(d + mod(coeff[i]) * mod(exponent) * power);
  }
  return d;
}

/** @param {string[]} tokens @param {string} alphabet @param {number} radix @returns {number[]} */
function decodeTokens(tokens, alphabet, radix) {
  return tokens.map((t) => {
    assert.equal(t.length, 2);
    const hi = alphabet.indexOf(t[0]);
    const lo = alphabet.indexOf(t[1]);
    assert.ok(hi >= 0 && lo >= 0, "unknown table digit");
    const value = hi * radix + lo;
    assert.ok(value >= 0 && value <= 255, "not a byte");
    return value;
  });
}

/** @param {number[]} a @returns {number[]} */
function columnMajor(a) {
  return Array.from({length: 8}, (_, c) => Array.from({length: 32}, (_, r) => a[8 * r + c])).flat();
}

/** @param {number[]} coeff @returns {number[]} */
function derivativeRoots(coeff) {
  return Array.from({length: 29}, (_, i) => i).filter((x) => hasseJet3(coeff, x)[1] === 0);
}

function main() {
  assert.equal(corpus.runes.length, 29);
  const tree = corpus.pages.find((p) => p.page === 32);
  assert.ok(tree);
  assert.equal(tree.indices.length, 121);
  const primes = corpus.prime;
  const topRow = tree.indices.slice(0, 11).map((i) => primes[i]);
  const leftCol = Array.from({length: 11}, (_, r) => primes[tree.indices[11 * r]]);
  assert.deepEqual(topRow, [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]);
  assert.deepEqual(leftCol, [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]);
  const width2016 = topRow.reduce((s, x) => s + x, 0);
  const height2016 = leftCol.reduce((s, x) => s + x, 0);
  assert.equal(width2016, 563);
  assert.equal(height2016, 569);

  // The original 2012 image was 509 x 503; the signed 2016 image is 563 x 569.
  // In 2012, the *explicitly instructed* image-dimension operation multiplied by 3301.
  assert.deepEqual([width2016 - 503, height2016 - 509], [60, 60]);
  const old2012Address = 509 * 503 * 3301;
  const analogous2016Number = width2016 * height2016 * 3301;
  assert.equal(old2012Address, 845145127);
  assert.equal(analogous2016Number, 1057465447);

  // The new hypothesis derives both previously known derivative arguments
  // from a separate Cicada image and the previously used 3301 factor.
  const areaResidue = (width2016 * height2016) % M;
  const cicadaResidue = 3301 % M;
  assert.deepEqual([areaResidue, cicadaResidue], [13, 24]);

  const tokens = table.pages.flatMap((p) => p.tokens);
  assert.equal(tokens.length, 256);
  const cases = [];
  for (const [radix, alphabet] of [[60, table.alphabet], [59, table.alphabet.replace("f", "")]]) {
    assert.equal(alphabet.length, radix);
    const bytes = decodeTokens(tokens, alphabet, radix);
    for (const [reading, coeff] of [
      ["row", bytes],
      ["row-reversed", [...bytes].reverse()],
      ["column", columnMajor(bytes)],
      ["column-reversed", columnMajor(bytes).reverse()],
    ]) {
      const d13 = hasseJet3(coeff, areaResidue);
      const d24 = hasseJet3(coeff, cicadaResidue);
      assert.equal(d13[1], directDerivative(coeff, areaResidue));
      assert.equal(d24[1], directDerivative(coeff, cicadaResidue));
      cases.push({radix, reading, roots: derivativeRoots(coeff), d13, d24});
    }
  }

  assert.deepEqual(cases.map((x) => x.roots), [
    [13, 24], [20, 23, 27], [7, 21], [1],
    [], [], [25], [28],
  ]);
  assert.deepEqual(cases[0].d13, [8, 0, 4, 13]);
  assert.deepEqual(cases[0].d24, [0, 0, 26, 6]);
  assert.equal(cases.filter((x) => x.d13[1] === 0 && x.d24[1] === 0).length, 1);

  console.log("PASS: source p32 11x11 prime axes = signed 2016 563x569");
  console.log("PASS: 2012 prime image 509x503 and explicit 3301 rule produce 845145127");
  console.log("HYPOTHESIS: 2016 analogue", analogous2016Number, "and prime-dimension set +60");
  console.log("SOURCE-LOCKED GF29 arguments: signed-image area =", areaResidue, "; 3301 =", cicadaResidue);
  for (const c of cases) {
    console.log(JSON.stringify({radix: c.radix, reading: c.reading, roots: c.roots,
      at13: c.d13, at24: c.d24}));
  }
  console.log("PASS: only forward row-major base60 P'(13)=P'(24)=0, no original LP2 plaintext claimed");
}

main();
