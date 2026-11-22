"use strict";
/**
 * Original LP2 p3-p7 five-page scroll: source-fixed 5-word-product
 * GP29 Hill-block and causal five-product filter inversions.
 *
 * SFT: node sims/lp2_p3_p7_five_scroll_product_inverse_sft.cjs
 * Windows 11 / Node.js 22 / CommonJS, read-only, no dependency install.
 *
 * All p3-p7 original runes and word/page carries remain present.
 * Models are source-motivated conjectures. Failure to recover ordinary
 * source-native GP prose is not a solution or an all-cipher impossibility.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = s => fs.readFileSync(path.join(root, s), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const originalPages = gp.pages.filter(p => p.page >= 3 && p.page <= 7);
assert.deepEqual(originalPages.map(p => p.indices.length),
  [217, 261, 263, 196, 208]);
const C = originalPages.flatMap(p => p.indices);
assert.equal(C.length, 1145);
assert.equal(C.length / 5, 229);
const sourceP7 = gp.pages.find(p => p.page === 7);
const red = annotations.pages.find(p => p.page === 7).red_spans[0];
assert.equal(red.start, 194);
assert.equal(red.length, 14);
const redValues = sourceP7.indices.slice(red.start, red.start + red.length);
assert.equal(redValues.map(v => gp.runes[v]).join(""), red.runes);
const wordLens = [2, 4, 3, 2, 3];
let o = 0;
const taps = wordLens.map(n => {
  const value = redValues.slice(o, o + n)
    .reduce((product, rune) => product * rune % 29, 1);
  o += n;
  return value;
});
assert.equal(o, 14);
assert.deepEqual(taps, [11, 26, 8, 15, 2]);
const mod = n => (n % 29 + 29) % 29;
function inverse(v) {
  assert(v >= 1 && v < 29);
  for (let x = 1; x < 29; x++) if ((v * x) % 29 === 1) return x;
  throw Error("noninvertible in GF29");
}
function multiply(a, b) {
  return a.map(row => b[0].map((_, col) => mod(
    row.reduce((sum, value, k) => sum + value * b[k][col], 0))));
}
function gaussJordan(matrix) {
  const m = matrix.map((row, i) => row.map(mod).concat(
    Array.from({length: 5}, (_, j) => i === j ? 1 : 0)));
  for (let i = 0; i < 5; i++) {
    let pivot = i;
    while (pivot < 5 && m[pivot][i] === 0) pivot++;
    assert(pivot < 5);
    [m[pivot], m[i]] = [m[i], m[pivot]];
    const inv = inverse(m[i][i]);
    for (let j = 0; j < 10; j++) m[i][j] = mod(m[i][j] * inv);
    for (let k = 0; k < 5; k++) if (k !== i) {
      const scale = m[k][i];
      for (let j = 0; j < 10; j++)
        m[k][j] = mod(m[k][j] - scale * m[i][j]);
    }
  }
  return m.map(row => row.slice(5));
}
const M = Array.from({length: 5}, (_, i) =>
  taps.map((_, j) => taps[(j - i + 5) % 5]));
const Minv = gaussJordan(M);
assert.deepEqual(Minv[0], [23, 2, 5, 2, 19]);
assert.deepEqual(multiply(M, Minv),
  Array.from({length: 5}, (_, i) =>
    Array.from({length: 5}, (_, j) => i === j ? 1 : 0)));
const transpose = matrix => matrix[0].map((_, i) =>
  matrix.map(row => row[i]));
function matrixApply(seq, matrix, layout) {
  assert.equal(seq.length % 5, 0);
  const result = Array(seq.length).fill(0);
  const span = seq.length / 5;
  for (let block = 0; block < span; block++) {
    const pos = Array.from({length: 5}, (_, j) =>
      layout === "adjacent" ? 5 * block + j : j * span + block);
    for (let j = 0; j < 5; j++)
      result[pos[j]] = mod(matrix[j].reduce(
        (sum, value, k) => sum + value * seq[pos[k]], 0));
  }
  return result;
}
function ioc(seq) {
  const counts = new Uint32Array(29);
  for (const v of seq) { assert(v >= 0 && v < 29); counts[v]++; }
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}

/**
 * The five-word product packet as either a Hill row M or its inverse,
 * with the only source-driven two complete five-column linear layouts.
 * No fitted offset, key, alphabet or missing source glyph is admitted.
 */
const hill = [];
for (const [name, matrix, reverse] of [
  ["M", M, Minv], ["M-inverse", Minv, M]]) {
  for (const [orientation, operation, invOperation] of [
    ["printed", matrix, reverse],
    ["transpose", transpose(matrix), transpose(reverse)]]) {
    for (const layout of ["adjacent", "five-columns"]) {
      const plain = matrixApply(C, operation, layout);
      assert.deepEqual(matrixApply(plain, invOperation, layout), C);
      hill.push({name, orientation, layout, ioc: ioc(plain),
        E: plain.filter(x => x === 18).length,
        prefix: plain.slice(0, 30).map(x => gp.translit[x]).join(" ")});
    }
  }
}
assert.equal(hill.length, 8);
assert(Math.max(...hill.map(h => h.ioc)) < 0.035);

/**
 * Invertible five-word-product causal polynomial filters. Direct 5-tap
 * C_i = sum(w_j P_(i-j),j=0..4), or 5-lag feedback
 * C_i = P_i +/- sum(w_j P_(i-j),j=1..5).
 * Only printed/reversed product order; source-visible reset positions:
 * one scroll, physical pages, or actual physical red/punctuation spans.
 */
const scopeParts = {};
scopeParts.scroll = [C];
scopeParts.pages = originalPages.map(p => p.indices);
scopeParts.redPunctuation = [];
for (const p of originalPages) {
  const cuts = p.page === 3 ? [0,16,119,122,p.indices.length]
    : p.page === 6 ? [0,71,82,p.indices.length]
    : p.page === 7 ? [0,194,p.indices.length]
    : [0,p.indices.length];
  for (let i = 1; i < cuts.length; i++)
    scopeParts.redPunctuation.push(p.indices.slice(cuts[i-1],cuts[i]));
}
assert(scopeParts.redPunctuation.every(x => x.length));
assert.deepEqual(scopeParts.redPunctuation.flat(), C);

function causalDecode(seq, weights, kind) {
  const out = [];
  const direct = kind === "direct-plus" || kind === "direct-minus";
  const plus = kind === "direct-plus" || kind === "feedback-plus";
  const factor = direct ? inverse(weights[0]) : 1;
  for (let i = 0; i < seq.length; i++) {
    let rhs = seq[i];
    for (let j = 1; j <= (direct ? 4 : 5); j++) {
      if (i < j) continue;
      rhs += (plus ? -1 : 1) * weights[direct ? j : j - 1] * out[i-j];
    }
    out.push(mod(rhs * factor));
  }
  return out;
}
function causalEncrypt(plain, weights, kind) {
  const direct = kind === "direct-plus" || kind === "direct-minus";
  const plus = kind === "direct-plus" || kind === "feedback-plus";
  return plain.map((v, i) => {
    let x = direct ? weights[0] * v : v;
    for (let j = 1; j <= (direct ? 4 : 5); j++) {
      if (i < j) continue;
      x += (plus ? 1 : -1) *
        weights[direct ? j : j - 1] * plain[i-j];
    }
    return mod(x);
  });
}
const causal = [];
for (const [scope, parts] of Object.entries(scopeParts))
  for (const [orientation, weights] of [
    ["printed", taps], ["reverse", taps.slice().reverse()]])
    for (const kind of ["direct-plus", "direct-minus",
      "feedback-plus", "feedback-minus"]) {
      const decoded = parts.flatMap(x => causalDecode(x, weights, kind));
      assert.deepEqual(C, decoded.length === C.length
        ? parts.map((x,i) => causalEncrypt(
          causalDecode(x, weights, kind), weights, kind)).flat()
        : []);
      causal.push({scope, orientation, kind, ioc: ioc(decoded),
        E: decoded.filter(x => x === 18).length,
        prefix: decoded.slice(0, 30).map(x => gp.translit[x]).join(" ")});
    }
assert.equal(causal.length, 24);
assert(Math.max(...causal.map(h => h.ioc)) < 0.035);

/** Plant exact genuine solved p57 GP runes; verify both architecture inverses. */
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const known = Array.from({length: 1145}, (_, i) => p57[i % 95]);

/**
 * Authentic 2014 signed-stage magic squares transfer onto actual p3-p7
 * five-page 1145-rune receiver. Two historic 5x5 integer matrices give
 * exactly 16 complete reversible GF29 interpretations:
 * two original squares × direct/inverse × row/column transpose ×
 * adjacent-five/229-long-five-column source original geometry.
 *
 * This independently motivated external key source is contemporary
 * Cicada-origin input, without a claimed LP2 consumer instruction.
 */
const historicalSquareBlocks = read(
  "resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/)
  .map(block => block.trim().split(/\r?\n/)
    .map(row => row.trim().split(/\s+/).map(Number)));
assert.deepEqual(historicalSquareBlocks.map(x => x.length), [5,7,5]);
assert.deepEqual(historicalSquareBlocks[0][0],
  [434,1311,312,278,966]);
assert.deepEqual(historicalSquareBlocks[2][0],
  [272,138,341,131,151]);
const historicalMagicMatrices = [
  ["2014-original-magic3301", historicalSquareBlocks[0]],
  ["2014-original-magic1033", historicalSquareBlocks[2]]
];
const identity5 = Array.from({length:5},(_,i)=>
  Array.from({length:5},(_,j)=>i===j?1:0));
const historicalMagic = [];
for (const [squareName, originalMatrix] of historicalMagicMatrices) {
  const inverseMatrix = gaussJordan(originalMatrix);
  assert.deepEqual(multiply(originalMatrix, inverseMatrix), identity5);
  assert.deepEqual(multiply(inverseMatrix, originalMatrix), identity5);
  for (const [direction, matrix, matrixInverse] of [
    ["as-printed", originalMatrix, inverseMatrix],
    ["matrix-inverse", inverseMatrix, originalMatrix]
  ]) {
    for (const [orientation, operation, opposite] of [
      ["normal", matrix, matrixInverse],
      ["transposed", transpose(matrix), transpose(matrixInverse)]
    ]) {
      for (const layout of ["adjacent", "five-columns"]) {
        const sourceDerived = matrixApply(C, operation, layout);
        assert.deepEqual(matrixApply(sourceDerived, opposite, layout), C);
        const plantedCipher = matrixApply(known, opposite, layout);
        assert.deepEqual(matrixApply(plantedCipher, operation, layout), known);
        historicalMagic.push({
          squareName, direction, orientation, layout,
          recoveredRunes:sourceDerived.length, ioc:ioc(sourceDerived),
          E:sourceDerived.filter(v=>v===18).length,
          prefix:sourceDerived.slice(0,30).map(v=>gp.translit[v]).join(" ")
        });
      }
    }
  }
}
assert.equal(historicalMagic.length, 16);
const historicalMagicMax = Math.max(...historicalMagic.map(x=>x.ioc));
const historicalMagicMin = Math.min(...historicalMagic.map(x=>x.ioc));
assert(Math.abs(historicalMagicMax - 0.03487342351971173) < 1e-12);
assert(Math.abs(historicalMagicMin - 0.03422450911533881) < 1e-12);
assert(historicalMagicMax < 0.035);

let plants = 0;
for (const [matrix, opposite] of [
  [M, Minv], [Minv, M]]) {
  for (const [op, inv] of [
    [matrix, opposite], [transpose(matrix), transpose(opposite)]]) {
    for (const layout of ["adjacent", "five-columns"]) {
      const cipher = matrixApply(known, op, layout);
      assert.deepEqual(matrixApply(cipher, inv, layout), known);
      plants++;
    }
  }
}
for (const [orientation, weights] of [
  ["printed", taps], ["reverse", taps.slice().reverse()]])
  for (const kind of ["direct-plus", "direct-minus",
    "feedback-plus", "feedback-minus"]) {
    for (const [scope, originalParts] of Object.entries(scopeParts)) {
      let start = 0;
      const pieces = originalParts.map(x => {
        const p = known.slice(start, start + x.length);
        start += x.length;
        return p;
      });
      assert.equal(start, known.length);
      const cipher = pieces.map(p => causalEncrypt(p, weights, kind));
      assert.deepEqual(cipher.flatMap(c => causalDecode(c, weights, kind)),
        known);
      plants++;
    }
  }
assert.equal(plants, 32);

/** Source-native, exact-length unmodified control windows. */
const {encodeSourceNativeGP} = require(
  "./lp2_native_gp_source_orthography_sft.cjs");
const wordLists = [
  ["Gibran", read("resources/control/gibran_prophet_58585.txt")],
  ["Shakespeare", read("resources/control/shakespeare_first300k.txt")],
  ["Emerson", read("resources/control/emerson_essays_2944.txt")]
];
const latin = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split("\n").map(s => s.trim()).filter(s => s && !s.startsWith("#"));
const alpha = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinRunes = latin.flatMap(s => Array.from(s, r => alpha.indexOf(r)));
assert(latinRunes.every(x => x >= 0 && x < 29));
const controls = {};
for (const [label, prose] of wordLists) {
  const encoded = encodeSourceNativeGP(prose);
  const windows = [];
  for (let at = 0; at + C.length <= encoded.length; at += C.length)
    windows.push(ioc(encoded.slice(at, at + C.length)));
  controls[label] = {n: windows.length, minimum: Math.min(...windows),
    maximum: Math.max(...windows)};
}
const latinWindows = [];
for (let at = 0; at + C.length <= latinRunes.length; at += C.length)
  latinWindows.push(ioc(latinRunes.slice(at, at + C.length)));
controls.Latin = {n:latinWindows.length,
  minimum:Math.min(...latinWindows),maximum:Math.max(...latinWindows)};
assert.deepEqual(Object.fromEntries(Object.entries(controls)
  .map(([k,v]) => [k, v.n])), {
  Gibran: 54, Shakespeare: 189, Emerson: 280, Latin: 178
});
const controlMin = Math.min(...Object.values(controls).map(z => z.minimum));
const upper = Math.max(...hill.concat(causal).map(c => c.ioc));
assert(controlMin > 0.05);
assert(historicalMagicMax < controlMin);
assert(upper < 0.035);
const originalIoc = ioc(C);
assert(Math.abs(originalIoc - 0.034633706904449266) < 1e-12);


/**
 * Historical five-of-five Shamir secret reconstruction on a scroll whose
 * original 1,145 runes permit five 229-rune shares. Coordinate choices:
 * independently measured five-dot horizontal/vertical ranks, and five
 * complete source-red-word products, all distinct in GF29. For each
 * layout, interpolation extracts 229 runes without fitting a key.
 *
 * Original p7 dot centers/ranks independently measured in
 * im-results/lp2-p7-fivedot-shamir-dual-dh-source-gate.md.
 */
const sourceShareCoords = {
  dotHorizontal: [1, 2, 3, 4, 5],
  dotVertical: [3, 5, 1, 4, 2],
  redProducts: taps
};
function lagrangeZeroWeights(xs) {
  assert.equal(xs.length, 5);
  assert.equal(new Set(xs).size, 5);
  return xs.map((x, i) => {
    let weight = 1;
    for (let j = 0; j < 5; j++) if (i !== j)
      weight = mod(weight * mod(-xs[j]) * inverse(mod(x - xs[j])));
    return weight;
  });
}
function interpolateScroll(input, weights, layout) {
  assert.equal(input.length, 1145);
  return Array.from({length: 229}, (_, k) => mod(weights.reduce(
    (sum, weight, j) => sum + weight *
      input[layout === "adjacent" ? 5 * k + j : 229 * j + k], 0)));
}
const shamir = [];
const shamirRecoveredKnown = Array.from({length: 229},
  (_, i) => p57[i % p57.length]);
for (const [coordinateName, coords] of Object.entries(sourceShareCoords)) {
  const weights = lagrangeZeroWeights(coords);
  for (const layout of ["adjacent", "229-strided"]) {
    const unknown = interpolateScroll(C, weights, layout);
    shamir.push({coordinateName, coordinates: coords, weights, layout,
      recoveredRunes: unknown.length, ioc: ioc(unknown),
      E: unknown.filter(x => x === 18).length,
      prefix: unknown.slice(0, 30).map(x => gp.translit[x]).join(" ")});
  }
}
assert.equal(shamir.length, 6);
assert.deepEqual(shamir.map(x => x.weights), [
  [5,19,10,24,1],[5,19,10,24,1],
  [10,1,5,24,19],[10,1,5,24,19],
  [6,14,20,3,16],[6,14,20,3,16]
]);
assert.deepEqual(shamir.map(x => x.ioc), [
  0.032866007814295564, 0.03435991726039991,
  0.033747031333793, 0.033747031333793,
  0.03443652800122577, 0.03501110855741975
]);
/** Build genuine degree-4 GP29 source shares, recovering 229 p57 runes. */
let shamirPlants = 0;
let seed = 0x33010505;
function randomCoeff() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % 29;
}
for (const [_, coords] of Object.entries(sourceShareCoords))
  for (const layout of ["adjacent", "229-strided"]) {
    const planted = Array(1145).fill(0);
    for (let k = 0; k < 229; k++) {
      const polynomial = [
        shamirRecoveredKnown[k], randomCoeff(), randomCoeff(),
        randomCoeff(), randomCoeff() % 28 + 1
      ];
      for (let j = 0; j < 5; j++) {
        let f = 0;
        for (let d = polynomial.length - 1; d >= 0; d--)
          f = mod(f * coords[j] + polynomial[d]);
        planted[layout === "adjacent" ? 5*k+j : 229*j+k] = f;
      }
    }
    const recovered = interpolateScroll(
      planted, lagrangeZeroWeights(coords), layout);
    assert.deepEqual(recovered, shamirRecoveredKnown);
    shamirPlants++;
  }
assert.equal(shamirPlants, 6);

/** Independent 229-rune native-GP comparison for the Shamir receiver. */
const shamirControls = {};
for (const [label, prose] of wordLists) {
  const encoded = encodeSourceNativeGP(prose);
  const windows = [];
  for (let at = 0; at + 229 <= encoded.length; at += 229)
    windows.push(ioc(encoded.slice(at, at + 229)));
  shamirControls[label] = {n: windows.length,
    minimum: Math.min(...windows), maximum: Math.max(...windows)};
}
const latin229 = [];
for (let at = 0; at + 229 <= latinRunes.length; at += 229)
  latin229.push(ioc(latinRunes.slice(at, at + 229)));
shamirControls.Latin = {n: latin229.length,
  minimum: Math.min(...latin229), maximum: Math.max(...latin229)};
assert.deepEqual(Object.fromEntries(Object.entries(shamirControls)
  .map(([name,v]) => [name, v.n])), {
  Gibran: 272, Shakespeare: 948, Emerson: 1403, Latin: 894
});
const min229 = Math.min(...Object.values(shamirControls)
  .map(c => c.minimum));
const maxShamir = Math.max(...shamir.map(c => c.ioc));
assert(min229 > 0.049);
assert(maxShamir < 0.036);

if (require.main === module)
  console.log(JSON.stringify({
    result: "source-bounded original-receiver negative; no unknown plaintext",
    sourcePages: originalPages.map(p=>p.page),
    exactSourceRuneLength: C.length,
    realRedWordProducts: taps,
    fiveWideBlocks: C.length / 5,
    originalIndexOfCoincidence: originalIoc,
    hill,
    causal,
    positiveSolvedSourceRoundtrips: plants,
    historical2014FiveMagicSquareOriginal: historicalMagic,
    historical2014FiveMagicPositivePlants: historicalMagic.length,
    historical2014FiveMagicMaximumOriginalIoc: historicalMagicMax,
    historical2014FiveMagicMinimumOriginalIoc: historicalMagicMin,
    nativeWindowControls: controls,
    fiveShareShamirOriginal: shamir,
    fiveShareShamirPositivePlants: shamirPlants,
    fiveShareShamirNativeControls: shamirControls,
    fiveShareShamirMinNativeIoc: min229,
    fiveShareShamirMaxOriginalIoc: maxShamir,
    maximumTestedOriginalIoc: upper,
    minimumGenuineNativeControlIoc: controlMin
  }, null, 2));
