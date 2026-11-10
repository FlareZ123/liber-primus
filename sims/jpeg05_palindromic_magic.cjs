"use strict";
/**
 * Original LP1 scan 05.jpg is a binary palindromic envelope:
 * [one complete JPEG][360-byte encoded numeric matrix][reverse of that JPEG].
 * Recover the 5x5 matrix without OCR or a guessed hidden password.
 *
 * Run: node sims/jpeg05_palindromic_magic.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const EXPECTED_SHA256="2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7";
const EXPECTED=[
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272]
];

/** @param {Buffer} input Raw original JPEG file, including trailing bytes. */
function decode(input){
  assert.equal(input.subarray(0,3).toString("hex"),"ffd8ff");
  const hash=crypto.createHash("sha256").update(input).digest("hex");
  assert.equal(hash,EXPECTED_SHA256,"Source archive image SHA-256 changed");

  // The initial EOI is at offset 336351. A later \xff\xd9 occurs *inside*
  // the reversed image data; looking for the last EOI is a parsing error.
  const eoi=input.indexOf(Buffer.from([0xff,0xd9]));
  assert.equal(eoi,336351);
  const jpeg=input.subarray(0,eoi+2);
  const center=input.subarray(jpeg.length,input.length-jpeg.length);
  const back=input.subarray(input.length-jpeg.length);
  assert.equal(jpeg.length,336353);
  assert.equal(center.length,360);
  assert.equal(back.length,jpeg.length);
  assert.deepEqual(back,Buffer.from(jpeg).reverse());
  assert.deepEqual(center.subarray(0,2),Buffer.from([10,10]));

  // Encoding: the 358 printable ASCII hex characters encode a 179-byte
  // numeric-square ASCII string *in reverse character order*.
  const reversedHex=center.subarray(2).toString("ascii");
  assert.match(reversedHex,/^[0-9a-f]{358}$/u);
  const squareText=Buffer.from([...reversedHex].reverse().join(""),"hex").toString("ascii");
  assert.equal(squareText.length,179);
  const rows=squareText.trim().split(/\r?\n/u).map(line=>
    line.trim().split(/\s+/u).map(Number));
  assert.equal(rows.length,5);
  assert.ok(rows.every(row=>row.length===5));
  assert.deepEqual(rows,EXPECTED);

  const sums=[
    ...rows.map(row=>row.reduce((a,b)=>a+b,0)),
    ...Array.from({length:5},(_,i)=>rows.reduce((s,row)=>s+row[i],0)),
    rows.reduce((s,row,i)=>s+row[i],0),
    rows.reduce((s,row,i)=>s+row[4-i],0)
  ];
  assert.deepEqual(sums,Array(12).fill(1033));
  assert.equal(
    Buffer.from(squareText,"ascii").toString("hex").split("").reverse().join(""),
    reversedHex
  );
  return {sha256:hash,fileBytes:input.length,jpegBytes:jpeg.length,
    centerBytes:center.length,reversedJpegBytes:back.length,
    square:rows,magicConstant:1033};
}
function run(){
  const original=fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","05.jpg"));
  const result=decode(original);
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={decode,run};
