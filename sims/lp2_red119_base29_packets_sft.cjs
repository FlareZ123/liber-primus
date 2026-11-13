// @ts-check
"use strict";
/**
 * One source-motivated protocol framing gate for original red119 triads.
 * p3 SCY points to the documented 2013 ICMP sky episode; p39 UDP names a
 * packet format; the documented 2013 BASE29 numeral operation supplies an
 * already-in-period reversible rune-to-integer transport.
 *
 * Run: node sims/lp2_red119_base29_packets_sft.cjs
 * No third-party dependencies, no external network, no writes.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const ink = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-ink-annotations.json","utf8"));

/** @param {number[]} values @returns {Buffer} */
function fromBase29(values) {
  let number=0n;
  for(const n of values) {
    assert(Number.isInteger(n) && n>=0 && n<29);
    number=number*29n+BigInt(n);
  }
  const hex=number.toString(16).padStart(Math.ceil(number.toString(16).length/2)*2,"0");
  return Buffer.from(hex,"hex");
}
/** @param {Buffer} bytes @returns {number[]} */
function toBase29(bytes) {
  let number=BigInt("0x"+bytes.toString("hex"));
  const out=[];
  while(number>0n) {out.push(Number(number%29n));number/=29n;}
  return out.reverse();
}
/** @param {Buffer} bytes */
function onesComplement(bytes) {
  let sum=0;
  for(let i=0;i<bytes.length;i+=2)sum+=(bytes[i]<<8)|(bytes[i+1]??0);
  while(sum>65535)sum=(sum&65535)+(sum>>>16);
  return (~sum)&65535;
}
/** @param {number} page @param {number[]} marked */
function source(page,marked) {
  const markers=ink.pages.find(p=>p.page===page)?.red_spans||[];
  const triad=markers.filter(x=>x.length===3);
  assert.equal(triad.length,1);
  assert.equal(triad[0].start,119);
  assert.deepEqual(corpus.pages[page].indices.slice(119,122),marked);
  assert.equal(corpus.pages[page].indices.length,page===3?217:240);
  return corpus.pages[page].indices.slice(122);
}
const c3=source(3,[13,23,2]);
const c39=source(39,[27,5,15]);
assert.equal(c3.length,95);
assert.equal(c39.length,118);
assert.deepEqual([13,23,2].map(n=>28-n),[15,5,26]); // SCY
assert.deepEqual([27,5,15].map(n=>28-n),[1,23,13]); // UDP

const results=[];
for(const [label,values] of [["SCY / ICMP",c3],["UDP",c39]]) {
  for(const [direction,digits] of [["forward",values],
    ["reversed",values.slice().reverse()]]) {
    const bytes=fromBase29(digits);
    const standard=label==="UDP"
      ?{sourcePort:bytes.readUInt16BE(0),
        destPort:bytes.readUInt16BE(2),
        declaredDatagramLength:bytes.readUInt16BE(4),
        correctDatagramLength:bytes.readUInt16BE(4)===bytes.length}
      :{type:bytes[0],code:bytes[1],
        commonType:[0,3,8,11,12].includes(bytes[0]),
        headerChecksumValid:onesComplement(bytes)===0};
    results.push({label,direction,runicDigits:digits.length,
      byteCount:bytes.length,first24Hex:bytes.subarray(0,24).toString("hex"),
      ...standard});
  }
}
// A source-native 58-byte ICMP echo, with correct checksum, maps to exactly
// 95 digits and decodes with all its bytes preserved.
const icmp=Buffer.alloc(58,0x51);icmp[0]=8;icmp[1]=0;
icmp.writeUInt16BE(0,2);
icmp.writeUInt16BE(onesComplement(icmp),2);
assert.equal(onesComplement(icmp),0);
const packedICMP=toBase29(icmp);
assert.equal(packedICMP.length,95);
assert.deepEqual(fromBase29(packedICMP),icmp);
// A source-native 72-byte UDP datagram of port 3301 and length 72 maps to
// exactly 118 base29 digits; a pseudoheader is not available or asserted.
const udp=Buffer.alloc(72,0x51);udp.writeUInt16BE(3301,0);
udp.writeUInt16BE(3301,2);udp.writeUInt16BE(72,4);udp.writeUInt16BE(0,6);
const packedUDP=toBase29(udp);
assert.equal(packedUDP.length,118);
assert.deepEqual(fromBase29(packedUDP),udp);
assert.equal(results.length,4);
assert(results.filter(r=>r.label==="UDP").every(r=>!r.correctDatagramLength));
assert(results.filter(r=>r.label!=="UDP").every(r=>!r.commonType&&!r.headerChecksumValid));
console.log(JSON.stringify({test:"red119 contiguous black tail as direct 2013 BASE29 decoded protocol packet",
  positivePlants:"95-digit ICMP checksum-correct and 118-digit UDP length-correct passed",
  original:results,
  verdict:"No literal network-order ICMP or UDP datagram in either entire-tail orientation; no plaintext or endpoint. Does not test keyed/indirect packet encodings."},null,2));
