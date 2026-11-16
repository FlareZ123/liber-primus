"use strict";
/**
 * Source-original pointer and perimeter continuation of the p50 literal 00
 * collision-glyph lead. No LP2 plaintext or cipher is claimed.
 *
 * Reads printed base60 table bytes and original LP2 GP29 runes.
 * Run: node sims/lp2_p50_00_pointer_doublet_spiral_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const cells = grid.pages.flatMap(page => page.tokens);
assert.equal(cells.length, 256);
assert.equal(grid.alphabet.length, 60);
const bytes = cells.map(cell => grid.alphabet.indexOf(cell[0]) * 60 + grid.alphabet.indexOf(cell[1]));
assert.ok(bytes.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
assert.deepEqual(cells.flatMap((s, i) => s === "00" ? [i] : []), [192, 229]);

/** Original, within-physical-page equal successors; global rune key clock. */
const events = new Map();
let global = 0;
let repeats = 0;
for (const page of corpus.pages.slice(0, 56)) {
  const runes = page.indices;
  for (let i = 0; i + 1 < runes.length; i++) {
    if (runes[i] !== runes[i + 1]) continue;
    const phase = (global + i) % 256;
    const text = events.get(phase) || [];
    text.push(corpus.translit[runes[i]]);
    events.set(phase, text);
    repeats++;
  }
  global += runes.length;
}
assert.equal(global, 12956);
assert.equal(repeats, 86);
assert.deepEqual(events.get(192), ["Y", "O", "U", "A"]);
assert.deepEqual(events.get(229), ["X"]);

/** @param {number[]} order */
function readEvents(order) {
  return order.flatMap(i => events.get(i) || []).join("");
}

/** Follow the source byte as the next zero-based table index. */
function pointerWalk(start) {
  const visited = new Set();
  const indices = [];
  let i = start;
  while (!visited.has(i)) {
    visited.add(i);
    indices.push(i);
    i = bytes[i];
  }
  return { indices, cycleEntry: i };
}
const pointed = pointerWalk(192);
assert.equal(pointed.cycleEntry, 192);
assert.deepEqual(pointed.indices, [192, 0, 203, 68, 199, 47, 76, 114, 197, 115, 247]);
assert.equal(readEvents(pointed.indices), "YOUASWEAOE");

/** All source-byte pointer cycles, independent of any language selection. */
const visited = new Set();
const cycles = [];
for (let source = 0; source < 256; source++) {
  if (visited.has(source)) continue;
  const seen = new Map();
  const walk = [];
  let i = source;
  while (!seen.has(i) && !visited.has(i)) {
    seen.set(i, walk.length);
    walk.push(i);
    i = bytes[i];
  }
  if (seen.has(i)) cycles.push(walk.slice(seen.get(i)));
  walk.forEach(x => visited.add(x));
}
assert.equal(cycles.length, 2);
assert.deepEqual(cycles.map(x => x.length).sort((a, b) => a - b), [2, 11]);

/** Printed 32x8 rectangle's literal outer boundary, clockwise from (0,0). */
const ring = [];
for (let c = 0; c < 8; c++) ring.push(c);
for (let r = 1; r < 32; r++) ring.push(8 * r + 7);
for (let c = 6; c >= 0; c--) ring.push(31 * 8 + c);
for (let r = 30; r >= 1; r--) ring.push(8 * r);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);
assert.equal(ring.indexOf(192), 52);

const start = ring.indexOf(192);
const clockwise = ring.map((_, n) => ring[(start + n) % ring.length]);
const counterclockwise = ring.map((_, n) => ring[(start - n + ring.length) % ring.length]);
const forwardGlyphs = readEvents(clockwise);
const reverseGlyphs = readEvents(counterclockwise);
assert.equal(forwardGlyphs, "YOUAEOWNGAEAEAEHGNHMFLEFTEAOEEOMITRE");
assert.equal(reverseGlyphs, "YOUAERTIMEOOEEATFLEFHMNHGAEAEAEGNWEO");

const result = {
  sourceRunes: global,
  originalDoublets: repeats,
  literalZeroCells: [192, 229],
  zeroCellRepeats: { perimeter: readEvents([192]), interior: readEvents([229]) },
  directPointerWalk: pointed.indices,
  directPointerReadout: readEvents(pointed.indices),
  allPointerCycleLengths: cycles.map(x => x.length).sort((a, b) => a - b),
  perimeterClockwiseReadout: forwardGlyphs,
  perimeterCounterclockwiseReadout: reverseGlyphs,
  verdict: "No independently selected, intact plaintext continuation; no LP2 decipherment."
};
console.log(JSON.stringify(result, null, 2));
