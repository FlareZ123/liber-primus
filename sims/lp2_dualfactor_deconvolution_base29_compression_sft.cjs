"use strict";

/**
 * Original LP2 H/G causal-convolution -> BASE29 -> complete compressed
 * transport gate. Tests a distinct source-defined two-operation hypothesis:
 * 2013 BASE29 + published original p39 factor, and author-used GZIP/BZIP2
 * transport. No guessed offsets, keys, rune alphabets or packet lengths.
 *
 * SFT: node sims/lp2_dualfactor_deconvolution_base29_compression_sft.cjs
 * Uses native Node.js 22 built-ins. Read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const read = file => fs.readFileSync(path.resolve(__dirname,"..",file),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
const all = pages.flatMap(p => p.indices);
assert.equal(all.length,12956);
assert.equal(pages.length,55);
const cuts = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const units = [{label:"whole 0-55", symbols:all}];
for(let i=0;i<9;i++)units.push({
  label:"visual chapter "+i, symbols:all.slice(cuts[i],cuts[i+1])
});
for(const p of pages)units.push({label:"physical p"+p.page,symbols:p.indices});
assert.equal(units.length,65);
const modulo = v => ((v%29)+29)%29;
/** @param {number} x @returns {number} */
function invert(x) {
  x=modulo(x);
  for(let i=1;i<29;i++)if(i*x%29===1)return i;
  throw new Error("not invertible");
}
/**
 * @param {number[]} cipher
 * @param {number[]} taps constant coefficient first
 * @returns {number[]}
 */
function decode(cipher,taps) {
  const out=new Array(cipher.length);
  const inv=invert(taps[0]);
  for(let i=0;i<cipher.length;i++){
    let v=cipher[i];
    for(let k=1;k<taps.length&&k<=i;k++)v-=taps[k]*out[i-k];
    out[i]=modulo(v*inv);
  }
  return out;
}
/**
 * @param {number[]} plain
 * @param {number[]} taps
 * @returns {number[]}
 */
function encode(plain,taps) {
  return plain.map((_,i)=>{
    let c=0;
    for(let k=0;k<taps.length&&k<=i;k++)c+=taps[k]*plain[i-k];
    return modulo(c);
  });
}
/** @param {number[]} digits @returns {Buffer} */
function radix29Bytes(digits) {
  let value=0n;
  for(const d of digits) {
    assert(Number.isInteger(d)&&d>=0&&d<29);
    value=value*29n+BigInt(d);
  }
  let hex=value.toString(16);
  if(hex.length%2)hex="0"+hex;
  if(hex==="00"&&value===0n)return Buffer.alloc(0);
  return Buffer.from(hex,"hex");
}
/**
 * @param {Buffer} bytes
 * @returns {number[]}
 */
function bytesToRadix29(bytes) {
  let n=BigInt("0x"+bytes.toString("hex"));
  const digits=[];
  while(n>0n) {
    digits.unshift(Number(n%29n));
    n/=29n;
  }
  return digits;
}
const keys=[
  ["source-2013 H",[3,26,24]],
  ["source-p39 G",[27,5,15]],
  ["source-HG",[23,21,11,17,12]]
];
const directions=keys.flatMap(([name,k])=>
  [[name+" direct",k],[name+" reverse",k.slice().reverse()]]);
const magic=[
  ["gzip","1f8b08"],
  ["bzip2","425a68"],
  ["xz","fd377a585a00"],
  ["zip","504b0304"],
  ["png","89504e470d0a1a0a"],
  ["pdf","25504446"],
  ["zlib-low","7801"],
  ["zlib-default","789c"],
  ["zlib-high","78da"]
];
const target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
assert.equal(target.length,128);
const summary={models:0,sourceRunes:all.length,sourceUnits:units.length,headHits:[],anyOffsetMagic:[],validCompression:[],digestMatches:[],asciiCandidates:[],longestBytes:0};
for(const [key,taps]of directions){
  for(const unit of units) {
    const output=decode(unit.symbols,taps);
    assert.deepEqual(encode(output,taps),unit.symbols,
      "exact roundtrip "+key+" "+unit.label);
    const buffer=radix29Bytes(output);
    summary.models++;
    summary.longestBytes=Math.max(summary.longestBytes,buffer.length);
    if(buffer.length>=20) {
      let printable=0;
      for(const byte of buffer) if((byte>=32 && byte<=126) ||
        byte===9 || byte===10 || byte===13) printable++;
      const fraction=printable/buffer.length;
      if(fraction>=0.8 || buffer.includes(Buffer.from(".onion")) ||
        buffer.includes(Buffer.from("https://"))) {
        summary.asciiCandidates.push({key,unit:unit.label,
          printableFraction:fraction,bytes:buffer.length});
      }
    }
    for(const [kind,hex]of magic) {
      const m=Buffer.from(hex,"hex");
      const offset=buffer.indexOf(m);
      if(offset>=0){
        const hit={key,unit:unit.label,kind,offset,length:buffer.length};
        summary.anyOffsetMagic.push(hit);
        if(offset===0)summary.headHits.push(hit);
        if(kind==="gzip"||kind.startsWith("zlib")) {
          try{
            const out=kind==="gzip"?
              zlib.gunzipSync(buffer.subarray(offset),{maxOutputLength:1<<20}):
              zlib.inflateSync(buffer.subarray(offset),{maxOutputLength:1<<20});
            if(out.length>=16)summary.validCompression.push({
              ...hit,bytes:out.length,text:out.subarray(0,90).toString("latin1")});
          } catch(err) {
            assert(err instanceof Error);
          }
        }
      }
    }
    for(const hash of ["sha512","sha3-512","blake2b512"]) {
      if(crypto.createHash(hash).update(buffer).digest("hex")===target)
        summary.digestMatches.push({key,unit:unit.label,hash});
    }
  }
}
assert.equal(summary.models,390);
assert.equal(summary.headHits.length,0);
assert.equal(summary.validCompression.length,0);
assert.equal(summary.digestMatches.length,0);
assert.equal(summary.asciiCandidates.length,0);

// Compressed binary positive controls using original solved p57 text.
// For each original-source polynomial and its opposite orientation, make
// a true gzip object, base29-code it, pad to original p57 rune count with
// leading zero digits, encrypt, and recover the exact real gzip bytes.
const prose=Buffer.from("PARABLE: LIKE THE INSTAR TUNNELING TO THE SURFACE. "+
  "WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.",
  "utf8");
const compressed=zlib.gzipSync(prose,{level:9});
let base=bytesToRadix29(compressed);
const width=Math.max(base.length,95);
assert(width<200);
base=Array(width-base.length).fill(0).concat(base);
for(const [key,taps]of directions) {
  const c=encode(base,taps);
  const recovered=radix29Bytes(decode(c,taps));
  assert(recovered.equals(compressed), "source polynomial full transport "+key);
  assert(zlib.gunzipSync(recovered).equals(prose),
    "source message exact decompress "+key);
}
console.log(JSON.stringify({
  conclusion:"no original source H/G/HG-then-BASE29 complete headed payload",
  sourceHypothesis:"causal GF29 deconvolution + signed 2013 BASE29 + 2014 gzip/bzip2",
  modelCount:summary.models,sourceUnits:summary.sourceUnits,
  longestDecodedByteRegister:summary.longestBytes,
  anyOffsetMagicCount:summary.anyOffsetMagic.length,
  first32MagicMatches:summary.anyOffsetMagic.slice(0,32),
  strictHeadMatches:summary.headHits,
  genuinelyDecompressedPayloads:summary.validCompression,
  exactP56HashMatches:summary.digestMatches,
  printableAsciiCandidates:summary.asciiCandidates,
  authenticGzipPositiveControls:directions.length,
  plantedMessageBytes:prose.length,
  plantedCompressedBytes:compressed.length,
  originalUnknownPlaintextRecovered:0
},null,2));
