"use strict";

/**
 * Original LP2 source-mark reset / phase-wise differential secret-capacity gate.
 *
 * Every visible large punctuation mark on unresolved physical pages p0..p55
 * is a candidate reset. Inside each nonempty marked interval, let
 *
 *   D[i] = (C[i] - C[i-1]) mod 29,    i > 0
 *   P[i] = pi[interval, (i-1) mod period](D[i]).
 *
 * Each pi is an entirely unknown and independently arbitrary GP29 permutation.
 * The first rune of every nonempty interval is an unrestricted plaintext
 * symbol. Their value is optimistically chosen for the adversary.
 *
 * Sorting and aligning each state-local 29-bin histogram gives the EXACT
 * greatest possible plaintext unigram coincidence under every secret key,
 * because equal-rank alignment maximizes squared counts.
 *
 * Node 22, CommonJS, read-only; no search for a favorable original key.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeWords} = require("./lp2_difference_allletter_capacity_sft.cjs");

const ROOT = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const INK = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const Q = 29;
const N = 12956;
const mod = (a, p) => ((a % p) + p) % p;

/** The original 31 large punctuation events split 12,956 GP runes. */
function originalIntervals() {
  const pages = GP.pages.filter((p) => p.page <= 55);
  const runes = pages.flatMap((p) => p.indices);
  assert.equal(runes.length, N);
  const offsets = new Map();
  let n = 0;
  for (const page of pages) {
    offsets.set(page.page, n);
    n += page.indices.length;
  }
  const marks = INK.pages.filter((p) => p.page <= 55)
    .flatMap((p) => (p.large_punctuation || [])
      .map(([offset, dots]) => ({position: offsets.get(p.page) + offset, dots})));
  assert.equal(marks.length, 31);
  const edges = [0, ...marks.map((m) => m.position), N]
    .sort((a, b) => a - b);
  const intervals = edges.slice(1).map((end, i) => ({
    start: edges[i], end, symbols: runes.slice(edges[i], end)
  }));
  assert.equal(intervals.length, 32);
  assert.equal(intervals.filter((s) => s.symbols.length > 0).length, 29);
  assert.deepEqual(intervals.map((s) => s.symbols.length),
    [13,716,16,103,3,690,11,308,0,14,1729,0,9,11,1883,16,1005,
     19,1414,10,81,8,746,553,161,3,118,2474,534,9,299,0]);
  assert.equal(intervals.reduce((sum, s) => sum + s.symbols.length, 0), N);
  return intervals;
}

/**
 * Exact best possible coincidence over independent arbitrary 29! alphabet
 * permutations for every (mark interval, local clock phase) state.
 * Grant first symbols an entirely free plaintext value, maximally aligned.
 */
function secretCapacity(intervals, period) {
  assert.ok(Number.isInteger(period) && period >= 1);
  const pooled = Array(Q).fill(0);
  let controlled = 0, free = 0, states = 0;
  for (const interval of intervals) {
    const symbols = interval.symbols;
    if (!symbols.length) continue;
    free++;
    const hist = Array.from({length: period}, () => Array(Q).fill(0));
    for (let i = 1; i < symbols.length; i++) {
      const step = mod(symbols[i] - symbols[i - 1], Q);
      hist[(i - 1) % period][step]++;
      controlled++;
    }
    for (const counts of hist) {
      counts.sort((a, b) => b - a);
      for (let j = 0; j < Q; j++) pooled[j] += counts[j];
      states++;
    }
  }
  assert.equal(controlled + free, N);
  assert.deepEqual([controlled, free], [12927, 29]);
  // These 29 independent first-rune plaintexts can all be set to the
  // most frequent recovered letter. This is a maximally permissive bound.
  pooled[0] += free;
  const orderedPairs = pooled.reduce((sum, n) => sum + n * (n - 1), 0);
  const maxIoC = orderedPairs / (N * (N - 1));
  return {period, states, orderedPairs, maxIoC, normalizedIoC: Q * maxIoC};
}

/** Minimum original-language coincidence of every length-N window. */
function minimumNativeWindow(source) {
  assert.ok(source.length >= N);
  const counts = new Uint32Array(Q);
  let pairs = 0, minimumPairs = Infinity, offset = -1;
  for (let i = 0; i < source.length; i++) {
    const incoming = source[i];
    pairs += 2 * counts[incoming];
    counts[incoming]++;
    if (i >= N) {
      const leaving = source[i - N];
      counts[leaving]--;
      pairs -= 2 * counts[leaving];
    }
    if (i >= N - 1 && pairs < minimumPairs) {
      minimumPairs = pairs;
      offset = i - N + 1;
    }
  }
  return {runes: source.length, offset, orderedPairs: minimumPairs,
    normalizedIoC: Q * minimumPairs / (N * (N - 1))};
}

/**
 * Source-English controlled positive with genuine GP-encoded Gibran prose.
 * Same original 32 punctuation intervals. Secret affine maps are full GP29
 * permutations; encrypt, invert and re-encode all runes exactly.
 */
function nativePlant(intervals, native, period) {
  const plain = native.slice(0, N);
  const encrypted = [], decoded = [];
  for (let index = 0; index < intervals.length; index++) {
    const interval = intervals[index];
    const slice = plain.slice(interval.start, interval.end);
    if (!slice.length) continue;
    const shift0 = mod(13 * index, Q);
    const cipher = [mod(slice[0] + shift0, Q)];
    const recovered = [mod(cipher[0] - shift0, Q)];
    for (let i = 1; i < slice.length; i++) {
      const shift = mod(13 * index + 5 * ((i - 1) % period), Q);
      const step = mod(7 * slice[i] + shift, Q);
      cipher.push(mod(cipher[i - 1] + step, Q));
      const observedStep = mod(cipher[i] - cipher[i - 1], Q);
      recovered.push(mod(25 * (observedStep - shift), Q));
    }
    assert.deepEqual(recovered, slice);
    for (let i = 1; i < cipher.length; i++) {
      const shift = mod(13 * index + 5 * ((i - 1) % period), Q);
      assert.equal(mod(cipher[i - 1] + 7 * recovered[i] + shift, Q), cipher[i]);
    }
    encrypted.push(...cipher);
    decoded.push(...recovered);
  }
  assert.deepEqual(decoded, plain);
  assert.equal(encrypted.length, N);
  const nativeCounts = new Uint32Array(Q);
  for (const x of decoded) nativeCounts[x]++;
  const nativePairs = nativeCounts.reduce((n, count) => n + count * (count - 1), 0);
  const originalCapacity = secretCapacity(intervals.map((s) => ({
    ...s, symbols: encrypted.slice(s.start, s.end)
  })), period);
  assert.ok(originalCapacity.orderedPairs >= nativePairs);
  return {period, runes: N, exactRecovery: true, exactReencryption: true,
    nativePairs, maxSecretPairs: originalCapacity.orderedPairs};
}

function main() {
  const intervals = originalIntervals();
  const references = [
    ["Gibran", "resources/control/gibran_prophet_58585.txt", 9993046],
    ["Emerson", "resources/control/emerson_essays_2944.txt", 10262872],
    ["Shakespeare", "resources/control/shakespeare_first300k.txt", 9704196]
  ];
  const native = references.map(([name, file, expected]) => {
    const runes = encodeWords(read(file)).flat();
    const min = minimumNativeWindow(runes);
    assert.equal(min.orderedPairs, expected);
    return {name, ...min, text: runes};
  });
  const thresholds = native.map((x) => x.normalizedIoC);
  const floor = Math.min(...thresholds);
  const models = Array.from({length: 29}, (_, i) => secretCapacity(intervals, i + 1));
  assert.deepEqual([models[0].orderedPairs, models[4].orderedPairs,
    models[12].orderedPairs, models[22].orderedPairs, models[28].orderedPairs],
    [6112530, 6761168, 8055896, 9356296, 10241944]);
  assert.ok(models.every((m) => m.period >= 26 || m.normalizedIoC < floor));
  assert.ok(models.find((m) => m.period === 26).normalizedIoC > floor);
  const plant = nativePlant(intervals, native[0].text, 23);
  const result = {
    target: "exact-original LP2 unknown physical pages 0..55",
    originalRunes: N, printedMarks: 31, markIntervals: intervals.length,
    nonemptyIntervals: 29, unrestrictedIntervalFirstRunes: 29,
    originalModels: models.map(({period, orderedPairs, normalizedIoC}) =>
      ({period, orderedPairs, normalizedIoC})),
    nativeControls: native.map(({text: omitted, ...remaining}) => remaining),
    bestNativeMinimum: floor,
    largestExcludedPeriod: 25,
    firstNotExcludedPeriod: 26,
    sourceNativePositive: plant,
    originalUnknownPlaintextRecovered: false,
    scope: "Only within-mark first differences decoded by a fixed bijection per interval and local phase, with phase reset at each large mark"
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (require.main === module) main();
module.exports = {main, originalIntervals, secretCapacity, minimumNativeWindow, nativePlant};
