"use strict";
/**
 * Exact source-conditioned gate for an online GP29 cipher that reserves
 * one predecessor-zero marker at word starts and another inside words.
 * 29 independent marker choices in each group cover all 29*29 pairs.
 * No cipher key is fitted. All matching tests use original LP2 ciphertext.
 *
 * Run: node sims/lp2_two_marker_word_boundary_sft.cjs 300
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const DATA = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const DICT = new Map(DATA.runes.map((r, i) => [r, i]));
const TRANS = [...DATA.translit.entries()].map(([i, s]) => [s, i])
  .sort((a, b) => b[0].length - a[0].length);
const originalWords = read("resources/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%").split(/[-.&$§]/u)
  .map((part) => [...part].filter((c) => DICT.has(c)).map((c) => DICT.get(c)))
  .filter((word) => word.length);
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.flat().length, 12956);

const REPS = Number(process.argv[2] || 300);
assert.ok(Number.isInteger(REPS) && REPS >= 1 && REPS <= 10000);
const SEED = 0x48ac2026;
let state = SEED;
/** @returns {number} A reproducible uniform variate in [0,1). */
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
/** @param {string} text @returns {number[] | null} */
function gpWord(text) {
  const normalized = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let pos = 0; pos < normalized.length;) {
    const token = TRANS.find(([s]) => normalized.startsWith(s, pos));
    if (!token) return null;
    out.push(token[1]);
    pos += token[0].length;
  }
  return out;
}
/** @param {number} len @param {number} pos @returns {number} */
function bucket(len, pos) {
  return Math.min(len, 10) * 24 + (pos === 0 ? 0
    : pos === len - 1 ? 1 : 2 + Math.min(pos, 8));
}
function originalCounts() {
  const byClass = [new Map(), new Map()], halves = [
    { slots: [0, 0], events: [0, 0] },
    { slots: [0, 0], events: [0, 0] }
  ];
  let prev = -1, slots = [0, 0], events = [0, 0];
  for (let wi = 0; wi < originalWords.length; wi++) {
    const word = originalWords[wi], half = halves[+(wi >= 1448)];
    for (let i = 0; i < word.length; i++) {
      const cls = +(i > 0), b = bucket(word.length, i);
      if (prev >= 0) {
        const row = byClass[cls].get(b) || { n: 0, e: 0 };
        const event = +(word[i] === prev);
        row.n++;
        row.e += event;
        byClass[cls].set(b, row);
        slots[cls]++;
        events[cls] += event;
        half.slots[cls]++;
        half.events[cls] += event;
      }
      prev = word[i];
    }
  }
  assert.deepEqual(slots, [2895, 10060]);
  assert.deepEqual(events, [23, 63]);
  return { byClass, halves, slots, events };
}
/** @param {string} text */
function languageModel(text) {
  const words = (text.match(/[A-Za-z]+/g) || []).map(gpWord).filter(Boolean);
  const counts = new Map();
  for (const word of words) for (let i = 0; i < word.length; i++) {
    const b = bucket(word.length, i);
    const row = counts.get(b) || new Uint32Array(30);
    row[word[i]]++;
    row[29]++;
    counts.set(b, row);
  }
  const probabilities = new Map();
  for (const [b, countsAtBin] of counts) {
    const p = new Float64Array(29);
    for (let k = 0; k < 29; k++) {
      p[k] = (countsAtBin[k] + 0.25) / (countsAtBin[29] + 7.25);
    }
    probabilities.set(b, p);
  }
  return { words, probabilities };
}
/** @param {number} n @param {number} e @param {number} q */
function binomialDeviance(n, e, q) {
  if (n === 0) return 0;
  const actual = e / n;
  return 2 * ((e ? e * Math.log(actual / q) : 0)
    + (e === n ? 0 : (n - e) * Math.log((1 - actual) / (1 - q))));
}
/** @param {number} n @param {number} p @returns {number} */
function sampleBinomial(n, p) {
  let e = 0;
  for (let i = 0; i < n; i++) e += +(random() < p);
  return e;
}
/** @param {{n:number,e:number,q:Float64Array}[]} rows @param {number[]} events */
function fitUnknownMarker(rows, events) {
  let selected = -1, value = Infinity;
  for (let k = 0; k < 29; k++) {
    let d = 0;
    for (let i = 0; i < rows.length; i++) {
      d += binomialDeviance(rows[i].n, events[i], rows[i].q[k]);
    }
    if (d < value) {
      selected = k;
      value = d;
    }
  }
  return { markerIndex: selected, deviance: value };
}
/**
 * Bootstrap independently across every possible underlying marker.
 * After EACH simulation, refit the best of all 29 labels.
 * @param {{n:number,e:number,q:Float64Array}[]} rows
 */
function calibrate(rows) {
  const observed = fitUnknownMarker(rows, rows.map((r) => r.e));
  const stats = [];
  for (let trueMarker = 0; trueMarker < 29; trueMarker++) {
    let exceed = 0;
    for (let trial = 0; trial < REPS; trial++) {
      const sampled = rows.map((r) => sampleBinomial(r.n, r.q[trueMarker]));
      const best = fitUnknownMarker(rows, sampled);
      exceed += +(best.deviance >= observed.deviance - 1e-9);
    }
    stats.push({ marker: DATA.translit[trueMarker], exceed });
  }
  const worst = [...stats].sort((a, b) => b.exceed - a.exceed)[0];
  return {
    originalBestMarker: DATA.translit[observed.markerIndex],
    originalDeviance: observed.deviance,
    worstCaseAcrossAll29UnderlyingMarkers: {
      maximumExceedances: worst.exceed,
      trialsPerUnderlyingMarker: REPS,
      addOneUpperTailEstimate: (worst.exceed + 1) / (REPS + 1)
    },
    all29ExceedanceCounts: stats
  };
}
/**
 * Synthetic positive test. At each non-initial position the online
 * difference equals a keyed bijection of GP symbols to {0,...,28}.
 * The word-start or internal selected plaintext marker maps to zero.
 * The first plaintext symbol is transmitted as the initialization C0.
 * The exact inverse recovers every original planted symbol.
 * @param {number[][]} words
 */
function plantedRoundtrip(words) {
  const labels = [28, 7]; // EA at starts, W elsewhere (example, not original key).
  const inv = new Int8Array(29);
  for (let k = 1; k < 29; k++) for (let x = 1; x < 29; x++) {
    if ((x * k) % 29 === 1) inv[k] = x;
  }
  const plain = words.flat(), cipher = [plain[0]], decoded = [plain[0]];
  let i = 0, collisions = 0;
  for (const word of words) for (let pos = 0; pos < word.length; pos++, i++) {
    if (i === 0) continue;
    const m = labels[+(pos > 0)], p = plain[i];
    const delta = p === m ? 0 : p < m ? p + 1 : p;
    const key = 1 + (i % 28);
    cipher.push((cipher[i - 1] + key * delta) % 29);
    const observedDelta = (cipher[i] - cipher[i - 1] + 29) % 29;
    const recoveredDelta = observedDelta * inv[key] % 29;
    const value = recoveredDelta === 0 ? m
      : recoveredDelta <= m ? recoveredDelta - 1 : recoveredDelta;
    decoded.push(value);
    const repeat = cipher[i] === cipher[i - 1];
    assert.equal(repeat, p === m);
    collisions += +repeat;
  }
  assert.deepEqual(decoded, plain);
  return { runes: plain.length, markerAtWordStarts: "EA",
    markerInsideWords: "W", observedCiphertextRepeats: collisions,
    exactInverseRecovered: decoded.length, allRepeatedPositionsExact: true };
}

const original = originalCounts();
const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const reports = [];
for (const [name, file] of sources) {
  const model = languageModel(read(file));
  const categories = original.byClass.map((group, cls) => {
    const rows = [...group].map(([b, observedAtBin]) => ({
      ...observedAtBin, q: model.probabilities.get(b)
    }));
    assert.ok(rows.every((r) => r.q), "Missing reference word-position bin");
    return { class: cls === 0 ? "word-first" : "word-interior",
      sourceBins: rows.length, slots: original.slots[cls],
      repeatEvents: original.events[cls], ...calibrate(rows) };
  });
  reports.push({ source: name, referenceFile: file,
    GPSourceWords: model.words.length, categories });
}
const positiveSource = languageModel(read(sources[0][1])).words.slice(0, 2000);
const output = {
  classification: "Source-conditioned exclusion of independent two-marker online repeat architecture",
  alphabet: "GP29",
  architecture: "C_i=C_(i-1)+K_i*rank_m(P_i) mod29, K_i in 1..28, with independent unknown zero marker m at word starts and interiors",
  exactOriginal: { words: originalWords.length, runes: 12956,
    slots: original.slots, repeatEvents: original.events,
    halves: original.halves },
  bootstrap: { replicatesPerTrueMarkerPerClass: REPS,
    underlyingMarkersPerClass: 29, jointlyCoveredMarkerPairs: 841,
    seed: "0x" + SEED.toString(16),
    reselectBestOf29InEachSimulatedSample: true,
    model: "Independent Bernoulli per source-conditioned word-length/position bin; conditional on original printed word lengths" },
  referenceOrthography: "QU->CW, V->U, K->C, Z->S; longest GP transliteration match",
  sources: reports,
  constructivePlant: plantedRoundtrip(positiveSource),
  limits: "Conditional on native GP plaintext and original whole-word positions, chosen reference lexicons, and exactly one invariant zero marker per position class. Non-GP and changing-state encodings remain open."
};
process.stdout.write(JSON.stringify(output, null, 2) + "\n");
