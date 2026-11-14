"use strict";

/**
 * LP2 exact table factor quotient → base29-integer byte-transport gate.
 *
 * The independently PGP-signed 2013 BASE29 example supplies H=[3,26,24].
 * The original p39 red rune triad supplies G=[27,5,15].  H*G exactly
 * divides the reversed-power original pp49-51 256 byte table polynomial
 * over GF29. This SFT asks whether the unkeyed formal 252 quotient
 * coefficients are themselves a conventional complete binary payload.
 *
 * All data and output structure are fixed independently of target scores.
 * Plaintext plants are constructed, never written into original sources.
 * Node 22, built-ins, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");

const input=JSON.parse(fs.readFileSync(path.join(
  __dirname,"..","resources","liber-primus","base60-grid.json"),"utf8"));
const original=Buffer.from(input.byte_rows.flat());
assert.equal(original.length,256);
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
assert.equal(sha(original),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const mod=n=>(n%29+29)%29;
/** @param {number[]} a @param {number[]} b */
function product(a,b){
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
const H=[3,26,24],G=[27,5,15];
assert.deepEqual(product(H,G),[23,21,11,17,12]);
const divisor=product(H,G).reverse();
/** @param {number[]} coefficients */
function quotientOf(coefficients){
  assert.equal(coefficients.length,256);
  const rest=coefficients.map(mod);
  const result=[];
  const inv=Array.from({length:28},(_,i)=>i+1)
    .find(x=>mod(x*divisor[0])===1);
  assert.equal(inv,17);
  for(let i=0;i<252;i++){
    const q=mod(rest[i]*inv);
    result.push(q);
    for(let j=0;j<5;j++)rest[i+j]=mod(rest[i+j]-q*divisor[j]);
  }
  return {coefficients:result,remainder:rest.slice(252)};
}
/** @param {number[]} digits */
function digitsToBytes(digits) {
  let n=0n;
  for(const d of digits){
    assert(Number.isInteger(d)&&d>=0&&d<29);
    n=29n*n+BigInt(d);
  }
  if(!n)return Buffer.alloc(0);
  let hex=n.toString(16);
  if(hex.length%2)hex="0"+hex;
  return Buffer.from(hex,"hex");
}
/** @param {Buffer} bytes */
function bytesToDigits(bytes){
  let n=BigInt("0x"+bytes.toString("hex"));
  const digits=[];
  while(n){
    digits.unshift(Number(n%29n));
    n/=29n;
  }
  assert(digits.length<=252);
  return Array(252-digits.length).fill(0).concat(digits);
}
/** @param {number[]} q */
function encodeProduct(q){
  assert.equal(q.length,252);
  const out=Array(256).fill(0);
  for(let i=0;i<252;i++)for(let j=0;j<5;j++)
    out[i+j]=mod(out[i+j]+q[i]*divisor[j]);
  return out;
}
/** @param {Buffer} b */
function textLike(b){
  if(b.length<50)return false;
  let count=0;
  for(const c of b)if(c>=32&&c<=126||c===9||c===10||c===13)count++;
  return count>=.85*b.length;
}
/**
 * Strict source-complete compressed stream, including genuine RFC1951 raw.
 * @param {Buffer} b
 * @param {"raw"|"gzip"|"zlib"} fmt
 */
function decompress(b,fmt){
  try {
    const opts={maxOutputLength:1048576,info:true};
    const result=fmt==="raw"?zlib.inflateRawSync(b,opts)
      :fmt==="gzip"?zlib.gunzipSync(b,opts)
      :zlib.inflateSync(b,opts);
    if(result.engine.bytesWritten!==b.length)return null;
    return textLike(result.buffer)?result.buffer:null;
  }catch(err){
    assert(err instanceof Error);
    return null;
  }
}
/**
 * Complete byte-zero OpenPGP *literal data* body (tag 11). Packet itself
 * is source-new-format and must exactly occupy the 153-byte stream.
 * Other tags such as gzip-compressed OpenPGP packets are not silently
 * accepted; a first-byte MSB check excludes all OpenPGP packets at zero.
 * @param {Buffer} b
 */
function literalPacket(b){
  if(b.length<8 || (b[0]&0xc0)!==0xc0 || (b[0]&63)!==11) return null;
  let len,p;
  if(b[1]<192){len=b[1];p=2;}
  else if(b[1]<224){
    if(b.length<3)return null;
    len=((b[1]-192)<<8)+b[2]+192;p=3;
  }else if(b[1]===255){
    if(b.length<6)return null;
    len=b.readUInt32BE(2);p=6;
  }else return null;
  if(len!==b.length-p || len<6)return null;
  const data=b.subarray(p);
  if(![98,116,117].includes(data[0]))return null;
  const pos=6+data[1];
  if(pos>data.length)return null;
  const plain=data.subarray(pos);
  return textLike(plain)?plain:null;
}

const quotient=quotientOf(Array.from(original));
assert.deepEqual(quotient.remainder,[0,0,0,0]);
assert.deepEqual(quotient.coefficients.slice(0,20),
 [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]);
assert.deepEqual(encodeProduct(quotient.coefficients),
 Array.from(original).map(mod));
const originalBytes=digitsToBytes(quotient.coefficients);
assert.equal(originalBytes.length,153);
assert.equal(originalBytes.subarray(0,8).toString("hex"),"04598e588f3e70d4");
const originalCandidate = {
  originalByteCount: originalBytes.length,
  originalPrefix: originalBytes.subarray(0,16).toString("hex"),
  printableByteCount: Array.from(originalBytes).filter(
    v=>v>=32&&v<=126||v===9||v===10||v===13).length,
  pgpLiteral:!!literalPacket(originalBytes),
  gzip:!!decompress(originalBytes,"gzip"),
  zlib:!!decompress(originalBytes,"zlib"),
  raw:!!decompress(originalBytes,"raw")
};
assert(!originalCandidate.pgpLiteral);
assert(!originalCandidate.gzip && !originalCandidate.zlib);

// Valid complete native OpenPGP literal packet of EXACT source-byte width.
// The B-F-Z plus 153-byte PGP control is divided by the same original
// H/G polynomial, recovered, then parsed to authentic solved-p57 text.
const known=Buffer.from(
  "LIKE THE INSTAR TUNNELING TO THE SURFACE. WE MUST SHED OUR OWN " +
  "CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.","ascii");
const literal=Buffer.concat([
  Buffer.from([98,0,0,0,0,0]),
  Buffer.from((known.toString("ascii")+" ").repeat(3).slice(0,144),"ascii")
]);
assert.equal(literal.length,150);
const openpgp=Buffer.concat([
  Buffer.from([0xcb,192,0]),literal
]);
assert.equal(openpgp.length,153);
// The new-format two-byte length 150 is invalid (must be >=192);
// make a 153-byte complete packet using the old-format tag 11,
const packet=Buffer.concat([Buffer.from([0xac,151]),Buffer.from([98,0,0,0,0,0]),
  Buffer.from((known.toString("ascii")+" ").repeat(3).slice(0,145),"ascii")]);
assert.equal(packet.length,153);
const plantedDigits=bytesToDigits(packet);
const plantedCoefficients=encodeProduct(plantedDigits);
const recovered=quotientOf(plantedCoefficients);
assert.deepEqual(recovered.remainder,[0,0,0,0]);
assert.deepEqual(recovered.coefficients,plantedDigits);
assert.deepEqual(digitsToBytes(recovered.coefficients),packet);
// Explicit exact old-format one-octet definite-length literal packet.
assert.equal(packet[0],0xac);
assert.equal(packet[1],151);
const extracted=packet.subarray(8);
assert(textLike(extracted));
assert(extracted.subarray(0,known.length).equals(known));
assert.equal(originalCandidate.raw,false);

console.log(JSON.stringify({
 sourceTableSHA256:sha(original),
 divisorLowToHigh:divisor.slice().reverse(),
 originalQuotientLength:252,
 originalQuotientRemainder:quotient.remainder,
 originalCandidate,
 positiveNativePgpLiteralRecovered:extracted.length,
 positiveOriginalTextPrefix:extracted.subarray(0,known.length).toString("ascii"),
 unknownPlaintextRecovered:false
},null,2));
