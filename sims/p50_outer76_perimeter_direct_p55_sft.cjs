"use strict";
/**
 * Bounded natural p49–p51 32×8 outer-perimeter→physical p55 direct GP29 key gate.
 * Source motivation: p55 has exactly 76 runes, the rectangular outer border
 * has 2*(32+8)-4=76 cells, and solved p57 says "shed our own circumferences."
 * Source-selected extraction is independent of candidate plaintext scores.
 *
 * Run: node sims/p50_outer76_perimeter_direct_p55_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root,name),"utf8");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rows = grid.byte_rows;
const page = corpus.pages.find(entry=>entry.page===55);
const solved = corpus.pages.find(entry=>entry.page===57);
assert.equal(rows.length,32);
assert.ok(rows.every(row=>row.length===8));
assert.equal(page.indices.length,76);
assert.equal(solved.indices.length,95);

/** @returns {{bytes:number[],coordinates:number[][]}} */
function outerClockwise() {
  const coordinates=[];
  for(let x=0;x<8;x++) coordinates.push([0,x]);
  for(let y=1;y<32;y++) coordinates.push([y,7]);
  for(let x=6;x>=0;x--) coordinates.push([31,x]);
  for(let y=30;y>=1;y--) coordinates.push([y,0]);
  assert.equal(coordinates.length,76);
  assert.equal(new Set(coordinates.map(p=>p.join(","))).size,76);
  return {bytes:coordinates.map(([y,x])=>rows[y][x]),coordinates};
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts=Array(29).fill(0);
  for(const rune of symbols)counts[rune]++;
  return counts.reduce((total,n)=>total+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} symbols @returns {string} */
function display(symbols) {
  return symbols.map(index=>corpus.translit[index]).join("-");
}
/** @param {number[]} cipher @param {number[]} key @param {number} sign @returns {number[]} */
function transform(cipher,key,sign) {
  return cipher.map((value,i)=>(value+sign*key[i]+29)%29);
}
function run() {
  const {bytes,coordinates}=outerClockwise();
  assert.deepEqual(bytes.slice(0,8),rows[0]);
  assert.deepEqual(bytes.slice(0,8),[203,231,167,186,97,237,126,183]);
  const key=bytes.map(value=>value%29);
  assert.deepEqual(key.slice(0,8),[0,28,22,12,10,5,10,9]);
  const ciphertext=page.indices;
  const minus=transform(ciphertext,key,-1);
  const plus=transform(ciphertext,key,1);
  const reverse=key.map((_,i)=>key[(76-i)%76]);
  const opposite=transform(ciphertext,reverse,-1);
  assert.deepEqual(transform(minus,key,1),ciphertext);
  assert.deepEqual(transform(plus,key,-1),ciphertext);
  const native=solved.indices.slice(0,76);
  const planted=transform(native,key,1);
  assert.deepEqual(transform(planted,key,-1),native);
  assert.notDeepEqual(transform(planted,reverse,-1),native);
  assert.ok(Math.abs(ioc(ciphertext)-0.037894736842105266)<1e-12);
  assert.ok(Math.abs(ioc(minus)-0.03298245614035088)<1e-12);
  assert.ok(Math.abs(ioc(plus)-0.03368421052631579)<1e-12);
  assert.ok(Math.abs(ioc(opposite)-0.03754385964912281)<1e-12);
  assert.ok(Math.abs(ioc(native)-0.05964912280701754)<1e-12);
  return {
    statement:"Original p55 remains ciphertext-like under this one frozen 76-perimeter BASE29 direct-key model",
    scannedLP2Pages:[49,50,51],receiver:55,
    outerRingCellCount:bytes.length,coordinates,fullRingBytes:bytes,base29Residues:key,
    originalCiphertextIoC:ioc(ciphertext),
    sourceNativeSolvedP57First76IoC:ioc(native),
    candidateMinus:{ioc:ioc(minus),fullIndices:minus,printedWord8:display(minus.slice(23,36)),first36:display(minus.slice(0,36))},
    candidatePlus:{ioc:ioc(plus),fullIndices:plus,printedWord8:display(plus.slice(23,36)),first36:display(plus.slice(0,36))},
    oppositeOrientationControl:{ioc:ioc(opposite),first36:display(opposite.slice(0,36))},
    syntheticPositive:{original76Recovered:true,reverseOrderRejected:true},
    limitations:"BASE60 as table codec and remainder as GP29 key are conventional and not authenticated; no unknown plaintext or source-selected operation recovered"
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,outerClockwise,ioc,transform};
