'use strict';

/**
 * Full original 86-rune SHED receiver using all 256 source-table bytes exactly once.
 *
 * Original layout: 17 complete words (p54 last10 + all p55).
 * True word exteriors 34, interiors 52.
 * P50 outer three concentric layers 204 bytes = 34*6, inner 26x2=52 bytes.
 * Source-printed row-major order and source-native GP29 additive inverse.
 *
 * Windows 11 / Node.js 22: node sims/lp2_p54p55_86_source_256_ring52_204six_shell_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const panel = require('../resources/liber-primus/lp2-grid-256.json');

const p54 = corpus.pages.find((p) => p.page === 54).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
const solvedP57 = corpus.pages.find((p) => p.page === 57).indices;
const original = [...p54.slice(-10), ...p55];
const wordLengths = [11, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(original.length, 86);
assert.equal(wordLengths.reduce((s,v)=>s+v,0),86);
const shellPositions = [];
const corePositions = [];
let wordStart = 0;
for (const len of wordLengths) {
  shellPositions.push(wordStart, wordStart+len-1);
  for (let j=1;j<len-1;j++) corePositions.push(wordStart+j);
  wordStart+=len;
}
assert.equal(shellPositions.length,34);
assert.equal(corePositions.length,52);
assert.equal(new Set([...shellPositions,...corePositions]).size,86);

const outer = [];
const inner = [];
for (let row=0;row<32;row++) for (let col=0;col<8;col++) {
  const originalIndex = row*8+col;
  (row<3 || row>=29 || col<3 || col>=5 ? outer : inner).push(originalIndex);
}
assert.equal(outer.length,204);
assert.equal(inner.length,52);
assert.equal(new Set([...outer,...inner]).size,256);
assert.equal(Math.max(...inner),228);
assert.equal(Math.min(...inner),27);
assert.equal(569-563,6);
assert.equal((32-2*3)*(8-2*3),52);
assert.equal(34*6,204);
const key = Array(86).fill(null);
for (let i=0;i<34;i++) {
  const key6 = outer.slice(i*6,i*6+6).map(idx=>panel.bytes[idx]);
  assert.equal(key6.length,6);
  key[shellPositions[i]]=key6.reduce((s,v)=>s+v,0)%29;
}
for (let i=0;i<52;i++) key[corePositions[i]]=panel.bytes[inner[i]]%29;
assert.equal(key.filter(v=>v===null).length,0);

/** @param {number[]} cipher @returns {number[]} */
function decrypt(cipher) {
  assert.equal(cipher.length,86);
  return cipher.map((v,i)=>(v-key[i]+29)%29);
}
/** @param {number[]} plain @returns {number[]} */
function encrypt(plain) {
  assert.equal(plain.length,86);
  return plain.map((v,i)=>(v+key[i])%29);
}
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const bins = Array(29).fill(0);
  values.forEach(v=>{bins[v]++;});
  return bins.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {number[]} values @returns {string} */
function gp(values) { return values.map(v=>corpus.translit[v]).join(''); }
const output=decrypt(original);
assert.deepEqual(encrypt(output),original);
const sourceNativePlant=Array.from({length:86},(_,i)=>solvedP57[i%solvedP57.length]);
assert.deepEqual(decrypt(encrypt(sourceNativePlant)),sourceNativePlant);
let at=0;
const words=wordLengths.map(len=>{
  const s=gp(output.slice(at,at+len));
  at+=len;
  return s;
});
console.log(JSON.stringify({
  original: 'p54 last10 + complete p55 76, 17 whole printed words',
  partition: {sourceRunes:86,wordInterior:52,wordExterior:34,
    sourcePanelBytes:256,sourceInner:52,sourceOuter:204,
    panelOuterBytesPerExterior:6},
  key,outerOriginalGridIndices:outer,innerOriginalGridIndices:inner,
  originalWordwiseCipher:gp(original),decodedOriginal86:gp(output),
  decodedOriginalWords:words,
  sourceIoC:ioc(original),decodedIoC:ioc(output),
  nativeP57Positive:'86/86', originalForwardReplay:'86/86',
  status:'An explicitly typed source-geometry hypothesis; output has no continuous native GP prose. No author source names the six-cell checksum.'
},null,2));
