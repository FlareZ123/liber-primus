/*
 * SUPERSEDED HISTORICAL CANDIDATE.
 *
 * This script tests the earlier one-column-left mask a1,b3,c5,d7 and the
 * phase-zero shear. The primary Liber AL III:47 scan instead places the
 * diagonal at b1,c3,d5,e7, with the circled plus/cross separately at d7.
 * Use lp2_liber_al_iii47_p49_source_geometry_sft.cjs for the corrected mask
 * and b1-anchored shear. Results from this file are not tests of that geometry.
 *
 * Retained to preserve the earlier experiment and its reproducibility.
 */
#!/usr/bin/env node
"use strict";

// Candidate-mapping test of Liber AL III:47 page-16 geometry against the LP2 p49
// 10x8 numeric block and p55's 76-rune page. The scan does not uniquely fix the
// four-cell rasterization or shear phase; this preserves one prior candidate only.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const grid = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json", "utf8"));

const tablePage = grid.pages.find((p) => p.page === 49);
const tokens = tablePage.tokens;
const p55 = corpus.pages[55].indices;
const translit = corpus.translit;

assert.equal(tablePage.rows, 10);
assert.equal(tablePage.cols, 8);
assert.equal(tokens.length, 80);
assert.equal(p55.length, 76);

const BASE60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const BASE59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";

function mod(n, m) {
  return ((n % m) + m) % m;
}

function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.notEqual(hi, -1, "unknown high digit: " + token);
  assert.notEqual(lo, -1, "unknown low digit: " + token);
  return hi * alphabet.length + lo;
}

function render(values) {
  return values.map((v) => translit[v]).join(" ");
}

const lineCoords = [[0, 0], [2, 1], [4, 2], [6, 3]];
const lineIndices = [0, 17, 34, 51]; // candidate mask a1, b3, c5, d7; not source-fixed
const circleCoord = [6, 3]; // d7 circled-cross; candidate readout anchor, not proven line endpoint
const lineTokens = lineIndices.map((i) => tokens[i]);

assert.deepEqual(lineTokens, ["3N", "3M", "3H", "0x"]);

function buildShearedKey(tableValues, direction) {
  // direction=-1 is the candidate forward shear r'=(r-2c) mod 10;
  // direction=+1 is its inverse. The candidate four-cell mask is flattened.
  const sheared = Array(80);
  for (let r = 0; r < 10; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const targetRow = mod(r + direction * 2 * c, 10);
      sheared[targetRow * 8 + c] = tableValues[r * 8 + c];
    }
  }

  const lineTargets = lineCoords.map(([r, c]) => mod(r + direction * 2 * c, 10) * 8 + c);
  const circleTarget = mod(circleCoord[0] + direction * 2 * circleCoord[1], 10) * 8 + circleCoord[1];
  const keep = Array.from({ length: 80 }, (_, i) => i).filter((i) => !lineTargets.includes(i));

  // Read immediately after the circled-cross endpoint, wrapping once.
  const start = keep.findIndex((i) => i > circleTarget);
  assert.notEqual(start, -1, "no post-circle cell in sheared grid");
  const order = keep.slice(start).concat(keep.slice(0, start));
  const keyBytes = order.map((i) => sheared[i]);

  assert.equal(keyBytes.length, 76);
  assert.equal(lineTargets.length, 4);
  return { sheared, lineTargets, circleTarget, order, keyBytes };
}

function shearP55(direction) {
  // Place the 76 p55 runes into the 10x8 candidate grid, leaving the four
  // candidate mask cells empty, then apply the same candidate shear.
  const holes = new Set(lineIndices);
  const source = Array(80).fill(null);
  let j = 0;
  for (let i = 0; i < 80; i += 1) {
    if (!holes.has(i)) source[i] = p55[j++];
  }
  assert.equal(j, 76);

  const target = Array(80).fill(null);
  for (let r = 0; r < 10; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const targetRow = mod(r + direction * 2 * c, 10);
      target[targetRow * 8 + c] = source[r * 8 + c];
    }
  }

  const lineTargets = lineCoords.map(([r, c]) => mod(r + direction * 2 * c, 10) * 8 + c);
  const circleTarget = mod(circleCoord[0] + direction * 2 * circleCoord[1], 10) * 8 + circleCoord[1];
  const keep = Array.from({ length: 80 }, (_, i) => i).filter((i) => !lineTargets.includes(i));
  const start = keep.findIndex((i) => i > circleTarget);
  const order = keep.slice(start).concat(keep.slice(0, start));
  const output = order.map((i) => target[i]);

  assert.equal(output.length, 76);
  assert.ok(output.every((v) => v !== null));
  return output;
}

const base60 = tokens.map((t) => decodeToken(t, BASE60));
const base59 = tokens.map((t) => decodeToken(t, BASE59));
const lineBase60 = lineIndices.map((i) => base60[i]);
const lineBase59 = lineIndices.map((i) => base59[i]);

const outputs = [];
for (const [radix, tableValues] of [["base60", base60], ["base59", base59]]) {
  for (const direction of [-1, 1]) {
    const built = buildShearedKey(tableValues, direction);
    const key = built.keyBytes.map((v) => mod(v, 29));

    const minus = p55.map((v, i) => mod(v - key[i], 29));
    const plus = p55.map((v, i) => mod(v + key[i], 29));
    const xorMod29 = p55.map((v, i) => mod(v ^ key[i], 29));
    const rawXor = p55.map((v, i) => v ^ built.keyBytes[i]);
    const printable = rawXor.filter((v) => v >= 32 && v <= 126).length;

    const rank = built.keyBytes
      .map((v, i) => i)
      .sort((a, b) => built.keyBytes[a] - built.keyBytes[b] || a - b);
    const rankDirect = rank.map((i) => p55[i]);
    const rankInverse = Array(76);
    for (let i = 0; i < 76; i += 1) rankInverse[rank[i]] = p55[i];

    // Positive control: the pad inverse must recover an intentionally
    // encrypted 76-symbol GP29 message exactly.
    const synthetic = Array.from({ length: 76 }, (_, i) => i % 29);
    const syntheticCipher = synthetic.map((v, i) => mod(v + key[i], 29));
    const recovered = syntheticCipher.map((v, i) => mod(v - key[i], 29));
    assert.deepEqual(recovered, synthetic);

    outputs.push({
      radix,
      direction,
      lineTargets: built.lineTargets,
      circleTarget: built.circleTarget,
      keyLength: built.keyBytes.length,
      keyText: render(key),
      directPadMinus: render(minus),
      directPadPlus: render(plus),
      xorMod29: render(xorMod29),
      rawXorPrintableCount: printable,
      rawXorPrintableRatio: printable / 76,
      rawXorAscii: rawXor.map((v) => v >= 32 && v <= 126 ? String.fromCharCode(v) : ".").join(""),
      rankDirect: render(rankDirect),
      rankInverse: render(rankInverse),
      p55GridShear: render(shearP55(direction)),
      positiveControl: true
    });
  }
}

const summary = {
  geometryStatus: "candidate rasterization; the source scan does not uniquely fix the four-cell mask or shear phase",
  source: "OTO Liber AL holograph, page 16 / Chapter III verse 47; page image 60.jpg",
  sourceUrl: "https://lib.oto-usa.org/libri/images/liber0031/60.jpg",
  inheritedGeometry: {
    columns: "a-h",
    rows: "1-10",
    lineSlope: 2,
    circle: "d7",
    candidateLineCells: ["a1", "b3", "c5", "d7"],
    lineIndices,
    circleIndex: 51
  },
  lp2Receiver: {
    p49TableRows: tablePage.rows,
    p49TableCols: tablePage.cols,
    p49TableCellCount: tokens.length,
    p49LineTokens: lineTokens,
    p55RuneCount: p55.length,
    complementAfterRemovingLine: 76,
    p50PerimeterCount: 76
  },
  radixValues: {
    base60Line: lineBase60,
    base60LineMod29: lineBase60.map((v) => mod(v, 29)),
    base60Circle: base60[51],
    base59Line: lineBase59,
    base59LineMod29: lineBase59.map((v) => mod(v, 29)),
    base59Circle: base59[51]
  },
  outputs
};

console.log(JSON.stringify(summary, null, 2));
