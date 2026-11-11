"use strict";

/**
 * Source-locked direct GF(29) syndrome bridge from the 32 printed grid rows
 * to the 32 original thirteen-dot-delimited LP2 rune fragments.
 *
 * H: signed 2013 BASE29 3301 -> 3QO (ascending digits 3,26,24).
 * G: original p39 red runes (ascending indices 27,5,15).
 * F: their product. Check that exact aligned row/fragment syndromes match.
 *
 * This intentionally does not search row shifts, remap states, or fit keys.
 * Reproduce: node sims/lp2_dualfactor_gridrow_fragment_syndrome_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} relativePath @returns {any} */
function source(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", relativePath), "utf8"));
}
const corpus = source("resources/liber-primus/lp2-corpus.json");
const ink = source("resources/liber-primus/lp2-ink-annotations.json");
const grid = source("resources/liber-primus/lp2-grid-256.json");

const bytes = grid.bytes;
assert.equal(bytes.length, 256);
const rows = Array.from({length:32}, (_, i) => bytes.slice(8*i, 8*i+8));
assert.ok(rows.every(row => row.length === 8));
const offsets = new Map();
let cursor = 0;
for (const page of corpus.pages) {
  offsets.set(page.page, cursor);
  cursor += page.indices.length;
}
const ciphertext = corpus.pages.flatMap(page => page.indices);
assert.equal(ciphertext.length, 13136);
const marks = ink.pages.flatMap(page => (page.large_punctuation || [])
  .filter(entry => entry[1] === 13)
  .map(entry => {
    const pageOffset = offsets.get(page.page);
    assert.notEqual(pageOffset, undefined);
    return pageOffset + entry[0];
  })).sort((a,b) => a-b);
assert.equal(marks.length, 31);
const boundaries = [0, ...marks, ciphertext.length];
const fragments = boundaries.slice(1).map((end, i) =>
  ciphertext.slice(boundaries[i], end));
assert.equal(fragments.length, 32);
assert.deepEqual(
  fragments.flatMap((part,i) => part.length === 0 ? [i] : []), [8,11]);

const MOD = 29;
/** @param {number} x */
const mod = x => (x % MOD + MOD) % MOD;
const H = [24,26,3]; // Descending coefficient order: signed 3QO example.
const G = [15,5,27]; // Descending coefficient order: original p39 triad.
const F = [12,17,11,21,23]; // H*G; independently known source factor.

/**
 * Remainder of descending-order polynomial over GF(29).
 * Empty fragments represent zero, and are never silently discarded.
 * @param {number[]} values
 * @param {number[]} factor
 * @returns {number[]}
 */
function remainder(values, factor) {
  const a = values.map(mod);
  let inverse = 0;
  for (let k=1;k<MOD;k++) if (mod(k*factor[0])===1) inverse=k;
  assert.notEqual(inverse, 0);
  if (a.length < factor.length) {
    return [...Array(factor.length-1-a.length).fill(0), ...a];
  }
  for (let i=0;i<=a.length-factor.length;i++) {
    const q = mod(a[i]*inverse);
    for (let j=0;j<factor.length;j++) a[i+j]=mod(a[i+j]-q*factor[j]);
  }
  return a.slice(1-factor.length);
}

for (const factor of [H,G,F])
  assert.ok(remainder(bytes,factor).every(value => value===0),
    "authentic complete 256-byte table must carry both fixed checks");
const factors = {H,G,F};
const matches = {};
for (const [name,factor] of Object.entries(factors)) {
  const matched = [];
  for (let i=0;i<32;i++) {
    const tableSyndrome = remainder(rows[i],factor);
    const fragmentSyndrome = remainder(fragments[i],factor);
    if (tableSyndrome.every((value,j)=>value===fragmentSyndrome[j]))
      matched.push(i);
  }
  matches[name]=matched;
}
assert.deepEqual(matches,{H:[],G:[],F:[]},
  "one-to-one original table-row and marked-fragment syndromes do not agree");

// Fixed positive control: two identical source-row codewords necessarily
// have identical syndromes. A cyclic wrong-row control discriminates them.
for (const factor of [H,G,F]) {
  for (let i=0;i<32;i++)
    assert.deepEqual(remainder(rows[i].map(mod),factor),
      remainder(rows[i],factor));
  const wrong = rows.filter((row,i)=>
    remainder(row,factor).every((v,j)=>v===remainder(rows[(i+1)%32],factor)[j]));
  assert.equal(wrong.length,0,"cyclic row mispairing should fail exact syndrome identity");
}
// The terminal unsolved-plus-solved three-page bookend is also exactly
// 256 GP29 runes: p55 (76), p56 (85), p57 (95), independently source-sized
// like the numeric 256-byte table. It does not carry the table checks.
const terminal = corpus.pages.filter(page => page.page >= 55)
  .flatMap(page => page.indices);
assert.equal(terminal.length, 256);
const terminalSyndromes = Object.fromEntries(
  Object.entries(factors).map(([name, factor]) =>
    [name, remainder(terminal, factor)]));
assert.deepEqual(terminalSyndromes,{
  H:[8,6], G:[21,28], F:[3,22,16,2]
});

console.log(JSON.stringify({
  sourceChecks: {H,G,F},
  runeCount: ciphertext.length,
  marks: marks.length,
  fragments:fragments.length,
  emptyFragmentIndices: [8,11],
  fragmentLengths: fragments.map(f=>f.length),
  directOriginalMatches: matches,
  terminalThreePageSyndromes:terminalSyndromes,
  plantMatchesPerFactor: 32,
  wrongCyclicRowMatchesPerFactor: 0,
  plaintextOrKeyRecovered:false
},null,2));
