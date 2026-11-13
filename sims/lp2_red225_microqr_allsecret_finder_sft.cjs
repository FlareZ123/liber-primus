"use strict";

/**
 * Original LP2 red-rune 15x15 Micro QR M3 finder gate.
 *
 * Run: node sims/lp2_red225_microqr_allsecret_finder_sft.cjs
 *
 * This is a necessary-condition test only. It does not assert that the book
 * encodes QR, infer plaintext, or alter any source runes.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const annotations = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));

/**
 * @typedef {{page:number,offset:number,gp:number,rune:string}} Entry
 * @typedef {{mask:bigint,rhs:number,row:number,col:number,entry:Entry}} Equation
 */

/** @returns {Entry[]} */
function originalRed() {
  const lookup = new Map(corpus.runes.map((rune, index) => [rune, index]));
  /** @type {Entry[]} */
  const collected = [];
  let spans = 0;
  for (const page of annotations.pages) {
    assert.equal(corpus.pages[page.page].runic_count, page.rune_count);
    for (const span of page.red_spans || []) {
      spans++;
      const letters = Array.from(span.runes);
      assert.equal(letters.length, span.length);
      const indices = letters.map((rune) => {
        assert.ok(lookup.has(rune));
        return lookup.get(rune);
      });
      assert.deepEqual(indices,
        corpus.pages[page.page].indices.slice(span.start, span.start + span.length));
      indices.forEach((gp, i) => collected.push({
        page: page.page, offset: span.start + i, gp, rune: letters[i]
      }));
    }
  }
  assert.equal(spans, 18);
  assert.equal(collected.length, annotations.counts.red);
  assert.equal(collected.length, 225);
  assert.equal(new Set(collected.map((x) => x.gp)).size, 29);
  return collected;
}

const SIZE = 15;
const finderOrigins = [[0, 0], [0, 8], [8, 0], [8, 8]];

/** @param {number} row @param {number} col @returns {number} */
function finderBit(row, col) {
  return Number(row === 0 || col === 0 || row === 6 || col === 6 ||
    (row >= 2 && row <= 4 && col >= 2 && col <= 4));
}

/**
 * @param {Entry[]} red Original 225 red runes or planted 225 synthetic entries.
 * @param {number} top
 * @param {number} left
 * @param {boolean} rowColumnMask
 * @returns {Equation[]}
 */
function finderEquations(red, top, left, rowColumnMask) {
  /** @type {Equation[]} */
  const equations = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const row = top + r;
      const col = left + c;
      const entry = red[row * SIZE + col];
      let mask = 1n << BigInt(entry.gp);
      if (rowColumnMask) {
        mask ^= 1n << BigInt(29 + row);
        mask ^= 1n << BigInt(44 + col);
      }
      equations.push({mask, rhs: finderBit(r, c), row, col, entry});
    }
  }
  return equations;
}

/**
 * Exact GF(2) equation solver, retaining each contradiction's XOR certificate.
 * @param {Equation[]} equations
 * @param {number} dimension 29 rune bits or 29+15+15 secret rune/row/column bits.
 * @returns {{possible:boolean, rank:number, conflicting:number[]}}
 */
function solve(equations, dimension) {
  /** @type {(null|{mask:bigint,rhs:number,certificate:bigint})[]} */
  const pivots = Array(dimension).fill(null);
  let rank = 0;
  for (let q = 0; q < equations.length; q++) {
    let mask = equations[q].mask;
    let rhs = equations[q].rhs;
    let certificate = 1n << BigInt(q);
    let installed = false;
    for (let bit = dimension - 1; bit >= 0; bit--) {
      if (((mask >> BigInt(bit)) & 1n) === 0n) continue;
      const pivot = pivots[bit];
      if (pivot === null) {
        pivots[bit] = {mask, rhs, certificate};
        installed = true;
        rank++;
        break;
      }
      mask ^= pivot.mask;
      rhs ^= pivot.rhs;
      certificate ^= pivot.certificate;
    }
    if (!installed && rhs !== 0) {
      const conflicting = [];
      for (let i = 0; i < equations.length; i++) {
        if (((certificate >> BigInt(i)) & 1n) !== 0n) conflicting.push(i);
      }
      assert.ok(conflicting.length > 0);
      return {possible: false, rank, conflicting};
    }
  }
  return {possible: true, rank, conflicting: []};
}

/**
 * Remove superfluous equations from an unsatisfiable XOR certificate.
 * @param {Equation[]} equations
 * @param {number} dimension
 * @param {number[]} conflicting
 * @returns {Equation[]}
 */
function minimalContradiction(equations, dimension, conflicting) {
  let indices = conflicting.slice();
  for (const skip of conflicting) {
    const reduced = indices.filter((i) => i !== skip);
    if (!solve(reduced.map((i) => equations[i]), dimension).possible) {
      indices = reduced;
    }
  }
  const witness = indices.map((i) => equations[i]);
  // An XOR certificate is independently checkable: every secret variable
  // occurs an even number of times while the fixed target bits XOR to one.
  const variableMask = witness.reduce((m, e) => m ^ e.mask, 0n);
  const bit = witness.reduce((b, e) => b ^ e.rhs, 0);
  assert.equal(variableMask, 0n);
  assert.equal(bit, 1);
  return witness;
}

/** @param {Entry[]} red @param {boolean} rowColumnMask */
function evaluate(red, rowColumnMask) {
  const dimension = rowColumnMask ? 59 : 29;
  const out = [];
  for (const [top, left] of finderOrigins) {
    const equations = finderEquations(red, top, left, rowColumnMask);
    const result = solve(equations, dimension);
    const witness = result.possible ? [] :
      minimalContradiction(equations, dimension, result.conflicting);
    out.push({top, left, possible: result.possible, rank: result.rank, witness});
  }
  return out;
}

/** @param {number} n */
function samplePlant(n) {
  const synthetic = Array.from({length: SIZE * SIZE}, (_, i) => ({
    gp: 0, rune: corpus.runes[0], page: -1, offset: i
  }));
  const [top, left] = finderOrigins[n];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const position = (top + row) * SIZE + left + col;
      const gp = finderBit(row, col);
      synthetic[position].gp = gp;
      synthetic[position].rune = corpus.runes[gp];
    }
  }
  return synthetic;
}

function main() {
  const original = originalRed();
  const expected = new Map([
    ["0,0", [2, 8]],
    ["0,8", [2, 8]],
    ["8,0", [2, 8]],
    ["8,8", [2, 6]]
  ]);
  const direct = evaluate(original, false);
  const flexible = evaluate(original, true);
  for (let i = 0; i < 4; i++) {
    const d = direct[i];
    const f = flexible[i];
    const label = `${d.top},${d.left}`;
    const [simpleSize, flexibleSize] = expected.get(label);
    assert.equal(d.possible, false);
    assert.equal(f.possible, false);
    assert.equal(d.witness.length, simpleSize);
    assert.equal(f.witness.length, flexibleSize);
    console.log(`finder at [${label}], rune-only contradictory cells=${d.witness.length}, ` +
      `rune+row+column contradictory cells=${f.witness.length}`);
    console.log("  GF2 core:", f.witness.map((e) =>
      `(${e.row},${e.col}):${corpus.translit[e.entry.gp]}/${e.rhs}`).join(" "));
    // Check every corner under a natural synthetic Micro QR finder.
    const plant = samplePlant(i);
    assert.equal(solve(finderEquations(plant, d.top, d.left, false), 29).possible, true);
    assert.equal(solve(finderEquations(plant, d.top, d.left, true), 59).possible, true);
  }
  // The 15x15 original reading has no other corner for the required M3 finder.
  // All 8 rigid rotations/reflections reduce to these four corner cases,
  // since the 7x7 finder itself is symmetric under the dihedral group.
  console.log("PASS: 225 original red runes, all four Micro QR M3 corner placements impossible");
  console.log("PASS: all 8 synthetic finder controls accepted");
}

main();
