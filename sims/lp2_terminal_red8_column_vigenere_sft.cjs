"use strict";
/**
 * One original-source-motivated, reversible direct terminal-ring inverse.
 *
 * The printed 32x8 table supplies 256 bytes, its four concentric rings
 * contain 76/68/60/52 cells, and source pages p55/p53/p54 supply 256
 * explicitly selected GP runes with those same lengths. The first of
 * p54's nine red runes completes the inner ring; the other eight furnish
 * one GP29 Vigenere offset per printed table column.
 *
 * One fixed candidate only: clockwise top-left ring traversal, source
 * page order and subtraction of (byte+column-key) mod29. No fitting.
 *
 * Run: node sims/lp2_terminal_red8_column_vigenere_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name */
const load = name => JSON.parse(fs.readFileSync(path.join(ROOT,name),"utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const mod = n => ((n % 29) + 29) % 29;
/** @param {number} number */
const page = number => corpus.pages.find(p => p.page === number).indices;
/** @param {number} number */
const red = number => ink.pages.find(p => p.page === number).red_spans
  .flatMap(span => [...span.runes].map(r => corpus.runes.indexOf(r)));

assert.equal(grid.bytes.length,256);
assert.deepEqual(grid.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.equal(page(53).length,179);
assert.equal(page(55).length,76);
assert.equal(red(53).length,51);
assert.equal(red(54).length,9);
assert.deepEqual(page(53).slice(128),red(53));
assert.deepEqual(page(54).slice(0,9),red(54));
const columnKey = red(54).slice(1);
assert.deepEqual(columnKey,[19,21,23,27,2,14,10,19]);
const segments = [
  page(55),
  page(53).slice(0,68),
  page(53).slice(68,128),
  [...red(53),red(54)[0]],
];
assert.deepEqual(segments.map(s => s.length),[76,68,60,52]);
/** @param {number} layer */
function ringCells(layer) {
  assert.ok(layer >= 0 && layer < 4);
  const cells = [];
  for(let col = layer; col < 8-layer; col++) cells.push(layer*8+col);
  for(let row = layer+1; row < 32-layer; row++)
    cells.push(row*8+7-layer);
  for(let col = 6-layer; col >= layer; col--)
    cells.push((31-layer)*8+col);
  for(let row = 30-layer; row > layer; row--)
    cells.push(row*8+layer);
  return cells;
}
const rings = Array.from({length:4},(_,i) => ringCells(i));
assert.deepEqual(rings.map(r => r.length),[76,68,60,52]);
assert.equal(new Set(rings.flat()).size,256);
/** Assign the source terminal ciphertext to printed table cells. */
const mappedCipher = Array(256);
for(let layer=0;layer<4;layer++)
  for(let i=0;i<rings[layer].length;i++)
    mappedCipher[rings[layer][i]]=segments[layer][i];
assert.ok(mappedCipher.every(x => Number.isInteger(x) && x>=0 && x<29));
/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @returns {number[]}
 */
function decrypt(cipher,key) {
  return cipher.map((c,i) => mod(c-grid.bytes[i]-key[i%8]));
}
/**
 * @param {number[]} plain
 * @param {number[]} key
 * @returns {number[]}
 */
function encrypt(plain,key) {
  return plain.map((p,i) => mod(p+grid.bytes[i]+key[i%8]));
}
/** @param {number[]} text */
function ioc(text) {
  const n=text.length,counts=Array.from({length:29},(_,i)=>text.filter(x=>x===i).length);
  return counts.reduce((total,c)=>total+c*(c-1),0)/(n*(n-1));
}
const decoded=decrypt(mappedCipher,columnKey);
assert.deepEqual(encrypt(decoded,columnKey),mappedCipher);
const plant=Array.from({length:256},(_,i)=>page(56)[i%page(56).length]);
assert.deepEqual(decrypt(encrypt(plant,columnKey),columnKey),plant);
const wrongKey=red(40);
assert.equal(wrongKey.length,8);
assert.ok(decrypt(encrypt(plant,columnKey),wrongKey)
  .some((x,i)=>x!==plant[i]));
const result={
  evidence:"source p53/p54/p55 terminal rune lengths and p50 32x8 table",
  conditionalModel:"terminal rings clockwise from top-left, p54 red suffix eight GP index column keys, byte-plus-key GP29 Vigenere",
  sourceRingLengths:rings.map(r=>r.length),
  columnKeyGP29:columnKey,
  originalCipherIoC:ioc(mappedCipher),
  originalDecodedIoC:ioc(decoded),
  solvedP56IoC:ioc(page(56)),
  first80GP:decoded.slice(0,80).map(i=>corpus.translit[i]).join(""),
  sourcePlantRoundTrip:256,
  wrongSourceKeyControlFailed:true,
  unknownPlaintextRecovered:false,
  decision:"This literal source-selected-looking ring/column Vigenere inverse remains ciphertext-like and yields no authentic key or plaintext."
};
assert.ok(result.originalDecodedIoC<0.05);
console.log(JSON.stringify(result,null,2));
