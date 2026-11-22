"use strict";
/**
 * Original LP2 punctuation/page-boundary 256-interval versus 256-byte table gate.
 * Run: node sims/lp2_grid256_punctuation_interval_allsecret_sft.cjs
 *
 * Source partition: all 175 periods, 17 ampersand marks, eight dollar
 * marks, and 55 physical page changes in unknown pp0–55. The canonical
 * transcription omits the runeless physical p50; reinsert its empty page.
 * It yields 256 intervals, 37 empty. No plaintext is fitted.
 *
 * Model rejected under native GP-language controls: one completely arbitrary
 * stationary 29-symbol bijection per source interval. Any original grid
 * byte can select an interval key, but within-interval symbol equality is
 * invariant under all such keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const manuscript = read("resources/lp2-transcription.txt");
const runeId = new Map(corpus.runes.map((rune, i) => [rune, i]));
assert.equal(corpus.runes.length, 29);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(bytes[0], 203);
assert.equal(bytes.at(-1), 80);
const parts = manuscript.split("%");
assert.equal(parts.length, 57); // 55 rune-bearing unsolved + two solved pages
const physicalPages = [...parts.slice(0, 50), "", ...parts.slice(50, 55)];
assert.equal(physicalPages.length, 56);
assert.equal(corpus.pages[50].indices.length, 0);
/** @param {string} text @returns {number[]} */
function runeIds(text) {
  return [...text].filter(ch => runeId.has(ch)).map(ch => runeId.get(ch));
}
for (let i = 0; i < 56; i++) {
  assert.deepEqual(runeIds(physicalPages[i]), corpus.pages[i].indices,
    "physical page " + i + " transcription diverges from original corpus");
}
const source = physicalPages.join("%");
const separators = [...source].filter(ch => ".&$%".includes(ch));
const separatorCounts = Object.fromEntries(
  [...".&$%"].map(ch => [ch, separators.filter(x => x === ch).length]));
assert.deepEqual(separatorCounts, {".": 175, "&": 17, "$": 8, "%": 55});
const intervals = source.split(/[.&$%]/u).map(runeIds);
assert.equal(intervals.length, 256);
assert.equal(intervals.filter(row => row.length === 0).length, 37);
const lengths = intervals.map(row => row.length);
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
const observed = intervals.flat();
assert.deepEqual(observed, corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));

/**
 * Equality pairs and eligible position pairs within each frozen interval.
 * Invariant under an arbitrary different GP29 permutation per interval.
 * @param {number[][]} groups
 */
function invariant(groups) {
  let pairs = 0, equal = 0;
  for (const row of groups) {
    const n = row.length;
    pairs += n * (n - 1);
    const hist = new Uint32Array(29);
    for (const v of row) hist[v]++;
    for (const c of hist) equal += c * (c - 1);
  }
  return {equal, pairs, ioc: equal / pairs};
}
/** @param {number[]} flat @returns {number[][]} */
function splitByOriginalIntervals(flat) {
  assert.equal(flat.length, observed.length);
  let start = 0;
  return lengths.map(n => {
    const result = flat.slice(start, start + n);
    start += n;
    return result;
  });
}
/** @param {number[]} values */
function globalIoc(values) {
  const hist = new Uint32Array(29);
  for (const x of values) hist[x]++;
  let equal = 0;
  for (const n of hist) equal += n * (n - 1);
  return equal / (values.length * (values.length - 1));
}
/** @param {number} v */
const mod = v => (v % 29 + 29) % 29;
const original = invariant(intervals);
assert(Math.abs(original.ioc - 0.033742684447855706) < 1e-13);
assert(Math.abs(globalIoc(observed) - 0.03447839786450569) < 1e-13);
const byteDecoders = [];
for (const reverse of [false, true]) {
  const keys = reverse ? [...bytes].reverse() : bytes;
  for (const sign of [-1, 1]) {
    const decoded = intervals.flatMap((row, i) =>
      row.map(v => mod(v + sign * keys[i])));
    const inverse = intervals.flatMap((row, i) =>
      row.map((v, j) => mod(decodedForInterval(i, j, keys, sign, row) -
        sign * keys[i])));
    assert.deepEqual(inverse, observed);
    byteDecoders.push({
      reverse, sign, gp29Ioc: globalIoc(decoded),
      first30Gp: decoded.slice(0, 30).map(v => corpus.translit[v]).join("")
    });
  }
}
/** @param {number} i @param {number} j @param {number[]} keys
 *  @param {number} sign @param {number[]} row */
function decodedForInterval(i, j, keys, sign, row) {
  return mod(row[j] + sign * keys[i]);
}
assert.deepEqual(byteDecoders.map(x => Number(x.gp29Ioc.toFixed(9))),
  [0.034456080, 0.034507818, 0.034479399, 0.034464826]);

const tokens = corpus.translit.map((part, i) => ({part, i}))
  .sort((a, b) => b.part.length - a.part.length);
/** @param {string} text @returns {number[]} */
function encodeNative(text) {
  const out = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (let word of words) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const tok = tokens.find(x => word.startsWith(x.part, i));
      assert(tok, "unmapped native word: " + word);
      out.push(tok.i);
      i += tok.part.length;
    }
  }
  return out;
}
const controls = [];
let planted = null;
for (const [name, file] of [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
]) {
  const native = encodeNative(read(file));
  const samples = [];
  for (let i = 0; i + observed.length <= native.length; i += observed.length) {
    const sample = native.slice(i, i + observed.length);
    const measure = invariant(splitByOriginalIntervals(sample));
    samples.push(measure.ioc);
    if (planted === null) planted = sample;
  }
  assert(samples.length > 0);
  assert(samples.every(score => score > original.ioc));
  controls.push({
    name, nativeRunes: native.length, windows: samples.length,
    minimumIoC: Math.min(...samples), maximumIoC: Math.max(...samples)
  });
}
assert.deepEqual(controls.map(x => x.windows), [16, 4, 25]);
assert(Math.abs(controls[0].minimumIoC - 0.058203012568358435) < 1e-12);
assert(Math.abs(controls[1].minimumIoC - 0.0593543125779526) < 1e-12);
assert(Math.abs(controls[2].minimumIoC - 0.06079823467331862) < 1e-12);

// Fully independent secret GP29 bijection for EACH of 256 source slots.
// The native plant must retain within-interval IoC and invert all runes.
let seed = 0x3301256;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const secret = lengths.map(() => {
  const out = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
});
const inverses = secret.map(row => {
  const inv = new Array(29);
  row.forEach((value, i) => {inv[value] = i;});
  assert.equal(new Set(inv).size, 29);
  return inv;
});
const plainGroups = splitByOriginalIntervals(planted);
const ciphertextGroups = plainGroups.map((row, i) =>
  row.map(v => secret[i][v]));
const restored = ciphertextGroups.flatMap((row, i) =>
  row.map(v => inverses[i][v]));
assert.deepEqual(restored, planted);
assert.deepEqual(invariant(plainGroups), invariant(ciphertextGroups));
console.log(JSON.stringify({
  source: "original LP2 physical pp0-55, canonical text and base60 grid",
  punctuationAndPageBreaks: separatorCounts,
  originalRunes: observed.length, tableCells: bytes.length,
  totalIntervals: intervals.length, emptyIntervals: lengths.filter(x => x === 0).length,
  observedWithinInterval: original,
  observedFullIoc: globalIoc(observed), byteDecoders,
  nativeGpControls: controls,
  independentSecretPermutationPlant: {
    encodedAndRecovered: restored.length,
    exactRoundtrip: true, withinIntervalIoc: invariant(ciphertextGroups).ioc
  },
  conclusion: "one stationary secret GP29 bijection per 256 original punctuation/page interval does not explain matched native prose; no unknown plaintext or authentic key"
}, null, 2));
