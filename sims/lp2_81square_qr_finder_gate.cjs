"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const WIDTH = 81;
const SEED = 0x9e3779b9;
const REPLICATES = 2000;

/** Read the authentic first 81² unsolved GP29 glyphs as numeric indices. */
function source() {
  const file = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
  const corpus = JSON.parse(fs.readFileSync(file, "utf8"));
  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices && p.indices.length);
  assert.equal(pages.length, 55);
  const stream = pages.flatMap(p => p.indices);
  assert.equal(stream.length, 12956);
  return stream.slice(0, WIDTH * WIDTH);
}

/**
 * Coordinates that must be a known QR finder or its one-module separator.
 * Three 7x7 finder patterns are at the upper-left, upper-right and lower-left.
 * The white one-module separator inside the image is included; outside-image
 * separator positions are clipped.
 * @returns {Array<[number,number,number]>} row, column, required bit
 */
function finderCells() {
  const marked = new Map();
  const finder = (row, col) => {
    for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
      const r = row + dr, c = col + dc;
      if (r < 0 || r >= WIDTH || c < 0 || c >= WIDTH) continue;
      const inside = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
      const black = inside && (
        dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
        (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
      const pos = r * WIDTH + c;
      if (marked.has(pos)) assert.equal(marked.get(pos), Number(black));
      marked.set(pos, Number(black));
    }
  };
  finder(0, 0);
  finder(0, WIDTH - 7);
  finder(WIDTH - 7, 0);
  assert.equal(marked.size, 192);
  return [...marked].map(([pos, bit]) => [Math.floor(pos / WIDTH), pos % WIDTH, bit]);
}

/**
 * Enumerate four explicit reading orders x eight square dihedral transforms.
 * Repeated equivalent orientations are permitted; the reported min is exact
 * over the declared finite family.
 */
function routes(pattern) {
  const all = [];
  for (const route of ["row", "serprow", "col", "serpcol"]) {
    for (let orient = 0; orient < 8; orient++) {
      const spots = pattern.map(([row, col, bit]) => {
        let r = (orient & 1) ? WIDTH - 1 - row : row;
        let c = (orient & 2) ? WIDTH - 1 - col : col;
        if (orient & 4) [r, c] = [c, r];
        let position;
        if (route === "row") position = r * WIDTH + c;
        else if (route === "serprow") position = r * WIDTH + (r & 1 ? WIDTH - 1 - c : c);
        else if (route === "col") position = c * WIDTH + r;
        else position = c * WIDTH + (c & 1 ? WIDTH - 1 - r : r);
        return [position, bit];
      });
      all.push({route, orient, spots});
    }
  }
  return all;
}

/**
 * Exact best feasible fit over all 2^29 fixed glyph-to-bit assignments.
 * Each original glyph's contribution is independent: choose its more common
 * mandatory bit and count the cells requiring the opposite value.
 */
function mismatch(stream, route) {
  const counts = Array.from({length: 29}, () => [0, 0]);
  for (const [position, bit] of route.spots) counts[stream[position]][bit]++;
  return counts.reduce((sum, [white, black]) => sum + Math.min(white, black), 0);
}


/**
 * Binary QR display model with completely unknown glyph classes and arbitrary
 * independent XOR pads for every displayed row and column:
 *
 *   glyphBit[originalGlyph] ^ rowBit[r] ^ columnBit[c] = requiredFinderBit.
 *
 * There are 29+81+81 independent F2 variables. Exact elimination decides
 * feasibility and supplies a checkable XOR-parity contradiction witness.
 * @param {number[]} stream
 * @param {{spots:Array<[number,number]>}} route
 * @param {Array<[number,number,number]>} pattern
 */
function linearFeasibility(stream, route, pattern) {
  const variables = 29 + 2 * WIDTH;
  const coefficientBasis = Array(variables).fill(0n);
  const rhsBasis = Array(variables).fill(0);
  const witnessBasis = Array(variables).fill(0n);
  let rank = 0;
  const contradictions = [];
  for (let i = 0; i < pattern.length; i++) {
    const [r, c, required] = pattern[i];
    const [position] = route.spots[i];
    const glyph = stream[position];
    let coefficients = (1n << BigInt(glyph)) ^
      (1n << BigInt(29 + r)) ^ (1n << BigInt(29 + WIDTH + c));
    let rhs = required;
    let dependency = 1n << BigInt(i);
    for (let bit = variables - 1; bit >= 0; bit--) {
      if (!((coefficients >> BigInt(bit)) & 1n)) continue;
      if (coefficientBasis[bit]) {
        coefficients ^= coefficientBasis[bit];
        rhs ^= rhsBasis[bit];
        dependency ^= witnessBasis[bit];
      } else {
        coefficientBasis[bit] = coefficients;
        rhsBasis[bit] = rhs;
        witnessBasis[bit] = dependency;
        rank++;
        break;
      }
    }
    if (coefficients === 0n && rhs === 1) contradictions.push(dependency);
  }
  const cardinality = mask => mask.toString(2).replace(/0/g, "").length;
  const witness = contradictions.sort((a, b) => cardinality(a) - cardinality(b))[0];
  const witnessCells = [];
  if (witness !== undefined) {
    for (let i = 0; i < pattern.length; i++) {
      if (!((witness >> BigInt(i)) & 1n)) continue;
      const [row, column, required] = pattern[i];
      witnessCells.push({row, column, required, glyph: stream[route.spots[i][0]]});
    }
    assert.equal(witnessCells.reduce((x, cell) => x ^ cell.required, 0), 1);
    for (const selector of [
      cell => cell.glyph,
      cell => cell.row,
      cell => cell.column
    ]) {
      const occurrences = new Map();
      for (const cell of witnessCells) {
        const key = selector(cell);
        occurrences.set(key, (occurrences.get(key) || 0) + 1);
      }
      for (const multiplicity of occurrences.values())
        assert.equal(multiplicity % 2, 0, "Invalid XOR witness: unmatched variable");
    }
  }
  return {
    rank, consistent: contradictions.length === 0,
    contradictoryRows: contradictions.length, witnessCells
  };
}

/** Deterministic xorshift32, used only for null shuffles and a planted QR. */
function generator(initial = SEED) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function run() {
  const stream = source();
  const transforms = routes(finderCells());
  const scores = transforms.map(route => ({
    route: route.route, orient: route.orient, errors: mismatch(stream, route)
  })).sort((a, b) => a.errors - b.errors);
  assert.equal(scores[0].errors, 58);
  const random = generator();
  const nulls = [];
  for (let run = 0; run < REPLICATES; run++) {
    const shuffled = stream.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let minimum = Infinity;
    for (const route of transforms) minimum = Math.min(minimum, mismatch(shuffled, route));
    nulls.push(minimum);
  }
  const planted = stream.slice();
  for (const [position, bit] of transforms[0].spots) {
    planted[position] = bit ? 0 : 14; // Two disjoint glyph classes encode the required bits.
  }
  assert.equal(mismatch(planted, transforms[0]), 0);

  const binaryTableau = transforms.map(route =>
    linearFeasibility(stream, route, finderCells()));
  assert.ok(binaryTableau.every(entry => !entry.consistent));
  assert.ok(binaryTableau.every(entry => entry.rank === 59));
  const transparentPlant = stream.slice();
  const fixedPattern = finderCells();
  for (let i = 0; i < fixedPattern.length; i++) {
    const [row, column, bit] = fixedPattern[i];
    const rowPad = (3 * row + 1) & 1;
    const columnPad = (7 * column + 1) & 1;
    transparentPlant[transforms[0].spots[i][0]] =
      (bit ^ rowPad ^ columnPad) ? 14 : 0;
  }
  const plantedRowColumn = linearFeasibility(
    transparentPlant, transforms[0], fixedPattern);
  assert.equal(plantedRowColumn.consistent, true);
  const firstWitness = binaryTableau[0].witnessCells;
  assert.deepEqual(firstWitness, [
    {row:0,column:0,required:1,glyph:15},
    {row:0,column:3,required:1,glyph:3},
    {row:1,column:0,required:1,glyph:25},
    {row:1,column:3,required:0,glyph:25},
    {row:2,column:0,required:1,glyph:4},
    {row:2,column:1,required:0,glyph:3},
    {row:3,column:0,required:1,glyph:4},
    {row:3,column:1,required:0,glyph:15}
  ]);

  const exceed = nulls.filter(score => score <= scores[0].errors).length;
  const summary = {
    source: "original LP2 unsolved GP29 stream, first 6561 glyphs",
    square: "81x81",
    requiredFinderSeparatorCells: 192,
    testedRouteOrientations: transforms.length,
    minimumUnavoidableBitErrors: scores[0].errors,
    bestLayouts: scores.filter(s => s.errors === scores[0].errors),
    fixedGlyphBinaryPlantErrors: mismatch(planted, transforms[0]),
    rowColumnMaskedRank: 59,
    feasibleRowColumnMaskedLayouts: binaryTableau.filter(entry => entry.consistent).length,
    minimumRowColumnParityWitnessCells: Math.min(
      ...binaryTableau.map(entry => entry.witnessCells.length)),
    noMaskRowMajorParityCertificate: firstWitness,
    rowColumnMaskedSyntheticPositiveConsistent: plantedRowColumn.consistent,
    nullShuffles: REPLICATES,
    nullSeed: SEED,
    nullMin: Math.min(...nulls),
    nullMedian: [...nulls].sort((a, b) => a - b)[1000],
    nullMean: nulls.reduce((s, a) => s + a, 0) / nulls.length,
    nullAtMostOriginal: exceed,
    nullLowerTailAddOne: (exceed + 1) / (REPLICATES + 1)
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (require.main === module) run();
module.exports = {source, finderCells, routes, mismatch, linearFeasibility, generator, run};
