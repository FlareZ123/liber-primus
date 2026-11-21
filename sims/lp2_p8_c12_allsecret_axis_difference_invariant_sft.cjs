"use strict";
/**
 * Source-selected p8–14 after an oversized first red X: 1728=12^3 runes.
 * Exact key-independent invariant for arbitrary 3×12 additive axis masks,
 * including every 12-cube rotation and reflection. Windows Node22 SFT:
 * node sims/lp2_p8_c12_allsecret_axis_difference_invariant_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const first = data.pages.filter((p) => p.page >= 8 && p.page <= 14).flatMap((p) => p.indices);
const ink = annotations.pages.find((p) => p.page === 8);
assert.equal(first.length, 1729);
assert.equal(first[0], 14); // oversized X, original physical p8 25.jpg
assert.equal(ink.red_spans.length, 1);
assert.equal(ink.red_spans[0].start, 0);
assert.equal(ink.red_spans[0].length, 12);
assert.equal(12 ** 3, 1728);
const original = first.slice(1);
assert.equal(original.length, 1728);
const originalTailCut = first.slice(0, 1728);

/** @param {number[]} v @returns {number} */
function differencePhaseInvariant(v) {
  assert.equal(v.length, 1728);
  let combined = 0;
  for (let axis = 0; axis < 3; axis++) {
    const stride = 12 ** axis;
    for (let phase = 0; phase < 11; phase++) {
      const bins = new Uint16Array(29);
      for (let x = 0; x < 12; x++) {
        for (let y = 0; y < 12; y++) {
          const offset = axis === 0
            ? 12 * (12 * x + y) + phase
            : axis === 1
              ? 12 * (12 * x + phase) + y
              : 12 * (12 * phase + x) + y;
          bins[(v[offset + stride] - v[offset] + 29) % 29]++;
        }
      }
      const count = bins.reduce((sum, n) => sum + n * (n - 1), 0);
      combined += count / (144 * 143);
    }
  }
  return combined / 33;
}
/** @param {number[]} plaintext @param {number[]} A @param {number[]} B @param {number[]} C @returns {number[]} */
function encryptAxis(plaintext, A, B, C) {
  assert.equal(plaintext.length, 1728);
  return plaintext.map((p, i) =>
    (p + A[Math.floor(i / 144)] + B[Math.floor(i / 12) % 12] + C[i % 12]) % 29);
}
/** @param {number[]} input @param {number[]} axisOrder @param {number} flips @returns {number[]} */
function reorient(input, axisOrder, flips) {
  return Array.from({length: 1728}, (_, i) => {
    const coords = [Math.floor(i / 144), Math.floor(i / 12) % 12, i % 12];
    let index = 0;
    for (let j = 0; j < 3; j++) {
      const coord = coords[axisOrder[j]];
      index = 12 * index + (((flips >> j) & 1) ? 11 - coord : coord);
    }
    return input[index];
  });
}
const gpIndex = new Map(data.translit.map((v, i) => [v, i]));
const tokens = [...data.translit].sort((a, b) => b.length - a.length);
/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW").replace(/K/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < normalized.length;) {
    if (!/[A-Z]/.test(normalized[i])) { i++; continue; }
    if (normalized.startsWith("ING", i)) {
      result.push(21); i += 3; continue;
    }
    const tok = tokens.find((token) => normalized.startsWith(token, i));
    if (tok) { result.push(gpIndex.get(tok)); i += tok.length; }
    else i++;
  }
  return result;
}
const nativeLP1 = encodeGP(read("resources/liber-primus/lp1-plaintext-reference.txt"));
assert(nativeLP1.length >= 1728);
const donor = nativeLP1.slice(0, 1728);
let state = 0x33011203;
/** @returns {number} */
function rand() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) % 29;
}
const A = Array.from({length: 12}, rand);
const B = Array.from({length: 12}, rand);
const C = Array.from({length: 12}, rand);
const synthetic = encryptAxis(donor, A, B, C);
const tol = 1e-13;
assert(Math.abs(differencePhaseInvariant(donor) - differencePhaseInvariant(synthetic)) < tol,
  "all-secret additive axis mask changes an invariant");
const axes = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
for (const a of axes) for (let flip = 0; flip < 8; flip++) {
  assert(Math.abs(differencePhaseInvariant(original) -
    differencePhaseInvariant(reorient(original, a, flip))) < tol,
    "cube symmetry changes the invariant");
  assert(Math.abs(differencePhaseInvariant(donor) -
    differencePhaseInvariant(reorient(donor, a, flip))) < tol,
    "native cube symmetry changes the invariant");
}
const observed = differencePhaseInvariant(original);
const tailCut = differencePhaseInvariant(originalTailCut);
const corpora = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
const controls = [];
for (const name of corpora) {
  const seq = encodeGP(read(name));
  const vals = [];
  for (let start = 0; start + 1728 <= seq.length; start += 17) {
    vals.push(differencePhaseInvariant(seq.slice(start, start + 1728)));
  }
  vals.sort((a,b) => a-b);
  assert(vals.length > 50);
  const belowFirst = vals.filter((value) => value <= observed).length;
  const belowLast = vals.filter((value) => value <= tailCut).length;
  controls.push({
    name, runeCount: seq.length, windows: vals.length,
    min: vals[0], median: vals[Math.floor(vals.length / 2)],
    atOrBelowSourceFirstCut: belowFirst, atOrBelowSourceTailCut: belowLast
  });
  assert.equal(belowFirst, 0, "direct native-prose source-control gate changed: " + name);
}
console.log(JSON.stringify({
  hypothesis: "C[i,j,k] = (P[i,j,k] + A[i] + B[j] + D[k]) mod29; arbitrary 36 GP keys",
  source: "unchanged p8–14 original with physical p8 giant first red rune X excluded",
  sourceCount: first.length,
  nativeCubeCount: original.length,
  originalFirstCut: observed, originalTailCut: tailCut,
  controls, all48CubeRotationsAndReflectionsSame: true,
  arbitraryAllSecretMaskPositiveInvariant: true,
  interpretation: "key-independent native-GP rejection of separable 3-axis additive masks under fixed serial cube order; no authentic plaintext"
}, null, 2));
console.log("PASS original-source GP29 12-cube key-independent invariant");
