"use strict";
/**
 * LP2 source-motivated four-state predecessor-difference capacity test.
 *
 * The source-visible 32x8 numerical table, after two DH2 circumference
 * peels, has 28 rows and 4 columns. The 28 nonzero differences in a GP29
 * predecessor stream suggest a candidate 4-column substitution look-up.
 * We test a stronger all-secret family without interpreting table values:
 * every physical page, every phase may have an arbitrary independent
 * bijection between its ciphertext predecessor difference and GP plaintext.
 *
 * Native GP29 English from three independent checked-in references is the
 * explicit conditional comparator. No plaintext is inferred from this test.
 *
 * Node 22 CommonJS, reads immutable original input and source controls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const original = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = original.pages.filter(p => p.page <= 55 && p.indices.length);
const window = 12956;
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), window);
assert.equal(original.translit.length, 29);

const reference = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"]
];
const symbols = original.translit.map((name, index) => ({name, index}))
  .sort((a, b) => b.name.length - a.name.length);

/**
 * GP-native word-preserving transliteration. This is the same explicit
 * QU/CW, KQ/C, V/U, Z/S, greedy longest-GP convention used by earlier
 * genuine-language controls, not fitted to LP2 ciphertext.
 * @param {string} input
 * @returns {number[]}
 */
function encodeGP(input) {
  const clean = input.replace(/^#.*$/gm, " ").toUpperCase()
    .replace(/QU/g, "CW").replace(/[KQ]/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    const output = [];
    let okay = true;
    for (let i = 0; i < word.length;) {
      const symbol = symbols.find(x => word.startsWith(x.name, i));
      if (!symbol) {
        okay = false;
        break;
      }
      output.push(symbol.index);
      i += symbol.name.length;
    }
    if (okay) result.push(...output);
  }
  return result;
}

/**
 * A bound for an all-secret, page-specific, phase-specific permutation
 * of every predecessor difference. It is independent of the unknown
 * permutation and of any concrete byte-to-rune table interpretation.
 *
 * At each page/phase, an injective decoder assigns at most one observed
 * difference symbol to each desired plaintext GP rune. Therefore the
 * total count of ANY chosen k plaintext runes is bounded by the sum of
 * the k largest ciphertext difference bins across all page/phase strata.
 * Grant every first rune an unrestricted symbol (+55 in total).
 *
 * @param {number[][]} streams Full physical page cipher tapes
 * @param {number} period Number of independent phase maps per page
 * @param {number} kMax Number of most frequent symbols to bound
 * @returns {number[]}
 */
function topKCapacity(streams, period, kMax) {
  const bounds = Array(kMax).fill(streams.length);
  for (const stream of streams) {
    const histograms = Array.from({length: period}, () => Array(29).fill(0));
    for (let i = 1; i < stream.length; i++) {
      const delta = (stream[i] - stream[i - 1] + 29) % 29;
      histograms[i % period][delta]++;
    }
    for (const histogram of histograms) {
      const ordered = histogram.slice().sort((a, b) => b - a);
      let sum = 0;
      for (let k = 0; k < kMax; k++) {
        sum += ordered[k];
        bounds[k] += sum;
      }
    }
  }
  return bounds;
}

/**
 * The most frequent k distinct GP symbols in a complete native window.
 * @param {number[]} counts 29-symbol frequency vector
 * @param {number} kMax
 * @returns {number[]}
 */
function topKFromCounts(counts, kMax) {
  const sorted = counts.slice().sort((a, b) => b - a);
  const result = [];
  let sum = 0;
  for (let k = 0; k < kMax; k++) {
    sum += sorted[k];
    result.push(sum);
  }
  return result;
}

/**
 * Exact sliding 12,956-symbol reference minima across all windows.
 * Explicitly track E (index18) as an independent language diagnostic.
 * @param {number[]} stream
 * @param {number} kMax
 * @returns {{windows:number,minE:number,minTopK:number[]}}
 */
function nativeMinima(stream, kMax) {
  assert(stream.length >= window);
  const counts = Array(29).fill(0);
  for (let i = 0; i < window; i++) counts[stream[i]]++;
  const minimum = Array(kMax).fill(Infinity);
  let minE = Infinity;
  /** @returns {void} */
  function check() {
    const kCounts = topKFromCounts(counts, kMax);
    for (let k = 0; k < kMax; k++)
      minimum[k] = Math.min(minimum[k], kCounts[k]);
    minE = Math.min(minE, counts[18]);
  }
  check();
  for (let i = window; i < stream.length; i++) {
    counts[stream[i - window]]--;
    counts[stream[i]]++;
    check();
  }
  return {windows: stream.length - window + 1, minE,
    minTopK: minimum};
}

/**
 * Deterministic and invertible GP29 position/state permutation, for a
 * genuine (long) English positive with a new secret map on EVERY page
 * and EVERY phase. It is intentionally more powerful than the fixed
 * four-column p50 lookup and cannot overstate negative evidence.
 * @param {number} seed
 * @returns {number[]}
 */
function permutation(seed) {
  const values = Array.from({length: 29}, (_, i) => i);
  let state = seed >>> 0;
  for (let i = 28; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  assert.equal(new Set(values).size, 29);
  return values;
}

/**
 * A native long-source stream encrypted under arbitrary per-page/four-phase
 * GP difference permutations. Check the inverse on all 12,956 symbols.
 * @param {number[]} plain
 * @returns {number[][]}
 */
function positivePlant(plain) {
  assert.equal(plain.length, window);
  let index = 0;
  const out = [];
  for (const page of pages) {
    const n = page.indices.length;
    const piece = plain.slice(index, index + n);
    index += n;
    const maps = Array.from({length: 4}, (_, phase) =>
      permutation(0x3301 + page.page * 131 + phase * 65537));
    const inverses = maps.map(map => {
      const inverse = Array(29).fill(-1);
      for (let j = 0; j < 29; j++) inverse[map[j]] = j;
      return inverse;
    });
    const cipher = [piece[0]];
    const decoded = [piece[0]];
    for (let i = 1; i < n; i++) {
      const phase = i % 4;
      const delta = inverses[phase][piece[i]];
      assert(delta >= 0);
      cipher.push((cipher[i - 1] + delta) % 29);
      decoded.push(maps[phase][(cipher[i] - cipher[i - 1] + 29) % 29]);
    }
    assert.deepEqual(decoded, piece);
    out.push(cipher);
  }
  assert.equal(index, window);
  return out;
}

function main() {
  const streams = pages.map(p => p.indices);
  const core4 = topKCapacity(streams, 4, 8);
  assert.deepEqual(core4, [1243, 2250, 3146, 3975,
    4740, 5453, 6115, 6732]);
  // Even any one of 55 independently rekeyed page/phase decoders fails.
  const periodBounds = [1, 2, 3, 4, 5].map(period =>
    topKCapacity(streams, period, 1)[0]);
  assert.deepEqual(periodBounds, [856, 1018, 1150, 1243, 1380]);

  const expected = [
    {minE: 1407, minTopK: [1407, 2556, 3489, 4411,
      5274, 6128, 6916, 7608]},
    {minE: 1482, minTopK: [1482, 2514, 3508, 4472,
      5407, 6310, 7168, 7936]},
    {minE: 1397, minTopK: [1397, 2459, 3422, 4322,
      5138, 5920, 6680, 7358]}
  ];
  let plantSource = null;
  for (let i = 0; i < reference.length; i++) {
    const [name, filename] = reference[i];
    const encoded = encodeGP(read(filename));
    const actual = nativeMinima(encoded, 8);
    assert.equal(actual.minE, expected[i].minE);
    assert.deepEqual(actual.minTopK, expected[i].minTopK);
    assert(actual.minTopK.every((value, k) => value > core4[k]));
    assert(actual.minE > periodBounds[4]);
    console.log(JSON.stringify({reference: name,
      nativeRunes: encoded.length, windows: actual.windows,
      minimumE: actual.minE, minimumTopK: actual.minTopK}));
    if (i === 0) plantSource = encoded.slice(0, window);
  }

  assert(plantSource);
  const synthetic = positivePlant(plantSource);
  const plantBound = topKCapacity(synthetic, 4, 8);
  const counts = Array(29).fill(0);
  for (const rune of plantSource) counts[rune]++;
  const nativeTopK = topKFromCounts(counts, 8);
  assert(nativeTopK.every((value, i) => value <= plantBound[i]));
  console.log(JSON.stringify({originalPages: pages.length,
    originalRunes: window, unknownPerPagePerPhaseBijections: 55 * 4,
    originalFourPhaseTopKMax: core4,
    originalPeriods1to5TopSymbolMax: periodBounds,
    syntheticNativeTopK: nativeTopK,
    syntheticCipherTopKCapacity: plantBound,
    positive: "PASS genuine GP29 native passage, every rune inverse, 55x4 secret maps"}));
  console.log("PASS: original predecessor-difference data excludes all"
    + " page-specific stationary <=5-phase GP29 bijections for these"
    + " 12,956-rune native-English controls; no unknown plaintext recovered");
}
main();
