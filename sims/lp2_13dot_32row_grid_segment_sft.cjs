'use strict';
// Exact 31 thirteen-dot-delimiter / 32-row-grid cipher-consumer gate.
// Run from repository root: node sims/lp2_13dot_32row_grid_segment_sft.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8')).byte_rows;
/** @param {number[]} xs */
function ioc(xs) {
  if (xs.length < 2) return null;
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
/** @param {number[]} xs @param {number} sign */
function transfer(xs, sign) {
  assert.equal(xs.length, 13136);
  const out = [];
  for (let group = 0; group < 32; group++) {
    for (let j = 0; j < boundaries[group + 1] - boundaries[group]; j++) {
      const k = grid[group][j % 8] % 29;
      const x = xs[boundaries[group] + j];
      out.push(((x + sign * k) % 29 + 29) % 29);
    }
  }
  return out;
}
assert.equal(corpus.pages.length, 58);
assert.equal(grid.length, 32);
assert(grid.every(row => row.length === 8 && row.every(x => Number.isInteger(x) && x >= 0 && x < 256)));
const ciphertext = corpus.pages.flatMap(p => p.indices);
assert.equal(ciphertext.length, 13136);
assert.equal(corpus.pages.slice(0, 56).reduce((s, p) => s + p.indices.length, 0), 12956);
const markerEvents = [];
let pageStart = 0;
for (const page of corpus.pages) {
  const marks = ink.pages.find(p => p.page === page.page)?.large_punctuation || [];
  for (const event of marks) {
    if (event[1] === 13) {
      assert(Number.isInteger(event[0]) && event[0] >= 0 && event[0] <= page.indices.length);
      markerEvents.push({ page: page.page, local: event[0], absolute: pageStart + event[0], color: event[2] });
    }
  }
  pageStart += page.indices.length;
}
markerEvents.sort((a, b) => a.absolute - b.absolute);
assert.equal(markerEvents.length, 31);
const boundaries = [0, ...markerEvents.map(e => e.absolute), ciphertext.length];
assert.equal(boundaries.length, 33);
assert(boundaries.every((n, i) => i === 0 || n >= boundaries[i - 1]));
const emptyGroups = [];
for (let i = 0; i < 32; i++) {
  if (boundaries[i] === boundaries[i + 1]) emptyGroups.push(i);
}
assert.deepEqual(emptyGroups, [8, 11]);
assert.equal(markerEvents.filter(e => e.page === 7 && e.local === 194).length, 2);
assert(markerEvents.some(e => e.page === 15 && e.local === 0));
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const planted = ciphertext.map((_, i) => solved[i % solved.length]);
const originalIntervals = boundaries.slice(0, -1).map((from, i) => {
  const chunk = ciphertext.slice(from, boundaries[i + 1]);
  return { group: i, length: chunk.length, ioc: ioc(chunk) };
});
const longOriginalIntervals = originalIntervals.filter(v => v.length >= 250);
assert.equal(longOriginalIntervals.length, 10);
assert(longOriginalIntervals.every(v => v.ioc > 0.03 && v.ioc < 0.04));
// An arbitrary fixed 29-symbol substitution within each interval preserves
// this statistic exactly, regardless of the secret alphabet choice.
const secretAlphabet = Array.from({ length: 29 }, (_, i) => (11 * i + 7) % 29);
for (const interval of longOriginalIntervals) {
  const part = ciphertext.slice(boundaries[interval.group], boundaries[interval.group + 1]);
  assert.equal(ioc(part.map(r => secretAlphabet[r])), interval.ioc);
}
const readings = [];
for (const sign of [-1, 1]) {
  const enc = transfer(planted, -sign);
  const dec = transfer(enc, sign);
  assert.deepEqual(dec, planted);
  const plain = transfer(ciphertext, sign);
  const unknown = plain.slice(0, 12956);
  assert.equal(unknown.length, 12956);
  const back = transfer(plain, -sign);
  assert.deepEqual(back, ciphertext);
  readings.push({
    sign,
    unsolved_ioc: ioc(unknown),
    planted_ioc: ioc(planted.slice(0, 12956)),
    segments_with_at_least_80_runes: boundaries.slice(0, -1).map((a, i) => ({
      id: i, from: a, length: boundaries[i + 1] - a,
      ioc: ioc(plain.slice(a, boundaries[i + 1]))
    })).filter(s => s.length >= 80)
  });
}
assert(Math.abs(readings[0].unsolved_ioc - 0.03447444183317249) < 1e-12);
assert(Math.abs(readings[1].unsolved_ioc - 0.034485463908423115) < 1e-12);

const unknownLengths = boundaries.slice(0, 28).map((start, i) => boundaries[i + 1] - start);
assert.equal(unknownLengths.reduce((sum, n) => sum + n, 0), 12956);
assert.equal(boundaries[28], 12956);
assert(grid.every(row => row.length === 8 && new Set(row).size === 8),
  "each original 8-byte row must define an unambiguous rank order");

// A solver could notice 31 original 13-dot marks -> 32 intervals and a
// 32x8 base60 byte table. A conventional 8-column transposition is a
// source-motivated consumer: rank each row's eight bytes, then use that
// order for the corresponding interval. Test only the two standard
// fill/read orientations and ascending/descending ranks; no fitted offsets.
const rowOrders = grid.map(row =>
  row.map((_, i) => i).sort((a, b) => row[a] - row[b]));
function encryptRowFillColumnRead(plain, order) {
  const cols = Array.from({ length: 8 }, () => []);
  for (let i = 0; i < plain.length; i++) cols[i % 8].push(plain[i]);
  return order.flatMap(col => cols[col]);
}
function decryptRowFillColumnRead(cipher, order) {
  const q = Math.floor(cipher.length / 8), r = cipher.length % 8;
  const lengths = Array.from({ length: 8 }, (_, j) => q + (j < r ? 1 : 0));
  const cols = Array(8);
  let pos = 0;
  for (const col of order) {
    cols[col] = cipher.slice(pos, pos + lengths[col]);
    pos += lengths[col];
  }
  const out = [];
  for (let row = 0; row < q + 1; row++)
    for (let col = 0; col < 8; col++)
      if (row < cols[col].length) out.push(cols[col][row]);
  return out;
}
function encryptColumnFillRowRead(plain, order) {
  const q = Math.floor(plain.length / 8), r = plain.length % 8;
  const lengths = Array.from({ length: 8 }, (_, j) => q + (j < r ? 1 : 0));
  const matrix = Array.from({ length: q + 1 }, () => Array(8));
  let pos = 0;
  for (let col = 0; col < 8; col++)
    for (let row = 0; row < lengths[col]; row++)
      matrix[row][col] = plain[pos++];
  const out = [];
  for (let row = 0; row < q + 1; row++)
    for (const col of order)
      if (row < lengths[col]) out.push(matrix[row][col]);
  return out;
}
function decryptColumnFillRowRead(cipher, order) {
  const q = Math.floor(cipher.length / 8), r = cipher.length % 8;
  const lengths = Array.from({ length: 8 }, (_, j) => q + (j < r ? 1 : 0));
  const matrix = Array.from({ length: q + 1 }, () => Array(8));
  let pos = 0;
  for (let row = 0; row < q + 1; row++)
    for (const col of order)
      if (row < lengths[col]) matrix[row][col] = cipher[pos++];
  const out = [];
  for (let col = 0; col < 8; col++)
    for (let row = 0; row < lengths[col]; row++)
      out.push(matrix[row][col]);
  return out;
}

// Calibrate the language score with the already source-attested GP spelling:
// ING and IO take precedence over the canonical labels NG and IA.
const gpTokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function encodeNativeGP(original) {
  const clean = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { out.push(21); i += 3; }
      else if (word.startsWith("IO", i)) { out.push(27); i += 2; }
      else {
        const token = gpTokens.find(t => word.startsWith(t.s, i));
        assert(token, "unmapped native GP spelling at " + word.slice(i));
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}
const controlText = fs.readFileSync("resources/control/shakespeare_first300k.txt", "utf8");
assert.equal(controlText.length, 300000);
const train = encodeNativeGP(controlText.slice(0, 150000));
const held = encodeNativeGP(controlText.slice(150000));
const gramCounts = new Map();
const alphabetSize = 29, gramOrder = 4;
let gramTotal = 0;
for (let i = 0; i + gramOrder <= train.length; i++) {
  const key = (((train[i] * 29 + train[i + 1]) * 29 + train[i + 2]) * 29 + train[i + 3]);
  gramCounts.set(key, (gramCounts.get(key) || 0) + 1);
  gramTotal++;
}
const denominator = gramTotal + 0.1 * Math.pow(alphabetSize, gramOrder);
const unseenLogProbability = Math.log(0.1 / denominator);
const gramLogProbability = new Map(
  [...gramCounts].map(([key, count]) => [key, Math.log((count + 0.1) / denominator)])
);
function scoreGp4(sequence, segmentLengths) {
  let score = 0, offset = 0;
  for (const length of segmentLengths) {
    for (let j = 0; j + 4 <= length; j++) {
      const i = offset + j;
      const key = (((sequence[i] * 29 + sequence[i + 1]) * 29 + sequence[i + 2]) * 29 + sequence[i + 3]);
      score += gramLogProbability.get(key) ?? unseenLogProbability;
    }
    offset += length;
  }
  return score / sequence.length;
}
const rawColumnarScore = scoreGp4(ciphertext.slice(0, 12956), unknownLengths);
const columnarModes = [
  {
    name: "row-fill/column-read",
    encrypt: encryptRowFillColumnRead,
    decrypt: decryptRowFillColumnRead
  },
  {
    name: "column-fill/row-read",
    encrypt: encryptColumnFillRowRead,
    decrypt: decryptColumnFillRowRead
  }
];
const p57PlantSource = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57PlantSource.length, 95);
const columnarPlant = Array.from({ length: 12956 }, (_, i) => p57PlantSource[i % p57PlantSource.length]);
const columnarVariants = [];
for (const mode of columnarModes) {
  for (const direction of ["ascending", "descending"]) {
    const decoded = [];
    let plantOffset = 0;
    for (let segment = 0; segment < 28; segment++) {
      const order = direction === "ascending" ? rowOrders[segment] : [...rowOrders[segment]].reverse();
      const from = boundaries[segment], to = boundaries[segment + 1];
      const originalChunk = ciphertext.slice(from, to);
      const recovered = mode.decrypt(originalChunk, order);
      assert.equal(recovered.length, originalChunk.length);
      assert.deepEqual(mode.encrypt(recovered, order), originalChunk,
        "original source forward re-encryption, segment " + (segment + 1));
      decoded.push(...recovered);
      const plantChunk = columnarPlant.slice(plantOffset, plantOffset + originalChunk.length);
      assert.deepEqual(mode.decrypt(mode.encrypt(plantChunk, order), order), plantChunk,
        "planted native-GP inverse, segment " + (segment + 1));
      plantOffset += originalChunk.length;
    }
    assert.equal(decoded.length, 12956);
    columnarVariants.push({
      mode: mode.name,
      direction,
      gp4_log_probability_per_rune: scoreGp4(decoded, unknownLengths),
      prefix: decoded.slice(0, 96).map(i => corpus.translit[i]).join("")
    });
  }
}
assert(columnarVariants.every(v => v.gp4_log_probability_per_rune < rawColumnarScore),
  "none of the four source-fixed transpositions should improve the raw score");
const controlWindowScores = [];
const controlStep = Math.floor((held.length - 12956) / 499);
for (let j = 0; j < 500; j++) {
  const start = j * controlStep;
  controlWindowScores.push(scoreGp4(held.slice(start, start + 12956), unknownLengths));
}
controlWindowScores.sort((a, b) => a - b);
const controlSummary = {
  windows: controlWindowScores.length,
  min: controlWindowScores[0],
  p01: controlWindowScores[4],
  median: controlWindowScores[249],
  p99: controlWindowScores[494],
  max: controlWindowScores[499]
};
const bestColumnarScore = Math.max(...columnarVariants.map(v => v.gp4_log_probability_per_rune));
assert(controlSummary.min > bestColumnarScore + 3,
  "native held-out controls must clearly outscore the candidate transforms");
const columnarTransposition = {
  key_rule: "for each original 8-byte table row, sort its eight byte values; test ascending and descending rank order",
  layouts: ["row-fill/column-read", "column-fill/row-read"],
  applied_segments: 28,
  applied_runes: 12956,
  raw_gp4_log_probability_per_rune: rawColumnarScore,
  variants: columnarVariants,
  control_model: "source-calibrated GP29 4-gram; first 150,000 Shakespeare characters train; last 150,000 held out",
  training_runes: train.length,
  heldout_runes: held.length,
  heldout_native_windows: controlSummary,
  best_candidate_margin_below_worst_native_window: controlSummary.min - bestColumnarScore,
  decision: "all four source-fixed variants score slightly worse than raw ciphertext and over 3 nats/rune below every sampled held-out native window; no plaintext"
};

console.log(JSON.stringify({
  original_runes: ciphertext.length,
  original_13dot_marks: markerEvents.length,
  segments: 32,
  empty_groups: emptyGroups,
  empty_marker_pairs: [
    markerEvents.filter(e => e.page === 7 && e.local === 194),
    markerEvents.filter(e => (e.page === 14 && e.local === 137) || (e.page === 15 && e.local === 0))
  ],
  segment_lengths: boundaries.slice(0, -1).map((n, i) => boundaries[i + 1] - n),
  row_count: grid.length, row_width: 8,
  original_long_interval_ioc: longOriginalIntervals,
  readings,
  columnar_transposition: columnarTransposition
}, null, 2));
