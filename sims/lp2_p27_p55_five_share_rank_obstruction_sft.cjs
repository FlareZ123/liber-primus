"use strict";

/**
 * Original-source exact GF29 five-share transfer obstruction.
 *
 * Intended human trail being tested (conditional, not authenticated):
 *  - physical LP2 p27 has a source-marked red heading of 19 runes, then 215=5*43 runes;
 *  - physical p55 has 43 strict word-interior runes after shedding word edges;
 *  - historical Cicada 2013 used five-of-ten Shamir secret sharing.
 *
 * Test all stationary GF29 degree<=2 polynomial readings of five p27
 * source symbols per output, under two original-order layouts, arbitrary
 * intercept, and an entirely secret fixed GP29 alphabet bijection. Exact
 * 5x5 and 20x20 determinant certificates exhaust all such coefficients.
 * No key or candidate plaintext is fitted. Node 22 CJS SFT:
 *   node sims/lp2_p27_p55_five_share_rank_obstruction_sft.cjs
 */

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.join(__dirname, "..");
const mod = (x) => ((x % 29) + 29) % 29;
const inv = (x) => {
  const v = mod(x);
  assert.ok(v !== 0, "cannot invert zero in GF29");
  for (let y = 1; y < 29; y += 1) if (v * y % 29 === 1) return y;
  throw new Error("no GF29 inverse");
};

/** Extract cross-checked original five-share source and 43-symbol target. */
function loadOriginal() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const text = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8");
  const ink = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
  const p27 = corpus.pages.find((p) => p.page === 27);
  const p55 = corpus.pages.find((p) => p.page === 55);
  const marks = ink.pages.find((p) => p.page === 27);
  assert.ok(p27 && p55 && marks);
  assert.equal(p27.indices.length, 234);
  assert.equal(p55.indices.length, 76);
  assert.equal(marks.red_spans.length, 1);
  assert.equal(marks.red_spans[0].start, 0);
  assert.equal(marks.red_spans[0].length, 19);
  const body = p27.indices.slice(19);
  assert.equal(body.length, 215);
  // The '%' transcription separator omits rune-free physical p50.
  const chunks = text.split("%");
  const runes = [...chunks[54].matchAll(/[\u16A0-\u16FF]/g)].map((m) => corpus.runes.indexOf(m[0]));
  assert.deepEqual(runes, p55.indices);
  // Printed "/" is a visual line wrap, not a word boundary. One NG rune at
  // p55 offset 0 is a carry from the preceding physical page's word.
  const words = chunks[54].replace(/\/\s*/g, "").split(/[-.]/)
    .map((segment) => [...segment.matchAll(/[\u16A0-\u16FF]/g)].map((m) => corpus.runes.indexOf(m[0])))
    .filter((w) => w.length);
  assert.deepEqual(words.map((w) => w.length), [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
  assert.equal(words[0].length, 1);
  const interior = words.slice(1).flatMap((w) => w.slice(1, -1));
  assert.equal(interior.length, 43);
  assert.equal(new Set(interior).size, 21);
  return {body, interior, translit: corpus.translit};
}

/**
 * Five inputs at output index i. Natural alternatives: five contiguous
 * 43-rune share strands or 43 successive five-rune share packets.
 */
function sourceRow(body, i, layout) {
  assert.ok(i >= 0 && i < 43);
  assert.ok(layout === "strands" || layout === "quintets");
  return Array.from({length: 5}, (_, k) => body[layout === "strands" ? 43 * k + i : 5 * i + k]);
}

/** Determinant in GF29 by exact modular Gaussian elimination. */
function determinant29(rows) {
  const n = rows.length;
  assert.ok(rows.every((r) => r.length === n));
  const a = rows.map((r) => r.map(mod));
  let det = 1;
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    while (pivot < n && a[pivot][column] === 0) pivot += 1;
    if (pivot === n) return 0;
    if (pivot !== column) {
      [a[pivot], a[column]] = [a[column], a[pivot]];
      det = mod(-det);
    }
    const pv = a[column][column];
    det = mod(det * pv);
    const inverse = inv(pv);
    for (let j = column; j < n; j += 1) a[column][j] = mod(a[column][j] * inverse);
    for (let i = column + 1; i < n; i += 1) {
      const factor = a[i][column];
      for (let j = column; j < n; j += 1) a[i][j] = mod(a[i][j] - factor * a[column][j]);
    }
  }
  return det;
}

/**
 * Fixed original p55 equal-symbol pairs. If an unknown GP29 alphabet map
 * is bijective, equality in the target forces equality before that map.
 */
const WITNESS = [[0, 14], [0, 39], [1, 13], [1, 28], [1, 38]];

/** Return five exact equations D*w=0 forced by original target repetition. */
function forcedMatrix(source, target, layout) {
  return WITNESS.map(([i, j]) => {
    assert.equal(target[i], target[j], "source target repeat pair " + i + ":" + j);
    const x = sourceRow(source, i, layout);
    const y = sourceRow(source, j, layout);
    return x.map((v, k) => mod(v - y[k]));
  });
}

/**
 * Full GP29 polynomial feature basis in five inputs of total degree <=2,
 * except its constant monomial. Order is x[0..4], then x_i*x_j for i<=j.
 * The constant cancels in all target-equality difference equations.
 */
function quadraticFeatures(row) {
  assert.equal(row.length, 5);
  const features = row.slice();
  for (let i = 0; i < 5; i += 1) {
    for (let j = i; j < 5; j += 1) features.push(mod(row[i] * row[j]));
  }
  assert.equal(features.length, 20);
  return features;
}

/**
 * Twenty repeated-runic p55 interior pairs form a square original-source
 * difference matrix for all 20 nonconstant degree <=2 monomials.
 */
const QUADRATIC_WITNESS = [
  [0, 14], [0, 39], [1, 13], [1, 28], [1, 38],
  [2, 26], [2, 33], [3, 29], [3, 31], [4, 22],
  [5, 34], [5, 35], [6, 23], [9, 16], [9, 40],
  [10, 37], [12, 30], [17, 24], [18, 25], [21, 32]
];

/** Original target equality constraints on any stationary quadratic output. */
function quadraticForcedMatrix(source, target, layout) {
  return QUADRATIC_WITNESS.map(([i, j]) => {
    assert.equal(target[i], target[j], "quadratic witness target equality " + i + ":" + j);
    const x = quadraticFeatures(sourceRow(source, i, layout));
    const y = quadraticFeatures(sourceRow(source, j, layout));
    return x.map((v, k) => mod(v - y[k]));
  });
}

/** An independent degree-two GP29 plant with true nonlinear recovery. */
function quadraticPositiveControl() {
  const rows = Array.from({length: 43}, (_, i) =>
    Array.from({length: 5}, (_, k) => mod(i * (k + 3) + i * i * (k + 7) + 5 * k + 11)));
  const weights = [7, 0, 9, 2, 13, ...Array.from({length: 15}, (_, k) => mod(3 * k + 1))];
  assert.equal(weights.length, 20);
  const latent = rows.map((row) =>
    mod(4 + quadraticFeatures(row).reduce((a, v, k) => a + weights[k] * v, 0)));
  const encoded = latent.map((v) => mod(11 * v + 3));
  const recovered = encoded.map((v) => mod((v - 3) * inv(11)));
  assert.deepEqual(recovered, latent);
  for (let i = 0; i < 43; i += 1) for (let j = i + 1; j < 43; j += 1) {
    if (encoded[i] !== encoded[j]) continue;
    const x = quadraticFeatures(rows[i]);
    const y = quadraticFeatures(rows[j]);
    assert.equal(mod(x.reduce((a, v, k) => a + weights[k] * mod(v - y[k]), 0)), 0);
  }
  return {recovered: recovered.length, quadraticTerms: 15};
}

/** Historical 2013 five-of-ten Shamir weights, adapted to GF29. */
function lagrangeWeightsAtZero(ids) {
  assert.equal(ids.length, 5);
  assert.equal(new Set(ids).size, 5);
  return ids.map((x, k) => {
    let value = 1;
    for (let j = 0; j < ids.length; j += 1) if (j !== k) {
      value = mod(value * mod(-ids[j]) * inv(x - ids[j]));
    }
    return value;
  });
}

/** One fixed polynomial-linear consumer with arbitrary secret constant. */
function applyWeights(rows, weights, intercept = 0) {
  return rows.map((row) => mod(intercept + row.reduce((a, x, i) => a + x * weights[i], 0)));
}

/** Positive-control synthetic source layout, as a true 5-share transfer. */
function positiveControl() {
  const rows = Array.from({length: 43}, (_, i) =>
    Array.from({length: 5}, (_, k) => (i * 17 + k * 11 + i * i * (k + 3) + 7) % 29));
  const weights = lagrangeWeightsAtZero([1, 2, 3, 4, 5]);
  const latent = applyWeights(rows, weights, 9);
  const encoded = latent.map((value) => mod(7 * value + 11)); // 7 invertible in GF29
  const recovered = encoded.map((value) => mod((value - 11) * inv(7)));
  assert.deepEqual(recovered, latent);
  // Any equal-output pair yields a row difference orthogonal to real weights.
  for (let i = 0; i < 43; i += 1) for (let j = i + 1; j < 43; j += 1) {
    if (encoded[i] !== encoded[j]) continue;
    const delta = rows[i].map((x, k) => mod(x - rows[j][k]));
    assert.equal(mod(delta.reduce((a, x, k) => a + x * weights[k], 0)), 0);
  }
  return {recovered: recovered.length, weights};
}

function main() {
  const {body, interior, translit} = loadOriginal();
  const planted = positiveControl();
  const quadraticPlant = quadraticPositiveControl();
  const expectedMatrices = {
    strands: [
      [28, 12, 8, 16, 21], [21, 21, 2, 3, 27], [19, 12, 6, 14, 23],
      [18, 22, 15, 16, 14], [3, 19, 25, 22, 12]
    ],
    quintets: [
      [20, 19, 19, 26, 26], [9, 18, 14, 22, 12], [5, 25, 22, 11, 26],
      [5, 26, 14, 11, 26], [4, 25, 7, 16, 0]
    ]
  };
  const evidence = ["strands", "quintets"].map((layout) => {
    const matrix = forcedMatrix(body, interior, layout);
    assert.deepEqual(matrix, expectedMatrices[layout]);
    const det = determinant29(matrix);
    assert.equal(det, layout === "strands" ? 11 : 22);
    // Nonzero determinant forces every stationary five-input linear weight
    // to 0; arbitrary offset then gives a constant, while target has 21 glyphs.
    assert.ok(new Set(interior).size > 1);
    const weights = lagrangeWeightsAtZero([1, 2, 3, 4, 5]);
    const rows = Array.from({length: 43}, (_, i) => sourceRow(body, i, layout));
    const canonical = applyWeights(rows, weights);
    const literalMatches = canonical.filter((v, i) => v === interior[i]).length;
    assert.equal(literalMatches, layout === "strands" ? 2 : 0);
    const quadraticMatrix = quadraticForcedMatrix(body, interior, layout);
    const quadraticDet = determinant29(quadraticMatrix);
    assert.equal(quadraticDet, layout === "strands" ? 8 : 11);
    assert.ok(quadraticDet !== 0);
    return {layout, determinantMod29: det, witnessPairs: WITNESS, witnessDifferences: matrix,
      canonicalShamirWeights: weights, canonicalLiteralMatches: literalMatches,
      quadratic: {nonconstantTerms: 20, witnessPairs: QUADRATIC_WITNESS,
        matrixDeterminantMod29: quadraticDet, secretFixedBijectionPossible: false},
      directFixedAlphabetFiveShareTransferPossible: false};
  });
  const summary = {scope: "p27 black 215 = five times p55 strict interior 43, both natural layouts",
    source: {p27RedTitle: 19, p27Body: 215, p55Interior: 43, p55Distinct: 21},
    planted, quadraticPlant, evidence,
    conclusion: "All stationary degree <=2 GF29 polynomial five-input consumers with arbitrary intercept and fixed bijective secret output alphabet are inconsistent with original target-equality classes; independent key use remains untested."};
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

module.exports = {loadOriginal, sourceRow, determinant29, forcedMatrix, quadraticFeatures, quadraticForcedMatrix, lagrangeWeightsAtZero, applyWeights, positiveControl, quadraticPositiveControl, main};
if (require.main === module) main();
