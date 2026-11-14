"use strict";

/**
 * LP2 numeric table -> GP29 grid-walk original-known-plaintext test.
 *
 * Node.js 22, read-only. The 32x8 canonical base60 bytes are split into
 * emitted rune r = byte % 29 and proposed keypad q = floor(byte / 29).
 * Compare (a) q-directed 3x3 moves and (b) their generous superset,
 * arbitrary adjacent eight-way moves plus staying put, with revisits.
 *
 * Both known LP2 terminal plaintext pages and the raw p55 ciphertext are
 * searched at every possible offset and starting grid cell. A separate
 * minimum-Hamming-edit dynamic program bounds repairs to any full reading.
 *
 * Files: resources/liber-primus/{base60-grid,lp2-corpus}.json
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "base60-grid.json"), "utf8"));
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
const source = grid.byte_rows.flat();
assert.equal(source.length, 256);
assert.ok(source.every((v) => Number.isInteger(v) && v >= 0 && v < 256));

const compass = [
  [-1, 1], [0, 1], [1, 1],
  [-1, 0], [0, 0], [1, 0],
  [-1, -1], [0, -1], [1, -1]
];

/**
 * @param {number} cell zero-based row-major grid address
 * @param {number} direction q in 0..8
 * @returns {number} next cell, or -1 off the grid
 */
function move(cell, direction) {
  const [dc, dr] = compass[direction];
  const col = cell % 8 + dc;
  const row = Math.floor(cell / 8) + dr;
  return col >= 0 && col < 8 && row >= 0 && row < 32
    ? row * 8 + col : -1;
}

/**
 * @param {number[]} bytes complete 256-byte readout
 * @returns {{emitted:number[], choices:number[][], predecessors:number[][], free:number[][]}}
 */
function build(bytes) {
  assert.equal(bytes.length, 256);
  const emitted = bytes.map((v) => v % 29);
  const choices = bytes.map((v, i) => [move(i, Math.floor(v / 29))].filter((n) => n >= 0));
  const free = bytes.map((_, i) =>
    compass.map((__, q) => move(i, q)).filter((n) => n >= 0));
  const predecessors = Array.from({length: 256}, () => []);
  choices.forEach((neighbors, i) => {
    for (const n of neighbors) predecessors[n].push(i);
  });
  return {emitted, choices, predecessors, free};
}

const board = build(source);

/**
 * @param {number[]} target GP29 text
 * @param {number[]} emitted local GP29 grid values
 * @param {number[][]} edges next-cell choices
 * @returns {{length:number,offset:number}}
 */
function longestExact(target, emitted, edges) {
  let best = {length: 0, offset: -1};
  for (let off = 0; off < target.length; off++) {
    let live = new Set(emitted.map((v, i) => v === target[off] ? i : -1)
      .filter((i) => i >= 0));
    for (let t = off; t < target.length && live.size; t++) {
      if (t > off) {
        const next = new Set();
        for (const cell of live) {
          for (const n of edges[cell]) {
            if (emitted[n] === target[t]) next.add(n);
          }
        }
        live = next;
      }
      if (live.size && t - off + 1 > best.length) {
        best = {length: t - off + 1, offset: off};
      }
    }
  }
  return best;
}

/**
 * Exact minimum of required glyph substitutions over every full grid walk.
 * Each printed target symbol consumes exactly one visited grid cell.
 *
 * @param {number[]} target GP29 text
 * @param {number[]} emitted grid outputs
 * @param {number[][]} predecessors possible previous cells
 * @returns {number} minimum substituted outputs (no insertion or deletion)
 */
function minimumSubstitutions(target, emitted, predecessors) {
  let costs = emitted.map((v) => Number(v !== target[0]));
  for (let t = 1; t < target.length; t++) {
    const next = new Array(256).fill(Infinity);
    for (let cell = 0; cell < 256; cell++) {
      for (const pred of predecessors[cell]) {
        if (costs[pred] < next[cell]) next[cell] = costs[pred];
      }
      if (Number.isFinite(next[cell])) {
        next[cell] += Number(emitted[cell] !== target[t]);
      }
    }
    costs = next;
  }
  return Math.min(...costs);
}

/** @param {number[]} src @returns {number[]} */
function primeTotientPlain(src) {
  const primes = [];
  for (let n = 2; primes.length < src.length; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(n);
  }
  let tick = 0;
  return src.map((v, i) => i === 56
    ? v : ((v - (primes[tick++] - 1)) % 29 + 29) % 29);
}

assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices[56], 0);
const solved56 = primeTotientPlain(corpus.pages[56].indices);
assert.ok(solved56.map((i) => corpus.translit[i]).join("")
  .startsWith("ANENDWITHINTHEDEEPWEB"));
const solved57 = corpus.pages[57].indices;
assert.ok(solved57.map((i) => corpus.translit[i]).join("")
  .startsWith("PARABLELICETHEINSTAR"));

const cases = [
  {name: "solved-p56", text: solved56, exact9: 5, exactQ: 2, edits9: 37, editsQ: 76},
  {name: "solved-p57", text: solved57, exact9: 5, exactQ: 2, edits9: 40, editsQ: 86},
  {name: "solved-p56-p57", text: solved56.concat(solved57),
    exact9: 5, exactQ: 2, edits9: 78, editsQ: 163},
  {name: "p55-printed-cipher", text: corpus.pages[55].indices,
    exact9: 6, exactQ: 2, edits9: 31, editsQ: 69}
];

for (const item of cases) {
  const max9 = longestExact(item.text, board.emitted, board.free);
  const maxQ = longestExact(item.text, board.emitted, board.choices);
  const edits9 = minimumSubstitutions(item.text, board.emitted, board.free);
  const editsQ = minimumSubstitutions(item.text, board.emitted, board.predecessors);
  assert.equal(max9.length, item.exact9);
  assert.equal(maxQ.length, item.exactQ);
  assert.equal(edits9, item.edits9);
  assert.equal(editsQ, item.editsQ);
  assert.ok(edits9 <= editsQ);
  console.log(JSON.stringify({
    target: item.name, runes: item.text.length,
    freeNine: {maxExact: max9, minSubstitutions: edits9},
    directedQ: {maxExact: maxQ, minSubstitutions: editsQ}
  }));
}

/*
 * Native-positive 95-rune planted board. Encode each genuine p57 rune along
 * a 95-cell snake path using q=5 (east), q=3 (west) or q=1 (south).
 * The last cell has q=4 (stay). All planted byte values fit within 0..255.
 */
const plantedBytes = new Array(256).fill(0);
const snake = Array.from({length: solved57.length}, (_, i) => {
  const row = Math.floor(i / 8);
  const col = row % 2 === 0 ? i % 8 : 7 - i % 8;
  return 8 * row + col;
});
for (let i = 0; i < solved57.length; i++) {
  const target = i + 1 < snake.length ? snake[i + 1] : snake[i];
  const step = compass.findIndex((_, q) => move(snake[i], q) === target);
  assert.ok(step >= 0);
  const code = 29 * step + solved57[i];
  assert.ok(code >= 0 && code < 256);
  plantedBytes[snake[i]] = code;
}
const plant = build(plantedBytes);
assert.equal(longestExact(solved57, plant.emitted, plant.choices).length, 95);
assert.equal(longestExact(solved57, plant.emitted, plant.free).length, 95);
assert.equal(minimumSubstitutions(solved57, plant.emitted, plant.predecessors), 0);
assert.equal(minimumSubstitutions(solved57, plant.emitted, plant.free), 0);
console.log("positive-95-rune-planted-grid: 95/95 exact; 0 substitutions in both models");
