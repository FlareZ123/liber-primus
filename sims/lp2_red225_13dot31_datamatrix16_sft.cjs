"use strict";

/**
 * Original 225 red runes + 31 thirteen-dot markers versus 16x16 ECC200.
 * The 31 dots are hypothetically a solid L-shaped Data Matrix finder;
 * 225 red runes occupy all other cells. Check only the 29 mandatory
 * alternating timing modules under every fixed secret GP29-to-bit map.
 * Run: node sims/lp2_red225_13dot31_datamatrix16_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = "resources/liber-primus/";
const corpus = JSON.parse(fs.readFileSync(path + "lp2-corpus.json", "utf8"));
const ink = JSON.parse(fs.readFileSync(path + "lp2-ink-annotations.json", "utf8"));

const red = [];
for (const entry of ink.pages) {
  for (const span of entry.red_spans || []) {
    const chars = Array.from(span.runes);
    assert.equal(chars.length, span.length);
    for (let i = 0; i < chars.length; i++) {
      const id = corpus.runes.indexOf(chars[i]);
      assert.ok(id >= 0);
      assert.equal(corpus.pages[entry.page].indices[span.start + i], id);
      red.push(id);
    }
  }
}
assert.equal(ink.counts.red, 225);
assert.equal(ink.counts.red13 + ink.counts.black13, 31);
assert.equal(red.length, 225);
assert.equal(corpus.runes.length, 29);

/**
 * Red-only 15x15 square, addressed using y=0..14, x=0..14.
 * Embedding at full ECC200 (y, x+1) leaves the original 31 finder
 * marker cells on x=0 and y=15. Top/right timing constraints remain.
 * @param {number[][]} square
 */
function timingConstraints(square) {
  const sample = [];
  for (let x = 0; x < 15; x++) {
    const physicalX = x + 1;
    sample.push({id:square[0][x], bit:physicalX % 2 === 0 ? 1 : 0});
  }
  for (let y = 1; y < 15; y++) {
    sample.push({id:square[y][14], bit:y % 2});
  }
  assert.equal(sample.length, 29);
  return sample;
}

/**
 * Exact min(errors) across all 2^29 unknown single-rune output alphabets.
 * For each rune label, selecting its majority required bit minimizes errors.
 * @param {{id:number,bit:number}[]} sample
 */
function minSecretBitMapErrors(sample) {
  const seen = Array.from({length:29}, () => [0, 0]);
  for (const item of sample) {
    assert.ok(item.id >= 0 && item.id < 29);
    seen[item.id][item.bit]++;
  }
  return seen.reduce((sum, pair) => sum + Math.min(pair[0], pair[1]), 0);
}

/**
 * @param {number[]} seq
 * @param {"row"|"row-snake"|"col"|"col-snake"|"spiral"} route
 */
function putInSquare(seq, route) {
  assert.equal(seq.length, 225);
  const square = Array.from({length:15}, () => Array(15).fill(null));
  if (route === "spiral") {
    // Fixed on-page p15 inspiration: begin centre, right/down/left/up,
    // with 1,1,2,2,3,3,... step lengths (the p15 4x4 spiral heading).
    const dirs = [[0,1], [1,0], [0,-1], [-1,0]];
    let y = 7, x = 7, done = 0;
    let segment = 1;
    square[y][x] = seq[done++];
    while (done < 225) {
      for (let d = 0; d < 4 && done < 225; d++) {
        for (let j = 0; j < segment && done < 225; j++) {
          y += dirs[d][0];
          x += dirs[d][1];
          if (y >= 0 && y < 15 && x >= 0 && x < 15) {
            assert.equal(square[y][x], null);
            square[y][x] = seq[done++];
          }
        }
        if (d % 2 === 1) segment++;
      }
    }
  } else {
    for (let i = 0; i < 225; i++) {
      let y, x;
      if (route.startsWith("row")) {
        y = Math.floor(i / 15); x = i % 15;
        if (route.endsWith("snake") && y % 2) x = 14 - x;
      } else {
        x = Math.floor(i / 15); y = i % 15;
        if (route.endsWith("snake") && x % 2) y = 14 - y;
      }
      assert.equal(square[y][x], null);
      square[y][x] = seq[i];
    }
  }
  assert.ok(square.every((row) => row.every((v) => Number.isInteger(v))));
  return square;
}

// Only the source-anchored reading orders, not a fitted secret bit map.
const routes = ["row", "row-snake", "col", "col-snake", "spiral"];
const observed = [];
for (const route of routes) {
  for (const reverse of [false, true]) {
    const source = reverse ? [...red].reverse() : red;
    const sample = timingConstraints(putInSquare(source, route));
    observed.push({
      route, reverse,
      minSecretErrors: minSecretBitMapErrors(sample),
      directIndexParityErrors: sample.reduce(
        (sum, item) => sum + ((item.id % 2) === item.bit ? 0 : 1), 0
      )
    });
  }
}
assert.deepEqual(observed.map((x) => x.minSecretErrors), [5,6,4,6,6,5,6,4,7,3]);
assert.ok(observed.every((x) => x.minSecretErrors > 0));
assert.ok(observed.every((x) => x.directIndexParityErrors >= 16));

// Source-format positive: synthesize all 225 non-finder modules with
// two GP rune symbols, forcing every timing module correctly.
// A wrong-source single-symbol corruption is detected separately.
const square = Array.from({length:15}, () => Array(15).fill(2));
for (let x = 0; x < 15; x++) square[0][x] = ((x + 1) % 2 === 0) ? 1 : 0;
for (let y = 1; y < 15; y++) square[y][14] = y % 2;
const control = timingConstraints(square);
assert.equal(minSecretBitMapErrors(control), 0);
assert.equal(control.reduce(
  (sum, item) => sum + ((item.id % 2) === item.bit ? 0 : 1), 0
), 0);
const broken = control.map((item) => ({...item}));
broken[0].id = broken[0].id ? 0 : 1;
assert.equal(minSecretBitMapErrors(broken), 1);

console.log("PASS source 225 red rune + 31 13-dot marker census");
console.log("PASS full 16x16 L-finder placement and all 29 timing requirements");
console.log("PASS positive native-shaped 225-rune timing plant and corruption");
console.log("Original exact all-secret timing lower bounds:", JSON.stringify(observed));
console.log("None permits a static, source-order GP29-to-bit ECC200 codeword.");
