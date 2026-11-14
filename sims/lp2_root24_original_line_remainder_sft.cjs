"use strict";
/**
 * Printed-line GF(29) root-24 remainder channel.
 * Read-only Windows Node.js 22 single runnable file. No external packages.
 * Uses original LP2 page/rune order and derivative slash-delimited physical lines.
 * The proposed root is fixed by the independently noticed p39/grid/p40/p54
 * field observation before testing any of these line-level readouts.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/lp2-transcription.txt"), "utf8");
const symbols = new Map(corpus.runes.map((rune, index) => [rune, index]));
const physicalPages = transcription.trim().split(/\n%\n/);
assert.equal(physicalPages.length, 57);
physicalPages.splice(50, 0, "");
assert.equal(physicalPages.length, 58);
/** @param {number[]} coefficients @param {number} x */
function horner(coefficients, x) {
  let value = 0;
  for (const index of coefficients) value = (value * x + index) % 29;
  return value;
}
/** @param {number[]} indices */
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (indices.length * (indices.length - 1));
}
const lines = [];
for (let p = 0; p < 58; p++) {
  const localLines = physicalPages[p].split("/").map(text =>
    [...text].map(rune => symbols.get(rune)).filter(x => x !== undefined)
  ).filter(indices => indices.length > 0);
  assert.deepEqual(localLines.flat(), corpus.pages[p].indices,
    "Physical-page runes must agree exactly with source corpus p" + p);
  if (p > 55) continue;
  for (let l = 0; l < localLines.length; l++) {
    const indices = localLines[l];
    assert.ok(indices.length >= 3);
    lines.push({ page: p, line: l, indices,
      residue: horner(indices, 24) });
  }
}
assert.equal(lines.length, 594);
assert.equal(lines.reduce((sum, entry) => sum + entry.indices.length, 0), 12956);
const residues = lines.map(entry => entry.residue);
const zero = lines.filter(entry => entry.residue === 0);
assert.equal(zero.length, 19);
assert(Math.abs(ioc(residues) - 0.03423782513158567) < 1e-12);
const countsByRoot = Array.from({ length: 29 }, (_, r) =>
  lines.filter(entry => horner(entry.indices, r) === 0).length);
assert.equal(countsByRoot[23], 33);
assert.equal(countsByRoot[24], 19);
// Demonstrate that the proposed channel is responsive: a properly chosen
// last rune can force any arbitrary residue without changing line length.
const control = lines.slice(0, 20);
for (let target = 0; target < 29; target++) {
  for (const { indices } of control) {
    const plant = indices.slice();
    const prefix = horner(plant.slice(0, -1), 24);
    plant[plant.length - 1] = (target - prefix + 29) % 29;
    assert.equal(horner(plant, 24), target);
  }
}
console.log(JSON.stringify({
  source: "original LP2 p0-55 slash-delimited physical lines",
  mechanism: "Horner GF29 polynomial evaluated at fixed x=24",
  runeCount: 12956, lineCount: lines.length,
  zeroResidues: zero.length,
  iidUniformExpectedZeros: lines.length / 29,
  residueIoC: ioc(residues),
  nativeEnglishLikeIoC: false,
  rootHitCounts: countsByRoot,
  zeroLocations: zero.map(entry => [entry.page, entry.line]),
  first90RemainderRunes: residues.slice(0, 90).map(index =>
    corpus.translit[index]).join(" "),
  positiveLastRunePlants: "20 lines x 29 residues exact",
  verdict: "No line-parity checksum excess or plaintext-bearing direct remainder channel; no deciphered unknown text."
}, null, 2));