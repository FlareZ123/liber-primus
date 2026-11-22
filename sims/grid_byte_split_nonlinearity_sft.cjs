"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const GRID = path.resolve(__dirname, "../resources/liber-primus/lp2-grid-256.json");
const PATIENCE = [6, 5, 3, 0, 2, 4, 7, 1];
const tableSource = JSON.parse(fs.readFileSync(GRID, "utf8"));
const bytes = tableSource.pages.flatMap((page) => page.bytes);
assert.equal(bytes.length, 256, "The source must contain exactly 256 bytes");
assert(bytes.every((b) => Number.isInteger(b) && b >= 0 && b <= 255));
const table = Array.from({length: 32}, (_, i) => bytes.slice(8 * i, 8 * i + 8));

/**
 * Proposed byte split in Agent5's 2026-11-10 message:
 * nonrepeating GP difference-rank x=4q+h (0..27);
 * repeat class x=28 maps to (q,h)=(7,0).
 * @param {number} state Current 5-bit state.
 * @param {number} x A GP difference-rank in 0..28.
 * @param {"A" | "B"} variant Byte split.
 * @param {boolean} patience Whether to reorder the eight columns.
 * @returns {{out:number,next:number,byte:number}}
 */
function step(state, x, variant, patience) {
  assert(Number.isInteger(state) && state >= 0 && state < 32);
  assert(Number.isInteger(x) && x >= 0 && x <= 28);
  const q = x === 28 ? 7 : Math.floor(x / 4);
  const h = x === 28 ? 0 : x % 4;
  const byte = table[state][patience ? PATIENCE[q] : q];
  if (variant === "A") {
    return {out: byte >>> 3, next: 4 * (byte & 7) + h, byte};
  }
  return {out: byte & 31, next: 4 * (byte >>> 5) + h, byte};
}

/**
 * @param {number} start Starting register.
 * @param {number[]} input Input difference-rank sequence.
 * @param {"A" | "B"} variant
 * @param {boolean} patience
 * @returns {{outputs:number[],finish:number}}
 */
function encode(start, input, variant, patience) {
  let state = start;
  const outputs = [];
  for (const x of input) {
    const next = step(state, x, variant, patience);
    outputs.push(next.out);
    state = next.next;
  }
  return {outputs, finish: state};
}

/**
 * Find two DISTINCT non-repeating two-rune input paths that produce
 * identical 29-symbol-range outputs AND identical final state.
 * The original starting state is held fixed and is fully known.
 * @param {number} start
 * @param {"A" | "B"} variant
 * @param {boolean} patience
 * @returns {{first:number[],second:number[],outputs:number[],finish:number}|null}
 */
function findCollision(start, variant, patience) {
  const seen = new Map();
  for (let first = 0; first < 28; first++) {
    for (let second = 0; second < 28; second++) {
      const encoded = encode(start, [first, second], variant, patience);
      if (encoded.outputs.some((value) => value >= 29)) continue;
      const key = encoded.outputs.join(",") + ":" + encoded.finish;
      const previous = seen.get(key);
      if (previous) {
        return {first: previous, second: [first, second],
          outputs: encoded.outputs, finish: encoded.finish};
      }
      seen.set(key, [first, second]);
    }
  }
  return null;
}

for (const variant of ["A", "B"]) {
  for (const patience of [true, false]) {
    let statesWithCollision = 0;
    let firstWitness = null;
    for (let start = 0; start < 32; start++) {
      const witness = findCollision(start, variant, patience);
      if (!witness) continue;
      statesWithCollision++;
      assert.notDeepEqual(witness.first, witness.second);
      assert.deepEqual(
        encode(start, witness.first, variant, patience),
        encode(start, witness.second, variant, patience)
      );
      if (!firstWitness) firstWitness = {start, ...witness};
    }
    assert.equal(statesWithCollision, 32,
      "Every possible source-selected initial state must have a collision");
    console.log(JSON.stringify({variant, columnOrder: patience ? "PATIENCE" : "printed",
      statesWithCollision, witness: firstWitness}));
  }
}
console.log("PASS: All four proposed byte-split models have two-symbol "
  + "noninjection witnesses for every starting state, without repeats or special outputs.");
