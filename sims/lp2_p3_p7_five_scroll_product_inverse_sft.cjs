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
  const m = matrix.map((row, i) => row.concat(
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
assert(upper < 0.035);
const originalIoc = ioc(C);
assert(Math.abs(originalIoc - 0.034633706904449266) < 1e-12);

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
    nativeWindowControls: controls,
    maximumTestedOriginalIoc: upper,
    minimumGenuineNativeControlIoc: controlMin
  }, null, 2));
