"use strict";

/**
 * A source-calibrated English -> Gematria Primus encoder and bounded SFT.
 *
 * The literal solved LP1 words show the rune commonly romanized IA / IOR
 * used for IO in FUNCTION, CONSUMPTION and BEHAVIORS, and NG / ING used
 * for the three-character suffix ING in FOLLOWING and THINGS. A naive
 * longest-token match on the canonical inventory ("IA","NG") misses
 * these two authenticated spellings.
 *
 * This file exposes encodeSourceNativeGP for subsequent cryptanalysis and
 * tests the original eight-phase all-secret cipher-family invariants
 * against the calibrated language encoding. This is a spelling-register
 * sensitivity test, NOT a claim of plaintext decryption or proof that
 * all source text follows a universal transliteration rule.
 *
 * SFT: node sims/lp2_native_gp_source_orthography_sft.cjs
 * Node.js 20+ CommonJS, no third-party packages or network calls.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceLP1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const runeMap = new Map(gp.runes.map((glyph, ordinal) => [glyph, ordinal]));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const FIB = new Set([0, 1, 2, 3, 5, 8, 13, 21, 34, 55]);
const N = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(N, 12956);
assert.equal(pages.length, 55);

/**
 * A bounded source-attested English orthography. This greedy encoder
 * gives ING precedence over I+NG, IO over I+O, and otherwise uses the
 * repository's established longest GP rune token mapping.
 *
 * @param {string} original
 * @param {boolean} sourceCalibration
 * @returns {number[]}
 */
function encodeNativeGP(original, sourceCalibration = true) {
  const clean = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (sourceCalibration && word.startsWith("ING", i)) {
        out.push(21); // ᛝ = ING here; source also uses it for NG.
        i += 3;
      } else if (sourceCalibration && word.startsWith("IO", i)) {
        out.push(27); // ᛡ = IO here; source labels it IA / IOR.
        i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "unmapped native source spelling");
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}

/** @param {number[]} nums */
const toRunes = nums => nums.map(x => gp.runes[x]).join("");
const calibrations = [
  ["FOLLOWING", "ᚠᚩᛚᛚᚩᚹᛝ"],
  ["THINGS", "ᚦᛝᛋ"],
  ["STRONG", "ᛋᛏᚱᚩᛝ"],
  ["FUNCTION", "ᚠᚢᚾᚳᛏᛡᚾ"],
  ["CONSUMPTION", "ᚳᚩᚾᛋᚢᛗᛈᛏᛡᚾ"],
  ["BEHAVIORS", "ᛒᛖᚻᚪᚢᛡᚱᛋ"],
  ["GREAT", "ᚷᚱᛠᛏ"],
  ["QUESTION", "ᚳᚹᛖᛋᛏᛡᚾ"]
];
for (const [latin, original] of calibrations) {
  assert(sourceLP1.includes(original), "literal LP1 original rune witness: " + latin);
  assert(original.split("").every(x => runeMap.has(x)));
  assert.equal(toRunes(encodeNativeGP(latin)), original, latin);
}
// Complete source witness: 181 consecutive plaintext words on original
// solved LP1 physical pages 10-13. Original physical p12->p13 splits
// ADHERENCE across a page boundary without inserting a word delimiter.
const plainLP1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const startP10 = sourceLP1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const afterP13 = sourceLP1.indexOf("\n$\n%\n", startP10);
assert(startP10 >= 0 && afterP13 > startP10);
const printedP10to13 = sourceLP1.slice(startP10, afterP13)
  .replace(/\/\n%\n/g, "").replace(/\/\n/g, "").replace(/\n/g, "");
const sourceWordPattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const printedWords = printedP10to13.match(sourceWordPattern) || [];
const plainSections = plainLP1.split(/### (\d+)\n/);
const referenceWords = [];
for (let i = 1; i < plainSections.length; i += 2) {
  const pageNumber = Number(plainSections[i]);
  if (pageNumber < 10 || pageNumber > 13) continue;
  const cleaned = plainSections[i + 1].replace(/^\[[^\n]*\]$/gm, "");
  referenceWords.push(...(cleaned.match(/[A-Z]+/g) || []));
}
assert.equal(printedWords.length, 181);
assert.equal(referenceWords.length, 181);
const legacyExact = referenceWords.filter((word, i) =>
  toRunes(encodeNativeGP(word, false)) === printedWords[i]).length;
assert.equal(legacyExact, 165, "naive NG/IA labels match 165 of 181 words");
assert.deepEqual(referenceWords.map(word => toRunes(encodeNativeGP(word))),
  printedWords, "source-calibrated GP spelling reconstructs all 181");
assert.notEqual(toRunes(encodeNativeGP("FOLLOWING", false)),
  calibrations[0][1]);
assert.notEqual(toRunes(encodeNativeGP("FUNCTION", false)),
  calibrations[3][1]);

/**
 * @param {number[]} array
 * @returns {{page:number,indices:number[]}[]}
 */
function pageOverlay(array) {
  assert.equal(array.length, N);
  let start = 0;
  return pages.map(p => {
    const result = {page:p.page, indices:array.slice(start, start + p.indices.length)};
    start += p.indices.length;
    return result;
  });
}

/**
 * Same-phase equal-symbol pairs, invariant under arbitrary independent
 * secret GP29 bijections in each original printed-page/phase class.
 *
 * @param {{page:number,indices:number[]}[]} pieces
 * @param {"delta"|"native"} mode
 * @param {boolean} fibOnly
 * @param {boolean} pageSpecific
 */
function phaseCollisions(pieces, mode, fibOnly, pageSpecific) {
  const classes = new Map();
  let n = 0, pairs = 0, hits = 0;
  for (const p of pieces) {
    if (fibOnly && !FIB.has(p.page)) continue;
    for (let i = 1; i < p.indices.length; i++) {
      const phase = (i - 1) % 8;
      const key = pageSpecific ? p.page * 8 + phase : phase;
      let row = classes.get(key);
      if (!row) { row = new Uint32Array(29); classes.set(key, row); }
      const v = mode === "native" ? p.indices[i]
        : (p.indices[i] - p.indices[i - 1] + 29) % 29;
      row[v]++;
      n++;
    }
  }
  for (const row of classes.values()) {
    const m = row.reduce((s, x) => s + x, 0);
    pairs += m * (m - 1) / 2;
    hits += row.reduce((s, x) => s + x * (x - 1) / 2, 0);
  }
  return {n, pairs, hits, rate: hits / pairs};
}

/**
 * At i>=16, an eight-phase bijection of lag-eight plaintext
 * differences preserves D_i==D_(i-8) exactly.
 *
 * @param {{page:number,indices:number[]}[]} pieces
 * @param {"delta"|"plainLag8"} mode
 * @param {boolean} fibOnly
 */
function lagEightEqualities(pieces, mode, fibOnly) {
  let hits = 0, n = 0;
  for (const p of pieces) {
    if (fibOnly && !FIB.has(p.page)) continue;
    const x = p.indices;
    for (let i = 16; i < x.length; i++) {
      const left = mode === "delta"
        ? (x[i] - x[i - 1] + 29) % 29
        : (x[i] - x[i - 8] + 29) % 29;
      const right = mode === "delta"
        ? (x[i - 8] - x[i - 9] + 29) % 29
        : (x[i - 8] - x[i - 16] + 29) % 29;
      hits += Number(left === right);
      n++;
    }
  }
  return {hits, n, rate: hits / n};
}
const source = [
  phaseCollisions(pages, "delta", false, false),
  phaseCollisions(pages, "delta", true, false),
  phaseCollisions(pages, "delta", false, true),
  phaseCollisions(pages, "delta", true, true)
];
assert.deepEqual(source.map(x => [x.hits, x.pairs, x.n]), [
  [366695, 10396697, 12901],
  [12128, 339910, 2336],
  [6859, 192687, 12901],
  [1237, 35013, 2336]
]);
const originalLag8 = lagEightEqualities(pages, "delta", true);
assert.deepEqual([originalLag8.hits, originalLag8.n], [43, 2186]);

const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 32],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 8],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 48]
];
let total = 0;
const minimum = [Infinity, Infinity, Infinity, Infinity, Infinity];
const summary = [];
for (const [name, file, expected] of corpora) {
  const text = read(file);
  const legacy = encodeNativeGP(text, false);
  const corrected = encodeNativeGP(text, true);
  let count = 0;
  const localMin = [Infinity, Infinity, Infinity, Infinity, Infinity];
  for (let start = 0; start + N <= corrected.length; start += Math.floor(N / 2)) {
    const p = pageOverlay(corrected.slice(start, start + N));
    const values = [
      phaseCollisions(p, "native", false, false).rate,
      phaseCollisions(p, "native", true, false).rate,
      phaseCollisions(p, "native", false, true).rate,
      phaseCollisions(p, "native", true, true).rate,
      lagEightEqualities(p, "plainLag8", true).rate
    ];
    values.forEach((v, i) => {
      minimum[i] = Math.min(minimum[i], v);
      localMin[i] = Math.min(localMin[i], v);
      if (i < 4) assert(v > source[i].rate, name + " source-native phase");
      else assert(v > originalLag8.rate, name + " source-native lag8");
    });
    count++;
  }
  assert.equal(count, expected, name);
  total += count;
  const frequencies = arr => {
    const counts = new Int32Array(29);
    for (const v of arr) counts[v]++;
    return {ING:counts[21] / arr.length, IOR:counts[27] / arr.length};
  };
  summary.push({
    name, windows: count, originalGPControlRunes: legacy.length,
    sourceGPControlRunes: corrected.length,
    legacyFrequencies: frequencies(legacy),
    calibratedFrequencies: frequencies(corrected),
    controlMinimums: localMin
  });
}
assert.equal(total, 88);
assert(minimum.every((value, i) =>
  value > (i < 4 ? source[i].rate : originalLag8.rate)));

// Positive plant: a source-calibrated GP English sequence encrypted under
// arbitrary fixed bijections for each phase retains all equality counts.
const plant = encodeNativeGP(read(corpora[1][1])).slice(0, 3000);
assert.equal(plant.length, 3000);
const permutation = Array.from({length: 8}, (_, phase) =>
  Array.from({length: 29}, (_, i) => (i * 11 + phase * 7) % 29));
const encoded = [17];
for (let i = 1; i < plant.length; i++) {
  const phase = (i - 1) % 8;
  encoded.push((encoded[i - 1] + permutation[phase][plant[i]]) % 29);
}
const sourcePhase = phaseCollisions([{page: 0, indices: encoded}],
  "delta", false, false);
const plantPhase = phaseCollisions([{page: 0, indices: plant}],
  "native", false, false);
assert.deepEqual([sourcePhase.hits, sourcePhase.pairs],
  [plantPhase.hits, plantPhase.pairs]);

if (require.main === module) {
  console.log(JSON.stringify({
    status: "exact original-input controls, no recovered unknown plaintext",
    literalSourceLP1Examples: calibrations.length,
    fullSolvedLP1WordPairs: referenceWords.length,
    legacyGPWordsExact: legacyExact,
    sourceGPWordsExact: printedWords.length,
    sourceCipherInvariant: source,
    originalFibonacciLag8: originalLag8,
    correctedControlWindows: total,
    allControlMinimumRates: minimum,
    corpora: summary,
    sourceNativePositivePlant: true
  }, null, 2));
}
module.exports = {encodeSourceNativeGP:encodeNativeGP};
