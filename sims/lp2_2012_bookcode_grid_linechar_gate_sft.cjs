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

/**
 * Interpret the two printed base60 digits in each token as a coordinate,
 * with zero-based source digits promoted to the positive 2012 L:C contract:
 * L = firstDigit + 1, C = secondDigit + 1. This differs from treating
 * neighboring *byte* values as a single coordinate pair.
 */
function tokenCoordinate(t, source) {
  const d0 = grid.alphabet.indexOf(t[0]);
  const d1 = grid.alphabet.indexOf(t[1]);
  assert.ok(d0 >= 0 && d1 >= 0, "source glyph in fixed base60 alphabet");
  const line = d0 + 1 + source.lookup_index_offset;
  if (line < 0 || line >= source.line_widths.length) return "line";
  return d1 < source.line_widths[line] ? "valid" : "column";
}

function tokenCounts(source) {
  const total = {valid:0, line:0, column:0};
  for (const token of grid.rows.flat()) total[tokenCoordinate(token, source)]++;
  return total;
}

/**
 * Decode a 1911-public-domain excerpt from the first five Britannica article
 * lines after its original 2012 CICADA book-code anchor.
 */
function britannicaTokenChar(token, excerpt) {
  const li = grid.alphabet.indexOf(token[0]);
  const ci = grid.alphabet.indexOf(token[1]);
  assert.ok(li >= 0 && li < 5 && ci >= 0 && ci < excerpt[li].length);
  return excerpt[li][ci];
}

function normalizeLatin(input) {
  return input.toUpperCase().replace(/[^A-Z]+/gu, " ").replace(/\s+/gu, " ");
}

function trainTrigrams(input) {
  const v = 27;
  const tri = new Int32Array(v * v * v);
  const bi = new Int32Array(v * v);
  const s = normalizeLatin(input);
  const idx = c => c === " " ? 26 : c.charCodeAt(0) - 65;
  for (let i = 2; i < s.length; i++) {
    const k = idx(s[i - 2]) * v + idx(s[i - 1]);
    const c = idx(s[i]);
    tri[k * v + c]++;
    bi[k]++;
  }
  return raw => {
    const t = normalizeLatin(raw);
    let sum = 0;
    for (let i = 2; i < t.length; i++) {
      const k = idx(t[i - 2]) * v + idx(t[i - 1]);
      const c = idx(t[i]);
      sum += Math.log((tri[k * v + c] + 0.1) / (bi[k] + v * 0.1));
    }
    return sum / (t.length - 2);
  };
}

function digitPairBookCodeSourceGate(source) {
  const ag = sources.sources.find(x => x.id === "agrippa-2012");
  const brit = sources.sources.find(x => x.id === "britannica-2012");
  assert.deepEqual(tokenCounts(ag), {valid:72, line:0, column:184});
  assert.deepEqual(tokenCounts(brit), {valid:256, line:0, column:0});
  assert.equal(grid.rows.flat().length, 256);
  const excerpt = brit.five_lines_after_heading;
  assert.equal(excerpt.length, 5);
  for (let i = 0; i < 5; i++) {
    assert.equal(excerpt[i].length, brit.line_widths[i + 1]);
  }
  const row = grid.rows.flat().map(t => britannicaTokenChar(t, excerpt)).join("");
  const col = Array.from({length:8}, (_, j) => grid.rows.map(
    r => britannicaTokenChar(r[j], excerpt)).join("")).join("");
  assert.equal(row.length, 256);
  assert.equal(col.length, 256);
  assert.ok(row.startsWith(" sria Cce  tlpc yyren"));
  assert.ok(col.startsWith(" eydiamoe fdte,ha"));
  const training = fs.readFileSync(path.join(BASE,
    "resources/control/shakespeare_first300k.txt"), "utf8");
  const score = trainTrigrams(training);
  let rng = 0x19331914;
  function next() {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    return rng >>> 0;
  }
  const shuffleChars = Array.from(row), samples = [];
  for (let k = 0; k < 1000; k++) {
    for (let j = shuffleChars.length - 1; j > 0; j--) {
      const h = next() % (j + 1);
      [shuffleChars[j], shuffleChars[h]] = [shuffleChars[h], shuffleChars[j]];
    }
    samples.push(score(shuffleChars.join("")));
  }
  const mean = samples.reduce((a,b) => a + b, 0) / samples.length;
  const sd = Math.sqrt(samples.reduce((a,b) => a + (b - mean) ** 2, 0) /
    (samples.length - 1));
  const rowScore = score(row), colScore = score(col);
  const rowP = (1 + samples.filter(x => x >= rowScore).length) / 1001;
  const colP = (1 + samples.filter(x => x >= colScore).length) / 1001;
  assert.ok(Math.abs(rowP - 0.4005994005994006) < 0.00001);
  assert.ok(Math.abs(colP - 0.26573426573426573) < 0.00001);
  console.log("Alternate each-token source L:C (zero-based digits):", JSON.stringify({
    agrippa:tokenCounts(ag), britannica:tokenCounts(brit),
    n:256, printedRowReadout:row.slice(0, 36), columnReadout:col.slice(0, 36),
    shakespeareTrigramNull: {shuffles:samples.length,mean,sd,
      rowScore,rowP,colScore,colP}
  }));
  console.log("DECISION: this direct Britannica variant is addressable but its row/column readouts do not exceed the matched random-order English signal.");
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
  digitPairBookCodeSourceGate(sources);
  console.log("DECISION: direct adjacent-byte LP2 grid as 2012 book-code L:C is impossible under both named source texts. No manuscript plaintext was recovered.");
}

if (require.main === module) main();
module.exports = {gridPairs, check, tally, tokenCounts, trainTrigrams};
