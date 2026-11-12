"use strict";
/**
 * Exact shared-seven-phase substitution invariant for LP2 p27/p55.
 * Run: node sims/lp2_p27_p55_sevenphase_sharedkey_invariant_sft.cjs
 * No unknown plaintext or key is assumed. Original data remain unaltered.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const c27 = corpus.pages[27].indices;
const c55 = corpus.pages[55].indices;
assert.equal(c27.length, 234);
assert.equal(c55.length, 76);
assert.deepEqual(c27.slice(28, 34), c55.slice(70, 76));
assert.deepEqual(c27.slice(28, 34), [23, 11, 1, 17, 18, 10]); // DJU BEI
assert.equal(28 % 7, 70 % 7);

/** @param {number[][]} pages @returns {{equalPairs:number,totalPairs:number,ioc:number}} */
function phaseCollision(pages) {
  const groups = Array.from({ length: 7 }, () => Array(29).fill(0));
  for (const page of pages) {
    for (let i = 0; i < page.length; i += 1) groups[i % 7][page[i]] += 1;
  }
  let equalPairs = 0;
  let totalPairs = 0;
  for (const counts of groups) {
    const m = counts.reduce((a, x) => a + x, 0);
    totalPairs += m * (m - 1);
    for (const n of counts) equalPairs += n * (n - 1);
  }
  return { equalPairs, totalPairs, ioc: equalPairs / totalPairs };
}
const actual = phaseCollision([c27, c55]);
assert.equal(actual.equalPairs, 458);
assert.equal(actual.totalPairs, 13422);
const tok = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} text @returns {number[]} */
function encodeNativeGP(text) {
  const s = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  const output = [];
  for (let i = 0; i < s.length;) {
    const t = tok.find((x) => s.startsWith(x.s, i));
    if (t) { output.push(t.i); i += t.s.length; }
    else i += 1;
  }
  return output;
}
/** @param {number[]} input @param {number[]} scales @param {number[]} shifts @returns {number[]} */
function applyAffine(input, scales, shifts) {
  return input.map((p, i) => (scales[i % 7] * p + shifts[i % 7]) % 29);
}
/** @param {number} a @returns {number} */
function inverseMod29(a) {
  for (let v = 1; v < 29; v += 1) if ((a * v) % 29 === 1) return v;
  throw new Error("Noninvertible GP29 scale");
}
const sources = [
  { name: "Shakespeare", file: "resources/control/shakespeare_first300k.txt" },
  { name: "Gibran", file: "resources/control/gibran_prophet_58585.txt" },
  { name: "Emerson", file: "resources/control/emerson_essays_2944.txt" },
];
const results = [];
for (const source of sources) {
  const symbols = encodeNativeGP(read(source.file));
  const width = c27.length + c55.length;
  const stride = Math.floor(width / 2);
  const observed = [];
  for (let i = 0; i + width <= symbols.length; i += stride) {
    const p27 = symbols.slice(i, i + c27.length);
    const p55 = symbols.slice(i + c27.length, i + width);
    observed.push(phaseCollision([p27, p55]).ioc);
  }
  observed.sort((a, b) => a - b);
  results.push({
    source: source.name,
    nativeRunes: symbols.length,
    windows: observed.length,
    minimum: observed[0],
    median: observed[Math.floor(observed.length / 2)],
    atOrBelowActual: observed.filter((v) => v <= actual.ioc).length
  });
}
assert.deepEqual(results.map((r) => r.windows), [1403, 403, 2083]);
assert.ok(results.every((r) => r.atOrBelowActual === 0));
const plantSource = encodeNativeGP(read(sources[0].file)).slice(0, c27.length + c55.length);
const scales = [3, 5, 7, 11, 13, 17, 19];
const shifts = [0, 1, 2, 3, 4, 5, 6];
const plantA = plantSource.slice(0, c27.length);
const plantB = plantSource.slice(c27.length);
const encA = applyAffine(plantA, scales, shifts);
const encB = applyAffine(plantB, scales, shifts);
assert.deepEqual(phaseCollision([encA, encB]), phaseCollision([plantA, plantB]));
const inv = scales.map(inverseMod29);
const decoder = (c) => c.map((v, i) => ((v - shifts[i % 7] + 29) * inv[i % 7]) % 29);
assert.deepEqual(decoder(encA), plantA);
assert.deepEqual(decoder(encB), plantB);
console.log(JSON.stringify({
  hypothesis: "One page-reset seven-phase fixed GP29 bijection shared by original p27/p55",
  collisionOffsets: { p27: 28, p55: 70, phaseModulo7: 0 },
  inputLengths: [c27.length, c55.length],
  original: actual,
  nativeControls: results,
  syntheticPositive: { recoveredRunes: plantSource.length, equalityInvariant: true },
  interpretation: "Strong finite native-English necessary-invariant negative; no original plaintext, key or mechanism recovered. Does not test transposition, changing-state ciphers, different per-page keys, non-native registers or hidden extra layers."
}, null, 2));
