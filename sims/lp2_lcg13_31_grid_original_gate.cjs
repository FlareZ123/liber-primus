"use strict";
/**
 * Source-fixed 13/31 grid traversal and 32-fragment register gate.
 * Tests the original unsolved LP2, retaining empty 13-dot fragments.
 *
 * Run from the repository root: node sims/lp2_lcg13_31_grid_original_gate.cjs
 * CommonJS / Node.js 22. No added dependencies or tunable ciphertext parameters.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {sourceFragments} = require("./fragment_gridrow_vigenere_inverse.cjs");

const root = path.resolve(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/base60-grid.json").byte_rows;
const ciphertext = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const bounds = sourceFragments().bounds;
const mod = (x, n) => ((x % n) + n) % n;
assert.equal(ciphertext.length, 12956);
assert.equal(bounds.length, 32);
assert.equal(bounds[28], ciphertext.length);
assert.equal(grid.length, 32);
assert(grid.every(row => row.length === 8 && row.every(n => Number.isInteger(n) && n >= 0 && n <= 255)));

/** Draw the LCG once over a source-specified power-of-two state space. */
function cycle(size) {
  const out = [];
  let state = 0;
  for (let i = 0; i < size; i++) {
    out.push(state);
    state = (13 * state + 31) % size;
  }
  assert.equal(state, 0);
  assert.equal(new Set(out).size, size);
  return out;
}
const lcg32 = cycle(32);
const lcg8 = cycle(8);
const lcg256 = cycle(256);
const inverse = order => Array.from({length: order.length}, (_, i) => order.indexOf(i));
const rows = [["forward", lcg32], ["inverse", inverse(lcg32)]];
const columns = [["forward", lcg8], ["inverse", inverse(lcg8)]];
const keyStream = [
  ["nested32x8", lcg32.flatMap(r => lcg8.map(c => grid[r][c]))],
  ["singleLCG256", lcg256.map(state => grid[Math.floor(state / 8)][state % 8])]
];
assert(keyStream.every(([, stream]) => stream.length === 256));

function project(byte, projection, radix) {
  return projection === "mod" ? byte % radix : Math.floor(radix * byte / 256);
}

/**
 * For every chronological 13-dot fragment, use one row and a local 8-column
 * clock. The register is either direct GP29 or previous-cipher GP28 with
 * transparent output 28 for genuine immediate ciphertext repetitions.
 */
function fragmentTransform(input, rowOrder, colOrder, family, sign, projection, decode) {
  const output = new Array(input.length);
  for (let fragment = 0; fragment < 28; fragment++) {
    const start = bounds[fragment];
    const end = bounds[fragment + 1];
    const row = grid[rowOrder[fragment]];
    let previous = -1;
    for (let i = start; i < end; i++) {
      const radix = family === "gp29" ? 29 : 28;
      const key = project(row[colOrder[(i - start) % 8]], projection, radix);
      const value = input[i];
      let result;
      if (family === "gp29") {
        result = mod(value + (decode ? 1 : -1) * sign * key, 29);
      } else if (previous < 0) {
        result = value;
      } else if (decode) {
        result = value === previous ? 28 :
          mod(mod(value - previous - 1, 29) + sign * key, 28);
      } else {
        result = value === 28 ? previous :
          mod(previous + 1 + mod(value - sign * key, 28), 29);
      }
      output[i] = result;
      if (family === "gp28") previous = decode ? value : result;
    }
  }
  return output;
}

function wholeTableTransform(input, bytes, sign, projection, decode) {
  return input.map((value, i) => {
    const key = project(bytes[i % 256], projection, 29);
    return mod(value + (decode ? 1 : -1) * sign * key, 29);
  });
}

function stats(runes) {
  const counts = new Array(29).fill(0);
  for (const rune of runes) {
    assert(Number.isInteger(rune) && rune >= 0 && rune <= 28);
    counts[rune]++;
  }
  const n = runes.length;
  return {
    ioc: counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1)),
    top12: counts.slice().sort((a, b) => b - a).slice(0, 12).reduce((a, b) => a + b, 0) / n,
    prefix: runes.slice(0, 70).map(x => corpus.translit[x]).join("")
  };
}
function main() {
  const native = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(native.length, 95);
  const plant29 = Array.from({length: ciphertext.length}, (_, i) => native[i % native.length]);
  const plant28 = plant29.map((v, i) => i % 113 === 10 ? 28 : v % 28);
  const variants = [];
  let plantChecks = 0;
  for (const [rowName, rowOrder] of rows) {
    for (const [columnName, columnOrder] of columns) {
      for (const family of ["gp29", "gp28"]) {
        for (const sign of [-1, 1]) {
          for (const projection of ["mod", "scaled"]) {
            const transform = (input, decode) =>
              fragmentTransform(input, rowOrder, columnOrder, family, sign, projection, decode);
            const decoded = transform(ciphertext, true);
            assert.deepEqual(transform(decoded, false), ciphertext);
            const planted = family === "gp29" ? plant29 : plant28;
            const encodedPlant = transform(planted, false);
            assert.deepEqual(transform(encodedPlant, true), planted);
            plantChecks++;
            variants.push({kind: "fragment-row", rowName, columnName, family,
              sign, projection, ...stats(decoded)});
          }
        }
      }
    }
  }
  for (const [ordering, bytes] of keyStream) {
    for (const sign of [-1, 1]) {
      for (const projection of ["mod", "scaled"]) {
        const decoded = wholeTableTransform(ciphertext, bytes, sign, projection, true);
        assert.deepEqual(wholeTableTransform(decoded, bytes, sign, projection, false), ciphertext);
        const encryptedPlant = wholeTableTransform(plant29, bytes, sign, projection, false);
        assert.deepEqual(wholeTableTransform(encryptedPlant, bytes, sign, projection, true), plant29);
        plantChecks++;
        variants.push({kind: "full256-pad", ordering, family: "gp29",
          sign, projection, ...stats(decoded)});
      }
    }
  }
  const summary = {};
  for (const family of ["gp29", "gp28"]) {
    const entries = variants.filter(x => x.family === family);
    summary[family] = {
      count: entries.length,
      iocRange: [Math.min(...entries.map(x => x.ioc)), Math.max(...entries.map(x => x.ioc))],
      top12Range: [Math.min(...entries.map(x => x.top12)), Math.max(...entries.map(x => x.top12))],
      maxIoCExample: entries.slice().sort((a, b) => b.ioc - a.ioc)[0]
    };
  }
  return {
    classification: "Bounded source-fixed negative; no unknown LP2 plaintext or key",
    source: {runes: ciphertext.length, fragments: 32, unsolvedFragments: 28,
      gridRows: 32, gridColumns: 8, lcg32, lcg8, lcg256Start: lcg256.slice(0, 32),
      emptyFragments: [8, 11], originalIoC: stats(ciphertext).ioc,
      originalTop12: stats(ciphertext).top12},
    methods: {rowClocks: "fragment-local eight columns",
      rowAssignment: "13/31 LCG or inverse; no fitted rotation",
      fullTableClocks: "original-global 256-period; no fitted phase",
      keyProjection: "byte mod radix or floor(byte*radix/256)",
      signs: [-1, 1], registers: ["direct GP29", "GP28 predecessor-exclusion"],
      note: "Forward reencryption and solved-page-derived synthetic plant checks are implementation tests only"},
    modelCount: variants.length, plantChecks, summary, variants,
    status: "NO_NEW_ORIGINAL_PLAINTEXT"
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(main(), null, 2) + "\n");
module.exports = {cycle, fragmentTransform, wholeTableTransform, main};
