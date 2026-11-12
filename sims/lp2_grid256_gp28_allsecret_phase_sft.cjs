"use strict";
/**
 * Original 256-byte p49–51 table vs the whole-book GP28 predecessor-exclusion
 * key family. An exact within-phase equality invariant eliminates every fixed
 * secret 256-phase rank permutation under the four source-bound clocks.
 *
 * Source: physical LP2 p0–55, 55 rune-bearing pages, 86 true adjacent
 * repetitions; source table 32x8 bytes; native Shakespeare/Gibran/Emerson.
 * Native controls replace entire words with length-matched GP words and impose
 * the original 86 literal marker positions. The hidden rank permutation is
 * arbitrary at each phase: the collision statistic is unchanged by any key.
 *
 * Run from repository root with Node.js >=20:
 * node sims/lp2_grid256_gp28_allsecret_phase_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeEnglish, seededRandom} =
  require("./outer_permutation_assignment.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"))
  .byte_rows.flat();
assert.equal(table.length, 256);
assert(table.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
const cipher = pages.flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
const parse = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(parse.runeCount, 12956);
assert.equal(parse.words.length, 2896);
const wordLengths = parse.words.map(w => w.length);
const starts = new Set();
let pageOffset = 0;
for (const p of pages) {
  starts.add(pageOffset);
  pageOffset += p.indices.length;
}
assert.equal(pageOffset, cipher.length);
const mod = (x, m) => ((x % m) + m) % m;

/** @param {boolean} pageReset @param {boolean} skipMarker */
function slots(pageReset, skipMarker) {
  const positions = [], phases = [], markers = [];
  let clock = 0;
  for (let i = 0; i < cipher.length; i++) {
    if (starts.has(i)) {
      if (pageReset) clock = 0;
      continue;
    }
    if (cipher[i] === cipher[i - 1]) {
      markers.push(i);
      if (!skipMarker) clock++;
    } else {
      positions.push(i);
      phases.push(clock % 256);
      clock++;
    }
  }
  assert.equal(markers.length, 86);
  assert.equal(positions.length, 12815);
  return {pageReset, skipMarker, positions, phases, markers};
}

/** @param {number} next @param {number} prior @param {string} kind */
function rank(next, prior, kind) {
  assert.notEqual(next, prior);
  return kind === "cyclic" ? mod(next - prior, 29) - 1 :
    next - (next > prior ? 1 : 0);
}

/** @param {number} value @param {number} prior @param {string} kind */
function fromRank(value, prior, kind) {
  return kind === "cyclic" ? (prior + value + 1) % 29 :
    value + (value >= prior ? 1 : 0);
}

/** @param {number[]} values @param {number[]} phases */
function equalityPairs(values, phases) {
  const freq = new Uint16Array(256 * 28);
  for (let i = 0; i < values.length; i++) {
    assert(values[i] >= 0 && values[i] < 28);
    freq[phases[i] * 28 + values[i]]++;
  }
  let equal = 0;
  for (const count of freq) equal += count * (count - 1);
  return equal;
}

/** @param {number} value @param {number} marker */
function fold(value, marker) {
  const v = value === marker ? (marker === 28 ? 27 : 1) : value;
  return marker === 0 ? v - 1 : v;
}

/** @param {number[]} text @param {ReturnType<typeof slots>} model
 *  @param {number} marker */
function controlPairs(text, model, marker) {
  const values = model.positions.map(pos => fold(text[pos], marker));
  return equalityPairs(values, model.phases);
}
const models = [
  slots(false, false), slots(false, true),
  slots(true, false), slots(true, true)
];
const original = models.map(model => {
  const result = {pageReset:model.pageReset, skipMarker:model.skipMarker,
    eligible:model.positions.length, markers:model.markers.length,
    orderedPairSlots:0};
  const counts = new Uint16Array(256);
  for (const p of model.phases) counts[p]++;
  for (const n of counts) result.orderedPairSlots += n * (n - 1);
  for (const kind of ["cyclic", "sorted"]) {
    result[kind] = equalityPairs(
      model.positions.map(i => rank(cipher[i], cipher[i - 1], kind)),
      model.phases);
  }
  return result;
});
assert.deepEqual(original.map(m => [m.cyclic, m.sorted]), [
  [22688, 22686], [22660, 22524],
  [23514, 23256], [23118, 23226]
]);

const referenceFiles = [
  ["Shakespeare", "shakespeare_first300k.txt", 0x331111],
  ["Gibran", "gibran_prophet_58585.txt", 0x331122],
  ["Emerson", "emerson_essays_2944.txt", 0x331133]
];

/** @param {string} file */
function referenceWords(file) {
  const source = read("resources/control/" + file).toUpperCase();
  const pools = new Map();
  for (const word of source.split(/[^A-Z]+/).filter(Boolean)) {
    const indices = encodeEnglish(word);
    if (indices.length === 0) continue;
    if (!pools.has(indices.length)) pools.set(indices.length, []);
    pools.get(indices.length).push(indices);
  }
  assert(wordLengths.every(len => pools.has(len)),
    "The source control requires all printed word lengths");
  return pools;
}

/** @param {Map<number, number[][]>} pools
 *  @param {() => number} rng */
function sampleNative(pools, rng) {
  const out = [];
  for (const len of wordLengths) {
    const options = pools.get(len);
    const picked = options[Math.floor(rng() * options.length)];
    out.push(...picked);
  }
  assert.equal(out.length, cipher.length);
  return out;
}
const REPLICATES = 120;
const controls = [];
let planted;
for (const [name, file, seed] of referenceFiles) {
  const pools = referenceWords(file), rng = seededRandom(seed);
  const rows = models.map(() => ({
    min:[Infinity,Infinity], max:[0,0], sum:[0,0],
    notGreaterThanOriginal:[0,0]
  }));
  for (let trial = 0; trial < REPLICATES; trial++) {
    const text = sampleNative(pools, rng);
    if (name === "Shakespeare" && trial === 0) planted = text;
    for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
      for (let markerIndex = 0; markerIndex < 2; markerIndex++) {
        const marker = markerIndex === 0 ? 0 : 28;
        const v = controlPairs(text, models[modelIndex], marker);
        const row = rows[modelIndex];
        row.min[markerIndex] = Math.min(row.min[markerIndex], v);
        row.max[markerIndex] = Math.max(row.max[markerIndex], v);
        row.sum[markerIndex] += v;
        if (v <= Math.max(original[modelIndex].cyclic,
          original[modelIndex].sorted)) {
          row.notGreaterThanOriginal[markerIndex]++;
        }
      }
    }
  }
  controls.push({name, sourceWords:[...pools.values()]
      .reduce((total, words) => total + words.length, 0),
    seed, replicates:REPLICATES,
    rows:rows.map(row => ({
      min:row.min, max:row.max,
      mean:row.sum.map(x => x / REPLICATES),
      notGreaterThanOriginal:row.notGreaterThanOriginal
    }))});
}
for (const source of controls) {
  for (const row of source.rows) {
    assert(row.min.every(n => n > 35000),
      "Native English signal must remain above 35,000 pairs");
    assert.deepEqual(row.notGreaterThanOriginal, [0,0]);
  }
}
assert(planted && planted.length === cipher.length);

/**
 * Forward/inverse source-byte-key positive, with the ORIGINAL 86 marker sites.
 * This proves a 256-phase GP28 key is detectable, and every symbol and key
 * clock can be reconstructed exactly when the model is actually present.
 * @param {ReturnType<typeof slots>} model
 * @param {"cyclic"|"sorted"} kind
 * @param {number} marker
 */
function positive(model, kind, marker) {
  const groups = new Int16Array(cipher.length).fill(-1);
  model.positions.forEach((pos, j) => {groups[pos] = model.phases[j];});
  const markerSites = new Set(model.markers);
  const fake = new Array(cipher.length);
  const recovered = new Array(cipher.length);
  for (let i = 0; i < fake.length; i++) {
    if (starts.has(i)) {
      fake[i] = planted[i];
      recovered[i] = fake[i];
    } else if (markerSites.has(i)) {
      fake[i] = fake[i - 1];
      recovered[i] = marker;
    } else {
      const p = fold(planted[i], marker);
      const k = table[groups[i]] % 28;
      fake[i] = fromRank((p + k) % 28, fake[i - 1], kind);
      recovered[i] = rank(fake[i], fake[i - 1], kind);
      recovered[i] = mod(recovered[i] - k, 28);
      assert.equal(recovered[i], p);
      assert.equal(fromRank(mod(recovered[i] + k, 28), fake[i-1],
        kind), fake[i]);
    }
  }
  assert.equal(fake.length, 12956);
  let positives = 0, markers = 0;
  for (const pos of model.positions) {
    assert.equal(recovered[pos], fold(planted[pos], marker));
    positives++;
  }
  for (const pos of model.markers) {
    assert.equal(fake[pos], fake[pos-1]);
    assert.equal(recovered[pos], marker);
    markers++;
  }
  assert.equal(positives, 12815);
  assert.equal(markers, 86);
  const observed = equalityPairs(
    model.positions.map(i => rank(fake[i],fake[i-1],kind)), model.phases);
  const native = controlPairs(planted, model, marker);
  assert.equal(observed, native);
  return {pageReset:model.pageReset, skipMarker:model.skipMarker,
    rankKind:kind, marker, recoveredNonmarker:positives,
    plantedMarkers:markers, originalLayoutRunes:fake.length,
    keyKnownRoundtrip:true, unchangedEqualityPairs:observed};
}
const positives = [];
for (const model of models) {
  for (const kind of ["cyclic","sorted"]) {
    for (const marker of [0,28]) positives.push(positive(model,kind,marker));
  }
}
const output = {
  scope:"source-grid 256-phase GP28 predecessor-exclusion substitution family",
  sourceGridBytes:table.length,
  originalRunes:cipher.length,
  words:wordLengths.length,
  sourcePageLeaders:starts.size,
  repeats:86,
  eligible:12815,
  original,
  controls,
  positives,
  conclusion:"For these source-bound key clocks, neither natural predecessor rank " +
    "convention permits even an arbitrary secret bijection at each 256-phase " +
    "to reproduce native-English GP28 phase equality. This is NOT a universal " +
    "proof against plaintext from other languages, altered segmentation, " +
    "nonperiodic states, or additional layers."
};
console.log(JSON.stringify(output, null, 2));
