"use strict";

/**
 * Exact source-defined nonzero floral-heading cursor alignment.
 * The p40 and p54 initial red headings contain respectively 8 and 9 GP runes.
 * Continuous pad clocks therefore predict that black p40[1] and black p54[0]
 * use the identical key index, irrespective of the unknown pad values.
 *
 * Windows Node 22 CJS: node sims/lp2_floral_heading_plus1_pad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = (value) => (value % 29 + 29) % 29;

const first = corpus.pages.slice(40, 54).flatMap((page) => page.indices);
const last = corpus.pages.slice(54, 56).flatMap((page) => page.indices);
assert.equal(first.length, 3008);
assert.equal(last.length, 308);

const HEAD_A = 8;
const HEAD_B = 9;
const SHIFT = HEAD_B - HEAD_A; // one extra original p54 heading rune
assert.equal(SHIFT, 1);
const p40Body = first.slice(HEAD_A);
const p54Body = last.slice(HEAD_B);
const aligned40 = p40Body.slice(SHIFT, SHIFT + p54Body.length);
assert.equal(aligned40.length, 299);
assert.equal(p54Body.length, 299);

const train = encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"));
const gibran = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
const emerson = encodeSourceNativeGP(read("resources/control/emerson_essays_2944.txt"));
assert.equal(train.length, 217106);

const hist = new Float64Array(29);
for (const value of train) hist[value]++;
const frequency = Array.from(hist, (count) => count / train.length);
const differenceLaw = Array.from({ length: 29 }, (_, difference) =>
  frequency.reduce(
    (sum, frequencyAt, index) =>
      sum + frequencyAt * frequency[mod(index - difference)],
    0
  )
);
assert(Math.abs(differenceLaw.reduce((sum, q) => sum + q, 0) - 1) < 1e-12);

/** @param {number[]} a @param {number[]} b */
function score(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce(
    (sum, v, index) =>
      sum + Math.log(29 * differenceLaw[mod(v - b[index])]),
    0
  );
}
/** @param {number[]} a @param {number[]} b */
function equalityCount(a, b) {
  return a.filter((v, index) => v === b[index]).length;
}

const actual = score(aligned40, p54Body);
const actualEqual = equalityCount(aligned40, p54Body);
assert.equal(actualEqual, 12);
assert(Math.abs(actual + 4.587396644345354) < 1e-8);
const N = 500;
const n = p54Body.length;
const controls = [];
const seed = 177;
for (let test = 0; test < N; test++) {
  const leftAt = (seed + 7919 * test) % (gibran.length - n);
  const rightAt = (seed * 3 + 12347 * test) % (emerson.length - n);
  controls.push(score(
    gibran.slice(leftAt, leftAt + n),
    emerson.slice(rightAt, rightAt + n)
  ));
}
const sorted = controls.slice().sort((a, b) => a - b);
const belowOrEqual = controls.filter((s) => s <= actual).length;
assert.equal(belowOrEqual, 0);

// Authentic GP-native positive: two ordinary text passages share one
// independently generated original-length GP29 pad; cancellation is exact.
const p = gibran.slice(113, 113 + n);
const q = emerson.slice(247, 247 + n);
let rng = 0x3301f10a;
const key = Array.from({ length: n }, () => {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return (rng >>> 0) % 29;
});
const cp = p.map((x, i) => mod(x + key[i]));
const cq = q.map((x, i) => mod(x + key[i]));
assert.deepEqual(cp.map((x, i) => mod(x - key[i])), p);
assert.deepEqual(cq.map((x, i) => mod(x - key[i])), q);
assert.deepEqual(
  cp.map((x, i) => mod(x - cq[i])),
  p.map((x, i) => mod(x - q[i]))
);
assert(Math.abs(score(cp, cq) - score(p, q)) < 1e-10);

console.log(JSON.stringify({
  originalChapterLengths: [first.length, last.length],
  sourceRedHeadingLengths: [HEAD_A, HEAD_B],
  frozenNonzeroBodyCursorShift: SHIFT,
  overlappingRunePairs: n,
  originalEqualRunePairs: actualEqual,
  originalNativeDifferenceLogEvidence: actual,
  nativeHeldoutPairs: N,
  minimumNativeHeldoutLogEvidence: sorted[0],
  medianNativeHeldoutLogEvidence: sorted[Math.floor(N / 2)],
  nativeHeldoutAtOrBelowOriginal: belowOrEqual,
  nativePositivePlant: {
    exactRecoveredRunesPerText: n,
    exactSourcePadCancellation: true,
    plantNativeDifferenceLogEvidence: score(cp, cq)
  },
  verdict: "Exact heading-length +1 pad reuse fails independent GP-native pair controls; no plaintext."
}, null, 2));
