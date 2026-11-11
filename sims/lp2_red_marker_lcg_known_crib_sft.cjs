"use strict";

/**
 * LP2 red-marker known-plaintext test against all one-byte affine LCG streams.
 * Original source input only, all hidden marker bytes and multipliers searched.
 * SFT: node sims/lp2_red_marker_lcg_known_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const annotations = read("resources/liber-primus/lp2-ink-annotations.json");
const table = read("resources/liber-primus/base60-grid.json").byte_rows.flat();

const events = [];
for (const p of annotations.pages) {
  for (const span of p.red_spans || []) {
    assert.equal([...span.runes].length, span.length);
    for (let j = 0; j < span.length; j++)
      events.push({page: p.page, time: 2 * (span.start + j) + 1, kind: "rune"});
  }
  for (const [at, dots, color] of p.large_punctuation || [])
    if (dots === 13)
      events.push({page: p.page, time: 2 * at, kind: "mark", color});
}
events.sort((a, b) => a.page - b.page || a.time - b.time);

assert.equal(corpus.pages.reduce((n, p) => n + p.indices.length, 0), 13136);
assert.equal(table.length, 256);
assert.equal(events.length, 256);
assert.equal(events.filter(e => e.kind === "rune").length, 225);
const red = events.flatMap((e, i) =>
  e.kind === "mark" && e.color === "red" ? [i] : []);
const black = events.flatMap((e, i) =>
  e.kind === "mark" && e.color === "black" ? [i] : []);
assert.equal(red.length, 30);
assert.deepEqual(black, [50]);
assert.equal(red.includes(51), true);

const firstPair = red.find(i => red.includes(i + 1));
assert.equal(firstPair, 13);

/**
 * A one-byte stationary keystream satisfies s[i+1] = A*s[i]+B mod 256.
 * The unknown red-marker plaintext byte m is searched exhaustively.
 * Two consecutive known red-marker observations solve B for each (m,A),
 * regardless of the unknown preceding seed.
 *
 * @param {number[]} output Exact 256 source table bytes.
 * @param {"xor"|"add"} mode Ciphertext combines marker m and state.
 * @param {boolean} swap Same-position black/red p7 ink-order alternative.
 * @returns {{best:{matches:number,marker:number,multiplier:number,increment:number},perfect:number}}
 */
function score(output, mode, swap) {
  const redAt = new Uint8Array(256);
  for (const i of red) redAt[i] = 1;
  if (swap) {
    redAt[50] = 1;
    redAt[51] = 0;
  }
  let best = {matches: 0, marker: 0, multiplier: 0, increment: 0};
  let perfect = 0;

  for (let marker = 0; marker < 256; marker++) {
    const stateFromByte = i => mode === "xor"
      ? output[i] ^ marker : (output[i] - marker) & 255;
    const x = stateFromByte(firstPair);
    const y = stateFromByte(firstPair + 1);

    for (let multiplier = 0; multiplier < 256; multiplier++) {
      const increment = (y - multiplier * x) & 255;
      let state = y;
      let matches = 2;
      for (let i = firstPair + 2; i < 256; i++) {
        state = (multiplier * state + increment) & 255;
        if (redAt[i] && state === stateFromByte(i)) matches++;
      }
      if (matches > best.matches)
        best = {matches, marker, multiplier, increment};
      if (matches === 30) perfect++;
    }
  }
  return {best, perfect};
}

/** Positive control retains nonmarker bytes as independent original bytes. */
function plant(mode, swap) {
  const result = table.slice();
  const redAt = new Uint8Array(256);
  for (const i of red) redAt[i] = 1;
  if (swap) {
    redAt[50] = 1;
    redAt[51] = 0;
  }
  const marker = 29, multiplier = 13, increment = 31;
  let state = 47;
  for (let i = 0; i < 256; i++) {
    if (redAt[i]) result[i] = mode === "xor"
      ? state ^ marker : (state + marker) & 255;
    state = (state * multiplier + increment) & 255;
  }
  return result;
}

for (const swap of [false, true]) {
  for (const mode of ["xor", "add"]) {
    const original = score(table, mode, swap);
    const planted = score(plant(mode, swap), mode, swap);
    assert.equal(original.perfect, 0);
    assert.equal(original.best.matches, mode === "xor" ? 4 : 3);
    assert.equal(planted.best.matches, 30);
    assert(planted.perfect >= 1);
    console.log(JSON.stringify({swap, mode, original, planted}));
  }
}
console.log("PASS: 4 original all-secret 65,536-model gates, 4 genuine-key plants");
