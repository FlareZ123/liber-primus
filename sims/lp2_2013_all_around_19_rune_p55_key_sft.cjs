#!/usr/bin/env node
"use strict";

// Test the literal 2013 OS clue phrase as a 19-symbol GP29 / prime-gematria key
// against the 76-rune p55 ciphertext. All encodings and the transposition order
// are fixed from the original 2013 gematria table; no language search or phase fit.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const glyphs = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-p55-source-glyph-coordinates.json", "utf8"));
const osMessage = fs.readFileSync("resources/historical/cicada2013-os-original-message.txt", "utf8");

const phrase = "THE KEY IS ALL AROUND YOU";
assert.match(osMessage, /THE KEY IS ALL AROUND YOU/i);
const page55 = corpus.pages.find(page => page.page === 55);
assert.ok(page55);
const ciphertext = page55.indices;
const translit = corpus.translit;
assert.equal(ciphertext.length, 76);

const lineCounts = {};
for (const glyph of glyphs.glyphs) lineCounts[glyph.line] = (lineCounts[glyph.line] || 0) + 1;
const actualLineCounts = Object.keys(lineCounts).sort((a,b)=>Number(a)-Number(b)).map(line=>lineCounts[line]);
assert.deepEqual(actualLineCounts, [24,22,22,8]);

// Values read from the original 2013 Twitter-stage gematria.jpg table.
// K aliases C; the phrase therefore has 19 GP29 symbols.
const primeValues = [5,67,13,67,103,31,53,97,73,73,97,11,7,3,29,89,103,7,3];
const primeAlphabet = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const gpKey = primeValues.map(value => primeAlphabet.indexOf(value));
assert.equal(primeValues.length, 19);
assert.ok(gpKey.every(index => index >= 0));
assert.equal(primeValues.reduce((a,b)=>a+b,0), 931);
assert.equal(gpKey.length * 4, ciphertext.length);

function render(indices) {
  return indices.map(index => translit[index]).join(" ");
}
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  const n = indices.length;
  return counts.reduce((sum,count)=>sum+count*(count-1),0)/(n*(n-1));
}
function testPeriodic(key) {
  const repeated = Array.from({length:76},(_,i)=>key[i%key.length]);
  const subtract = ciphertext.map((value,i)=>(value-repeated[i]+29)%29);
  const add = ciphertext.map((value,i)=>(value+repeated[i])%29);
  return {
    repeated_key: render(repeated),
    subtract: render(subtract),
    subtract_ioc: ioc(subtract),
    add_control: render(add),
    add_ioc: ioc(add),
    raw_ioc: ioc(ciphertext)
  };
}
const primeMod29 = primeValues.map(value=>value%29);
const primeTotientMod29 = primeValues.map(value=>(value-1)%29);

// Standard columnar-transposition decryption: four rows x nineteen columns;
// ciphertext is the concatenation of columns in ascending prime-key order.
// Stable left-to-right tie handling is fixed for repeated key values.
const columnOrder = primeValues.map((value,index)=>({value,index}))
  .sort((a,b)=>a.value-b.value || a.index-b.index)
  .map(item=>item.index);
const columns = Array.from({length:19},()=>[]);
let offset=0;
for (const column of columnOrder) {
  columns[column]=ciphertext.slice(offset,offset+4);
  offset+=4;
}
const transposed=[];
for(let row=0;row<4;row++) for(let column=0;column<19;column++) transposed.push(columns[column][row]);

console.log(JSON.stringify({
  phrase,
  gp29_key: render(gpKey),
  gp29_indices: gpKey,
  prime_values: primeValues,
  prime_sum: primeValues.reduce((a,b)=>a+b,0),
  base29_prime_sum: "133",
  key_period: 19,
  p55_length: ciphertext.length,
  periods: ciphertext.length/gpKey.length,
  actual_p55_line_counts: actualLineCounts,
  gp29_ordinal_periodic: testPeriodic(gpKey),
  prime_mod29_periodic: testPeriodic(primeMod29),
  prime_totient_mod29_periodic: testPeriodic(primeTotientMod29),
  columnar_prime_order: columnOrder,
  columnar_decryption: render(transposed),
  columnar_ioc: ioc(transposed),
  raw_ioc: ioc(ciphertext)
},null,2));
