"use strict";
/**
 * Reproducible five-dot-triad lane-key transfer on original LP2 ciphertext.
 *
 * Input: physical pp3-7, pp23-26, solved p56, and the exact original
 * printed-line transcription. Uses the p7/p23/p56 mirrored art as a
 * hypothesized lane orientation; does not claim it instructs this cipher.
 *
 * Run from repository root: node sims/lp2_fivedot_solved_lane_transfer_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8").split("%");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let v = 2; out.length < count; v++) {
    let prime = true;
    for (let d = 2; d * d <= v; d++) {
      if (v % d === 0) { prime = false; break; }
    }
    if (prime) out.push(v);
  }
  return out;
}

/** @param {number} page @returns {number[][]} */
function pageLines(page) {
  const lines = transcription[page].split(/\/\s*|\n+/)
    .map(line => [...line].filter(r => runeIndex.has(r)).map(r => runeIndex.get(r)))
    .filter(line => line.length > 0);
  assert.deepEqual(lines.flat(), corpus.pages[page].indices);
  return lines;
}

/**
 * @param {number[]} stream
 * @param {number} width
 * @param {"rows"|"interleave"} order
 * @returns {number[][]}
 */
function unpack(stream, width, order) {
  assert.equal(stream.length, 5 * width);
  return Array.from({ length: 5 }, (_, lane) => Array.from(
    { length: width }, (_, j) => stream[order === "rows" ? lane * width + j : 5 * j + lane]));
}

/**
 * @param {number[][]} strips
 * @param {number} width
 * @param {"rows"|"interleave"} order
 * @returns {number[]}
 */
function pack(strips, width, order) {
  const out = Array(5 * width);
  for (let lane = 0; lane < 5; lane++) {
    for (let j = 0; j < width; j++) {
      out[order === "rows" ? lane * width + j : 5 * j + lane] = strips[lane][j];
    }
  }
  return out;
}

/**
 * Model additive five-lane transfer with source-reflected lane order.
 * @param {number[]} stream
 * @param {number[]} key
 * @param {"rows"|"interleave"} sourceOrder
 * @param {"rows"|"interleave"} keyOrder
 * @param {-1|1} sign
 * @returns {number[]}
 */
function apply(stream, key, sourceOrder, keyOrder, sign) {
  const width = stream.length / 5;
  const period = key.length / 5;
  const sourceLanes = unpack(stream, width, sourceOrder);
  const keyLanes = unpack(key, period, keyOrder);
  const decoded = sourceLanes.map((lane, i) =>
    lane.map((value, j) => (value + sign * keyLanes[4 - i][j % period] + 29) % 29));
  return pack(decoded, width, sourceOrder);
}

/** @param {number[]} stream @returns {number} */
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const value of stream) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (stream.length * (stream.length - 1));
}

/** @param {number[]} a @returns {string} */
function latin(a) { return a.map(i => corpus.translit[i]).join(""); }

const p56Cipher = corpus.pages[56].indices;
assert.equal(p56Cipher.length, 85);
const primes = firstPrimes(85);
let phase = 0;
const p56Plain = p56Cipher.map((v, i) =>
  i === 56 ? 0 : (v - (primes[phase++] - 1) % 29 + 29) % 29);
assert.equal(phase, 84);
assert.equal(latin(p56Plain),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
const p56Shifts = p56Cipher.map((c, i) => (c - p56Plain[i] + 29) % 29);
assert.equal(p56Shifts[56], 0);

const original23 = corpus.pages.slice(23, 27).flatMap(page => page.indices);
assert.deepEqual(original23.slice(0, 16), pageLines(23).flat().slice(0, 16));
const target23 = original23.slice(16).reverse();
assert.equal(original23.length, 1021);
assert.equal(target23.length, 1005);

const pages3to7 = [3, 4, 5, 6, 7];
const target3 = pages3to7.flatMap(p =>
  pageLines(p).flatMap(line => line.slice().reverse()));
assert.equal(target3.length, 1145);

/**
 * Source-control challenge: p56 contains five printed rune lines.
 * Independent original-JPEG dot centroids, sorted by increasing x, rank by
 * increasing y as [2,0,4,1,3] for p56, [2,4,0,3,1] for p7,
 * and [1,3,0,4,2] for p23. See the pre-existing original-image SFT:
 * sims/lp2_p7_p23_p56_dot_triad_sft.py
 *
 * If five-dot reading order selects a pre-totient rune transposition for
 * solved p56, it must reproduce independently known plaintext under the
 * unchanged authentic 85 cipher shifts. Try only these source-visible orders,
 * each on printed lines, 17 quintets, and five contiguous 17-rune stripes.
 */
const p56Lines = transcription[55].split(/\/\s*|\n+/)
  .map(line => [...line].filter(r => runeIndex.has(r)).map(r => runeIndex.get(r)))
  .filter(line => line.length > 0);
assert.deepEqual(p56Lines.map(line => line.length), [20, 19, 6, 22, 18]);
assert.deepEqual(p56Lines.flat(), p56Cipher);
const dotOrders = {
  leftToRight: [0, 1, 2, 3, 4],
  p56TopToBottom: [2, 0, 4, 1, 3],
  p56BottomToTop: [3, 1, 4, 0, 2],
  rightToLeft: [4, 3, 2, 1, 0],
  p7TopToBottom: [2, 4, 0, 3, 1],
  p23TopToBottom: [1, 3, 0, 4, 2]
};
/** @param {number[]} order @param {string} grouping @returns {number[]} */
function permuteP56(order, grouping) {
  if (grouping === "printedLines") return order.flatMap(j => p56Lines[j]);
  const lanes = unpack(p56Cipher, 17, grouping === "quintets" ? "interleave" : "rows");
  return pack(order.map(j => lanes[j]), 17,
    grouping === "quintets" ? "interleave" : "rows");
}
const p56DotControls = [];
for (const [orderName, order] of Object.entries(dotOrders)) {
  for (const grouping of ["printedLines", "quintets", "stripes17"]) {
    const rearranged = permuteP56(order, grouping);
    const decoded = rearranged.map((v, i) => (v - p56Shifts[i] + 29) % 29);
    const knownPlaintextMismatches = decoded.reduce(
      (sum, v, i) => sum + (v === p56Plain[i] ? 0 : 1), 0);
    p56DotControls.push({ orderName, grouping, knownPlaintextMismatches });
  }
}
assert.equal(p56DotControls.filter(x => x.knownPlaintextMismatches === 0).length, 3);
assert.ok(p56DotControls.every(x =>
  x.orderName === "leftToRight" || x.knownPlaintextMismatches >= 64));

const solvedControl = corpus.pages[57].indices;
assert.equal(solvedControl.length, 95);
const targets = [
  { name: "pp3-7 line-mirrored", original: target3, width: 229 },
  { name: "pp23-26 post-heading reversed", original: target23, width: 201 }
];
const keys = [
  { name: "solved-p56-plaintext", values: p56Plain },
  { name: "solved-p56-actual-cipher-shifts", values: p56Shifts },
  { name: "solved-p56-body80-plaintext", values: p56Plain.slice(5) }
];
const results = [];
for (const target of targets) {
  for (const key of keys) {
    for (const sourceOrder of ["rows", "interleave"]) {
      for (const keyOrder of ["rows", "interleave"]) {
        for (const sign of [-1, 1]) {
          const candidate = apply(target.original, key.values, sourceOrder, keyOrder, sign);
          assert.deepEqual(
            apply(candidate, key.values, sourceOrder, keyOrder, -sign), target.original);
          const nativePlain = Array.from({ length: target.original.length },
            (_, i) => solvedControl[i % solvedControl.length]);
          const plantedCipher = apply(nativePlain, key.values, sourceOrder, keyOrder, -sign);
          assert.deepEqual(
            apply(plantedCipher, key.values, sourceOrder, keyOrder, sign), nativePlain);
          results.push({
            target: target.name,
            key: key.name,
            sourceOrder,
            keyOrder,
            sign,
            runeCount: target.original.length,
            originalIoc: ioc(target.original),
            outputIoc: ioc(candidate),
            first60Latin: latin(candidate).slice(0, 60),
            exactForwardReencryption: true,
            knownNativeControlRecovered: true
          });
        }
      }
    }
  }
}
for (const target of targets) {
  const byTarget = results.filter(x => x.target === target.name);
  assert.ok(Math.max(...byTarget.map(x => x.outputIoc)) < 0.04);
}
console.log(JSON.stringify({
  hypothesis: "Five black dots select five lanes; p56 solved text/shifts may key the other two stencil-linked sections",
  originalEvidence: {
    p3to7Runes: target3.length, p23to26PostHeadingRunes: target23.length,
    p56SolvedRunes: p56Plain.length, p56AfterHeadingRunes: p56Plain.slice(5).length,
    p56PrimeClockEvents: phase
  },
  sourceImageP56DotOrdersAgainstSolvedControl: p56DotControls,
  candidates: results.length,
  positiveControl: "Every keyed synthetic solved-p57-native-GP plant recovers exactly.",
  decision: "No deciphered unknown text or source-authenticated lane-key instruction.",
  results
}, null, 2));
