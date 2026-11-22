"use strict";

/**
 * Exact hidden-state recovery for legacy 32-bit LCG byte projections of the
 * unmodified LP2 256-byte table. Run: node sims/grid_truncated_legacy_lcg_sft.cjs
 * All states compatible with the first displayed byte are enumerated.
 *
 * @typedef {{name:string, multiplier:number, increment:number, mask:number,
 *            shift:number}} Model
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const original = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"));
assert.equal(original.rows.length, 32);
assert(original.rows.every((row) => row.length === 8));
assert.equal(original.alphabet.length, 60);
const rows = original.rows.map((row) => row.map((token) => {
  assert.equal(token.length, 2);
  const hi = original.alphabet.indexOf(token[0]);
  const lo = original.alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  const value = 60 * hi + lo;
  assert(value < 256);
  return value;
}));
const sourceBytes = Buffer.from(rows.flat());
const sourceHash = crypto.createHash("sha256").update(sourceBytes).digest("hex");
assert.equal(sourceHash,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @type {ReadonlyArray<Model>} */
const models = [
  {name:"BSD-TYPE0-middle16", multiplier:1103515245, increment:12345,
    mask:0x7fffffff, shift:16},
  {name:"MSVC-middle16", multiplier:214013, increment:2531011,
    mask:0x7fffffff, shift:16},
  {name:"NR-upper24", multiplier:1664525, increment:1013904223,
    mask:0xffffffff, shift:24},
  {name:"NR-middle16", multiplier:1664525, increment:1013904223,
    mask:0xffffffff, shift:16},
];

function traversals() {
  const pages = [rows.slice(0, 10), rows.slice(10, 23), rows.slice(23)];
  const read = {
    printed: rows.flat(),
    rowSnake: rows.flatMap((row, i) => i % 2 ? [...row].reverse() : row),
    columns: Array.from({length:8}, (_, c) => rows.map((row) => row[c])).flat(),
    columnSnake: Array.from({length:8}, (_, c) => {
      const column = rows.map((row) => row[c]);
      return c % 2 ? column.reverse() : column;
    }).flat(),
    pageColumns: pages.flatMap((page) => Array.from({length:8}, (_, c) =>
      page.map((row) => row[c])).flat()),
    pageColumnSnake: pages.flatMap((page) =>
      Array.from({length:8}, (_, c) => {
        const column = page.map((row) => row[c]);
        return c % 2 ? column.reverse() : column;
      }).flat()),
  };
  for (const [name, bytes] of Object.entries({...read})) {
    assert.equal(bytes.length, 256);
    read[name + "Reversed"] = [...bytes].reverse();
  }
  return read;
}

/** @param {number} x @param {Model} model @returns {number} */
function nextState(x, model) {
  return (Math.imul(model.multiplier, x) + model.increment) & model.mask;
}

/** @param {number} x @param {Model} model @returns {number} */
function outputByte(x, model) {
  return (x >>> model.shift) & 255;
}

/**
 * Enumerate all 2^23 (31-bit) or 2^24 (32-bit) hidden initial states
 * agreeing with the first observed byte; test every subsequent byte.
 * The middle-byte variants cannot observe the top 7 or 8 state bits,
 * so a true plant legitimately yields many equivalent recovered states.
 * @param {ReadonlyArray<number>} bytes
 * @param {Model} model
 * @param {number|null} [plantedInitial]
 */
function recover(bytes, model, plantedInitial = null) {
  const first = bytes[0];
  const limit = model.mask === 0x7fffffff ? 8388608 : 16777216;
  let bestPrefix = 1;
  let compatibleTwo = 0;
  let compatibleThree = 0;
  let fullStates = 0;
  let recoveredPlant = false;
  let exampleFullState = null;

  for (let u = 0; u < limit; u++) {
    let x;
    if (model.shift === 16) {
      // Unobserved low 16 bits plus unobserved top 7/8 bits.
      x = ((u >>> 16) << 24) | (first << 16) | (u & 65535);
    } else {
      // Unobserved low 24 bits of the 32-bit state.
      x = (first << 24) | u;
    }
    x &= model.mask;
    let state = nextState(x, model);
    if (outputByte(state, model) !== bytes[1]) continue;
    compatibleTwo++;
    if (bestPrefix < 2) bestPrefix = 2;
    state = nextState(state, model);
    if (outputByte(state, model) !== bytes[2]) continue;
    compatibleThree++;
    if (bestPrefix < 3) bestPrefix = 3;
    let matched = 3;
    while (matched < bytes.length) {
      state = nextState(state, model);
      if (outputByte(state, model) !== bytes[matched]) break;
      matched++;
    }
    if (matched > bestPrefix) bestPrefix = matched;
    if (matched === bytes.length) {
      fullStates++;
      exampleFullState = x >>> 0;
      if (plantedInitial !== null && (x >>> 0) === plantedInitial)
        recoveredPlant = true;
    }
  }
  return {bestPrefix, compatibleTwo, compatibleThree, fullStates,
    recoveredPlant, exampleFullState};
}

function plant(model) {
  const initialState = (0x33011033 & model.mask) >>> 0;
  const bytes = [];
  let state = initialState;
  for (let i = 0; i < 256; i++) {
    bytes.push(outputByte(state, model));
    state = nextState(state, model);
  }
  const result = recover(bytes, model, initialState);
  assert.equal(result.bestPrefix, 256);
  assert(result.fullStates > 0 && result.recoveredPlant);
  return {model: model.name, initialState,
    fullCompatibleStates: result.fullStates, recoveredPlant:true};
}

function main() {
  console.log("Original grid hash:", sourceHash);
  for (const model of models) console.log("Positive plant:", JSON.stringify(plant(model)));
  let maxOriginalPrefix = 0;
  for (const [order, bytes] of Object.entries(traversals())) {
    for (const model of models) {
      const result = recover(bytes, model);
      maxOriginalPrefix = Math.max(maxOriginalPrefix, result.bestPrefix);
      assert.equal(result.fullStates, 0);
      console.log("Original:", JSON.stringify({order, model:model.name, ...result}));
    }
  }
  assert(maxOriginalPrefix <= 4);
  console.log("Original complete streams found: 0 / 48.");
  console.log("Largest exact prefix across 48 original views:", maxOriginalPrefix);
  console.log("Decision: no source-recovered LCG state; no LP2 plaintext.");
}
main();
