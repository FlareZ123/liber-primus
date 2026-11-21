"use strict";
/**
 * Finite p15 4x4 uint16 -> 256-bit ChaCha20 key against the authentic p50
 * 256-byte grid and next visual chapter p16–22 (1883 untouched black runes).
 * Zero counter/nonce baseline. Native Node crypto implementation.
 * node sims/lp2_p15_chacha20_original_receiver_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const repo = path.resolve(__dirname, "..");
const load = (p) => fs.readFileSync(path.join(repo,p),"utf8");
const grid = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const p15 = [
 [3258,3222,3152,3038],
 [3278,3299,3298,2838],
 [3288,3294,3296,2472],
 [4516,1206,708,1820]
];
const spiral = [[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
const printRow = p15.flat();
const printSpiral = spiral.map(([i,j])=>p15[i][j]);
const primeSpiral = [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
const fibSpiral = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
assert.deepEqual(printSpiral,primeSpiral.map(x=>Math.abs(3301-x)));
assert(crypto.getCiphers().includes("chacha20"),"Node/OpenSSL chacha20 unavailable on this runner");

/** @param {number[]} data @param {boolean} little @returns {Buffer} */
function key32(data,little) {
  assert.equal(data.length,16);
  const out=Buffer.alloc(32);
  for(let i=0;i<16;i++) {
    assert(Number.isInteger(data[i])&&data[i]>=0&&data[i]<65536);
    if(little)out.writeUInt16LE(data[i],2*i);
    else out.writeUInt16BE(data[i],2*i);
  }
  return out;
}
/** @param {Buffer} key @param {Buffer} data @returns {Buffer} */
function applyChaCha20(key,data) {
  const cipher = crypto.createCipheriv("chacha20",key,Buffer.alloc(16));
  return Buffer.concat([cipher.update(data),cipher.final()]);
}
/** @param {Buffer} bytes @returns {object} */
function asciiMetrics(bytes) {
  let printable=0,rawGp=0;
  for(const b of bytes) {
    if(b>=32&&b<=126)printable++;
    if(b<29)rawGp++;
  }
  return {printable,asciiFraction:+(printable/bytes.length).toFixed(6),
    rawGp,rawGpFraction:+(rawGp/bytes.length).toFixed(6),
    first16Hex:bytes.subarray(0,16).toString("hex")};
}
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const bins=new Uint16Array(29);
  for(const n of runes)bins[n]++;
  return bins.reduce((sum,n)=>sum+n*(n-1),0)/(runes.length*(runes.length-1));
}
const lp2=corpus.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices);
assert.equal(lp2.length,1883);
assert.equal(grid.bytes.length,256);
const byteCipher=Buffer.from(grid.bytes);
const specs=[["print-row",printRow],["print-spiral",printSpiral],["source-prime",primeSpiral],["source-fibonacci",fibSpiral]];
const plants=Buffer.from("LIBER PRIMUS IS THE WAY AND THE WORDS ARE THE MAP, THEIR MEANING THE ROAD. ".repeat(4).slice(0,256),"ascii");
const result=[];
for(const [name,values] of specs) for(const [endian,little] of [["LE",true],["BE",false]]) {
  const key=key32(values,little);
  const encrypted=applyChaCha20(key,plants);
  assert.deepEqual(applyChaCha20(key,encrypted),plants,
    "Chacha20 source-keyed exact byte decryption positive");
  const recovered=applyChaCha20(key,byteCipher);
  const score=asciiMetrics(recovered);
  const keystream=applyChaCha20(key,Buffer.alloc(lp2.length));
  const plus=lp2.map((v,i)=>(v+keystream[i]%29)%29);
  const minus=lp2.map((v,i)=>(v-keystream[i]%29+29)%29);
  const testPlant=lp2.map((v,i)=>(v+keystream[i]%29)%29);
  assert.deepEqual(testPlant.map((v,i)=>(v-keystream[i]%29+29)%29),lp2);
  result.push({key:name,endian,...score,plusIoC:ioc(plus),minusIoC:ioc(minus)});
}
assert.equal(result.length,8);
const bestAscii=result.slice().sort((a,b)=>b.asciiFraction-a.asciiFraction);
const bestGp=result.flatMap(r=>[{key:r.key,endian:r.endian,sign:"+",ioc:r.plusIoC},{key:r.key,endian:r.endian,sign:"-",ioc:r.minusIoC}])
  .sort((a,b)=>b.ioc-a.ioc);
assert(bestAscii[0].asciiFraction<0.65);
assert(bestAscii[0].rawGpFraction<0.30);
assert(bestGp[0].ioc<0.048);
console.log(JSON.stringify({
  source:"LP2 p15 16 printed 4-digit values and p49–51 256 literal bytes; p16–22 1883 literal ciphertext runes",
  hypotheses:"16 input values as UINT16LE/BE32-byte ChaCha20 key; zero counter and nonce; original byte-grid XOR and GP29 additive stream receiver",
  candidateKeys:result.length,
  originalByteGridBest:bestAscii.slice(0,3),
  originalRuneReceiverBest:bestGp.slice(0,5),
  allOriginalResults:result,
  exactPlantByteAnd29Inverse:true,
  originalPlaintextRecovered:false,
  interpretation:"source-derived key packing and algorithm are optional modern-cipher hypotheses, not a creator-supplied instruction"
},null,2));
console.log("PASS original p15 ChaCha20 p50/p16–22 finite key gate");
