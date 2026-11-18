#!/usr/bin/env node
"use strict";

/** Original-source SFT for the corrected T7 50x33 window claim. Windows Node22 CJS. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.slice(0, 56);
const source = pages.flatMap(p => p.indices);
assert.equal(pages.length, 56);
assert.equal(source.length, 12956);
const equals = [];
for (let i = 1; i < source.length; i++) {
  if (source[i] === source[i - 1]) equals.push(i);
}
assert.equal(equals.length, 86);
const L = 1650;
const start = 2739;
const inside = equals.filter(i => i > start && i < start + L);
assert.deepEqual(inside, [2740, 3140, 3852]);
assert.deepEqual(inside.map(i => corpus.translit[source[i]]), ["U", "AE", "G"]);
const candidates = [];
let bestStart = 0;
let bestLength = 0;
for (let i = 0; i <= equals.length; i++) {
  const lo = i === 0 ? 0 : equals[i - 1];
  const hi = i === equals.length ? source.length : equals[i];
  const len = hi - lo;
  candidates.push({start: lo, endExclusive: hi, length: len});
  if (len > bestLength) {
    bestStart = lo;
    bestLength = len;
  }
}
assert.equal(bestStart, 3140);
assert.equal(bestLength, 712);
const prefix = [0];
for (let i = 0; i < source.length; i++) {
  prefix.push(prefix[i] + (i > 0 && source[i] === source[i - 1] ? 1 : 0));
}
let minimum = Infinity;
const ties = [];
for (let i = 0; i + L <= source.length; i++) {
  const count = prefix[i + L] - prefix[i + 1];
  if (count < minimum) {
    minimum = count;
    ties.length = 0;
    ties.push(i);
  } else if (count === minimum) {
    ties.push(i);
  }
}
assert.equal(minimum, 3);
assert.equal(ties.length, 351);
assert.equal(ties[0], 2580);
assert.equal(ties[ties.length - 1], 2930);
assert.ok(ties.includes(2739));
console.log(JSON.stringify({
  sourceRunes: source.length,
  allAdjacentEqual: equals.length,
  disputedWindow: {start, endExclusive: start + L, runes: L, internalAdjacentEqual: inside},
  longestTrueNoEqual: {start: bestStart, endExclusive: bestStart + bestLength, runes: bestLength},
  allLength1650Windows: source.length - L + 1,
  minimumEqual: minimum,
  tiedMinima: {count: ties.length, firstStart: ties[0], lastStart: ties[ties.length - 1]}
}, null, 2));
