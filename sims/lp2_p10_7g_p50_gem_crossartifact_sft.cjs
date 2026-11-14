"use strict";

/**
 * Original LP2 p10 7-G numeral -> p49–51 numerical-table GEM cycle,
 * with independent 2016 JPEG prime-dimension start and alternative radix.
 * Exploratory cross-artifact navigation; NOT a verified cipher or plaintext.
 *
 * Node.js 22, no packages, no writes. Invoke from repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name));
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalTranscript = read("resources/liber-primus/lp2-transcription.txt").toString("utf8");
const historicalJpeg = read("resources/historical/cicada2016-4gq25.jpg");
const parts = originalTranscript.split(/^%$/m);
const runeSet = new Set(corpus.runes);
const moves = [
  [1, -1], [1, 0], [1, 1],
  [0, -1], [0, 0], [0, 1],
  [-1, -1], [-1, 0], [-1, 1]
];

/**
 * Decode a two-digit original printed token under the declared radix.
 * @param {string} token
 * @param {string} alphabet
 * @returns {number}
 */
function decode(token, alphabet) {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  return alphabet.length * a + b;
}

/**
 * Deterministic 32x8 graph and GP29 glyph output on each visited cell.
 * @param {number[]} bytes
 * @returns {{next: number[], walk: (oneBased: number) => object}}
 */
function graph(bytes) {
  assert.equal(bytes.length, 256);
  const next = bytes.map((value, i) => {
    const quotient = Math.floor(value / 29);
    assert.ok(quotient >= 0 && quotient < moves.length);
    const [dr, dc] = moves[quotient];
    const r = Math.floor(i / 8) + dr;
    const c = i % 8 + dc;
    return r >= 0 && r < 32 && c >= 0 && c < 8 ? 8 * r + c : -1;
  });

  /** @param {number} oneBased */
  function walk(oneBased) {
    assert.ok(oneBased >= 1 && oneBased <= 256);
    const seen = new Map();
    const path = [];
    let i = oneBased - 1;
    while (i !== -1 && !seen.has(i)) {
      seen.set(i, path.length);
      path.push({
        cell: i + 1,
        token: table.rows[Math.floor(i / 8)][i % 8],
        byte: bytes[i],
        quotient: Math.floor(bytes[i] / 29),
        rune: corpus.translit[bytes[i] % 29]
      });
      i = next[i];
    }
    return {
      path,
      glyphs: path.map(entry => entry.rune).join(""),
      cycleStart: i < 0 ? null : seen.get(i),
      cycle: i < 0 ? [] : path.slice(seen.get(i)),
      terminatesOutsideGrid: i === -1
    };
  }
  return {next, walk};
}

/**
 * Original JPEG dimensions from the first baseline/progressive SOF marker.
 * @param {Buffer} jpeg
 * @returns {{width: number, height: number}}
 */
function dimensions(jpeg) {
  assert.equal(jpeg.readUInt16BE(0), 0xffd8);
  for (let i = 2; i + 8 < jpeg.length; i++) {
    if (jpeg[i] === 0xff && [0xc0, 0xc1, 0xc2].includes(jpeg[i + 1])) {
      return {height: jpeg.readUInt16BE(i + 5), width: jpeg.readUInt16BE(i + 7)};
    }
  }
  throw new Error("Original JPEG SOF marker not found");
}

/** @param {number} n */
function primeRank(n) {
  let count = 0;
  for (let candidate = 2; candidate <= n; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) {prime = false; break;}
    }
    if (prime) count++;
  }
  return count;
}

assert.equal(parts.length, 57);
assert.equal(table.rows.length, 32);
assert.deepEqual(table.page_row_counts, [10, 13, 9]);
assert.ok(table.rows.every(row => row.length === 8));
const radix60 = table.alphabet;
assert.equal(radix60.length, 60);
const tokens = table.rows.flat();
const sourceBytes = tokens.map(token => decode(token, radix60));
assert.deepEqual(sourceBytes, table.byte_rows.flat());
const original = graph(sourceBytes);

const numerals = [];
for (let part = 0; part < parts.length; part++) {
  const physicalPage = part <= 49 ? part : part + 1;
  if (physicalPage > 55) break;
  for (const match of parts[part].matchAll(/[0-9]/g)) {
    const suffix = /^-([\u16A0-\u16FF]+)/u.exec(parts[part].slice(match.index + 1));
    assert.ok(suffix, "Printed decimal followed by GP-runic word");
    const firstRune = [...suffix[1]][0];
    const index = corpus.runes.indexOf(firstRune);
    assert.ok(index >= 0);
    const ordinal = Number(match[0]);
    const address = ordinal * corpus.prime[index];
    numerals.push({
      page: physicalPage,
      decimal: ordinal,
      runeOffset: [...parts[part].slice(0, match.index)].filter(c => runeSet.has(c)).length,
      firstRune: corpus.translit[index],
      GPprime: corpus.prime[index],
      address,
      cycle: address <= 256 ? original.walk(address).cycle.map(v => v.rune).join("") : null
    });
  }
}
assert.deepEqual(numerals.map(m => [m.page, m.decimal]),
  [[10, 7], [36, 1], [37, 2], [37, 3], [37, 4], [38, 5]]);
assert.deepEqual(numerals.map(m => m.address),
  [119, 73, 58, 267, 316, 115]);
assert.deepEqual([numerals[0].runeOffset, numerals[0].firstRune, numerals[0].GPprime],
  [169, "G", 17]);

const markerPath = original.walk(numerals[0].address);
assert.deepEqual(markerPath.path.map(v => v.cell), [119, 127, 128]);
assert.deepEqual(markerPath.path.map(v => v.token), ["0Z", "2h", "3D"]);
assert.deepEqual(markerPath.path.map(v => v.byte), [35, 163, 193]);
assert.equal(markerPath.glyphs, "GEM");
assert.equal(markerPath.cycleStart, 0);

// Direct source-native continuation: GP-prime sum of the recovered whole GEM
// cycle supplies one next table address, without a fitted word or modulus.
// The fixed graph returns XXR, not an independent message or useful next key.
const gemPrimeSum = markerPath.path.reduce((sum, entry) =>
  sum + corpus.prime[sourceBytes[entry.cell - 1] % 29], 0);
assert.equal(gemPrimeSum, 155);
const nextWordPath = original.walk(gemPrimeSum);
assert.deepEqual(nextWordPath.path.map(v => v.cell), [155, 162, 154]);
assert.equal(nextWordPath.glyphs, "XXR");
assert.deepEqual(nextWordPath.cycle.map(v => v.rune), ["X", "R"]);

// No later arbitrary 3-cycle selection: this is the sole 3-cycle
// of the directed graph on all 256 exact original printed source cells.
const threeCycles = [];
for (let i = 0; i < 256; i++) {
  const j = original.next[i];
  if (j < 0 || i === j) continue;
  const k = original.next[j];
  if (k < 0 || k === i || k === j || original.next[k] !== i) continue;
  if (i < j && i < k) threeCycles.push([i + 1, j + 1, k + 1]);
}
assert.deepEqual(threeCycles, [[119, 127, 128]]);

// Independently archived contemporaneous 2016 image has prime pixel dimensions;
// its prime ORDINALS select a start that merges into p10-selected path.
const image = dimensions(historicalJpeg);
assert.deepEqual(image, {width: 563, height: 569});
const ranks = {width: primeRank(image.width), height: primeRank(image.height)};
assert.deepEqual(ranks, {width: 103, height: 104});
const widthPath = original.walk(ranks.width);
const heightPath = original.walk(ranks.height);
assert.deepEqual(widthPath.path.map(v => v.cell), [103, 111, 119, 127, 128]);
assert.equal(widthPath.glyphs, "OOGEM");
assert.deepEqual(heightPath.path.map(v => v.cell), [104, 96]);
assert.equal(heightPath.glyphs, "OG");

// The p50 physical row/column identity is unique among the three-page table.
// This is a conditional coordinate reading; the grid has no printed indices.
const rowCounts = table.page_row_counts;
let global = 0;
const rowColumnCoincidences = [];
for (let pageIndex = 0; pageIndex < rowCounts.length; pageIndex++) {
  for (let row = 1; row <= rowCounts[pageIndex]; row++) {
    for (let col = 1; col <= 8; col++) {
      if (sourceBytes[global] === row * col) {
        rowColumnCoincidences.push({
          page: table.lp2_pages[pageIndex],
          row, col, cell: global + 1, value: sourceBytes[global]
        });
      }
      global++;
    }
  }
}
assert.equal(global, 256);
assert.deepEqual(rowColumnCoincidences,
  [{page: 50, row: 5, col: 7, cell: 119, value: 35}]);

// The alternative historical transcription idea "base59 without lowercase f"
// retains the graph's path but changes its purported cleartext from GEM to GST.
const alphabet59 = radix60.replace("f", "");
assert.equal(alphabet59.length, 59);
const alt = graph(tokens.map(token => decode(token, alphabet59)));
const altPath = alt.walk(119);
assert.deepEqual(altPath.path.map(v => v.cell), [119, 127, 128]);
assert.equal(altPath.glyphs, "GST");

const controls = numerals.slice(1).map(n => ({
  page: n.page, decimal: n.decimal, address: n.address,
  walk: n.address <= 256 ? original.walk(n.address).glyphs : null,
  cycle: n.cycle
}));
assert.ok(controls.every(item => item.cycle !== "GEM"));
console.log(JSON.stringify({
  classification: "source-exact cross-artifact navigation; authorial selection unproven",
  originalPrintedMarker: numerals[0],
  independentContemporaneousImage: {dimensions: image, primeOrdinalStarts: ranks},
  selectedCycle: markerPath,
  directGpPrimeWordContinuation: {sourceWord: "GEM", primeSum: gemPrimeSum, path: nextWordPath},
  widthSelectedPath: widthPath,
  heightSelectedPath: heightPath,
  uniqueThreeCycle: threeCycles,
  originalNumberedPageControls: controls,
  uniqueLocalRowColumnEquality: rowColumnCoincidences,
  radix59Path: altPath,
  status: "GEM is an exact graph readout of original numeric cells, not authenticated LP2 plaintext or a cipher key"
}, null, 2));
