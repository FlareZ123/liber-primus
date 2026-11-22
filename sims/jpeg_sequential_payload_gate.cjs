"use strict";
/**
 * Original LP2 JPEG sequential DCT-parity carrier screen. The decoder
 * accepts coefficient bits from the existing jpeg_dct_bits.c extractor.
 * Scope: 58 original images, 8 block/coefficient/one filters, 8 bit phases,
 * 2 byte-bit orders. Keyed F5/OutGuess permutations are outside this scope.
 * LP_DCT_BITS=/tmp/lp_jpeg_dct_bits node sims/jpeg_sequential_payload_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
const ROOT=path.resolve(__dirname,".."),PREFIX=8192;
const flip=Buffer.from(Array.from({length:256},(_,b)=>{
  let n=0;for(let i=0;i<8;i++)n|=((b>>i)&1)<<(7-i);return n;
}));
const magic=[
  ["PGP-armour",Buffer.from("-----BEGIN PGP")],
  ["ZIP",Buffer.from([80,75,3,4])],
  ["PNG",Buffer.from([137,80,78,71,13,10,26,10])],
  ["GZIP",Buffer.from([31,139,8])],
  ["BZIP2",Buffer.from("BZh")],
  ["PDF",Buffer.from("%PDF-")],
  ["JPEG-JFIF",Buffer.from([255,216,255,224,0,16,74,70,73,70])]
];
/** @param {Buffer} data @param {number} offset @param {boolean} reverse */
function align(data,offset,reverse){
  const length=Math.min(PREFIX,data.length-Number(offset>0)),out=Buffer.allocUnsafe(length);
  for(let i=0;i<length;i++){
    const b=offset?((data[i]<<offset)|(data[i+1]>>>(8-offset)))&255:data[i];
    out[i]=reverse?flip[b]:b;
  }
  return out;
}
/** @param {Buffer} data */
function inspect(data){
  let run=0,best=0;
  for(const b of data){run=b>=32&&b<=126?run+1:0;if(run>best)best=run;}
  const headers=[];
  for(const endian of ["BE","LE"]){
    const n=endian==="BE"?data.readUInt32BE(0):data.readUInt32LE(0);
    if(n>=1&&n<=16384)headers.push({endian,length:n});
  }
  return {headers,signatures:magic.filter(x=>data.includes(x[1])).map(x=>x[0]),
    shortPGP:data.includes(Buffer.from("PGP")),maxPrintable:best};
}
/** @param {string} bin @param {string} image @param {number} o @param {number} z @param {number} skip */
function coefficientBits(bin,image,o,z,skip){
  const p=spawnSync(bin,[image,o,z,skip],{encoding:null,maxBuffer:16*1024*1024});
  if(p.status!==0)throw Error(String(p.stderr));
  const newline=p.stdout.indexOf(10);assert(newline>0);
  const n=Number(p.stdout.subarray(0,newline).toString("ascii"));
  assert(Number.isSafeInteger(n)&&n>PREFIX*8);
  return p.stdout.subarray(newline+1,newline+1+PREFIX+1);
}
/** @param {string} bin */
function run(bin){
  const planted=inspect(align(Buffer.concat([
    Buffer.from([0,0,1,1]),Buffer.from("-----BEGIN PGP MESSAGE-----")
  ]),0,false));
  assert.equal(planted.headers[0].length,257);
  assert(planted.signatures.includes("PGP-armour"));
  const hits=[];let trials=0,extracts=0,maxRun=0;
  for(let image=17;image<=74;image++){
    const jpg=path.join(ROOT,"resources","liber-primus",
      String(image).padStart(2,"0")+".jpg");assert(fs.existsSync(jpg));
    for(let o=0;o<2;o++)for(let z=0;z<2;z++)for(let skip=0;skip<2;skip++){
      const bits=coefficientBits(bin,jpg,o,z,skip);extracts++;
      for(let phase=0;phase<8;phase++)for(const reversed of [false,true]){
        const r=inspect(align(bits,phase,reversed));trials++;
        if(r.maxPrintable>maxRun)maxRun=r.maxPrintable;
        if(r.headers.length||r.signatures.length||r.shortPGP||r.maxPrintable>=18)
          hits.push({image,planarOrMCU:o,naturalOrZigzag:z,omitAbsOne:skip,
            phase,reversed,...r});
      }
    }
  }
  assert.equal(trials,7424);assert.equal(extracts,464);
  const result={originalJPEGs:58,coefficientReads:extracts,byteInterpretations:trials,
    plausible32BitLengthHeaders:hits.filter(x=>x.headers.length).length,
    recognizableStrongPayloads:hits.filter(x=>x.signatures.length).length,
    isolatedThreeBytePGP:hits.filter(x=>x.shortPGP).length,
    printableRunAtLeast18:hits.filter(x=>x.maxPrintable>=18).length,
    maxPrintableRun:maxRun,hits,
    scope:"Source-original sequential DCT-LSB only; no plaintext or key claimed."};
  process.stdout.write(JSON.stringify(result,null,2)+"\n");return result;
}
if(require.main===module){
  assert(process.env.LP_DCT_BITS,"Set LP_DCT_BITS to compiled jpeg_dct_bits.c");
  run(process.env.LP_DCT_BITS);
}
module.exports={align,inspect,run};
