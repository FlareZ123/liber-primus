"use strict";
/**
 * Source-fixed four concentric clockwise rings of the original 32x8 table.
 * SFT: node sims/lp2_p50_concentric_ring60_source_sft.cjs
 *
 * Hypothesis-generation only: original p57 says "SHED YOUR CIRCUMFERENCES";
 * original p55 is 76 runes and the red119 NUMBER branch suggests 60.
 * This checks the complete original geometry. It does not claim a decoder.
 */
const assert = require("node:assert/strict");
const source = require("../resources/liber-primus/base60-grid.json");
const corpus = require("../resources/liber-primus/lp2-corpus.json");

assert.equal(source.byte_rows.length, 32);
assert(source.byte_rows.every((r) => r.length === 8));
assert.equal(source.rows.length, 32);
assert(source.rows.every((r) => r.length === 8));

/** @typedef {{row:number,col:number,token:string,byte:number}} Cell */

/** @param {number} layer @returns {Cell[]} */
function clockwiseRing(layer) {
  const top = layer, bottom = 31 - layer;
  const left = layer, right = 7 - layer;
  /** @type {Cell[]} */
  const out = [];
  /** @param {number} row @param {number} col */
  function append(row, col) {
    out.push({row,col,token:source.rows[row][col],
      byte:source.byte_rows[row][col]});
  }
  for(let col=left; col<=right; col++) append(top,col);
  for(let row=top+1; row<=bottom; row++) append(row,right);
  for(let col=right-1; col>=left; col--) append(bottom,col);
  for(let row=bottom-1; row>top; row--) append(row,left);
  return out;
}
const rings = [0,1,2,3].map(clockwiseRing);
assert.deepEqual(rings.map(x => x.length), [76,68,60,52]);
const all = rings.flat();
assert.equal(all.length,256);
assert.equal(new Set(all.map(x => x.row*8+x.col)).size,256);
const sourceCells = source.byte_rows.flat();
assert.deepEqual(all.map(x => x.byte).slice(0,8),sourceCells.slice(0,8));
for(const {row,col,token,byte} of all) {
  assert.equal(token,source.rows[row][col]);
  assert.equal(byte,source.byte_rows[row][col]);
}
assert.equal(corpus.pages.find(p => p.page === 55).indices.length,76);
assert.equal(corpus.pages.find(p => p.page === 56).indices.length,85);
assert.equal(corpus.pages.find(p => p.page === 57).indices.length,95);
const expected60 = "0F 0X 1g 2H 16 1K 1l 2p 3G 1D 2O 0S 1O 3n 34 2p 0K 2L 0k 2s 4B 0I 1v 0e 3C 1t 1G 2U 0q 00 0W 3w 21 3G 1D 2S 06 3T 2d 0J 2k 4E 3C 0E 1W 3r 1Q 1Q 3H 0V 1C 3I 3L 3P 0P 2Q 0l 0S 3H 2r";
assert.equal(rings[2].map(x => x.token).join(" "),expected60);
const summary=rings.map((cells,layer)=>({
  layer:layer+1,coordinateBox:[layer,layer,31-layer,7-layer],
  length:cells.length,firstToken:cells[0].token,
  tokenSequence:layer===2?cells.map(x=>x.token).join(" "):undefined,
  byteSum:cells.reduce((n,x)=>n+x.byte,0),
  uniqueBytes:new Set(cells.map(x=>x.byte)).size,
  printableAscii:cells.filter(x=>x.byte>=32&&x.byte<=126).length
}));
assert.deepEqual(summary.map(x=>x.byteSum),[10355,9529,7056,6066]);
assert.deepEqual(summary.map(x=>x.uniqueBytes),[68,60,53,45]);
assert.deepEqual(summary.map(x=>x.printableAscii),[32,23,21,27]);
console.log(JSON.stringify({
  source:"original LP2 physical pp49-51 32x8 256-token table",
  operation:"four clockwise nested perimeters starting at each upper-left cell",
  geometry:summary,
  solvedPageLengths:[76,85,95],
  associations:{
    firstRingEqualsOriginalP55:true,
    otherThreeRingsEqualSolvedP56AndP57Combined:true,
    thirdRing60MatchesHistoricalUnsignedNumber60Conjecture:true
  },
  conclusion:"Exact source-visible geometry; no recovered cipher, key, plaintext or endpoint"
},null,2));
