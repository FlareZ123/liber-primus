"use strict";
/**
 * A frozen, source-led p50 border-number order test against original p55.
 *
 * Original p50 table 32x8 has exactly 76 perimeter positions.
 * Original p55 contains exactly 76 rune symbols; solved p57 says
 * "shed our own circumferences." Original p50 numeric values can
 * order the 76 positions. Test the direct rank-permutation inverse
 * with stable tie-breaks against held-out native GP text and shuffles.
 *
 * No key guessed, GP letters fitted or byte/rune value substituted.
 * Node.js 22; run from repository root:
 *   node sims/lp2_p50_border76_value_sort_p55_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const p55 = corpus.pages.find(p => p.page === 55).indices;
const rows = table.byte_rows;

assert.equal(p55.length, 76);
assert.equal(rows.length, 32);
assert(rows.every(row => row.length === 8));
assert.equal(crypto.createHash("sha256").update(
  Buffer.from(rows.flat())).digest("hex"),
"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

function clockwisePositions() {
  const points = [];
  for (let x = 0; x < 8; x++) points.push([0, x]);
  for (let y = 1; y < 32; y++) points.push([y, 7]);
  for (let x = 6; x >= 0; x--) points.push([31, x]);
  for (let y = 30; y >= 1; y--) points.push([y, 0]);
  assert.equal(points.length, 76);
  assert.equal(new Set(points.map(x => x.join(","))).size, 76);
  return points;
}

/**
 * Sort original border bytes ascending; original clockwise ordinal breaks
 * duplicate ties, so all 76 ranks are a bijection without a guessed key.
 * @returns {number[]}
 */
function sortedOrdinalKey() {
  const values = clockwisePositions().map(([y, x]) => rows[y][x]);
  assert.equal(new Set(values).size, 68);
  return values.map((value, ordinal) => ({value, ordinal}))
    .sort((a, b) => a.value - b.value || a.ordinal - b.ordinal)
    .map(x => x.ordinal);
}

/** @param {number[]} input @param {number[]} key */
function reorder(input, key) {
  assert.equal(input.length, key.length);
  return key.map(i => input[i]);
}

/** Source-native GP normalizer; use exact declared 29-symbol transliteration. */
function gpIndices(source) {
  const tokens = corpus.translit.map((text, index) => ({text, index}))
    .sort((a, b) => b.text.length - a.text.length);
  const words = source.toUpperCase()
    .replaceAll("QU", "CW").replaceAll("V", "U")
    .replaceAll("K", "C").replaceAll("Z", "S")
    .match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    const encoded = [];
    for (let pos = 0; pos < word.length;) {
      const found = tokens.find(t => word.startsWith(t.text, pos));
      if (!found) { encoded.length = 0; break; }
      encoded.push(found.index);
      pos += found.text.length;
    }
    out.push(...encoded);
  }
  return out;
}

/**
 * Trigram native GP model, smoothed to support every rune triple.
 * @param {number[]} source
 */
function model(source) {
  const trigram = new Uint32Array(29 ** 3);
  const bigram = new Uint32Array(29 ** 2);
  for (let i = 2; i < Math.min(90000, source.length); i++) {
    const context = 29 * source[i - 2] + source[i - 1];
    trigram[29 * context + source[i]]++;
    bigram[context]++;
  }
  return symbols => {
    assert(symbols.length >= 3);
    let score = 0;
    for (let i = 2; i < symbols.length; i++) {
      const context = 29 * symbols[i - 2] + symbols[i - 1];
      score += Math.log((trigram[29 * context + symbols[i]] + 0.1) /
        (bigram[context] + 2.9));
    }
    return score / (symbols.length - 2);
  };
}

function rng32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function main() {
  const order = sortedOrdinalKey();
  const inverse = Array(76);
  order.forEach((ordinal, rank) => { inverse[ordinal] = rank; });
  assert.deepEqual(order.slice(0, 10), [52,11,59,28,32,30,18,40,61,31]);
  assert.deepEqual([...order].sort((a, b) => a - b),
    Array.from({length: 76}, (_, i) => i));

  const native = gpIndices(shakespeare);
  assert.equal(native.length, 218800);
  const score = model(native);

  // A real original English input planted under this proposed permutation
  // is recovered exactly; its inverse/rival order does not reassemble it.
  const plantedOriginal = native.slice(90000, 90076);
  const enciphered = Array(76);
  order.forEach((location, rank) => { enciphered[location] = plantedOriginal[rank]; });
  assert.deepEqual(reorder(enciphered, order), plantedOriginal);
  assert.notDeepEqual(reorder(enciphered, inverse), plantedOriginal);

  const candidates = {
    original: p55,
    originalByteAscending: reorder(p55, order),
    inverseRanking: reorder(p55, inverse),
    originalByteDescending: reorder(p55, order.slice().reverse()),
    inverseRankingDescending: reorder(p55, inverse.slice().reverse())
  };
  const scores = Object.fromEntries(Object.entries(candidates)
    .map(([name, content]) => [name, score(content)]));

  const next = rng32(0x330155);
  const shuffled = p55.slice();
  const controls = [];
  for (let trial = 0; trial < 15000; trial++) {
    for (let i = 75; i > 0; i--) {
      const j = next() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    controls.push(score(shuffled));
  }
  const nullMean = controls.reduce((s, x) => s + x, 0) / controls.length;
  const nullSd = Math.sqrt(controls.reduce((s, x) =>
    s + (x - nullMean) ** 2, 0) / (controls.length - 1));
  const result = Object.fromEntries(Object.entries(scores).map(([key, value]) =>
    [key, {trigramScore: value, z: (value - nullMean) / nullSd,
      upperTail: (controls.filter(x => x >= value).length + 1) / (controls.length + 1)}]));
  assert(Math.abs(scores.originalByteAscending - (-4.5585914520414486)) < 1e-9);
  assert(Math.abs(scores.inverseRanking - (-4.597653098051217)) < 1e-9);
  assert(Math.abs(nullMean - (-4.4407110788726305)) < 1e-9);
  assert(Math.abs(score(plantedOriginal) - (-2.092370768293811)) < 1e-9);
  console.log(JSON.stringify({
    hypothesis: "Sort 76 original table border byte values to permute p55 runes",
    source: "original p50 32x8 table and p55 76 GP29 runes",
    all76OriginalPositionsPreserved: true,
    equalByteTieBreak: "clockwise source ordinal",
    duplicateByteValues: 8,
    planted76NativeGPExactRecovery: true,
    plantedScore: score(plantedOriginal),
    shuffledNull: {iterations: controls.length, nullMean, nullSd},
    candidates: result,
    decision: "Neither direct source-byte sort nor its inverse reveals GP-native plaintext"
  }, null, 2));
}
if (require.main === module) main();
module.exports = {main, sortedOrdinalKey, reorder, gpIndices, model};
