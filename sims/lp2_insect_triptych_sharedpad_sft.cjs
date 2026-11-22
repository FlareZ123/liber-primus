"use strict";

/**
 * Original-source mayfly-triptych same-pad test (LP2 physical p24-p26).
 *
 * Hypothesis: three pages with repeated insect artwork use a common, aligned
 * additive GP29 keystream. With C_a=P_a+K mod29 and C_b=P_b+K mod29,
 * the observed pairwise C_a-C_b MUST equal P_a-P_b, independently of K.
 *
 * This is a narrowly scoped source-selected test. It neither identifies a
 * cryptographic key nor excludes changing/nonadditive/unaligned ciphers.
 * Run on Windows Node.js 20+: node sims/lp2_insect_triptych_sharedpad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const token = gp.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
const n = 264;

/**
 * Replicate the source-calibrated GP English orthography, wordwise.
 * ING->GP21 and IO->GP27 are witnessed in solved LP1 and solved LP2 p57.
 * @param {string} input
 * @returns {number[]}
 */
function nativeGP(input) {
  const clean = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        output.push(21); i += 3;
      } else if (word.startsWith("IO", i)) {
        output.push(27); i += 2;
      } else {
        const found = token.find(t => word.startsWith(t.s, i));
        assert(found, "source-native word encoding");
        output.push(found.i); i += found.s.length;
      }
    }
  }
  return output;
}

/** @param {string} s @returns {number[]} */
function originalRuneIndices(s) {
  return [...s].map(x => gp.runes.indexOf(x)).filter(i => i >= 0);
}
const solvedGP = solved.sections.flatMap(s => originalRuneIndices(s.source_text));
assert.equal(solvedGP.length, 2979);
const freq = Array(29).fill(0);
for (const x of solvedGP) freq[x]++;
const distribution = freq.map(x => x / solvedGP.length);
const deltaDistribution = distribution.map((_, d) =>
  distribution.reduce((total, x, i) => total + x * distribution[(i - d + 29) % 29], 0));
assert(deltaDistribution.every(x => x > 0));
const logOdds = deltaDistribution.map(p => Math.log(29 * p));

/**
 * Source-derived, no-fitted-parameters common-pad log-likelihood ratio
 * against an independent uniform GP29 difference stream.
 * @param {number[][]} messages Three rune sequences of at least n tokens.
 * @returns {{llr:number,chi:number,equalities:number}}
 */
function evaluate(messages) {
  assert.equal(messages.length, 3);
  assert(messages.every(s => s.length >= n));
  let llr = 0;
  const seen = new Int32Array(29);
  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 3; b++) {
      for (let i = 0; i < n; i++) {
        const d = (messages[a][i] - messages[b][i] + 29) % 29;
        llr += logOdds[d];
        seen[d]++;
      }
    }
  }
  const expected = 3 * n / 29;
  const chi = seen.reduce((total, x) => total + (x - expected) ** 2 / expected, 0);
  return { llr, chi, equalities: seen[0] };
}

const full = [24, 25, 26].map(p => gp.pages[p].indices);
assert.deepEqual(full.map(x => x.length), [270, 273, 265]);
// Literal first-line cross-page-word carries are 3,2,1 GP runes.
const carries = [3, 2, 1];
const aligned = full.map((a, j) => a.slice(carries[j], carries[j] + n));
const startAligned = full.map(a => a.slice(0, n));
assert.deepEqual(aligned.map(x => x.length), [n, n, n]);
const result = evaluate(aligned);
const pageStartResult = evaluate(startAligned);
assert(Math.abs(result.llr + 15.260542144431778) < 1e-8);
assert(Math.abs(pageStartResult.llr + 11.709610069135667) < 1e-8);
assert.equal(result.equalities, 27);

const donors = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 62492],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 217106],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 321327]
].map(([name, file, expected]) => {
  const data = nativeGP(read(file));
  assert.equal(data.length, expected, name + " native GP count");
  return { name, data };
});

/**
 * Deterministic xorshift32 for reproducible sampling, not for encryption.
 * @param {number} initial
 * @returns {()=>number}
 */
function seeded(initial) {
  let s = initial >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const disjoint = [];
for (let i = 0; i < 200; i++) {
  const source = donors.map(v => v.data.slice(i * 300, i * 300 + n));
  disjoint.push(evaluate(source).llr);
}
disjoint.sort((a, b) => a - b);
assert(disjoint[0] > pageStartResult.llr);

// These 6,000 donor-window placements are not independent trials because
// randomized windows can overlap. The 200 nonoverlapping tests above are
// the conservative reference. Wrong-key rotations preserve exact source
// ciphertext histograms while breaking a shared-position K relationship.
const rng = seeded(82031);
const donorTrials = [];
const rotatedNull = [];
for (let t = 0; t < 6000; t++) {
  const windows = donors.map(d => {
    const start = Math.floor(rng() * (d.data.length - n));
    return d.data.slice(start, start + n);
  });
  donorTrials.push(evaluate(windows).llr);
  const rotated = aligned.map(a => {
    const offset = Math.floor(rng() * a.length);
    return a.slice(offset).concat(a.slice(0, offset));
  });
  rotatedNull.push(evaluate(rotated).llr);
}
donorTrials.sort((a, b) => a - b);
rotatedNull.sort((a, b) => a - b);
assert(donorTrials[0] > pageStartResult.llr);

// Positive control: three native-source plaintext blocks encrypted under
// exactly the SAME arbitrary position-key retain every modular difference.
const plant = donors.map((d, i) => d.data.slice(i * 300, i * 300 + n));
const plantScore = evaluate(plant);
const generator = seeded(3301);
const pad = Array.from({ length: n }, () => Math.floor(generator() * 29));
const encrypted = plant.map(a => a.map((v, i) => (v + pad[i]) % 29));
assert.deepEqual(plant.map(a => a.slice()), encrypted.map(a =>
  a.map((v, i) => (v - pad[i] + 29) % 29)));
assert(Math.abs(evaluate(encrypted).llr - plantScore.llr) < 1e-9);
assert(plantScore.llr > pageStartResult.llr);

const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p57Plain = lp1.split("### 57\n")[1].trim();
assert.deepEqual(nativeGP(p57Plain), gp.pages[57].indices,
  "real independently solved page 57 native encoding");

console.log(JSON.stringify({
  status: "Shared source-aligned additive GP29 pad disfavored; no plaintext recovered",
  sourcePages: [24, 25, 26],
  sourceRuneCounts: full.map(x => x.length),
  sourceCrossPageLeadingCarry: carries,
  comparisonRunesPerPage: n,
  originalAligned: result,
  originalRawPageStarts: pageStartResult,
  genuineNativeGPControlRuneLengths: donors.map(x => x.data.length),
  disjointControlCount: disjoint.length,
  disjointControlMinimum: disjoint[0],
  disjointControlMedian: disjoint[100],
  disjointAtOrBelowAligned: disjoint.filter(x => x <= result.llr).length,
  overlappingSampledControlCount: donorTrials.length,
  sampledMinimum: donorTrials[0],
  sampledMedian: donorTrials[3000],
  sampledAtOrBelowAligned: donorTrials.filter(x => x <= result.llr).length,
  wrongKeyRotationMedian: rotatedNull[3000],
  wrongKeyRotationAtOrAboveAligned: rotatedNull.filter(x => x >= result.llr).length,
  genuineSolvedGPProfileRunes: solvedGP.length,
  gp57OriginalSourcePositiveRunes: gp.pages[57].indices.length,
  commonAdditivePadPositiveReplay: true
}, null, 2));
