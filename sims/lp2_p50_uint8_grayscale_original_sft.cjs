"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @typedef {{horizontal:number, vertical:number, combined:number}} PixelDistances */

/** @param {number[][]} image @returns {PixelDistances} */
function distances(image) {
  let horizontal = 0;
  let vertical = 0;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 8; x++) {
      if (x < 7) horizontal += Math.abs(image[y][x] - image[y][x + 1]);
      if (y < 31) vertical += Math.abs(image[y][x] - image[y + 1][x]);
    }
  }
  return {horizontal, vertical, combined: horizontal + vertical};
}

/** @param {number} initialSeed @returns {()=>number} */
function rng(initialSeed) {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

/** @template T @param {T[]} array @param {()=>number} random @returns {T[]} */
function shuffled(array, random) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * @param {number[][]} image
 * @param {boolean} preserveRows
 * @param {number} repeats
 * @returns {{mean:PixelDistances, lowerCounts:PixelDistances}}
 */
function controls(image, preserveRows, repeats) {
  const observed = distances(image);
  const random = rng(0x3301);
  /** @type {PixelDistances} */
  const sum = {horizontal: 0, vertical: 0, combined: 0};
  /** @type {PixelDistances} */
  const lowerCounts = {horizontal: 0, vertical: 0, combined: 0};
  for (let i = 0; i < repeats; i++) {
    const control = preserveRows
      ? image.map(row => shuffled(row, random))
      : (() => {
          const flat = shuffled(image.flat(), random);
          return Array.from({length: 32}, (_, r) => flat.slice(r * 8, (r + 1) * 8));
        })();
    // Whole-table permutation above intentionally shuffles once per sample,
    // so a single 256-cell inventory is retained across all 32 source rows.
    const sample = distances(control);
    for (const metric of ["horizontal", "vertical", "combined"]) {
      sum[metric] += sample[metric];
      if (sample[metric] <= observed[metric]) lowerCounts[metric]++;
    }
  }
  return {
    mean: {
      horizontal: sum.horizontal / repeats,
      vertical: sum.vertical / repeats,
      combined: sum.combined / repeats
    },
    lowerCounts
  };
}

function run() {
  const source = JSON.parse(fs.readFileSync(path.join(
    __dirname, "..", "resources", "liber-primus", "base60-grid.json"), "utf8"));
  const grid = source.byte_rows;
  assert.equal(grid.length, 32);
  assert.ok(grid.every(row => row.length === 8 &&
    row.every(value => Number.isInteger(value) && value >= 0 && value <= 255)));
  assert.equal(grid.flat().length, 256);
  assert.deepEqual(grid[0], [203, 231, 167, 186, 97, 237, 126, 183]);

  const original = distances(grid);
  assert.deepEqual(original, {
    horizontal: 19240, vertical: 19052, combined: 38292
  });
  assert.equal(32 * 7, 224);
  assert.equal(31 * 8, 248);
  const positive = Array.from({length: 32},
    () => Array.from({length: 8}, (_, x) => 8 + 32 * x));
  const plant = distances(positive);
  assert.equal(plant.vertical, 0);
  assert.equal(plant.horizontal, 7168);
  assert.ok(plant.combined < original.combined / 4);

  const trials = 20000;
  for (const condition of ["whole", "row"]) {
    const result = controls(grid, condition === "row", trials);
    console.log(condition + " source inventory: " + JSON.stringify(result));
    console.log(condition + " source inventory lower-tail p: " +
      JSON.stringify(Object.fromEntries(["horizontal", "vertical", "combined"]
        .map(metric => [metric, (result.lowerCounts[metric] + 1) / (trials + 1)]))));
  }
  const ascii = " .:-=+*#%@";
  console.log("SOURCE 32×8 pixel-intensity quantile preview:");
  console.log(grid.map(row => row.map(byte =>
    ascii[Math.min(9, Math.floor(byte / 25.6))]).join("")).join("\n"));
  console.log("PASS: all 256 unchanged original bytes, source order, " +
    "one 8-bit grayscale encoding, source-multiset and row-conditioned " +
    "permutation controls, and strong positive grayscale image plant");
}

run();
