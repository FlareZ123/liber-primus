"use strict";

/**
 * Source-native 2012 book-code line:character gate on the 32x8 LP2 base60 table.
 * Run: node sims/lp2_2012_bookcode_grid_linechar_gate_sft.cjs
 * No external libraries and no book-text redistribution.
 *
 * The original 2012 book codes use one-based L:C references. The Agrippa
 * historical script skips five text lines and computes L-1, C-1; the
 * Britannica script starts from the 'CICADA' heading and computes L, C-1.
 * We freeze the original 32 printed rows and pair adjacent table bytes:
 * (column0,column1), (column2,column3), etc.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const BASE = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(BASE,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(BASE,
  "resources/derived/2012-bookcode-linewidths.json"), "utf8"));

/** @returns {Array<[number,number]>} */
function gridPairs() {
  assert.equal(grid.byte_rows.length, 32);
  const pairs = [];
  for (const row of grid.byte_rows) {
    assert.equal(row.length, 8);
    for (let k = 0; k < 8; k += 2) {
      assert.ok(Number.isInteger(row[k]) && row[k] >= 0 && row[k] <= 255);
      assert.ok(Number.isInteger(row[k + 1]) && row[k + 1] >= 0 && row[k + 1] <= 255);
      pairs.push([row[k], row[k + 1]]);
    }
  }
  assert.equal(pairs.length, 128);
  return pairs;
}

/**
 * Test if one index pair can address an original source-line character under
 * the authentic source's exact historical line-index convention.
 * @param {[number,number]} pair
 * @param {{line_widths:number[],lookup_index_offset:number}} source
 * @returns {"valid"|"zero"|"line"|"column"}
 */
function check(pair, source) {
  const [line, column] = pair;
  if (line <= 0 || column <= 0) return "zero";
  const localLine = line + source.lookup_index_offset;
  if (localLine < 0 || localLine >= source.line_widths.length) return "line";
  return column - 1 < source.line_widths[localLine] ? "valid" : "column";
}

function tally(pairs, source) {
  const counts = {valid:0, zero:0, line:0, column:0};
  for (const pair of pairs) counts[check(pair, source)]++;
  return counts;
}

function main() {
  assert.equal(sources.schema, 1);
  const pairs = gridPairs();
  const expected = [
    {id:"agrippa-2012", full:{valid:14,zero:2,line:0,column:112},
     originalCoords:20, headingOffset:5, localShift:-1},
    {id:"britannica-2012", full:{valid:36,zero:2,line:0,column:90},
     originalCoords:19, headingOffset:15388, localShift:0}
  ];
  console.log("LP2 original table:", grid.byte_rows.length, "rows x 8 bytes;",
    pairs.length, "fixed adjacent line:column pairs");
  for (const target of expected) {
    const source = sources.sources.find(x => x.id === target.id);
    assert.ok(source);
    assert.equal(source.first_source_line_index, target.headingOffset);
    assert.equal(source.lookup_index_offset, target.localShift);
    assert.equal(source.official_coords.length, target.originalCoords);
    const official = tally(source.official_coords, source);
    assert.deepEqual(official, {valid:target.originalCoords,zero:0,line:0,column:0},
      target.id + " historical coordinate positive control");
    const test = tally(pairs, source);
    assert.deepEqual(test, target.full, target.id + " exact original-grid decision");
    console.log(target.id + ":", JSON.stringify({
      validHistoricalPairs:official.valid, originalGridPairs:pairs.length,
      originalGrid: test, firstFourOriginalPairs:pairs.slice(0, 4).map(
        pair => ({pair, result:check(pair, source)})
      )
    }));
  }
  console.log("DECISION: direct adjacent-byte LP2 grid as 2012 book-code L:C is impossible under both named source texts. No manuscript plaintext was recovered.");
}

if (require.main === module) main();
module.exports = {gridPairs, check, tally};
