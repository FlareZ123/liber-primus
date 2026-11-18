"use strict";

/**
 * Original GP29 -> GP28 differential transport / binary-format inversion.
 * Fixed hypotheses: a cipher avoiding identical adjacent runes represents
 * radix-28 digits as (C[i]-C[i-1]-1 mod29). A zero step is an escape.
 * Test canonical original visual chapters, exact byte conversion, and
 * two-base28-digits-per-byte packing against positive controls.
 * Windows Node22, CommonJS. No third-party packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.flatMap(p => p.indices).length, 12956);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const getPageRange = (lo,hi) => pages.filter(p => p.page >= lo && p.page <= hi).flatMap(p => p.indices);
const originals = [["all",pages.flatMap(p => p.indices)]]
  .concat(chapters.map(([a,b]) => ["p"+a+"-"+b,getPageRange(a,b)]));

/** @param {number[]} c @param {number} sign @returns {{digits:number[],zeros:number}} */
function difference(c,sign) {
  const digits=[]; let zeros=0;
  for (let i=1;i<c.length;i++) {
    const d=(29+sign*(c[i]-c[i-1]))%29;
    if (d===0) {zeros++;continue;}
    digits.push(d-1);
  }
  return {digits,zeros};
}
/** @param {number[]} digits @returns {Buffer} */
function radix28ToBytes(digits) {
  let n=0n;
  for (const x of digits) { assert(x>=0&&x<28); n=n*28n+BigInt(x); }
  let hex=n.toString(16);
  if (hex.length%2) hex="0"+hex;
  return Buffer.from(hex,"hex");
}
/** @param {Buffer} input @returns {number[]} */
function bytesToRadix28(input) {
  let n=BigInt("0x"+input.toString("hex"));
  const out=[];
  do {out.push(Number(n%28n)); n/=28n;} while(n);
  return out.reverse();
}
/** @param {number[]} d @returns {number[]} */
function toCipher(d) {
  const out=[0];
  for (const x of d) out.push((out[out.length-1]+x+1)%29);
  return out;
}
/** @param {number[]} a @param {number} offset @returns {{total:number,compatible:number}} */
function base28BytePairs(a,offset) {
  let total=0,compatible=0;
  for (let i=offset;i+1<a.length;i+=2) {
    total++; if (a[i]*28+a[i+1]<256) compatible++;
  }
  return {total,compatible};
}
function pairEncode(b) {
  const out=[];
  for(const x of b)out.push(Math.floor(x/28),x%28);
  return out;
}
function pairDecode(d) {
  assert.equal(d.length%2,0);
  const b=[];
  for(let i=0;i<d.length;i+=2){
    const x=d[i]*28+d[i+1]; assert(x<256);
    b.push(x);
  }
  return Buffer.from(b);
}
const specimen=Buffer.from("FIND THE DIVINITY WITHIN AND EMERGE. THIS IS AN ORIGINAL REVERSIBLE RADIX28 TEST.");
const packed=zlib.deflateSync(specimen);
const positive=toCipher(bytesToRadix28(packed));
const check=difference(positive,+1).digits;
assert.deepEqual(radix28ToBytes(check),packed);
assert.deepEqual(zlib.inflateSync(radix28ToBytes(check)),specimen);
const pair=pairEncode(packed);
assert.deepEqual(pairDecode(difference(toCipher(pair),+1).digits),packed);
assert.deepEqual(base28BytePairs(pair,0),{total:packed.length,compatible:packed.length});
const signatures = [
  ["gzip",[0x1f,0x8b,0x08]],["zip",[0x50,0x4b,0x03,0x04]],
  ["bzip2",[0x42,0x5a,0x68]],["xz",[0xfd,0x37,0x7a,0x58,0x5a,0x00]],
  ["sevenzip",[0x37,0x7a,0xbc,0xaf,0x27,0x1c]],
  ["pdf",[0x25,0x50,0x44,0x46]],["png",[0x89,0x50,0x4e,0x47]],
  ["sqlite",[0x53,0x51,0x4c,0x69,0x74,0x65]]
];
/** @param {Buffer} b @returns {string[]} */
function magic(b) {
  const out=[];
  for(const [name,bytes] of signatures)
    if(bytes.every((x,i)=>b[i]===x))out.push(name);
  if(b.length>2&&b[0]===0x78&&[0x01,0x5e,0x9c,0xda].includes(b[1])) out.push("zlib");
  return out;
}
/** @param {Buffer} b @returns {string|null} */
function decompress(b) {
  for(const [name,fn] of [["deflate",zlib.inflateSync],
    ["gzip",zlib.gunzipSync],["brotli",zlib.brotliDecompressSync]]) {
    try {
      const decoded=fn(b,{maxOutputLength:1000000});
      if(decoded.length>20)return name+":"+decoded.subarray(0,80).toString("utf8");
    } catch { /* finite format probe; known malformed inputs are expected */ }
  }
  return null;
}
const rows=[];
for (const [name,input] of originals) for (const sign of [-1,+1]) {
  const {digits,zeros}=difference(input,sign);
  const b=radix28ToBytes(digits);
  const pair0=base28BytePairs(digits,0),pair1=base28BytePairs(digits,1);
  rows.push({segment:name,sign,input:input.length,zeroSteps:zeros,
    radix28Digits:digits.length,byteCount:b.length,
    prefixHex:b.subarray(0,16).toString("hex"),
    magic:magic(b),decompress:decompress(b),
    pair0Percent: +(100*pair0.compatible/pair0.total).toFixed(3),
    pair1Percent: +(100*pair1.compatible/pair1.total).toFixed(3)});
}
console.log("GP28 DIFFERENTIAL BINARY ORIGINAL-SOURCE TEST");
console.log("positiveControl=PASS, origin=original-12,956-rune LP2 p0..55");
for(const r of rows)console.log(JSON.stringify(r));
assert.equal(rows.length,20);
console.log("END GP28 ORIGINAL BINARY GATE");
