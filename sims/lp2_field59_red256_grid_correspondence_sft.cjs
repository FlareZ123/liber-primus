'use strict';

/**
 * Test a single source-constrained correspondence between the 256 original
 * red-rune/13-dot events and the 256 printed two-digit table cells using
 * the unique order-29 subgroup of the multiplicative field F_59.
 *
 * Node 22 CommonJS; reads only canonical original-source derivatives.
 * The 59-field interpretation is a hypothesis, not a historical instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} filename */
const read = (filename) => JSON.parse(
  fs.readFileSync(path.join(ROOT, filename), 'utf8')
);
const corpus = read('lp2-corpus.json');
const ink = read('lp2-ink-annotations.json');
const grid = read('base60-grid.json');
const events = [];
for (const annotation of ink.pages) {
  const page = corpus.pages.find((p) => p.page === annotation.page);
  assert(page);
  for (const span of annotation.red_spans || []) {
    for (let i = 0; i < span.length; i++) {
      events.push({ page: page.page, position: span.start + i + 0.5,
        value: page.indices[span.start + i] });
    }
  }
  for (const [offset, size] of annotation.large_punctuation || []) {
    if (size === 13) {
      events.push({ page: page.page, position: offset, value: 29 });
    }
  }
}
events.sort((a, b) => a.page - b.page || a.position - b.position);
assert.equal(events.length, 256);
assert.equal(events.filter((e) => e.value < 29).length, 225);
assert.equal(events.filter((e) => e.value === 29).length, 31);
assert.deepEqual(events.slice(0, 13).map((e) => e.value),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);

const cells = grid.byte_rows.flat();
assert.equal(cells.length, 256);
assert.equal(grid.rows.length, 32);
const exponent = new Map();
let power = 1;
for (let j = 0; j < 58; j++) {
  assert(!exponent.has(power));
  exponent.set(power, j);
  power = power * 2 % 59;
}
assert.equal(power, 1);
assert.equal(exponent.size, 58);
assert.equal(exponent.get(58), 29);
const projected = cells.map((byte) => {
  const residue = byte % 59;
  return residue === 0 ? null : (exponent.get(residue) % 29) * 15 % 29;
});
const zeros = projected.map((v, i) => v === null ? i : -1).filter((i) => i >= 0);
assert.deepEqual(zeros, [22, 51, 57, 75, 92, 192, 219, 229]);

let markZero = 0;
let runeZero = 0;
let matched = 0;
let comparable = 0;
for (let i = 0; i < 256; i++) {
  const sourceValue = events[i].value;
  const recovered = projected[i];
  if (sourceValue === 29) {
    if (recovered === null) markZero++;
  } else if (recovered === null) {
    runeZero++;
  } else {
    comparable++;
    if (recovered === sourceValue) matched++;
  }
}
assert.deepEqual({ markZero, runeZero, comparable, matched },
  { markZero: 2, runeZero: 6, comparable: 219, matched: 8 });

// A post-hoc ceiling over all affine label changes, NOT a sourced key search.
let best = { matched: -1, a: 0, b: 0 };
for (let a = 1; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    let hit = 0;
    for (let i = 0; i < 256; i++) {
      if (events[i].value < 29 && projected[i] !== null &&
          (a * projected[i] + b) % 29 === events[i].value) hit++;
    }
    if (hit > best.matched) best = { matched: hit, a, b };
  }
}
assert.deepEqual(best, { matched: 18, a: 23, b: 7 });

// Full 256-symbol positive: a field element is +/-4^r for each red
// rune r, and zero for each 13-dot mark. The sign bit is free.
let testPower = 1;
const squares = [1];
for (let i = 1; i < 29; i++) {
  testPower = testPower * 4 % 59;
  squares.push(testPower);
}
assert.equal(testPower * 4 % 59, 1);
assert.equal(new Set(squares).size, 29);
const plant = events.map((event, i) => event.value === 29 ? 0 :
  (i % 2 ? 59 - squares[event.value] : squares[event.value]));
const recoveredPlant = plant.map((x) => x === 0 ? 29 : (exponent.get(x) % 29) * 15 % 29);
assert.deepEqual(recoveredPlant, events.map((e) => e.value));

console.log(JSON.stringify({
  input: '256 original printed cells and 225 red rune + 31 thirteen-dot events',
  arithmetic: '2 primitive mod59, coset map +/-4^r for r in GP29',
  zeros, zeroOnActualMarks: markZero, zeroOnActualRunes: runeZero,
  exactRuneMatches: matched, comparableRunes: comparable,
  bestPostHocAffine: best, planted256Exact: true,
  result: 'Direct matched-order F59/GP29 transcription rejected; no LP2 plaintext or key'
}, null, 2));
