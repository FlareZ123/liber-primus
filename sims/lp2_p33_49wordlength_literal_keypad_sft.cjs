/**
 * Original LP2 p33 49-word lengths as literal keypad directions on the
 * authentic 2014 Cicada 7x7/1033 magic-square board.
 *
 * Node.js 22, CommonJS. Read-only SFT with independent positive plant.
 * The candidate is historical cross-round speculation, not a recovered cipher.
 */
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const text = read("resources/liber-primus/lp2-transcription.txt");
const page = text.split("%")[33];
assert(page, "original p33 must exist");

let runeOffset = 0;
let first = -1;
let runes = "";
const words = [];
const finish = () => {
  if (runes) {
    words.push({ start: first, len: [...runes].length, runes });
    first = -1;
    runes = "";
  }
};
for (const glyph of page) {
  if (glyph >= "\u16a0" && glyph <= "\u16ff") {
    if (first < 0) first = runeOffset;
    runeOffset++;
    runes += glyph;
  } else if (glyph === "-" || glyph === "." || glyph === "&" || glyph === "$") {
    finish();
  }
}
finish();
assert.equal(runeOffset, 214);
const black = words.filter(
  (w) => (w.start >= 10 && w.start < 91) || (w.start >= 99 && w.start < 214),
);
const lengths = black.map((w) => w.len);
assert.equal(black.length, 49);
assert.equal(lengths.reduce((a, b) => a + b, 0), 196);
assert.equal(black.filter((w) => w.start < 91).length, 21);
assert.equal(black.filter((w) => w.start >= 99).length, 28);
assert.deepEqual(
  lengths,
  [2,9,6,3,3,5,3, 2,7,3,3,6,5,8, 2,3,2,2,2,3,2,
   6,7,4,3,4,2,2, 3,2,4,2,1,9,8, 4,4,9,5,5,2,4,
   2,4,3,7,3,5,1],
);

const squareBlocks = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/);
const square = squareBlocks[1].trim().split(/\r?\n/)
  .map((s) => s.trim().split(/\s+/).map(Number));
assert.equal(square.length, 7);
for (const row of square) assert.equal(row.length, 7);
assert(square.every((row) => row.reduce((a, b) => a + b, 0) === 1033));
assert.equal(square[3][3], 331);

// Conventionally printed telephone/numeric keypad, not a tuned cipher key.
// 7 8 9  -> north-west, north, north-east
// 4 5 6  -> west, stationary, east
// 1 2 3  -> south-west, south, south-east
const delta = {
  1: [1,-1], 2: [1,0], 3: [1,1],
  4: [0,-1], 5: [0,0], 6: [0,1],
  7: [-1,-1], 8: [-1,0], 9: [-1,1],
};

/**
 * Walk a literal finite board; do not silently wrap, reflect, or delete steps.
 * @param {number[]} commands - One p33 word length for each step.
 * @param {number} startRow - Zero-based row.
 * @param {number} startCol - Zero-based column.
 * @returns {{ visited: number[][], exitAt: number|null, values: number[] }}
 */
function walk(commands, startRow = 3, startCol = 3) {
  let r = startRow;
  let c = startCol;
  const visited = [[r,c]];
  const values = [];
  for (let i = 0; i < commands.length; i++) {
    const step = delta[commands[i]];
    assert(step, "a word length outside the literal numpad code");
    r += step[0];
    c += step[1];
    if (r < 0 || r >= 7 || c < 0 || c >= 7) {
      return { visited, exitAt: i + 1, values };
    }
    visited.push([r,c]);
    values.push(square[r][c]);
  }
  return { visited, exitAt: null, values };
}

const original = walk(lengths);
assert.equal(original.exitAt, 5);
assert.deepEqual(original.visited, [
  [3,3], [4,3], [3,4], [3,5], [4,6],
]);
assert.deepEqual(original.values, [114,270,65,456]);

// Positive: an independently constructed in-board 49-command walk survives.
const plant = [...Array(24)].flatMap(() => [6,4]).concat([5]);
const planted = walk(plant);
assert.equal(planted.exitAt, null);
assert.equal(planted.values.length, 49);
assert.deepEqual(planted.visited.at(-1), [3,3]);
const inverse = [];
for (let i = 1; i < planted.visited.length; i++) {
  const [a,b] = planted.visited[i-1];
  const [c,d] = planted.visited[i];
  const code = Number(Object.keys(delta).find((k) => {
    const [dr,dc] = delta[k];
    return dr === c - a && dc === d - b;
  }));
  inverse.push(code);
}
assert.deepEqual(inverse, plant);

const matrix = [...Array(7)].map((_, i) => lengths.slice(7*i, 7*i+7));
const out = {
  source: "Original LP2 p33 archive 50.jpg; historical Stage7 7x7/1033 square",
  p33RuneCount: runeOffset,
  redExcluded: [[0,10],[91,99]],
  blackWords: black.length,
  blackRuneCount: lengths.reduce((a,b)=>a+b,0),
  blackSplit: [21,28],
  matrix,
  rowSums: matrix.map(row=>row.reduce((a,b)=>a+b,0)),
  literalKeypadWalk: {
    origin: [3,3],
    firstFourSquareValues: original.values,
    exitAtOneBasedCommand: original.exitAt,
    attemptedFifthLocation: [5,7],
  },
  plantedWalk: { commands: plant.length, recovered: inverse.length },
  verdict: "Board exit at fifth original command; no instruction or key recovered",
};
console.log(JSON.stringify(out, null, 2));
