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

const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const inkByPage = new Map(annotations.pages.map(page => [page.page, page]));

/**
 * Concede an entirely new, secret four-phase codebook after every original
 * red-ink start/end and every large physical 10/13/23-dot punctuation.
 * Marks coinciding with page edges or each other are deduplicated. Every
 * newly formed segment's first GP rune is granted an unrestricted plaintext.
 * @returns {number[][]}
 */
function sourceMarkedSegments() {
  const out = [];
  for (const page of pages) {
    const raw = page.indices;
    const cuts = new Set([0, raw.length]);
    const ink = inkByPage.get(page.page);
    if (ink) {
      for (const span of ink.red_spans || []) {
        cuts.add(span.start);
        cuts.add(span.start + span.length);
      }
      for (const mark of ink.large_punctuation || [])
        cuts.add(mark[0]);
    }
    const boundaries = [...cuts].sort((a, b) => a - b);
    assert(boundaries.every(n => n >= 0 && n <= raw.length));
    for (let i = 1; i < boundaries.length; i++) {
      const segment = raw.slice(boundaries[i - 1], boundaries[i]);
      if (segment.length) out.push(segment);
    }
  }
  assert.equal(out.reduce((n, segment) => n + segment.length, 0), window);
  assert.equal(out.length, 77);
  return out;
}

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
 * @param {number[][]} shapes Physical-page or source-marked shapes
 * @returns {number[][]}
 */
function positivePlant(plain, shapes) {
  assert.equal(plain.length, window);
  let index = 0;
  const out = [];
  for (let section = 0; section < shapes.length; section++) {
    const n = shapes[section].length;
    const piece = plain.slice(index, index + n);
    index += n;
    const maps = Array.from({length: 4}, (_, phase) =>
      permutation(0x3301 + section * 131 + phase * 65537));
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
  const segments = sourceMarkedSegments();
  const marked4 = topKCapacity(segments, 4, 8);
  assert.deepEqual(marked4, [1361, 2428, 3359, 4196,
    4966, 5681, 6347, 6964]);
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
    assert(actual.minTopK.every((value, k) => value > marked4[k]));
    assert(actual.minE > periodBounds[4]);
    console.log(JSON.stringify({reference: name,
      nativeRunes: encoded.length, windows: actual.windows,
      minimumE: actual.minE, minimumTopK: actual.minTopK}));
    if (i === 0) plantSource = encoded.slice(0, window);
  }

  // Two independent non-English source-native GP corpora provide a stronger
  // robustness check than an English-only lexical assumption. Their serialized
  // GP indices are pinned in the repository and require no model fitting.
  const oldEnglish = JSON.parse(read(
    "resources/control/beowulf_oe_gp_profile_corrected.json"));
  const oeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabc";
  const oldEnglishRunes = [...oldEnglish.sourceGpBase29]
    .map(ch => oeAlphabet.indexOf(ch));
  assert.equal(oldEnglishRunes.length, 48012);
  assert(oldEnglishRunes.every(x => x >= 0 && x < 29));
  const latinAlphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
  const latinRunes = read("resources/control/latin-vulgate-gp-wholewords.txt")
     .split(/\r?\n/).map(line => line.trim())
    .filter(line => /^[0-9A-S]+$/.test(line)).join("")
    .split("").map(ch => latinAlphabet.indexOf(ch));
  assert.equal(latinRunes.length, 204802);
  assert(latinRunes.every(x => x >= 0 && x < 29));
  const additional = [
    ["Old English Beowulf", oldEnglishRunes, 1477,
      [1477, 2560, 3598, 4403, 5130, 5809, 6469, 7055]],
    ["Latin Vulgate", latinRunes, 1316,
      [1465, 2837, 4113, 5275, 6319, 7242, 8048, 8812]]
  ];
  for (const [name, runes, minE, minTopK] of additional) {
    const actual = nativeMinima(runes, 8);
    assert.equal(actual.minE, minE);
    assert.deepEqual(actual.minTopK, minTopK);
    assert(actual.minTopK.every((count, k) => count > marked4[k]));
    assert(actual.minTopK[0] > periodBounds[4]);
    console.log(JSON.stringify({reference: name, nativeRunes: runes.length,
      windows: actual.windows, minimumE: actual.minE,
      minimumTopK: actual.minTopK}));
  }

  assert(plantSource);
  const synthetic = positivePlant(plantSource, streams);
  const plantBound = topKCapacity(synthetic, 4, 8);
  const counts = Array(29).fill(0);
  for (const rune of plantSource) counts[rune]++;
  const nativeTopK = topKFromCounts(counts, 8);
  assert(nativeTopK.every((value, i) => value <= plantBound[i]));
  const syntheticMarked = positivePlant(plantSource, segments);
  const markedPlantBound = topKCapacity(syntheticMarked, 4, 8);
  assert(nativeTopK.every((value, i) => value <= markedPlantBound[i]));
  console.log(JSON.stringify({originalPages: pages.length,
    originalRunes: window, unknownPerPagePerPhaseBijections: 55 * 4,
    originalFourPhaseTopKMax: core4,
    originalMarkedSegments: segments.length,
    originalMarkedFourPhaseTopKMax: marked4,
    originalPeriods1to5TopSymbolMax: periodBounds,
    syntheticNativeTopK: nativeTopK,
    syntheticCipherTopKCapacity: plantBound,
    positive: "PASS native GP29 positive on 55 and 77 independent four-phase cipher segments"}));
  console.log("PASS: original predecessor-difference data excludes all"
    + " page-specific stationary <=5-phase GP29 bijections for these"
    + " 12,956-rune five-language native-GP controls; no unknown plaintext recovered");
}
main();
