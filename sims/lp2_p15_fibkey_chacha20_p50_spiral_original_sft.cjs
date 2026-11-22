"use strict";
/**
 * SFT: p15 recovered Fibonacci-index prime key + p50 native-rectangle
 * spiral readouts, with no new key optimization.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_p15_fibkey_chacha20_p50_spiral_original_sft.cjs
 *
 * Requires the unchanged canonical p50 byte data and existing frozen
 * p15 key derivation. Never changes source data or writes files.
 */
const assert = require("node:assert/strict");
const {createHash,createCipheriv,createDecipheriv} = require("node:crypto");
const {candidates} = require("./fibonacci_spiral_key_derivation.cjs");
const {bytes} = require("../resources/liber-primus/lp2-grid-256.json");

assert.equal(bytes.length,256);
const original=Buffer.from(bytes);
assert.equal(
  createHash("sha256").update(original).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);
const keyObj=candidates().find((item)=>
  item.name==="sha256(ordinal-row-major:BE)");
assert.ok(keyObj,"The original p15 key candidate is missing");
const key=keyObj.key;
assert.equal(key.toString("hex"),
  "bea05cd97632e0e66b417abc254b07d88844355f1ff3ecff4e972d13e4a6acfe");
const ROWS=32, COLS=8;

/** @param {Array<[number,number]>} coordinates */
function assertComplete(coordinates) {
  assert.equal(coordinates.length,ROWS*COLS);
  const seen = new Set(coordinates.map(([r,c]) => {
    assert.ok(r>=0 && r<ROWS && c>=0 && c<COLS);
    return r*COLS+c;
  }));
  assert.equal(seen.size,ROWS*COLS);
  return coordinates;
}
/** Source-layout baseline. @returns {Array<[number,number]>} */
function rowMajor() {
  return assertComplete(Array.from({length:ROWS*COLS},(_,i)=>
    [Math.floor(i/COLS),i%COLS]));
}
/** Top-left outermost ring, clockwise inwards, as in p50 perimeter work. */
function outerIn() {
  const coordinates=[];
  let top=0,bottom=ROWS-1,left=0,right=COLS-1;
  while(top<=bottom && left<=right) {
    for(let c=left;c<=right;c++) coordinates.push([top,c]);
    top++;
    for(let r=top;r<=bottom;r++) coordinates.push([r,right]);
    right--;
    if(top<=bottom) {
      for(let c=right;c>=left;c--) coordinates.push([bottom,c]);
      bottom--;
    }
    if(left<=right) {
      for(let r=bottom;r>=top;r--) coordinates.push([r,left]);
      left++;
    }
  }
  return assertComplete(coordinates);
}
/**
 * Exact p15 center-out right/down/left/up spiral, extended to the 32x8
 * printed table by traversing the bounding virtual square and retaining
 * only cells that actually occur inside the 32x8 rectangle.
 * 4x4 p15 starts at the upper-left middle cell, so p50 starts (15,3).
 */
function centerOut() {
  const coordinates=[[15,3]];
  const moves=[[0,1],[1,0],[0,-1],[-1,0]];
  let r=15,c=3,direction=0,stepLength=1,turns=0;
  while(coordinates.length<ROWS*COLS) {
    for(let j=0;j<stepLength && coordinates.length<ROWS*COLS;j++) {
      r+=moves[direction][0];c+=moves[direction][1];
      if(r>=0 && r<ROWS && c>=0 && c<COLS) coordinates.push([r,c]);
    }
    direction=(direction+1)%4;
    if(++turns%2===0)stepLength++;
    assert.ok(stepLength<=ROWS*3);
  }
  return assertComplete(coordinates);
}
/** @param {Buffer} source @param {"encrypt"|"decrypt"} mode */
function chacha(source,mode="decrypt") {
  const build=mode==="encrypt"?createCipheriv:createDecipheriv;
  const transform=build("chacha20",key,Buffer.alloc(16));
  return Buffer.concat([transform.update(source),transform.final()]);
}
/** @param {number} x */
const printable=(x)=>x>=32 && x<=126 || x===9 || x===10 || x===13;
/** @param {number} x */
const letter=(x)=>x>=65 && x<=90 || x>=97 && x<=122;
/** @param {Buffer} b */
function score(b) {
  let count=0,ascii=0,best=0,run=0,letterBest=0,letterRun=0;
  for(const v of b) {
    if(v<128)ascii++;
    if(printable(v)){count++;run++;best=Math.max(best,run);}else run=0;
    if(letter(v)){letterRun++;letterBest=Math.max(letterBest,letterRun);}
    else letterRun=0;
  }
  return {printable:count,ascii,maxPrintableRun:best,maxLetterRun:letterBest};
}
/** @param {Buffer} buffer @param {Array<[number,number]>} positions */
function permutation(buffer,positions) {
  return Buffer.from(positions.map(([r,c])=>buffer[r*COLS+c]));
}
const coord={
  "row-major":rowMajor(),
  "center-out":centerOut(),
  "outer-in":outerIn()
};
const decoded=chacha(original);
assert.equal(decoded.subarray(0,16).toString("hex"),
  "833d444a03713cc577ff46223e4c765e");
assert.deepEqual(score(decoded),
  {printable:135,ascii:158,maxPrintableRun:9,maxLetterRun:3});
const output={};
for(const [name,locations] of Object.entries(coord)) {
  const ciphertext=permutation(original,locations);
  const decryptAfterReordering=chacha(ciphertext);
  const reorderAfterDecrypt=permutation(decoded,locations);
  output[name]={
    inputReorderThenDecrypt:score(decryptAfterReordering),
    decryptThenOutputReorder:score(reorderAfterDecrypt),
    headHex:decryptAfterReordering.subarray(0,16).toString("hex")
  };
}
assert.deepEqual(output["center-out"].inputReorderThenDecrypt,
  {printable:100,ascii:130,maxPrintableRun:6,maxLetterRun:4});
assert.deepEqual(output["outer-in"].inputReorderThenDecrypt,
  {printable:91,ascii:124,maxPrintableRun:4,maxLetterRun:3});
assert.equal(output["center-out"].decryptThenOutputReorder.maxPrintableRun,8);
assert.equal(output["outer-in"].decryptThenOutputReorder.maxPrintableRun,6);
assert.equal(output["center-out"].decryptThenOutputReorder.maxLetterRun,3);
assert.equal(output["outer-in"].decryptThenOutputReorder.maxLetterRun,3);
// Source-shaped genuine positive: make a real 256-byte ASCII body using
// the frozen key and 16-byte zero nonce; recover it exactly.
const plain=Buffer.alloc(256,0x20);
Buffer.from("FIBONACCI-PRIME KEYED GRID POSITIVE.").copy(plain);
const encrypted=chacha(plain,"encrypt");
assert.deepEqual(chacha(encrypted),plain);
assert.equal(score(plain).printable,256);
console.log(JSON.stringify({
  source:"LP2 p15 derived Fibonacci ranks / LP2 p50 canonical 32x8",
  keyName:keyObj.name, sourceGridSha256:
    createHash("sha256").update(original).digest("hex"),
  tested:{key:1,nonce:1,byteTables:1,readouts:3},
  results:output,
  positiveControl:"exact 256/256 ASCII source-shaped ChaCha roundtrip",
  conclusion:"Neither source-visible spiral yields a readable p50 payload; selected row-major printability alone does not authenticate the key"
},null,2));
