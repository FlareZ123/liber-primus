"use strict";

/**
 * Original LP2 short-feedback source-polynomial and all-secret bilinear gate.
 *
 * SFT: node sims/lp2_short_feedback_bilinear_allslope_sft.cjs
 * Node.js 22 CommonJS, no third-party dependencies. Exact source inputs,
 * full original ciphertext, solved-p57 holdout, source-native English plant.
 *
 * A cipher P_i = u*C_i + a*C_(i-1) + b*C_(i-2)
 *              + d*C_(i-1)*C_(i-2) + e (mod 29), u != 0,
 * is testable by only 29^3 normalised candidates. Multiplication by a
 * nonzero constant, addition of a constant, and any fixed outer alphabet
 * bijection preserve the index of coincidence (IoC). We therefore give
 * the model *all* coefficients and arbitrary outer fixed alphabet labels
 * without searching an unbounded key dictionary.
 *
 * This is a necessary-frequency diagnostic against native GP English, not
 * an exact theorem about all conceivable prose, and no source authorises
 * these exact feedback equations. No original unknown plaintext recovered.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const len = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(pages.length, 55);
assert.equal(len, 12956);

/** @param {number[]} values */
function coincidence(values) {
  const counts = new Int32Array(29);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number[][]} pieces  Explicit independent state-reset units
 * @returns {{z:Uint8Array,x:Uint8Array,y:Uint8Array,xy:Uint8Array,n:number}}
 */
function triples(pieces) {
  const n = pieces.reduce((s, p) => s + Math.max(0, p.length - 2), 0);
  const z = new Uint8Array(n);
  const x = new Uint8Array(n);
  const y = new Uint8Array(n);
  const xy = new Uint8Array(n);
  let t = 0;
  for (const v of pieces) {
    for (let i = 2; i < v.length; i++) {
      z[t] = v[i];
      x[t] = v[i - 1];
      y[t] = v[i - 2];
      xy[t] = v[i - 1] * v[i - 2] % 29;
      t++;
    }
  }
  assert.equal(t, n);
  return {z, x, y, xy, n};
}

/**
 * Full trial family: C_i+a*Cprev+b*Cprevprev+d*Cprev*Cprevprev mod29.
 * The additive constant and nonzero leading coefficient cannot alter IoC.
 * @param {ReturnType<typeof triples>} input
 * @param {boolean} bilinear  false -> linear d=0; true -> all 29 d
 * @returns {{a:number,b:number,d:number,ioc:number,n:number,above04:number,models:number}}
 */
function exhaust(input, bilinear) {
  const {z, x, y, xy, n} = input;
  assert(n >= 2);
  let winner = {a: -1, b: -1, d: -1, ioc: -1, n};
  let above04 = 0;
  let models = 0;
  const f = new Int32Array(29);
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      for (let d = 0; d < (bilinear ? 29 : 1); d++) {
        f.fill(0);
        for (let i = 0; i < n; i++) {
          f[(z[i] + a * x[i] + b * y[i] + d * xy[i]) % 29]++;
        }
        let eq = 0;
        for (const count of f) eq += count * (count - 1);
        const ioc = eq / (n * (n - 1));
        if (ioc >= 0.04) above04++;
        if (ioc > winner.ioc) winner = {a, b, d, ioc, n};
        models++;
      }
    }
  }
  assert.equal(models, bilinear ? 24389 : 841);
  return {...winner, above04, models};
}

/**
 * @param {number[][]} original
 * @param {number} a
 * @param {number} b
 * @param {number} d
 */
function encrypt(original, a, b, d) {
  return original.map(p => {
    const c = [];
    for (let i = 0; i < p.length; i++) {
      c.push(i < 2 ? p[i] :
        ((p[i] - a * c[i - 1] - b * c[i - 2] -
          d * c[i - 1] * c[i - 2]) % 29 + 29) % 29);
    }
    return c;
  });
}

/**
 * @param {number[][]} encrypted
 * @param {number} a
 * @param {number} b
 * @param {number} d
 */
function decrypt(encrypted, a, b, d) {
  return encrypted.map(c => c.map((v, i) => i < 2 ? v :
    (v + a * c[i - 1] + b * c[i - 2] +
      d * c[i - 1] * c[i - 2]) % 29));
}

/**
 * Apply a concrete source polynomial as a GF29 FIR on each physical page.
 * @param {number[][]} units
 * @param {number[]} coeff
 */
function polynomialFIR(units, coeff) {
  const output = [];
  for (const p of units) {
    for (let i = coeff.length - 1; i < p.length; i++) {
      let k = 0;
      for (let j = 0; j < coeff.length; j++) k += coeff[j] * p[i - j];
      output.push(k % 29);
    }
  }
  return coincidence(output);
}
const original = pages.map(p => p.indices);
const lin = exhaust(triples(original), false);
const bilinear = exhaust(triples(original), true);
assert.equal(lin.n, 12846);
assert.equal(bilinear.n, 12846);
assert.deepEqual([lin.a, lin.b, lin.d], [28, 0, 0]);
assert.deepEqual([bilinear.a, bilinear.b, bilinear.d], [28, 0, 0]);
assert(Math.abs(lin.ioc - 0.03532629883834534) < 1e-12);
assert(Math.abs(bilinear.ioc - 0.03532629883834534) < 1e-12);
assert.equal(lin.above04, 0);
assert.equal(bilinear.above04, 0);

// True original three-rune H and G numerals and their product, not fitted.
const sourcePolynomials = [
  ["2013 H", [3, 26, 24]],
  ["LP2 p39 G", [27, 5, 15]],
  ["product H*G", [23, 21, 11, 17, 12]]
];
const sourceReadouts = sourcePolynomials.flatMap(([name, coeff]) =>
  [coeff, coeff.slice().reverse()].map((c, direction) =>
    ({name, direction:direction ? "reverse" : "forward",
      n:len - 55 * (c.length - 1), ioc:polynomialFIR(original, c)})));
assert(sourceReadouts.every(x => x.ioc > 0.034 && x.ioc < 0.035));

const boundaries = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const all = original.flat();
assert.equal(all.length, boundaries.at(-1));
const chapterLinear = [];
for (let i = 0; i + 1 < boundaries.length; i++) {
  const unit = all.slice(boundaries[i], boundaries[i + 1]);
  const best = exhaust(triples([unit]), false);
  assert(best.ioc < 0.04);
  chapterLinear.push({section:i, runes:unit.length, ...best});
}
const clearP57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(clearP57.length, 95);
assert(Math.abs(coincidence(clearP57) - 0.06270996640537514) < 1e-12);

// Genuine English control in independently matched original physical lengths.
// The source-native GP orthography is calibrated to actual solved LP1 and p57.
const sourceEnglish = encodeSourceNativeGP(read(
  "resources/control/shakespeare_first300k.txt"));
assert.equal(sourceEnglish.length, 217106);
const plantPlain = sourceEnglish.slice(50000, 50000 + len);
let pos = 0;
const plantPages = original.map(p => {
  const a = plantPlain.slice(pos, pos + p.length);
  pos += p.length;
  return a;
});
assert.equal(pos, len);
const hidden = {a:7, b:11, d:3};
const plantCipher = encrypt(plantPages, hidden.a, hidden.b, hidden.d);
const plantFit = exhaust(triples(plantCipher), true);
assert.deepEqual([plantFit.a, plantFit.b, plantFit.d], [7, 11, 3],
  "blind 24,389-case recovery must identify the actual planted key");
assert(Math.abs(plantFit.ioc - 0.060527564700790945) < 1e-12);
assert.deepEqual(decrypt(plantCipher, hidden.a, hidden.b, hidden.d),
  plantPages, "source native English planted 12,956/12,956 recovery");
const sourcePlainIoC = coincidence(plantPlain);
assert(sourcePlainIoC > 0.055);

// Model invariance: independent affine scalings and alphabet permutations
// leave the histogram coincidence unchanged.
const normalized = plantCipher.flatMap((p, k) => p.slice(2)
  .map((v, i) => (v + hidden.a * p[i + 1] + hidden.b * p[i] +
    hidden.d * p[i + 1] * p[i]) % 29));
assert(Math.abs(coincidence(normalized) - plantFit.ioc) < 1e-12);
const relabeled = normalized.map(x => (7 * x + 11) % 29);
assert.equal(coincidence(normalized), coincidence(relabeled));

console.log(JSON.stringify({
  result:"original cipher fails every simple 2-lag GF29 bilinear inverse",
  pageCount:pages.length, originalRunes:len,
  originalTriples:lin.n,
  sourcePolynomials:sourceReadouts,
  linear:{models:lin.models, best:lin, chapterMaxima:chapterLinear},
  bilinear:{models:bilinear.models, best:bilinear},
  originalSolvedP57ClearIoC:coincidence(clearP57),
  heldOutSourceEnglishIoC:sourcePlainIoC,
  recoveredPlantedSecret:plantFit,
  recoveredPlantedRunes:len,
  originalPlaintextRecovered:0
}, null, 2));
