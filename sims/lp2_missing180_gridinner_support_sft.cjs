"use strict";

/**
 * Original-source 2013 missing-prime 180 ↔ LP2 numerical-grid 30×6
 * interior gate. No fitted order, hidden alphabet or key search.
 *
 * Run from any directory: node sims/lp2_missing180_gridinner_support_sft.cjs
 * Requires Node.js 22 and standard library only. Reads no network data.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const p = [];
  for (let n = 2; p.length < count; n++) {
    if (p.every(q => q * q > n || n % q !== 0)) p.push(n);
  }
  return p;
}

/** @param {number[]} data @returns {number[]} */
function counts29(data) {
  const out = Array(29).fill(0);
  for (const value of data) out[value % 29]++;
  return out;
}

/**
 * Exact minimum symbol changes between equally long multisets after any
 * stationary alphabet bijection AND any position permutation.
 * @param {number[]} lhs
 * @param {number[]} rhs
 * @returns {number}
 */
function minEditsWithFreeAlphabetAndPositions(lhs, rhs) {
  assert.equal(lhs.length, rhs.length);
  const a = counts29(lhs).sort((x, y) => x - y);
  const b = counts29(rhs).sort((x, y) => x - y);
  return a.reduce((sum, n, i) => sum + Math.abs(n - b[i]), 0) / 2;
}

/** @param {number[]} data @returns {number} */
function distinct(data) {
  return counts29(data).filter(n => n > 0).length;
}

const file = path.join(__dirname, "..", "resources", "liber-primus", "base60-grid.json");
const grid = JSON.parse(fs.readFileSync(file, "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const rows = grid.byte_rows;
// Conditional F-skipping base59 interpretation of the same original tokens.
const alphabet59 = grid.alphabet.replace("f", "");
assert.equal(grid.alphabet.length, 60);
assert.equal(alphabet59.length, 59);
const rows59 = grid.rows.map(r => r.map(token => {
  assert.equal(token.length, 2);
  const a = alphabet59.indexOf(token[0]);
  const b = alphabet59.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  const value = 59 * a + b;
  assert.ok(value <= 255);
  return value;
}));
assert.equal(rows.length, 32);
assert.ok(rows.every(r => r.length === 8 && r.every(v => Number.isInteger(v) && v >= 0 && v <= 255)));
const bytes = rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const inner = rows.slice(1, 31).flatMap(r => r.slice(1, 7));
const outer = rows.flatMap((r, i) => r.filter((_, j) => i === 0 || i === 31 || j === 0 || j === 7));
assert.equal(inner.length, 180);
assert.equal(outer.length, 76);
const inner59 = rows59.slice(1,31).flatMap(r => r.slice(1,7));
const outer59 = rows59.flatMap((r,i) => r.filter((_,j) => i===0 || i===31 || j===0 || j===7));
assert.equal(inner59.length, 180);
assert.equal(outer59.length, 76);
const p55 = corpus.pages.find(p => p.page === 55).indices;
const terminal180 = corpus.pages.find(p=>p.page===56).indices.concat(corpus.pages.find(p=>p.page===57).indices);
assert.equal(terminal180.length, 180);
assert.equal(p55.length, 76);
const historicalPrimeOrdinalRange = firstPrimes(200).slice(20, 200);
assert.equal(historicalPrimeOrdinalRange.length, 180);
assert.equal(historicalPrimeOrdinalRange[0], 73);
assert.equal(historicalPrimeOrdinalRange[179], 1223);
const primeResidues = historicalPrimeOrdinalRange.map(v => v % 29);
const innerResidues = inner.map(v => v % 29);
const outerResidues = outer.map(v => v % 29);
assert.equal(distinct(primeResidues), 28);
assert.equal(distinct(innerResidues), 29);
assert.equal(primeResidues.filter(v => v === 0).length, 0);
assert.equal(innerResidues.filter(v => v === 0).length, 4);
assert.equal(distinct(outerResidues), 24);
assert.equal(distinct(terminal180), 29);
assert.equal(distinct(inner59), 29);
assert.equal(distinct(outer59), 27);
assert.equal(distinct(p55), 25);

// Key-independent necessary condition: a stationary function f(29 residues)
// cannot emit more distinct symbols than it receives, even when all 180
// positions are permuted, and even if f is non-injective.
const positive = primeResidues.map(v => (7 * v + 3) % 29).reverse();
assert.equal(distinct(positive), 28);
assert.ok(distinct(innerResidues) > distinct(primeResidues));
const ringPositive = outerResidues.map(v => (3 * v + 5) % 29).reverse();
assert.equal(distinct(ringPositive), 24);
assert.ok(distinct(p55) > distinct(outerResidues));
assert.equal(minEditsWithFreeAlphabetAndPositions(primeResidues, innerResidues), 20);
assert.equal(minEditsWithFreeAlphabetAndPositions(primeResidues, terminal180), 29);
assert.equal(minEditsWithFreeAlphabetAndPositions(primeResidues, inner59), 17);
assert.equal(minEditsWithFreeAlphabetAndPositions(outerResidues, p55), 4);
assert.equal(minEditsWithFreeAlphabetAndPositions(outer59, p55), 6);
console.log(JSON.stringify({
  source: "2013 prime_echo omission and LP2 pp49-51 original 32x8 base60 grid",
  candidate: "180 omitted prime residues mapped to 30x6 grid interior under one arbitrary stationary 29-symbol substitution",
  originalPrimeOrdinalRange: [21, 200],
  originalPrimeValueRange: [73, 1223],
  primeResidueDistinct: distinct(primeResidues),
  tableInnerResidueDistinct: distinct(innerResidues),
  interiorZeroResidues: innerResidues.filter(v => v === 0).length,
  originalPrimeZeroResidues: primeResidues.filter(v => v === 0).length,
  sourceConstrainedMinEditsWithAnyAlphabetAndOrder: {
    interiorBase60: minEditsWithFreeAlphabetAndPositions(primeResidues, innerResidues),
    interiorBase59: minEditsWithFreeAlphabetAndPositions(primeResidues, inner59),
    perimeterBase60: minEditsWithFreeAlphabetAndPositions(outerResidues, p55),
    perimeterBase59: minEditsWithFreeAlphabetAndPositions(outer59, p55)
  },
  tableOuterResidueDistinct: distinct(outerResidues),
  terminalPrintedP56P57Distinct: distinct(terminal180),
  primeToTerminal180AllAlphabetMinEdits: minEditsWithFreeAlphabetAndPositions(primeResidues,terminal180),
  p55CiphertextDistinct: distinct(p55),
  base59InteriorDistinct: distinct(inner59),
  base59PerimeterDistinct: distinct(outer59),
  tableOuterResidueCounts: counts29(outerResidues),
  p55CiphertextCounts: counts29(p55),
  primeResidueCounts: counts29(primeResidues),
  tableInteriorResidueCounts: counts29(innerResidues),
  conclusion: "For both base60 and F-skip base59, no fixed 29-symbol bijection can match either original source partition; the directional arbitrary-function exclusion also holds for the 180-prime to interior route under both and for the perimeter to p55 route under base60 only",
  classification: "bounded source-motivated negative; not recovered plaintext or an original instruction",
  status: "PASS"
}, null, 2));
