"use strict";
/**
 * LP2 p13 -> p14 source-visible FOLD experiment.
 *
 * Physical p13 (original 30.jpg) contains exactly 272 GP runes in
 * twelve printed lines, with six lines of 136 runes on either side of
 * the central physical line break. The following p14 (31.jpg) prints
 * 137 runes and the standalone second word FOLD; its F is at offset 2.
 * Thus 272 = 2*(137-1) = 2*phi(137). Page 14's tree is on the opposite
 * side from p13's mirrored tree illustration.
 *
 * The author has not stated that FOLD signals a cryptographic transform;
 * this SFT tests one explicit 2014-executable, source-motivated inverse
 * and an all-secret obstruction to direct pair-fold transfer.
 *
 * Run on Windows Node.js 22:
 * node sims/lp2_p13_p14_literal_fold_phi137_original_sft.cjs
 * Read-only; standard modules only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const upper = corpus.pages[13].indices;
const lower = corpus.pages[14].indices;
const gp = new Set(corpus.runes);
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];

/** @param {string} s @returns {number[]} */
function indices(s) {
  const map = new Map(corpus.runes.map((r, i) => [r, i]));
  return Array.from(s).filter((c) => gp.has(c)).map((c) => map.get(c));
}
assert.equal(transcript.length >= 15, true);
assert.deepEqual(indices(transcript[13]), upper);
assert.deepEqual(indices(transcript[14]), lower);
assert.equal(upper.length, 272);
assert.equal(lower.length, 137);
assert.deepEqual(upper.length / 2, 136);
assert.ok(primes.every((p) => 137 % p !== 0)); // 137 is prime
const lineLengths = transcript[13].split("/").map((s) => indices(s).length).filter(Boolean);
assert.deepEqual(lineLengths, [24,21,23,23,22,23,22,25,21,22,22,24]);
assert.equal(lineLengths.slice(0, 6).reduce((a, b) => a + b), 136);
assert.equal(lineLengths.slice(6).reduce((a, b) => a + b), 136);
assert.deepEqual(lower.slice(0, 6), [16,11,0,3,20,23]); // TJ FOLD
assert.ok(/-ᛏᛄ-ᚠᚩᛚᛞ-/.test(transcript[14]));
assert.equal(corpus.translit[lower[2]], "F");
const F_INDEX = 2;
const N = 136;

/** @param {number} x @param {number} exponent */
function power137(x, exponent) {
  let r = 1;
  while (exponent > 0) {
    if (exponent % 2) r = r * x % 137;
    x = x * x % 137;
    exponent = Math.floor(exponent / 2);
  }
  return r;
}
/** @param {number} x */
function inverse137(x) {
  assert.ok(x >= 1 && x < 137);
  return power137(x, 135);
}
for (const x of primes) assert.equal(x * inverse137(x) % 137, 1);

/** Source-selected physical fold: first six lines against last six reversed. */
const pairs = Array.from({length: N}, (_, i) => [upper[i], upper[271 - i]]);
const functions = {
  first: (x, y) => x,
  second: (x, y) => y,
  sum: (x, y) => (x + y) % 29,
  diff: (x, y) => (x - y + 29) % 29,
  reverseDiff: (x, y) => (y - x + 29) % 29,
  primeSum: (x, y) => (primes[x] + primes[y]) % 29,
  primeDiff: (x, y) => (primes[x] - primes[y] + 29) % 29,
  totientSum: (x, y) => (primes[x] + primes[y] - 2) % 29,
  product: (x, y) => x * y % 29,
  field137Ratio: (x, y) =>
    (primes[x] * inverse137(primes[y]) % 137) % 29
};
/** @param {number[]} stream @param {number[]} key @param {number} sign */
function decode(stream, key, sign) {
  assert.equal(stream.length, 137);
  assert.equal(stream[F_INDEX], 0);
  const packet = stream.filter((_, i) => i !== F_INDEX);
  assert.equal(packet.length, N);
  return packet.map((v, i) => (v + sign * key[i] + 29) % 29);
}
/** @param {number[]} stream */
function ioc(stream) {
  const counts = Array(29).fill(0);
  for (const v of stream) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (stream.length * (stream.length - 1));
}

// An independent GP29 text model calibrated on Gibran, with standard
// historical GP alphabet labels including the ING and IO ligature readings.
const labels = [
  ...corpus.translit.map((s, i) => ({s, i})),
  {s: "ING", i: corpus.translit.indexOf("NG")},
  {s: "IO", i: corpus.translit.indexOf("IA")}
].sort((a, b) => b.s.length - a.s.length);
const source = read("resources/control/gibran_prophet_58585.txt").toUpperCase()
  .replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
const native = [];
for (let at = 0; at < source.length;) {
  const token = labels.find((entry) => source.startsWith(entry.s, at));
  if (token) {
    native.push(token.i);
    at += token.s.length;
  } else at++;
}
assert.equal(native.length, 62492);
const matrix = new Map();
for (let i = 2; i < native.length; i++) {
  const context = native[i - 2] * 29 + native[i - 1];
  const row = matrix.get(context) || Array(29).fill(0);
  row[native[i]]++;
  matrix.set(context, row);
}
/** @param {number[]} text */
function score(text) {
  let likelihood = 0;
  for (let i = 2; i < text.length; i++) {
    const counts = matrix.get(text[i - 2] * 29 + text[i - 1]) ||
      Array(29).fill(0);
    const total = counts.reduce((s, n) => s + n, 0);
    likelihood += Math.log((counts[text[i]] + 0.3) / (total + 8.7));
  }
  return likelihood / (text.length - 2);
}
const baseline = [];
for (let i = 0; i + N <= native.length; i += N)
  baseline.push(score(native.slice(i, i + N)));
baseline.sort((a, b) => a - b);
assert.equal(baseline.length, 459);
assert.ok(baseline[0] > -2.6);
const sourcePacket = lower.filter((_, i) => i !== F_INDEX);
const candidates = [];
for (const [name, rule] of Object.entries(functions)) {
  const key = pairs.map(([a, b]) => rule(a, b));
  for (const direction of ["printed", "reversed"]) {
    for (const sign of [-1, 1]) {
      const observed = direction === "printed" ? sourcePacket :
        sourcePacket.slice().reverse();
      const plaintext = observed.map((v, i) => (v + sign * key[i] + 29) % 29);
      candidates.push({key: name, direction, sign, ioc: ioc(plaintext),
        nativeTrigramNats: score(plaintext),
        prefixGP: plaintext.slice(0, 25).map((i) => corpus.translit[i]).join(" ")});
    }
  }
}
candidates.sort((a, b) => b.nativeTrigramNats - a.nativeTrigramNats);
assert.equal(candidates.length, 40);
assert.ok(candidates[0].nativeTrigramNats < -3.7);
const nativeP57 = score(corpus.pages[57].indices);
assert.ok(nativeP57 > -2.6);

/**
 * If p14 after its one transparent F were literally generated by
 * a fixed mapping of the folded p13 rune PAIRS, every repeated input pair
 * would have to demand the same output rune. Optimize over all secret
 * maps independently, including noninjective and asymmetric mappings.
 * @param {number[]} target
 * @param {boolean} ordered
 */
function pairMapCeiling(target, ordered) {
  const lookup = new Map();
  for (let i = 0; i < N; i++) {
    const [a, b] = pairs[i];
    const k = ordered ? 29 * a + b :
      29 * Math.min(a, b) + Math.max(a, b);
    const row = lookup.get(k) || Array(29).fill(0);
    row[target[i]]++;
    lookup.set(k, row);
  }
  let best = 0;
  for (const row of lookup.values()) best += Math.max(...row);
  return {uniqueInputs: lookup.size, maximumMatching: best,
    forcedMismatch: N - best};
}
const direct = {
  printOrdered: pairMapCeiling(sourcePacket, true),
  printUnordered: pairMapCeiling(sourcePacket, false),
  reverseOrdered: pairMapCeiling(sourcePacket.slice().reverse(), true),
  reverseUnordered: pairMapCeiling(sourcePacket.slice().reverse(), false)
};
assert.deepEqual(direct, {
  printOrdered: {uniqueInputs:128, maximumMatching:130, forcedMismatch:6},
  printUnordered:{uniqueInputs:121, maximumMatching:123, forcedMismatch:13},
  reverseOrdered:{uniqueInputs:128, maximumMatching:129, forcedMismatch:7},
  reverseUnordered:{uniqueInputs:121, maximumMatching:122, forcedMismatch:14}
});

// Full 137-rune planted positive: exact folded p13 key encrypts an
// independent native GP register; the source-position F is transparent.
const plant = native.slice(1000, 1136);
const plantedKey = pairs.map(([a, b]) => functions.primeSum(a, b));
const plantedCipher = plant.map((v, i) => (v + plantedKey[i]) % 29);
plantedCipher.splice(F_INDEX, 0, 0);
assert.deepEqual(decode(plantedCipher, plantedKey, -1), plant);
assert.ok(score(plant) > -2.6);

console.log(JSON.stringify({
  model: "p13 136+136 line-fold as key for 137-rune p14, original FOLD F skip",
  source: "original LP2 scans 30.jpg and 31.jpg; canonical GP29 transcription",
  sourceP13Lines: lineLengths, firstHalf: 136, secondHalf: 136,
  p14Length: 137, literalFLocalOffset: 2, phi137: 136,
  nativeControl: {
    gibranRunes: native.length, windows: baseline.length,
    lowestWindow: baseline[0],
    medianWindow: baseline[Math.floor(baseline.length / 2)],
    solvedP57Score: nativeP57,
    originalP14Score: score(lower),
    originalP14WithoutFScore: score(sourcePacket)
  },
  realTrialCount: candidates.length,
  strongestOriginalInverse: candidates[0],
  topFive: candidates.slice(0, 5),
  directPairTransferAllSecretBounds: direct,
  syntheticFull137CipherRoundTrip: true,
  decision: "No authentic plaintext from the literal F-fold key family; direct static folded-pair encoding of p14 is impossible under the exact source orientation.",
  limits: "FOLD and the F bypass are conjectural outside solved p56. This does not exclude other page folding operations, changing keys, moved boundaries or a missing external key."
}, null, 2));
